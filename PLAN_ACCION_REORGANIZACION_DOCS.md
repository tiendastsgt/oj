# 📋 PLAN DE ACCIÓN: REORGANIZACIÓN DE DOCUMENTACIÓN SGED

**Versión:** 1.0.0  
**Fecha:** 28 enero 2026  
**Responsable:** Agente de Documentación  
**Estado:** ✅ Listo para Ejecución  

---

## 1. ESTRUCTURA FINAL BAJO `/docs/`

### 1.1 Estructura de Carpetas Exacta

```
C:\proyectos\oj\docs\
│
├── general/                          ← Documentación central del proyecto
│   ├── plan_detallado.md            (renombrar desde "plan detallado.md")
│   ├── ROADMAP_PROYECTO_SGED.md
│   └── STACK_TECNICO_ACTUALIZADO.md
│
├── infra/                            ← Infraestructura, deployment, operaciones
│   ├── DEPLOYMENT_GUIDE.md
│   ├── NGINX_SECURITY_GUIDE.md
│   ├── SECRETS_MANAGEMENT.md
│   ├── PLAN_DESPLIEGUE_PRODUCCION.md
│   ├── ROLLBACK_PLAN_PRODUCCION.md
│   ├── MONITOREO_OPERACIONES_PRODUCCION.md
│   ├── RUNBOOK_OPERACIONES_PRODUCCION.md
│   ├── README_INFRAESTRUCTURA.md
│   └── GUIA_TRANSICION_ENTORNOS.md
│
├── qa/                               ← QA, validación y aceptación
│   ├── QA_ACCEPTANCE_REPORT.md
│   ├── QA_LISTO_PARA_TESTING.md
│   ├── VERIFICACION_RAPIDA_QA.md
│   ├── HANDOFF_PARA_AGENTE_TESTING.md
│   ├── INDICE_DOCUMENTOS_FASE_7.md
│   └── INVENTARIO_ARTEFACTOS_FASE_7.md
│
├── smoke-tests/                      ← Smoke testing post-despliegue
│   ├── PLAN_SMOKE_TESTS_PRODUCCION.md
│   ├── QUICK_START_SMOKE_TESTS.md
│   ├── TEMPLATE_PROD_SMOKE_REPORT.md
│   ├── TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md
│   ├── SMOKE_TESTS_ENTREGA_COMPLETADA.md
│   ├── SMOKE_TESTS_RESUMEN_EJECUTIVO.md
│   ├── INDICE_SMOKE_TESTS.md
│   ├── PROXIMO_PASO_SMOKE_TESTS.md
│   ├── QUICK_REF_SMOKE_TESTS.md
│   ├── MAPA_MENTAL_SMOKE_TESTS.md
│   ├── README_SMOKE_TESTS.md
│   └── AGENTE_TESTING_SMOKE_REPORT.md
│
├── fases/                            ← Documentación detallada por fase
│   ├── fase-1/                       (vacío: referencia futura)
│   ├── fase-2/                       (vacío: referencia futura)
│   ├── fase-3/                       (vacío: referencia futura)
│   ├── fase-4/                       (vacío: referencia futura)
│   ├── fase-5/                       (vacío: referencia futura)
│   ├── fase-6/
│   │   ├── FASE_6_COMPLETADA.md
│   │   ├── FASE_6_INFORME_EJECUTIVO.md
│   │   ├── FASE_6_CHECKLIST_VALIDACION.md
│   │   ├── FASE_6_RESUMEN_CONSOLIDADO.md
│   │   ├── FASE_6_RESUMEN_VISUAL.md
│   │   ├── INDICE_FASE_6.md
│   │   └── INDICE_MAESTRO_FASE_6.md
│   └── fase-7/
│       ├── FASE_7_RESUMEN_COMPLETACION.md
│       ├── FASE_7_RESUMEN_IMPLEMENTACION.md
│       ├── FASE_7_STATUS_FINAL.md
│       ├── FASE_7_QA_EXECUTION_GUIDE.md
│       ├── CONCLUSION_FASE_7.md
│       ├── ENTREGA_FINAL_FASE_7.md
│       ├── REPORTE_FINAL_FASE_7.md
│       ├── RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md
│       ├── OPERACIONES_DIARIAS_QUICK_REFERENCE.md
│       ├── QUICK_START_FASE_7.md
│       └── 00_LEEME_PRIMERO_FASE_7.md
│
├── diagramas/                        ← Diagramas arquitectónicos y flujos
│   ├── diagram_1.puml
│   ├── diagram_1.png
│   ├── diagram_2.puml
│   ├── diagram_2.png
│   ├── diagram_3.puml
│   ├── diagram_3.png
│   ├── diagram_4.puml
│   ├── diagram_4.png
│   ├── diagram_5.puml
│   ├── diagram_5.png
│   ├── diagram_6.puml
│   ├── diagram_6.png
│   └── README_DIAGRAMAS.md             (NUEVO: índice de diagramas)
│
├── legacy/                           ← Documentos históricos (NO USAR)
│   ├── README_LEGACY.md              (NUEVO: explicación y índice)
│   ├── Documento_Final.docx
│   ├── Documento_Profesional.docx
│   ├── Documento_con_Diagramas.docx
│   ├── FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx
│   ├── plan detallado.docx
│   ├── 📋 ÍNDICE TÉCNICO.docx
│   ├── 📋 ÍNDICE TÉCNICO ACTUALIZADO.docx
│   ├── PLAN DE TRABAJO DETALLADO industrial.docx
│   ├── Carta de interés y disponibilidad..docx
│   ├── convertidor.py
│   ├── convertidor_con_diagrama.py
│   ├── .env.qa
│   ├── entrada.txt
│   ├── ~$cumento_Profesional.docx      (archivo temporal Word)
│   └── INDICE_LEGACY_POR_FECHA.md      (NUEVO: log de archivos archivados)
│
├── PROTOCOLO_DOCUMENTACION.md         (YA CREADO)
├── INDICE_MAESTRO_DOCUMENTACION.md    (ACTUALIZACIÓN PENDIENTE - ver sección 3)
└── README.md                          (YA CREADO en raíz, apunta aquí)
```

