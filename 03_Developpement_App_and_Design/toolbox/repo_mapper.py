"""
repo_mapper.py — Extracteur de Cartographie Syntaxique Compacte (Repo-Map).
Inspiré de l'architecture d'Aider.

Génère en quelques millisecondes une carte ultra-compacte des signatures
de types, classes, structs, protocoles et fonctions pour Swift, TypeScript et Python,
sans saturer la fenêtre de contexte de l'agent.
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


SWIFT_PATTERNS = [
    r"^(?:public\s+|private\s+|fileprivate\s+|internal\s+|open\s+)?(?:final\s+)?(class|struct|enum|protocol|actor)\s+([A-Za-z0-9_]+)",
    r"^(?:public\s+|private\s+|fileprivate\s+|internal\s+|open\s+|@\w+\s+)*(?:static\s+|class\s+)?func\s+([A-Za-z0-9_]+)\s*(\([^\)]*\))(?:\s*->\s*([^{]+))?",
]

PYTHON_PATTERNS = [
    r"^class\s+([A-Za-z0-9_]+)(?:\([^\)]*\))?:",
    r"^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*(\([^\)]*\))(?:\s*->\s*[^:]+)?:",
]

TS_PATTERNS = [
    r"^(?:export\s+)?(?:default\s+)?(class|interface|type|enum)\s+([A-Za-z0-9_]+)",
    r"^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*(\([^\)]*\))",
    r"^(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^\)]*\)\s*(?::\s*[^=]+)?\s*=>",
]


def extract_signatures(file_path: Path) -> List[str]:
    signatures = []
    suffix = file_path.suffix.lower()
    
    if suffix == ".swift":
        patterns = SWIFT_PATTERNS
    elif suffix == ".py":
        patterns = PYTHON_PATTERNS
    elif suffix in {".ts", ".tsx", ".js", ".jsx"}:
        patterns = TS_PATTERNS
    else:
        return []

    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        for line in content.splitlines():
            line_stripped = line.strip()
            if not line_stripped or line_stripped.startswith("//") or line_stripped.startswith("#"):
                continue
            for pat in patterns:
                match = re.search(pat, line_stripped)
                if match:
                    signatures.append(line_stripped)
                    break
    except Exception:
        pass
        
    return signatures


def generate_repo_map(target_dir: str = ".") -> Dict[str, List[str]]:
    root = Path(target_dir)
    repo_map = {}
    ignored_dirs = {".git", ".venv", "node_modules", "__pycache__", "Workspace", ".secrets", "build", "DerivedData"}
    valid_exts = {".swift", ".py", ".ts", ".tsx", ".js"}

    for path in sorted(root.rglob("*")):
        if any(part in ignored_dirs for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in valid_exts:
            sigs = extract_signatures(path)
            if sigs:
                rel_path = str(path.relative_to(root)).replace("\\", "/")
                repo_map[rel_path] = sigs

    return repo_map


def print_repo_map(repo_map: Dict[str, List[str]]):
    print("=== 🌲 REPO-MAP SYNTAXIQUE COMPACTE ===")
    total_files = len(repo_map)
    total_sigs = sum(len(sigs) for sigs in repo_map.values())
    print(f"Fichiers analysés : {total_files} | Symboles extraits : {total_sigs}\n")
    
    for file_path, sigs in repo_map.items():
        print(f"📄 {file_path}")
        for sig in sigs:
            print(f"   ├─ {sig}")
        print()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    res = generate_repo_map(target)
    print_repo_map(res)
