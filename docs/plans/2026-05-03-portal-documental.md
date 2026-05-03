# Portal Documental Completo SGED — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Producir 24 artefactos documentales profesionales organizados en un portal unificado con 4 secciones (usuarios, desarrollo, api, operaciones).

**Architecture:** Portal Markdown en `docs/` con secciones independientes por audiencia. Cada sección usa un skill especializado. La spec OpenAPI se genera primero y sirve de referencia para las demás secciones.

**Tech Stack:** Markdown, OpenAPI 3.1 YAML, skills: user-manual-writer, docs-architect, api-documenter, documentation-generation-doc-generate.

---

## Task 1: Crear estructura de directorios

**Files:**
- Create: `docs/usuarios/` (directorio)
- Create: `docs/desarrollo/` (directorio)
- Create: `docs/api/` (directorio)
- Create: `docs/operaciones/` (directorio)

- [ ] **Step 1: Crear directorios**

```bash
mkdir -p docs/usuarios docs/desarrollo docs/api docs/operaciones
```

- [ ] **Step 2: Verificar**

```bash
ls docs/
```
Esperado: ver `usuarios/`, `desarrollo/`, `api/`, `operaciones/` en la lista.

- [ ] **Step 3: Commit**

```bash
git add docs/usuarios/.gitkeep docs/desarrollo/.gitkeep docs/api/.gitkeep docs/operaciones/.gitkeep
# Si .gitkeep no aplica, continuar al siguiente task sin commit — los directorios se commitean con los archivos
```

---

## Task 2: docs/api/openapi.yaml — Spec OpenAPI 3.1

**Fuentes a leer antes de escribir:**
- `sGED-backend/src/main/java/com/oj/sged/api/controller/AuthController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/controller/ExpedienteController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/controller/DocumentoController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/controller/AdminUsuariosController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/controller/BusquedaExpedientesController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/controller/CatalogosController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/controller/AuditoriaController.java`
- `sGED-backend/src/main/java/com/oj/sged/api/dto/request/` (todos los DTOs)
- `sGED-backend/src/main/java/com/oj/sged/api/dto/response/` (todos los DTOs)

**Skill:** `api-documenter`

- [ ] **Step 1: Invocar skill api-documenter**

Usar `Skill` tool con `api-documenter` y pasarle el contexto: generar spec OpenAPI 3.1 completa para el SGED basada en los 7 controllers listados arriba.

- [ ] **Step 2: Escribir docs/api/openapi.yaml con esta estructura base**

```yaml
openapi: "3.1.0"
info:
  title: SGED API
  description: API REST del Sistema de Gestión de Expedientes Digitales
  version: "1.2.4"
  contact:
    name: Equipo SGED

servers:
  - url: https://{host}/api/v1
    description: Servidor de producción

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ApiResponse:
      type: object
      properties:
        success: { type: boolean }
        message: { type: string }
        data: {}
        timestamp: { type: string, format: date-time }

    LoginRequest:
      type: object
      required: [username, password]
      properties:
        username: { type: string }
        password: { type: string }

    LoginResponseData:
      type: object
      properties:
        token: { type: string }
        tipo: { type: string, example: Bearer }
        nombre: { type: string }
        rol: { type: string, enum: [ADMIN, SECRETARIO, AUXILIAR, CONSULTA] }
        juzgado: { type: string }

    ExpedienteRequest:
      type: object
      required: [numero, tipoProceso, juzgado, estado]
      properties:
        numero: { type: string, example: "2024-001-CR" }
        tipoProceso: { type: integer }
        juzgado: { type: integer }
        estado: { type: integer }
        descripcion: { type: string }
        demandante: { type: string }
        demandado: { type: string }

    ExpedienteResponse:
      type: object
      properties:
        id: { type: integer }
        numero: { type: string }
        tipoProceso: { type: string }
        juzgado: { type: string }
        estado: { type: string }
        descripcion: { type: string }
        demandante: { type: string }
        demandado: { type: string }
        fechaCreacion: { type: string, format: date-time }
        fechaModificacion: { type: string, format: date-time }

    DocumentoResponse:
      type: object
      properties:
        id: { type: integer }
        nombre: { type: string }
        tipoDocumento: { type: string }
        mimeType: { type: string }
        tamano: { type: integer }
        expedienteId: { type: integer }
        fechaCarga: { type: string, format: date-time }

    BusquedaAvanzadaRequest:
      type: object
      properties:
        numero: { type: string }
        tipoProceso: { type: integer }
        estado: { type: integer }
        juzgado: { type: integer }
        demandante: { type: string }
        demandado: { type: string }
        fechaDesde: { type: string, format: date }
        fechaHasta: { type: string, format: date }
        page: { type: integer, default: 0 }
        size: { type: integer, default: 20 }

    UsuarioRequest:
      type: object
      required: [username, nombre, rolId, juzgadoId]
      properties:
        username: { type: string }
        nombre: { type: string }
        rolId: { type: integer }
        juzgadoId: { type: integer }

    AuditoriaResponse:
      type: object
      properties:
        id: { type: integer }
        usuario: { type: string }
        accion: { type: string }
        expedienteNumero: { type: string }
        ip: { type: string }
        timestamp: { type: string, format: date-time }

    Error:
      type: object
      properties:
        success: { type: boolean, example: false }
        message: { type: string }
        timestamp: { type: string, format: date-time }

  responses:
    Unauthorized:
      description: Token inválido o expirado
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
    Forbidden:
      description: Sin permisos para este recurso
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
    NotFound:
      description: Recurso no encontrado
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }

paths:
  /auth/login:
    post:
      tags: [Autenticación]
      summary: Iniciar sesión
      security: []
      x-required-role: público
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/LoginRequest' }
            example:
              username: "jperez"
              password: "MiClave123!"
      responses:
        "200":
          description: Login exitoso — retorna JWT
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/LoginResponseData' }
        "401":
          description: Credenciales inválidas
        "423":
          description: Cuenta bloqueada por intentos fallidos

  /auth/logout:
    post:
      tags: [Autenticación]
      summary: Cerrar sesión (revoca el token JWT)
      x-required-role: cualquier rol autenticado
      responses:
        "200":
          description: Sesión cerrada exitosamente
        "401": { $ref: '#/components/responses/Unauthorized' }

  /auth/cambiar-password:
    post:
      tags: [Autenticación]
      summary: Cambiar contraseña del usuario en sesión
      x-required-role: cualquier rol autenticado
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [passwordActual, passwordNuevo]
              properties:
                passwordActual: { type: string }
                passwordNuevo: { type: string, minLength: 8 }
      responses:
        "200":
          description: Contraseña actualizada
        "400":
          description: Contraseña actual incorrecta o nueva no cumple política
        "401": { $ref: '#/components/responses/Unauthorized' }

  /expedientes:
    get:
      tags: [Expedientes]
      summary: Listar expedientes paginados
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 0 }
        - name: size
          in: query
          schema: { type: integer, default: 20 }
      responses:
        "200":
          description: Lista paginada de expedientes
        "401": { $ref: '#/components/responses/Unauthorized' }
    post:
      tags: [Expedientes]
      summary: Crear nuevo expediente
      x-required-role: SECRETARIO, ADMIN
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/ExpedienteRequest' }
      responses:
        "201":
          description: Expediente creado
        "400":
          description: Datos inválidos
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /expedientes/estadisticas:
    get:
      tags: [Expedientes]
      summary: KPIs del dashboard
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      responses:
        "200":
          description: Estadísticas del sistema
        "401": { $ref: '#/components/responses/Unauthorized' }

  /expedientes/{id}:
    get:
      tags: [Expedientes]
      summary: Detalle de un expediente
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Expediente encontrado
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/ExpedienteResponse' }
        "401": { $ref: '#/components/responses/Unauthorized' }
        "404": { $ref: '#/components/responses/NotFound' }
    put:
      tags: [Expedientes]
      summary: Actualizar expediente
      x-required-role: SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/ExpedienteRequest' }
      responses:
        "200":
          description: Expediente actualizado
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
        "404": { $ref: '#/components/responses/NotFound' }

  /expedientes/busqueda/rapida:
    get:
      tags: [Búsqueda]
      summary: Búsqueda rápida por número de expediente
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: numero
          in: query
          required: true
          schema: { type: string }
          example: "2024-001"
      responses:
        "200":
          description: Resultados de búsqueda
        "401": { $ref: '#/components/responses/Unauthorized' }

  /expedientes/busqueda/avanzada:
    post:
      tags: [Búsqueda]
      summary: Búsqueda avanzada con múltiples criterios
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/BusquedaAvanzadaRequest' }
      responses:
        "200":
          description: Resultados paginados
        "401": { $ref: '#/components/responses/Unauthorized' }

  /expedientes/{id}/documentos:
    get:
      tags: [Documentos]
      summary: Listar documentos de un expediente
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Lista de documentos
        "401": { $ref: '#/components/responses/Unauthorized' }
        "404": { $ref: '#/components/responses/NotFound' }
    post:
      tags: [Documentos]
      summary: Subir documento a un expediente
      x-required-role: AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file]
              properties:
                file:
                  type: string
                  format: binary
                nombre:
                  type: string
                tipoDocumentoId:
                  type: integer
      responses:
        "201":
          description: Documento subido exitosamente
        "400":
          description: Archivo inválido, tipo no permitido o supera el límite de tamaño
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /documentos/{id}:
    get:
      tags: [Documentos]
      summary: Detalle de un documento
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Metadatos del documento
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/DocumentoResponse' }
        "401": { $ref: '#/components/responses/Unauthorized' }
        "404": { $ref: '#/components/responses/NotFound' }
    delete:
      tags: [Documentos]
      summary: Eliminar documento (soft delete)
      x-required-role: SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Documento eliminado
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
        "404": { $ref: '#/components/responses/NotFound' }

  /documentos/{id}/contenido:
    get:
      tags: [Documentos]
      summary: Stream del contenido del documento (inline o attachment)
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
        - name: disposition
          in: query
          schema: { type: string, enum: [inline, attachment], default: inline }
      responses:
        "200":
          description: Contenido del archivo
          content:
            application/octet-stream:
              schema: { type: string, format: binary }
        "401": { $ref: '#/components/responses/Unauthorized' }
        "404": { $ref: '#/components/responses/NotFound' }

  /documentos/{id}/stream:
    get:
      tags: [Documentos]
      summary: Streaming progresivo del documento (para video/audio)
      x-required-role: CONSULTA, AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "206":
          description: Contenido parcial (streaming)
        "401": { $ref: '#/components/responses/Unauthorized' }
        "404": { $ref: '#/components/responses/NotFound' }

  /documentos/{id}/impresion:
    post:
      tags: [Documentos]
      summary: Generar versión PDF para impresión
      x-required-role: AUXILIAR, SECRETARIO, ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: PDF generado listo para descarga
          content:
            application/pdf:
              schema: { type: string, format: binary }
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /admin/usuarios:
    get:
      tags: [Administración — Usuarios]
      summary: Listar usuarios con paginación
      x-required-role: ADMIN
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 0 }
        - name: size
          in: query
          schema: { type: integer, default: 20 }
      responses:
        "200":
          description: Lista paginada de usuarios
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
    post:
      tags: [Administración — Usuarios]
      summary: Crear nuevo usuario
      x-required-role: ADMIN
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UsuarioRequest' }
      responses:
        "201":
          description: Usuario creado
        "400":
          description: Datos inválidos o username duplicado
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /admin/usuarios/{id}:
    get:
      tags: [Administración — Usuarios]
      summary: Detalle de usuario
      x-required-role: ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Datos del usuario
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
        "404": { $ref: '#/components/responses/NotFound' }
    put:
      tags: [Administración — Usuarios]
      summary: Actualizar usuario
      x-required-role: ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UsuarioRequest' }
      responses:
        "200":
          description: Usuario actualizado
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
        "404": { $ref: '#/components/responses/NotFound' }

  /admin/usuarios/{id}/reset-password:
    post:
      tags: [Administración — Usuarios]
      summary: Resetear contraseña de usuario
      x-required-role: ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Contraseña reseteada — nueva contraseña temporal en respuesta
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
        "404": { $ref: '#/components/responses/NotFound' }

  /admin/usuarios/{id}/bloquear:
    post:
      tags: [Administración — Usuarios]
      summary: Bloquear cuenta de usuario
      x-required-role: ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Cuenta bloqueada
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /admin/usuarios/{id}/desbloquear:
    post:
      tags: [Administración — Usuarios]
      summary: Desbloquear cuenta de usuario
      x-required-role: ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Cuenta desbloqueada
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /admin/auditoria:
    get:
      tags: [Administración — Auditoría]
      summary: Consultar registros de auditoría
      x-required-role: ADMIN
      parameters:
        - name: usuario
          in: query
          schema: { type: string }
        - name: accion
          in: query
          schema: { type: string }
        - name: fechaDesde
          in: query
          schema: { type: string, format: date }
        - name: fechaHasta
          in: query
          schema: { type: string, format: date }
        - name: page
          in: query
          schema: { type: integer, default: 0 }
        - name: size
          in: query
          schema: { type: integer, default: 50 }
      responses:
        "200":
          description: Registros de auditoría paginados
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }

  /admin/auditoria/{id}:
    get:
      tags: [Administración — Auditoría]
      summary: Detalle de registro de auditoría
      x-required-role: ADMIN
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Registro de auditoría
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/AuditoriaResponse' }
        "401": { $ref: '#/components/responses/Unauthorized' }
        "403": { $ref: '#/components/responses/Forbidden' }
        "404": { $ref: '#/components/responses/NotFound' }

  /catalogos/tipos-proceso:
    get:
      tags: [Catálogos]
      summary: Tipos de proceso judicial
      x-required-role: cualquier rol autenticado
      security: [{ bearerAuth: [] }]
      responses:
        "200":
          description: Lista de tipos de proceso
        "401": { $ref: '#/components/responses/Unauthorized' }

  /catalogos/estados-expediente:
    get:
      tags: [Catálogos]
      summary: Estados de expediente
      x-required-role: cualquier rol autenticado
      responses:
        "200":
          description: Lista de estados
        "401": { $ref: '#/components/responses/Unauthorized' }

  /catalogos/juzgados:
    get:
      tags: [Catálogos]
      summary: Juzgados disponibles
      x-required-role: cualquier rol autenticado
      responses:
        "200":
          description: Lista de juzgados
        "401": { $ref: '#/components/responses/Unauthorized' }
```