---

## 2. MAPEO DETALLADO: ARCHIVO → CARPETA

### 2.1 General (3 archivos)

| De (raíz) | A (docs/general/) | Nota |
|-----------|------------------|------|
| plan detallado.md | plan_detallado.md | **RENOMBRAR**: quitar espacio |
| ROADMAP_PROYECTO_SGED.md | ROADMAP_PROYECTO_SGED.md | Sin cambios |
| STACK_TECNICO_ACTUALIZADO.md | STACK_TECNICO_ACTUALIZADO.md | Sin cambios |

### 2.2 Infraestructura (9 archivos)

| De (raíz) | A (docs/infra/) | Nota |
|-----------|-----------------|------|
| DEPLOYMENT_GUIDE.md | DEPLOYMENT_GUIDE.md | Sin cambios |
| NGINX_SECURITY_GUIDE.md | NGINX_SECURITY_GUIDE.md | Sin cambios |
| SECRETS_MANAGEMENT.md | SECRETS_MANAGEMENT.md | Sin cambios |
| PLAN_DESPLIEGUE_PRODUCCION.md | PLAN_DESPLIEGUE_PRODUCCION.md | Sin cambios |
| ROLLBACK_PLAN_PRODUCCION.md | ROLLBACK_PLAN_PRODUCCION.md | Sin cambios |
| MONITOREO_OPERACIONES_PRODUCCION.md | MONITOREO_OPERACIONES_PRODUCCION.md | Sin cambios |
| RUNBOOK_OPERACIONES_PRODUCCION.md | RUNBOOK_OPERACIONES_PRODUCCION.md | Sin cambios |
| README_INFRAESTRUCTURA.md | README_INFRAESTRUCTURA.md | Sin cambios |
| GUIA_TRANSICION_ENTORNOS.md | GUIA_TRANSICION_ENTORNOS.md | Sin cambios |

### 2.3 QA (6 archivos)

| De (raíz) | A (docs/qa/) | Nota |
|-----------|--------------|------|
| QA_ACCEPTANCE_REPORT.md | QA_ACCEPTANCE_REPORT.md | Sin cambios |
| QA_LISTO_PARA_TESTING.md | QA_LISTO_PARA_TESTING.md | Sin cambios |
| VERIFICACION_RAPIDA_QA.md | VERIFICACION_RAPIDA_QA.md | Sin cambios |
| HANDOFF_PARA_AGENTE_TESTING.md | HANDOFF_PARA_AGENTE_TESTING.md | Sin cambios |
| INDICE_DOCUMENTOS_FASE_7.md | INDICE_DOCUMENTOS_FASE_7.md | Sin cambios |
| INVENTARIO_ARTEFACTOS_FASE_7.md | INVENTARIO_ARTEFACTOS_FASE_7.md | Sin cambios |

### 2.4 Smoke Tests (12 archivos)

