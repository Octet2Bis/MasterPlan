import os
import shutil
from pathlib import Path

DOWNLOADS_DIR = Path(r"C:\Users\HP\Downloads")

CATEGORIES = {
    "01_Executables_et_Installateurs": [".exe", ".msi", ".iso", ".img", ".dmg"],
    "02_Documents_et_Admin": [".pdf", ".msg", ".eml", ".docx"],
    "03_Data_CSV_Excel": [".csv", ".xlsx", ".xls"],
    "04_Images_et_Videos": [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif", ".mp4"],
    "05_Archives_et_Projets": [".zip", ".pkpass", ".json", ".ics", ".psd", ".af", ".site", ".txt"],
    "06_Presentations": [".pptx"]
}

def organize_downloads():
    if not DOWNLOADS_DIR.exists():
        print(f"Le dossier {DOWNLOADS_DIR} n'existe pas.")
        return

    moved_count = 0
    for item in DOWNLOADS_DIR.iterdir():
        # Ignorer desktop.ini et les dossiers créés par ce script
        if item.name == "desktop.ini" or item.name in CATEGORIES or item.name == "Corbeille_Temporaire":
            continue
        
        if item.is_file():
            ext = item.suffix.lower()
            target_folder = "07_Autres"
            for cat, exts in CATEGORIES.items():
                if ext in exts:
                    target_folder = cat
                    break
            
            dest_dir = DOWNLOADS_DIR / target_folder
            dest_dir.mkdir(exist_ok=True)
            
            dest_path = dest_dir / item.name
            # Gérer les doublons sans écraser
            counter = 1
            while dest_path.exists():
                dest_path = dest_dir / f"{item.stem}_{counter}{item.suffix}"
                counter += 1
                
            shutil.move(str(item), str(dest_path))
            moved_count += 1
            
    print(f"Rangement terminé : {moved_count} fichiers déplacés.")

if __name__ == "__main__":
    organize_downloads()
