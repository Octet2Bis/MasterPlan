"""
smtp_verifier.py — Validateur SMTP direct avec sonde Catch-All (100% Local / 0€ API).

Effectue une poignée de main SMTP sur le serveur MX de destination pour vérifier
l'existence réelle de la boîte mail sans envoyer d'email réel.
Intègre une sonde d'adresse aléatoire pour détecter les serveurs Catch-All (Accept-All).
"""

import smtplib
import socket
import secrets
from typing import Tuple
from toolbox.base_tool import BaseVerifier, VerifierResult
from toolbox.core.dns_check import get_mx_hosts


class SmtpVerifier(BaseVerifier):
    """
    Validateur technique direct via protocole SMTP (RFC 5321).
    0€ de coût, aucune clé requise.
    Détecte automatiquement si le port 25 sortant est bloqué par le FAI local.
    """
    name = "SmtpVerifier"
    env_key = ""  # 0 clé requise
    _connectivity_tested = False
    _port_25_available = False

    def __init__(self, timeout: float = 1.5, helo_host: str = "mail.antigravity.local"):
        self.timeout = timeout
        self.helo_host = helo_host

    def _test_global_connectivity(self) -> bool:
        """Vérifie une seule fois si le port 25 sortant est accessible depuis ce réseau."""
        if SmtpVerifier._connectivity_tested:
            return SmtpVerifier._port_25_available

        SmtpVerifier._connectivity_tested = True
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1.2)
            # Test de connexion sur un serveur MX public majeur
            res = sock.connect_ex(("alt1.gmail-smtp-in.l.google.com", 25))
            sock.close()
            SmtpVerifier._port_25_available = (res == 0)
        except Exception:
            SmtpVerifier._port_25_available = False

        if not SmtpVerifier._port_25_available:
            print("  [~] SmtpVerifier: Port 25 sortant bloqué par le réseau local (standard sur box FAI). Relais passé.")

        return SmtpVerifier._port_25_available

    def is_available(self) -> bool:
        return True

    def _probe_smtp(self, mx_host: str, target_email: str, domain: str) -> Tuple[str, int]:
        """
        Exécute la poignée de main SMTP et le test de boîte avec sonde Catch-All.
        Retourne (status, score).
        """
        server = None
        try:
            # 1. Connexion au serveur MX avec timeout strict
            server = smtplib.SMTP(host=mx_host, port=25, timeout=self.timeout)
            server.helo(self.helo_host)
            sender = f"probe@{self.helo_host}"

            # 2. Sonde Catch-All avec une adresse aléatoire quasi-impossible
            rand_suffix = secrets.token_hex(6)
            fake_email = f"antigravity_probe_{rand_suffix}@{domain}"

            server.mail(sender)
            code_fake, _ = server.rcpt(fake_email)

            is_catch_all = (code_fake == 250)

            # Réinitialiser la transaction SMTP
            server.rset()

            # 3. Test du véritable email cible
            server.mail(sender)
            code_target, msg_target = server.rcpt(target_email)

            if is_catch_all:
                if code_target == 250:
                    return "Catch-All", 75
                elif code_target in (550, 551, 552, 553, 554):
                    return "Invalid", 0
                return "Catch-All", 70
            else:
                # Serveur strict (Non Catch-All)
                if code_target == 250:
                    # Boîte confirmée existante par le serveur destinataire !
                    return "Valid", 98
                elif code_target in (550, 551, 553, 554):
                    # Boîte inexistante / Rejetée
                    return "Invalid", 0
                elif code_target in (450, 451, 452):
                    # Greylisting ou limitation temporaire
                    return "Risky", 55

            return "Not Verified", 50

        except (socket.timeout, socket.error, smtplib.SMTPException, OSError):
            return "Not Verified", 50
        finally:
            if server:
                try:
                    server.quit()
                except Exception:
                    try:
                        server.close()
                    except Exception:
                        pass

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        # Si le port 25 est bloqué sur cette machine/réseau, on ne perd pas de temps
        if not self._test_global_connectivity():
            return VerifierResult(status="Not Verified", score=50)

        email = email.strip().lower()
        domain = email.split("@")[-1]

        mx_hosts = get_mx_hosts(domain)
        if not mx_hosts:
            return VerifierResult(status="No_MX", score=0)

        # Tester le premier serveur MX disponible
        for mx in mx_hosts[:1]:
            status, score = self._probe_smtp(mx, email, domain)
            if status != "Not Verified":
                return VerifierResult(status=status, score=score)

        return VerifierResult(status="Not Verified", score=50)