| De (raíz) | A (docs/smoke-tests/) | Nota |
|-----------|----------------------|------|
| PLAN_SMOKE_TESTS_PRODUCCION.md | PLAN_SMOKE_TESTS_PRODUCCION.md | Sin cambios |
| QUICK_START_SMOKE_TESTS.md | QUICK_START_SMOKE_TESTS.md | Sin cambios |
| TEMPLATE_PROD_SMOKE_REPORT.md | TEMPLATE_PROD_SMOKE_REPORT.md | Sin cambios |
| TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md | TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md | Sin cambios |
| SMOKE_TESTS_ENTREGA_COMPLETADA.md | SMOKE_TESTS_ENTREGA_COMPLETADA.md | Sin cambios |
| SMOKE_TESTS_RESUMEN_EJECUTIVO.md | SMOKE_TESTS_RESUMEN_EJECUTIVO.md | Sin cambios |
| INDICE_SMOKE_TESTS.md | INDICE_SMOKE_TESTS.md | Sin cambios |
| PROXIMO_PASO_SMOKE_TESTS.md | PROXIMO_PASO_SMOKE_TESTS.md | Sin cambios |
| QUICK_REF_SMOKE_TESTS.md | QUICK_REF_SMOKE_TESTS.md | Sin cambios |
| MAPA_MENTAL_SMOKE_TESTS.md | MAPA_MENTAL_SMOKE_TESTS.md | Sin cambios |
| README_SMOKE_TESTS.md | README_SMOKE_TESTS.md | Sin cambios |
| AGENTE_TESTING_SMOKE_REPORT.md | AGENTE_TESTING_SMOKE_REPORT.md | Sin cambios |

### 2.5 Fase 6 (7 archivos)

| De (raíz) | A (docs/fases/fase-6/) | Nota |
|-----------|------------------------|------|
| FASE_6_COMPLETADA.md | FASE_6_COMPLETADA.md | Sin cambios |
| FASE_6_INFORME_EJECUTIVO.md | FASE_6_INFORME_EJECUTIVO.md | Sin cambios |
| FASE_6_CHECKLIST_VALIDACION.md | FASE_6_CHECKLIST_VALIDACION.md | Sin cambios |
| FASE_6_RESUMEN_CONSOLIDADO.md | FASE_6_RESUMEN_CONSOLIDADO.md | Sin cambios |
| FASE_6_RESUMEN_VISUAL.md | FASE_6_RESUMEN_VISUAL.md | Sin cambios |
| INDICE_FASE_6.md | INDICE_FASE_6.md | Sin cambios |
| INDICE_MAESTRO_FASE_6.md | INDICE_MAESTRO_FASE_6.md | Sin cambios |

### 2.6 Fase 7 (11 archivos)

| De (raíz) | A (docs/fases/fase-7/) | Nota |
|-----------|------------------------|------|
| FASE_7_RESUMEN_COMPLETACION.md | FASE_7_RESUMEN_COMPLETACION.md | Sin cambios |
| FASE_7_RESUMEN_IMPLEMENTACION.md | FASE_7_RESUMEN_IMPLEMENTACION.md | Sin cambios |
| FASE_7_STATUS_FINAL.md | FASE_7_STATUS_FINAL.md | Sin cambios |
| FASE_7_QA_EXECUTION_GUIDE.md | FASE_7_QA_EXECUTION_GUIDE.md | Sin cambios |
| CONCLUSION_FASE_7.md | CONCLUSION_FASE_7.md | Sin cambios |
| ENTREGA_FINAL_FASE_7.md | ENTREGA_FINAL_FASE_7.md | Sin cambios |
| REPORTE_FINAL_FASE_7.md | REPORTE_FINAL_FASE_7.md | Sin cambios |
| RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md | RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md | Sin cambios |
| OPERACIONES_DIARIAS_QUICK_REFERENCE.md | OPERACIONES_DIARIAS_QUICK_REFERENCE.md | Sin cambios |
| QUICK_START_FASE_7.md | QUICK_START_FASE_7.md | Sin cambios |
| 00_LEEME_PRIMERO_FASE_7.md | 00_LEEME_PRIMERO_FASE_7.md | Sin cambios |

### 2.7 Diagramas (13 archivos)

| De (raíz) | A (docs/diagramas/) | Nota |
|-----------|-------------------|------|
| diagram_1.puml | diagram_1.puml | Sin cambios |
| diagram_1.png | diagram_1.png | Sin cambios |
| diagram_2.puml | diagram_2.puml | Sin cambios |
| diagram_2.png | diagram_2.png | Sin cambios |
| diagram_3.puml | diagram_3.puml | Sin cambios |
| diagram_3.png | diagram_3.png | Sin cambios |
| diagram_4.puml | diagram_4.puml | Sin cambios |
| diagram_4.png | diagram_4.png | Sin cambios |
| diagram_5.puml | diagram_5.puml | Sin cambios |
| diagram_5.png | diagram_5.png | Sin cambios |
| diagram_6.puml | diagram_6.puml | Sin cambios |
| diagram_6.png | diagram_6.png | Sin cambios |
| plantuml.jar | Ver sección 5.2 | ❓ DUDOSO - ver opciones A/B |

### 2.8 Legacy (14 archivos + 1 decisión pendiente)

