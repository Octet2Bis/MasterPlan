# stop_daemon.ps1 - Arret du demon Telegram
$ScriptDir = $PSScriptRoot
$BaseDir = Resolve-Path "$ScriptDir\.."
$WorkspaceDir = "$BaseDir\Workspace"
$PidFile = "$WorkspaceDir\telegram_daemon.pid"

if (-not (Test-Path $PidFile)) {
    Write-Host "Aucun demon Telegram actif detecte (aucun fichier PID)." -ForegroundColor Yellow
    exit 0
}

$DaemonPid = Get-Content $PidFile -ErrorAction SilentlyContinue
if ($DaemonPid) {
    $Proc = Get-Process -Id $DaemonPid -ErrorAction SilentlyContinue
    if ($Proc) {
        Stop-Process -Id $DaemonPid -Force -ErrorAction SilentlyContinue
        Write-Host "Demon Telegram arrete avec succes (PID: $DaemonPid)." -ForegroundColor Green
    } else {
        Write-Host "Le processus (PID: $DaemonPid) n'etait plus en cours d'execution." -ForegroundColor DarkGray
    }
}

Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
