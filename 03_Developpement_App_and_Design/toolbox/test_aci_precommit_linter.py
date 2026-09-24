"""
test_aci_precommit_linter.py — Non-régression du linter pré-commit ACI.

Chaque cas écrit ses fichiers dans un dossier temporaire (jamais dans le dépôt,
que le linter parcourt). Lancer :
    python 03_Developpement_App_and_Design/toolbox/test_aci_precommit_linter.py
"""

import contextlib
import io
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import aci_precommit_linter as linter
from aci_lexer import check_brackets

LINTER = Path(__file__).resolve().parent / "aci_precommit_linter.py"
HAS_NODE = shutil.which("node") is not None

# Constructions valides que l'ancien compteur d'accolades prenait pour des erreurs.
VALID_JS = r"""#!/usr/bin/env node
const url = "https://example.com/a?b=1"; // commentaire avec } et (
const re = /[^}]+/g, re2 = /\/(?:x|y)\)/;
const t = `a ${ {b: 1}.b } ${`imbriqué ${"}"}`} fin`;
const s = '{ ( [', d = 10 / 2 / 1;
/* bloc } ) ] */
if (!/^\d+$/.test(url)) { console.log(url.split("//")[1], re, re2, t, s, d); }
"""
BROKEN_JS = """function greet(name) {
  if (name) {
    return `Bonjour ${name}`;
  // accolade du if manquante
}
"""
VALID_TS = r"""/// <reference types="vite/client" />
type Tpl = `id-${string}`;
interface Box<T> { value: T; tags: Array<{ k: string }> }
export const pick = <T,>(b: Box<T>): T => b.value;
const url: string = "https://example.com/path";
export const pattern = /[{(]\s*\/\//g;
export const half = (n: number) => n / 2 / 1;
"""
BROKEN_TS = """export function total(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0;
}
"""
VALID_SWIFT = r'''import Foundation

/* commentaire /* imbriqué } */ toujours commentaire ( */
struct Card {
    let url = URL(string: "aevum://open?id=1")  // "//" dans une chaîne
    let label = "Total: \(items.map { "\($0)" }.joined(separator: ")"))"
    let raw = #"pas d'interpolation \(x) ni de { "#
    let block = """
        { ( [ "guillemets" ""
        \(value) }
        """
}
'''
BROKEN_SWIFT = """func render() {
    if ready {
        draw()
    // accolade manquante
}
"""
JSONC = """{
  // commentaire de ligne
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },  /* "@/*" est une chaîne, pas un commentaire */
    "strict": true,
  },
}
"""


class LintCase(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def write(self, name: str, content: str) -> Path:
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def run_linter(self) -> subprocess.CompletedProcess:
        return subprocess.run([sys.executable, str(LINTER), str(self.root)],
                              capture_output=True, encoding="utf-8", errors="replace")


class TokenizerTest(unittest.TestCase):
    def test_valid_sources_pass(self):
        self.assertIsNone(check_brackets(VALID_JS, "js"))
        self.assertIsNone(check_brackets(VALID_TS, "js"))
        self.assertIsNone(check_brackets(VALID_SWIFT, "swift"))

    def test_missing_closers_are_flagged(self):
        self.assertIn("jamais refermé", check_brackets(BROKEN_JS, "js"))
        self.assertIn("ferme '('", check_brackets(BROKEN_TS, "js"))
        self.assertIn("jamais refermé", check_brackets(BROKEN_SWIFT, "swift"))

    def test_unterminated_literals_are_flagged(self):
        self.assertIn("non terminé", check_brackets("const t = `a ${b}\n", "js"))
        self.assertIn("non terminé", check_brackets("const s = 'abc\nf();\n", "js"))
        self.assertIn("non terminé", check_brackets("/* a /* b */ f() {}\n", "swift"))

    def test_semicolon_inside_interpolation_is_flagged(self):
        # Équilibré en apparence, mais invalide : trace d'une accolade de ${…} perdue.
        self.assertIn("interpolation", check_brackets("const a = `x ${y; z}`;\n", "js"))
        self.assertIn("interpolation", check_brackets('let s = "\\(a; b)"\n', "swift"))


class JsoncTest(LintCase):
    def test_tsconfig_is_read_as_jsonc(self):
        ok, msg = linter.check_json_syntax(self.write("tsconfig.app.json", JSONC))
        self.assertTrue(ok, msg)

    def test_plain_json_stays_strict(self):
        ok, _ = linter.check_json_syntax(self.write("data.json", JSONC))
        self.assertFalse(ok)

    def test_real_error_in_tsconfig_is_flagged(self):
        ok, _ = linter.check_json_syntax(self.write("tsconfig.json", '{ "a": 1 "b": 2 }'))
        self.assertFalse(ok)


class JsSyntaxTest(LintCase):
    @unittest.skipUnless(HAS_NODE, "node absent")
    def test_node_check(self):
        valid, broken = self.write("ok.js", VALID_JS), self.write("broken.js", BROKEN_JS)
        results = linter.check_js_syntax([valid, broken])
        self.assertEqual(results[valid], (True, "OK"))
        ok, msg = results[broken]
        self.assertFalse(ok)
        self.assertRegex(msg, r"^ligne \d+ : SyntaxError")

    def test_tokenizer_fallback_without_node(self):
        valid, broken = self.write("ok.js", VALID_JS), self.write("broken.js", BROKEN_JS)
        out = io.StringIO()
        with mock.patch.object(linter.shutil, "which", return_value=None), \
                contextlib.redirect_stdout(out):
            results = linter.check_js_syntax([valid, broken])
        self.assertIn("node introuvable", out.getvalue())
        self.assertTrue(results[valid][0])
        self.assertFalse(results[broken][0])


class WorkspaceTest(LintCase):
    def populate_valid(self):
        self.write("ok.js", VALID_JS)
        self.write("src/types.ts", VALID_TS)
        self.write("ios/Card.swift", VALID_SWIFT)
        self.write("tsconfig.json", JSONC)
        self.write("node_modules/pkg/broken.js", BROKEN_JS)  # dossier ignoré

    def test_valid_workspace_exits_0(self):
        self.populate_valid()
        run = self.run_linter()
        self.assertEqual(run.returncode, 0, run.stdout)

    def test_each_broken_file_exits_1(self):
        cases = [("broken.js", BROKEN_JS, "[JS SYNTAX ERROR]"),
                 ("broken.ts", BROKEN_TS, "[BRACE IMBALANCE]"),
                 ("Broken.swift", BROKEN_SWIFT, "[BRACE IMBALANCE]"),
                 ("broken.py", "def f(:\n", "[PYTHON SYNTAX ERROR]")]
        self.populate_valid()
        for name, content, label in cases:
            with self.subTest(name=name):
                path = self.write(name, content)
                run = self.run_linter()
                path.unlink()
                self.assertEqual(run.returncode, 1, run.stdout)
                self.assertIn(f"{label} {path}", run.stdout)

    def test_secret_is_flagged(self):
        token = "ghp_" + "A" * 36  # assemblé à l'exécution : ce fichier reste propre
        self.assertEqual(linter.scan_for_secrets(self.write("leak.txt", token)),
                         ["GitHub Personal Access Token"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
