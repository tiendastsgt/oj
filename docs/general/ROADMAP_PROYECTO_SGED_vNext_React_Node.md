---
Documento: ROADMAP_PROYECTO_SGED_vNext_React_Node
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# ROADMAP SGED — Propuesta vNext (React + Node.js)

**Versión:** 1.0.0  
**Fecha de creación:** 30 enero 2026  
**Vigente para:** Propuesta de evolución (no implementado aún)  
**Responsable:** Equipo SGED  
**Estado:** Propuesta — pendiente de aprobación  

---

## Resumen ejecutivo del plan vNext

El plan vNext propone migrar SGED a un stack unificado **React 19.2.4 + TypeScript 5.7** en frontend y **Node.js 22.20.0** (NestJS recomendado) en backend, manteniendo **Oracle 21c** y **NGINX** como base de datos e infraestructura. El alcance funcional se conserva (expedientes, documentos/visor, búsqueda, auditoría, RBAC, integración SGT read-only con prioridad SGTv2). La seguridad es obligatoria: JWT 8 h, bloqueo tras 5 intentos fallidos, revocación de token, RBAC de cuatro roles, rate limiting (NGINX) y auditoría inmutable. El plan se estructura en **fases técnicas F0–F7** y se alinea a **cuatro hitos contractuales** (Día 35, 65, 75 y 90 desde firma): EA1 documentación, EA2 código y pruebas, EA3 UAT y acta, EA4 despliegue, manuales y capacitación. Responsables: Arquitecto (Amilcar Gil González), Desarrollo (Emilio González González, Allan Gil González), PM/Calidad (Alejandro); DevOps y QA según asignación del proyecto. Se reutilizan modelo Oracle/Flyway, NGINX hardening, documentación QA/smoke y diagramas; no se reutiliza código Angular ni Java (reimplementación).

---

## 1. Contexto y objetivos del vNext

El Sistema de Gestión de Expedientes Digitales (SGED) del Organismo Judicial opera en producción con stack Angular 21 + Spring Boot 3.5 + Java 21 + Oracle. La **Propuesta vNext** describe una evolución técnica acordada por Arquitectura con el siguiente objetivo:

- **Objetivo principal:** Migrar frontend y backend a un stack unificado en JavaScript/TypeScript (React + Node.js) manteniendo el alcance funcional actual de SGED, la integridad de datos, la auditoría inmutable y la integración read-only con SGTv1/SGTv2.

- **Alcance del documento:** Este roadmap es una **propuesta formal**. No sustituye al roadmap vigente de producción (`ROADMAP_PROYECTO_SGED.md`). Sirve como guía de planificación en caso de aprobarse la migración.

---

## 2. Stack técnico propuesto (vNext)

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Frontend** | React | 19.2.4 | SPA, componentes, estado |
| | TypeScript | 5.7+ | Tipado estático |
| **Backend** | Node.js | 22.20.0 LTS | Runtime servidor |
| | Framework API | NestJS (recomendado) o Express/Fastify | REST, seguridad, módulos |
| **Base de datos** | Oracle Database | 21c | Datos SGED, auditoría, integración SGT |
| **Infraestructura** | Docker | — | Containerización |
| | NGINX | — | Reverse proxy, TLS, rate limiting |

---

## 3. Alcance funcional

Se mantienen los mismos módulos y capacidades que el SGED actual:

- **Expedientes:** CRUD, catálogos, filtros por juzgado/rol.
- **Documentos y visor:** Carga, almacenamiento por año/mes, visor multimedia, límite 100 MB por archivo.
- **Búsqueda:** Búsqueda unificada de expedientes y documentos; integración read-only con SGTv1 y SGTv2 (prioridad SGTv2).
- **Auditoría:** Registros inmutables (login, acciones por recurso, consultas de auditoría por rol).
- **RBAC:** Cuatro roles (ADMINISTRADOR, SECRETARIO, AUXILIAR, CONSULTA) con permisos alineados al diseño actual.
- **Administración:** Gestión de usuarios, parámetros y consulta de auditoría (según permisos).

No se contemplan cambios de alcance funcional en esta propuesta; solo cambio de stack de implementación.

---

## 4. Principios y seguridad obligatoria

