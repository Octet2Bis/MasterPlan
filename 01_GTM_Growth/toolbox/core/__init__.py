# Toolbox Core — Modules d'analyse et validation
# Imports sécurisés pour préserver le fonctionnement zéro-dépendance des linters

try:
    from toolbox.core.normalize import normalize_text, normalize_domain
except ImportError:
    pass

try:
    from toolbox.core.scoring import compute_confidence_score
except ImportError:
    pass

try:
    from toolbox.core.dns_check import get_mx_hosts
except ImportError:
    pass
