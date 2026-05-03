---
Documento: ARQUITECTURA_GENERAL
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# 01 — Arquitectura General

## 1. Diagrama de 3 Capas

El sistema SGED sigue una arquitectura de 3 capas desacopladas que se comunican a través de una API REST:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Navegador)                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Angular 21 SPA (Puerto 4200)           │   │
│   │   PrimeNG 21 · RxJS 7.8 · TypeScript 5.9           │   │
│   │   AuthInterceptor · ErrorInterceptor                │   │
│   │   AuthGuard · RoleGuard                             │   │
│   └──────────────────┬──────────────────────────────────┘   │
└──────────────────────│──────────────────────────────────────┘
                       │  HTTP/REST  Authorization: Bearer <JWT>
                       │  JSON  (multipart/form-data para docs)
┌──────────────────────▼──────────────────────────────────────┐
│                    PROXY INVERSO                            │
│              Nginx 1.27.x (client_max_body_size 100M)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 SERVIDOR (VPS Lite / Local)                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           Spring Boot 3.5 (Puerto 8080)             │   │
│   │   Java 21 · Spring Security 6.5 · Flyway 10         │   │
│   │   JJWT 0.11.5 · MapStruct 1.6.0 · Lombok 1.18.34   │   │
│   │   JwtAuthenticationFilter · RequestContextFilter    │   │
│   └──────────────────┬──────────────────────────────────┘   │
└──────────────────────│──────────────────────────────────────┘
                       │  JDBC / JPA / HQL
┌──────────────────────▼──────────────────────────────────────┐
│                   CAPA DE DATOS                             │
│                                                             │
│   ┌────────────────────┐    ┌────────────────────────────┐  │
│   │   MySQL 8          │    │   Oracle 21c               │  │
│   │   (VPS / Táctico)  │    │   (Objetivo Corporativo)   │  │
│   │   Dockerizado      │    │   ANSI SQL compatible      │  │
│   └────────────────────┘    └────────────────────────────┘  │
│              13 tablas · 14 migraciones Flyway               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura Hexagonal del Backend

El backend implementa una variante de arquitectura hexagonal, organizando el código en 4 paquetes de primer nivel bajo `com.oj.sged`:

```
com.oj.sged/
│
├── api/                          ← CAPA DE ENTRADA (Adaptor Primario)
│   ├── controller/               │  Controladores REST (@RestController)
│   ├── dto/                      │  Objetos de transferencia (request/response)
│   │   ├── request/              │  DTOs de entrada validados con Bean Validation
│   │   └── response/             │  DTOs de salida (nunca entidades JPA directas)
│   └── exception/                │  GlobalExceptionHandler (@RestControllerAdvice)
│
├── application/                  ← CAPA DE APLICACIÓN (Casos de Uso)
│   ├── service/                  │  Servicios de negocio (@Service)
│   └── mapper/                   │  Conversores Entity↔DTO (MapStruct)
│
├── infrastructure/               ← CAPA DE INFRAESTRUCTURA (Adaptores Secundarios)
│   ├── config/                   │  Configuraciones Spring (Security, Storage, etc.)
│   ├── integration/sgt/          │  Clientes de integración SGT v1 y v2
│   ├── persistence/              │  Entidades JPA y repositorios Spring Data
│   │   ├── auth/                 │  Usuario, CatRol, CatJuzgado, RevokedToken, AuthAttempt, Auditoria
│   │   ├── documento/            │  Documento, CatTipoDocumento
│   │   └── expediente/           │  Expediente, CatEstado, CatTipoProceso
│   └── security/                 │  JwtTokenProvider, JwtAuthenticationFilter, RequestContextFilter
│
└── shared/                       ← UTILIDADES TRANSVERSALES
    ├── exception/                 │  Excepciones de dominio personalizadas
    └── util/                      │  AuditAction, SecurityUtil, DocumentoCategoriaUtil
```

### Regla de dependencia entre capas

```
api/  →  application/  →  infrastructure/
          ↕                    ↕
        shared/             shared/
```

- `api/` puede llamar a `application/service/` pero NUNCA a `infrastructure/` directamente.
- `application/service/` usa repositorios de `infrastructure/persistence/` a través de interfaces.
- `shared/` no tiene dependencias hacia ninguna otra capa.

---

## 3. Flujo Completo Request → Response

El siguiente diagrama muestra el ciclo de vida de una petición autenticada, por ejemplo `GET /api/v1/expedientes`:

