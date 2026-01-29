"""
Dependencias FastAPI - Auth, validación de tokens, etc.
"""
import json
import os
import logging
from typing import Optional, Callable, Dict, Any, List
from fastapi import Header, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import JWTError, jwt

from src.application.services import AuthService
from src.infrastructure.database.repositories.token_repository import TokenRepository
from src.shared.exceptions import AuthenticationException
from src.shared.logging import set_user_id
from src.shared.rbac import DEFAULT_ROLE_PERMISSIONS, normalize_role, DEFAULT_APP_ROLE

logger = logging.getLogger(__name__)

# Configuración JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Security scheme para Swagger
security = HTTPBearer()

ROLE_PERMISSIONS_ENV = os.getenv("AUTH_ROLE_PERMISSIONS", "")

if ROLE_PERMISSIONS_ENV:
    try:
        ROLE_PERMISSIONS = json.loads(ROLE_PERMISSIONS_ENV)
    except json.JSONDecodeError:
        ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS
        logger.warning("AUTH_ROLE_PERMISSIONS inválido, se usará default SGED")
else:
    ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS

if isinstance(ROLE_PERMISSIONS, dict):
    normalized_role_permissions: Dict[str, List[str]] = {}
    for role_key, permissions in ROLE_PERMISSIONS.items():
        normalized_role = normalize_role(str(role_key))
        permission_list = permissions if isinstance(permissions, list) else []
        normalized_role_permissions[normalized_role] = [
            str(permission).strip() for permission in permission_list if str(permission).strip()
        ]
    ROLE_PERMISSIONS = normalized_role_permissions
else:
    ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS


def get_auth_service() -> AuthService:
    """
    Dependency para obtener instancia de AuthService

    Returns:
        Instancia de AuthService
    """
    return AuthService()


def get_token_repository() -> TokenRepository:
    """
    Dependency para obtener instancia de TokenRepository

    Returns:
        Instancia de TokenRepository
    """
    return TokenRepository()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
    token_repository: TokenRepository = Depends(get_token_repository),
) -> dict:
    """
    Dependency para obtener el usuario actual desde el token JWT

    Args:
        credentials: Credenciales del header Authorization
        auth_service: Servicio de autenticación

    Returns:
        Dict con información del usuario

    Raises:
        HTTPException: 401 si el token es inválido o no se proporciona
    """
    token = credentials.credentials

    try:
        try:
            if token_repository.is_token_revoked(token):
                raise AuthenticationException("Token revocado")
        except Exception as e:
            logger.error(f"No se pudo validar revocación de token: {e}", exc_info=True)
            raise AuthenticationException("No se pudo validar revocación de token")
        user = auth_service.get_current_user(token)
        set_user_id(user.get("id"))
        return user
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Error obteniendo usuario actual: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error al validar token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
) -> Optional[dict]:
    """
    Dependency opcional para obtener el usuario actual

    Útil para endpoints que pueden funcionar con o sin autenticación

    Args:
        authorization: Header Authorization (opcional)
        auth_service: Servicio de autenticación

    Returns:
        Dict con información del usuario o None
    """
    if not authorization:
        return None

    try:
        token = authorization.replace("Bearer ", "")
        user = auth_service.get_current_user(token)
        set_user_id(user.get("id"))
        return user
    except Exception:
        return None


def verify_token(token: str) -> dict:
    """
    Verifica un token JWT y retorna el payload

    Args:
        token: JWT token

    Returns:
        Dict con payload del token

    Raises:
        HTTPException: 401 si el token es inválido
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Token inválido: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(*roles: str) -> Callable[..., Dict[str, Any]]:
    """
    Dependency para exigir roles específicos.

    Args:
        roles: Lista de roles permitidos

    Returns:
        Callable que valida el rol del usuario actual
    """

    async def _require_role(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = normalize_role(current_user.get("app_role", DEFAULT_APP_ROLE))
        normalized_roles = {normalize_role(role) for role in roles}
        if normalized_roles and user_role not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No autorizado para este recurso",
            )
        return current_user

    return _require_role


def require_permission(permission: str) -> Callable[..., Dict[str, Any]]:
    """
    Dependency para exigir un permiso específico.

    Args:
        permission: Permiso requerido

    Returns:
        Callable que valida permisos del usuario
    """

    async def _require_permission(current_user: dict = Depends(get_current_user)) -> dict:
        role = normalize_role(current_user.get("app_role", DEFAULT_APP_ROLE))
        permissions: List[str] = ROLE_PERMISSIONS.get(role, [])
        if permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No autorizado para este recurso",
            )
        return current_user

    return _require_permission
