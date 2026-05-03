---
Documento: SEGURIDAD
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# 05 — Seguridad

## 1. Flujo Completo JWT en 3 Fases

### Fase 1 — Emisión del Token (Login)

```
Cliente Angular                       Backend Spring Boot
     │                                        │
     │  POST /api/v1/auth/login               │
     │  { username: "jlopez", password: "..." }│
     ├───────────────────────────────────────►│
     │                                        │
     │                            AuthService.login():
     │                              1. Busca usuario en DB por username
     │                              2. Verifica usuario.activo == true
     │                              3. Verifica usuario.bloqueado == false
     │                              4. BCryptPasswordEncoder.matches(
     │                                   inputPassword, usuario.password)
     │                              │
     │                              │  Si contraseña incorrecta:
     │                              │   - Incrementa intentos_fallidos
     │                              │   - Registra en auth_attempt (intento_exitoso=0)
     │                              │   - Si intentos_fallidos >= 5:
     │                              │       usuario.bloqueado = true
     │                              │       usuario.fecha_bloqueo = NOW()
     │                              │   - Lanza AuthException → HTTP 401
     │                              │
     │                              5. Contraseña correcta:
     │                                 - Resetea intentos_fallidos = 0
     │                                 - Registra en auth_attempt (intento_exitoso=1)
     │                                 - JwtTokenProvider.generateToken(usuario):
     │                                     jti = UUID.randomUUID()
     │                                     Claims: sub=username, jti=jti,
     │                                             roles=[rol], user_id=id,
     │                                             juzgado=nombre, exp=NOW+8h
     │                                     Firma HMAC-SHA256 con JWT_SECRET
     │                                 - Registra evento en auditoria
     │
     │  HTTP 200 OK                           │
     │  { token: "eyJ...", username: "jlopez",│
     │    rol: "SECRETARIO", ... }            │
     │◄───────────────────────────────────────┤
     │                                        │
     │  sessionStorage.setItem("sged_auth_token", token)
     │  sessionStorage.setJson("sged_auth_user", {username, rol, juzgado})
```

### Fase 2 — Validación del Token (Cada Request)

```
Cliente Angular                       Backend Spring Boot
     │                                        │
     │  GET /api/v1/expedientes               │
     │  Authorization: Bearer eyJ...          │
     ├───────────────────────────────────────►│
     │                                        │
     │                            RequestContextFilter:
     │                              Captura IP real (X-Forwarded-For)
     │                                        │
     │                            JwtAuthenticationFilter.doFilterInternal():
     │                              1. Extrae token del header Authorization
     │                              2. JwtTokenProvider.validateToken(token):
     │                                 a. Jwts.parserBuilder() verifica firma
     │                                    HMAC-SHA256 con JWT_SECRET
     │                                 b. Verifica fecha de expiración
     │                                 c. Extrae jti del token
     │                                 d. revokedTokenRepository
     │                                    .existsByTokenJti(jti)
     │                                    → Si existe: token revocado → rechaza
     │                              3. Si válido:
     │                                 - Extrae username y roles
     │                                 - Construye UsernamePasswordAuthenticationToken
     │                                   con authorities [ROLE_SECRETARIO]
     │                                 - SecurityContextHolder.setAuthentication(...)
     │                                        │
     │                            Spring Security:
     │                              4. Verifica @PreAuthorize en el controlador
     │                              5. Si autorizado → ejecuta el handler
     │
     │  HTTP 200 OK { data: [...] }           │
     │◄───────────────────────────────────────┤
```

### Fase 3 — Revocación del Token (Logout)

