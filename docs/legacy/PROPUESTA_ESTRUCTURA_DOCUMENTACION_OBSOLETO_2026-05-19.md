# 📐 PROPUESTA DE ESTRUCTURA DE DOCUMENTACIÓN - SGED

**Versión:** 1.0.0  
**Fecha:** 28 enero 2026  
**Responsable:** Agente de Documentación  
**Estado:** ✅ Listo para Implementación  

---

## 🎯 OBJETIVO

Normalizar la documentación del proyecto SGED en una estructura clara, versionada y fácil de navegar. Eliminar duplicados, marcar obsoletos, e implementar un protocolo de nombres y vigencia.

---

## 📊 ESTRUCTURA PROPUESTA

### Árbol de Carpetas Final

```
C:\proyectos\oj
│
├── docs/                          ← TODO aquí
│   │
│   ├── general/                   ← Documentación central del proyecto
│   │   ├── plan_detallado.md              (v1.0.0 | 28-ene-2026)
│   │   ├── ROADMAP_PROYECTO_SGED.md       (v1.0.0 | 28-ene-2026)
│   │   └── STACK_TECNICO_ACTUALIZADO.md   (v1.0.0 | 28-ene-2026)
│   │
│   ├── infra/                     ← Infraestructura, deployment, operaciones
│   │   ├── NGINX_SECURITY_GUIDE.md
│   │   ├── SECRETS_MANAGEMENT.md
│   │   ├── README_INFRAESTRUCTURA.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── PLAN_DESPLIEGUE_PRODUCCION.md
│   │   ├── ROLLBACK_PLAN_PRODUCCION.md
│   │   ├── MONITOREO_OPERACIONES_PRODUCCION.md
│   │   └── RUNBOOK_OPERACIONES_PRODUCCION.md
│   │
│   ├── qa/                        ← QA, validación, transición
│   │   ├── QA_ACCEPTANCE_REPORT.md
│   │   ├── GUIA_TRANSICION_ENTORNOS.md
│   │   └── VERIFICACION_RAPIDA_QA.md
│   │
│   ├── smoke-tests/               ← Smoke testing post-despliegue
│   │   ├── PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md
│   │   ├── QUICK_START_SMOKE_TESTS.md
│   │   ├── INDICE_SMOKE_TESTS.md
│   │   ├── TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md
│   │   └── SMOKE_TESTS_RESUMEN_EJECUTIVO.md
│   │
│   ├── fases/                     ← Documentación por fase
│   │   ├── fase-1/                (vacío para v1.0; referencias futuras)
│   │   ├── fase-2/
│   │   ├── fase-3/
│   │   ├── fase-4/
│   │   ├── fase-5/
│   │   ├── fase-6/
│   │   │   ├── FASE_6_INFORME_EJECUTIVO.md
│   │   │   ├── FASE_6_CHECKLIST_VALIDACION.md
│   │   │   └── INDICE_FASE_6.md
│   │   └── fase-7/
│   │       ├── FASE_7_RESUMEN_IMPLEMENTACION.md
│   │       ├── FASE_7_QA_EXECUTION_GUIDE.md
│   │       └── INDICE_MAESTRO_FASE_6.md
│   │
│   ├── diagramas/                 ← Diagramas PlantUML + PNG
│   │   ├── diagram_1.puml
│   │   ├── diagram_1.png
│   │   ├── diagram_2.puml
│   │   ├── diagram_2.png
│   │   ├── ... (hasta diagram_6)
│   │   └── plantuml.jar           (herramienta)
│   │
│   ├── legacy/                    ← Documentos históricos (NO USAR)
│   │   ├── README_LEGACY.md
│   │   ├── Documento_Final.docx
│   │   ├── Documento_Profesional.docx
│   │   ├── ... (resto de .docx antiguos)
│   │   ├── convertidor.py
│   │   └── convertidor_con_diagrama.py
│   │
│   ├── INDICE_MAESTRO_DOCUMENTACION.md    ← PUNTO DE ENTRADA
│   ├── PROTOCOLO_DOCUMENTACION.md         ← Reglas de nombres/vigencia
│   └── README.md                          ← (Opcional) guía rápida
│
├── sGED-backend/                  ← Proyecto backend (sin cambios)
├── sGED-frontend/                 ← Proyecto frontend (sin cambios)
├── nginx/                         ← Config Nginx (sin cambios)
├── auth-service/                  ← Servicio auth (sin cambios)
├── .github/                       ← Workflows (sin cambios)
│
├── oj.code-workspace              ← Workspace VS Code
├── docker-compose-qa.yml          ← Compose QA
├── docker-compose-prod.yml        ← Compose Prod
│
└── [archivos sueltos a LEGACY]   ← Todos los .docx, scripts viejos, etc.
```

