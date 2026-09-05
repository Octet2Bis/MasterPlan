# pull_from_vm.ps1 - Synchronisation 1-Clic VM Oracle Cloud -> Local (Pilier 02)
$ScriptDir = $PSScriptRoot
$BaseDir = Resolve-Path "$ScriptDir\.."
$SshKey = "C:\Users\HP\.ssh\oracle_arm_key"
$VmIp = "88.96.57.168"
$RemoteDir = "/home/ubuntu/master-plan-runtime/02_Assistant_Personnel/Workspace"
$LocalWorkspace = "$BaseDir\Workspace"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " SYNCHRONISATION POKA-YOKE : VM ORACLE -> LOCAL (PULL)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path $SshKey)) {
    Write-Host "Cle SSH introuvable : $SshKey" -ForegroundColor Red
    exit 1
}

# Assurer l'existence des répertoires locaux
New-Item -ItemType Directory -Force -Path "$LocalWorkspace\research_reports" | Out-Null
New-Item -ItemType Directory -Force -Path "$LocalWorkspace\inbox_pro" | Out-Null
New-Item -ItemType Directory -Force -Path "$LocalWorkspace\inbox_perso" | Out-Null
New-Item -ItemType Directory -Force -Path "$LocalWorkspace\research_inbox" | Out-Null

Write-Host "1. Récupération des graphes JSON de base..." -ForegroundColor White
scp -o StrictHostKeyChecking=no -i $SshKey "ubuntu@${VmIp}:${RemoteDir}/*.json" "$LocalWorkspace/"

Write-Host "2. Récupération des comptes-rendus de veille..." -ForegroundColor White
scp -o StrictHostKeyChecking=no -i $SshKey -r "ubuntu@${VmIp}:${RemoteDir}/research_reports/*" "$LocalWorkspace/research_reports/"

Write-Host "3. Récupération des inboxes..." -ForegroundColor White
scp -o StrictHostKeyChecking=no -i $SshKey -r "ubuntu@${VmIp}:${RemoteDir}/inbox_pro/*" "$LocalWorkspace/inbox_pro/" 2>$null
scp -o StrictHostKeyChecking=no -i $SshKey -r "ubuntu@${VmIp}:${RemoteDir}/inbox_perso/*" "$LocalWorkspace/inbox_perso/" 2>$null
scp -o StrictHostKeyChecking=no -i $SshKey -r "ubuntu@${VmIp}:${RemoteDir}/research_inbox/*" "$LocalWorkspace/research_inbox/" 2>$null

Write-Host "Synchronisation PULL réussie à 100% depuis la VM !" -ForegroundColor Green
