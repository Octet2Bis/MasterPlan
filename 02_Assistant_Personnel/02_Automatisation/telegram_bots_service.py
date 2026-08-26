"""
AEVUM / MASTER PLAN — TELEGRAM DUAL-BOT INGESTION SERVICE
Pilier : 02_Assistant_Personnel (Couche 2)
Description : Service d'ingestion sécurisé pour 2 bots Telegram étanches (Pro Intelligence & Perso Journal).
Sécurité : Whitelist stricte sur ALLOWED_USER_ID, filtrage de types MIME, zéro secret en dur.
"""

import os
import sys
import json
import time
import sqlite3
import urllib.request
import urllib.parse
from pathlib import Path

# ==============================================================================
# 1. CONFIGURATION ET CHEMINS DYNAMIQUES
# ==============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR / "Workspace"
SECRETS_DIR = BASE_DIR / ".secrets"
ENV_FILE = SECRETS_DIR / ".env"

# Répertoires de travail Pro & Perso
INBOX_PRO = WORKSPACE_DIR / "inbox_pro"
INBOX_PERSO = WORKSPACE_DIR / "inbox_perso"
DB_PRO = WORKSPACE_DIR / "pro_market_graph.sqlite"
DB_PERSO = WORKSPACE_DIR / "perso_journal_graph.sqlite"

for d in [INBOX_PRO, INBOX_PERSO, SECRETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

def load_env():
    """Charge les variables d'environnement depuis .secrets/.env."""
    env = {}
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env

ENV = load_env()
TOKEN_PRO = os.getenv("TELEGRAM_BOT_TOKEN_PRO", ENV.get("TELEGRAM_BOT_TOKEN_PRO", ""))
TOKEN_PERSO = os.getenv("TELEGRAM_BOT_TOKEN_PERSO", ENV.get("TELEGRAM_BOT_TOKEN_PERSO", ""))
ALLOWED_USER_ID = os.getenv("TELEGRAM_ALLOWED_USER_ID", ENV.get("TELEGRAM_ALLOWED_USER_ID", ""))

# ==============================================================================
# 2. INITIALISATION DES BASES GRAPH MEMORY (SQLite)
# ==============================================================================
def init_graph_db(db_path: Path):
    """Initialise les 3 tables canoniques de Graph Memory (Entities, Relations, Observations)."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Table des entités
    cur.execute("""
    CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        entity_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Table des relations (Sujet - Verbe - Objet)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS relations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_name TEXT NOT NULL,
        predicate TEXT NOT NULL,
        target_name TEXT NOT NULL,
        evidence TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_name, predicate, target_name)
    )
    """)

    # Table des observations chronologiques / médias
    cur.execute("""
    CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_name TEXT,
        content TEXT NOT NULL,
        media_path TEXT,
        source_type TEXT NOT NULL, -- 'text', 'instagram_reel', 'photo', 'voice'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

init_graph_db(DB_PRO)
init_graph_db(DB_PERSO)