### Resumen de Cambios

| Elemento | Acción | Destino |
|----------|--------|---------|
| `plan_detallado.md` | Copiar | `/docs/general/` |
| `ROADMAP_PROYECTO_SGED.md` | Copiar | `/docs/general/` |
| `STACK_TECNICO_ACTUALIZADO.md` | Copiar | `/docs/general/` |
| Guías infra (NGINX, SECRETS, etc.) | Copiar | `/docs/infra/` |
| QA_ACCEPTANCE_REPORT.md | Copiar | `/docs/qa/` |
| Guides de smoke tests | Copiar | `/docs/smoke-tests/` |
| Diagramas PNG/PUML | Copiar | `/docs/diagramas/` |
| Todos los .docx antiguos | **MOVER** | `/docs/legacy/` |
| convertidor.py, convertidor_con_diagrama.py | **MOVER** | `/docs/legacy/` |
| .env.qa, entrada.txt, etc. | **MOVER** | `/docs/legacy/` |

---

## 🏷️ PROTOCOLO DE NOMBRES

### Convención de Nombres

```
[TIPO_][NOMBRE]_[CONTEXTO]_v[VERSIÓN]_[FECHA].md
```

**Ejemplo:**
```
PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md              ✅ Nuevo archivo
TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md               ✅ Nuevo archivo
PLAN_DESPLIEGUE_PRODUCCION.md                      ✅ Sin versión (estable)
plan_detallado.md                                  ✅ Sin prefijo (documento central)
DOCUMENTO_ANTIGUO_OBSOLETO_2026-01-28.md           ✅ Archivo legacy
```

### Cabecera Obligatoria

Todo documento vigente debe tener esta cabecera:

```markdown
# [TÍTULO]

**Versión:** X.Y.Z  
**Fecha de última actualización:** YYYY-MM-DD  
**Vigente para:** SGED vX.Y.Z o superior  
**Responsable:** [Team/Rol]  
**Estado:** ✅ Vigente | ⚠️ En revisión | 🔴 Obsoleto  

---
[Resto del contenido]
```

**Campos obligatorios:**
- Versión (Semver)
- Fecha de última actualización (ISO)
- Vigente para (versión de SGED)
- Responsable (Team que mantiene)
- Estado (Vigente/En revisión/Obsoleto)

---

## 📋 DOCUMENTOS VIGENTES vs LEGACY

### Clasificación

**VIGENTES (Copiar a /docs/):**
- ✅ plan_detallado.md
- ✅ ROADMAP_PROYECTO_SGED.md
- ✅ STACK_TECNICO_ACTUALIZADO.md
- ✅ NGINX_SECURITY_GUIDE.md
- ✅ SECRETS_MANAGEMENT.md
- ✅ DEPLOYMENT_GUIDE.md
- ✅ QA_ACCEPTANCE_REPORT.md
- ✅ PLAN_SMOKE_TESTS_PRODUCCION.md
- ✅ MONITOREO_OPERACIONES_PRODUCCION.md
- ✅ RUNBOOK_OPERACIONES_PRODUCCION.md
- ✅ PLAN_DESPLIEGUE_PRODUCCION.md
- ✅ ROLLBACK_PLAN_PRODUCCION.md
- ✅ Todos los FASE_6_*.md, FASE_7_*.md
- ✅ INDICE_*.md (fase 6-7)
- ✅ diagram_*.puml, diagram_*.png

**OBSOLETOS/LEGACY (Mover a /docs/legacy/):**
- ❌ Documento_Final.docx
- ❌ Documento_Profesional.docx
- ❌ Documento_con_Diagramas.docx
- ❌ FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx
- ❌ 📋 ÍNDICE TÉCNICO*.docx (ambas)
- ❌ PLAN DE TRABAJO DETALLADO industrial.docx
- ❌ plan detallado.docx (versión antigua)
- ❌ Carta de interés y disponibilidad..docx
- ❌ convertidor.py
- ❌ convertidor_con_diagrama.py
- ❌ .env.qa (reemplazado por configs en backend)
- ❌ entrada.txt

