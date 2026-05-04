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

El SGED es una plataforma web para la gestión digital de expedientes judicales y sus documentos asociados. Permite a los funcionarios de los juzgados crear, buscar, visualizar y gestionar expedientes y documentos desde cualquier navegador, con control de acceso por roles y auditoría completa de todas las acciones.

**Stack:** Angular 21 + Spring Boot 3.5 + MySQL 8 + Docker Compose

---

## Documentación por sección

### Para usuarios
- [Manual de Usuario](./usuarios/INDEX.md) — guía paso a paso para los 4 roles: ADMIN, SECRETARIO, AUXILIAR, CONSULTA
  - Login, navegación, crear/editar expedientes
  - Subir y visualizar documentos
  - Búsqueda rápida y avanzada
  - Dashboard de estadísticas
  - Preguntas frecuentes y troubleshooting

### Para desarrolladores
- [Manual Técnico](./desarrollo/INDEX.md) — arquitectura, backend, frontend, base de datos, seguridad
  - Arquitectura hexagonal y decisiones de diseño
  - Estructura de paquetes Spring Boot
  - Módulos Angular lazy-loaded
  - Esquema de base de datos con migraciones Flyway
  - Autenticación JWT y control de acceso RBAC
  - Guía de contribución y setup local

- [Referencia API REST](./api/INDEX.md) — cómo integrar con la API
  - Autenticación y obtención de tokens
  - Formato de respuestas y manejo de errores
  - Paginación y control de acceso por rol
  - Especificación completa en OpenAPI 3.1

- [Especificación OpenAPI 3.1](./api/openapi.yaml) — definición formal de todos los endpoints
  - 29 endpoints documentados
  - Schemas de request/response
  - Ejemplos curl
  - Importable en Swagger UI, Insomnia, Postman

### Para operaciones
- [Guía de Operaciones](./operaciones/INDEX.md) — infraestructura, despliegue, monitoreo
  - Despliegue en VPS Lite con Docker Compose
  - Configuración de variables de entorno y secrets
  - Monitoreo con health checks y logs
  - Respaldos de base de datos y documentos
  - Rollback de versiones y runbook de incidentes

---

## Estado del portal

| Sección | Archivos | Estado |
|---------|----------|--------|
| Manual de Usuario | 8 capítulos | ✅ Completo |
| Manual Técnico | 7 documentos | ✅ Completo |
| Referencia API | 2 documentos + spec | ✅ Completo |
| Guía de Operaciones | 6 documentos | ✅ Completo |

**Total:** 24 documentos + 1 spec OpenAPI 3.1

---

## Convenciones de este portal

- **Español:** Toda la documentación está en español (nombres de negocio, procedimientos)
- **Sin jerga técnica innecesaria:** El manual de usuario evita términos como JWT, API, backend
- **Ejemplos reales:** Todos los ejemplos están basados en el código actual del proyecto
- **Mantenible:** Los documentos se pueden actualizar sin quebrantar el rest del portal
- **Navegable:** Cada sección tiene su propio INDEX.md como punto de entrada
