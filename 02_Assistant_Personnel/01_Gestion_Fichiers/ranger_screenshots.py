"""
ranger_screenshots.py — Organisation automatique des Captures d'écran par date.

Ce script classe les captures d'écran dans des sous-dossiers par mois (YYYY-MM).
Conforme à l'architecture Antigravity (Couche 2 & 3) :
- Chemins dynamiques via Path.home() ou argument CLI (--target-dir)
- Safe Mode : support du flag --dry-run pour prévisualiser les changements.
"""

import argparse
import os
import shutil
from datetime import datetime
from pathlib import Path


def organize_screenshots(target_dir: Path, dry_run: bool = False, verbose: bool = False) -> int:
    """Trie les captures d'écran dans des sous-dossiers par date de modification (YYYY-MM)."""
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
        if item.name.startswith(".") or item.name == "desktop.ini" or item.is_dir():
            continue
        
        if item.is_file():
            mod_time = datetime.fromtimestamp(item.stat().st_mtime)
            folder_name = mod_time.strftime("%Y-%m")
            
            dest_dir = target_dir / folder_name
            dest_path = dest_dir / item.name
            
            # Gérer les doublons sans écraser
            counter = 1
            while dest_path.exists() and dest_path != item:
                dest_path = dest_dir / f"{item.stem}_{counter}{item.suffix}"
                counter += 1
            
            if dest_path != item:
                if verbose or dry_run:
                    print(f"  {mode_prefix}Déplacement : {item.name} ➔ {folder_name}/{dest_path.name}")
                
                if not dry_run:
                    dest_dir.mkdir(exist_ok=True)
                    shutil.move(str(item), str(dest_path))
                    
                moved_count += 1
                stats[folder_name] = stats.get(folder_name, 0) + 1

    print(f"\n[+] {mode_prefix}Rangement terminé : {moved_count} capture(s) organisée(s) par date.")
    for month, count in sorted(stats.items()):
        print(f"    - {month} : {count} fichier(s)")

    return moved_count


def main():
    parser = argparse.ArgumentParser(
        description="Organisation des captures d'écran par mois (Antigravity Assistant)."
    )
    parser.add_argument(
        "--target-dir",
        type=Path,
        default=Path(os.environ.get("SCREENSHOTS_DIR", str(Path.home() / "Pictures" / "Screenshots"))),
        help="Chemin du dossier des captures d'écran"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simule le rangement sans déplacer de fichier (Safe Mode)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Affiche le détail de chaque capture traitée"
    )
    
    args = parser.parse_args()
    organize_screenshots(args.target_dir, dry_run=args.dry_run, verbose=args.verbose)


if __name__ == "__main__":
    main()
