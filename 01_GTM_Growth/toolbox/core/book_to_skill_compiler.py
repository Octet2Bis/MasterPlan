"""
book_to_skill_compiler.py — Compilateur de Livres et Documents vers des Skills Antigravity (Zéro Dépendance).

Génère la structure standardisée d'un skill agentique à partir d'un livre ou mémo :
- Extraction des frameworks actionnables et modèles mentaux
- Identification des anti-patterns et erreurs courantes
- Génération du Cheatsheet condensé (réduction de 30x à 50x en tokens)
"""

import io
import sys
from pathlib import Path

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass


def generate_skill_scaffold(book_title: str, author: str, domain: str, target_dir: str = ".agents/skills") -> Path:
    """
    Crée le squelette standardisé SKILL.md pour un livre business ou technique.
    """
    slug = book_title.lower().replace(" ", "-").replace("$", "").replace("'", "")
    skill_dir = Path(target_dir) / f"book-{slug}"
    skill_dir.mkdir(parents=True, exist_ok=True)
    
    skill_file = skill_dir / "SKILL.md"
    
    content = f"""---
name: book-{slug}
description: Distillation opérationnelle et application pratique des frameworks, modèles mentaux et règles du livre '{book_title}' de {author}. À utiliser dans {domain}.
---

# 📖 {book_title} — {author} (Distillation Opérationnelle)

Ce skill encapsule les principes d'action, modèles décisionnels et anti-patterns extraits du livre **{book_title}**.

---

## 🧠 1. Modèles Mentaux & Piliers Fondamentaux
1. **Pilier 1 : [Concept Clé]**
   - *Principe :* [Description concise de la règle]
   - *Application directe :* [Comment l'appliquer dans une tâche concrète]
2. **Pilier 2 : [Concept Clé]**
   - *Principe :* [Description concise de la règle]
   - *Application directe :* [Comment l'appliquer dans une tâche concrète]

---

## ⚡ 2. Cheatsheet & Règles Heuristiques (Raccourcis Décisionnels)
* **Règle 1 :** [Règle heuristique rapide]
* **Règle 2 :** [Règle heuristique rapide]
* **Formule clé :** `[Formule ou séquence d'action]`

---

## 🚫 3. Anti-Patterns & Erreurs Classiques
* ❌ **Erreur 1 :** [Ce qu'il ne faut jamais faire selon l'auteur]
  ➔ *Alternative recommandée :* [L'approche correcte]
* ❌ **Erreur 2 :** [Ce qu'il ne faut jamais faire selon l'auteur]
  ➔ *Alternative recommandée :* [L'approche correcte]

---

## 🛠️ 4. Protocoles d'Exécution Guidée (Workflows)
* **Étape 1 :** Diagnostic initial de la situation.
* **Étape 2 :** Application du framework.
* **Étape 3 :** Contrôle qualité et validation des critères de succès.
"""
    skill_file.write_text(content, encoding="utf-8")
    return skill_file


if __name__ == "__main__":
    out = generate_skill_scaffold("$100M Offers", "Alex Hormozi", "01_GTM_Growth/")
    print(f"Scaffold généré avec succès : {out}")
