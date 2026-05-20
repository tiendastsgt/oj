---
Documento: README_LEGACY
Proyecto: SGED
Tipo: Documentación de Archivo
Última actualización: 2026-05-19
Versión del documento: 1.6.0
Estado: ⚠️ Histórico (NO USAR)
---

# 📦 LEGACY - Documentos Históricos

**Versión:** 1.6.0  
**Última actualización:** 19 mayo 2026  
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
| `Documento_con_Diagramas.docx` | Borrador con diagramas iniciales | 2026-01-28 |
| `FORMULARIOS DE LEVANTAMIENTO DE INFORMACIÓN.docx` | Formularios de levantamiento completados | 2026-01-28 |
| `📋 ÍNDICE TÉCNICO.docx` | Índices v1 y v2 obsoletos | 2026-01-28 |
| `📋 ÍNDICE TÉCNICO ACTUALIZADO.docx` | Índices v1 y v2 obsoletos | 2026-01-28 |
| `PLAN DE TRABAJO DETALLADO industrial.docx` | Borrador industrial; información parcialmente desactualizada | 2026-01-28 |
| `plan detallado.docx` | Versión Word antigua | 2026-01-28 |
| `Carta de interés y disponibilidad..docx` | Documento administrativo externo | 2026-01-28 |

### Scripts y Utilidades Antiguas

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `convertidor.py` | Script de conversión desusado | 2026-01-28 |
| `convertidor_con_diagrama.py` | Funcionalidad integrada en backend | 2026-01-28 |
| `generar_propuesta_react_node_docx.py`| Script de propuesta descartada | 2026-04-11 |
| `humanize_roadmap.py` | Utilidad de formateo puntual | 2026-04-11 |
| `check_vps.py` | Script de inspección puntual | 2026-04-11 |

### Otros Archivos Archivados

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `.env.qa` | Configuración QA antigua | 2026-01-28 |
| `entrada.txt` | Archivo de prueba sin valor | 2026-01-28 |
| `check_vlogs.txt` | Log de verificación temporal | 2026-04-11 |
| `vps_inspection.txt` | Resultado de inspección temporal | 2026-04-11 |
| `PR_DOCS_AUTH_CLEANUP_SUMMARY.md` | Resumen de cleanup previo | 2026-04-11 |
| `PROPUESTA_ESTRUCTURA_DOCS.md` | Borrador de estructura de docs | 2026-04-11 |
| `PLAN_ACCION_REORGANIZACION_DOCS.md` | Plan de acción ejecutado hoy | 2026-04-11 |
| `bundle.zip` | Comprimido de despliegue antiguo | 2026-04-11 |
| `plan_detallado_v1.1_OBSOLETO_2026-04-11.md` | Versión v1.1 redundante; reemplazada por v1.2 con nueva arquitectura SP | 2026-04-11 |

### PlantUML Jar (Utilidad)

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `plantuml.jar` | Herramienta de utilidad; mantener aquí para referencia histórica | 2026-01-28 |

### Saneamiento y Curación Masiva (19 mayo 2026)

| Documento | Razón de Archivo | Fecha Archivado |
|-----------|-----------------|-----------------|
| `INDICE_MAESTRO_DOCUMENTACION_OBSOLETO_2026-05-19.md` | Supersedido por el portal unificado `docs/INDEX.md` | 2026-05-19 |
| `ROADMAP_PROYECTO_SGED_OBSOLETO_2026-05-19.md` | Histórico de roadmap; reemplazado por la planificación ágil | 2026-05-19 |
| `plan_detallado_OBSOLETO_2026-05-19.md` | Versión antigua de especificaciones; reemplazado por el portal unificado | 2026-05-19 |
| `STACK_TECNICO_ACTUALIZADO_OBSOLETO_2026-05-19.md` | Stack antiguo; reemplazado por la configuración de Angular 21 y Spring Boot 3.5 | 2026-05-19 |
| `MANUAL_DE_USUARIO_FINAL_OBSOLETO_2026-05-19.md` | Manual de usuario antiguo; reemplazado por el nuevo portal `/docs/usuarios/INDEX.md` | 2026-05-19 |
| `SEGURIDAD_AUTH_IMPLEMENTATION_OBSOLETO_2026-05-19.md` | Documentación antigua de seguridad; integrada en `/docs/desarrollo/05-seguridad.md` | 2026-05-19 |
| `.env_OBSOLETO_2026-05-19.qa` / `.github-prs-fases-1-2-3_OBSOLETO_2026-05-19.md` | Configuraciones y logs de PR obsoletos | 2026-05-19 |
| Otros archivos sueltos y `.docx` duplicados | Unificados o eliminados de la raíz para cumplir con el protocolo de ordenamiento | 2026-05-19 |

---

## 📚 Estructura de Archivos Vigentes (Referencia)

La documentación vigente y actualizada se encuentra en:

```
/docs
├── INDEX.md                     ← Portal unificado (punto de entrada principal)
├── PROTOCOLO_DOCUMENTACION.md   ← Protocolo y ciclo de vida de documentos
├── desarrollo/                  ← Manual técnico para desarrolladores
├── usuarios/                    ← Manual de usuario para funcionarios
├── operaciones/                 ← Guía de operaciones y despliegue (DevOps)
├── api/                         ← Referencia de API y OpenAPI Specs
├── auditorias/                  ← Reportes de calidad y auditorías UX/Código
├── smoke-tests/                 ← Planes y reportes de smoke testing
├── infra/                       ← Historial de guías operativas e infra
├── qa/                          ← Historial de reportes de calidad QA
└── fases/                       ← Historial y resúmenes de fases completadas
```

**Los documentos antiguos aquí en legacy/ ya NO aplican.**

---

## 🔄 Cómo Fue Archivado Este Contenido

### Proceso de Saneamiento (11 abril 2026)

1. **Limpieza de Raíz:** Se movieron todos los archivos sueltos de la raíz a sus carpetas correspondientes.
2. **Archivado de Scripts:** Scripts que no son de uso diario o son de borradores se movieron aquí.
3. **Preservación de Auditoría:** Planes de acción y reportes temporales se archivan para trazabilidad.

### Documentación Equivalente Vigente

Para cada documento legacy, aquí hay su equivalente vigente:

| Legacy | Reemplazado por |
|--------|-----------------|
| `Documento_Final.docx` | [plan_detallado.md](../general/plan_detallado.md) |
| `plan detallado.docx` | [plan_detallado.md](../general/plan_detallado.md) |
| `📋 ÍNDICE TÉCNICO*.docx` | [ROADMAP_PROYECTO_SGED.md](../general/ROADMAP_PROYECTO_SGED.md) + [STACK_TECNICO_ACTUALIZADO.md](../general/STACK_TECNICO_ACTUALIZADO.md) |
| `FORMULARIOS DE LEVANTAMIENTO...docx` | [STACK_TECNICO_ACTUALIZADO.md](../general/STACK_TECNICO_ACTUALIZADO.md) |
| `Documento_con_Diagramas.docx` | [Índice maestro → Diagramas](../INDICE_MAESTRO_DOCUMENTACION.md#diagramas) |

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
4. Consulta al equipo de documentación o a Arquitectura si no está claro

---

## Resumen

✅ **Legacy = Histórico, NO se usa para decisiones futuras**  
✅ **Vigente = Lo que está en /docs/, es la verdad actual**  
✅ **Para implementar = Siempre consultar /docs/**

---

**Último actualizado:** 19 mayo 2026  
**Responsable:** Agente de Documentación  
**Próxima revisión:** Continua (con cada ciclo de release)
