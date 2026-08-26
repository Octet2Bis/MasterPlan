"""
scoring.py — Calcul du Confidence_Score selon le Framework Attio.

Module HORS-LIGNE : aucune requête réseau.
Utilisé par UC_CRM_Hygiene en phase POST-OSINT pour prendre la décision
finale d'inclure ou d'exclure un lead.
"""

from typing import Optional


# Scores de base par source (Finder)
SOURCE_SCORES = {
    "Hunter":             85,
    "LinkedIn_Resolver":  85,  # Résolution précise de nom complet / composé via LinkedIn
    "Voila Norbert":      90,
    "Tomba":              75,
    "Snov.io":            70,
    "Prospeo":            70,
    "Permutator":         65,  # Génération locale standard de pattern d'entreprise
    "theHarvester":       40,  # OSINT open source
    "infoga":             30,  # OSINT agressif
    "Dropcontact":        90,
    "SMTP_Direct":        60,
}

# Modificateurs par statut de vérification
STATUS_MODIFIERS = {
    "Valid_O365_Account": 1.0,   # Score × 1.0 (compte utilisateur individuel confirmé actif dans Azure AD)
    "Valid_Citation":     1.0,   # Score × 1.0 (trouvé textuellement dans des documents publics / PDF)
    "Valid":              1.0,   # Score × 1.0 (confirmé par SMTP direct ou API)
    "Valid_Social":       0.95,  # Score × 0.95 (confirmé par empreinte d'identité OSINT/Gravatar)
    "Valid_SSO":          0.92,  # Score × 0.92 (confirmé via annuaire SSO/OIDC/M365/Google)
    "Valid_Cloud":        0.90,  # Score × 0.90 (confirmé sur tenant Microsoft 365 / Google Workspace)
    "Valid_DNS_Hygiene":  0.88,  # Score × 0.88 (SPF & DMARC actifs et vérifiés)
    "Valid_CT_Logs":      0.86,  # Score × 0.86 (infrastructure mail certifiée dans les logs TLS public)
    "Valid_MX_Cluster":   0.85,  # Score × 0.85 (passerelle de messagerie d'entreprise certifiée)
    "Valid_MX":           0.85,  # Score × 0.85 (syntaxe OK + MX confirmés)
    "Catch-All":         0.75,  # Score × 0.75 (le serveur accepte tout)
    "Risky":             0.5,   # Score × 0.5 (attention / greylisted)
    "Role_Based":        0.4,   # Score × 0.4 (boîte d'équipe générique : contact@, info@)
    "Invalid":           0.0,   # Score = 0 (rejeté)
    "Invalid_Syntax":    0.0,   # Score = 0 (syntaxe invalide)
    "No_MX":             0.0,   # Score = 0 (aucun serveur mail)
    "No_MX_Record":      0.0,   # Score = 0 (aucun serveur mail)
    "Empty_Domain":      0.0,   # Score = 0 (domaine manquant)
    "Not Verified":       0.6,   # Score × 0.6 (pas de verifier disponible)
}





def compute_confidence_score(
    source: str,
    verifier_status: str,
    verifier_score: Optional[int] = None,
    finder_raw_score: Optional[int] = None,
    domain_consensus_bonus: int = 0
) -> int:
    """
    Calcule le Confidence_Score final (0-100) pour un lead selon le Framework Attio.
    
    Logique :
    1. On prend le score de base de la source (SOURCE_SCORES).
    2. Si le Finder a retourné un raw_score, on en fait la moyenne avec le score source.
    3. On applique le modificateur du statut Verifier.
    4. Si le Verifier a retourné son propre score, on fait la moyenne pondérée
       (60% verifier, 40% source) pour donner plus de poids à la vérification.
    5. On applique le bonus de consensus de domaine (+5 à +15 pts si cohérence validée).
    
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
    if verifier_score is not None and verifier_score > 0 and verifier_status not in ("Invalid", "Invalid_Syntax", "No_MX", "No_MX_Record", "Empty_Domain"):
        final = int((verifier_score * 0.6) + (base_score * modifier * 0.4))
    else:
        final = int(base_score * modifier)
    
    # Étape 5 : Bonus de consensus d'entreprise (si statut non invalide)
    if modifier > 0 and domain_consensus_bonus > 0:
        final += domain_consensus_bonus

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
