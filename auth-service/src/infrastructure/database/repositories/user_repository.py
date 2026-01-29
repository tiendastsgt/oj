"""
Repositorio de usuarios
Acceso a datos de user_profile y company
"""
import logging
from typing import Optional, Dict, Any

from psycopg2.extras import RealDictCursor

from src.infrastructure.database.connection import db_connection
from src.shared.exceptions import NotFoundException, DatabaseException
from src.shared.rbac import DEFAULT_APP_ROLE

logger = logging.getLogger(__name__)


class UserRepository:
    """
    Repositorio para acceso a datos de usuarios y perfiles

    Maneja:
    - Obtener perfil de usuario por user_id
    - Crear perfil de usuario
    - Actualizar perfil de usuario
    - Verificar existencia de usuario
    """

    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene el perfil completo del usuario con company_id y rol

        Args:
            user_id: UUID del usuario (auth.users.id)

        Returns:
            Dict con user_profile o None

        Raises:
            DatabaseException: Si hay error al acceder a la BD
        """
        try:
            if not db_connection:
                logger.warning("db_connection no disponible")
                return None

            with db_connection.get_connection() as conn:
                cur = conn.cursor(cursor_factory=RealDictCursor)
                cur.execute("""
                    SELECT
                        up.id,
                        up.user_id,
                        up.company_id,
                        up.app_role,
                        up.is_active,
                        c.name as company_name,
                        COALESCE(c.tax_id, '') as company_nit,
                        c.base_currency_code,
                        c.country_code
                    FROM user_profile up
                    JOIN company c ON c.id = up.company_id
                    WHERE up.user_id = %s::uuid AND up.is_active = true
                    LIMIT 1
                """, (user_id,))

                row = cur.fetchone()
                if row:
                    profile = dict(row)
                    return profile
                return None

        except Exception as e:
            logger.error(f"Error obteniendo perfil de usuario {user_id}: {e}", exc_info=True)
            raise DatabaseException(f"Error al obtener perfil de usuario: {str(e)}")

    def create_user_profile(
        self,
        user_id: str,
        company_id: str,
        app_role: str = DEFAULT_APP_ROLE
    ) -> str:
        """
        Crea el perfil de usuario vinculado a una empresa

        Args:
            user_id: UUID del usuario (auth.users.id)
            company_id: UUID de la empresa
            app_role: Rol de aplicación (ADMINISTRADOR, SECRETARIO, AUXILIAR, CONSULTA)

        Returns:
            ID del perfil creado

        Raises:
            DatabaseException: Si hay error al crear el perfil
        """
        try:
            if not db_connection:
                raise DatabaseException("db_connection no disponible")

            with db_connection.get_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO user_profile (user_id, company_id, app_role, is_active)
                    VALUES (%s::uuid, %s::uuid, %s, true)
                    RETURNING id
                """, (user_id, company_id, app_role))

                profile_id = cur.fetchone()[0]
                conn.commit()

                logger.info(f"Perfil creado para user {user_id} en company {company_id}")
                return str(profile_id)

        except Exception as e:
            logger.error(f"Error creando perfil de usuario: {e}", exc_info=True)
            raise DatabaseException(f"Error al crear perfil de usuario: {str(e)}")

    def update_user_profile(
        self,
        user_id: str,
        **kwargs
    ) -> bool:
        """
        Actualiza el perfil de usuario

        Args:
            user_id: UUID del usuario
            **kwargs: Campos a actualizar (app_role, is_active, etc.)

        Returns:
            True si se actualizó correctamente

        Raises:
            DatabaseException: Si hay error al actualizar
        """
        try:
            if not db_connection:
                raise DatabaseException("db_connection no disponible")

            if not kwargs:
                return False

            # Construir query dinámico
            set_clauses = []
            values = []
            for key, value in kwargs.items():
                if key in ["app_role", "is_active"]:
                    set_clauses.append(f"{key} = %s")
                    values.append(value)

            if not set_clauses:
                return False

            values.append(user_id)

            with db_connection.get_connection() as conn:
                cur = conn.cursor()
                query = f"""
                    UPDATE user_profile
                    SET {', '.join(set_clauses)}
                    WHERE user_id = %s::uuid
                    RETURNING id
                """
                cur.execute(query, values)
                result = cur.fetchone()
                conn.commit()

                if result:
                    logger.info(f"Perfil actualizado para user {user_id}")
                    return True
                return False

        except Exception as e:
            logger.error(f"Error actualizando perfil de usuario: {e}", exc_info=True)
            raise DatabaseException(f"Error al actualizar perfil de usuario: {str(e)}")

    def user_profile_exists(self, user_id: str) -> bool:
        """
        Verifica si existe un perfil para el usuario

        Args:
            user_id: UUID del usuario

        Returns:
            True si existe el perfil
        """
        try:
            profile = self.get_user_profile(user_id)
            return profile is not None
        except Exception:
            return False
