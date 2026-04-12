# Reporte de Curación: Des-IAficar plan_detallado y ROADMAP

**Fecha:** 30 enero 2026  
**Alcance:** `docs/general/plan_detallado.md`, `docs/general/ROADMAP_PROYECTO_SGED.md`  
**Objetivo:** Eliminar referencias a IA, agentes, Cursor, Copilot, orquestador, prompts; tono profesional humano.

---

## 1. Lista de hallazgos (ubicación y tipo)

### plan_detallado.md

| Ubicación aproximada | Hallazgo | Acción |
|----------------------|----------|--------|
| Tabla 1.5 (Herramientas de apoyo) | "Cursor AI, agentes de IA" | Reemplazado por "IDE (VS Code u otro), Postman, Git" |
| Tabla 1.6.5 (Herramientas de desarrollo) | "VS Code / Cursor \| IDE con IA" | Reemplazado por "IDE (VS Code u otro) \| Desarrollo y depuración" |
| Tabla 1.7 Resumen Ejecutivo | "Desarrollador \| 1 persona + IA" | Reemplazado por "Equipo (Arquitectura + Desarrollo)" |
| Cálculo productividad (Sección 3) | "Productividad estimada (1 dev + IA)" | Reemplazado por "Productividad estimada: ~3-4 puntos/día por desarrollador" |
| Diagrama capa Application | "Orquestación de operaciones" | Reemplazado por "Coordinación de operaciones" |
| Tabla infra (Docker Compose) | "Orquestación" como propósito | Reemplazado por "Coordinación de contenedores" |

### ROADMAP_PROYECTO_SGED.md

| Ubicación aproximada | Hallazgo | Acción |
|----------------------|----------|--------|
| Regla ORO (Documentos de Referencia) | "agente REPORTA al orquestador" / "orquestador DECIDE" | Reescrito como política: quien detecta registra incidencia; Arquitectura/PM decide y documenta |
| Fase 0 objetivo | "para que agentes trabajen alineados" | "para que el equipo trabaje alineado" |
| Tarea 0.1 | Título "Orquestador & Gobierno"; Responsable Orquestador; reglas con "cualquier agente" / "orquestador" | Título "Gobierno del Proyecto"; Responsable PM/Arquitecto; reglas con "se detecta discrepancia" e "incidencia por Arquitectura/PM" |
| Todas las tareas | "Responsable: **Agente Backend/Frontend/Infra/Documentación/Testing**" | Sustituido por roles humanos: Backend (Allan Gil / Emilio González), Frontend (Emilio González), Infraestructura/DevOps, Documentación (equipo), QA/Testing |
| Tabla Estado por Fase | "Cimientos / Orquestación" | "Cimientos / Alineación" |
| Sección 5 completa | "Cómo Usar Este Roadmap con Los Agentes"; "Comunicación Orquestador y Agentes"; "Estructura de prompts"; "PROMPT AGENTE"; "Si un agente detecta"; "AGENTE REPORTA / ORQUESTADOR DECIDE"; "Ejemplo Completo: Prompt Fase 1" | Sustituida por "Uso del Roadmap y Resolución de Conflictos": asignación de tareas, documentos de referencia, resolución de conflictos (registro incidencia → Arquitectura/PM decide → documentar), ejemplo de criterios sin prompts |
| Matriz responsables (Sección 6) | "Agente Primario / Agente Soporte"; "Orquestador" | "Responsable primario / Soporte"; "PM / Arquitectura" o "PM" |
| Sección 8 (Cambios y versionado) | "Ser decidido por el Orquestador"; "comunicado a todos los agentes"; Histórico "Orquestador" | "PM o Arquitectura"; "al equipo"; "Equipo SGED" |
| ANEXO A Checklist | "Orquestador confirma"; "Todos los agentes revisar" | "PM / Arquitectura confirman"; "Todo el equipo revisa" |
| ANEXO B Contacto | "Orquestador: [Nombre/Email]" | "PM (Alejandro); Arquitecto (Amilcar Gil)" con descripción de roles |

---

## 2. Cambios realizados (resumen)