| De (raíz) | A (docs/legacy/) | Razón |
|-----------|------------------|-------|
| Documento_Final.docx | Documento_Final.docx | Versión antigua del plan |
| Documento_Profesional.docx | Documento_Profesional.docx | Documento de presentación inicial |
| Documento_con_Diagramas.docx | Documento_con_Diagramas.docx | Borrador con diagramas iniciales |
| FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx | FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx | Formularios de análisis completados |
| plan detallado.docx | plan detallado.docx | Versión Word antigua (supersedida por .md) |
| 📋 ÍNDICE TÉCNICO.docx | 📋 ÍNDICE TÉCNICO.docx | Índice técnico v1 (obsoleto) |
| 📋 ÍNDICE TÉCNICO ACTUALIZADO.docx | 📋 ÍNDICE TÉCNICO ACTUALIZADO.docx | Índice técnico v2 (supersedido) |
| PLAN DE TRABAJO DETALLADO industrial.docx | PLAN DE TRABAJO DETALLADO industrial.docx | Borrador industrial (no usado) |
| Carta de interés y disponibilidad..docx | Carta de interés y disponibilidad..docx | Documento administrativo externo |
| convertidor.py | convertidor.py | Script de conversión (no parte del sistema final) |
| convertidor_con_diagrama.py | convertidor_con_diagrama.py | Script mejorado (no parte del sistema final) |
| .env.qa | .env.qa | Configuración QA antigua (reemplazada) |
| entrada.txt | entrada.txt | Archivo de prueba (sin valor) |
| ~$cumento_Profesional.docx | ~$cumento_Profesional.docx | Archivo temporal Word |

---

## 3. ENCABEZADOS ESTÁNDAR DE VIGENCIA

### 3.1 Formato Base Estándar

Todos los documentos vigentes deben tener este bloque al inicio:

```markdown
---
Documento: [NOMBRE_DEL_DOCUMENTO]
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-01-28
Vigente para: v1.0.0 y superiores (hasta próxima revisión)
Estado: ✅ Vigente
---

# [TÍTULO PRINCIPAL]
```

### 3.2 5 Documentos Clave con Encabezado Concreto

#### 1. **docs/general/plan_detallado.md**

```markdown
---
Documento: PLAN_DETALLADO_SGED
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-01-28
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
Responsable: Agente de Documentación
---

# PLAN DETALLADO - SGED v1.0.0
```

#### 2. **docs/general/ROADMAP_PROYECTO_SGED.md**

```markdown
---
Documento: ROADMAP_PROYECTO_SGED
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-01-28
Vigente para: v1.0.0 (próxima revisión: 2026-02-28)
Estado: ✅ Vigente
Responsable: Agente de Documentación
---

# ROADMAP DEL PROYECTO SGED (Fases 0-7)
```

#### 3. **docs/qa/QA_ACCEPTANCE_REPORT.md**

```markdown
---
Documento: QA_ACCEPTANCE_REPORT
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Fecha de QA: 2026-01-28
Última actualización: 2026-01-28
Vigente para: v1.0.0 (reporte final de Fase 7)
Estado: ✅ Vigente (Cerrado)
Responsable: QA Team
---

# QA ACCEPTANCE REPORT - SGED v1.0.0
```

#### 4. **docs/infra/DEPLOYMENT_GUIDE.md**

```markdown
---
Documento: DEPLOYMENT_GUIDE
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-01-28
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
Responsable: DevOps Team
Próxima revisión: 2026-02-28
---

# DEPLOYMENT GUIDE - SGED
```

#### 5. **docs/infra/MONITOREO_OPERACIONES_PRODUCCION.md**

```markdown
---
Documento: MONITOREO_OPERACIONES_PRODUCCION
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-01-28
Vigente para: v1.0.0 y posteriores
Estado: ✅ Vigente (Activo 72h+ post-deploy)
Responsable: Operations Team + DevOps
Próxima revisión: Post-go-live (72h)
---

# 📊 GUÍA DE MONITOREO Y OPERACIONES - PRODUCCIÓN
```

### 3.3 Aplicación de Encabezados

**Documentos a los que DEBE añadirse encabezado:**

- ✅ docs/general/ (3)
- ✅ docs/infra/ (9)
- ✅ docs/qa/ (6)
- ✅ docs/smoke-tests/ (12)
- ✅ docs/fases/ (18 archivos)

**Total: 48 documentos deben tener encabezado normalizado**

**Patrón:** Encabezado antes del título H1 (`# Título`)

---

## 4. ÍNDICE MAESTRO ACTUALIZABLE

### 4.1 Contenido Base de `docs/INDICE_MAESTRO_DOCUMENTACION.md`

