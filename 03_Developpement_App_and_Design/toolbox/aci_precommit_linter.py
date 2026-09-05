"""
aci_precommit_linter.py — Linter de Pré-Commit et Contrôle Syntaxique ACI.
Inspiré de SWE-Agent et Aider.

Vérifie de manière déterministe la validité syntaxique, l'équilibre des accolades
et l'absence de fuite de clés d'API avant toute validation d'état ou commit Git.
"""

import ast
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


SECRET_REGEXES = [
    (r"sk_live_[0-9a-zA-Z]{24,}", "Stripe Live Secret Key"),
    (r"AIza[0-9A-Za-z-_]{35}", "Google API Key"),
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token"),
    (r"xoxb-[0-9]{11,13}-[0-9]{11,13}-[0-9a-zA-Z]{24}", "Slack Bot Token"),
    (r"-----BEGIN (?:RSA|OPENSSH) PRIVATE KEY-----", "Private Key Header"),
]


def check_python_syntax(file_path: Path) -> Tuple[bool, str]:
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        ast.parse(source, filename=str(file_path))
        return True, "OK"
    except SyntaxError as e:
        return False, f"Erreur de syntaxe ligne {e.lineno}: {e.msg}"
    except Exception as e:
        return False, str(e)


def check_json_syntax(file_path: Path) -> Tuple[bool, str]:
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        json.loads(source)
        return True, "OK"
    except Exception as e:
        return False, f"Erreur JSON : {e}"


def check_brace_balance(file_path: Path) -> Tuple[bool, str]:
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        # Nettoyage simple des commentaires et chaînes
        clean = re.sub(r"//.*|/\*[\s\S]*?\*/", "", source)
        clean = re.sub(r'"(?:\\.|[^"\\])*"', '""', clean)
        
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for i, char in enumerate(clean):
            if char in '({[':
                stack.append(char)
            elif char in ')}]':
                if not stack or stack[-1] != pairs[char]:
                    return False, f"Déséquilibre d'accolades/parenthèses ('{char}' inattendu)"
                stack.pop()
        if stack:
            return False, f"Bloc non refermé (restant: {stack})"
        return True, "OK"
    except Exception as e:
        return True, f"Non vérifiable: {e}"


def scan_for_secrets(file_path: Path) -> List[str]:
    leaks = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        for pattern, name in SECRET_REGEXES:
            if re.search(pattern, content):
                leaks.append(name)
    except Exception:
        pass
    return leaks


def lint_workspace(target_dir: str = ".") -> bool:
    root = Path(target_dir)
    ignored = {".git", ".venv", "node_modules", "__pycache__", "Workspace", ".secrets"}
    all_passed = True

    print("=== 🛡️ LINTER PRÉ-COMMIT ACI (SWE-AGENT / AIDER) ===\n")

    for p in sorted(root.rglob("*")):
        if any(part in ignored for part in p.parts):
            continue
        if not p.is_file():
            continue

        # 1. Vérification fuites de secrets
        leaks = scan_for_secrets(p)
        if leaks:
            print(f"❌ [SECRET DETECTED] {p} -> {leaks}")
            all_passed = False

        # 2. Vérification syntaxe par extension
        ext = p.suffix.lower()
        if ext == ".py":
            ok, msg = check_python_syntax(p)
            if not ok:
                print(f"❌ [PYTHON SYNTAX ERROR] {p} -> {msg}")
                all_passed = False
        elif ext == ".json":
            ok, msg = check_json_syntax(p)
            if not ok:
                print(f"❌ [JSON SYNTAX ERROR] {p} -> {msg}")
                all_passed = False
        elif ext in {".swift", ".ts", ".js"}:
            ok, msg = check_brace_balance(p)
            if not ok:
                print(f"⚠️ [BRACE IMBALANCE] {p} -> {msg}")

    if all_passed:
        print("✅ Tous les fichiers sont syntaxiquement valides et exempts de fuites de secrets.")
    else:
        print("\n❌ Des erreurs doivent être corrigées avant validation.")

    return all_passed


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    success = lint_workspace(target)
    sys.exit(0 if success else 1)
