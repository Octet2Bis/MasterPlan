#!/usr/bin/env bash
# ==============================================================================
# MASTER PLAN — ORACLE CLOUD FREE TIER PROVISIONING SCRIPT (ARM64 Ubuntu)
# Pilier : 03_Developpement_App_and_Design / 04_Backend_and_Cloud
# Cible : Instance Ampere A1 (VM.Standard.A1.Flex) sous Ubuntu 22.04 / 24.04
# ==============================================================================
set -e

echo "============================================================"
echo "🚀 MASTER PLAN : PROVISIONING AUTOMATISÉ VM ORACLE CLOUD"
echo "============================================================"

# 1. Mise à jour du système de base
echo "📦 [1/6] Mise à jour des paquets Ubuntu..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential ufw fail2ban jq unzip ca-certificates gnupg

# 2. Poka-Yoke Pare-feu Oracle Cloud (Déblocage des règles iptables restrictives OCI)
echo "🛡️ [2/6] Configuration du Pare-feu (IPTABLES + UFW)..."
# Oracle Cloud applique par défaut une table iptables stricte qui bloque les ports 80/443/3000
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT || true
sudo netfilter-persistent save || true

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP Caddy/Nginx'
sudo ufw allow 443/tcp comment 'HTTPS Caddy/Nginx'
sudo ufw allow 3000/tcp comment 'Aevum Web Preview'
sudo ufw --force enable

# 3. Installation de Docker & Docker Compose
echo "🐳 [3/6] Installation du moteur Docker CE..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "✅ Docker installé avec succès."
else
    echo "✅ Docker déjà présent."
fi

# 4. Installation de Node.js 20 LTS (ARM64)
echo "🟢 [4/6] Installation de Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g pm2
    echo "✅ Node.js $(node -v) & PM2 installés."
else
    echo "✅ Node.js $(node -v) déjà présent."
fi

# 5. Installation de uv & Python 3.12
echo "⚡ [5/6] Installation du gestionnaire Python 'uv'..."
if ! command -v uv &> /dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo "✅ 'uv' installé avec succès."
else
    echo "✅ 'uv' déjà présent."
fi

# 6. Création de l'arborescence des services Master Plan
echo "📁 [6/6] Préparation du workspace des services 24/7..."
mkdir -p "$HOME/master-plan-runtime/logs"
mkdir -p "$HOME/master-plan-runtime/data"

cat << 'EOF' > "$HOME/master-plan-runtime/status.sh"
#!/usr/bin/env bash
echo "=== ÉTAT DU SERVEUR AGENTS ORACLE ==="
echo "Date: $(date -u)"
echo "Uptime: $(uptime -p)"
echo "Mémoire: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disque: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"
echo "Docker: $(sudo docker ps -q | wc -l) conteneur(s) actif(s)"
echo "PM2: $(pm2 jlist 2>/dev/null | jq '. | length' || echo '0') processus géré(s)"
echo "======================================"
EOF
chmod +x "$HOME/master-plan-runtime/status.sh"

echo ""
echo "============================================================"
echo "🎉 PROVISIONING TERMINÉ AVEC SUCCÈS !"
echo "Exécutez 'source ~/.bashrc' pour actualiser votre session."
echo "Testez l'état via : ~/master-plan-runtime/status.sh"
echo "============================================================"
