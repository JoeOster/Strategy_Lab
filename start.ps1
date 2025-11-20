[CmdletBinding()]
param (
    [switch]$rm,
    [switch]$skipChecks,
    [switch]$EnableLogging
)

function Write-Log($Message, $Level = "INFO") {
    if ([string]::IsNullOrWhiteSpace($Message)) { return }
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formattedMessage = "[$timestamp] [$Level] $Message"
    Write-Host $formattedMessage
    # Only attempt to write to file if $script:termLogFile is set
    if ($script:termLogFile) {
        $formattedMessage | Out-File -FilePath $script:termLogFile -Append
    }
}

function Initialize-Environment {
    Write-Log "Initializing environment..."
    $OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

    $script:logDir = "$PSScriptRoot\log"
    $script:termLogFile = "$logDir\term.log"

    if (-not (Test-Path $logDir)) {
        New-Item -Path $logDir -ItemType Directory -Force | Out-Null
    }
    if (Test-Path $script:termLogFile) {
        Remove-Item $script:termLogFile -ErrorAction SilentlyContinue
    }
}

function Prepare-Database($dbDir, $dbFile, [switch]$remove) {
    Write-Log "Checking database directory: $dbDir"
    if (-not (Test-Path $dbDir)) {
        Write-Log "Database directory not found. Creating..."
        New-Item -Path $dbDir -ItemType Directory -Force | Out-Null
    }

    if ($remove) {
        Write-Log "Attempting to remove database file: $dbFile"
        if (Test-Path $dbFile) {
            try {
                Remove-Item $dbFile -ErrorAction Stop
                Write-Log "Removed database file successfully."
            } catch {
                Write-Log "Could not remove database file. It may be in use. Error: $_" -Level "WARN"
            }
        } else {
            Write-Log "Database file not found, no removal needed."
        }
    }
}

function Ensure-Dependencies {
    if (-not (Test-Path "node_modules")) {
        Write-Log "Node modules not found. Running 'npm ci' for a clean install..."
        npm ci *>&1 | ForEach-Object { Write-Log $_ }
    }
}

