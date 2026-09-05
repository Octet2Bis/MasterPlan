# MASTER PLAN — START LOCAL COCKPIT
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🌌 LANCEMENT DU MASTER PLAN LOCAL COCKPIT (PORT 4000)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
node "$ScriptPath/server.js"
