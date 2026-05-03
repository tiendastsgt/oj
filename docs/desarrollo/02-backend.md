---
Documento: BACKEND
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# 02 — Backend

## 1. Estructura Completa de Paquetes

El paquete raíz es `com.oj.sged`. Toda la lógica del sistema reside dentro de él, organizada en 4 paquetes principales que implementan la arquitectura hexagonal.

```
com.oj.sged/
│
├── SgedApplication.java                  ← Punto de entrada Spring Boot (@SpringBootApplication)
│
├── api/                                  ← CAPA API: Entrada de datos externos al sistema
│   ├── HealthController.java             │  Endpoint /health de monitoreo básico
│   ├── controller/                       │  7 controladores REST
│   │   ├── AuthController.java           │  Login, logout, cambiar-password
│   │   ├── ExpedienteController.java     │  CRUD de expedientes con RBAC
│   │   ├── DocumentoController.java      │  Upload, descarga, eliminación de documentos
│   │   ├── BusquedaExpedientesController.java  │  Búsqueda avanzada con filtros
│   │   ├── CatalogosController.java      │  Catálogos (estados, tipos, juzgados)
│   │   ├── AuditoriaController.java      │  Consulta de registros de auditoría
│   │   └── AdminUsuariosController.java  │  CRUD de usuarios (solo ADMINISTRADOR)
│   ├── dto/
│   │   ├── request/                      │  DTOs validados con Bean Validation (@NotBlank, @Size, etc.)
│   │   │   ├── LoginRequest.java
│   │   │   ├── ExpedienteRequest.java
│   │   │   ├── BusquedaAvanzadaRequest.java
│   │   │   ├── CrearUsuarioRequest.java
│   │   │   ├── ActualizarUsuarioRequest.java
│   │   │   ├── ChangePasswordRequest.java
│   │   │   └── ResetPasswordRequest.java
│   │   └── response/                     │  DTOs de salida (NUNCA exponer entidades JPA)
│   │       ├── ApiResponse.java          │  Envoltorio genérico { success, message, data }
│   │       ├── ExpedienteResponse.java
│   │       ├── ExpedienteBusquedaResponse.java
│   │       ├── ExpedienteEstadisticasResponse.java
│   │       ├── DocumentoResponse.java
│   │       ├── LoginResponseData.java
│   │       ├── UsuarioAdminResponse.java
│   │       ├── AuditoriaResponse.java
│   │       ├── CatalogoEstadoResponse.java
│   │       ├── CatalogoJuzgadoResponse.java
│   │       ├── CatalogoTipoProcesoResponse.java
│   │       └── ValidationErrorResponse.java
│   └── exception/
│       └── GlobalExceptionHandler.java   │  @RestControllerAdvice — manejo centralizado de errores
│
├── application/                          ← CAPA APLICACIÓN: Casos de uso y lógica de negocio
│   ├── mapper/                           │  Conversores Entity↔DTO (MapStruct, tiempo de compilación)
│   │   ├── ExpedienteMapper.java
│   │   └── DocumentoMapper.java
│   └── service/                          │  10 servicios de negocio
│       ├── AuthService.java              │  Autenticación, lockout, generación JWT
│       ├── ExpedienteService.java        │  CRUD y estadísticas de expedientes con aislamiento por juzgado
│       ├── DocumentoService.java         │  Gestión de documentos (metadatos)
│       ├── DocumentoStorageService.java  │  I/O de archivos en sistema de ficheros
│       ├── DocumentoConversionService.java  │  Conversión Word→PDF vía soffice CLI
│       ├── FileValidationService.java    │  Validación de tipo MIME y tamaño máximo (100 MB)
│       ├── BusquedaExpedientesService.java  │  Búsqueda avanzada paginada con múltiples filtros
│       ├── AuditoriaService.java         │  Registro de eventos de auditoría (solo INSERT)
│       ├── AuditoriaConsultaService.java │  Consulta paginada de auditoría para ADMINISTRADOR
│       └── AdminUsuarioService.java      │  CRUD de usuarios, reset de contraseña, bloqueo/desbloqueo
│
├── infrastructure/                       ← CAPA INFRAESTRUCTURA: Adaptadores a sistemas externos
│   ├── config/
│   │   ├── SecurityConfig.java           │  Configuración Spring Security (CORS, CSRF off, rutas públicas)
│   │   ├── DocumentoStorageProperties.java  │  @ConfigurationProperties para rutas de almacenamiento
│   │   ├── DbDataInitializer.java        │  Inicialización de datos de arranque si la DB está vacía
│   │   ├── SecretsPropertySourceLocator.java  │  Carga de secretos desde archivo externo opcional
│   │   └── TestDocumentConverterConfig.java   │  Bean de conversión alternativo para tests
│   ├── integration/sgt/                  │  Integración con sistemas SGT externos (stubs incluidos)
│   │   ├── SgtConfig.java
│   │   ├── SgtExpedienteDto.java
│   │   ├── Sgtv1Client.java / Sgtv1ClientStub.java
│   │   └── Sgtv2Client.java / Sgtv2ClientStub.java
│   ├── persistence/
│   │   ├── auth/                         │  Entidades de autenticación y seguridad
│   │   │   ├── Usuario.java              │  Entidad JPA — tabla usuario
│   │   │   ├── CatRol.java               │  Entidad JPA — tabla cat_rol
│   │   │   ├── CatJuzgado.java           │  Entidad JPA — tabla cat_juzgado
│   │   │   ├── RevokedToken.java         │  Entidad JPA — tabla revoked_token
│   │   │   ├── AuthAttempt.java          │  Entidad JPA — tabla auth_attempt
│   │   │   ├── Auditoria.java            │  Entidad JPA — tabla auditoria
│   │   │   └── repository/
│   │   │       ├── UsuarioRepository.java
│   │   │       ├── CatRolRepository.java
│   │   │       ├── CatJuzgadoRepository.java
│   │   │       ├── RevokedTokenRepository.java
│   │   │       ├── AuthAttemptRepository.java
│   │   │       └── AuditoriaRepository.java
│   │   ├── documento/
│   │   │   ├── Documento.java            │  Entidad JPA — tabla documento
│   │   │   ├── CatTipoDocumento.java     │  Entidad JPA — tabla cat_tipo_documento
│   │   │   └── repository/
│   │   │       ├── DocumentoRepository.java
│   │   │       └── CatTipoDocumentoRepository.java
│   │   └── expediente/
│   │       ├── Expediente.java           │  Entidad JPA — tabla expediente
│   │       ├── CatEstado.java            │  Entidad JPA — tabla cat_estado
│   │       ├── CatTipoProceso.java       │  Entidad JPA — tabla cat_tipo_proceso
│   │       └── repository/
│   │           ├── ExpedienteRepository.java
│   │           ├── CatEstadoRepository.java
│   │           └── CatTipoProcesoRepository.java
│   └── security/
│       ├── JwtTokenProvider.java         │  Generación, validación y parsing de JWT
│       ├── JwtAuthenticationFilter.java  │  Filtro que valida el token en cada request
│       └── RequestContextFilter.java     │  Captura IP real (X-Forwarded-For) para auditoría
│
└── shared/                               ← UTILIDADES TRANSVERSALES (sin dependencias de capas)
    ├── exception/
    │   ├── AuthException.java            │  Error de autenticación con códigos tipados
    │   ├── ResourceNotFoundException.java  │  404 — recurso no encontrado
    │   ├── InvalidReferenceException.java  │  422 — referencia a catálogo inválida
    │   ├── StorageException.java         │  Error de I/O en almacenamiento de archivos
    │   ├── FileTooLargeException.java    │  Archivo supera el límite de 100 MB
    │   ├── FileTypeNotAllowedException.java  │  Tipo MIME no permitido
    │   └── PasswordValidationException.java  │  Contraseña no cumple política
    └── util/
        ├── AuditAction.java              │  Enum con acciones auditables (CREAR_EXPEDIENTE, etc.)
        ├── SecurityUtil.java             │  Obtiene el username del SecurityContext
        └── DocumentoCategoriaUtil.java   │  Clasifica documentos por extensión/MIME
```

