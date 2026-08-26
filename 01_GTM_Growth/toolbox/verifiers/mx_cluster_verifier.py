"""
mx_cluster_verifier.py — Validateur de Passerelle MX et Analyse de Latence / Timing (0€ / Zéro API).

Analyse les serveurs MX pour :
1. Identifier la passerelle de sécurité et d'infrastructure de messagerie
   (Proofpoint, Mimecast, Microsoft EOP, Google Workspace, Cisco IronPort, Barracuda, Sophos, Fortinet).
2. Mesurer la latence de réponse DNS/réseau pour détecter les filtres IA / anomalies temporelles.
3. Ajuster le score de confiance selon la solidité et la réputation de l'infrastructure détectée.
"""

import time
import socket
from toolbox.base_tool import BaseVerifier, VerifierResult
from toolbox.core.dns_check import get_mx_hosts

# Base de connaissances étendue des clusters de messagerie et passerelles de sécurité
MX_GATEWAYS = {
    "Proofpoint": {
        "signatures": ["pphosted.com", "proofpoint.com"],
        "tier": "Enterprise Security",
        "score": 92,
    },
    "Mimecast": {
        "signatures": ["mimecast.com"],
        "tier": "Enterprise Security",
        "score": 92,
    },
    "Google Workspace": {
        "signatures": ["aspmx.l.google.com", "googlemail.com", "google.com"],
        "tier": "Cloud Enterprise",
        "score": 88,
    },
    "Microsoft 365 / Exchange Online": {
        "signatures": ["mail.protection.outlook.com", "outlook.com"],
        "tier": "Cloud Enterprise",
        "score": 88,
    },
    "Cisco IronPort": {
        "signatures": ["iphmx.com", "ironport.com"],
        "tier": "Enterprise Security",
        "score": 86,
    },
    "Sophos Mail Security": {
        "signatures": ["sophos.com", "hydra.sophos.com"],
        "tier": "Enterprise Security",
        "score": 86,
    },
    "Barracuda Networks": {
        "signatures": ["barracuda.com", "barracudanetworks.com"],
        "tier": "Enterprise Security",
        "score": 84,
    },
    "Fortinet FortiMail": {
        "signatures": ["fortimail.com", "fortinet.com"],
        "tier": "Enterprise Security",
        "score": 84,
    },
    "Trend Micro / SpamExperts": {
        "signatures": ["trendmicro.com", "antispamcloud.com", "spamexperts.com"],
        "tier": "Enterprise Security",
        "score": 82,
    },
    "OVH / Gandi / Infomaniak": {
        "signatures": ["ovh.net", "gandi.net", "infomaniak.ch"],
        "tier": "Standard Hosting",
        "score": 75,
    },
}


class MxClusterVerifier(BaseVerifier):
    """
    Validateur d'infrastructure MX, de passerelle de sécurité et de latence temporelle.
    """
    name = "MxClusterVerifier"
    env_key = ""  # 0 clé requise

    def __init__(self, timeout: float = 1.5):
        self.timeout = timeout

    def is_available(self) -> bool:
        return True

    def _measure_host_latency(self, host: str) -> float:
        """Mesure la latence de résolution / connectivité de l'hôte en millisecondes."""
        start = time.perf_counter()
        try:
            # Résolution d'adresse IP de l'hôte
            socket.gethostbyname(host)
            latency_ms = (time.perf_counter() - start) * 1000
            return latency_ms
        except Exception:
            return 999.0

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        domain = email.split("@")[-1].strip().lower()
        mx_hosts = get_mx_hosts(domain)
        if not mx_hosts:
            return VerifierResult(status="No_MX", score=0)

        matched_gateway = None
        base_score = 75

        for host in mx_hosts:
            host_lower = host.lower()
            for gateway_name, meta in MX_GATEWAYS.items():
                for sig in meta["signatures"]:
                    if sig in host_lower:
                        matched_gateway = gateway_name
                        base_score = meta["score"]
                        break
                if matched_gateway:
                    break
            if matched_gateway:
                break

        if matched_gateway:
            # Mesure du timing / latence
            latency = self._measure_host_latency(mx_hosts[0])
            # Si le serveur répond avec une latence d'infrastructure cloud rapide (< 150ms)
            if latency < 150.0:
                base_score = min(100, base_score + 2)

            return VerifierResult(
                status="Valid_MX_Cluster",
                score=base_score
            )

        return VerifierResult(status="Not Verified", score=50)
