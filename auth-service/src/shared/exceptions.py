"""
Excepciones personalizadas del microservicio de autenticación
"""
from typing import Optional


class ServiceException(Exception):
    """Excepción base del servicio"""
    pass


class ValidationException(ServiceException):
    """
    Excepción de validación de datos

    Se lanza cuando los datos proporcionados no cumplen con las reglas de validación.

    Example:
        ```python
        if not data.get('required_field'):
            raise ValidationException("El campo 'required_field' es obligatorio")
        ```
    """
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundException(ServiceException):
    """
    Recurso no encontrado

    Se lanza cuando se intenta acceder a un recurso que no existe.

    Example:
        ```python
        if not item:
            raise NotFoundException("Item", item_id)
        ```
    """
    def __init__(self, resource: str, resource_id: Optional[str] = None):
        if resource_id:
            message = f"{resource} con ID '{resource_id}' no encontrado"
        else:
            message = f"{resource} no encontrado"
        self.resource = resource
        self.resource_id = resource_id
        super().__init__(message)


class AuthenticationException(ServiceException):
    """
    Error de autenticación

    Se lanza cuando las credenciales son inválidas o el usuario no está autorizado.
    """
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class DatabaseException(ServiceException):
    """
    Error de base de datos

    Se lanza cuando ocurre un error al acceder a la base de datos.
    """
    pass


class ProcessingException(ServiceException):
    """
    Error procesando operación

    Se lanza cuando ocurre un error durante el procesamiento de una operación de negocio.
    """
    pass
