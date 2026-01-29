# Registro de cobertura y deuda técnica (Fase 2)

## Estado de cobertura frontend (Angular)

Ejecutado: `npm test -- --watch=false --browsers=ChromeHeadless --code-coverage`

Resultados (expedientes):
- `expedientes-list.component.ts`
  - Statements: 94.44%
  - Branches: 50%
  - Functions: 87.5%
  - Lines: 94.44%
- `expediente-form.component.ts`
  - Statements: 69.23%
  - Branches: 51.92%
  - Functions: 72%
  - Lines: 69.66%
- `expedientes.service.ts`
  - Statements: 80%
  - Branches: 100%
  - Functions: 60%
  - Lines: 80%

Cobertura global:
- Statements: 69.33%
- Branches: 49.62%
- Functions: 69.69%
- Lines: 68.57%

Notas:
- Cobertura de expedientes razonable, pero `ExpedienteFormComponent` y la cobertura global
  están por debajo de 80%. Pendiente de refuerzo en fases posteriores
  (más casos de error, ramas de catálogos, etc.).
- Warnings de Angular por `[disabled]` en template con reactive forms
  (sugerencia: usar `formControl.disable()`).
- No se ejecutó validación end-to-end por ausencia de backend y credenciales.

## Casos propuestos para reforzar ExpedienteFormComponent (futuro)

- Error 400 con `errors[]` por FKs inválidas (tipo/estado).
- Falla en carga de catálogos (mostrar fallback y bloqueo de submit).
- `juzgadoId` cuando el catálogo no encuentra el juzgado del usuario.

## Estado de cobertura backend (Spring Boot)

Ejecutado: `.\mvnw.cmd clean verify -Ptest-coverage`

Resultado:
- Suite completa OK (tests unitarios e integración).
- JaCoCo genera `target/jacoco.exec` y el reporte HTML en `target/site/jacoco/index.html`.

Notas:
- El reporte HTML muestra métricas por paquete/clase; revisar `index.html` para el resumen global.
