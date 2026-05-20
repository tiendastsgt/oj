---
Documento: SEGURIDAD_AUTH_IMPLEMENTATION
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Estado: ✅ Vigente
---

# 🔐 Implementación Técnica de Seguridad y Auth

Este documento detalla la arquitectura de seguridad integrada en `sGED-backend` (Java/Spring Boot), sustituyendo cualquier arquitectura previa basada en servicios externos.

## 1. Arquitectura de Autenticación

El sistema utiliza **Spring Security 6.5** configurado en modo **Stateless**, delegando la persistencia de la sesión en tokens **JWT (JSON Web Tokens)**.

### Flujo de Autenticación
1. **Login:** El cliente envía credenciales a `/api/v1/auth/login`.
2. **Validación:** El backend valida la contraseña usando `BCryptPasswordEncoder`.
3. **Generación:** Se genera un JWT firmado con **HMAC-SHA256**.
4. **Respuesta:** El cliente recibe el token y lo almacena en `sessionStorage`.
5. **Autorización:** Cada petición posterior incluye el header `Authorization: Bearer <token>`.

---

## 2. Endpoints de Seguridad

| Endpoint | Método | Acceso | Propósito |
|----------|---------|---------|-----------|
| `/api/v1/auth/login` | POST | Público | Genera JWT e inicia auditoría. |
| `/api/v1/auth/logout` | POST | Autenticado | Revoca el JTI del token actual. |
| `/api/v1/auth/cambiar-password` | POST | Autenticado | Actualiza password con validación de política. |

### Política de Contraseñas
- Mínimo 8 caracteres.
- Al menos una mayúscula, una minúscula y un número.

---

## 3. Seguridad del Token (JWT)

- **Expiración:** 8 horas (28,800,000 ms).
- **Firma:** Secreto definido en la variable de entorno `JWT_SECRET`.
- **Claims incluidos:**
  - `sub`: Nombre de usuario.
  - `user_id`: ID del registro en base de datos.
  - `roles`: Lista de roles asignados.
  - `jti`: Identificador único del token (para revocación).

---

## 4. Control de Acceso (RBAC)

El sistema define 4 roles fijos que se aplican mediante anotaciones `@PreAuthorize` en los controladores:

1. **ADMINISTRADOR:** Acceso total (Usuarios, Auditoría, Configuración).
2. **SECRETARIO:** Gestión de expedientes y carga de documentos.
3. **AUXILIAR:** Carga de documentos y consulta.
4. **CONSULTA:** Acceso de solo lectura a expedientes y visores.

---

## 5. Prevención de Brute Force (Lockout)

- **Límite:** 5 intentos fallidos consecutivos.
- **Acción:** El campo `usuario.bloqueado` se establece en `1`.
- **Desbloqueo:** **Requiere intervención manual** del Administrador vía base de datos o módulo de administración. No existe reset por tiempo.

---

## 6. Revocación de Tokens

Para el logout, el sistema utiliza una **Blacklist de JTI** persistida en la tabla `revoked_token`.
- Cada petición valida que el `jti` del token no esté en dicha tabla.
- Un proceso programado (Scheduler) purga los tokens revocados cuya fecha de expiración ya haya pasado.
