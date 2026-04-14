# Revisión y Curación de Documentación SGED

**Versión:** 1.0.0  
**Fecha:** 30 enero 2026  
**Responsable:** Agente Revisor y Curador de Documentación  
**Estado:** Informe one-shot (integrar conclusiones y **eliminar en PR-3 o PR-4 cleanup** tras aplicar PR-1/PR-2)

---

## Decisiones del orquestador (30 enero 2026)

- **Q1 Roadmap:** Canónico = `ROADMAP_PROYECTO_SGED.md` en `docs/general/`. Sin sufijo .human en ruta vigente. Si hay diferencias entre versiones, se conserva la más actualizada.
- **Q2 Auditorías auth Java:** Crear resumen único en `docs/general/auditorias/AUDITORIA_AUTH_JAVA_RESUMEN.md`; mover los 4 archivos grandes a legacy (por ahora: legacy).
- **Q3 Fase 6/7:** Mover todos a `docs/fases/fase-6/` y `docs/fases/fase-7/` sin consolidar en este ciclo. Consolidación en PR-3/segundo ciclo.
- **Q4 Orden PRs:** PR-1 (mover/estructura con git mv) → PR-2 (enlaces índice + README). PR-3 para segundo ciclo (one-shot/eliminaciones) tras validar que PR-1 y PR-2 dejaron todo navegable.
- **Archivo REVISION_CURACION_2026-01-30.md:** Permitido temporalmente para ejecutar PR-1/PR-2; **debe eliminarse en PR-3 o PR-4** tras integrar conclusiones al índice/protocolo.

---

## 1. Resumen ejecutivo

Se revisó la documentación del repo frente al protocolo (`PROTOCOLO_DOCUMENTACION.md`), al índice maestro (`INDICE_MAESTRO_DOCUMENTACION.md`) y a las fuentes de verdad (código, docker-compose, stack). **La política de higiene documental se incumple de forma masiva:** casi toda la documentación vigente está en la **raíz del repositorio** en lugar de bajo `/docs`, y las carpetas que el índice y el README citan (`/docs/infra/`, `/docs/qa/`, `/docs/smoke-tests/`, `/docs/fases/`, `/docs/diagramas/`, y los documentos en `/docs/general/` como plan, roadmap y stack) **no existen** en la estructura actual de `/docs`. Solo existen en `/docs`: `general/auditorias/`, `legacy/`, `INDICE_MAESTRO_DOCUMENTACION.md` y `PROTOCOLO_DOCUMENTACION.md`. Por tanto:

- **Qué se detectó:** más de 50 archivos `.md` en raíz que deberían vivir en `/docs`; enlaces del índice maestro y del README rotos; duplicados y documentos one-shot sin integrar.
- **Por qué importa:** el índice y el README no son navegables; hay riesgo de usar documentación desactualizada o contradictoria; incumplimiento explícito de “prohibido .md en raíz”.

**Correcciones propuestas:** (1) Mover todos los documentos vigentes de raíz a `/docs` en la estructura definida por el protocolo. (2) Actualizar el índice maestro y el README para que los enlaces apunten a las rutas reales. (3) Eliminar o archivar en legacy los one-shot y duplicados, integrando conclusiones donde corresponda.

---

## 2. Lista de hallazgos

### 2.1 Documentos fuera de `/docs` (violación política A)

**Todos los siguientes están en la raíz del repo; según el protocolo deben vivir bajo `/docs/`.**

