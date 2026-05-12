# INFORME DE AVANCES — Entregable EA1 (20% — Día 35)

**Proyecto:** SGED — Sistema de Gestión de Expedientes Digitales  
**Entregable contractual:** EA1 — Documentación (20% del contrato)  
**Hito:** Día 35 desde firma del contrato  
**Versión plantilla:** 1.0.0  
**Estado:** ✅ Finalizado — Para revisión del PM  

---

## 1. Resumen ejecutivo

Este informe documenta el avance correspondiente al **Entregable EA1 (20%)**, previsto para el **Día 35** respecto a la fecha de firma del contrato. EA1 comprende la documentación de arquitectura, modelos de datos, prototipos y especificaciones técnicas aprobadas, alineadas al proyecto SGED (Angular 21 + Java 21 + Oracle 21c). La base documental se encuentra centralizada en el Portal de Documentación Unificado.

**Equipo responsable de la documentación:**
- Amilcar Gil González (Arquitecto)
- Emilio González González (Senior Developer)
- Allan Gil González (Senior BE Developer)
- Alejandro (PM, valida calidad del producto)

---

## 2. Alcance del entregable EA1

| Ítem | Descripción | Referencia |
|------|-------------|------------|
| Arquitectura | Documento de arquitectura y diagramas de referencia | [EVIDENCIAS.md](./EVIDENCIAS.md#arquitectura) |
| Modelos de datos | Esquema Oracle y migraciones (Flyway o equivalente) | [EVIDENCIAS.md](./EVIDENCIAS.md#modelos-de-datos) |
| Prototipos | Prototipos UX / wireframes (si aplica) | [EVIDENCIAS.md](./EVIDENCIAS.md#prototipos) |
| Especificaciones técnicas | Plan detallado, stack y decisiones de diseño aprobadas | [EVIDENCIAS.md](./EVIDENCIAS.md#especificaciones-técnicas) |

---

## 3. Estado por ítem

| Ítem | Estado | Observaciones |
|------|--------|---------------|
| Arquitectura | [x] Aprobado | Arquitectura de microservicios stateless con JWT. |
| Modelos de datos | [x] Aprobado | Esquema Oracle 21c validado y versionado. |
| Prototipos | [x] Aprobado | Diseño Elite UX (Dark Mode) validado por Auditoría. |
| Especificaciones técnicas | [x] Aprobado | Plan Detallado v1.2 y Roadmap de 10 Sprints. |

---

## 4. Desvíos y observaciones

- **Evolución de Arquitectura:** Se realizó una transición exitosa hacia una arquitectura de procedimientos almacenados (SP) y DB Links para asegurar la resiliencia de datos.
- **Elite UX Design System:** Se definió un sistema de diseño premium que prioriza la legibilidad y el rendimiento en el visor documental.
- **Auditoría de Seguridad:** Se incluyeron los lineamientos de hardening desde la fase de diseño inicial.

---

## 5. Aprobación

| Rol | Nombre | Firma / Fecha |
|-----|--------|----------------|
| PM (calidad) | Alejandro | |
| Arquitecto | Amilcar Gil González | |

---

**Documentos de referencia (no duplicar contenido):**
- [Plan detallado](../../general/plan_detallado.md)
- [Roadmap SGED](../../general/ROADMAP_PROYECTO_SGED.md)
- [Stack técnico](../../general/STACK_TECNICO_ACTUALIZADO.md)
- [Diagramas](../../diagramas/)
