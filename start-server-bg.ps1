# start-server-bg.ps1
# Starts the Node.js server (server.js) in the background.

$scriptPath = Join-Path (Get-Item -Path $PSScriptRoot).Parent.FullName "server.js"
$logPath = Join-Path $PSScriptRoot "server_output.log"

Write-Host "Starting Node.js server in background..."
Write-Host "Server script: $scriptPath"
Write-Host "Output log: $logPath"

# Start-Process -FilePath "node.exe" -ArgumentList "$scriptPath" -NoNewWindow -PassThru | Out-Null
# Using Start-Job for better process management and output capture
$job = Start-Job -ScriptBlock {
    param($serverScript, $outputLog)
    node.exe $serverScript > $outputLog 2>&1
} -ArgumentList $scriptPath, $logPath

Write-Host "Node.js server started in background with Job ID $($job.Id) and PID $($job.ChildProcesses.Id)."
Write-Host "Output is being logged to $logPath"
Write-Host "To stop the server, run 'Stop-Job -Id $($job.Id)' or 'Stop-Process -Id $($job.ChildProcesses.Id)'"
Write-Host "To view output, run 'Get-Content $logPath'"

# Save the PID to a file for easier stopping later
$pidFile = Join-Path $PSScriptRoot "server.pid"
$job.ChildProcesses.Id | Out-File $pidFile

Write-Host "Server PID saved to $pidFile"