| Principio | Descripción |
|-----------|-------------|
| **Seguridad** | **JWT 8 h** de expiración; **lockout tras 5 intentos fallidos** de login; **revocación de token** (blacklist JTI validada en cada request); **RBAC** con cuatro roles (ADMINISTRADOR, SECRETARIO, AUXILIAR, CONSULTA); **rate limiting** en NGINX para endpoints de auth y API; contraseñas con política mínima (longitud, complejidad); sin almacenar secretos en código. |
| **Auditoría inmutable** | Eventos de auditoría no editables ni eliminables; almacenamiento persistente y trazable; inserciones únicas, sin actualización ni borrado de eventos desde la aplicación. |
| **Integración SGT read-only** | Acceso solo lectura a SGTv1 y SGTv2; **prioridad SGTv2** cuando aplique; sin escritura desde SGED hacia SGT. |
| **Límite de documentos** | 100 MB máximo por archivo subido; validación en backend. |
| **Estructura de almacenamiento** | Sistema de archivos organizado por año y mes (ej. `{año}/{mes}/`) para documentos. |
| **Disponibilidad y rendimiento** | Objetivos de latencia y carga coherentes con los RNF actuales (ej. respuesta API &lt; 2 s, página &lt; 3 s donde aplique). |

---

## 5. Equipo y matriz RACI

### 5.1 Equipo

| Rol | Nombre | Responsabilidad principal |
|-----|--------|---------------------------|
| **Arquitecto** | Amilcar Gil González | Diseño técnico, decisiones de stack, coherencia con SGT y seguridad. |
| **Senior Developer (Frontend/Full-stack)** | Emilio González González | Desarrollo frontend React y aporte en integración. |
| **Senior BE Developer** | Allan Gil González | Desarrollo backend Node.js, API, integración Oracle y SGT. |
| **PM / Calidad** | Alejandro | Priorización, validación de calidad, criterios de aceptación y cierre de fases. |

Otros roles (DevOps/Infra, QA/Testing) se asignan según organización del proyecto; en la matriz se referencian como “DevOps” y “QA”.

### 5.2 Matriz RACI (por fase)

| Fase | Arquitectura (Amilcar) | Desarrollo (Emilio / Allan) | PM/Calidad (Alejandro) | DevOps/Infra | QA/Testing |
|------|------------------------|-----------------------------|------------------------|--------------|------------|
| F0 Cimientos | A/R | R | I | R | I |
| F1 Autenticación y seguridad | A | R | I | R | I |
| F2 Expedientes | A | R | I | C | I |
| F3 Documentos y visor | A | R | I | C | I |
| F4 Búsqueda e integración SGT | A | R | I | C | I |
| F5 Administración y auditoría UI | A | R | I | C | I |
| F6 Hardening y rendimiento | A | R | I | R | R |
| F7 QA y release | I | R | A | R | R |

Leyenda: **A** = Responsable de aprobación / Accountability, **R** = Responsable de ejecución, **C** = Consultado, **I** = Informado.

---

## 5.3 Hitos contractuales vs entregables técnicos

Los hitos contractuales (EA1–EA4) se alinean con las fases técnicas F0–F7 según la siguiente tabla. Los días son relativos a la fecha de firma del contrato.

| Hito contractual | Día | % | Entregable contractual | Fases técnicas que lo sustentan | Contenido del entregable |
|-----------------|-----|---|------------------------|---------------------------------|---------------------------|
| **EA1** | 35 | 20% | Documentación | F0 (y documentación de F1–F4 según avance) | Arquitectura (referencia a docs/diagramas + documento de arquitectura); modelos de datos (referencia Oracle/Flyway); prototipos (link a prototipos UX si existen o placeholder); especificaciones técnicas aprobadas (plan_detallado vNext, stack, decisiones). |
| **EA2** | 65 | 30% | Código fuente + pruebas | F0, F1, F2, F3, F4, F5 (y avance F6) | Código fuente backend y frontend (referencias a repos/módulos); pruebas unitarias y de integración completadas (reportes CI y cobertura); evidencia de pipelines (sin secretos). |
| **EA3** | 75 | 20% | UAT | F7 (preparación y ejecución UAT) | Plan UAT; acta de resultados aprobada por juzgados piloto; evidencia de incidencias y resolución. |
| **EA4** | 90 | 15% | Despliegue + manuales + capacitación | F6, F7 (cierre) | Despliegue en entorno operativo; manual de usuario y manual técnico (rutas en /docs); acta de capacitación (plantilla + lista de asistentes genérica o sin datos sensibles). |

**Resumen por día:**

- **Día 35 → EA1:** Arquitectura + modelo de datos + prototipos + especificaciones técnicas aprobadas.
- **Día 65 → EA2:** Backend + frontend + pruebas unitarias e de integración + evidencias de pipelines.
- **Día 75 → EA3:** UAT + acta de resultados aprobada por piloto.
- **Día 90 → EA4:** Despliegue + manuales + capacitación.

Las plantillas oficiales de informes de avance para EA1–EA4 están en [docs/entregables/](../entregables/).

---

## 6. Fases F0–F7: objetivos, entregables y criterios de aceptación

### FASE 0: Cimientos y alineación

**Objetivo:** Definir gobierno del proyecto vNext, repositorios, stack y estándares sin implementar aún lógica de negocio.

