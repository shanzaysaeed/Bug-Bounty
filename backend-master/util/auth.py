import pyotp
from secrets import token_bytes
from argon2 import PasswordHasher

ph = PasswordHasher()

def hash_password(password: str, salt: str) -> str:
    return ph.hash(password + salt)

def verify_password(hashed_password: str, password: str, salt: str) -> bool:
    try:
        ph.verify(hashed_password, password + salt)
        return True
    except:
        return False

def generate_salt() -> str:
    return token_bytes(32).hex()

def generate_totp_secret() -> str:
    return pyotp.random_base32()

def get_totp_auth_uri(user: str, secret: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(user, issuer_name='ByteBreaker')

def verify_totp(secret: str, code: str) -> bool:
    return pyotp.TOTP(secret).verify(code)

