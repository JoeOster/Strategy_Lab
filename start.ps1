[CmdletBinding()]
param (
    [switch]$rm,
    [switch]$skipChecks
)
$OutputEncoding = [System.Text.Encoding]::UTF8
# --- Define Log Paths and Clean Previous Log ---
$logDir = "$PSScriptRoot\log"
$termLogFile = "$logDir\term.log"
$serverStdoutFile = "$logDir\server_stdout.log"
$serverStderrFile = "$logDir\server_stderr.log"

# Create log directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

# --- UPDATED: Clear ALL previous logs ---
if (Test-Path $termLogFile) {
    Remove-Item $termLogFile -ErrorAction SilentlyContinue
}
if (Test-Path $serverStdoutFile) {
    Remove-Item $serverStdoutFile -ErrorAction SilentlyContinue
}
if (Test-Path $serverStderrFile) {
    Remove-Item $serverStderrFile -ErrorAction SilentlyContinue
}
# --- END UPDATED ---

# Redirect all subsequent output to term.log
function Write-Log {
    param([string]$Message)
    Write-Host $Message
    $Message | Out-File -FilePath $termLogFile -Append
}

# --- Define Log Paths and Clean Previous Log ---
$filteredLogFile = "$logDir\frontend-session.log"

if (Test-Path $filteredLogFile) {
    Write-Log "Removing previous filtered log: $filteredLogFile"
    # SilentlyContinue in case the file is locked or permissions are bad
    Remove-Item $filteredLogFile -ErrorAction SilentlyContinue
}# --- End New Section ---

if ($rm) {
    $dbFile = "dev-Stratlab.db"
    Write-Log "Checking for database file to remove: $dbFile"
    if (Test-Path $dbFile) {
        try {
            Remove-Item $dbFile -ErrorAction Stop
            Write-Log "Removed database file: $dbFile"
        } catch {
            Write-Log "Could not remove database file: $dbFile. It might be in use by another process. Error: $_"
        }
    } else {
        Write-Log "Database file not found, no need to remove: $dbFile"
    }
}

$dbFile = "dev-Stratlab.db"
if (Test-Path $dbFile) {
    Write-Log "Database file exists: $dbFile"
} else {
    Write-Log "Database file does NOT exist: $dbFile. It will be created and migrated on server startup."
}

if (-not (Test-Path "node_modules")) {
    Write-Log "Node modules not found. Running 'npm install'..."
    npm install *>&1 | Tee-Object -FilePath $termLogFile -Append # Use Tee
}

# --- UPDATED QUALITY CHECKS (Visible Output + Fail Check) ---
if (-not $skipChecks) {
    Clear-Host
    Write-Log "Running Biome to format and lint all files..."
    # Use Tee-Object to see output in real-time AND log it
    npm run fix *>&1 | Tee-Object -FilePath $termLogFile -Append
    Write-Log "Checking for any remaining Biome errors..."
    
    # Run the check and also tee the output
    npm run check *>&1 | Tee-Object -FilePath $termLogFile -Append
    
    # Check the exit code of the last command
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
        Write-Host "!!! Biome check FAILED. Please fix the errors above. !!!" -ForegroundColor Red
        Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
        Write-Log "Biome check FAILED. Stopping script."
        Read-Host -Prompt "Press Enter to exit"
        return # Exit the script
    }
    
    Write-Log "Biome checks passed. Continuing..."
    Start-Sleep -Seconds 2 # Give a moment to read the "passed" message
    Clear-Host
} else {
    Clear-Host
}
# --- END UPDATED BLOCK ---

# --- UPDATED: Start server with 'npm run dev' (which uses --watch) ---
Write-Log "Starting 'npm run dev' as a background process..."
$serverProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru -RedirectStandardOutput $serverStdoutFile -RedirectStandardError $serverStderrFile
$serverPid = $serverProcess.Id
# --- END UPDATED ---

Write-Log "Server job 'DevServer' started."