**Entregables:**
- Documento de decisión de stack (React 19.2.4, Node 22.20, NestJS o alternativa, Oracle 21c).
- Repositorios o monorepo con estructura base frontend (React) y backend (Node).
- Configuración de desarrollo local (Docker Compose: app + Oracle 21c + NGINX).
- Criterios de código y revisión (lint, format, tests mínimos).
- Asignación de roles y canal de resolución de conflictos (Arquitectura/PM).

**Criterios de aceptación:**
- Build y ejecución local del frontend y del backend sin errores.
- Oracle 21c accesible desde el backend (conexión y migraciones vacías o iniciales si se usan).
- NGINX configurado como reverse proxy hacia backend/frontend.
- PM y Arquitecto validan documento de stack y estructura.

---

### FASE 1: Autenticación y seguridad

**Objetivo:** Login, JWT, RBAC de cuatro roles y políticas de seguridad alineadas al SGED actual.

**Entregables:**
- Endpoints: login, logout, cambio de contraseña, renovación de token (si aplica).
- JWT con expiración y validación en cada request; almacenamiento seguro de secretos.
- Bloqueo de cuenta tras **5 intentos fallidos** (lockout); política de contraseña documentada.
- Frontend: pantalla de login, guardas de ruta por autenticación y rol, integración con API de auth.
- Tests unitarios e integración de flujos de autenticación.

**Criterios de aceptación:**
- Login correcto genera JWT y permite acceso a rutas protegidas.
- Roles ADMINISTRADOR, SECRETARIO, AUXILIAR, CONSULTA aplicados en backend y reflejados en frontend.
- Intentos fallidos incrementan contador; bloqueo tras 5 intentos (lockout).
- Sin referencias a credenciales en código ni en repositorio.

---

### FASE 2: Gestión de expedientes

**Objetivo:** CRUD de expedientes, catálogos necesarios y filtros por juzgado/rol.

**Entregables:**
- Modelo de datos y migraciones (Flyway o equivalente) para expedientes y catálogos.
- API REST de expedientes (crear, leer, actualizar, listar con filtros).
- Frontend: listado, alta, edición, detalle y filtros coherentes con permisos por rol.
- Validaciones de negocio y mensajes de error claros.

**Criterios de aceptación:**
- Alta y edición de expedientes según permisos por rol.
- Listado filtrado por juzgado (y otros criterios definidos) sin fugas de datos entre juzgados.
- Persistencia correcta en Oracle 21c.

---

### FASE 3: Gestión documental y visor

**Objetivo:** Carga de documentos asociados a expedientes, almacenamiento por año/mes y visor multimedia.

**Entregables:**
- Almacenamiento de archivos en estructura `{año}/{mes}/`; límite 100 MB por archivo.
- API de carga, descarga y metadatos; asociación documento–expediente.
- Visor en frontend para tipos soportados (PDF, imágenes, etc.) y enlace a descarga.
- Auditoría de carga y visualización según diseño actual.

**Criterios de aceptación:**
- Archivos &gt; 100 MB rechazados con mensaje claro.
- Documentos accesibles solo según permisos del expediente y rol.
- Visor operativo para los formatos definidos en el plan.

---

### FASE 4: Búsqueda e integración SGT

**Objetivo:** Búsqueda unificada de expedientes/documentos y acceso read-only a SGTv1 y SGTv2.

**Entregables:**
- Búsqueda sobre datos propios de SGED (expedientes y documentos) con criterios acordados.
- Integración read-only con SGTv2 (prioritaria) y SGTv1; sin escritura hacia SGT.
- API y pantallas de búsqueda que distingan origen (SGED vs SGT) cuando aplique.
- Documentación de contratos y límites de uso de SGT.

**Criterios de aceptación:**
- Búsqueda en SGED devuelve resultados correctos y filtrados por permisos.
- Consultas a SGT solo lectura; prioridad SGTv2 respetada donde se defina.
- Sin modificaciones en bases o servicios SGT desde SGED.

---

### FASE 5: Administración y auditoría UI

**Objetivo:** Gestión de usuarios y parámetros, y pantallas de consulta de auditoría según permisos.

**Entregables:**
- ABM de usuarios (y roles) restringido a ADMINISTRADOR (o según diseño).
- Parámetros de sistema editables por roles autorizados.
- Pantalla(s) de consulta de auditoría con filtros; solo roles con permiso pueden acceder.
- Auditoría inmutable en base de datos (inserciones únicas, sin actualización/borrado de eventos).

**Criterios de aceptación:**
- Solo usuarios autorizados acceden a administración y a consulta de auditoría.
- Eventos de auditoría verificables y no alterables desde la aplicación.

---

### FASE 6: Hardening y rendimiento

