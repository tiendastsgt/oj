"""
Servicio de aplicación - Autenticación
Lógica de negocio para autenticación y autorización
"""
import os
import uuid
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
import logging

from jose import JWTError, jwt

from src.infrastructure.external.supabase_client import SupabaseAuthClient
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.infrastructure.database.repositories.token_repository import TokenRepository
from src.infrastructure.database.repositories.auth_attempts_repository import (
    AuthAttemptsRepository,
)
from src.infrastructure.database.repositories.audit_repository import AuditRepository
from src.shared.exceptions import (
    AuthenticationException,
    ValidationException,
    NotFoundException,
    ProcessingException
)
from src.shared.validators import validate_password_strength
from src.shared.rbac import normalize_role, DEFAULT_APP_ROLE

# Importar métricas
try:
    from src.shared.metrics import (
        record_login,
        record_signup,
        record_refresh,
        record_token_validation,
        record_event_published,
        record_event_failed
    )
except ImportError:
    # Stubs si no están disponibles
    def record_login(result: str): pass
    def record_signup(result: str): pass
    def record_refresh(result: str): pass
    def record_token_validation(result: str): pass
    def record_event_published(event_name: str): pass
    def record_event_failed(event_name: str): pass

logger = logging.getLogger(__name__)

# Importar EventPublisher (opcional, best-effort)
try:
    from src._shared.events import get_event_publisher
    _event_publisher = get_event_publisher()
except Exception as e:
    logger.debug(f"Event publisher no disponible: {e}")
    _event_publisher = None

# Configuración JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "30"))
MAX_FAILED_ATTEMPTS = int(os.getenv("AUTH_MAX_FAILED_ATTEMPTS", "5"))
LOCKOUT_MINUTES = int(os.getenv("AUTH_LOCKOUT_MINUTES", "15"))


