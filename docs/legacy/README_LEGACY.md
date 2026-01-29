# 📦 LEGACY - Documentos Históricos

**Versión:** 1.0.0  
**Fecha de creación:** 28 enero 2026  
**Responsable:** Agente de Documentación  

---

## ⚠️ ADVERTENCIA IMPORTANTE

Esta carpeta contiene **documentos históricos y obsoletos** del proyecto SGED que:

1. ❌ **NO DEBEN** usarse para implementar cambios o decisiones futuras
2. ❌ **NO DEBEN** servir como referencia para desarrollo en v1.0.0 o superior
3. ✅ **PUEDEN** usarse como **referencia histórica** o contexto del proyecto
4. ✅ **SE MANTIENEN** solo por razones de auditoría y rastreabilidad

---

## 📋 Documentos Legacy

### Documentos Word Antiguos (Levantamiento Inicial)

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `Documento_Final.docx` | Versión antigua del plan técnico; reemplazado por plan_detallado.md | 2026-01-28 |
| `Documento_Profesional.docx` | Documento de presentación inicial; información obsoleta | 2026-01-28 |
| `Documento_con_Diagramas.docx` | Borrador con diagramas iniciales; reemplazado por archivos PNG/PlantUML | 2026-01-28 |
| `FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx` | Formularios de levantamiento completados; información histórica | 2026-01-28 |
| `📋 ÍNDICE TÉCNICO.docx` | Índice técnico v1; reemplazado por plan_detallado.md y ROADMAP | 2026-01-28 |
| `📋 ÍNDICE TÉCNICO ACTUALIZADO.docx` | Índice técnico v2; reemplazado por documentación en /docs | 2026-01-28 |
| `PLAN DE TRABAJO DETALLADO industrial.docx` | Borrador industrial; información parcialmente desactualizada | 2026-01-28 |
| `plan detallado.docx` | Versión Word antigua; reemplazada por plan detallado.md | 2026-01-28 |
| `Carta de interés y disponibilidad..docx` | Documento administrativo externo; no es documentación técnica | 2026-01-28 |

### Scripts y Utilidades Antiguas

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `convertidor.py` | Script de conversión de formato; ya no se usa en operación | 2026-01-28 |
| `convertidor_con_diagrama.py` | Versión mejorada del anterior; funcionalidad incluida en backend | 2026-01-28 |

### Archivos de Configuración Antiguos

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `.env.qa` | Configuración QA antigua; reemplazada por .env en /sGED-backend/config | 2026-01-28 |
| `entrada.txt` | Archivo de prueba; sin valor operacional | 2026-01-28 |

### PlantUML Jar (Utilidad)

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `plantuml.jar` | Herramienta de utilidad; mantener aquí para referencia histórica | 2026-01-28 |

---

## 📚 Estructura de Archivos Vigentes (Referencia)

La documentación vigente y actualizada se encuentra en:

```
/docs
├── general/                    ← Documentación central
├── infra/                      ← Guías de infraestructura
├── qa/                         ← Reportes y guías de QA
├── smoke-tests/                ← Planes de smoke testing
├── fases/                      ← Documentación por fase
├── diagramas/                  ← Diagramas vigentes (PNG/PlantUML)
├── INDICE_MAESTRO_DOCUMENTACION.md
└── PROTOCOLO_DOCUMENTACION.md
```

**Los documentos .docx antiguos aquí en legacy/ ya NO aplican.**

---

## 🔄 Cómo Fue Archivado Este Contenido

### Proceso de Migración (28 enero 2026)

1. **Análisis:** Se identificaron todos los documentos en raíz `/proyectos/oj`
2. **Clasificación:**
   - Vigentes → Movidos a `/docs/` en subcarpetas temáticas
   - Obsoletos → Movidos a `/docs/legacy/`
   - Sin valor → Descartados
3. **Conversión:** Documentos .docx se convirtieron a Markdown vigentes cuando aplicaba
4. **Protocolo:** Se definió `PROTOCOLO_DOCUMENTACION.md` para futuros cambios

### Documentación Equivalente Vigente

Para cada documento legacy, aquí hay su equivalente vigente:

| Legacy | Reemplazado por |
|--------|-----------------|
| `Documento_Final.docx` | [plan_detallado.md](../general/plan_detallado.md) |
| `plan detallado.docx` | [plan_detallado.md](../general/plan_detallado.md) |
| `📋 ÍNDICE TÉCNICO*.docx` | [ROADMAP_PROYECTO_SGED.md](../general/ROADMAP_PROYECTO_SGED.md) + [STACK_TECNICO_ACTUALIZADO.md](../general/STACK_TECNICO_ACTUALIZADO.md) |
| `FORMULARIOS DE LEVANTAMIENTO...docx` | [STACK_TECNICO_ACTUALIZADO.md](../general/STACK_TECNICO_ACTUALIZADO.md) |
| `Documento_con_Diagramas.docx` | [/docs/diagramas/](../diagramas/) |

---

## 🔐 Control de Acceso

Los documentos en `/docs/legacy/`:

- ✅ Legibles por cualquier miembro del equipo (referencia)
- ❌ **NO deben** ser modificados (preservar estado histórico)
- ✅ Pueden ser copiados/referenciados con cita explícita
- ❌ **NO deben** influir en decisiones futuras

---

## 📝 Cómo Documentar Nuevos Archivos Legacy

Cuando un documento pase a obsoleto en el futuro:

1. Mover a `/docs/legacy/` con sufijo `_OBSOLETO_YYYY-MM-DD`
2. Agregar fila en la tabla anterior con:
   - Nombre del documento
   - Razón de archivo
   - Fecha de archivado
3. Opcional: Actualizar este README con más contexto

**Ejemplo:**
```markdown
| `PLAN_SMOKE_TESTS_v0.9.0_OBSOLETO_2026-02-28.md` | Versión anterior; reemplazada por v1.0.0 | 2026-02-28 |
```

---

## 📞 Preguntas Sobre Legacy

Si tienes dudas sobre un documento legacy:

1. Consulta este README
2. Lee la cabecera del documento (si la tiene)
3. Verifica el documento vigente equivalente en `/docs/`
4. Pregunta al **Agente de Documentación** si no está claro

---

## Resumen

✅ **Legacy = Histórico, NO se usa para decisiones futuras**  
✅ **Vigente = Lo que está en /docs/, es la verdad actual**  
✅ **Para implementar = Siempre consultar /docs/**

---

**Último actualizado:** 28 enero 2026  
**Responsable:** Agente de Documentación  
**Próxima revisión:** 2026-02-28 (con cierre de Fase 7 formal)
