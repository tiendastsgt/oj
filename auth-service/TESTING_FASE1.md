# Estrategia de pruebas Fase 1 (Auth y seguridad)

Contexto: auth-service actual (FastAPI + Supabase) y diseños de Fase 1 en `ROADMAP_PROYECTO_SGED.md`.

## Notas de implementación (actualizadas)

- **JWT 8h:** `JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480` (8 horas).
- **Revocación fail-closed:** si falla la verificación de revocación (p. ej. error de BD), el token se considera inválido.
- **RBAC SGED:** roles normalizados `ADMINISTRADOR`, `SECRETARIO`, `AUXILIAR`, `CONSULTA`.  
  Pruebas de permisos enfocadas en helpers tipo `require_role` / `require_permission`.

## Mapa actual de tests

- **Ubicación:** `auth-service/tests/`
- **Estructura:**
  - `tests/unit/test_tokens.py`: creación de JWT y claim `jti`.
  - `tests/unit/test_validators.py`: política de contraseña.
  - `tests/integration/test_health.py`: `GET /health`.
- **Framework:** `pytest` (config en `pytest.ini`).
- **Ejecución actual:** `pytest` desde `auth-service/` (usa `testpaths=tests`, `pythonpath=src`).

## Matriz de pruebas backend (auth-service)

Formato: **Caso** · **Tipo** (U = unitario, I = integración/API) · **Notas**

### Login
- **Credenciales correctas → éxito, JWT válido** · U/I  
  - U: `AuthService.login()` con `SupabaseAuthClient` mock y `UserRepository` mock.  
  - I/API: `POST /api/v1/auth/login` y validar `access_token`, `expires_in`, `user`.  
  - Verificar que `expires_in` corresponde a `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Contraseña incorrecta repetida → contador + auditoría** · U/I  
  - U: `AuthAttemptsRepository.record_failed_attempt()` y `_audit_event()` llamados con `success=False`.  
  - I/API: 2-4 fallos seguidos, confirmar `auth_attempts.attempts` y `audit_logs`.
- **Alcanzar 5 fallos → cuenta bloqueada** · U/I  
  - U: `record_failed_attempt()` devuelve `locked_until`.  
  - I/API: 5º intento devuelve 401 con mensaje de bloqueo y `auth_attempts.locked_until` en DB.
- **Login con cuenta bloqueada** · U/I  
  - U: `is_locked_out()` retorna timestamp → `AuthenticationException`.  
  - I/API: `POST /login` para usuario con `locked_until > now` → 401.

### Logout
- **JWT válido → token revocado + auditoría** · U/I  
  - U: `TokenRepository.revoke_token()` y `_audit_event(action="logout")`.  
  - I/API: `POST /logout` y verificar fila en `revoked_tokens`.
- **Uso posterior del token revocado** · I/API  
  - Llamar a endpoint protegido (`/api/v1/auth/me`) con token revocado → 401.
- **Revocación fail-closed** · U/I  
  - U: simular excepción en `TokenRepository.is_token_revoked()` y verificar `AuthenticationException`.  
  - I/API: si falla validación de revocación → 401.

### Cambio de contraseña
- **Contraseña actual correcta + nueva cumple política** · I/API  
  - `POST /api/v1/auth/change-password` devuelve 200.
- **Contraseña actual incorrecta** · I/API  
  - Devuelve 401/403 (según definición).
- **Nueva contraseña no cumple política** · U/I  
  - U: `validate_password_strength()` ya cubierto.  
  - I/API: `POST /change-password` devuelve 400/422 con mensaje de política.

### Auditoría básica
- **Login/logout** · I  
  - Confirmar inserción en `audit_logs` con `action` y `success` correctos.
- **Login fallido** · I  
  - Registrar `action="login"` con `success=False` y metadata con `reason`.
- **Cambio de contraseña** · I  
  - Verificar inserción en `audit_logs` (o mock de `AuditRepository` en unit).

### JWT expiración 8h
- **Expiración ~480 minutos** · U  
  - Generar token y verificar `exp - iat` ≈ 480 min (tolerancia en segundos).

### RBAC (roles SGED)
- **Normalización de roles** · U  
  - Ejemplos: `admin` → `ADMINISTRADOR`, `user` → `CONSULTA`.
- **require_role** · U  
  - Permite acceso con rol normalizado incluido; deniega si no.
- **require_permission** · U  
  - Permite acceso si el permiso está asignado al rol; deniega en caso contrario.

## Matriz de pruebas frontend (auth)

Basado en el diseño de Fase 1 (Angular).

### LoginComponent
- **Formulario vacío** → validaciones UI (unit).
- **Credenciales válidas (backend simulado)** → redirección a `/expedientes` o `/cambiar-password` (unit).
- **Error de login** → mensaje de error mostrado (unit).

### ChangePasswordComponent
- **Nueva contraseña no cumple regex UI** → bloquear submit (unit).
- **Backend devuelve error de política** → mensaje correcto (unit).

### Interceptor/Guard
- **Petición sin token** a recurso protegido → redirección a `/login` (unit).
- **Token expirado (simulado)** → manejar 401, limpiar estado y redirigir (unit).

## Pruebas no funcionales inmediatas

- **Rate limiting en login:** `POST /login` más de 5/min desde misma IP → 429 con cabecera `Retry-After` (I/API).  
  Implementado con `slowapi` (`limiter.limit("5/minute")`).
- **Headers de seguridad:** verificación manual/automatizable  
  - Esperado: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`.  
  - Actualmente no se configuran en FastAPI: dejar como chequeo manual o pendiente de middleware.