- [ ] **Step 3: Verificar checklist**
  - [ ] Los 8 controllers están representados
  - [ ] Todos los endpoints tienen `x-required-role`
  - [ ] Auth endpoints tienen `security: []` donde corresponde
  - [ ] Schemas cubren request y response de cada endpoint
  - [ ] Errores 401/403/404 están documentados en cada endpoint

- [ ] **Step 4: Commit**

```bash
git add docs/api/openapi.yaml
git commit -m "docs(api): agregar spec OpenAPI 3.1 completa con 30+ endpoints"
```

---

## Task 3: docs/api/INDEX.md — Guía de uso de la API

**Skill:** `api-documenter`

- [ ] **Step 1: Escribir docs/api/INDEX.md**

Contenido exacto a producir:

```markdown
# API REST — SGED

Base URL: `https://{host}/api/v1`

## Autenticación

Todos los endpoints (excepto `/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

### Obtener token

```bash
curl -X POST https://{host}/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jperez","password":"MiClave123!"}'
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "tipo": "Bearer",
    "nombre": "Juan Pérez",
    "rol": "SECRETARIO",
    "juzgado": "Juzgado Civil N°1"
  }
}
```

El token expira en **8 horas**. Renueva iniciando sesión nuevamente.

## Paginación

Los endpoints de lista aceptan:
- `page` (default: 0) — número de página
- `size` (default: 20) — elementos por página

Respuesta de lista incluye:
```json
{
  "data": {
    "content": [...],
    "totalElements": 150,
    "totalPages": 8,
    "number": 0
  }
}
```

## Formato de respuesta

Todas las respuestas siguen el envelope `ApiResponse`:
```json
{
  "success": true|false,
  "message": "Descripción",
  "data": { ... },
  "timestamp": "2026-05-03T10:00:00Z"
}
```

## Errores

| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos — revisar el body |
| 401 | Token inválido, expirado o no enviado |
| 403 | Sin permisos (rol insuficiente) |
| 404 | Recurso no encontrado |
| 423 | Cuenta bloqueada |
| 500 | Error interno — contactar soporte |

## Control de acceso por rol

| Rol | Permisos |
|-----|---------|
| ADMIN | Acceso total |
| SECRETARIO | CRUD expedientes y documentos |
| AUXILIAR | Crear expedientes, subir documentos, solo lectura edición |
| CONSULTA | Solo lectura |

## Referencia completa

Ver [openapi.yaml](./openapi.yaml) para especificación completa con todos los schemas y ejemplos.
```

- [ ] **Step 2: Verificar checklist**
  - [ ] Flujo de autenticación completo con ejemplo curl
  - [ ] Tabla de roles explicada
  - [ ] Paginación documentada
  - [ ] Tabla de errores presente

- [ ] **Step 3: Commit**

```bash
git add docs/api/INDEX.md
git commit -m "docs(api): agregar guía de uso de la API REST"
```

---

## Task 4: docs/usuarios/INDEX.md + 01-introduccion.md

**Fuente:** `docs/general/MANUAL_DE_USUARIO_FINAL.md` (leer completo)  
**Skill:** `user-manual-writer`