class AuthService:
    """
    Servicio de autenticación

    Maneja:
    - Login con Supabase Auth
    - Signup de nuevos usuarios
    - Generación y validación de JWT
    - Refresh de tokens
    - Logout
    - Recuperación de contraseña
    """

    def __init__(
        self,
        supabase_client: Optional[SupabaseAuthClient] = None,
        user_repository: Optional[UserRepository] = None,
        token_repository: Optional[TokenRepository] = None,
        auth_attempts_repository: Optional[AuthAttemptsRepository] = None,
        audit_repository: Optional[AuditRepository] = None,
    ):
        try:
            self.supabase_client = supabase_client or SupabaseAuthClient()
        except Exception as e:
            logger.warning(f"SupabaseAuthClient no disponible: {e}")
            self.supabase_client = supabase_client

        self.user_repository = user_repository or UserRepository()
        self.token_repository = token_repository or TokenRepository()
        self.auth_attempts_repository = auth_attempts_repository or AuthAttemptsRepository()
        self.audit_repository = audit_repository or AuditRepository()

    def login(
        self,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Inicia sesión con email y contraseña

        Args:
            email: Email del usuario
            password: Contraseña
            ip_address: IP del cliente (opcional)
            user_agent: User-Agent del cliente (opcional)

        Returns:
            Dict con access_token, refresh_token, user, profile

        Raises:
            AuthenticationException: Si las credenciales son inválidas
            ValidationException: Si el usuario no tiene perfil configurado
        """
        if not self.supabase_client:
            raise AuthenticationException("Servicio de autenticación no disponible")

        try:
            locked_until = self.auth_attempts_repository.is_locked_out(email)
            if locked_until:
                raise AuthenticationException(
                    "Cuenta bloqueada temporalmente por intentos fallidos"
                )

            # Autenticar con Supabase
            result = self.supabase_client.sign_in_with_password(email, password)
            user = result["user"]
            session = result.get("session")

            user_id = str(user.id)

            # Obtener perfil de usuario
            profile = self.user_repository.get_user_profile(user_id)

            if not profile:
                raise ValidationException(
                    "Usuario no tiene perfil configurado. Contacta al administrador."
                )

            if not profile.get("is_active", True):
                raise AuthenticationException("Usuario inactivo")

            self.auth_attempts_repository.clear_attempts(email)

            # Generar JWT tokens
            normalized_role = normalize_role(profile.get("app_role", DEFAULT_APP_ROLE))
            access_token = self._create_access_token(
                user_id=user_id,
                email=user.email,
                company_id=str(profile["company_id"]),
                app_role=normalized_role
            )

            refresh_token = None
            if session and hasattr(session, "refresh_token"):
                refresh_token = session.refresh_token
            else:
                refresh_token = self._create_refresh_token(user_id)

            # Registrar métrica
            record_login("success")

            self._audit_event(
                action="login",
                user_id=user_id,
                resource="auth",
                success=True,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata={
                    "email": user.email,
                    "company_id": str(profile["company_id"]),
                    "app_role": normalized_role,
                },
            )

            # Publicar evento de dominio
            self._publish_user_logged_in_event(
                user_id=user_id,
                email=user.email,
                company_id=str(profile["company_id"]),
                app_role=normalized_role
            )

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "user": {
                    "id": user_id,
                    "email": user.email,
                    "company_id": str(profile["company_id"]),
                    "company_name": profile.get("company_name"),
                    "company_nit": profile.get("company_nit", ""),
                    "app_role": normalized_role,
                    "is_active": profile.get("is_active", True)
                }
            }

        except ValidationException:
            raise
        except Exception as e:
            error_msg = str(e)

            # Registrar métrica de fallo
            record_login("failure")

            # Publicar evento de fallo de login
            self._publish_login_failed_event(
                email=email,
                reason="INVALID_CREDENTIALS" if ("Credenciales inválidas" in error_msg or "invalid" in error_msg.lower()) else "OTHER"
            )

            if "Credenciales inválidas" in error_msg or "invalid" in error_msg.lower():
                locked_until = self.auth_attempts_repository.record_failed_attempt(
                    email=email,
                    max_attempts=MAX_FAILED_ATTEMPTS,
                    lock_minutes=LOCKOUT_MINUTES,
                )
                self._audit_event(
                    action="login",
                    user_id=None,
                    resource="auth",
                    success=False,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata={"email": email, "reason": "INVALID_CREDENTIALS"},
                )
                if locked_until:
                    raise AuthenticationException(
                        "Cuenta bloqueada temporalmente por intentos fallidos"
                    )
                raise AuthenticationException("Credenciales inválidas")
            elif "Email no confirmado" in error_msg:
                self._audit_event(
                    action="login",
                    user_id=None,
                    resource="auth",
                    success=False,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata={"email": email, "reason": "EMAIL_NOT_CONFIRMED"},
                )
                raise AuthenticationException(error_msg)
            else:
                logger.error(f"Error en login: {error_msg}", exc_info=True)
                self._audit_event(
                    action="login",
                    user_id=None,
                    resource="auth",
                    success=False,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata={"email": email, "reason": "OTHER"},
                )
                raise AuthenticationException(f"Error en autenticación: {error_msg}")

    def signup(
        self,
        email: str,
        password: str,
        company_id: str,
        app_role: str = DEFAULT_APP_ROLE,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Registra un nuevo usuario

        Args:
            email: Email del usuario
            password: Contraseña
            company_id: ID de la empresa
            app_role: Rol de aplicación (default: CONSULTA)
            ip_address: IP del cliente (opcional)
            user_agent: User-Agent del cliente (opcional)

        Returns:
            Dict con user y message

        Raises:
            AuthenticationException: Si hay error al registrar
            ValidationException: Si los datos son inválidos
        """
        if not self.supabase_client:
            raise AuthenticationException("Servicio de autenticación no disponible")

        try:
            # Validar que la empresa existe
            # (Por ahora solo validamos que company_id no esté vacío)
            if not company_id:
                raise ValidationException("company_id es requerido")

            try:
                validate_password_strength(password)
            except ValueError as e:
                raise ValidationException(str(e))

            # Registrar en Supabase
            result = self.supabase_client.sign_up(
                email=email,
                password=password,
                user_metadata={
                    "company_id": company_id,
                    "app_role": normalize_role(app_role)
                }
            )

            if not result.get("user"):
                raise AuthenticationException("No se pudo crear el usuario")

            user_id = str(result["user"].id)

            # Crear perfil de usuario
            try:
                normalized_role = normalize_role(app_role)
                self.user_repository.create_user_profile(
                    user_id=user_id,
                    company_id=company_id,
                    app_role=normalized_role
                )
            except Exception as e:
                logger.warning(f"Error creando perfil, pero usuario creado: {e}")
                # El usuario se creó en Supabase pero falló el perfil
                # Esto es un estado inconsistente, pero no fallamos completamente

            logger.info(f"Usuario registrado: {email} (ID: {user_id})")

            # Obtener perfil completo para retornar
            profile = self.user_repository.get_user_profile(user_id)
            if not profile:
                # Si no hay perfil, crear uno básico
                profile = {
                    "id": user_id,
                    "email": email,
                    "company_id": company_id,
                    "app_role": normalize_role(app_role),
                    "is_active": True
                }

            # Registrar métrica
            record_signup("success")

            self._audit_event(
                action="signup",
                user_id=user_id,
                resource="auth",
                success=True,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata={"email": email, "company_id": company_id, "app_role": normalize_role(app_role)},
            )

            # Publicar evento de dominio
            self._publish_user_registered_event(
                user_id=user_id,
                email=email,
                company_id=company_id,
                app_role=normalize_role(app_role)
            )

            return {
                "success": True,
                "user": {
                    "id": user_id,
                    "email": email,
                    "company_id": str(profile.get("company_id", company_id)),
                    "company_name": profile.get("company_name"),
                    "company_nit": profile.get("company_nit", ""),
                    "app_role": normalize_role(profile.get("app_role", app_role)),
                    "is_active": profile.get("is_active", True)
                },
                "message": "Usuario creado exitosamente. Verifica tu email."
            }

        except ValidationException:
            raise
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error en signup: {error_msg}", exc_info=True)
            if "ya está registrado" in error_msg.lower() or "already" in error_msg.lower():
                raise AuthenticationException("El usuario ya está registrado")
            elif "contraseña" in error_msg.lower() or "password" in error_msg.lower():
                raise ValidationException(error_msg)
            else:
                raise AuthenticationException(f"Error al registrar usuario: {error_msg}")

    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verifica y decodifica un JWT token

        Args:
            token: JWT token

        Returns:
            Dict con payload del token

        Raises:
            AuthenticationException: Si el token es inválido o expiró
        """
        try:
            if self.token_repository.is_token_revoked(token):
                raise AuthenticationException("Token revocado")
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            # Registrar métrica de validación exitosa
            record_token_validation("valid")
            return payload
        except AuthenticationException:
            record_token_validation("invalid")
            raise
        except JWTError as e:
            logger.warning(f"Token inválido: {e}")
            # Registrar métrica de validación fallida
            record_token_validation("invalid")
            raise AuthenticationException("Token inválido o expirado")
        except Exception as e:
            logger.error(f"Error verificando revocación de token: {e}", exc_info=True)
            record_token_validation("invalid")
            raise AuthenticationException("No se pudo validar revocación de token")

    def refresh_token(
        self,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Refresca un access token usando refresh token

        Args:
            refresh_token: Refresh token
            ip_address: IP del cliente (opcional)
            user_agent: User-Agent del cliente (opcional)

        Returns:
            Dict con nuevo access_token y refresh_token

        Raises:
            AuthenticationException: Si el refresh token es inválido
        """
        try:
            # Intentar refrescar con Supabase primero
            if self.supabase_client:
                result = self.supabase_client.refresh_session(refresh_token)
                if result:
                    # Obtener usuario del token
                    user_data = self.supabase_client.get_user(result["access_token"])
                    if user_data:
                        profile = self.user_repository.get_user_profile(user_data["id"])
                        if profile:
                            # Generar nuevo JWT
                            normalized_role = normalize_role(profile.get("app_role", DEFAULT_APP_ROLE))
                            new_access_token = self._create_access_token(
                                user_id=user_data["id"],
                                email=user_data["email"],
                                company_id=str(profile["company_id"]),
                                app_role=normalized_role
                            )

                            # Registrar métrica
                            record_refresh("success")

                            self._audit_event(
                                action="refresh",
                                user_id=user_data["id"],
                                resource="auth",
                                success=True,
                                ip_address=ip_address,
                                user_agent=user_agent,
                            )

                            # Publicar evento de dominio
                            self._publish_token_refreshed_event(user_id=user_data["id"])

                            return {
                                "access_token": new_access_token,
                                "refresh_token": result.get("refresh_token", refresh_token),
                                "token_type": "bearer",
                                "expires_in": JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
                            }

            # Fallback: validar refresh token como JWT
            payload = self.verify_token(refresh_token)
            user_id = payload.get("sub")
            if not user_id:
                raise AuthenticationException("Refresh token inválido")

            # Obtener perfil
            profile = self.user_repository.get_user_profile(user_id)
            if not profile:
                raise AuthenticationException("Usuario no encontrado")

            # Generar nuevos tokens
            normalized_role = normalize_role(profile.get("app_role", DEFAULT_APP_ROLE))
            new_access_token = self._create_access_token(
                user_id=user_id,
                email=payload.get("email", ""),
                company_id=str(profile["company_id"]),
                app_role=normalized_role
            )
            new_refresh_token = self._create_refresh_token(user_id)

            # Registrar métrica
            record_refresh("success")

            self._audit_event(
                action="refresh",
                user_id=user_id,
                resource="auth",
                success=True,
                ip_address=ip_address,
                user_agent=user_agent,
            )

            # Publicar evento de dominio
            self._publish_token_refreshed_event(user_id=user_id)

            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "expires_in": JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }

        except AuthenticationException:
            # Registrar métrica de fallo
            record_refresh("failure")
            raise
        except Exception as e:
            logger.error(f"Error refrescando token: {e}", exc_info=True)
            # Registrar métrica de fallo
            record_refresh("failure")
            raise AuthenticationException("Error al refrescar token")

    def get_current_user(self, token: str) -> Dict[str, Any]:
        """
        Obtiene el usuario actual desde un token

        Args:
            token: JWT access token

        Returns:
            Dict con información del usuario

        Raises:
            AuthenticationException: Si el token es inválido
        """
        try:
            payload = self.verify_token(token)
            user_id = payload.get("sub")
            company_id = payload.get("company_id")

            if not user_id:
                raise AuthenticationException("Token inválido: falta user_id")

            # Obtener perfil actualizado
            profile = self.user_repository.get_user_profile(user_id)
            if not profile:
                raise NotFoundException("Usuario", user_id)

            normalized_role = normalize_role(profile.get("app_role", DEFAULT_APP_ROLE))
            return {
                "id": user_id,
                "email": payload.get("email", ""),
                "company_id": company_id or str(profile["company_id"]),
                "company_name": profile.get("company_name"),
                "company_nit": profile.get("company_nit", ""),
                "app_role": normalized_role,
                "is_active": profile.get("is_active", True)
            }

        except (AuthenticationException, NotFoundException):
            raise
        except Exception as e:
            logger.error(f"Error obteniendo usuario actual: {e}", exc_info=True)
            raise AuthenticationException("Error al obtener usuario actual")

    def logout(
        self,
        token: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        """
        Cierra sesión

        Args:
            token: Token de acceso (opcional)
            user_id: ID del usuario (opcional)
            ip_address: IP del cliente (opcional)
            user_agent: User-Agent del cliente (opcional)

        Returns:
            True si se cerró exitosamente
        """
        try:
            if token:
                expires_at = self._get_token_expiration(token)
                if expires_at:
                    self.token_repository.revoke_token(token, expires_at)

            if self.supabase_client and token:
                self.supabase_client.sign_out(token)

            self._audit_event(
                action="logout",
                user_id=user_id,
                resource="auth",
                success=True,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            return True
        except Exception as e:
            logger.warning(f"Error en logout: {e}")
            return True  # Siempre retornar True para logout

    def reset_password(self, email: str) -> bool:
        """
        Envía email de recuperación de contraseña

        Args:
            email: Email del usuario

        Returns:
            True si se envió el email

        Note:
            Este endpoint delega en Supabase el flujo de cambio de contraseña.
            La política de contraseña se valida al crear/cambiar desde el servicio,
            pero el reset depende de las reglas configuradas en Supabase.
        """
        if not self.supabase_client:
            raise AuthenticationException("Servicio de autenticación no disponible")

        try:
            return self.supabase_client.reset_password_for_email(email)
        except Exception as e:
            logger.error(f"Error enviando email de recuperación: {e}")
            return False

    def change_password(
        self,
        user_id: str,
        email: str,
        current_password: str,
        new_password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        """
        Cambia la contraseña del usuario autenticado.

        Args:
            user_id: ID del usuario
            email: Email del usuario
            current_password: Contraseña actual
            new_password: Nueva contraseña
            ip_address: IP del cliente (opcional)
            user_agent: User-Agent del cliente (opcional)
        """
        if not self.supabase_client:
            raise AuthenticationException("Servicio de autenticación no disponible")

        if not email:
            raise ValidationException("Email de usuario no disponible")

        try:
            try:
                validate_password_strength(new_password)
            except ValueError as e:
                raise ValidationException(str(e))

            self.supabase_client.change_password(
                email=email,
                current_password=current_password,
                new_password=new_password,
            )

            self._audit_event(
                action="change_password",
                user_id=user_id,
                resource="auth",
                success=True,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            return True
        except ValidationException:
            raise
        except Exception as e:
            error_msg = str(e)
            if "Credenciales inválidas" in error_msg:
                self._audit_event(
                    action="change_password",
                    user_id=user_id,
                    resource="auth",
                    success=False,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata={"reason": "INVALID_CURRENT_PASSWORD"},
                )
                raise AuthenticationException("Contraseña actual incorrecta")
            self._audit_event(
                action="change_password",
                user_id=user_id,
                resource="auth",
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata={"reason": "ERROR"},
            )
            logger.error(f"Error cambiando contraseña: {error_msg}", exc_info=True)
            raise ProcessingException("No se pudo cambiar la contraseña")

    def _create_access_token(
        self,
        user_id: str,
        email: str,
        company_id: str,
        app_role: str
    ) -> str:
        """
        Crea un JWT access token

        Args:
            user_id: ID del usuario
            email: Email del usuario
            company_id: ID de la empresa
            app_role: Rol de aplicación

        Returns:
            JWT token codificado
        """
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        normalized_role = normalize_role(app_role)
        payload = {
            "sub": user_id,
            "email": email,
            "company_id": company_id,
            "app_role": normalized_role,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    def _create_refresh_token(self, user_id: str) -> str:
        """
        Crea un JWT refresh token

        Args:
            user_id: ID del usuario

        Returns:
            JWT refresh token codificado
        """
        expire = datetime.utcnow() + timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    def _get_token_expiration(self, token: str) -> Optional[datetime]:
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            exp = payload.get("exp")
            if exp:
                return datetime.utcfromtimestamp(exp)
            return None
        except Exception:
            return None

    def _audit_event(
        self,
        action: str,
        user_id: Optional[str],
        resource: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        try:
            self.audit_repository.log_event(
                action=action,
                user_id=user_id,
                resource=resource,
                success=success,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata=metadata,
            )
        except Exception as e:
            logger.warning(f"No se pudo registrar auditoría: {e}")

    def _publish_user_logged_in_event(
        self,
        user_id: str,
        email: str,
        company_id: str,
        app_role: str
    ):
        """
        Publica evento de dominio cuando un usuario inicia sesión exitosamente

        Args:
            user_id: ID del usuario
            email: Email del usuario
            company_id: ID de la empresa
            app_role: Rol de aplicación
        """
        event_name = "auth.user.logged_in"
        payload = {
            "user_id": user_id,
            "email": email,
            "company_id": company_id,
            "app_role": app_role
        }
        metadata = {
            "source": "auth-service"
        }

        # Intentar publicar evento usando Event Bus compartido
        if _event_publisher:
            try:
                success = _event_publisher.publish_event(
                    event_name=event_name,
                    payload=payload,
                    metadata=metadata
                )
                if success:
                    record_event_published(event_name)
                else:
                    record_event_failed(event_name)
            except Exception as e:
                logger.warning(f"Error publicando evento {event_name}: {e}")
                record_event_failed(event_name)

        # Log estructurado como fallback
        logger.info(
            "User logged in",
            extra={
                "event": event_name,
                "user_id": user_id,
                "email": email,
                "company_id": company_id,
                "app_role": app_role
            }
        )

    def _publish_login_failed_event(
        self,
        email: str,
        reason: str
    ):
        """
        Publica evento de dominio cuando falla un intento de login

        Args:
            email: Email del usuario que intentó iniciar sesión
            reason: Razón del fallo (ej: "INVALID_CREDENTIALS", "USER_INACTIVE")
        """
        event_name = "auth.user.login_failed"
        payload = {
            "email": email,  # No incluir password por seguridad
            "reason": reason
        }
        metadata = {
            "source": "auth-service"
        }

        # Intentar publicar evento usando Event Bus compartido
        if _event_publisher:
            try:
                success = _event_publisher.publish_event(
                    event_name=event_name,
                    payload=payload,
                    metadata=metadata
                )
                if success:
                    record_event_published(event_name)
                else:
                    record_event_failed(event_name)
            except Exception as e:
                logger.warning(f"Error publicando evento {event_name}: {e}")
                record_event_failed(event_name)

        # Log estructurado como fallback
        logger.warning(
            "Login failed",
            extra={
                "event": event_name,
                "email": email,
                "reason": reason
            }
        )

    def _publish_user_registered_event(
        self,
        user_id: str,
        email: str,
        company_id: str,
        app_role: str
    ):
        """
        Publica evento de dominio cuando se registra un nuevo usuario

        Args:
            user_id: ID del usuario
            email: Email del usuario
            company_id: ID de la empresa
            app_role: Rol de aplicación
        """
        event_name = "auth.user.registered"
        payload = {
            "user_id": user_id,
            "email": email,
            "company_id": company_id,
            "app_role": app_role
        }
        metadata = {
            "source": "auth-service"
        }

        # Intentar publicar evento usando Event Bus compartido
        if _event_publisher:
            try:
                success = _event_publisher.publish_event(
                    event_name=event_name,
                    payload=payload,
                    metadata=metadata
                )
                if success:
                    record_event_published(event_name)
                else:
                    record_event_failed(event_name)
            except Exception as e:
                logger.warning(f"Error publicando evento {event_name}: {e}")
                record_event_failed(event_name)

        # Log estructurado como fallback
        logger.info(
            "User registered",
            extra={
                "event": event_name,
                "user_id": user_id,
                "email": email,
                "company_id": company_id,
                "app_role": app_role
            }
        )

    def _publish_token_refreshed_event(
        self,
        user_id: str
    ):
        """
        Publica evento de dominio cuando se refresca un token

        Args:
            user_id: ID del usuario
        """
        event_name = "auth.token.refreshed"
        payload = {
            "user_id": user_id
        }
        metadata = {
            "source": "auth-service"
        }

        # Intentar publicar evento usando Event Bus compartido
        if _event_publisher:
            try:
                success = _event_publisher.publish_event(
                    event_name=event_name,
                    payload=payload,
                    metadata=metadata
                )
                if success:
                    record_event_published(event_name)
                else:
                    record_event_failed(event_name)
            except Exception as e:
                logger.warning(f"Error publicando evento {event_name}: {e}")
                record_event_failed(event_name)

        # Log estructurado como fallback
        logger.info(
            "Token refreshed",
            extra={
                "event": event_name,
                "user_id": user_id
            }
        )
