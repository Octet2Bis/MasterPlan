"""
scoring.py — Calcul du Confidence_Score selon le Framework Attio.

Module HORS-LIGNE : aucune requête réseau.
Utilisé par UC_CRM_Hygiene en phase POST-OSINT pour prendre la décision
finale d'inclure ou d'exclure un lead.
"""

from typing import Optional


# Scores de base par source (Finder)
SOURCE_SCORES = {
    "Hunter":       85,
    "Voila Norbert": 90,
    "Tomba":        75,
    "Snov.io":      70,
    "Prospeo":      70,
    "Dropcontact":  90,  # Premium, excellent sur le marché EU
    "theHarvester": 40,  # OSINT open source, moins fiable
    "infoga":       30,  # OSINT agressif, faible confiance
    "SMTP_Direct":  60,  # Vérification SMTP locale (verify_emails.py legacy)
}

# Modificateurs par statut de vérification
STATUS_MODIFIERS = {
    "Valid":        1.0,   # Score × 1.0 (confirmé)
    "Catch-All":   0.75,  # Score × 0.75 (le serveur accepte tout)
    "Risky":       0.5,   # Score × 0.5 (attention)
    "Invalid":     0.0,   # Score = 0 (rejeté)
    "Not Verified": 0.6,  # Score × 0.6 (pas de vérifier disponible)
}


def compute_confidence_score(
    source: str,
    verifier_status: str,
    verifier_score: Optional[int] = None,
    finder_raw_score: Optional[int] = None
) -> int:
    """
    Calcule le Confidence_Score final (0-100) pour un lead.
    
    Logique :
    1. On prend le score de base de la source (SOURCE_SCORES).
    2. Si le Finder a retourné un raw_score, on en fait la moyenne avec le score source.
    3. On applique le modificateur du statut Verifier.
    4. Si le Verifier a retourné son propre score, on fait la moyenne pondérée
       (60% verifier, 40% source) pour donner plus de poids à la vérification.
    
    Retourne un entier entre 0 et 100.
    """
    # Étape 1 : Score de base de la source
    base_score = SOURCE_SCORES.get(source, 50)
    
    # Étape 2 : Moyenne avec le raw_score du Finder si disponible
    if finder_raw_score is not None and finder_raw_score > 0:
        base_score = (base_score + finder_raw_score) // 2
    
    # Étape 3 : Appliquer le modificateur du statut
    modifier = STATUS_MODIFIERS.get(verifier_status, 0.6)
    
    # Étape 4 : Si le Verifier a un score propre, moyenne pondérée
    if verifier_score is not None and verifier_score > 0 and verifier_status != "Invalid":
        final = int((verifier_score * 0.6) + (base_score * modifier * 0.4))
    else:
        final = int(base_score * modifier)
    
    return max(0, min(100, final))


def should_include_lead(score: int, status: str, threshold: int = 50) -> bool:
    """
    Décision finale d'inclusion/exclusion d'un lead.
    
    Un lead est inclus si :
    - Son Confidence_Score >= threshold (défaut : 50)
    - ET son statut n'est PAS "Invalid"
    """
    if status == "Invalid":
        return False
    return score >= threshold
