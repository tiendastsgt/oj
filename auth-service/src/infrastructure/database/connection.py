"""
Conexión a base de datos PostgreSQL (Supabase)
Pool de conexiones thread-safe
"""
import os
import logging
from pathlib import Path
from typing import Optional
from contextlib import contextmanager

from dotenv import load_dotenv

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from psycopg2.pool import ThreadedConnectionPool
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logging.warning("psycopg2 no disponible")

logger = logging.getLogger(__name__)


def load_env_file():
    """
    Carga el archivo .env desde múltiples ubicaciones posibles

    Busca en:
    1. Raíz del proyecto monolito (4 niveles arriba)
    2. Directorio del microservicio (3 niveles arriba)
    3. Directorio actual de trabajo
    4. Búsqueda automática de dotenv
    """
    # 1. Raíz del proyecto monolito (4 niveles arriba desde este archivo)
    base_dir = Path(__file__).resolve().parents[4]
    root_env = base_dir / ".env"
    if root_env.exists():
        load_dotenv(root_env, override=True)
        logger.info(f"Cargado .env desde raíz del proyecto: {root_env}")
        return True

    # 2. Directorio del microservicio (3 niveles arriba)
    local_env = Path(__file__).resolve().parents[3] / ".env"
    if local_env.exists():
        load_dotenv(local_env, override=True)
        logger.info(f"Cargado .env local del microservicio: {local_env}")
        return True

    # 3. Directorio actual de trabajo (donde se ejecuta uvicorn)
    cwd_env = Path.cwd() / ".env"
    if cwd_env.exists():
        load_dotenv(cwd_env, override=True)
        logger.info(f"Cargado .env desde directorio actual: {cwd_env}")
        return True

    # 4. Intentar cargar desde cualquier .env en el path (dotenv busca automáticamente)
    loaded = load_dotenv(override=False)
    if loaded:
        logger.info("Cargado .env desde búsqueda automática de dotenv")
        return True

    logger.warning("No se encontró archivo .env, usando variables de entorno del sistema")
    return False


# Cargar .env al importar
load_env_file()


class DatabaseConnection:
    """
    Gestor de pool de conexiones PostgreSQL thread-safe

    Usage:
        ```python
        from src.infrastructure.database.connection import db_connection
        from psycopg2.extras import RealDictCursor

        with db_connection.get_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM table WHERE id = %s", (item_id,))
            row = cur.fetchone()
        ```
    """

    def __init__(self):
        self.pool: Optional[ThreadedConnectionPool] = None
        self._initialize_pool()

    def _initialize_pool(self):
        """Inicializa el pool de conexiones"""
        if not PSYCOPG2_AVAILABLE:
            raise Exception(
                "psycopg2-binary no está instalado. Ejecuta: pip install psycopg2-binary"
            )

        # Leer URL de conexión desde variables de entorno
        db_url = os.getenv("AUTH_DB_URL") or os.getenv("SUPABASE_DB_URL")
        if not db_url:
            raise Exception(
                "SUPABASE_DB_URL o AUTH_DB_URL no configurado en variables de entorno"
            )

        try:
            # Crear pool de conexiones
            # minconn=1, maxconn=10 para desarrollo
            # Ajustar según necesidades en producción
            self.pool = ThreadedConnectionPool(
                minconn=1,
                maxconn=10,
                dsn=db_url
            )
            logger.info("Pool de conexiones PostgreSQL inicializado")
        except Exception as e:
            logger.error(f"Error inicializando pool de conexiones: {e}")
            raise

    @contextmanager
    def get_connection(self):
        """
        Obtiene una conexión del pool (context manager)

        Nota: Los cursors deben crearse con RealDictCursor para compatibilidad:
            from psycopg2.extras import RealDictCursor
            cur = conn.cursor(cursor_factory=RealDictCursor)

        Yields:
            psycopg2.connection: Conexión a PostgreSQL

        Raises:
            Exception: Si el pool no está inicializado

        Example:
            ```python
            with db_connection.get_connection() as conn:
                cur = conn.cursor(cursor_factory=RealDictCursor)
                cur.execute("SELECT * FROM table WHERE id = %s", (item_id,))
                row = cur.fetchone()
            ```
        """
        if not self.pool:
            raise Exception("Pool de conexiones no inicializado")

        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Error en transacción: {e}")
            raise
        finally:
            self.pool.putconn(conn)

    def close(self):
        """Cierra el pool de conexiones"""
        if self.pool:
            self.pool.closeall()
            logger.info("Pool de conexiones cerrado")


# Instancia global (similar al monolito: permite None si falla la inicialización)
try:
    db_connection = DatabaseConnection()
except Exception as e:
    # Si no está configurado, crear instancia None para evitar errores de importación
    db_connection = None
    logger.warning(f"DatabaseConnection no inicializado - {str(e)}")
    logger.warning(
        "Asegúrate de configurar SUPABASE_DB_URL o AUTH_DB_URL en variables de entorno"
    )
