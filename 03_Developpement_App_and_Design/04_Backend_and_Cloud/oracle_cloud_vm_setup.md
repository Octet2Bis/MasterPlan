# ☁️ Guide Opérationnel : Configuration de la VM Oracle Cloud Free Tier (24/7 Agents)

Ce guide détaille pas-à-pas la création, la sécurisation et le provisioning de l'instance cloud Always Free d'Oracle pour y exécuter les agents autonomes du Master Plan en continu.

---

## 💎 1. Spécifications & Quotas Always Free

Oracle Cloud offre gratuitement à vie (*Always Free Eligible*) :
- **Architecture :** Ampere Altra ARM64 (`VM.Standard.A1.Flex`)
- **Puissance :** Jusqu'à **4 cœurs OCPU** et **24 Go de RAM** (fractionnable en 1 ou 2 VMs).
- **Stockage :** 200 Go de volume bloc haute vitesse.
- **Réseau :** 1 Adresse IPv4 publique fixe + 10 To de trafic sortant par mois.
- **OS Recommandé :** **Canonical Ubuntu 24.04 LTS (aarch64)** ou **Ubuntu 22.04 LTS**.

---

## 🔑 2. Votre Clé SSH Dédiée (Déjà Générée)

Votre paire de clés SSH a été générée localement sur votre machine Windows dans `C:\Users\HP\.ssh\oracle_arm_key`.

Voici votre **Clé Publique** à coller dans la console Oracle :
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH4NC2uqDs9R6iUqtPHMJMZS+vsep1mDSsUDRtY53qBa oracle-master-plan
```

---

## 🖥️ 3. Étape par Étape dans la Console Oracle Cloud (OCI)

### A. Lancer la création de l'instance
1. Connectez-vous sur [cloud.oracle.com](https://cloud.oracle.com).
2. Ouvrez le menu de navigation (☰ en haut à gauche) ➔ **Compute (Calcul)** ➔ **Instances**.
3. Cliquez sur le bouton bleu **Create instance (Créer une instance)**.

---

### B. Paramétrer l'Instance

1. **Name (Nom) :**  
   Entrez : `master-plan-agents`

2. **Placement (Domaine de disponibilité) :**  
   Laissez le domaine par défaut (ex: `AD-1`).

3. **Image and shape (Image et Forme) :**  
   * Cliquez sur **Change shape (Modifier la forme)** :
     * Sélectionnez **Ampere** (Architecture ARM).
     * Cochez la forme `VM.Standard.A1.Flex` *(Taguée "Always Free Eligible")*.
     * Allouez les ressources :
       * **OCPU :** `2` ou `4` cœurs.
       * **Mémoire :** `12` ou `24` Go de RAM.
     * Cliquez sur **Select shape**.
   * Vérifiez l'Image : **Canonical Ubuntu 24.04** ou **Ubuntu 22.04** (Architecture `aarch64`).

4. **Networking (Mise en réseau) :**  
   * Laissez l'option **Create new virtual cloud network** (Créer un réseau cloud virtuel) si vous n'en avez pas encore, ou sélectionnez votre VCN existant.
   * Assurez-vous que la case **Assign a public IPv4 address (Assigner une adresse IPv4 publique)** est cochée sur **Yes**.

5. **Add SSH keys (Ajouter des clés SSH) :**  
   * Cochez **Paste public keys (Coller les clés publiques)**.
   * Collez exactement la ligne suivante :
     ```text
     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH4NC2uqDs9R6iUqtPHMJMZS+vsep1mDSsUDRtY53qBa oracle-master-plan
     ```

6. **Boot volume (Volume d'amorçage) :**  
   * Laissez la taille par défaut (47 Go) ou cochez la personnalisation pour allouer **100 Go** (le plafond gratuit étant de 200 Go au total).

7. Cliquez sur **Create (Créer)** en bas de page.
   * L'instance passe en statut **Provisioning (Orange)**, puis en **Running (Vert)** en environ 60 secondes.
   * Notez l'**Adresse IP Publique** affichée sur la fiche de l'instance.

---

## 🌐 4. Ouverture des Ports Réseau (Security List OCI)

Pour que la VM puisse être jointe en SSH et héberger des services web (simulateurs ou webhooks) :
1. Sur la page de votre instance, dans la section **Instance access**, cliquez sur le lien du **Subnet (Sous-réseau)** public.
2. Cliquez sur votre **Default Security List for...**.
3. Dans la table **Ingress Rules (Règles entrantes)**, vérifiez et ajoutez si nécessaire :
   * **Port 22 (SSH) :** Déjà présent par défaut (`0.0.0.0/0`, TCP, Port 22).
   * **Port 80 (HTTP) & 443 (HTTPS) :**
     * Source CIDR : `0.0.0.0/0`
     * IP Protocol : `TCP`
     * Destination Port Range : `80,443`
   * **Port 3000 (Aevum Simulator / Previews) :**
     * Source CIDR : `0.0.0.0/0`
     * IP Protocol : `TCP`
     * Destination Port Range : `3000`

---

## 💻 5. Première Connexion SSH depuis Windows

Ouvrez un terminal PowerShell sur votre PC et lancez la connexion :
```powershell
ssh -i "C:\Users\HP\.ssh\oracle_arm_key" ubuntu@<VOTRE_IP_PUBLIQUE>
```
*(Remplacez `<VOTRE_IP_PUBLIQUE>` par l'IP affichée dans la console OCI. Tapez `yes` lors du premier avertissement d'empreinte hôte).*

---

## 🚀 6. Provisioning Automatique des Outils & Agents

Une fois connecté sur votre VM Ubuntu, téléchargez et exécutez le script de provisioning automatisé préparé dans le Master Plan :

```bash
# Télécharger et lancer le provisioning
curl -fsSL https://raw.githubusercontent.com/.../setup_oracle_vm.sh -o setup_oracle_vm.sh || nano setup_oracle_vm.sh
bash setup_oracle_vm.sh
```

Ce script configure automatiquement :
- Le déblocage du pare-feu `iptables` restrictif d'Oracle + `UFW`.
- Le moteur **Docker CE** et **Docker Compose**.
- Le runtime **Node.js 20 LTS** & le gestionnaire de processus **PM2**.
- L'environnement Python 3.12 avec **`uv`**.
- L'espace de travail `~/master-plan-runtime/` pour exécuter vos bots Telegram et agents 24/7.