---

## 2. Convenciones de Nombrado

| Tipo de Clase | Sufijo | Ejemplo | Paquete |
|--------------|--------|---------|---------|
| Controlador REST | `Controller` | `ExpedienteController` | `api/controller/` |
| Servicio de negocio | `Service` | `ExpedienteService` | `application/service/` |
| Repositorio JPA | `Repository` | `ExpedienteRepository` | `infrastructure/persistence/.../repository/` |
| Entidad JPA | Sin sufijo (sustantivo) | `Expediente`, `Usuario` | `infrastructure/persistence/` |
| DTO de entrada | `Request` | `ExpedienteRequest` | `api/dto/request/` |
| DTO de salida | `Response` | `ExpedienteResponse` | `api/dto/response/` |
| Mapper MapStruct | `Mapper` | `ExpedienteMapper` | `application/mapper/` |
| Excepción de dominio | `Exception` | `ResourceNotFoundException` | `shared/exception/` |
| Configuración Spring | `Config` o `Properties` | `SecurityConfig`, `DocumentoStorageProperties` | `infrastructure/config/` |

### Convenciones adicionales

- **Todas las entidades** tienen `id` de tipo `Long` generado por la base de datos.
- **DTOs de entrada** usan anotaciones de Bean Validation: `@NotBlank`, `@NotNull`, `@Size`, `@Email`.
- **Todos los controladores** declaran `@PreAuthorize` explícito en cada endpoint; nunca se confía en la seguridad por omisión.
- **Cero `System.out.println`** en producción; usar `org.slf4j.Logger` con `LoggerFactory.getLogger(ClaseActual.class)`.
- **Transacciones**: los métodos de lectura llevan `@Transactional(readOnly = true)`, los de escritura `@Transactional`.