| Ubicación actual (raíz) | Destino según protocolo |
|-------------------------|-------------------------|
| `plan detallado.md` | `docs/general/plan_detallado.md` |
| `ROADMAP_PROYECTO_SGED.human.md` | `docs/general/ROADMAP_PROYECTO_SGED.md` (nombre canónico en índice) |
| `STACK_TECNICO_ACTUALIZADO.md` | `docs/general/STACK_TECNICO_ACTUALIZADO.md` |
| `DEPLOYMENT_GUIDE.md` | `docs/infra/DEPLOYMENT_GUIDE.md` |
| `NGINX_SECURITY_GUIDE.md` | `docs/infra/NGINX_SECURITY_GUIDE.md` |
| `SECRETS_MANAGEMENT.md` | `docs/infra/SECRETS_MANAGEMENT.md` |
| `README_INFRAESTRUCTURA.md` | `docs/infra/README_INFRAESTRUCTURA.md` |
| `PLAN_DESPLIEGUE_PRODUCCION.md` | `docs/infra/PLAN_DESPLIEGUE_PRODUCCION.md` |
| `ROLLBACK_PLAN_PRODUCCION.md` | `docs/infra/ROLLBACK_PLAN_PRODUCCION.md` |
| `MONITOREO_OPERACIONES_PRODUCCION.md` | `docs/infra/MONITOREO_OPERACIONES_PRODUCCION.md` |
| `RUNBOOK_OPERACIONES_PRODUCCION.md` | `docs/infra/RUNBOOK_OPERACIONES_PRODUCCION.md` |
| `OPERACIONES_DIARIAS_QUICK_REFERENCE.md` | `docs/infra/OPERACIONES_DIARIAS_QUICK_REFERENCE.md` (opcional; si se mantiene) |
| `QA_ACCEPTANCE_REPORT.md` | `docs/qa/QA_ACCEPTANCE_REPORT.md` |
| `GUIA_TRANSICION_ENTORNOS.md` | `docs/qa/GUIA_TRANSICION_ENTORNOS.md` |
| `VERIFICACION_RAPIDA_QA.md` | `docs/qa/VERIFICACION_RAPIDA_QA.md` |
| `PLAN_SMOKE_TESTS_PRODUCCION.md` | `docs/smoke-tests/PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md` (índice espera este nombre) |
| `QUICK_START_SMOKE_TESTS.md` | `docs/smoke-tests/QUICK_START_SMOKE_TESTS.md` |
| `INDICE_SMOKE_TESTS.md` | `docs/smoke-tests/INDICE_SMOKE_TESTS.md` |
| `TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md` | `docs/smoke-tests/TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md` |
| `SMOKE_TESTS_RESUMEN_EJECUTIVO.md` | `docs/smoke-tests/SMOKE_TESTS_RESUMEN_EJECUTIVO.md` |
| `FASE_6_INFORME_EJECUTIVO.md` | `docs/fases/fase-6/FASE_6_INFORME_EJECUTIVO.md` |
| `FASE_6_CHECKLIST_VALIDACION.md` | `docs/fases/fase-6/FASE_6_CHECKLIST_VALIDACION.md` |
| `INDICE_FASE_6.md` | `docs/fases/fase-6/INDICE_FASE_6.md` |
| `FASE_7_RESUMEN_IMPLEMENTACION.md` | `docs/fases/fase-7/FASE_7_RESUMEN_IMPLEMENTACION.md` |
| `FASE_7_QA_EXECUTION_GUIDE.md` | `docs/fases/fase-7/FASE_7_QA_EXECUTION_GUIDE.md` |
| `diagram_1.puml` … `diagram_6.puml` | `docs/diagramas/diagram_1.puml` … `diagram_6.puml` |
| `diagram_1.png` … `diagram_6.png` | `docs/diagramas/diagram_1.png` … `diagram_6.png` |

### 2.2 Enlaces rotos (índice maestro y README)

- **INDICE_MAESTRO_DOCUMENTACION.md** enlaza a:
  - `./general/plan_detallado.md`, `./general/ROADMAP_PROYECTO_SGED.md`, `./general/STACK_TECNICO_ACTUALIZADO.md` → **no existen** (están en raíz).
  - `./infra/*`, `./qa/*`, `./smoke-tests/*`, `./fases/fase-6/*`, `./fases/fase-7/*` → **carpetas no existen**.
  - `./smoke-tests/PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md` → archivo no existe (en raíz como `PLAN_SMOKE_TESTS_PRODUCCION.md`).
