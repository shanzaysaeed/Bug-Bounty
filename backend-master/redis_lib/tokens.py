from redis_lib import redis_client
import secrets

EXPIRE_TIME = 24 * 60 * 60 # one day

def generate_token(length=32) -> str:
    return secrets.token_urlsafe(length)

def get_ver_token_key(user_id: int) -> str:
    return f"user:{user_id}:verification_token"

# TODO: implement reset password token

def set_user_verification_token(user_id: int) -> str:
    key = get_ver_token_key(user_id)
    token = generate_token()
    redis_client.set(key, token)
    redis_client.expire(key, EXPIRE_TIME)
    return token

def get_user_verification_token(user_id: int) -> str:
    key = get_ver_token_key(user_id)
    token_b: bytes = redis_client.get(key)
    if token_b:
        return token_b.decode('utf-8')
    return None

