# stop-server.ps1
# Stops the Node.js server started by start-server-bg.ps1

$pidFile = Join-Path $PSScriptRoot "server.pid"

if (Test-Path $pidFile) {
    $pid = Get-Content $pidFile
    Write-Host "Attempting to stop Node.js server with PID $pid..."
    try {
        Stop-Process -Id $pid -Force -ErrorAction Stop
        Remove-Item $pidFile
        Write-Host "Node.js server with PID $pid stopped successfully."
    } catch {
        Write-Host "Error stopping process with PID $pid: $($_.Exception.Message)"
        Write-Host "The process might already be stopped or you might not have permissions."
    }
} else {
    Write-Host "No server.pid file found. Is the server running?"
}