```
Cliente Angular                       Backend Spring Boot
     │                                        │
     │  POST /api/v1/auth/logout              │
     │  Authorization: Bearer eyJ...          │
     ├───────────────────────────────────────►│
     │                                        │
     │                            AuthService.logout():
     │                              1. Extrae token del SecurityContext
     │                              2. JwtTokenProvider.getJti(token) → jti
     │                              3. JwtTokenProvider.getExpiration(token) → exp
     │                              4. INSERT INTO revoked_token:
     │                                 (token_jti=jti, fecha_expiracion=exp)
     │                              5. Registra evento en auditoria
     │                              6. Un Scheduler purga periódicamente
     │                                 tokens con fecha_expiracion < NOW()
     │
     │  HTTP 200 OK                           │
     │◄───────────────────────────────────────┤
     │                                        │
     │  sessionStorage.removeItem("sged_auth_token")
     │  sessionStorage.removeItem("sged_auth_user")
     │  Router.navigate(['/login'])
```

---

## 2. Estructura del JWT

El token JWT firmado con HMAC-SHA256 contiene los siguientes claims:

```json
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "jlopez",                    // username (sujeto)
  "jti": "a1b2c3d4-...",             // identificador único del token
  "roles": ["SECRETARIO"],            // lista de roles (RBAC)
  "juzgado": "Juzgado Primero Civil", // nombre del juzgado asignado
  "user_id": 42,                      // ID del usuario en base de datos
  "iat": 1714500000,                  // issued at (timestamp Unix)
  "exp": 1714528800                   // expiration (iat + 28800 = +8 horas)
}

Signature:
HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_SECRET)
```

**Parámetros de configuración en `application.yml`:**
```yaml
jwt:
  secret: ${JWT_SECRET:change-me}        # Mínimo 32 caracteres en producción
  expiration-ms: ${JWT_EXPIRATION_MS:28800000}  # 8 horas = 28,800,000 ms
```

---

## 3. Control de Acceso RBAC — 4 Roles

El sistema implementa **RBAC (Role-Based Access Control)** con 4 roles fijos, definidos en la tabla `cat_rol` y aplicados mediante anotaciones `@PreAuthorize` en los controladores.

### Tabla de Permisos por Módulo y Rol

| Módulo / Operación | ADMINISTRADOR | SECRETARIO | AUXILIAR | CONSULTA |
|-------------------|:-------------:|:----------:|:--------:|:--------:|
| **Expedientes — Listar** | SI | SI | SI | SI |
| **Expedientes — Ver detalle** | SI | SI | SI | SI |
| **Expedientes — Estadísticas dashboard** | SI (global) | SI (su juzgado) | SI (su juzgado) | SI (su juzgado) |
| **Expedientes — Crear** | SI | SI | SI | NO |
| **Expedientes — Editar** | SI | SI | NO | NO |
| **Documentos — Listar** | SI | SI | SI | SI |
| **Documentos — Descargar** | SI | SI | SI | SI |
| **Documentos — Subir** | SI | SI | SI | NO |
| **Documentos — Eliminar (soft)** | SI | SI | SI | NO |
| **Búsqueda avanzada** | SI (global) | SI (su juzgado) | SI (su juzgado) | SI (su juzgado) |
| **Catálogos — Consultar** | SI | SI | SI | SI |
| **Admin — CRUD Usuarios** | SI | NO | NO | NO |
| **Admin — Reset contraseña** | SI | NO | NO | NO |
| **Admin — Desbloquear cuentas** | SI | NO | NO | NO |
| **Auditoría — Consultar** | SI | NO | NO | NO |
| **Auth — Login** | SI (público) | SI (público) | SI (público) | SI (público) |
| **Auth — Logout** | SI | SI | SI | SI |
| **Auth — Cambiar contraseña** | SI | SI | SI | SI |

### Aislamiento de Datos por Juzgado

Los roles no-ADMINISTRADOR solo pueden acceder a datos de **su propio juzgado**:

- `ExpedienteService.listarExpedientes()` filtra por `juzgado_id` del usuario autenticado.
- `ExpedienteService.crearExpediente()` fuerza `juzgado_id` al del usuario si no es ADMIN.
- `BusquedaExpedientesService` aplica restricción de juzgado automáticamente.
- Esta lógica está en la capa de servicio, **no en los controladores**, para garantizar que no sea bypasseable.

### Ejemplo de `@PreAuthorize` en Controlador

