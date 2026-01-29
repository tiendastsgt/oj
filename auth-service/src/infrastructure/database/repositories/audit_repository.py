"""
Repositorio de auditoría
"""
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from psycopg2.extras import Json

from src.infrastructure.database.connection import db_connection
from src.shared.exceptions import DatabaseException

logger = logging.getLogger(__name__)


class AuditRepository:
    """
    Repositorio para registrar eventos de auditoría
    """

    def log_event(
        self,
        action: str,
        user_id: Optional[str],
        resource: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        occurred_at: Optional[datetime] = None,
    ) -> None:
        """
        Registra un evento de auditoría.

        Args:
            action: Acción realizada (login, logout, refresh, signup, etc.)
            user_id: ID del usuario (opcional si no autenticado)
            resource: Recurso afectado
            success: Resultado del evento
            ip_address: IP origen
            user_agent: User-Agent del cliente
            metadata: Metadata adicional
            occurred_at: Timestamp del evento
        """
        if not db_connection:
            logger.warning("db_connection no disponible para auditoría")
            return

        try:
            with db_connection.get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO audit_logs (
                        action,
                        user_id,
                        resource,
                        success,
                        ip_address,
                        user_agent,
                        metadata,
                        occurred_at,
                        created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    """,
                    (
                        action,
                        user_id,
                        resource,
                        success,
                        ip_address,
                        user_agent,
                        Json(metadata or {}),
                        occurred_at or datetime.utcnow(),
                    ),
                )
        except Exception as e:
            logger.error(f"Error registrando auditoría: {e}", exc_info=True)
            raise DatabaseException("Error al registrar auditoría")