---

## 3. Flujo Crear Expediente — Pseudocódigo

El siguiente pseudocódigo muestra el flujo completo desde el controlador hasta la base de datos para la operación de creación de un expediente:

```java
// 1. CONTROLADOR — api/controller/ExpedienteController.java
@PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR')")
@PostMapping
public ResponseEntity<ApiResponse<ExpedienteResponse>> crear(
    @Valid @RequestBody ExpedienteRequest request,   // Bean Validation ejecutado aquí
    HttpServletRequest httpRequest
) {
    String ip = httpRequest.getRemoteAddr();          // IP capturada por RequestContextFilter
    ExpedienteResponse response = expedienteService.crearExpediente(request, ip);
    return ResponseEntity.ok(ApiResponse.ok("Expediente creado", response));
}

// 2. SERVICIO — application/service/ExpedienteService.java
@Transactional
public ExpedienteResponse crearExpediente(ExpedienteRequest request, String ip) {
    // 2a. Obtener usuario autenticado desde SecurityContext
    Usuario usuario = getCurrentUser();   // SecurityUtil → SecurityContext → UsuarioRepository

    // 2b. Si no es ADMIN, forzar juzgado del propio usuario (aislamiento de datos)
    if (!isAdmin()) {
        Long juzgadoId = usuario.getJuzgado().getId();
        if (request.getJuzgadoId() != null && !request.getJuzgadoId().equals(juzgadoId)) {
            throw new AccessDeniedException("No puede crear expedientes para otros juzgados");
        }
        request.setJuzgadoId(juzgadoId);
    }

    // 2c. Validar que las referencias a catálogos existen en DB
    validateCatalogs(request.getTipoProcesoId(), request.getEstadoId());
    // Lanza InvalidReferenceException si algún ID no existe

    // 2d. Convertir DTO → Entidad con MapStruct (tiempo de compilación)
    Expediente expediente = expedienteMapper.toEntity(request);
    expediente.setUsuarioCreacion(usuario.getUsername());
    expediente.setFechaCreacion(LocalDateTime.now());

    // 2e. Persistir en base de datos
    Expediente saved = expedienteRepository.save(expediente);

    // 2f. Registrar evento de auditoría (INSERT en tabla auditoria)
    auditoriaService.registrar(
        "CREAR_EXPEDIENTE",   // accion
        "EXPEDIENTE",         // modulo
        saved.getId(),        // recurso_id
        "Creación de expediente",  // detalle
        ip,                   // ip del cliente
        usuario.getUsername() // usuario que ejecutó la acción
    );

    // 2g. Convertir Entidad → DTO de respuesta con MapStruct
    return expedienteMapper.toResponse(saved);
}

// 3. MAPPER — application/mapper/ExpedienteMapper.java (generado por MapStruct)
@Mapper(componentModel = "spring")
public interface ExpedienteMapper {
    ExpedienteResponse toResponse(Expediente expediente);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioCreacion", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "usuarioModificacion", ignore = true)
    @Mapping(target = "fechaModificacion", ignore = true)
    Expediente toEntity(ExpedienteRequest request);
}

// 4. REPOSITORIO — infrastructure/persistence/expediente/repository/ExpedienteRepository.java
// Spring Data JPA genera la implementación automáticamente
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {
    Page<Expediente> findByJuzgadoId(Long juzgadoId, Pageable pageable);
    long countByJuzgadoId(Long juzgadoId);
    long countByEstadoId(Long estadoId);
    // ... otros métodos de consulta
}
```

---

## 4. MapStruct — Estrategia de Mapeo

MapStruct es un procesador de anotaciones que **genera código Java puro en tiempo de compilación** para convertir entre entidades JPA y DTOs. Esto elimina la reflexión en tiempo de ejecución (costosa en un VPS de 2 GB de RAM).

### Configuración en el proyecto

El procesador se configura en el `maven-compiler-plugin` del `pom.xml`:

```xml
<annotationProcessorPaths>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.34</version>
    </path>
    <path>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>1.6.0</version>
    </path>
</annotationProcessorPaths>
```

