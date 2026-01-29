# 🔐 RESUMEN EJECUTIVO: AUDITORÍA AUTH BACKEND JAVA

**Fecha:** 28 enero 2026 | **Auditor:** Agente Auditor Backend Auth Java (Read-only)  
**Proyecto:** SGED v1.0.0 | **Scope:** sGED-backend Spring Boot  
**Conclusion:** ✅ **AUTENTICACIÓN 100% EN JAVA, PRODUCCIÓN-LISTA**

---

## 1️⃣ ENDPOINTS DE AUTENTICACIÓN (Tabla Rápida)

| Path | Método | Access | Rate Limit (Nginx) | Notas |
|------|--------|--------|------------------|-------|
| `/api/v1/auth/login` | POST | PUBLIC | 5r/s + burst 5 | Genera JWT (8h) |
| `/api/v1/auth/logout` | POST | AUTH + Token | 5r/s + burst 5 | Revoca en BD |
| `/api/v1/auth/cambiar-password` | POST | AUTH + Token | 5r/s + burst 5 | Válida: 8+ chars, mayús, minús, #, token |

**Response Status Codes:**
- `200 OK` → Login exitoso + JWT token
- `401 UNAUTHORIZED` → Credenciales inválidas / Token expirado / Token revocado / Cuenta bloqueada
- `429 TOO MANY REQUESTS` → Rate limit excedido (Nginx)

---

## 2️⃣ JWT: Detalles Técnicos

| Parámetro | Valor |
|-----------|-------|
| **Librería** | JJWT v0.12.0 (io.jsonwebtoken) |
| **Algoritmo** | HmacSHA256 |
| **Expiración** | **8 HORAS** (28,800,000 ms) ✅ |
| **Claims** | username, user_id, roles, juzgado, jti (UUID) |
| **Revocación** | Tabla `revoked_token` (JTI) validada en **cada request** |
| **Secret** | `${JWT_SECRET}` env var (***REDACTED***) |
| **Formato Header** | `Authorization: Bearer {token}` |

**Validación en cada request:**
1. Extrae token de header Authorization
2. Verifica firma HMAC-SHA256
3. **Revisa si JTI está en tabla `revoked_token`** (blacklist)
4. Si válido: carga username, user_id, roles en SecurityContext

---

## 3️⃣ LOCKOUT: 5 Intentos Fallidos

| Métrica | Detalle |
|---------|--------|
| **Max Intentos Fallidos** | 5 |
| **Acción en 5º Fallo** | Bloquear usuario (`usuario.bloqueado = 1`) |
| **Tabla Auditoría** | `auth_attempt` (por username + IP + timestamp) |
| **Auto-Reset** | NO (requiere admin manual para desbloquear) |
| **Reset en Login Éxito** | SÍ (intentosFallidos = 0 si entra contraseña correcta) |

**Implementación:** Campo `usuario.bloqueado` (Number(1)) + timestamp `fecha_bloqueo`

---

## 4️⃣ RATE LIMITING

**Ubicación:** Nginx (infraestructura), NO en código Java

**Configuración:**
```nginx
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

location /api/v1/auth/ {
    limit_req zone=auth burst=5 nodelay;
    limit_req_status 429;
}
```

**Significado:**
- 5 requests/segundo por IP
- Permite burst de 5 extras (total 10 en ráfaga)
- Si excede: responde 429 (Too Many Requests) inmediatamente
- Ventana: 10 minutos

---

## 5️⃣ RBAC: 4 Roles SGED

| Rol | Acceso Típico |
|-----|---------------|
| **ADMINISTRADOR** | Ver auditoría, crear/modificar usuarios, todas operaciones |
| **SECRETARIO** | Crear/modificar expedientes, subir documentos |
| **AUXILIAR** | Crear expedientes, modificar documentos propios |
| **CONSULTA** | Lectura solo (expedientes + documentos) |

**Implementación:** `@PreAuthorize("hasRole(...)")` + Spring Security `@EnableMethodSecurity`

---

## 6️⃣ EVIDENCIA: auth-service Python NO DESPLEGADO ✅

