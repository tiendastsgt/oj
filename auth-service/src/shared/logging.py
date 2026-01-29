"""
Configuración de logging estructurado
"""
import json
import logging
import os
import sys
from contextvars import ContextVar
from datetime import datetime
from logging.handlers import RotatingFileHandler
from typing import Optional, Dict, Any


REQUEST_ID_CONTEXT: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
USER_ID_CONTEXT: ContextVar[Optional[str]] = ContextVar("user_id", default=None)


def set_request_id(request_id: Optional[str]) -> None:
    """
    Establece el request_id en el contexto actual.

    Args:
        request_id: ID de la petición
    """
    REQUEST_ID_CONTEXT.set(request_id)


def set_user_id(user_id: Optional[str]) -> None:
    """
    Establece el user_id en el contexto actual.

    Args:
        user_id: ID del usuario autenticado
    """
    USER_ID_CONTEXT.set(user_id)


def get_request_id() -> Optional[str]:
    """
    Obtiene el request_id del contexto actual.

    Returns:
        request_id o None
    """
    return REQUEST_ID_CONTEXT.get()


def get_user_id() -> Optional[str]:
    """
    Obtiene el user_id del contexto actual.

    Returns:
        user_id o None
    """
    return USER_ID_CONTEXT.get()


class JsonLogFormatter(logging.Formatter):
    """Formatter para logging en formato JSON."""

    def format(self, record: logging.LogRecord) -> str:
        base: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": get_request_id(),
            "user_id": get_user_id(),
        }

        if record.exc_info:
            base["exception"] = self.formatException(record.exc_info)

        extra_fields = {
            key: value
            for key, value in record.__dict__.items()
            if key
            not in {
                "name",
                "msg",
                "args",
                "levelname",
                "levelno",
                "pathname",
                "filename",
                "module",
                "exc_info",
                "exc_text",
                "stack_info",
                "lineno",
                "funcName",
                "created",
                "msecs",
                "relativeCreated",
                "thread",
                "threadName",
                "processName",
                "process",
            }
        }

        if extra_fields:
            base["extra"] = extra_fields

        return json.dumps(base, ensure_ascii=True)


def setup_logging(level: Optional[str] = None) -> logging.Logger:
    """
    Configura logging estructurado para el servicio

    Args:
        level: Nivel de logging (DEBUG, INFO, WARNING, ERROR). Si no se proporciona,
               se lee de la variable de entorno LOG_LEVEL o se usa INFO por defecto.

    Returns:
        Logger configurado con el nombre del servicio

    Example:
        ```python
        from src.shared.logging import setup_logging
        logger = setup_logging()
        logger.info("Servicio iniciado")
        ```
    """
    log_level = level or os.getenv("LOG_LEVEL", "INFO").upper()

    logger = logging.getLogger("auth_service")
    logger.setLevel(getattr(logging, log_level, logging.INFO))
    logger.propagate = False

    if logger.handlers:
        return logger

    formatter = JsonLogFormatter()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    if not root_logger.handlers:
        root_logger.addHandler(console_handler)

    log_file_path = os.getenv("LOG_FILE_PATH")
    if log_file_path:
        max_bytes = int(os.getenv("LOG_FILE_MAX_BYTES", "10485760"))
        backup_count = int(os.getenv("LOG_FILE_BACKUP_COUNT", "5"))
        file_handler = RotatingFileHandler(
            log_file_path,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        root_logger.addHandler(file_handler)

    return logger
