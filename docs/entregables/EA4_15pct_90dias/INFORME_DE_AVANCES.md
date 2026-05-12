# INFORME DE AVANCES — Entregable EA4 (15% — Día 90)

**Proyecto:** SGED — Sistema de Gestión de Expedientes Digitales  
**Entregable contractual:** EA4 — Despliegue, manuales y capacitación (15% del contrato)  
**Hito:** Día 90 desde firma del contrato  
**Versión plantilla:** 1.0.0  
**Estado:** 🚧 En progreso — Despliegue y Manuales completados, capacitación pendiente.  

---

## 1. Resumen ejecutivo

Este informe documenta el avance correspondiente al **Entregable EA4 (15%)**, previsto para el **Día 90** respecto a la fecha de firma del contrato. EA4 comprende el despliegue en entorno operativo, manual de usuario y manual técnico (rutas en `/docs`), y acta de capacitación con lista de asistentes (genérica o redactada sin datos sensibles), alineado al proyecto SGED vNext.

**Equipo responsable:**
- Amilcar Gil González (Arquitecto)
- Emilio González González (Senior Developer)
- Allan Gil González (Senior BE Developer)
- Alejandro (PM, valida calidad del producto)

---

## 2. Alcance del entregable EA4

| Ítem | Descripción | Referencia |
|------|-------------|------------|
| Despliegue en entorno operativo | Entregable desplegado y operativo | [EVIDENCIAS.md](./EVIDENCIAS.md#despliegue) |
| Manual de usuario | Ruta en `/docs` o equivalente | [EVIDENCIAS.md](./EVIDENCIAS.md#manuales) |
| Manual técnico | Ruta en `/docs` o equivalente | [EVIDENCIAS.md](./EVIDENCIAS.md#manuales) |
| Acta de capacitación | Plantilla y lista de asistentes (genérica) | [EVIDENCIAS.md](./EVIDENCIAS.md#capacitación) |

---

## 3. Estado por ítem

| Ítem | Estado | Observaciones |
|------|--------|---------------|
| Despliegue | [x] Completado | Desplegado en VPS 51.161.32.204 |
| Manual de usuario | [x] Publicado en /docs | MANUAL_DE_USUARIO_FINAL.md |
| Manual técnico | [x] Publicado en /docs | plan_detallado.md |
| Capacitación | [ ] Pendiente | Programar sesión con usuarios piloto |

---

## 4. Desvíos y observaciones

- **Despliegue Operativo:** El sistema se encuentra en línea y accesible mediante el puerto 8085 (frontend) y 8086 (backend).
- **Manuales:** Se entregaron versiones digitales actualizadas del Manual de Usuario y Manual Técnico integrados en el portal.
- **Capacitación:** Se está coordinando la fecha final con el PM para el cierre del hito.

---

## 5. Aprobación

| Rol | Nombre | Firma / Fecha |
|-----|--------|----------------|
| PM (calidad) | Alejandro | |
| Arquitecto | Amilcar Gil González | |

---

**Documentos de referencia:**
- [Manual de usuario final](../../general/MANUAL_DE_USUARIO_FINAL.md)
- [Plan de despliegue](../../infra/PLAN_DESPLIEGUE_PRODUCCION.md)
- [Guía de despliegue](../../infra/DEPLOYMENT_GUIDE.md)
- [Plan detallado](../../general/plan_detallado.md)
- [Roadmap SGED](../../general/ROADMAP_PROYECTO_SGED.md)