- **README.md** enlaza a `./docs/infra/...`, `./docs/qa/...`, `./docs/general/plan_detallado.md`, etc. → **todos rotos** mientras los archivos sigan en raíz.
- **docs/legacy/README_LEGACY.md** enlaza a `../general/plan_detallado.md`, `../general/ROADMAP_PROYECTO_SGED.md`, `../general/STACK_TECNICO_ACTUALIZADO.md` → rotos hasta que existan en `docs/general/`.
- **docs/general/auditorias/AUDITORIA_JAVA_RESUMEN.md** enlaza a `STACK_TECNICO_ACTUALIZADO.md` (misma carpeta); debe ser `../STACK_TECNICO_ACTUALIZADO.md` cuando el stack esté en `docs/general/`.

### 2.3 Duplicados y nombres

- **Roadmap:** En raíz está `ROADMAP_PROYECTO_SGED.human.md`. El índice espera `ROADMAP_PROYECTO_SGED.md` en `docs/general/`. Acción: mover y renombrar a `docs/general/ROADMAP_PROYECTO_SGED.md`.
- **Plan:** `plan detallado.md` (con espacio). Renombrar a `plan_detallado.md` al mover a `docs/general/`.
- **Smoke:** Existe `TEMPLATE_PROD_SMOKE_REPORT.md` y `TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md`. Mantener solo `TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md` en `docs/smoke-tests/`; el otro eliminar o marcar obsoleto.

### 2.4 Documentos one-shot / candidatos a eliminar o integrar

Según política B: no mantener como permanentes; integrar conclusiones en documento vivo y eliminar en PR de limpieza. Excepción: si hay obligación de auditoría/compliance, conservar solo resumen en `docs/general/auditorias/` o `docs/qa/`.

