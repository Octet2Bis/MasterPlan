"""
aci_lexer.py — Tokenizer minimal du linter ACI (équilibre ()[]{} JS/TS/Swift).

Un seul balayage gauche→droite : commentaires, chaînes, templates `${…}`,
regex littérales (JS/TS) et interpolations `\\(…)` (Swift) sont sautés avant
de compter ()[]{}. L'ancien nettoyage par regex retirait les commentaires
avant les chaînes : le `//` de "https://…" coupait la ligne et faussait tout.
"""

from typing import NamedTuple, Optional, Tuple

PAIRS = {")": "(", "]": "[", "}": "{"}
# Mots-clés après lesquels « / » ouvre une regex littérale (sinon : division).
REGEX_AFTER = {"return", "typeof", "instanceof", "in", "of", "new", "delete",
               "void", "throw", "case", "do", "else", "yield", "await"}


class Lit(NamedTuple):
    """Délimiteurs d'un littéral : fin, ouverture d'interpolation, échappement."""
    close: str
    interp: str = ""
    multiline: bool = False
    esc: str = "\\"


TEMPLATE = Lit("`", "${", True)


def swift_lit(pounds: int, multiline: bool) -> Lit:
    """Chaîne Swift `"…"`, `\"\"\"…\"\"\"` ou brute `#"…"#` (échappement `\\#`)."""
    h = "#" * pounds
    return Lit(('"""' if multiline else '"') + h, "\\" + h + "(", multiline, "\\" + h)


def scan_literal(src: str, i: int, lit: Lit) -> Tuple[int, str]:
    """Avance dans le corps d'un littéral → (index, 'end' | 'interp' | 'open')."""
    while i < len(src):
        if src.startswith(lit.close, i):
            return i + len(lit.close), "end"
        if lit.interp and src.startswith(lit.interp, i):
            return i + len(lit.interp), "interp"
        if src.startswith(lit.esc, i):
            i += len(lit.esc)
            i += 2 if src.startswith("\r\n", i) else 1
        elif src[i] == "\n" and not lit.multiline:
            break
        else:
            i += 1
    return i, "open"


def regex_end(src: str, i: int) -> int:
    """Fin de la regex littérale ouverte en i, ou -1 si aucun « / » final sur la ligne."""
    j, in_class = i + 1, False
    while j < len(src) and src[j] != "\n":
        c = src[j]
        if c == "\\":
            j += 1
        elif c == "[":
            in_class = True
        elif c == "]":
            in_class = False
        elif c == "/" and not in_class:
            j += 1
            while j < len(src) and (src[j].isalnum() or src[j] in "_$"):  # drapeaux
                j += 1
            return j
        j += 1
    return -1


class BracketScanner:
    """Équilibre ()[]{} d'un source JS/TS. La pile garde, par ouvrant,
    le littéral à reprendre quand il ferme une interpolation (`${…}`)."""
    NESTED_COMMENTS = False

    def __init__(self, src: str):
        self.src, self.stack, self.error = src, [], None
        self.regex_ok = True  # un « / » ici ouvrirait-il une regex ?

    def line(self, pos: int) -> int:
        return self.src.count("\n", 0, pos) + 1

    def fail(self, pos: int, msg: str) -> int:
        self.error = f"ligne {self.line(pos)} : {msg}"
        return len(self.src)

    def run(self) -> Optional[str]:
        src, i = self.src, self.start()
        while i < len(src):
            c = src[i]
            if src.startswith("//", i):
                j = src.find("\n", i)
                i = len(src) if j < 0 else j
            elif src.startswith("/*", i):
                i = self.block_comment(i)
            elif c in "([{":
                self.stack.append((c, i, None, i))
                self.regex_ok = True
                i += 1
            elif c in ")]}":
                i = self.close(i)
            elif c == ";" and self.stack and self.stack[-1][2]:
                # Jamais valide au premier niveau de ${…} / \(…) : signe d'une
                # accolade d'interpolation perdue (désynchronisation des backticks).
                i = self.fail(i, "';' dans une interpolation (accolade manquante ?)")
            else:
                i = self.step(i)
        if self.error is None and self.stack:
            opener, pos = self.stack[-1][:2]
            self.fail(pos, f"'{opener}' jamais refermé")
        return self.error

    def start(self) -> int:
        """Saute un shebang (#!) en tête de fichier."""
        if not self.src.startswith("#!"):
            return 0
        j = self.src.find("\n")
        return len(self.src) if j < 0 else j

    def close(self, i: int) -> int:
        c = self.src[i]
        if not self.stack:
            return self.fail(i, f"'{c}' inattendu")
        opener, pos, lit, lit_pos = self.stack.pop()
        if opener != PAIRS[c]:
            return self.fail(i, f"'{c}' ferme '{opener}' ouvert ligne {self.line(pos)}")
        self.regex_ok = False
        return self.literal(i + 1, lit_pos, lit) if lit else i + 1

    def literal(self, i: int, start: int, lit: Lit) -> int:
        """Saute un littéral ; une interpolation rend la main au code via la pile."""
        j, state = scan_literal(self.src, i, lit)
        if state == "open":
            return self.fail(start, "chaîne ou template non terminé")
        if state == "interp":
            self.stack.append((lit.interp[-1], j - 1, lit, start))
        self.regex_ok = state == "interp"
        return j

    def block_comment(self, i: int) -> int:
        src, depth, j = self.src, 1, i + 2
        while j < len(src):
            if src.startswith("*/", j):
                depth, j = depth - 1, j + 2
                if depth == 0:
                    return j
            elif self.NESTED_COMMENTS and src.startswith("/*", j):
                depth, j = depth + 1, j + 2
            else:
                j += 1
        return self.fail(i, "commentaire /* non terminé")

    def step(self, i: int) -> int:
        """Jeton JS/TS hors commentaire et crochet : chaîne, regex, mot, ponctuation."""
        src, c = self.src, self.src[i]
        if c.isspace():
            return i + 1
        if c in "'\"`":
            return self.literal(i + 1, i, TEMPLATE if c == "`" else Lit(c))
        if c == "/" and self.regex_ok:
            end = regex_end(src, i)
            if end > 0:
                self.regex_ok = False
                return end
        if c.isalnum() or c in "_$":
            j = i + 1
            while j < len(src) and (src[j].isalnum() or src[j] in "_$"):
                j += 1
            self.regex_ok = src[i:j] in REGEX_AFTER and src[i - 1:i] != "."
            return j
        self.regex_ok = True
        return i + 1


class SwiftScanner(BracketScanner):
    """Swift : commentaires imbriqués, `\\(…)`, chaînes `\"\"\"` et brutes `#"…"#`,
    regex étendues `#/…/#`. Les regex nues `/…/` (opt-in Swift 5) sont ignorées."""
    NESTED_COMMENTS = True

    def step(self, i: int) -> int:
        src, j = self.src, i
        while j < len(src) and src[j] == "#":
            j += 1
        pounds = j - i
        if src.startswith('"', j):
            multiline = src.startswith('"""', j)
            return self.literal(j + (3 if multiline else 1), i, swift_lit(pounds, multiline))
        if pounds and src.startswith("/", j):
            end = src.find("/" + "#" * pounds, j + 1)
            return self.fail(i, "regex #/…/# non terminée") if end < 0 else end + 1 + pounds
        return max(j, i + 1)


def check_brackets(source: str, lang: str = "js") -> Optional[str]:
    """None si ()[]{} sont équilibrés hors commentaires et littéraux, sinon le motif."""
    scanner = SwiftScanner(source) if lang == "swift" else BracketScanner(source)
    return scanner.run()
