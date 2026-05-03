# Spec: Portal Documental Completo — SGED

**Fecha:** 2026-05-03  
**Estado:** Aprobado  
**Versión:** 1.0  

---

## 1. Objetivo

Producir documentación formal, cohesiva y publicable para el Sistema de Gestión de Expedientes Digitales (SGED), organizada en un portal unificado con cuatro secciones orientadas a audiencias distintas. El portal consolida los 50+ archivos dispersos en `/docs/` en artefactos de calidad profesional.

---

## 2. Audiencias y necesidades

| Audiencia | Necesidad principal |
|-----------|---------------------|
| **Funcionarios judiciales** (ADMIN, SECRETARIO, AUXILIAR, CONSULTA) | Saber cómo usar el sistema paso a paso, sin tecnicismos |
| **Desarrolladores** | Entender arquitectura, onboarding local, convenciones y flujos internos |
| **Integradores / API consumers** | Referencia completa de endpoints, autenticación y esquemas |
| **Administradores de sistema / DevOps** | Desplegar, configurar, monitorear y recuperar el sistema en VPS |

---

## 3. Estructura del portal

```
docs/
├── INDEX.md                         ← Portal maestro — punto de entrada único
├── usuarios/
│   ├── INDEX.md
│   ├── 01-introduccion.md
│   ├── 02-acceso-y-navegacion.md
│   ├── 03-expedientes.md
│   ├── 04-documentos.md
│   ├── 05-busqueda.md
│   ├── 06-dashboard.md
│   └── 07-faq-y-problemas-frecuentes.md
├── desarrollo/
│   ├── INDEX.md
│   ├── 01-arquitectura-general.md
│   ├── 02-backend.md
│   ├── 03-frontend.md
│   ├── 04-base-de-datos.md
│   ├── 05-seguridad.md
│   └── 06-guia-de-contribucion.md
├── api/
│   ├── openapi.yaml
│   └── INDEX.md
└── operaciones/
    ├── INDEX.md
    ├── 01-despliegue-vps.md
    ├── 02-configuracion.md
    ├── 03-monitoreo.md
    ├── 04-respaldos.md
    └── 05-rollback.md
```

**Total artefactos a producir:** 23 archivos Markdown + 1 spec OpenAPI 3.1 YAML.

---

## 4. Skills asignados por sección

| Sección | Skill | Archivos |
|---------|-------|----------|
| `docs/usuarios/` | `user-manual-writer` | 8 archivos |
| `docs/desarrollo/` | `docs-architect` | 7 archivos |
| `docs/api/` | `api-documenter` | 2 archivos (openapi.yaml + INDEX.md) |
| `docs/operaciones/` | `documentation-generation-doc-generate` | 6 archivos |
| `docs/INDEX.md` | Manual (portal maestro) | 1 archivo |

---

## 5. Diseño de contenido por sección

### 5.1 `docs/usuarios/` — Manual de Usuario

**Skill:** `user-manual-writer`  
**Patrón por capítulo:** objetivo → pasos numerados → errores frecuentes → tips por rol

| Archivo | Contenido |
|---------|-----------|
| `01-introduccion.md` | Qué es SGED, roles disponibles, URL de acceso, navegador recomendado |
| `02-acceso-y-navegacion.md` | Login, cambio de contraseña, menú principal, logout seguro |
| `03-expedientes.md` | Crear, consultar, editar expediente; campos obligatorios; estados del expediente |
| `04-documentos.md` | Cargar documentos (formatos permitidos, límite 50MB), visor PDF/imagen/video/audio, descarga, eliminación |
| `05-busqueda.md` | Búsqueda rápida por número, búsqueda avanzada por criterios múltiples, exportar resultados |
| `06-dashboard.md` | Lectura de KPIs, interpretación de estadísticas, filtros de fecha |
| `07-faq-y-problemas-frecuentes.md` | Cuenta bloqueada, documento que no abre, sesión expirada, contacto de soporte |

**Secciones por rol** en cada capítulo: qué puede hacer ADMIN, SECRETARIO, AUXILIAR, CONSULTA.

---

### 5.2 `docs/desarrollo/` — Manual Técnico

**Skill:** `docs-architect`  
**Enfoque:** Documentación de largo aliento. Cada sección explica el PORQUÉ de las decisiones, no solo el qué.

| Archivo | Contenido |
|---------|-----------|
| `01-arquitectura-general.md` | Diagrama de capas (hexagonal), stack completo con versiones, flujo request → response, decisiones de diseño clave |
| `02-backend.md` | Estructura de paquetes `com.oj.sged`, convenciones de nombrado, flujo de un request típico, mappers MapStruct, manejo de excepciones global |
| `03-frontend.md` | Módulos Angular lazy-loaded, estructura de features, servicios core, interceptors HTTP, convenciones de componentes PrimeNG |
| `04-base-de-datos.md` | Diagrama ER de 13 tablas, catálogos, estrategia de migraciones Flyway, índices de rendimiento |
| `05-seguridad.md` | Flujo JWT completo (emisión → validación → revocación), RBAC con 4 roles, lockout por intentos fallidos, auditoría inmutable |
| `06-guia-de-contribucion.md` | Prerequisitos, setup local en < 30 min, comandos build/test/deploy, convenciones de commits, flujo de PR |

