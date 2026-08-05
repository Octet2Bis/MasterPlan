import os
import shutil
from datetime import datetime
from pathlib import Path

SCREENSHOTS_DIR = Path(r"C:\Users\HP\Pictures\Screenshots")

def organize_screenshots():
    if not SCREENSHOTS_DIR.exists():
        print(f"Le dossier {SCREENSHOTS_DIR} n'existe pas.")
        return

    moved_count = 0
    stats = {}

    for item in SCREENSHOTS_DIR.iterdir():
        if item.name == "desktop.ini" or item.is_dir():
            continue
        
        if item.is_file():
            # Déterminer le dossier cible selon la date de modification du fichier (YYYY-MM)
            mod_time = datetime.fromtimestamp(item.stat().st_mtime)
            folder_name = mod_time.strftime("%Y-%m")
            
            dest_dir = SCREENSHOTS_DIR / folder_name
            dest_dir.mkdir(exist_ok=True)
            
            dest_path = dest_dir / item.name
            
            # Gérer les doublons sans écraser (sécurisation)
            counter = 1
            while dest_path.exists() and dest_path != item:
                dest_path = dest_dir / f"{item.stem}_{counter}{item.suffix}"
                counter += 1
            
            if dest_path != item:
                shutil.move(str(item), str(dest_path))
                moved_count += 1
                stats[folder_name] = stats.get(folder_name, 0) + 1

    print(f"Rangement terminé : {moved_count} captures d'écran organisées par date.")
    for month, count in sorted(stats.items()):
        print(f"  - {month} : {count} fichier(s)")

if __name__ == "__main__":
    organize_screenshots()