- [ ] **Step 1: Invocar skill user-manual-writer**

Usar `Skill` tool con `user-manual-writer` indicando: manual para funcionarios judiciales de un sistema de gestión de expedientes digitales, sin jerga técnica, con secciones por rol.

- [ ] **Step 2: Escribir docs/usuarios/INDEX.md**

```markdown
# Manual de Usuario — SGED

Bienvenido al **Sistema de Gestión de Expedientes Digitales (SGED)**.

## Capítulos

1. [Introducción y roles](./01-introduccion.md)
2. [Acceso y navegación](./02-acceso-y-navegacion.md)
3. [Gestión de expedientes](./03-expedientes.md)
4. [Gestión de documentos](./04-documentos.md)
5. [Búsqueda de expedientes](./05-busqueda.md)
6. [Panel de control (Dashboard)](./06-dashboard.md)
7. [Preguntas frecuentes](./07-faq-y-problemas-frecuentes.md)

## ¿Cuál es su rol?

| Rol | Ir a... |
|-----|---------|
| Administrador (IT) | Todos los capítulos + secciones ADMIN |
| Secretario | Capítulos 2, 3, 4, 5, 6 |
| Auxiliar | Capítulos 2, 3, 4, 5, 6 |
| Consulta | Capítulos 2, 5, 6 |

**Versión del sistema documentado:** 1.2.4  
**Última actualización:** 2026-05-03
```

- [ ] **Step 3: Escribir docs/usuarios/01-introduccion.md**

```markdown
# 1. Introducción

## ¿Qué es el SGED?

El SGED es la plataforma digital para gestionar expedientes judiciales y sus documentos asociados. Permite buscar, crear, editar y visualizar expedientes y documentos desde cualquier navegador, sin necesidad de instalar programas adicionales.

## Requisitos

- Navegador: Chrome 120+, Firefox 120+, Edge 120+ (actualizado)
- Conexión a internet estable
- Credenciales de acceso proporcionadas por el administrador

## Sus permisos según su rol

| Lo que necesita hacer | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|-----------------------|-------|-----------|---------|---------|
| Crear usuarios | Sí | No | No | No |
| Crear expedientes | Sí | Sí | Sí | No |
| Editar expedientes | Sí | Sí | No | No |
| Subir documentos | Sí | Sí | Sí | No |
| Eliminar documentos | Sí | Sí | No | No |
| Ver y buscar expedientes | Sí | Sí | Sí | Sí |
| Ver registros de auditoría | Sí | No | No | No |

## Convenciones de este manual

- **Negrita** indica un botón o elemento de la pantalla
- `Código` indica un campo de texto o valor a escribir
- > [!NOTE] indica información importante
- > [!WARNING] indica una acción irreversible

## Soporte

Si tiene problemas de acceso, contacte a su administrador del sistema.
```

- [ ] **Step 4: Verificar checklist**
  - [ ] INDEX linkea los 7 capítulos
  - [ ] Tabla de roles en introducción es correcta
  - [ ] Sin jerga técnica (sin términos como JWT, API, backend)

- [ ] **Step 5: Commit**

```bash
git add docs/usuarios/INDEX.md docs/usuarios/01-introduccion.md
git commit -m "docs(usuarios): INDEX y capítulo 1 — introducción y roles"
```

---

## Task 5: docs/usuarios/02-acceso-y-navegacion.md

**Fuente:** `docs/general/MANUAL_DE_USUARIO_FINAL.md` (sección 1 — Ingreso)

- [ ] **Step 1: Escribir docs/usuarios/02-acceso-y-navegacion.md**

```markdown
# 2. Acceso y Navegación

## Iniciar sesión

1. Abra su navegador e ingrese a la dirección del sistema proporcionada por su administrador.
2. Escriba su **Nombre de usuario** y **Contraseña** en los campos correspondientes.
3. Haga clic en **Ingresar**.

> [!WARNING]
> Si ingresa una contraseña incorrecta **5 veces seguidas**, su cuenta se bloqueará automáticamente. Contacte a su administrador para desbloquearla.

## La pantalla principal

Al ingresar verá dos zonas:

- **Menú lateral izquierdo:** accesos a los módulos disponibles según su rol (Expedientes, Búsqueda, Dashboard, Administración).
- **Barra superior:** muestra su nombre de usuario en la esquina derecha.

## Cambiar su contraseña

1. Haga clic en su nombre de usuario en la barra superior.
2. Seleccione **Cambiar contraseña**.
3. Escriba su contraseña actual y la nueva contraseña (mínimo 8 caracteres).
4. Haga clic en **Guardar**.

> [!NOTE]
> La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número.

## Cerrar sesión

1. Haga clic en su nombre de usuario en la barra superior.
2. Seleccione **Cerrar sesión**.
3. La sesión se cierra de forma segura.

> [!WARNING]
> Por seguridad, la sesión expira automáticamente después de 8 horas de inactividad. Guarde su trabajo antes de alejarse del equipo.

## Permisos por rol

| Acción | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|--------|-------|-----------|---------|---------|
| Cambiar su contraseña | Sí | Sí | Sí | Sí |
| Ver módulo Administración | Sí | No | No | No |
| Ver módulo Expedientes | Sí | Sí | Sí | Sí |
| Ver módulo Búsqueda | Sí | Sí | Sí | Sí |
```

- [ ] **Step 2: Verificar checklist**
  - [ ] Pasos de login numerados
  - [ ] Advertencia sobre bloqueo por 5 intentos
  - [ ] Instrucciones de cambio de contraseña
  - [ ] Instrucciones de logout
  - [ ] Sin jerga técnica

- [ ] **Step 3: Commit**

```bash
git add docs/usuarios/02-acceso-y-navegacion.md
git commit -m "docs(usuarios): capítulo 2 — acceso y navegación"
```

---

## Task 6: docs/usuarios/03-expedientes.md

**Fuente:** `docs/general/MANUAL_DE_USUARIO_FINAL.md` (sección 3 — Módulo Expedientes)

- [ ] **Step 1: Escribir docs/usuarios/03-expedientes.md**

```markdown
# 3. Gestión de Expedientes

## Ver el listado de expedientes

1. En el menú lateral, haga clic en **Expedientes**.
2. Verá una tabla con todos los expedientes disponibles, con los campos: Número, Tipo de proceso, Juzgado, Estado, Fecha de creación.
3. Use los botones de la columna derecha para: **Ver detalle**, **Editar** o **Ir a documentos**.

## Crear un nuevo expediente

> [!NOTE]
> Solo roles ADMIN y SECRETARIO pueden crear expedientes.

1. En la pantalla de Expedientes, haga clic en el botón **Nuevo Expediente** (esquina superior derecha).
2. Complete los campos obligatorios:
   - **Número de expediente** (ej: `2024-001-CR`) — debe ser único en el sistema
   - **Tipo de proceso** — seleccione de la lista desplegable
   - **Juzgado** — seleccione el juzgado correspondiente
   - **Estado** — seleccione el estado inicial
3. Complete los campos opcionales: Descripción, Demandante, Demandado.
4. Haga clic en **Guardar**.

> [!WARNING]
> El número de expediente no puede repetirse. Si el sistema muestra un error, verifique que no exista ya un expediente con ese número.

## Ver el detalle de un expediente

1. En el listado, haga clic en el ícono de **ojo** (Ver) en la fila del expediente.
2. Verá todos los datos del expediente y, en la parte inferior, la lista de documentos asociados.
3. Desde esta vista puede acceder a la **Bóveda Documental** haciendo clic en **Ver documentos**.

## Editar un expediente

> [!NOTE]
> Solo roles ADMIN y SECRETARIO pueden editar expedientes.

1. En el listado, haga clic en el ícono de **lápiz** (Editar) en la fila del expediente.
2. Modifique los campos necesarios.
3. Haga clic en **Guardar cambios**.

## Estados de un expediente

| Estado | Significado |
|--------|-------------|
| Activo | Expediente en trámite |
| Archivado | Expediente finalizado, solo consulta |
| Suspendido | Trámite temporalmente detenido |

## Permisos por rol

| Acción | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|--------|-------|-----------|---------|---------|
| Ver listado | Sí | Sí | Sí | Sí |
| Ver detalle | Sí | Sí | Sí | Sí |
| Crear expediente | Sí | Sí | Sí | No |
| Editar expediente | Sí | Sí | No | No |
```

- [ ] **Step 2: Verificar checklist**
  - [ ] Pasos de creación numerados con campos obligatorios listados
  - [ ] Tabla de estados
  - [ ] Tabla de permisos por rol
  - [ ] Sin jerga técnica

- [ ] **Step 3: Commit**

```bash
git add docs/usuarios/03-expedientes.md
git commit -m "docs(usuarios): capítulo 3 — gestión de expedientes"
```

---

## Task 7: docs/usuarios/04-documentos.md