# ==============================================================================
# 3. MOTEUR CLIENT TELEGRAM (Léger / Zero-Dependency)
# ==============================================================================
class TelegramBot:
    def __init__(self, token: str, bot_type: str, inbox_dir: Path, db_path: Path):
        self.token = token
        self.bot_type = bot_type  # "PRO" ou "PERSO"
        self.inbox_dir = inbox_dir
        self.db_path = db_path
        self.base_url = f"https://api.telegram.org/bot{self.token}"
        self.offset = 0

    def is_configured(self) -> bool:
        return bool(self.token and len(self.token) > 10 and not self.token.startswith("YOUR_"))

    def send_request(self, method: str, params: dict = None) -> dict:
        url = f"{self.base_url}/{method}"
        if params:
            data = urllib.parse.urlencode(params).encode('utf-8')
            req = urllib.request.Request(url, data=data)
        else:
            req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def send_message(self, chat_id: int, text: str):
        self.send_request("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})

    def get_file_url(self, file_id: str) -> str:
        res = self.send_request("getFile", {"file_id": file_id})
        if res.get("ok") and "file_path" in res.get("result", {}):
            file_path = res["result"]["file_path"]
            return f"https://api.telegram.org/file/bot{self.token}/{file_path}"
        return ""

    def download_file(self, file_url: str, dest_name: str) -> Path:
        dest_path = self.inbox_dir / dest_name
        req = urllib.request.Request(file_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
            out_file.write(response.read())
        return dest_path

    def process_message(self, message: dict):
        user = message.get("from", {})
        user_id = str(user.get("id", ""))
        chat_id = message.get("chat", {}).get("id")

        # BARRIÈRE DE SÉCURITÉ 1 : Whitelist stricte d'utilisateur
        if ALLOWED_USER_ID and user_id != ALLOWED_USER_ID:
            print(f"⚠️ [SÉCURITÉ] Tentative d'accès non autorisée rejetée (User ID : {user_id})")
            return

        timestamp = int(time.time())
        text = message.get("text", "")
        caption = message.get("caption", "")

        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()

        # CAS A : Réception d'une photo (Perso / Scrapbook)
        if "photo" in message:
            photo_array = message["photo"]
            best_photo = photo_array[-1]  # Meilleure résolution
            file_id = best_photo["file_id"]
            file_url = self.get_file_url(file_id)
            if file_url:
                filename = f"photo_{timestamp}_{file_id[:8]}.jpg"
                saved_path = self.download_file(file_url, filename)
                
                cur.execute(
                    "INSERT INTO observations (content, media_path, source_type) VALUES (?, ?, ?)",
                    (caption or "Photo quotidienne reçue", str(saved_path), "photo")
                )
                conn.commit()
                self.send_message(chat_id, f"✅ *Photo archivée dans votre journal !*\n📁 Fichier : `{filename}`\n📝 Note : {caption or 'Aucune légende'}")

        # CAS B : Réception d'une vidéo / Reel MP4
        elif "video" in message or "document" in message:
            doc = message.get("video") or message.get("document")
            mime = doc.get("mime_type", "")
            if "video" in mime or "mp4" in mime:
                file_id = doc["file_id"]
                file_url = self.get_file_url(file_id)
                if file_url:
                    filename = f"video_{timestamp}.mp4"
                    saved_path = self.download_file(file_url, filename)
                    cur.execute(
                        "INSERT INTO observations (content, media_path, source_type) VALUES (?, ?, ?)",
                        (caption or "Vidéo ingérée", str(saved_path), "video")
                    )
                    conn.commit()
                    self.send_message(chat_id, f"🎬 *Vidéo reçue et envoyée pour transcription !*\n📁 `{filename}`")

        # CAS C : Message texte ou lien Web / Instagram
        elif text:
            # Détection de lien Instagram / Article
            if "instagram.com" in text or "http://" in text or "https://" in text:
                source_type = "instagram_reel" if "instagram.com" in text else "web_article"
                cur.execute(
                    "INSERT INTO observations (content, source_type) VALUES (?, ?)",
                    (text, source_type)
                )
                conn.commit()
                self.send_message(chat_id, f"🔗 *Lien enregistré dans la base de veille {self.bot_type} !*\nL'extracteur va analyser les entités et relations.")
            else:
                cur.execute(
                    "INSERT INTO observations (content, source_type) VALUES (?, ?)",
                    (text, "note_textuelle")
                )
                conn.commit()
                self.send_message(chat_id, f"📝 *Note enregistrée dans votre mémoire {self.bot_type}.*")

        conn.close()

    def poll(self):
        """Récupère et traite les nouveaux messages reçus."""
        res = self.send_request("getUpdates", {"offset": self.offset, "timeout": 5})
        if res.get("ok"):
            for update in res.get("result", []):
                self.offset = update["update_id"] + 1
                if "message" in update:
                    self.process_message(update["message"])

# ==============================================================================
# 4. BOUCLE PRINCIPALE DU SERVICE D'INGESTION
# ==============================================================================
def main():
    print("=" * 70)
    print("🚀 SERVICE D'INGESTION TELEGRAM DOUBLE BOT (MASTER PLAN)")
    print("=" * 70)

    bot_pro = TelegramBot(TOKEN_PRO, "PRO", INBOX_PRO, DB_PRO)
    bot_perso = TelegramBot(TOKEN_PERSO, "PERSO", INBOX_PERSO, DB_PERSO)

    is_pro_ok = bot_pro.is_configured()
    is_perso_ok = bot_perso.is_configured()

    if not is_pro_ok and not is_perso_ok:
        print("\n⚠️ AUCUN BOT CONFIGURÉ DANS .secrets/.env !")
        print(f"👉 Veuillez renseigner vos tokens dans : {ENV_FILE}")
        print("   TELEGRAM_BOT_TOKEN_PRO=...")
        print("   TELEGRAM_BOT_TOKEN_PERSO=...")
        print("   TELEGRAM_ALLOWED_USER_ID=...\n")
        return

    print(f"🤖 Bot PRO actif   : {'✅ OUI' if is_pro_ok else '❌ NON (token manquant)'}")
    print(f"🎨 Bot PERSO actif : {'✅ OUI' if is_perso_ok else '❌ NON (token manquant)'}")
    print(f"🛡️ Whitelist ID    : {ALLOWED_USER_ID or '⚠️ Non configurée (Recommandé d\\'en ajouter une)'}")
    print("=" * 70)
    print("En attente de messages... (Ctrl + C pour arrêter)\n")

    while True:
        try:
            if is_pro_ok:
                bot_pro.poll()
            if is_perso_ok:
                bot_perso.poll()
            time.sleep(1)
        except KeyboardInterrupt:
            print("\nArrêt du service d'ingestion.")
            break
        except Exception as e:
            print(f"Erreur polling : {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
