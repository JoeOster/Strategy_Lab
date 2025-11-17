[CmdletBinding()]
param (
    [switch]$rm,
    [switch]$skipChecks
)

function Write-Log($Message, $Level = "INFO") {
    if ([string]::IsNullOrWhiteSpace($Message)) { return }
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formattedMessage = "[$timestamp] [$Level] $Message"
    Write-Host $formattedMessage
    $formattedMessage | Out-File -FilePath $script:termLogFile -Append
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
    npm run fix *>&1 | ForEach-Object { Write-Log $_ }

    Write-Log "Checking for any remaining Biome errors..."
    npm run check *>&1 | ForEach-Object { Write-Log $_ }

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
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pidsToStop = $connections.OwningProcess | Select-Object -Unique | Where-Object { $_ -gt 4 }
        if ($pidsToStop) {
            Write-Log "Attempting to stop processes on port ${port}: $($pidsToStop -join ', ')"
            foreach ($pid in $pidsToStop) {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Log "Successfully stopped process with PID $pid."
                } catch {
                    Write-Log "Could not stop process with PID $pid. It may have already closed." -Level "WARN"
                }
            }
        }
    }
}

function Start-ServerJob($port, $dbFile) {
    Write-Log "Starting server with 'npm run dev' on port $port and DB file $dbFile..."
    $env:PORT = $port
    $env:DB_FILE = $dbFile
    $serverJob = Start-Job -ScriptBlock {
        Set-Location -Path $using:PSScriptRoot; npm run dev
    } -Name "DevServer"
    Write-Log "Server job 'DevServer' started."
    return $serverJob
}

function Wait-ForServer($serverJob, $port) {
    Write-Log "Waiting for the dev server at http://localhost:$port..."
    $maxAttempts = 20
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        if ($serverJob.HasMoreData) { Receive-Job $serverJob | ForEach-Object { Write-Log $_ } }
        $attempt++
        try {
            Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -ErrorAction Stop | Out-Null
            Write-Log "Server is online!"
            if ($serverJob.HasMoreData) { Receive-Job $serverJob | ForEach-Object { Write-Log $_ } }
            return $true
        } catch {
            Write-Log "($attempt/$maxAttempts) Server not ready, retrying in 1.5s..."
            Start-Sleep -Milliseconds 1500
        }
    }

    Write-Log "Server failed to start after $maxAttempts attempts. Please check the logs." -Level "ERROR"
    if ($serverJob.HasMoreData) { Receive-Job $serverJob | ForEach-Object { Write-Log $_ } }
    return $false
}

function Enter-InteractiveWait($serverJob) {
    Write-Host "`nServer is running. Press any key in this window to shut down." -ForegroundColor Green
    while (-not [Console]::KeyAvailable) {
        if ($serverJob.HasMoreData) {
            $output = Receive-Job $serverJob | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
            if ($output) {
            Write-Host "`n--- Server Log Update ---" -ForegroundColor DarkGray
                $output | ForEach-Object { Write-Log $_ }
            Write-Host "-----------------------" -ForegroundColor DarkGray
            Write-Host "`nServer is running. Press any key in this window to shut down." -ForegroundColor Green
            }
        }
        Start-Sleep -Milliseconds 500
    }
    [Console]::ReadKey($true) | Out-Null # Clear the key press from the buffer
}

function Stop-ServerJob($serverJob) {
    Write-Log "Shutting down server..."
    Stop-Job $serverJob
    if ($serverJob.HasMoreData) {
        Write-Log "Final server output:"
        Receive-Job $serverJob | ForEach-Object { Write-Log $_ }
    }
    Remove-Job $serverJob -Force
    Write-Log "Server job stopped and removed."
}

function Main {
    # 1. Setup
    Initialize-Environment
    $port = 8080
    $dbDir = "$PSScriptRoot\db"
    $dbFile = "$dbDir\strategy_lab.db"
    Write-Log "Script started with parameters: -rm:$rm -skipChecks:$skipChecks"

    # 2. Prerequisites
    Prepare-Database -dbDir $dbDir -dbFile $dbFile -remove:$rm
    Ensure-Dependencies
    if (-not $skipChecks) {
        if (-not (Run-QualityChecks)) { return }
    }

    # 3. Server Startup
    Stop-ProcessesOnPort -port $port
    $serverJob = Start-ServerJob -port $port -dbFile $dbFile
    Write-Host "-------------------- SERVER LOGS (START) --------------------" -ForegroundColor Cyan
    if (-not (Wait-ForServer -serverJob $serverJob -port $port)) {
        Stop-ServerJob -serverJob $serverJob
        return
    }
    Write-Host "-------------------- SERVER LOGS (END) ----------------------" -ForegroundColor Cyan

    # 4. Interactive Session
    Start-Process "http://localhost:${port}"
    Enter-InteractiveWait -serverJob $serverJob

    # 5. Cleanup
    Write-Log "User requested shutdown. Starting automated cleanup..."
    Stop-ServerJob -serverJob $serverJob
    Write-Log "Cleanup complete. Goodbye!"
}

# Execute the main function
Main
