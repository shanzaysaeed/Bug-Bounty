from enum import Enum
from redis_lib import redis_client
import secrets
import time

IDLE_TIMEOUT = 30 * 60  # 30 minutes
ABSOLUTE_TIMEOUT = 8 * 60 * 60  # 8 hours
SHORT_TIMEOUT = 5 * 60  # 5 minutes, time to wait for MFA code
MIN_REFRESH_INTERVAL = 30  # 30 seconds

class SessionAuthStage(Enum):
    PASSWORD = 0
    MFA = 1

def generate_session_id(length=32) -> str:
    return secrets.token_urlsafe(length)

def generate_csrf_token(length=32) -> str:
    return secrets.token_urlsafe(length)

def get_session_key(session_id: str) -> str:
    return f"session:{session_id}"

class TooManyRequestsError(Exception):
    pass

def set_session_pending_mfa(user_id: int):
    """
    Set the session auth stage to pending MFA
    Returns the session ID
    """
    # remove any existing session if it exists
    session_id_b: bytes = redis_client.get(f"user:{user_id}:session")
    if session_id_b:
        session_id = session_id_b.decode('utf-8')
        key = get_session_key(session_id)
        session = get_and_decode(key)
        if session and float(session["created_at"]) + MIN_REFRESH_INTERVAL > time.time():
            raise TooManyRequestsError("Please wait before refreshing your session")
        print("Existing session", session_id)
        delete_session(session_id)

    session_id = generate_session_id()
    key = get_session_key(session_id)
    val = {
        "user_id": user_id,
        "auth_stage": SessionAuthStage.PASSWORD.name,
        "created_at": time.time(),
        "last_active": time.time(),
        "csrf_token": generate_csrf_token(),
    }
    redis_client.hset(key, mapping=val)
    redis_client.expire(key, SHORT_TIMEOUT)

    redis_client.set(f"user:{user_id}:session", session_id)
    redis_client.expire(f"user:{user_id}:session", ABSOLUTE_TIMEOUT)
    return session_id

def get_and_decode(key: str) -> dict:
    session: dict[bytes, bytes] = redis_client.hgetall(key)
    return {k.decode('utf-8'): v.decode('utf-8') for k, v in session.items()}

def set_session_mfa_verified(session_id: str):
    """
    Set the session auth stage to MFA_VERIFIED
    Returns the session ID
    """
    key = get_session_key(session_id)
    session = get_and_decode(key)
    session["auth_stage"] = SessionAuthStage.MFA.name
    redis_client.hset(key, mapping=session)
    redis_client.expire(key, ABSOLUTE_TIMEOUT)

# returns None if session does not exist or is expired
def fetch_session(session_id: str) -> dict | None:
    key = get_session_key(session_id)
    session = get_and_decode(key)
    if not session:
        return None
    now = time.time()
    print("????fetch session", session)
    if (now - float(session["last_active"]) > IDLE_TIMEOUT) or (now - float(session["created_at"]) > ABSOLUTE_TIMEOUT):
        redis_client.delete(key)
        return None
    
    # extend session
    session["last_active"] = now
    redis_client.hset(key, mapping=session)

    return session

def delete_session(session_id: str):
    key = get_session_key(session_id)
    print("Deleting session", key)
    redis_client.delete(key)

def clear():
    redis_client.flushall()
