# start_daemon.ps1 - Demarrage du demon Telegram
$ScriptDir = $PSScriptRoot
$BaseDir = Resolve-Path "$ScriptDir\.."
$WorkspaceDir = "$BaseDir\Workspace"
$PidFile = "$WorkspaceDir\telegram_daemon.pid"
$LogFile = "$WorkspaceDir\telegram_service.log"
$ErrLogFile = "$WorkspaceDir\telegram_service_err.log"
$ServiceScript = "$ScriptDir\telegram_bots_service.js"

if (-not (Test-Path $WorkspaceDir)) {
    New-Item -ItemType Directory -Path $WorkspaceDir -Force | Out-Null
}

if (Test-Path $PidFile) {
    $ExistingPid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($ExistingPid) {
        $Proc = Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue
        if ($Proc) {
            Write-Host "Le demon Telegram tourne deja (PID: $ExistingPid)." -ForegroundColor Yellow
            Write-Host "Utilisez .\status_daemon.ps1 ou .\stop_daemon.ps1." -ForegroundColor Cyan
            exit 0
        }
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Demarrage du service Telegram Tri-Canal (PRO, PERSO, RESEARCH)..." -ForegroundColor Cyan
$Process = Start-Process -FilePath "node" `
    -ArgumentList "`"$ServiceScript`"" `
    -WorkingDirectory $ScriptDir `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError $ErrLogFile `
    -PassThru `
    -WindowStyle Hidden

if ($Process -and -not $Process.HasExited) {
    Set-Content -Path $PidFile -Value $Process.Id -Force
    Start-Sleep -Milliseconds 800
    Write-Host "Demon Telegram actif en arriere-plan (PID: $($Process.Id))." -ForegroundColor Green
    Write-Host "Logs : $LogFile" -ForegroundColor DarkGray
} else {
    Write-Host "Echec du demarrage du demon Telegram." -ForegroundColor Red
    if (Test-Path $LogFile) { Get-Content $LogFile -Tail 10 }
    exit 1
}
