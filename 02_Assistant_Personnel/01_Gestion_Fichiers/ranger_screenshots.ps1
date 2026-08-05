$screenshots = "C:\Users\HP\Pictures\Screenshots"

if (!(Test-Path $screenshots)) {
    Write-Host "Le dossier $screenshots n'existe pas." -ForegroundColor Red
    exit
}

$files = Get-ChildItem -Path $screenshots -File
$count = 0
$stats = @{}

foreach ($file in $files) {
    if ($file.Name -eq "desktop.ini") { continue }
    
    $monthFolder = $file.LastWriteTime.ToString("yyyy-MM")
    $destFolder = Join-Path $screenshots $monthFolder
    
    if (!(Test-Path $destFolder)) {
        New-Item -ItemType Directory -Path $destFolder | Out-Null
    }
    
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
    
    Move-Item -Path $file.FullName -Destination $destPath -Force
    $count++
    if (-not $stats.ContainsKey($monthFolder)) { $stats[$monthFolder] = 0 }
    $stats[$monthFolder]++
}

Write-Host "Rangement terminé : $count captures d'écran organisées par date."
$stats.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host "  - $($_.Name) : $($_.Value) fichier(s)"
}
