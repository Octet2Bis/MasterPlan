"""
aci_precommit_linter.py — Linter de Pré-Commit et Contrôle Syntaxique ACI.
Inspiré de SWE-Agent et Aider.

Vérifie de manière déterministe la validité syntaxique et l'absence de fuite
de clés d'API avant toute validation d'état ou commit Git :
- Python : ast.parse ; JSON : json.loads (tsconfig*/jsconfig* lus en JSONC) ;
- JS (.js/.mjs/.cjs) : `node --check`, vrai parseur (tokenizer en repli sans node) ;
- TS / Swift : équilibre ()[]{} par tokenizer (aci_lexer.py), hors chaînes,
  commentaires, regex et templates.
Toute anomalie fait échouer le linter (code de sortie 1).
"""

import ast
import fnmatch
import json
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict, List, Tuple

from aci_lexer import Lit, check_brackets, scan_literal

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
IGNORED_DIRS = {".git", ".venv", "node_modules", "__pycache__", "Workspace", ".secrets"}
JS_EXTS = {".js", ".mjs", ".cjs"}
TOKENIZED_EXTS = {".ts": "js", ".swift": "swift"}
JSONC_NAMES = ("tsconfig*.json", "jsconfig*.json")  # JSON à commentaires (TypeScript)


def check_python_syntax(file_path: Path) -> Tuple[bool, str]:
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        ast.parse(source, filename=str(file_path))
        return True, "OK"
    except SyntaxError as e:
        return False, f"Erreur de syntaxe ligne {e.lineno}: {e.msg}"
    except Exception as e:
        return False, str(e)


def strip_jsonc(text: str) -> str:
    """JSONC (tsconfig) → JSON : commentaires blanchis (lignes et colonnes
    conservées pour les messages d'erreur), virgules finales retirées."""
    out: List[str] = []
    i, comma = 0, -1  # comma : index dans out de la dernière virgule significative
    while i < len(text):
        c = text[i]
        if c == '"':  # chaîne recopiée telle quelle : "@/*" n'ouvre pas de commentaire
            j = scan_literal(text, i + 1, Lit('"'))[0]
            out.append(text[i:j])
            i, comma = j, -1
            continue
        if text.startswith("//", i) or text.startswith("/*", i):
            if text[i + 1] == "/":
                end = text.find("\n", i)
                end = len(text) if end < 0 else end
            else:
                end = text.find("*/", i + 2)
                if end < 0:
                    raise ValueError(f"commentaire /* non terminé (caractère {i})")
                end += 2
            out.append("".join(ch if ch == "\n" else " " for ch in text[i:end]))
            i = end
            continue
        if c in "]}" and comma >= 0:
            out[comma] = " "
        if not c.isspace():
            comma = len(out) if c == "," else -1
        out.append(c)
        i += 1
    return "".join(out)


def check_json_syntax(file_path: Path) -> Tuple[bool, str]:
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        if any(fnmatch.fnmatch(file_path.name.lower(), pat) for pat in JSONC_NAMES):
            source = strip_jsonc(source)
        json.loads(source)
        return True, "OK"
    except Exception as e:
        return False, f"Erreur JSON : {e}"


def check_brace_balance(file_path: Path, lang: str = "js") -> Tuple[bool, str]:
    try:
        error = check_brackets(file_path.read_text(encoding="utf-8", errors="ignore"), lang)
    except Exception as e:
        return False, f"Non vérifiable : {e}"
    return (True, "OK") if error is None else (False, error)


def node_check(node: str, file_path: Path) -> Tuple[bool, str]:
    """`node --check` : analyse syntaxique V8 sans exécution du fichier."""
    try:
        run = subprocess.run([node, "--check", str(file_path)], capture_output=True,
                             encoding="utf-8", errors="replace", timeout=60)
    except (OSError, subprocess.SubprocessError) as e:
        return False, f"node --check impossible : {e}"
    if run.returncode == 0:
        return True, "OK"
    # stderr : « fichier:ligne », extrait, caret, puis « SyntaxError: … ».
    where = re.search(r"^.+:(\d+)\s*$", run.stderr, re.M)
    what = re.search(r"^\w*Error\b.*$", run.stderr, re.M)
    what = what.group().strip() if what else "erreur de syntaxe"
    return False, f"ligne {where.group(1)} : {what}" if where else what


def check_js_syntax(files: List[Path]) -> Dict[Path, Tuple[bool, str]]:
    """`node --check` en parallèle ; sans node, repli sur le tokenizer."""
    node = shutil.which("node")
    if files and node is None:
        print("ℹ️  node introuvable : JS contrôlé par tokenizer (moins strict que node --check).\n")
        return {p: check_brace_balance(p) for p in files}
    with ThreadPoolExecutor() as pool:
        return dict(zip(files, pool.map(lambda p: node_check(node, p), files)))


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


def collect_files(root: Path) -> List[Path]:
    """Fichiers réguliers de l'arbre, sans descendre dans les dossiers ignorés
    (node_modules…) ; liens cassés et FIFO sont écartés comme avant."""
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
        found.extend(p for p in (Path(dirpath, n) for n in filenames) if p.is_file())
    return sorted(found)


def lint_workspace(target_dir: str = ".") -> bool:
    all_passed = True

    print("=== 🛡️ LINTER PRÉ-COMMIT ACI (SWE-AGENT / AIDER) ===\n")
    files = collect_files(Path(target_dir))
    js_results = check_js_syntax([p for p in files if p.suffix.lower() in JS_EXTS])

    for p in files:
        # 1. Vérification fuites de secrets
        leaks = scan_for_secrets(p)
        if leaks:
            print(f"❌ [SECRET DETECTED] {p} -> {leaks}")
            all_passed = False

        # 2. Vérification syntaxe par extension
        ext = p.suffix.lower()
        if ext == ".py":
            (ok, msg), label = check_python_syntax(p), "PYTHON SYNTAX ERROR"
        elif ext == ".json":
            (ok, msg), label = check_json_syntax(p), "JSON SYNTAX ERROR"
        elif ext in JS_EXTS:
            (ok, msg), label = js_results[p], "JS SYNTAX ERROR"
        elif ext in TOKENIZED_EXTS:
            (ok, msg), label = check_brace_balance(p, TOKENIZED_EXTS[ext]), "BRACE IMBALANCE"
        else:
            continue
        if not ok:
            print(f"❌ [{label}] {p} -> {msg}")
            all_passed = False

    if all_passed:
        print("✅ Tous les fichiers sont syntaxiquement valides et exempts de fuites de secrets.")
    else:
        print("\n❌ Des erreurs doivent être corrigées avant validation.")

    return all_passed


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    success = lint_workspace(target)
    sys.exit(0 if success else 1)