```java
// Solo ADMINISTRADOR puede crear usuarios
@PreAuthorize("hasRole('ADMINISTRADOR')")
@PostMapping
public ResponseEntity<ApiResponse<UsuarioAdminResponse>> crearUsuario(...) { ... }

// Todos los roles autenticados pueden ver expedientes
@PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
@GetMapping
public ResponseEntity<ApiResponse<Page<ExpedienteResponse>>> listar(...) { ... }

// Solo ADMINISTRADOR y SECRETARIO pueden editar expedientes
@PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO')")
@PutMapping("/{id}")
public ResponseEntity<ApiResponse<ExpedienteResponse>> editar(...) { ... }
```

La anotación `@EnableMethodSecurity` en `SecurityConfig` activa el procesamiento de `@PreAuthorize` a nivel de método.

---

## 4. Mecanismo de Lockout por Fuerza Bruta

El sistema protege contra ataques de fuerza bruta mediante bloqueo progresivo de cuentas:

```
Intento 1 fallido: intentos_fallidos = 1
Intento 2 fallido: intentos_fallidos = 2
Intento 3 fallido: intentos_fallidos = 3
Intento 4 fallido: intentos_fallidos = 4
Intento 5 fallido: intentos_fallidos = 5
                   usuario.bloqueado = 1
                   usuario.fecha_bloqueo = CURRENT_TIMESTAMP
                   → HTTP 401: "Cuenta bloqueada"
```

**Características del lockout:**

- **Límite:** 5 intentos fallidos consecutivos.
- **Acción:** El campo `usuario.bloqueado` se establece en `1` (true).
- **Desbloqueo:** **Requiere intervención manual** del ADMINISTRADOR. No existe desbloqueo automático por tiempo.
- **Registro:** Cada intento (exitoso o fallido) se persiste en la tabla `auth_attempt` con IP y timestamp para análisis forense.

**Flujo de desbloqueo:**

El ADMINISTRADOR usa el endpoint `PATCH /api/v1/admin/usuarios/{id}/desbloquear`, que:
1. Establece `usuario.bloqueado = 0`.
2. Resetea `usuario.intentos_fallidos = 0`.
3. Registra el evento en la tabla `auditoria`.

---

## 5. Política de Contraseñas

Toda contraseña nueva o modificada debe cumplir:

- Mínimo **8 caracteres**.
- Al menos **una letra mayúscula**.
- Al menos **una letra minúscula**.
- Al menos **un número**.

La validación se realiza en `AuthService` y lanza `PasswordValidationException` si no se cumple.
Las contraseñas se almacenan en la base de datos como hash BCrypt (nunca en texto plano).

El campo `debe_cambiar_pass = 1` en la entidad `Usuario` indica que el usuario debe cambiar su contraseña en el siguiente login. El frontend detecta este flag en la respuesta de login y redirige automáticamente a `/cambiar-password`.

---

## 6. Auditoría Inmutable

El sistema registra todas las acciones relevantes en la tabla `auditoria`. Diseño inmutable:

- **Solo INSERT:** Nunca se actualiza ni elimina un registro de auditoría desde la aplicación.
- **Sin foreign keys:** La tabla `auditoria.usuario` es VARCHAR, no FK, para preservar el registro aunque el usuario sea eliminado.
- **Campos registrados:** fecha, usuario, IP, acción (ej: `CREAR_EXPEDIENTE`), módulo (ej: `EXPEDIENTE`), recurso_id, valor_anterior (CLOB), valor_nuevo (CLOB), detalle.

**Acciones auditadas (enum `AuditAction`):**

