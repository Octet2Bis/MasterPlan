#!/bin/bash
echo "============================================================"
echo "🎯 DEMARRAGE D'OUTBOUND SNIPER STUDIO (macOS / Linux)"
echo "============================================================"

# 1. Verification de Node.js
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installe."
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# 2. Lancement du serveur Node.js en arriere-plan
echo "[INFO] Demarrage du serveur local sur le port 3500..."
node server.js &
SERVER_PID=$!

# 3. Attente 2s
sleep 2

# 4. Ouverture dans le navigateur
if which xdg-open > /dev/null; then
    xdg-open http://localhost:3500
elif which open > /dev/null; then
    open http://localhost:3500
fi

echo "[SUCCES] L'application est active sur : http://localhost:3500 (PID: $SERVER_PID)"
wait $SERVER_PID
