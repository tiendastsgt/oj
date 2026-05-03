# EVIDENCIAS — Entregable EA2 (30% — Día 65)

**Proyecto:** SGED  
**Entregable:** EA2 — Código fuente y pruebas  
**Hito:** Día 65  
**Versión plantilla:** 1.0.0  

---

## Lista de evidencias y rutas

Completar con rutas relativas al repositorio o enlaces internos. **No incluir credenciales, tokens ni datos sensibles.**

---

### Código fuente

| Evidencia | Ruta o descripción |
|-----------|--------------------|
| Repositorio backend (Java) | [sGED-backend/](../../../sGED-backend/) (Java 21 / Spring Boot 3.5) |
| Módulos principales backend | auth, expedientes, documentos, búsqueda, admin, auditoría |
| Repositorio frontend (Angular) | [sGED-frontend/](../../../sGED-frontend/) (Angular 21 / PrimeNG) |
| Módulos principales frontend | auth, expedientes, documentos, visor, búsqueda, admin |
| Versión de stack | Angular 21, Java 21, Spring Boot 3.5, MySQL 8 / Oracle 21c |

---

### Pruebas

| Evidencia | Ruta o descripción |
|-----------|--------------------|
| Reporte de cobertura backend | Ejecución de JaCoCo en `mvn package` (commit d41de53) |
| Reporte de cobertura frontend | Ejecución de Karma/Jest (80%+ cobertura) |
| Tests unitarios backend | Ubicados en `sGED-backend/src/test/java/` |
| Tests unitarios frontend | Ubicados en `sGED-frontend/src/app/**/*.spec.ts` |
| Tests de integración | REST endpoints validados en CI/CD |
| Criterios de aceptación | Cumplidos según [plan_detallado.md](../../general/plan_detallado.md) |

---

### Pipelines

| Evidencia | Ruta o descripción |
|-----------|--------------------|
| Configuración CI (backend) | [sGED-backend/Dockerfile](../../../sGED-backend/Dockerfile) |
| Configuración CI (frontend) | [sGED-frontend/Dockerfile.vps](../../../sGED-frontend/Dockerfile.vps) |
| Última ejecución exitosa (backend) | Build exitoso en deploy VPS (Sprint UX-4) |
| Última ejecución exitosa (frontend) | Build exitoso en deploy VPS (Sprint UX-4) |

---

**Nota:** Mantener esta lista actualizada al presentar el informe de avances. No exponer secretos ni credenciales en evidencias.
