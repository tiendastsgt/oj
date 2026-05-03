# SGED API — Guía de integración

**Base URL:** `https://{host}/api/v1`  
**Versión:** 1.2.4  
**Especificación completa:** [openapi.yaml](./openapi.yaml)

Esta guía cubre los conceptos fundamentales para integrar con la API REST del Sistema de Gestión de Expedientes Digitales (SGED): autenticación, paginación, formato de respuesta, manejo de errores y control de acceso por rol.

---

## Autenticación

Todos los endpoints requieren un token JWT en el header `Authorization`, excepto `POST /auth/login`.

### Obtener un token

```bash
curl -X POST https://{host}/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jperez",
    "password": "MiClave123!"
  }'
```

Respuesta exitosa (`200 OK`):

```json
{
  "success": true,
  "message": "Sesión iniciada exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tipo": "Bearer",
    "nombre": "Juan Pérez",
    "rol": "SECRETARIO",
    "juzgado": "Juzgado Civil N°1"
  },
  "timestamp": "2026-05-03T10:00:00Z"
}
```

### Usar el token en requests posteriores

Incluye el valor de `data.token` en cada request:

```bash
curl https://{host}/api/v1/expedientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### Notas importantes

- El token expira **8 horas** después de emitido.
- Después de **5 intentos fallidos** de login, la cuenta queda bloqueada (`423 Locked`). Un administrador debe desbloquearla con `POST /admin/usuarios/{id}/desbloquear`.
- Para cerrar sesión y revocar el token activo usa `POST /auth/logout`. El token queda invalidado inmediatamente.
- Para cambiar tu propia contraseña usa `POST /auth/cambiar-password` (requiere enviar la contraseña actual).

---

## Paginación

Los endpoints que retornan listas aceptan dos query params:

| Parámetro | Tipo    | Por defecto | Descripción                        |
|-----------|---------|-------------|------------------------------------|
| `page`    | integer | `0`         | Número de página (base 0)          |
| `size`    | integer | `20`        | Cantidad de registros por página   |

Ejemplo:

```bash
curl "https://{host}/api/v1/expedientes?page=2&size=10" \
  -H "Authorization: Bearer <token>"
```

### Formato de respuesta paginada

El campo `data` del envelope `ApiResponse` contiene un objeto con la siguiente estructura:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "content": [ /* array de objetos de la página actual */ ],
    "totalElements": 143,
    "totalPages": 15,
    "number": 2,
    "size": 10
  },
  "timestamp": "2026-05-03T10:05:00Z"
}
```

| Campo           | Descripción                                               |
|-----------------|-----------------------------------------------------------|
| `content`       | Registros de la página actual                             |
| `totalElements` | Total de registros que coinciden con el filtro aplicado   |
| `totalPages`    | Total de páginas disponibles para el `size` indicado      |
| `number`        | Página actual (base 0, igual al parámetro `page` enviado) |
| `size`          | Tamaño de página configurado                              |

---

## Formato de respuesta

Todas las respuestas de la API — tanto éxitos como errores — están envueltas en el mismo objeto `ApiResponse`:

```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": { /* payload específico del endpoint, o null en errores */ },
  "timestamp": "2026-05-03T10:00:00Z"
}
```

| Campo       | Tipo     | Descripción                                                      |
|-------------|----------|------------------------------------------------------------------|
| `success`   | boolean  | `true` si la operación fue exitosa, `false` si hubo error        |
| `message`   | string   | Mensaje legible que describe el resultado o el error             |
| `data`      | any      | Payload del endpoint (varía por operación; `null` en errores)    |
| `timestamp` | datetime | Marca de tiempo ISO 8601 de cuando se generó la respuesta        |

**Ejemplo de error:**

```json
{
  "success": false,
  "message": "El campo 'numero' es obligatorio",
  "data": null,
  "timestamp": "2026-05-03T10:01:00Z"
}
```

---

## Errores

La API usa códigos HTTP estándar. Cuando ocurre un error, `success` es `false` y `message` explica el motivo.

| Código HTTP | Nombre                | Cuándo ocurre                                                                         |
|-------------|-----------------------|---------------------------------------------------------------------------------------|
| `400`       | Bad Request           | Datos de entrada inválidos, campo obligatorio faltante, o valor duplicado             |
| `401`       | Unauthorized          | Token JWT no enviado, expirado o con firma inválida                                   |
| `403`       | Forbidden             | Token válido, pero el rol del usuario no tiene permiso sobre este recurso             |
| `404`       | Not Found             | El recurso solicitado (expediente, documento, usuario) no existe en el sistema        |
| `423`       | Locked                | La cuenta del usuario fue bloqueada por 5 intentos fallidos de login consecutivos     |
| `500`       | Internal Server Error | Error inesperado en el servidor — reportar al equipo con el `timestamp` de la respuesta |

---

## Control de acceso por rol

El sistema tiene 4 roles. Cada rol tiene un conjunto de operaciones permitidas:

| Rol          | Consultar expedientes | Crear / editar expedientes | Subir / eliminar documentos | Administrar usuarios y auditoría |
|--------------|-----------------------|----------------------------|-----------------------------|----------------------------------|
| `CONSULTA`   | Si                    | No                         | No                          | No                               |
| `AUXILIAR`   | Si                    | No                         | Solo subir (no eliminar)    | No                               |
| `SECRETARIO` | Si                    | Si                         | Si (subir y eliminar)       | No                               |
| `ADMIN`      | Si                    | Si                         | Si (subir y eliminar)       | Si (acceso total)                |

### Notas de acceso

- **Catálogos** (`/catalogos/*`) y **estadísticas** (`/expedientes/estadisticas`) son accesibles para todos los roles autenticados.
- **Búsqueda** rápida y avanzada es accesible para todos los roles autenticados.
- **Visualizar y descargar documentos** (`/documentos/{id}/contenido`, `/stream`) es accesible para todos los roles autenticados.
- **Generar PDF para impresión** (`/documentos/{id}/impresion`) requiere AUXILIAR, SECRETARIO o ADMIN.
- **Administración de usuarios** (`/admin/usuarios/*`) y **auditoría** (`/admin/auditoria/*`) son exclusivos de ADMIN.
- Si tu rol no tiene acceso a un recurso, recibirás `403 Forbidden` con el mensaje `"Acceso denegado: rol insuficiente"`.

El rol del usuario autenticado se retorna en el campo `data.rol` de la respuesta de login y determina qué operaciones puede realizar durante la sesión.

---

## Referencia completa

La especificación OpenAPI 3.1 con todos los endpoints, schemas y ejemplos está en:

- [`docs/api/openapi.yaml`](./openapi.yaml)

Puedes importarla directamente en [Swagger UI](https://swagger.io/tools/swagger-ui/), [Insomnia](https://insomnia.rest/) o [Postman](https://www.postman.com/) para explorar y probar la API de forma interactiva.
