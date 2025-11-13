# Backend Authentication Implementation

## Overview

The backend authentication system is implemented in Python using FastAPI. It provides JWT-based authentication with refresh token rotation, bcrypt password hashing, and comprehensive security features.

**Location**: `src/api/auth.py`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Application                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │          Authentication Router                  │    │
│  │          /api/v1/auth                          │    │
│  │                                                 │    │
│  │  POST   /register    - Create new user         │    │
│  │  POST   /login       - Authenticate user       │    │
│  │  POST   /refresh     - Refresh access token    │    │
│  │  POST   /logout      - Revoke refresh tokens   │    │
│  │  GET    /profile     - Get user profile        │    │
│  │  GET    /verify      - Verify token validity   │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐    │
│  │         JWT & Security Functions                │    │
│  │                                                  │    │
│  │  - create_access_token()                        │    │
│  │  - create_refresh_token()                       │    │
│  │  - verify_refresh_token()                       │    │
│  │  - revoke_refresh_token()                       │    │
│  │  - hash_password()                              │    │
│  │  - verify_password()                            │    │
│  │  - verify_token() (dependency)                  │    │
│  │  - get_current_user() (dependency)              │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐    │
│  │          UserRepository                         │    │
│  │                                                  │    │
│  │  - get_by_id()                                  │    │
│  │  - get_by_username()                            │    │
│  │  - get_by_email()                               │    │
│  │  - create()                                     │    │
│  │  - update()                                     │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐    │
│  │        EnhancedDatabaseAdapter                  │    │
│  │                                                  │    │
│  │  SQLite database operations                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Password Hashing (src/api/auth.py:67-107)

Uses bcrypt for secure password hashing with automatic salt generation.

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.

    Returns 60-character hash string.
    Automatically generates salt.
    """
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify password against bcrypt hash.

    Returns True if password matches, False otherwise.
    Handles malformed hashes gracefully.
    """
    try:
        return pwd_context.verify(password, hashed_password)
    except Exception:
        return False
```

**Security Features:**
- Bcrypt algorithm (slow by design, resistant to brute-force)
- Automatic salt generation
- Configurable work factor
- Safe error handling (no exception leakage)

### 2. JWT Access Tokens (src/api/auth.py:110-136)

Short-lived tokens for API authentication.

```python
import jwt
import time
from datetime import timedelta

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:
    """
    Create JWT access token.

    Args:
        data: Claims to encode (typically {"user_id": ..., "sub": username})
        expires_delta: Optional custom expiration (default: 30 minutes)

    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = time.time() + expires_delta.total_seconds()
    else:
        expire = time.time() + (settings.jwt_access_token_expire_minutes * 60)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

    return encoded_jwt
```

**Token Structure:**
```json
{
  "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
  "sub": "johndoe",
  "exp": 1699123456.789
}
```

**Configuration (settings.py):**
```python
jwt_secret_key: str = Field(..., description="Secret key for JWT")
jwt_algorithm: str = Field(default="HS256")
jwt_access_token_expire_minutes: int = Field(default=30)
```

### 3. Refresh Tokens (src/api/auth.py:138-296)

Long-lived tokens stored in database with rotation support.

#### Creating Refresh Tokens

```python
import secrets
import hashlib
from uuid import uuid4
from datetime import datetime, timezone, timedelta

def create_refresh_token(user_id: str, db: EnhancedDatabaseAdapter) -> tuple[str, datetime]:
    """
    Create refresh token and store in database.

    Security:
    - Uses cryptographically secure random token (32 bytes)
    - Stores SHA256 hash (not plaintext)
    - Sets expiration (default: 30 days)

    Returns:
        Tuple of (refresh_token, expires_at)
    """
    # Generate secure random token
    token = secrets.token_urlsafe(32)  # 43-character string

    # Hash before storing (NEVER store plaintext tokens)
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Calculate expiration
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )

    # Store in database
    token_id = str(uuid4())
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at, created_at, revoked)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (token_id, user_id, token_hash, expires_at, datetime.now(timezone.utc), False),
    )
    conn.commit()

    return token, expires_at
```

#### Verifying Refresh Tokens

```python
def verify_refresh_token(token: str, db: EnhancedDatabaseAdapter) -> str:
    """
    Verify refresh token and return user_id.

    Checks:
    1. Token exists in database (by hash)
    2. Token is not revoked
    3. Token has not expired

    Raises:
        HTTPException 401: If token is invalid, expired, or revoked

    Returns:
        user_id associated with the token
    """
    # Hash the provided token
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Look up in database
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
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    return user_id
```

#### Token Rotation

```python
def revoke_refresh_token(token: str, db: EnhancedDatabaseAdapter):
    """
    Revoke a refresh token (used during token rotation).

    When user refreshes their access token, we:
    1. Verify old refresh token
    2. Revoke old refresh token (this function)
    3. Issue new refresh token

    This prevents token replay attacks.
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
        (datetime.now(timezone.utc), token_hash),
    )
    conn.commit()

