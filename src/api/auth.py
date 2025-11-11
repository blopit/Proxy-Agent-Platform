"""
Authentication API endpoints - JWT-based user authentication with refresh tokens
"""

import hashlib
import secrets
import time
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from src.core.settings import get_settings
from src.core.task_models import User
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.repositories.enhanced_repositories import UserRepository

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# Security scheme
security = HTTPBearer()

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get settings instance
settings = get_settings()


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserProfile(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str | None
    created_at: datetime
    is_active: bool


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string

    Example:
        >>> hashed = hash_password("my_password")
        >>> print(len(hashed))  # bcrypt hashes are 60 chars
        60
    """
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify password against bcrypt hash.

    Args:
        password: Plain text password to verify
        hashed_password: Hashed password from database

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("test123")
        >>> verify_password("test123", hashed)
        True
        >>> verify_password("wrong", hashed)
        False
    """
    try:
        return pwd_context.verify(password, hashed_password)
    except Exception:
        # Malformed hash or other errors return False
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Create JWT access token using configured secret key.

    Args:
        data: Dictionary of claims to encode in token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string

    Example:
        >>> token = create_access_token({"sub": "username"})
        >>> len(token) > 0
        True
    """
    to_encode = data.copy()
    if expires_delta:
        # Use time.time() for consistency with PyJWT internals
        expire = time.time() + expires_delta.total_seconds()
    else:
        # Use settings for default expiry
        expire = time.time() + (settings.jwt_access_token_expire_minutes * 60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def create_refresh_token(user_id: str, db: EnhancedDatabaseAdapter) -> tuple[str, datetime]:
    """
    Create a refresh token and store it in the database.

    Args:
        user_id: User ID to associate with refresh token
        db: Database adapter instance

    Returns:
        Tuple of (refresh_token, expires_at)

    Example:
        >>> token, expires = create_refresh_token("user123", db)
        >>> len(token) > 0
        True
    """
    # Generate cryptographically secure random token
    token = secrets.token_urlsafe(32)

    # Hash the token before storing (don't store plain tokens)
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Calculate expiration
    expires_at = datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days)

    # Store in database
    token_id = str(uuid4())
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at, created_at, revoked)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (token_id, user_id, token_hash, expires_at, datetime.now(UTC), False),
    )
    conn.commit()

    return token, expires_at


def verify_refresh_token(token: str, db: EnhancedDatabaseAdapter) -> str:
    """
    Verify refresh token and return associated user_id.

    Args:
        token: Refresh token to verify
        db: Database adapter instance

    Returns:
        User ID associated with the token

    Raises:
        HTTPException: If token is invalid, expired, or revoked
    """
    # Hash the provided token
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Look up token in database
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT token_id, user_id, expires_at, revoked
        FROM refresh_tokens
        WHERE token_hash = ?
        """,
        (token_hash,),
    )
    result = cursor.fetchone()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    token_id, user_id, expires_at_str, revoked = result

    # Check if revoked
    if revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    # Check if expired
    expires_at = datetime.fromisoformat(expires_at_str)
    if datetime.now(UTC) > expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    return user_id


def revoke_refresh_token(token: str, db: EnhancedDatabaseAdapter):
    """
    Revoke a refresh token so it cannot be used again.

    Args:
        token: Refresh token to revoke
        db: Database adapter instance
    """
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE refresh_tokens
        SET revoked = 1, revoked_at = ?
        WHERE token_hash = ?
        """,
        (datetime.now(UTC), token_hash),
    )
    conn.commit()


def revoke_user_tokens(user_id: str, db: EnhancedDatabaseAdapter):
    """
    Revoke all refresh tokens for a user (useful for logout all devices).

    Args:
        user_id: User ID whose tokens to revoke
        db: Database adapter instance
    """
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE refresh_tokens
        SET revoked = 1, revoked_at = ?
        WHERE user_id = ? AND revoked = 0
        """,
        (datetime.now(UTC), user_id),
    )
    conn.commit()