function Run-QualityChecks {
    Clear-Host
    Write-Log "Running Biome to format and lint all files..."
    npm run fix:biome *>&1 | ForEach-Object { Write-Log $_ }

    Write-Log "Checking for any remaining Biome errors..."
    npm run check:biome *>&1 | ForEach-Object { Write-Log $_ }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
        Write-Host "!!! Biome check FAILED. Please fix the errors above. !!!" -ForegroundColor Red
        Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`n" -ForegroundColor Red
        Write-Log "Biome check FAILED. Stopping script." -Level "ERROR"
        Read-Host -Prompt "Press Enter to exit"
        return $false # Indicate failure
    }

    Write-Log "Biome checks passed."
    Start-Sleep -Seconds 1
    Clear-Host
    return $true # Indicate success
}

function Stop-ProcessesOnPort($port) {
    Write-Log "Checking for and closing any existing listeners on port $port..."
    $maxRetries = 5
    $retryDelaySeconds = 1

    for ($i = 0; $i -lt $maxRetries; $i++) {
        $pidsToStop = @()
        $netstatOutput = netstat -ano | Select-String ":$port"

        foreach ($line in $netstatOutput) {
            # Extract PID from the last column of netstat output
            if ($line -match '\s+(\d+)$') {
                $currentPid = $matches[1] # Renamed $pid to $currentPid
                # Exclude PID 0 (System Idle Process) and other low PIDs that are usually system processes
                if ($currentPid -gt 4) {
                    $pidsToStop += $currentPid
                }
            }
        }

        $pidsToStop = $pidsToStop | Select-Object -Unique

        if ($pidsToStop.Count -eq 0) {
            Write-Log "No active processes found listening on port $port."
            return
        }

        Write-Log "Attempting to stop processes on port ${port}: $($pidsToStop -join ', ')"
        foreach ($processIdToKill in $pidsToStop) { # Renamed $pid to $processIdToKill
            try {
                # Use taskkill for more robust termination
                taskkill /PID $processIdToKill /F | Out-Null
                Write-Log "Successfully sent termination signal to process with PID $processIdToKill."
            } catch {
                Write-Log "Could not send termination signal to process with PID $processIdToKill. It may have already closed. Error: $_" -Level "WARN"
            }
        }

        Start-Sleep -Seconds $retryDelaySeconds

        # Re-check if the port is free after attempting to kill processes
        $netstatCheck = netstat -ano | Select-String ":$port"
        if ($netstatCheck.Count -eq 0) {
            Write-Log "Successfully verified that all processes on port $port have been stopped."
            return # Exit the function since the job is done
        }
        Write-Log "Processes still found on port $port. Retrying..." -Level "WARN"
    }
    Write-Log "Failed to stop all processes on port $port after $maxAttempts attempts. Some processes may still be running." -Level "ERROR"
}

function Start-ServerProcess($port, $dbFile) {
    Write-Log "Starting server with 'npm run start' on port $port and DB file $dbFile..."
    $env:PORT = $port
    $env:DB_FILE = $dbFile
    $process = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "start" -WorkingDirectory $PSScriptRoot -PassThru -RedirectStandardOutput "$PSScriptRoot\log\server_stdout.log" -RedirectStandardError "$PSScriptRoot\log\server_stderr.log"
    Write-Log "Server process started with PID $($process.Id)."
    return $process.Id # Return PID
}

function Wait-ForServer($serverPid, $port) {
    # FIX: Explicitly use 127.0.0.1 to avoid IPv6/IPv4 resolution issues on some Windows machines
    $url = "http://127.0.0.1:$port" 
    Write-Log "Waiting for the dev server at $url..."
    $maxAttempts = 20
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $attempt++
        try {
            # FIX: Added checking if the process is actually still running
            $process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
            if (-not $process) {
                Write-Log "The server process (PID $serverPid) has stopped unexpectedly." -Level "ERROR"
                return $false
            }

            Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop | Out-Null
            Write-Log "Server is online!"
            return $true
        } catch {
            # FIX: Show the specific error so we know WHY it's failing (e.g. 404, 500, or Connection Refused)
            $errorMsg = $_.Exception.Message
            Write-Log "($attempt/$maxAttempts) Server not ready. Error: $errorMsg"
            Start-Sleep -Milliseconds 1500
        }
    }

    Write-Log "Server failed to start after $maxAttempts attempts. Please check log\server_stderr.log for details." -Level "ERROR"
    return $false
}

function Main {
    # 1. Setup
    Initialize-Environment # Moved to top
    $port = 8080
    $dbDir = "$PSScriptRoot\db"
    $dbFile = "$dbDir\strategy_lab.db"
    Write-Log "Script started with parameters: -rm:$rm -skipChecks:$skipChecks -EnableLogging:$EnableLogging"

    # Set NODE_ENV based on EnableLogging switch
    if ($EnableLogging) {
        $env:NODE_ENV = "development"
        Write-Log "NODE_ENV set to 'development'. Logging enabled."
    } else {
        $env:NODE_ENV = "production"
        Write-Log "NODE_ENV set to 'production'. Logging disabled."
    }

    # 2. Prerequisites
    Stop-ProcessesOnPort -port $port # Moved up
    Prepare-Database -dbDir $dbDir -dbFile $dbFile -remove:$rm
    Ensure-Dependencies
    if (-not $skipChecks) {
        if (-not (Run-QualityChecks)) { return }
    }

    # 3. Server Startup
    $serverPid = Start-ServerProcess -port $port -dbFile $dbFile
    Write-Host "-------------------- SERVER LOGS (START) --------------------" -ForegroundColor Cyan
    if (Wait-ForServer -serverPid $serverPid -port $port) {
        Write-Host "-------------------- SERVER LOGS (END) ----------------------" -ForegroundColor Cyan

        # 4. Interactive Session
        Start-Process "http://localhost:${port}"

        # Show logs
        Write-Host "--- Tailing server logs (Press Ctrl+C to stop viewing logs and shut down server) ---" -ForegroundColor Yellow
        try {
            Get-Content -Path "$PSScriptRoot\log\server_stdout.log", "$PSScriptRoot\log\server_stderr.log" -Wait
        } catch [System.Management.Automation.PipelineStoppedException] {
            # This exception is expected when the user presses Ctrl+C
        }

        # 5. Cleanup
        Write-Log "User requested shutdown. Starting automated cleanup..."
        Stop-ProcessesOnPort -port $port
        Write-Log "Cleanup complete. Goodbye!"
    } else {
        Write-Host "-------------------- SERVER LOGS (END) ----------------------" -ForegroundColor Cyan
        # If server fails to start, attempt to stop the process
        Stop-ProcessesOnPort -port $port
        Write-Log "Server failed to start. Please check the logs in the 'log' directory." -Level "ERROR"
        
        # FIX: Auto-display the stderr log on failure so you see the crash immediately
        if (Test-Path "$PSScriptRoot\log\server_stderr.log") {
            Write-Host "`n--- ERROR LOG CONTENT ---" -ForegroundColor Red
            Get-Content "$PSScriptRoot\log\server_stderr.log" -Tail 20
            Write-Host "-------------------------" -ForegroundColor Red
        }

        Read-Host -Prompt "Press Enter to exit."
    }
}

# Execute the main function
Main