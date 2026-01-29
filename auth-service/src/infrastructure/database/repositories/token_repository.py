"""
Repositorio de tokens revocados
"""
import hashlib
import logging
from datetime import datetime
from typing import Optional

from psycopg2.extras import RealDictCursor

from src.infrastructure.database.connection import db_connection
from src.shared.exceptions import DatabaseException

logger = logging.getLogger(__name__)


class TokenRepository:
    """
    Repositorio para manejo de tokens revocados
    """

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def revoke_token(self, token: str, expires_at: datetime) -> None:
        """
        Registra un token como revocado.

        Args:
            token: JWT token en texto plano
            expires_at: Fecha de expiración del token
        """
        if not db_connection:
            logger.warning("db_connection no disponible para revocar token")
            return

        token_hash = self._hash_token(token)

        try:
            with db_connection.get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO revoked_tokens (token_hash, revoked_at, expires_at)
                    VALUES (%s, NOW(), %s)
                    ON CONFLICT (token_hash) DO NOTHING
                    """,
                    (token_hash, expires_at),
                )
        except Exception as e:
            logger.error(f"Error revocando token: {e}", exc_info=True)
            raise DatabaseException("Error al revocar token")

    def is_token_revoked(self, token: str) -> bool:
        """
        Verifica si un token fue revocado.

        Args:
            token: JWT token en texto plano

        Returns:
            True si el token está revocado
        """
        if not db_connection:
            raise DatabaseException("db_connection no disponible para validar revocación")

        token_hash = self._hash_token(token)

        try:
            with db_connection.get_connection() as conn:
                cur = conn.cursor(cursor_factory=RealDictCursor)
                cur.execute(
                    """
                    SELECT token_hash
                    FROM revoked_tokens
                    WHERE token_hash = %s
                      AND (expires_at IS NULL OR expires_at > NOW())
                    LIMIT 1
                    """,
                    (token_hash,),
                )
                return cur.fetchone() is not None
        except Exception as e:
            logger.error(f"Error verificando revocación de token: {e}", exc_info=True)
            raise DatabaseException("Error al verificar revocación de token")
