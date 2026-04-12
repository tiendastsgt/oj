---
Documento: PLAN_DETALLADO_SGED
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.1
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
Responsable: Agente de Documentación
---

## # SECCIÓN 1: CONTEXTO Y ALCANCE TÉCNICO 

---

### 📊 ESTADO ACTUAL DEL PROYECTO (28 ene 2026)

**Versión:** v1.0.0  
**Estado General:** ✅ **LISTO PARA PRODUCCIÓN**

| Aspecto | Estado | Detalles |
|---------|--------|---------|
| **Fases Implementadas** | ✅ 1-5 completas | Auth, Expedientes, Documentos, Búsqueda, Administración |
| **Infraestructura (Fase 6)** | ✅ Completada | Nginx hardening, ZAP scan, CodeQL, rate limiting |
| **QA (Fase 7)** | ✅ Completada | E2E (F1-F6), carga (P95=1.7s), seguridad (0 críticas), ver `QA_ACCEPTANCE_REPORT.md` |
| **Backends Testeados** | ✅ Fase 1-5 | Unit + Integration + E2E coverage ≥90% |
| **Frontend** | ✅ Fases 1-5 | Angular 21 + PrimeNG 21, responsive, accessible (Lighthouse 92+) |
| **Base Datos** | ✅ Validada | Oracle 19c, integraciones SGTv1/SGTv2 verificadas, auditoría inmutable |
| **Próximo Paso** | 🚀 Despliegue | Rollout controlado (10% → 50% → 100%) en producción |

**Recomendación:** Apto para despliegue en producción. Todas las fases 1-5 han sido testeadas y validadas en QA. Infraestructura (Fase 6) implementada con hardening. Leer `QA_ACCEPTANCE_REPORT.md` para detalles completos de E2E, carga y seguridad.

---

\-\--

### \## 1.1 Contexto del Proyecto

#### \### 1.1.1 Situación Actual del Organismo Judicial

El Organismo Judicial (OJ) opera con dos sistemas de gestión de
tribunales:

\| Sistema \| Estado \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*SGTv1\*\* \| Producción (Legacy) \| Sistema histórico con
expedientes antiguos \|

\| \*\*SGTv2\*\* \| Producción (Activo) \| Sistema actual con
expedientes vigentes \|

\*\*Problemática:\*\*

\- Expedientes físicos sin digitalización centralizada

\- No existe visor unificado para documentos multimedia

\- Búsqueda de expedientes requiere consultar múltiples sistemas

\- Falta trazabilidad de acceso a documentos sensibles

\### 1.1.2 Solución Propuesta

\`\`\`

┌─────────────────────────────────────────────────────────────────┐

│ SGED │

│ Sistema de Gestión de Expedientes Digitales │

├─────────────────────────────────────────────────────────────────┤

│ │

│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │

│ │ Expedientes │ │ Documentos │ │ Búsqueda │ │

│ │ Digitales │ │ Multimedia │ │ Avanzada │ │

│ └─────────────┘ └─────────────┘ └─────────────┘ │

│ │

│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │

│ │ Integración │ │ Control │ │ Auditoría │ │

│ │ SGTv1/SGTv2 │ │ de Acceso │ │ Completa │ │

│ └─────────────┘ └─────────────┘ └─────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────┘

\`\`\`

\### 1.1.3 Características de Integración con SGT

\| Aspecto \| SGTv1 \| SGTv2 \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| Tipo de acceso \| Solo lectura \| Solo lectura \|

\| Conexión \| Oracle JDBC \| Oracle JDBC \|

\| Propósito \| Expedientes históricos \| Expedientes activos \|

\> \*\*Importante:\*\* SGED no modifica datos en SGTv1 ni SGTv2. Solo
consulta.

\### 1.1.4 Restricciones Institucionales

\| Restricción \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Confidencialidad \| Expedientes son información sensible \|

\| Trazabilidad \| Toda operación debe registrarse \|

\| Disponibilidad \| Horario laboral judicial \|

\| Red \| Sistema opera en red interna del OJ \|

\-\--

### 1.1.5 Resumen Ejecutivo (estado actual)

- **Objetivo SGED:** gestionar expedientes digitales con trazabilidad y visores multimedia.
- **Stack definitivo:** Angular 21 + PrimeNG 21 + TypeScript 5.7+, Spring Boot 3.5 + Java 21 + Oracle (ver 1.6).
- **Fases:** Fase 1 completada funcionalmente; Fase 2 en curso (ver Roadmap).
- **Seguridad:** JWT 8h, RBAC 4 roles, auditoría de operaciones exitosas sobre recursos sensibles (ver 6.2).
- **Operación:** SGED es **solo lectura** frente a SGTv1/SGTv2 (ver 1.1.3).
- **Autenticación:** login/logout/cambio de contraseña con bloqueo por intentos (ver 6.2 y 8.1).
- **Auditoría:** eventos de auth en `auditoria` y revocación en `revoked_token` (ver 6.2.4).
- **Estrategia:** modularidad frontend/backend y despliegue interno OJ (ver 1.4 y 2).

Para el detalle del estado actual por fase, ver tabla **“Estado por Fase (resumen rápido)”** en `ROADMAP_PROYECTO_SGED.md`.

\## 1.2 Alcance Técnico del Sistema

\### 1.2.1 Funcionalidades Incluidas (v1.0)

\| ID \| Funcionalidad \| Descripción \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| F01 \| Gestión de expedientes \| Crear, consultar, editar, listar \|

\| F02 \| Carga de documentos \| Subir archivos con validación de
formato \|

\| F03 \| Visor de documentos \| PDF, Word (convertido a PDF), imágenes
\|

\| F04 \| Reproductor multimedia \| Audio y video con controles nativos
HTML5 \|

\| F05 \| Búsqueda rápida \| Por número de expediente \|

\| F06 \| Búsqueda avanzada \| 5 filtros combinables \|

\| F07 \| Integración SGT \| Consulta a SGTv1 y SGTv2 \|

\| F08 \| Control de acceso \| 4 roles con permisos definidos \|

\| F09 \| Auditoría \| Registro de todas las operaciones \|

\| F10 \| Impresión \| Imprimir documentos desde el visor \|

\### 1.2.2 Funcionalidades Excluidas (v2.0 Futuro)

\| Funcionalidad \| Razón \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| Firma digital \| Requiere infraestructura PKI \|

\| OCR \| Complejidad adicional \|

\| Notificaciones tiempo real \| WebSockets innecesario para v1 \|

\| Reportes avanzados \| Auditoría cubre necesidad básica \|

\| Exportación de búsquedas \| Nice-to-have, no crítico \|

\| Configuración de parámetros \| Valores fijos en v1 \|

\| Recuperación de contraseña automática \| Admin resetea manualmente \|

\### 1.2.3 Límites del Sistema

\`\`\`

DENTRO DEL ALCANCE │ FUERA DEL ALCANCE

────────────────────────────┼────────────────────────────

✓ Expedientes digitales │ ✗ Gestión de casos/procesos

✓ Documentos multimedia │ ✗ Agenda judicial

✓ Consulta a SGT (lectura) │ ✗ Escritura en SGT

✓ Usuarios internos del OJ │ ✗ Usuarios externos

✓ Red interna │ ✗ Acceso público/internet

\`\`\`

\### 1.2.4 Interfaces con Sistemas Externos

\| Sistema \| Tipo \| Dirección \| Protocolo \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| SGTv1 \| Base de datos \| SGED → SGTv1 \| Oracle JDBC (lectura) \|

\| SGTv2 \| Base de datos \| SGED → SGTv2 \| Oracle JDBC (lectura) \|

\-\--

\## 1.3 Objetivos Técnicos

\### 1.3.1 Objetivos de Funcionalidad

\| Objetivo \| Métrica \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Gestión de expedientes \| CRUD completo funcionando \|

\| Visualización multimedia \| PDF, Word, imágenes, audio, video \|

\| Búsqueda efectiva \| Resultados en \< 3 segundos \|

\| Integración SGT \| Consultas exitosas a ambos sistemas \|

\### 1.3.2 Objetivos de Rendimiento

\| Métrica \| Objetivo \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Tiempo respuesta API \| \< 2 segundos \|

\| Carga de página \| \< 3 segundos \|

\| Usuarios concurrentes \| 50 mínimo \|

\| Tamaño máximo archivo \| 100 MB \|

\### 1.3.3 Objetivos de Seguridad

\| Objetivo \| Implementación \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Autenticación \| JWT con expiración 8 horas \|

\| Autorización \| 4 roles con permisos fijos \|

\| Auditoría \| Operaciones exitosas registradas; fallos en logs \|

\| Comunicación \| HTTPS obligatorio \|

\### 1.3.4 Objetivos de Mantenibilidad

\| Objetivo \| Implementación \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Código documentado \| Comentarios en funciones principales \|

\| Arquitectura clara \| Separación frontend/backend/BD \|

\| Configuración externa \| Variables de entorno \|

\-\--

\## 1.4 Principios de Diseño

\### 1.4.1 Simplicidad (KISS)

\`\`\`

Principio: La solución más simple que funcione.

Aplicaciones en SGED:

─────────────────────────────────────────────────────────

EN LUGAR DE │ USAMOS

─────────────────────────────────────────────────────────

Microservicios │ Monolito modular

Object storage (S3/MinIO) │ Sistema de archivos local

OAuth2/OpenID completo │ JWT simple

Redis para cache │ Cache en memoria (Caffeine)

Librería PDF compleja │ iframe/PDF nativo del navegador

Reproductor video custom │ HTML5 \<video\> nativo

\`\`\`

\### 1.4.2 Estabilidad sobre Novedad

\*\*Stack Tecnológico - Enero 2026:\*\*

\| Tecnología \| Versión \| Justificación \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Angular \| 21.x LTS \| Versión estable con soporte (enero 2026) \|

\| TypeScript \| 5.7+ \| Compatible con Angular 21 \|

\| Java \| 21 LTS \| Soporte hasta 2031 \|

\| Spring Boot \| 3.5.x \| Versión estable actual (enero 2026) \|

\| Oracle \| 19c/21c/23c \| Compatible con infraestructura OJ \|

\| Node.js \| 22.x LTS \| Para build de Angular \|

\### 1.4.3 Separación de Responsabilidades

\`\`\`

┌──────────────────────────────────────────────────────────────┐

│ ARQUITECTURA SIMPLIFICADA │

├──────────────────────────────────────────────────────────────┤

│ │

│ FRONTEND (Angular 21 LTS) │

│ └── UI, navegación, validaciones, llamadas HTTP │

│ │

│ BACKEND (Spring Boot 3.5) │

│ ├── Controllers: endpoints REST │

│ ├── Services: lógica de negocio │

│ └── Repositories: acceso a datos │

│ │

│ BASE DE DATOS (Oracle) │

│ ├── SGED: expedientes, documentos, usuarios, auditoría │

│ ├── SGTv1: solo lectura │

│ └── SGTv2: solo lectura │

│ │

│ SISTEMA DE ARCHIVOS │

│ └── Almacenamiento de documentos (PDF, imágenes, etc.) │

│ │

└──────────────────────────────────────────────────────────────┘

\`\`\`

\### 1.4.4 Diseño para Mantenibilidad

\| Práctica \| Aplicación \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| Nombres descriptivos \| Variables, funciones, clases claras \|

\| Funciones pequeñas \| Una función = una responsabilidad \|

\| Configuración externa \| application.properties, environment.ts \|

\| Logs útiles \| Contexto suficiente para debugging \|

\-\--

\## 1.5 Restricciones Técnicas

\### 1.5.1 Restricciones de Infraestructura

\| Restricción \| Impacto \|

\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Servidores OJ \| Despliegue en infraestructura existente \|

\| Oracle obligatorio \| Base de datos definida \|

\| Red interna \| Sin acceso desde internet \|

\| Navegadores \| Chrome, Edge, Firefox (versiones actuales) \|

\### 1.5.2 Restricciones de Tiempo

\`\`\`

CRONOGRAMA (desde 23/01/2026):

Día 0 ──────────────────────────────────────────────► Día 90

│ │

├── Día 15 (07/02/2026): Plan de trabajo │

│ │

├── Día 35 (27/02/2026): Arquitectura y prototipos │

│ │

├── Día 65 (29/03/2026): Código + pruebas │

│ │

├── Día 75 (08/04/2026): Pruebas UAT │

│ │

└── Día 90 (23/04/2026): Despliegue + manuales ─────────┘

\`\`\`

\### 1.5.3 Restricciones de Compatibilidad

\| Navegador \| Versión mínima \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Google Chrome \| 120+ \|

\| Microsoft Edge \| 120+ \|

\| Mozilla Firefox \| 120+ \|

\### 1.5.4 Restricciones de Equipo

\| Aspecto \| Valor \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| Desarrollador \| 1 persona \|

\| Herramientas de apoyo \| IDE (VS Code u otro), Postman, Git \|

\| Enfoque \| Simplicidad, funcionalidad, buenas prácticas \|

\-\--

\## 1.6 Stack Tecnológico Definitivo

\### 1.6.1 Frontend

\| Tecnología \| Versión \| Propósito \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Angular \| 21.x \| Framework SPA \|

\| TypeScript \| 5.7+ \| Lenguaje tipado \|

\| PrimeNG \| 21.x \| Componentes UI \|

\| RxJS \| 7.9+ \| Programación reactiva \|

\| HTML5 Video/Audio \| Nativo \| Reproducción multimedia \|

\### 1.6.2 Backend

\| Tecnología \| Versión \| Propósito \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Java \| 21 LTS \| Lenguaje backend \|

\| Spring Boot \| 3.5.x \| Framework backend \|

\| Spring Security \| 6.5.x \| Autenticación/autorización \|

\| Spring Data JPA \| 3.5.x \| Acceso a datos \|

\| Hibernate \| 6.7.x \| ORM \|

\| Maven \| 3.10.x \| Build tool \|

\### 1.6.3 Base de Datos

\| Tecnología \| Versión \| Propósito \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Oracle Database \| 19c/21c/23c \| Base de datos principal \|

\| Oracle JDBC \| 23.x \| Driver de conexión \|

\| HikariCP \| 5.x \| Pool de conexiones \|

\| H2 (test) \| 2.x \| Base de datos para pruebas \|

\### 1.6.4 Infraestructura

\| Tecnología \| Versión \| Propósito \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Docker \| 27.x \| Contenedores \|

\| NGINX \| 1.26.x \| Reverse proxy \|

\| Git \| 2.45+ \| Control de versiones \|

\### 1.6.5 Herramientas de Desarrollo

\| Herramienta \| Propósito \|

\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| IDE (VS Code u otro) \| Desarrollo y depuración \|

\| Postman \| Testing de APIs \|

\| Git \| Versionamiento \|

\-\--

### 1.6.6 Diferencias vs. versión anterior (actualización Fase 1)

- **Frontend:** Angular 21 LTS + PrimeNG 21 + TypeScript 5.7+ (se descartan referencias a Angular 19/TS 5.6).
- **Backend:** Spring Boot 3.5 + Java 21 + Hibernate 6.7 (se descartan referencias a Spring Boot 3.4/Hibernate 6.6).
- **Pruebas:** H2 en modo compatible Oracle para tests de integración backend.
- **Backend Security:** La autenticación y autorización están **100% integradas en sGED-backend (Java)** mediante Spring Security 6.5 y JJWT 0.12. El sistema utiliza tablas nativas (`usuario`, `cat_rol`, `auth_attempt`, `revoked_token`, `auditoria`) en Oracle 19c para el control de acceso y auditoría.
  
  > [!WARNING]
  > **Descarte de Arquitecturas Legacy:** Las menciones a un servicio "`auth-service`" basado en Python/FastAPI corresponden a borradores iniciales de la Fase 1 que fueron **descartados**. Para efectos de soporte, desarrollo y auditoría, el sistema es un monolito modular Java (Backend) y una SPA Angular (Frontend). No existen otros microservicios activos en el stack de autenticación.



\## 1.7 Resumen Ejecutivo

\| Aspecto \| Valor \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*Proyecto\*\* \| Sistema de Gestión de Expedientes Digitales
(SGED) \|

\| \*\*Cliente\*\* \| Organismo Judicial \|

\| \*\*Fecha inicio\*\* \| 23/01/2026 \|

\| \*\*Fecha entrega\*\* \| 23/04/2026 (90 días) \|

\| \*\*Desarrollador\*\* \| Equipo (Arquitectura + Desarrollo) \|

\| \*\*Frontend\*\* \| Angular 21 LTS + PrimeNG 21 \|

\| \*\*Backend\*\* \| Java 21 + Spring Boot 3.5 \|

\| \*\*Base de datos\*\* \| Oracle \|

\| \*\*Historias de usuario\*\* \| 18 \|

\| \*\*Story points\*\* \| 62 \|

\| \*\*Enfoque\*\* \| Simple, funcional, buenas prácticas \|

\### Funcionalidades Core

\`\`\`

┌─────────────────────────────────────────────────────────────┐

│ SGED v1.0 - ALCANCE │

├─────────────────────────────────────────────────────────────┤

│ │

│ ✅ Autenticación (login, logout, cambio contraseña) │

│ ✅ Expedientes (crear, listar, ver, editar) │

│ ✅ Documentos (cargar, visualizar, descargar, imprimir) │

│ ✅ Visores (PDF, Word→PDF, imágenes) │

│ ✅ Reproductores (audio, video - HTML5 nativo) │

│ ✅ Búsqueda (rápida por número, avanzada con filtros) │

│ ✅ Integración (consulta SGTv1, consulta SGTv2) │

│ ✅ Administración (usuarios, roles, auditoría) │

│ │

└─────────────────────────────────────────────────────────────┘

\`\`\`

**Nota:** en la versión actual `errors[]` es una lista de strings. En fases futuras podría ampliarse a objetos `{field, message}` si se requiere granularidad por campo.

\-\--

## \# SECCIÓN 2: REQUISITOS DEL SISTEMA 

\-\--

\## 2.1 Requisitos Funcionales

\### 2.1.1 RF-001: Gestión de Expedientes Digitales

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-001 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe permitir crear, consultar,
editar y listar expedientes digitales. \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-001.1 \| Crear expediente con número único, tipo, juzgado, fecha,
estado, descripción \|

\| RF-001.2 \| Listar expedientes con paginación y ordenamiento \|

\| RF-001.3 \| Ver detalle completo de un expediente \|

\| RF-001.4 \| Editar información del expediente (excepto número) \|

\*\*Datos del expediente:\*\*

\| Campo \| Tipo \| Obligatorio \|

\|\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Número de expediente \| Texto \| Sí \|

\| Tipo de proceso \| Catálogo \| Sí \|

\| Juzgado \| Catálogo \| Sí \|

\| Fecha de inicio \| Fecha \| Sí \|

\| Estado \| Catálogo \| Sí \|

\| Descripción \| Texto largo \| Sí \|

\| Observaciones \| Texto largo \| No \|

\| Referencia SGT \| Texto \| No \|

\-\--

\### 2.1.2 RF-002: Carga de Archivos con Control de Formatos

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-002 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe permitir cargar archivos
validando formatos y tamaño. \|

\*\*Formatos permitidos:\*\*

\| Categoría \| Extensiones \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Documentos \| .pdf, .doc, .docx \|

\| Imágenes \| .jpg, .jpeg, .png, .gif, .bmp \|

\| Audio \| .mp3, .wav, .ogg \|

\| Video \| .mp4, .webm, .avi, .mov \|

\*\*Restricciones:\*\*

\| Parámetro \| Valor \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| Tamaño máximo por archivo \| 100 MB \|

\| Validación MIME type \| Obligatoria \|

\| Validación extensión \| Obligatoria \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-002.1 \| Cargar archivo individual o múltiple \|

\| RF-002.2 \| Arrastrar y soltar (drag & drop) \|

\| RF-002.3 \| Mostrar progreso de carga \|

\| RF-002.4 \| Validar formato y tamaño \|

\| RF-002.5 \| Registrar metadatos del documento \|

\-\--

\### 2.1.3 RF-003: Visor de Documentos

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-003 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe visualizar documentos PDF,
Word e imágenes en el navegador. \|

\*\*Visor PDF:\*\*

\| Funcionalidad \| Implementación \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Visualizar \| iframe con PDF nativo del navegador \|

\| Navegación \| Controles nativos del navegador \|

\| Zoom \| Controles nativos del navegador \|

\| Descargar \| Botón de descarga \|

\| Imprimir \| Botón que invoca window.print() \|

\*\*Visor Word:\*\*

\| Funcionalidad \| Implementación \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Visualizar \| Conversión a PDF en backend \|

\| Controles \| Mismos que visor PDF \|

\*\*Visor Imágenes:\*\*

\| Funcionalidad \| Implementación \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Visualizar \| Modal con imagen \|

\| Zoom \| CSS transform scale \|

\| Descargar \| Botón de descarga \|

\-\--

\### 2.1.4 RF-004: Reproductor Multimedia

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-004 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe reproducir audio y video en el
navegador. \|

\*\*Reproductor Audio (HTML5 nativo):\*\*

\| Control \| Disponible \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| Play/Pause \| ✅ \|

\| Barra de progreso \| ✅ \|

\| Volumen \| ✅ \|

\| Tiempo actual/total \| ✅ \|

\| Descargar \| ✅ (botón adicional) \|

\*\*Reproductor Video (HTML5 nativo):\*\*

\| Control \| Disponible \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| Play/Pause \| ✅ \|

\| Barra de progreso \| ✅ \|

\| Volumen \| ✅ \|

\| Pantalla completa \| ✅ \|

\| Descargar \| ✅ (botón adicional) \|

\*\*Formatos soportados nativamente:\*\*

\| Tipo \| Formatos nativos \| Formatos con descarga \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Audio \| MP3, WAV, OGG \| Otros \|

\| Video \| MP4, WebM \| AVI, MOV \|

\-\--

\### 2.1.5 RF-005: Búsqueda por Número de Expediente

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-005 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe permitir buscar expedientes
por número de forma rápida. \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-005.1 \| Campo de búsqueda visible en header \|

\| RF-005.2 \| Búsqueda por coincidencia exacta o parcial \|

\| RF-005.3 \| Resultado único → navegar al expediente \|

\| RF-005.4 \| Múltiples resultados → mostrar lista \|

\| RF-005.5 \| Sin resultados → mensaje informativo \|

\-\--

\### 2.1.6 RF-006: Búsqueda Avanzada

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-006 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe permitir buscar expedientes
con múltiples filtros. \|

\*\*Filtros disponibles (5):\*\*

\| Filtro \| Tipo \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| Número de expediente \| Texto (contiene) \|

\| Tipo de proceso \| Selector \|

\| Juzgado \| Selector \|

\| Estado \| Selector \|

\| Fecha de inicio \| Rango (desde-hasta) \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-006.1 \| Combinar filtros (AND) \|

\| RF-006.2 \| Resultados paginados \|

\| RF-006.3 \| Ordenar por columnas \|

\| RF-006.4 \| Limpiar filtros \|

\-\--

\### 2.1.7 RF-007: Integración con SGTv1

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-007 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe consultar información de
expedientes en SGTv1 (solo lectura). \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-007.1 \| Buscar expediente por número en SGTv1 \|

\| RF-007.2 \| Mostrar datos con etiqueta \"Fuente: SGTv1\" \|

\| RF-007.3 \| Vincular expediente SGED con referencia SGTv1 \|

\| RF-007.4 \| Manejar error si SGTv1 no disponible \|

\-\--

\### 2.1.8 RF-008: Integración con SGTv2

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-008 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe consultar información de
expedientes en SGTv2 (solo lectura). \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-008.1 \| Buscar expediente por número en SGTv2 \|

\| RF-008.2 \| Priorizar SGTv2 sobre SGTv1 \|

\| RF-008.3 \| Mostrar datos con etiqueta \"Fuente: SGTv2\" \|

\| RF-008.4 \| Vincular expediente SGED con referencia SGTv2 \|

\| RF-008.5 \| Fallback a SGTv1 si no existe en SGTv2 \|

\-\--

\### 2.1.9 RF-009: Control de Acceso por Roles

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-009 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe implementar autenticación y
autorización por roles. \|

\*\*Autenticación:\*\*

\| Funcionalidad \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Login \| Usuario y contraseña \|

\| Logout \| Cierre de sesión seguro \|

\| Cambio de contraseña \| Usuario puede cambiar su contraseña \|

\| Bloqueo \| Tras 5 intentos fallidos \|

\| Sesión \| JWT con expiración de 8 horas \|

\*\*Roles del sistema:\*\*

\| Rol \| Descripción \|

\|\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| ADMINISTRADOR \| Acceso total \|

\| SECRETARIO \| Gestión completa de expedientes y documentos \|

\| AUXILIAR \| Crear expedientes, cargar documentos, consultar \|

\| CONSULTA \| Solo lectura \|

\*\*Matriz de permisos:\*\*

\| Permiso \| ADMIN \| SECRETARIO \| AUXILIAR \| CONSULTA \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Gestionar usuarios \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Ver auditoría \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Crear expediente \| ✅ \| ✅ \| ✅ \| ❌ \|

\| Editar expediente \| ✅ \| ✅ \| ❌ \| ❌ \|

\| Ver expediente \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Cargar documento \| ✅ \| ✅ \| ✅ \| ❌ \|

\| Eliminar documento \| ✅ \| ✅ \| ❌ \| ❌ \|

\| Ver/descargar documento \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Buscar expedientes \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Consultar SGT \| ✅ \| ✅ \| ✅ \| ✅ \|

\-\--

\### 2.1.10 RF-010: Auditoría de Operaciones

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-010 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe registrar todas las
operaciones para trazabilidad. \|

\*\*Eventos auditados:\*\*

\| Módulo \| Eventos \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Autenticación \| Login exitoso/fallido, Logout, Cambio contraseña,
Bloqueo cuenta \|

\| Expedientes \| Crear, Editar, Consultar \|

\| Documentos \| Cargar, Visualizar, Descargar, Imprimir, Eliminar \|

\| Búsquedas \| Búsqueda rápida, Búsqueda avanzada \|

\| Integración \| Consulta SGTv1, Consulta SGTv2 \|

\| Usuarios \| Crear, Editar, Desactivar, Cambio de rol \|

\*\*Datos del registro:\*\*

\| Campo \| Descripción \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Fecha/Hora \| Timestamp del evento \|

\| Usuario \| Quién realizó la acción \|

\| IP \| Dirección IP \|

\| Acción \| Tipo de operación \|

\| Módulo \| Área del sistema \|

\| Detalle \| Información adicional \|

\| ID Recurso \| Expediente/documento afectado \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-010.1 \| Registro automático de operaciones \|

\| RF-010.2 \| Consulta de logs con filtros \|

\| RF-010.3 \| Logs inmutables (no editables/eliminables) \|

\-\--

\### 2.1.11 RF-011: Impresión de Documentos

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| RF-011 \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Descripción\*\* \| El sistema debe permitir imprimir documentos
desde el visor. \|

\*\*Funcionalidades:\*\*

\| ID \| Funcionalidad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-011.1 \| Botón de impresión en visor PDF \|

\| RF-011.2 \| Botón de impresión en visor de imágenes \|

\| RF-011.3 \| Usar diálogo nativo del navegador \|

\| RF-011.4 \| Registrar impresión en auditoría \|

\-\--

\## 2.2 Requisitos No Funcionales

\### 2.2.1 RNF-001: Rendimiento

\| Métrica \| Objetivo \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Tiempo respuesta API \| \< 2 segundos \|

\| Carga de página \| \< 3 segundos \|

\| Usuarios concurrentes \| 50 mínimo \|

\| Tamaño máximo archivo \| 100 MB \|

\-\--

\### 2.2.2 RNF-002: Seguridad

\| Aspecto \| Requisito \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Comunicación \| HTTPS obligatorio \|

\| Autenticación \| JWT con expiración \|

\| Contraseñas \| Hash BCrypt \|

\| Sesión \| Timeout 8 horas \|

\| Bloqueo \| Tras 5 intentos fallidos \|

\| Auditoría \| Operaciones exitosas registradas; fallos en logs \|

\-\--

\### 2.2.3 RNF-003: Disponibilidad

\| Aspecto \| Requisito \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Horario laboral \| 99% disponibilidad \|

\| Mantenimiento \| Fuera de horario laboral \|

\-\--

\### 2.2.4 RNF-004: Compatibilidad

\| Navegador \| Versión \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Chrome \| 120+ \|

\| Edge \| 120+ \|

\| Firefox \| 120+ \|

\-\--

\### 2.2.5 RNF-005: Mantenibilidad

\| Aspecto \| Requisito \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Arquitectura \| Separación clara de capas \|

\| Código \| Comentarios en funciones principales \|

\| Configuración \| Externalizada (no hardcoded) \|

\-\--

\### 2.2.6 RNF-006: Usabilidad

\| Aspecto \| Requisito \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Curva aprendizaje \| Productivo en 2 horas \|

\| Mensajes de error \| Claros y en español \|

\| Feedback visual \| Indicadores de carga \|

\| Navegación \| Máximo 3 clics a funciones principales \|

\-\--

\## 2.3 Matriz de Trazabilidad

\### 2.3.1 Requisitos vs Historias de Usuario

\| Requisito \| Historias de Usuario \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| RF-001: Gestión Expedientes \| HU-004, HU-005, HU-006, HU-007 \|

\| RF-002: Carga Archivos \| HU-008 \|

\| RF-003: Visor Documentos \| HU-009 \|

\| RF-004: Reproductor Multimedia \| HU-010 \|

\| RF-005: Búsqueda Rápida \| HU-012 \|

\| RF-006: Búsqueda Avanzada \| HU-013 \|

\| RF-007: Integración SGTv1 \| HU-014 \|

\| RF-008: Integración SGTv2 \| HU-015 \|

\| RF-009: Control de Acceso \| HU-001, HU-002, HU-003, HU-016, HU-017
\|

\| RF-010: Auditoría \| HU-018 \|

\| RF-011: Impresión \| HU-011 \|

\### 2.3.2 Cobertura de Requisitos

\`\`\`

REQUISITOS FUNCIONALES: 11 requisitos

HISTORIAS DE USUARIO: 18 historias

COBERTURA: 100%

Todos los requisitos están cubiertos por al menos una historia de
usuario.

\`\`\`

\### 2.3.3 Requisitos vs Entregables

\| Entregable \| Día \| Requisitos \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| Plan de trabajo \| 15 \| Documentación de todos los requisitos \|

\| Arquitectura y prototipos \| 35 \| Diseño para cumplir RF y RNF \|

\| Código + pruebas \| 65 \| Implementación de RF-001 a RF-011 \|

\| Pruebas UAT \| 75 \| Validación de todos los RF \|

\| Despliegue \| 90 \| Sistema en producción con todos los RF \|

\-\--

\## 2.4 Resumen de Requisitos

\### Requisitos Funcionales

\| ID \| Requisito \| Prioridad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| RF-001 \| Gestión de Expedientes \| Alta \|

\| RF-002 \| Carga de Archivos \| Alta \|

\| RF-003 \| Visor de Documentos \| Alta \|

\| RF-004 \| Reproductor Multimedia \| Alta \|

\| RF-005 \| Búsqueda Rápida \| Alta \|

\| RF-006 \| Búsqueda Avanzada \| Alta \|

\| RF-007 \| Integración SGTv1 \| Alta \|

\| RF-008 \| Integración SGTv2 \| Alta \|

\| RF-009 \| Control de Acceso \| Alta \|

\| RF-010 \| Auditoría \| Alta \|

\| RF-011 \| Impresión \| Alta \|

\### Requisitos No Funcionales

\| ID \| Requisito \| Prioridad \|

\|\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| RNF-001 \| Rendimiento \| Alta \|

\| RNF-002 \| Seguridad \| Alta \|

\| RNF-003 \| Disponibilidad \| Alta \|

\| RNF-004 \| Compatibilidad \| Alta \|

\| RNF-005 \| Mantenibilidad \| Media \|

\| RNF-006 \| Usabilidad \| Media \|

\### Totales

\| Categoría \| Cantidad \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Requisitos Funcionales \| 11 \|

\| Requisitos No Funcionales \| 6 \|

\| Historias de Usuario \| 18 \|

\| Story Points \| 62 \|

\| Roles del Sistema \| 4 \|

\| Formatos Multimedia \| 12 \|

\-\--

## \# SECCIÓN 3: HISTORIAS DE USUARIO 

\-\--

\## 3.1 Épica: Autenticación

\### 3.1.1 HU-001: Inicio de Sesión

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-001 \|

\| \*\*Título\*\* \| Inicio de Sesión \|

\| \*\*Épica\*\* \| Autenticación \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 3 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*iniciar sesión con mi
usuario y contraseña\*\*, para \*\*acceder al sistema según mis
permisos\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en la página de login \| Ingreso credenciales válidas y
presiono \"Iniciar Sesión\" \| El sistema me redirige al dashboard \|

\| 2 \| Estoy en la página de login \| Ingreso credenciales inválidas \|
El sistema muestra \"Usuario o contraseña incorrectos\" \|

\| 3 \| Estoy en la página de login \| Dejo campos vacíos e intento
ingresar \| El sistema muestra validación de campos requeridos \|

\| 4 \| Mi cuenta está bloqueada \| Intento iniciar sesión \| El sistema
muestra \"Cuenta bloqueada, contacte al administrador\" \|

\| 5 \| Ingreso credenciales incorrectas 5 veces \| Intento una vez más
\| El sistema bloquea mi cuenta \|

\*\*Notas técnicas:\*\*

\- Autenticación con JWT

\- Token expira en 8 horas

\- Registro en auditoría: login exitoso/fallido con IP y timestamp

\-\--

\### 3.1.2 HU-002: Cierre de Sesión

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-002 \|

\| \*\*Título\*\* \| Cierre de Sesión \|

\| \*\*Épica\*\* \| Autenticación \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 1 punto \|

\*\*Historia:\*\*

\> Como \*\*usuario autenticado\*\*, quiero \*\*cerrar mi sesión\*\*,
para \*\*proteger mi cuenta al terminar de trabajar\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy autenticado en el sistema \| Hago clic en \"Cerrar
Sesión\" \| El sistema invalida mi token y me redirige al login \|

\| 2 \| He cerrado sesión \| Intento acceder a una página protegida \|
El sistema me redirige al login \|

\| 3 \| He cerrado sesión \| Presiono el botón \"Atrás\" del navegador
\| No puedo ver contenido protegido \|

\*\*Notas técnicas:\*\*

\- Limpiar token de sessionStorage

\- Invalidar token en backend (blacklist simple)

\- Registro en auditoría

\-\--

\### 3.1.3 HU-003: Cambio de Contraseña

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-003 \|

\| \*\*Título\*\* \| Cambio de Contraseña \|

\| \*\*Épica\*\* \| Autenticación \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 2 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario autenticado\*\*, quiero \*\*cambiar mi
contraseña\*\*, para \*\*mantener la seguridad de mi cuenta\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en la página de cambio de contraseña \| Ingreso contraseña
actual correcta y nueva contraseña válida \| El sistema actualiza mi
contraseña y muestra confirmación \|

\| 2 \| Estoy en la página de cambio de contraseña \| Ingreso contraseña
actual incorrecta \| El sistema muestra \"Contraseña actual incorrecta\"
\|

\| 3 \| Estoy en la página de cambio de contraseña \| La nueva
contraseña no cumple requisitos \| El sistema muestra los requisitos
faltantes \|

\| 4 \| Estoy en la página de cambio de contraseña \| Nueva contraseña y
confirmación no coinciden \| El sistema muestra \"Las contraseñas no
coinciden\" \|

\*\*Requisitos de contraseña:\*\*

\- Mínimo 8 caracteres

\- Al menos 1 mayúscula

\- Al menos 1 minúscula

\- Al menos 1 número

\*\*Notas técnicas:\*\*

\- Hash con BCrypt

\- Registro en auditoría (sin exponer contraseñas)

\-\--

\## 3.2 Épica: Gestión de Expedientes

\### 3.2.1 HU-004: Crear Expediente

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-004 \|

\| \*\*Título\*\* \| Crear Expediente \|

\| \*\*Épica\*\* \| Gestión de Expedientes \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 4 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario con permiso de creación\*\*, quiero \*\*crear un
nuevo expediente digital\*\*, para \*\*organizar documentos de un
caso\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Tengo permiso de creación \| Completo el formulario con datos
válidos y guardo \| El sistema crea el expediente y me redirige a su
detalle \|

\| 2 \| Tengo permiso de creación \| Ingreso un número de expediente que
ya existe \| El sistema muestra \"El número de expediente ya existe\" \|

\| 3 \| Tengo permiso de creación \| Dejo campos obligatorios vacíos \|
El sistema marca los campos faltantes \|

\| 4 \| No tengo permiso de creación \| Intento acceder a crear
expediente \| El sistema muestra \"Acceso denegado\" \|

\*\*Campos del formulario:\*\*

\| Campo \| Tipo \| Obligatorio \|

\|\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Número de expediente \| Texto \| Sí \|

\| Tipo de proceso \| Selector \| Sí \|

\| Juzgado \| Selector \| Sí \|

\| Fecha de inicio \| Fecha \| Sí \|

\| Estado \| Selector \| Sí (default: Activo) \|

\| Descripción \| Texto área \| Sí \|

\| Observaciones \| Texto área \| No \|

\*\*Notas técnicas:\*\*

\- Registro en auditoría con todos los datos creados

\-\--

\### 3.2.2 HU-005: Listar Expedientes

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-005 \|

\| \*\*Título\*\* \| Listar Expedientes \|

\| \*\*Épica\*\* \| Gestión de Expedientes \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 4 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*ver un listado de
expedientes\*\*, para \*\*acceder a los casos disponibles\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Soy usuario autenticado \| Accedo al módulo de expedientes \|
Veo una tabla con los expedientes según mis permisos \|

\| 2 \| Hay más de 10 expedientes \| Navego por la tabla \| Puedo
paginar entre resultados (10, 25, 50 por página) \|

\| 3 \| Veo la tabla de expedientes \| Hago clic en el encabezado de una
columna \| La tabla se ordena por esa columna \|

\| 4 \| Veo la tabla de expedientes \| Hago clic en un expediente \|
Navego al detalle del expediente \|

\| 5 \| Soy administrador \| Accedo al listado \| Veo todos los
expedientes del sistema \|

\| 6 \| Soy usuario regular \| Accedo al listado \| Veo solo expedientes
de mi juzgado \|

\*\*Columnas de la tabla:\*\*

\| Columna \| Ordenable \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Número de expediente \| Sí \|

\| Tipo de proceso \| Sí \|

\| Juzgado \| Sí \|

\| Fecha de inicio \| Sí \|

\| Estado \| Sí \|

\| Acciones (Ver, Editar) \| No \|

\-\--

\### 3.2.3 HU-006: Ver Detalle de Expediente

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-006 \|

\| \*\*Título\*\* \| Ver Detalle de Expediente \|

\| \*\*Épica\*\* \| Gestión de Expedientes \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 3 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*ver el detalle completo
de un expediente\*\*, para \*\*consultar su información y
documentos\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Tengo acceso al expediente \| Abro el detalle \| Veo toda la
información del expediente \|

\| 2 \| El expediente tiene documentos \| Abro el detalle \| Veo la
lista de documentos adjuntos \|

\| 3 \| El expediente está vinculado a SGT \| Abro el detalle \| Veo la
referencia al sistema SGT \|

\| 4 \| No tengo acceso al expediente \| Intento ver el detalle \| El
sistema muestra \"Acceso denegado\" \|

\*\*Información mostrada:\*\*

\- Datos generales del expediente

\- Lista de documentos con acciones (ver, descargar, eliminar)

\- Referencia SGT (si existe)

\- Botón \"Editar\" (si tiene permiso)

\- Botón \"Cargar documento\" (si tiene permiso)

\*\*Notas técnicas:\*\*

\- Registro en auditoría: consulta de expediente

\-\--

\### 3.2.4 HU-007: Editar Expediente

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-007 \|

\| \*\*Título\*\* \| Editar Expediente \|

\| \*\*Épica\*\* \| Gestión de Expedientes \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 2 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario con permiso de edición\*\*, quiero \*\*editar la
información de un expediente\*\*, para \*\*mantener los datos
actualizados\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Tengo permiso de edición \| Modifico datos y guardo \| El
sistema actualiza el expediente y muestra confirmación \|

\| 2 \| Tengo permiso de edición \| Intento cambiar el número de
expediente \| El campo está deshabilitado (no editable) \|

\| 3 \| No tengo permiso de edición \| Intento editar \| No veo el botón
\"Editar\" \|

\*\*Notas técnicas:\*\*

\- Registro en auditoría: valores anteriores y nuevos

\- El número de expediente nunca es editable

\-\--

\## 3.3 Épica: Gestión Documental

\### 3.3.1 HU-008: Cargar Documentos

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-008 \|

\| \*\*Título\*\* \| Cargar Documentos \|

\| \*\*Épica\*\* \| Gestión Documental \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 5 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario con permiso\*\*, quiero \*\*cargar documentos a un
expediente\*\*, para \*\*adjuntar archivos digitales al caso\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en el detalle del expediente \| Selecciono un archivo
válido y cargo \| El documento se sube y aparece en la lista \|

\| 2 \| Estoy cargando un archivo \| El archivo es de formato no
permitido \| El sistema muestra \"Formato no permitido\" \|

\| 3 \| Estoy cargando un archivo \| El archivo excede 100 MB \| El
sistema muestra \"El archivo excede el tamaño máximo\" \|

\| 4 \| Estoy cargando un archivo \| La carga está en progreso \| Veo
una barra de progreso \|

\| 5 \| Estoy en el detalle del expediente \| Arrastro un archivo al
área de carga \| El archivo se carga (drag & drop) \|

\*\*Formatos permitidos:\*\*

\| Categoría \| Extensiones \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Documentos \| .pdf, .doc, .docx \|

\| Imágenes \| .jpg, .jpeg, .png, .gif, .bmp \|

\| Audio \| .mp3, .wav, .ogg \|

\| Video \| .mp4, .webm, .avi, .mov \|

\*\*Restricciones:\*\*

\- Tamaño máximo por archivo: 100 MB

\- Validación de extensión y MIME type

\*\*Notas técnicas:\*\*

\- Almacenamiento en sistema de archivos

\- Nombre de archivo: UUID + extensión original

\- Registro en auditoría

\-\--

\### 3.3.2 HU-009: Visor Multimedia (PDF/Word/Imágenes)

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-009 \|

\| \*\*Título\*\* \| Visor Multimedia (PDF/Word/Imágenes) \|

\| \*\*Épica\*\* \| Gestión Documental \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 5 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*visualizar documentos
PDF, Word e imágenes en el navegador\*\*, para \*\*revisar contenido sin
descargar\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Hay un documento PDF en el expediente \| Hago clic en \"Ver\" \|
El PDF se muestra en un visor dentro del navegador \|

\| 2 \| Hay un documento Word en el expediente \| Hago clic en \"Ver\"
\| El sistema convierte a PDF y lo muestra en el visor \|

\| 3 \| Hay una imagen en el expediente \| Hago clic en \"Ver\" \| La
imagen se muestra en un modal con zoom \|

\| 4 \| Estoy viendo un PDF \| Uso los controles de navegación \| Puedo
ir a página anterior/siguiente y hacer zoom \|

\| 5 \| Estoy viendo cualquier documento \| Hago clic en \"Descargar\"
\| El archivo original se descarga \|

\*\*Funcionalidades del visor PDF:\*\*

\- Navegación de páginas (anterior, siguiente, ir a página)

\- Zoom (acercar, alejar, ajustar a ventana)

\- Descargar archivo original

\- Imprimir

\*\*Funcionalidades del visor de imágenes:\*\*

\- Zoom (acercar, alejar)

\- Ajustar a ventana

\- Descargar

\*\*Notas técnicas:\*\*

\- PDF: usar \`\<iframe\>\` con PDF nativo del navegador o pdf.js básico

\- Word: conversión a PDF en backend con LibreOffice headless

\- Imágenes: modal simple con \`\<img\>\` y controles de zoom CSS

\- Registro en auditoría: visualización de documento

\-\--

\### 3.3.3 HU-010: Reproductor Audio/Video

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-010 \|

\| \*\*Título\*\* \| Reproductor Audio/Video \|

\| \*\*Épica\*\* \| Gestión Documental \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 4 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*reproducir archivos de
audio y video en el navegador\*\*, para \*\*revisar grabaciones sin
descargar\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Hay un archivo de audio en el expediente \| Hago clic en \"Ver\"
\| Se muestra un reproductor de audio \|

\| 2 \| Hay un archivo de video en el expediente \| Hago clic en \"Ver\"
\| Se muestra un reproductor de video \|

\| 3 \| Estoy reproduciendo audio/video \| Uso los controles \| Puedo
play, pause, avanzar, retroceder, ajustar volumen \|

\| 4 \| Estoy viendo un video \| Hago clic en pantalla completa \| El
video se muestra en fullscreen \|

\| 5 \| El formato no es soportado nativamente \| Intento reproducir \|
El sistema ofrece descarga del archivo \|

\*\*Controles del reproductor:\*\*

\- Play/Pause

\- Barra de progreso (navegable)

\- Volumen

\- Tiempo actual / Duración total

\- Pantalla completa (solo video)

\- Descargar

\*\*Notas técnicas:\*\*

\- Usar HTML5 \`\<audio\>\` y \`\<video\>\` nativos

\- Formatos nativos del navegador: MP3, WAV, OGG, MP4, WebM

\- Formatos no nativos (AVI, MOV): ofrecer descarga

\- Registro en auditoría: reproducción de multimedia

\-\--

\### 3.3.4 HU-011: Descargar e Imprimir Documento

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-011 \|

\| \*\*Título\*\* \| Descargar e Imprimir Documento \|

\| \*\*Épica\*\* \| Gestión Documental \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 2 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*descargar e imprimir
documentos\*\*, para \*\*trabajar con copias físicas o locales\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy viendo un documento \| Hago clic en \"Descargar\" \| El
archivo se descarga a mi equipo \|

\| 2 \| Estoy viendo un PDF o imagen \| Hago clic en \"Imprimir\" \| Se
abre el diálogo de impresión del navegador \|

\| 3 \| Descargo un documento \| Reviso el archivo \| El archivo es el
original sin modificaciones \|

\*\*Notas técnicas:\*\*

\- Descarga: streaming del archivo desde el backend

\- Impresión: usar \`window.print()\` del navegador

\- Registro en auditoría: cada descarga e impresión

\-\--

\## 3.4 Épica: Búsqueda

\### 3.4.1 HU-012: Búsqueda Rápida por Número

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-012 \|

\| \*\*Título\*\* \| Búsqueda Rápida por Número \|

\| \*\*Épica\*\* \| Búsqueda \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 3 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*buscar un expediente por
su número\*\*, para \*\*acceder rápidamente a un caso específico\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en cualquier página del sistema \| Ingreso un número en el
buscador del header y presiono Enter \| El sistema busca el expediente
\|

\| 2 \| El número coincide con un expediente \| Ejecuto la búsqueda \|
El sistema me redirige al detalle del expediente \|

\| 3 \| El número coincide parcialmente con varios \| Ejecuto la
búsqueda \| El sistema muestra lista de resultados \|

\| 4 \| No hay coincidencias \| Ejecuto la búsqueda \| El sistema
muestra \"No se encontraron resultados\" \|

\| 5 \| Tengo acceso limitado \| Busco un expediente de otro juzgado \|
No aparece en resultados \|

\*\*Notas técnicas:\*\*

\- Campo de búsqueda visible en el header (siempre accesible)

\- Búsqueda por coincidencia exacta y parcial (LIKE)

\- Respetar permisos del usuario

\- Registro en auditoría

\-\--

\### 3.4.2 HU-013: Búsqueda Avanzada

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-013 \|

\| \*\*Título\*\* \| Búsqueda Avanzada \|

\| \*\*Épica\*\* \| Búsqueda \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 5 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*buscar expedientes con
múltiples filtros\*\*, para \*\*encontrar casos según criterios
específicos\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en búsqueda avanzada \| Aplico uno o más filtros y busco
\| El sistema muestra expedientes que coinciden con todos los filtros \|

\| 2 \| Los resultados superan una página \| Navego por resultados \|
Puedo paginar correctamente \|

\| 3 \| Tengo filtros aplicados \| Hago clic en \"Limpiar filtros\" \|
Todos los filtros se resetean \|

\| 4 \| Veo resultados \| Hago clic en un expediente \| Navego al
detalle del expediente \|

\| 5 \| No hay resultados \| Ejecuto búsqueda \| El sistema muestra \"No
se encontraron resultados\" \|

\*\*Filtros disponibles (5 esenciales):\*\*

\| Filtro \| Tipo \| Descripción \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Número de expediente \| Texto \| Búsqueda parcial (contiene) \|

\| Tipo de proceso \| Selector \| Selección única \|

\| Juzgado \| Selector \| Selección única \|

\| Estado \| Selector \| Selección única \|

\| Fecha de inicio \| Rango \| Desde - Hasta \|

\*\*Notas técnicas:\*\*

\- Filtros combinados con AND

\- Resultados paginados (10, 25, 50)

\- Ordenamiento por columnas

\- Respetar permisos del usuario

\- Registro en auditoría

\-\--

\## 3.5 Épica: Integración SGT

\### 3.5.1 HU-014: Consultar SGTv1

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-014 \|

\| \*\*Título\*\* \| Consultar SGTv1 \|

\| \*\*Épica\*\* \| Integración SGT \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 4 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*consultar información de
expedientes en SGTv1\*\*, para \*\*ver datos históricos del sistema
legado\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en el detalle de un expediente \| Hago clic en \"Consultar
en SGT\" e ingreso un número \| El sistema busca en SGTv1 \|

\| 2 \| El expediente existe en SGTv1 \| Veo los resultados \| Se
muestran los datos con etiqueta \"Fuente: SGTv1\" \|

\| 3 \| El expediente no existe en SGTv1 \| Veo los resultados \| El
sistema muestra \"No encontrado en SGTv1\" \|

\| 4 \| SGTv1 no está disponible \| Intento consultar \| El sistema
muestra \"Sistema SGTv1 no disponible\" \|

\| 5 \| Encuentro datos en SGTv1 \| Hago clic en \"Vincular\" \| El
expediente SGED queda vinculado a la referencia SGTv1 \|

\*\*Datos mostrados de SGTv1:\*\*

\- Número de expediente

\- Tipo de proceso

\- Juzgado

\- Estado

\- Fecha de ingreso

\*\*Notas técnicas:\*\*

\- Conexión read-only a base de datos Oracle SGTv1

\- Timeout de conexión: 5 segundos

\- Cache de consultas: 5 minutos

\- Registro en auditoría

\-\--

\### 3.5.2 HU-015: Consultar SGTv2

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-015 \|

\| \*\*Título\*\* \| Consultar SGTv2 \|

\| \*\*Épica\*\* \| Integración SGT \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 4 puntos \|

\*\*Historia:\*\*

\> Como \*\*usuario del sistema\*\*, quiero \*\*consultar información de
expedientes en SGTv2\*\*, para \*\*ver datos actuales del sistema de
gestión\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy en el detalle de un expediente \| Hago clic en \"Consultar
en SGT\" e ingreso un número \| El sistema busca primero en SGTv2 \|

\| 2 \| El expediente existe en SGTv2 \| Veo los resultados \| Se
muestran los datos con etiqueta \"Fuente: SGTv2\" \|

\| 3 \| El expediente no existe en SGTv2 pero sí en SGTv1 \| Veo los
resultados \| El sistema muestra datos de SGTv1 como alternativa \|

\| 4 \| Encuentro datos en SGTv2 \| Hago clic en \"Vincular\" \| El
expediente SGED queda vinculado a la referencia SGTv2 \|

\*\*Notas técnicas:\*\*

\- Prioridad: SGTv2 sobre SGTv1

\- Misma estructura de conexión que SGTv1

\- Registro en auditoría

\-\--

\## 3.6 Épica: Administración

\### 3.6.1 HU-016: Gestión de Usuarios

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-016 \|

\| \*\*Título\*\* \| Gestión de Usuarios \|

\| \*\*Épica\*\* \| Administración \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 5 puntos \|

\*\*Historia:\*\*

\> Como \*\*administrador\*\*, quiero \*\*gestionar los usuarios del
sistema\*\*, para \*\*controlar el acceso al sistema\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Soy administrador \| Accedo a gestión de usuarios \| Veo listado
de todos los usuarios \|

\| 2 \| Soy administrador \| Creo un nuevo usuario con datos válidos \|
El usuario se crea con contraseña temporal \|

\| 3 \| Soy administrador \| Edito un usuario existente \| Los cambios
se guardan correctamente \|

\| 4 \| Soy administrador \| Desactivo un usuario \| El usuario no puede
iniciar sesión \|

\| 5 \| Soy administrador \| Desbloqueo un usuario bloqueado \| El
usuario puede intentar iniciar sesión nuevamente \|

\| 6 \| No soy administrador \| Intento acceder a gestión de usuarios \|
El sistema muestra \"Acceso denegado\" \|

\*\*Campos del usuario:\*\*

\| Campo \| Tipo \| Obligatorio \|

\|\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Nombre de usuario \| Texto \| Sí \|

\| Nombre completo \| Texto \| Sí \|

\| Correo electrónico \| Email \| Sí \|

\| Rol \| Selector \| Sí \|

\| Juzgado asignado \| Selector \| Sí \|

\| Estado \| Activo/Inactivo \| Sí \|

\*\*Notas técnicas:\*\*

\- Contraseña temporal generada automáticamente al crear usuario

\- El usuario debe cambiar contraseña en primer login

\- Registro en auditoría de todas las operaciones

\-\--

\### 3.6.2 HU-017: Asignación de Roles

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-017 \|

\| \*\*Título\*\* \| Asignación de Roles \|

\| \*\*Épica\*\* \| Administración \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 2 puntos \|

\*\*Historia:\*\*

\> Como \*\*administrador\*\*, quiero \*\*asignar roles a los
usuarios\*\*, para \*\*definir sus permisos en el sistema\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Estoy editando un usuario \| Cambio su rol \| El usuario
adquiere los permisos del nuevo rol \|

\| 2 \| Un usuario tiene rol cambiado \| El usuario inicia sesión \| Sus
permisos reflejan el nuevo rol \|

\*\*Roles del sistema (predefinidos):\*\*

\| Rol \| Permisos \|

\|\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| \*\*ADMINISTRADOR\*\* \| Todo: usuarios, expedientes, documentos,
auditoría \|

\| \*\*SECRETARIO\*\* \| Crear/editar expedientes, cargar/eliminar
documentos, búsquedas \|

\| \*\*AUXILIAR\*\* \| Crear expedientes, cargar documentos, búsquedas
\|

\| \*\*CONSULTA\*\* \| Solo visualizar expedientes y documentos,
búsquedas \|

\*\*Matriz de permisos simplificada:\*\*

\| Permiso \| ADMIN \| SECRETARIO \| AUXILIAR \| CONSULTA \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Gestionar usuarios \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Ver auditoría \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Crear expediente \| ✅ \| ✅ \| ✅ \| ❌ \|

\| Editar expediente \| ✅ \| ✅ \| ❌ \| ❌ \|

\| Ver expediente \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Cargar documento \| ✅ \| ✅ \| ✅ \| ❌ \|

\| Eliminar documento \| ✅ \| ✅ \| ❌ \| ❌ \|

\| Ver documento \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Buscar expedientes \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Consultar SGT \| ✅ \| ✅ \| ✅ \| ✅ \|

\*\*Notas técnicas:\*\*

\- Roles fijos, no editables en v1.0

\- Registro en auditoría de cambios de rol

\-\--

\### 3.6.3 HU-018: Consulta de Auditoría

\| Atributo \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*ID\*\* \| HU-018 \|

\| \*\*Título\*\* \| Consulta de Auditoría \|

\| \*\*Épica\*\* \| Administración \|

\| \*\*Prioridad\*\* \| Alta \|

\| \*\*Estimación\*\* \| 4 puntos \|

\*\*Historia:\*\*

\> Como \*\*administrador\*\*, quiero \*\*consultar los logs de
auditoría\*\*, para \*\*revisar las acciones realizadas en el
sistema\*\*.

\*\*Criterios de Aceptación:\*\*

\| \# \| Dado \| Cuando \| Entonces \|

\|\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Soy administrador \| Accedo a la sección de auditoría \| Veo
listado de logs paginado \|

\| 2 \| Veo los logs \| Aplico filtros (fecha, usuario, acción) \| Los
resultados se filtran correctamente \|

\| 3 \| Veo un log \| Hago clic en ver detalle \| Veo toda la
información del evento \|

\| 4 \| No soy administrador \| Intento acceder a auditoría \| El
sistema muestra \"Acceso denegado\" \|

\*\*Filtros disponibles:\*\*

\| Filtro \| Tipo \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| Rango de fechas \| Fecha desde - hasta \|

\| Usuario \| Selector \|

\| Tipo de acción \| Selector \|

\*\*Tipos de acción auditados:\*\*

\| Módulo \| Acciones \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Autenticación \| LOGIN_EXITOSO, LOGIN_FALLIDO, LOGOUT,
CAMBIO_PASSWORD, CUENTA_BLOQUEADA \|

\| Expedientes \| EXPEDIENTE_CREADO, EXPEDIENTE_EDITADO,
EXPEDIENTE_CONSULTADO \|

\| Documentos \| DOCUMENTO_CARGADO, DOCUMENTO_VISUALIZADO,
DOCUMENTO_DESCARGADO, DOCUMENTO_IMPRESO, DOCUMENTO_ELIMINADO \|

\| Búsquedas \| BUSQUEDA_REALIZADA \|

\| Integración \| SGT_CONSULTADO \|

\| Usuarios \| USUARIO_CREADO, USUARIO_EDITADO, USUARIO_DESACTIVADO,
ROL_CAMBIADO \|

\*\*Datos de cada log:\*\*

\| Campo \| Descripción \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Fecha/Hora \| Timestamp del evento \|

\| Usuario \| Nombre del usuario que realizó la acción \|

\| IP \| Dirección IP del usuario \|

\| Acción \| Tipo de acción realizada \|

\| Módulo \| Módulo donde ocurrió \|

\| Detalle \| Descripción o datos adicionales \|

\| ID Recurso \| ID del expediente/documento afectado \|

\*\*Notas técnicas:\*\*

\- Logs inmutables (no se pueden editar ni eliminar)

\- Paginación obligatoria (mucha data)

\- Sin exportación en v1.0 (simplificación)

\-\--

\## 3.7 Resumen de Historias de Usuario

\### Tabla Resumen

\| Épica \| ID \| Historia \| Puntos \| Prioridad \|

\|\-\-\-\-\-\--\|\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Autenticación \| HU-001 \| Inicio de Sesión \| 3 \| Alta \|

\| Autenticación \| HU-002 \| Cierre de Sesión \| 1 \| Alta \|

\| Autenticación \| HU-003 \| Cambio de Contraseña \| 2 \| Alta \|

\| Expedientes \| HU-004 \| Crear Expediente \| 4 \| Alta \|

\| Expedientes \| HU-005 \| Listar Expedientes \| 4 \| Alta \|

\| Expedientes \| HU-006 \| Ver Detalle Expediente \| 3 \| Alta \|

\| Expedientes \| HU-007 \| Editar Expediente \| 2 \| Alta \|

\| Documentos \| HU-008 \| Cargar Documentos \| 5 \| Alta \|

\| Documentos \| HU-009 \| Visor PDF/Word/Imágenes \| 5 \| Alta \|

\| Documentos \| HU-010 \| Reproductor Audio/Video \| 4 \| Alta \|

\| Documentos \| HU-011 \| Descargar e Imprimir \| 2 \| Alta \|

\| Búsqueda \| HU-012 \| Búsqueda Rápida \| 3 \| Alta \|

\| Búsqueda \| HU-013 \| Búsqueda Avanzada \| 5 \| Alta \|

\| Integración \| HU-014 \| Consultar SGTv1 \| 4 \| Alta \|

\| Integración \| HU-015 \| Consultar SGTv2 \| 4 \| Alta \|

\| Administración \| HU-016 \| Gestión de Usuarios \| 5 \| Alta \|

\| Administración \| HU-017 \| Asignación de Roles \| 2 \| Alta \|

\| Administración \| HU-018 \| Consulta de Auditoría \| 4 \| Alta \|

\| \| \| \*\*TOTAL\*\* \| \*\*62\*\* \| \|

\-\--

\### Distribución por Épica

\| Épica \| Historias \| Puntos \| % del Total \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Autenticación \| 3 \| 6 \| 10% \|

\| Gestión de Expedientes \| 4 \| 13 \| 21% \|

\| Gestión Documental \| 4 \| 16 \| 26% \|

\| Búsqueda \| 2 \| 8 \| 13% \|

\| Integración SGT \| 2 \| 8 \| 13% \|

\| Administración \| 3 \| 11 \| 18% \|

\| \*\*TOTAL\*\* \| \*\*18\*\* \| \*\*62\*\* \| \*\*100%\*\* \|

\-\--

\### Estimación de Tiempo

\`\`\`

CÁLCULO:

Total de puntos: 62

Productividad estimada: ~3-4 puntos/día por desarrollador

Días de desarrollo disponibles: 22 días laborales

Estimación optimista: 62 ÷ 4 = 15.5 días ✅

Estimación realista: 62 ÷ 3 = 20.7 días ✅

Estimación pesimista: 62 ÷ 2.5 = 24.8 días ⚠️

CONCLUSIÓN: Viable con margen en escenario realista

\`\`\`

\*\*Response prohibido (403):\*\* Acción no permitida o expediente de otro juzgado.
\*\*Response no encontrado (404):\*\* ID inexistente. No genera auditoría (solo logging).

\-\--

\### Definition of Done (DoD)

Una historia se considera \*\*COMPLETADA\*\* cuando:

\| \# \| Criterio \|

\|\-\--\|\-\-\-\-\-\-\-\-\--\|

\| 1 \| Código implementado (frontend + backend) \|

\| 2 \| Funcionalidad probada manualmente \|

\| 3 \| Criterios de aceptación verificados \|

\| 4 \| Sin errores críticos \|

\| 5 \| Auditoría funcionando para la operación \|

\| 6 \| Código con comentarios básicos \|

\-\--

\### Orden de Implementación Sugerido

\| Fase \| Historias \| Puntos \| Razón \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*1. Base\*\* \| HU-001, HU-002, HU-003 \| 6 \| Autenticación es
prerequisito \|

\| \*\*2. Core\*\* \| HU-004, HU-005, HU-006, HU-007 \| 13 \|
Expedientes son el núcleo \|

\| \*\*3. Documentos\*\* \| HU-008, HU-009, HU-010, HU-011 \| 16 \|
Gestión documental \|

\| \*\*4. Búsqueda\*\* \| HU-012, HU-013 \| 8 \| Búsqueda de expedientes
\|

\| \*\*5. Integración\*\* \| HU-014, HU-015 \| 8 \| Conexión con SGT \|

\| \*\*6. Admin\*\* \| HU-016, HU-017, HU-018 \| 11 \| Administración al
final \|

------------------------------------------------------------------------

## \# SECCIÓN 4: ARQUITECTURA DEL SISTEMA

\-\--

\## 4.1 Visión General

\### 4.1.1 Diagrama de Arquitectura de Alto Nivel

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ CLIENTE (Navegador) │

│ │

│
┌───────────────────────────────────────────────────────────────────────┐
│

│ │ ANGULAR 21 LTS (SPA) │ │

│ │ │ │

│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │

│ │ │ Auth │ │Expediente│ │Documento │ │ Búsqueda │ │ Admin │ │ │

│ │ │ Module │ │ Module │ │ Module │ │ Module │ │ Module │ │ │

│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │

│ │ │ │

│ │ ┌─────────────────────────────────────────────────────────────────┐
│ │

│ │ │ Core (HTTP, Auth, Guards) │ │ │

│ │ └─────────────────────────────────────────────────────────────────┘
│ │

│
└───────────────────────────────────────────────────────────────────────┘
│

└─────────────────────────────────────────────────────────────────────────────┘

│

│ HTTPS (REST API)

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ SERVIDOR │

│ │

│
┌───────────────────────────────────────────────────────────────────────┐
│

│ │ SPRING BOOT 3.5 (API REST) │ │

│ │ │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ CONTROLLERS │ │ │

│ │ │ Auth │ Expediente │ Documento │ Búsqueda │ SGT │ Admin │ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│ │ │ │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ SERVICES │ │ │

│ │ │ AuthService │ ExpedienteService │ DocumentoService │ \... │ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│ │ │ │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ REPOSITORIES │ │ │

│ │ │ UsuarioRepo │ ExpedienteRepo │ DocumentoRepo │ AuditoriaRepo│ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│
└───────────────────────────────────────────────────────────────────────┘
│

│ │ │

└──────────────────────────────────────┼──────────────────────────────────────┘

│

┌─────────────────────┼─────────────────────┐

│ │ │

▼ ▼ ▼

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐

│ ORACLE (SGED) │ │ ORACLE (SGTv1) │ │ ORACLE (SGTv2) │

│ │ │ │ │ │

│ - Usuarios │ │ - Expedientes │ │ - Expedientes │

│ - Expedientes │ │ (históricos) │ │ (actuales) │

│ - Documentos │ │ │ │ │

│ - Auditoría │ │ \[SOLO LECTURA\] │ │ \[SOLO LECTURA\] │

│ - Catálogos │ │ │ │ │

└─────────────────────┘ └─────────────────────┘ └─────────────────────┘

┌─────────────────────┐

│ SISTEMA ARCHIVOS │

│ │

│ /storage/ │

│ /documentos/ │

│ /{año}/ │

│ /{mes}/ │

│ {uuid}.ext │

└─────────────────────┘

\`\`\`

\### 4.1.2 Componentes Principales

\| Componente \| Tecnología \| Responsabilidad \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Frontend \| Angular 21 LTS \| Interfaz de usuario, SPA \|

\| Backend \| Spring Boot 3.5 \| API REST, lógica de negocio \|

\| Base de datos SGED \| Oracle \| Persistencia de datos propios \|

\| Base de datos SGTv1 \| Oracle \| Consulta de expedientes históricos
\|

\| Base de datos SGTv2 \| Oracle \| Consulta de expedientes actuales \|

\| Almacenamiento \| Sistema de archivos \| Documentos multimedia \|

\### 4.1.3 Flujo de Datos General

\`\`\`

USUARIO FRONTEND BACKEND BD/ARCHIVOS

│ │ │ │

│ 1. Acción │ │ │

│ ─────────────────────\>│ │ │

│ │ 2. HTTP Request │ │

│ │ ───────────────────\>│ │

│ │ │ 3. Query/Save │

│ │ │ ─────────────────────\>│

│ │ │ │

│ │ │ 4. Result │

│ │ │ \<─────────────────────│

│ │ 5. HTTP Response │ │

│ │ \<───────────────────│ │

│ 6. Actualizar UI │ │ │

│ \<─────────────────────│ │ │

│ │ │ │

\`\`\`

\*\*Response error validación (400):\*\* `errors` es `string[]`.
\*\*Response prohibido (403):\*\* Acción no permitida o expediente de otro juzgado.
\*\*Response no encontrado (404):\*\* ID inexistente. No genera auditoría (solo logging).

\-\--

\## 4.2 Arquitectura Frontend

\### 4.2.1 Estructura del Proyecto Angular

\`\`\`

src/

├── app/

│ ├── core/ \# Servicios singleton, guards, interceptors

│ │ ├── services/

│ │ │ ├── auth.service.ts

│ │ │ ├── api.service.ts

│ │ │ └── storage.service.ts

│ │ ├── guards/

│ │ │ ├── auth.guard.ts

│ │ │ └── role.guard.ts

│ │ ├── interceptors/

│ │ │ ├── auth.interceptor.ts

│ │ │ └── error.interceptor.ts

│ │ └── core.module.ts

│ │

│ ├── shared/ \# Componentes reutilizables

│ │ ├── components/

│ │ │ ├── header/

│ │ │ ├── sidebar/

│ │ │ ├── loading/

│ │ │ └── confirm-dialog/

│ │ ├── pipes/

│ │ └── shared.module.ts

│ │

│ ├── features/ \# Módulos funcionales

│ │ ├── auth/

│ │ │ ├── login/

│ │ │ ├── change-password/

│ │ │ └── auth.module.ts

│ │ │

│ │ ├── expedientes/

│ │ │ ├── lista/

│ │ │ ├── detalle/

│ │ │ ├── formulario/

│ │ │ └── expedientes.module.ts

│ │ │

│ │ ├── documentos/

│ │ │ ├── upload/

│ │ │ ├── visor-pdf/

│ │ │ ├── visor-imagen/

│ │ │ ├── reproductor-audio/

│ │ │ ├── reproductor-video/

│ │ │ └── documentos.module.ts

│ │ │

│ │ ├── busqueda/

│ │ │ ├── rapida/

│ │ │ ├── avanzada/

│ │ │ └── busqueda.module.ts

│ │ │

│ │ └── admin/

│ │ ├── usuarios/

│ │ ├── auditoria/

│ │ └── admin.module.ts

│ │

│ ├── app.component.ts

│ ├── app.routes.ts

│ └── app.config.ts

│

├── assets/

├── environments/

│ ├── environment.ts

│ └── environment.prod.ts

└── styles.scss

\`\`\`

\### 4.2.2 Módulos y Lazy Loading

\`\`\`typescript

// app.routes.ts

export const routes: Routes = \[

{ path: \'\', redirectTo: \'/expedientes\', pathMatch: \'full\' },

{ path: \'login\', loadChildren: () =\>
import(\'./features/auth/auth.module\') },

{

path: \'expedientes\',

loadChildren: () =\>
import(\'./features/expedientes/expedientes.module\'),

canActivate: \[AuthGuard\]

},

{

path: \'busqueda\',

loadChildren: () =\> import(\'./features/busqueda/busqueda.module\'),

canActivate: \[AuthGuard\]

},

{

path: \'admin\',

loadChildren: () =\> import(\'./features/admin/admin.module\'),

canActivate: \[AuthGuard, RoleGuard\],

data: { roles: \[\'ADMINISTRADOR\'\] }

},

{ path: \'\*\*\', redirectTo: \'/expedientes\' }

\];

\`\`\`

\### 4.2.3 Servicios Core

\`\`\`typescript

// core/services/auth.service.ts

\@Injectable({ providedIn: \'root\' })

export class AuthService {

private currentUserSubject = new BehaviorSubject\<Usuario \|
null\>(null);

public currentUser\$ = this.currentUserSubject.asObservable();

login(credentials: LoginRequest): Observable\<LoginResponse\>;

logout(): void;

isAuthenticated(): boolean;

hasRole(role: string): boolean;

getToken(): string \| null;

}

// core/services/api.service.ts

\@Injectable({ providedIn: \'root\' })

export class ApiService {

private baseUrl = environment.apiUrl;

get\<T\>(endpoint: string, params?: any): Observable\<T\>;

post\<T\>(endpoint: string, body: any): Observable\<T\>;

put\<T\>(endpoint: string, body: any): Observable\<T\>;

delete\<T\>(endpoint: string): Observable\<T\>;

upload(endpoint: string, file: File, onProgress?: (percent: number) =\>
void): Observable\<any\>;

}

\`\`\`

\*\*Nota:\*\* `numero` no es editable en backend; cualquier cambio enviado en `PUT` se ignora.

\### 4.2.4 Interceptores

\`\`\`typescript

// core/interceptors/auth.interceptor.ts

\@Injectable()

export class AuthInterceptor implements HttpInterceptor {

intercept(req: HttpRequest\<any\>, next: HttpHandler):
Observable\<HttpEvent\<any\>\> {

const token = this.authService.getToken();

if (token) {

req = req.clone({

setHeaders: { Authorization: \`Bearer \${token}\` }

});

}

return next.handle(req);

}

}

// core/interceptors/error.interceptor.ts

\@Injectable()

export class ErrorInterceptor implements HttpInterceptor {

intercept(req: HttpRequest\<any\>, next: HttpHandler):
Observable\<HttpEvent\<any\>\> {

return next.handle(req).pipe(

catchError((error: HttpErrorResponse) =\> {

if (error.status === 401) {

this.authService.logout();

this.router.navigate(\[\'/login\'\]);

}

return throwError(() =\> error);

})

);

}

}

\`\`\`

\-\--

\## 4.3 Arquitectura Backend

\### 4.3.1 Estructura del Proyecto Spring Boot

\`\`\`

src/main/java/gob/oj/sged/

├── SgedApplication.java

│

├── config/ \# Configuración

│ ├── SecurityConfig.java

│ ├── CorsConfig.java

│ ├── DataSourceConfig.java

│ └── OpenApiConfig.java

│

├── controller/ \# Endpoints REST

│ ├── AuthController.java

│ ├── ExpedienteController.java

│ ├── DocumentoController.java

│ ├── BusquedaController.java

│ ├── SgtController.java

│ ├── UsuarioController.java

│ └── AuditoriaController.java

│

├── service/ \# Lógica de negocio

│ ├── AuthService.java

│ ├── ExpedienteService.java

│ ├── DocumentoService.java

│ ├── BusquedaService.java

│ ├── SgtService.java

│ ├── UsuarioService.java

│ ├── AuditoriaService.java

│ └── ArchivoService.java

│

├── repository/ \# Acceso a datos

│ ├── UsuarioRepository.java

│ ├── ExpedienteRepository.java

│ ├── DocumentoRepository.java

│ ├── AuditoriaRepository.java

│ ├── sgt/

│ │ ├── Sgtv1Repository.java

│ │ └── Sgtv2Repository.java

│ └── catalogo/

│ ├── TipoProcesoRepository.java

│ ├── JuzgadoRepository.java

│ └── EstadoRepository.java

│

├── entity/ \# Entidades JPA

│ ├── Usuario.java

│ ├── Rol.java

│ ├── Expediente.java

│ ├── Documento.java

│ ├── Auditoria.java

│ └── catalogo/

│ ├── TipoProceso.java

│ ├── Juzgado.java

│ └── Estado.java

│

├── dto/ \# Data Transfer Objects

│ ├── request/

│ │ ├── LoginRequest.java

│ │ ├── ExpedienteRequest.java

│ │ └── BusquedaRequest.java

│ ├── response/

│ │ ├── LoginResponse.java

│ │ ├── ExpedienteResponse.java

│ │ └── ApiResponse.java

│ └── mapper/

│ ├── ExpedienteMapper.java

│ └── DocumentoMapper.java

│

├── security/ \# Seguridad

│ ├── JwtTokenProvider.java

│ ├── JwtAuthenticationFilter.java

│ └── UserDetailsServiceImpl.java

│

├── exception/ \# Manejo de errores

│ ├── GlobalExceptionHandler.java

│ ├── ResourceNotFoundException.java

│ ├── UnauthorizedException.java

│ └── ValidationException.java

│

└── util/ \# Utilidades

├── FileUtil.java

└── AuditoriaUtil.java

src/main/resources/

├── application.properties

├── application-dev.properties

├── application-prod.properties

└── db/

└── migration/ \# Scripts SQL (opcional)

\`\`\`

\### 4.3.2 Capas de la Aplicación

\`\`\`

┌─────────────────────────────────────────────────────────────────┐

│ CONTROLLER │

│ - Recibe peticiones HTTP │

│ - Valida DTOs de entrada │

│ - Delega a Service │

│ - Retorna DTOs de respuesta │

└─────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────┐

│ SERVICE │

│ - Lógica de negocio │

│ - Transacciones │

│ - Coordinación de operaciones │

│ - Llamadas a Repository │

│ - Registro de auditoría │

└─────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────┐

│ REPOSITORY │

│ - Acceso a base de datos │

│ - Queries JPA/JPQL │

│ - CRUD operations │

└─────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────┐

│ BASE DE DATOS (Oracle) │

└─────────────────────────────────────────────────────────────────┘

\`\`\`

\### 4.3.3 Ejemplo de Controller

\`\`\`java

\@RestController

\@RequestMapping(\"/api/v1/expedientes\")

\@RequiredArgsConstructor

public class ExpedienteController {

private final ExpedienteService expedienteService;

\@GetMapping

public ResponseEntity\<Page\<ExpedienteResponse\>\> listar(

\@RequestParam(defaultValue = \"0\") int page,

\@RequestParam(defaultValue = \"10\") int size,

\@RequestParam(defaultValue = \"fechaCreacion,desc\") String sort) {

return ResponseEntity.ok(expedienteService.listar(page, size, sort));

}

\@GetMapping(\"/{id}\")

public ResponseEntity\<ExpedienteResponse\> obtener(@PathVariable Long
id) {

return ResponseEntity.ok(expedienteService.obtenerPorId(id));

}

\@PostMapping

public ResponseEntity\<ExpedienteResponse\> crear(

\@Valid \@RequestBody ExpedienteRequest request) {

return ResponseEntity.status(HttpStatus.CREATED)

.body(expedienteService.crear(request));

}

\@PutMapping(\"/{id}\")

public ResponseEntity\<ExpedienteResponse\> actualizar(

\@PathVariable Long id,

\@Valid \@RequestBody ExpedienteRequest request) {

return ResponseEntity.ok(expedienteService.actualizar(id, request));

}

}

\`\`\`

\### 4.3.4 Ejemplo de Service

\`\`\`java

\@Service

\@RequiredArgsConstructor

\@Transactional

public class ExpedienteService {

private final ExpedienteRepository expedienteRepository;

private final ExpedienteMapper expedienteMapper;

private final AuditoriaService auditoriaService;

public ExpedienteResponse crear(ExpedienteRequest request) {

// Validar número único

if (expedienteRepository.existsByNumero(request.getNumero())) {

throw new ValidationException(\"El número de expediente ya existe\");

}

// Crear entidad

Expediente expediente = expedienteMapper.toEntity(request);

expediente.setFechaCreacion(LocalDateTime.now());

expediente.setUsuarioCreacion(SecurityUtil.getCurrentUsername());

// Guardar

expediente = expedienteRepository.save(expediente);

// Auditar

auditoriaService.registrar(

Accion.EXPEDIENTE_CREADO,

\"expediente\",

expediente.getId(),

null,

expediente.toString()

);

return expedienteMapper.toResponse(expediente);

}

\@Transactional(readOnly = true)

public Page\<ExpedienteResponse\> listar(int page, int size, String
sort) {

String\[\] sortParts = sort.split(\",\");
String sortField = sortParts\[0\];
String sortDir = sortParts.length > 1 ? sortParts\[1\] : \"desc\";

Sort sortOrder = sortDir.equalsIgnoreCase(\"desc\")
? Sort.by(sortField).descending()
: Sort.by(sortField).ascending();

Pageable pageable = PageRequest.of(page, size, sort);

return expedienteRepository.findAll(pageable)

.map(expedienteMapper::toResponse);

}

}

\`\`\`

\### 4.3.5 Ejemplo de Repository

\`\`\`java

\@Repository

public interface ExpedienteRepository extends JpaRepository\<Expediente,
Long\> {

boolean existsByNumero(String numero);

Optional\<Expediente\> findByNumero(String numero);

\@Query(\"SELECT e FROM Expediente e WHERE \" +

\"(:numero IS NULL OR e.numero LIKE %:numero%) AND \" +

\"(:tipoProcesoId IS NULL OR e.tipoProceso.id = :tipoProcesoId) AND \" +

\"(:juzgadoId IS NULL OR e.juzgado.id = :juzgadoId) AND \" +

\"(:estadoId IS NULL OR e.estado.id = :estadoId) AND \" +

\"(:fechaDesde IS NULL OR e.fechaInicio \>= :fechaDesde) AND \" +

\"(:fechaHasta IS NULL OR e.fechaInicio \<= :fechaHasta)\")

Page\<Expediente\> buscar(

\@Param(\"numero\") String numero,

\@Param(\"tipoProcesoId\") Long tipoProcesoId,

\@Param(\"juzgadoId\") Long juzgadoId,

\@Param(\"estadoId\") Long estadoId,

\@Param(\"fechaDesde\") LocalDate fechaDesde,

\@Param(\"fechaHasta\") LocalDate fechaHasta,

Pageable pageable);

}

\`\`\`

\-\--

\## 4.4 Arquitectura de Seguridad

\### 4.4.1 Flujo de Autenticación

\`\`\`

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐

│ Cliente │ │ Backend │ │ JWT │ │ BD │

└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘

│ │ │ │

│ POST /auth/login │ │ │

│ {user, password} │ │ │

│───────────────────\>│ │ │

│ │ │ │

│ │ Validar credenciales │

│ │───────────────────────────────────────\> │

│ │ │

│ │ \<───────────────────────────────────── │

│ │ Usuario válido │

│ │ │ │

│ │ Generar token │ │

│ │───────────────────\>│ │

│ │ │ │

│ │ \<──────────────────│ │

│ │ JWT Token │ │

│ │ │ │

│ {token, usuario} │ │ │

│\<───────────────────│ │ │

│ │ │ │

│ │ │ │

│ GET /api/recurso │ │ │

│ Header: Bearer JWT │ │ │

│───────────────────\>│ │ │

│ │ │ │

│ │ Validar token │ │

│ │───────────────────\>│ │

│ │ │ │

│ │ \<──────────────────│ │

│ │ Token válido │ │

│ │ │ │

│ Respuesta │ │ │

│\<───────────────────│ │ │

\`\`\`

#### 4.4.1.1 Flujos detallados (Fase 1)

**Login**

1. Cliente envía `POST /auth/login` con `username` y `password`.
2. Backend valida credenciales (BCrypt) y estado (`activo`, `bloqueado`).
3. Se registra intento en `auth_attempt` (exitoso o fallido) con IP/fecha.
4. Si es exitoso: se genera JWT (exp 8h, `jti`, `roles`) y se retorna al cliente.
5. Se inserta evento en `auditoria` (login exitoso/fallido).

**Logout**

1. Cliente envía `POST /auth/logout` con JWT vigente.
2. Backend extrae `jti` y exp, inserta en `revoked_token`.
3. Se registra evento en `auditoria` (logout).
4. Cliente limpia token local y redirige a login.

**Cambio de contraseña**

1. Cliente envía `POST /auth/cambiar-password` (password actual + nueva).
2. Backend valida password actual y política de contraseña.
3. Actualiza hash BCrypt y marca `debe_cambiar_pass = 0`.
4. Reinicia contador de intentos fallidos si aplica.
5. Inserta evento en `auditoria` (cambio de contraseña).

#### 4.4.1.2 Política de contraseña y lockout

- **Contraseña:** mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número.
- **Lockout:** bloqueo tras 5 intentos fallidos.
- **Ventana temporal (Java/Oracle):** configurable. En backend Spring Boot se controla con campo `intentos_fallidos` en tabla `usuario` y `fecha_bloqueo` para rastreo temporal.


#### 4.4.1.3 JWT, revocación y RBAC

- **JWT (8h):** token firmado con `jti`, `sub` = username y claim `roles`.
- **Revocación:** logout inserta `token_jti` en `revoked_token`; cada request valida que el `jti` no esté revocado.
- **RBAC:** `usuario.rol_id` referencia `cat_rol`. Un usuario tiene **un rol** en Fase 1 (ADMINISTRADOR, SECRETARIO, AUXILIAR, CONSULTA).

#### 4.4.1.4 Auditoría

- **Servicio:** inserta registros en `auditoria` en eventos críticos (auth, admin, expedientes, documentos).
- **Tabla:** `auditoria` es **inmutable** (solo INSERT); no hay edición/eliminación desde UI.

\### 4.4.2 Configuración de Spring Security

\`\`\`java

\@Configuration

\@EnableWebSecurity

\@RequiredArgsConstructor

public class SecurityConfig {

private final JwtAuthenticationFilter jwtAuthFilter;

private final UserDetailsServiceImpl userDetailsService;

\@Bean

public SecurityFilterChain securityFilterChain(HttpSecurity http) throws
Exception {

return http

.csrf(csrf -\> csrf.disable())

.cors(cors -\> cors.configurationSource(corsConfigurationSource()))

.sessionManagement(session -\>

session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

.authorizeHttpRequests(auth -\> auth

.requestMatchers(\"/api/v1/auth/\*\*\").permitAll()

.requestMatchers(\"/api/v1/admin/\*\*\").hasRole(\"ADMINISTRADOR\")

.requestMatchers(HttpMethod.POST, \"/api/v1/expedientes/\*\*\")

.hasAnyRole(\"ADMINISTRADOR\", \"SECRETARIO\", \"AUXILIAR\")

.requestMatchers(HttpMethod.PUT, \"/api/v1/expedientes/\*\*\")

.hasAnyRole(\"ADMINISTRADOR\", \"SECRETARIO\")

.requestMatchers(HttpMethod.GET, \"/api/v1/\*\*\").authenticated()

.anyRequest().authenticated()

)

.addFilterBefore(jwtAuthFilter,
UsernamePasswordAuthenticationFilter.class)

.build();

}

\@Bean

public PasswordEncoder passwordEncoder() {

return new BCryptPasswordEncoder(12);

}

}

\`\`\`

\### 4.4.3 JWT Token Provider

\`\`\`java

\@Component

public class JwtTokenProvider {

\@Value(\"\${jwt.secret}\")

private String secretKey;

\@Value(\"\${jwt.expiration}\")

private long expiration; // 8 horas en milisegundos

public String generateToken(UserDetails userDetails) {

Map\<String, Object\> claims = new HashMap\<\>();

claims.put(\"roles\", userDetails.getAuthorities().stream()

.map(GrantedAuthority::getAuthority)

.collect(Collectors.toList()));

return Jwts.builder()

.setClaims(claims)

.setSubject(userDetails.getUsername())

.setIssuedAt(new Date())

.setExpiration(new Date(System.currentTimeMillis() + expiration))

.signWith(getSigningKey(), SignatureAlgorithm.HS256)

.compact();

}

public boolean validateToken(String token) {

try {

Jwts.parserBuilder()

.setSigningKey(getSigningKey())

.build()

.parseClaimsJws(token);

return true;

} catch (JwtException \| IllegalArgumentException e) {

return false;

}

}

public String getUsername(String token) {

return getClaims(token).getSubject();

}

private SecretKey getSigningKey() {

byte\[\] keyBytes = Decoders.BASE64.decode(secretKey);

return Keys.hmacShaKeyFor(keyBytes);

}

}

\`\`\`

\-\--

\## 4.5 Arquitectura de Datos

\### 4.5.1 Conexiones a Base de Datos

\`\`\`java

\@Configuration

public class DataSourceConfig {

// DataSource principal (SGED)

\@Primary

\@Bean(name = \"sgedDataSource\")

\@ConfigurationProperties(prefix = \"spring.datasource.sged\")

public DataSource sgedDataSource() {

return DataSourceBuilder.create().build();

}

// DataSource SGTv1 (solo lectura)

\@Bean(name = \"sgtv1DataSource\")

\@ConfigurationProperties(prefix = \"spring.datasource.sgtv1\")

public DataSource sgtv1DataSource() {

return DataSourceBuilder.create().build();

}

// DataSource SGTv2 (solo lectura)

\@Bean(name = \"sgtv2DataSource\")

\@ConfigurationProperties(prefix = \"spring.datasource.sgtv2\")

public DataSource sgtv2DataSource() {

return DataSourceBuilder.create().build();

}

}

\`\`\`

\### 4.5.2 Configuración de Propiedades

\`\`\`properties

\# application.properties

\# DataSource SGED (principal)

spring.datasource.sged.url=jdbc:oracle:thin:@//localhost:1521/sged

spring.datasource.sged.username=\${SGED_DB_USER}

spring.datasource.sged.password=\${SGED_DB_PASSWORD}

spring.datasource.sged.driver-class-name=oracle.jdbc.OracleDriver

\# DataSource SGTv1 (solo lectura)

spring.datasource.sgtv1.url=jdbc:oracle:thin:@//sgt-server:1521/sgtv1

spring.datasource.sgtv1.username=\${SGTV1_DB_USER}

spring.datasource.sgtv1.password=\${SGTV1_DB_PASSWORD}

spring.datasource.sgtv1.driver-class-name=oracle.jdbc.OracleDriver

\# DataSource SGTv2 (solo lectura)

spring.datasource.sgtv2.url=jdbc:oracle:thin:@//sgt-server:1521/sgtv2

spring.datasource.sgtv2.username=\${SGTV2_DB_USER}

spring.datasource.sgtv2.password=\${SGTV2_DB_PASSWORD}

spring.datasource.sgtv2.driver-class-name=oracle.jdbc.OracleDriver

\# JPA/Hibernate

spring.jpa.hibernate.ddl-auto=validate

spring.jpa.show-sql=false

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.OracleDialect

\# JWT

jwt.secret=\${JWT_SECRET}

jwt.expiration=28800000

\# Archivos

app.storage.path=/opt/sged/storage

app.storage.max-file-size=104857600

\`\`\`

\-\--

\## 4.6 Arquitectura de Almacenamiento de Archivos

\### 4.6.1 Estructura de Directorios

\`\`\`

/opt/sged/storage/

├── documentos/

│ ├── 2026/

│ │ ├── 01/

│ │ │ ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf

│ │ │ ├── b2c3d4e5-f6a7-8901-bcde-f12345678901.docx

│ │ │ └── c3d4e5f6-a7b8-9012-cdef-123456789012.jpg

│ │ ├── 02/

│ │ └── \...

│ └── 2025/

│ └── \...

└── temp/

└── conversiones/

\`\`\`

\### 4.6.2 Servicio de Archivos

\`\`\`java

\@Service

\@RequiredArgsConstructor

public class ArchivoService {

\@Value(\"\${app.storage.path}\")

private String storagePath;

\@Value(\"\${app.storage.max-file-size}\")

private long maxFileSize;

private static final Set\<String\> ALLOWED_EXTENSIONS = Set.of(

\"pdf\", \"doc\", \"docx\",

\"jpg\", \"jpeg\", \"png\", \"gif\", \"bmp\",

\"mp3\", \"wav\", \"ogg\",

\"mp4\", \"webm\", \"avi\", \"mov\"

);

public ArchivoInfo guardar(MultipartFile file) throws IOException {

// Validar

validarArchivo(file);

// Generar nombre único

String extension = getExtension(file.getOriginalFilename());

String nombreUnico = UUID.randomUUID().toString() + \".\" + extension;

// Determinar ruta (año/mes)

LocalDate hoy = LocalDate.now();

String rutaRelativa = String.format(\"documentos/%d/%02d/%s\",

hoy.getYear(), hoy.getMonthValue(), nombreUnico);

Path rutaCompleta = Paths.get(storagePath, rutaRelativa);

// Crear directorios si no existen

Files.createDirectories(rutaCompleta.getParent());

// Guardar archivo

Files.copy(file.getInputStream(), rutaCompleta);

return new ArchivoInfo(

nombreUnico,

file.getOriginalFilename(),

rutaRelativa,

file.getSize(),

file.getContentType()

);

}

public Resource cargar(String rutaRelativa) throws IOException {

Path ruta = Paths.get(storagePath, rutaRelativa);

Resource resource = new UrlResource(ruta.toUri());

if (!resource.exists()) {

throw new ResourceNotFoundException(\"Archivo no encontrado\");

}

return resource;

}

private void validarArchivo(MultipartFile file) {

if (file.isEmpty()) {

throw new ValidationException(\"El archivo está vacío\");

}

if (file.getSize() \> maxFileSize) {

throw new ValidationException(\"El archivo excede el tamaño máximo
permitido\");

}

String extension =
getExtension(file.getOriginalFilename()).toLowerCase();

if (!ALLOWED_EXTENSIONS.contains(extension)) {

throw new ValidationException(\"Formato de archivo no permitido\");

}

}

private String getExtension(String filename) {

return filename.substring(filename.lastIndexOf(\".\") + 1);

}

}

\`\`\`

\-\--

\## 4.7 Arquitectura de Integración SGT

\### 4.7.1 Servicio de Integración

\`\`\`java

\@Service

\@RequiredArgsConstructor

public class SgtService {

private final Sgtv1Repository sgtv1Repository;

private final Sgtv2Repository sgtv2Repository;

private final AuditoriaService auditoriaService;

/\*\*

\* Busca expediente primero en SGTv2, luego en SGTv1

\*/

public Optional\<SgtExpedienteDto\> buscarExpediente(String numero) {

// Primero buscar en SGTv2 (sistema actual)

Optional\<SgtExpedienteDto\> resultadoV2 = buscarEnSgtv2(numero);

if (resultadoV2.isPresent()) {

auditoriaService.registrar(Accion.SGT_CONSULTADO, \"sgtv2\", null,
numero, \"Encontrado\");

return resultadoV2;

}

// Si no está en v2, buscar en v1 (histórico)

Optional\<SgtExpedienteDto\> resultadoV1 = buscarEnSgtv1(numero);

if (resultadoV1.isPresent()) {

auditoriaService.registrar(Accion.SGT_CONSULTADO, \"sgtv1\", null,
numero, \"Encontrado\");

return resultadoV1;

}

auditoriaService.registrar(Accion.SGT_CONSULTADO, \"sgt\", null, numero,
\"No encontrado\");

return Optional.empty();

}

private Optional\<SgtExpedienteDto\> buscarEnSgtv1(String numero) {

try {

return sgtv1Repository.findByNumero(numero)

.map(e -\> mapToDto(e, \"SGTv1\"));

} catch (Exception e) {

log.error(\"Error consultando SGTv1: {}\", e.getMessage());

return Optional.empty();

}

}

private Optional\<SgtExpedienteDto\> buscarEnSgtv2(String numero) {

try {

return sgtv2Repository.findByNumero(numero)

.map(e -\> mapToDto(e, \"SGTv2\"));

} catch (Exception e) {

log.error(\"Error consultando SGTv2: {}\", e.getMessage());

return Optional.empty();

}

}

}

\`\`\`

\### 4.7.2 Repositorios SGT (Solo Lectura)

\`\`\`java

// Repositorio para SGTv1

\@Repository

public interface Sgtv1Repository extends JpaRepository\<Sgtv1Expediente,
Long\> {

\@Query(value = \"SELECT \* FROM expedientes WHERE numero_expediente =
:numero\",

nativeQuery = true)

Optional\<Sgtv1Expediente\> findByNumero(@Param(\"numero\") String
numero);

}

// Repositorio para SGTv2

\@Repository

public interface Sgtv2Repository extends JpaRepository\<Sgtv2Expediente,
Long\> {

\@Query(value = \"SELECT \* FROM exp_expedientes WHERE exp_numero =
:numero\",

nativeQuery = true)

Optional\<Sgtv2Expediente\> findByNumero(@Param(\"numero\") String
numero);

}

\`\`\`

\-\--

\## 4.8 Arquitectura de Auditoría

\### 4.8.1 Servicio de Auditoría

\`\`\`java

\@Service

\@RequiredArgsConstructor

public class AuditoriaService {

private final AuditoriaRepository auditoriaRepository;

\@Async

public void registrar(Accion accion, String modulo, Long recursoId,

String valorAnterior, String valorNuevo) {

Auditoria auditoria = Auditoria.builder()

.fecha(LocalDateTime.now())

.usuario(SecurityUtil.getCurrentUsername())

.ip(SecurityUtil.getCurrentIp())

.accion(accion)

.modulo(modulo)

.recursoId(recursoId)

.valorAnterior(valorAnterior)

.valorNuevo(valorNuevo)

.build();

auditoriaRepository.save(auditoria);

}

\@Transactional(readOnly = true)

public Page\<AuditoriaDto\> consultar(AuditoriaFiltro filtro, Pageable
pageable) {

return auditoriaRepository.buscar(

filtro.getFechaDesde(),

filtro.getFechaHasta(),

filtro.getUsuario(),

filtro.getAccion(),

pageable

).map(this::toDto);

}

}

\`\`\`

\### 4.8.2 Enum de Acciones

\`\`\`java

public enum Accion {

// Autenticación

LOGIN_EXITOSO,

LOGIN_FALLIDO,

LOGOUT,

CAMBIO_PASSWORD,

CUENTA_BLOQUEADA,

// Expedientes

EXPEDIENTE_CREADO,

EXPEDIENTE_EDITADO,

EXPEDIENTE_CONSULTADO,

// Documentos

DOCUMENTO_CARGADO,

DOCUMENTO_VISUALIZADO,

DOCUMENTO_DESCARGADO,

DOCUMENTO_IMPRESO,

DOCUMENTO_ELIMINADO,

// Búsquedas

BUSQUEDA_REALIZADA,

// Integración

SGT_CONSULTADO,

// Usuarios

USUARIO_CREADO,

USUARIO_EDITADO,

USUARIO_DESACTIVADO,

ROL_CAMBIADO

}

\`\`\`

\-\--

\## 4.9 Patrones de Diseño Aplicados

\### 4.9.1 Resumen de Patrones

\| Patrón \| Uso en SGED \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Repository\*\* \| Abstracción de acceso a datos \|

\| \*\*Service Layer\*\* \| Encapsulación de lógica de negocio \|

\| \*\*DTO\*\* \| Transferencia de datos entre capas \|

\| \*\*Dependency Injection\*\* \| Inyección de dependencias con Spring
\|

\| \*\*Singleton\*\* \| Servicios Spring (default scope) \|

\| \*\*Factory\*\* \| Creación de respuestas estandarizadas \|

\| \*\*Strategy\*\* \| Manejo de diferentes tipos de archivos \|

\| \*\*Interceptor\*\* \| Autenticación y manejo de errores \|

\### 4.9.2 Diagrama de Dependencias

\`\`\`

┌─────────────────────────────────────────────────────────────────┐

│ CONTROLLERS │

│ │ │

│ ┌───────┴───────┐ │

│ │ │ │

│ ▼ ▼ │

│ ┌──────────┐ ┌──────────┐ │

│ │ SERVICES │ │ DTOs │ │

│ └────┬─────┘ └──────────┘ │

│ │ │

│ ┌─────────┼─────────┐ │

│ │ │ │ │

│ ▼ ▼ ▼ │

│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │

│ │ REPOS │ │ MAPPERS │ │ UTILS │ │

│ └────┬─────┘ └──────────┘ └──────────┘ │

│ │ │

│ ▼ │

│ ┌──────────┐ │

│ │ ENTITIES │ │

│ └──────────┘ │

└─────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 4.10 Resumen de Arquitectura

\### Decisiones Arquitectónicas Clave

\| Decisión \| Justificación \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Monolito modular \| Simplicidad, un solo despliegue \|

\| REST API \| Estándar, fácil consumo desde Angular \|

\| JWT stateless \| Sin sesiones en servidor, escalable \|

\| Sistema de archivos local \| Simple, sin dependencias externas \|

\| Multiple DataSources \| Integración con sistemas legados \|

\| Auditoría asíncrona \| No impacta rendimiento de operaciones \|

\### Tecnologías por Capa

\| Capa \| Tecnología \| Versión \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Frontend \| Angular \| 21.x LTS \|

\| UI Components \| PrimeNG \| 21.x \|

\| Backend \| Spring Boot \| 3.5.x \|

\| Seguridad \| Spring Security + JWT \| 6.5.x \|

\| ORM \| Hibernate/JPA \| 6.7.x \|

\| Base de datos \| Oracle \| 19c/21c/23c \|

\| Build Frontend \| Node.js \| 22.x \|

\| Build Backend \| Maven \| 3.9.x \|

\-\--

## \# SECCIÓN 5: MODELO DE DATOS

\-\--

\## 5.1 Diagrama Entidad-Relación

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────────────────┐

│ MODELO DE DATOS SGED │

└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐

│ CAT_ROL │ │ CAT_JUZGADO │

├──────────────┤ ├──────────────┤

│ PK id │ │ PK id │

│ nombre │ │ nombre │

│ activo │ │ codigo │

└──────┬───────┘ │ activo │

│ └──────┬───────┘

│ │

│ 1 │ 1

│ │

▼ N │

┌──────────────┐ │

│ USUARIO │ │

├──────────────┤ │

│ PK id │ │

│ username │ │

│ password │ │

│ nombre │ │

│ email │ │

│ FK rol_id │────────────────┤

│ FK juzgado_id│◄───────────────┘

│ activo │

│ bloqueado │

│ intentos │

│ fecha_crea│

└──────┬───────┘

│

│ 1

│

▼ N

┌──────────────┐ ┌───────────────┐ ┌──────────────┐

│ EXPEDIENTE │ │CAT_TIPO_PROCES│ │ CAT_ESTADO │

├──────────────┤ ├───────────────┤ ├──────────────┤

│ PK id │ │ PK id │ │ PK id │

│ numero │◄────────│ nombre │ │ nombre │

│ FK tipo_id │────────►│ activo │ │ activo │

│ FK juzgado_id│ └───────────────┘ └──────┬───────┘

│ FK estado_id │◄──────────────────────────────────────────┘

│ fecha_ini │

│ descrip │

│ observ │

│ ref_sgt │

│ ref_fuente│

│ FK usuario_cr│

│ fecha_crea│

│ fecha_mod │

└──────┬───────┘

│

│ 1

│

▼ N

┌──────────────┐ ┌───────────────┐

│ DOCUMENTO │ │CAT_TIPO_DOCUM │

├──────────────┤ ├───────────────┤

│ PK id │ │ PK id │

│ FK exped_id │ │ nombre │

│ FK tipo_id │────────►│ activo │

│ nombre_ori│ └───────────────┘

│ nombre_sto│

│ ruta │

│ tamanio │

│ mime_type │

│ extension │

│ FK usuario_cr│

│ fecha_crea│

│ eliminado │

│ fecha_elim│

└──────────────┘

┌──────────────┐

│ AUDITORIA │

├──────────────┤

│ PK id │

│ fecha │

│ usuario │

│ ip │

│ accion │

│ modulo │

│ recurso_id│

│ valor_ant │

│ valor_nue │

│ detalle │

└──────────────┘

\`\`\`

\-\--

\## 5.2 Definición de Tablas

\### 5.2.1 Tabla: USUARIO

\| Columna \| Tipo \| Nulo \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| id \| NUMBER(19) \| NO \| PK, autoincremental \|

\| username \| VARCHAR2(50) \| NO \| Nombre de usuario único \|

\| password \| VARCHAR2(255) \| NO \| Contraseña hasheada (BCrypt) \|

\| nombre_completo \| VARCHAR2(150) \| NO \| Nombre completo del usuario
\|

\| email \| VARCHAR2(100) \| NO \| Correo electrónico \|

\| rol_id \| NUMBER(19) \| NO \| FK a CAT_ROL \|

\| juzgado_id \| NUMBER(19) \| NO \| FK a CAT_JUZGADO \|

\| activo \| NUMBER(1) \| NO \| 1=Activo, 0=Inactivo \|

\| bloqueado \| NUMBER(1) \| NO \| 1=Bloqueado, 0=Normal \|

\| intentos_fallidos \| NUMBER(2) \| NO \| Contador de intentos fallidos
\|

\| fecha_bloqueo \| TIMESTAMP \| SÍ \| Fecha de bloqueo \|

\| debe_cambiar_pass \| NUMBER(1) \| NO \| 1=Debe cambiar, 0=No \|

\| fecha_creacion \| TIMESTAMP \| NO \| Fecha de creación \|

\| fecha_modificacion \| TIMESTAMP \| SÍ \| Última modificación \|

\`\`\`sql

CREATE TABLE usuario (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

username VARCHAR2(50) NOT NULL UNIQUE,

password VARCHAR2(255) NOT NULL,

nombre_completo VARCHAR2(150) NOT NULL,

email VARCHAR2(100) NOT NULL,

rol_id NUMBER(19) NOT NULL,

juzgado_id NUMBER(19) NOT NULL,

activo NUMBER(1) DEFAULT 1 NOT NULL,

bloqueado NUMBER(1) DEFAULT 0 NOT NULL,

intentos_fallidos NUMBER(2) DEFAULT 0 NOT NULL,

fecha_bloqueo TIMESTAMP,

debe_cambiar_pass NUMBER(1) DEFAULT 1 NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

fecha_modificacion TIMESTAMP,

CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES cat_rol(id),

CONSTRAINT fk_usuario_juzgado FOREIGN KEY (juzgado_id) REFERENCES
cat_juzgado(id)

);

CREATE INDEX idx_usuario_username ON usuario(username);

CREATE INDEX idx_usuario_rol ON usuario(rol_id);

CREATE INDEX idx_usuario_juzgado ON usuario(juzgado_id);

\`\`\`

\-\--

\### 5.2.2 Tabla: EXPEDIENTE

\| Columna \| Tipo \| Nulo \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| id \| NUMBER(19) \| NO \| PK, autoincremental \|

\| numero \| VARCHAR2(50) \| NO \| Número único de expediente \|

\| tipo_proceso_id \| NUMBER(19) \| NO \| FK a CAT_TIPO_PROCESO \|

\| juzgado_id \| NUMBER(19) \| NO \| FK a CAT_JUZGADO \|

\| estado_id \| NUMBER(19) \| NO \| FK a CAT_ESTADO \|

\| fecha_inicio \| DATE \| NO \| Fecha de inicio del expediente \|

\| descripcion \| VARCHAR2(500) \| NO \| Descripción/asunto \|

\| observaciones \| VARCHAR2(1000) \| SÍ \| Observaciones adicionales \|

\| referencia_sgt \| VARCHAR2(50) \| SÍ \| Número de referencia en SGT
\|

\| referencia_fuente \| VARCHAR2(10) \| SÍ \| \'SGTV1\' o \'SGTV2\' \|

\| usuario_creacion \| VARCHAR2(50) \| NO \| Usuario que creó \|

\| fecha_creacion \| TIMESTAMP \| NO \| Fecha de creación \|

\| usuario_modificacion \| VARCHAR2(50) \| SÍ \| Usuario que modificó \|

\| fecha_modificacion \| TIMESTAMP \| SÍ \| Última modificación \|

\`\`\`sql

CREATE TABLE expediente (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

numero VARCHAR2(50) NOT NULL UNIQUE,

tipo_proceso_id NUMBER(19) NOT NULL,

juzgado_id NUMBER(19) NOT NULL,

estado_id NUMBER(19) NOT NULL,

fecha_inicio DATE NOT NULL,

descripcion VARCHAR2(500) NOT NULL,

observaciones VARCHAR2(1000),

referencia_sgt VARCHAR2(50),

referencia_fuente VARCHAR2(10),

usuario_creacion VARCHAR2(50) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

usuario_modificacion VARCHAR2(50),

fecha_modificacion TIMESTAMP,

CONSTRAINT fk_expediente_tipo FOREIGN KEY (tipo_proceso_id) REFERENCES
cat_tipo_proceso(id),

CONSTRAINT fk_expediente_juzgado FOREIGN KEY (juzgado_id) REFERENCES
cat_juzgado(id),

CONSTRAINT fk_expediente_estado FOREIGN KEY (estado_id) REFERENCES
cat_estado(id),

CONSTRAINT chk_referencia_fuente CHECK (referencia_fuente IN (\'SGTV1\',
\'SGTV2\') OR referencia_fuente IS NULL)

);

CREATE INDEX idx_expediente_numero ON expediente(numero);

CREATE INDEX idx_expediente_tipo ON expediente(tipo_proceso_id);

CREATE INDEX idx_expediente_juzgado ON expediente(juzgado_id);

CREATE INDEX idx_expediente_estado ON expediente(estado_id);

CREATE INDEX idx_expediente_fecha ON expediente(fecha_inicio);

CREATE INDEX idx_expediente_creacion ON expediente(fecha_creacion);

\`\`\`

\-\--

\### 5.2.3 Tabla: DOCUMENTO

\| Columna \| Tipo \| Nulo \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| id \| NUMBER(19) \| NO \| PK, autoincremental \|

\| expediente_id \| NUMBER(19) \| NO \| FK a EXPEDIENTE \|

\| tipo_documento_id \| NUMBER(19) \| SÍ \| FK a CAT_TIPO_DOCUMENTO \|

\| nombre_original \| VARCHAR2(255) \| NO \| Nombre original del archivo
\|

\| nombre_storage \| VARCHAR2(100) \| NO \| Nombre UUID en storage \|

\| ruta \| VARCHAR2(500) \| NO \| Ruta relativa en storage \|

\| tamanio \| NUMBER(19) \| NO \| Tamaño en bytes \|

\| mime_type \| VARCHAR2(100) \| NO \| Tipo MIME del archivo \|

\| extension \| VARCHAR2(10) \| NO \| Extensión del archivo \|

\| usuario_creacion \| VARCHAR2(50) \| NO \| Usuario que cargó \|

\| fecha_creacion \| TIMESTAMP \| NO \| Fecha de carga \|

\| eliminado \| NUMBER(1) \| NO \| 1=Eliminado, 0=Activo \|

\| usuario_eliminacion \| VARCHAR2(50) \| SÍ \| Usuario que eliminó \|

\| fecha_eliminacion \| TIMESTAMP \| SÍ \| Fecha de eliminación \|

\`\`\`sql

CREATE TABLE documento (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

expediente_id NUMBER(19) NOT NULL,

tipo_documento_id NUMBER(19),

nombre_original VARCHAR2(255) NOT NULL,

nombre_storage VARCHAR2(100) NOT NULL,

ruta VARCHAR2(500) NOT NULL,

tamanio NUMBER(19) NOT NULL,

mime_type VARCHAR2(100) NOT NULL,

extension VARCHAR2(10) NOT NULL,

usuario_creacion VARCHAR2(50) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

eliminado NUMBER(1) DEFAULT 0 NOT NULL,

usuario_eliminacion VARCHAR2(50),

fecha_eliminacion TIMESTAMP,

CONSTRAINT fk_documento_expediente FOREIGN KEY (expediente_id)
REFERENCES expediente(id),

CONSTRAINT fk_documento_tipo FOREIGN KEY (tipo_documento_id) REFERENCES
cat_tipo_documento(id)

);

CREATE INDEX idx_documento_expediente ON documento(expediente_id);

CREATE INDEX idx_documento_tipo ON documento(tipo_documento_id);

CREATE INDEX idx_documento_eliminado ON documento(eliminado);

CREATE INDEX idx_documento_creacion ON documento(fecha_creacion);

\`\`\`

\-\--

\### 5.2.4 Tabla: AUDITORIA

\| Columna \| Tipo \| Nulo \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| id \| NUMBER(19) \| NO \| PK, autoincremental \|

\| fecha \| TIMESTAMP \| NO \| Fecha y hora del evento \|

\| usuario \| VARCHAR2(50) \| NO \| Usuario que realizó la acción \|

\| ip \| VARCHAR2(45) \| NO \| Dirección IP \|

\| accion \| VARCHAR2(50) \| NO \| Tipo de acción \|

\| modulo \| VARCHAR2(50) \| NO \| Módulo del sistema \|

\| recurso_id \| NUMBER(19) \| SÍ \| ID del recurso afectado \|

\| valor_anterior \| CLOB \| SÍ \| Valor antes del cambio \|

\| valor_nuevo \| CLOB \| SÍ \| Valor después del cambio \|

\| detalle \| VARCHAR2(500) \| SÍ \| Información adicional \|

\`\`\`sql

CREATE TABLE auditoria (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

usuario VARCHAR2(50) NOT NULL,

ip VARCHAR2(45) NOT NULL,

accion VARCHAR2(50) NOT NULL,

modulo VARCHAR2(50) NOT NULL,

recurso_id NUMBER(19),

valor_anterior CLOB,

valor_nuevo CLOB,

detalle VARCHAR2(500)

);

CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario);

CREATE INDEX idx_auditoria_accion ON auditoria(accion);

CREATE INDEX idx_auditoria_modulo ON auditoria(modulo);

CREATE INDEX idx_auditoria_recurso ON auditoria(recurso_id);

\-- Particionamiento por fecha (opcional, para mejor rendimiento)

\-- ALTER TABLE auditoria PARTITION BY RANGE (fecha) INTERVAL
(NUMTOYMINTERVAL(1, \'MONTH\'));

\`\`\`

\-\--

\## 5.3 Tablas de Catálogos

\### 5.3.1 Tabla: CAT_ROL

\`\`\`sql

CREATE TABLE cat_rol (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(50) NOT NULL UNIQUE,

descripcion VARCHAR2(200),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

\-- Datos iniciales

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'ADMINISTRADOR\',
\'Administrador del sistema\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'SECRETARIO\',
\'Secretario judicial\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'AUXILIAR\',
\'Auxiliar judicial\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'CONSULTA\',
\'Usuario de solo consulta\');

\`\`\`

\### 5.3.2 Tabla: CAT_JUZGADO

\`\`\`sql

CREATE TABLE cat_juzgado (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

codigo VARCHAR2(20) NOT NULL UNIQUE,

nombre VARCHAR2(200) NOT NULL,

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE INDEX idx_juzgado_codigo ON cat_juzgado(codigo);

\-- Datos de ejemplo

INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-CIV-01\', \'Juzgado Primero Civil\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-CIV-02\', \'Juzgado Segundo Civil\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-PEN-01\', \'Juzgado Primero Penal\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-PEN-02\', \'Juzgado Segundo Penal\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-LAB-01\', \'Juzgado Primero Laboral\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-FAM-01\', \'Juzgado Primero de Familia\');
\-- Nota: los códigos siguen el patrón <JUZ>-<JURISDICCIÓN>-<NÚMERO>.

\`\`\`

\### 5.3.3 Tabla: CAT_TIPO_PROCESO

\`\`\`sql

CREATE TABLE cat_tipo_proceso (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(100) NOT NULL UNIQUE,

descripcion VARCHAR2(300),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

\-- Datos iniciales

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Civil\',
\'Procesos civiles\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Penal\',
\'Procesos penales\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Laboral\',
\'Procesos laborales\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Familia\',
\'Procesos de familia\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES
(\'Administrativo\', \'Procesos administrativos\');

\`\`\`

\### 5.3.4 Tabla: CAT_ESTADO

\`\`\`sql

CREATE TABLE cat_estado (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(50) NOT NULL UNIQUE,

descripcion VARCHAR2(200),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

\-- Datos iniciales

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Activo\',
\'Expediente en trámite activo\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'En espera\',
\'Expediente en espera de resolución\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Suspendido\',
\'Expediente suspendido temporalmente\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Cerrado\',
\'Expediente cerrado/finalizado\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Archivado\',
\'Expediente archivado\');

\`\`\`

\### 5.3.5 Tabla: CAT_TIPO_DOCUMENTO

\`\`\`sql

CREATE TABLE cat_tipo_documento (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(100) NOT NULL UNIQUE,

descripcion VARCHAR2(300),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

\-- Datos iniciales

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Demanda\', \'Documento de demanda inicial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Contestación\', \'Contestación a la demanda\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Resolución\', \'Resolución judicial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Sentencia\', \'Sentencia del caso\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Notificación\', \'Notificación oficial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Prueba\',
\'Documento probatorio\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Evidencia
multimedia\', \'Audio, video o imagen como evidencia\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Otro\',
\'Otro tipo de documento\');

\`\`\`

\-\--

\## 5.4 Entidades JPA

\### 5.4.1 Entidad: Usuario

\`\`\`java

\@Entity

\@Table(name = \"usuario\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

\@Builder

public class Usuario {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 50)

private String username;

\@Column(nullable = false)

private String password;

\@Column(name = \"nombre_completo\", nullable = false, length = 150)

private String nombreCompleto;

\@Column(nullable = false, length = 100)

private String email;

\@ManyToOne(fetch = FetchType.EAGER)

\@JoinColumn(name = \"rol_id\", nullable = false)

private Rol rol;

\@ManyToOne(fetch = FetchType.LAZY)

\@JoinColumn(name = \"juzgado_id\", nullable = false)

private Juzgado juzgado;

\@Column(nullable = false)

\@Builder.Default

private Boolean activo = true;

\@Column(nullable = false)

\@Builder.Default

private Boolean bloqueado = false;

\@Column(name = \"intentos_fallidos\", nullable = false)

\@Builder.Default

private Integer intentosFallidos = 0;

\@Column(name = \"fecha_bloqueo\")

private LocalDateTime fechaBloqueo;

\@Column(name = \"debe_cambiar_pass\", nullable = false)

\@Builder.Default

private Boolean debeCambiarPassword = true;

\@Column(name = \"fecha_creacion\", nullable = false, updatable = false)

private LocalDateTime fechaCreacion;

\@Column(name = \"fecha_modificacion\")

private LocalDateTime fechaModificacion;

\@PrePersist

protected void onCreate() {

fechaCreacion = LocalDateTime.now();

}

\@PreUpdate

protected void onUpdate() {

fechaModificacion = LocalDateTime.now();

}

}

\`\`\`

\### 5.4.2 Entidad: Expediente

\`\`\`java

\@Entity

\@Table(name = \"expediente\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

\@Builder

public class Expediente {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 50)

private String numero;

\@ManyToOne(fetch = FetchType.LAZY)

\@JoinColumn(name = \"tipo_proceso_id\", nullable = false)

private TipoProceso tipoProceso;

\@ManyToOne(fetch = FetchType.LAZY)

\@JoinColumn(name = \"juzgado_id\", nullable = false)

private Juzgado juzgado;

\@ManyToOne(fetch = FetchType.LAZY)

\@JoinColumn(name = \"estado_id\", nullable = false)

private Estado estado;

\@Column(name = \"fecha_inicio\", nullable = false)

private LocalDate fechaInicio;

\@Column(nullable = false, length = 500)

private String descripcion;

\@Column(length = 1000)

private String observaciones;

\@Column(name = \"referencia_sgt\", length = 50)

private String referenciaSgt;

\@Column(name = \"referencia_fuente\", length = 10)

private String referenciaFuente;

\@Column(name = \"usuario_creacion\", nullable = false, updatable =
false, length = 50)

private String usuarioCreacion;

\@Column(name = \"fecha_creacion\", nullable = false, updatable = false)

private LocalDateTime fechaCreacion;

\@Column(name = \"usuario_modificacion\", length = 50)

private String usuarioModificacion;

\@Column(name = \"fecha_modificacion\")

private LocalDateTime fechaModificacion;

\@OneToMany(mappedBy = \"expediente\", fetch = FetchType.LAZY)

\@Builder.Default

private List\<Documento\> documentos = new ArrayList\<\>();

\@PrePersist

protected void onCreate() {

fechaCreacion = LocalDateTime.now();

}

\@PreUpdate

protected void onUpdate() {

fechaModificacion = LocalDateTime.now();

}

}

\`\`\`

\### 5.4.3 Entidad: Documento

\`\`\`java

\@Entity

\@Table(name = \"documento\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

\@Builder

public class Documento {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@ManyToOne(fetch = FetchType.LAZY)

\@JoinColumn(name = \"expediente_id\", nullable = false)

private Expediente expediente;

\@ManyToOne(fetch = FetchType.LAZY)

\@JoinColumn(name = \"tipo_documento_id\")

private TipoDocumento tipoDocumento;

\@Column(name = \"nombre_original\", nullable = false, length = 255)

private String nombreOriginal;

\@Column(name = \"nombre_storage\", nullable = false, length = 100)

private String nombreStorage;

\@Column(nullable = false, length = 500)

private String ruta;

\@Column(nullable = false)

private Long tamanio;

\@Column(name = \"mime_type\", nullable = false, length = 100)

private String mimeType;

\@Column(nullable = false, length = 10)

private String extension;

\@Column(name = \"usuario_creacion\", nullable = false, updatable =
false, length = 50)

private String usuarioCreacion;

\@Column(name = \"fecha_creacion\", nullable = false, updatable = false)

private LocalDateTime fechaCreacion;

\@Column(nullable = false)

\@Builder.Default

private Boolean eliminado = false;

\@Column(name = \"usuario_eliminacion\", length = 50)

private String usuarioEliminacion;

\@Column(name = \"fecha_eliminacion\")

private LocalDateTime fechaEliminacion;

\@PrePersist

protected void onCreate() {

fechaCreacion = LocalDateTime.now();

}

/\*\*

\* Determina la categoría del documento según su extensión

\*/

public CategoriaDocumento getCategoria() {

return switch (extension.toLowerCase()) {

case \"pdf\" -\> CategoriaDocumento.PDF;

case \"doc\", \"docx\" -\> CategoriaDocumento.WORD;

case \"jpg\", \"jpeg\", \"png\", \"gif\", \"bmp\" -\>
CategoriaDocumento.IMAGEN;

case \"mp3\", \"wav\", \"ogg\" -\> CategoriaDocumento.AUDIO;

case \"mp4\", \"webm\", \"avi\", \"mov\" -\> CategoriaDocumento.VIDEO;

default -\> CategoriaDocumento.OTRO;

};

}

}

public enum CategoriaDocumento {

PDF, WORD, IMAGEN, AUDIO, VIDEO, OTRO

}

\`\`\`

\### 5.4.4 Entidad: Auditoria

\`\`\`java

\@Entity

\@Table(name = \"auditoria\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

\@Builder

public class Auditoria {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false)

private LocalDateTime fecha;

\@Column(nullable = false, length = 50)

private String usuario;

\@Column(nullable = false, length = 45)

private String ip;

\@Enumerated(EnumType.STRING)

\@Column(nullable = false, length = 50)

private Accion accion;

\@Column(nullable = false, length = 50)

private String modulo;

\@Column(name = \"recurso_id\")

private Long recursoId;

\@Lob

\@Column(name = \"valor_anterior\")

private String valorAnterior;

\@Lob

\@Column(name = \"valor_nuevo\")

private String valorNuevo;

\@Column(length = 500)

private String detalle;

\@PrePersist

protected void onCreate() {

if (fecha == null) {

fecha = LocalDateTime.now();

}

}

}

\`\`\`

\### 5.4.5 Entidades de Catálogos

\`\`\`java

// Rol

\@Entity

\@Table(name = \"cat_rol\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

public class Rol {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 50)

private String nombre;

\@Column(length = 200)

private String descripcion;

\@Column(nullable = false)

private Boolean activo = true;

}

// Juzgado

\@Entity

\@Table(name = \"cat_juzgado\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

public class Juzgado {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 20)

private String codigo;

\@Column(nullable = false, length = 200)

private String nombre;

\@Column(nullable = false)

private Boolean activo = true;

}

// TipoProceso

\@Entity

\@Table(name = \"cat_tipo_proceso\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

public class TipoProceso {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 100)

private String nombre;

\@Column(length = 300)

private String descripcion;

\@Column(nullable = false)

private Boolean activo = true;

}

// Estado

\@Entity

\@Table(name = \"cat_estado\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

public class Estado {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 50)

private String nombre;

\@Column(length = 200)

private String descripcion;

\@Column(nullable = false)

private Boolean activo = true;

}

// TipoDocumento

\@Entity

\@Table(name = \"cat_tipo_documento\")

\@Data

\@NoArgsConstructor

\@AllArgsConstructor

public class TipoDocumento {

\@Id

\@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

\@Column(nullable = false, unique = true, length = 100)

private String nombre;

\@Column(length = 300)

private String descripcion;

\@Column(nullable = false)

private Boolean activo = true;

}

\`\`\`

\-\--

\## 5.5 DTOs (Data Transfer Objects)

\### 5.5.1 DTOs de Request

\`\`\`java

// Login

\@Data

public class LoginRequest {

\@NotBlank(message = \"El usuario es requerido\")

private String username;

\@NotBlank(message = \"La contraseña es requerida\")

private String password;

}

// Cambio de contraseña

\@Data

public class CambioPasswordRequest {

\@NotBlank(message = \"La contraseña actual es requerida\")

private String passwordActual;

\@NotBlank(message = \"La nueva contraseña es requerida\")

\@Size(min = 8, message = \"La contraseña debe tener mínimo 8
caracteres\")

\@Pattern(regexp = \"\^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\\\\d).+\$\",

message = \"La contraseña debe contener mayúscula, minúscula y número\")

private String passwordNuevo;

\@NotBlank(message = \"La confirmación es requerida\")

private String passwordConfirmacion;

}

// Expediente

\@Data

public class ExpedienteRequest {

\@NotBlank(message = \"El número de expediente es requerido\")

\@Size(max = 50)

private String numero;

\@NotNull(message = \"El tipo de proceso es requerido\")

private Long tipoProcesoId;

\@NotNull(message = \"El juzgado es requerido\")

private Long juzgadoId;

\@NotNull(message = \"El estado es requerido\")

private Long estadoId;

\@NotNull(message = \"La fecha de inicio es requerida\")

private LocalDate fechaInicio;

\@NotBlank(message = \"La descripción es requerida\")

\@Size(max = 500)

private String descripcion;

\@Size(max = 1000)

private String observaciones;

\@Size(max = 50)

private String referenciaSgt;

private String referenciaFuente;

}

// Búsqueda avanzada

\@Data

public class BusquedaRequest {

private String numero;

private Long tipoProcesoId;

private Long juzgadoId;

private Long estadoId;

private LocalDate fechaDesde;

private LocalDate fechaHasta;

}

// Usuario

\@Data

public class UsuarioRequest {

\@NotBlank(message = \"El username es requerido\")

\@Size(max = 50)

private String username;

\@NotBlank(message = \"El nombre completo es requerido\")

\@Size(max = 150)

private String nombreCompleto;

\@NotBlank(message = \"El email es requerido\")

\@Email(message = \"El email no es válido\")

\@Size(max = 100)

private String email;

\@NotNull(message = \"El rol es requerido\")

private Long rolId;

\@NotNull(message = \"El juzgado es requerido\")

private Long juzgadoId;

private Boolean activo = true;

}

\`\`\`

\### 5.5.2 DTOs de Response

\`\`\`java

// Respuesta genérica

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class ApiResponse\<T\> {

private boolean success;

private String message;

private T data;

private LocalDateTime timestamp;

public static \<T\> ApiResponse\<T\> ok(T data) {

return ApiResponse.\<T\>builder()

.success(true)

.data(data)

.timestamp(LocalDateTime.now())

.build();

}

public static \<T\> ApiResponse\<T\> ok(String message, T data) {

return ApiResponse.\<T\>builder()

.success(true)

.message(message)

.data(data)

.timestamp(LocalDateTime.now())

.build();

}

public static \<T\> ApiResponse\<T\> error(String message) {

return ApiResponse.\<T\>builder()

.success(false)

.message(message)

.timestamp(LocalDateTime.now())

.build();

}

}

// Login response

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class LoginResponse {

private String token;

private String username;

private String nombreCompleto;

private String rol;

private String juzgado;

private boolean debeCambiarPassword;

}

// Expediente response

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class ExpedienteResponse {

private Long id;

private String numero;

private String tipoProceso;

private Long tipoProcesoId;

private String juzgado;

private Long juzgadoId;

private String estado;

private Long estadoId;

private LocalDate fechaInicio;

private String descripcion;

private String observaciones;

private String referenciaSgt;

private String referenciaFuente;

private String usuarioCreacion;

private LocalDateTime fechaCreacion;

private int cantidadDocumentos;

}

// Documento response

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class DocumentoResponse {

private Long id;

private String nombreOriginal;

private String tipoDocumento;

private Long tamanio;

private String mimeType;

private String extension;

private String categoria;

private String usuarioCreacion;

private LocalDateTime fechaCreacion;

}

// Usuario response

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class UsuarioResponse {

private Long id;

private String username;

private String nombreCompleto;

private String email;

private String rol;

private Long rolId;

private String juzgado;

private Long juzgadoId;

private Boolean activo;

private Boolean bloqueado;

private LocalDateTime fechaCreacion;

}

// Auditoría response

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class AuditoriaResponse {

private Long id;

private LocalDateTime fecha;

private String usuario;

private String ip;

private String accion;

private String modulo;

private Long recursoId;

private String detalle;

}

// Catálogo response (genérico)

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

public class CatalogoResponse {

private Long id;

private String nombre;

}

// SGT response

\@Data

\@AllArgsConstructor

\@NoArgsConstructor

\@Builder

public class SgtExpedienteResponse {

private String numero;

private String tipoProceso;

private String juzgado;

private String estado;

private LocalDate fechaIngreso;

private String fuente; // \"SGTV1\" o \"SGTV2\"

}

\`\`\`

\-\--

\## 5.6 Script Completo de Base de Datos

\`\`\`sql

\-- ============================================

\-- SCRIPT DE CREACIÓN DE BASE DE DATOS SGED

\-- Sistema de Gestión de Expedientes Digitales

\-- Versión: 1.0

\-- Fecha: Enero 2026

\-- ============================================

\-- Eliminar tablas si existen (solo para desarrollo)

\-- DROP TABLE auditoria CASCADE CONSTRAINTS;

\-- DROP TABLE documento CASCADE CONSTRAINTS;

\-- DROP TABLE expediente CASCADE CONSTRAINTS;

\-- DROP TABLE usuario CASCADE CONSTRAINTS;

\-- DROP TABLE cat_tipo_documento CASCADE CONSTRAINTS;

\-- DROP TABLE cat_estado CASCADE CONSTRAINTS;

\-- DROP TABLE cat_tipo_proceso CASCADE CONSTRAINTS;

\-- DROP TABLE cat_juzgado CASCADE CONSTRAINTS;

\-- DROP TABLE cat_rol CASCADE CONSTRAINTS;

\-- ============================================

\-- TABLAS DE CATÁLOGOS

\-- ============================================

CREATE TABLE cat_rol (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(50) NOT NULL UNIQUE,

descripcion VARCHAR2(200),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_juzgado (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

codigo VARCHAR2(20) NOT NULL UNIQUE,

nombre VARCHAR2(200) NOT NULL,

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_tipo_proceso (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(100) NOT NULL UNIQUE,

descripcion VARCHAR2(300),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_estado (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(50) NOT NULL UNIQUE,

descripcion VARCHAR2(200),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_tipo_documento (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(100) NOT NULL UNIQUE,

descripcion VARCHAR2(300),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

\-- ============================================

\-- TABLA USUARIO

\-- ============================================

CREATE TABLE usuario (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

username VARCHAR2(50) NOT NULL UNIQUE,

password VARCHAR2(255) NOT NULL,

nombre_completo VARCHAR2(150) NOT NULL,

email VARCHAR2(100) NOT NULL,

rol_id NUMBER(19) NOT NULL,

juzgado_id NUMBER(19) NOT NULL,

activo NUMBER(1) DEFAULT 1 NOT NULL,

bloqueado NUMBER(1) DEFAULT 0 NOT NULL,

intentos_fallidos NUMBER(2) DEFAULT 0 NOT NULL,

fecha_bloqueo TIMESTAMP,

debe_cambiar_pass NUMBER(1) DEFAULT 1 NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

fecha_modificacion TIMESTAMP,

CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES cat_rol(id),

CONSTRAINT fk_usuario_juzgado FOREIGN KEY (juzgado_id) REFERENCES
cat_juzgado(id)

);

CREATE INDEX idx_usuario_username ON usuario(username);

CREATE INDEX idx_usuario_rol ON usuario(rol_id);

CREATE INDEX idx_usuario_juzgado ON usuario(juzgado_id);

CREATE INDEX idx_usuario_activo ON usuario(activo);

\-- ============================================

\-- TABLA EXPEDIENTE

\-- ============================================

CREATE TABLE expediente (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

numero VARCHAR2(50) NOT NULL UNIQUE,

tipo_proceso_id NUMBER(19) NOT NULL,

juzgado_id NUMBER(19) NOT NULL,

estado_id NUMBER(19) NOT NULL,

fecha_inicio DATE NOT NULL,

descripcion VARCHAR2(500) NOT NULL,

observaciones VARCHAR2(1000),

referencia_sgt VARCHAR2(50),

referencia_fuente VARCHAR2(10),

usuario_creacion VARCHAR2(50) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

usuario_modificacion VARCHAR2(50),

fecha_modificacion TIMESTAMP,

CONSTRAINT fk_expediente_tipo FOREIGN KEY (tipo_proceso_id) REFERENCES
cat_tipo_proceso(id),

CONSTRAINT fk_expediente_juzgado FOREIGN KEY (juzgado_id) REFERENCES
cat_juzgado(id),

CONSTRAINT fk_expediente_estado FOREIGN KEY (estado_id) REFERENCES
cat_estado(id),

CONSTRAINT chk_ref_fuente CHECK (referencia_fuente IN (\'SGTV1\',
\'SGTV2\') OR referencia_fuente IS NULL)

);

CREATE INDEX idx_expediente_numero ON expediente(numero);

CREATE INDEX idx_expediente_tipo ON expediente(tipo_proceso_id);

CREATE INDEX idx_expediente_juzgado ON expediente(juzgado_id);

CREATE INDEX idx_expediente_estado ON expediente(estado_id);

CREATE INDEX idx_expediente_fecha ON expediente(fecha_inicio);

CREATE INDEX idx_expediente_creacion ON expediente(fecha_creacion);

\-- ============================================

\-- TABLA DOCUMENTO

\-- ============================================

CREATE TABLE documento (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

expediente_id NUMBER(19) NOT NULL,

tipo_documento_id NUMBER(19),

nombre_original VARCHAR2(255) NOT NULL,

nombre_storage VARCHAR2(100) NOT NULL,

ruta VARCHAR2(500) NOT NULL,

tamanio NUMBER(19) NOT NULL,

mime_type VARCHAR2(100) NOT NULL,

extension VARCHAR2(10) NOT NULL,

usuario_creacion VARCHAR2(50) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

eliminado NUMBER(1) DEFAULT 0 NOT NULL,

usuario_eliminacion VARCHAR2(50),

fecha_eliminacion TIMESTAMP,

CONSTRAINT fk_documento_expediente FOREIGN KEY (expediente_id)
REFERENCES expediente(id),

CONSTRAINT fk_documento_tipo FOREIGN KEY (tipo_documento_id) REFERENCES
cat_tipo_documento(id)

);

CREATE INDEX idx_documento_expediente ON documento(expediente_id);

CREATE INDEX idx_documento_tipo ON documento(tipo_documento_id);

CREATE INDEX idx_documento_eliminado ON documento(eliminado);

CREATE INDEX idx_documento_creacion ON documento(fecha_creacion);

CREATE INDEX idx_documento_extension ON documento(extension);

\-- ============================================

\-- TABLA AUDITORIA

\-- ============================================

CREATE TABLE auditoria (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

usuario VARCHAR2(50) NOT NULL,

ip VARCHAR2(45) NOT NULL,

accion VARCHAR2(50) NOT NULL,

modulo VARCHAR2(50) NOT NULL,

recurso_id NUMBER(19),

valor_anterior CLOB,

valor_nuevo CLOB,

detalle VARCHAR2(500)

);

CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario);

CREATE INDEX idx_auditoria_accion ON auditoria(accion);

CREATE INDEX idx_auditoria_modulo ON auditoria(modulo);

CREATE INDEX idx_auditoria_recurso ON auditoria(recurso_id);

\-- ============================================

\-- DATOS INICIALES

\-- ============================================

\-- Roles

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'ADMINISTRADOR\',
\'Administrador del sistema con acceso total\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'SECRETARIO\',
\'Secretario judicial con gestión de expedientes\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'AUXILIAR\',
\'Auxiliar judicial con permisos básicos\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'CONSULTA\',
\'Usuario de solo consulta\');

\-- Juzgados (ejemplo)

INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-CIV-01\',
\'Juzgado Primero Civil\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-CIV-02\',
\'Juzgado Segundo Civil\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-PEN-01\',
\'Juzgado Primero Penal\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-PEN-02\',
\'Juzgado Segundo Penal\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-LAB-01\',
\'Juzgado Primero Laboral\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-FAM-01\',
\'Juzgado Primero de Familia\');

\-- Nota: los códigos siguen el patrón <JUZ>-<JURISDICCIÓN>-<NÚMERO>.

\-- Tipos de proceso

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Civil\',
\'Procesos civiles y mercantiles\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Penal\',
\'Procesos penales\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Laboral\',
\'Procesos laborales\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Familia\',
\'Procesos de familia\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Contencioso
Administrativo\', \'Procesos contencioso administrativos\');

\-- Estados

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Activo\',
\'Expediente en trámite activo\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'En espera\',
\'Expediente en espera de resolución\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Suspendido\',
\'Expediente suspendido temporalmente\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Cerrado\',
\'Expediente cerrado/finalizado\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Archivado\',
\'Expediente archivado definitivamente\');

\-- Tipos de documento

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Demanda\', \'Documento de demanda inicial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Contestación\', \'Contestación a la demanda\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Resolución\', \'Resolución judicial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Sentencia\', \'Sentencia del caso\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Notificación\', \'Notificación oficial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Prueba
documental\', \'Documento probatorio\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Prueba
multimedia\', \'Audio, video o imagen como evidencia\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Escrito\', \'Escrito de las partes\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Otro\',
\'Otro tipo de documento\');

\-- Usuario administrador inicial (contraseña: Admin123\*)

\-- BCrypt hash de \'Admin123\*\'

INSERT INTO usuario (username, password, nombre_completo, email, rol_id,
juzgado_id, debe_cambiar_pass)

VALUES (\'admin\',
\'\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.GQBXHn0eX7Hnm2\',

\'Administrador del Sistema\', \'admin@oj.gob.gt\', 1, 1, 1);

COMMIT;

\-- ============================================

\-- VISTAS (OPCIONALES)

\-- ============================================

\-- Vista de expedientes con datos completos

CREATE OR REPLACE VIEW v_expediente_completo AS

SELECT

e.id,

e.numero,

tp.nombre AS tipo_proceso,

j.nombre AS juzgado,

es.nombre AS estado,

e.fecha_inicio,

e.descripcion,

e.usuario_creacion,

e.fecha_creacion,

(SELECT COUNT(\*) FROM documento d WHERE d.expediente_id = e.id AND
d.eliminado = 0) AS cantidad_documentos

FROM expediente e

JOIN cat_tipo_proceso tp ON e.tipo_proceso_id = tp.id

JOIN cat_juzgado j ON e.juzgado_id = j.id

JOIN cat_estado es ON e.estado_id = es.id;

\-- Vista de documentos activos

CREATE OR REPLACE VIEW v_documento_activo AS

SELECT

d.id,

d.expediente_id,

e.numero AS expediente_numero,

d.nombre_original,

td.nombre AS tipo_documento,

d.tamanio,

d.extension,

d.mime_type,

d.usuario_creacion,

d.fecha_creacion

FROM documento d

JOIN expediente e ON d.expediente_id = e.id

LEFT JOIN cat_tipo_documento td ON d.tipo_documento_id = td.id

WHERE d.eliminado = 0;

\-- ============================================

\-- FIN DEL SCRIPT

\-- ============================================

\`\`\`

\-\--

\## 5.7 Resumen del Modelo de Datos

\### Tablas del Sistema

\| Tabla \| Descripción \| Registros estimados \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| usuario \| Usuarios del sistema \| 50-200 \|

\| expediente \| Expedientes digitales \| 10,000-500,000 \|

\| documento \| Archivos adjuntos \| 50,000-2,000,000 \|

\| auditoria \| Logs de operaciones \| 1,000,000+ \|

\| cat_rol \| Roles (4 fijos) \| 4 \|

\| auth_attempt \| Intentos de autenticación \| 10,000+ \|

\| revoked_token \| Tokens JWT revocados \| 1,000+ \|

\| cat_juzgado \| Juzgados \| 20-100 \|

\| cat_tipo_proceso \| Tipos de proceso \| 10-20 \|

\| cat_estado \| Estados de expediente \| 5-10 \|

\| cat_tipo_documento \| Tipos de documento \| 10-20 \|

\### Tablas de seguridad y auditoría (Oracle / SGED)

**cat_rol**

- `id`, `nombre`, `descripcion`, `activo`
- Contiene los 4 roles oficiales SGED.
  - ADMINISTRADOR: acceso total y administración.
  - SECRETARIO: gestión completa de expedientes y documentos.
  - AUXILIAR: crear expedientes, cargar documentos, consultar.
  - CONSULTA: solo lectura.

**usuario**

- `id`, `username`, `password`, `nombre_completo`, `email`, `rol_id`
- Flags: `activo`, `bloqueado`, `intentos_fallidos`, `fecha_bloqueo`, `debe_cambiar_pass`
- Relación 1:N con `cat_rol`

**auth_attempt**

- `id`, `username`, `intento_exitoso`, `ip`, `fecha_intento`
- Soporta lockout por 5 intentos fallidos.

**revoked_token**

- `id`, `token_jti`, `fecha_revocacion`, `fecha_expiracion`
- Blacklist para JWT revocados (logout o rotación).

**auditoria**

- `id`, `fecha`, `usuario`, `ip`, `accion`, `modulo`, `recurso_id`
- `valor_anterior`, `valor_nuevo`, `detalle` para trazabilidad.
- Inmutable: solo INSERT desde backend.

> Nota: Estas tablas se usan por el backend **Java/Oracle** vigente de SGED.
> (Versiones anteriores consideraban un auth-service Python/PostgreSQL independiente, decisión que fue descartada en Fase 1.)


\### Relaciones Principales

\`\`\`

cat_rol (1) ─────────────────────► (N) usuario

usuario (1) ─────────────────────► (N) auth_attempt (por username)

cat_juzgado (1) ──────────────────► (N) usuario

cat_juzgado (1) ──────────────────► (N) expediente

cat_tipo_proceso (1) ─────────────► (N) expediente

cat_estado (1) ───────────────────► (N) expediente

expediente (1) ───────────────────► (N) documento

cat_tipo_documento (1) ───────────► (N) documento

\`\`\`

\### Índices Críticos

\| Tabla \| Índice \| Propósito \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| expediente \| idx_expediente_numero \| Búsqueda por número \|

\| expediente \| idx_expediente_fecha \| Ordenamiento y filtros \|

\| documento \| idx_documento_expediente \| Listado por expediente \|

\| documento \| idx_documento_eliminado \| Filtrar activos \|

\| usuario \| idx_usuario_username \| Búsqueda por username \|

\| auth_attempt \| idx_auth_attempt_username \| Conteo por usuario/fecha \|

\| revoked_token \| idx_revoked_token_jti \| Validación de token revocado \|

\| auditoria \| idx_auditoria_fecha \| Consulta por período \|

\| auditoria \| idx_auditoria_usuario \| Consulta por usuario \|

\### Uso en Fase 1 (conceptual)

- **Login:** inserta en `auth_attempt`, valida `usuario`, genera JWT y registra en `auditoria`.
- **Lockout:** incrementa `usuario.intentos_fallidos` y, al acumular 5, actualiza `usuario.bloqueado` y `fecha_bloqueo`.
- **Logout:** inserta `token_jti` en `revoked_token`, registra evento en `auditoria`.
- **Cambio de contraseña:** actualiza `usuario.password` y `debe_cambiar_pass`, registra evento en `auditoria`.
- **Auditoría general:** se registran **operaciones exitosas** sobre recursos sensibles; fallos (403/404) se rastrean vía logs (`request_id`, `user_id`).
- **Expedientes (Fase 2):**
  - Se audita **solo** si la operación es exitosa: `CREAR_EXPEDIENTE`, `EDITAR_EXPEDIENTE`, `VER_EXPEDIENTE` (ID existente y autorizado).
  - **No** se crea auditoría para `404` (expediente inexistente) ni para `403` (RBAC).
  - Estos intentos se registran en **logging de aplicación** (JSON con `request_id` y `user_id` en MDC; ver 6.2.4).
  - Ver estrategia de pruebas Fase 2 en sección **9.3.1** (validación de no auditoría en 404).

\### Consistencia y notas históricas

- **user_roles vs rol_id:** el modelo Oracle aprobado no usa tabla `user_roles`; cada `usuario` tiene **un solo rol** vía `rol_id`.
- **audit_logs vs auditoria:** en Java/Oracle se usa `auditoria`. *(Nota: versiones anteriores consideraban auth-service Python que usaba `audit_logs` en PostgreSQL; esta decisión fue descartada.)*
- **auth_attempt(s) y revoked_token(s):** Oracle usa singular `auth_attempt`/`revoked_token` (vigente en Java/Spring Boot). *(Nota histórica: auth-service Python usaba plural `auth_attempts`/`revoked_tokens`.)*
- **Decisión:** La autenticación está integrada 100% en backend Java con Spring Security + JJWT. No hay componente Python separado.


------------------------------------------------------------------------

## \# SECCIÓN 6: DISEÑO DE APIs

\-\--

\## 6.1 Estándares y Convenciones

\### 6.1.1 Formato de URLs

\`\`\`

Base URL: /api/v1

Convenciones:

\- Sustantivos en plural para recursos: /expedientes, /documentos,
/usuarios

\- Minúsculas y guiones para separar palabras: /cambiar-password

\- IDs en la ruta para recursos específicos: /expedientes/{id}

\- Recursos anidados cuando hay relación directa:
/expedientes/{id}/documentos

\`\`\`

\*\*Ejemplos:\*\*

\| Recurso \| URL \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\--\|

\| Lista de expedientes \| GET /api/v1/expedientes \|

\| Expediente específico \| GET /api/v1/expedientes/123 \|

\| Documentos de un expediente \| GET /api/v1/expedientes/123/documentos
\|

\| Documento específico \| GET /api/v1/documentos/456 \|

\### 6.1.2 Métodos HTTP

\| Método \| Uso \| Ejemplo \|

\|\-\-\-\-\-\-\--\|\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| GET \| Obtener recursos \| GET /expedientes \|

\| POST \| Crear recurso \| POST /expedientes \|

\| PUT \| Actualizar recurso completo \| PUT /expedientes/123 \|

\| DELETE \| Eliminar recurso \| DELETE /documentos/456 \|

\### 6.1.3 Códigos de Respuesta

\| Código \| Significado \| Uso \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\--\|

\| 200 \| OK \| Operación exitosa \|

\| 201 \| Created \| Recurso creado \|

\| 204 \| No Content \| Eliminación exitosa \|

\| 400 \| Bad Request \| Datos inválidos \|

\| 401 \| Unauthorized \| No autenticado \|

\| 403 \| Forbidden \| Sin permisos \|

\| 404 \| Not Found \| Recurso no existe \|

\| 500 \| Internal Server Error \| Error del servidor \|

\### 6.1.4 Formato de Respuestas

\*\*Respuesta exitosa:\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Operación exitosa\",

\"data\": { \... },

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Respuesta con paginación:\*\*

\`\`\`json

{

\"success\": true,

\"data\": {

\"content\": \[ \... \],

\"page\": 0,

\"size\": 10,

\"totalElements\": 150,

\"totalPages\": 15

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Respuesta de error:\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Descripción del error\",

\"errors\": \[
\"El número de expediente ya existe\"

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\## 6.2 API de Autenticación

\### 6.2.1 POST /api/v1/auth/login

\*\*Descripción:\*\* Autenticar usuario y obtener token JWT.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/auth/login

Content-Type: application/json

{

\"username\": \"jperez\",

\"password\": \"MiPassword123\"

}

\`\`\`

\*\*Nota:\*\* `numero` no es editable en backend; cualquier cambio enviado en `PUT` se ignora.

\*\*Response exitoso (200):\*\*

> `data` retorna un objeto `Page<ExpedienteResponse>` con `content`, `page`, `size`, `totalElements`, `totalPages`.

> `data` retorna un objeto `Page<ExpedienteResponse>` con `content`, `page`, `size`, `totalElements`, `totalPages`.

\`\`\`json

{

\"success\": true,

\"data\": {

\"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\...\",

\"username\": \"jperez\",

\"nombreCompleto\": \"Juan Pérez\",

\"rol\": \"SECRETARIO\",

\"juzgado\": \"Juzgado Primero Civil\",

\"debeCambiarPassword\": false

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error (401):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Usuario o contraseña incorrectos\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response cuenta bloqueada (401):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Cuenta bloqueada. Contacte al administrador\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.2.2 POST /api/v1/auth/logout

\*\*Descripción:\*\* Cerrar sesión e invalidar token.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/auth/logout

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Sesión cerrada correctamente\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error validación (400):\*\* `errors` es `string[]`.

\*\*Response prohibido (403):\*\* Acción no permitida o expediente de otro juzgado.

\*\*Response no encontrado (404):\*\* ID inexistente. No genera auditoría (solo logging).

\-\--

\### 6.2.3 POST /api/v1/auth/cambiar-password

\*\*Descripción:\*\* Cambiar contraseña del usuario actual.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/auth/cambiar-password

Authorization: Bearer {token}

Content-Type: application/json

{

\"passwordActual\": \"MiPasswordActual123\",

\"passwordNuevo\": \"MiNuevoPassword456\",

\"passwordConfirmacion\": \"MiNuevoPassword456\"

}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Contraseña actualizada correctamente\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error validación (400):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Error de validación\",

\"errors\": \[
\"La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número\"
\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response prohibido (403):\*\* Acción no permitida o expediente de otro juzgado.

\*\*Response no encontrado (404):\*\* ID inexistente. No genera auditoría (solo logging).

\-\--

\### 6.2.4 Reglas de seguridad aplicadas (Fase 1)

- **JWT 8h:** `Authorization: Bearer {token}` en cada request autenticado.
- **Lockout:** cuenta bloqueada tras 5 intentos fallidos (registro en `auth_attempt`).
- **Revocación:** logout inserta `jti` en `revoked_token`; cada request valida blacklist.
- **Auditoría:** eventos `LOGIN_EXITOSO`, `LOGIN_FALLIDO`, `LOGOUT`, `CAMBIO_PASSWORD` en `auditoria`.
- **MDC/logging:** `request_id` y `user_id` se propagan para trazabilidad.

\## 6.3 API de Expedientes

\### 6.3.1 GET /api/v1/expedientes

\*\*Descripción:\*\* Listar expedientes con paginación y ordenamiento.

\*\*Parámetros de query:\*\*

\| Parámetro \| Tipo \| Default \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| page \| int \| 0 \| Número de página (0-based) \|

\| size \| int \| 10 \| Elementos por página \|

\| sort \| string \| fechaCreacion,desc \| Campo y dirección (`campo,dir`) \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/expedientes?page=0&size=10&sort=fechaCreacion,desc

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": {

\"content\": \[

{

\"id\": 1,

\"numero\": \"12345-2026-00001\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"Activo\",

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-15\",

\"descripcion\": \"Demanda por incumplimiento de contrato\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-15T09:30:00\",

\"cantidadDocumentos\": 5

},

{

\"id\": 2,

\"numero\": \"12345-2026-00002\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"Activo\",

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-16\",

\"descripcion\": \"Juicio ordinario de daños y perjuicios\",

\"usuarioCreacion\": \"mgarcia\",

\"fechaCreacion\": \"2026-01-16T11:00:00\",

\"cantidadDocumentos\": 3

}

\],

\"page\": 0,

\"size\": 10,

\"totalElements\": 150,

\"totalPages\": 15

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.3.2 GET /api/v1/expedientes/{id}

\*\*Descripción:\*\* Obtener detalle de un expediente.

\*\*Request:\*\*

\`\`\`http

GET /api/v1/expedientes/1

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": {

\"id\": 1,

\"numero\": \"12345-2026-00001\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"Activo\",

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-15\",

\"descripcion\": \"Demanda por incumplimiento de contrato\",

\"observaciones\": \"Pendiente de notificación a la parte demandada\",

\"referenciaSgt\": \"CIV-2026-001234\",

\"referenciaFuente\": \"SGTV2\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-15T09:30:00\",

\"usuarioModificacion\": \"mgarcia\",

\"fechaModificacion\": \"2026-01-20T14:15:00\",

\"cantidadDocumentos\": 5

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response no encontrado (404):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Expediente no encontrado\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response prohibido (403):\*\* Acceso a expediente de otro juzgado o acción no permitida.
\*\*Nota:\*\* 404/403 no generan auditoría (solo logging).

\-\--

\### 6.3.3 POST /api/v1/expedientes

\*\*Descripción:\*\* Crear nuevo expediente.

\*\*Permisos:\*\* ADMINISTRADOR, SECRETARIO, AUXILIAR

\*\*Request:\*\*

\`\`\`http

POST /api/v1/expedientes

Authorization: Bearer {token}

Content-Type: application/json

{

\"numero\": \"12345-2026-00003\",

\"tipoProcesoId\": 1,

\"juzgadoId\": 1,

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-23\",

\"descripcion\": \"Demanda ordinaria por cobro de deuda\",

\"observaciones\": \"Demandante: Juan López, Demandado: María Pérez\",

\"referenciaSgt\": null,

\"referenciaFuente\": null

}

\`\`\`

\*\*Notas:\*\*

- `numero` es **requerido** en creación.
- Si el cliente envía `numero` en edición, el backend lo **ignora** (campo no editable).

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Expediente creado exitosamente\",

\"data\": {

\"id\": 3,

\"numero\": \"12345-2026-00003\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"Activo\",

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-23\",

\"descripcion\": \"Demanda ordinaria por cobro de deuda\",

\"observaciones\": \"Demandante: Juan López, Demandado: María Pérez\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-23T10:30:00\",

\"cantidadDocumentos\": 0

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error validación (400):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Error de validación\",

\"errors\": \[
\"El número de expediente ya existe\"
\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.3.4 PUT /api/v1/expedientes/{id}

\*\*Descripción:\*\* Actualizar expediente existente.

\*\*Permisos:\*\* ADMINISTRADOR, SECRETARIO

\*\*Request:\*\*

\`\`\`http

PUT /api/v1/expedientes/1

Authorization: Bearer {token}

Content-Type: application/json

{

\"tipoProcesoId\": 1,

\"juzgadoId\": 1,

\"estadoId\": 2,

\"fechaInicio\": \"2026-01-15\",

\"descripcion\": \"Demanda por incumplimiento de contrato
(actualizada)\",

\"observaciones\": \"Se notificó a la parte demandada el 20/01/2026\",

\"referenciaSgt\": \"CIV-2026-001234\",

\"referenciaFuente\": \"SGTV2\"

}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Expediente actualizado exitosamente\",

\"data\": {

\"id\": 1,

\"numero\": \"12345-2026-00001\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"En espera\",

\"estadoId\": 2,

\"fechaInicio\": \"2026-01-15\",

\"descripcion\": \"Demanda por incumplimiento de contrato
(actualizada)\",

\"observaciones\": \"Se notificó a la parte demandada el 20/01/2026\",

\"referenciaSgt\": \"CIV-2026-001234\",

\"referenciaFuente\": \"SGTV2\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-15T09:30:00\",

\"usuarioModificacion\": \"mgarcia\",

\"fechaModificacion\": \"2026-01-23T10:35:00\",

\"cantidadDocumentos\": 5

},

\"timestamp\": \"2026-01-23T10:35:00\"

}

\`\`\`

\-\--

\## 6.4 API de Documentos

\### 6.4.1 GET /api/v1/expedientes/{id}/documentos

\*\*Descripción:\*\* Listar documentos de un expediente.

\*\*Request:\*\*

\`\`\`http

GET /api/v1/expedientes/1/documentos

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": \[

{

\"id\": 1,

\"nombreOriginal\": \"Demanda_inicial.pdf\",

\"tipoDocumento\": \"Demanda\",

\"tipoDocumentoId\": 1,

\"tamanio\": 1548576,

\"mimeType\": \"application/pdf\",

\"extension\": \"pdf\",

\"categoria\": \"PDF\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-15T09:35:00\"

},

{

\"id\": 2,

\"nombreOriginal\": \"Contrato_original.pdf\",

\"tipoDocumento\": \"Prueba documental\",

\"tipoDocumentoId\": 6,

\"tamanio\": 2097152,

\"mimeType\": \"application/pdf\",

\"extension\": \"pdf\",

\"categoria\": \"PDF\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-15T09:40:00\"

},

{

\"id\": 3,

\"nombreOriginal\": \"Foto_evidencia.jpg\",

\"tipoDocumento\": \"Prueba multimedia\",

\"tipoDocumentoId\": 7,

\"tamanio\": 524288,

\"mimeType\": \"image/jpeg\",

\"extension\": \"jpg\",

\"categoria\": \"IMAGEN\",

\"usuarioCreacion\": \"mgarcia\",

\"fechaCreacion\": \"2026-01-16T10:00:00\"

}

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.4.2 POST /api/v1/expedientes/{id}/documentos

\*\*Descripción:\*\* Cargar documento a un expediente.

\*\*Permisos:\*\* ADMINISTRADOR, SECRETARIO, AUXILIAR

\*\*Request:\*\*

\`\`\`http

POST /api/v1/expedientes/1/documentos

Authorization: Bearer {token}

Content-Type: multipart/form-data

file: \[archivo binario\]

tipoDocumentoId: 1

\`\`\`

\*\*Response exitoso (201):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Documento cargado exitosamente\",

\"data\": {

\"id\": 4,

\"nombreOriginal\": \"Resolucion_admision.pdf\",

\"tipoDocumento\": \"Resolución\",

\"tipoDocumentoId\": 3,

\"tamanio\": 758432,

\"mimeType\": \"application/pdf\",

\"extension\": \"pdf\",

\"categoria\": \"PDF\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-23T10:45:00\"

},

\"timestamp\": \"2026-01-23T10:45:00\"

}

\`\`\`

\*\*Response error formato (400):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Formato de archivo no permitido. Formatos válidos: pdf,
doc, docx, jpg, jpeg, png, gif, bmp, mp3, wav, ogg, mp4, webm, avi,
mov\",

\"timestamp\": \"2026-01-23T10:45:00\"

}

\`\`\`

\*\*Response error tamaño (400):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"El archivo excede el tamaño máximo permitido (100 MB)\",

\"timestamp\": \"2026-01-23T10:45:00\"

}

\`\`\`

\-\--

\### 6.4.3 GET /api/v1/documentos/{id}

\*\*Descripción:\*\* Obtener metadatos de un documento.

\*\*Request:\*\*

\`\`\`http

GET /api/v1/documentos/1

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": {

\"id\": 1,

\"expedienteId\": 1,

\"expedienteNumero\": \"12345-2026-00001\",

\"nombreOriginal\": \"Demanda_inicial.pdf\",

\"tipoDocumento\": \"Demanda\",

\"tipoDocumentoId\": 1,

\"tamanio\": 1548576,

\"mimeType\": \"application/pdf\",

\"extension\": \"pdf\",

\"categoria\": \"PDF\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-15T09:35:00\"

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.4.4 GET /api/v1/documentos/{id}/contenido

\*\*Descripción:\*\* Descargar/visualizar contenido del documento.

\*\*Parámetros de query:\*\*

\| Parámetro \| Tipo \| Default \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| modo \| string \| inline \| inline (visualizar) o attachment
(descargar) \|

\*\*Request para visualizar:\*\*

\`\`\`http

GET /api/v1/documentos/1/contenido?modo=inline

Authorization: Bearer {token}

\`\`\`

\*\*Request para descargar:\*\*

\`\`\`http

GET /api/v1/documentos/1/contenido?modo=attachment

Authorization: Bearer {token}

\`\`\`

\*\*Response:\*\*

\`\`\`http

HTTP/1.1 200 OK

Content-Type: application/pdf

Content-Disposition: inline; filename=\"Demanda_inicial.pdf\"

Content-Length: 1548576

\[contenido binario del archivo\]

\`\`\`

\-\--

\### 6.4.5 DELETE /api/v1/documentos/{id}

\*\*Descripción:\*\* Eliminar documento (eliminación lógica).

\*\*Permisos:\*\* ADMINISTRADOR, SECRETARIO

\*\*Request:\*\*

\`\`\`http

DELETE /api/v1/documentos/1

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Documento eliminado exitosamente\",

\"timestamp\": \"2026-01-23T10:50:00\"

}

\`\`\`

\-\--

\## 6.5 API de Búsqueda

\### 6.5.1 GET /api/v1/busqueda/rapida

\*\*Descripción:\*\* Búsqueda rápida por número de expediente.

\*\*Parámetros de query:\*\*

\| Parámetro \| Tipo \| Requerido \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| q \| string \| Sí \| Texto a buscar \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/busqueda/rapida?q=12345-2026

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": \[

{

\"id\": 1,

\"numero\": \"12345-2026-00001\",

\"tipoProceso\": \"Civil\",

\"juzgado\": \"Juzgado Primero Civil\",

\"estado\": \"Activo\",

\"fechaInicio\": \"2026-01-15\"

},

{

\"id\": 2,

\"numero\": \"12345-2026-00002\",

\"tipoProceso\": \"Civil\",

\"juzgado\": \"Juzgado Primero Civil\",

\"estado\": \"Activo\",

\"fechaInicio\": \"2026-01-16\"

},

{

\"id\": 3,

\"numero\": \"12345-2026-00003\",

\"tipoProceso\": \"Civil\",

\"juzgado\": \"Juzgado Primero Civil\",

\"estado\": \"Activo\",

\"fechaInicio\": \"2026-01-23\"

}

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response sin resultados (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": \[\],

\"message\": \"No se encontraron resultados\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.5.2 POST /api/v1/busqueda/avanzada

\*\*Descripción:\*\* Búsqueda avanzada con múltiples filtros.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/busqueda/avanzada

Authorization: Bearer {token}

Content-Type: application/json

{

\"numero\": \"12345\",

\"tipoProcesoId\": 1,

\"juzgadoId\": null,

\"estadoId\": 1,

\"fechaDesde\": \"2026-01-01\",

\"fechaHasta\": \"2026-01-31\",

\"page\": 0,

\"size\": 10,

\"sort\": \"fechaInicio,desc\"

}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": {

\"content\": \[

{

\"id\": 3,

\"numero\": \"12345-2026-00003\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"Activo\",

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-23\",

\"descripcion\": \"Demanda ordinaria por cobro de deuda\",

\"usuarioCreacion\": \"jperez\",

\"fechaCreacion\": \"2026-01-23T10:30:00\",

\"cantidadDocumentos\": 0

},

{

\"id\": 2,

\"numero\": \"12345-2026-00002\",

\"tipoProceso\": \"Civil\",

\"tipoProcesoId\": 1,

\"juzgado\": \"Juzgado Primero Civil\",

\"juzgadoId\": 1,

\"estado\": \"Activo\",

\"estadoId\": 1,

\"fechaInicio\": \"2026-01-16\",

\"descripcion\": \"Juicio ordinario de daños y perjuicios\",

\"usuarioCreacion\": \"mgarcia\",

\"fechaCreacion\": \"2026-01-16T11:00:00\",

\"cantidadDocumentos\": 3

}

\],

\"page\": 0,

\"size\": 10,

\"totalElements\": 2,

\"totalPages\": 1

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\## 6.6 API de Integración SGT

\### 6.6.1 GET /api/v1/sgt/buscar

\*\*Descripción:\*\* Buscar expediente en sistemas SGTv1 y SGTv2.

\*\*Parámetros de query:\*\*

\| Parámetro \| Tipo \| Requerido \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| numero \| string \| Sí \| Número de expediente a buscar \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/sgt/buscar?numero=CIV-2026-001234

Authorization: Bearer {token}

\`\`\`

\*\*Response encontrado (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": {

\"numero\": \"CIV-2026-001234\",

\"tipoProceso\": \"Civil Ordinario\",

\"juzgado\": \"Juzgado Primero Civil\",

\"estado\": \"En trámite\",

\"fechaIngreso\": \"2026-01-10\",

\"fuente\": \"SGTV2\"

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response no encontrado (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": null,

\"message\": \"Expediente no encontrado en SGTv1 ni SGTv2\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response sistema no disponible (503):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Los sistemas SGT no están disponibles en este momento\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\## 6.7 API de Administración (Fase 5 - HU-016, HU-017, HU-018)

**Nota:** Todos los endpoints bajo `/api/v1/admin/**` requieren autenticación y el rol **ADMINISTRADOR**. Consultar la sección 7 para matriz de permisos.

\### 6.7.1 GET /api/v1/admin/usuarios

\*\*Descripción:\*\* Listar usuarios del sistema con filtros y paginación (HU-016).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

\*\*Parámetros de query opcionales:\*\*

\| Parámetro \| Tipo \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| rolId \| Long \| Filtrar por rol ID \|

\| juzgadoId \| Long \| Filtrar por juzgado ID \|

\| activo \| Boolean \| Filtrar por estado activo/inactivo \|

\| bloqueado \| Boolean \| Filtrar por estado bloqueado \|

\| username \| String \| Búsqueda por username (contiene) \|

\| page \| int \| Número de página (default 0) \|

\| size \| int \| Elementos por página (default 20) \|

\| sort \| String \| Campo y dirección (default "id,asc") \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/admin/usuarios?page=0&size=10&activo=true&sort=username,asc

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Usuarios listados correctamente\",

\"data\": {

\"content\": \[

{

\"id\": 1,

\"username\": \"admin\",

\"nombreCompleto\": \"Administrador del Sistema\",

\"email\": \"admin@oj.gob.gt\",

\"rol\": \"ADMINISTRADOR\",

\"juzgado\": \"Juzgado Primero Civil\",

\"activo\": true,

\"bloqueado\": false,

\"intentosFallidos\": 0,

\"debeCambiarPassword\": false,

\"fechaCreacion\": \"2026-01-01T00:00:00\",

\"fechaModificacion\": \"2026-01-15T14:30:00\"

},

{

\"id\": 2,

\"username\": \"jperez\",

\"nombreCompleto\": \"Juan Pérez\",

\"email\": \"jperez@oj.gob.gt\",

\"rol\": \"SECRETARIO\",

\"juzgado\": \"Juzgado Primero Civil\",

\"activo\": true,

\"bloqueado\": false,

\"intentosFallidos\": 0,

\"debeCambiarPassword\": false,

\"fechaCreacion\": \"2026-01-10T09:00:00\",

\"fechaModificacion\": null

}

\],

\"pageable\": {

\"pageNumber\": 0,

\"pageSize\": 10,

\"sort\": \"username,asc\"

},

\"totalElements\": 15,

\"totalPages\": 2

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error (403) - Permiso denegado:\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Acceso denegado\",

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.7.2 POST /api/v1/admin/usuarios

\*\*Descripción:\*\* Crear nuevo usuario (HU-016).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

\*\*Request body (validado):\*\*

\| Campo \| Tipo \| Validación \| Requerido \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| username \| String \| 3-50 caracteres, único \| Sí \|

\| nombreCompleto \| String \| 5-150 caracteres \| Sí \|

\| email \| String \| Email válido, máx 100 chars \| Sí \|

\| rolId \| Long \| Debe existir en cat_rol \| Sí \|

\| juzgadoId \| Long \| Debe existir en cat_juzgado \| Sí \|

\*\*Request:\*\*

\`\`\`http

POST /api/v1/admin/usuarios

Authorization: Bearer {token}

Content-Type: application/json

{

\"username\": \"mgarcia\",

\"nombreCompleto\": \"María García López\",

\"email\": \"mgarcia@oj.gob.gt\",

\"rolId\": 2,

\"juzgadoId\": 1

}

\`\`\`

\*\*Response exitoso (201):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Usuario creado correctamente\",

\"data\": {

\"id\": 3,

\"username\": \"mgarcia\",

\"nombreCompleto\": \"María García López\",

\"email\": \"mgarcia@oj.gob.gt\",

\"rol\": \"SECRETARIO\",

\"juzgado\": \"Juzgado Primero Civil\",

\"activo\": true,

\"bloqueado\": false,

\"intentosFallidos\": 0,

\"debeCambiarPassword\": true,

\"fechaCreacion\": \"2026-01-23T10:30:00\",

\"fechaModificacion\": null

},

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error (400) - Username duplicado:\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Validación fallida\",

\"errors\": \[\"El nombre de usuario ya existe\"\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\*\*Response error (400) - Datos inválidos:\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Validación fallida\",

\"errors\": \[

\"El nombre de usuario es requerido\",

\"El email debe ser válido\"

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.7.3 GET /api/v1/admin/usuarios/{id}

\*\*Descripción:\*\* Obtener detalle de un usuario específico (HU-016).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

\*\*Path parameter:\*\*

\| Parámetro \| Tipo \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| id \| Long \| ID del usuario \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/admin/usuarios/3

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Usuario obtenido correctamente\",

\"data\": {

\"id\": 3,

\"username\": \"mgarcia\",

\"nombreCompleto\": \"María García López\",

\"email\": \"mgarcia@oj.gob.gt\",

\"rol\": \"SECRETARIO\",

\"juzgado\": \"Juzgado Primero Civil\",

\"activo\": true,

\"bloqueado\": false,

\"intentosFallidos\": 0,

\"debeCambiarPassword\": true,

\"fechaCreacion\": \"2026-01-23T10:30:00\",

\"fechaModificacion\": null

},

\"timestamp\": \"2026-01-23T10:35:00\"

}

\`\`\`

\*\*Response error (404) - Usuario no encontrado:\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Usuario no encontrado\",

\"timestamp\": \"2026-01-23T10:35:00\"

}

\`\`\`

\-\--

\### 6.7.4 PUT /api/v1/admin/usuarios/{id}

\*\*Descripción:\*\* Actualizar datos de un usuario (HU-016, HU-017).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

\*\*Request body (todos los campos opcionales):\*\*

\| Campo \| Tipo \| Validación \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| nombreCompleto \| String \| 5-150 caracteres \|

\| email \| String \| Email válido, máx 100 chars \|

\| rolId \| Long \| Debe existir en cat_rol \|

\| juzgadoId \| Long \| Debe existir en cat_juzgado \|

\| activo \| Boolean \| true/false \|

\| bloqueado \| Boolean \| true/false \|

**Nota:** `username` nunca se puede editar (solo lectura).

\*\*Request:\*\*

\`\`\`http

PUT /api/v1/admin/usuarios/3

Authorization: Bearer {token}

Content-Type: application/json

{

\"nombreCompleto\": \"María García López Sánchez\",

\"email\": \"mgarcia.lopez@oj.gob.gt\",

\"rolId\": 3,

\"juzgadoId\": 2,

\"activo\": true

}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Usuario actualizado correctamente\",

\"data\": {

\"id\": 3,

\"username\": \"mgarcia\",

\"nombreCompleto\": \"María García López Sánchez\",

\"email\": \"mgarcia.lopez@oj.gob.gt\",

\"rol\": \"AUXILIAR\",

\"juzgado\": \"Juzgado Segundo Civil\",

\"activo\": true,

\"bloqueado\": false,

\"intentosFallidos\": 0,

\"debeCambiarPassword\": true,

\"fechaCreacion\": \"2026-01-23T10:30:00\",

\"fechaModificacion\": \"2026-01-23T11:00:00\"

},

\"timestamp\": \"2026-01-23T11:00:00\"

}

\`\`\`

\*\*Response error (404):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Usuario no encontrado\",

\"timestamp\": \"2026-01-23T11:00:00\"

}

\`\`\`

\-\--

\### 6.7.5 POST /api/v1/admin/usuarios/{id}/reset-password

\*\*Descripción:\*\* Resetear contraseña de un usuario (HU-016).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

**Acción:** Genera contraseña temporal, marca `debeCambiarPassword = true`, reinicia contador de intentos fallidos.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/admin/usuarios/3/reset-password

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Contraseña reseteada correctamente\",

\"data\": null,

\"timestamp\": \"2026-01-23T11:05:00\"

}

\`\`\`

\*\*Response error (404):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Usuario no encontrado\",

\"timestamp\": \"2026-01-23T11:05:00\"

}

\`\`\`

\-\--

\### 6.7.6 POST /api/v1/admin/usuarios/{id}/bloquear

\*\*Descripción:\*\* Bloquear un usuario (impide login) (HU-016).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

**Acción:** Establece `bloqueado = true`.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/admin/usuarios/3/bloquear

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Usuario bloqueado correctamente\",

\"data\": null,

\"timestamp\": \"2026-01-23T11:10:00\"

}

\`\`\`

\*\*Response error (404):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Usuario no encontrado\",

\"timestamp\": \"2026-01-23T11:10:00\"

}

\`\`\`

\-\--

\### 6.7.7 POST /api/v1/admin/usuarios/{id}/desbloquear

\*\*Descripción:\*\* Desbloquear un usuario (permite login nuevamente) (HU-016).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

**Acción:** Establece `bloqueado = false` e `intentosFallidos = 0`.

\*\*Request:\*\*

\`\`\`http

POST /api/v1/admin/usuarios/3/desbloquear

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Usuario desbloqueado correctamente\",

\"data\": null,

\"timestamp\": \"2026-01-23T11:15:00\"

}

\`\`\`

\*\*Response error (404):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Usuario no encontrado\",

\"timestamp\": \"2026-01-23T11:15:00\"

}

\`\`\`

\-\--

\### 6.7.8 GET /api/v1/admin/auditoria

\*\*Descripción:\*\* Consultar logs de auditoría con filtros y paginación (HU-018).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

\*\*Parámetros de query opcionales:\*\*

\| Parámetro \| Tipo \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| usuario \| String \| Filtrar por usuario (contiene) \|

\| modulo \| String \| Filtrar por módulo (ej. ADMIN, EXPEDIENTE, DOCUMENTO) \|

\| accion \| String \| Filtrar por acción (ej. USUARIO_CREADO, LOGIN_EXITOSO) \|

\| fechaDesde \| ISO LocalDateTime \| Desde fecha (ej. 2026-01-20T00:00:00) \|

\| fechaHasta \| ISO LocalDateTime \| Hasta fecha (ej. 2026-01-23T23:59:59) \|

\| recursoId \| Long \| Filtrar por ID de recurso \|

\| page \| int \| Número de página (default 0) \|

\| size \| int \| Elementos por página (default 50) \|

\| sort \| String \| Campo y dirección (default "fecha,desc") \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/admin/auditoria?usuario=jperez&accion=USUARIO_CREADO&fechaDesde=2026-01-20T00:00:00&fechaHasta=2026-01-23T23:59:59&page=0&size=20&sort=fecha,desc

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Auditoría consultada correctamente\",

\"data\": {

\"content\": \[

{

\"id\": 1056,

\"fecha\": \"2026-01-23T11:05:00\",

\"usuario\": \"admin\",

\"ip\": \"192.168.1.50\",

\"accion\": \"RESET_PASSWORD_ADMIN\",

\"modulo\": \"ADMIN\",

\"recursoId\": 3,

\"detalle\": \"Usuario mgarcia\"

},

{

\"id\": 1055,

\"fecha\": \"2026-01-23T11:00:00\",

\"usuario\": \"admin\",

\"ip\": \"192.168.1.50\",

\"accion\": \"USUARIO_ACTUALIZADO\",

\"modulo\": \"ADMIN\",

\"recursoId\": 3,

\"detalle\": \"Email y rol actualizados\"

},

{

\"id\": 1054,

\"fecha\": \"2026-01-23T10:30:00\",

\"usuario\": \"admin\",

\"ip\": \"192.168.1.50\",

\"accion\": \"USUARIO_CREADO\",

\"modulo\": \"ADMIN\",

\"recursoId\": 3,

\"detalle\": \"Nuevo usuario: mgarcia\"

}

\],

\"pageable\": {

\"pageNumber\": 0,

\"pageSize\": 20,

\"sort\": \"fecha,desc\"

},

\"totalElements\": 3,

\"totalPages\": 1

},

\"timestamp\": \"2026-01-23T11:20:00\"

}

\`\`\`

\-\--

\### 6.7.9 GET /api/v1/admin/auditoria/{id}

\*\*Descripción:\*\* Obtener detalle de un log de auditoría específico (HU-018).

\*\*Permisos:\*\* `@PreAuthorize("hasRole('ADMINISTRADOR')")`

\*\*Path parameter:\*\*

\| Parámetro \| Tipo \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| id \| Long \| ID del log de auditoría \|

\*\*Request:\*\*

\`\`\`http

GET /api/v1/admin/auditoria/1056

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"message\": \"Log de auditoría obtenido correctamente\",

\"data\": {

\"id\": 1056,

\"fecha\": \"2026-01-23T11:05:00\",

\"usuario\": \"admin\",

\"ip\": \"192.168.1.50\",

\"accion\": \"RESET_PASSWORD_ADMIN\",

\"modulo\": \"ADMIN\",

\"recursoId\": 3,

\"detalle\": \"Usuario mgarcia\"

},

\"timestamp\": \"2026-01-23T11:25:00\"

}

\`\`\`

\*\*Response error (404):\*\*

\`\`\`json

{

\"success\": false,

\"message\": \"Log de auditoría no encontrado\",

\"timestamp\": \"2026-01-23T11:25:00\"

}

\`\`\`

\-\--

\## 6.8 API de Catálogos

\-\--

\## 6.8 API de Catálogos

**Nota:** endpoints de solo lectura; requieren JWT y están disponibles para todos los roles autenticados.

\### 6.8.1 GET /api/v1/catalogos/tipos-proceso

\*\*Descripción:\*\* Obtener tipos de proceso.

\*\*Permisos:\*\* Todos los roles autenticados.

\*\*Request:\*\*

\`\`\`http

GET /api/v1/catalogos/tipos-proceso

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": \[

{ \"id\": 1, \"nombre\": \"Civil\", \"descripcion\": \"Procesos civiles y mercantiles\", \"activo\": true }

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.8.2 GET /api/v1/catalogos/estados-expediente

\*\*Descripción:\*\* Obtener estados de expediente.

\*\*Permisos:\*\* Todos los roles autenticados.

\*\*Request:\*\*

\`\`\`http

GET /api/v1/catalogos/estados-expediente

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": \[

{ \"id\": 1, \"nombre\": \"Activo\", \"descripcion\": \"En trámite\", \"activo\": true }

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`

\-\--

\### 6.8.3 GET /api/v1/catalogos/juzgados

\*\*Descripción:\*\* Obtener juzgados disponibles.

\*\*Permisos:\*\* Todos los roles autenticados.

\*\*Request:\*\*

\`\`\`http

GET /api/v1/catalogos/juzgados

Authorization: Bearer {token}

\`\`\`

\*\*Response exitoso (200):\*\*

\`\`\`json

{

\"success\": true,

\"data\": \[

{ \"id\": 1, \"codigo\": \"JUZ-CIV-01\", \"nombre\": \"Juzgado Primero Civil\", \"activo\": true }

\],

\"timestamp\": \"2026-01-23T10:30:00\"

}

\`\`\`


\-\--

\## 6.9 Resumen de Endpoints

\### Tabla de Endpoints

\| Método \| Endpoint \| Descripción \| Permisos \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| \*\*Autenticación\*\* \|\|\|\|

\| POST \| /api/v1/auth/login \| Iniciar sesión \| Público \|

\| POST \| /api/v1/auth/logout \| Cerrar sesión \| Autenticado \|

\| POST \| /api/v1/auth/cambiar-password \| Cambiar contraseña \|
Autenticado \|

\| \*\*Expedientes\*\* \|\|\|\|

\| GET \| /api/v1/expedientes \| Listar expedientes \| Autenticado \|

\| GET \| /api/v1/expedientes/{id} \| Obtener expediente \| Autenticado
\|

\| POST \| /api/v1/expedientes \| Crear expediente \| ADMIN, SECRET, AUX
\|

\| PUT \| /api/v1/expedientes/{id} \| Actualizar expediente \| ADMIN,
SECRET \|

\| \*\*Documentos\*\* \|\|\|\|

\| GET \| /api/v1/expedientes/{id}/documentos \| Listar documentos \|
Autenticado \|

\| POST \| /api/v1/expedientes/{id}/documentos \| Cargar documento \|
ADMIN, SECRET, AUX \|

\| GET \| /api/v1/documentos/{id} \| Obtener metadatos \| Autenticado \|

\| GET \| /api/v1/documentos/{id}/contenido \| Descargar/visualizar \|
Autenticado \|

\| DELETE \| /api/v1/documentos/{id} \| Eliminar documento \| ADMIN,
SECRET \|

\| \*\*Búsqueda\*\* \|\|\|\|

\| GET \| /api/v1/busqueda/rapida \| Búsqueda rápida \| Autenticado \|

\| POST \| /api/v1/busqueda/avanzada \| Búsqueda avanzada \| Autenticado
\|

\| \*\*Integración SGT\*\* \|\|\|\|

\| GET \| /api/v1/sgt/buscar \| Buscar en SGT \| Autenticado \|

\| \*\*Administración\*\* \|\|\|\|

\| GET \| /api/v1/admin/usuarios \| Listar usuarios \| ADMIN \|

\| POST \| /api/v1/admin/usuarios \| Crear usuario \| ADMIN \|

\| PUT \| /api/v1/admin/usuarios/{id} \| Actualizar usuario \| ADMIN \|

\| PUT \| /api/v1/admin/usuarios/{id}/desbloquear \| Desbloquear \|
ADMIN \|

\| PUT \| /api/v1/admin/usuarios/{id}/resetear-password \| Resetear
password \| ADMIN \|

\| GET \| /api/v1/admin/auditoria \| Consultar auditoría \| ADMIN \|

\| \*\*Catálogos\*\* \|\|\|\|

\| GET \| /api/v1/catalogos/tipos-proceso \| Tipos de proceso \| Autenticado \|
\| GET \| /api/v1/catalogos/estados-expediente \| Estados de expediente \| Autenticado \|
\| GET \| /api/v1/catalogos/juzgados \| Juzgados \| Autenticado \|

\### Totales

\| Categoría \| Cantidad \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Endpoints de Autenticación \| 3 \|

\| Endpoints de Expedientes \| 4 \|

\| Endpoints de Documentos \| 5 \|

\| Endpoints de Búsqueda \| 2 \|

\| Endpoints de Integración \| 1 \|

\| Endpoints de Administración \| 6 \|

\| Endpoints de Catálogos \| 1 \|

\| \*\*Total\*\* \| \*\*22\*\* \|

\-\--

## \# SECCIÓN 7: DISEÑO DE INTERFAZ DE USUARIO

\-\--

\## 7.1 Principios de Diseño UI

\### 7.1.1 Guía de Estilo

\| Principio \| Aplicación \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Simplicidad\*\* \| Interfaces limpias, sin elementos innecesarios
\|

\| \*\*Consistencia\*\* \| Mismos patrones en todo el sistema \|

\| \*\*Feedback\*\* \| Respuesta visual a cada acción del usuario \|

\| \*\*Accesibilidad\*\* \| Contraste adecuado, navegación por teclado
\|

\| \*\*Eficiencia\*\* \| Máximo 3 clics para funciones principales \|

\### 7.1.2 Paleta de Colores

\`\`\`

COLORES PRINCIPALES (Institucional OJ)

──────────────────────────────────────────────────────

Primario (Azul institucional)

┌────────┐

│ │ #1E3A5F - Headers, botones principales

└────────┘

Secundario (Azul claro)

┌────────┐

│ │ #3B82F6 - Links, elementos interactivos

└────────┘

COLORES DE ESTADO

──────────────────────────────────────────────────────

Éxito Advertencia Error

┌────────┐ ┌────────┐ ┌────────┐

│ │ #22C55E │ │ #F59E0B │ │ #EF4444

└────────┘ └────────┘ └────────┘

Info

┌────────┐

│ │ #3B82F6

└────────┘

COLORES NEUTROS

──────────────────────────────────────────────────────

Fondo principal Fondo secundario Bordes

┌────────┐ ┌────────┐ ┌────────┐

│ │ #FFFFFF │ │ #F8FAFC │ │ #E2E8F0

└────────┘ └────────┘ └────────┘

Texto principal Texto secundario

┌────────┐ ┌────────┐

│ │ #1E293B │ │ #64748B

└────────┘ └────────┘

\`\`\`

\### 7.1.3 Tipografía

\| Elemento \| Fuente \| Tamaño \| Peso \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| Títulos h1 \| Inter \| 24px \| 600 \|

\| Títulos h2 \| Inter \| 20px \| 600 \|

\| Títulos h3 \| Inter \| 16px \| 600 \|

\| Texto normal \| Inter \| 14px \| 400 \|

\| Texto pequeño \| Inter \| 12px \| 400 \|

\| Labels \| Inter \| 14px \| 500 \|

\| Botones \| Inter \| 14px \| 500 \|

\### 7.1.4 Componentes PrimeNG Utilizados

\| Componente \| Uso \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\--\|

\| p-table \| Tablas de datos con paginación \|

\| p-dialog \| Modales y diálogos \|

\| p-dropdown \| Selectores \|

\| p-calendar \| Selector de fechas \|

\| p-inputtext \| Campos de texto \|

\| p-button \| Botones \|

\| p-toast \| Notificaciones \|

\| p-confirmdialog \| Confirmaciones \|

\| p-fileupload \| Carga de archivos \|

\| p-progressbar \| Barras de progreso \|

\| p-menu \| Menús \|

\| p-breadcrumb \| Navegación \|

\| p-paginator \| Paginación \|

\| p-card \| Tarjetas de contenido \|

\-\--

\## 7.2 Layout Principal

\### 7.2.1 Estructura General

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ HEADER (60px) │

│ ┌──────┐ ┌─────────┐ ┌───────────┐ │

│ │ Logo │ 🔍 Buscar expediente\... │ Usuario │ │ Salir │ │

│ └──────┘ └─────────┘ └───────────┘ │

├────────────────┬────────────────────────────────────────────────────────────┤

│ │ │

│ SIDEBAR │ CONTENIDO PRINCIPAL │

│ (250px) │ │

│ │ ┌──────────────────────────────────────────────────────┐ │

│ ┌──────────┐ │ │ Breadcrumb: Inicio \> Expedientes \> Detalle │ │

│ │ 📁 Exped │ │
└──────────────────────────────────────────────────────┘ │

│ ├──────────┤ │ │

│ │ 🔍 Buscar│ │
┌──────────────────────────────────────────────────────┐ │

│ ├──────────┤ │ │ │ │

│ │ 📊 Admin │ │ │ ÁREA DE TRABAJO │ │

│ └──────────┘ │ │ │ │

│ │ │ │ │

│ │ │ │ │

│ │ │ │ │

│ │ │ │ │

│ │ └──────────────────────────────────────────────────────┘ │

│ │ │

└────────────────┴────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.2.2 Header

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ┌────────────┐ │

│ │ SGED │ ┌─────────────────────────────────────┐ │

│ │ Organismo │ │ 🔍 Buscar expediente\... │ │

│ │ Judicial │ └─────────────────────────────────────┘ │

│ └────────────┘ │

│ ┌─────────────────────────────────┐ │

│ │ 👤 Juan Pérez (Secretario) ▼ │ │

│ └─────────────────────────────────┘ │

│ │ │

│ ├── Mi Perfil │

│ ├── Cambiar Contraseña │

│ └── Cerrar Sesión │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.2.3 Sidebar

\`\`\`

┌────────────────────┐

│ │

│ MENÚ PRINCIPAL │

│ │

├────────────────────┤

│ │

│ 📁 Expedientes │ ← Todos los usuarios

│ │

├────────────────────┤

│ │

│ 🔍 Búsqueda │ ← Todos los usuarios

│ Avanzada │

│ │

├────────────────────┤

│ │

│ ⚙️ Administración │ ← Solo ADMINISTRADOR

│ │

│ ├─ Usuarios │

│ │ │

│ └─ Auditoría │

│ │

└────────────────────┘

\`\`\`

\### 7.2.4 Área de Contenido

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes \> Detalle (Breadcrumb) │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│
┌───────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ CONTENIDO DINÁMICO │ │

│ │ │ │

│ │ - Listados │ │

│ │ - Formularios │ │

│ │ - Detalles │ │

│ │ - Visores │ │

│ │ │ │

│
└───────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.3 Pantallas de Autenticación

\### 7.3.1 Login

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ │

│ │

│ ┌─────────────────────────────────────┐ │

│ │ │ │

│ │ ┌─────────────┐ │ │

│ │ │ SGED │ │ │

│ │ │ ⚖️ OJ │ │ │

│ │ └─────────────┘ │ │

│ │ │ │

│ │ Sistema de Gestión de Expedientes │ │

│ │ Digitales │ │

│ │ │ │

│ │ ┌─────────────────────────────────┐│ │

│ │ │ 👤 Usuario ││ │

│ │ │ \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_││
│

│ │ └─────────────────────────────────┘│ │

│ │ │ │

│ │ ┌─────────────────────────────────┐│ │

│ │ │ 🔒 Contraseña 👁️ ││ │

│ │ │ \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_││
│

│ │ └─────────────────────────────────┘│ │

│ │ │ │

│ │ ┌─────────────────────────────────┐│ │

│ │ │ INICIAR SESIÓN ││ │

│ │ └─────────────────────────────────┘│ │

│ │ │ │

│ │ ❌ Usuario o contraseña incorrectos│ ← Error │

│ │ │ │

│ └─────────────────────────────────────┘ │

│ │

│ © 2026 Organismo Judicial │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.3.2 Cambio de Contraseña

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Cambiar Contraseña │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Cambiar Contraseña │ │

│ │ ───────────────────────────────────────────────────────────── │ │

│ │ │ │

│ │ Contraseña actual \* │ │

│ │ ┌───────────────────────────────────────────────────────┐ 👁️ │ │

│ │ │ │ │ │

│ │ └───────────────────────────────────────────────────────┘ │ │

│ │ │ │

│ │ Nueva contraseña \* │ │

│ │ ┌───────────────────────────────────────────────────────┐ 👁️ │ │

│ │ │ │ │ │

│ │ └───────────────────────────────────────────────────────┘ │ │

│ │ ℹ️ Mínimo 8 caracteres, una mayúscula, una minúscula, un número │ │

│ │ │ │

│ │ Confirmar nueva contraseña \* │ │

│ │ ┌───────────────────────────────────────────────────────┐ 👁️ │ │

│ │ │ │ │ │

│ │ └───────────────────────────────────────────────────────┘ │ │

│ │ │ │

│ │ │ │

│ │ ┌─────────────┐ ┌─────────────────┐ │ │

│ │ │ Cancelar │ │ Guardar Cambios │ │ │

│ │ └─────────────┘ └─────────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\### 7.3.3 Flujos de UI de autenticación (Fase 1 implementada)

- **Login:** validación de campos requeridos; error por credenciales inválidas o cuenta bloqueada.
- **Login con `debeCambiarPassword=true`:** redirección inmediata a `/cambiar-password`.
- **Logout:** llamada a `POST /api/v1/auth/logout`, limpieza de sesión y redirección a `/login`.
- **Cambio de contraseña:** política mínima (8 chars, mayúscula, minúscula, número); muestra errores de validación.
- **Manejo de errores backend:** consume `errors[]` como lista de strings con mensajes de validación y muestra detalle amigable.
- **Storage:** tokens y sesión en `sessionStorage` mediante `StorageService`.

\## 7.4 Pantallas de Expedientes

\### 7.4.1 Listado de Expedientes

\- Tabla con paginación y ordenación por `fechaCreacion` y `numero` (`page`, `size`, `sort=campo,dir`).
\- Acciones por rol:
  \- **ADMIN/SECRETARIO:** Nuevo / Ver / Editar.
  \- **AUXILIAR:** Nuevo / Ver.
  \- **CONSULTA:** Ver.
\- Catálogos para nombres legibles (tipo, estado, juzgado).

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Expedientes ┌──────────────────┐ │

│ │ + Nuevo Expediente│ │

│ └──────────────────┘ │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Estado: \[Todos ▼\] Buscar: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] 🔍
│ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ \# Expediente ▼ │Tipo Proceso│ Juzgado │ Fecha │Estado │ Acc │ │

│
├──────────────────┼────────────┼────────────┼──────────┼───────┼─────┤
│

│ │ 12345-2026-00003 │ Civil │ Juzgado 1 │ 23/01/26 │Activo │👁 ✏️│ │

│ │ 12345-2026-00002 │ Civil │ Juzgado 1 │ 16/01/26 │Activo │👁 ✏️│ │

│ │ 12345-2026-00001 │ Civil │ Juzgado 1 │ 15/01/26 │Espera │👁 ✏️│ │

│ │ 12344-2025-00089 │ Penal │ Juzgado 3 │ 20/12/25 │Cerrado│👁 │ │

│ │ 12344-2025-00088 │ Laboral │ Juzgado 5 │ 18/12/25 │Activo │👁 ✏️│ │

│
├──────────────────────────────────────────────────────────────────────┤
│

│ │ │ │

│ │ Mostrando 1-5 de 150 expedientes │ │

│ │ │ │

│ │ Filas por página: \[10 ▼\] \[\<\] \[1\] \[2\] \[3\] \... \[15\]
\[\>\] │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda de acciones:

👁 = Ver detalle

✏️ = Editar (solo si tiene permiso)

\`\`\`

\### 7.4.2 Detalle de Expediente

\- Muestra datos del expediente y accesos a documentos asociados.
\- Acciones disponibles según rol y juzgado del usuario.
\- Manejo de errores vía `message` y `errors[]` (lista de strings).

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes \> 12345-2026-00001 │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Expediente 12345-2026-00001 ┌────────┐ ┌──────────────┐ │

│ │ Editar │ │ Consultar SGT│ │

│ └────────┘ └──────────────┘ │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ INFORMACIÓN GENERAL │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ │ │

│ │ Número: 12345-2026-00001 │ │

│ │ Tipo de proceso: Civil │ │

│ │ Juzgado: Juzgado Primero Civil │ │

│ │ Estado: ┌────────────┐ │ │

│ │ │ ● En espera│ │ │

│ │ └────────────┘ │ │

│ │ Fecha de inicio: 15/01/2026 │ │

│ │ │ │

│ │ Descripción: │ │

│ │ Demanda por incumplimiento de contrato │ │

│ │ │ │

│ │ Observaciones: │ │

│ │ Se notificó a la parte demandada el 20/01/2026 │ │

│ │ │ │

│ │ Referencia SGT: CIV-2026-001234 (SGTV2) │ │

│ │ │ │

│ │ ───────────────────────────────────────────────────────────────── │
│

│ │ Creado por: jperez \| 15/01/2026 09:30 │ │

│ │ Modificado por: mgarcia \| 20/01/2026 14:15 │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ DOCUMENTOS (5) ┌──────────────────┐│ │

│ │ │ + Cargar Documento││ │

│
├─────────────────────────────────────────────────└──────────────────┘┤
│

│ │ │ │

│ │ 📄 Demanda_inicial.pdf │ Demanda │ 1.5 MB │ 15/01 │👁⬇🖨│ │

│ │ 📄 Contrato_original.pdf │ Prueba │ 2.0 MB │ 15/01 │👁⬇🖨│ │

│ │ 🖼️ Foto_evidencia.jpg │ Multimedia │ 512 KB │ 16/01 │👁⬇🖨│ │

│ │ 📄 Notificacion_demandado.pdf │ Notifica. │ 256 KB │ 18/01 │👁⬇🖨│ │

│ │ 📄 Resolucion_admision.pdf │ Resolución │ 758 KB │ 23/01 │👁⬇🖨│ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda de acciones documentos:

👁 = Ver/Reproducir

⬇ = Descargar

🖨 = Imprimir

🗑 = Eliminar (solo si tiene permiso, no mostrado aquí)

\`\`\`

\### 7.4.3 Formulario Crear/Editar Expediente

\- Validaciones de campos obligatorios y catálogos.
\- `numero` es visible pero **no editable** en edición.
\- `juzgado`:
  \- ADMINISTRADOR: seleccionable.
  \- SECRETARIO/AUXILIAR: fijo según juzgado del usuario.
\- Catálogos (`tipos-proceso`, `estados-expediente`, `juzgados`) para nombres legibles.

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Expedientes \> Nuevo Expediente │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Nuevo Expediente │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Número de expediente \* Tipo de proceso \* │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ 12345-2026-00004 │ │ Civil ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Juzgado \* Estado \* │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ Juzgado Primero Civil ▼ │ │ Activo ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Fecha de inicio \* Referencia SGT │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ 📅 23/01/2026 │ │ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Descripción \* │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ │ │ │

│ │ │ │ │ │

│ │ │ │ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│ │ 0/500 caracteres │ │

│ │ │ │

│ │ Observaciones │ │

│ │ ┌──────────────────────────────────────────────────────────────┐ │ │

│ │ │ │ │ │

│ │ │ │ │ │

│ │ └──────────────────────────────────────────────────────────────┘ │ │

│ │ 0/1000 caracteres │ │

│ │ │ │

│ │ │ │

│ │ ┌───────────┐ ┌───────────────────┐ │ │

│ │ │ Cancelar │ │ Guardar Expediente│ │ │

│ │ └───────────┘ └───────────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.5 Pantallas de Documentos

\### 7.5.1 Carga de Documentos (Modal)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Cargar Documentos \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ Expediente: 12345-2026-00001 │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ 📁 │ │

│ │ │ │

│ │ Arrastre archivos aquí o haga clic │ │

│ │ │ │

│ │ \[Seleccionar archivos\] │ │

│ │ │ │

│ │ Formatos: PDF, Word, Imágenes, Audio, Video \| Máximo: 100 MB │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│ Tipo de documento: │

│ ┌───────────────────────────────────────────────────────────────────┐
│

│ │ Seleccione tipo\... ▼ │ │

│ └───────────────────────────────────────────────────────────────────┘
│

│ │

│ Archivos seleccionados: │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ 📄 Resolucion.pdf (758 KB) \[████████████████\] 100% ✓ │ │

│ │ 🖼️ Evidencia2.jpg (1.2 MB) \[█████████░░░░░░░\] 60% │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│ ┌───────────┐ ┌─────────────────┐ │

│ │ Cancelar │ │ Cargar Archivos │ │

│ └───────────┘ └─────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.5.2 Visor de PDF

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 📄 Demanda_inicial.pdf \[🔍\] \[🖨\] \[⬇\] \[⛶\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ \[◀\] Página \[ 3 \] de 15 \[▶\] Zoom: \[−\] \[100%\] \[+\]
\[Ajustar\]│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ \[CONTENIDO DEL PDF\] │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda barra superior:

🔍 = Buscar en documento

🖨 = Imprimir

⬇ = Descargar

⛶ = Pantalla completa

X = Cerrar

\`\`\`

\### 7.5.3 Visor de Imágenes

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 🖼️ Foto_evidencia.jpg \[🖨\] \[⬇\] \[⛶\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ Zoom: \[−\] \[100%\] \[+\] \[Ajustar\] │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ \[IMAGEN\] │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│ \[◀ Anterior\] \[Siguiente ▶\] │

│ (si hay múltiples imágenes) │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.5.4 Reproductor de Audio

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 🎵 Audiencia_15012026.mp3 \[⬇\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ 🎵 │ │

│ │ │ │

│ │ Audiencia_15012026.mp3 │ │

│ │ │ │

│ │ ━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │

│ │ 02:35 15:20 │ │

│ │ │ │

│ │ │ │

│ │ \[⏮\] \[ ▶ PLAY \] \[⏭\] │ │

│ │ │ │

│ │ │ │

│ │ 🔊 ━━━━━━━━━━○━━━ │ │

│ │ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.5.5 Reproductor de Video

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ 🎬 Grabacion_audiencia.mp4 \[⬇\] \[⛶\] \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ \[CONTENIDO VIDEO\] │ │

│ │ │ │

│ │ ▶ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│ │ │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ ▶ ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━ 05:23 / 45:30 🔊━━○ ⛶ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.6 Pantallas de Búsqueda

\### 7.6.1 Búsqueda Rápida (Header)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ┌─────────────────────────────────────────┐ │

│ │ 🔍 Buscar expediente\... │ │

│ └─────────────────────────────────────────┘ │

│ │ │

│ ▼ │

│ ┌─────────────────────────────────────────┐ │

│ │ Resultados para \"12345-2026\": │ │

│ │ │ │

│ │ 📁 12345-2026-00001 - Civil - Activo │ │

│ │ 📁 12345-2026-00002 - Civil - Activo │ │

│ │ 📁 12345-2026-00003 - Civil - Activo │ │

│ │ │ │

│ │ \[Ver todos los resultados →\] │ │

│ └─────────────────────────────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.6.2 Búsqueda Avanzada

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Búsqueda Avanzada │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Búsqueda Avanzada │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Número de expediente Tipo de proceso │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ 12345 │ │ Todos ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Juzgado Estado │ │

│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │

│ │ │ Todos ▼ │ │ Activo ▼ │ │ │

│ │ └──────────────────────────┘ └──────────────────────────┘ │ │

│ │ │ │

│ │ Fecha de inicio │ │

│ │ ┌────────────────┐ a ┌────────────────┐ │ │

│ │ │ 📅 01/01/2026 │ │ 📅 31/01/2026 │ │ │

│ │ └────────────────┘ └────────────────┘ │ │

│ │ │ │

│ │ ┌───────────────┐ ┌─────────────┐ │ │

│ │ │ Limpiar filtros│ │ 🔍 Buscar │ │ │

│ │ └───────────────┘ └─────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Resultados: 25 expedientes encontrados │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ │ │

│ │ Filtros activos: \[Número: 12345 ×\] \[Estado: Activo ×\] │ │

│ │ │ │

│ │ \# Expediente ▼ │Tipo Proceso│ Juzgado │ Fecha │Estado │Acc │ │

│ ├──────────────────┼────────────┼────────────┼──────────┼───────┼────┤
│

│ │ 12345-2026-00003 │ Civil │ Juzgado 1 │ 23/01/26 │Activo │ 👁 │ │

│ │ 12345-2026-00002 │ Civil │ Juzgado 1 │ 16/01/26 │Activo │ 👁 │ │

│ │ 12345-2026-00001 │ Civil │ Juzgado 1 │ 15/01/26 │Activo │ 👁 │ │

│ │ \... │ \... │ \... │ \... │ \... │ \...│ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Mostrando 1-10 de 25 \[\<\] \[1\] \[2\] \[3\] \[\>\] │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.7 Pantallas de Administración

\### 7.7.1 Gestión de Usuarios

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Administración \> Usuarios │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Gestión de Usuarios ┌──────────────────┐ │

│ │ + Nuevo Usuario │ │

│ └──────────────────┘ │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Estado: \[Todos ▼\] Buscar: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] 🔍
│ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Usuario │ Nombre │ Rol │ Juzgado │Estado│ Acc │ │

│ ├────────────┼────────────────┼─────────────┼───────────┼──────┼─────┤
│

│ │ admin │ Administrador │ ADMINISTRADOR│ Juzgado 1│ ● Act│✏️ 🔓│ │

│ │ jperez │ Juan Pérez │ SECRETARIO │ Juzgado 1 │ ● Act│✏️ 🔓│ │

│ │ mgarcia │ María García │ AUXILIAR │ Juzgado 2 │ ● Act│✏️ 🔓│ │

│ │ rlopez │ Roberto López │ CONSULTA │ Juzgado 3 │ ○ Ina│✏️ 🔓│ │

│ │ asmith │ Ana Smith │ SECRETARIO │ Juzgado 1 │ 🔒 Bloq│✏️ 🔓│ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Mostrando 1-5 de 15 \[\<\] \[1\] \[2\] \[3\] \[\>\] │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

Leyenda:

● Act = Activo (verde)

○ Ina = Inactivo (gris)

🔒 Bloq = Bloqueado (rojo)

✏️ = Editar

🔓 = Desbloquear (solo si está bloqueado)

🔑 = Resetear contraseña

\`\`\`

\### 7.7.2 Formulario Usuario (Modal)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Nuevo Usuario \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ Nombre de usuario \* Nombre completo \* │

│ ┌──────────────────────────┐ ┌──────────────────────────┐ │

│ │ mrodriguez │ │ Manuel Rodríguez │ │

│ └──────────────────────────┘ └──────────────────────────┘ │

│ │

│ Correo electrónico \* │

│ ┌───────────────────────────────────────────────────────────────────┐
│

│ │ mrodriguez@oj.gob.gt │ │

│ └───────────────────────────────────────────────────────────────────┘
│

│ │

│ Rol \* Juzgado \* │

│ ┌──────────────────────────┐ ┌──────────────────────────┐ │

│ │ SECRETARIO ▼ │ │ Juzgado Primero Civil ▼ │ │

│ └──────────────────────────┘ └──────────────────────────┘ │

│ │

│ ☑ Usuario activo │

│ │

│ ℹ️ Se generará una contraseña temporal que el usuario deberá cambiar │

│ en su primer inicio de sesión. │

│ │

│ ┌───────────┐ ┌─────────────────┐ │

│ │ Cancelar │ │ Guardar Usuario │ │

│ └───────────┘ └─────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.7.3 Consulta de Auditoría

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Inicio \> Administración \> Auditoría │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Logs de Auditoría │

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ │ │

│ │ Fecha desde Fecha hasta Usuario │ │

│ │ ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐ │ │

│ │ │ 📅 20/01/2026 │ │ 📅 23/01/2026 │ │ Todos ▼ │ │ │

│ │ └────────────────┘ └────────────────┘ └─────────────────┘ │ │

│ │ │ │

│ │ Acción │ │

│ │ ┌─────────────────────────────────────┐ ┌─────────────┐ │ │

│ │ │ Todas ▼ │ │ 🔍 Filtrar │ │ │

│ │ └─────────────────────────────────────┘ └─────────────┘ │ │

│ │ │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

│
┌─────────────────────────────────────────────────────────────────────┐
│

│ │ Mostrando 250 registros │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Fecha/Hora │ Usuario │ Acción │ Módulo │ Detalle │ │

│
├───────────────────┼─────────┼──────────────────┼─────────┼──────────┤
│

│ │ 23/01/26 10:45 │ jperez │ DOCUMENTO_CARGADO│documentos│ Exp:12345│ │

│ │ 23/01/26 10:35 │ mgarcia │ EXPEDIENTE_EDIT │expediente│ Exp:12345│ │

│ │ 23/01/26 10:30 │ jperez │ EXPEDIENTE_CREADO│expediente│ Exp:12345│ │

│ │ 23/01/26 08:00 │ jperez │ LOGIN_EXITOSO │ auth │ IP:192\...│ │

│ │ 22/01/26 17:30 │ admin │ USUARIO_CREADO │ admin │ mgarcia │ │

│ │ 22/01/26 17:00 │ mgarcia │ LOGIN_EXITOSO │ auth │ IP:192\...│ │

│ │ \... │ \... │ \... │ \... │ \... │ │

│
├─────────────────────────────────────────────────────────────────────┤
│

│ │ Filas: \[20 ▼\] \[\<\] \[1\] \[2\] \[3\] \... \[\>\] │ │

│
└─────────────────────────────────────────────────────────────────────┘
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.8 Componentes Comunes

\### 7.8.1 Tablas Paginadas

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ Columna 1 ▼ │ Columna 2 │ Columna 3 │ Columna 4 │ Acciones │

├───────────────┼───────────────┼───────────────┼───────────────┼────────────┤

│ Dato 1 │ Dato 2 │ Dato 3 │ Dato 4 │ 👁 ✏️ 🗑 │

│ Dato 1 │ Dato 2 │ Dato 3 │ Dato 4 │ 👁 ✏️ 🗑 │

│ Dato 1 │ Dato 2 │ Dato 3 │ Dato 4 │ 👁 ✏️ 🗑 │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ Filas por página: \[10 ▼\] │

│ │

│ Mostrando 1-10 de 150 \[\<\] \[1\] \[2\] \[3\] \... \[\>\] │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.8.2 Mensajes y Notificaciones (Toast)

\`\`\`

ÉXITO (Verde)

┌─────────────────────────────────────────┐

│ ✓ Expediente creado exitosamente X │

└─────────────────────────────────────────┘

ERROR (Rojo)

┌─────────────────────────────────────────┐

│ ✗ Error al cargar el documento X │

└─────────────────────────────────────────┘

ADVERTENCIA (Amarillo)

┌─────────────────────────────────────────┐

│ ⚠ Su sesión expirará en 5 minutos X │

└─────────────────────────────────────────┘

INFORMACIÓN (Azul)

┌─────────────────────────────────────────┐

│ ℹ Documento cargándose\... X │

└─────────────────────────────────────────┘

\`\`\`

\### 7.8.3 Diálogos de Confirmación

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ⚠️ Confirmar acción \[X\] │

│ │

│
─────────────────────────────────────────────────────────────────────────
│

│ │

│ │

│ ¿Está seguro de que desea eliminar este documento? │

│ │

│ Esta acción no se puede deshacer. │

│ │

│ │

│ ┌───────────┐ ┌───────────────────┐ │

│ │ Cancelar │ │ Sí, eliminar │ │

│ └───────────┘ └───────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.8.4 Indicador de Carga

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ │

│ │

│ ◠◡◠ │

│ Cargando\... │

│ │

│ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 7.8.5 Estado Vacío

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ │

│ │

│ 📁 │

│ │

│ No se encontraron expedientes │

│ │

│ Intente con otros filtros de búsqueda │

│ │

│ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## 7.9 Resumen de Pantallas

\| Módulo \| Pantalla \| Tipo \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| \*\*Autenticación\*\* \| Login \| Página completa \|

\| \*\*Autenticación\*\* \| Cambio de contraseña \| Página con layout \|

\| \*\*Expedientes\*\* \| Listado \| Página con layout \|

\| \*\*Expedientes\*\* \| Detalle \| Página con layout \|

\| \*\*Expedientes\*\* \| Formulario crear/editar \| Página con layout
\|

\| \*\*Documentos\*\* \| Carga de documentos \| Modal \|

\| \*\*Documentos\*\* \| Visor PDF \| Modal/Página \|

\| \*\*Documentos\*\* \| Visor imágenes \| Modal \|

\| \*\*Documentos\*\* \| Reproductor audio \| Modal \|

\| \*\*Documentos\*\* \| Reproductor video \| Modal/Página \|

\| \*\*Búsqueda\*\* \| Búsqueda rápida \| Dropdown en header \|

\| \*\*Búsqueda\*\* \| Búsqueda avanzada \| Página con layout \|

\| \*\*Administración\*\* \| Gestión usuarios \| Página con layout \|

\| \*\*Administración\*\* \| Formulario usuario \| Modal \|

\| \*\*Administración\*\* \| Auditoría \| Página con layout \|

\*\*Total de pantallas:\*\* 15

------------------------------------------------------------------------

## 7.10 Gestión Documental y Visores (Fase 3)

### 7.10.1 Objetivo funcional

- **RF-002/RF-003/RF-004/RF-011** y **HU-008/009/010/011**: carga, visualización, reproducción, descarga e impresión.
- Documentos siempre vinculados a un **expediente**.
- SGED puede **mostrar** documentos de SGTv1/SGTv2, pero **no** escribe ni modifica allí (solo lectura).

### 7.10.2 Modelo de datos (resumen)

- **documento**: `id`, `expediente_id`, `tipo_documento_id`, `nombre_original`, `nombre_storage`, `ruta`, `tamanio_bytes`, `mime_type`, `extension`, `usuario_creacion`, `fecha_creacion`, `eliminado`, `usuario_eliminacion`, `fecha_eliminacion`.
- **FKs**: `expediente_id -> expediente.id`, `tipo_documento_id -> cat_tipo_documento.id`.
- **Índices**: por `expediente_id`, `tipo_documento_id`, `fecha_creacion`.
- **cat_tipo_documento**: ver sección de catálogos existente.

### 7.10.3 Arquitectura backend (resumen)

- **Capas**: `api.documento`, `application.documento`, `infrastructure.documento`, `shared`.
- **Servicios**:
  - `FileValidationService`: tamaño ≤100MB, extensión y MIME permitidos.
  - `DocumentoStorageService`: FS local `{base}/{año}/{mes}/{expedienteId}/{docId}`.
  - `DocumentoService`: alta/listado/detalle/contenido/eliminación lógica.
  - `DocumentoConversionService`: DOC/DOCX → PDF (JODConverter + LibreOffice).
  - `AuditoriaService`: eventos de documentos (async).

### 7.10.4 API de Documentos (contrato previsto)

Endpoints (ver detalle en 6.4):
- `GET /api/v1/expedientes/{id}/documentos`
- `POST /api/v1/expedientes/{id}/documentos` (multipart/form-data)
- `GET /api/v1/documentos/{id}`
- `GET /api/v1/documentos/{id}/contenido?modo=inline|attachment`
- `GET /api/v1/documentos/{id}/stream` (opcional para audio/video)
- `DELETE /api/v1/documentos/{id}` (eliminación lógica si la política lo permite)
- `POST /api/v1/documentos/{id}/impresion`

**Roles permitidos:**
- **ADMIN**: todo.
- **SECRETARIO**: subir/listar/ver/eliminar según política.
- **AUXILIAR**: subir/listar/ver.
- **CONSULTA**: listar/ver/descargar/imprimir.

**Regla de juzgado:** no ADMIN solo interactúa con expedientes de su juzgado.

**Errores:**
- 400: validaciones (size > 100MB, tipo no permitido) con `errors: string[]`.
- 403: rol/juzgado no permitido.
- 404: ID inexistente (sin auditoría, solo logging).

### 7.10.5 Auditoría de documentos

- Acciones: `DOCUMENTO_CARGADO`, `DOCUMENTO_VISUALIZADO`, `DOCUMENTO_DESCARGADO`, `MULTIMEDIA_REPRODUCIDA`, `DOCUMENTO_IMPRESO`, `DOCUMENTO_ELIMINADO` (si aplica).
- Regla: **solo éxito** → auditoría. 403/404 → solo logs (`request_id`, `user_id`).

### 7.10.6 UI de Documentos y Visores (Angular)

- Integración en detalle del expediente: panel/pestaña **Documentos**.
- Componentes:
  - `documentos-list`: tabla con acciones Ver/Descargar/Imprimir; Subir (ADMIN/SECRETARIO/AUXILIAR); Eliminar (ADMIN/SECRETARIO si aplica).
  - `documentos-upload`: drag & drop, barra de progreso, validaciones.
  - `documento-viewer`: PDF/Word (PDF convertido), imágenes, audio/video (HTML5).
- Usabilidad: estados de carga, botones deshabilitados durante carga.
- Errores: `errors[]` como lista; fallback a `message`.

## \# SECCIÓN 8: SEGURIDAD

\-\--

\## 8.1 Autenticación

\### 8.1.1 Flujo de Login

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ FLUJO DE AUTENTICACIÓN │

└──────────────────────────────────────────────────────────────────────────────┘

USUARIO FRONTEND BACKEND BD

│ │ │ │

│ 1. Ingresa │ │ │

│ usuario/password │ │ │

│───────────────────\>│ │ │

│ │ │ │

│ │ 2. POST /auth/login│ │

│ │ {user, password} │ │

│ │────────────────────\>│ │

│ │ │ │

│ │ │ 3. Buscar usuario │

│ │ │───────────────────\>│

│ │ │ │

│ │ │ 4. Usuario + hash │

│ │ │\<───────────────────│

│ │ │ │

│ │ │ 5. Verificar: │

│ │ │ - Password válido │

│ │ │ - Usuario activo │

│ │ │ - No bloqueado │

│ │ │ │

│ │ │ 6. Registrar │

│ │ │ auditoría │

│ │ │───────────────────\>│

│ │ │ │

│ │ 7. JWT Token │ │

│ │ + datos usuario │ │

│ │\<────────────────────│ │

│ │ │ │

│ │ 8. Guardar token │ │

│ │ en sessionStorage │ │

│ │ │ │

│ 9. Redirigir │ │ │

│ al dashboard │ │ │

│\<───────────────────│ │ │

│ │ │ │

\`\`\`

\### 8.1.2 JWT (JSON Web Token)

\*\*Estructura del Token:\*\*

\`\`\`

Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.

eyJzdWIiOiJqcGVyZXoiLCJyb2xlcyI6WyJTRUNSRVRBUklPIl0sImp1emdhZG9JZCI6MSwiaWF0IjoxNzA2MDA2MDAwLCJleHAiOjE3MDYwMzQ4MDB9.

K7gNU3sdo-OL0wNhqoVWhr3g6s1xYv72ol_pe_Pwi5E

\`\`\`

\*\*Header (Decodificado):\*\*

\`\`\`json

{

\"alg\": \"HS256\",

\"typ\": \"JWT\"

}

\`\`\`

\*\*Payload (Decodificado):\*\*

\`\`\`json

{

\"sub\": \"jperez\",

\"roles\": \[\"SECRETARIO\"\],

\"juzgadoId\": 1,

\"nombreCompleto\": \"Juan Pérez\",

\"iat\": 1706006000,

\"exp\": 1706034800

}

\`\`\`

\*\*Configuración:\*\*

\| Parámetro \| Valor \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Algoritmo \| HS256 \| HMAC con SHA-256 \|

\| Expiración \| 8 horas \| 28,800,000 ms \|

\| Secret \| Variable de entorno \| Mínimo 256 bits \|

\### 8.1.3 Sesión, CSRF y almacenamiento de token

- \*\*Sesión:\*\* SGED opera **stateless** con JWT; no hay sesiones de servidor clásicas.
- \*\*CSRF:\*\* deshabilitado al usar JWT en header `Authorization` (no cookies); mitigación vía HTTPS y no uso de cookies de sesión.
- \*\*Token en frontend:\*\* se almacena en `sessionStorage` (no en `localStorage` ni en cookies sin `HttpOnly`).
- \*\*Referencias:\*\* ver detalles operativos en `sGED-backend/README.md` y `sGED-frontend/README.md`.

\### 8.1.4 Expiración y Renovación

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ CICLO DE VIDA DEL TOKEN │

└──────────────────────────────────────────────────────────────────────────────┘

Login Expiración

│ │

│◄──────────────────── 8 horas de validez ───────────────────────────►│

│ │

├─────────────────────────────────────────────────────────────────────┤

│ │

│ Token válido: Usuario puede hacer requests │

│ │

├─────────────────────────────────────────────────────────────────────┤

│

▼

┌───────────────┐

│ Token expirado│

│ Redirigir a │

│ login │

└───────────────┘

\`\`\`

\*\*Comportamiento:\*\*

\| Evento \| Acción \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|

\| Token válido \| Procesar request normalmente \|

\| Token expirado \| Retornar 401, frontend redirige a login \|

\| Token inválido/manipulado \| Retornar 401, registrar intento
sospechoso \|

\| Logout \| Agregar token a blacklist temporal \|

\*\*Implementación de Verificación:\*\*

\`\`\`java

\@Component

public class JwtAuthenticationFilter extends OncePerRequestFilter {

\@Override

protected void doFilterInternal(HttpServletRequest request,

HttpServletResponse response,

FilterChain filterChain) throws ServletException, IOException {

String authHeader = request.getHeader(\"Authorization\");

if (authHeader == null \|\| !authHeader.startsWith(\"Bearer \")) {

filterChain.doFilter(request, response);

return;

}

String token = authHeader.substring(7);

try {

// Verificar si token está en blacklist (logout)

if (tokenBlacklistService.isBlacklisted(token)) {

response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

return;

}

// Validar y extraer datos del token

if (jwtTokenProvider.validateToken(token)) {

String username = jwtTokenProvider.getUsername(token);

UserDetails userDetails =
userDetailsService.loadUserByUsername(username);

UsernamePasswordAuthenticationToken authToken =

new UsernamePasswordAuthenticationToken(

userDetails, null, userDetails.getAuthorities());

SecurityContextHolder.getContext().setAuthentication(authToken);

}

} catch (ExpiredJwtException e) {

response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

response.getWriter().write(\"{\\\"message\\\": \\\"Token
expirado\\\"}\");

return;

} catch (JwtException e) {

response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

response.getWriter().write(\"{\\\"message\\\": \\\"Token
inválido\\\"}\");

return;

}

filterChain.doFilter(request, response);

}

}

\`\`\`

\-\--

\## 8.2 Autorización

\### 8.2.1 Roles del Sistema

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ ROLES DEL SISTEMA │

└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐

│ ADMINISTRADOR │

│
─────────────────────────────────────────────────────────────────────────
│

│ • Acceso total al sistema │

│ • Gestión de usuarios │

│ • Consulta de auditoría │

│ • Todas las operaciones sobre expedientes y documentos │

└─────────────────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ SECRETARIO │

│
─────────────────────────────────────────────────────────────────────────
│

│ • Crear y editar expedientes │

│ • Cargar y eliminar documentos │

│ • Visualizar y descargar documentos │

│ • Búsquedas │

│ • Consultar sistemas SGT │

└─────────────────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ AUXILIAR │

│
─────────────────────────────────────────────────────────────────────────
│

│ • Crear expedientes │

│ • Cargar documentos │

│ • Visualizar y descargar documentos │

│ • Búsquedas │

│ • Consultar sistemas SGT │

└─────────────────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ CONSULTA │

│
─────────────────────────────────────────────────────────────────────────
│

│ • Solo visualización de expedientes y documentos │

│ • Búsquedas │

│ • Consultar sistemas SGT │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 8.2.2 Matriz de Permisos Detallada

\| Recurso / Acción \| ADMIN \| SECRETARIO \| AUXILIAR \| CONSULTA \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| \*\*AUTENTICACIÓN\*\* \|\|\|\|\|

\| Login \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Logout \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Cambiar contraseña propia \| ✅ \| ✅ \| ✅ \| ✅ \|

\| \*\*EXPEDIENTES\*\* \|\|\|\|\|

\| Listar expedientes \| ✅ Todos \| ✅ Su juzgado \| ✅ Su juzgado \|
✅ Su juzgado \|

\| Ver detalle expediente \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Crear expediente \| ✅ \| ✅ \| ✅ \| ❌ \|

\| Editar expediente \| ✅ \| ✅ \| ❌ \| ❌ \|

\| \*\*DOCUMENTOS\*\* \|\|\|\|\|

\| Listar documentos \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Ver/Reproducir documento \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Descargar documento \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Imprimir documento \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Cargar documento \| ✅ \| ✅ \| ✅ \| ❌ \|

\| Eliminar documento \| ✅ \| ✅ \| ❌ \| ❌ \|

\| \*\*BÚSQUEDA\*\* \|\|\|\|\|

\| Búsqueda rápida \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Búsqueda avanzada \| ✅ \| ✅ \| ✅ \| ✅ \|

\| \*\*INTEGRACIÓN SGT\*\* \|\|\|\|\|

\| Consultar SGTv1 \| ✅ \| ✅ \| ✅ \| ✅ \|

\| Consultar SGTv2 \| ✅ \| ✅ \| ✅ \| ✅ \|

\| \*\*ADMINISTRACIÓN\*\* \|\|\|\|\|

\| Listar usuarios \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Crear usuario \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Editar usuario \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Desbloquear usuario \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Resetear contraseña \| ✅ \| ❌ \| ❌ \| ❌ \|

\| Consultar auditoría \| ✅ \| ❌ \| ❌ \| ❌ \|

\### 8.2.3 Protección de Endpoints

\*\*Configuración Spring Security:\*\*

\`\`\`java

\@Configuration

\@EnableWebSecurity

\@EnableMethodSecurity

public class SecurityConfig {

\@Bean

public SecurityFilterChain securityFilterChain(HttpSecurity http) throws
Exception {

return http

.csrf(csrf -\> csrf.disable())

.cors(cors -\> cors.configurationSource(corsConfig()))

.sessionManagement(session -\>

session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

.authorizeHttpRequests(auth -\> auth

// Públicos

.requestMatchers(\"/api/v1/auth/login\").permitAll()

.requestMatchers(\"/api/v1/health\").permitAll()

// Solo ADMINISTRADOR

.requestMatchers(\"/api/v1/admin/\*\*\").hasRole(\"ADMINISTRADOR\")

// Crear expedientes: ADMIN, SECRETARIO, AUXILIAR

.requestMatchers(HttpMethod.POST, \"/api/v1/expedientes\")

.hasAnyRole(\"ADMINISTRADOR\", \"SECRETARIO\", \"AUXILIAR\")

// Editar expedientes: ADMIN, SECRETARIO

.requestMatchers(HttpMethod.PUT, \"/api/v1/expedientes/\*\*\")

.hasAnyRole(\"ADMINISTRADOR\", \"SECRETARIO\")

// Cargar documentos: ADMIN, SECRETARIO, AUXILIAR

.requestMatchers(HttpMethod.POST, \"/api/v1/expedientes/\*/documentos\")

.hasAnyRole(\"ADMINISTRADOR\", \"SECRETARIO\", \"AUXILIAR\")

// Eliminar documentos: ADMIN, SECRETARIO

.requestMatchers(HttpMethod.DELETE, \"/api/v1/documentos/\*\*\")

.hasAnyRole(\"ADMINISTRADOR\", \"SECRETARIO\")

// Todo lo demás requiere autenticación

.anyRequest().authenticated()

)

.addFilterBefore(jwtAuthFilter,
UsernamePasswordAuthenticationFilter.class)

.build();

}

}

\`\`\`

\*\*Protección a Nivel de Método:\*\*

\`\`\`java

\@RestController

\@RequestMapping(\"/api/v1/admin\")

public class AdminController {

\@GetMapping(\"/usuarios\")

\@PreAuthorize(\"hasRole(\'ADMINISTRADOR\')\")

public ResponseEntity\<Page\<UsuarioResponse\>\> listarUsuarios(\...) {

// Solo ADMINISTRADOR puede acceder

}

\@PostMapping(\"/usuarios\")

\@PreAuthorize(\"hasRole(\'ADMINISTRADOR\')\")

public ResponseEntity\<UsuarioResponse\> crearUsuario(\...) {

// Solo ADMINISTRADOR puede acceder

}

}

\@RestController

\@RequestMapping(\"/api/v1/expedientes\")

public class ExpedienteController {

\@PostMapping

\@PreAuthorize(\"hasAnyRole(\'ADMINISTRADOR\', \'SECRETARIO\',
\'AUXILIAR\')\")

public ResponseEntity\<ExpedienteResponse\> crear(\...) {

// ADMIN, SECRETARIO o AUXILIAR pueden crear

}

\@PutMapping(\"/{id}\")

\@PreAuthorize(\"hasAnyRole(\'ADMINISTRADOR\', \'SECRETARIO\')\")

public ResponseEntity\<ExpedienteResponse\> actualizar(\...) {

// Solo ADMIN o SECRETARIO pueden editar

}

}

\`\`\`

\-\--

\## 8.3 Políticas de Seguridad

\### 8.3.1 Política de Contraseñas

\| Requisito \| Valor \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Longitud mínima \| 8 caracteres \| Mínimo requerido \|

\| Mayúsculas \| Al menos 1 \| Requerido \|

\| Minúsculas \| Al menos 1 \| Requerido \|

\| Números \| Al menos 1 \| Requerido \|

\| Caracteres especiales \| Opcional \| Recomendado \|

\| Historial \| Últimas 3 \| No repetir (v2.0) \|

\| Expiración \| No aplica v1.0 \| A considerar en v2.0 \|

\*\*Validador de Contraseña:\*\*

\`\`\`java

public class PasswordValidator {

private static final String PASSWORD_PATTERN =

\"\^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\\\\d).{8,}\$\";

private static final Pattern pattern =
Pattern.compile(PASSWORD_PATTERN);

public static boolean isValid(String password) {

if (password == null) {

return false;

}

return pattern.matcher(password).matches();

}

public static List\<String\> getErrors(String password) {

List\<String\> errors = new ArrayList\<\>();

if (password == null \|\| password.length() \< 8) {

errors.add(\"La contraseña debe tener al menos 8 caracteres\");

}

if (password != null && !password.matches(\".\*\[a-z\].\*\")) {

errors.add(\"La contraseña debe contener al menos una minúscula\");

}

if (password != null && !password.matches(\".\*\[A-Z\].\*\")) {

errors.add(\"La contraseña debe contener al menos una mayúscula\");

}

if (password != null && !password.matches(\".\*\\\\d.\*\")) {

errors.add(\"La contraseña debe contener al menos un número\");

}

return errors;

}

}

\`\`\`

\*\*Almacenamiento Seguro:\*\*

\`\`\`java

\@Service

public class PasswordService {

private final PasswordEncoder passwordEncoder;

public PasswordService() {

// BCrypt con factor de costo 12

this.passwordEncoder = new BCryptPasswordEncoder(12);

}

public String hashPassword(String plainPassword) {

return passwordEncoder.encode(plainPassword);

}

public boolean verifyPassword(String plainPassword, String
hashedPassword) {

return passwordEncoder.matches(plainPassword, hashedPassword);

}

public String generateTemporaryPassword() {

// Genera contraseña temporal segura

String chars =
\"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789\";

String special = \"#\$%&\*\";

SecureRandom random = new SecureRandom();

StringBuilder password = new StringBuilder();

// Garantizar requisitos mínimos

password.append(chars.charAt(random.nextInt(26))); // Mayúscula

password.append(chars.charAt(26 + random.nextInt(24))); // Minúscula

password.append(chars.charAt(50 + random.nextInt(8))); // Número

password.append(special.charAt(random.nextInt(special.length()))); //
Especial

// Completar hasta 10 caracteres

for (int i = 4; i \< 10; i++) {

password.append(chars.charAt(random.nextInt(chars.length())));

}

// Mezclar caracteres

return shuffleString(password.toString());

}

}

\`\`\`

\### 8.3.2 Bloqueo de Cuentas

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ FLUJO DE BLOQUEO DE CUENTA │

└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐

│ Intento de login │

└──────────┬──────────┘

│

▼

┌─────────────────────┐

│ ¿Contraseña válida? │

└──────────┬──────────┘

│

┌────────────────┼────────────────┐

│ SÍ │ │ NO

▼ │ ▼

┌─────────────────────┐ │ ┌─────────────────────┐

│ Reiniciar contador │ │ │ Incrementar contador│

│ de intentos a 0 │ │ │ de intentos (+1) │

└──────────┬──────────┘ │ └──────────┬──────────┘

│ │ │

▼ │ ▼

┌─────────────────────┐ │ ┌─────────────────────┐

│ Login exitoso │ │ │ ¿Intentos \>= 5? │

│ Redirigir dashboard │ │ └──────────┬──────────┘

└─────────────────────┘ │ │

│ ┌───────────┼───────────┐

│ │ NO │ │ SÍ

│ ▼ │ ▼

│ ┌─────────────┐│ ┌─────────────────────┐

│ │Mostrar error││ │ BLOQUEAR CUENTA │

│ │\"Credenciales││ │ - Marcar bloqueado │

│ │ incorrectas\"││ │ - Registrar fecha │

│ └─────────────┘│ │ - Notificar usuario │

│ │ │ - Auditar evento │

│ │ └─────────────────────┘

│ │

└────────────────┘

\`\`\`

\*\*Implementación:\*\*

\`\`\`java

\@Service

\@RequiredArgsConstructor

public class AuthService {

private static final int MAX_INTENTOS = 5;

private static final int MINUTOS_BLOQUEO = 30;

private final UsuarioRepository usuarioRepository;

private final AuditoriaService auditoriaService;

public LoginResponse login(LoginRequest request, String ip) {

Usuario usuario =
usuarioRepository.findByUsername(request.getUsername())

.orElseThrow(() -\> {

auditoriaService.registrarLoginFallido(request.getUsername(), ip,

\"Usuario no existe\");

return new UnauthorizedException(\"Usuario o contraseña incorrectos\");

});

// Verificar si está bloqueado

if (usuario.getBloqueado()) {

if (usuario.getFechaBloqueo() != null) {

LocalDateTime desbloqueoAutomatico = usuario.getFechaBloqueo()

.plusMinutes(MINUTOS_BLOQUEO);

if (LocalDateTime.now().isAfter(desbloqueoAutomatico)) {

// Desbloqueo automático

desbloquearUsuario(usuario);

} else {

auditoriaService.registrarLoginFallido(usuario.getUsername(), ip,

\"Cuenta bloqueada\");

throw new UnauthorizedException(

\"Cuenta bloqueada. Intente en \" +

ChronoUnit.MINUTES.between(LocalDateTime.now(), desbloqueoAutomatico) +

\" minutos o contacte al administrador\");

}

} else {

// Bloqueado permanentemente por admin

throw new UnauthorizedException(

\"Cuenta bloqueada. Contacte al administrador\");

}

}

// Verificar contraseña

if (!passwordService.verifyPassword(request.getPassword(),
usuario.getPassword())) {

incrementarIntentosFallidos(usuario, ip);

throw new UnauthorizedException(\"Usuario o contraseña incorrectos\");

}

// Login exitoso

usuario.setIntentosFallidos(0);

usuarioRepository.save(usuario);

auditoriaService.registrarLoginExitoso(usuario.getUsername(), ip);

return buildLoginResponse(usuario);

}

private void incrementarIntentosFallidos(Usuario usuario, String ip) {

int intentos = usuario.getIntentosFallidos() + 1;

usuario.setIntentosFallidos(intentos);

if (intentos \>= MAX_INTENTOS) {

usuario.setBloqueado(true);

usuario.setFechaBloqueo(LocalDateTime.now());

auditoriaService.registrar(

Accion.CUENTA_BLOQUEADA,

\"auth\",

usuario.getId(),

null,

\"Bloqueado por \" + MAX_INTENTOS + \" intentos fallidos\"

);

}

usuarioRepository.save(usuario);

auditoriaService.registrarLoginFallido(usuario.getUsername(), ip,

\"Contraseña incorrecta. Intento \" + intentos + \"/\" + MAX_INTENTOS);

}

private void desbloquearUsuario(Usuario usuario) {

usuario.setBloqueado(false);

usuario.setIntentosFallidos(0);

usuario.setFechaBloqueo(null);

usuarioRepository.save(usuario);

}

}

\`\`\`

\### 8.3.3 Timeout de Sesión

\| Parámetro \| Valor \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Duración del token \| 8 horas \| Jornada laboral completa \|

\| Inactividad frontend \| 30 minutos \| Warning antes de cerrar \|

\| Warning previo \| 5 minutos \| Notificación al usuario \|

\*\*Implementación Frontend (Angular):\*\*

\`\`\`typescript

\@Injectable({ providedIn: \'root\' })

export class SessionService {

private readonly INACTIVITY_TIMEOUT = 30 \* 60 \* 1000; // 30 minutos

private readonly WARNING_TIME = 5 \* 60 \* 1000; // 5 minutos antes

private inactivityTimer: any;

private warningTimer: any;

private lastActivity: number = Date.now();

constructor(

private authService: AuthService,

private messageService: MessageService,

private router: Router

) {

this.initActivityListeners();

this.startInactivityTimer();

}

private initActivityListeners(): void {

const events = \[\'mousedown\', \'mousemove\', \'keypress\', \'scroll\',
\'touchstart\'\];

events.forEach(event =\> {

document.addEventListener(event, () =\> this.resetTimer(), true);

});

}

private resetTimer(): void {

this.lastActivity = Date.now();

this.clearTimers();

this.startInactivityTimer();

}

private startInactivityTimer(): void {

// Timer para warning

this.warningTimer = setTimeout(() =\> {

this.showWarning();

}, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

// Timer para logout

this.inactivityTimer = setTimeout(() =\> {

this.handleInactivityTimeout();

}, this.INACTIVITY_TIMEOUT);

}

private showWarning(): void {

this.messageService.add({

severity: \'warn\',

summary: \'Sesión por expirar\',

detail: \'Su sesión expirará en 5 minutos por inactividad\',

life: 60000

});

}

private handleInactivityTimeout(): void {

this.messageService.add({

severity: \'info\',

summary: \'Sesión expirada\',

detail: \'Su sesión ha expirado por inactividad\'

});

this.authService.logout();

this.router.navigate(\[\'/login\'\]);

}

private clearTimers(): void {

if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

if (this.warningTimer) clearTimeout(this.warningTimer);

}

}

\`\`\`

\-\--

\## 8.4 Protección de Datos

\### 8.4.1 HTTPS/TLS

\*\*Requisitos:\*\*

\| Aspecto \| Requisito \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Protocolo \| TLS 1.2 mínimo, TLS 1.3 recomendado \|

\| Certificado \| Válido, emitido por CA reconocida \|

\| Redirección HTTP \| Automática a HTTPS \|

\| HSTS \| Habilitado \|

\*\*Configuración NGINX:\*\*

\`\`\`nginx

server {

listen 80;

server_name sged.oj.gob.gt;

\# Redirigir todo HTTP a HTTPS

return 301 https://\$server_name\$request_uri;

}

server {

listen 443 ssl http2;

server_name sged.oj.gob.gt;

\# Certificados SSL

ssl_certificate /etc/nginx/ssl/sged.crt;

ssl_certificate_key /etc/nginx/ssl/sged.key;

\# Configuración SSL segura

ssl_protocols TLSv1.2 TLSv1.3;

ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

ssl_prefer_server_ciphers off;

ssl_session_cache shared:SSL:10m;

ssl_session_timeout 1d;

\# Headers de seguridad

add_header Strict-Transport-Security \"max-age=31536000;
includeSubDomains\" always;

add_header X-Frame-Options \"SAMEORIGIN\" always;

add_header X-Content-Type-Options \"nosniff\" always;

add_header X-XSS-Protection \"1; mode=block\" always;

add_header Content-Security-Policy \"default-src \'self\'; script-src
\'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\';\"
always;

\# Proxy al backend

location /api {

proxy_pass http://backend:8080;

proxy_set_header Host \$host;

proxy_set_header X-Real-IP \$remote_addr;

proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

proxy_set_header X-Forwarded-Proto \$scheme;

}

\# Frontend estático

location / {

root /usr/share/nginx/html;

index index.html;

try_files \$uri \$uri/ /index.html;

}

}

\`\`\`

\### 8.4.2 Validación de Entradas

\*\*Backend - Validaciones:\*\*

\`\`\`java

// DTO con validaciones

\@Data

public class ExpedienteRequest {

\@NotBlank(message = \"El número de expediente es requerido\")

\@Size(max = 50, message = \"El número no puede exceder 50 caracteres\")

\@Pattern(regexp = \"\^\[A-Za-z0-9\\\\-\]+\$\",

message = \"El número solo puede contener letras, números y guiones\")

private String numero;

\@NotNull(message = \"El tipo de proceso es requerido\")

\@Positive(message = \"ID de tipo de proceso inválido\")

private Long tipoProcesoId;

\@NotNull(message = \"El juzgado es requerido\")

\@Positive(message = \"ID de juzgado inválido\")

private Long juzgadoId;

\@NotNull(message = \"El estado es requerido\")

\@Positive(message = \"ID de estado inválido\")

private Long estadoId;

\@NotNull(message = \"La fecha de inicio es requerida\")

\@PastOrPresent(message = \"La fecha de inicio no puede ser futura\")

private LocalDate fechaInicio;

\@NotBlank(message = \"La descripción es requerida\")

\@Size(max = 500, message = \"La descripción no puede exceder 500
caracteres\")

private String descripcion;

\@Size(max = 1000, message = \"Las observaciones no pueden exceder 1000
caracteres\")

private String observaciones;

}

// Controller con validación

\@PostMapping

public ResponseEntity\<ExpedienteResponse\> crear(

\@Valid \@RequestBody ExpedienteRequest request) {

// Las validaciones se ejecutan automáticamente

return ResponseEntity.status(HttpStatus.CREATED)

.body(expedienteService.crear(request));

}

// Manejador global de errores de validación

\@RestControllerAdvice

public class GlobalExceptionHandler {

\@ExceptionHandler(MethodArgumentNotValidException.class)

public ResponseEntity\<ApiResponse\<Void\>\> handleValidationErrors(

MethodArgumentNotValidException ex) {

List\<String\> errors = ex.getBindingResult()

.getFieldErrors()

.stream()

.map(error -\> error.getDefaultMessage())

.collect(Collectors.toList());

return ResponseEntity.badRequest()

.body(ApiResponse.error(\"Error de validación\", errors));

}

}

\`\`\`

\*\*Frontend - Validaciones:\*\*

\`\`\`typescript

// Formulario con validaciones

export class ExpedienteFormComponent {

expedienteForm = this.fb.group({

numero: \[\'\', \[

Validators.required,

Validators.maxLength(50),

Validators.pattern(/\^\[A-Za-z0-9\\-\]+\$/)

\]\],

tipoProcesoId: \[null, Validators.required\],

juzgadoId: \[null, Validators.required\],

estadoId: \[null, Validators.required\],

fechaInicio: \[null, Validators.required\],

descripcion: \[\'\', \[

Validators.required,

Validators.maxLength(500)

\]\],

observaciones: \[\'\', Validators.maxLength(1000)\]

});

getErrorMessage(field: string): string {

const control = this.expedienteForm.get(field);

if (control?.hasError(\'required\')) {

return \'Este campo es requerido\';

}

if (control?.hasError(\'maxlength\')) {

const max = control.errors?.\[\'maxlength\'\].requiredLength;

return \`Máximo \${max} caracteres\`;

}

if (control?.hasError(\'pattern\')) {

return \'Formato inválido\';

}

return \'\';

}

}

\`\`\`

\### 8.4.3 Headers de Seguridad

\*\*Configuración Spring Boot:\*\*

\`\`\`java

\@Configuration

public class SecurityHeadersConfig {

\@Bean

public FilterRegistrationBean\<SecurityHeadersFilter\>
securityHeadersFilter() {

FilterRegistrationBean\<SecurityHeadersFilter\> registration =

new FilterRegistrationBean\<\>();

registration.setFilter(new SecurityHeadersFilter());

registration.addUrlPatterns(\"/api/\*\");

registration.setOrder(1);

return registration;

}

}

public class SecurityHeadersFilter extends OncePerRequestFilter {

\@Override

protected void doFilterInternal(HttpServletRequest request,

HttpServletResponse response,

FilterChain filterChain)

throws ServletException, IOException {

// Prevenir clickjacking

response.setHeader(\"X-Frame-Options\", \"DENY\");

// Prevenir MIME type sniffing

response.setHeader(\"X-Content-Type-Options\", \"nosniff\");

// Habilitar XSS filter del navegador

response.setHeader(\"X-XSS-Protection\", \"1; mode=block\");

// Política de contenido

response.setHeader(\"Content-Security-Policy\",

\"default-src \'self\'; frame-ancestors \'none\';\");

// Prevenir que se envíe Referrer

response.setHeader(\"Referrer-Policy\",
\"strict-origin-when-cross-origin\");

// Permisos de features

response.setHeader(\"Permissions-Policy\",

\"geolocation=(), microphone=(), camera=()\");

filterChain.doFilter(request, response);

}

}

\`\`\`

\| Header \| Valor \| Propósito \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| X-Frame-Options \| DENY \| Prevenir clickjacking \|

\| X-Content-Type-Options \| nosniff \| Prevenir MIME sniffing \|

\| X-XSS-Protection \| 1; mode=block \| Activar filtro XSS \|

\| Content-Security-Policy \| default-src \'self\' \| Restringir fuentes
\|

\| Strict-Transport-Security \| max-age=31536000 \| Forzar HTTPS \|

\| Referrer-Policy \| strict-origin-when-cross-origin \| Controlar
referrer \|

\-\--

\## 8.5 Auditoría de Seguridad

\### 8.5.1 Eventos Auditados (Fase 5 - HU-016/017/018)

\*\*Eventos de Autenticación:\*\*

\| Evento \| Datos Registrados \| Severidad \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| LOGIN_EXITOSO \| Usuario, IP, fecha/hora \| Info \|

\| LOGIN_FALLIDO \| Usuario, IP, razón, intento \# \| Warning \|

\| LOGOUT \| Usuario, IP, fecha/hora \| Info \|

\| CAMBIO_PASSWORD \| Usuario, IP \| Info \|

\| CUENTA_BLOQUEADA \| Usuario, IP, razón \| Warning \|

\*\*Eventos de Datos:\*\*

\| Evento \| Datos Registrados \| Severidad \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| EXPEDIENTE_CREADO \| Usuario, ID expediente, datos \| Info \|

\| EXPEDIENTE_EDITADO \| Usuario, ID, cambios (antes/después) \| Info \|

\| EXPEDIENTE_CONSULTADO \| Usuario, ID expediente \| Info \|

\| DOCUMENTO_CARGADO \| Usuario, ID doc, nombre, tamaño \| Info \|

\| DOCUMENTO_VISUALIZADO \| Usuario, ID documento \| Info \|

\| DOCUMENTO_DESCARGADO \| Usuario, ID documento \| Info \|

\| DOCUMENTO_ELIMINADO \| Usuario, ID documento, razón \| Warning \|

\*\*Eventos de Administración (Fase 5 - HU-016/017/018):\*\*

\| Evento \| Descripción \| Datos Registrados \| Severidad \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| USUARIO_CREADO \| Nuevo usuario creado por admin (HU-016) \| Admin, datos del nuevo usuario, ID \| Info \|

\| USUARIO_ACTUALIZADO \| Usuario actualizado por admin (HU-016) \| Admin, usuario afectado, cambios realizados \| Info \|

\| USUARIO_BLOQUEADO \| Usuario bloqueado por admin (HU-016) \| Admin, usuario afectado, razón \| Warning \|

\| USUARIO_DESBLOQUEADO \| Usuario desbloqueado por admin (HU-016) \| Admin, usuario afectado \| Info \|

\| RESET_PASSWORD_ADMIN \| Reset de contraseña por admin (HU-016) \| Admin, usuario afectado, contraseña temporal enviada \| Info \|

\| CONSULTAR_AUDITORIA \| Admin consulta logs de auditoría (HU-018) \| Admin, filtros aplicados, cantidad de registros \| Info \|

**Módulos de auditoría (campo `modulo`):**

\| Módulo \| Descripción \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| AUTH \| Eventos de autenticación \|

\| EXPEDIENTE \| CRUD de expedientes \|

\| DOCUMENTO \| CRUD de documentos \|

\| BUSQUEDA \| Búsquedas realizadas \|

\| INTEGRACION \| Consultas a sistemas SGT \|

\| ADMIN \| Administración de usuarios y auditoría (Fase 5) \|

\### 8.5.2 Trazabilidad

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ TRAZABILIDAD COMPLETA │

└──────────────────────────────────────────────────────────────────────────────┘

EJEMPLO: Seguimiento de acceso a documento confidencial

┌─────────────────────────────────────────────────────────────────────────────┐

│ Documento: Sentencia_caso_123.pdf │

│ Expediente: 12345-2026-00001 │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ HISTORIAL DE ACCESOS: │

│ │

│ 23/01/2026 14:35:22 │ jperez │ DOCUMENTO_CARGADO │ IP: 192.168.1.100│

│ 23/01/2026 15:10:45 │ mgarcia │ DOCUMENTO_VISUALIZADO │ IP:
192.168.1.101│

│ 23/01/2026 16:22:30 │ mgarcia │ DOCUMENTO_DESCARGADO │ IP:
192.168.1.101│

│ 24/01/2026 09:15:00 │ juez_perez│ DOCUMENTO_VISUALIZADO │ IP:
192.168.1.50 │

│ 24/01/2026 09:20:15 │ juez_perez│ DOCUMENTO_IMPRESO │ IP: 192.168.1.50
│

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\*\*Implementación del Servicio de Auditoría:\*\*

\`\`\`java

\@Service

\@RequiredArgsConstructor

public class AuditoriaService {

private final AuditoriaRepository auditoriaRepository;

\@Async

public void registrar(Accion accion, String modulo, Long recursoId,

String valorAnterior, String valorNuevo) {

String username = SecurityUtil.getCurrentUsername();

String ip = SecurityUtil.getCurrentIp();

Auditoria auditoria = Auditoria.builder()

.fecha(LocalDateTime.now())

.usuario(username != null ? username : \"SISTEMA\")

.ip(ip != null ? ip : \"N/A\")

.accion(accion)

.modulo(modulo)

.recursoId(recursoId)

.valorAnterior(truncateIfNeeded(valorAnterior, 4000))

.valorNuevo(truncateIfNeeded(valorNuevo, 4000))

.build();

auditoriaRepository.save(auditoria);

}

public void registrarLoginExitoso(String username, String ip) {

registrar(Accion.LOGIN_EXITOSO, \"auth\", null, null,

\"Login exitoso desde \" + ip);

}

public void registrarLoginFallido(String username, String ip, String
razon) {

Auditoria auditoria = Auditoria.builder()

.fecha(LocalDateTime.now())

.usuario(username)

.ip(ip)

.accion(Accion.LOGIN_FALLIDO)

.modulo(\"auth\")

.detalle(razon)

.build();

auditoriaRepository.save(auditoria);

}

public void registrarAccesoDocumento(Accion accion, Long documentoId,

String nombreDocumento) {

registrar(accion, \"documentos\", documentoId, null, nombreDocumento);

}

private String truncateIfNeeded(String value, int maxLength) {

if (value == null) return null;

return value.length() \> maxLength

? value.substring(0, maxLength - 3) + \"\...\"

: value;

}

}

\`\`\`

\-\--

\## 8.6 Resumen de Seguridad

\### Controles Implementados

\| Área \| Control \| Estado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|

\| \*\*Autenticación\*\* \| JWT con expiración \| ✅ \|

\| \*\*Autenticación\*\* \| Hash BCrypt (factor 12) \| ✅ \|

\| \*\*Autenticación\*\* \| Bloqueo por intentos \| ✅ \|

\| \*\*Autorización\*\* \| RBAC (4 roles) \| ✅ \|

\| \*\*Autorización\*\* \| Protección de endpoints \| ✅ \|

\| \*\*Sesión\*\* \| Timeout por inactividad \| ✅ \|

\| \*\*Comunicación\*\* \| HTTPS/TLS obligatorio \| ✅ \|

\| \*\*Headers\*\* \| Security headers \| ✅ \|

\| \*\*Validación\*\* \| Input validation (F/B) \| ✅ \|

\| \*\*Auditoría\*\* \| Logging completo \| ✅ \|

\| \*\*Contraseñas\*\* \| Política de complejidad \| ✅ \|

\### Checklist de Seguridad

\`\`\`

PRE-PRODUCCIÓN:

☐ Certificado SSL válido instalado

☐ Variables de entorno configuradas (no en código)

☐ JWT_SECRET generado (mínimo 256 bits)

☐ Contraseña admin cambiada

☐ Logs de auditoría funcionando

☐ Headers de seguridad verificados

☐ HTTPS redirigiendo desde HTTP

☐ Permisos de archivos correctos

☐ Backup de BD configurado

☐ Firewall configurado

\`\`\`

\-\--

## \# SECCIÓN 9: PRUEBAS

\-\--

\## 9.1 Estrategia de Pruebas

\### 9.1.1 Tipos de Pruebas

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ PIRÁMIDE DE PRUEBAS │

└──────────────────────────────────────────────────────────────────────────────┘

┌─────────┐

╱ ╲

╱ E2E/UAT ╲ 5% - Pruebas manuales

╱ (Manuales) ╲ de aceptación

╱─────────────────╲

╱ ╲

╱ Integración ╲ 20% - APIs, BD,

╱ (Backend) ╲ componentes

╱─────────────────────────╲

╱ ╲

╱ Pruebas Unitarias ╲ 75% - Funciones,

╱ (Backend/Frontend) ╲ servicios

╱─────────────────────────────────╲

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

\`\`\`

\| Tipo \| Cobertura Objetivo \| Herramienta \| Responsable \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Unitarias Backend \| 80% \| JUnit 5, Mockito \| Desarrollador \|

\| Unitarias Frontend \| 70% \| Jasmine, Karma \| Desarrollador \|

\| Integración \| APIs críticas \| Spring Boot Test \| Desarrollador \|

\| UAT \| 100% HU \| Manual \| Usuario/QA \|

\### 9.1.2 Herramientas

\| Herramienta \| Propósito \| Capa \|

\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| \*\*JUnit 5\*\* \| Pruebas unitarias Java \| Backend \|

\| \*\*Mockito\*\* \| Mocking de dependencias \| Backend \|

\| \*\*Spring Boot Test\*\* \| Pruebas de integración \| Backend \|

\| \*\*H2 Database\*\* \| BD en memoria para tests \| Backend \|

\| \*\*Jasmine\*\* \| Framework de pruebas JS \| Frontend \|

\| \*\*Karma\*\* \| Test runner Angular \| Frontend \|

\| \*\*Postman\*\* \| Pruebas manuales de API \| API \|

\-\--

\### 9.1.2 Ejecución de tests Fase 1 (comandos y reportes)

**Backend (Spring Boot + H2 modo Oracle):**
- `mvn test` (unitarios + integración con H2)
- `mvn verify -Ptest-coverage` (cuando Jacoco esté integrado)
- Reporte Jacoco: `target/site/jacoco` (una vez activo)

**Frontend (Angular 21 + Karma):**
- `npm test -- --watch=false --browsers=ChromeHeadless --code-coverage`
- Reporte de cobertura: `coverage/sged-frontend`

\## 9.2 Pruebas Unitarias

\### 9.2.1 Backend (JUnit 5 + Mockito)

\*\*Estructura de Tests:\*\*

\`\`\`

src/test/java/gob/oj/sged/

├── service/

│ ├── AuthServiceTest.java

│ ├── ExpedienteServiceTest.java

│ ├── DocumentoServiceTest.java

│ ├── BusquedaServiceTest.java

│ ├── UsuarioServiceTest.java

│ └── AuditoriaServiceTest.java

├── controller/

│ ├── AuthControllerTest.java

│ ├── ExpedienteControllerTest.java

│ └── DocumentoControllerTest.java

├── repository/

│ └── ExpedienteRepositoryTest.java

└── util/

├── PasswordValidatorTest.java

└── FileUtilTest.java

\`\`\`

\*\*Ejemplo: AuthServiceTest.java\*\*

\`\`\`java

\@ExtendWith(MockitoExtension.class)

class AuthServiceTest {

\@Mock

private UsuarioRepository usuarioRepository;

\@Mock

private PasswordEncoder passwordEncoder;

\@Mock

private JwtTokenProvider jwtTokenProvider;

\@Mock

private AuditoriaService auditoriaService;

\@InjectMocks

private AuthService authService;

private Usuario usuarioActivo;

private Usuario usuarioBloqueado;

\@BeforeEach

void setUp() {

usuarioActivo = Usuario.builder()

.id(1L)

.username(\"jperez\")

.password(\"\$2a\$12\$hashedPassword\")

.nombreCompleto(\"Juan Pérez\")

.activo(true)

.bloqueado(false)

.intentosFallidos(0)

.rol(new Rol(2L, \"SECRETARIO\", null, true))

.juzgado(new Juzgado(1L, \"JUZ-CIV-01\", \"Juzgado Primero Civil\", true))

.build();

usuarioBloqueado = Usuario.builder()

.id(2L)

.username(\"bloqueado\")

.password(\"\$2a\$12\$hashedPassword\")

.activo(true)

.bloqueado(true)

.fechaBloqueo(LocalDateTime.now().minusMinutes(10))

.build();

}

\@Test

\@DisplayName(\"Login exitoso con credenciales válidas\")

void login_CredencialesValidas_RetornaToken() {

// Arrange

LoginRequest request = new LoginRequest(\"jperez\", \"password123\");

String ip = \"192.168.1.100\";

when(usuarioRepository.findByUsername(\"jperez\"))

.thenReturn(Optional.of(usuarioActivo));

when(passwordEncoder.matches(\"password123\",
usuarioActivo.getPassword()))

.thenReturn(true);

when(jwtTokenProvider.generateToken(any()))

.thenReturn(\"jwt.token.here\");

// Act

LoginResponse response = authService.login(request, ip);

// Assert

assertNotNull(response);

assertEquals(\"jwt.token.here\", response.getToken());

assertEquals(\"jperez\", response.getUsername());

assertEquals(\"SECRETARIO\", response.getRol());

verify(auditoriaService).registrarLoginExitoso(\"jperez\", ip);

}

\@Test

\@DisplayName(\"Login fallido con contraseña incorrecta\")

void login_PasswordIncorrecto_LanzaExcepcion() {

// Arrange

LoginRequest request = new LoginRequest(\"jperez\", \"wrongpassword\");

String ip = \"192.168.1.100\";

when(usuarioRepository.findByUsername(\"jperez\"))

.thenReturn(Optional.of(usuarioActivo));

when(passwordEncoder.matches(\"wrongpassword\",
usuarioActivo.getPassword()))

.thenReturn(false);

// Act & Assert

UnauthorizedException exception = assertThrows(

UnauthorizedException.class,

() -\> authService.login(request, ip)

);

assertEquals(\"Usuario o contraseña incorrectos\",
exception.getMessage());

verify(auditoriaService).registrarLoginFallido(eq(\"jperez\"), eq(ip),
anyString());

}

\@Test

\@DisplayName(\"Login fallido con usuario bloqueado\")

void login_UsuarioBloqueado_LanzaExcepcion() {

// Arrange

LoginRequest request = new LoginRequest(\"bloqueado\", \"password123\");

String ip = \"192.168.1.100\";

when(usuarioRepository.findByUsername(\"bloqueado\"))

.thenReturn(Optional.of(usuarioBloqueado));

// Act & Assert

UnauthorizedException exception = assertThrows(

UnauthorizedException.class,

() -\> authService.login(request, ip)

);

assertTrue(exception.getMessage().contains(\"bloqueada\"));

}

\@Test

\@DisplayName(\"Bloqueo de cuenta después de 5 intentos fallidos\")

void login_5IntentosFallidos_BloqueaCuenta() {

// Arrange

usuarioActivo.setIntentosFallidos(4); // Ya tiene 4 intentos

LoginRequest request = new LoginRequest(\"jperez\", \"wrongpassword\");

String ip = \"192.168.1.100\";

when(usuarioRepository.findByUsername(\"jperez\"))

.thenReturn(Optional.of(usuarioActivo));

when(passwordEncoder.matches(\"wrongpassword\",
usuarioActivo.getPassword()))

.thenReturn(false);

// Act & Assert

assertThrows(UnauthorizedException.class,

() -\> authService.login(request, ip));

assertTrue(usuarioActivo.getBloqueado());

assertNotNull(usuarioActivo.getFechaBloqueo());

verify(auditoriaService).registrar(

eq(Accion.CUENTA_BLOQUEADA), anyString(), anyLong(), any(),
anyString());

}

\@Test

\@DisplayName(\"Login exitoso reinicia contador de intentos\")

void login_Exitoso_ReiniciaContadorIntentos() {

// Arrange

usuarioActivo.setIntentosFallidos(3);

LoginRequest request = new LoginRequest(\"jperez\", \"password123\");

String ip = \"192.168.1.100\";

when(usuarioRepository.findByUsername(\"jperez\"))

.thenReturn(Optional.of(usuarioActivo));

when(passwordEncoder.matches(\"password123\",
usuarioActivo.getPassword()))

.thenReturn(true);

when(jwtTokenProvider.generateToken(any()))

.thenReturn(\"jwt.token.here\");

// Act

authService.login(request, ip);

// Assert

assertEquals(0, usuarioActivo.getIntentosFallidos());

verify(usuarioRepository).save(usuarioActivo);

}

}

\`\`\`

\*\*Ejemplo: ExpedienteServiceTest.java\*\*

\`\`\`java

\@ExtendWith(MockitoExtension.class)

class ExpedienteServiceTest {

\@Mock

private ExpedienteRepository expedienteRepository;

\@Mock

private ExpedienteMapper expedienteMapper;

\@Mock

private AuditoriaService auditoriaService;

\@InjectMocks

private ExpedienteService expedienteService;

\@Test

\@DisplayName(\"Crear expediente con datos válidos\")

void crear_DatosValidos_RetornaExpediente() {

// Arrange

ExpedienteRequest request = new ExpedienteRequest();

request.setNumero(\"12345-2026-00001\");

request.setTipoProcesoId(1L);

request.setJuzgadoId(1L);

request.setEstadoId(1L);

request.setFechaInicio(LocalDate.now());

request.setDescripcion(\"Demanda de prueba\");

Expediente expediente = new Expediente();

expediente.setId(1L);

expediente.setNumero(\"12345-2026-00001\");

ExpedienteResponse expectedResponse = new ExpedienteResponse();

expectedResponse.setId(1L);

expectedResponse.setNumero(\"12345-2026-00001\");

when(expedienteRepository.existsByNumero(\"12345-2026-00001\"))

.thenReturn(false);

when(expedienteMapper.toEntity(request))

.thenReturn(expediente);

when(expedienteRepository.save(any(Expediente.class)))

.thenReturn(expediente);

when(expedienteMapper.toResponse(expediente))

.thenReturn(expectedResponse);

// Act

ExpedienteResponse response = expedienteService.crear(request);

// Assert

assertNotNull(response);

assertEquals(\"12345-2026-00001\", response.getNumero());

verify(auditoriaService).registrar(

eq(Accion.EXPEDIENTE_CREADO), eq(\"expediente\"), eq(1L), isNull(),
anyString());

}

\@Test

\@DisplayName(\"Crear expediente con número duplicado lanza excepción\")

void crear_NumeroDuplicado_LanzaExcepcion() {

// Arrange

ExpedienteRequest request = new ExpedienteRequest();

request.setNumero(\"12345-2026-00001\");

when(expedienteRepository.existsByNumero(\"12345-2026-00001\"))

.thenReturn(true);

// Act & Assert

ValidationException exception = assertThrows(

ValidationException.class,

() -\> expedienteService.crear(request)

);

assertEquals(\"El número de expediente ya existe\",
exception.getMessage());

verify(expedienteRepository, never()).save(any());

}

\@Test

\@DisplayName(\"Listar expedientes con paginación\")

void listar_ConPaginacion_RetornaPagina() {

// Arrange

Pageable pageable = PageRequest.of(0, 10,
Sort.by(\"fechaCreacion\").descending());

List\<Expediente\> expedientes = List.of(new Expediente(), new
Expediente());

Page\<Expediente\> page = new PageImpl\<\>(expedientes, pageable, 2);

when(expedienteRepository.findAll(pageable)).thenReturn(page);

when(expedienteMapper.toResponse(any(Expediente.class)))

.thenReturn(new ExpedienteResponse());

// Act

Page\<ExpedienteResponse\> result = expedienteService.listar(0, 10,

\"fechaCreacion\", \"desc\");

// Assert

assertEquals(2, result.getTotalElements());

assertEquals(1, result.getTotalPages());

}

}

\`\`\`

\*\*Ejemplo: PasswordValidatorTest.java\*\*

\`\`\`java

class PasswordValidatorTest {

\@Test

\@DisplayName(\"Contraseña válida con todos los requisitos\")

void isValid_TodosRequisitos_RetornaTrue() {

assertTrue(PasswordValidator.isValid(\"Password123\"));

assertTrue(PasswordValidator.isValid(\"MiClave99\"));

assertTrue(PasswordValidator.isValid(\"Abcd1234\"));

}

\@Test

\@DisplayName(\"Contraseña inválida - muy corta\")

void isValid_MuyCorta_RetornaFalse() {

assertFalse(PasswordValidator.isValid(\"Pass1\"));

assertFalse(PasswordValidator.isValid(\"Ab1\"));

}

\@Test

\@DisplayName(\"Contraseña inválida - sin mayúscula\")

void isValid_SinMayuscula_RetornaFalse() {

assertFalse(PasswordValidator.isValid(\"password123\"));

}

\@Test

\@DisplayName(\"Contraseña inválida - sin minúscula\")

void isValid_SinMinuscula_RetornaFalse() {

assertFalse(PasswordValidator.isValid(\"PASSWORD123\"));

}

\@Test

\@DisplayName(\"Contraseña inválida - sin número\")

void isValid_SinNumero_RetornaFalse() {

assertFalse(PasswordValidator.isValid(\"PasswordABC\"));

}

\@Test

\@DisplayName(\"Contraseña nula retorna false\")

void isValid_Nulo_RetornaFalse() {

assertFalse(PasswordValidator.isValid(null));

}

\@Test

\@DisplayName(\"getErrors retorna lista de errores específicos\")

void getErrors_PasswordDebil_RetornaErrores() {

List\<String\> errors = PasswordValidator.getErrors(\"abc\");

assertTrue(errors.contains(\"La contraseña debe tener al menos 8
caracteres\"));

assertTrue(errors.contains(\"La contraseña debe contener al menos una
mayúscula\"));

assertTrue(errors.contains(\"La contraseña debe contener al menos un
número\"));

}

}

\`\`\`

\### 9.2.2 Frontend (Jasmine/Karma)

\*\*Estructura de Tests:\*\*

\`\`\`

src/app/

├── core/

│ └── services/

│ ├── auth.service.spec.ts

│ └── api.service.spec.ts

├── features/

│ ├── auth/

│ │ └── login/

│ │ └── login.component.spec.ts

│ ├── expedientes/

│ │ ├── lista/

│ │ │ └── lista.component.spec.ts

│ │ └── formulario/

│ │ └── formulario.component.spec.ts

│ └── documentos/

│ └── upload/

│ └── upload.component.spec.ts

└── shared/

└── components/

└── confirm-dialog/

└── confirm-dialog.component.spec.ts

\`\`\`

\*\*Ejemplo: auth.service.spec.ts\*\*

\`\`\`typescript

import { TestBed } from \'@angular/core/testing\';

import { HttpClientTestingModule, HttpTestingController } from
\'@angular/common/http/testing\';

import { AuthService } from \'./auth.service\';

import { environment } from \'@env/environment\';

describe(\'AuthService\', () =\> {

let service: AuthService;

let httpMock: HttpTestingController;

beforeEach(() =\> {

TestBed.configureTestingModule({

imports: \[HttpClientTestingModule\],

providers: \[AuthService\]

});

service = TestBed.inject(AuthService);

httpMock = TestBed.inject(HttpTestingController);

// Limpiar sessionStorage antes de cada test

sessionStorage.clear();

});

afterEach(() =\> {

httpMock.verify();

});

describe(\'login\', () =\> {

it(\'debería hacer login y guardar token\', () =\> {

const mockResponse = {

success: true,

data: {

token: \'jwt.token.here\',

username: \'jperez\',

nombreCompleto: \'Juan Pérez\',

rol: \'SECRETARIO\'

}

};

service.login(\'jperez\', \'password123\').subscribe(response =\> {

expect(response.data.token).toBe(\'jwt.token.here\');

expect(sessionStorage.getItem(\'token\')).toBe(\'jwt.token.here\');

});

const req = httpMock.expectOne(\`\${environment.apiUrl}/auth/login\`);

expect(req.request.method).toBe(\'POST\');

expect(req.request.body).toEqual({ username: \'jperez\', password:
\'password123\' });

req.flush(mockResponse);

});

it(\'debería manejar error de login\', () =\> {

const mockError = {

success: false,

message: \'Usuario o contraseña incorrectos\'

};

service.login(\'jperez\', \'wrongpassword\').subscribe({

error: (error) =\> {

expect(error.status).toBe(401);

}

});

const req = httpMock.expectOne(\`\${environment.apiUrl}/auth/login\`);

req.flush(mockError, { status: 401, statusText: \'Unauthorized\' });

});

});

describe(\'logout\', () =\> {

it(\'debería limpiar token y usuario\', () =\> {

sessionStorage.setItem(\'token\', \'jwt.token.here\');

service.logout();

expect(sessionStorage.getItem(\'token\')).toBeNull();

expect(service.isAuthenticated()).toBeFalse();

});

});

describe(\'isAuthenticated\', () =\> {

it(\'debería retornar true si hay token válido\', () =\> {

sessionStorage.setItem(\'token\', \'valid.jwt.token\');

// Simular token no expirado

spyOn(service as any, \'isTokenExpired\').and.returnValue(false);

expect(service.isAuthenticated()).toBeTrue();

});

it(\'debería retornar false si no hay token\', () =\> {

expect(service.isAuthenticated()).toBeFalse();

});

});

describe(\'getToken\', () =\> {

it(\'debería retornar el token almacenado\', () =\> {

sessionStorage.setItem(\'token\', \'jwt.token.here\');

expect(service.getToken()).toBe(\'jwt.token.here\');

});

it(\'debería retornar null si no hay token\', () =\> {

expect(service.getToken()).toBeNull();

});

});

});

\`\`\`

\*\*Ejemplo: login.component.spec.ts\*\*

\`\`\`typescript

import { ComponentFixture, TestBed } from \'@angular/core/testing\';

import { ReactiveFormsModule } from \'@angular/forms\';

import { Router } from \'@angular/router\';

import { of, throwError } from \'rxjs\';

import { LoginComponent } from \'./login.component\';

import { AuthService } from \'@core/services/auth.service\';

import { MessageService } from \'primeng/api\';

describe(\'LoginComponent\', () =\> {

let component: LoginComponent;

let fixture: ComponentFixture\<LoginComponent\>;

let authServiceSpy: jasmine.SpyObj\<AuthService\>;

let routerSpy: jasmine.SpyObj\<Router\>;

let messageServiceSpy: jasmine.SpyObj\<MessageService\>;

beforeEach(async () =\> {

authServiceSpy = jasmine.createSpyObj(\'AuthService\', \[\'login\'\]);

routerSpy = jasmine.createSpyObj(\'Router\', \[\'navigate\'\]);

messageServiceSpy = jasmine.createSpyObj(\'MessageService\',
\[\'add\'\]);

await TestBed.configureTestingModule({

imports: \[ReactiveFormsModule, LoginComponent\],

providers: \[

{ provide: AuthService, useValue: authServiceSpy },

{ provide: Router, useValue: routerSpy },

{ provide: MessageService, useValue: messageServiceSpy }

\]

}).compileComponents();

fixture = TestBed.createComponent(LoginComponent);

component = fixture.componentInstance;

fixture.detectChanges();

});

it(\'debería crear el componente\', () =\> {

expect(component).toBeTruthy();

});

it(\'debería tener formulario inválido al inicio\', () =\> {

expect(component.loginForm.valid).toBeFalse();

});

it(\'debería validar campos requeridos\', () =\> {

const usernameControl = component.loginForm.get(\'username\');

const passwordControl = component.loginForm.get(\'password\');

expect(usernameControl?.errors?.\[\'required\'\]).toBeTrue();

expect(passwordControl?.errors?.\[\'required\'\]).toBeTrue();

});

it(\'debería ser válido con datos correctos\', () =\> {

component.loginForm.setValue({

username: \'jperez\',

password: \'password123\'

});

expect(component.loginForm.valid).toBeTrue();

});

it(\'debería llamar a authService.login al enviar formulario válido\',
() =\> {

const mockResponse = {

success: true,

data: {

token: \'jwt.token\',

username: \'jperez\',

rol: \'SECRETARIO\',

debeCambiarPassword: false

}

};

authServiceSpy.login.and.returnValue(of(mockResponse));

component.loginForm.setValue({

username: \'jperez\',

password: \'password123\'

});

component.onSubmit();

expect(authServiceSpy.login).toHaveBeenCalledWith(\'jperez\',
\'password123\');

expect(routerSpy.navigate).toHaveBeenCalledWith(\[\'/expedientes\'\]);

});

it(\'debería mostrar error en login fallido\', () =\> {

authServiceSpy.login.and.returnValue(throwError(() =\> ({

error: { message: \'Usuario o contraseña incorrectos\' }

})));

component.loginForm.setValue({

username: \'jperez\',

password: \'wrongpassword\'

});

component.onSubmit();

expect(messageServiceSpy.add).toHaveBeenCalledWith({

severity: \'error\',

summary: \'Error\',

detail: \'Usuario o contraseña incorrectos\'

});

});

it(\'debería redirigir a cambiar contraseña si es requerido\', () =\> {

const mockResponse = {

success: true,

data: {

token: \'jwt.token\',

username: \'jperez\',

rol: \'SECRETARIO\',

debeCambiarPassword: true

}

};

authServiceSpy.login.and.returnValue(of(mockResponse));

component.loginForm.setValue({

username: \'jperez\',

password: \'temporal123\'

});

component.onSubmit();

expect(routerSpy.navigate).toHaveBeenCalledWith(\[\'/cambiar-password\'\]);

});

});

\`\`\`

\-\--

\## 9.3 Pruebas de Integración

\### 9.3.1 Pruebas de API (Spring Boot Test)

\*\*Configuración:\*\*

\`\`\`java

// TestConfig.java

\@TestConfiguration

public class TestConfig {

\@Bean

\@Primary

public DataSource dataSource() {

return new EmbeddedDatabaseBuilder()

.setType(EmbeddedDatabaseType.H2)

.addScript(\"schema.sql\")

.addScript(\"data.sql\")

.build();

}

}

\`\`\`

\*\*Ejemplo: ExpedienteControllerIntegrationTest.java\*\*

\`\`\`java

\@SpringBootTest(webEnvironment =
SpringBootTest.WebEnvironment.RANDOM_PORT)

\@AutoConfigureMockMvc

\@ActiveProfiles(\"test\")

class ExpedienteControllerIntegrationTest {

\@Autowired

private MockMvc mockMvc;

\@Autowired

private ObjectMapper objectMapper;

\@Autowired

private ExpedienteRepository expedienteRepository;

\@Autowired

private JwtTokenProvider jwtTokenProvider;

private String tokenAdmin;

private String tokenConsulta;

\@BeforeEach

void setUp() {

// Generar tokens de prueba

tokenAdmin = generateToken(\"admin\", \"ADMINISTRADOR\");

tokenConsulta = generateToken(\"consulta\", \"CONSULTA\");

// Limpiar y preparar datos

expedienteRepository.deleteAll();

}

\@Test

\@DisplayName(\"GET /expedientes - Lista expedientes con
autenticación\")

void listarExpedientes_Autenticado_RetornaLista() throws Exception {

// Arrange

crearExpedientePrueba(\"12345-2026-00001\");

crearExpedientePrueba(\"12345-2026-00002\");

// Act & Assert

mockMvc.perform(get(\"/api/v1/expedientes\")

.header(\"Authorization\", \"Bearer \" + tokenAdmin)

.contentType(MediaType.APPLICATION_JSON))

.andExpect(status().isOk())

.andExpect(jsonPath(\"\$.success\").value(true))

.andExpect(jsonPath(\"\$.data.content\").isArray())

.andExpect(jsonPath(\"\$.data.totalElements\").value(2));

}

\@Test

\@DisplayName(\"GET /expedientes - Sin autenticación retorna 401\")

void listarExpedientes_SinToken_Retorna401() throws Exception {

mockMvc.perform(get(\"/api/v1/expedientes\")

.contentType(MediaType.APPLICATION_JSON))

.andExpect(status().isUnauthorized());

}

\@Test

\@DisplayName(\"POST /expedientes - Crear expediente con rol válido\")

void crearExpediente_RolValido_RetornaCreated() throws Exception {

// Arrange

ExpedienteRequest request = new ExpedienteRequest();

request.setNumero(\"12345-2026-00003\");

request.setTipoProcesoId(1L);

request.setJuzgadoId(1L);

request.setEstadoId(1L);

request.setFechaInicio(LocalDate.now());

request.setDescripcion(\"Expediente de prueba\");

// Act & Assert

mockMvc.perform(post(\"/api/v1/expedientes\")

.header(\"Authorization\", \"Bearer \" + tokenAdmin)

.contentType(MediaType.APPLICATION_JSON)

.content(objectMapper.writeValueAsString(request)))

.andExpect(status().isCreated())

.andExpect(jsonPath(\"\$.success\").value(true))

.andExpect(jsonPath(\"\$.data.numero\").value(\"12345-2026-00003\"));

// Verificar en BD

assertTrue(expedienteRepository.existsByNumero(\"12345-2026-00003\"));

}

\@Test

\@DisplayName(\"POST /expedientes - Rol CONSULTA no puede crear\")

void crearExpediente_RolConsulta_Retorna403() throws Exception {

// Arrange

ExpedienteRequest request = new ExpedienteRequest();

request.setNumero(\"12345-2026-00003\");

// Act & Assert

mockMvc.perform(post(\"/api/v1/expedientes\")

.header(\"Authorization\", \"Bearer \" + tokenConsulta)

.contentType(MediaType.APPLICATION_JSON)

.content(objectMapper.writeValueAsString(request)))

.andExpect(status().isForbidden());

}

\@Test

\@DisplayName(\"POST /expedientes - Número duplicado retorna 400\")

void crearExpediente_NumeroDuplicado_Retorna400() throws Exception {

// Arrange

crearExpedientePrueba(\"12345-2026-00001\");

ExpedienteRequest request = new ExpedienteRequest();

request.setNumero(\"12345-2026-00001\"); // Duplicado

request.setTipoProcesoId(1L);

request.setJuzgadoId(1L);

request.setEstadoId(1L);

request.setFechaInicio(LocalDate.now());

request.setDescripcion(\"Expediente duplicado\");

// Act & Assert

mockMvc.perform(post(\"/api/v1/expedientes\")

.header(\"Authorization\", \"Bearer \" + tokenAdmin)

.contentType(MediaType.APPLICATION_JSON)

.content(objectMapper.writeValueAsString(request)))

.andExpect(status().isBadRequest())

.andExpect(jsonPath(\"\$.success\").value(false))

.andExpect(jsonPath(\"\$.message\").value(\"El número de expediente ya
existe\"));

}

\@Test

\@DisplayName(\"GET /expedientes/{id} - Obtener expediente existente\")

void obtenerExpediente_Existe_RetornaExpediente() throws Exception {

// Arrange

Expediente exp = crearExpedientePrueba(\"12345-2026-00001\");

// Act & Assert

mockMvc.perform(get(\"/api/v1/expedientes/\" + exp.getId())

.header(\"Authorization\", \"Bearer \" + tokenAdmin)

.contentType(MediaType.APPLICATION_JSON))

.andExpect(status().isOk())

.andExpect(jsonPath(\"\$.success\").value(true))

.andExpect(jsonPath(\"\$.data.numero\").value(\"12345-2026-00001\"));

}

\@Test

\@DisplayName(\"GET /expedientes/{id} - Expediente no existe retorna
404\")

void obtenerExpediente_NoExiste_Retorna404() throws Exception {

mockMvc.perform(get(\"/api/v1/expedientes/99999\")

.header(\"Authorization\", \"Bearer \" + tokenAdmin)

.contentType(MediaType.APPLICATION_JSON))

.andExpect(status().isNotFound())

.andExpect(jsonPath(\"\$.success\").value(false));

}

// Métodos auxiliares

private Expediente crearExpedientePrueba(String numero) {

Expediente exp = Expediente.builder()

.numero(numero)

.tipoProceso(new TipoProceso(1L, \"Civil\", null, true))

.juzgado(new Juzgado(1L, \"JUZ-CIV-01\", \"Juzgado Primero Civil\", true))

.estado(new Estado(1L, \"Activo\", null, true))

.fechaInicio(LocalDate.now())

.descripcion(\"Expediente de prueba\")

.usuarioCreacion(\"test\")

.fechaCreacion(LocalDateTime.now())

.build();

return expedienteRepository.save(exp);

}

private String generateToken(String username, String rol) {

// Generar token JWT de prueba

return jwtTokenProvider.generateToken(

new User(username, \"\", List.of(new SimpleGrantedAuthority(\"ROLE\_\" +
rol)))

);

}

}

\`\`\`

\### 9.3.2 Pruebas de Carga de Archivos

\`\`\`java

\@SpringBootTest(webEnvironment =
SpringBootTest.WebEnvironment.RANDOM_PORT)

\@AutoConfigureMockMvc

\@ActiveProfiles(\"test\")

class DocumentoControllerIntegrationTest {

\@Autowired

private MockMvc mockMvc;

\@Test

\@DisplayName(\"POST /expedientes/{id}/documentos - Cargar PDF válido\")

void cargarDocumento_PDFValido_RetornaCreated() throws Exception {

// Arrange

MockMultipartFile file = new MockMultipartFile(

\"file\",

\"documento.pdf\",

\"application/pdf\",

\"PDF content\".getBytes()

);

// Act & Assert

mockMvc.perform(multipart(\"/api/v1/expedientes/1/documentos\")

.file(file)

.param(\"tipoDocumentoId\", \"1\")

.header(\"Authorization\", \"Bearer \" + tokenAdmin))

.andExpect(status().isCreated())

.andExpect(jsonPath(\"\$.success\").value(true))

.andExpect(jsonPath(\"\$.data.extension\").value(\"pdf\"));

}

\@Test

\@DisplayName(\"POST /expedientes/{id}/documentos - Formato no
permitido\")

void cargarDocumento_FormatoInvalido_Retorna400() throws Exception {

// Arrange

MockMultipartFile file = new MockMultipartFile(

\"file\",

\"virus.exe\",

\"application/x-msdownload\",

\"Executable content\".getBytes()

);

// Act & Assert

mockMvc.perform(multipart(\"/api/v1/expedientes/1/documentos\")

.file(file)

.header(\"Authorization\", \"Bearer \" + tokenAdmin))

.andExpect(status().isBadRequest())

.andExpect(jsonPath(\"\$.message\").value(containsString(\"formato\")));

}

\@Test

\@DisplayName(\"GET /documentos/{id}/contenido - Descargar documento\")

void descargarDocumento_Existe_RetornaArchivo() throws Exception {

// Act & Assert

mockMvc.perform(get(\"/api/v1/documentos/1/contenido\")

.param(\"modo\", \"attachment\")

.header(\"Authorization\", \"Bearer \" + tokenAdmin))

.andExpect(status().isOk())

.andExpect(header().exists(\"Content-Disposition\"));

}

}

\`\`\`

\-\--

\## 9.4 Pruebas de Aceptación (UAT)

\### 9.4.1 Casos de Prueba

\*\*CP-001: Inicio de Sesión\*\*

\| Campo \| Valor \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*ID\*\* \| CP-001 \|

\| \*\*Título\*\* \| Inicio de sesión exitoso \|

\| \*\*Historia\*\* \| HU-001 \|

\| \*\*Precondiciones\*\* \| Usuario activo existe en el sistema \|

\| \*\*Datos de prueba\*\* \| Usuario: jperez, Password: Test1234 \|

\| Paso \| Acción \| Resultado Esperado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Acceder a la URL del sistema \| Se muestra pantalla de login \|

\| 2 \| Ingresar usuario \"jperez\" \| Campo acepta el texto \|

\| 3 \| Ingresar contraseña \"Test1234\" \| Campo muestra asteriscos \|

\| 4 \| Clic en \"Iniciar Sesión\" \| Sistema valida credenciales \|

\| 5 \| - \| Redirige al dashboard con mensaje de bienvenida \|

\| 6 \| - \| Header muestra nombre del usuario \|

\-\--

\*\*CP-002: Inicio de Sesión Fallido\*\*

\| Campo \| Valor \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*ID\*\* \| CP-002 \|

\| \*\*Título\*\* \| Inicio de sesión con credenciales incorrectas \|

\| \*\*Historia\*\* \| HU-001 \|

\| \*\*Precondiciones\*\* \| Usuario existe en el sistema \|

\| \*\*Datos de prueba\*\* \| Usuario: jperez, Password: incorrecta \|

\| Paso \| Acción \| Resultado Esperado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Ingresar usuario y contraseña incorrecta \| Campos aceptan texto
\|

\| 2 \| Clic en \"Iniciar Sesión\" \| Sistema valida \|

\| 3 \| - \| Muestra mensaje \"Usuario o contraseña incorrectos\" \|

\| 4 \| - \| Permanece en pantalla de login \|

\| 5 \| Repetir 5 veces \| Muestra \"Cuenta bloqueada\" \|

\-\--

\*\*CP-003: Crear Expediente\*\*

\| Campo \| Valor \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*ID\*\* \| CP-003 \|

\| \*\*Título\*\* \| Crear expediente con datos válidos \|

\| \*\*Historia\*\* \| HU-004 \|

\| \*\*Precondiciones\*\* \| Usuario con rol SECRETARIO autenticado \|

\| \*\*Datos de prueba\*\* \| Ver tabla abajo \|

\| Dato \| Valor \|

\|\-\-\-\-\--\|\-\-\-\-\-\--\|

\| Número \| 99999-2026-00001 \|

\| Tipo proceso \| Civil \|

\| Juzgado \| Juzgado Primero Civil \|

\| Estado \| Activo \|

\| Fecha inicio \| (fecha actual) \|

\| Descripción \| Expediente de prueba UAT \|

\| Paso \| Acción \| Resultado Esperado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Clic en \"Nuevo Expediente\" \| Se muestra formulario vacío \|

\| 2 \| Completar todos los campos \| Campos aceptan datos \|

\| 3 \| Clic en \"Guardar\" \| Sistema valida datos \|

\| 4 \| - \| Muestra mensaje \"Expediente creado exitosamente\" \|

\| 5 \| - \| Redirige al detalle del expediente \|

\| 6 \| Verificar datos \| Todos los datos coinciden \|

\-\--

\*\*CP-004: Cargar Documento\*\*

\| Campo \| Valor \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*ID\*\* \| CP-004 \|

\| \*\*Título\*\* \| Cargar documento PDF a expediente \|

\| \*\*Historia\*\* \| HU-008 \|

\| \*\*Precondiciones\*\* \| Expediente existe, usuario con permiso \|

\| \*\*Datos de prueba\*\* \| Archivo: test.pdf (500 KB) \|

\| Paso \| Acción \| Resultado Esperado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Abrir detalle del expediente \| Se muestra información \|

\| 2 \| Clic en \"Cargar Documento\" \| Se abre modal de carga \|

\| 3 \| Seleccionar archivo PDF \| Archivo aparece en lista \|

\| 4 \| Seleccionar tipo \"Demanda\" \| Tipo seleccionado \|

\| 5 \| Clic en \"Cargar\" \| Muestra barra de progreso \|

\| 6 \| - \| Muestra \"Documento cargado exitosamente\" \|

\| 7 \| Verificar lista de documentos \| Documento aparece en lista \|

\-\--

\*\*CP-005: Visualizar Documento PDF\*\*

\| Campo \| Valor \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*ID\*\* \| CP-005 \|

\| \*\*Título\*\* \| Visualizar documento PDF \|

\| \*\*Historia\*\* \| HU-009 \|

\| \*\*Precondiciones\*\* \| Documento PDF existe en expediente \|

\| Paso \| Acción \| Resultado Esperado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Clic en icono \"Ver\" del documento \| Se abre visor de PDF \|

\| 2 \| Verificar contenido \| PDF se visualiza correctamente \|

\| 3 \| Usar controles de navegación \| Páginas cambian \|

\| 4 \| Usar zoom \| Documento se amplía/reduce \|

\| 5 \| Clic en \"Descargar\" \| Archivo se descarga \|

\| 6 \| Clic en \"Imprimir\" \| Se abre diálogo de impresión \|

\-\--

\*\*CP-006: Búsqueda Avanzada\*\*

\| Campo \| Valor \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| \*\*ID\*\* \| CP-006 \|

\| \*\*Título\*\* \| Búsqueda con múltiples filtros \|

\| \*\*Historia\*\* \| HU-013 \|

\| \*\*Precondiciones\*\* \| Existen expedientes en el sistema \|

\| \*\*Datos de prueba\*\* \| Tipo: Civil, Estado: Activo \|

\| Paso \| Acción \| Resultado Esperado \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Acceder a Búsqueda Avanzada \| Se muestra formulario de filtros
\|

\| 2 \| Seleccionar Tipo: Civil \| Filtro aplicado \|

\| 3 \| Seleccionar Estado: Activo \| Filtro aplicado \|

\| 4 \| Clic en \"Buscar\" \| Sistema ejecuta búsqueda \|

\| 5 \| Verificar resultados \| Solo expedientes Civil y Activo \|

\| 6 \| Clic en \"Limpiar filtros\" \| Filtros se reinician \|

\-\--

\### 9.4.2 Criterios de Aceptación

\| Criterio \| Descripción \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Funcionalidad\*\* \| 100% de los casos de prueba pasan \|

\| \*\*Errores críticos\*\* \| 0 errores que impidan operación \|

\| \*\*Errores mayores\*\* \| Máximo 3, con workaround documentado \|

\| \*\*Errores menores\*\* \| Máximo 10, no afectan funcionalidad \|

\| \*\*Rendimiento\*\* \| Tiempos de respuesta \< 3 segundos \|

\| \*\*Usabilidad\*\* \| Usuario puede completar tareas sin ayuda \|

\### 9.4.3 Formato de Acta de Resultados UAT

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ ACTA DE RESULTADOS UAT │

│ Sistema de Gestión de Expedientes Digitales │

└──────────────────────────────────────────────────────────────────────────────┘

INFORMACIÓN GENERAL

───────────────────────────────────────────────────────────────────────────────

Fecha de ejecución: \_\_\_/\_\_\_/2026

Ambiente: Pruebas / Pre-producción

Versión del sistema: 1.0.0

Ejecutado por:
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Rol: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

RESUMEN DE RESULTADOS

───────────────────────────────────────────────────────────────────────────────

┌─────────────────────┬──────────┬──────────┬──────────┬──────────┐

│ Módulo │ Casos │ Pasados │ Fallidos │ Bloqueados│

├─────────────────────┼──────────┼──────────┼──────────┼──────────┤

│ Autenticación │ 5 │ │ │ │

│ Expedientes │ 8 │ │ │ │

│ Documentos │ 10 │ │ │ │

│ Búsqueda │ 5 │ │ │ │

│ Integración SGT │ 4 │ │ │ │

│ Administración │ 6 │ │ │ │

├─────────────────────┼──────────┼──────────┼──────────┼──────────┤

│ TOTAL │ 38 │ │ │ │

└─────────────────────┴──────────┴──────────┴──────────┴──────────┘

DETALLE DE CASOS FALLIDOS

───────────────────────────────────────────────────────────────────────────────

ID │ Descripción del fallo │ Severidad │ Estado

────────┼──────────────────────────────────────────┼───────────┼──────────

│ │ │

│ │ │

│ │ │

ERRORES ENCONTRADOS

───────────────────────────────────────────────────────────────────────────────

\# │ Descripción │ Severidad │ Módulo

────┼──────────────────────────────────────────┼───────────┼──────────

│ │ │

│ │ │

OBSERVACIONES

───────────────────────────────────────────────────────────────────────────────

DECISIÓN

───────────────────────────────────────────────────────────────────────────────

\[ \] APROBADO - El sistema cumple con los criterios de aceptación

\[ \] APROBADO CON OBSERVACIONES - Requiere correcciones menores

\[ \] RECHAZADO - No cumple criterios, requiere correcciones

FIRMAS

───────────────────────────────────────────────────────────────────────────────

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Usuario de Pruebas Líder de Proyecto

Nombre: Nombre:

Fecha: Fecha:

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Representante OJ

Nombre:

Fecha:

\`\`\`

\-\--

\## 9.5 Pruebas de Rendimiento

\### 9.5.1 Métricas Objetivo

\| Métrica \| Objetivo \| Crítico \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Tiempo respuesta API (p95) \| \< 2 segundos \| \< 5 segundos \|

\| Tiempo carga página \| \< 3 segundos \| \< 5 segundos \|

\| Usuarios concurrentes \| 50 \| 30 \|

\| Throughput \| 100 req/min \| 50 req/min \|

\| Tasa de error \| \< 1% \| \< 5% \|

\| Uso CPU servidor \| \< 70% \| \< 90% \|

\| Uso memoria servidor \| \< 80% \| \< 90% \|

\### 9.5.2 Escenarios de Carga

\*\*Escenario 1: Carga Normal\*\*

\`\`\`

Usuarios concurrentes: 30

Duración: 10 minutos

Ramp-up: 2 minutos

Distribución de operaciones:

\- 40% Consultar expedientes

\- 25% Ver detalle expediente

\- 15% Búsquedas

\- 10% Visualizar documentos

\- 5% Crear expedientes

\- 5% Cargar documentos

\`\`\`

\*\*Escenario 2: Carga Pico\*\*

\`\`\`

Usuarios concurrentes: 50

Duración: 5 minutos

Ramp-up: 1 minuto

Distribución de operaciones:

\- 50% Consultar expedientes

\- 30% Búsquedas

\- 20% Ver documentos

\`\`\`

\*\*Script JMeter Básico (Pseudocódigo):\*\*

\`\`\`

Thread Group: Usuarios Normales

\- Number of Threads: 30

\- Ramp-Up: 120 seconds

\- Loop Count: Forever

\- Duration: 600 seconds

HTTP Request Defaults:

\- Server: sged.oj.gob.gt

\- Protocol: https

\- Content-Type: application/json

1\. Login

POST /api/v1/auth/login

Extract: token

2\. Listar Expedientes (40%)

GET /api/v1/expedientes

Header: Authorization: Bearer \${token}

3\. Ver Detalle (25%)

GET /api/v1/expedientes/\${expedienteId}

4\. Búsqueda (15%)

POST /api/v1/busqueda/avanzada

5\. Ver Documento (10%)

GET /api/v1/documentos/\${docId}/contenido

6\. Crear Expediente (5%)

POST /api/v1/expedientes

7\. Logout

POST /api/v1/auth/logout

Listeners:

\- Summary Report

\- Response Times Over Time

\- Transactions per Second

\`\`\`

\-\--

\## 9.6 Resumen de Pruebas

\### Cobertura por Tipo

\| Tipo de Prueba \| Cantidad \| Cobertura \|

\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Unitarias Backend \| \~50 tests \| 80% código \|

\| Unitarias Frontend \| \~30 tests \| 70% código \|

\| Integración API \| \~25 tests \| APIs críticas \|

\| UAT \| 38 casos \| 100% HU \|

\| Rendimiento \| 2 escenarios \| Carga normal y pico \|

\### Cronograma de Pruebas

\| Fase \| Días \| Tipo \|

\|\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\--\|

\| Desarrollo (continuo) \| 36-65 \| Unitarias \|

\| Pre-UAT \| 66-68 \| Integración \|

\| UAT \| 69-75 \| Aceptación \|

\| Correcciones \| 76-78 \| Fixes \|

\| Re-test \| 79-80 \| Verificación \|

\### Criterios de Salida

\`\`\`

✓ 80% cobertura de pruebas unitarias backend

✓ 70% cobertura de pruebas unitarias frontend

✓ 100% de pruebas de integración pasando

✓ 100% de casos UAT pasando

✓ 0 errores críticos

✓ Máximo 3 errores mayores con workaround

✓ Rendimiento dentro de objetivos

✓ Acta UAT firmada

\`\`\`

\-\--

## \# SECCIÓN 10: DESPLIEGUE

\-\--

\## 10.1 Ambientes

\### 10.1.1 Arquitectura de Ambientes

\`\`\`

┌──────────────────────────────────────────────────────────────────────────────┐

│ AMBIENTES DEL SISTEMA │

└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

│ DESARROLLO │ │ PRUEBAS │ │ PRODUCCIÓN │

│ (DEV) │───▶│ (QA) │───▶│ (PROD) │

└─────────────────┘ └─────────────────┘ └─────────────────┘

│ │ │

▼ ▼ ▼

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

│ - Desarrollo │ │ - Pruebas UAT │ │ - Usuarios │

│ local │ │ - Integración │ │ reales │

│ - BD H2/Oracle │ │ - BD Oracle QA │ │ - BD Oracle │

│ - Datos prueba │ │ - Datos prueba │ │ Producción │

│ - Sin SSL │ │ - Con SSL │ │ - SSL + Dominio │

└─────────────────┘ └─────────────────┘ └─────────────────┘

\`\`\`

\### 10.1.2 Especificaciones por Ambiente

\| Aspecto \| Desarrollo \| Pruebas/QA \| Producción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Servidor\*\* \| Local \| Servidor OJ \| Servidor OJ \|

\| \*\*CPU\*\* \| - \| 4 cores \| 8 cores \|

\| \*\*RAM\*\* \| - \| 8 GB \| 16 GB \|

\| \*\*Disco\*\* \| - \| 100 GB \| 500 GB \|

\| \*\*SO\*\* \| Windows/Mac/Linux \| Linux (RHEL/Ubuntu) \| Linux
(RHEL/Ubuntu) \|

\| \*\*Java\*\* \| 21 \| 21 \| 21 \|

\| \*\*Node.js\*\* \| 22 \| 22 \| 22 \|

\| \*\*BD\*\* \| H2/Oracle local \| Oracle QA \| Oracle Producción \|

\| \*\*URL\*\* \| localhost:4200 \| qa-sged.oj.gob.gt \| sged.oj.gob.gt
\|

\| \*\*SSL\*\* \| No \| Sí \| Sí \|

\| \*\*Dominio\*\* \| localhost \| Interno \| Interno \|

\-\--

\## 10.2 Configuración por Ambiente

\### 10.2.1 Variables de Entorno

\*\*Backend (application.properties / Variables de entorno):\*\*

\`\`\`properties

\# ============================================

\# Variables de entorno requeridas

\# ============================================

\# Base de datos SGED

SGED_DB_URL=jdbc:oracle:thin:@//servidor:1521/sged

SGED_DB_USER=sged_user

SGED_DB_PASSWORD=\*\*\*\*\*\*\*\*

\# Base de datos SGTv1 (solo lectura)

SGTV1_DB_URL=jdbc:oracle:thin:@//servidor-sgt:1521/sgtv1

SGTV1_DB_USER=sgtv1_reader

SGTV1_DB_PASSWORD=\*\*\*\*\*\*\*\*

\# Base de datos SGTv2 (solo lectura)

SGTV2_DB_URL=jdbc:oracle:thin:@//servidor-sgt:1521/sgtv2

SGTV2_DB_USER=sgtv2_reader

SGTV2_DB_PASSWORD=\*\*\*\*\*\*\*\*

\# JWT

JWT_SECRET=clave-secreta-minimo-256-bits-muy-segura-cambiar-en-produccion

JWT_EXPIRATION=28800000

\# Almacenamiento de archivos

STORAGE_PATH=/opt/sged/storage

STORAGE_MAX_FILE_SIZE=104857600

\# Perfil activo

SPRING_PROFILES_ACTIVE=prod

\`\`\`

\*\*Frontend (environment.prod.ts):\*\*

\`\`\`typescript

export const environment = {

production: true,

apiUrl: \'https://sged.oj.gob.gt/api/v1\',

appName: \'SGED - Organismo Judicial\',

sessionTimeout: 30 \* 60 \* 1000, // 30 minutos

maxFileSize: 100 \* 1024 \* 1024 // 100 MB

};

\`\`\`

\### 10.2.2 Archivos de Configuración

\*\*application.properties (común):\*\*

\`\`\`properties

\# ============================================

\# CONFIGURACIÓN COMÚN

\# ============================================

spring.application.name=sged

\# JPA/Hibernate

spring.jpa.hibernate.ddl-auto=validate

spring.jpa.show-sql=false

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.OracleDialect

spring.jpa.properties.hibernate.format_sql=false

\# Archivos

spring.servlet.multipart.max-file-size=100MB

spring.servlet.multipart.max-request-size=100MB

\# Logging

logging.level.root=INFO

logging.level.gob.oj.sged=INFO

logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} \[%thread\] %-5level
%logger{36} - %msg%n

\`\`\`

\*\*application-dev.properties:\*\*

\`\`\`properties

\# ============================================

\# CONFIGURACIÓN DESARROLLO

\# ============================================

\# Base de datos H2 (desarrollo local)

spring.datasource.sged.url=jdbc:h2:mem:sged;DB_CLOSE_DELAY=-1

spring.datasource.sged.driver-class-name=org.h2.Driver

spring.datasource.sged.username=sa

spring.datasource.sged.password=

spring.h2.console.enabled=true

spring.h2.console.path=/h2-console

spring.jpa.hibernate.ddl-auto=create-drop

spring.jpa.show-sql=true

\# JWT (desarrollo)

jwt.secret=dev-secret-key-not-for-production-use-only-for-development

jwt.expiration=86400000

\# Almacenamiento

app.storage.path=./storage-dev

\# Logging

logging.level.gob.oj.sged=DEBUG

\`\`\`

\*\*application-qa.properties:\*\*

\`\`\`properties

\# ============================================

\# CONFIGURACIÓN QA/PRUEBAS

\# ============================================

\# Base de datos Oracle QA

spring.datasource.sged.url=\${SGED_DB_URL}

spring.datasource.sged.username=\${SGED_DB_USER}

spring.datasource.sged.password=\${SGED_DB_PASSWORD}

spring.datasource.sged.driver-class-name=oracle.jdbc.OracleDriver

\# SGT (QA)

spring.datasource.sgtv1.url=\${SGTV1_DB_URL}

spring.datasource.sgtv1.username=\${SGTV1_DB_USER}

spring.datasource.sgtv1.password=\${SGTV1_DB_PASSWORD}

spring.datasource.sgtv2.url=\${SGTV2_DB_URL}

spring.datasource.sgtv2.username=\${SGTV2_DB_USER}

spring.datasource.sgtv2.password=\${SGTV2_DB_PASSWORD}

\# JWT

jwt.secret=\${JWT_SECRET}

jwt.expiration=\${JWT_EXPIRATION}

\# Almacenamiento

app.storage.path=\${STORAGE_PATH}

\# Logging

logging.level.gob.oj.sged=INFO

\`\`\`

\*\*application-prod.properties:\*\*

\`\`\`properties

\# ============================================

\# CONFIGURACIÓN PRODUCCIÓN

\# ============================================

\# Base de datos Oracle Producción

spring.datasource.sged.url=\${SGED_DB_URL}

spring.datasource.sged.username=\${SGED_DB_USER}

spring.datasource.sged.password=\${SGED_DB_PASSWORD}

spring.datasource.sged.driver-class-name=oracle.jdbc.OracleDriver

\# Pool de conexiones

spring.datasource.sged.hikari.maximum-pool-size=20

spring.datasource.sged.hikari.minimum-idle=5

spring.datasource.sged.hikari.idle-timeout=300000

spring.datasource.sged.hikari.connection-timeout=30000

\# SGT Producción

spring.datasource.sgtv1.url=\${SGTV1_DB_URL}

spring.datasource.sgtv1.username=\${SGTV1_DB_USER}

spring.datasource.sgtv1.password=\${SGTV1_DB_PASSWORD}

spring.datasource.sgtv1.hikari.maximum-pool-size=5

spring.datasource.sgtv2.url=\${SGTV2_DB_URL}

spring.datasource.sgtv2.username=\${SGTV2_DB_USER}

spring.datasource.sgtv2.password=\${SGTV2_DB_PASSWORD}

spring.datasource.sgtv2.hikari.maximum-pool-size=5

\# JWT

jwt.secret=\${JWT_SECRET}

jwt.expiration=\${JWT_EXPIRATION}

\# Almacenamiento

app.storage.path=\${STORAGE_PATH}

app.storage.max-file-size=\${STORAGE_MAX_FILE_SIZE}

\# Logging

logging.level.root=WARN

logging.level.gob.oj.sged=INFO

logging.file.name=/var/log/sged/application.log

logging.file.max-size=10MB

logging.file.max-history=30

\`\`\`

\-\--

\## 10.3 Docker

\### 10.3.1 Dockerfile Backend

\`\`\`dockerfile

\# ============================================

\# Dockerfile - Backend SGED

\# Multi-stage build para optimizar tamaño

\# ============================================

\# Etapa 1: Build

FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

\# Copiar archivos de dependencias primero (cache de Docker)

COPY pom.xml .

RUN mvn dependency:go-offline -B

\# Copiar código fuente y compilar

COPY src ./src

RUN mvn clean package -DskipTests -B

\# Etapa 2: Runtime

FROM eclipse-temurin:21-jre-alpine

LABEL maintainer=\"OJ \<desarrollo@oj.gob.gt\>\"

LABEL description=\"SGED Backend - Sistema de Gestión de Expedientes
Digitales\"

LABEL version=\"1.0.0\"

\# Crear usuario no-root

RUN addgroup -S sged && adduser -S sged -G sged

WORKDIR /app

\# Copiar JAR desde etapa de build

COPY \--from=build /app/target/sged-\*.jar app.jar

\# Crear directorio de storage

RUN mkdir -p /opt/sged/storage && \\

chown -R sged:sged /opt/sged

\# Cambiar a usuario no-root

USER sged

\# Puerto

EXPOSE 8080

\# Health check

HEALTHCHECK \--interval=30s \--timeout=10s \--start-period=60s
\--retries=3 \\

CMD wget \--quiet \--tries=1 \--spider
http://localhost:8080/actuator/health \|\| exit 1

\# Variables de entorno por defecto

ENV JAVA_OPTS=\"-Xms512m -Xmx1024m\"

ENV SPRING_PROFILES_ACTIVE=prod

\# Ejecutar aplicación

ENTRYPOINT \[\"sh\", \"-c\", \"java \$JAVA_OPTS -jar app.jar\"\]

\`\`\`

\### 10.3.2 Dockerfile Frontend

\`\`\`dockerfile

\# ============================================

\# Dockerfile - Frontend SGED

\# Multi-stage build

\# ============================================

\# Etapa 1: Build

FROM node:22-alpine AS build

WORKDIR /app

\# Copiar archivos de dependencias

COPY package\*.json ./

RUN npm ci

\# Copiar código fuente

COPY . .

\# Build de producción

RUN npm run build \-- \--configuration=production

\# Etapa 2: Runtime con NGINX

FROM nginx:1.26-alpine

LABEL maintainer=\"OJ \<desarrollo@oj.gob.gt\>\"

LABEL description=\"SGED Frontend - Sistema de Gestión de Expedientes
Digitales\"

LABEL version=\"1.0.0\"

\# Copiar configuración de NGINX

COPY nginx.conf /etc/nginx/nginx.conf

\# Copiar build de Angular

COPY \--from=build /app/dist/sged/browser /usr/share/nginx/html

\# Puerto

EXPOSE 80

\# Health check

HEALTHCHECK \--interval=30s \--timeout=10s \--retries=3 \\

CMD wget \--quiet \--tries=1 \--spider http://localhost:80/health \|\|
exit 1

\# Ejecutar NGINX

CMD \[\"nginx\", \"-g\", \"daemon off;\"\]

\`\`\`

\### 10.3.3 nginx.conf

\`\`\`nginx

\# ============================================

\# Configuración NGINX para SGED Frontend

\# ============================================

worker_processes auto;

error_log /var/log/nginx/error.log warn;

pid /var/run/nginx.pid;

events {

worker_connections 1024;

}

http {

include /etc/nginx/mime.types;

default_type application/octet-stream;

log_format main \'\$remote_addr - \$remote_user \[\$time_local\]
\"\$request\" \'

\'\$status \$body_bytes_sent \"\$http_referer\" \'

\'\"\$http_user_agent\" \"\$http_x_forwarded_for\"\';

access_log /var/log/nginx/access.log main;

sendfile on;

tcp_nopush on;

tcp_nodelay on;

keepalive_timeout 65;

types_hash_max_size 2048;

\# Compresión GZIP

gzip on;

gzip_vary on;

gzip_proxied any;

gzip_comp_level 6;

gzip_types text/plain text/css text/xml application/json
application/javascript

application/xml application/xml+rss text/javascript;

server {

listen 80;

server_name localhost;

root /usr/share/nginx/html;

index index.html;

\# Health check endpoint

location /health {

access_log off;

return 200 \"OK\";

add_header Content-Type text/plain;

}

\# Archivos estáticos con cache

location \~\* \\.(js\|css\|png\|jpg\|jpeg\|gif\|ico\|svg\|woff\|woff2)\$
{

expires 1y;

add_header Cache-Control \"public, immutable\";

}

\# Proxy al backend API

location /api {

proxy_pass http://backend:8080;

proxy_http_version 1.1;

proxy_set_header Host \$host;

proxy_set_header X-Real-IP \$remote_addr;

proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

proxy_set_header X-Forwarded-Proto \$scheme;

\# Timeout para uploads grandes

proxy_connect_timeout 300;

proxy_send_timeout 300;

proxy_read_timeout 300;

\# Buffer para archivos grandes

client_max_body_size 100M;

proxy_request_buffering off;

}

\# SPA - redirigir todo a index.html

location / {

try_files \$uri \$uri/ /index.html;

}

\# Seguridad

add_header X-Frame-Options \"SAMEORIGIN\" always;

add_header X-Content-Type-Options \"nosniff\" always;

add_header X-XSS-Protection \"1; mode=block\" always;

}

}

\`\`\`

\### 10.3.4 Docker Compose

\*\*docker-compose.yml (Desarrollo):\*\*

\`\`\`yaml

\# ============================================

\# Docker Compose - SGED Desarrollo

\# ============================================

version: \'3.8\'

services:

\# Base de datos Oracle (desarrollo)

oracle:

image: gvenzl/oracle-xe:21-slim

container_name: sged-oracle-dev

environment:

ORACLE_PASSWORD: oracle123

ports:

\- \"1521:1521\"

volumes:

\- oracle-data:/opt/oracle/oradata

\- ./db/init:/container-entrypoint-initdb.d

healthcheck:

test: \[\"CMD\", \"healthcheck.sh\"\]

interval: 30s

timeout: 10s

retries: 5

\# Backend

backend:

build:

context: ./backend

dockerfile: Dockerfile

container_name: sged-backend-dev

environment:

SPRING_PROFILES_ACTIVE: dev

SGED_DB_URL: jdbc:oracle:thin:@oracle:1521/XEPDB1

SGED_DB_USER: sged

SGED_DB_PASSWORD: sged123

JWT_SECRET: dev-secret-key-cambiar-en-produccion

STORAGE_PATH: /opt/sged/storage

ports:

\- \"8080:8080\"

volumes:

\- storage-data:/opt/sged/storage

depends_on:

oracle:

condition: service_healthy

\# Frontend

frontend:

build:

context: ./frontend

dockerfile: Dockerfile

container_name: sged-frontend-dev

ports:

\- \"80:80\"

depends_on:

\- backend

volumes:

oracle-data:

storage-data:

\`\`\`

\*\*docker-compose.prod.yml (Producción):\*\*

\`\`\`yaml

\# ============================================

\# Docker Compose - SGED Producción

\# ============================================

version: \'3.8\'

services:

\# Backend

backend:

image: registro.oj.gob.gt/sged/backend:\${VERSION:-latest}

container_name: sged-backend

restart: always

environment:

SPRING_PROFILES_ACTIVE: prod

SGED_DB_URL: \${SGED_DB_URL}

SGED_DB_USER: \${SGED_DB_USER}

SGED_DB_PASSWORD: \${SGED_DB_PASSWORD}

SGTV1_DB_URL: \${SGTV1_DB_URL}

SGTV1_DB_USER: \${SGTV1_DB_USER}

SGTV1_DB_PASSWORD: \${SGTV1_DB_PASSWORD}

SGTV2_DB_URL: \${SGTV2_DB_URL}

SGTV2_DB_USER: \${SGTV2_DB_USER}

SGTV2_DB_PASSWORD: \${SGTV2_DB_PASSWORD}

JWT_SECRET: \${JWT_SECRET}

JWT_EXPIRATION: \${JWT_EXPIRATION:-28800000}

STORAGE_PATH: /opt/sged/storage

JAVA_OPTS: \"-Xms1g -Xmx2g\"

volumes:

\- \${STORAGE_HOST_PATH:-/opt/sged/storage}:/opt/sged/storage

\- /var/log/sged:/var/log/sged

networks:

\- sged-network

healthcheck:

test: \[\"CMD\", \"wget\", \"-q\", \"\--spider\",
\"http://localhost:8080/actuator/health\"\]

interval: 30s

timeout: 10s

retries: 3

start_period: 60s

\# Frontend + NGINX

frontend:

image: registro.oj.gob.gt/sged/frontend:\${VERSION:-latest}

container_name: sged-frontend

restart: always

ports:

\- \"443:443\"

\- \"80:80\"

volumes:

\- /etc/ssl/sged:/etc/nginx/ssl:ro

\- /var/log/nginx:/var/log/nginx

depends_on:

backend:

condition: service_healthy

networks:

\- sged-network

networks:

sged-network:

driver: bridge

\`\`\`

\-\--

\## 10.4 Procedimiento de Despliegue

\### 10.4.1 Pre-requisitos

\*\*Checklist de Pre-requisitos:\*\*

\`\`\`

INFRAESTRUCTURA

───────────────────────────────────────────────────────────────────────────────

\[ \] Servidor con especificaciones mínimas disponible

\[ \] Docker 27.x instalado

\[ \] Docker Compose instalado

\[ \] Acceso a red hacia servidores Oracle (SGED, SGTv1, SGTv2)

\[ \] Puertos 80/443 disponibles

\[ \] Certificado SSL válido

\[ \] Directorio de storage creado con permisos correctos

\[ \] Directorio de logs creado con permisos correctos

BASE DE DATOS

───────────────────────────────────────────────────────────────────────────────

\[ \] Esquema SGED creado en Oracle

\[ \] Tablas creadas (script DDL ejecutado)

\[ \] Datos iniciales cargados (catálogos, usuario admin)

\[ \] Usuario de BD creado con permisos correctos

\[ \] Conectividad verificada desde servidor de aplicación

\[ \] Usuario read-only para SGTv1 disponible

\[ \] Usuario read-only para SGTv2 disponible

CONFIGURACIÓN

───────────────────────────────────────────────────────────────────────────────

\[ \] Archivo .env con variables de entorno creado

\[ \] JWT_SECRET generado (mínimo 256 bits)

\[ \] Contraseñas de BD configuradas

\[ \] Rutas de storage configuradas

\[ \] Certificados SSL copiados

CÓDIGO

───────────────────────────────────────────────────────────────────────────────

\[ \] Código fuente en versión final (tag de release)

\[ \] Imágenes Docker construidas

\[ \] Imágenes Docker probadas en ambiente QA

\[ \] Pruebas UAT aprobadas

\`\`\`

\### 10.4.2 Pasos de Despliegue

\*\*Script de Despliegue (deploy.sh):\*\*

\`\`\`bash

#!/bin/bash

\# ============================================

\# Script de Despliegue SGED

\# ============================================

set -e \# Detener en caso de error

\# Variables

VERSION=\${1:-latest}

ENV_FILE=\".env.prod\"

COMPOSE_FILE=\"docker-compose.prod.yml\"

BACKUP_DIR=\"/opt/sged/backups\"

LOG_FILE=\"/var/log/sged/deploy-\$(date +%Y%m%d-%H%M%S).log\"

\# Colores

RED=\'\\033\[0;31m\'

GREEN=\'\\033\[0;32m\'

YELLOW=\'\\033\[1;33m\'

NC=\'\\033\[0m\'

log() {

echo -e \"\${GREEN}\[\$(date \'+%Y-%m-%d %H:%M:%S\')\]\${NC} \$1\" \|
tee -a \$LOG_FILE

}

error() {

echo -e \"\${RED}\[ERROR\]\${NC} \$1\" \| tee -a \$LOG_FILE

exit 1

}

warn() {

echo -e \"\${YELLOW}\[WARN\]\${NC} \$1\" \| tee -a \$LOG_FILE

}

\# ============================================

\# 1. Verificaciones previas

\# ============================================

log \"=== INICIANDO DESPLIEGUE SGED v\${VERSION} ===\"

log \"Verificando pre-requisitos\...\"

\# Verificar Docker

if ! command -v docker &\> /dev/null; then

error \"Docker no está instalado\"

fi

\# Verificar archivo de entorno

if \[ ! -f \"\$ENV_FILE\" \]; then

error \"Archivo \$ENV_FILE no encontrado\"

fi

\# Verificar conexión a BD

log \"Verificando conexión a base de datos\...\"

\# (Agregar verificación según herramientas disponibles)

\# ============================================

\# 2. Backup previo

\# ============================================

log \"Creando backup de contenedores actuales\...\"

mkdir -p \$BACKUP_DIR

if docker ps -q -f name=sged-backend &\> /dev/null; then

docker logs sged-backend \> \"\$BACKUP_DIR/backend-\$(date
+%Y%m%d-%H%M%S).log\" 2\>&1 \|\| true

fi

\# ============================================

\# 3. Detener servicios actuales

\# ============================================

log \"Deteniendo servicios actuales\...\"

docker-compose -f \$COMPOSE_FILE \--env-file \$ENV_FILE down \|\| true

\# ============================================

\# 4. Actualizar imágenes

\# ============================================

log \"Descargando imágenes v\${VERSION}\...\"

export VERSION=\$VERSION

docker-compose -f \$COMPOSE_FILE \--env-file \$ENV_FILE pull

\# ============================================

\# 5. Iniciar servicios

\# ============================================

log \"Iniciando servicios\...\"

docker-compose -f \$COMPOSE_FILE \--env-file \$ENV_FILE up -d

\# ============================================

\# 6. Verificar estado

\# ============================================

log \"Esperando que los servicios estén listos\...\"

sleep 30

\# Verificar backend

log \"Verificando backend\...\"

BACKEND_HEALTH=\$(docker exec sged-backend wget -q -O -
http://localhost:8080/actuator/health 2\>/dev/null \|\| echo \"error\")

if \[\[ \$BACKEND_HEALTH == \*\"UP\"\* \]\]; then

log \"✓ Backend está funcionando correctamente\"

else

error \"Backend no responde correctamente\"

fi

\# Verificar frontend

log \"Verificando frontend\...\"

FRONTEND_STATUS=\$(curl -s -o /dev/null -w \"%{http_code}\"
https://localhost/health 2\>/dev/null \|\| echo \"000\")

if \[ \"\$FRONTEND_STATUS\" = \"200\" \]; then

log \"✓ Frontend está funcionando correctamente\"

else

warn \"Frontend retornó código \$FRONTEND_STATUS\"

fi

\# ============================================

\# 7. Resumen

\# ============================================

log \"=== DESPLIEGUE COMPLETADO ===\"

log \"Versión: \$VERSION\"

log \"Backend: http://localhost:8080\"

log \"Frontend: https://localhost\"

log \"Log: \$LOG_FILE\"

\# Mostrar estado de contenedores

docker-compose -f \$COMPOSE_FILE ps

\`\`\`

\### 10.4.3 Verificación Post-Despliegue

\*\*Checklist de Verificación:\*\*

\`\`\`

SERVICIOS

───────────────────────────────────────────────────────────────────────────────

\[ \] Contenedor backend ejecutándose (docker ps)

\[ \] Contenedor frontend ejecutándose

\[ \] Health check backend OK (/actuator/health)

\[ \] Health check frontend OK (/health)

FUNCIONALIDAD

───────────────────────────────────────────────────────────────────────────────

\[ \] Página de login carga correctamente

\[ \] Login con usuario admin funciona

\[ \] Listado de expedientes carga

\[ \] Crear expediente funciona

\[ \] Cargar documento funciona

\[ \] Visualizar documento funciona

\[ \] Búsqueda funciona

\[ \] Consulta SGT funciona (si disponible)

SEGURIDAD

───────────────────────────────────────────────────────────────────────────────

\[ \] Certificado SSL válido

\[ \] Redirección HTTP a HTTPS funciona

\[ \] Headers de seguridad presentes

\[ \] Login incorrecto muestra error apropiado

LOGS

───────────────────────────────────────────────────────────────────────────────

\[ \] Logs de backend sin errores críticos

\[ \] Logs de nginx sin errores

\[ \] Auditoría registrando eventos

\`\`\`

\*\*Script de Verificación (verify.sh):\*\*

\`\`\`bash

#!/bin/bash

\# ============================================

\# Script de Verificación Post-Despliegue

\# ============================================

echo \"=== VERIFICACIÓN POST-DESPLIEGUE SGED ===\"

echo \"\"

\# Colores

GREEN=\'\\033\[0;32m\'

RED=\'\\033\[0;31m\'

NC=\'\\033\[0m\'

check() {

if \[ \$1 -eq 0 \]; then

echo -e \"\${GREEN}✓\${NC} \$2\"

else

echo -e \"\${RED}✗\${NC} \$2\"

fi

}

echo \"1. Verificando contenedores\...\"

docker ps \| grep sged-backend \> /dev/null

check \$? \"Backend ejecutándose\"

docker ps \| grep sged-frontend \> /dev/null

check \$? \"Frontend ejecutándose\"

echo \"\"

echo \"2. Verificando health checks\...\"

BACKEND=\$(curl -s -o /dev/null -w \"%{http_code}\"
http://localhost:8080/actuator/health)

\[ \"\$BACKEND\" = \"200\" \]

check \$? \"Backend health check (HTTP \$BACKEND)\"

FRONTEND=\$(curl -s -o /dev/null -w \"%{http_code}\"
http://localhost/health)

\[ \"\$FRONTEND\" = \"200\" \]

check \$? \"Frontend health check (HTTP \$FRONTEND)\"

echo \"\"

echo \"3. Verificando endpoints principales\...\"

LOGIN_PAGE=\$(curl -s -o /dev/null -w \"%{http_code}\"
https://localhost)

\[ \"\$LOGIN_PAGE\" = \"200\" \]

check \$? \"Página principal (HTTP \$LOGIN_PAGE)\"

API=\$(curl -s -o /dev/null -w \"%{http_code}\"
http://localhost:8080/api/v1/catalogos/juzgados)

\# Debe retornar 401 sin autenticación

\[ \"\$API\" = \"401\" \]

check \$? \"API protegida (HTTP \$API - esperado 401)\"

echo \"\"

echo \"4. Verificando SSL\...\"

SSL=\$(curl -s -o /dev/null -w \"%{http_code}\" \--max-time 5
https://localhost 2\>/dev/null)

\[ \"\$SSL\" = \"200\" \]

check \$? \"HTTPS funcionando\"

echo \"\"

echo \"5. Verificando logs\...\"

docker logs sged-backend 2\>&1 \| tail -5 \| grep -i \"error\" \>
/dev/null

\[ \$? -ne 0 \]

check \$? \"Sin errores recientes en backend\"

echo \"\"

echo \"=== VERIFICACIÓN COMPLETADA ===\"

\`\`\`

\### 10.4.4 Rollback

\*\*Script de Rollback (rollback.sh):\*\*

\`\`\`bash

#!/bin/bash

\# ============================================

\# Script de Rollback SGED

\# ============================================

set -e

PREVIOUS_VERSION=\$1

ENV_FILE=\".env.prod\"

COMPOSE_FILE=\"docker-compose.prod.yml\"

if \[ -z \"\$PREVIOUS_VERSION\" \]; then

echo \"Uso: ./rollback.sh \<version_anterior\>\"

echo \"Ejemplo: ./rollback.sh 1.0.0\"

exit 1

fi

echo \"=== INICIANDO ROLLBACK A v\${PREVIOUS_VERSION} ===\"

\# Detener servicios actuales

echo \"Deteniendo servicios actuales\...\"

docker-compose -f \$COMPOSE_FILE \--env-file \$ENV_FILE down

\# Iniciar versión anterior

echo \"Iniciando versión \${PREVIOUS_VERSION}\...\"

export VERSION=\$PREVIOUS_VERSION

docker-compose -f \$COMPOSE_FILE \--env-file \$ENV_FILE up -d

\# Verificar

echo \"Verificando servicios\...\"

sleep 30

./verify.sh

echo \"=== ROLLBACK COMPLETADO ===\"

\`\`\`

\*\*Procedimiento de Rollback Manual:\*\*

\`\`\`

ROLLBACK MANUAL

───────────────────────────────────────────────────────────────────────────────

1\. Detener servicios actuales:

\$ docker-compose -f docker-compose.prod.yml down

2\. Verificar versiones disponibles:

\$ docker images \| grep sged

3\. Cambiar a versión anterior:

\$ export VERSION=1.0.0 \# versión anterior

\$ docker-compose -f docker-compose.prod.yml up -d

4\. Verificar funcionamiento:

\$ ./verify.sh

5\. Si hay cambios en BD que revertir:

\- Restaurar backup de BD previo al despliegue

\- Verificar integridad de datos

6\. Notificar al equipo del rollback realizado

\`\`\`

\-\--

\## 10.5 Estructura de Directorios en Servidor

\`\`\`

/opt/sged/

├── app/ \# Aplicación

│ ├── docker-compose.prod.yml

│ ├── .env.prod

│ ├── deploy.sh

│ ├── rollback.sh

│ └── verify.sh

│

├── storage/ \# Almacenamiento de documentos

│ └── documentos/

│ ├── 2026/

│ │ ├── 01/

│ │ ├── 02/

│ │ └── \...

│ └── \...

│

├── backups/ \# Backups

│ ├── db/

│ └── logs/

│

├── ssl/ \# Certificados SSL

│ ├── sged.crt

│ └── sged.key

│

└── logs/ \# Logs de aplicación

├── application.log

└── deploy-\*.log

/var/log/

├── sged/ \# Logs de aplicación (link)

└── nginx/ \# Logs de NGINX

├── access.log

└── error.log

\`\`\`

\-\--

\## 10.6 Resumen de Despliegue

\### Comandos Principales

\| Acción \| Comando \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Desplegar nueva versión \| \`./deploy.sh 1.0.1\` \|

\| Verificar estado \| \`./verify.sh\` \|

\| Ver logs backend \| \`docker logs -f sged-backend\` \|

\| Ver logs frontend \| \`docker logs -f sged-frontend\` \|

\| Reiniciar servicios \| \`docker-compose restart\` \|

\| Detener servicios \| \`docker-compose down\` \|

\| Rollback \| \`./rollback.sh 1.0.0\` \|

\### Archivos de Configuración

\| Archivo \| Propósito \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| \`.env.prod\` \| Variables de entorno producción \|

\| \`docker-compose.prod.yml\` \| Definición de servicios \|

\| \`nginx.conf\` \| Configuración del servidor web \|

\| \`deploy.sh\` \| Script de despliegue \|

\| \`verify.sh\` \| Verificación post-despliegue \|

\| \`rollback.sh\` \| Rollback a versión anterior \|

------------------------------------------------------------------------

## \# SECCIÓN 11: MANUALES

\-\--

\## 11.1 Manual de Instalación

\### 11.1.1 Requisitos de Hardware

\*\*Servidor de Aplicación (Producción):\*\*

\| Componente \| Mínimo \| Recomendado \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| CPU \| 4 cores \| 8 cores \|

\| RAM \| 8 GB \| 16 GB \|

\| Disco SO \| 50 GB \| 100 GB \|

\| Disco Storage \| 200 GB \| 500 GB+ \|

\| Red \| 100 Mbps \| 1 Gbps \|

\*\*Servidor de Base de Datos (si es separado):\*\*

\| Componente \| Mínimo \| Recomendado \|

\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| CPU \| 4 cores \| 8 cores \|

\| RAM \| 16 GB \| 32 GB \|

\| Disco \| 200 GB SSD \| 500 GB SSD \|

\### 11.1.2 Requisitos de Software

\| Software \| Versión \| Propósito \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|

\| Sistema Operativo \| RHEL 8+ / Ubuntu 22.04+ \| Servidor \|

\| Docker \| 27.x \| Contenedores \|

\| Docker Compose \| 2.x \| Coordinación de contenedores \|

\| Oracle Database \| 19c / 21c / 23c \| Base de datos \|

\| Git \| 2.40+ \| Control de versiones \|

\### 11.1.3 Instalación Paso a Paso

\*\*Paso 1: Preparar el Servidor\*\*

\`\`\`bash

\# Actualizar sistema (Ubuntu)

sudo apt update && sudo apt upgrade -y

\# Instalar dependencias

sudo apt install -y curl wget git unzip

\# Instalar Docker

curl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh

\# Agregar usuario al grupo docker

sudo usermod -aG docker \$USER

\# Instalar Docker Compose

sudo curl -L
\"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname
-s)-\$(uname -m)\" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

\# Verificar instalación

docker \--version

docker-compose \--version

\`\`\`

\*\*Paso 2: Crear Estructura de Directorios\*\*

\`\`\`bash

\# Crear directorios

sudo mkdir -p /opt/sged/{app,storage/documentos,backups,ssl,logs}

\# Asignar permisos

sudo chown -R \$USER:\$USER /opt/sged

\# Crear directorio de logs

sudo mkdir -p /var/log/sged

sudo chown -R \$USER:\$USER /var/log/sged

\`\`\`

\*\*Paso 3: Configurar Base de Datos\*\*

\`\`\`sql

\-- Conectar a Oracle como SYSDBA

\-- Crear tablespace

CREATE TABLESPACE sged_data

DATAFILE \'/opt/oracle/oradata/sged_data01.dbf\'

SIZE 1G AUTOEXTEND ON NEXT 100M MAXSIZE 10G;

\-- Crear usuario

CREATE USER sged IDENTIFIED BY \"password_seguro\"

DEFAULT TABLESPACE sged_data

QUOTA UNLIMITED ON sged_data;

\-- Otorgar permisos

GRANT CONNECT, RESOURCE TO sged;

GRANT CREATE SESSION TO sged;

GRANT CREATE TABLE TO sged;

GRANT CREATE SEQUENCE TO sged;

GRANT CREATE VIEW TO sged;

\-- Ejecutar script de creación de tablas

@/path/to/sged_schema.sql

\-- Ejecutar script de datos iniciales

@/path/to/sged_data.sql

\`\`\`

\*\*Paso 4: Configurar Certificados SSL\*\*

\`\`\`bash

\# Copiar certificados al servidor

sudo cp sged.crt /opt/sged/ssl/

sudo cp sged.key /opt/sged/ssl/

\# Asignar permisos

sudo chmod 644 /opt/sged/ssl/sged.crt

sudo chmod 600 /opt/sged/ssl/sged.key

\`\`\`

\*\*Paso 5: Configurar Variables de Entorno\*\*

\`\`\`bash

\# Crear archivo de configuración

cat \> /opt/sged/app/.env.prod \<\< \'EOF\'

\# Base de datos SGED

SGED_DB_URL=jdbc:oracle:thin:@//servidor-oracle:1521/sged

SGED_DB_USER=sged

SGED_DB_PASSWORD=password_seguro

\# Base de datos SGTv1

SGTV1_DB_URL=jdbc:oracle:thin:@//servidor-sgt:1521/sgtv1

SGTV1_DB_USER=sgtv1_reader

SGTV1_DB_PASSWORD=password_sgtv1

\# Base de datos SGTv2

SGTV2_DB_URL=jdbc:oracle:thin:@//servidor-sgt:1521/sgtv2

SGTV2_DB_USER=sgtv2_reader

SGTV2_DB_PASSWORD=password_sgtv2

\# JWT

JWT_SECRET=clave_secreta_muy_larga_minimo_256_bits_para_produccion

JWT_EXPIRATION=28800000

\# Storage

STORAGE_HOST_PATH=/opt/sged/storage

\# Versión

VERSION=1.0.0

EOF

\# Proteger archivo

chmod 600 /opt/sged/app/.env.prod

\`\`\`

\*\*Paso 6: Desplegar Aplicación\*\*

\`\`\`bash

cd /opt/sged/app

\# Copiar archivos de despliegue

\# (docker-compose.prod.yml, deploy.sh, verify.sh, rollback.sh)

\# Dar permisos de ejecución

chmod +x deploy.sh verify.sh rollback.sh

\# Ejecutar despliegue

./deploy.sh 1.0.0

\`\`\`

\*\*Paso 7: Verificar Instalación\*\*

\`\`\`bash

\# Ejecutar verificación

./verify.sh

\# Verificar manualmente

curl -k https://localhost/health

curl http://localhost:8080/actuator/health

\`\`\`

\### 11.1.4 Configuración Inicial

\*\*Primer Acceso:\*\*

1\. Acceder a \`https://sged.oj.gob.gt\`

2\. Iniciar sesión con usuario administrador inicial:

\- Usuario: \`admin\`

\- Contraseña: \`Admin123\*\` (temporal)

3\. El sistema solicitará cambio de contraseña

4\. Ingresar nueva contraseña segura

5\. Acceder al módulo de Administración

6\. Crear usuarios adicionales según necesidad

\-\--

\## 11.2 Manual Técnico

\### 11.2.1 Arquitectura del Sistema

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ ARQUITECTURA SGED │

└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐

│ NAVEGADOR │

│ (Usuario) │

└────────┬────────┘

│ HTTPS

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ NGINX (Puerto 443) │

│ Reverse Proxy + SSL + Static │

└─────────────────────────────────────────────────────────────────────────────┘

│ │

│ /api/\* │ /\*

▼ ▼

┌─────────────────────────────┐ ┌─────────────────────────────┐

│ BACKEND (8080) │ │ FRONTEND │

│ Spring Boot 3.5 │ │ Angular 21 LTS │

│ │ │ (Archivos estáticos) │

│ ┌───────────────────────┐ │ └─────────────────────────────┘

│ │ Controllers │ │

│ ├───────────────────────┤ │

│ │ Services │ │

│ ├───────────────────────┤ │

│ │ Repositories │ │

│ └───────────────────────┘ │

└──────────────┬──────────────┘

│

┌──────────┼──────────┬──────────────────┐

│ │ │ │

▼ ▼ ▼ ▼

┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐

│ SGED │ │ SGTv1 │ │ SGTv2 │ │ STORAGE │

│ Oracle │ │ Oracle │ │ Oracle │ │ File System │

│ (RW) │ │ (RO) │ │ (RO) │ │ │

└────────┘ └────────┘ └────────┘ └──────────────┘

\`\`\`

\### 11.2.2 Estructura de Código

\*\*Backend (Java/Spring Boot):\*\*

\`\`\`

sged-backend/

├── src/main/java/gob/oj/sged/

│ ├── SgedApplication.java \# Clase principal

│ ├── config/ \# Configuraciones

│ │ ├── SecurityConfig.java \# Seguridad Spring

│ │ ├── CorsConfig.java \# CORS

│ │ └── DataSourceConfig.java \# Múltiples BD

│ ├── controller/ \# Endpoints REST

│ │ ├── AuthController.java

│ │ ├── ExpedienteController.java

│ │ └── \...

│ ├── service/ \# Lógica de negocio

│ │ ├── AuthService.java

│ │ ├── ExpedienteService.java

│ │ └── \...

│ ├── repository/ \# Acceso a datos

│ │ ├── UsuarioRepository.java

│ │ ├── ExpedienteRepository.java

│ │ └── \...

│ ├── entity/ \# Entidades JPA

│ ├── dto/ \# Objetos de transferencia

│ ├── security/ \# JWT, filtros

│ ├── exception/ \# Manejo de errores

│ └── util/ \# Utilidades

├── src/main/resources/

│ ├── application.properties

│ ├── application-dev.properties

│ ├── application-prod.properties

│ └── db/

│ └── migration/ \# Scripts SQL

└── pom.xml

\`\`\`

\*\*Frontend (Angular):\*\*

\`\`\`

sged-frontend/

├── src/

│ ├── app/

│ │ ├── core/ \# Servicios singleton

│ │ │ ├── services/

│ │ │ ├── guards/

│ │ │ └── interceptors/

│ │ ├── shared/ \# Componentes reutilizables

│ │ │ ├── components/

│ │ │ └── pipes/

│ │ ├── features/ \# Módulos funcionales

│ │ │ ├── auth/

│ │ │ ├── expedientes/

│ │ │ ├── documentos/

│ │ │ ├── busqueda/

│ │ │ └── admin/

│ │ ├── app.component.ts

│ │ ├── app.routes.ts

│ │ └── app.config.ts

│ ├── assets/

│ ├── environments/

│ └── styles.scss

├── angular.json

├── package.json

└── tsconfig.json

\`\`\`

\### 11.2.3 Configuración

\*\*Parámetros de Configuración Backend:\*\*

\| Parámetro \| Descripción \| Valor por defecto \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \`server.port\` \| Puerto del servidor \| 8080 \|

\| \`jwt.secret\` \| Clave secreta JWT \| (requerido) \|

\| \`jwt.expiration\` \| Expiración token (ms) \| 28800000 (8h) \|

\| \`app.storage.path\` \| Ruta de almacenamiento \| /opt/sged/storage
\|

\| \`app.storage.max-file-size\` \| Tamaño máximo archivo \| 104857600
(100MB) \|

\| \`spring.datasource.sged.\*\` \| Conexión BD SGED \| (requerido) \|

\| \`spring.datasource.sgtv1.\*\` \| Conexión SGTv1 \| (requerido) \|

\| \`spring.datasource.sgtv2.\*\` \| Conexión SGTv2 \| (requerido) \|

\*\*Parámetros de Configuración Frontend:\*\*

\| Parámetro \| Archivo \| Descripción \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \`apiUrl\` \| environment.ts \| URL del backend \|

\| \`production\` \| environment.ts \| Modo producción \|

\| \`sessionTimeout\` \| environment.ts \| Timeout de sesión \|

\| \`maxFileSize\` \| environment.ts \| Tamaño máximo archivo \|

\### 11.2.4 Mantenimiento

\*\*Tareas de Mantenimiento Periódico:\*\*

\| Tarea \| Frecuencia \| Comando/Procedimiento \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Backup BD \| Diario \| Script RMAN / expdp \|

\| Backup storage \| Diario \| rsync / tar \|

\| Rotación de logs \| Semanal \| logrotate \|

\| Limpieza temp \| Semanal \| rm /tmp/sged-\* \|

\| Verificar espacio disco \| Semanal \| df -h \|

\| Actualizar certificados \| Anual \| Renovar SSL \|

\| Revisar auditoría \| Mensual \| Consulta logs \|

\*\*Comandos de Administración:\*\*

\`\`\`bash

\# Ver logs en tiempo real

docker logs -f sged-backend

\# Reiniciar servicios

docker-compose restart

\# Ver uso de recursos

docker stats

\# Limpiar imágenes no usadas

docker system prune -a

\# Backup de base de datos

docker exec oracle-container expdp sged/password directory=BACKUP
dumpfile=sged\_\$(date +%Y%m%d).dmp

\# Verificar conectividad BD

docker exec sged-backend java -jar /app/app.jar
\--spring.main.web-application-type=none \--check-db

\`\`\`

\*\*Monitoreo:\*\*

\`\`\`bash

\# Health check backend

curl http://localhost:8080/actuator/health

\# Métricas (si Actuator está habilitado)

curl http://localhost:8080/actuator/metrics

\# Verificar conexiones BD

curl http://localhost:8080/actuator/health/db

\# Estado de contenedores

docker ps \--format \"table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\"

\`\`\`

\### 11.2.5 README Backend - Seguridad

Sección sugerida en `sged-backend/README.md`:

- **JWT (8h):** expiración fija y claim `jti` para revocación.
- **Revocación:** tabla `revoked_token` validada en cada request.
- **RBAC:** `usuario.rol_id` -> `cat_rol` con 4 roles fijos.
- **Auditoría:** servicio inserta en `auditoria` (solo INSERT).
- **Password policy:** mínimo 8 chars, mayúscula, minúscula, número.
- **Lockout:** bloqueo tras 5 intentos fallidos.

\### 11.2.6 README Frontend - Autenticación

Sección sugerida en `sged-frontend/README.md`:

- **Módulo auth:** `features/auth` con `AuthService`, `AuthGuard`, `AuthInterceptor`.
- **Token cliente:** almacenamiento en `sessionStorage` + header `Authorization: Bearer`.
- **Expiración:** validar claim `exp` y manejar 401 con redirección a login.
- **Logout:** limpiar storage y forzar navegación a `/login`.

\### 11.2.7 ADRs (Fase 1)

**ADR-001: Estrategia JWT (8h, claims, JJWT)**

- **Contexto:** autenticar usuarios internos con sesión stateless.
- **Decisión:** usar JWT firmado con JJWT, expiración 8h y claims `sub`, `jti`, `roles`.
- **Consecuencias:** validación en cada request; requiere revocación por `jti`.

**ADR-002: Almacenamiento JWT en frontend**

- **Contexto:** evitar persistencia excesiva y reducir riesgo de robo de token.
- **Decisión:** almacenar en `sessionStorage` (no `localStorage`); no usar cookies HTTP-only en Fase 1.
- **Riesgos y mitigaciones:** riesgo XSS mitigado con CSP, sanitización y auditoría de dependencias.

**ADR-003: Auditoría inmutable**

- **Contexto:** trazabilidad obligatoria de operaciones críticas.
- **Decisión:** tabla `auditoria` solo INSERT; sin updates/deletes desde UI.
- **Consecuencias:** requiere filtros/índices para consultas y posible política de retención futura.

\-\--

\## 11.3 Manual de Usuario

\### 11.3.1 Acceso al Sistema

\*\*Inicio de Sesión:\*\*

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ SGED │

│ Sistema de Gestión de Expedientes │

│ Digitales │

│ │

│ ┌───────────────────────────────┐ │

│ │ │ │

│ │ Usuario: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ │ │

│ │ │ │

│ │ Contraseña: \_\_\_\_\_\_\_\_\_\_\_\_ │ │

│ │ │ │

│ │ \[ Iniciar Sesión \] │ │

│ │ │ │

│ └───────────────────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\*\*Pasos:\*\*

1\. Abrir navegador web (Chrome, Edge o Firefox)

2\. Ingresar la dirección: \`https://sged.oj.gob.gt\`

3\. Ingresar su nombre de usuario

4\. Ingresar su contraseña

5\. Hacer clic en \"Iniciar Sesión\"

\*\*Primer Ingreso:\*\*

\- Si es su primer acceso, el sistema le pedirá cambiar la contraseña
temporal

\- La nueva contraseña debe cumplir:

\- Mínimo 8 caracteres

\- Al menos una letra mayúscula

\- Al menos una letra minúscula

\- Al menos un número

\*\*Cerrar Sesión:\*\*

1\. Hacer clic en su nombre de usuario (esquina superior derecha)

2\. Seleccionar \"Cerrar Sesión\"

\-\--

\### 11.3.2 Gestión de Expedientes

\*\*Ver Listado de Expedientes:\*\*

1\. En el menú lateral, hacer clic en \"Expedientes\"

2\. Se muestra la tabla con todos los expedientes disponibles

3\. Puede ordenar haciendo clic en los encabezados de columna

4\. Use el filtro de estado para ver expedientes específicos

5\. Use el campo de búsqueda para filtrar por texto

\*\*Crear Nuevo Expediente:\*\*

1\. Hacer clic en el botón \"+ Nuevo Expediente\"

2\. Completar los campos obligatorios (\*):

\- \*\*Número de expediente\*\*\*: Identificador único

\- \*\*Tipo de proceso\*\*\*: Seleccionar de la lista

\- \*\*Juzgado\*\*\*: Seleccionar de la lista

\- \*\*Estado\*\*\*: Por defecto \"Activo\"

\- \*\*Fecha de inicio\*\*\*: Fecha de inicio del expediente

\- \*\*Descripción\*\*\*: Descripción del caso

\- \*\*Observaciones\*\*: Información adicional (opcional)

3\. Hacer clic en \"Guardar Expediente\"

\*\*Ver Detalle de Expediente:\*\*

1\. En el listado, hacer clic en el icono de ojo (👁) o en el número del
expediente

2\. Se muestra:

\- Información general del expediente

\- Lista de documentos adjuntos

\- Referencia SGT (si existe)

\*\*Editar Expediente:\*\*

1\. Abrir el detalle del expediente

2\. Hacer clic en el botón \"Editar\"

3\. Modificar los campos necesarios

4\. Hacer clic en \"Guardar Cambios\"

\> \*\*Nota:\*\* El número de expediente no puede modificarse.

\-\--

\### 11.3.3 Gestión de Documentos

\*\*Cargar Documento:\*\*

1\. Abrir el detalle del expediente

2\. Hacer clic en \"Cargar Documento\"

3\. Seleccionar el archivo:

\- Hacer clic en \"Seleccionar archivos\", o

\- Arrastrar y soltar el archivo en el área indicada

4\. Seleccionar el tipo de documento

5\. Hacer clic en \"Cargar\"

6\. Esperar a que se complete la carga (barra de progreso)

\*\*Formatos permitidos:\*\*

\| Tipo \| Formatos \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Documentos \| PDF, DOC, DOCX \|

\| Imágenes \| JPG, PNG, GIF, BMP \|

\| Audio \| MP3, WAV, OGG \|

\| Video \| MP4, WebM, AVI, MOV \|

\*\*Tamaño máximo:\*\* 100 MB por archivo

\*\*Ver Documento:\*\*

1\. En la lista de documentos, hacer clic en el icono de ojo (👁)

2\. El documento se abrirá en el visor correspondiente:

\- \*\*PDF\*\*: Visor con navegación de páginas y zoom

\- \*\*Imágenes\*\*: Visor con zoom

\- \*\*Audio\*\*: Reproductor con controles

\- \*\*Video\*\*: Reproductor con controles

\*\*Descargar Documento:\*\*

1\. En la lista de documentos, hacer clic en el icono de descarga (⬇)

2\. El archivo se descargará a su computadora

\*\*Imprimir Documento:\*\*

1\. Abrir el documento en el visor

2\. Hacer clic en el icono de impresora (🖨)

3\. Se abrirá el diálogo de impresión del navegador

4\. Seleccionar impresora y opciones

5\. Hacer clic en \"Imprimir\"

\-\--

\### 11.3.4 Búsquedas

\*\*Búsqueda Rápida:\*\*

1\. Utilice el campo de búsqueda en la barra superior

2\. Ingrese el número de expediente (completo o parcial)

3\. Presione Enter o haga clic en el icono de búsqueda

4\. Si hay un solo resultado, se abrirá directamente

5\. Si hay varios resultados, se mostrará una lista

\*\*Búsqueda Avanzada:\*\*

1\. En el menú lateral, hacer clic en \"Búsqueda Avanzada\"

2\. Complete los filtros deseados:

\- \*\*Número de expediente\*\*: Búsqueda parcial

\- \*\*Tipo de proceso\*\*: Seleccionar de lista

\- \*\*Juzgado\*\*: Seleccionar de lista

\- \*\*Estado\*\*: Seleccionar de lista

\- \*\*Fecha desde/hasta\*\*: Rango de fechas

3\. Hacer clic en \"Buscar\"

4\. Los resultados se mostrarán en la tabla inferior

5\. Para limpiar filtros, hacer clic en \"Limpiar\"

\*\*Usar Resultados:\*\*

\- Hacer clic en cualquier expediente para ver su detalle

\- Los filtros activos se muestran como etiquetas

\- Puede quitar filtros individuales haciendo clic en la X

\-\--

\### 11.3.5 Administración (Solo Administradores)

\*\*Gestión de Usuarios:\*\*

1\. En el menú lateral, expandir \"Administración\"

2\. Hacer clic en \"Usuarios\"

\*\*Crear Usuario:\*\*

1\. Hacer clic en \"+ Nuevo Usuario\"

2\. Completar:

\- Nombre de usuario

\- Nombre completo

\- Correo electrónico

\- Rol

\- Juzgado asignado

3\. Hacer clic en \"Guardar\"

4\. El sistema generará una contraseña temporal

5\. Proporcione la contraseña al usuario de forma segura

\*\*Editar Usuario:\*\*

1\. Hacer clic en el icono de editar (✏) del usuario

2\. Modificar los campos necesarios

3\. Hacer clic en \"Guardar\"

\*\*Desbloquear Usuario:\*\*

1\. Si un usuario está bloqueado (🔒), hacer clic en el icono de
desbloquear

2\. Confirmar la acción

\*\*Resetear Contraseña:\*\*

1\. Hacer clic en el icono de llave (🔑)

2\. El sistema generará una nueva contraseña temporal

3\. Proporcione la contraseña al usuario

\*\*Consulta de Auditoría:\*\*

1\. En el menú \"Administración\", hacer clic en \"Auditoría\"

2\. Use los filtros para buscar eventos:

\- Rango de fechas

\- Usuario específico

\- Tipo de acción

3\. Hacer clic en \"Filtrar\"

4\. Revise los registros en la tabla

\-\--

\### 11.3.6 Preguntas Frecuentes

\*\*¿Qué hago si olvidé mi contraseña?\*\*

\> Contacte al administrador del sistema para que le genere una
contraseña temporal.

\*\*¿Por qué no puedo iniciar sesión?\*\*

\> Posibles causas:

\> - Contraseña incorrecta

\> - Cuenta bloqueada (después de 5 intentos fallidos)

\> - Cuenta desactivada

\> Contacte al administrador si el problema persiste.

\*\*¿Qué hago si mi cuenta está bloqueada?\*\*

\> Espere 30 minutos para desbloqueo automático, o contacte al
administrador para desbloqueo inmediato.

\*\*¿Cuánto tiempo dura mi sesión?\*\*

\> La sesión expira después de 8 horas de actividad o 30 minutos de
inactividad.

\*\*¿Por qué no puedo cargar un archivo?\*\*

\> Verifique que:

\> - El formato sea permitido (PDF, Word, imágenes, audio, video)

\> - El tamaño no exceda 100 MB

\> - Tenga permisos para cargar documentos

\*\*¿Cómo consulto información del SGT?\*\*

\> En el detalle del expediente, haga clic en \"Consultar SGT\" e
ingrese el número de expediente del sistema SGT.

\*\*¿Puedo ver documentos desde mi celular?\*\*

\> El sistema está optimizado para computadoras de escritorio. El acceso
desde dispositivos móviles es limitado.

\-\--

\## 11.4 Guía Rápida de Referencia

\### Accesos Directos de Teclado

\| Tecla \| Acción \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|

\| \`Enter\` \| Ejecutar búsqueda \|

\| \`Esc\` \| Cerrar modal/diálogo \|

\| \`Ctrl + P\` \| Imprimir (en visor) \|

\### Iconos del Sistema

\| Icono \| Significado \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 👁 \| Ver/Visualizar \|

\| ✏️ \| Editar \|

\| 🗑 \| Eliminar \|

\| ⬇ \| Descargar \|

\| 🖨 \| Imprimir \|

\| 🔍 \| Buscar \|

\| 🔒 \| Bloqueado \|

\| 🔓 \| Desbloquear \|

\| ✓ \| Exitoso/Activo \|

\| ✗ \| Error/Inactivo \|

\### Estados de Expediente

\| Estado \| Color \| Significado \|

\|\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Activo \| 🟢 Verde \| En trámite activo \|

\| En espera \| 🟡 Amarillo \| Pendiente de acción \|

\| Suspendido \| 🟠 Naranja \| Temporalmente suspendido \|

\| Cerrado \| 🔴 Rojo \| Finalizado \|

\| Archivado \| ⚫ Gris \| Archivado definitivamente \|

\### Roles y Permisos

\| Rol \| Puede hacer \|

\|\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Administrador\*\* \| Todo: usuarios, expedientes, documentos,
auditoría \|

\| \*\*Secretario\*\* \| Crear/editar expedientes, gestionar documentos
\|

\| \*\*Auxiliar\*\* \| Crear expedientes, cargar documentos, consultar
\|

\| \*\*Consulta\*\* \| Solo ver expedientes y documentos \|

\-\--

\## 11.5 Solución de Problemas Comunes

\### Problemas de Acceso

\| Problema \| Solución \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| \"Usuario o contraseña incorrectos\" \| Verificar datos ingresados.
Si persiste, contactar administrador. \|

\| \"Cuenta bloqueada\" \| Esperar 30 minutos o contactar administrador.
\|

\| Página no carga \| Verificar conexión a red. Intentar con otro
navegador. \|

\| \"Sesión expirada\" \| Iniciar sesión nuevamente. \|

\### Problemas con Documentos

\| Problema \| Solución \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| \"Formato no permitido\" \| Verificar que el archivo sea PDF, Word,
imagen, audio o video. \|

\| \"Archivo muy grande\" \| Reducir tamaño del archivo (máximo 100 MB).
\|

\| PDF no se visualiza \| Actualizar navegador. Intentar descargar y
abrir localmente. \|

\| Video no reproduce \| Verificar formato (MP4 o WebM recomendados). \|

\### Problemas de Rendimiento

\| Problema \| Solución \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Sistema lento \| Refrescar página (F5). Cerrar otras pestañas. \|

\| Búsqueda tarda mucho \| Usar filtros más específicos. \|

\| Carga de archivo lenta \| Verificar conexión a internet. \|

------------------------------------------------------------------------

## \# SECCIÓN 12: PLAN DE CAPACITACIÓN

\-\--

\## 12.1 Objetivos de Capacitación

\### 12.1.1 Objetivo General

Proporcionar a los usuarios del Organismo Judicial los conocimientos y
habilidades necesarios para utilizar eficientemente el Sistema de
Gestión de Expedientes Digitales (SGED).

\### 12.1.2 Objetivos Específicos

\| \# \| Objetivo \| Indicador de Logro \|

\|\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 1 \| Usuarios capaces de iniciar sesión y navegar el sistema \| 100%
usuarios acceden sin ayuda \|

\| 2 \| Usuarios capaces de gestionar expedientes \| Crear, consultar,
editar expedientes \|

\| 3 \| Usuarios capaces de gestionar documentos \| Cargar, visualizar,
descargar documentos \|

\| 4 \| Usuarios capaces de realizar búsquedas \| Usar búsqueda rápida y
avanzada \|

\| 5 \| Administradores capaces de gestionar usuarios \| CRUD de
usuarios, roles, desbloqueos \|

\| 6 \| Administradores capaces de consultar auditoría \| Filtrar y
analizar logs \|

\-\--

\## 12.2 Audiencia

\### 12.2.1 Perfiles de Usuarios

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ PERFILES DE CAPACITACIÓN │

└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐

│ USUARIOS FINALES │

│
─────────────────────────────────────────────────────────────────────────
│

│ Roles: Secretario, Auxiliar, Consulta │

│ Cantidad estimada: 40-80 personas │

│ Conocimiento previo: Uso básico de computadora y navegador │

│ Capacitación: 2 horas │

└─────────────────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ ADMINISTRADORES │

│
─────────────────────────────────────────────────────────────────────────
│

│ Roles: Administrador del sistema │

│ Cantidad estimada: 2-5 personas │

│ Conocimiento previo: Usuarios finales + conocimientos técnicos básicos
│

│ Capacitación: 3 horas (incluye módulo usuarios finales) │

└─────────────────────────────────────────────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────────────────────────┐

│ PERSONAL TÉCNICO │

│
─────────────────────────────────────────────────────────────────────────
│

│ Roles: Soporte técnico, Infraestructura │

│ Cantidad estimada: 2-3 personas │

│ Conocimiento previo: Linux, Docker, bases de datos │

│ Capacitación: 4 horas (incluye instalación y mantenimiento) │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 12.2.2 Requisitos Previos por Audiencia

\| Audiencia \| Requisitos Previos \|

\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Usuarios Finales\*\* \| Uso básico de computadora, navegador web,
conceptos de expedientes judiciales \|

\| \*\*Administradores\*\* \| Todo lo anterior + conceptos de gestión de
usuarios y seguridad \|

\| \*\*Personal Técnico\*\* \| Conocimientos de Linux, Docker, Oracle,
redes \|

\-\--

\## 12.3 Contenido por Rol

\### 12.3.1 Módulo 1: Usuarios Finales (2 horas)

\`\`\`

MÓDULO 1: USUARIOS FINALES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SESIÓN 1: Introducción y Acceso (30 min)

─────────────────────────────────────────

□ Presentación del sistema SGED

□ Objetivos y beneficios

□ Acceso al sistema (URL, navegadores compatibles)

□ Inicio de sesión

□ Cambio de contraseña

□ Navegación general (menú, header, área de trabajo)

□ Cierre de sesión

SESIÓN 2: Gestión de Expedientes (45 min)

─────────────────────────────────────────

□ Ver listado de expedientes

□ Ordenar y filtrar expedientes

□ Crear nuevo expediente

\- Campos obligatorios

\- Validaciones

□ Ver detalle de expediente

□ Editar expediente

□ Práctica guiada: Crear 2 expedientes de prueba

SESIÓN 3: Gestión de Documentos (30 min)

─────────────────────────────────────────

□ Cargar documentos

\- Formatos permitidos

\- Tamaño máximo

\- Drag & drop

□ Visualizar documentos

\- Visor PDF

\- Visor de imágenes

\- Reproductor de audio/video

□ Descargar documentos

□ Imprimir documentos

□ Práctica guiada: Cargar y visualizar documentos

SESIÓN 4: Búsquedas e Integración (15 min)

─────────────────────────────────────────

□ Búsqueda rápida por número

□ Búsqueda avanzada con filtros

□ Consultar sistemas SGT

□ Vincular expediente con SGT

□ Práctica guiada: Realizar búsquedas

EVALUACIÓN Y CIERRE (10 min)

─────────────────────────────────────────

□ Preguntas y respuestas

□ Evaluación práctica breve

□ Entrega de guía rápida

\`\`\`

\### 12.3.2 Módulo 2: Administradores (1 hora adicional)

\`\`\`

MÓDULO 2: ADMINISTRADORES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRERREQUISITO: Completar Módulo 1

SESIÓN 5: Gestión de Usuarios (30 min)

─────────────────────────────────────────

□ Acceso al módulo de administración

□ Ver listado de usuarios

□ Crear nuevo usuario

\- Campos requeridos

\- Asignación de rol

\- Contraseña temporal

□ Editar usuario

□ Activar/Desactivar usuario

□ Desbloquear usuario

□ Resetear contraseña

□ Práctica: Crear usuarios de prueba

SESIÓN 6: Roles y Permisos (15 min)

─────────────────────────────────────────

□ Entender los roles del sistema

\- Administrador

\- Secretario

\- Auxiliar

\- Consulta

□ Matriz de permisos

□ Asignación correcta de roles

□ Mejores prácticas de seguridad

SESIÓN 7: Auditoría (15 min)

─────────────────────────────────────────

□ Acceso a logs de auditoría

□ Filtrar por fecha, usuario, acción

□ Interpretar registros de auditoría

□ Casos de uso comunes

\- Verificar accesos

\- Rastrear cambios

\- Investigar incidentes

□ Práctica: Buscar eventos específicos

EVALUACIÓN Y CIERRE (10 min)

─────────────────────────────────────────

□ Preguntas y respuestas

□ Escenarios prácticos

□ Responsabilidades del administrador

\`\`\`

\### 12.3.3 Módulo 3: Personal Técnico (1 hora adicional)

\`\`\`

MÓDULO 3: PERSONAL TÉCNICO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRERREQUISITO: Conocimientos de Linux, Docker, Oracle

SESIÓN 8: Arquitectura y Despliegue (20 min)

─────────────────────────────────────────

□ Arquitectura del sistema

□ Componentes (Frontend, Backend, BD, Storage)

□ Estructura de directorios

□ Archivos de configuración

□ Variables de entorno

SESIÓN 9: Operaciones Básicas (20 min)

─────────────────────────────────────────

□ Iniciar/Detener servicios

□ Ver logs

□ Verificar estado de salud

□ Monitoreo básico

□ Comandos útiles

SESIÓN 10: Mantenimiento (20 min)

─────────────────────────────────────────

□ Backup de base de datos

□ Backup de storage

□ Rotación de logs

□ Actualización del sistema

□ Procedimiento de rollback

□ Solución de problemas comunes

EVALUACIÓN Y CIERRE (10 min)

─────────────────────────────────────────

□ Escenarios de troubleshooting

□ Entrega de documentación técnica

□ Contactos de soporte

\`\`\`

\-\--

\## 12.4 Metodología

\### 12.4.1 Enfoque de Capacitación

\| Aspecto \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Modalidad\*\* \| Presencial / Virtual (según disponibilidad) \|

\| \*\*Método\*\* \| Teórico-práctico (30% teoría, 70% práctica) \|

\| \*\*Grupos\*\* \| Máximo 15 personas por sesión \|

\| \*\*Ambiente\*\* \| Sistema de pruebas con datos ficticios \|

\| \*\*Materiales\*\* \| Presentación, guía rápida, manual de usuario \|

\### 12.4.2 Recursos Necesarios

\*\*Para Capacitación Presencial:\*\*

\| Recurso \| Cantidad \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Sala de capacitación \| 1 \| Con proyector y acceso a internet \|

\| Computadoras \| 1 por participante \| Con navegador actualizado \|

\| Acceso a SGED QA \| 1 cuenta por participante \| Usuarios de prueba
\|

\| Guías impresas \| 1 por participante \| Guía rápida de referencia \|

\| Capacitador \| 1 \| Conocimiento del sistema \|

\*\*Para Capacitación Virtual:\*\*

\| Recurso \| Cantidad \| Descripción \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Plataforma virtual \| 1 \| Zoom, Meet o Teams \|

\| Acceso a SGED QA \| 1 cuenta por participante \| Usuarios de prueba
\|

\| Guías digitales \| 1 por participante \| PDF de guía rápida \|

\| Grabación \| 1 por sesión \| Para consulta posterior \|

\### 12.4.3 Evaluación

\*\*Criterios de Evaluación:\*\*

\| Criterio \| Peso \| Método \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|\-\-\-\-\-\-\--\|

\| Asistencia \| 20% \| Registro de asistencia \|

\| Participación \| 20% \| Observación durante sesión \|

\| Práctica guiada \| 30% \| Ejercicios durante capacitación \|

\| Evaluación final \| 30% \| Ejercicio práctico individual \|

\*\*Ejercicio de Evaluación Final (Usuarios Finales):\*\*

\`\`\`

EVALUACIÓN PRÁCTICA - USUARIOS FINALES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fecha:
\_\_\_\_\_\_\_\_\_\_\_\_ Juzgado: \_\_\_\_\_\_\_\_\_\_\_\_

INSTRUCCIONES: Complete las siguientes tareas en el sistema SGED.

Tiempo máximo: 15 minutos.

TAREA 1: Crear Expediente (4 puntos)

─────────────────────────────────────────

□ Crear un expediente con los siguientes datos:

\- Número: \[Asignado por instructor\]

\- Tipo: Civil

\- Estado: Activo

\- Descripción: Expediente de evaluación

TAREA 2: Cargar Documento (3 puntos)

─────────────────────────────────────────

□ Cargar el archivo PDF proporcionado al expediente creado

□ Asignar tipo de documento: \"Demanda\"

TAREA 3: Visualizar Documento (2 puntos)

─────────────────────────────────────────

□ Abrir el documento cargado en el visor

□ Navegar a la página 2 del documento

TAREA 4: Búsqueda (2 puntos)

─────────────────────────────────────────

□ Usar búsqueda avanzada para encontrar expedientes de tipo \"Civil\"

□ Filtrar por estado \"Activo\"

TAREA 5: Cerrar Sesión (1 punto)

─────────────────────────────────────────

□ Cerrar sesión correctamente

PUNTUACIÓN: \_\_\_\_\_ / 12 puntos

RESULTADO:

□ APROBADO (≥ 9 puntos)

□ REQUIERE REFUERZO (\< 9 puntos)

Firma del evaluador: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\`\`\`

\-\--

\## 12.5 Cronograma de Capacitación

\### 12.5.1 Plan de Capacitación

\`\`\`

CRONOGRAMA DE CAPACITACIÓN SGED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Período: Días 81-88 del proyecto (15-22 de Abril 2026)

SEMANA DE CAPACITACIÓN

─────────────────────────────────────────────────────────────────────────────

Día 81 (Miércoles 15/04):

┌────────────────────────────────────────────────────────────────────────┐

│ 09:00 - 11:00 │ Módulo 1: Usuarios Finales - Grupo A (15 personas) │

│ 14:00 - 16:00 │ Módulo 1: Usuarios Finales - Grupo B (15 personas) │

└────────────────────────────────────────────────────────────────────────┘

Día 82 (Jueves 16/04):

┌────────────────────────────────────────────────────────────────────────┐

│ 09:00 - 11:00 │ Módulo 1: Usuarios Finales - Grupo C (15 personas) │

│ 14:00 - 16:00 │ Módulo 1: Usuarios Finales - Grupo D (15 personas) │

└────────────────────────────────────────────────────────────────────────┘

Día 83 (Viernes 17/04):

┌────────────────────────────────────────────────────────────────────────┐

│ 09:00 - 11:00 │ Módulo 1: Usuarios Finales - Grupo E (15 personas) │

│ 14:00 - 17:00 │ Módulo 1+2: Administradores (5 personas) │

└────────────────────────────────────────────────────────────────────────┘

Día 84 (Lunes 20/04):

┌────────────────────────────────────────────────────────────────────────┐

│ 09:00 - 13:00 │ Módulo 1+2+3: Personal Técnico (3 personas) │

│ 14:00 - 16:00 │ Sesión de refuerzo (participantes que lo requieran) │

└────────────────────────────────────────────────────────────────────────┘

Día 85-88 (Martes 21 - Viernes 24/04):

┌────────────────────────────────────────────────────────────────────────┐

│ Soporte post-capacitación y acompañamiento en producción │

└────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 12.5.2 Resumen de Sesiones

\| Día \| Horario \| Módulo \| Audiencia \| Duración \| Participantes \|

\|\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|

\| 81 \| 09:00-11:00 \| 1 \| Usuarios Grupo A \| 2h \| 15 \|

\| 81 \| 14:00-16:00 \| 1 \| Usuarios Grupo B \| 2h \| 15 \|

\| 82 \| 09:00-11:00 \| 1 \| Usuarios Grupo C \| 2h \| 15 \|

\| 82 \| 14:00-16:00 \| 1 \| Usuarios Grupo D \| 2h \| 15 \|

\| 83 \| 09:00-11:00 \| 1 \| Usuarios Grupo E \| 2h \| 15 \|

\| 83 \| 14:00-17:00 \| 1+2 \| Administradores \| 3h \| 5 \|

\| 84 \| 09:00-13:00 \| 1+2+3 \| Técnicos \| 4h \| 3 \|

\| 84 \| 14:00-16:00 \| Refuerzo \| Varios \| 2h \| \~10 \|

\*\*Totales:\*\*

\- Usuarios finales capacitados: \~75 personas

\- Administradores capacitados: 5 personas

\- Personal técnico capacitado: 3 personas

\- Horas totales de capacitación: 19 horas

\-\--

\## 12.6 Materiales de Capacitación

\### 12.6.1 Lista de Materiales

\| Material \| Formato \| Audiencia \| Entrega \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| Presentación del sistema \| PowerPoint/PDF \| Todos \| Durante sesión
\|

\| Guía rápida de usuario \| PDF (2 páginas) \| Usuarios finales \|
Impresa + digital \|

\| Manual de usuario completo \| PDF \| Todos \| Digital \|

\| Manual de administrador \| PDF \| Administradores \| Digital \|

\| Manual técnico \| PDF \| Personal técnico \| Digital \|

\| Videos tutoriales \| MP4 \| Todos \| Enlace interno \|

\| Ejercicios prácticos \| PDF \| Todos \| Durante sesión \|

\| Evaluación \| Impreso \| Todos \| Durante sesión \|

\### 12.6.2 Guía Rápida de Usuario (2 páginas)

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ SGED - GUÍA RÁPIDA DE USUARIO │

│ Sistema de Gestión de Expedientes Digitales │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ ACCESO AL SISTEMA │

│ ─────────────────────────────────────────────────────────────────────
│

│ URL: https://sged.oj.gob.gt │

│ Navegadores: Chrome, Edge, Firefox │

│ │

│ 1. Ingresar usuario y contraseña │

│ 2. Clic en \"Iniciar Sesión\" │

│ 3. Si es primer acceso, cambiar contraseña │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ EXPEDIENTES │

│ ─────────────────────────────────────────────────────────────────────
│

│ │

│ Ver listado: Menú → Expedientes │

│ Crear nuevo: Botón \"+ Nuevo Expediente\" │

│ Ver detalle: Clic en 👁 o en número de expediente │

│ Editar: En detalle → Botón \"Editar\" │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ DOCUMENTOS │

│ ─────────────────────────────────────────────────────────────────────
│

│ │

│ Cargar: En detalle expediente → \"Cargar Documento\" │

│ Ver: Clic en 👁 │

│ Descargar: Clic en ⬇ │

│ Imprimir: En visor → Clic en 🖨 │

│ │

│ Formatos: PDF, Word, imágenes, audio, video (máx 100 MB) │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ BÚSQUEDA │

│ ─────────────────────────────────────────────────────────────────────
│

│ │

│ Rápida: Campo de búsqueda en header → Enter │

│ Avanzada: Menú → Búsqueda Avanzada → Filtros → Buscar │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ ICONOS │ AYUDA │

│ ─────────────────────── │ ─────────────────────── │

│ 👁 Ver/Visualizar │ Soporte: extension 1234 │

│ ✏️ Editar │ Email: soporte@oj.gob.gt │

│ ⬇ Descargar │ │

│ 🖨 Imprimir │ Contraseña: 8+ caracteres, │

│ 🔍 Buscar │ mayúscula, minúscula, número │

│ │ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### 12.6.3 Estructura de Presentación

\`\`\`

PRESENTACIÓN: CAPACITACIÓN SGED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Diapositiva 1: Portada

Diapositiva 2: Agenda de la sesión

Diapositiva 3: ¿Qué es SGED?

Diapositiva 4: Beneficios del sistema

Diapositiva 5: Cómo acceder al sistema

Diapositiva 6: Pantalla de login

Diapositiva 7: Cambio de contraseña

Diapositiva 8: Navegación general

Diapositiva 9: Menú principal

Diapositiva 10: Módulo de Expedientes - Listado

Diapositiva 11: Crear expediente

Diapositiva 12: Campos del expediente

Diapositiva 13: Ver detalle de expediente

Diapositiva 14: Editar expediente

Diapositiva 15: PRÁCTICA 1: Crear expedientes

Diapositiva 16: Módulo de Documentos

Diapositiva 17: Cargar documentos

Diapositiva 18: Formatos permitidos

Diapositiva 19: Visualizar documentos

Diapositiva 20: Visor de PDF

Diapositiva 21: Reproductor multimedia

Diapositiva 22: Descargar e imprimir

Diapositiva 23: PRÁCTICA 2: Gestionar documentos

Diapositiva 24: Búsqueda rápida

Diapositiva 25: Búsqueda avanzada

Diapositiva 26: Consultar SGT

Diapositiva 27: PRÁCTICA 3: Búsquedas

Diapositiva 28: Preguntas frecuentes

Diapositiva 29: Soporte y contacto

Diapositiva 30: Evaluación

Diapositiva 31: Cierre y agradecimiento

\-\-- SOLO ADMINISTRADORES \-\--

Diapositiva 32: Módulo de Administración

Diapositiva 33: Gestión de usuarios

Diapositiva 34: Crear usuario

Diapositiva 35: Roles y permisos

Diapositiva 36: Desbloquear usuario

Diapositiva 37: Resetear contraseña

Diapositiva 38: PRÁCTICA 4: Gestionar usuarios

Diapositiva 39: Consulta de auditoría

Diapositiva 40: Filtros de auditoría

Diapositiva 41: PRÁCTICA 5: Auditoría

Diapositiva 42: Responsabilidades del administrador

\`\`\`

\-\--

\## 12.7 Seguimiento Post-Capacitación

\### 12.7.1 Plan de Acompañamiento

\| Período \| Actividad \| Responsable \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| Día 1-2 post-capacitación \| Soporte presencial en sitio \|
Capacitador \|

\| Semana 1 \| Soporte telefónico/remoto prioritario \| Soporte técnico
\|

\| Semana 2-4 \| Soporte según demanda \| Soporte técnico \|

\| Mes 1 \| Sesión de seguimiento (1 hora) \| Capacitador \|

\### 12.7.2 Métricas de Éxito

\| Métrica \| Objetivo \| Medición \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| Asistencia a capacitación \| 95% \| Registro de asistencia \|

\| Aprobación de evaluación \| 90% \| Evaluación práctica \|

\| Incidentes por desconocimiento \| \< 10% \| Tickets de soporte \|

\| Satisfacción con capacitación \| ≥ 4/5 \| Encuesta post-capacitación
\|

\### 12.7.3 Encuesta de Satisfacción

\`\`\`

ENCUESTA DE SATISFACCIÓN - CAPACITACIÓN SGED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fecha: \_\_\_\_\_\_\_\_\_\_\_\_ Grupo: \_\_\_\_\_\_\_\_\_\_\_\_

Califique del 1 al 5, donde:

1 = Muy malo 2 = Malo 3 = Regular 4 = Bueno 5 = Excelente

CONTENIDO

─────────────────────────────────────────────────────────────────────────────

1\. El contenido fue relevante para mi trabajo \[ 1 \] \[ 2 \] \[ 3 \]
\[ 4 \] \[ 5 \]

2\. Los temas fueron explicados claramente \[ 1 \] \[ 2 \] \[ 3 \] \[ 4
\] \[ 5 \]

3\. Las prácticas fueron útiles \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5 \]

INSTRUCTOR

─────────────────────────────────────────────────────────────────────────────

4\. Dominio del tema \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5 \]

5\. Claridad en las explicaciones \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5
\]

6\. Atención a preguntas \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5 \]

LOGÍSTICA

─────────────────────────────────────────────────────────────────────────────

7\. Duración de la capacitación \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5 \]

8\. Materiales proporcionados \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5 \]

9\. Instalaciones/Ambiente \[ 1 \] \[ 2 \] \[ 3 \] \[ 4 \] \[ 5 \]

GENERAL

─────────────────────────────────────────────────────────────────────────────

10\. Satisfacción general con la capacitación \[ 1 \] \[ 2 \] \[ 3 \] \[
4 \] \[ 5 \]

11\. ¿Se siente preparado para usar el sistema SGED?

\[ \] Sí, completamente

\[ \] Sí, con algo de práctica

\[ \] Necesito más capacitación

\[ \] No

12\. ¿Qué temas le gustaría profundizar?

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

13\. Comentarios adicionales:

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

¡Gracias por su participación!

\`\`\`

\-\--

\## 12.8 Resumen del Plan de Capacitación

\| Aspecto \| Detalle \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|

\| \*\*Duración total\*\* \| 4 días de capacitación + 4 días de
acompañamiento \|

\| \*\*Participantes\*\* \| \~85 personas \|

\| \*\*Módulos\*\* \| 3 (Usuarios, Administradores, Técnicos) \|

\| \*\*Sesiones\*\* \| 8 sesiones de capacitación \|

\| \*\*Materiales\*\* \| Presentación, guías, manuales, videos \|

\| \*\*Evaluación\*\* \| Práctica + encuesta de satisfacción \|

\| \*\*Inversión de tiempo\*\* \| 19 horas de capacitación directa \|

\### Entregables de Capacitación

\`\`\`

ENTREGABLES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Plan de capacitación (este documento)

□ Presentación de capacitación (PowerPoint)

□ Guía rápida de usuario (PDF, 2 páginas)

□ Manual de usuario completo (PDF)

□ Manual de administrador (PDF)

□ Manual técnico (PDF)

□ Ejercicios prácticos (PDF)

□ Evaluaciones (impresas)

□ Encuestas de satisfacción (impresas)

□ Lista de asistencia firmada

□ Informe de resultados de capacitación

□ Acta de capacitación completada

\`\`\`

\-\--

\# ANEXOS

\-\--

\## ANEXO A: Glosario de Términos

\### A.1 Términos del Negocio

\| Término \| Definición \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*Expediente\*\* \| Conjunto de documentos y actuaciones
relacionados con un caso judicial \|

\| \*\*Expediente Digital\*\* \| Versión electrónica del expediente
físico, almacenado en el sistema SGED \|

\| \*\*Número de Expediente\*\* \| Identificador único asignado a cada
expediente \|

\| \*\*Tipo de Proceso\*\* \| Clasificación del expediente según la
materia (Civil, Penal, Laboral, etc.) \|

\| \*\*Juzgado\*\* \| Dependencia judicial responsable del expediente \|

\| \*\*Estado del Expediente\*\* \| Situación actual del expediente
(Activo, En espera, Cerrado, etc.) \|

\| \*\*SGT\*\* \| Sistema de Gestión de Tribunales (sistemas legados v1
y v2) \|

\| \*\*Audiencia\*\* \| Sesión judicial que puede ser grabada en audio o
video \|

\| \*\*Resolución\*\* \| Decisión emitida por el juez sobre un asunto
del expediente \|

\| \*\*Notificación\*\* \| Comunicación oficial a las partes del proceso
\|

\### A.2 Términos Técnicos

\| Término \| Definición \|

\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*API\*\* \| Application Programming Interface - Interfaz de
programación \|

\| \*\*REST\*\* \| Representational State Transfer - Estilo
arquitectónico para APIs \|

\| \*\*JWT\*\* \| JSON Web Token - Estándar para autenticación \|

\| \*\*SPA\*\* \| Single Page Application - Aplicación de una sola
página \|

\| \*\*CRUD\*\* \| Create, Read, Update, Delete - Operaciones básicas de
datos \|

\| \*\*Frontend\*\* \| Parte visual del sistema (interfaz de usuario) \|

\| \*\*Backend\*\* \| Parte del servidor (lógica de negocio, base de
datos) \|

\| \*\*Docker\*\* \| Plataforma de contenedores para despliegue de
aplicaciones \|

\| \*\*HTTPS\*\* \| Protocolo seguro de transferencia de hipertexto \|

\| \*\*SSL/TLS\*\* \| Protocolos de seguridad para comunicaciones
cifradas \|

\| \*\*Oracle\*\* \| Sistema gestor de base de datos relacional \|

\| \*\*Spring Boot\*\* \| Framework de desarrollo para aplicaciones Java
\|

\| \*\*Angular\*\* \| Framework de desarrollo para aplicaciones web \|

\### A.3 Acrónimos

\| Acrónimo \| Significado \|

\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\--\|

\| \*\*SGED\*\* \| Sistema de Gestión de Expedientes Digitales \|

\| \*\*OJ\*\* \| Organismo Judicial \|

\| \*\*SGT\*\* \| Sistema de Gestión de Tribunales \|

\| \*\*BD\*\* \| Base de Datos \|

\| \*\*UI\*\* \| User Interface (Interfaz de Usuario) \|

\| \*\*UX\*\* \| User Experience (Experiencia de Usuario) \|

\| \*\*UAT\*\* \| User Acceptance Testing (Pruebas de Aceptación) \|

\| \*\*QA\*\* \| Quality Assurance (Aseguramiento de Calidad) \|

\| \*\*PDF\*\* \| Portable Document Format \|

\| \*\*MIME\*\* \| Multipurpose Internet Mail Extensions \|

\| \*\*UUID\*\* \| Universally Unique Identifier \|

\| \*\*RBAC\*\* \| Role-Based Access Control \|

\-\--

\## ANEXO B: Especificación OpenAPI (Swagger)

\### B.1 Archivo openapi.yaml

\`\`\`yaml

openapi: 3.0.3

info:

title: SGED API

description: API del Sistema de Gestión de Expedientes Digitales

version: 1.0.0

contact:

name: Organismo Judicial

email: desarrollo@oj.gob.gt

servers:

\- url: https://sged.oj.gob.gt/api/v1

description: Producción

\- url: https://qa-sged.oj.gob.gt/api/v1

description: QA/Pruebas

\- url: http://localhost:8080/api/v1

description: Desarrollo local

tags:

\- name: Autenticación

description: Endpoints de autenticación

\- name: Expedientes

description: Gestión de expedientes

\- name: Documentos

description: Gestión de documentos

\- name: Búsqueda

description: Búsqueda de expedientes

\- name: SGT

description: Integración con sistemas SGT

\- name: Administración

description: Gestión de usuarios y auditoría

\- name: Catálogos

description: Catálogos del sistema

components:

securitySchemes:

bearerAuth:

type: http

scheme: bearer

bearerFormat: JWT

schemas:

LoginRequest:

type: object

required:

\- username

\- password

properties:

username:

type: string

example: jperez

password:

type: string

format: password

example: Password123

LoginResponse:

type: object

properties:

token:

type: string

username:

type: string

nombreCompleto:

type: string

rol:

type: string

juzgado:

type: string

debeCambiarPassword:

type: boolean

ExpedienteRequest:

type: object

required:

\- numero

\- tipoProcesoId

\- juzgadoId

\- estadoId

\- fechaInicio

\- descripcion

properties:

numero:

type: string

maxLength: 50

tipoProcesoId:

type: integer

format: int64

juzgadoId:

type: integer

format: int64

estadoId:

type: integer

format: int64

fechaInicio:

type: string

format: date

descripcion:

type: string

maxLength: 500

observaciones:

type: string

maxLength: 1000

referenciaSgt:

type: string

maxLength: 50

ExpedienteResponse:

type: object

properties:

id:

type: integer

format: int64

numero:

type: string

tipoProceso:

type: string

juzgado:

type: string

estado:

type: string

fechaInicio:

type: string

format: date

descripcion:

type: string

cantidadDocumentos:

type: integer

DocumentoResponse:

type: object

properties:

id:

type: integer

format: int64

nombreOriginal:

type: string

tipoDocumento:

type: string

tamanio:

type: integer

format: int64

mimeType:

type: string

extension:

type: string

categoria:

type: string

enum: \[PDF, WORD, IMAGEN, AUDIO, VIDEO, OTRO\]

fechaCreacion:

type: string

format: date-time

ApiResponse:

type: object

properties:

success:

type: boolean

message:

type: string

data:

type: object

timestamp:

type: string

format: date-time

ErrorResponse:

type: object

properties:

success:

type: boolean

example: false

message:

type: string

errors:

type: array

items:

type: string

timestamp:

type: string

format: date-time

paths:

/auth/login:

post:

tags:

\- Autenticación

summary: Iniciar sesión

requestBody:

required: true

content:

application/json:

schema:

\$ref: \'#/components/schemas/LoginRequest\'

responses:

\'200\':

description: Login exitoso

content:

application/json:

schema:

allOf:

\- \$ref: \'#/components/schemas/ApiResponse\'

\- properties:

data:

\$ref: \'#/components/schemas/LoginResponse\'

\'401\':

description: Credenciales inválidas

content:

application/json:

schema:

\$ref: \'#/components/schemas/ErrorResponse\'

/auth/logout:

post:

tags:

\- Autenticación

summary: Cerrar sesión

security:

\- bearerAuth: \[\]

responses:

\'200\':

description: Logout exitoso

/expedientes:

get:

tags:

\- Expedientes

summary: Listar expedientes

security:

\- bearerAuth: \[\]

parameters:

\- name: page

in: query

schema:

type: integer

default: 0

\- name: size

in: query

schema:

type: integer

default: 10

\- name: sort

in: query

schema:

type: string

default: fechaCreacion,desc

responses:

\'200\':

description: Lista de expedientes

post:

tags:

\- Expedientes

summary: Crear expediente

security:

\- bearerAuth: \[\]

requestBody:

required: true

content:

application/json:

schema:

\$ref: \'#/components/schemas/ExpedienteRequest\'

responses:

\'201\':

description: Expediente creado

\'400\':

description: Datos inválidos

/expedientes/{id}:

get:

tags:

\- Expedientes

summary: Obtener expediente por ID

security:

\- bearerAuth: \[\]

parameters:

\- name: id

in: path

required: true

schema:

type: integer

format: int64

responses:

\'200\':

description: Expediente encontrado

\'404\':

description: Expediente no encontrado

/expedientes/{id}/documentos:

get:

tags:

\- Documentos

summary: Listar documentos del expediente

security:

\- bearerAuth: \[\]

parameters:

\- name: id

in: path

required: true

schema:

type: integer

format: int64

responses:

\'200\':

description: Lista de documentos

post:

tags:

\- Documentos

summary: Cargar documento

security:

\- bearerAuth: \[\]

parameters:

\- name: id

in: path

required: true

schema:

type: integer

format: int64

requestBody:

required: true

content:

multipart/form-data:

schema:

type: object

properties:

file:

type: string

format: binary

tipoDocumentoId:

type: integer

responses:

\'201\':

description: Documento cargado

\'400\':

description: Formato o tamaño inválido

/documentos/{id}/contenido:

get:

tags:

\- Documentos

summary: Descargar/visualizar documento

security:

\- bearerAuth: \[\]

parameters:

\- name: id

in: path

required: true

schema:

type: integer

format: int64

\- name: modo

in: query

schema:

type: string

enum: \[inline, attachment\]

default: inline

responses:

\'200\':

description: Contenido del documento

content:

application/octet-stream:

schema:

type: string

format: binary

/busqueda/rapida:

get:

tags:

\- Búsqueda

summary: Búsqueda rápida por número

security:

\- bearerAuth: \[\]

parameters:

\- name: q

in: query

required: true

schema:

type: string

responses:

\'200\':

description: Resultados de búsqueda

/busqueda/avanzada:

post:

tags:

\- Búsqueda

summary: Búsqueda avanzada con filtros

security:

\- bearerAuth: \[\]

requestBody:

required: true

content:

application/json:

schema:

type: object

properties:

numero:

type: string

tipoProcesoId:

type: integer

juzgadoId:

type: integer

estadoId:

type: integer

fechaDesde:

type: string

format: date

fechaHasta:

type: string

format: date

responses:

\'200\':

description: Resultados de búsqueda

/sgt/buscar:

get:

tags:

\- SGT

summary: Buscar en sistemas SGT

security:

\- bearerAuth: \[\]

parameters:

\- name: numero

in: query

required: true

schema:

type: string

responses:

\'200\':

description: Resultado de SGT

\'503\':

description: SGT no disponible

/admin/usuarios:

get:

tags:

\- Administración

summary: Listar usuarios

security:

\- bearerAuth: \[\]

responses:

\'200\':

description: Lista de usuarios

\'403\':

description: Sin permisos

post:

tags:

\- Administración

summary: Crear usuario

security:

\- bearerAuth: \[\]

responses:

\'201\':

description: Usuario creado

/admin/auditoria:

get:

tags:

\- Administración

summary: Consultar auditoría

security:

\- bearerAuth: \[\]

parameters:

\- name: fechaDesde

in: query

schema:

type: string

format: date

\- name: fechaHasta

in: query

schema:

type: string

format: date

\- name: usuario

in: query

schema:

type: string

\- name: accion

in: query

schema:

type: string

responses:

\'200\':

description: Logs de auditoría

/catalogos/tipos-proceso:

get:

tags:

\- Catálogos

summary: Obtener tipos de proceso

security:

\- bearerAuth: \[\]

responses:

\'200\':

description: Lista de tipos de proceso

/catalogos/estados-expediente:

get:

tags:

\- Catálogos

summary: Obtener estados de expediente

security:

\- bearerAuth: \[\]

responses:

'200':

description: Lista de estados de expediente

/catalogos/juzgados:

get:

tags:

\- Catálogos

summary: Obtener juzgados

security:

\- bearerAuth: \[\]

responses:

'200':

description: Lista de juzgados

\`\`\`

\-\--

\## ANEXO C: Scripts de Base de Datos

\### C.1 Script de Creación de Esquema (DDL)

\`\`\`sql

\-- ============================================

\-- SGED - Script de Creación de Base de Datos

\-- Versión: 1.0.0

\-- Fecha: Enero 2026

\-- ============================================

\-- ============================================

\-- CATÁLOGOS

\-- ============================================

CREATE TABLE cat_rol (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(50) NOT NULL UNIQUE,

descripcion VARCHAR2(200),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_juzgado (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

codigo VARCHAR2(20) NOT NULL UNIQUE,

nombre VARCHAR2(200) NOT NULL,

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_tipo_proceso (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(100) NOT NULL UNIQUE,

descripcion VARCHAR2(300),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_estado (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(50) NOT NULL UNIQUE,

descripcion VARCHAR2(200),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

CREATE TABLE cat_tipo_documento (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

nombre VARCHAR2(100) NOT NULL UNIQUE,

descripcion VARCHAR2(300),

activo NUMBER(1) DEFAULT 1 NOT NULL

);

\-- ============================================

\-- TABLAS PRINCIPALES

\-- ============================================

CREATE TABLE usuario (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

username VARCHAR2(50) NOT NULL UNIQUE,

password VARCHAR2(255) NOT NULL,

nombre_completo VARCHAR2(150) NOT NULL,

email VARCHAR2(100) NOT NULL,

rol_id NUMBER(19) NOT NULL,

juzgado_id NUMBER(19) NOT NULL,

activo NUMBER(1) DEFAULT 1 NOT NULL,

bloqueado NUMBER(1) DEFAULT 0 NOT NULL,

intentos_fallidos NUMBER(2) DEFAULT 0 NOT NULL,

fecha_bloqueo TIMESTAMP,

debe_cambiar_pass NUMBER(1) DEFAULT 1 NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

fecha_modificacion TIMESTAMP,

CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES cat_rol(id),

CONSTRAINT fk_usuario_juzgado FOREIGN KEY (juzgado_id) REFERENCES
cat_juzgado(id)

);

CREATE TABLE expediente (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

numero VARCHAR2(50) NOT NULL UNIQUE,

tipo_proceso_id NUMBER(19) NOT NULL,

juzgado_id NUMBER(19) NOT NULL,

estado_id NUMBER(19) NOT NULL,

fecha_inicio DATE NOT NULL,

descripcion VARCHAR2(500) NOT NULL,

observaciones VARCHAR2(1000),

referencia_sgt VARCHAR2(50),

referencia_fuente VARCHAR2(10),

usuario_creacion VARCHAR2(50) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

usuario_modificacion VARCHAR2(50),

fecha_modificacion TIMESTAMP,

CONSTRAINT fk_expediente_tipo FOREIGN KEY (tipo_proceso_id) REFERENCES
cat_tipo_proceso(id),

CONSTRAINT fk_expediente_juzgado FOREIGN KEY (juzgado_id) REFERENCES
cat_juzgado(id),

CONSTRAINT fk_expediente_estado FOREIGN KEY (estado_id) REFERENCES
cat_estado(id),

CONSTRAINT chk_ref_fuente CHECK (referencia_fuente IN (\'SGTV1\',
\'SGTV2\') OR referencia_fuente IS NULL)

);

CREATE TABLE documento (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

expediente_id NUMBER(19) NOT NULL,

tipo_documento_id NUMBER(19),

nombre_original VARCHAR2(255) NOT NULL,

nombre_storage VARCHAR2(100) NOT NULL,

ruta VARCHAR2(500) NOT NULL,

tamanio NUMBER(19) NOT NULL,

mime_type VARCHAR2(100) NOT NULL,

extension VARCHAR2(10) NOT NULL,

usuario_creacion VARCHAR2(50) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

eliminado NUMBER(1) DEFAULT 0 NOT NULL,

usuario_eliminacion VARCHAR2(50),

fecha_eliminacion TIMESTAMP,

CONSTRAINT fk_documento_expediente FOREIGN KEY (expediente_id)
REFERENCES expediente(id),

CONSTRAINT fk_documento_tipo FOREIGN KEY (tipo_documento_id) REFERENCES
cat_tipo_documento(id)

);

CREATE TABLE auditoria (

id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

usuario VARCHAR2(50) NOT NULL,

ip VARCHAR2(45) NOT NULL,

accion VARCHAR2(50) NOT NULL,

modulo VARCHAR2(50) NOT NULL,

recurso_id NUMBER(19),

valor_anterior CLOB,

valor_nuevo CLOB,

detalle VARCHAR2(500)

);

\-- ============================================

\-- ÍNDICES

\-- ============================================

CREATE INDEX idx_usuario_username ON usuario(username);

CREATE INDEX idx_usuario_rol ON usuario(rol_id);

CREATE INDEX idx_usuario_juzgado ON usuario(juzgado_id);

CREATE INDEX idx_usuario_activo ON usuario(activo);

CREATE INDEX idx_expediente_numero ON expediente(numero);

CREATE INDEX idx_expediente_tipo ON expediente(tipo_proceso_id);

CREATE INDEX idx_expediente_juzgado ON expediente(juzgado_id);

CREATE INDEX idx_expediente_estado ON expediente(estado_id);

CREATE INDEX idx_expediente_fecha ON expediente(fecha_inicio);

CREATE INDEX idx_expediente_creacion ON expediente(fecha_creacion);

CREATE INDEX idx_documento_expediente ON documento(expediente_id);

CREATE INDEX idx_documento_tipo ON documento(tipo_documento_id);

CREATE INDEX idx_documento_eliminado ON documento(eliminado);

CREATE INDEX idx_documento_extension ON documento(extension);

CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario);

CREATE INDEX idx_auditoria_accion ON auditoria(accion);

CREATE INDEX idx_auditoria_modulo ON auditoria(modulo);

\`\`\`

\### C.2 Script de Datos Iniciales

\`\`\`sql

\-- ============================================

\-- SGED - Datos Iniciales

\-- ============================================

\-- Roles

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'ADMINISTRADOR\',
\'Administrador del sistema\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'SECRETARIO\',
\'Secretario judicial\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'AUXILIAR\',
\'Auxiliar judicial\');

INSERT INTO cat_rol (nombre, descripcion) VALUES (\'CONSULTA\',
\'Usuario de solo consulta\');

\-- Juzgados

INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-CIV-01\',
\'Juzgado Primero Civil\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-CIV-02\',
\'Juzgado Segundo Civil\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-PEN-01\',
\'Juzgado Primero Penal\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-PEN-02\',
\'Juzgado Segundo Penal\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-LAB-01\',
\'Juzgado Primero Laboral\');
INSERT INTO cat_juzgado (codigo, nombre) VALUES (\'JUZ-FAM-01\',
\'Juzgado Primero de Familia\');

\-- Nota: los códigos siguen el patrón <JUZ>-<JURISDICCIÓN>-<NÚMERO>.

\-- Tipos de Proceso

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Civil\',
\'Procesos civiles\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Penal\',
\'Procesos penales\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Laboral\',
\'Procesos laborales\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Familia\',
\'Procesos de familia\');

INSERT INTO cat_tipo_proceso (nombre, descripcion) VALUES (\'Contencioso
Administrativo\', \'Procesos contenciosos\');

\-- Estados

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Activo\',
\'Expediente activo\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'En espera\',
\'Pendiente de resolución\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Suspendido\',
\'Temporalmente suspendido\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Cerrado\',
\'Expediente finalizado\');

INSERT INTO cat_estado (nombre, descripcion) VALUES (\'Archivado\',
\'Expediente archivado\');

\-- Tipos de Documento

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Demanda\', \'Demanda inicial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Contestación\', \'Contestación a demanda\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Resolución\', \'Resolución judicial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Sentencia\', \'Sentencia del caso\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Notificación\', \'Notificación oficial\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Prueba
documental\', \'Documento probatorio\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Prueba
multimedia\', \'Audio/video/imagen\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
(\'Escrito\', \'Escrito de las partes\');

INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES (\'Otro\',
\'Otro tipo\');

\-- Usuario Administrador (password: Admin123\*)

INSERT INTO usuario (username, password, nombre_completo, email, rol_id,
juzgado_id, debe_cambiar_pass)

VALUES (\'admin\',
\'\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.GQBXHn0eX7Hnm2\',

\'Administrador del Sistema\', \'admin@oj.gob.gt\', 1, 1, 1);

COMMIT;

\`\`\`

\-\--

\## ANEXO D: Checklist de Despliegue

\### D.1 Checklist Pre-Despliegue

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ CHECKLIST PRE-DESPLIEGUE SGED │

├─────────────────────────────────────────────────────────────────────────────┤

│ Fecha: \_\_\_\_\_\_\_\_\_\_\_\_\_\_ Responsable:
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ INFRAESTRUCTURA │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Servidor disponible con recursos adecuados │

│ \[ \] Docker instalado y funcionando │

│ \[ \] Docker Compose instalado │

│ \[ \] Puertos 80/443 disponibles │

│ \[ \] Conectividad a servidores Oracle verificada │

│ \[ \] Espacio en disco suficiente (\>100GB) │

│ │

│ BASE DE DATOS │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Esquema SGED creado │

│ \[ \] Tablas creadas (DDL ejecutado) │

│ \[ \] Datos iniciales cargados │

│ \[ \] Usuario BD con permisos correctos │

│ \[ \] Conectividad desde servidor de app verificada │

│ \[ \] Usuarios read-only para SGTv1 y SGTv2 configurados │

│ │

│ SEGURIDAD │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Certificado SSL válido │

│ \[ \] Certificado copiado a /opt/sged/ssl/ │

│ \[ \] JWT_SECRET generado (mínimo 256 bits) │

│ \[ \] Contraseñas de BD seguras │

│ \[ \] Archivo .env.prod con permisos 600 │

│ │

│ CONFIGURACIÓN │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Archivo .env.prod creado │

│ \[ \] Variables de BD configuradas │

│ \[ \] Variables JWT configuradas │

│ \[ \] Ruta de storage configurada │

│ \[ \] docker-compose.prod.yml revisado │

│ │

│ ARCHIVOS │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Directorios creados (/opt/sged/\*) │

│ \[ \] Permisos correctos en directorios │

│ \[ \] Scripts de despliegue copiados │

│ \[ \] Scripts con permisos de ejecución │

│ │

│ CÓDIGO │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Versión de código correcta (tag) │

│ \[ \] Imágenes Docker disponibles │

│ \[ \] Pruebas UAT aprobadas │

│ \[ \] Acta de pruebas firmada │

│ │

│ BACKUP │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Backup de BD realizado (si existe) │

│ \[ \] Backup de configuración anterior (si existe) │

│ \[ \] Plan de rollback documentado │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ APROBACIÓN │

│ │

│ Verificado por: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
Fecha: \_\_\_\_\_\_\_\_\_\_ │

│ │

│ Aprobado para despliegue: \[ \] Sí \[ \] No │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\### D.2 Checklist Post-Despliegue

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ CHECKLIST POST-DESPLIEGUE SGED │

├─────────────────────────────────────────────────────────────────────────────┤

│ Fecha: \_\_\_\_\_\_\_\_\_\_\_\_\_\_ Responsable:
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ │

│ Versión desplegada: \_\_\_\_\_\_\_\_\_\_\_\_\_\_ │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ SERVICIOS │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Contenedor backend ejecutándose │

│ \[ \] Contenedor frontend ejecutándose │

│ \[ \] Health check backend OK │

│ \[ \] Health check frontend OK │

│ \[ \] Sin errores en logs de inicio │

│ │

│ FUNCIONALIDAD BÁSICA │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Página de login carga │

│ \[ \] Login con admin funciona │

│ \[ \] Cambio de contraseña funciona │

│ \[ \] Navegación general funciona │

│ \[ \] Listado de expedientes carga │

│ │

│ FUNCIONALIDAD COMPLETA │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Crear expediente funciona │

│ \[ \] Editar expediente funciona │

│ \[ \] Cargar documento funciona │

│ \[ \] Visualizar PDF funciona │

│ \[ \] Visualizar imagen funciona │

│ \[ \] Reproducir audio funciona │

│ \[ \] Reproducir video funciona │

│ \[ \] Descargar documento funciona │

│ \[ \] Búsqueda rápida funciona │

│ \[ \] Búsqueda avanzada funciona │

│ \[ \] Consulta SGT funciona (si disponible) │

│ \[ \] Gestión de usuarios funciona │

│ \[ \] Auditoría registrando eventos │

│ │

│ SEGURIDAD │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] HTTPS funcionando │

│ \[ \] Redirección HTTP a HTTPS │

│ \[ \] Certificado válido (sin advertencias) │

│ \[ \] Headers de seguridad presentes │

│ \[ \] Login incorrecto muestra error apropiado │

│ \[ \] Bloqueo de cuenta funciona │

│ │

│ RENDIMIENTO │

│
─────────────────────────────────────────────────────────────────────────
│

│ \[ \] Tiempo de carga \< 3 segundos │

│ \[ \] APIs responden \< 2 segundos │

│ \[ \] Sin errores de timeout │

│ │

├─────────────────────────────────────────────────────────────────────────────┤

│ RESULTADO │

│ │

│ \[ \] DESPLIEGUE EXITOSO │

│ \[ \] DESPLIEGUE CON OBSERVACIONES (documentar abajo) │

│ \[ \] REQUIERE ROLLBACK │

│ │

│ Observaciones: │

│
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_│

│
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_│

│ │

│ Verificado por: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
Fecha/Hora: \_\_\_\_\_\_\_\_\_\_\_ │

└─────────────────────────────────────────────────────────────────────────────┘

\`\`\`

\-\--

\## ANEXO E: Formato de Acta UAT

\`\`\`

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ ACTA DE PRUEBAS DE ACEPTACIÓN (UAT) │

│ │

│ SISTEMA DE GESTIÓN DE EXPEDIENTES DIGITALES │

│ SGED v1.0 │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

1\. INFORMACIÓN GENERAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proyecto: Sistema de Gestión de Expedientes Digitales (SGED)

Versión: 1.0.0

Fecha de pruebas: \_\_\_/\_\_\_/2026 al \_\_\_/\_\_\_/2026

Ambiente: ☐ QA ☐ Pre-producción

Participantes:

┌─────────────────────────────────────────────────────────────────────────────┐

│ Nombre │ Rol │ Firma │

├─────────────────────────┼────────────────────────┼──────────────────────────┤

│ │ │ │

├─────────────────────────┼────────────────────────┼──────────────────────────┤

│ │ │ │

├─────────────────────────┼────────────────────────┼──────────────────────────┤

│ │ │ │

└─────────────────────────┴────────────────────────┴──────────────────────────┘

2\. RESUMEN EJECUTIVO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────────────┐

│ │

│ Total de casos de prueba: \_\_\_\_\_\_ │

│ Casos exitosos: \_\_\_\_\_\_ ( \_\_\_\_\_\_ %) │

│ Casos fallidos: \_\_\_\_\_\_ ( \_\_\_\_\_\_ %) │

│ Casos bloqueados: \_\_\_\_\_\_ ( \_\_\_\_\_\_ %) │

│ │

│ Errores críticos: \_\_\_\_\_\_ │

│ Errores mayores: \_\_\_\_\_\_ │

│ Errores menores: \_\_\_\_\_\_ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

3\. RESULTADOS POR MÓDULO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────┬─────────┬─────────┬─────────┬─────────┬──────────┐

│ Módulo │ Total │ Pasados │ Fallidos│Bloqueados│ Estado │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ Autenticación │ │ │ │ │ ☐P ☐F │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ Expedientes │ │ │ │ │ ☐P ☐F │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ Documentos │ │ │ │ │ ☐P ☐F │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ Búsqueda │ │ │ │ │ ☐P ☐F │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ Integración SGT │ │ │ │ │ ☐P ☐F │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ Administración │ │ │ │ │ ☐P ☐F │

├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤

│ TOTAL │ │ │ │ │ │

└─────────────────────────┴─────────┴─────────┴─────────┴─────────┴──────────┘

P = Pasado, F = Fallido

4\. DETALLE DE ERRORES ENCONTRADOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────┬───────────────────────────────────────────┬───────────┬─────────────┐

│ \# │ Descripción │ Severidad │ Estado │

├─────┼───────────────────────────────────────────┼───────────┼─────────────┤

│ │ │ ☐C ☐M ☐m │ ☐Abierto │

│ │ │ │ ☐Corregido │

├─────┼───────────────────────────────────────────┼───────────┼─────────────┤

│ │ │ ☐C ☐M ☐m │ ☐Abierto │

│ │ │ │ ☐Corregido │

├─────┼───────────────────────────────────────────┼───────────┼─────────────┤

│ │ │ ☐C ☐M ☐m │ ☐Abierto │

│ │ │ │ ☐Corregido │

└─────┴───────────────────────────────────────────┴───────────┴─────────────┘

C = Crítico, M = Mayor, m = menor

5\. OBSERVACIONES Y RECOMENDACIONES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

6\. DECISIÓN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ APROBADO

El sistema cumple con todos los criterios de aceptación.

Se autoriza el paso a producción.

☐ APROBADO CON OBSERVACIONES

El sistema cumple con los criterios principales.

Se autoriza el paso a producción con correcciones pendientes.

Fecha límite correcciones: \_\_\_/\_\_\_/2026

☐ RECHAZADO

El sistema no cumple con los criterios de aceptación.

Requiere correcciones antes de nueva evaluación.

7\. FIRMAS DE APROBACIÓN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Usuario Líder de Pruebas Representante Organismo Judicial

Nombre: Nombre:

Cargo: Cargo:

Fecha: Fecha:

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Líder de Proyecto Gerente de Proyecto

Nombre: Nombre:

Cargo: Cargo:

Fecha: Fecha:

\`\`\`

\-\--

\## ANEXO F: Contactos y Soporte

\### F.1 Equipo del Proyecto

\| Rol \| Nombre \| Teléfono \| Email \|

\|\-\-\-\--\|\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\--\|

\| Líder de Proyecto \| \[Por definir\] \| Ext. XXXX \|
proyecto@oj.gob.gt \|

\| Desarrollador \| \[Por definir\] \| Ext. XXXX \| desarrollo@oj.gob.gt
\|

\| DBA \| \[Por definir\] \| Ext. XXXX \| dba@oj.gob.gt \|

\| Soporte Técnico \| \[Por definir\] \| Ext. XXXX \| soporte@oj.gob.gt
\|

\### F.2 Soporte Post-Implementación

\| Nivel \| Tipo de Incidente \| Tiempo de Respuesta \| Contacto \|

\|\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\--\|

\| \*\*Nivel 1\*\* \| Consultas de uso \| 4 horas \| Mesa de ayuda \|

\| \*\*Nivel 2\*\* \| Errores de aplicación \| 2 horas \| Soporte
técnico \|

\| \*\*Nivel 3\*\* \| Errores críticos \| 1 hora \| Desarrollo \|

\### F.3 Horario de Soporte

\| Tipo \| Horario \| Días \|

\|\-\-\-\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\--\|

\| Soporte regular \| 08:00 - 17:00 \| Lunes a Viernes \|

\| Emergencias \| 24/7 \| Todos los días \|

\### F.4 Procedimiento para Reportar Incidentes

1\. Contactar a Mesa de Ayuda (Ext. XXXX)

2\. Proporcionar:

\- Nombre de usuario

\- Descripción del problema

\- Pasos para reproducir

\- Capturas de pantalla (si aplica)

3\. Anotar número de ticket asignado

4\. Esperar seguimiento según nivel de severidad

\-\--

\## RESUMEN FINAL DEL DOCUMENTO

\### Secciones Completadas

\| \# \| Sección \| Páginas Est. \| Estado \|

\|\-\--\|\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\--\|

\| 1 \| Contexto y Alcance Técnico \| \~8 \| ✅ \|

\| 2 \| Requisitos del Sistema \| \~10 \| ✅ \|

\| 3 \| Historias de Usuario \| \~15 \| ✅ \|

\| 4 \| Arquitectura del Sistema \| \~20 \| ✅ \|

\| 5 \| Modelo de Datos \| \~18 \| ✅ \|

\| 6 \| Diseño de APIs \| \~15 \| ✅ \|

\| 7 \| Diseño de Interfaz de Usuario \| \~12 \| ✅ \|

\| 8 \| Seguridad \| \~15 \| ✅ \|

\| 9 \| Pruebas \| \~18 \| ✅ \|

\| 10 \| Despliegue \| \~15 \| ✅ \|

\| 11 \| Manuales \| \~20 \| ✅ \|

\| 12 \| Plan de Capacitación \| \~12 \| ✅ \|

\| A-F \| Anexos \| \~15 \| ✅ \|

\| \| \*\*TOTAL ESTIMADO\*\* \| \*\*\~193 páginas\*\* \| \|

\### Entregables Técnicos Incluidos

\`\`\`

DOCUMENTACIÓN TÉCNICA COMPLETA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Análisis y validación de requisitos (Sección 2)

✅ Historias de usuario con criterios de aceptación (Sección 3)

✅ Arquitectura del sistema con diagramas (Sección 4)

✅ Modelo de datos completo con DDL (Sección 5)

✅ Especificación de APIs REST (Sección 6)

✅ Prototipos de interfaz (Sección 7)

✅ Diseño de seguridad (Sección 8)

✅ Estrategia y casos de prueba (Sección 9)

✅ Procedimientos de despliegue (Sección 10)

✅ Manual técnico (Sección 11.2)

✅ Manual de usuario (Sección 11.3)

✅ Plan de capacitación (Sección 12)

✅ Scripts de base de datos (Anexo C)

✅ Especificación OpenAPI (Anexo B)

✅ Checklists de despliegue (Anexo D)

✅ Formato de acta UAT (Anexo E)

```

---

**DOCUMENTO TÉCNICO COMPLETO - SGED v1.0**

Este documento contiene toda la especificación técnica necesaria para la
implementación del Sistema de Gestión de Expedientes Digitales (SGED)
para el Organismo Judicial.


\*\*Versión del documento:\*\* 1.0

\*\*Total de secciones:\*\* 12 + 6 Anexos

\-\--