def revoke_user_tokens(user_id: str, db: EnhancedDatabaseAdapter):
    """
    Revoke all refresh tokens for a user (logout all devices).
    """
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE refresh_tokens
        SET revoked = 1, revoked_at = ?
        WHERE user_id = ? AND revoked = 0
        """,
        (datetime.now(timezone.utc), user_id),
    )
    conn.commit()
```

### 4. Token Verification (Dependencies)

FastAPI dependencies for protecting routes.

#### verify_token (src/api/auth.py:298-338)

Basic token verification - returns username.

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verify JWT token and return username.

    Usage:
        @router.get("/protected")
        def protected_route(username: str = Depends(verify_token)):
            return {"username": username}

    Raises:
        HTTPException 401: If token is invalid or expired

    Returns:
        Username from token's 'sub' claim
    """
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
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
```

#### get_current_user (src/api/auth.py:341-414)

Full user verification - returns User object.

```python
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get current authenticated user from JWT token.

    Usage (recommended for most protected routes):
        @router.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.user_id}

    Steps:
    1. Decode and verify JWT token
    2. Extract user_id from token
    3. Fetch User from database
    4. Verify user is active

    Raises:
        HTTPException 401: If token is invalid or expired
        HTTPException 404: If user not found in database
        HTTPException 403: If user account is inactive

    Returns:
        Full User object
    """
    try:
        # Decode token
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp"], "verify_exp": True},
        )

        # Extract user_id
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

        # Check if active
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
```

## API Endpoints

### POST /api/v1/auth/register

Register a new user with email and password.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abc123def456...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

**Implementation (src/api/auth.py:420-484):**
```python
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register_user(
    user_data: UserRegister,
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """Register a new user and return access + refresh tokens"""
    # 1. Check username uniqueness
    existing_user = user_repo.get_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # 2. Check email uniqueness
    existing_email = user_repo.get_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 3. Hash password
    hashed_password = hash_password(user_data.password)

    # 4. Create user
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

    # 5. Generate tokens
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"user_id": created_user.user_id, "sub": created_user.username},
        expires_delta=access_token_expires,
    )

    refresh_token, _ = create_refresh_token(created_user.user_id, db)

    # 6. Return response
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
```

### POST /api/v1/auth/login

Authenticate existing user.

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "xyz789abc012...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

**Implementation (src/api/auth.py:486-536):**
```python
@router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLogin,
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """Login user and return access + refresh tokens"""
    # 1. Get user by username
    user = user_repo.get_by_username(login_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # 2. Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # 3. Update last login
    user.last_login = datetime.now()
    user_repo.update(user)

    # 4. Generate tokens
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"user_id": user.user_id, "sub": user.username},
        expires_delta=access_token_expires,
    )

    refresh_token, _ = create_refresh_token(user.user_id, db)

    # 5. Return response
    return TokenResponse(...)
```

### POST /api/v1/auth/refresh

Refresh access token using refresh token (with token rotation).

**Request:**
```json
{
  "refresh_token": "abc123def456..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new789token012...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": { ... }
}
```

**Implementation (src/api/auth.py:561-620):**
```python
@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """
    Exchange refresh token for new access + refresh tokens.

    Implements token rotation:
    1. Verify old refresh token
    2. Revoke old refresh token
    3. Issue new access token + new refresh token
    """
    # 1. Verify refresh token and get user_id
    user_id = verify_refresh_token(refresh_data.refresh_token, db)

    # 2. Get user
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    # 3. Revoke old refresh token (token rotation)
    revoke_refresh_token(refresh_data.refresh_token, db)

    # 4. Create new tokens
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"user_id": user.user_id, "sub": user.username},
        expires_delta=access_token_expires,
    )

    new_refresh_token, _ = create_refresh_token(user.user_id, db)

    # 5. Return response
    return TokenResponse(...)
```

### POST /api/v1/auth/logout

Logout user by revoking all refresh tokens.

**Request:**
```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out from all devices"
}
```

**Implementation (src/api/auth.py:622-638):**
```python
@router.post("/logout")
async def logout_user(
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Logout user by revoking all their refresh tokens.

    Client should also delete stored access and refresh tokens.
    """
    # Revoke all refresh tokens for this user
    revoke_user_tokens(current_user.user_id, db)
    return {"message": "Successfully logged out from all devices"}