| Archivo (raíz) | Justificación | Acción propuesta |
|----------------|---------------|-------------------|
| `AUDIT_BACKEND_AUTH_JAVA.md` | Auditoría puntual backend auth | Integrar hallazgos en `docs/general/auditorias/AUDITORIA_JAVA_RESUMEN.md` o nuevo `AUDITORIA_AUTH_JAVA_RESUMEN.md`; mover los 4 AUDIT_* a legacy o eliminar |
| `AUDIT_BACKEND_AUTH_JAVA_INDICE.md` | Índice de la auditoría anterior | Idem |
| `AUDIT_BACKEND_AUTH_JAVA_HALLAZGOS_TABLA.md` | Tabla de hallazgos | Idem |
| `AUDIT_BACKEND_AUTH_JAVA_RESUME.md` | Resumen de la auditoría | Idem |
| `PLAN_ACCION_REORGANIZACION_DOCS.md` | Plan one-shot reorganización | Integrar en PROTOCOLO o índice; eliminar |
| `PROPUESTA_ESTRUCTURA_DOCUMENTACION.md` | Propuesta one-shot | Idem |
| `PR_DOCS_AUTH_CLEANUP_SUMMARY.md` | Resumen PR one-shot | Eliminar (historial en Git) |
| `00_LEEME_PRIMERO_FASE_7.md` | Leeme puntual Fase 7 | Integrar en `docs/fases/fase-7/` (ej. guía o resumen); eliminar |
| `CONCLUSION_FASE_7.md` | Conclusión one-shot | Integrar en FASE_7_RESUMEN_IMPLEMENTACION o informe ejecutivo fase-7; eliminar |
| `ENTREGA_FINAL_FASE_7.md` | Entrega one-shot | Idem |
| `REPORTE_FINAL_FASE_7.md` | Reporte one-shot | Idem |
| `FASE_7_STATUS_FINAL.md` | Estado one-shot | Idem |
| `INDICE_DOCUMENTOS_FASE_7.md` | Índice Fase 7 | Mover a `docs/fases/fase-7/INDICE_DOCUMENTOS_FASE_7.md` o fusionar con índice maestro |
| `INVENTARIO_ARTEFACTOS_FASE_7.md` | Inventario one-shot | Integrar en resumen fase-7; eliminar o legacy |
| `QUICK_START_FASE_7.md` | Quick start Fase 7 | Mover a `docs/fases/fase-7/` si se mantiene; si duplica QUICK_START_SMOKE/QA, integrar y eliminar |
| `FASE_7_RESUMEN_COMPLETACION.md` | Resumen one-shot | Integrar en FASE_7_RESUMEN_IMPLEMENTACION; eliminar |
| `HANDOFF_PARA_AGENTE_TESTING.md` | Handoff one-shot | Integrar en QA_ACCEPTANCE o guía QA; eliminar |
| `QA_LISTO_PARA_TESTING.md` | One-shot | Idem |
| `AGENTE_TESTING_SMOKE_REPORT.md` | Reporte one-shot agente | Integrar en SMOKE_TESTS_RESUMEN_EJECUTIVO; eliminar |
| `SMOKE_TESTS_ENTREGA_COMPLETADA.md` | One-shot entrega | Idem |
| `PROXIMO_PASO_SMOKE_TESTS.md` | One-shot próximo paso | Integrar en plan smoke o roadmap; eliminar |
| `MAPA_MENTAL_SMOKE_TESTS.md` | Opcional | Mover a `docs/smoke-tests/` si se mantiene; si redundante, eliminar |
| `README_SMOKE_TESTS.md` | Redundante con INDICE_SMOKE_TESTS / QUICK_START | Integrar en smoke-tests; eliminar duplicado |
| `QUICK_REF_SMOKE_TESTS.md` | Posible duplicado de QUICK_START | Revisar; si duplica, unificar y eliminar uno |
| `RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md` | Resumen one-shot deploy | Integrar en PLAN_DESPLIEGUE o DEPLOYMENT_GUIDE; mover a infra y eliminar duplicado de contenido |
| `GUIA_PRUEBAS_SISTEMA.md` | Guía pruebas | Mover a `docs/qa/` o integrar en GUIA_TRANSICION_ENTORNOS / VERIFICACION_RAPIDA_QA |
| `QUICK_START_PRUEBAS.md` | Posible duplicado | Revisar; unificar con QUICK_START_SMOKE o QA |
| `RESUMEN_SECRETS_Y_PRUEBAS.md` | One-shot | Integrar en SECRETS_MANAGEMENT o guía QA; eliminar |
| `GUIA_SECRETS_INYECCION.md` | Guía técnica | Mover a `docs/infra/` (complemento de SECRETS_MANAGEMENT) |
| `FASE_6_COMPLETADA.md`, `FASE_6_RESUMEN_CONSOLIDADO.md`, `FASE_6_RESUMEN_VISUAL.md`, `INDICE_MAESTRO_FASE_6.md` | Resúmenes Fase 6 | Mover a `docs/fases/fase-6/` los que se mantengan; consolidar resúmenes en uno si hay redundancia |
| `TEMPLATE_PROD_SMOKE_REPORT.md` (sin v1.0.0) | Duplicado de template | Eliminar; vigente es TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md |

### 2.5 Consistencia con código y despliegue

- **Stack:** `STACK_TECNICO_ACTUALIZADO.md` (raíz) indica Java 21, Spring Boot 3.5, Oracle 19c, Angular 21. Coincide con `docker-compose-prod.yml` (Java 21) y con `docs/general/auditorias/AUDITORIA_JAVA_RESUMEN.md`. No se detectó contradicción.
- **Auth:** README e índice describen auth integrada en backend (Spring Security/JWT). No se menciona auth Python como vigente. Consistente.
- **Índice** en tabla General dice "Oracle 19c"; stack dice 19c (compatible 21c). Correcto.

### 2.6 Protocolo (cabeceras)

- Varios documentos en raíz no tienen cabecera con Versión, Fecha, Vigente para, Responsable, Estado. Tras mover a `/docs`, aplicar normalización en un PR separado (PR-Docs-Normalize) para no mezclar movimiento con cambios de contenido.

### 2.7 Secretos

- No se revisó contenido de `.env*` ni de archivos de configuración con valores sensibles. Si en algún .md aparecieran contraseñas o tokens, deben redactarse (***REDACTED***) y reportarse. No se detectaron en los archivos listados.

---

## 3. Plan de acción propuesto por PRs (máximo 3 por ciclo)

### PR-1: PR-Docs-Cleanup — Mover documentación de raíz a `/docs` y crear estructura

