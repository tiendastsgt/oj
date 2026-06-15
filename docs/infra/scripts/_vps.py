"""Helper de conexión SSH al VPS de SGED.

Centraliza las credenciales para que NINGÚN script las tenga hardcodeadas.
Lee todo de variables de entorno:

    VPS_HOST      (requerida)  host/IP del VPS
    VPS_USER      (requerida)  usuario SSH
    VPS_PASSWORD  (requerida)  password SSH
    VPS_PORT      (opcional)   puerto SSH, default 52022

Credenciales de la API en entorno QA (solo para los scripts de diagnóstico que
hacen login contra /auth/login). Opcionales, con default no sensible:

    QA_USER       (opcional)   default "admin.qa"
    QA_PASSWORD   (requerida si el script hace login)

Uso:
    from _vps import connect
    client = connect(timeout=30)
"""
import os

import paramiko


def connect(timeout: int = 30) -> paramiko.SSHClient:
    """Abre y devuelve un SSHClient conectado al VPS usando credenciales de entorno."""
    try:
        host = os.environ["VPS_HOST"]
        user = os.environ["VPS_USER"]
        password = os.environ["VPS_PASSWORD"]
    except KeyError as exc:
        raise SystemExit(
            f"Falta la variable de entorno {exc}. Definí VPS_HOST, VPS_USER y "
            "VPS_PASSWORD (y opcionalmente VPS_PORT) antes de correr este script."
        ) from exc
    port = int(os.environ.get("VPS_PORT", 52022))
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=timeout)
    return client


def qa_login_json() -> str:
    """Devuelve el body JSON de login QA construido desde QA_USER/QA_PASSWORD."""
    import json

    user = os.environ.get("QA_USER", "admin.qa")
    password = os.environ.get("QA_PASSWORD")
    if not password:
        raise SystemExit(
            "Falta la variable de entorno QA_PASSWORD para el login contra la API QA."
        )
    return json.dumps({"username": user, "password": password})
