param(
    [string]$TargetDir = "$env:USERPROFILE\Downloads",
    [switch]$DryRun
)

$categories = @{
    "01_Executables_et_Installateurs" = @(".exe", ".msi", ".iso", ".img", ".dmg")
    "02_Documents_et_Admin"           = @(".pdf", ".msg", ".eml", ".docx", ".doc", ".odt")
    "03_Data_CSV_Excel"               = @(".csv", ".xlsx", ".xls", ".ods")
    "04_Images_et_Videos"             = @(".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif", ".mp4", ".mov", ".mkv")
    "05_Archives_et_Projets"          = @(".zip", ".tar", ".gz", ".7z", ".rar", ".pkpass", ".json", ".ics", ".psd", ".af", ".site", ".txt")
    "06_Presentations"                = @(".pptx", ".ppt", ".key")
}

if (!(Test-Path $TargetDir)) {
    Write-Host "[!] Le dossier cible $TargetDir n'existe pas." -ForegroundColor Red
    exit
}

if ($DryRun) {
    Write-Host "=== MODE SIMULATION (Safe Mode : aucun fichier ne sera deplacé) ===" -ForegroundColor Yellow
}

$files = Get-ChildItem -Path $TargetDir -File
$count = 0
$stats = @{}

foreach ($file in $files) {
    if ($file.Name -eq "desktop.ini" -or $file.Name.StartsWith(".")) { continue }
    $ext = $file.Extension.ToLower()
    $targetCat = "07_Autres"
    
    foreach ($cat in $categories.Keys) {
        if ($categories[$cat] -contains $ext) {
            $targetCat = $cat
            break
        }
    }
    
    $destFolder = Join-Path $TargetDir $targetCat
    $destPath = Join-Path $destFolder $file.Name
    
    if (Test-Path $destPath) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $destPath = Join-Path $destFolder "$baseName`_copy$ext"
    }
    
    if ($DryRun) {
        Write-Host "  [DRY-RUN] $($file.Name) -> $targetCat/$([System.IO.Path]::GetFileName($destPath))" -ForegroundColor Cyan
    } else {
        if (!(Test-Path $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder | Out-Null
        }
        Move-Item -Path $file.FullName -Destination $destPath -Force
    }
    
    $count++
    if (-not $stats.ContainsKey($targetCat)) { $stats[$targetCat] = 0 }
    $stats[$targetCat]++
}

Write-Host "`n[+] Rangement terminé : $count fichier(s) traité(s)." -ForegroundColor Green
$stats.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host "  - $($_.Name) : $($_.Value) fichier(s)"
}
