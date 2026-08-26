"""
ranger_telechargements.py — Organisation automatique du dossier Téléchargements.

Ce script classe les fichiers téléchargés selon leur extension dans des sous-dossiers thématiques.
Conforme à l'architecture Antigravity (Couche 2 & 3) :
- Chemins dynamiques via Path.home() ou argument CLI (--target-dir)
- Safe Mode : support du flag --dry-run pour prévisualiser les changements sans modifier les fichiers.
"""

import argparse
import os
import shutil
from pathlib import Path

CATEGORIES = {
    "01_Executables_et_Installateurs": [".exe", ".msi", ".iso", ".img", ".dmg"],
    "02_Documents_et_Admin": [".pdf", ".msg", ".eml", ".docx", ".doc", ".odt"],
    "03_Data_CSV_Excel": [".csv", ".xlsx", ".xls", ".ods"],
    "04_Images_et_Videos": [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif", ".mp4", ".mov", ".mkv"],
    "05_Archives_et_Projets": [".zip", ".tar", ".gz", ".7z", ".rar", ".pkpass", ".json", ".ics", ".psd", ".af", ".site", ".txt"],
    "06_Presentations": [".pptx", ".ppt", ".key"]
}


def organize_downloads(target_dir: Path, dry_run: bool = False, verbose: bool = False) -> int:
    """Trie les fichiers du dossier cible selon leur extension."""
    if not target_dir.exists():
        print(f"[!] Le dossier cible {target_dir} n'existe pas.")
        return 0

    mode_prefix = "[DRY-RUN] " if dry_run else ""
    if dry_run:
        print(f"=== MODE SIMULATION (Aucun fichier ne sera déplacé) ===")
    print(f"[*] Analyse du dossier : {target_dir}")

    moved_count = 0
    stats = {}

    for item in target_dir.iterdir():
        # Ignorer desktop.ini, les fichiers cachés et les dossiers existants
        if item.name.startswith(".") or item.name == "desktop.ini" or item.name in CATEGORIES or item.name == "Corbeille_Temporaire" or item.is_dir():
            continue
        
        if item.is_file():
            ext = item.suffix.lower()
            target_folder_name = "07_Autres"
            for cat, exts in CATEGORIES.items():
                if ext in exts:
                    target_folder_name = cat
                    break
            
            dest_dir = target_dir / target_folder_name
            dest_path = dest_dir / item.name
            
            # Gérer les doublons sans écraser
            counter = 1
            while (not dry_run and dest_path.exists()) or (dry_run and dest_path.exists()):
                dest_path = dest_dir / f"{item.stem}_{counter}{item.suffix}"
                counter += 1
            
            if verbose or dry_run:
                print(f"  {mode_prefix}Déplacement : {item.name} ➔ {target_folder_name}/{dest_path.name}")
            
            if not dry_run:
                dest_dir.mkdir(exist_ok=True)
                shutil.move(str(item), str(dest_path))
                
            moved_count += 1
            stats[target_folder_name] = stats.get(target_folder_name, 0) + 1

    print(f"\n[+] {mode_prefix}Rangement terminé : {moved_count} fichier(s) traité(s).")
    for folder, count in sorted(stats.items()):
        print(f"    - {folder} : {count} fichier(s)")

    return moved_count


def main():
    parser = argparse.ArgumentParser(
        description="Organisation automatique du dossier Téléchargements (Antigravity Assistant)."
    )
    parser.add_argument(
        "--target-dir",
        type=Path,
        default=Path(os.environ.get("DOWNLOADS_DIR", str(Path.home() / "Downloads"))),
        help="Chemin du dossier à organiser (défaut : ~/Downloads)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simule le rangement sans déplacer de fichier (Safe Mode)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Affiche le détail de chaque fichier traité"
    )
    
    args = parser.parse_args()
    organize_downloads(args.target_dir, dry_run=args.dry_run, verbose=args.verbose)


if __name__ == "__main__":
    main()
