---
Documento: BASE_DE_DATOS
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# 04 — Base de Datos

## 1. Estrategia Dual-DB

El sistema SGED usa una estrategia de **Dual-DB**:

- **Entorno táctico actual (VPS / Desarrollo):** MySQL 8 Dockerizado.
- **Objetivo corporativo final:** Oracle 21c.

Para garantizar migración zero-friction, toda la capa de acceso a datos cumple estas reglas:
- Prohibido `@Query(nativeQuery=true)` con SQL específico de MySQL.
- Todo acceso vía JPA/HQL estándar o Spring Data derived queries.
- Flyway usa ANSI SQL estándar (sin funciones propietarias).

---

## 2. Diagrama Entidad-Relación (13 tablas)

```
cat_rol                    cat_juzgado
┌─────────────┐            ┌─────────────────┐
│ id (PK)     │            │ id (PK)         │
│ nombre      │            │ codigo (UK)     │
│ descripcion │            │ nombre          │
│ activo      │            │ activo          │
└──────┬──────┘            └────────┬────────┘
       │ 1                          │ 1
       │                            │
       │ N                          │ N
┌──────▼──────────────────────────▼──────────────────┐
│                    usuario                          │
│ id (PK)  username (UK)  password  nombre_completo  │
│ email  rol_id (FK→cat_rol)  juzgado_id (FK→cat_juzgado) │
│ activo  bloqueado  intentos_fallidos  fecha_bloqueo │
│ debe_cambiar_pass  fecha_creacion  fecha_modificacion│
└──────────────────────────────────────────────────────┘

auth_attempt                     revoked_token
┌─────────────────────┐          ┌──────────────────────┐
│ id (PK)             │          │ id (PK)              │
│ username (FK→usuario)│         │ token_jti (UK)       │
│ intento_exitoso     │          │ fecha_revocacion     │
│ ip                  │          │ fecha_expiracion     │
│ fecha_intento       │          └──────────────────────┘
└─────────────────────┘

auditoria
┌─────────────────────────────────────────┐
│ id (PK)  fecha  usuario  ip             │
│ accion  modulo  recurso_id              │
│ valor_anterior (CLOB)  valor_nuevo (CLOB)│
│ detalle                                 │
└─────────────────────────────────────────┘

cat_tipo_proceso       cat_estado          cat_tipo_documento
┌─────────────┐       ┌──────────────┐    ┌─────────────────┐
│ id (PK)     │       │ id (PK)      │    │ id (PK)         │
│ nombre (UK) │       │ nombre (UK)  │    │ nombre (UK)     │
│ descripcion │       │ descripcion  │    │ descripcion     │
│ activo      │       │ activo       │    └────────┬────────┘
└──────┬──────┘       └──────┬───────┘             │ 1
       │ 1                   │ 1                   │
       │                     │                     │ N
       │ N                   │ N         ┌──────────▼──────────────────┐
       │                     │           │         documento           │
┌──────▼─────────────────────▼───┐       │ id (PK)                    │
│          expediente             │ 1    │ expediente_id (FK)         │
│ id (PK)  numero (UK)           │──────│ tipo_documento_id (FK)     │
│ tipo_proceso_id (FK)            │  N   │ nombre_original            │
│ juzgado_id (FK→cat_juzgado)    │       │ nombre_storage             │
│ estado_id (FK)                  │       │ ruta  tamanio  mime_type   │
│ fecha_inicio  descripcion       │       │ extension                  │
│ observaciones  referencia_sgt   │       │ usuario_creacion           │
│ referencia_fuente               │       │ fecha_creacion  eliminado  │
│ usuario_creacion  fecha_creacion│       │ usuario_eliminacion        │
│ usuario_modificacion            │       │ fecha_eliminacion          │
│ fecha_modificacion              │       └────────────────────────────┘
└─────────────────────────────────┘
```

### Relaciones Clave

| Tabla | Relación | Tabla Referenciada |
|-------|----------|-------------------|
| `usuario.rol_id` | N:1 | `cat_rol.id` |
| `usuario.juzgado_id` | N:1 | `cat_juzgado.id` |
| `auth_attempt.username` | N:1 | `usuario.username` |
| `expediente.tipo_proceso_id` | N:1 | `cat_tipo_proceso.id` |
| `expediente.juzgado_id` | N:1 | `cat_juzgado.id` |
| `expediente.estado_id` | N:1 | `cat_estado.id` |
| `documento.expediente_id` | N:1 | `expediente.id` |
| `documento.tipo_documento_id` | N:1 | `cat_tipo_documento.id` |

---

## 3. Tabla de Tablas con Propósito y Campos Clave