| Fuente | Busca | Resultado |
|--------|-------|-----------|
| `docker-compose-prod.yml` | auth-service | ❌ No existe |
| `nginx-prod.conf` | python/fastapi | ❌ No existe |
| `pom.xml` (Java deps) | auth-service | ❌ No existe |
| Upstream nginx | backend | ✅ Apunta a `sged-backend:8080` |

**Conclusión:** 100% Auth en Java/Spring Boot, servicio Python nunca se desplegó en producción.

---

## 7️⃣ DISCREPANCIAS DOCUMENTALES (QUE REQUIEREN FIX)

| # | Discrepancia | Realidad Código | Urgencia | Archivo a Actualizar |
|---|--------------|-----------------|----------|----------------------|
| 1 | Docs mencionan "auth-service Python" | Auth está 100% en Java | ALTA | README.md, plan detallado.md |
| 2 | Rate limiting "en aplicación" | Rate limit es Nginx, no Java | MEDIA | Docs seguridad (crear nueva si no existe) |
| 3 | Lockout "temporal (15 min)" | Sin auto-reset, requiere admin | MEDIA | Runbook operaciones (crear si no existe) |

---

## ✅ VALIDACIONES DE SEGURIDAD IMPLEMENTADAS

- ✅ JWT con firma HMAC-SHA256
- ✅ Expiración 8 horas
- ✅ Revocación inmediata (JTI en BD, validada cada request)
- ✅ Lockout tras 5 intentos
- ✅ Rate limiting 5r/s (Nginx)
- ✅ RBAC 4 roles
- ✅ Auditoría completa (login/logout/failed attempts)
- ✅ Password encoding BCrypt
- ✅ CSRF disabled + STATELESS sessions

---

## 📊 ARCHIVOS CLAVE INSPECCIONADOS

**Backend Java:**
- AuthController.java (endpoints)
- AuthService.java (lógica login/logout)
- JwtTokenProvider.java (gen/val token)
- JwtAuthenticationFilter.java (filtro Spring)
- SecurityConfig.java (cadena seguridad)
- Usuario.java, RevokedToken.java (entities)

**Database (Flyway Migrations):**
- V001 cat_rol (4 roles)
- V003 auth_attempt (auditoría intentos)
- V004 revoked_token (blacklist)

**Infrastructure:**
- docker-compose-prod.yml (servicios prod)
- nginx-prod.conf (rate limiting, TLS)

**Config:**
- application.yml (`jwt.expiration-ms: 28800000`)
- pom.xml (deps JJWT v0.12.0, spring-security)

---

## 🎯 RECOMENDACIONES (3 PRIORITARIAS)

### 1. ALTA: Actualizar README.md
**Cambio:** Aclarar "Autenticación integrada en sGED-backend (Java), NO en servicio separado"  
**Añadir:** Sección brief "Auth Real: JWT 8h, RBAC 4 roles, revocación con JTI"

### 2. MEDIA: Crear docs/general/SEGURIDAD_AUTH_IMPLEMENTATION.md
**Contenido:** Copiar detalles técnicos de este audit (endpoints, claims JWT, lockout, RBAC)  
**Audiencia:** Developers que mantienen código

### 3. MEDIA: Crear docs/infra/RATE_LIMITING_NGINX.md
**Contenido:** Configuración Nginx rate limiting + tuning  
**Audiencia:** DevOps/SRE operaciones

---

## 📌 CONCLUSIÓN

**SGED autenticación está correctamente implementada en Java/Spring Boot con seguridad enterprise-grade.** Discrepancias documentales son menores (docs legacy mencionan auth-service que nunca se desplegó). **Código está listo para producción.** Recomendación: actualizar docs root (README, plan detallado) y crear docs técnicas específicas para referencia futura.

✅ **Auditoría completada sin hallazgos críticos.**

---

**Generado:** 28 enero 2026 | Referencia completa: [AUDIT_BACKEND_AUTH_JAVA.md](AUDIT_BACKEND_AUTH_JAVA.md)
