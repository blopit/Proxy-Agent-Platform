"""
Authentication API endpoints - JWT-based user authentication
"""

import hashlib
import secrets
import time
from datetime import datetime, timedelta
from uuid import uuid4

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr

from src.core.task_models import User
from src.repositories.enhanced_repositories import UserRepository

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# Security scheme
security = HTTPBearer()

# JWT Configuration
JWT_SECRET_KEY = "proxy-agent-platform-secret-key"  # TODO: Move to environment variable
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30


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
    token_type: str
    expires_in: int
    user: dict


class UserProfile(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str | None
    created_at: datetime
    is_active: bool


def hash_password(password: str) -> str:
    """Hash password using SHA256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        salt, password_hash = hashed_password.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except ValueError:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        # Use time.time() for consistency with PyJWT internals
        expire = time.time() + expires_delta.total_seconds()
    else:
        expire = time.time() + (15 * 60)  # 15 minutes in seconds
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            # Force expiry verification for security
            options={"require": ["exp"], "verify_exp": True}
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


# Initialize repository
user_repo = UserRepository()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register_user(user_data: UserRegister):
    """Register a new user"""
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
            password_hash=hashed_password,  # This will be added to User model
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_active=True,
        )

        created_user = user_repo.create(new_user)

        # Create access token
        access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": created_user.username}, expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "user_id": created_user.user_id,
                "username": created_user.username,
                "email": created_user.email,
                "full_name": created_user.full_name,
            },
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    """Login user and return JWT token"""
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
        user_repo.update(user.user_id, user)

        # Create access token
        access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
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


@router.post("/logout")
async def logout_user(current_username: str = Depends(verify_token)):
    """Logout user (client-side token invalidation)"""
    return {"message": "Successfully logged out"}


@router.get("/verify")
async def verify_user_token(current_username: str = Depends(verify_token)):
    """Verify if token is valid"""
    return {"valid": True, "username": current_username}
