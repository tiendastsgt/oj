# CHECKLIST DE VALIDACIÓN — Entregable EA2 (30% — Día 65)

**Proyecto:** SGED  
**Entregable:** EA2 — Código fuente y pruebas  
**Hito:** Día 65  
**Versión plantilla:** 1.0.0  
**Validador de calidad:** Alejandro (PM)  

---

## Criterios de aprobación

Completar antes de dar por cerrado EA2. Marcar con [x] cuando se cumpla.

### Código fuente

- [x] Código fuente backend (Java 21 / Spring Boot 3.5) disponible en `sGED-backend/`.
- [x] Código fuente frontend (Angular 21 / PrimeNG) disponible en `sGED-frontend/`.
- [x] Estructura de módulos alineada con alcance SGED (auth, expedientes, documentos, búsqueda, admin, auditoría).
- [x] Sin credenciales ni datos sensibles en código ni en evidencias publicadas.

### Pruebas

- [x] Pruebas unitarias backend ejecutadas (ver JUnit report en EVIDENCIAS.md).
- [x] Pruebas unitarias frontend ejecutadas (ver Karma/Jest report en EVIDENCIAS.md).
- [x] Pruebas de integración completadas (REST endpoints validados).
- [x] Reportes de cobertura disponibles (80%+ cobertura en módulos críticos).
- [x] Criterios de aceptación de pruebas cumplidos según plan_detallado.

### Pipelines

- [x] Pipeline CI backend configurado (Docker multi-stage con `mvn package`).
- [x] Pipeline CI frontend configurado (Docker con `ng build`).
- [x] Última ejecución relevante documentada (Build exitoso en deploy VPS).

### Formato y trazabilidad

- [x] INFORME_DE_AVANCES.md completado con estado por ítem.
- [x] EVIDENCIAS.md actualizado con rutas reales.
- [x] Aprobación del PM (Alejandro) y del Arquitecto (Amilcar) registrada en el informe.

---

## Resultado de la validación

| Resultado | Fecha |
|-----------|--------|
| [ ] Aprobado | |
| [ ] Aprobado con observaciones | |
| [ ] Rechazado (detallar en INFORME_DE_AVANCES) | |

**Firma / nombre del PM (calidad):** _________________________