```markdown
# 📑 ÍNDICE MAESTRO DE DOCUMENTACIÓN - SGED

**Versión:** 1.0.0  
**Última actualización:** 2026-01-28  
**Vigente para:** v1.0.0 y superiores  
**Responsable:** Agente de Documentación  

---

## 📚 TABLA DE CONTENIDOS

### 1. GENERAL (Documentación Central)
- [plan_detallado.md](./general/plan_detallado.md) - Especificación técnica completa
- [ROADMAP_PROYECTO_SGED.md](./general/ROADMAP_PROYECTO_SGED.md) - Hoja de ruta 7 fases
- [STACK_TECNICO_ACTUALIZADO.md](./general/STACK_TECNICO_ACTUALIZADO.md) - Versiones de dependencias

### 2. INFRAESTRUCTURA (Deploy, Secretos, Monitoreo)
- [DEPLOYMENT_GUIDE.md](./infra/DEPLOYMENT_GUIDE.md) - Procedimiento de despliegue
- [NGINX_SECURITY_GUIDE.md](./infra/NGINX_SECURITY_GUIDE.md) - Seguridad reverse proxy
- [SECRETS_MANAGEMENT.md](./infra/SECRETS_MANAGEMENT.md) - Gestión de secretos
- [PLAN_DESPLIEGUE_PRODUCCION.md](./infra/PLAN_DESPLIEGUE_PRODUCCION.md) - Plan go-live
- [ROLLBACK_PLAN_PRODUCCION.md](./infra/ROLLBACK_PLAN_PRODUCCION.md) - Plan de reversión
- [MONITOREO_OPERACIONES_PRODUCCION.md](./infra/MONITOREO_OPERACIONES_PRODUCCION.md) - Monitoreo 72h
- [RUNBOOK_OPERACIONES_PRODUCCION.md](./infra/RUNBOOK_OPERACIONES_PRODUCCION.md) - Troubleshooting
- [README_INFRAESTRUCTURA.md](./infra/README_INFRAESTRUCTURA.md) - Visión general infra
- [GUIA_TRANSICION_ENTORNOS.md](./infra/GUIA_TRANSICION_ENTORNOS.md) - Movimiento QA→Prod

### 3. QA Y VALIDACIÓN
- [QA_ACCEPTANCE_REPORT.md](./qa/QA_ACCEPTANCE_REPORT.md) - Acta formal de QA ✅ APTO PRODUCCIÓN
- [QA_LISTO_PARA_TESTING.md](./qa/QA_LISTO_PARA_TESTING.md) - Validación de readiness
- [VERIFICACION_RAPIDA_QA.md](./qa/VERIFICACION_RAPIDA_QA.md) - Checklist rápido
- [HANDOFF_PARA_AGENTE_TESTING.md](./qa/HANDOFF_PARA_AGENTE_TESTING.md) - Transición a testing
- [INDICE_DOCUMENTOS_FASE_7.md](./qa/INDICE_DOCUMENTOS_FASE_7.md) - Índice Fase 7
- [INVENTARIO_ARTEFACTOS_FASE_7.md](./qa/INVENTARIO_ARTEFACTOS_FASE_7.md) - Artefactos generados

### 4. SMOKE TESTS (Post-Despliegue)
- [PLAN_SMOKE_TESTS_PRODUCCION.md](./smoke-tests/PLAN_SMOKE_TESTS_PRODUCCION.md) - Plan v1.0.0
- [QUICK_START_SMOKE_TESTS.md](./smoke-tests/QUICK_START_SMOKE_TESTS.md) - Quick start 15min
- [TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md](./smoke-tests/TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md) - Template reporte
- [SMOKE_TESTS_RESUMEN_EJECUTIVO.md](./smoke-tests/SMOKE_TESTS_RESUMEN_EJECUTIVO.md) - Resumen final
- [INDICE_SMOKE_TESTS.md](./smoke-tests/INDICE_SMOKE_TESTS.md) - Índice humo tests
- [README_SMOKE_TESTS.md](./smoke-tests/README_SMOKE_TESTS.md) - Guía general

### 5. FASES DE DESARROLLO

#### Fase 6 (Infraestructura + Hardening)
- [fases/fase-6/FASE_6_INFORME_EJECUTIVO.md](./fases/fase-6/FASE_6_INFORME_EJECUTIVO.md)
- [fases/fase-6/FASE_6_CHECKLIST_VALIDACION.md](./fases/fase-6/FASE_6_CHECKLIST_VALIDACION.md)
- [fases/fase-6/INDICE_FASE_6.md](./fases/fase-6/INDICE_FASE_6.md)

#### Fase 7 (QA + Release + Go-Live)
- [fases/fase-7/FASE_7_RESUMEN_IMPLEMENTACION.md](./fases/fase-7/FASE_7_RESUMEN_IMPLEMENTACION.md)
- [fases/fase-7/FASE_7_QA_EXECUTION_GUIDE.md](./fases/fase-7/FASE_7_QA_EXECUTION_GUIDE.md)
- [fases/fase-7/00_LEEME_PRIMERO_FASE_7.md](./fases/fase-7/00_LEEME_PRIMERO_FASE_7.md)
- [fases/fase-7/RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md](./fases/fase-7/RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md)
- [fases/fase-7/OPERACIONES_DIARIAS_QUICK_REFERENCE.md](./fases/fase-7/OPERACIONES_DIARIAS_QUICK_REFERENCE.md)

### 6. DIAGRAMAS ARQUITECTÓNICOS
- [diagramas/diagram_1.puml](./diagramas/diagram_1.puml) + [.png](./diagramas/diagram_1.png)
- [diagramas/diagram_2.puml](./diagramas/diagram_2.puml) + [.png](./diagramas/diagram_2.png)
- [diagramas/diagram_3.puml](./diagramas/diagram_3.puml) + [.png](./diagramas/diagram_3.png)
- [diagramas/diagram_4.puml](./diagramas/diagram_4.puml) + [.png](./diagramas/diagram_4.png)
- [diagramas/diagram_5.puml](./diagramas/diagram_5.puml) + [.png](./diagramas/diagram_5.png)
- [diagramas/diagram_6.puml](./diagramas/diagram_6.puml) + [.png](./diagramas/diagram_6.png)
- [diagramas/README_DIAGRAMAS.md](./diagramas/README_DIAGRAMAS.md) - Índice de diagramas

### 7. LEGACY (Documentos Históricos - NO USAR)
- [legacy/README_LEGACY.md](./legacy/README_LEGACY.md) - Explicación de documentos archivados
- [legacy/...](./legacy/) - Documentos .docx iniciales y scripts obsoletos

---

## 🔄 CÓMO ACTUALIZAR ESTE ÍNDICE

### Cuando se agregue una nueva Fase (ej: Fase 8)

1. Crear carpeta: `/docs/fases/fase-8/`
2. Agregar documentos de fase
3. **Aquí:** Añadir nueva subsección bajo "5. FASES DE DESARROLLO"
4. Actualizar fecha de "Última actualización"
5. Incrementar versión minor (1.0 → 1.1)

**Ejemplo para Fase 8 (futuro):**

```markdown
#### Fase 8 (Post-Launch Improvements)
- [fases/fase-8/FASE_8_RESUMEN_RESULTADOS.md](./fases/fase-8/FASE_8_RESUMEN_RESULTADOS.md)
- [fases/fase-8/FASE_8_FEEDBACK_USUARIOS.md](./fases/fase-8/FASE_8_FEEDBACK_USUARIOS.md)
- ... (más docs)
```

### Cuando se agregue nueva documentación de Infraestructura

1. Crear archivo: `docs/infra/NUEVO_DOCUMENTO.md`
2. Agregar encabezado estándar de vigencia
3. **Aquí:** Añadir fila en sección "2. INFRAESTRUCTURA"
4. Actualizar fecha y versión

**Ejemplo:**

```markdown
- [NUEVO_DOCUMENTO.md](./infra/NUEVO_DOCUMENTO.md) - Descripción breve
```

### Mantención Periódica

- **Cada 30 días:** Revisar que todos los enlaces funcionen
- **Cada 90 días:** Actualizar estado de documentos (vigentes/deprecados)
- **Al deprecar un documento:** Mover a `/legacy/` y actualizar este índice

---

[Resto de secciones de INDICE_MAESTRO...]
```

