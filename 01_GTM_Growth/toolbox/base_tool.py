"""
base_tool.py — Contrats d'interface pour toutes les briques de la Toolbox.

Chaque outil (Finder, Verifier, Investigator) DOIT hériter de sa classe
abstraite respective et implémenter la méthode requise.

Règle architecturale (Couche 2 — Separation of Concerns) :
- Un Finder CHERCHE un email. Il ne le vérifie pas et ne le score pas.
- Un Verifier VALIDE un email. Il ne le cherche pas.
- Un Investigator COLLECTE des empreintes numériques. C'est du profiling pur.
"""

import os
import time
import random
import requests
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


# ============================================================
# Exceptions partagées
# ============================================================

class QuotaExceededError(Exception):
    """Levée en cas de quota dépassé ou rate limit (HTTP 401, 403, 429)."""
    pass


class ToolUnavailableError(Exception):
    """Levée quand l'outil n'est pas configuré (clé API manquante, binaire absent)."""
    pass


# ============================================================
# Dataclasses de résultat (contrats de sortie)
# ============================================================

@dataclass
class FinderResult:
    """Résultat standardisé retourné par tout Finder."""
    email: Optional[str] = None
    source: str = "Unknown"
    raw_score: int = 0  # Score brut du Finder (0-100)

@dataclass
class VerifierResult:
    """Résultat standardisé retourné par tout Verifier."""
    status: str = "Not Verified"  # "Valid", "Catch-All", "Invalid", "Risky", "Not Verified"
    score: int = 50               # Score de confiance vérifié (0-100)

@dataclass
class InvestigatorResult:
    """Résultat standardisé retourné par tout Investigator."""
    findings: dict = field(default_factory=dict)  # Données brutes (comptes trouvés, breaches, etc.)
    source: str = "Unknown"
    confidence: int = 0  # Score de fiabilité des findings (0-100)


# ============================================================
# Classes abstraites (contrats d'entrée)
# ============================================================

class BaseFinder(ABC):
    """
    Contrat pour tous les Finders (Hunter, Tomba, Snov, Dropcontact...).
    
    Un Finder reçoit (prénom, nom, domaine) et retourne un FinderResult.
    Il ne fait RIEN d'autre : pas de nettoyage, pas de scoring.
    """
    name: str = "BaseFinder"
    env_key: str = ""  # Nom de la variable d'environnement pour la clé API

    def is_available(self) -> bool:
        """Vérifie si la clé API est configurée dans l'environnement."""
        if not self.env_key:
            return True  # Outils open source sans clé API
        return bool(os.getenv(self.env_key))

    @abstractmethod
    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        """Recherche un email professionnel. Doit gérer ses propres erreurs réseau."""
        ...

    def _safe_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """
        Wrapper HTTP partagé avec gestion automatique des quotas.
        Lève QuotaExceededError sur 401/403/429.
        """
        kwargs.setdefault("timeout", 10)
        try:
            resp = getattr(requests, method)(url, **kwargs)
        except requests.exceptions.RequestException as e:
            raise QuotaExceededError(f"{self.name}: Erreur réseau — {e}")

        if resp.status_code in (401, 403, 429):
            raise QuotaExceededError(f"{self.name}: HTTP {resp.status_code}")
        return resp


class BaseVerifier(ABC):
    """
    Contrat pour tous les Verifiers (ZeroBounce, AbstractAPI, Email-Checker...).
    
    Un Verifier reçoit un email et retourne un VerifierResult.
    """
    name: str = "BaseVerifier"
    env_key: str = ""

    def is_available(self) -> bool:
        if not self.env_key:
            return True
        return bool(os.getenv(self.env_key))

    @abstractmethod
    def verify(self, email: str) -> VerifierResult:
        """Vérifie le statut technique d'un email (SMTP, réputation)."""
        ...

    def _safe_request(self, method: str, url: str, **kwargs) -> requests.Response:
        kwargs.setdefault("timeout", 10)
        try:
            resp = getattr(requests, method)(url, **kwargs)
        except requests.exceptions.RequestException as e:
            raise QuotaExceededError(f"{self.name}: Erreur réseau — {e}")
        if resp.status_code in (401, 403, 429):
            raise QuotaExceededError(f"{self.name}: HTTP {resp.status_code}")
        return resp


class BaseInvestigator(ABC):
    """
    Contrat pour tous les Investigators (Epieos, h8mail, EmailRep, phonebook...).
    
    Un Investigator reçoit un email et retourne un InvestigatorResult 
    contenant les empreintes numériques découvertes.
    """
    name: str = "BaseInvestigator"
    env_key: str = ""

    def is_available(self) -> bool:
        if not self.env_key:
            return True
        return bool(os.getenv(self.env_key))

    @abstractmethod
    def investigate(self, email: str) -> InvestigatorResult:
        """Collecte l'empreinte numérique associée à un email."""
        ...

    def _safe_request(self, method: str, url: str, **kwargs) -> requests.Response:
        kwargs.setdefault("timeout", 10)
        try:
            resp = getattr(requests, method)(url, **kwargs)
        except requests.exceptions.RequestException as e:
            raise QuotaExceededError(f"{self.name}: Erreur réseau — {e}")
        if resp.status_code in (401, 403, 429):
            raise QuotaExceededError(f"{self.name}: HTTP {resp.status_code}")
        return resp
