$downloads = "C:\Users\HP\Downloads"

$categories = @{
    "01_Executables_et_Installateurs" = @(".exe", ".msi", ".iso", ".img", ".dmg")
    "02_Documents_et_Admin"           = @(".pdf", ".msg", ".eml", ".docx")
    "03_Data_CSV_Excel"               = @(".csv", ".xlsx", ".xls")
    "04_Images_et_Videos"             = @(".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif", ".mp4")
    "05_Archives_et_Projets"          = @(".zip", ".pkpass", ".json", ".ics", ".psd", ".af", ".site", ".txt")
    "06_Presentations"                = @(".pptx")
}

$files = Get-ChildItem -Path $downloads -File

$count = 0
foreach ($file in $files) {
    if ($file.Name -eq "desktop.ini") { continue }
    $ext = $file.Extension.ToLower()
    $targetCat = "07_Autres"
    
    foreach ($cat in $categories.Keys) {
        if ($categories[$cat] -contains $ext) {
            $targetCat = $cat
            break
        }
    }
    
    $destFolder = Join-Path $downloads $targetCat
    if (!(Test-Path $destFolder)) {
        New-Item -ItemType Directory -Path $destFolder | Out-Null
    }
    
    $destPath = Join-Path $destFolder $file.Name
    if (Test-Path $destPath) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $destPath = Join-Path $destFolder "$baseName`_copy$ext"
    }
    
    Move-Item -Path $file.FullName -Destination $destPath -Force
    $count++
}

Write-Host "Rangement terminé : $count fichiers déplacés."
