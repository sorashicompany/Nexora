import os
from datetime import timedelta
from functools import wraps

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv

from database import check_login, save_msg, public_history, private_history, get_profile, update_profile

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
if not app.secret_key:
    raise RuntimeError("SECRET_KEY не задан. Создайте .env по образцу .env.example")

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = None
try:
    import redis
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
except Exception:
    redis_client = None

if redis_client:
    app.config.update(
        SESSION_TYPE="redis",
        SESSION_REDIS=redis_client,
        SESSION_USE_SIGNER=True,
        SESSION_KEY_PREFIX="sess:",
    )
else:
    app.config.update(
        SESSION_TYPE="filesystem",
        SESSION_FILE_DIR=os.path.join(app.instance_path, "sessions"),
        SESSION_FILE_THRESHOLD=500,
    )

app.config.update(
    SESSION_PERMANENT=True,
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.getenv("COOKIE_SECURE", "0") == "1",
)
os.makedirs(app.instance_path, exist_ok=True)
Session(app)

socketio_kwargs = dict(
    cors_allowed_origins=os.getenv("CORS_ORIGINS", "*"),
    async_mode="threading",
)
if redis_client:
    socketio_kwargs["message_queue"] = REDIS_URL
socketio = SocketIO(app, **socketio_kwargs)

ONLINE = "msg:online"
NICKS = "msg:nicks"
MEM_ONLINE = {}
MEM_NICKS = set()

COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#06b6d4",
          "#3b82f6","#6366f1","#8b5cf6","#d946ef","#ec4899"]

def color(name):
    return COLORS[sum(map(ord, name)) % len(COLORS)]

def online_list():
    if redis_client:
        names = sorted(redis_client.smembers(NICKS))
    else:
        names = sorted(MEM_NICKS)
    return [{"name": n, "color": color(n)} for n in names]

def add_online(sid, nick):
    if redis_client:
        redis_client.hset(ONLINE, sid, nick)
        redis_client.sadd(NICKS, nick)
    else:
        MEM_ONLINE[sid] = nick
        MEM_NICKS.add(nick)

def remove_online(sid):
    if redis_client:
        nick = redis_client.hget(ONLINE, sid)
        if not nick:
            return None
        redis_client.hdel(ONLINE, sid)
        if nick not in redis_client.hvals(ONLINE):
            redis_client.srem(NICKS, nick)
        return nick
    nick = MEM_ONLINE.pop(sid, None)
    if nick and nick not in MEM_ONLINE.values():
        MEM_NICKS.discard(nick)
    return nick

def online_sids_for(nick):
    if redis_client:
        return [sid for sid, name in redis_client.hgetall(ONLINE).items() if name == nick]
    return [sid for sid, name in MEM_ONLINE.items() if name == nick]

@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if request.path.startswith("/static/"):
        response.headers["Cache-Control"] = "public, max-age=604800, stale-while-revalidate=86400"
    return response

@app.route("/")
def index():
    return redirect(url_for("chat" if "nick" in session else "login"))

@app.route("/health")
def health():
    return jsonify(status="ok", redis=bool(redis_client))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        nick = request.form.get("nickname", "").strip()
        pwd = request.form.get("password", "")
        if check_login(nick, pwd):
            session.clear()
            session["nick"] = nick
            session.permanent = True
            return redirect(url_for("chat"))
        return render_template("login.html", error="Неверный логин или пароль")
    return render_template("login.html")

@app.route("/chat")
def chat():
    if "nick" not in session:
        return redirect(url_for("login"))
    return render_template("chat.html", nick=session["nick"], profile=get_profile(session["nick"]) or {"profile_type":"artist"})

@app.route("/api/profile", methods=["GET", "POST"])
def profile_api():
    nick = session.get("nick")
    if not nick:
        return jsonify(error="unauthorized"), 401
    if request.method == "GET":
        return jsonify(get_profile(nick) or {})
    data = request.get_json(silent=True) or {}
    if not update_profile(nick, data):
        return jsonify(error="invalid profile type"), 400
    return jsonify(get_profile(nick) or {})

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@socketio.on("connect")
def on_connect():
    nick = session.get("nick")
    if not nick:
        return False
    add_online(request.sid, nick)
    join_room("public")
    join_room(f"user:{nick}")

    # История загружается отдельным событием после первого paint.
    # Это позволяет мгновенно показать интерфейс и не нагружать первое подключение.
    emit("system", {"text": f"{nick} вошёл"}, room="public", include_self=False)
    emit("users", online_list(), room="public")

@socketio.on("disconnect")
def on_disconnect():
    nick = remove_online(request.sid)
    if nick:
        emit("system", {"text": f"{nick} вышел"}, room="public")
        emit("users", online_list(), room="public")

@socketio.on("history_public")
def on_history_public():
    nick = session.get("nick")
    if not nick:
        return
    for m in public_history(limit=40):
        emit("msg", {
            "user": m["sender"], "text": m["text"],
            "time": (m["created_at"] or "")[11:16],
            "color": color(m["sender"]), "hist": True
        })

@socketio.on("typing")
def on_typing(data):
    if not isinstance(data, dict):
        return
    nick = session.get("nick")
    to = (data.get("to") or "").strip()
    active = bool(data.get("active"))
    if not nick or not to or to == "public":
        return
    emit("typing", {"user": nick, "active": active}, room=f"user:{to}")

@socketio.on("public")
def on_public(data):
    if not isinstance(data, dict):
        return
    nick = session.get("nick")
    text = (data.get("text") or "").strip()[:4000]
    if not (nick and text):
        return
    save_msg(nick, text)
    emit("msg", {"user": nick, "text": text, "color": color(nick)}, room="public")

@socketio.on("private")
def on_private(data):
    if not isinstance(data, dict):
        return
    nick = session.get("nick")
    text = (data.get("text") or "").strip()[:4000]
    to = (data.get("to") or "").strip()
    if not (nick and text and to) or to == nick:
        return

    save_msg(nick, text, to)
    payload = {
        "user": nick, "text": text, "to": to,
        "color": color(nick), "private": True
    }
    emit("private", payload, room=f"user:{nick}")
    if to != nick:
        emit("private", payload, room=f"user:{to}")

@socketio.on("history_private")
def on_history(data):
    if not isinstance(data, dict):
        return
    nick = session.get("nick")
    other = (data.get("user") or "").strip()
    if not (nick and other):
        return
    for m in private_history(nick, other, limit=40):
        emit("private", {
            "user": m["sender"], "text": m["text"],
            "to": other if m["sender"] == nick else nick,
            "time": str(m["created_at"] or "")[11:16],
            "color": color(m["sender"]), "private": True, "hist": True
        })

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"→ http://0.0.0.0:{port}")
    socketio.run(app, host="0.0.0.0", port=port, allow_unsafe_werkzeug=True)
