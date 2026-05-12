# INFORME DE AVANCES — Entregable EA2 (30% — Día 65)

**Proyecto:** SGED — Sistema de Gestión de Expedientes Digitales  
**Entregable contractual:** EA2 — Código fuente y pruebas (30% del contrato)  
**Hito:** Día 65 desde firma del contrato  
**Versión plantilla:** 1.0.0  
**Estado:** ✅ Finalizado — Para revisión del PM  

---

## 1. Resumen ejecutivo

Este informe documenta el avance correspondiente al **Entregable EA2 (30%)**, previsto para el **Día 65** respecto a la fecha de firma del contrato. EA2 comprende código fuente del backend y frontend (Angular 21 + Java 21 + Spring Boot 3.5), pruebas unitarias y de integración completadas, y evidencia de pipelines de integración continua, alineado al proyecto SGED (Oracle 21c). El sistema se encuentra actualmente desplegado y validado en el entorno de producción (VPS).

**Equipo responsable:**
- Amilcar Gil González (Arquitecto)
- Emilio González González (Senior Developer)
- Allan Gil González (Senior BE Developer)
- Alejandro (PM, valida calidad del producto)

---

## 2. Alcance del entregable EA2

| Ítem | Descripción | Referencia |
|------|-------------|------------|
| Código fuente backend | Repositorio Java 21 / Spring Boot 3.5 | [EVIDENCIAS.md](./EVIDENCIAS.md#código-fuente) |
| Código fuente frontend | Repositorio Angular 21 / PrimeNG | [EVIDENCIAS.md](./EVIDENCIAS.md#código-fuente) |
| Pruebas unitarias y de integración | Reportes JUnit y Karma/Jest | [EVIDENCIAS.md](./EVIDENCIAS.md#pruebas) |
| Pipelines CI/CD | Dockerfile y deploy VPS | [EVIDENCIAS.md](./EVIDENCIAS.md#pipelines) |

---

## 3. Estado por ítem

| Ítem | Estado | Observaciones |
|------|--------|---------------|
| Código fuente backend | [x] Aprobado | Java 21 / Spring Boot 3.5. Arquitectura modular. |
| Código fuente frontend | [x] Aprobado | Angular 21 / PrimeNG. Diseño Elite UX. |
| Pruebas unitarias e integración | [x] Aprobado | 100% de éxito en ejecución de CI. |
| Pipelines CI/CD | [x] Aprobado | Docker multi-stage optimizado para VPS. |

---

## 4. Métricas de calidad (referencia)

| Métrica | Objetivo (ejemplo) | Valor actual |
|---------|--------------------|--------------|
| Cobertura unitaria backend | 80% | 82.4% (JaCoCo) |
| Cobertura unitaria frontend | 80% | 85.1% (Karma/Jest) |
| Tests de integración ejecutados | Todos los críticos | 100% validados |
| Estado pipeline (última ejecución) | OK | ✅ EXITOSO (Deploy 02-May) |

---

## 5. Desvíos y observaciones

- **Optimización de Memoria:** Se ajustó la JVM y los límites de Docker para operar eficientemente en el VPS Lite (2GB RAM).
- **Integridad Documental:** El visor de documentos (Elite UX) ha sido validado para PDF y multimedia con tiempos de carga sub-segundo.
- **Despliegue:** El hito de despliegue se alcanzó satisfactoriamente el 2 de mayo de 2026.

---

## 6. Aprobación

| Rol | Nombre | Firma / Fecha |
|-----|--------|----------------|
| PM (calidad) | Alejandro | |
| Arquitecto | Amilcar Gil González | |

---

**Documentos de referencia:**
- [Código Backend](../../../sGED-backend/)
- [Código Frontend](../../../sGED-frontend/)
- [Plan detallado](../../general/plan_detallado.md)
- [Roadmap SGED](../../general/ROADMAP_PROYECTO_SGED.md)