**Fuente:** `docs/general/MANUAL_DE_USUARIO_FINAL.md` (sección 4 — Bóveda Documental)

- [ ] **Step 1: Escribir docs/usuarios/04-documentos.md**

```markdown
# 4. Gestión de Documentos

## Acceder a los documentos de un expediente

1. En el listado de expedientes, haga clic en el ícono de **carpeta** (Documentos) del expediente.
2. Verá la lista de todos los documentos cargados, con: nombre, tipo, tamaño y fecha de carga.

## Subir un documento

> [!NOTE]
> Roles ADMIN, SECRETARIO y AUXILIAR pueden subir documentos.

1. En la pantalla de documentos del expediente, haga clic en **Subir Documento**.
2. Se abrirá una ventana para seleccionar el archivo. También puede **arrastrar y soltar** el archivo directamente.
3. El sistema verificará el archivo automáticamente.
4. Haga clic en **Confirmar carga**.

**Formatos permitidos:** PDF, Word (.docx), Excel (.xlsx), imágenes (JPG, PNG), video (MP4), audio (MP3, WAV)  
**Tamaño máximo:** 100 MB por archivo

> [!WARNING]
> Si el archivo supera el tamaño máximo o tiene un formato no permitido, el sistema mostrará un error y no se realizará la carga.

## Ver un documento (Visor integrado)

No es necesario descargar el archivo. El sistema incluye un visor integrado:

1. Haga clic en el ícono de **ojo** (Ver) sobre el documento.
2. El documento se abrirá en pantalla según su tipo:
   - **PDF:** visor de páginas con navegación
   - **Imagen:** visor a pantalla completa con zoom
   - **Audio:** reproductor con controles de play/pause/volumen
   - **Video:** reproductor con controles completos
3. Para cerrar el visor, haga clic fuera de la ventana o en la **X**.

## Descargar un documento

1. En la lista de documentos, haga clic en el ícono de **descarga** sobre el documento.
2. El archivo se descargará a su carpeta de descargas.

## Eliminar un documento

> [!NOTE]
> Solo roles ADMIN y SECRETARIO pueden eliminar documentos.

> [!WARNING]
> La eliminación es permanente. Una vez eliminado, el documento no puede recuperarse.

1. En la lista de documentos, haga clic en el ícono de **papelera** sobre el documento.
2. Confirme la eliminación en el cuadro de diálogo.

## Permisos por rol

| Acción | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|--------|-------|-----------|---------|---------|
| Ver documentos | Sí | Sí | Sí | Sí |
| Descargar | Sí | Sí | Sí | Sí |
| Subir documentos | Sí | Sí | Sí | No |
| Eliminar documentos | Sí | Sí | No | No |
```

- [ ] **Step 2: Verificar**
  - [ ] Formatos permitidos y límite de tamaño listados
  - [ ] Instrucciones del visor por tipo de archivo
  - [ ] Advertencia en eliminación
  - [ ] Tabla de permisos

- [ ] **Step 3: Commit**

```bash
git add docs/usuarios/04-documentos.md
git commit -m "docs(usuarios): capítulo 4 — gestión de documentos"
```

---

## Task 8: docs/usuarios/05-busqueda.md + 06-dashboard.md + 07-faq.md

- [ ] **Step 1: Escribir docs/usuarios/05-busqueda.md**

```markdown
# 5. Búsqueda de Expedientes

## Búsqueda rápida

Para encontrar un expediente cuando conoce su número:

1. En el menú lateral, haga clic en **Búsqueda**.
2. En el campo **Búsqueda rápida**, escriba el número o parte del número del expediente.
3. Presione **Enter** o haga clic en **Buscar**.
4. Los resultados aparecerán debajo. Haga clic en el expediente para ver su detalle.

## Búsqueda avanzada

Para buscar con múltiples criterios:

1. En la pantalla de Búsqueda, haga clic en la pestaña **Búsqueda Avanzada**.
2. Complete uno o más de los siguientes criterios:
   - **Número de expediente** (parcial o completo)
   - **Tipo de proceso** (desplegable)
   - **Estado** (desplegable)
   - **Juzgado** (desplegable)
   - **Demandante** o **Demandado** (nombre parcial)
   - **Fecha desde / Fecha hasta** (rango de fechas de creación)
3. Haga clic en **Buscar**.

> [!NOTE]
> Puede combinar tantos criterios como necesite. A más criterios, más precisa será la búsqueda.

## Interpretar los resultados

Los resultados se muestran en una tabla paginada. Cada fila muestra:
- Número de expediente
- Tipo de proceso
- Juzgado
- Estado
- Fecha de creación

Haga clic en cualquier fila para ver el detalle del expediente.

## Permisos por rol

Todos los roles (ADMIN, SECRETARIO, AUXILIAR, CONSULTA) tienen acceso completo a la búsqueda.
```

- [ ] **Step 2: Escribir docs/usuarios/06-dashboard.md**

```markdown
# 6. Panel de Control (Dashboard)

## Acceder al dashboard

Al iniciar sesión, el sistema lo lleva automáticamente al Panel de Control. También puede acceder desde el menú lateral haciendo clic en **Dashboard**.

## Indicadores disponibles

El dashboard muestra los siguientes indicadores:

| Indicador | Descripción |
|-----------|-------------|
| Total de expedientes | Número total de expedientes en el sistema |
| Expedientes activos | Expedientes con estado "Activo" |
| Expedientes archivados | Expedientes con estado "Archivado" |
| Documentos cargados | Total de documentos en el sistema |
| Expedientes recientes | Últimos expedientes creados o modificados |

## Permisos por rol

Todos los roles tienen acceso al dashboard. Los indicadores mostrados son los mismos para todos los roles.
```

- [ ] **Step 3: Escribir docs/usuarios/07-faq-y-problemas-frecuentes.md**

```markdown
# 7. Preguntas Frecuentes y Problemas Comunes

## No puedo iniciar sesión

**Síntoma:** El sistema muestra "Credenciales inválidas".  
**Solución:** Verifique que el nombre de usuario y contraseña sean correctos (mayúsculas y minúsculas importan). Si olvidó su contraseña, contacte a su administrador para un reset.

## Mi cuenta está bloqueada

**Síntoma:** El sistema muestra "Cuenta bloqueada".  
**Causa:** Se ingresaron 5 contraseñas incorrectas consecutivas.  
**Solución:** Contacte a su administrador. Solo el rol ADMIN puede desbloquear cuentas.

## La sesión se cerró sola

**Síntoma:** El sistema lo redirige al login sin que usted haya cerrado sesión.  
**Causa:** La sesión expira automáticamente después de 8 horas de inactividad por seguridad.  
**Solución:** Inicie sesión nuevamente. Su trabajo guardado no se pierde.

## No puedo ver un documento

**Síntoma:** Al hacer clic en Ver, no abre el documento o muestra un error.  
**Posibles causas y soluciones:**
1. El archivo puede estar dañado — contacte al secretario que lo subió
2. Su navegador puede estar desactualizado — actualice Chrome, Firefox o Edge
3. Archivos de video muy grandes pueden tardar en cargar — espere unos segundos

## No aparece el botón "Nuevo Expediente"

**Síntoma:** No veo el botón para crear expedientes.  
**Causa:** Su rol (CONSULTA) no tiene permiso para crear expedientes.  
**Solución:** Si necesita crear expedientes, solicite al administrador que cambie su rol.

## El sistema está lento

**Síntoma:** Las páginas tardan en cargar.  
**Soluciones:**
1. Verifique su conexión a internet
2. Recargue la página (F5)
3. Si persiste, contacte al administrador del sistema

## Contacto de soporte

Para problemas que no están en esta lista, contacte a su administrador del sistema con:
- Su nombre de usuario
- La acción que intentaba realizar
- El mensaje de error exacto que vio
```

- [ ] **Step 4: Verificar los tres archivos**
  - [ ] Búsqueda cubre rápida y avanzada con pasos numerados
  - [ ] Dashboard explica cada indicador
  - [ ] FAQ cubre los 6 problemas más comunes sin jerga técnica

- [ ] **Step 5: Commit**

```bash
git add docs/usuarios/05-busqueda.md docs/usuarios/06-dashboard.md docs/usuarios/07-faq-y-problemas-frecuentes.md
git commit -m "docs(usuarios): capítulos 5-7 — búsqueda, dashboard y FAQ"
```

---

## Task 9: docs/operaciones/INDEX.md + 01-despliegue-vps.md

**Fuentes a leer:**
- `docs/infra/DEPLOYMENT_GUIDE.md`
- `docs/infra/PLAN_DESPLIEGUE_PRODUCCION.md`
- `docker-compose-vps.yml`
- `nginx/` (configuración Nginx)

**Skill:** `documentation-generation-doc-generate`

- [ ] **Step 1: Invocar skill documentation-generation-doc-generate**

