# start_notebook.ps1 — Démarre Open Notebook en conteneur Docker isolé
param (
    [switch]$DryRun
)

$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($DryRun) {
    Write-Host "[DRY-RUN] Simulation : Démarrage du conteneur Open Notebook sur http://localhost:8080..." -ForegroundColor Cyan
    exit 0
}

Write-Host "🚀 Démarrage d'Open Notebook (Studio de Podcasts & Recherche)..." -ForegroundColor Green
docker-compose -f "$AppDir\docker-compose.yml" up -d

Write-Host "✅ Open Notebook est actif sur : http://localhost:8080" -ForegroundColor Green
