"""
OAuth Authentication Routes - Social login integration
Supports Google, Apple, GitHub, and Microsoft OAuth flows
"""

from datetime import datetime, timedelta
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from src.api.auth import TokenResponse, create_access_token, create_refresh_token
from src.core.settings import get_settings
from src.core.task_models import User
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.repositories.enhanced_repositories import UserRepository

router = APIRouter(prefix="/api/v1/auth/oauth", tags=["oauth"])

settings = get_settings()
user_repo = UserRepository()


class GoogleOAuthRequest(BaseModel):
    """Request body for Google OAuth token exchange"""

    code: str
    redirect_uri: str | None = None


class AppleOAuthRequest(BaseModel):
    """Request body for Apple OAuth token exchange"""

    identity_token: str
    authorization_code: str
    user: str | None = None
    email: EmailStr | None = None
    full_name: dict | None = None


class OAuthUserProfile(BaseModel):
    """Standardized user profile from OAuth providers"""

    provider: str
    provider_user_id: str
    email: EmailStr
    full_name: str | None = None
    picture: str | None = None


async def get_google_user_profile(access_token: str) -> OAuthUserProfile:
    """
    Fetch user profile from Google using access token.

    Args:
        access_token: Google OAuth access token

    Returns:
        Standardized user profile

    Raises:
        HTTPException: If profile fetch fails
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Google user profile",
            )

        data = response.json()

        return OAuthUserProfile(
            provider="google",
            provider_user_id=data["id"],
            email=data["email"],
            full_name=data.get("name"),
            picture=data.get("picture"),
        )


async def exchange_google_code_for_token(code: str, redirect_uri: str | None = None) -> str:
    """
    Exchange Google authorization code for access token.

    Args:
        code: Authorization code from Google OAuth flow
        redirect_uri: Redirect URI used in the authorization request

    Returns:
        Google access token

    Raises:
        HTTPException: If token exchange fails
    """
    # Get Google OAuth credentials from settings
    google_client_id = getattr(settings, "google_client_id", None)
    google_client_secret = getattr(settings, "google_client_secret", None)

    if not google_client_id or not google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env",
        )

    # Default redirect URI for mobile app
    if not redirect_uri:
        redirect_uri = "proxyagent://auth/google"

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": google_client_id,
        "client_secret": google_client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=token_data)

        if response.status_code != 200:
            error_detail = response.json().get("error_description", "Token exchange failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token exchange failed: {error_detail}",
            )

        token_response = response.json()
        return token_response["access_token"]


def get_or_create_oauth_user(profile: OAuthUserProfile) -> User:
    """
    Get existing user or create new user from OAuth profile.

    Args:
        profile: Standardized OAuth user profile

    Returns:
        User object (existing or newly created)
    """
    # Try to find existing user by email
    existing_user = user_repo.get_by_email(profile.email)

    if existing_user:
        # Update last login
        existing_user.last_login = datetime.now()
        user_repo.update(existing_user)
        return existing_user

    # Create new user
    # Generate guaranteed-valid username from UUID
    # Format: user_7a3b8c9d (always unique, always valid for internal use)
    user_id = str(uuid4())
    username = f"user_{user_id[:8]}"

    new_user = User(
        user_id=user_id,
        username=username,
        email=profile.email,
        full_name=profile.full_name,
        password_hash=None,  # OAuth users don't have passwords
        created_at=datetime.now(),
        updated_at=datetime.now(),
        last_login=datetime.now(),
        is_active=True,
        oauth_provider=profile.provider,
        oauth_provider_id=profile.provider_user_id,
    )

    created_user = user_repo.create(new_user)
    return created_user


@router.post("/google", response_model=TokenResponse)
async def google_oauth_callback(
    request: GoogleOAuthRequest, db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """
    Handle Google OAuth callback and create user session.

    This endpoint:
    1. Exchanges authorization code for access token
    2. Fetches user profile from Google
    3. Creates or retrieves user from database
    4. Returns JWT access token + refresh token

    Args:
        request: Google OAuth request with authorization code
        db: Database adapter dependency

    Returns:
        JWT token response with user info and refresh token

    Raises:
        HTTPException 400: If OAuth flow fails
        HTTPException 500: If Google OAuth not configured

    Example:
        POST /api/v1/auth/oauth/google
        {
            "code": "4/0AY0e-g7...",
            "redirect_uri": "proxyagent://auth/google"
        }
    """
    try:
        # Exchange code for access token
        access_token = await exchange_google_code_for_token(request.code, request.redirect_uri)

        # Get user profile from Google
        profile = await get_google_user_profile(access_token)

        # Get or create user
        user = get_or_create_oauth_user(profile)

        # Create JWT access token
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        jwt_token = create_access_token(
            data={"sub": user.username, "user_id": user.user_id}, expires_delta=access_token_expires
        )

        # Create refresh token
        refresh_token, _ = create_refresh_token(user.user_id, db)

        return TokenResponse(
            access_token=jwt_token,
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth failed: {str(e)}",
        ) from e


@router.post("/apple", response_model=TokenResponse)
async def apple_oauth_callback(_request: AppleOAuthRequest):
    """
    Handle Apple OAuth callback and create user session.

    Note: Apple OAuth implementation requires additional setup:
    - Apple Developer account with Sign In with Apple capability
    - Server-side token verification with Apple's public keys

    Args:
        request: Apple OAuth request with identity token

    Returns:
        JWT token response with user info

    Raises:
        HTTPException 501: Not yet implemented
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth not yet implemented. Please use email/password or Google sign-in.",
    )


@router.post("/github", response_model=TokenResponse)
async def github_oauth_callback(_request: GoogleOAuthRequest):
    """
    Handle GitHub OAuth callback and create user session.

    Args:
        request: GitHub OAuth request with authorization code

    Returns:
        JWT token response with user info

    Raises:
        HTTPException 501: Not yet implemented
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth not yet implemented. Please use email/password or Google sign-in.",
    )


@router.post("/microsoft", response_model=TokenResponse)
async def microsoft_oauth_callback(_request: GoogleOAuthRequest):
    """
    Handle Microsoft OAuth callback and create user session.

    Args:
        request: Microsoft OAuth request with authorization code

    Returns:
        JWT token response with user info

    Raises:
        HTTPException 501: Not yet implemented
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth not yet implemented. Please use email/password or Google sign-in.",
    )
