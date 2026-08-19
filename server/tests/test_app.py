import os
import pytest
import tempfile

# Set temporary DB path before importing server modules
db_file = tempfile.NamedTemporaryFile(delete=False)
os.environ["DB_PATH"] = db_file.name
os.environ["SECRET_KEY"] = "test-secret-key-12345"

import database
from app import app, socketio

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["WTF_CSRF_ENABLED"] = False
    with app.test_client() as client:
        yield client

def test_database_register_and_login():
    ok, msg = database.register("testuser", "password123", 123456)
    assert ok is True

    # Duplicate registration
    ok_dup, msg_dup = database.register("testuser", "password123", 123456)
    assert ok_dup is False

    # Check valid login
    assert database.check_login("testuser", "password123") is True
    # Check invalid login
    assert database.check_login("testuser", "wrongpassword") is False

def test_profile_update():
    database.register("artist_user", "password123", 999)
    profile = database.get_profile("artist_user")
    assert profile is not None
    assert profile["nickname"] == "artist_user"

    # Test valid update
    res = database.update_profile("artist_user", {"bio": "Hello world", "profile_type": "beatmaker"})
    assert res is True
    updated = database.get_profile("artist_user")
    assert updated["bio"] == "Hello world"
    assert updated["profile_type"] == "beatmaker"

    # Test invalid profile_type
    res_bad = database.update_profile("artist_user", {"profile_type": "hacker"})
    assert res_bad is False

def test_chat_routes(client):
    # Unauthenticated redirect to login
    response = client.get("/chat")
    assert response.status_code == 302
    assert "/login" in response.headers["Location"]

    # Login post
    database.register("webuser", "secretpass", 777)
    login_res = client.post("/login", data={"nickname": "webuser", "password": "secretpass"})
    assert login_res.status_code == 302
    assert "/chat" in login_res.headers["Location"]

    # Access chat authenticated
    chat_res = client.get("/chat")
    assert chat_res.status_code == 200
    assert b"webuser" in chat_res.data

def test_socketio_messaging(client):
    database.register("user_a", "pass_a", 101)
    database.register("user_b", "pass_b", 102)

    # Login user_a in flask test client
    client.post("/login", data={"nickname": "user_a", "password": "pass_a"})
    client_a = socketio.test_client(app, flask_test_client=client)

    # Create another client for user_b
    with app.test_client() as client_b_flask:
        client_b_flask.post("/login", data={"nickname": "user_b", "password": "pass_b"})
        client_b = socketio.test_client(app, flask_test_client=client_b_flask)

        # Public message
        client_a.emit("public", {"text": "Hello public"})
        received_b = client_b.get_received()

        pub_msgs_b = [m for m in received_b if m["name"] == "msg"]
        assert len(pub_msgs_b) > 0
        assert pub_msgs_b[0]["args"][0]["text"] == "Hello public"

        # Private message from user_a to user_b
        client_a.emit("private", {"to": "user_b", "text": "Secret message"})
        rec_b_priv = client_b.get_received()

        priv_msgs_b = [m for m in rec_b_priv if m["name"] == "private"]
        assert len(priv_msgs_b) > 0
        assert priv_msgs_b[0]["args"][0]["text"] == "Secret message"

        client_a.disconnect()
        client_b.disconnect()