---

## 5. DOCUMENTOS LEGACY Y README_LEGACY.md

### 5.1 Lista Definitiva de Documentos a Mover a `/docs/legacy/`

| Documento | Razón de Archivo | Clasificación |
|-----------|-----------------|-----------------|
| Documento_Final.docx | Versión antigua del plan; reemplazado por plan_detallado.md | Insumo inicial |
| Documento_Profesional.docx | Documento de presentación inicial; información obsoleta | Insumo inicial |
| Documento_con_Diagramas.docx | Borrador con diagramas; reemplazado por /diagramas/ | Insumo inicial |
| FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx | Formularios de análisis; información histórica | Insumo inicial |
| plan detallado.docx | Versión Word antigua; reemplazada por plan_detallado.md | Versión antigua |
| 📋 ÍNDICE TÉCNICO.docx | Índice técnico v1; reemplazado por ROADMAP y plan_detallado | Versión antigua |
| 📋 ÍNDICE TÉCNICO ACTUALIZADO.docx | Índice técnico v2; reemplazado por docs/ structure | Versión antigua |
| PLAN DE TRABAJO DETALLADO industrial.docx | Borrador industrial; no implementado | Insumo descartado |
| Carta de interés y disponibilidad..docx | Documento administrativo/legal externo | Fuera scope técnico |
| convertidor.py | Script de conversión; no parte del sistema final | Utilidad desusada |
| convertidor_con_diagrama.py | Script mejorado; funcionalidad en backend | Utilidad desusada |
| .env.qa | Configuración QA antigua; reemplazada por configs en backends | Config obsoleta |
| entrada.txt | Archivo de prueba sin valor | Artefacto temporal |
| ~$cumento_Profesional.docx | Archivo temporal Word (ignorar) | Temporal Word |

