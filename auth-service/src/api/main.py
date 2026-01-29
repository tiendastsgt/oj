"""
Aplicación FastAPI principal - Servicio de Autenticación
"""
import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from src.api.v1 import routes as v1_routes
from src.api.rate_limiter import limiter
from src.shared.logging import setup_logging, set_request_id, set_user_id

# Prometheus metrics
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    from src.shared.metrics import get_metrics_content, get_metrics_content_type
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False

# Configurar logging
logger = setup_logging()

# Variables de entorno
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8005"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
AUTH_ENV = os.getenv("AUTH_ENV", "development").lower()  # development, staging, production
ENFORCE_HTTPS = os.getenv("AUTH_ENFORCE_HTTPS", "true").lower() == "true"

# Nombre del servicio
SERVICE_NAME = "auth"
SERVICE_VERSION = "1.0.0"

# Validación de JWT_SECRET_KEY
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
DEFAULT_SECRET_KEY = "dev-secret-key-change-in-production"

if JWT_SECRET_KEY == DEFAULT_SECRET_KEY:
    if AUTH_ENV == "production":
        logger.error(
            "⚠️  CRITICAL SECURITY WARNING: JWT_SECRET_KEY está usando el valor por defecto. "
            "Esto es INSEGURO en producción. Por favor, configura una clave secreta única y segura."
        )
        # En producción, lanzar excepción para evitar arranque inseguro
        raise ValueError(
            "JWT_SECRET_KEY no puede usar el valor por defecto en producción. "
            "Configura AUTH_ENV=production y JWT_SECRET_KEY con una clave segura."
        )
    else:
        logger.warning(
            "⚠️  SECURITY WARNING: JWT_SECRET_KEY está usando el valor por defecto. "
            "Esto es aceptable solo en desarrollo. En producción, configura una clave secreta única y segura."
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle events de la aplicación FastAPI

    Startup: Se ejecuta al iniciar el servicio
    Shutdown: Se ejecuta al detener el servicio
    """
    # Startup
    logger.info("🚀 Servicio de Autenticación - Koyova iniciando...")
    logger.info(f"Ambiente: {'development' if DEBUG else 'production'}")
    logger.info(f"Puerto: {API_PORT}")
    yield
    # Shutdown
    logger.info("🛑 Servicio de Autenticación - Koyova deteniéndose...")


# Crear aplicación FastAPI
app = FastAPI(
    title="Koyova - Servicio de Autenticación",
    description="Microservicio de Autenticación - ERP cloud para PYMEs de Centroamérica",
    version=SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS - Configuración segura
CORS_ORIGINS_ENV = os.getenv("AUTH_CORS_ORIGINS", "")
if CORS_ORIGINS_ENV:
    # Si se proporciona variable de entorno, usar lista de orígenes permitidos
    CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_ENV.split(",") if origin.strip()]
    logger.info(f"CORS configurado con orígenes específicos: {CORS_ORIGINS}")
else:
    # Fallback a "*" para desarrollo, pero advertir
    CORS_ORIGINS = ["*"]
    if AUTH_ENV == "production":
        logger.error(
            "⚠️  SECURITY WARNING: CORS está configurado con allow_origins=['*'] en producción. "
            "Esto es INSEGURO. Configura AUTH_CORS_ORIGINS con orígenes específicos separados por comas."
        )
    else:
        logger.warning(
            "⚠️  CORS está configurado con allow_origins=['*'] (aceptable solo en desarrollo). "
            "En producción, configura AUTH_CORS_ORIGINS con orígenes específicos separados por comas."
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """
    Middleware para request_id, HTTPS enforcement y headers de seguridad.
    """
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    set_request_id(request_id)
    set_user_id(None)

    if AUTH_ENV == "production" and ENFORCE_HTTPS:
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        scheme = forwarded_proto.lower() if forwarded_proto else request.url.scheme
        if scheme != "https":
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "HTTPS requerido"},
            )

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    if AUTH_ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    return response

# Incluir routers
app.include_router(
    v1_routes.router,
    prefix="/api/v1/auth",
    tags=["Authentication v1"]
)

# Prometheus metrics - Instrumentar FastAPI para métricas HTTP automáticas
if PROMETHEUS_AVAILABLE:
    instrumentator = Instrumentator()
    instrumentator.instrument(app)

    # Importar métricas de negocio para que se registren
    import src.shared.metrics  # noqa: F401


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check básico

    Endpoint para verificar que el servicio está corriendo.
    Usado por Docker, Kubernetes, load balancers, etc.

    Returns:
        JSON con estado del servicio
    """
    return JSONResponse({
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION
    })


# Readiness check
@app.get("/ready", tags=["Health"])
async def readiness_check():
    """
    Readiness check - verifica dependencias

    Endpoint para verificar que el servicio está listo para recibir tráfico.
    Verifica conexión a BD y Supabase.

    Returns:
        JSON con estado de readiness
    """
    checks = {}
    status_ready = True

    # Verificar conexión a BD
    try:
        from src.infrastructure.database.connection import db_connection
        if db_connection:
            with db_connection.get_connection() as conn:
                conn.cursor().execute("SELECT 1")
            checks["database"] = "ok"
        else:
            checks["database"] = "not_configured"
            status_ready = False
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        status_ready = False

    # Verificar Supabase
    try:
        from src.infrastructure.external.supabase_client import SupabaseAuthClient
        SupabaseAuthClient()
        checks["supabase"] = "ok"
    except Exception as e:
        checks["supabase"] = f"error: {str(e)}"
        status_ready = False

    return JSONResponse({
        "status": "ready" if status_ready else "not_ready",
        "service": SERVICE_NAME,
        "checks": checks
    })


# Metrics endpoint
@app.get("/metrics", tags=["Health"])
async def metrics():
    """
    Métricas Prometheus

    Endpoint para exponer métricas en formato Prometheus.
    Usado por sistemas de monitoreo (Prometheus, Grafana, etc.).
    Sin autenticación (igual que /health y /ready).

    Returns:
        Texto plano en formato Prometheus con métricas del servicio
    """
    if not PROMETHEUS_AVAILABLE:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "error": "Prometheus metrics not available",
                "message": "prometheus-client and prometheus-fastapi-instrumentator are required"
            }
        )

    return Response(
        content=get_metrics_content(),
        media_type=get_metrics_content_type()
    )


# Root
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint

    Endpoint raíz que proporciona información básica del servicio.

    Returns:
        JSON con información del servicio
    """
    return {
        "service": "Koyova - Servicio de Autenticación",
        "version": SERVICE_VERSION,
        "docs": "/docs",
        "health": "/health",
        "ready": "/ready",
        "metrics": "/metrics"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=DEBUG
    )
