# 📋 PROTOCOLO DE DOCUMENTACIÓN - SGED

**Versión:** 1.0.0  
**Fecha de vigencia:** 28 enero 2026  
**Aplicable a:** SGED v1.0.0 y superior

---

## 1. ESTRUCTURA DE CARPETAS

La documentación se organiza en la carpeta `/docs` con la siguiente estructura:

```
/docs
├── general/              # Documentación central del proyecto
│   ├── plan_detallado.md
│   ├── ROADMAP_PROYECTO_SGED.md
│   └── STACK_TECNICO_ACTUALIZADO.md
├── infra/                # Guías de infraestructura, deploy, secretos
│   ├── NGINX_SECURITY_GUIDE.md
│   ├── SECRETS_MANAGEMENT.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── README_INFRAESTRUCTURA.md
│   ├── MONITOREO_OPERACIONES_PRODUCCION.md
│   ├── RUNBOOK_OPERACIONES_PRODUCCION.md
│   ├── PLAN_DESPLIEGUE_PRODUCCION.md
│   └── ROLLBACK_PLAN_PRODUCCION.md
├── qa/                   # Documentación de QA, validación, aceptación
│   ├── QA_ACCEPTANCE_REPORT.md
│   ├── GUIA_TRANSICION_ENTORNOS.md
│   └── VERIFICACION_RAPIDA_QA.md
├── smoke-tests/          # Planes, ejecutivos, templates de smoke testing
│   ├── PLAN_SMOKE_TESTS_PRODUCCION.md
│   ├── QUICK_START_SMOKE_TESTS.md
│   ├── INDICE_SMOKE_TESTS.md
│   ├── TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md
│   └── SMOKE_TESTS_RESUMEN_EJECUTIVO.md
├── fases/                # Documentación detallada por fase
│   ├── fase-1/           # (Vacío para versión 1.0; mantener para referencias futuras)
│   ├── fase-2/
│   ├── fase-3/
│   ├── fase-4/
│   ├── fase-5/
│   ├── fase-6/           # Infra y seguridad
│   │   ├── FASE_6_INFORME_EJECUTIVO.md
│   │   ├── FASE_6_CHECKLIST_VALIDACION.md
│   │   └── INDICE_FASE_6.md
│   └── fase-7/           # QA y release
│       ├── FASE_7_RESUMEN_IMPLEMENTACION.md
│       ├── FASE_7_QA_EXECUTION_GUIDE.md
│       └── INDICE_MAESTRO_FASE_6.md
├── diagramas/            # Diagramas PlantUML y PNG
│   ├── diagram_1.puml
│   ├── diagram_1.png
│   ├── diagram_2.puml
│   ├── diagram_2.png
│   └── ... (hasta diagram_6)
├── legacy/               # Documentos históricos/obsoletos
│   ├── README_LEGACY.md
│   ├── *.docx (antiguos)
│   └── convertidor.py
├── INDICE_MAESTRO_DOCUMENTACION.md
└── PROTOCOLO_DOCUMENTACION.md (este archivo)
```

---

## 2. PROTOCOLO DE NOMBRES

### 2.1 Convención General

```
[TIPO_][NOMBRE]_[CONTEXTO]_v[VERSIÓN]_[FECHA].md
```

**Componentes:**

- `[TIPO_]` (Opcional): Prefijo identificador
  - `PLAN_` = Planes operativos
  - `GUIA_` = Guías técnicas
  - `RESUMEN_` = Resúmenes ejecutivos
  - `INFORME_` = Reportes
  - `QUICK_` = Quick reference
  - `TEMPLATE_` = Plantillas
  - `INDICE_` = Índices
  - Si no hay prefijo, es documentación general

- `[NOMBRE]` = Descripción clara (máx 40 caracteres)
- `[CONTEXTO]` (Opcional): Contexto específico (ej: PRODUCCION, QA, FASE_7)
- `v[VERSIÓN]` (Opcional): Solo si hay múltiples versiones del documento
  - Formato: `v1.0.0`, `v1.1.0`, etc.
  - Incrementar cuando hay cambios significativos
- `[FECHA]` (Opcional): `YYYY-MM-DD` solo para documentos críticos o con fecha de obsolescencia

### 2.2 Ejemplos

| Documento | Nombre |
|-----------|--------|
| Plan de smoke tests (v1.0, vigente) | `PLAN_SMOKE_TESTS_PRODUCCION_v1.0.0.md` |
| Guía de transición de entornos | `GUIA_TRANSICION_ENTORNOS.md` |
| Quick start smoke tests | `QUICK_START_SMOKE_TESTS.md` |
| Resumen ejecutivo QA | `RESUMEN_EJECUTIVO_DESPLIEGUE_PROD.md` |
| Template de reporte smoke (v1.0, vigente hasta 2026-02-28) | `TEMPLATE_PROD_SMOKE_REPORT_v1.0.0_vigente-hasta-2026-02-28.md` |