**Total:** 14 documentos → `/docs/legacy/`

### 5.2 Contenido de `docs/legacy/README_LEGACY.md`

```markdown
---
Documento: README_LEGACY
Proyecto: SGED
Tipo: Documentación de Archive
Última actualización: 2026-01-28
Estado: ⚠️ Histórico (NO USAR)
---

# 📦 LEGACY - Documentos Históricos y Archivados

## ⚠️ ADVERTENCIA CRÍTICA

Esta carpeta contiene **DOCUMENTOS HISTÓRICOS** que:

- ❌ **NO DEBEN** usarse para tomar decisiones futuras
- ❌ **NO DEBEN** servir como referencia para desarrollo
- ✅ **PUEDEN** usarse solo como contexto histórico
- ✅ **SE MANTIENEN** por razones de auditoría y rastreabilidad

---

## 📋 DOCUMENTOS ARCHIVADOS

### Documentos Word - Insumos Iniciales

| Documento | Razón de Archivo | Fecha |
|-----------|------------------|-------|
| Documento_Final.docx | Versión antigua del plan | 2026-01-28 |
| Documento_Profesional.docx | Documento de presentación inicial | 2026-01-28 |
| Documento_con_Diagramas.docx | Borrador con diagramas | 2026-01-28 |
| FORMULARIOS DE LEVANTAMIENTO...docx | Formularios de análisis | 2026-01-28 |

### Versiones Antiguas

| Documento | Reemplazado por | Fecha |
|-----------|-----------------|-------|
| plan detallado.docx | plan_detallado.md (en /docs/general/) | 2026-01-28 |
| 📋 ÍNDICE TÉCNICO*.docx (2 versiones) | ROADMAP + plan_detallado.md | 2026-01-28 |

### Scripts Desusados

| Documento | Estado | Fecha |
|-----------|--------|-------|
| convertidor.py | Funcionalidad integrada en backend | 2026-01-28 |
| convertidor_con_diagrama.py | Funcionalidad integrada en backend | 2026-01-28 |

### Configuración Obsoleta

| Documento | Reemplazado por | Fecha |
|-----------|-----------------|-------|
| .env.qa | Configs en /sGED-backend/config/ | 2026-01-28 |
| entrada.txt | Artefacto de prueba (sin valor) | 2026-01-28 |

---

## ✅ DOCUMENTACIÓN VIGENTE (Usar ESTA)

Todos los documentos vigentes están en `/docs/`:

- **General:** /docs/general/
- **Infraestructura:** /docs/infra/
- **QA:** /docs/qa/
- **Smoke Tests:** /docs/smoke-tests/
- **Fases:** /docs/fases/
- **Diagramas:** /docs/diagramas/

**Consulta INDICE_MAESTRO_DOCUMENTACION.md para navegar la documentación vigente.**

---

## 🔐 Política de Legacy

### Acceso
- ✅ Legibles por cualquier miembro del equipo (referencia)
- ❌ **NO MODIFICAR** (preservar estado histórico)
- ✅ Pueden ser copiados/referenciados con cita explícita

### Uso
- ❌ **NUNCA** para implementar cambios
- ❌ **NUNCA** como guía técnica
- ✅ Solo para entender contexto histórico

---

## 📝 Cómo Documentar Nuevos Archivos Legacy

Cuando un documento pase a obsoleto:

1. Mover a `/docs/legacy/` con sufijo `_LEGACY_YYYYMMDD`
2. Agregar fila en tabla anterior
3. Actualizar este README
4. Documentar en `/docs/INDICE_MAESTRO_DOCUMENTACION.md` que está deprecado

---

**Última actualización:** 2026-01-28  
**Responsable:** Agente de Documentación  
**Próxima revisión:** 2026-02-28
```

---

## 6. ARCHIVOS DUDOSOS CON OPCIONES A/B

### 6.1 `plantuml.jar` (Herramienta de Diagramas)

**Actual:** Ubicado en raíz del proyecto  
**Tamaño:** ~8 MB  
**Uso:** Conversión de .puml a .png

### Opción A: Mantener en `/docs/diagramas/`
```
Ubicación: /docs/diagramas/plantuml.jar
Razón: Es utilidad para generar diagramas (PNG desde PUML)
Ventaja: Centraliza todo lo relativo a diagramas
Desventaja: Binario grande en documentación
```

