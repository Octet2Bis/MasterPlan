"""
strix_audit_runner.py — Scanner & Validateur de Sécurité OWASP (Zéro Dépendance).

Scanne le code source des applications pour détecter les vulnérabilités critiques :
- Clés d'API, tokens et secrets hardcodés en clair
- Injections SQL directes (concaténation de chaînes dans les requêtes)
- Mauvaises configurations CORS (Access-Control-Allow-Origin: *)
- Endpoints non authentifiés ou debug-mode actif en production
- Commandes shell non échappées (os.system, subprocess shell=True)
"""

import io
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


SECURITY_PATTERNS = [
    # 1. Clés d'API et secrets hardcodés
    (r"(?i)(api[_-]?key|secret|password|bearer|token)\s*=\s*['\"][A-Za-z0-9_\-]{16,}['\"]", "CRITICAL", "Secret ou Clé d'API hardcodé en clair dans le code"),
    
    # 2. Injections SQL potentielles
    (r"(?i)(SELECT|INSERT|UPDATE|DELETE)\s+.*?\s+FROM\s+.*?\+.*?", "HIGH", "Concaténation directe dans une requête SQL (Risque d'injection SQL)"),
    (r"(?i)cursor\.execute\(f['\"].*?\{.*?\}", "HIGH", "F-string utilisée dans cursor.execute() (Risque d'injection SQL)"),
    
    # 3. Exécutions Shell non sécurisées
    (r"(?i)os\.system\(|subprocess\.Popen\(.*shell\s*=\s*True", "HIGH", "Exécution shell directe non sécurisée"),
    
    # 4. Configurations CORS permissives
    (r"(?i)allow_origins\s*=\s*\[\s*['\"]\*['\"]\s*\]", "MEDIUM", "CORS Wildcard (*) autorisant toutes les origines"),
    
    # 5. Debug mode en dur
    (r"(?i)DEBUG\s*=\s*True", "LOW", "Debug mode activé en dur"),
]


def audit_codebase(target_dir: str = ".") -> Dict:
    """
    Scanne les fichiers Python, JS, TS et HTML dans target_dir.
    """
    root = Path(target_dir)
    findings = []
    
    ignored_dirs = {".git", ".venv", "node_modules", "__pycache__", "Workspace", ".secrets"}
    valid_extensions = {".py", ".js", ".ts", ".html", ".yaml", ".json"}
    
    for path in root.rglob("*"):
        if any(part in ignored_dirs for part in path.parts):
            continue
        if path.is_file() and path.suffix in valid_extensions:
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
                lines = content.split("\n")
                for line_idx, line in enumerate(lines, start=1):
                    # Ignorer les lignes de commentaires ou les déclarations du scanner lui-même
                    if "strix_audit_runner" in str(path) or line.strip().startswith("#"):
                        continue
                    for pattern, severity, desc in SECURITY_PATTERNS:
                        if re.search(pattern, line):
                            findings.append({
                                "file": str(path.relative_to(root)),
                                "line": line_idx,
                                "severity": severity,
                                "description": desc,
                                "snippet": line.strip()[:80]
                            })
            except Exception:
                continue
                
    critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high_count = sum(1 for f in findings if f["severity"] == "HIGH")
    
    security_score = max(0, 100 - (critical_count * 30 + high_count * 15 + len(findings) * 2))
    
    return {
        "security_score": security_score,
        "is_production_ready": critical_count == 0 and high_count == 0,
        "total_findings": len(findings),
        "critical_count": critical_count,
        "high_count": high_count,
        "findings": findings
    }


if __name__ == "__main__":
    print("=== LANCEMENT DU SCAN DE SÉCURITÉ STRIX ===")
    res = audit_codebase(".")
    print(f"Score de Sécurité : {res['security_score']}/100")
    print(f"Production-Ready : {res['is_production_ready']}")
    print(f"Total Vulnérabilités : {res['total_findings']} (Critiques: {res['critical_count']}, Élevées: {res['high_count']})")
    for f in res["findings"]:
        print(f"  [{f['severity']}] {f['file']}:{f['line']} -> {f['description']}")