- **Título:** docs: mover toda la documentación vigente de raíz a /docs según protocolo
- **Alcance:** Crear carpetas `docs/infra/`, `docs/qa/`, `docs/smoke-tests/`, `docs/fases/fase-6/`, `docs/fases/fase-7/`, `docs/diagramas/`. Mover (con `git mv`) los archivos listados en la tabla de 2.1 a sus destinos; renombrar `plan detallado.md` → `plan_detallado.md`, `ROADMAP_PROYECTO_SGED.human.md` → `ROADMAP_PROYECTO_SGED.md`, `PLAN_SMOKE_TESTS_PRODUCCION.md` → `PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md` en destino. Mover diagramas .puml y .png a `docs/diagramas/`.
- **Archivos tocados:** Todos los de la tabla 2.1 (origen en raíz, destino en docs). No editar contenido aún.
- **Riesgo/impacto:** Enlaces en README e índice siguen rotos hasta PR-2. Enlaces internos entre documentos que usen rutas relativas pueden requerir ajuste si asumen raíz.

### PR-2: PR-Docs-Index — Arreglar índice maestro y README

- **Título:** docs: corregir enlaces del índice maestro y README a rutas en /docs
- **Alcance:** Actualizar `docs/INDICE_MAESTRO_DOCUMENTACION.md` para que todas las rutas apunten a archivos existentes bajo `/docs`. Actualizar `README.md` para que todos los enlaces a documentación apunten a `/docs/...`. Corregir en `docs/legacy/README_LEGACY.md` las referencias a `../general/...`. Corregir en `docs/general/auditorias/AUDITORIA_JAVA_RESUMEN.md` el enlace a STACK a `../STACK_TECNICO_ACTUALIZADO.md`.
- **Archivos tocados:** `docs/INDICE_MAESTRO_DOCUMENTACION.md`, `README.md`, `docs/legacy/README_LEGACY.md`, `docs/general/auditorias/AUDITORIA_JAVA_RESUMEN.md`.
- **Riesgo/impacto:** Bajo. Depende de que PR-1 ya se haya mergeado.

### PR-3: PR-Docs-Cleanup-OneShot — Eliminar/mover one-shot y duplicados

- **Título:** docs: eliminar one-shot y duplicados; integrar conclusiones donde corresponda
- **Alcance:** Según tabla 2.4: integrar conclusiones de auditorías auth en `docs/general/auditorias/` (o nuevo resumen); mover los 4 `AUDIT_BACKEND_AUTH_JAVA*.md` a `docs/legacy/` con sufijo `_OBSOLETO_2026-01-30.md` y documentar en `README_LEGACY.md`. Eliminar de raíz (o no mover a docs) los one-shot listados (CONCLUSION_FASE_7, ENTREGA_FINAL_FASE_7, etc.) tras integrar en documentos vivos. Eliminar `TEMPLATE_PROD_SMOKE_REPORT.md` (sin versión). Unificar guías duplicadas (QUICK_START_PRUEBAS vs QUICK_START_SMOKE, etc.) y dejar una sola versión en `/docs`. Actualizar índice maestro para no listar documentos eliminados.
- **Archivos tocados:** Múltiples eliminaciones/archivos movidos a legacy; `docs/legacy/README_LEGACY.md`; documentos vivos donde se integren conclusiones; `docs/INDICE_MAESTRO_DOCUMENTACION.md` (quitar referencias a eliminados).
- **Riesgo/impacto:** Medio. Requiere decisión sobre qué integrar exactamente en cada documento vivo. Conviene hacer en último lugar y en pasos pequeños si hay dudas.

---

## 4. Lista exacta de archivos (resumen)

### 4.1 Mover a `/docs` (usar `git mv`)

