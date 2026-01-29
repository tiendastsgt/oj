# 📑 ÍNDICE MAESTRO DE DOCUMENTACIÓN - SGED

**Versión:** 1.0.0  
**Fecha de última actualización:** 28 enero 2026  
**Vigente para:** SGED v1.0.0 y superior  
**Responsable:** Agente de Documentación  
**Estado:** ✅ Vigente  

---

## 🎯 Propósito

Este documento es el **punto de entrada único** para navegar toda la documentación del proyecto SGED. Sirve como tabla de contenidos centralizada con descripciones breves de cada sección.

**Estructura:** Organizado por temas, con referencias cruzadas a documentos específicos.

---

## 📚 TABLA DE CONTENIDOS

1. [General](#general) - Documentación de proyecto y arquitectura
2. [Infraestructura](#infraestructura) - Deployment, secretos, monitoreo
3. [QA y Validación](#qa-y-validación) - Reportes de QA, transiciones
4. [Smoke Tests](#smoke-tests) - Planes y ejecución de smoke testing
5. [Fases de Desarrollo](#fases-de-desarrollo) - Documentación por fase
6. [Diagramas](#diagramas) - Arquitectura y diagramas de flujo
7. [Legacy](#legacy) - Documentos históricos/archivados

---

## GENERAL

**Ubicación:** `/docs/general/`

Documentación central del proyecto SGED que define alcance, arquitectura y visión técnica.

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [plan_detallado.md](./general/plan_detallado.md) | Especificación técnica completa del sistema. Incluye requisitos (RF/RNF), arquitectura, APIs, seguridad y testing. **Verdad única** para el proyecto. | ✅ v1.0.0+ | Agente de Documentación |
| [ROADMAP_PROYECTO_SGED.md](./general/ROADMAP_PROYECTO_SGED.md) | Hoja de ruta con 8 fases (0-7) y estado actual. Desglose de tareas, objetivos y timeline. Actualizado post-QA. | ✅ v1.0.0+ | Agente de Documentación |
| [STACK_TECNICO_ACTUALIZADO.md](./general/STACK_TECNICO_ACTUALIZADO.md) | Stack técnico definido: Angular 21, Spring Boot 3.5, Java 21, Oracle 19c, etc. Versiones exactas de todas las dependencias. | ✅ v1.0.0+ | DevOps Team |

### Auditorías Técnicas

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [auditorias/AUDITORIA_JAVA_RESUMEN.md](./general/auditorias/AUDITORIA_JAVA_RESUMEN.md) | Auditoría de versión Java en build y runtime. Confirma Java 21 en todas las capas (Maven, Docker, CI, tests). Recomendación baseline: Java 21 LTS. | ✅ v1.0.0+ | DevOps Team |

**Cuándo consultar:**
- Antes de empezar cualquier tarea (ver ROADMAP)
- Para entender requisitos: plan_detallado.md
- Para verificar versiones: STACK_TECNICO_ACTUALIZADO.md
- Para confirmar Java en todos lados: auditorias/AUDITORIA_JAVA_RESUMEN.md

---

## INFRAESTRUCTURA

**Ubicación:** `/docs/infra/`

Guías operativas para despliegue, seguridad, secretos y monitoreo en producción.

### Guías Técnicas

| Documento | Descripción | Vigencia | Responsable |
|-----------|-------------|----------|-------------|
| [NGINX_SECURITY_GUIDE.md](./infra/NGINX_SECURITY_GUIDE.md) | Configuración de seguridad para reverse proxy Nginx. Headers, HTTPS, CORS, rate limiting, SSL/TLS. | ✅ v1.0.0+ | Infraestructura |
| [SECRETS_MANAGEMENT.md](./infra/SECRETS_MANAGEMENT.md) | Cómo gestionar secretos (DB credentials, API keys, JWT). Rotación, almacenamiento en vault, ciclado 90 días. | ✅ v1.0.0+ | Infraestructura |
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
| [QA_ACCEPTANCE_REPORT.md](./qa/QA_ACCEPTANCE_REPORT.md) | **Acta formal de QA Fase 7.** Resumen ejecutivo, E2E (F1-F6), carga (P95/P99), seguridad (ZAP/CodeQL), conclusión: APTO PARA PRODUCCIÓN. | ✅ v1.0.0+ | QA Team |
| [GUIA_TRANSICION_ENTORNOS.md](./qa/GUIA_TRANSICION_ENTORNOS.md) | Cómo validar el paso QA→Staging→Producción. Smoke tests, checkpoints, rollback si es necesario. | ✅ v1.0.0+ | QA Team |
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
| General | ✅ Vigente | 2026-01-28 | 2026-02-28 |
| Infraestructura | ✅ Vigente | 2026-01-28 | 2026-02-28 |
| QA y Validación | ✅ Vigente | 2026-01-28 | 2026-02-28 |
| Smoke Tests | ✅ Vigente | 2026-01-28 | 2026-02-28 |
| Fases 6-7 | ✅ Vigente | 2026-01-28 | 2026-02-28 |
| Diagramas | ✅ Vigente | 2026-01-28 | TBD |
| Legacy | ✅ Vigente (histórico) | 2026-01-28 | 2026-02-28 |

---

## 📞 CONTACTO Y ACTUALIZACIONES

**Responsable de este índice:** Agente de Documentación  
**Para reportar inconsistencias:** Abrir issue en proyecto  
**Para solicitar nueva documentación:** Contactar al Orquestador

---

## 📋 CHECKLIST: ¿Está todo aquí?

Verifica que todos los documentos mencionados existan:

- [ ] `/docs/general/` contiene plan, roadmap, stack
- [ ] `/docs/infra/` contiene guías de deployment, secretos, monitoreo
- [ ] `/docs/qa/` contiene acta de QA
- [ ] `/docs/smoke-tests/` contiene planes de smoke
- [ ] `/docs/fases/fase-6/` y `/fase-7/` con resúmenes
- [ ] `/docs/diagramas/` contiene diagram_*.puml y .png
- [ ] `/docs/legacy/` contiene documentos archivados + README_LEGACY.md
- [ ] `/docs/PROTOCOLO_DOCUMENTACION.md` define el protocolo
- [ ] Este archivo: `/docs/INDICE_MAESTRO_DOCUMENTACION.md`

---

**Versión:** 1.0.0  
**Última actualización:** 28 enero 2026  
**Próxima revisión:** 2026-02-28  
**Responsable:** Agente de Documentación  
**Estado:** ✅ Vigente
