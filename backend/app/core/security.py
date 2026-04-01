"""
core/security.py — Firebase token verification via REST API

How it works:
  - Frontend gets a Firebase ID Token after login (Google Sign-In / email)
  - Frontend sends: Authorization: Bearer <token>
  - Backend sends the token to Firebase's Identity Toolkit REST API to verify
  - No service account or gcloud CLI needed — just the web API key

Why REST API (not Admin SDK):
  - Admin SDK requires Google Application Default Credentials or a service account JSON
  - For local dev without gcloud setup, the REST API approach works out of the box
  - Same security guarantees — Firebase validates the token on their servers
"""

import logging

import requests as http_requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

logger = logging.getLogger(__name__)

# --------------------------------------------------
# Bearer token extractor (auto_error=False so we
# can give a custom 401 message)
# --------------------------------------------------
_bearer = HTTPBearer(auto_error=False)


# --------------------------------------------------
# Core verification — Firebase Identity Toolkit REST
# --------------------------------------------------
def _verify_firebase_token(token: str) -> dict:
    """
    Verifies a Firebase ID token via Google's Identity Toolkit API.

    Returns a user dict with at minimum:
      { uid, email, email_verified, display_name }

    Raises ValueError on any failure.
    """
    api_key = settings.FIREBASE_API_KEY
    if not api_key:
        raise ValueError("FIREBASE_API_KEY is not configured in the backend .env")

    try:
        resp = http_requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={api_key}",
            json={"idToken": token},
            timeout=10,
        )
    except http_requests.exceptions.Timeout:
        raise ValueError("Firebase verification timed out")
    except http_requests.exceptions.RequestException as e:
        raise ValueError(f"Network error during Firebase verification: {e}")

    if resp.status_code != 200:
        body = resp.json()
        err = body.get("error", {}).get("message", resp.text)
        raise ValueError(f"Firebase rejected token: {err}")

    data = resp.json()
    users = data.get("users", [])
    if not users:
        raise ValueError("Firebase: no user found for this token")

    u = users[0]
    return {
        "uid": u["localId"],
        "email": u.get("email"),
        "email_verified": u.get("emailVerified", False),
        "display_name": u.get("displayName"),
        "photo_url": u.get("photoUrl"),
    }


# --------------------------------------------------
# FastAPI dependency — required auth
# --------------------------------------------------
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    Raises HTTP 401 if missing, invalid, or expired.

    Usage:
        @router.get("/protected")
        async def endpoint(user=Depends(get_current_user)):
            return {"uid": user["uid"]}
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = _verify_firebase_token(credentials.credentials)
        return user
    except ValueError as e:
        logger.warning("Token verification failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error("Unexpected error during token verification: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --------------------------------------------------
# FastAPI dependency — optional auth
# --------------------------------------------------
async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict | None:
    """Returns the user dict if token is valid, None if not provided."""
    if not credentials:
        return None
    try:
        return _verify_firebase_token(credentials.credentials)
    except Exception:
        return None