Usar `Skill` tool con `documentation-generation-doc-generate` indicando: generar guía de operaciones para administrador de sistema, VPS con 2GB RAM, Docker Compose, Nginx, MySQL 8, Spring Boot.

- [ ] **Step 2: Leer fuentes**

Leer los archivos de fuente listados arriba para extraer los comandos reales, puertos, rutas y configuraciones.

- [ ] **Step 3: Escribir docs/operaciones/INDEX.md**

```markdown
# Guía de Operaciones — SGED

Manual para administradores y DevOps del Sistema de Gestión de Expedientes Digitales.

## Secciones

1. [Despliegue en VPS](./01-despliegue-vps.md)
2. [Configuración y variables de entorno](./02-configuracion.md)
3. [Monitoreo y salud del sistema](./03-monitoreo.md)
4. [Respaldos y restauración](./04-respaldos.md)
5. [Rollback y recuperación de incidentes](./05-rollback.md)

## Infraestructura objetivo

| Componente | Detalle |
|------------|---------|
| Servidor | VPS Lite — 2GB RAM, Ubuntu 22.04 |
| Orquestación | Docker Compose |
| Proxy inverso | Nginx (SSL termination) |
| Backend | Spring Boot 3.5 en contenedor |
| Base de datos | MySQL 8 en contenedor |
| Storage | Volumen Docker persistente |

## Acceso rápido

- Health check: `GET https://{host}/api/health`
- Logs backend: `docker compose logs -f backend`
- Logs DB: `docker compose logs -f db`
```

- [ ] **Step 4: Escribir docs/operaciones/01-despliegue-vps.md**

Estructura obligatoria del documento (completar con los valores reales leídos de las fuentes):

```markdown
# 1. Despliegue en VPS

## Prerequisitos

- Docker 24+ y Docker Compose v2 instalados
- Puertos 80 y 443 abiertos en el firewall
- Dominio apuntando a la IP del VPS (para SSL)
- Variables de entorno configuradas (ver [Configuración](./02-configuracion.md))

## Primer despliegue

### 1. Clonar el repositorio

```bash
git clone <repo-url> /opt/sged
cd /opt/sged
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env  # Editar con valores reales
```

### 3. Iniciar el sistema

```bash
docker compose -f docker-compose-vps.yml up -d
```

### 4. Verificar que los servicios estén activos

```bash
docker compose -f docker-compose-vps.yml ps
```

Esperado: todos los servicios en estado `Up`.

### 5. Verificar health check

```bash
curl https://{host}/api/health
```

Esperado: `{"status":"UP"}`

## Actualización (nueva versión)

```bash
cd /opt/sged
git pull origin main
docker compose -f docker-compose-vps.yml pull
docker compose -f docker-compose-vps.yml up -d --no-deps backend
```

> **Importante:** Las migraciones Flyway se ejecutan automáticamente al iniciar el backend.

## Servicios y puertos

[Completar con los puertos del docker-compose-vps.yml leído]

## Comandos de gestión

```bash
# Ver estado
docker compose -f docker-compose-vps.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose-vps.yml logs -f

# Reiniciar un servicio
docker compose -f docker-compose-vps.yml restart backend

# Detener todo
docker compose -f docker-compose-vps.yml down
```
```

- [ ] **Step 5: Verificar checklist**
  - [ ] Pasos de primer despliegue completos y en orden
  - [ ] Comandos de actualización documentados
  - [ ] Comandos de gestión básica incluidos
  - [ ] Los puertos y servicios corresponden al docker-compose-vps.yml real

- [ ] **Step 6: Commit**

```bash
git add docs/operaciones/INDEX.md docs/operaciones/01-despliegue-vps.md
git commit -m "docs(operaciones): INDEX y guía de despliegue VPS"
```

---

## Task 10: docs/operaciones/02-configuracion.md + 03-monitoreo.md

**Fuentes:**
- `docs/infra/GUIA_SECRETS_INYECCION.md`
- `docs/infra/ENTORNO.md`
- `docs/infra/MONITOREO_OPERACIONES_PRODUCCION.md`
- `sGED-backend/src/main/resources/application.yml`

- [ ] **Step 1: Leer las fuentes listadas**

- [ ] **Step 2: Escribir docs/operaciones/02-configuracion.md**

Estructura obligatoria:

```markdown
# 2. Configuración y Variables de Entorno

## Variables obligatorias

[Completar con variables reales de ENTORNO.md y application.yml]

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DB_HOST | Host de MySQL | localhost |
| DB_PORT | Puerto MySQL | 3306 |
| DB_NAME | Nombre de la base de datos | sged_db |
| DB_USER | Usuario MySQL | sged_user |
| DB_PASSWORD | Contraseña MySQL | (secreto) |
| JWT_SECRET | Clave secreta para firmar tokens | (mínimo 32 chars) |
| JWT_EXPIRATION | Duración del token en ms | 28800000 (8h) |
| STORAGE_PATH | Ruta de almacenamiento de documentos | /data/documents |
| CONVERSION_ENABLED | Habilitar conversión Word→PDF | true |

## Gestión de secrets

[Completar con el procedimiento de GUIA_SECRETS_INYECCION.md]

## Perfiles Spring

| Perfil | Uso | Base de datos |
|--------|-----|---------------|
| dev | Desarrollo local | H2 o Oracle local |
| prod | VPS producción | MySQL 8 |

Para activar el perfil de producción:
```bash
SPRING_PROFILES_ACTIVE=prod
```
```

- [ ] **Step 3: Escribir docs/operaciones/03-monitoreo.md**

Estructura obligatoria:

```markdown
# 3. Monitoreo y Salud del Sistema

## Health check

```bash
curl https://{host}/api/health
```
Respuesta esperada: `{"status":"UP","db":"UP"}`

## Ver logs

```bash
# Logs del backend (últimas 100 líneas)
docker compose -f docker-compose-vps.yml logs --tail=100 backend

# Logs en tiempo real
docker compose -f docker-compose-vps.yml logs -f backend

# Logs de MySQL
docker compose -f docker-compose-vps.yml logs -f db
```

## Uso de recursos

```bash
# Uso de CPU y memoria por contenedor
docker stats

# Espacio en disco
df -h /opt/sged
```

## Alertas comunes

[Completar con las alertas de MONITOREO_OPERACIONES_PRODUCCION.md]

| Síntoma | Causa probable | Acción |
|---------|---------------|--------|
| Backend no responde | OOM (2GB RAM) | Reiniciar: `docker compose restart backend` |
| DB connection refused | MySQL caído | `docker compose restart db` |
| Disco al 90%+ | Documentos acumulados | Revisar storage, archivar documentos antiguos |
```

- [ ] **Step 4: Verificar checklist**
  - [ ] Todas las variables del application.yml real están listadas
  - [ ] Comandos de logs son correctos para docker-compose-vps.yml
  - [ ] Tabla de alertas cubre los escenarios del VPS Lite (2GB RAM)

- [ ] **Step 5: Commit**

```bash
git add docs/operaciones/02-configuracion.md docs/operaciones/03-monitoreo.md
git commit -m "docs(operaciones): configuración de entorno y guía de monitoreo"
```

---

## Task 11: docs/operaciones/04-respaldos.md + 05-rollback.md

**Fuentes:**
- `docs/infra/ROLLBACK_PLAN_PRODUCCION.md`
- `docs/infra/RUNBOOK_OPERACIONES_PRODUCCION.md`
- `docker-compose-vps.yml` (nombres de volúmenes)

- [ ] **Step 1: Leer las fuentes listadas**

- [ ] **Step 2: Escribir docs/operaciones/04-respaldos.md**

```markdown
# 4. Respaldos y Restauración

## Backup de la base de datos

### Crear backup manual

```bash
docker exec sged-db mysqldump -u sged_user -p sged_db > backup-$(date +%Y%m%d-%H%M).sql
```

### Backup automatizado (cron)

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2am
0 2 * * * docker exec sged-db mysqldump -u sged_user -p${DB_PASSWORD} sged_db > /opt/sged/backups/backup-$(date +\%Y\%m\%d).sql
```

### Restaurar backup

```bash
docker exec -i sged-db mysql -u sged_user -p sged_db < backup-YYYYMMDD.sql
```

## Backup de documentos

Los documentos se almacenan en el volumen Docker `sged-storage`.

### Crear backup del storage

```bash
docker run --rm \
  -v sged-storage:/data \
  -v /opt/sged/backups:/backup \
  alpine tar czf /backup/storage-$(date +%Y%m%d).tar.gz /data
```

### Restaurar storage

```bash
docker run --rm \
  -v sged-storage:/data \
  -v /opt/sged/backups:/backup \
  alpine tar xzf /backup/storage-YYYYMMDD.tar.gz -C /
