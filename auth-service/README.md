# 🔐 Servicio de Autenticación - Portable

**Versión:** 1.0.0  
**Estado:** ✅ Implementado  
**Origen:** Extraído de Koyova ERP

---

## 📋 Descripción

Microservicio de Autenticación independiente con:

- ✅ Login con Supabase Auth
- ✅ Registro de usuarios
- ✅ Generación y validación de JWT
- ✅ Refresh de tokens
- ✅ Recuperación de contraseña
- ✅ Endpoints de health/metrics
- ✅ Rate limiting y lockout básico
- ✅ Auditoría de eventos críticos

---

## 🚀 Inicio Rápido

### Requisitos

- Python 3.11+
- PostgreSQL (Supabase)
- Variables de entorno configuradas

### Instalación

```bash
# 1) Crear entorno virtual
python -m venv venv
.\venv\Scripts\activate  # Windows

# 2) Instalar dependencias
pip install -r requirements.txt

# 3) Configurar variables de entorno
copy .env.example .env

# 4) Ejecutar servicio
uvicorn src.api.main:app --reload --port 8005
```

### Endpoints

- **Health:** `GET http://localhost:8005/health`
- **Ready:** `GET http://localhost:8005/ready`
- **Login:** `POST http://localhost:8005/api/v1/auth/login`
- **Signup:** `POST http://localhost:8005/api/v1/auth/signup`
- **Refresh:** `POST http://localhost:8005/api/v1/auth/refresh`
- **Me:** `GET http://localhost:8005/api/v1/auth/me`
- **Logout:** `POST http://localhost:8005/api/v1/auth/logout`
- **Reset password:** `POST http://localhost:8005/api/v1/auth/reset-password`
### Variables de entorno adicionales

- `AUTH_ENFORCE_HTTPS` (default: true)
- `AUTH_MAX_FAILED_ATTEMPTS` (default: 5)
- `AUTH_LOCKOUT_MINUTES` (default: 15)
- `AUTH_ROLE_PERMISSIONS` (JSON string, default: `{}`)
- `LOG_FILE_PATH` (opcional)
- `LOG_FILE_MAX_BYTES` (default: 10485760)
- `LOG_FILE_BACKUP_COUNT` (default: 5)

---

## 🧱 Tablas requeridas

El servicio espera estas tablas para revocación y auditoría:

- `revoked_tokens` (token_hash, revoked_at, expires_at)
- `auth_attempts` (email, attempts, locked_until, updated_at)
- `audit_logs` (action, user_id, resource, success, ip_address, user_agent, metadata, occurred_at, created_at)


### Documentación interactiva

- Swagger: `http://localhost:8005/docs`
- ReDoc: `http://localhost:8005/redoc`

---

## 🐳 Docker

```bash
docker compose up --build
```

---

## 📁 Estructura

```
auth-service/
├── src/
│   ├── api/
│   │   ├── main.py
│   │   ├── dependencies.py
│   │   ├── rate_limiter.py
│   │   └── v1/
│   │       ├── routes.py
│   │       └── schemas.py
│   ├── application/
│   │   └── services.py
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── repositories/
│   │   │       ├── auth_attempts_repository.py
│   │   │       ├── audit_repository.py
│   │   │       ├── token_repository.py
│   │   │       └── user_repository.py
│   │   └── external/
│   │       └── supabase_client.py
│   └── shared/
│       ├── exceptions.py
│       ├── logging.py
│       ├── metrics.py
│       └── validators.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```