```

### GET /api/v1/auth/profile

Get current user's profile.

**Request:**
```http
GET /api/v1/auth/profile
Authorization: Bearer eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "is_active": true
}
```

**Implementation (src/api/auth.py:538-559):**
```python
@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_username: str = Depends(verify_token)):
    """Get current user profile"""
    user = user_repo.get_by_username(current_username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserProfile(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at,
        is_active=user.is_active,
    )
```

### GET /api/v1/auth/verify

Verify if token is valid.

**Request:**
```http
GET /api/v1/auth/verify
Authorization: Bearer eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "valid": true,
  "username": "johndoe"
}
```

**Implementation (src/api/auth.py:640-644):**
```python
@router.get("/verify")
async def verify_user_token(current_username: str = Depends(verify_token)):
    """Verify if token is valid"""
    return {"valid": True, "username": current_username}
```

## Configuration

Settings are loaded from `.env` file using Pydantic Settings.

**Required Environment Variables:**
```bash
JWT_SECRET_KEY=your-secret-key-here-use-openssl-rand-hex-32
```

**Optional (with defaults):**
```bash
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
DATABASE_PATH=.data/databases/proxy_agents_enhanced.db
```

**Settings Class (src/core/settings.py:35-43):**
```python
class Settings(BaseSettings):
    # Security Configuration
    jwt_secret_key: str = Field(..., description="Secret key for JWT (required)")
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expire_minutes: int = Field(default=30)
    jwt_refresh_token_expire_days: int = Field(default=30)
```

## Security Best Practices

### 1. Password Security
- Bcrypt hashing with automatic salt
- No plaintext password storage
- Safe error handling (no password in error messages)

### 2. Token Security
- Access tokens: Short-lived (30 minutes)
- Refresh tokens: Hashed in database (SHA256)
- Token rotation on refresh
- All tokens include expiry (`exp` claim)

### 3. Error Handling
- Generic error messages (no username/email enumeration)
- Proper HTTP status codes
- No stack traces in production

### 4. Database Security
- Parameterized queries (no SQL injection)
- Foreign key constraints
- Cascade deletion

## Testing

Example test for registration:

```python
def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "testuser"
```

See `src/api/tests/test_auth.py` for comprehensive tests.

## Common Issues & Solutions

### Issue: Token expired immediately
**Solution**: Check server time sync and `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`

### Issue: Refresh token rotation fails
**Solution**: Ensure database has `refresh_tokens` table (run migration 026)

### Issue: OAuth users can't login with password
**Solution**: Expected behavior - OAuth users don't have passwords

## Related Documentation

- [01_overview.md](./01_overview.md) - Architecture overview
- [02_database_schema.md](./02_database_schema.md) - Database tables
- [05_oauth_integration.md](./05_oauth_integration.md) - OAuth implementation
- [07_api_reference.md](./07_api_reference.md) - Complete API reference
