---
Documento: AUDITORIA_AUTH_JAVA_RESUMEN
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# 🔐 AUDITORÍA AUTH BACKEND JAVA - RESUMEN

**Versión:** 1.0.0  
**Fecha de última actualización:** 30 enero 2026  
**Vigente para:** SGED v1.0.0 y superior  
**Responsable:** Equipo de Documentación  
**Estado:** ✅ Vigente  

> Los informes completos de la auditoría (AUDIT_BACKEND_AUTH_JAVA.md, INDICE, HALLAZGOS_TABLA, RESUME original) están en `/docs/legacy/` por decisión de higiene documental. Este resumen es la referencia vigente.

---

## Conclusión ejecutiva

✅ **AUTENTICACIÓN 100% EN JAVA, PRODUCCIÓN-LISTA.** Auth integrada en sGED-backend (Spring Boot); auth-service Python no está desplegado.

---

## 1. Endpoints de autenticación

| Path | Método | Access | Rate Limit (Nginx) | Notas |
|------|--------|--------|------------------|-------|
| `/api/v1/auth/login` | POST | PUBLIC | 5r/s + burst 5 | Genera JWT (8h) |
| `/api/v1/auth/logout` | POST | AUTH + Token | 5r/s + burst 5 | Revoca en BD |
| `/api/v1/auth/cambiar-password` | POST | AUTH + Token | 5r/s + burst 5 | Válida: 8+ chars, mayús, minús, #, token |

**Códigos:** 200 OK (login), 401 (credenciales/token inválido), 429 (rate limit Nginx).

---

## 2. JWT

- **Librería:** JJWT v0.12.0. **Algoritmo:** HmacSHA256. **Expiración:** 8 horas.
- **Claims:** username, user_id, roles, juzgado, jti (UUID). **Revocación:** tabla `revoked_token` (JTI) validada en cada request.
- **Header:** `Authorization: Bearer {token}`.

---

## 3. Lockout y rate limiting

- **Lockout:** 5 intentos fallidos → bloqueo (`usuario.bloqueado = 1`). Tabla auditoría `auth_attempt`. Sin auto-reset (requiere admin). Reset en login exitoso.
- **Rate limiting:** Nginx 5r/s + burst 5 en `/api/v1/auth/`; no en código Java.

---

## 4. RBAC: 4 roles

| Rol | Acceso típico |
|-----|----------------|
| ADMINISTRADOR | Auditoría, usuarios, todas operaciones |
| SECRETARIO | Expedientes, documentos |
| AUXILIAR | Expedientes, documentos propios |
| CONSULTA | Solo lectura |

---

## 5. Evidencia: auth Python no desplegado

- docker-compose-prod.yml y nginx-prod.conf no incluyen auth-service Python. Upstream apunta a sged-backend:8080. **Conclusión:** 100% Auth en Java/Spring Boot.

---

## Validaciones implementadas

- JWT HMAC-SHA256, 8h, revocación JTI en BD  
- Lockout 5 intentos, rate limiting Nginx  
- RBAC 4 roles, auditoría login/logout/intentos  
- BCrypt, sesiones STATELESS  

---

**Referencia:** Informes completos en `/docs/legacy/` (AUDIT_BACKEND_AUTH_JAVA*.md).
