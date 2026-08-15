import hashlib
import logging
import os
import sqlite3
from pathlib import Path

from werkzeug.security import check_password_hash, generate_password_hash

DB = Path(os.getenv("DB_PATH", "data/messenger.db"))
DB.parent.mkdir(parents=True, exist_ok=True)
Path("logs").mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
    handlers=[logging.FileHandler("logs/messenger.log", encoding="utf-8"), logging.StreamHandler()]
)
log = logging.getLogger("db")

def db():
    c = sqlite3.connect(DB, timeout=10, check_same_thread=False)
    c.row_factory = sqlite3.Row
    return c

def init():
    with db() as c:
        c.executescript("""
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                nickname TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                telegram_id INTEGER UNIQUE,
                profile_type TEXT NOT NULL DEFAULT 'artist',
                bio TEXT DEFAULT '',
                avatar_url TEXT DEFAULT '',
                spotify_url TEXT DEFAULT '',
                apple_music_url TEXT DEFAULT '',
                youtube_url TEXT DEFAULT '',
                tiktok_url TEXT DEFAULT '',
                soundcloud_url TEXT DEFAULT '',
                beatchain_url TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                sender TEXT NOT NULL,
                recipient TEXT,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_messages_public ON messages(recipient, id);
            CREATE INDEX IF NOT EXISTS idx_messages_private ON messages(sender, recipient, id);
        """)
    # Lightweight migrations for existing installations.
    migrations = {
        "profile_type": "TEXT NOT NULL DEFAULT 'artist'",
        "bio": "TEXT DEFAULT ''",
        "avatar_url": "TEXT DEFAULT ''",
        "spotify_url": "TEXT DEFAULT ''",
        "apple_music_url": "TEXT DEFAULT ''",
        "youtube_url": "TEXT DEFAULT ''",
        "tiktok_url": "TEXT DEFAULT ''",
        "soundcloud_url": "TEXT DEFAULT ''",
        "beatchain_url": "TEXT DEFAULT ''",
    }
    with db() as c:
        existing = {row[1] for row in c.execute("PRAGMA table_info(users)").fetchall()}
        for name, spec in migrations.items():
            if name not in existing:
                c.execute(f"ALTER TABLE users ADD COLUMN {name} {spec}")
    log.info("DB ready")

def hash_pw(password):
    return generate_password_hash(password, method="scrypt")

def _legacy_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def register(nick, password, tg_id):
    if len(nick) < 3:
        return False, "Никнейм слишком короткий"
    if len(password) < 4:
        return False, "Пароль слишком короткий"
    try:
        with db() as c:
            c.execute(
                "INSERT INTO users (nickname, password_hash, telegram_id) VALUES (?,?,?)",
                (nick, hash_pw(password), tg_id)
            )
        log.info("Registered: %s", nick)
        return True, "Регистрация успешна! Можно входить."
    except sqlite3.IntegrityError:
        return False, "Никнейм или Telegram уже заняты"
    except Exception:
        log.exception("Registration failed")
        return False, "Ошибка сервера"

def check_login(nick, password):
    with db() as c:
        row = c.execute(
            "SELECT id, password_hash FROM users WHERE nickname=?",
            (nick,)
        ).fetchone()
        if not row:
            return False

        stored = row["password_hash"]
        ok = check_password_hash(stored, password) if stored.startswith(("scrypt:", "pbkdf2:")) else stored == _legacy_hash(password)
        if ok and not stored.startswith(("scrypt:", "pbkdf2:")):
            c.execute("UPDATE users SET password_hash=? WHERE id=?", (hash_pw(password), row["id"]))
        return ok

def get_by_tg(tg_id):
    with db() as c:
        return c.execute("SELECT * FROM users WHERE telegram_id=?", (tg_id,)).fetchone()

def get_profile(nick):
    with db() as c:
        row = c.execute("""SELECT nickname, profile_type, bio, avatar_url, spotify_url, apple_music_url, youtube_url, tiktok_url, soundcloud_url, beatchain_url FROM users WHERE nickname=?""", (nick,)).fetchone()
        return dict(row) if row else None

def update_profile(nick, data):
    allowed = ["profile_type", "bio", "avatar_url", "spotify_url", "apple_music_url", "youtube_url", "tiktok_url", "soundcloud_url", "beatchain_url"]
    clean = {k: str(data.get(k, "")).strip()[:1000] for k in allowed if k in data}
    if clean.get("profile_type") not in (None, "artist", "beatmaker"):
        return False
    if "profile_type" in clean and clean["profile_type"] == "artist":
        # Keep the URL if supplied, but don't force a BeatChain profile for artists.
        pass
    if not clean:
        return True
    sets = ", ".join(f"{k}=?" for k in clean)
    values = list(clean.values()) + [nick]
    with db() as c:
        c.execute(f"UPDATE users SET {sets} WHERE nickname=?", values)
    return True

def save_msg(sender, text, recipient=None):
    with db() as c:
        c.execute(
            "INSERT INTO messages (sender, recipient, text) VALUES (?,?,?)",
            (sender, recipient, text)
        )

def public_history(limit=40):
    with db() as c:
        rows = c.execute(
            "SELECT sender, text, created_at FROM messages WHERE recipient IS NULL ORDER BY id DESC LIMIT ?",
            (limit,)
        ).fetchall()
        return list(reversed(rows))

def private_history(u1, u2, limit=40):
    with db() as c:
        rows = c.execute(
            """SELECT sender, text, created_at FROM messages
               WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?)
               ORDER BY id DESC LIMIT ?""",
            (u1, u2, u2, u1, limit)
        ).fetchall()
        return list(reversed(rows))

init()
