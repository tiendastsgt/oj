"""
Métricas Prometheus para el microservicio Auth

Expone métricas de negocio que pueden ser incrementadas desde cualquier parte del servicio.
"""
try:
    from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False

# Métricas de negocio - Autenticación
if PROMETHEUS_AVAILABLE:
    auth_logins_total = Counter(
        "auth_logins_total",
        "Total de intentos de login",
        ["result"]  # result: "success" o "failure"
    )

    auth_signups_total = Counter(
        "auth_signups_total",
        "Total de registros de usuarios",
        ["result"]  # result: "success" o "failure"
    )

    auth_refresh_total = Counter(
        "auth_refresh_total",
        "Total de refrescos de token",
        ["result"]  # result: "success" o "failure"
    )

    auth_tokens_validated_total = Counter(
        "auth_tokens_validated_total",
        "Total de validaciones de tokens",
        ["result"]  # result: "valid" o "invalid"
    )

    # Métricas de eventos
    auth_events_published_total = Counter(
        "auth_events_published_total",
        "Total de eventos publicados",
        ["event_name"]
    )

    auth_events_failed_total = Counter(
        "auth_events_failed_total",
        "Total de eventos que fallaron al publicar",
        ["event_name"]
    )
else:
    # Stubs si Prometheus no está disponible
    class StubCounter:
        def labels(self, **kwargs):
            return self
        def inc(self, value=1):
            pass

    auth_logins_total = StubCounter()
    auth_signups_total = StubCounter()
    auth_refresh_total = StubCounter()
    auth_tokens_validated_total = StubCounter()
    auth_events_published_total = StubCounter()
    auth_events_failed_total = StubCounter()


def record_login(result: str):
    """
    Registra un intento de login

    Args:
        result: "success" o "failure"
    """
    if PROMETHEUS_AVAILABLE:
        auth_logins_total.labels(result=result).inc()


def record_signup(result: str):
    """
    Registra un registro de usuario

    Args:
        result: "success" o "failure"
    """
    if PROMETHEUS_AVAILABLE:
        auth_signups_total.labels(result=result).inc()


def record_refresh(result: str):
    """
    Registra un refresco de token

    Args:
        result: "success" o "failure"
    """
    if PROMETHEUS_AVAILABLE:
        auth_refresh_total.labels(result=result).inc()


def record_token_validation(result: str):
    """
    Registra una validación de token

    Args:
        result: "valid" o "invalid"
    """
    if PROMETHEUS_AVAILABLE:
        auth_tokens_validated_total.labels(result=result).inc()


def record_event_published(event_name: str):
    """
    Registra que se publicó un evento

    Args:
        event_name: Nombre del evento
    """
    if PROMETHEUS_AVAILABLE:
        auth_events_published_total.labels(event_name=event_name).inc()


def record_event_failed(event_name: str):
    """
    Registra que falló la publicación de un evento

    Args:
        event_name: Nombre del evento
    """
    if PROMETHEUS_AVAILABLE:
        auth_events_failed_total.labels(event_name=event_name).inc()


def get_metrics_content():
    """Retorna el contenido de métricas en formato Prometheus"""
    if PROMETHEUS_AVAILABLE:
        return generate_latest()
    return b"# Prometheus metrics not available\n"


def get_metrics_content_type():
    """Retorna el content type para las métricas"""
    if PROMETHEUS_AVAILABLE:
        return CONTENT_TYPE_LATEST
    return "text/plain"