**Objetivo:** Endurecimiento de seguridad (headers, rate limiting, etc.) y ajustes de rendimiento.

**Entregables:**
- NGINX con headers de seguridad, TLS, rate limiting y configuración de proxy alineada a la actual.
- Revisión de dependencias (vulnerabilidades conocidas) y configuración segura del runtime Node.
- Pruebas de carga y ajustes para cumplir objetivos de latencia (ej. API &lt; 2 s, página &lt; 3 s donde aplique).
- Documentación de configuración de producción.

**Criterios de aceptación:**
- Escaneo de seguridad sin hallazgos críticos abiertos.
- Objetivos de rendimiento medidos y documentados.
- NGINX en línea con guía de seguridad del proyecto.

---

### FASE 7: QA y release

**Objetivo:** Pruebas funcionales y no funcionales, criterios de go-live y paquete de release.

**Entregables:**
- Plan de pruebas (funcional, integración, seguridad, rendimiento).
- Ejecución de pruebas y registro de resultados.
- Criterios de aceptación de release validados por PM (Alejandro).
- Documentación de despliegue y rollback.
- Tag y artefactos de release para vNext.

**Criterios de aceptación:**
- Todas las fases F1–F6 validadas según criterios definidos.
- PM aprueba el cierre de F7 y el release.
- Documentación de operación disponible para el equipo de despliegue.

---

## 7. Reutilización del sistema actual

### 7.1 Reutilizable (sin reimplementar desde cero)

| Artefacto | Uso en vNext |
|-----------|----------------------|
| **Modelo de datos Oracle** | Esquema de tablas (expedientes, documentos, auditoría, usuarios, roles, etc.) y migraciones Flyway existentes pueden servir de referencia o base; adaptar a Oracle 21c si hay diferencias de versión. |
| **Configuración NGINX** | Hardening, rate limiting, proxy y headers de seguridad actuales se pueden tomar como base y adaptar a los nuevos puertos/servicios (Node + React). |
| **Documentación** | Plan detallado, requisitos funcionales (RF/RNF), historias de usuario, diagramas de arquitectura y flujos; guías de QA, smoke tests y operación como referencia. |
| **Pruebas y criterios** | Casos de prueba, criterios de aceptación por fase y checklist de smoke pueden reutilizarse y adaptarse al nuevo stack. |
| **Diagramas** | Diagramas de contexto, flujos y arquitectura vigentes como base para actualizar solo las capas que cambian (frontend/backend). |

### 7.2 No reutilizable (reimplementación)

| Componente | Motivo |
|------------|--------|
| **Frontend Angular** | Sustituido por React 19.2.4; se reimplementan pantallas y flujos manteniendo el diseño funcional y UX acordado. |
| **Backend Java/Spring Boot** | Sustituido por Node.js (NestJS o Express/Fastify); se reimplementan API, servicios y seguridad en el nuevo stack. |

La lógica de negocio, reglas de RBAC, integración SGT read-only y políticas de auditoría se replican en el nuevo código, no se reutiliza código Angular ni Java.

---

## 8. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| **Migración de stack** | Plan por fases (F0–F7); validación por fase con PM y Arquitectura; paralelismo opcional con sistema actual hasta corte definitivo. |
| **Compatibilidad Oracle 21c** | Usar driver y versión soportada oficialmente para Node.js; pruebas tempranas de conexión y migraciones (F0–F1); validar tipos de datos y transacciones. |
| **Rendimiento** | Objetivos explícitos (latencia, carga); pruebas de rendimiento en F6; revisión de consultas y conexiones a BD; uso de índices y buenas prácticas. |
| **Seguridad** | Reutilizar políticas actuales (JWT, bloqueo, contraseñas); hardening NGINX; revisión de dependencias; pruebas de seguridad en F6–F7. |
| **Integración SGT** | Contratos read-only claros; pruebas de integración en entorno alineado con SGT; no introducir escrituras hacia SGT. |
| **Disponibilidad de equipo** | Roles definidos (Arquitecto, Emilio, Allan, Alejandro); matriz RACI para evitar cuellos de botella; escalado de QA/DevOps según necesidad. |

---

## 9. Documentos de referencia

- **Roadmap vigente de producción:** `ROADMAP_PROYECTO_SGED.md` (stack actual Angular + Java).
- **Plan detallado:** `plan_detallado.md` (alcance funcional y requisitos).
- **Stack técnico actual:** `STACK_TECNICO_ACTUALIZADO.md` (referencia del sistema en producción).

Este documento es una **propuesta vNext** y no modifica la vigencia del roadmap ni del stack actual hasta que se apruebe formalmente la migración.

---

**Versión:** 1.0.0  
**Última actualización:** 30 enero 2026  
**Estado:** Propuesta — no implementado  
**Responsable:** Equipo SGED (Arquitectura y PM)