**SIN CLASIFICAR / A DECIDIR:**
- `deploy-qa.sh` → ¿Mover a legacy? (si está desusado) o ¿guardar en sGED-backend/scripts/?
- `plantuml.jar` → Mantener en `/docs/diagramas/` como utilidad

---

## 🔄 PLAN DE MIGRACIÓN

### Fase 1: Preparación (Paso 0)
✅ **COMPLETADO**
- [x] Crear estructura de carpetas (/docs/* carpetas)
- [x] Crear PROTOCOLO_DOCUMENTACION.md
- [x] Crear README_LEGACY.md
- [x] Crear INDICE_MAESTRO_DOCUMENTACION.md

### Fase 2: Migración de Documentos Vigentes

**Paso 1: Copiar documentos de general/ a /docs/general/**
```bash
cp plan\ detallado.md /docs/general/
cp ROADMAP_PROYECTO_SGED.md /docs/general/
cp STACK_TECNICO_ACTUALIZADO.md /docs/general/
```

**Paso 2: Copiar documentos infra/ a /docs/infra/**
```bash
cp NGINX_SECURITY_GUIDE.md /docs/infra/
cp SECRETS_MANAGEMENT.md /docs/infra/
cp DEPLOYMENT_GUIDE.md /docs/infra/
cp PLAN_DESPLIEGUE_PRODUCCION.md /docs/infra/
cp ROLLBACK_PLAN_PRODUCCION.md /docs/infra/
cp RUNBOOK_OPERACIONES_PRODUCCION.md /docs/infra/
cp MONITOREO_OPERACIONES_PRODUCCION.md /docs/infra/
cp README_INFRAESTRUCTURA.md /docs/infra/
```

**Paso 3: Copiar documentos qa/ a /docs/qa/**
```bash
cp QA_ACCEPTANCE_REPORT.md /docs/qa/
cp GUIA_TRANSICION_ENTORNOS.md /docs/qa/
cp VERIFICACION_RAPIDA_QA.md /docs/qa/
```

**Paso 4: Copiar documentos smoke-tests/ a /docs/smoke-tests/**
```bash
cp PLAN_SMOKE_TESTS_PRODUCCION.md /docs/smoke-tests/
cp QUICK_START_SMOKE_TESTS.md /docs/smoke-tests/
cp INDICE_SMOKE_TESTS.md /docs/smoke-tests/
cp TEMPLATE_PROD_SMOKE_REPORT.md /docs/smoke-tests/
cp SMOKE_TESTS_RESUMEN_EJECUTIVO.md /docs/smoke-tests/
```

**Paso 5: Copiar documentos fases/ a /docs/fases/**
```bash
cp FASE_6_*.md /docs/fases/fase-6/
cp INDICE_FASE_6.md /docs/fases/fase-6/
cp FASE_7_*.md /docs/fases/fase-7/
cp INDICE_MAESTRO_FASE_6.md /docs/fases/fase-7/
```

**Paso 6: Copiar diagramas a /docs/diagramas/**
```bash
cp diagram_*.puml /docs/diagramas/
cp diagram_*.png /docs/diagramas/
cp plantuml.jar /docs/diagramas/
```

### Fase 3: Migración a Legacy

**Paso 7: Mover documentos obsoletos a /docs/legacy/**
```bash
mv *.docx /docs/legacy/
mv convertidor.py /docs/legacy/
mv convertidor_con_diagrama.py /docs/legacy/
mv .env.qa /docs/legacy/
mv entrada.txt /docs/legacy/
```

### Fase 4: Actualización de Referencias

**Paso 8: Actualizar referencias cruzadas en documentos nuevos**

- En plan_detallado.md: Cambiar referencias de rutas relativas
- En ROADMAP_PROYECTO_SGED.md: Actualizar referencias
- En README raíz: Apuntar a `/docs/INDICE_MAESTRO_DOCUMENTACION.md`

Ejemplo:
```markdown
# Antes
Ver [NGINX Security](./NGINX_SECURITY_GUIDE.md)

# Después
Ver [NGINX Security](./docs/infra/NGINX_SECURITY_GUIDE.md)
```

### Fase 5: Limpieza de Raíz

**Paso 9: Verificar raíz limpia**

Después de migración, la raíz debe contener SOLO:
```
C:\proyectos\oj
├── docs/                  ← TODO aquí
├── sGED-backend/
├── sGED-frontend/
├── nginx/
├── auth-service/
├── .github/
├── .vscode/
├── venv/
├── oj.code-workspace
├── docker-compose-qa.yml
├── docker-compose-prod.yml
└── README.md              ← (Nuevo) Apunta a docs/
```

### Fase 6: Documentar Cambios

**Paso 10: Crear resumen de migración**

Crear archivo: `/docs/MIGRACION_COMPLETADA_2026-01-28.md` con:
- Qué se movió dónde
- Referencias actualizadas
- Cómo usar la nueva estructura

---

## 📊 TABLA DE CONTENIDOS PROPUESTA

**INDICE_MAESTRO_DOCUMENTACION.md:**

- General
  - plan_detallado.md
  - ROADMAP_PROYECTO_SGED.md
  - STACK_TECNICO_ACTUALIZADO.md
- Infraestructura
  - NGINX_SECURITY_GUIDE.md
  - SECRETS_MANAGEMENT.md
  - DEPLOYMENT_GUIDE.md
  - PLAN_DESPLIEGUE_PRODUCCION.md
  - ROLLBACK_PLAN_PRODUCCION.md
  - MONITOREO_OPERACIONES_PRODUCCION.md
  - RUNBOOK_OPERACIONES_PRODUCCION.md
- QA y Validación
  - QA_ACCEPTANCE_REPORT.md
  - GUIA_TRANSICION_ENTORNOS.md
- Smoke Tests
  - PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md
  - QUICK_START_SMOKE_TESTS.md
  - TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md
- Fases
  - Fase 6 (Infra)
  - Fase 7 (QA + Release)
- Diagramas
  - diagram_*.puml / diagram_*.png
- Legacy
  - README_LEGACY.md + documentos archivados

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-Migración
- [x] Crear carpetas /docs/
- [x] Crear PROTOCOLO_DOCUMENTACION.md
- [x] Crear README_LEGACY.md
- [x] Crear INDICE_MAESTRO_DOCUMENTACION.md

### Migración (Por hacer)
- [ ] Copiar documentos vigentes a /docs/
- [ ] Mover documentos legacy a /docs/legacy/
- [ ] Actualizar cabeceras de documentos (Versión, Fecha, Estado)
- [ ] Actualizar referencias cruzadas en documentos
- [ ] Crear/actualizar README.md en raíz

### Post-Migración
- [ ] Verificar que raíz está limpia
- [ ] Verificar que todos los enlaces funcionan
- [ ] Documentar en ROADMAP_PROYECTO_SGED.md que estructura está normalizada
- [ ] Comunicar a team la nueva estructura

---

## 📞 NOTAS IMPORTANTES

### Vigencia de Documentos

1. **plan_detallado.md, ROADMAP_PROYECTO_SGED.md:** Documentos "vivos" que se actualizan con cada fase. Mantener en `/docs/general/`
2. **Guías operativas (deployment, monitoring, rollback):** Vigentes para v1.0.0+. Revisar cada 30 días.
3. **Reportes de Fase (6-7):** Vigentes hasta cierre formal de fase. Luego archivar con timestamp.
4. **Legacy:** Nunca tocar. Solo referencia histórica.

### Cómo Mantener Esto

- **Agente de Documentación:** Responsable de mantener INDICE_MAESTRO_DOCUMENTACION.md actualizado
- **Cada Team:** Responsable de mantener su documentación en /docs/ (infra, qa, smoke-tests)
- **Orquestador:** Revisa INDICE_MAESTRO_DOCUMENTACION.md para ver estado

### Próximas Tareas

Después de esta normalización:

1. Documentar en ROADMAP que "Documentación normalizada" ✅
2. Comunicar estructura a team
3. Capacitar en protocolo de nombres/vigencia
4. Revisar cada 2 semanas durante primeros 30 días de producción

---

## 🎉 BENEFICIOS

✅ **Navegabilidad:** Un archivo (INDICE_MAESTRO) apunta a todo  
✅ **Versionado:** Todos los docs con versión clara en cabecera  
✅ **Fechado:** Saber cuándo se actualiza cada doc  
✅ **Limpieza:** Raíz del proyecto sin clutter documentación  
✅ **Legacy claro:** Histórico sin contaminar vigentes  
✅ **Fácil mantenimiento:** Protocolo claro para nuevos docs  
✅ **Apto producción:** Documentación profesional y organizada  

---

**Preparado por:** Agente de Documentación  
**Fecha:** 28 enero 2026  
**Estado:** ✅ Listo para implementación  
**Próximo paso:** Migración de documentos a /docs/