### 2.3 Archivos sin Versionado

Los siguientes documentos **NO llevan versión en el nombre**, pero SÍ la llevan dentro:

- Documentación general (plan_detallado.md, ROADMAP_PROYECTO_SGED.md)
- Guías técnicas estables (NGINX_SECURITY_GUIDE.md)
- Documentos de referencia (README_INFRAESTRUCTURA.md)

---

## 3. CABECERA DE DOCUMENTOS

Todo documento vigente **DEBE** comenzar con esta cabecera:

```markdown
# [TÍTULO DEL DOCUMENTO]

**Versión:** X.Y.Z  
**Fecha de última actualización:** YYYY-MM-DD  
**Vigente para:** SGED vX.Y.Z o superior  
**Responsable:** [Team/Rol]  
**Estado:** ✅ Vigente | ⚠️ En revisión | 🔴 Obsoleto  

---

[Resto del contenido]
```

### 3.1 Explicación de Campos

| Campo | Valor | Notas |
|-------|-------|-------|
| `Versión` | X.Y.Z (Semver) | Incrementar si hay cambios sustanciales |
| `Fecha de última actualización` | YYYY-MM-DD | Siempre en UTC |
| `Vigente para` | vX.Y.Z o superior | Indicar qué versión de SGED aplica |
| `Responsable` | Team/Rol | Ej: "DevOps Team", "QA Lead", "Infraestructura" |
| `Estado` | ✅/⚠️/🔴 | Vigente, En revisión, u Obsoleto |

### 3.2 Ejemplo

```markdown
# PLAN DE SMOKE TESTS - PRODUCCIÓN

**Versión:** 1.0.0  
**Fecha de última actualización:** 2026-01-28  
**Vigente para:** SGED v1.0.0 y superior  
**Responsable:** QA Team  
**Estado:** ✅ Vigente  

---

## 1. Objetivo
...
```

---

## 4. DOCUMENTOS VIGENTES vs. OBSOLETOS

### 4.1 Criterios para Vigencia

Un documento es **VIGENTE** si:

1. Aplica a la versión actual de SGED (v1.0.0 actualmente)
2. Ha sido testeado/validado en ese entorno
3. No ha sido reemplazado por uno más nuevo
4. El team responsable lo mantiene activo

Un documento es **OBSOLETO** si:

1. Documenta una versión anterior (ej: v0.x.x)
2. Fue reemplazado por un documento más nuevo
3. El team responsable lo marca como "Deprecated"
4. Contiene instrucciones que ya no aplican

### 4.2 Transición a Obsoleto

Cuando un documento pasa a obsoleto:

1. **En el documento:** Cambiar `Estado: ⚠️ En revisión` → `🔴 Obsoleto`
2. **En la cabecera:** Agregar `Reemplazado por: [documento nuevo]`
3. **Mover:** A `/docs/legacy/` con un sufijo `_OBSOLETO_YYYY-MM-DD.md`
4. **Documentar:** En `/docs/legacy/README_LEGACY.md` la razón

### 4.3 Ejemplo de Transición

```markdown
# PLAN_DESPLIEGUE_PRODUCCION_OBSOLETO_2026-02-15.md

**Versión:** 1.0.0 (OBSOLETO)  
**Fecha de última actualización:** 2026-01-28  
**Marcado como obsoleto:** 2026-02-15  
**Reemplazado por:** [Nuevo documento si aplica]  
**Responsable:** DevOps Team  
**Estado:** 🔴 Obsoleto  

> ⚠️ **ADVERTENCIA:** Este documento es histórico. NO se debe usar para implementar cambios.
> Ver `/docs/legacy/README_LEGACY.md` para contexto.

---

[Contenido original...]
```

---

## 5. VERSIONADO SEMÁNTICO

Usar versionado semántico (MAJOR.MINOR.PATCH):

| Cambio | Incremento | Ejemplo |
|--------|-----------|---------|
| Cambios mayores, restructuraciones | MAJOR | v1.0.0 → v2.0.0 |
| Nuevas secciones, mejoras | MINOR | v1.0.0 → v1.1.0 |
| Correcciones, actualizaciones menores | PATCH | v1.0.0 → v1.0.1 |

**Regla:** Solo incrementar versión cuando se actualiza el nombre del archivo o cuando hay cambios muy sustanciales. En cambios menores, solo actualizar la fecha de "Fecha de última actualización" en la cabecera.

---

## 6. VIGENCIA Y CICLO DE VIDA

### 6.1 Período de Vigencia