# --- Wait for Server to be Online ---
Write-Log "Waiting for the dev server at http://localhost:8080..."
$serverReady = $false
$maxAttempts = 20 # Max wait of 30 seconds (20 * 1.5s)
$attempt = 0

while (-not $serverReady -and $attempt -lt $maxAttempts) {
    $attempt++
    try {
        Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -ErrorAction Stop | Out-Null
        $serverReady = $true
        Write-Log "Server is online!"
    } catch {
        Write-Log "($attempt/$maxAttempts) Server not ready, retrying in 1.5s..."
        Start-Sleep -Milliseconds 1500
    }
}

if (-not $serverReady) {
    Write-Log "Server failed to start after $maxAttempts attempts. Stopping script."
    Stop-Process -Id $serverPid -Force
    return # Exit the script
}

# --- Browser Launch and Log Setup (NEW FIX for 2-TABS) ---
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$edgeProfileDir = "$env:TEMP\edge_profile"
$edgeLogFile = "$edgeProfileDir\chrome_debug.log"

Write-Log "Wiping old Edge temporary profile to ensure a clean session..."
Remove-Item -Path $edgeProfileDir -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500 # Give OS a moment to release file handles

if (Test-Path $edgeLogFile) {
    Write-Log "Removing old browser log file..."
    Remove-Item $edgeLogFile
}

$edgeArgs = @(
    "--remote-debugging-port=9222",
    "--user-data-dir=`"$edgeProfileDir`"",
    "--enable-logging",
    "--v=1",
    "--disable-features=StartupBoost" # Prevents "zombie" processes
    "--no-first-run",                  # <-- ADDED: Skips the setup screen
    "--no-default-browser-check"       # <-- ADDED: Skips the "make default browser" popup
    "--disable-account-consistency"    # <-- ADDED: Stops auto-sign-in popups
    "--disable-sync",                  # <-- ADDED: Disables all sync functionality
    "--disable-features=AutomaticSignIn" # <-- ADDED: Disables "sign in with this account?"
)


Write-Log "Launching Edge. The script will wait for you to close the browser."
Write-Log "Browser console logs will be saved to: $edgeLogFile"

# Use -Wait to pause the script until the Edge process (and all its children) exit.
$fullEdgeArgs = $edgeArgs + "http://localhost:8080"
Start-Process -FilePath $edgePath -ArgumentList $fullEdgeArgs -Wait


# --- Automatic Cleanup (Runs AFTER Edge is closed) ---
Write-Log ""
Write-Log "Browser closed. Starting automated cleanup..."

# 1. Filter the log
# Create the log directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    Write-Log "Creating log directory: $logDir"
    New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}
# Note: $filteredLogFile variable is now set at the top of the script

Write-Log "Filtering browser logs..."
if (Test-Path $edgeLogFile) {
    try {
        # Find all lines containing JavaScript console output or browser errors
        Get-Content $edgeLogFile | Where-Object { ($_ -match ":CONSOLE" -or $_ -match ":ERROR:" -or $_ -match ":FATAL:") -and ($_ -notmatch "chrome-extension://|devtools://") } | Set-Content $filteredLogFile -ErrorAction Stop
        Write-Log "Success! Filtered log saved to: $filteredLogFile"
    } catch {
        Write-Log "Failed to filter log file: $_"
    }
} else {
    Write-Log "Could not find log file to filter: $edgeLogFile"
}


    # --- END UPDATED ---

Write-Log "Server job stopped."

# Append server logs to term.log
if (Test-Path $serverStdoutFile) {
    Get-Content $serverStdoutFile | Out-File -FilePath $termLogFile -Append
    # Remove-Item $serverStdoutFile # Keep for inspection
}
if (Test-Path $serverStderrFile) {
    Get-Content $serverStderrFile | Out-File -FilePath $termLogFile -Append
    # Remove-Item $serverStderrFile # Keep for inspection
}

Write-Log ""
Write-Log "Cleanup complete. Goodbye!"