- `plan detallado.md` → `docs/general/plan_detallado.md`
- `ROADMAP_PROYECTO_SGED.human.md` → `docs/general/ROADMAP_PROYECTO_SGED.md`
- `STACK_TECNICO_ACTUALIZADO.md` → `docs/general/STACK_TECNICO_ACTUALIZADO.md`
- `DEPLOYMENT_GUIDE.md` → `docs/infra/DEPLOYMENT_GUIDE.md`
- `NGINX_SECURITY_GUIDE.md` → `docs/infra/NGINX_SECURITY_GUIDE.md`
- `SECRETS_MANAGEMENT.md` → `docs/infra/SECRETS_MANAGEMENT.md`
- `README_INFRAESTRUCTURA.md` → `docs/infra/README_INFRAESTRUCTURA.md`
- `PLAN_DESPLIEGUE_PRODUCCION.md` → `docs/infra/PLAN_DESPLIEGUE_PRODUCCION.md`
- `ROLLBACK_PLAN_PRODUCCION.md` → `docs/infra/ROLLBACK_PLAN_PRODUCCION.md`
- `MONITOREO_OPERACIONES_PRODUCCION.md` → `docs/infra/MONITOREO_OPERACIONES_PRODUCCION.md`
- `RUNBOOK_OPERACIONES_PRODUCCION.md` → `docs/infra/RUNBOOK_OPERACIONES_PRODUCCION.md`
- `OPERACIONES_DIARIAS_QUICK_REFERENCE.md` → `docs/infra/OPERACIONES_DIARIAS_QUICK_REFERENCE.md`
- `QA_ACCEPTANCE_REPORT.md` → `docs/qa/QA_ACCEPTANCE_REPORT.md`
- `GUIA_TRANSICION_ENTORNOS.md` → `docs/qa/GUIA_TRANSICION_ENTORNOS.md`
- `VERIFICACION_RAPIDA_QA.md` → `docs/qa/VERIFICACION_RAPIDA_QA.md`
- `PLAN_SMOKE_TESTS_PRODUCCION.md` → `docs/smoke-tests/PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md`
- `QUICK_START_SMOKE_TESTS.md` → `docs/smoke-tests/QUICK_START_SMOKE_TESTS.md`
- `INDICE_SMOKE_TESTS.md` → `docs/smoke-tests/INDICE_SMOKE_TESTS.md`
- `TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md` → `docs/smoke-tests/TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md`
- `SMOKE_TESTS_RESUMEN_EJECUTIVO.md` → `docs/smoke-tests/SMOKE_TESTS_RESUMEN_EJECUTIVO.md`
- `FASE_6_INFORME_EJECUTIVO.md` → `docs/fases/fase-6/FASE_6_INFORME_EJECUTIVO.md`
- `FASE_6_CHECKLIST_VALIDACION.md` → `docs/fases/fase-6/FASE_6_CHECKLIST_VALIDACION.md`
- `INDICE_FASE_6.md` → `docs/fases/fase-6/INDICE_FASE_6.md`
- `FASE_7_RESUMEN_IMPLEMENTACION.md` → `docs/fases/fase-7/FASE_7_RESUMEN_IMPLEMENTACION.md`
- `FASE_7_QA_EXECUTION_GUIDE.md` → `docs/fases/fase-7/FASE_7_QA_EXECUTION_GUIDE.md`
- `diagram_1.puml` … `diagram_6.puml` → `docs/diagramas/diagram_1.puml` … `diagram_6.puml`
- `diagram_1.png` … `diagram_6.png` → `docs/diagramas/diagram_1.png` … `diagram_6.png`

(Opcional en este PR: `GUIA_SECRETS_INYECCION.md` → `docs/infra/GUIA_SECRETS_INYECCION.md`, `FASE_6_*` restantes y `INDICE_MAESTRO_FASE_6.md` a `docs/fases/fase-6/`, `INDICE_DOCUMENTOS_FASE_7.md` a `docs/fases/fase-7/`.)

### 4.2 Editar (enlaces / referencias)

- `docs/INDICE_MAESTRO_DOCUMENTACION.md` — actualizar todas las rutas a archivos en `/docs` (tras PR-1).
- `README.md` — actualizar enlaces a `./docs/...` (tras PR-1).
- `docs/legacy/README_LEGACY.md` — corregir enlaces a `../general/...`.
- `docs/general/auditorias/AUDITORIA_JAVA_RESUMEN.md` — enlace a `../STACK_TECNICO_ACTUALIZADO.md`.

### 4.3 Eliminar o mover a legacy (tras integrar conclusiones)