```

## Retención recomendada

| Tipo | Frecuencia | Retener |
|------|-----------|---------|
| DB backup | Diario | 30 días |
| Storage backup | Semanal | 4 semanas |
```

- [ ] **Step 3: Escribir docs/operaciones/05-rollback.md**

Estructura basada en ROLLBACK_PLAN_PRODUCCION.md y RUNBOOK_OPERACIONES_PRODUCCION.md (leer y adaptar):

```markdown
# 5. Rollback y Recuperación de Incidentes

## Rollback de versión del backend

Si una nueva versión causa problemas:

```bash
# 1. Identificar la imagen anterior
docker images sged-backend

# 2. Hacer rollback a la imagen anterior
docker compose -f docker-compose-vps.yml stop backend
docker tag sged-backend:<version-anterior> sged-backend:current
docker compose -f docker-compose-vps.yml up -d backend

# 3. Verificar
curl https://{host}/api/health
```

## Rollback de migración de base de datos

[Completar con el procedimiento de ROLLBACK_PLAN_PRODUCCION.md]

> [!WARNING]
> Las migraciones Flyway no se revierten automáticamente. Se requiere script SQL manual de reversión para cada migración.

## Runbook de incidentes

### Backend no inicia

```bash
# Ver logs de error
docker compose -f docker-compose-vps.yml logs backend | grep ERROR

# Causas comunes:
# 1. DB no disponible → esperar y reintentar
# 2. Variable de entorno faltante → verificar .env
# 3. Puerto ocupado → verificar con: ss -tlnp | grep 8080
```

### Base de datos corrupta

[Completar con procedimiento de RUNBOOK_OPERACIONES_PRODUCCION.md]

## Escalado de incidentes

[Completar con información de contacto del equipo de soporte]
```

- [ ] **Step 4: Verificar checklist**
  - [ ] Comandos de backup son ejecutables (no pseudocódigo)
  - [ ] Procedimiento de rollback cubre el caso del backend
  - [ ] Runbook cubre los 2 incidentes más comunes

- [ ] **Step 5: Commit**

```bash
git add docs/operaciones/04-respaldos.md docs/operaciones/05-rollback.md
git commit -m "docs(operaciones): guías de respaldos y rollback/runbook"
```

---

## Task 12: docs/desarrollo/INDEX.md + 01-arquitectura-general.md

**Fuentes a leer:**
- `docs/general/STACK_TECNICO_ACTUALIZADO.md`
- `docs/general/plan_detallado.md`
- `sGED-backend/pom.xml`
- `sGED-frontend/package.json`

**Skill:** `docs-architect`

- [ ] **Step 1: Invocar skill docs-architect**

Usar `Skill` tool con `docs-architect` indicando: documentación técnica de largo aliento para desarrolladores, arquitectura hexagonal, Spring Boot 3.5 + Angular 21 + MySQL.

- [ ] **Step 2: Escribir docs/desarrollo/INDEX.md**

```markdown
# Manual Técnico — SGED

Documentación para desarrolladores del Sistema de Gestión de Expedientes Digitales.

## Secciones

1. [Arquitectura general](./01-arquitectura-general.md)
2. [Backend — Spring Boot](./02-backend.md)
3. [Frontend — Angular](./03-frontend.md)
4. [Base de datos](./04-base-de-datos.md)
5. [Seguridad](./05-seguridad.md)
6. [Guía de contribución](./06-guia-de-contribucion.md)

## Stack resumido

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | Angular + PrimeNG | 21 |
| Backend | Spring Boot + Java | 3.5 / 21 LTS |
| Base de datos (prod) | MySQL | 8 |
| Base de datos (dev) | Oracle | 21c |
| ORM | JPA/Hibernate | — |
| Migraciones | Flyway | — |
| Auth | JWT (JJWT) | 0.11.5 |
| Mapping | MapStruct | 1.6.0 |
| Contenedores | Docker Compose | v2 |

**API Reference:** [docs/api/openapi.yaml](../api/openapi.yaml)
```

- [ ] **Step 3: Escribir docs/desarrollo/01-arquitectura-general.md**

```markdown
# 1. Arquitectura General

## Visión de alto nivel

El SGED sigue una arquitectura de tres capas separadas por responsabilidad:

```
[Angular Frontend] ←HTTP/JSON→ [Spring Boot API] ←JPA→ [MySQL/Oracle DB]
                                       ↑
                               [Flyway Migrations]
                                       ↑
                               [Docker Compose (VPS)]
```

## Capas del backend (Arquitectura hexagonal)

```
com.oj.sged/
├── api/          ← Capa de entrada: Controllers, DTOs, Exception handlers
├── application/  ← Lógica de negocio: Services, Mappers
├── infrastructure/ ← Persistencia: JPA Entities, Repositories, Config
└── shared/       ← Transversal: Excepciones custom, Utilidades
```

**Por qué esta estructura:** Separa las responsabilidades de forma que cambiar la DB, el framework HTTP o la lógica de negocio son cambios aislados. Un Controller nunca accede a un Repository directamente — siempre pasa por un Service.

## Flujo de una petición típica

```
HTTP Request
    → SecurityConfig (verifica JWT)
    → Controller (valida DTO, llama Service)
    → Service (lógica de negocio, llama Repository)
    → Repository (JPA query a DB)
    → Mapper (Entity → DTO de respuesta)
    → Controller (retorna ApiResponse<DTO>)
HTTP Response
```

## Stack completo con versiones

[Completar con versiones exactas de STACK_TECNICO_ACTUALIZADO.md]

## Decisiones de diseño clave

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| JWT con blacklist (revoked_token) | JWT sin revocación | Permite logout real y seguro |
| Flyway para migraciones | Hibernate auto-ddl | Control exacto del schema en producción |
| MapStruct para mapeo | Manual / ModelMapper | Performance en compilación, sin reflection |
| MySQL en VPS | PostgreSQL | Menor consumo de RAM en VPS Lite (2GB) |
| Docker Compose | Kubernetes | Complejidad innecesaria para un servidor |

## Entornos

| Entorno | Backend DB | Frontend | Compose file |
|---------|-----------|---------|--------------|
| Local dev | Oracle 21c | `ng serve` | `docker-compose.yml` |
| QA | Oracle 21c | Build prod | `docker-compose-qa.yml` |
| Producción VPS | MySQL 8 | Build prod | `docker-compose-vps.yml` |
```

- [ ] **Step 4: Verificar checklist**
  - [ ] Diagrama de arquitectura presente
  - [ ] Flujo request→response documentado
  - [ ] Tabla de decisiones de diseño con razones
  - [ ] Tabla de entornos correcta

- [ ] **Step 5: Commit**

```bash
git add docs/desarrollo/INDEX.md docs/desarrollo/01-arquitectura-general.md
git commit -m "docs(desarrollo): INDEX y arquitectura general"
```

---

## Task 13: docs/desarrollo/02-backend.md + 03-frontend.md

**Fuentes:**
- `sGED-backend/src/main/java/com/oj/sged/` (estructura de paquetes)
- `sGED-frontend/src/app/` (estructura de módulos)
- `docs/general/Back end.md`
- `docs/general/front end.md`

- [ ] **Step 1: Escribir docs/desarrollo/02-backend.md**

```markdown
# 2. Backend — Spring Boot

## Estructura de paquetes

```
com.oj.sged/
├── api/
│   ├── controller/     # 7 @RestControllers — entrada HTTP
│   ├── dto/
│   │   ├── request/    # 7 DTOs de entrada (validados con Bean Validation)
│   │   └── response/   # 13 DTOs de salida
│   └── exception/      # GlobalExceptionHandler (@RestControllerAdvice)
├── application/
│   ├── service/        # 10 servicios de negocio (@Service)
│   └── mapper/         # MapStruct mappers (Entity ↔ DTO)
├── infrastructure/
│   ├── persistence/
│   │   ├── auth/       # Entities y repos de autenticación
│   │   ├── documento/  # Entities y repos de documentos
│   │   └── expediente/ # Entities y repos de expedientes
│   └── config/         # SecurityConfig, StorageConfig
└── shared/
    ├── exception/      # Excepciones custom de negocio
    └── util/           # Utilidades comunes
