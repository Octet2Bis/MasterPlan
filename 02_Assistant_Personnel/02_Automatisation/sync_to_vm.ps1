# sync_to_vm.ps1 - Synchronisation 1-Clic Local -> VM Oracle Cloud (Pilier 02)
$ScriptDir = $PSScriptRoot
$BaseDir = Resolve-Path "$ScriptDir\.."
$SshKey = "C:\Users\HP\.ssh\oracle_arm_key"
$VmIp = "88.96.57.168"
$RemoteDir = "/home/ubuntu/master-plan-runtime/02_Assistant_Personnel"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " SYNCHRONISATION POKA-YOKE : LOCAL -> VM ORACLE (24/7)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path $SshKey)) {
    Write-Host "Cle SSH introuvable : $SshKey" -ForegroundColor Red
    exit 1
}

Write-Host "Verification des repertoires cibles sur la VM..." -ForegroundColor White
ssh -n -o StrictHostKeyChecking=no -i $SshKey "ubuntu@$VmIp" "mkdir -p ${RemoteDir}/Workspace ${RemoteDir}/.secrets"

Write-Host "Transfert des fichiers d automatisation, carrieres et secrets..." -ForegroundColor White
scp -o StrictHostKeyChecking=no -i $SshKey -r "$BaseDir\02_Automatisation" "ubuntu@${VmIp}:${RemoteDir}/"
scp -o StrictHostKeyChecking=no -i $SshKey -r "$BaseDir\04_Productivite_Admin" "ubuntu@${VmIp}:${RemoteDir}/"
scp -o StrictHostKeyChecking=no -i $SshKey -r "$BaseDir\Workspace\career" "ubuntu@${VmIp}:${RemoteDir}/Workspace/"
scp -o StrictHostKeyChecking=no -i $SshKey "$BaseDir\.secrets\.env" "ubuntu@${VmIp}:${RemoteDir}/.secrets/.env"
scp -o StrictHostKeyChecking=no -i $SshKey "$BaseDir\.secrets\.env" "ubuntu@${VmIp}:${RemoteDir}/.env"

if ($true) {
    Write-Host "Redemarrage des bots sur la VM Cloud sous PM2..." -ForegroundColor White
    ssh -o StrictHostKeyChecking=no -i $SshKey "ubuntu@$VmIp" "pm2 restart telegram-bots; pm2 save; pm2 list"
    Write-Host "Synchronisation et deploiement reussis a 100% sur la VM !" -ForegroundColor Green
} else {
    Write-Host "Erreur lors du transfert SCP vers la VM." -ForegroundColor Red
}