### Opción B: Mover a `/docs/legacy/`
```
Ubicación: /docs/legacy/plantuml.jar
Razón: Los diagramas ya están pre-generados (.png); .jar solo para edición
Ventaja: Documentación limpia
Desventaja: Si alguien quiere regenerar un diagrama, debe buscarlo
```

### Opción C: Mantener en Raíz (Actual)
```
Ubicación: C:\proyectos\oj\plantuml.jar
Razón: Se usa para build/generación de documentos
Ventaja: Acceso rápido para scripts CI/CD
Desventaja: Contamina raíz del proyecto
```

**RECOMENDACIÓN:** Opción A (mantener en `/docs/diagramas/` para mantener unidad)

---

### 6.2 `deploy-qa.sh` (Script QA)

**Actual:** Ubicado en raíz  
**Uso:** Deploy a QA (probablemente)  
**Estado:** ¿Aún en uso? ¿O reemplazado por CI/CD?

### Opción A: Mover a `/sGED-backend/scripts/deploy-qa.sh`
```
Ubicación: /sGED-backend/scripts/
Razón: Script de infraestructura/automatización
Ventaja: Junto a código backend donde se usa
Desventaja: No es documentación, es código
```

### Opción B: Mover a `/docs/infra/deploy-qa.sh`
```
Ubicación: /docs/infra/
Razón: Referencia operativa de cómo deployar
Ventaja: Accesible desde documentación
Desventaja: No es un documento ejecutable
```

### Opción C: Mover a `/docs/legacy/deploy-qa.sh`
```
Ubicación: /docs/legacy/
Razón: Si ya no se usa (reemplazado por CI/CD moderno)
Ventaja: Preserva referencia histórica
Desventaja: Pierde funcionalidad práctica
```

**RECOMENDACIÓN:** Depende de si sigue en uso. Si sigue: Opción A. Si no: Opción C.

**→ REQUIERE DECISIÓN DEL ORQUESTADOR**

---

### 6.3 `docker-compose-qa.yml` y `docker-compose-prod.yml`

**Actual:** Ubicado en raíz  
**Uso:** Compose files para orquestación  

### Opción A: Mantener en Raíz
```
Ubicación: C:\proyectos\oj\docker-compose-qa.yml (actual)
Razón: Archivos de configuración operativa (no documentación)
Ventaja: Fácil acceso para comandos docker-compose
```

### Opción B: Mover a `/docs/infra/`
```
Ubicación: /docs/infra/docker-compose-qa.yml
Razón: Documentación de configuración
Desventaja: No es lugar para ejecutables
```

**RECOMENDACIÓN:** Opción A. Estos NO son documentación, son configuración operativa. Mantenlos en raíz o en carpeta separada de config/.

---

---

## 7. CHECKLIST DE EJECUCIÓN

Una vez que el Orquestador apruebe este plan, ejecutar en orden:

### Pre-Migración
- [ ] Revisar y aprobar estructura en sección 1
- [ ] Confirmar decisiones en sección 6 (A/B)
- [ ] Crear copias de seguridad de archivos originales

### Migración de Archivos
- [ ] Copiar documentos general/ a /docs/general/
- [ ] Copiar documentos infra/ a /docs/infra/
- [ ] Copiar documentos qa/ a /docs/qa/
- [ ] Copiar documentos smoke-tests/ a /docs/smoke-tests/
- [ ] Copiar documentos fases/ a /docs/fases/
- [ ] Copiar diagramas a /docs/diagramas/
- [ ] Mover documentos legacy a /docs/legacy/

### Normalización
- [ ] Renombrar "plan detallado.md" → "plan_detallado.md"
- [ ] Agregar encabezados estándar a 48 documentos vigentes
- [ ] Actualizar referencias cruzadas (paths)

### Creación de Índices
- [ ] Crear/actualizar INDICE_MAESTRO_DOCUMENTACION.md
- [ ] Crear README_DIAGRAMAS.md (opcional pero recomendado)
- [ ] Crear README en cada carpeta principal

### Limpieza
- [ ] Verificar que raíz contiene SOLO carpetas principales
- [ ] Eliminar archivos duplicados/temporales
- [ ] Actualizar .gitignore si aplica

### Documentación Final
- [ ] Crear MIGRACION_COMPLETADA_YYYY-MM-DD.md
- [ ] Comunicar a team la nueva estructura
- [ ] Crear bookmark en README.md a /docs/INDICE_MAESTRO_DOCUMENTACION.md

---

**Preparado por:** Agente de Documentación  
**Versión:** 1.0.0  
**Fecha:** 28 enero 2026  
**Estado:** ✅ Listo para Ejecución por DevOps/Infraestructura
