"""
Rutas API v1 - Endpoints de autenticación
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials

from src.api.dependencies import get_auth_service, get_current_user, security
from src.api.rate_limiter import limiter
from src.api.v1.schemas import (
    LoginRequest,
    LoginResponse,
    SignupRequest,
    SignupResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
    ChangePasswordRequest,
    MessageResponse,
    UserResponse
)
from src.application.services import AuthService
from src.shared.exceptions import (
    AuthenticationException,
    ValidationException,
    NotFoundException
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def login(
    payload: LoginRequest,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Inicia sesión con email y contraseña

    Autentica al usuario con Supabase Auth y retorna tokens JWT.

    Args:
        request: Credenciales de login
        auth_service: Servicio de autenticación

    Returns:
        LoginResponse con tokens y datos del usuario

    Raises:
        HTTPException: 401 si las credenciales son inválidas
        HTTPException: 400 si los datos son inválidos
    """
    try:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        result = auth_service.login(
            email=payload.email,
            password=payload.password,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return LoginResponse(**result)

    except AuthenticationException as e:
        logger.warning(f"Error de autenticación: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except ValidationException as e:
        logger.warning(f"Error de validación: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error inesperado en login: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(
    payload: SignupRequest,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Registra un nuevo usuario

    Crea un nuevo usuario en Supabase Auth y crea su perfil en la base de datos.

    Args:
        request: Datos de registro
        auth_service: Servicio de autenticación

    Returns:
        SignupResponse con información del usuario creado

    Raises:
        HTTPException: 400 si los datos son inválidos
        HTTPException: 409 si el usuario ya existe
    """
    try:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        result = auth_service.signup(
            email=payload.email,
            password=payload.password,
            company_id=payload.company_id,
            app_role=payload.app_role,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return SignupResponse(**result)

    except AuthenticationException as e:
        error_msg = str(e)
        if "ya está registrado" in error_msg.lower() or "already" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    except ValidationException as e:
        logger.warning(f"Error de validación: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error inesperado en signup: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/refresh", response_model=RefreshTokenResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def refresh_token(
    payload: RefreshTokenRequest,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Refresca un access token usando refresh token

    Genera un nuevo access token y refresh token a partir de un refresh token válido.

    Args:
        request: Refresh token
        auth_service: Servicio de autenticación

    Returns:
        RefreshTokenResponse con nuevos tokens

    Raises:
        HTTPException: 401 si el refresh token es inválido
    """
    try:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        result = auth_service.refresh_token(
            payload.refresh_token,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return RefreshTokenResponse(**result)

    except AuthenticationException as e:
        logger.warning(f"Error refrescando token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error inesperado refrescando token: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/reset-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Envía email de recuperación de contraseña

    Args:
        request: Email del usuario
        auth_service: Servicio de autenticación

    Returns:
        MessageResponse con mensaje de confirmación
    """
    try:
        auth_service.reset_password(payload.email)
        # Por seguridad, siempre retornar éxito (no revelar si el email existe)
        return MessageResponse(
            message="Si el email existe, se ha enviado un enlace de recuperación",
            success=True
        )

    except Exception as e:
        logger.error(f"Error enviando email de recuperación: {e}", exc_info=True)
        # Por seguridad, siempre retornar éxito
        return MessageResponse(
            message="Si el email existe, se ha enviado un enlace de recuperación",
            success=True
        )


@router.post("/change-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Cambia la contraseña del usuario autenticado.

    Args:
        payload: Contraseña actual y nueva contraseña
        request: Request HTTP
        current_user: Usuario actual (inyectado automáticamente)
        auth_service: Servicio de autenticación
    """
    try:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        auth_service.change_password(
            user_id=current_user.get("id"),
            email=current_user.get("email", ""),
            current_password=payload.current_password,
            new_password=payload.new_password,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return MessageResponse(
            message="Contraseña actualizada exitosamente",
            success=True,
        )
    except ValidationException as e:
        logger.warning(f"Error de validación en cambio de contraseña: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except AuthenticationException as e:
        logger.warning(f"Error de autenticación en cambio de contraseña: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error inesperado en cambio de contraseña: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor",
        )


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_me(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene información del usuario actual

    Endpoint protegido que retorna la información del usuario autenticado.

    Args:
        current_user: Usuario actual (inyectado automáticamente)

    Returns:
        UserResponse con información del usuario

    Raises:
        HTTPException: 401 si no está autenticado
    """
    return UserResponse(**current_user)


@router.post("/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def logout(
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Cierra sesión

    Invalida la sesión actual del usuario.

    Args:
        current_user: Usuario actual (inyectado automáticamente)
        auth_service: Servicio de autenticación

    Returns:
        MessageResponse con mensaje de confirmación
    """
    try:
        # Por ahora, solo retornamos éxito
        # En el futuro, podríamos invalidar tokens en una blacklist
        token = credentials.credentials if credentials else None
        ip_address = request.client.host if request and request.client else None
        user_agent = request.headers.get("User-Agent") if request else None
        auth_service.logout(
            token=token,
            user_id=current_user.get("id"),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return MessageResponse(
            message="Sesión cerrada exitosamente",
            success=True
        )
    except Exception as e:
        logger.warning(f"Error en logout: {e}")
        # Siempre retornar éxito para logout
        return MessageResponse(
            message="Sesión cerrada exitosamente",
            success=True
        )
