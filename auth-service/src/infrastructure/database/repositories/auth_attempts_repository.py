"""
Repositorio de intentos de autenticación
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple

from psycopg2.extras import RealDictCursor

from src.infrastructure.database.connection import db_connection
from src.shared.exceptions import DatabaseException

logger = logging.getLogger(__name__)


class AuthAttemptsRepository:
    """
    Repositorio para manejo de intentos de autenticación
    """

    def _get_attempts(self, email: str) -> Optional[Tuple[int, Optional[datetime]]]:
        if not db_connection:
            return None

        with db_connection.get_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                """
                SELECT attempts, locked_until
                FROM auth_attempts
                WHERE email = %s
                LIMIT 1
                """,
                (email,),
            )
            row = cur.fetchone()
            if row:
                return int(row["attempts"]), row["locked_until"]
            return None

    def is_locked_out(self, email: str) -> Optional[datetime]:
        """
        Verifica si el usuario está bloqueado por intentos fallidos.

        Args:
            email: Email del usuario

        Returns:
            datetime con locked_until si está bloqueado, None si no
        """
        if not db_connection:
            return None

        try:
            attempt_data = self._get_attempts(email)
            if not attempt_data:
                return None
            _, locked_until = attempt_data
            if locked_until and locked_until > datetime.utcnow():
                return locked_until
            return None
        except Exception as e:
            logger.error(f"Error consultando lockout: {e}", exc_info=True)
            raise DatabaseException("Error al verificar bloqueo de cuenta")

    def record_failed_attempt(
        self,
        email: str,
        max_attempts: int,
        lock_minutes: int,
    ) -> Optional[datetime]:
        """
        Registra un intento fallido y aplica bloqueo si corresponde.

        Args:
            email: Email del usuario
            max_attempts: Límite de intentos fallidos
            lock_minutes: Minutos de bloqueo

        Returns:
            datetime con locked_until si se bloquea, None si no
        """
        if not db_connection:
            return None

        try:
            now = datetime.utcnow()
            attempt_data = self._get_attempts(email)
            current_attempts = attempt_data[0] if attempt_data else 0
            attempts = current_attempts + 1
            locked_until = None

            if attempts >= max_attempts:
                locked_until = now + timedelta(minutes=lock_minutes)

            with db_connection.get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO auth_attempts (email, attempts, locked_until, updated_at)
                    VALUES (%s, %s, %s, NOW())
                    ON CONFLICT (email)
                    DO UPDATE SET
                        attempts = EXCLUDED.attempts,
                        locked_until = EXCLUDED.locked_until,
                        updated_at = NOW()
                    """,
                    (email, attempts, locked_until),
                )

            return locked_until
        except Exception as e:
            logger.error(f"Error registrando intento fallido: {e}", exc_info=True)
            raise DatabaseException("Error al registrar intento fallido")

    def clear_attempts(self, email: str) -> None:
        """
        Limpia el contador de intentos fallidos.

        Args:
            email: Email del usuario
        """
        if not db_connection:
            return

        try:
            with db_connection.get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    """
                    UPDATE auth_attempts
                    SET attempts = 0,
                        locked_until = NULL,
                        updated_at = NOW()
                    WHERE email = %s
                    """,
                    (email,),
                )
        except Exception as e:
            logger.error(f"Error limpiando intentos: {e}", exc_info=True)
            raise DatabaseException("Error al limpiar intentos fallidos")