| Tabla | Propósito | Campos Clave |
|-------|-----------|-------------|
| `cat_rol` | Catálogo de roles del sistema (fijo, no editable por UI) | `id`, `nombre` (UNIQUE), `activo` |
| `usuario` | Usuarios del sistema con credenciales y estado de cuenta | `id`, `username` (UNIQUE), `password` (BCrypt), `rol_id`, `juzgado_id`, `bloqueado`, `intentos_fallidos` |
| `auth_attempt` | Log de intentos de autenticación (exitosos y fallidos) para análisis de brute-force | `username`, `intento_exitoso`, `ip`, `fecha_intento` |
| `revoked_token` | Blacklist de JTI de tokens revocados en logout | `token_jti` (UNIQUE), `fecha_expiracion` (para purga) |
| `auditoria` | Log inmutable de todas las acciones relevantes del sistema | `usuario`, `accion`, `modulo`, `recurso_id`, `valor_anterior`, `valor_nuevo` |
| `cat_juzgado` | Catálogo maestro de juzgados | `codigo` (UNIQUE, ej: `JUZ-CIV-01`), `nombre`, `activo` |
| `cat_tipo_proceso` | Catálogo de tipos de proceso judicial | `nombre` (UNIQUE), `activo` |
| `cat_estado` | Catálogo de estados de un expediente | `nombre` (UNIQUE), `activo` |
| `cat_tipo_documento` | Catálogo de tipos de documento adjunto | `nombre` (UNIQUE) |
| `expediente` | Registro principal del expediente judicial | `numero` (UNIQUE), `tipo_proceso_id`, `juzgado_id`, `estado_id`, `referencia_sgt`, `referencia_fuente` |
| `documento` | Metadatos de archivos adjuntos a un expediente | `expediente_id`, `nombre_original`, `nombre_storage`, `ruta`, `mime_type`, `eliminado` (soft-delete) |

---

## 4. Catálogos — Datos Iniciales (Seeds)

Los seeds se insertan en las migraciones Flyway correspondientes.

### cat_rol (V001)

| id | nombre | descripcion |
|----|--------|-------------|
| 1 | ADMINISTRADOR | Administrador del sistema |
| 2 | SECRETARIO | Secretario judicial |
| 3 | AUXILIAR | Auxiliar judicial |
| 4 | CONSULTA | Usuario de solo consulta |

### cat_tipo_proceso (V010)

| nombre | descripcion |
|--------|-------------|
| Civil | Procesos civiles |
| Penal | Procesos penales |
| Laboral | Procesos laborales |
| Familia | Procesos de familia |
| Administrativo | Procesos administrativos |

### cat_estado (V011)

| nombre | descripcion |
|--------|-------------|
| Activo | Expediente en trámite activo |
| En espera | Expediente en espera de resolución |
| Suspendido | Expediente suspendido temporalmente |
| Cerrado | Expediente cerrado/finalizado |
| Archivado | Expediente archivado |

### cat_tipo_documento (V008)

| nombre | descripcion |
|--------|-------------|
| Demanda | Documento inicial del proceso |
| Resolución | Resoluciones judiciales |
| Escrito | Escritos presentados por las partes |
| Prueba documental | Documentos de prueba |
| Prueba multimedia | Audio, video o imagen como evidencia |
| Otro | Otro tipo de documento |

### cat_juzgado (V016)

| codigo | nombre |
|--------|--------|
| JUZ-CIV-01 | Juzgado Primero Civil |
| JUZ-CIV-02 | Juzgado Segundo Civil |
| JUZ-PEN-01 | Juzgado Primero Penal |
| JUZ-PEN-02 | Juzgado Segundo Penal |
| JUZ-LAB-01 | Juzgado Primero Laboral |
| JUZ-FAM-01 | Juzgado Primero de Familia |

---

## 5. Estrategia Flyway

### Convención de Naming

Las migraciones siguen el patrón: `V{número}__{descripcion}.sql`

- **`V`**: prefijo de versión (versioned migration).
- **`{número}`**: número de versión con ceros a la izquierda para orden correcto (001, 002, …).
- **`__`**: doble guion bajo como separador obligatorio.
- **`{descripcion}`**: descripción en minúsculas con guiones bajos.

Ejemplo: `V012__create_expediente.sql`

### Inventario de Migraciones

| Archivo | Descripción |
|---------|-------------|
| `V001__create_cat_rol.sql` | Tabla de roles + seed de 4 roles |
| `V002__create_usuario.sql` | Tabla de usuarios con índices |
| `V003__create_auth_attempt.sql` | Tabla de intentos de autenticación |
| `V004__create_revoked_token.sql` | Tabla de tokens revocados (blacklist JWT) |
| `V005__create_auditoria.sql` | Tabla de auditoría inmutable |
| `V006__create_cat_juzgado.sql` | Catálogo de juzgados |
| `V007__alter_usuario_add_juzgado_fk.sql` | Agrega columna `juzgado_id` a `usuario` |
| `V008__create_cat_tipo_documento.sql` | Catálogo de tipos de documento + seed |
| `V010__create_cat_tipo_proceso.sql` | Catálogo de tipos de proceso + seed |
| `V011__create_cat_estado.sql` | Catálogo de estados de expediente + seed |
| `V012__create_expediente.sql` | Tabla principal de expedientes |
| `V013__create_documento.sql` | Tabla de documentos adjuntos |
| `V016__seed_cat_juzgado.sql` | Datos iniciales para juzgados |

