[CmdletBinding()]
param (
    [switch]$rm,
    [switch]$skipChecks
)
# --- FIX: Set encoding for BOTH external commands AND the console itself ---
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- NEW: Centralized Configuration ---
$port = 8080
$dbDir = "$PSScriptRoot\db"
$dbFile = "$dbDir\strategy_lab.db"
# --- END NEW ---

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

# --- IMPROVEMENT: Auto-create 'db' directory and check correct DB file ---
Write-Log "Checking for database directory: $dbDir"
if (-not (Test-Path $dbDir)) {
    Write-Log "Database directory not found. Creating..."
    New-Item -Path $dbDir -ItemType Directory -Force | Out-Null
}

if ($rm) {
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

if (Test-Path $dbFile) {
    Write-Log "Database file exists: $dbFile"
} else {
    Write-Log "Database file does NOT exist: $dbFile. It will be created and migrated on server startup."
}
# --- END IMPROVEMENT ---

# --- IMPROVEMENT: Use npm ci for faster, deterministic install ---
if (-not (Test-Path "node_modules")) {
    Write-Log "Node modules not found. Running 'npm ci'..."
    npm ci *>&1 | Tee-Object -FilePath $termLogFile -Append # Use Tee
}
# --- END IMPROVEMENT ---

# --- UPDATED QUALITY CHEKS (Visible Output + Fail Check) ---
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

# --- IMPROVEMENT: Use cross-env to pass the $port variable to the server ---
Write-Log "Checking for and closing any existing listeners on port $port..."
(Get-NetTCPConnection -LocalPort $port).OwningProcess | ForEach-Object {
    try {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Log "Closed process $_ listening on port $port."
    } catch {
        Write-Log "Could not close process $_ listening on port $port. Error: $_"
    }
}
Write-Log "Starting server with 'npm run dev' on port $port..."
# We use npx to run cross-env, which sets the PORT env variable
# Then we run the 'dev' script from package.json
$serverProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "cross-env", "PORT=$port", "npm", "run", "dev" -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru -RedirectStandardOutput $serverStdoutFile -RedirectStandardError $serverStderrFile
$serverPid = $serverProcess.Id
# --- END IMPROVEMENT ---

Write-Log "Server job 'DevServer' started."

# --- Wait for Server to be Online (Uses $port variable) ---
Write-Log "Waiting for the dev server at http://localhost:$port..."
$serverReady = $false
$maxAttempts = 20 # Max wait of 30 seconds (20 * 1.5s)
$attempt = 0

while (-not $serverReady -and $attempt -lt $maxAttempts) {
    $attempt++
    try {
        Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -ErrorAction Stop | Out-Null
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

# --- IMPROVEMENT: Launch in default browser ---
Write-Log "Launching default browser. The script will wait for you to close the browser."
Start-Process "http://localhost:$port"
Write-Host "Press any key to close the browser and continue..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
# --- END IMPROVEMENT ---


# --- Automatic Cleanup (Runs AFTER Browser is closed) ---
Write-Log ""
Write-Log "Browser closed. Starting automated cleanup..."

# --- IMPROVEMENT: Removed obsolete browser log filtering section ---

# --- FIX: Explicitly stop the server process ---
Write-Log "Stopping 'npm run dev' background process (PID: $serverPid)..."
Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
# --- END FIX ---

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