"""
Cliente de Supabase Auth
Wrapper para integración con Supabase Authentication
"""
import os
import logging
import importlib.util
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

# Detección de Supabase
SUPABASE_AVAILABLE = False
create_client = None
Client = None
SupabaseException = Exception  # Fallback para type hints

spec = importlib.util.find_spec("supabase")
if spec is not None:
    try:
        from supabase import create_client, Client  # noqa
        try:
            from supabase.lib.client_options import ClientOptions
            SUPABASE_AVAILABLE = True
            logger.info("Supabase client v2.24.0+ detectado y disponible")
        except ImportError:
            SUPABASE_AVAILABLE = True
            logger.info("Supabase client detectado y disponible")
    except Exception as e:
        logger.warning(f"Supabase instalado pero no funcional: {e}")
        SUPABASE_AVAILABLE = False
else:
    logger.warning("Supabase client no disponible. Instala: pip install supabase")

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False


def load_env_file():
    """Carga el archivo .env desde múltiples ubicaciones"""
    # Raíz del proyecto monolito
    base_dir = Path(__file__).resolve().parents[5]
    root_env = base_dir / ".env"
    if root_env.exists():
        load_dotenv(root_env, override=True)
        return True

    # Directorio del microservicio
    local_env = Path(__file__).resolve().parents[4] / ".env"
    if local_env.exists():
        load_dotenv(local_env, override=True)
        return True

    # Directorio actual
    cwd_env = Path.cwd() / ".env"
    if cwd_env.exists():
        load_dotenv(cwd_env, override=True)
        return True

    # Búsqueda automática
    loaded = load_dotenv(override=False)
    return loaded


# Cargar .env al importar
if DOTENV_AVAILABLE:
    load_env_file()


class SupabaseAuthClient:
    """
    Cliente de Supabase Auth para autenticación

    Wrapper alrededor del cliente de Supabase que maneja:
    - Login
    - Signup
    - Logout
    - Verificación de tokens
    - Recuperación de contraseña
    """

    def __init__(self):
        if not SUPABASE_AVAILABLE:
            raise RuntimeError(
                "Supabase client no está instalado. Ejecuta: pip install supabase"
            )

        # Cargar variables de entorno
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_ANON_KEY")

        if not url or not key:
            if DOTENV_AVAILABLE:
                base_dir = Path(__file__).resolve().parents[5]
                env_file = base_dir / ".env"
                if env_file.exists():
                    load_dotenv(env_file, override=False)
                    url = os.environ.get("SUPABASE_URL") or url
                    key = os.environ.get("SUPABASE_ANON_KEY") or key

        if not url or not key:
            error_msg = (
                "SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados.\n"
                "Agrega estas variables a tu archivo .env:\n"
                "  SUPABASE_URL=https://tu_proyecto.supabase.co\n"
                "  SUPABASE_ANON_KEY=tu_anon_key_aqui"
            )
            raise RuntimeError(error_msg)

        self.supabase: Client = create_client(url, key)
        logger.info("SupabaseAuthClient inicializado")

    def sign_in_with_password(self, email: str, password: str) -> Dict[str, Any]:
        """
        Inicia sesión con email y contraseña

        Args:
            email: Email del usuario
            password: Contraseña

        Returns:
            Dict con user y session

        Raises:
            Exception: Si las credenciales son inválidas
        """
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if not response.user:
                raise Exception("Credenciales inválidas")

            return {
                "user": response.user,
                "session": response.session
            }
        except Exception as e:
            error_msg = str(e)
            if "Invalid login credentials" in error_msg or "invalid_credentials" in error_msg.lower():
                raise Exception("Credenciales inválidas")
            elif "Email not confirmed" in error_msg or "email_not_confirmed" in error_msg.lower():
                raise Exception("Email no confirmado. Verifica tu correo electrónico.")
            else:
                logger.error(f"Error en sign_in_with_password: {error_msg}", exc_info=True)
                raise Exception(f"Error en autenticación: {error_msg}")

    def sign_up(self, email: str, password: str, user_metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Registra un nuevo usuario

        Args:
            email: Email del usuario
            password: Contraseña
            user_metadata: Metadatos adicionales

        Returns:
            Dict con user y session

        Raises:
            Exception: Si hay error al registrar
        """
        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": user_metadata or {}
                }
            })

            if response.user:
                logger.info(f"Usuario registrado: {email} (ID: {response.user.id})")
                return {
                    "user": response.user,
                    "session": response.session
                }
            else:
                raise Exception("No se pudo crear el usuario")

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error en sign_up: {error_msg}")
            if "User already registered" in error_msg or "already_registered" in error_msg.lower():
                raise Exception("El usuario ya está registrado")
            elif "Password should be at least" in error_msg or "password_too_short" in error_msg.lower():
                raise Exception("La contraseña es demasiado corta")
            else:
                raise Exception(f"Error al registrar usuario: {error_msg}")

    def get_user(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene el usuario actual por access_token

        Args:
            access_token: Token de sesión

        Returns:
            Dict con información del usuario o None
        """
        try:
            response = self.supabase.auth.get_user(access_token)
            if response.user:
                return {
                    "id": str(response.user.id),
                    "email": response.user.email,
                    "user_metadata": response.user.user_metadata or {},
                    "created_at": response.user.created_at
                }
            return None
        except Exception as e:
            logger.error(f"Error obteniendo usuario: {e}")
            return None

    def sign_out(self, access_token: Optional[str] = None):
        """
        Cierra sesión

        Args:
            access_token: Token de acceso (opcional)
        """
        try:
            self.supabase.auth.sign_out()
        except Exception as e:
            logger.warning(f"Error en sign_out: {e}")

    def reset_password_for_email(self, email: str) -> bool:
        """
        Envía email de recuperación de contraseña

        Args:
            email: Email del usuario

        Returns:
            True si se envió el email
        """
        try:
            self.supabase.auth.reset_password_for_email(email)
            logger.info(f"Email de recuperación enviado a {email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando email de recuperación: {e}")
            return False

    def change_password(self, email: str, current_password: str, new_password: str) -> None:
        """
        Cambia la contraseña del usuario autenticado.

        Args:
            email: Email del usuario
            current_password: Contraseña actual
            new_password: Nueva contraseña

        Raises:
            Exception: Si las credenciales son inválidas o falla la actualización
        """
        try:
            result = self.sign_in_with_password(email, current_password)
            session = result.get("session")
            if not session:
                raise Exception("Credenciales inválidas")

            if hasattr(self.supabase.auth, "set_session"):
                try:
                    self.supabase.auth.set_session(session.access_token, session.refresh_token)
                except Exception as e:
                    logger.warning(f"No se pudo establecer sesión Supabase: {e}")

            try:
                self.supabase.auth.update_user({"password": new_password})
            except TypeError:
                self.supabase.auth.update_user({"password": new_password}, session.access_token)

            logger.info(f"Contraseña actualizada para {email}")
        except Exception as e:
            error_msg = str(e)
            if "Credenciales inválidas" in error_msg:
                raise Exception("Credenciales inválidas")
            logger.error(f"Error cambiando contraseña: {error_msg}", exc_info=True)
            raise Exception(f"Error al cambiar contraseña: {error_msg}")

    def refresh_session(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Refresca una sesión usando refresh_token

        Args:
            refresh_token: Token de refresco

        Returns:
            Dict con nueva session o None
        """
        try:
            response = self.supabase.auth.refresh_session(refresh_token)
            if response.session:
                return {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "expires_at": response.session.expires_at
                }
            return None
        except Exception as e:
            logger.error(f"Error refrescando sesión: {e}")
            return None
