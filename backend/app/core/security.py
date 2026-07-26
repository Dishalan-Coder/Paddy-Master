"""Password hashing utilities."""

from passlib.context import CryptContext

# bcrypt_sha256 safely supports passwords longer than bcrypt's 72-byte limit.
# Plain bcrypt remains enabled so existing hashes continue to verify.
pwd_context = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (TypeError, ValueError):
        return False
