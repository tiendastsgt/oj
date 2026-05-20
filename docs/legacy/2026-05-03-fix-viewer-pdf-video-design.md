# Fix Viewer — PDF iframe & Video min-height — Design

**Fecha:** 2026-05-03
**Scope:** Iteración de robustez de layout sobre `documento-viewer.component`, separada del fix de recorte de imagen (commit `babc179`).
**Branch propuesta:** `fix/viewer-pdf-video-robustness` (desde `main` actualizado, post-merge del fix de imagen).
**PR:** independiente, agrupando los 2 cambios bajo un mismo tema (robustez del visor).

---

## Problema

Durante la revisión del fix de recorte de imagen quedaron 2 puntos pendientes en `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss`:

### 1. PDF iframe sin altura explícita

`.viewer-iframe` (líneas 210-216) declara `flex: 1; min-height: 0` pero **no** declara `height`. En WebKit (Safari/iOS) el `<iframe>` puede caer en su altura intrínseca de ~150px cuando `flex: 1` no resuelve por anidamiento de flex containers (`.elite-viewer` → `.elite-body.pdf-body` → `.viewer-iframe`). Síntoma latente: PDF visible solo en una franja superior.

### 2. `.video-body` depende del orden de cascada

`.elite-body { min-height: 0 }` (línea 119) y `.video-body { min-height: 400px }` (línea 242) tienen la misma especificidad (0,1,0). El HTML aplica ambas clases juntas. Hoy gana `min-height: 400px` solo porque está declarado después en el archivo. Si alguien reordena el SCSS o introduce otra regla `.elite-body { min-height: ... }`, el video se colapsa silenciosamente.

---

## Solución

### Cambio 1 — `.viewer-iframe` (líneas 210-216)

Añadir `height: 100%` como refuerzo cross-browser **junto a** (no en lugar de) `flex: 1`:

```scss
.viewer-iframe {
  width: 100%;
  height: 100%;     /* refuerzo cross-browser sobre flex: 1 (evita fallback de ~150px en WebKit) */
  flex: 1;
  min-height: 0;
  border: none;
  display: block;
}
```

**Por qué `height: 100%` y no `position: absolute`:** se descartó `position: absolute` para evitar efectos colaterales (stacking context, overflow, resize). Mantener el iframe como flex item es más simple y no rompe nada del layout actual.

### Cambio 2 — `.video-body` → `.elite-body.video-body` (líneas 238-243)

Elevar a selector compuesto (especificidad 0,2,0) para vencer a `.elite-body` independientemente del orden de declaración:

```scss
/* Selector compuesto para vencer a .elite-body sin depender del orden de cascada */
.elite-body.video-body {
  background: #000;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
```

El HTML siempre aplica las dos clases juntas (`<div class="elite-body video-body">`, template línea 100), por lo que el selector compuesto es semánticamente equivalente al actual pero más estable.

---

## Verificación

- **Visual Chromium:** PDF a altura completa, video con `min-height: 400px` confirmado en DevTools.
- **Visual Safari/iOS** (si hay acceso a hardware/simulador): especialmente el iframe — es el navegador donde el bug está latente.
- **No-regresión:** imagen vertical sigue sin recorte (fix previo intacto), audio centrado, formato no soportado correcto.
- **Build:** `npx ng build --configuration=production` sin warnings nuevos; delta de bundle CSS de pocos bytes.

No hay tests automatizados de layout — la verificación es visual, lo cual es aceptable para un cambio CSS de este alcance.

---

## Archivos tocados

- `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss` (2 bloques modificados, ~3 líneas netas).

Sin cambios en HTML, TypeScript ni backend.

---

## Riesgos

Bajo. CSS puro, sin cambio de comportamiento esperado donde el código actual ya funciona; solo refuerza casos límite (WebKit) y futuros refactors (orden de cascada).
