# stop_notebook.ps1 — Arrête le conteneur Open Notebook et libère 100% de la RAM
param (
    [switch]$DryRun
)

$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($DryRun) {
    Write-Host "[DRY-RUN] Simulation : Arrêt du conteneur Open Notebook et libération des ressources..." -ForegroundColor Cyan
    exit 0
}

Write-Host "🛑 Arrêt d'Open Notebook..." -ForegroundColor Yellow
docker-compose -f "$AppDir\docker-compose.yml" down

Write-Host "✅ Conteneur arrêté. 0 Mo de RAM consommée au repos." -ForegroundColor Green