---

### 5.3 `docs/api/` — Referencia API REST

**Skill:** `api-documenter`  
**Formato:** OpenAPI 3.1 + guía narrativa

**`openapi.yaml`** cubre los 8 controllers y 30+ endpoints:
- Esquemas de seguridad: Bearer JWT
- Cada endpoint: parámetros, request body (JSON Schema), respuestas exitosas, errores (400/401/403/404/500)
- Rol RBAC requerido documentado como extensión `x-required-role`
- Ejemplos `curl` para los flujos principales

**`INDEX.md`** incluye: autenticación paso a paso, paginación, manejo de errores, límites de rate.

---

### 5.4 `docs/operaciones/` — Guía de Operaciones

**Skill:** `documentation-generation-doc-generate`  
**Consolida:** los 9 archivos actuales de `docs/infra/` en 5 documentos cohesivos

| Archivo | Fuente consolidada | Contenido |
|---------|--------------------|-----------|
| `01-despliegue-vps.md` | `DEPLOYMENT_GUIDE.md` + `PLAN_DESPLIEGUE_PRODUCCION.md` | Docker Compose VPS, Nginx config, primer despliegue, actualización |
| `02-configuracion.md` | `GUIA_SECRETS_INYECCION.md` + `ENTORNO.md` | Variables de entorno, perfiles Spring, inyección de secrets |
| `03-monitoreo.md` | `MONITOREO_OPERACIONES_PRODUCCION.md` | Health endpoint, logs Docker, alertas, métricas de base |
| `04-respaldos.md` | (nuevo) | Backup MySQL dump, backup storage de documentos, restauración |
| `05-rollback.md` | `ROLLBACK_PLAN_PRODUCCION.md` + `RUNBOOK_OPERACIONES_PRODUCCION.md` | Procedimiento de rollback, runbook de incidentes |

---

## 6. `docs/INDEX.md` — Portal Maestro

Punto de entrada único que reemplaza `INDICE_MAESTRO_DOCUMENTACION.md`. Incluye:
- Descripción del sistema en 2 párrafos
- Tabla de navegación por audiencia (con links directos)
- Versión del sistema documentado
- Estado del portal (fecha de última actualización)

---

## 7. Estrategia de migración de contenido existente

Los archivos actuales **no se eliminan** hasta que la nueva sección esté completa y validada. Una vez migrado el contenido:

| Archivo existente | Acción post-migración |
|-------------------|-----------------------|
| `docs/general/MANUAL_DE_USUARIO_FINAL.md` | Redirigir a `docs/usuarios/` vía nota al inicio |
| `docs/infra/*.md` (9 archivos) | Redirigir a `docs/operaciones/` |
| `docs/general/STACK_TECNICO_ACTUALIZADO.md` | Contenido absorbido por `docs/desarrollo/01-arquitectura-general.md` |
| `docs/INDICE_MAESTRO_DOCUMENTACION.md` | Reemplazado por `docs/INDEX.md` |

---

## 8. Orden de ejecución

Las 4 secciones son **independientes** y pueden ejecutarse en paralelo. Sin embargo, se recomienda este orden para maximizar coherencia:

1. **`docs/api/`** — La spec OpenAPI es fuente de verdad para las otras secciones
2. **`docs/usuarios/`** y **`docs/operaciones/`** — En paralelo (sin dependencias entre sí)
3. **`docs/desarrollo/`** — Se beneficia de tener la spec API lista como referencia
4. **`docs/INDEX.md`** — Portal maestro, último en escribirse

---

## 9. Criterios de éxito

- Cada sección tiene su `INDEX.md` navegable
- El `docs/INDEX.md` maestro linkea correctamente a todas las secciones
- La spec `openapi.yaml` valida sin errores contra el estándar OpenAPI 3.1
- El manual de usuario no contiene jerga técnica
- La guía de contribución permite levantar el entorno local desde cero
- Los archivos de operaciones cubren el escenario completo: deploy → monitor → backup → rollback

---

## 10. Fuentes de referencia

| Fuente | Uso |
|--------|-----|
| `sGED-backend/src/main/java/com/oj/sged/api/controller/` | Endpoints reales para OpenAPI |
| `sGED-backend/src/main/resources/db/migration/` | Esquema DB para docs de desarrollo |
| `docs/general/MANUAL_DE_USUARIO_FINAL.md` | Contenido base para manual de usuario |
| `docs/infra/*.md` | Contenido base para operaciones |
| `docs/general/STACK_TECNICO_ACTUALIZADO.md` | Stack para arquitectura |
| `docs/general/SEGURIDAD_AUTH_IMPLEMENTATION.md` | Seguridad para desarrollo y API |
