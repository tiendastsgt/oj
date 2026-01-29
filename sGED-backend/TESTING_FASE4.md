# Tests Fase 4 - Búsquedas y Auditoría

## Estado actual de integración SGT

Los clientes `Sgtv1ClientStub` y `Sgtv2ClientStub` no consultan BD real.
Los tests de integración actuales cubren únicamente flujo con datos SGED.

## Deuda técnica para integración real

- Definir estrategia de integración (Testcontainers con BD SGT o mock server REST).
- Agregar tests que validen:
  - Respuestas combinadas SGED + SGT con deduplicación.
  - Filtros por juzgado aplicados a respuestas SGT reales.
  - Rendimiento y límites de paginación con resultados mixtos.