| Acción | Módulo | Descripción |
|--------|--------|-------------|
| `LOGIN_EXITOSO` | AUTH | Inicio de sesión exitoso |
| `LOGIN_FALLIDO` | AUTH | Intento de login fallido |
| `LOGOUT` | AUTH | Cierre de sesión |
| `CAMBIO_PASSWORD` | AUTH | Cambio de contraseña exitoso |
| `CUENTA_BLOQUEADA` | AUTH | Cuenta bloqueada por intentos fallidos |
| `CREAR_EXPEDIENTE` | EXPEDIENTE | Creación de nuevo expediente |
| `EDITAR_EXPEDIENTE` | EXPEDIENTE | Modificación de expediente |
| `VER_EXPEDIENTE` | EXPEDIENTE | Consulta de detalle de expediente |
| `CREAR_DOCUMENTO` | DOCUMENTO | Carga de nuevo documento |
| `DESCARGAR_DOCUMENTO` | DOCUMENTO | Descarga de documento |
| `ELIMINAR_DOCUMENTO` | DOCUMENTO | Eliminación lógica de documento |
| `CREAR_USUARIO` | USUARIO | Creación de usuario por ADMINISTRADOR |
| `EDITAR_USUARIO` | USUARIO | Modificación de usuario |
| `DESBLOQUEAR_USUARIO` | USUARIO | Desbloqueo de cuenta por ADMINISTRADOR |
| `RESET_PASSWORD` | USUARIO | Reset de contraseña por ADMINISTRADOR |

---

## 7. Configuración Spring Security

La configuración completa se encuentra en `SecurityConfig` (`infrastructure/config/SecurityConfig.java`):

### Modo Stateless

```java
.sessionManagement(session ->
    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```

El servidor no mantiene ningún estado de sesión HTTP. Toda la autenticación se basa exclusivamente en el JWT incluido en cada request.

### CSRF Deshabilitado

```java
.csrf(csrf -> csrf.disable())
```

El CSRF está deshabilitado porque:
1. La aplicación es una API REST consumida por una SPA, no por formularios HTML tradicionales.
2. La autenticación se basa en el header `Authorization: Bearer`, no en cookies de sesión.
3. Los tokens CSRF son innecesarios y añadirían complejidad sin beneficio de seguridad.

### CORS Configurado

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:4200",        // Desarrollo local
    "http://localhost:4201",        // QA local
    "http://51.161.32.204:8085",    // Frontend VPS producción
    "http://51.161.32.204:8086"    // (reservado)
));
configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
configuration.setAllowedHeaders(Arrays.asList("authorization","content-type","x-auth-token"));
configuration.setExposedHeaders(Arrays.asList("x-auth-token","X-SGED-Conversion-Failed"));
configuration.setAllowCredentials(true);
```

### Rutas Públicas

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
    .requestMatchers("/actuator/health", "/health").permitAll()
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()   // Preflight CORS
    .anyRequest().authenticated()
)
```

### Cadena de Filtros

El orden de filtros en la cadena de Spring Security:

```
RequestContextFilter          → Captura IP para auditoría
    ↓
JwtAuthenticationFilter       → Valida JWT y establece SecurityContext
    ↓
UsernamePasswordAuthenticationFilter  → (desplazado, no usado)
    ↓
ExceptionTranslationFilter    → Retorna 401 en lugar de redirigir a /login
    ↓
FilterSecurityInterceptor     → Aplica @PreAuthorize
```

### Entry Point de Error

```java
.exceptionHandling(ex -> ex
    .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
)
```

Cuando un request no autenticado llega a una ruta protegida, Spring retorna directamente **HTTP 401** (no redirige a una página de login), apropiado para una API REST.

---

## 8. Consideraciones de Seguridad en Producción

| Aspecto | Configuración Actual | Recomendación Adicional |
|---------|---------------------|------------------------|
| **JWT_SECRET** | Variable de entorno (no hardcoded) | Mínimo 32 caracteres, rotar periódicamente |
| **HTTPS** | Nginx puede configurar TLS | Obligatorio para producción corporativa |
| **Headers de seguridad** | Básicos via Spring | Considerar agregar HSTS, X-Content-Type-Options |
| **Rate limiting** | No implementado | Nginx puede limitar req/s por IP |
| **Logs de seguridad** | Logback con nivel WARN en JWT | Enviar a SIEM corporativo en producción |
| **Rotación de tokens** | No implementada (8h fixed) | Refresh tokens para sesiones largas |

---

*Siguiente: [06-guia-de-contribucion.md](./06-guia-de-contribucion.md) — Setup local, build, tests y flujo de trabajo.*
