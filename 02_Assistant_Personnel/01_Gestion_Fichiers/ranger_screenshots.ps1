param(
    [string]$TargetDir = "$env:USERPROFILE\Pictures\Screenshots",
    [switch]$DryRun
)

if (!(Test-Path $TargetDir)) {
    Write-Host "[!] Le dossier $TargetDir n'existe pas." -ForegroundColor Red
    exit
}

if ($DryRun) {
    Write-Host "=== MODE SIMULATION (Safe Mode : aucune capture ne sera déplacée) ===" -ForegroundColor Yellow
}

$files = Get-ChildItem -Path $TargetDir -File
$count = 0
$stats = @{}

foreach ($file in $files) {
    if ($file.Name -eq "desktop.ini" -or $file.Name.StartsWith(".")) { continue }
    
    $monthFolder = $file.LastWriteTime.ToString("yyyy-MM")
    $destFolder = Join-Path $TargetDir $monthFolder
    $destPath = Join-Path $destFolder $file.Name
    
    if (Test-Path $destPath) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $ext = $file.Extension
        $counter = 1
        do {
            $destPath = Join-Path $destFolder "$baseName`_$counter$ext"
            $counter++
        } while (Test-Path $destPath)
    }
    
    if ($DryRun) {
        Write-Host "  [DRY-RUN] $($file.Name) -> $monthFolder/$([System.IO.Path]::GetFileName($destPath))" -ForegroundColor Cyan
    } else {
        if (!(Test-Path $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder | Out-Null
        }
        Move-Item -Path $file.FullName -Destination $destPath -Force
    }
    
    $count++
    if (-not $stats.ContainsKey($monthFolder)) { $stats[$monthFolder] = 0 }
    $stats[$monthFolder]++
}

Write-Host "`n[+] Rangement terminé : $count capture(s) d'écran traitée(s)." -ForegroundColor Green
$stats.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host "  - $($_.Name) : $($_.Value) fichier(s)"
}
