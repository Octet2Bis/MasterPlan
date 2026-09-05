# Politique de Sécurité & Conformité (SECURITY.md)

## 🛡️ Divulgation Responsable des Vulnérabilités
Si vous découvrez une faille de sécurité ou une exposition accidentelle dans ce référentiel, merci de **ne pas ouvrir d'issue publique**.
Veuillez contacter directement le mainteneur via son profil GitHub ou à l'adresse sécurisée indiquée dans les commits.

---

## 🔒 Gestion des Secrets & Variables d'Environnement
1. **Zéro Secret dans Git :** Aucun token d'API, mot de passe ou clé privée ne doit jamais être commité.
2. **Isolation `.secrets/` :** Tous les fichiers d'environnement (`.env`) sont strictement ignorés par le fichier `.gitignore` et isolés dans les sous-dossiers `.secrets/`.

---

## ⚖️ Conformité Réglementaire & RGPD (CNIL / UE)
* **Prospection B2B & Intérêt Légitime :** L'ensemble des activités d'acquisition et de prospection inter-entreprises menées via les outils de ce projet s'inscrit strictement dans le cadre de l'article 6.1.f du RGPD (Intérêt Légitime) et des recommandations de la CNIL pour la prospection B2B en France.
* **Absence de Données Sensibles :** Ce référentiel exclut tout scraping de données de fuites (breach data) ou d'informations personnelles non publiques. Tout traitement de contact professionnel intègre une option claire et immédiate d'opposition (opt-out).
