# Reporte de cambios — Documento comercial SGED (Documento_con_Diagramas.docx)

**Fecha:** 30 enero 2026  
**Documento actualizado:** `docs/Documento_con_Diagramas.docx`  
**Propósito:** Presentación comercial del proyecto SGED para contratación (audiencia ejecutiva y técnica).

---

## 1. Resumen de cambios realizados

### 1.1 Ubicación del entregable

- **Documento actualizado:** `docs/Documento_con_Diagramas.docx` (ubicación oficial dentro de `/docs`).
- El documento se generó/actualizó a partir de las fuentes de verdad indicadas y se guardó en la carpeta de documentación del proyecto.

### 1.2 Contenido del documento

- **Portada:** Título SGED, subtítulo “Documento de presentación comercial — v1.0.0 en producción”, fecha enero 2026.
- **Sección 1 — Resumen ejecutivo:** Valor del sistema, estado en producción, consistencia con documentación y stack real.
- **Sección 2 — Contexto y valor de negocio:** Situación del OJ, beneficios (gestión centralizada, documentos multimedia, búsqueda, trazabilidad, seguridad).
- **Sección 3 — Funcionalidades incluidas (v1.0.0):** Listado F01–F10 basado en plan detallado y roadmap (expedientes, documentos, visores, búsqueda, SGT, RBAC, auditoría, impresión).
- **Sección 4 — Stack técnico:** Angular 21, Spring Boot 3.5, Java 21, Oracle 19c, Docker, NGINX (según STACK_TECNICO_ACTUALIZADO.md).
- **Sección 5 — Seguridad y trazabilidad:** JWT 8h, BCrypt, bloqueo 5 intentos, auditoría inmutable, endurecimiento, resultados QA (0 vulnerabilidades críticas/altas).
- **Sección 6 — Aseguramiento de calidad y estado en producción:** Resumen de QA (E2E F1–F6, rendimiento P95/P99, concurrencia, conclusión “Apto para producción”).
- **Sección 7 — Diagramas de arquitectura y flujo:** Inclusión de los seis diagramas vigentes de `docs/diagramas/` (diagram_1.png a diagram_6.png) con leyendas: arquitectura de capas, flujo de interacción, flujo de autenticación, pirámide de pruebas, despliegue, checklist post-despliegue.
- **Sección 8 — Equipo del proyecto:** Amilcar Gil González (Arquitecto), Emilio González González (Senior Developer), Allan Gil González (Senior BE Developer), Alejandro (PM — validación de calidad del producto).

### 1.3 Fuentes utilizadas

- `docs/general/plan_detallado.md` (contexto, alcance, funcionalidades, restricciones).
- `docs/general/ROADMAP_PROYECTO_SGED.md` (estado por fase, stack, QA Fase 7).
- `docs/general/STACK_TECNICO_ACTUALIZADO.md` (versiones frontend/backend/BD/infra).
- `docs/qa/QA_ACCEPTANCE_REPORT.md` (resultados E2E, carga, seguridad, conclusión).
- `docs/diagramas/*.png` (diagramas actuales).
- `README.md` (resumen general y estado v1.0.0).

### 1.4 Estilo y audiencia

- Redacción en español, tono profesional y coherente.
- Audiencia mixta: ejecutiva y técnica.
- Énfasis en valor, seguridad, trazabilidad, operación y estado “en producción”.

---

## 2. Verificación: ausencia de referencias internas

Se ha comprobado que el documento **no contiene**:

- Referencias a IA, Cursor, Copilot, ChatGPT ni herramientas de asistencia por IA.
- Referencias a “prompts”, “agentes” (en sentido de agentes de IA), “orquestador”.
- Rutas locales (por ejemplo `C:\`, `/home/`, rutas de desarrollo).
- URLs internas privadas, IPs internas, tokens ni credenciales.
- Nombres de entornos internos (por ejemplo dominios .local) ni secretos.

El documento **sí incluye**:

- Versión del sistema (v1.0.0) y estado “en producción”.
- Stack y funcionalidades alineados con la documentación oficial y el estado real del sistema.
- Diagramas vigentes ubicados en `docs/diagramas/` (incorporados como imágenes en el .docx).
- Equipo del proyecto según la lista indicada (Arquitecto, Senior Developer, Senior BE Developer, PM).

---

## 3. Nota sobre capturas de interfaz (UI)

El documento incluye los diagramas de arquitectura y flujo desde `docs/diagramas/`. No se han incorporado capturas de pantalla de la interfaz de usuario (pantallas de login, listados, visores, etc.) por no estar disponibles en el repositorio. Si se desea reforzar la presentación comercial, se recomienda añadir manualmente capturas de pantalla representativas (por ejemplo: login, listado de expedientes, detalle de expediente, visor de documentos, pantalla de auditoría) en una futura edición del mismo documento.

---

## 4. Herramienta de generación

- Script utilizado: `docs/build_documento_comercial.py` (Python 3 + python-docx).
- Uso: desde la raíz del proyecto, `python docs/build_documento_comercial.py` (o desde `docs/`: `python build_documento_comercial.py`). Regenera `docs/Documento_con_Diagramas.docx` a partir del contenido definido en el script y de las imágenes en `docs/diagramas/`.

---

**Responsable del reporte:** Equipo de documentación del proyecto SGED.  
**Estado:** Completado — documento listo para uso en presentación comercial.
