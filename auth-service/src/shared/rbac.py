"""
RBAC helpers y roles oficiales SGED.
"""
from typing import Dict, List, Optional


SGED_ROLES = (
    "ADMINISTRADOR",
    "SECRETARIO",
    "AUXILIAR",
    "CONSULTA",
)

DEFAULT_APP_ROLE = "CONSULTA"

ROLE_ALIASES = {
    "admin": "ADMINISTRADOR",
    "administrador": "ADMINISTRADOR",
    "secretario": "SECRETARIO",
    "ventas": "SECRETARIO",
    "auxiliar": "AUXILIAR",
    "almacen": "AUXILIAR",
    "user": "CONSULTA",
    "consulta": "CONSULTA",
}

DEFAULT_ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "ADMINISTRADOR": ["auth:read", "auth:write", "auth:admin"],
    "SECRETARIO": ["auth:read", "auth:write"],
    "AUXILIAR": ["auth:read"],
    "CONSULTA": ["auth:read"],
}


def normalize_role(role: Optional[str]) -> str:
    if not role:
        return DEFAULT_APP_ROLE

    role_str = role.strip()
    if not role_str:
        return DEFAULT_APP_ROLE

    if role_str in SGED_ROLES:
        return role_str

    lowered = role_str.lower()
    if lowered in ROLE_ALIASES:
        return ROLE_ALIASES[lowered]

    upper = role_str.upper()
    if upper in SGED_ROLES:
        return upper

    return DEFAULT_APP_ROLE


def is_valid_role(role: Optional[str]) -> bool:
    return normalize_role(role) in SGED_ROLES