```
Cliente Angular
     │
     │  1. HTTP GET /api/v1/expedientes
     │     Authorization: Bearer <JWT>
     ▼
Nginx (proxy_pass → backend:8080)
     │
     │  2. Reenvía la petición al contenedor backend
     ▼
RequestContextFilter
     │  3. Captura IP real del cliente (X-Forwarded-For)
     │     y la almacena en el contexto del hilo
     ▼
JwtAuthenticationFilter
     │  4. Extrae el token del header Authorization
     │  5. JwtTokenProvider.validateToken():
     │     - Verifica firma HMAC-SHA256
     │     - Verifica expiración
     │     - Consulta tabla revoked_token por JTI
     │  6. Si válido: carga authorities (ROLE_xxx) en SecurityContext
     ▼
Spring Security (authorizeHttpRequests)
     │  7. Verifica que la ruta requiere autenticación
     │  8. Verifica @PreAuthorize en el controlador
     ▼
ExpedienteController.listar()
     │  9. Llama al servicio de negocio con Pageable
     ▼
ExpedienteService.listarExpedientes()
     │  10. Determina si el usuario es ADMINISTRADOR
     │  11. Si no: filtra por juzgado_id del usuario actual
     │  12. Llama a ExpedienteRepository (Spring Data JPA)
     ▼
ExpedienteRepository → MySQL / Oracle
     │  13. Ejecuta HQL: findAll() o findByJuzgadoId()
     │  14. Retorna Page<Expediente>
     ▼
ExpedienteMapper (MapStruct)
     │  15. Convierte List<Expediente> → List<ExpedienteResponse>
     │      Sin exponer entidades JPA al cliente
     ▼
ExpedienteController
     │  16. Envuelve en ApiResponse.ok("Listado de expedientes", page)
     ▼
GlobalExceptionHandler
     │  17. En caso de error: captura excepciones y retorna
     │      ValidationErrorResponse o ApiResponse con código HTTP apropiado
     ▼
Cliente Angular
     │  18. ErrorInterceptor: maneja 401/403 → redirige a /login
     │  19. Componente recibe Page<ExpedienteResponse>
     │      y renderiza con p-table de PrimeNG
```

---

## 4. Tabla de Decisiones de Diseño

| Decisión | Alternativa Descartada | Razón de la Elección |
|----------|----------------------|----------------------|
| **JWT stateless + blacklist en DB** | Sessions HTTP con estado | El servidor es stateless (escalabilidad), pero la revocación en logout es imprescindible para seguridad judicial. La tabla `revoked_token` con índice por `token_jti` mantiene el costo bajo. |
| **Flyway para migraciones** | DDL manual / Liquibase | Flyway es más sencillo, garantiza orden determinista de migraciones, y su convención `V{n}__{descripcion}.sql` es autoexplicativa para el equipo DBA. |
| **MapStruct en tiempo de compilación** | ModelMapper (reflexión) | MapStruct genera código Java puro en compilación. Cero reflexión en tiempo de ejecución = máximo rendimiento, crítico en el VPS de 2 GB de RAM. |
| **MySQL 8 en VPS (táctica)** | Oracle 21c directo | Oracle requería credenciales corporativas aún no disponibles. MySQL 8 en Docker permite entregar valor de inmediato. Todo el código usa JPA/HQL estándar para migración zero-friction a Oracle. |
| **Docker Compose** | Bare-metal / Kubernetes | El VPS Lite (2 GB RAM) no soporta un orquestador completo. Docker Compose provee aislamiento y reproducibilidad sin overhead significativo. |
| **Angular Standalone Components** | NgModules tradicionales | Angular 21 recomienda Standalone por defecto: menos boilerplate, lazy-loading más granular, y mejor tree-shaking para el bundle final. |
| **PrimeNG Aura Theme** | Material Design / Tailwind | PrimeNG integra con Angular de forma nativa, incluye componentes empresariales (p-table, p-dialog, p-fileUpload) sin fricción, y Aura Theme provee UI premium sin CSS customizado extenso. |
| **sessionStorage para el JWT** | localStorage / cookies | sessionStorage se vacía al cerrar el tab (menor riesgo de robo en sesiones compartidas), y es suficiente para un sistema de uso interno judicial. |
| **BCryptPasswordEncoder** | MD5 / SHA-1 sin sal | BCrypt incluye sal aleatoria por diseño, es resistente a ataques de tabla arcoíris, y es el estándar recomendado por Spring Security. |

---

## 5. Tabla de Entornos

| Parámetro | Local (desarrollo) | QA | Producción (VPS) |
|-----------|-------------------|-----|-----------------|
| **Perfil Spring** | `default` (Oracle) o `dev` | `qa` | `default` con variables de entorno |
| **Base de datos** | Oracle 21c local o H2 | H2 en memoria | MySQL 8 Dockerizado |
| **URL backend** | `http://localhost:8080` | `http://localhost:8081` | `http://51.161.32.204:8086` |
| **URL frontend** | `http://localhost:4200` | `http://localhost:4201` | `http://51.161.32.204:8085` |
| **JWT Secret** | `change-me` (inseguro, solo local) | `change-me` | Variable de entorno `JWT_SECRET` |
| **Almacenamiento docs** | `C:/sged/documentos` | Temporal H2 | Variable `DOCUMENTOS_BASE_PATH` |
| **Conversión a PDF** | `DOCUMENTOS_CONVERSION_ENABLED=true` | false | `true` (soffice CLI) |
| **Pool DB** | min=2, max=10 | min=2, max=5 | Variable `DB_POOL_MAX` |
| **Nginx** | No aplica | No aplica | Proxy inverso (puerto 80/443) |
| **Docker Compose** | Opcional (solo DB) | `docker-compose-qa.yml` | `docker-compose-vps.yml` |

### Variables de Entorno Clave en Producción

```bash
JWT_SECRET=<cadena-secreta-min-32-chars>
JWT_EXPIRATION_MS=28800000          # 8 horas
DB_URL=jdbc:mysql://db:3306/sged
DB_USER=sged
DB_PASSWORD=<password-seguro>
DOCUMENTOS_BASE_PATH=/data/sged/documentos
DOCUMENTOS_MAX_SIZE=104857600       # 100 MB
DOCUMENTOS_CONVERSION_ENABLED=true
DB_POOL_MAX=10
DB_POOL_MIN=2
```

---

*Siguiente: [02-backend.md](./02-backend.md) — Estructura de paquetes, servicios y convenciones Java.*