**Importante**: Lombok debe declararse ANTES que MapStruct en la lista de procesadores, o los getters/setters generados por Lombok no serán visibles para MapStruct.

### Reglas clave de mapeo

- `componentModel = "spring"` — el mapper es un bean Spring (`@Component`) inyectable por constructor.
- Los campos `id`, `fechaCreacion`, `usuarioCreacion` se ignoran en `toEntity()` porque son generados por la DB o el servicio.
- En `updateEntity()`, el campo `numero` también se ignora (es inmutable una vez creado).
- Los mapeos automáticos funcionan cuando el nombre de campo es idéntico en DTO y entidad.
- Para campos de catálogo (ej.: `tipoProcesoId` → `tipoProceso`), se usa `@Mapping(source="...", target="...")`.

---

## 5. Lista de Servicios y sus Responsabilidades

| Servicio | Clase | Responsabilidad Principal |
|---------|-------|--------------------------|
| **AuthService** | `application/service/AuthService.java` | Validar credenciales contra BCrypt, controlar lockout (5 intentos), generar JWT, revocar tokens en logout, gestionar cambio de contraseña. |
| **ExpedienteService** | `application/service/ExpedienteService.java` | CRUD de expedientes con aislamiento por juzgado. ADMINISTRADOR ve todos; otros roles solo ven los de su juzgado. Calcula estadísticas de dashboard. |
| **DocumentoService** | `application/service/DocumentoService.java` | Gestión de metadatos de documentos (crear registro, marcar como eliminado con soft-delete, listar por expediente). |
| **DocumentoStorageService** | `application/service/DocumentoStorageService.java` | I/O físico de archivos: guardar, leer y eliminar archivos del sistema de ficheros en `DOCUMENTOS_BASE_PATH`. Genera nombre único UUID para almacenamiento. |
| **DocumentoConversionService** | `application/service/DocumentoConversionService.java` | Convierte documentos Word (.doc, .docx) a PDF usando `soffice` CLI (LibreOffice). El PDF se guarda como archivo `.preview.pdf` junto al original. |
| **FileValidationService** | `application/service/FileValidationService.java` | Valida tipo MIME real del archivo (no solo extensión), verifica que no supere los 100 MB (`DOCUMENTOS_MAX_SIZE`). Lanza `FileTooLargeException` o `FileTypeNotAllowedException`. |
| **BusquedaExpedientesService** | `application/service/BusquedaExpedientesService.java` | Búsqueda avanzada de expedientes con múltiples filtros opcionales (número, estado, juzgado, tipo proceso, sujeto, rango de fechas). Retorna resultados paginados. |
| **AuditoriaService** | `application/service/AuditoriaService.java` | Registra eventos de auditoría con INSERT inmutable. Acepta acción, módulo, recurso_id, detalle, IP y usuario. Nunca actualiza ni elimina registros de auditoría. |
| **AuditoriaConsultaService** | `application/service/AuditoriaConsultaService.java` | Consulta paginada del histórico de auditoría, filtrable por usuario, acción, módulo y rango de fechas. Solo accesible para ADMINISTRADOR. |
| **AdminUsuarioService** | `application/service/AdminUsuarioService.java` | CRUD de usuarios del sistema: crear, editar, listar, desbloquear cuentas, reset de contraseña forzado. Solo invocable por ADMINISTRADOR. |

---

## 6. Manejo Global de Excepciones

`GlobalExceptionHandler` (`api/exception/GlobalExceptionHandler.java`) captura todas las excepciones no controladas y las convierte en respuestas HTTP consistentes:

| Excepción | Código HTTP | Descripción |
|-----------|------------|-------------|
| `ResourceNotFoundException` | 404 Not Found | Recurso solicitado no existe en DB |
| `AuthException` | 401 Unauthorized | Credenciales inválidas, cuenta bloqueada |
| `AccessDeniedException` | 403 Forbidden | Rol insuficiente para la operación |
| `InvalidReferenceException` | 422 Unprocessable Entity | Referencia a catálogo inexistente |
| `FileTooLargeException` | 413 Payload Too Large | Archivo supera 100 MB |
| `FileTypeNotAllowedException` | 415 Unsupported Media Type | Tipo MIME no permitido |
| `PasswordValidationException` | 400 Bad Request | Contraseña no cumple política |
| `MethodArgumentNotValidException` | 400 Bad Request | Fallo en Bean Validation — incluye lista de errores por campo |
| `StorageException` | 500 Internal Server Error | Error de I/O en almacenamiento |

Toda respuesta de error sigue el formato:
```json
{
  "success": false,
  "message": "Descripción legible del error",
  "data": null
}
```

---

*Siguiente: [03-frontend.md](./03-frontend.md) — Estructura de módulos Angular, servicios e interceptors.*
