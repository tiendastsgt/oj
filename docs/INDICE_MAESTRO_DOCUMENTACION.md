# 📑 ÍNDICE MAESTRO DE DOCUMENTACIÓN - SGED

**Versión:** 1.3.0  
**Fecha de última actualización:** 14 abril 2026  
**Vigente para:** SGED v1.3.0 (producción) y superior  
**Responsable:** Orquestador IA  
**Estado:** ✅ Vigente  

---

## 🎯 Propósito

Este documento es el **punto de entrada único** para navegar toda la documentación del proyecto SGED. Sirve como tabla de contenidos centralizada con descripciones breves de cada sección.

**Estructura:** Organizado por temas, con referencias cruzadas a documentos específicos.

---

## 📚 TABLA DE CONTENIDOS

1. [General](#general) - Documentación de proyecto y arquitectura
2. [Entregables contractuales](#entregables-contractuales) - Informes de avance EA1–EA4 (Día 35/65/75/90)
3. [Infraestructura](#infraestructura) - Deployment, secretos, monitoreo
4. [QA y Validación](#qa-y-validación) - Reportes de QA, transiciones
5. [Smoke Tests](#smoke-tests) - Planes y ejecución de smoke testing
6. [Fases de Desarrollo](#fases-de-desarrollo) - Documentación por fase
7. [Diagramas](#diagramas) - Arquitectura y diagramas de flujo
8. [Legacy](#legacy) - Documentos históricos/archivados

---

## GENERAL

**Ubicación:** `/docs/general/`

Documentación central del proyecto SGED que define alcance, arquitectura y visión técnica.

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [plan_detallado.md](./general/plan_detallado.md) | Especificación técnica v1.2. Nueva arquitectura SP + DB Links Failover. **Verdad única** para el proyecto. | ✅ v1.1.0+ | Agente de Documentación |
| [ROADMAP_PROYECTO_SGED.md](./general/ROADMAP_PROYECTO_SGED.md) | Hoja de ruta v1.1. Nueva línea base de 10 Sprints (5 meses). Actualizado post-rearquitectura. | ✅ v1.1.0+ | Agente de Documentación |
| [STACK_TECNICO_ACTUALIZADO.md](./general/STACK_TECNICO_ACTUALIZADO.md) | Stack técnico definido: Angular 21, Spring Boot 3.5, Java 21, Oracle 21c (compatible 19c). | ✅ v1.0.0+ | DevOps Team |
| [SEGURIDAD_AUTH_IMPLEMENTATION.md](./general/SEGURIDAD_AUTH_IMPLEMENTATION.md) | **[NUEVO]** Detalle técnico de la implementación de Spring Security, JWT y Lockout. | ✅ v1.0.0+ | Seguridad |
| [MANUAL_DE_USUARIO_FINAL.md](./general/MANUAL_DE_USUARIO_FINAL.md) | **[NUEVO]** Manual integral para el uso operativo de expedientes, visor documental y administración. | ✅ v1.3.0+ | Orquestador IA |

### Auditorías Técnicas

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [qa/audits/AUDIT_BACKEND_AUTH_JAVA.md](./qa/audits/AUDIT_BACKEND_AUTH_JAVA.md) | Auditoría de autenticación backend Java. Endpoints, JWT, lockout, RBAC. | ✅ v1.0.0+ | DevOps Team |

**Cuándo consultar:**
- Antes de empezar cualquier tarea (ver ROADMAP)
- Para entender requisitos: plan_detallado.md
- Para verificar versiones: STACK_TECNICO_ACTUALIZADO.md
- Para confirmar Java en todos lados: auditorias/AUDITORIA_JAVA_RESUMEN.md

---

## ENTREGABLES CONTRACTUALES

**Ubicación:** `/docs/entregables/`

Plantillas oficiales de Informes de Avance según bases del contrato, alineadas al proyecto SGED vNext (React 19.2.4 + Node 22.20.0 + Oracle 21c). Cada entregable incluye: informe de avances, evidencias y checklist de validación. Días relativos a la firma del contrato.

| Entregable | Hito | Contenido | Documentos |
|------------|------|-----------|------------|
| **EA1** — Documentación (20%) | Día 35 | Arquitectura, modelos de datos, prototipos, especificaciones técnicas aprobadas | [EA1_20pct_35dias/](./entregables/EA1_20pct_35dias/) — [INFORME_DE_AVANCES](./entregables/EA1_20pct_35dias/INFORME_DE_AVANCES.md), [EVIDENCIAS](./entregables/EA1_20pct_35dias/EVIDENCIAS.md), [CHECKLIST_VALIDACION](./entregables/EA1_20pct_35dias/CHECKLIST_VALIDACION.md) |
| **EA2** — Código fuente y pruebas (30%) | Día 65 | Código backend/frontend, pruebas unitarias e integración, pipelines CI | [EA2_30pct_65dias/](./entregables/EA2_30pct_65dias/) — [INFORME_DE_AVANCES](./entregables/EA2_30pct_65dias/INFORME_DE_AVANCES.md), [EVIDENCIAS](./entregables/EA2_30pct_65dias/EVIDENCIAS.md), [CHECKLIST_VALIDACION](./entregables/EA2_30pct_65dias/CHECKLIST_VALIDACION.md) |
| **EA3** — UAT (20%) | Día 75 | Plan UAT, acta de resultados aprobada por juzgados piloto, incidencias y resolución | [EA3_20pct_75dias/](./entregables/EA3_20pct_75dias/) — [INFORME_DE_AVANCES](./entregables/EA3_20pct_75dias/INFORME_DE_AVANCES.md), [EVIDENCIAS](./entregables/EA3_20pct_75dias/EVIDENCIAS.md), [CHECKLIST_VALIDACION](./entregables/EA3_20pct_75dias/CHECKLIST_VALIDACION.md) |
| **EA4** — Despliegue, manuales y capacitación (15%) | Día 90 | Despliegue en entorno operativo, manual de usuario y técnico, acta de capacitación | [EA4_15pct_90dias/](./entregables/EA4_15pct_90dias/) — [INFORME_DE_AVANCES](./entregables/EA4_15pct_90dias/INFORME_DE_AVANCES.md), [EVIDENCIAS](./entregables/EA4_15pct_90dias/EVIDENCIAS.md), [CHECKLIST_VALIDACION](./entregables/EA4_15pct_90dias/CHECKLIST_VALIDACION.md) |

**Cuándo consultar:**
- Para presentar avances contractuales: usar la plantilla INFORME_DE_AVANCES y EVIDENCIAS del entregable correspondiente.
- Para validación de cierre: completar CHECKLIST_VALIDACION y obtener aprobación del PM (Alejandro).

---

## INFRAESTRUCTURA

**Ubicación:** `/docs/infra/`

Guías operativas para despliegue, seguridad, secretos y monitoreo en producción.

### Guías Técnicas

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [NGINX_SECURITY_GUIDE.md](./infra/NGINX_SECURITY_GUIDE.md) | Configuración de seguridad para reverse proxy Nginx. Headers, HTTPS, CORS, SSL/TLS. | ✅ v1.0.0+ | Infraestructura |
| [RATE_LIMITING_NGINX.md](./infra/RATE_LIMITING_NGINX.md) | **[NUEVO]** Guía técnica sobre la configuración de límites de peticiones en Nginx. | ✅ v1.0.0+ | Infraestructura |
| [SECRETS_MANAGEMENT.md](./infra/SECRETS_MANAGEMENT.md) | Cómo gestionar secretos (DB credentials, API keys, JWT). Rotación, almacenamiento en vault. | ✅ v1.0.0+ | Infraestructura |
| [GUIA_SECRETS_INYECCION.md](./infra/GUIA_SECRETS_INYECCION.md) | Procedimiento de inyección de secretos en contenedores. | ✅ v1.0.0+ | Infraestructura |
| [README_INFRAESTRUCTURA.md](./infra/README_INFRAESTRUCTURA.md) | Vista general de componentes infra: Docker, Oracle, Nginx, volumes, networking. | ✅ v1.0.0+ | DevOps Team |

### Guías Operativas

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [DEPLOYMENT_GUIDE.md](./infra/DEPLOYMENT_GUIDE.md) | Procedimiento paso a paso para desplegar a QA/Producción. Incluye pre-checks, rollout, validación. | ✅ v1.0.0+ | DevOps Team |
| [PLAN_DESPLIEGUE_PRODUCCION.md](./infra/PLAN_DESPLIEGUE_PRODUCCION.md) | Plan específico para go-live a producción (28 ene 2026). Rollout gradual 10%→50%→100%. | ✅ v1.0.0+ | DevOps Team |
| [ROLLBACK_PLAN_PRODUCCION.md](./infra/ROLLBACK_PLAN_PRODUCCION.md) | Procedimiento de emergencia si algo falla en producción. Cómo revertir cambios, restaurar BD. | ✅ v1.0.0+ | DevOps Team |

### Operaciones Post-Despliegue

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [MONITOREO_OPERACIONES_PRODUCCION.md](./infra/MONITOREO_OPERACIONES_PRODUCCION.md) | Guía completa de monitoreo 24/7 durante 72h post-deploy. Métricas, alertas, runbooks, herramientas (Prometheus, etc.). | ✅ v1.0.0+ | Operations Team |
| [RUNBOOK_OPERACIONES_PRODUCCION.md](./infra/RUNBOOK_OPERACIONES_PRODUCCION.md) | Runbooks para troubleshooting rápido en producción. Cómo responder a alertas, recuperarse de fallos. | ✅ v1.0.0+ | Operations Team |

**Cuándo consultar:**
- Antes de desplegar: DEPLOYMENT_GUIDE.md
- Para go-live: PLAN_DESPLIEGUE_PRODUCCION.md
- En caso de error: ROLLBACK_PLAN_PRODUCCION.md
- Durante 72h post-deploy: MONITOREO_OPERACIONES_PRODUCCION.md
- Para troubleshooting: RUNBOOK_OPERACIONES_PRODUCCION.md

---

## QA Y VALIDACIÓN

**Ubicación:** `/docs/qa/`

Reportes de QA, guías de validación y transición entre entornos.

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [QA_ACCEPTANCE_REPORT.md](./qa/QA_ACCEPTANCE_REPORT.md) | **Acta formal de QA Fase 7.** Resumen ejecutivo, E2E (F1-F6), carga (P95/P99), seguridad. | ✅ v1.0.0+ | QA Team |
| [GUIA_PRUEBAS_SISTEMA.md](./qa/GUIA_PRUEBAS_SISTEMA.md) | Guía detallada para la ejecución de pruebas integrales. | ✅ v1.0.0+ | QA Team |
| [QUICK_START_PRUEBAS.md](./qa/QUICK_START_PRUEBAS.md) | Guía rápida para inicio de pruebas automatizadas. | ✅ v1.0.0+ | QA Team |
| [VERIFICACION_RAPIDA_QA.md](./qa/VERIFICACION_RAPIDA_QA.md) | Quick reference para validaciones manuales rápidas. Checklist de 10 minutos. | ✅ v1.0.0+ | QA Team |

**Cuándo consultar:**
- Antes de producción: QA_ACCEPTANCE_REPORT.md (para confirmar apto)
- Para transicionar entornos: GUIA_TRANSICION_ENTORNOS.md
- Para validación rápida: VERIFICACION_RAPIDA_QA.md

---

## SMOKE TESTS

**Ubicación:** `/docs/smoke-tests/`

Documentación de smoke testing para validación post-despliegue inmediata.

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md](./smoke-tests/PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md) | Plan completo de smoke tests. Objetivos, escenarios, herramientas, criterios de aceptación. | ✅ v1.0.0+ | QA Team |
| [QUICK_START_SMOKE_TESTS.md](./smoke-tests/QUICK_START_SMOKE_TESTS.md) | Guía rápida: Cómo ejecutar smoke tests en 15 minutos. Comandos, herramientas setup. | ✅ v1.0.0+ | QA Team |
| [INDICE_SMOKE_TESTS.md](./smoke-tests/INDICE_SMOKE_TESTS.md) | Índice de todos los documentos smoke tests. Referencia central para esta sección. | ✅ v1.0.0+ | QA Team |
| [TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md](./smoke-tests/TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md) | Template para reportar resultados de smoke testing post-deploy. Formato estandarizado. | ✅ v1.0.0+ | QA Team |
| [SMOKE_TESTS_RESUMEN_EJECUTIVO.md](./smoke-tests/SMOKE_TESTS_RESUMEN_EJECUTIVO.md) | Resumen de smoke testing completado en Fase 7. Resultados, hallazgos, recomendaciones. | ✅ v1.0.0+ | QA Team |

**Cuándo consultar:**
- Antes de desplegar a prod: PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md
- Para ejecutar ahora: QUICK_START_SMOKE_TESTS.md
- Para reportar: TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md
- Para ver resultados previos: SMOKE_TESTS_RESUMEN_EJECUTIVO.md

---

## FASES DE DESARROLLO

**Ubicación:** `/docs/fases/`

Documentación detallada de cada fase (1-7). Cada fase puede tener su carpeta con resúmenes e índices.

### Estructura General

```
/fases
├── fase-1/  (Autenticación)
├── fase-2/  (Expedientes)
├── fase-3/  (Documentos)
├── fase-4/  (Búsqueda + SGT)
├── fase-5/  (Administración + Auditoría)
├── fase-6/  (Infra + Hardening)
│   ├── FASE_6_INFORME_EJECUTIVO.md
│   ├── FASE_6_CHECKLIST_VALIDACION.md
│   └── INDICE_FASE_6.md
└── fase-7/  (QA + Release)
    ├── FASE_7_RESUMEN_IMPLEMENTACION.md
    ├── FASE_7_QA_EXECUTION_GUIDE.md
    └── INDICE_MAESTRO_FASE_6.md (*)
```

*Nota: INDICE_MAESTRO_FASE_6.md está en fase-7 por error histórico; se puede mover en próxima revisión.

### Documentos Fase 6 (Infraestructura)

| Documento | Descripción | Vigencia |
|-----------|-------------|----------|
| [fase-6/FASE_6_INFORME_EJECUTIVO.md](./fases/fase-6/FASE_6_INFORME_EJECUTIVO.md) | Resumen ejecutivo de Fase 6. Completación, deliverables, validaciones. | ✅ v1.0.0+ |
| [fase-6/FASE_6_CHECKLIST_VALIDACION.md](./fases/fase-6/FASE_6_CHECKLIST_VALIDACION.md) | Checklist de validación para Fase 6. Hardening, ZAP scan, CodeQL, etc. | ✅ v1.0.0+ |
| [fase-6/INDICE_FASE_6.md](./fases/fase-6/INDICE_FASE_6.md) | Índice de documentación Fase 6. | ✅ v1.0.0+ |

### Documentos Fase 7 (QA + Release)

| Documento | Descripción | Vigencia |
|-----------|-------------|----------|
| [fase-7/FASE_7_RESUMEN_IMPLEMENTACION.md](./fases/fase-7/FASE_7_RESUMEN_IMPLEMENTACION.md) | Resumen de implementación Fase 7. Flujos probados, resultados QA. | ✅ v1.0.0+ |
| [fase-7/FASE_7_QA_EXECUTION_GUIDE.md](./fases/fase-7/FASE_7_QA_EXECUTION_GUIDE.md) | Guía de ejecución de QA Fase 7. Planes, escenarios, herramientas. | ✅ v1.0.0+ |

**Cuándo consultar:**
- Para ver progress de una fase: Ir a `/fases/fase-X/INDICE_FASE_X.md`
- Para resumen ejecutivo: Archivo `RESUMEN_*.md` o `INFORME_*.md` de la fase

---

## DIAGRAMAS

**Ubicación:** `/docs/diagramas/`

Diagramas arquitectónicos, de flujo y de secuencia en PlantUML y PNG.

| Archivo | Descripción | Formato |
|---------|-------------|---------|
| diagram_1.puml / diagram_1.png | Diagrama 1 (descripción TBD) | PlantUML + PNG |
| diagram_2.puml / diagram_2.png | Diagrama 2 (descripción TBD) | PlantUML + PNG |
| diagram_3.puml / diagram_3.png | Diagrama 3 (descripción TBD) | PlantUML + PNG |
| diagram_4.puml / diagram_4.png | Diagrama 4 (descripción TBD) | PlantUML + PNG |
| diagram_5.puml / diagram_5.png | Diagrama 5 (descripción TBD) | PlantUML + PNG |
| diagram_6.puml / diagram_6.png | Diagrama 6 (descripción TBD) | PlantUML + PNG |

**Notas:**
- Diagramas están duplicados: `.puml` (fuente) y `.png` (renderizado)
- Para editar: Modificar `.puml` y regenerar `.png` con PlantUML
- Para visualizar rápido: Usar `.png`

**Cuándo consultar:**
- Para entender arquitectura: Consultar diagramas relevantes de plan_detallado.md
- Para ver flujos de datos: Diagramas en esta carpeta

---

## LEGACY

**Ubicación:** `/docs/legacy/`

Documentos históricos y archivados. **NO se usan para decisiones futuras.**

Ver [README_LEGACY.md](./legacy/README_LEGACY.md) para lista completa de documentos archivados y su razón.

**Contenido:**
- Documentos .docx antiguos (levantamiento, índices)
- Scripts de utilidad desusados
- Configuraciones antiguas

**Cuándo consultar:**
- Solo como **referencia histórica**
- Para entender cómo se llegó a la arquitectura actual
- **NO para implementar cambios**

---

## 🔍 CÓMO USAR ESTE ÍNDICE

### Caso 1: "Necesito saber cómo desplegar a producción"
1. Sección **[Infraestructura → Guías Operativas](#guías-operativas)**
2. Lee: `PLAN_DESPLIEGUE_PRODUCCION.md`
3. Consulta: `DEPLOYMENT_GUIDE.md` para detalles

### Caso 2: "¿Es el sistema apto para producción?"
1. Sección **[QA y Validación](#qa-y-validación)**
2. Lee: `QA_ACCEPTANCE_REPORT.md` (acta formal)
3. Conclusión: "✅ APTO PARA PRODUCCIÓN"

### Caso 3: "¿Qué versión de Angular debemos usar?"
1. Sección **[General](#general)**
2. Consulta: `STACK_TECNICO_ACTUALIZADO.md`
3. Respuesta: "Angular 21 LTS"

### Caso 4: "¿Cómo ejecuto smoke tests?"
1. Sección **[Smoke Tests](#smoke-tests)**
2. Lee: `QUICK_START_SMOKE_TESTS.md`
3. Sigue comandos paso a paso

### Caso 5: "El sistema está en producción. Hay un error. ¿Qué hago?"
1. Sección **[Infraestructura → Operaciones Post-Despliegue](#operaciones-post-despliegue)**
2. Consulta: `RUNBOOK_OPERACIONES_PRODUCCION.md`
3. Si es grave: `ROLLBACK_PLAN_PRODUCCION.md`

### Caso 6: "Necesito entender la arquitectura general"
1. Sección **[General](#general)**
2. Lee: `plan_detallado.md` (especificación completa)
3. Consulta: Diagramas en `/docs/diagramas/`

---

## 📊 RESUMEN DE VIGENCIA

| Sección | Estado | Última Actualización | Próxima Revisión |
|---------|--------|----------------------|------------------|
| General | ✅ Vigente (v1.3) | 2026-04-14 | 2026-05-01 |
| Entregables contractuales | ✅ Vigente | 2026-04-11 | 2026-04-25 |
| Infraestructura | ✅ Vigente | 2026-04-11 | 2026-04-25 |
| QA y Validación | ✅ Vigente | 2026-04-11 | 2026-04-25 |
| Smoke Tests | ✅ Vigente | 2026-04-11 | 2026-04-25 |
| Fases / Sprints | ✅ Vigente | 2026-04-11 | 2026-04-25 |
| Diagramas | ✅ Vigente | 2026-04-11 | TBD |
| Legacy | ✅ Vigente | 2026-04-11 | 2026-04-25 |

---

## 📞 CONTACTO Y ACTUALIZACIONES

**Responsable de este índice:** Orquestador IA  
**Para reportar inconsistencias:** Abrir issue en proyecto  
**Para solicitar nueva documentación:** Contactar al Orquestador

---

## 📋 CHECKLIST: ¿Está todo aquí?

Verifica que todos los documentos mencionados existan:

- [x] `/docs/general/` contiene plan, roadmap, stack, y **manual_de_usuario_final**
- [x] `/docs/entregables/` contiene plantillas EA1–EA4 (informes, evidencias, checklist)
- [x] `/docs/infra/` contiene guías de deployment, secretos, monitoreo
- [x] `/docs/qa/` contiene acta de QA
- [x] `/docs/smoke-tests/` contiene planes de smoke
- [x] `/docs/fases/fase-6/` y `/fase-7/` con resúmenes
- [x] `/docs/diagramas/` contiene diagram_*.puml y .png
- [x] `/docs/legacy/` contiene documentos archivados + README_LEGACY.md
- [x] `/docs/PROTOCOLO_DOCUMENTACION.md` define el protocolo
- [x] Este archivo: `/docs/INDICE_MAESTRO_DOCUMENTACION.md`

---

**Versión:** 1.3.0  
**Última actualización:** 14 abril 2026  
**Próxima revisión:** Continua  
**Responsable:** Orquestador IA  
**Estado:** ✅ Vigente