- **plan_detallado.md:** 6 ediciones (4 referencias IA/Cursor/agentes, 2 orquestación en contexto técnico reescritas como coordinación).
- **ROADMAP_PROYECTO_SGED.md:** Regla ORO, Fase 0, Tarea 0.1, todos los "Responsable: Agente X", tabla de fases, sección 5 completa reescrita, matriz de responsables, versionado, checklist, contacto. Ningún "prompt" ni "orquestador" ni "agente" en sentido de agente de IA.
- **docs/legacy/README_LEGACY.md:** "Agente de Documentación" → "Equipo de Documentación"; entrada de `Documento_con_Diagramas.docx` ampliada indicando que es histórico y que la versión vigente está en `/docs/diagramas/` y `/docs/general/`.

Conteo aproximado de referencias eliminadas o reemplazadas: **~25** en ROADMAP, **6** en plan_detallado.

---

## 3. Antes / Después (fragmentos representativos)

### plan_detallado.md

**Antes:**  
`| Herramientas de apoyo | Cursor AI, agentes de IA |`  
**Después:**  
`| Herramientas de apoyo | IDE (VS Code u otro), Postman, Git |`

**Antes:**  
`| Desarrollador | 1 persona + IA |`  
**Después:**  
`| Desarrollador | Equipo (Arquitectura + Desarrollo) |`

**Antes:**  
`Productividad estimada (1 dev + IA): ~3-4 puntos/día`  
**Después:**  
`Productividad estimada: ~3-4 puntos/día por desarrollador`

### ROADMAP_PROYECTO_SGED.md

**Antes:**  
- El **agente** REPORTA al **orquestador** inmediatamente  
- El **orquestador** DECIDE y DOCUMENTA la resolución  

**Después:**  
- Quien detecte la discrepancia **registra una incidencia** y la eleva a Arquitectura/PM.  
- **Arquitectura o PM** decide y documenta la resolución.  

**Antes:**  
Responsable: **Agente Backend**  
**Después:**  
Responsable: **Backend (Allan Gil / Emilio González)**

**Antes:**  
Sección 5: "Cómo Usar Este Roadmap con Los Agentes", "Estructura de prompts del Orquestador", "PROMPT AGENTE [NOMBRE]", "Si un agente detecta inconsistencia", "AGENTE REPORTA / ORQUESTADOR DECIDE".  

**Después:**  
Sección 5: "Uso del Roadmap y Resolución de Conflictos" — asignación de tareas, documentos de referencia, resolución de conflictos (incidencia → decisión Arquitectura/PM → documentación), ejemplo de criterios para una tarea sin prompts ni agentes.

---

## 4. Validación final (búsqueda textual)

Búsqueda en **plan_detallado.md** y **ROADMAP_PROYECTO_SGED.md** de:

- `IA`, `Cursor`, `Copilot`, `prompt`, `agente`, `orquest`, `ChatGPT`

**Resultado:** **0 coincidencias** en ambos archivos.

Nota: La palabra "modelo" aparece solo en contexto de **modelo de datos** (término técnico), no referido a modelos de IA; no se modificó.

---

## 5. Checklist de cumplimiento

- [x] Sin referencias a IA, Cursor, Copilot, agentes (de IA), orquestador, prompts, ChatGPT en los dos documentos principales.
- [x] Tono y estilo profesional (políticas del proyecto, roles humanos, Arquitectura/PM/equipo).
- [x] Coherencia con stack real (Java 21, Spring Boot 3.5, Oracle, Angular 21; auth en backend Java).
- [x] Estructura y numeración conservadas; significado técnico sin alterar.
- [x] Autores/equipo reflejados donde aplica: Amilcar (Arquitecto), Emilio, Allan (Backend), Alejandro (PM).

---

## 6. Documento_con_Diagramas.docx (opcional)

**Recomendación:** **Mantener como legacy** (no actualizar).

**Justificación breve:**  
- En `docs/legacy/README_LEGACY.md` ya figura como documento archivado y se indica que la versión vigente de diagramas está en `/docs/diagramas/` (PlantUML y PNG) y la documentación en `/docs/general/`.  
- No hay indicación de que sea un entregable contractual que deba mantenerse al día.  
- Regenerarlo (exportar PlantUML → PNG, insertar en Word, versionar) requiere tooling y proceso explícito; solo debe hacerse si hay aprobación explícita y requisito contractual.

Se actualizó la fila de `Documento_con_Diagramas.docx` en README_LEGACY para dejar claro que es histórico y que la referencia vigente es `/docs/diagramas/` y `/docs/general/`.

---

**Preparado por:** Curador de documentación SGED (revisión humana).  
**Próxima revisión:** Según PROTOCOLO_DOCUMENTACION.md.
