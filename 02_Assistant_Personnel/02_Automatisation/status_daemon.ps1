# status_daemon.ps1 - Statut du service Telegram
$ScriptDir = $PSScriptRoot
$BaseDir = Resolve-Path "$ScriptDir\.."
$WorkspaceDir = "$BaseDir\Workspace"
$SecretsDir = "$BaseDir\.secrets"
$PidFile = "$WorkspaceDir\telegram_daemon.pid"
$StateFile = "$SecretsDir\session_state.json"
$DbPro = "$WorkspaceDir\pro_market_graph.json"
$DbPerso = "$WorkspaceDir\perso_journal_graph.json"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " STATUT OPERATIONNEL DU SERVICE TELEGRAM (PILIER 02)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$IsRunning = $false
if (Test-Path $PidFile) {
    $DaemonPid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($DaemonPid) {
        $Proc = Get-Process -Id $DaemonPid -ErrorAction SilentlyContinue
        if ($Proc) {
            $IsRunning = $true
            $MemMb = [math]::Round($Proc.WorkingSet64 / 1MB, 2)
            Write-Host "Processus Demon : EN LIGNE (PID: $DaemonPid, RAM: $MemMb Mo)" -ForegroundColor Green
        }
    }
}
if (-not $IsRunning) {
    Write-Host "Processus Demon : HORS LIGNE" -ForegroundColor Red
}

if (Test-Path $StateFile) {
    try {
        $State = Get-Content $StateFile -Raw | ConvertFrom-Json
        $NowMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        if ($State.unlockedUntil -and $State.unlockedUntil -gt $NowMs) {
            $DiffMin = [math]::Round(($State.unlockedUntil - $NowMs) / 60000)
            $Hours = [math]::Floor($DiffMin / 60)
            $Mins = $DiffMin % 60
            Write-Host "Session 2FA     : DEVERROUILLEE ($Hours h $Mins min restantes)" -ForegroundColor Green
        } else {
            Write-Host "Session 2FA     : VERROUILLEE (Necessite /unlock sur Telegram)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Session 2FA     : Etat illisible" -ForegroundColor Yellow
    }
} else {
    Write-Host "Session 2FA     : VERROUILLEE (Initial)" -ForegroundColor Yellow
}

$CountPro = 0
$CountPerso = 0
if (Test-Path $DbPro) {
    try { $CountPro = (Get-Content $DbPro -Raw | ConvertFrom-Json).observations.Count } catch {}
}
if (Test-Path $DbPerso) {
    try { $CountPerso = (Get-Content $DbPerso -Raw | ConvertFrom-Json).observations.Count } catch {}
}

Write-Host "Base Pro        : $CountPro observations indexees" -ForegroundColor White
Write-Host "Base Perso      : $CountPerso observations indexees" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Cyan