def cleanup_expired_tokens(db: EnhancedDatabaseAdapter):
    """
    Delete expired refresh tokens from database (maintenance task).

    Args:
        db: Database adapter instance
    """
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM refresh_tokens
        WHERE expires_at < ? OR revoked = 1
        """,
        (datetime.now(UTC),),
    )
    conn.commit()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token and return username.

    Args:
        credentials: HTTP Bearer token from request

    Returns:
        Username from token subject claim

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            # Force expiry verification for security
            options={"require": ["exp"], "verify_exp": True},
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get current authenticated user from JWT token.

    This dependency should be used in all protected endpoints to:
    1. Verify the JWT token
    2. Extract user_id from token
    3. Fetch and return the full User object

    Args:
        credentials: HTTP Bearer token from request

    Returns:
        User object for the authenticated user

    Raises:
        HTTPException 401: If token is invalid or expired
        HTTPException 401: If user_id missing from token
        HTTPException 404: If user not found in database
        HTTPException 403: If user account is inactive

    Example:
        @router.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.user_id}
    """
    try:
        # Decode and verify the token
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp"], "verify_exp": True},
        )

        # Extract user_id from token
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Fetch user from database
        user = user_repo.get_by_id(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account",
            )

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Initialize repository
user_repo = UserRepository()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register_user(
    user_data: UserRegister, db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """Register a new user and return access + refresh tokens"""
    try:
        # Check if user already exists
        existing_user = user_repo.get_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered"
            )

        # Check if email already exists
        existing_email = user_repo.get_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
            )

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Create user
        new_user = User(
            user_id=str(uuid4()),
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=hashed_password,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_active=True,
        )

        created_user = user_repo.create(new_user)

        # Create access token
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={"user_id": created_user.user_id, "sub": created_user.username},
            expires_delta=access_token_expires,
        )

        # Create refresh token
        refresh_token, _ = create_refresh_token(created_user.user_id, db)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user={
                "user_id": created_user.user_id,
                "username": created_user.username,
                "email": created_user.email,
                "full_name": created_user.full_name,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLogin, db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """Login user and return access + refresh tokens"""
    try:
        # Get user by username
        user = user_repo.get_by_username(login_data.username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password"
            )

        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password"
            )

        # Update last login
        user.last_login = datetime.now()
        user_repo.update(user)

        # Create access token
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={"user_id": user.user_id, "sub": user.username},
            expires_delta=access_token_expires,
        )

        # Create refresh token
        refresh_token, _ = create_refresh_token(user.user_id, db)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user={
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_username: str = Depends(verify_token)):
    """Get current user profile"""
    try:
        user = user_repo.get_by_username(current_username)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return UserProfile(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at,
            is_active=user.is_active,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest, db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """
    Exchange refresh token for new access + refresh tokens.

    This implements token rotation - the old refresh token is revoked
    and a new one is issued along with a new access token.
    """
    try:
        # Verify refresh token and get user_id
        user_id = verify_refresh_token(refresh_data.refresh_token, db)

        # Get user from database
        user = user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account"
            )

        # Revoke old refresh token (token rotation for security)
        revoke_refresh_token(refresh_data.refresh_token, db)

        # Create new access token
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={"user_id": user.user_id, "sub": user.username},
            expires_delta=access_token_expires,
        )

        # Create new refresh token
        new_refresh_token, _ = create_refresh_token(user.user_id, db)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user={
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not refresh token: {str(e)}",
        )


@router.post("/logout")
async def logout_user(
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Logout user by revoking all their refresh tokens.

    Client should also delete stored access and refresh tokens.
    """
    try:
        # Revoke all refresh tokens for this user
        revoke_user_tokens(current_user.user_id, db)
        return {"message": "Successfully logged out from all devices"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/verify")
async def verify_user_token(current_username: str = Depends(verify_token)):
    """Verify if token is valid"""
    return {"valid": True, "username": current_username}