- Eliminar de raíz (one-shot, no mover a docs): `PR_DOCS_AUTH_CLEANUP_SUMMARY.md`, `PLAN_ACCION_REORGANIZACION_DOCS.md`, `PROPUESTA_ESTRUCTURA_DOCUMENTACION.md`, `00_LEEME_PRIMERO_FASE_7.md`, `CONCLUSION_FASE_7.md`, `ENTREGA_FINAL_FASE_7.md`, `REPORTE_FINAL_FASE_7.md`, `FASE_7_STATUS_FINAL.md`, `INVENTARIO_ARTEFACTOS_FASE_7.md`, `FASE_7_RESUMEN_COMPLETACION.md`, `HANDOFF_PARA_AGENTE_TESTING.md`, `QA_LISTO_PARA_TESTING.md`, `AGENTE_TESTING_SMOKE_REPORT.md`, `SMOKE_TESTS_ENTREGA_COMPLETADA.md`, `PROXIMO_PASO_SMOKE_TESTS.md`, `RESUMEN_SECRETS_Y_PRUEBAS.md`, `TEMPLATE_PROD_SMOKE_REPORT.md` (duplicado sin versión).
- Mover a legacy (con sufijo `_OBSOLETO_2026-01-30.md`) y documentar en `README_LEGACY.md`: `AUDIT_BACKEND_AUTH_JAVA.md`, `AUDIT_BACKEND_AUTH_JAVA_INDICE.md`, `AUDIT_BACKEND_AUTH_JAVA_HALLAZGOS_TABLA.md`, `AUDIT_BACKEND_AUTH_JAVA_RESUME.md` (tras integrar resumen en auditorías si se desea).
- Decidir por orquestador: `README_SMOKE_TESTS.md`, `QUICK_REF_SMOKE_TESTS.md`, `MAPA_MENTAL_SMOKE_TESTS.md`, `QUICK_START_PRUEBAS.md`, `GUIA_PRUEBAS_SISTEMA.md`, `RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md`, `FASE_6_COMPLETADA.md`, `FASE_6_RESUMEN_CONSOLIDADO.md`, `FASE_6_RESUMEN_VISUAL.md`, `INDICE_MAESTRO_FASE_6.md`, `QUICK_START_FASE_7.md`, `INDICE_DOCUMENTOS_FASE_7.md` — mover a `/docs` en carpeta adecuada o integrar y eliminar.

---

## 5. Preguntas al orquestador

1. **Roadmap canónico:** ¿Se considera `ROADMAP_PROYECTO_SGED.human.md` la versión oficial? Si es así, se propone moverla a `docs/general/ROADMAP_PROYECTO_SGED.md` (sin `.human` en el nombre) para coincidir con el índice. ¿Confirmado?
2. **Auditorías auth Java:** Los 4 archivos `AUDIT_BACKEND_AUTH_JAVA*.md`: ¿prefieren (a) crear un único resumen en `docs/general/auditorias/AUDITORIA_AUTH_JAVA_RESUMEN.md` y mover los 4 a legacy, o (b) solo mover los 4 a legacy sin nuevo resumen?
3. **Documentos Fase 6/7 adicionales:** Para `FASE_6_COMPLETADA`, `FASE_6_RESUMEN_CONSOLIDADO`, `FASE_6_RESUMEN_VISUAL`, `INDICE_MAESTRO_FASE_6`, `QUICK_START_FASE_7`, `INDICE_DOCUMENTOS_FASE_7`: ¿mover todos a `docs/fases/fase-6/` y `docs/fases/fase-7/` respectivamente, o consolidar algunos (p. ej. un solo resumen Fase 6) y eliminar el resto?
4. **Orden de PRs:** ¿Aplicar PR-1 (mover) y PR-2 (índice/README) en ese orden y dejar PR-3 (one-shot/eliminaciones) para un segundo ciclo tras sus respuestas a las preguntas anteriores?

---

**Fin del informe.** Integrar conclusiones en INDICE_MAESTRO o PROTOCOLO según proceda; eliminar este archivo en un PR de limpieza tras aplicar los PRs.