**Nota:** Los números V009, V014, V015 fueron reservados o retirados en versiones anteriores. Flyway no requiere secuencia consecutiva.

### Regla de Oro: No Modificar Migraciones Aplicadas

Una vez que una migración ha sido ejecutada en cualquier entorno (dev, QA o producción), **está prohibido modificarla**. Flyway verifica el checksum SHA-256 de cada archivo y fallará el arranque si detecta modificaciones.

**Si necesitas corregir algo de una migración anterior:**
1. Crear una **nueva migración** con el siguiente número disponible.
2. El nombre debe describir claramente qué se corrige.

```sql
-- CORRECTO: Nueva migración para corregir algo existente
-- Archivo: V017__fix_expediente_add_index.sql
CREATE INDEX idx_expediente_referencia ON expediente (referencia_sgt);

-- INCORRECTO: Nunca modificar V012__create_expediente.sql ya existente
```

### Configuración Flyway en `application.yml`

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
  jpa:
    hibernate:
      ddl-auto: validate    # Flyway gestiona el schema; Hibernate solo valida
```

---

## 6. Índices de Rendimiento

Los índices se crean directamente en las migraciones SQL para garantizar consultas eficientes en producción.

### Tabla `usuario`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_usuario_username` | `username` | Búsqueda en login (consulta más frecuente) |
| `idx_usuario_rol` | `rol_id` | Filtros por rol en admin |
| `idx_usuario_activo` | `activo` | Filtro de usuarios activos |
| `idx_usuario_juzgado` | `juzgado_id` | Filtros por juzgado |

### Tabla `auth_attempt`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_auth_attempt_username` | `username, fecha_intento` | Conteo de intentos fallidos recientes por usuario |
| `idx_auth_attempt_fecha` | `fecha_intento` | Purga de registros antiguos |
| `idx_auth_attempt_ip` | `ip, fecha_intento` | Detección de ataques por IP |

### Tabla `revoked_token`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_revoked_token_jti` | `token_jti` | Validación de token en cada request (crítico para rendimiento) |
| `idx_revoked_token_exp` | `fecha_expiracion` | Purga automática de tokens expirados por el Scheduler |

### Tabla `auditoria`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_auditoria_fecha` | `fecha` | Filtro por rango de fechas |
| `idx_auditoria_usuario` | `usuario` | Historial de acciones por usuario |
| `idx_auditoria_accion` | `accion` | Filtro por tipo de acción |
| `idx_auditoria_modulo` | `modulo` | Filtro por módulo (EXPEDIENTE, DOCUMENTO, etc.) |
| `idx_auditoria_recurso` | `recurso_id` | Historial de un recurso específico |

### Tabla `expediente`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_expediente_numero` | `numero` | Búsqueda directa por número (UNIQUE ya indexado) |
| `idx_expediente_tipo` | `tipo_proceso_id` | Filtro por tipo de proceso |
| `idx_expediente_juzgado` | `juzgado_id` | Aislamiento de datos por juzgado (consulta muy frecuente) |
| `idx_expediente_estado` | `estado_id` | Filtro por estado en listados |
| `idx_expediente_fecha` | `fecha_inicio` | Filtro por rango de fechas de inicio |
| `idx_expediente_creacion` | `fecha_creacion` | Ordenamiento por fecha de creación |

### Tabla `documento`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_documento_expediente` | `expediente_id` | Listado de documentos por expediente (muy frecuente) |
| `idx_documento_tipo` | `tipo_documento_id` | Filtro por tipo de documento |
| `idx_documento_eliminado` | `eliminado` | Exclusión de soft-deletes en consultas normales |
| `idx_documento_creacion` | `fecha_creacion` | Ordenamiento cronológico |
| `idx_documento_extension` | `extension` | Filtro por tipo de archivo |

---

## 7. Soft-Delete en Documentos

La tabla `documento` implementa **soft-delete**: los archivos no se eliminan físicamente de la base de datos, sino que se marcan con `eliminado = 1`. Esto preserva la trazabilidad y permite recuperación si es necesario.

El campo `usuario_eliminacion` registra quién realizó la eliminación, y `fecha_eliminacion` cuándo ocurrió.

Las consultas normales siempre deben incluir `WHERE eliminado = 0` (o en JPA: `findByExpedienteIdAndEliminadoFalse()`).

El archivo físico en el sistema de ficheros puede eliminarse o no según la política operativa, pero la referencia en DB se conserva.

---

*Siguiente: [05-seguridad.md](./05-seguridad.md) — JWT, RBAC, lockout y configuración Spring Security.*