**Documentos operativos (deployment, monitoring, runbooks):**
- Vigencia: Hasta que se reemplacen o deprecen
- Revisión: Cada 30 días o tras cambios mayores

**Documentos técnicos (arquitectura, diseño):**
- Vigencia: Hasta fin de vida de la versión
- Revisión: Trimestral

**Planes y reportes (QA, smoke tests):**
- Vigencia: Hasta que la fase se marque como "Completada y Cerrada"
- Archivado: En `/docs/fases/fase-X` con fecha de cierre

### 6.2 Cómo Marcar Fecha de Vigencia (Opcional)

Algunos documentos críticos pueden llevar fecha de expiración:

```markdown
**Vigente hasta:** YYYY-MM-DD
```

Ejemplo:
```markdown
**Vigencia:** 28 enero 2026 - 28 marzo 2026 (60 días desde despliegue)
```

---

## 7. REFERENCIAS CRUZADAS

Cuando un documento referencia otro:

**Formato:**
```markdown
Ver [Nombre documento](../ruta/documento.md)
```

**Ejemplos:**
```markdown
Para detalles de seguridad, ver [NGINX Security Guide](../infra/NGINX_SECURITY_GUIDE.md).
Para información de fases 1-5, consultar [Plan Detallado](../general/plan_detallado.md).
```

---

## 8. CHANGELOG INTERNO

Todo documento que sea versionado debe tener un CHANGELOG al final:

```markdown
## CHANGELOG

### v1.0.0 (2026-01-28)
- Versión inicial de producción
- Incluye todos los steps de smoke tests para v1.0.0

### v1.1.0 (Futuro)
- [Cambios cuando se release]
```

---

## 9. DOCUMENTOS ESPECIALES

### 9.1 README de Carpetas

Cada subcarpeta **puede** tener un `README.md` que índice sus contenidos:

```markdown
# INFRA - Documentación de Infraestructura

Esta carpeta contiene documentación de infraestructura, deployment, secretos y operaciones.

## Documentos

1. **DEPLOYMENT_GUIDE.md** - Cómo desplegar en QA/Prod
2. **NGINX_SECURITY_GUIDE.md** - Configuración de seguridad Nginx
3. **SECRETS_MANAGEMENT.md** - Manejo de secretos
4. **MONITOREO_OPERACIONES_PRODUCCION.md** - Monitoreo 24/7
...
```

### 9.2 INDICE_MAESTRO_DOCUMENTACION.md

Archivo central en `/docs/` que lista todos los documentos importantes. Ver sección 10.

---

## 10. TEMPLATES

### 10.1 Template de Documento Nuevo

```markdown
# [TÍTULO]

**Versión:** 1.0.0  
**Fecha de última actualización:** YYYY-MM-DD  
**Vigente para:** SGED vX.Y.Z o superior  
**Responsable:** [Team]  
**Estado:** ✅ Vigente  

---

## 1. Objetivo

[Descripción clara del propósito]

## 2. Contenido Principal

[Contenido...]

## CHANGELOG

### v1.0.0 (YYYY-MM-DD)
- Versión inicial

---

**Preparado por:** [Team]  
**Próxima revisión:** [Fecha aproximada]
```

---

## 11. CHECKLIST DE CUMPLIMIENTO

Antes de guardar un documento **NUEVO** en `/docs/`:

- [ ] Tiene cabecera con Versión, Fecha, Vigente para, Responsable, Estado
- [ ] Nombre sigue convención (sin caracteres especiales, sin espacios)
- [ ] Está en la carpeta correcta (general, infra, qa, etc.)
- [ ] Referencias a otros documentos usan rutas relativas correctas
- [ ] Contiene CHANGELOG si es versionado
- [ ] Es accesible desde INDICE_MAESTRO_DOCUMENTACION.md

---

## 12. MIGRACIÓN DE DOCUMENTOS EXISTENTES

Para documentos existentes que NO cumplan con este protocolo:

1. **Opción A: Actualizar a Protocolo**
   - Agregar cabecera normalizada
   - Renombrar según convención
   - Mover a carpeta correcta
   - Agregar al índice maestro

2. **Opción B: Archivar a Legacy**
   - Mover a `/docs/legacy/`
   - Agregar sufijo `_OBSOLETO_YYYY-MM-DD.md`
   - Documentar razón en `README_LEGACY.md`

3. **Opción C: Descartar**
   - Solo si no tiene valor histórico
   - Documentar decisión

---

## Contacto y Preguntas

Para dudas sobre este protocolo:
- **Agente de Documentación:** Equipo de Proyectos
- **Referencia:** Este documento (PROTOCOLO_DOCUMENTACION.md)

---

**Próxima revisión:** 2026-02-28  
**Responsable del mantenimiento:** Agente de Documentación
