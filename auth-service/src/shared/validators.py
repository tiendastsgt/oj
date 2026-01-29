"""
Validadores compartidos del servicio
"""
import re
from typing import Tuple


PASSWORD_MIN_LENGTH = 8
PASSWORD_COMPLEXITY_RULES: Tuple[Tuple[str, str], ...] = (
    (r"[A-Z]", "al menos una letra mayúscula"),
    (r"[a-z]", "al menos una letra minúscula"),
    (r"\d", "al menos un número"),
    (r"[^\w\s]", "al menos un símbolo"),
)


def validate_password_strength(password: str) -> None:
    """
    Valida que una contraseña cumpla con la política de seguridad.

    Args:
        password: Contraseña a validar

    Raises:
        ValueError: Si la contraseña no cumple los requisitos
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(
            f"La contraseña debe tener al menos {PASSWORD_MIN_LENGTH} caracteres"
        )

    if re.search(r"\s", password):
        raise ValueError("La contraseña no debe contener espacios")

    for pattern, message in PASSWORD_COMPLEXITY_RULES:
        if not re.search(pattern, password):
            raise ValueError(f"La contraseña debe incluir {message}")