## Plan de ejecución de tests

### Comandos locales
- **Tests unitarios rápidos:**
  - `pytest -q tests/unit`
- **Integración/API:**
  - `pytest -q tests/integration`
- **Todos:**
  - `pytest -q`
- **Separación por markers (si se adoptan):**
  - `pytest -m "unit"`
  - `pytest -m "integration"`

### Precondiciones
- **DB accesible** con tablas:
  - `revoked_tokens`, `auth_attempts`, `audit_logs`.
- **Variables de entorno mínimas:**
  - `AUTH_DB_URL` o `SUPABASE_DB_URL`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (si se prueba login real)
  - `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480`
  - `AUTH_MAX_FAILED_ATTEMPTS`, `AUTH_LOCKOUT_MINUTES`

### Integración CI (ejemplo)
- En pipeline, levantar Postgres temporal (Docker) + set env vars + `pytest -q`.
- Separar unitarias e integración por markers si se añaden.

## Cobertura mínima y huecos críticos

**Objetivo:** ≥ 80% en lógica de seguridad crítica (login/logout/lockout/revocación/auditoría).

Huecos actuales:
- No hay tests de login/logout reales.
- No hay tests de lockout con DB real.
- No hay tests de revocación de token y validación posterior.
- No hay tests de auditoría con DB real.
- Falta cubrir RBAC con pruebas de `require_role` / `require_permission`.
- Falta test unitario de expiración JWT 8h.
- Falta test de revocación fail-closed.

## Recomendaciones de tooling

- **pytest-cov** para cobertura: `pytest --cov=src --cov-report=term-missing`.
- **Markers:**
  - `@pytest.mark.unit` para tests rápidos.
  - `@pytest.mark.integration` para DB/HTTP.
- **FastAPI TestClient** + fixtures para Supabase mock.
- **Testcontainers (Postgres)** o docker-compose de prueba.

## Sugerencia de ubicación de nuevos tests

- **Unitarios:**
  - `tests/unit/test_jwt_config.py` (expiración 8h).
  - `tests/unit/test_rbac.py` (normalización, require_role/permission).
  - `tests/unit/test_token_revocation_fail_closed.py`.
- **Integración:**
  - `tests/integration/test_auth_change_password.py`.

## Checklist de aceptación (testing Fase 1)

- [ ] Tests ejecutan en entorno limpio (deps + DB + env vars).
- [ ] Login/logout/cambio de contraseña cubiertos por tests.
- [ ] Lockout tras 5 intentos validado (DB + respuesta).
- [ ] Revocación de tokens validada (DB + respuesta 401).
- [ ] Auditoría registra login/logout/fallo de login.
- [ ] Rate limiting en login validado.
- [ ] JWT de acceso verificado con expiración de 8h.
- [ ] Revocación de token probada en escenario fail-closed.
- [ ] RBAC SGED probado (normalización y require_role/permission).
- [ ] Endpoint `/change-password` probado con éxito y fallos.
- [ ] Cobertura ≥ 80% en `src/application/services.py` y repositorios clave.
- [ ] No se loguean secretos en tests ni en output.

## Conflictos detectados (coordinar con otros agentes)

- **Esquema BD:** el auth-service actual usa `revoked_tokens`, `auth_attempts`, `audit_logs`, mientras que el roadmap Java/Oracle propone `revoked_token`, `auth_attempt`, `auditoria`.  
  Esto impacta tests de integración y migraciones.
- **Expiración JWT:** Fase 1 exige 8h (480 min).  
  Verificar `JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480` en entornos de test.