```

## Convenciones de nombrado

| Componente | Patrón | Ejemplo |
|------------|--------|---------|
| Controller | `{Entidad}Controller` | `ExpedienteController` |
| Service | `{Entidad}Service` | `ExpedienteService` |
| Repository | `{Entidad}Repository` | `ExpedienteRepository` |
| Entity JPA | nombre en singular, snake_case en DB | `Expediente` → tabla `expediente` |
| DTO Request | `{Accion}{Entidad}Request` | `CrearExpedienteRequest` |
| DTO Response | `{Entidad}Response` | `ExpedienteResponse` |

## Flujo de un request típico: crear expediente

```java
// 1. Controller recibe y valida
@PostMapping
public ResponseEntity<ApiResponse<ExpedienteResponse>> crear(
    @Valid @RequestBody ExpedienteRequest request) {
    
// 2. Service aplica lógica de negocio
ExpedienteResponse response = expedienteService.crear(request);

// 3. Service usa Mapper para Entity→DTO
// 4. Controller retorna ApiResponse genérico
return ResponseEntity.status(201).body(ApiResponse.success(response));
```

## Manejo de excepciones

Todas las excepciones son capturadas por `GlobalExceptionHandler` en `api/exception/`. Nunca lanzar excepciones sin capturar — siempre usar las excepciones custom de `shared/exception/`.

## MapStruct — mapeo Entity ↔ DTO

Los mappers se generan en compilación. No usar ModelMapper ni mapeo manual en servicios.

```java
@Mapper(componentModel = "spring")
public interface ExpedienteMapper {
    ExpedienteResponse toResponse(Expediente entity);
    Expediente toEntity(ExpedienteRequest request);
}
```

## Servicios principales

| Servicio | Responsabilidad |
|----------|----------------|
| `AuthService` | Login, logout, JWT emisión/validación |
| `ExpedienteService` | CRUD expedientes, estadísticas |
| `DocumentoService` | Upload, descarga, soft delete |
| `DocumentoStorageService` | Lectura/escritura en filesystem |
| `BusquedaExpedientesService` | Búsqueda rápida y avanzada |
| `AuditoriaService` | Registro inmutable de acciones |
```

- [ ] **Step 2: Escribir docs/desarrollo/03-frontend.md**

```markdown
# 3. Frontend — Angular

## Estructura de módulos

```
src/app/
├── core/           # Servicios singleton — NO lazy-loaded
│   ├── guards/     # AuthGuard, RoleGuard
│   ├── interceptors/ # JwtInterceptor, ErrorInterceptor
│   ├── models/     # Interfaces TypeScript
│   └── services/   # 8 servicios HTTP
└── features/       # Módulos lazy-loaded por ruta
    ├── auth/        # Login, cambiar-password
    ├── admin/       # Usuarios, auditoría (solo ADMIN)
    ├── expedientes/ # CRUD expedientes
    ├── documentos/  # Upload, visor, descarga
    ├── busqueda/    # Búsqueda rápida y avanzada
    └── dashboard/   # KPIs y estadísticas
```

## Lazy loading

Cada módulo en `features/` se carga solo cuando el usuario navega a esa ruta. Esto reduce el tamaño del bundle inicial.

```typescript
// app-routing.module.ts
{
  path: 'expedientes',
  loadChildren: () => import('./features/expedientes/expedientes.module')
    .then(m => m.ExpedientesModule),
  canActivate: [AuthGuard]
}
```

## Servicios core

| Servicio | Responsabilidad |
|----------|----------------|
| `AuthService` | Login, logout, almacenamiento de JWT en localStorage |
| `ExpedientesService` | CRUD expedientes vía HTTP |
| `DocumentosService` | Upload multipart, stream, descarga |
| `BusquedaExpedientesService` | Búsqueda rápida/avanzada |
| `AdminUsuariosService` | Gestión de usuarios (solo ADMIN) |
| `AuditoriaService` | Consulta de registros de auditoría |
| `CatalogosService` | Carga de catálogos (tipos, estados, juzgados) |

## Interceptors HTTP

- **JwtInterceptor:** agrega `Authorization: Bearer <token>` a todas las peticiones
- **ErrorInterceptor:** captura errores 401 (redirige a login) y 500 (muestra toast de error)

## Convenciones PrimeNG

- Siempre usar componentes PrimeNG (`p-table`, `p-dialog`, `p-button`) en lugar de HTML nativo
- Estilos en el `styles.scss` global — no estilos inline
- Tema oscuro configurado globalmente — no cambiar por componente

## Guards de ruta

- `AuthGuard`: requiere sesión activa. Redirige a `/login` si no hay token.
- `RoleGuard`: requiere rol específico. Redirige a `/403` si el rol no tiene acceso.
```

- [ ] **Step 3: Verificar checklist**
  - [ ] Estructura de paquetes backend es correcta (verificar con ls de los directorios reales)
  - [ ] Tabla de servicios coincide con los archivos reales en `core/services/`
  - [ ] Convenciones PrimeNG documentadas

- [ ] **Step 4: Commit**

```bash
git add docs/desarrollo/02-backend.md docs/desarrollo/03-frontend.md
git commit -m "docs(desarrollo): documentación backend Spring Boot y frontend Angular"
```

---

## Task 14: docs/desarrollo/04-base-de-datos.md + 05-seguridad.md

**Fuentes:**
- `sGED-backend/src/main/resources/db/migration/` (todos los archivos V*.sql)
- `docs/general/SEGURIDAD_AUTH_IMPLEMENTATION.md`

- [ ] **Step 1: Leer todos los archivos de migración SQL para documentar el schema real**

- [ ] **Step 2: Escribir docs/desarrollo/04-base-de-datos.md**

```markdown
# 4. Base de Datos

## Diagrama de entidades (ER simplificado)

```
cat_rol ←── usuario ──→ cat_juzgado
                │
                ├──→ auth_attempt
                ├──→ revoked_token
                └──→ auditoria ──→ expediente

expediente ──→ cat_tipo_proceso
expediente ──→ cat_estado
expediente ──→ cat_juzgado
expediente ←── documento ──→ cat_tipo_documento
```

## Tablas principales

[Completar con los campos reales leídos de las migraciones SQL]

| Tabla | Propósito | Campos clave |
|-------|-----------|--------------|
| `usuario` | Usuarios del sistema | id, username, password_hash, rol_id, juzgado_id, bloqueado |
| `expediente` | Expedientes judiciales | id, numero (UK), tipo_proceso_id, juzgado_id, estado_id |
| `documento` | Documentos por expediente | id, expediente_id, nombre, ruta, mime_type, eliminado (soft delete) |
| `auditoria` | Log inmutable de acciones | id, usuario_id, accion, expediente_id, ip, created_at |
| `auth_attempt` | Intentos fallidos de login | id, username, ip, created_at |
| `revoked_token` | Blacklist de JWT | id, jti (UK), expiracion |

## Catálogos

| Tabla | Datos |
|-------|-------|
| `cat_rol` | ADMIN, SECRETARIO, AUXILIAR, CONSULTA |
| `cat_tipo_proceso` | [Completar con valores del seed SQL] |
| `cat_estado` | [Completar con valores del seed SQL] |
| `cat_juzgado` | [Completar con valores del seed SQL] |

## Estrategia de migraciones Flyway

- Archivos en `sGED-backend/src/main/resources/db/migration/`
- Nombrado: `V{numero}__{descripcion}.sql` (doble guión bajo)
- **Regla:** nunca modificar un archivo de migración ya aplicado en producción — crear uno nuevo
- Las migraciones se ejecutan automáticamente al iniciar el backend

## Índices de rendimiento

[Completar con los índices definidos en las migraciones SQL]

Los índices están definidos en las migraciones para optimizar las consultas más frecuentes: búsqueda por número de expediente, filtros por estado/juzgado, y búsqueda por fecha.
```

- [ ] **Step 3: Escribir docs/desarrollo/05-seguridad.md**

```markdown
# 5. Seguridad

## Flujo de autenticación JWT

```
1. POST /api/v1/auth/login
   → Spring Security verifica credenciales en tabla `usuario`
   → Si correctas: emite JWT con claims (sub=username, rol, juzgado, jti=UUID)
   → Si incorrectas: registra intento en `auth_attempt`
   → Si 5 intentos fallidos: bloquea cuenta (usuario.bloqueado = true)

2. Request con JWT
   → JwtAuthenticationFilter extrae token del header Authorization
   → Verifica firma y expiración
   → Verifica que jti NO esté en tabla `revoked_token`
   → Carga UserDetails y establece SecurityContext

3. POST /api/v1/auth/logout
   → Extrae jti del token actual
   → Inserta en tabla `revoked_token` con fecha de expiración
   → El token queda invalidado para futuros requests
```

## Control de acceso (RBAC)

Los endpoints usan `@PreAuthorize` con SpEL:

```java
@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIO')")
public ResponseEntity<?> crearExpediente(...) { ... }
```

| Rol | Nivel de acceso |
|-----|----------------|
| ADMIN | Acceso total a todos los endpoints |
| SECRETARIO | CRUD expedientes y documentos, sin admin de usuarios |
| AUXILIAR | Crear expedientes, subir documentos, sin editar ni eliminar |
| CONSULTA | Solo GET en expedientes, documentos, búsqueda |

## Auditoría inmutable

Cada acción relevante se registra en la tabla `auditoria`:
- No hay UPDATE ni DELETE en esta tabla — solo INSERT
- Campos: usuario, acción (enum), expediente afectado, IP origen, timestamp
- Solo el rol ADMIN puede consultar el historial de auditoría

## Políticas de contraseñas

[Completar con la política real de SEGURIDAD_AUTH_IMPLEMENTATION.md]

## Configuración de Spring Security

Ver `infrastructure/config/SecurityConfig.java`:
- CSRF deshabilitado (API REST stateless)
- CORS configurado para el frontend Angular
- Rutas públicas: `/api/v1/auth/login`, `/api/health`
- Todo lo demás requiere autenticación
```

- [ ] **Step 4: Verificar checklist**
  - [ ] Flujo JWT completo (emisión → validación → revocación) documentado
  - [ ] Tabla de roles con permisos específicos
  - [ ] Política de lockout (5 intentos) documentada

- [ ] **Step 5: Commit**

```bash
git add docs/desarrollo/04-base-de-datos.md docs/desarrollo/05-seguridad.md
git commit -m "docs(desarrollo): documentación de base de datos y seguridad JWT/RBAC"
```

---

## Task 15: docs/desarrollo/06-guia-de-contribucion.md

**Fuentes:**
- `CLAUDE.md` (comandos de build)
- `sGED-backend/pom.xml` (dependencias y plugins)
- `sGED-frontend/package.json` (scripts npm)
- `docker-compose.yml` (entorno local)

- [ ] **Step 1: Leer fuentes listadas para extraer comandos reales**

- [ ] **Step 2: Escribir docs/desarrollo/06-guia-de-contribucion.md**

```markdown
# 6. Guía de Contribución

## Prerequisitos

| Herramienta | Versión mínima | Verificar con |
|-------------|---------------|---------------|
| Java JDK | 21 LTS | `java --version` |
| Maven | 3.9+ | `mvn --version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Docker Desktop | 24+ | `docker --version` |
| Git | 2.40+ | `git --version` |

## Setup local (< 30 minutos)

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd sged
```

### 2. Iniciar la base de datos local

```bash
docker compose up -d db
```

Esperar 30 segundos a que MySQL/Oracle esté listo.

### 3. Iniciar el backend

```bash
cd sGED-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

El backend inicia en `http://localhost:8080`. Las migraciones Flyway se ejecutan automáticamente.

### 4. Iniciar el frontend

```bash
cd sGED-frontend
npm install
npx ng serve
```

El frontend inicia en `http://localhost:4200`.

### 5. Verificar que funciona

Abrir `http://localhost:4200` e iniciar sesión con las credenciales del seed de base de datos.

## Comandos de build para producción

```bash
# Frontend
cd sGED-frontend
npx ng build --configuration=production

# Backend
cd sGED-backend
mvn clean package -DskipTests
```

## Ejecutar tests

```bash
# Backend
cd sGED-backend
mvn test

# Frontend
cd sGED-frontend
npx ng test --watch=false
```

## Convenciones de commits

Usar formato Conventional Commits:

```
<tipo>(<scope>): <descripción en español>

tipos: feat, fix, docs, refactor, test, chore
scopes: backend, frontend, db, infra, auth, expedientes, documentos
```

Ejemplos:
- `feat(expedientes): agregar filtro por fecha en búsqueda avanzada`
- `fix(auth): corregir validación de token expirado`
- `docs(api): actualizar spec OpenAPI con nuevo endpoint`

## Flujo de trabajo

1. Crear rama desde `main`: `git checkout -b feat/nombre-feature`
2. Desarrollar con commits frecuentes
3. Build y tests pasan: `mvn test && ng test`
4. Pull Request a `main` con descripción del cambio
5. Code review aprobado → merge

## Reglas de código

- CERO `console.log` en TypeScript y `System.out.println` en Java
- Sin código comentado — si no se usa, se elimina
- DTOs siempre validados con Bean Validation (`@NotNull`, `@Size`, etc.)
- Nuevos endpoints siempre con `@PreAuthorize` — nunca sin control de acceso
```

- [ ] **Step 3: Verificar checklist**
  - [ ] Los comandos de build son exactamente los del CLAUDE.md
  - [ ] Setup local completo sin pasos faltantes
  - [ ] Convenciones de commits definidas
  - [ ] Sin placeholders — todos los comandos son ejecutables

- [ ] **Step 4: Commit**

```bash
git add docs/desarrollo/06-guia-de-contribucion.md
git commit -m "docs(desarrollo): guía de contribución y setup local"
```

---

## Task 16: docs/INDEX.md — Portal Maestro

- [ ] **Step 1: Escribir docs/INDEX.md**

```markdown
# SGED — Portal de Documentación

**Sistema de Gestión de Expedientes Digitales**  
Versión: 1.2.4 | Actualizado: 2026-05-03

---

## Acceso rápido por rol

| Soy... | Ir a... |
|--------|---------|
| Funcionario judicial (usuario del sistema) | [Manual de Usuario](./usuarios/INDEX.md) |
| Desarrollador (nuevo en el proyecto) | [Manual Técnico](./desarrollo/INDEX.md) |
| Integrador (consumo de la API) | [Referencia API](./api/INDEX.md) |
| Administrador de sistema / DevOps | [Guía de Operaciones](./operaciones/INDEX.md) |

---

## El sistema

El SGED es una plataforma web para la gestión digital de expedientes judiciales y sus documentos asociados. Permite a los funcionarios de los juzgados crear, buscar, visualizar y gestionar expedientes y documentos desde cualquier navegador, con control de acceso por roles y auditoría completa de todas las acciones.

**Stack:** Angular 21 + Spring Boot 3.5 + MySQL 8 + Docker Compose

---

## Documentación por sección

### Para usuarios
- [Manual de Usuario](./usuarios/INDEX.md) — guía paso a paso para los 4 roles: ADMIN, SECRETARIO, AUXILIAR, CONSULTA

### Para desarrolladores
- [Manual Técnico](./desarrollo/INDEX.md) — arquitectura, backend, frontend, base de datos, seguridad, contribución
- [Referencia API REST](./api/INDEX.md) — autenticación, endpoints, ejemplos curl
- [Spec OpenAPI 3.1](./api/openapi.yaml) — definición formal de todos los endpoints

### Para operaciones
- [Guía de Operaciones](./operaciones/INDEX.md) — despliegue VPS, configuración, monitoreo, respaldos, rollback

---

## Estado del portal

| Sección | Estado |
|---------|--------|
| Manual de Usuario | Completo |
| Manual Técnico | Completo |
| Referencia API | Completo |
| Guía de Operaciones | Completo |
```

- [ ] **Step 2: Verificar todos los links**

```bash
# Verificar que todos los archivos del portal existen
ls docs/usuarios/
ls docs/desarrollo/
ls docs/api/
ls docs/operaciones/
```

Esperado: ver todos los archivos definidos en el spec.

- [ ] **Step 3: Commit**

```bash
git add docs/INDEX.md
git commit -m "docs: portal maestro INDEX.md — punto de entrada unificado"
```

---

## Task 17: Migración — agregar redirects a documentos antiguos

- [ ] **Step 1: Agregar nota de redirección a MANUAL_DE_USUARIO_FINAL.md**

Al inicio del archivo existente `docs/general/MANUAL_DE_USUARIO_FINAL.md`, agregar:

```markdown
> **Este documento ha sido supersedido.** El manual actualizado está en [docs/usuarios/](../usuarios/INDEX.md).
```

- [ ] **Step 2: Agregar nota a INDICE_MAESTRO_DOCUMENTACION.md**

Al inicio del archivo existente `docs/INDICE_MAESTRO_DOCUMENTACION.md`, agregar:

```markdown
> **Este índice ha sido supersedido.** El nuevo portal de documentación está en [docs/INDEX.md](./INDEX.md).
```

- [ ] **Step 3: Commit final**

```bash
git add docs/general/MANUAL_DE_USUARIO_FINAL.md docs/INDICE_MAESTRO_DOCUMENTACION.md
git commit -m "docs: agregar redirects de documentos legacy al nuevo portal"
```

---

## Verificación final del portal

Después del Task 17, verificar los criterios de éxito del spec:

- [ ] `docs/INDEX.md` existe y linkea a las 4 secciones
- [ ] Cada sección tiene su `INDEX.md` navegable
- [ ] `docs/api/openapi.yaml` es YAML válido (`python -c "import yaml; yaml.safe_load(open('docs/api/openapi.yaml'))"`)
- [ ] El manual de usuario (`docs/usuarios/`) no contiene términos técnicos (JWT, API, backend, endpoint)
- [ ] La guía de contribución permite setup local completo (todos los comandos son reales y ejecutables)
- [ ] Los archivos de operaciones cubren: deploy → monitor → backup → rollback

```bash
# Contar archivos creados
find docs/usuarios docs/desarrollo docs/api docs/operaciones docs/INDEX.md -name "*.md" -o -name "*.yaml" | wc -l
```
Esperado: 24 archivos.
```
