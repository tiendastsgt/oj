# Fix Image Viewer Crop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar el recorte vertical (top/bottom) de las imágenes en el visor documental, asegurando que la imagen se escale para encajar dentro del área visible (`object-fit: contain`) sin desbordar.

**Architecture:** El visor (`documento-viewer.component`) usa un layout flex anidado: `:host` → `.elite-viewer` → `.elite-body.image-body` → `.viewer-image`. La causa del recorte está en `.elite-body`: NO declara `min-height: 0`, por lo que el hijo flex no puede encogerse por debajo de la altura intrínseca de la imagen. Como `.elite-viewer` tiene `overflow: hidden`, el desbordamiento se recorta visualmente. La solución es propagar `min-height: 0` por toda la cadena flex y reforzar el contenedor de imagen para que su contenido respete el área disponible.

**Tech Stack:** Angular 21, SCSS, PrimeNG (sin cambios). Solo CSS.

---

## Diagnóstico (evidencia del código real)

Archivo inspeccionado: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss`

| Selector | Línea | Estado actual | Problema |
|----------|-------|---------------|----------|
| `:host` | 6-12 | `min-height: 0` ✅ | OK |
| `.elite-viewer` | 14-24 | `flex: 1`, `min-height: 0`, `overflow: hidden` ✅ | OK (oculta el desbordamiento, lo que produce el "crop" visible) |
| `.elite-body` | 119-123 | `flex: 1; display: flex; flex-direction: column;` — **falta `min-height: 0`** ❌ | **Causa raíz**: el contenedor flex no puede contraerse por debajo del tamaño intrínseco de la imagen → la imagen empuja hacia arriba/abajo y `.elite-viewer` lo recorta. |
| `.image-body` | 220-226 | `flex: 1`, `padding: 24px`, `align-items/justify-content: center` — **falta `min-height: 0` y `overflow: hidden`** ⚠️ | Aún sin estos, `max-height: 100%` de la imagen no resuelve correctamente. |
| `.viewer-image` | 228-234 | `max-width: 100%`, `max-height: 100%`, `object-fit: contain` ✅ | El paso 2 del usuario YA está cumplido. |

**Conclusión**: El problema NO está en `.viewer-image` (ya está correcto). Está en la cadena flex padre que impide que `max-height: 100%` resuelva contra una altura finita.

**Steps 2 y 4 del requerimiento del usuario están OK; el trabajo real es Step 3 (manejo de flexbox del contenedor).**

---

### Task 1: Corregir cadena flex para permitir contracción

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss:119-123` (`.elite-body`)
- Modify: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss:220-226` (`.image-body`)

- [ ] **Step 1: Reproducir el bug en navegador (baseline)**

Iniciar el dev server y abrir un expediente con una imagen vertical (alta, p. ej. retrato 1080×1920) o panorámica.

Run:
```powershell
cd C:\proyectos\oj\sGED-frontend
npx ng serve
```

Navegar a un expediente con imagen y abrir el visor. Capturar evidencia:
- Imagen vertical → debe verse recortada arriba y abajo.
- Imagen horizontal grande → posiblemente correcta.

Anotar el comportamiento observado (estado **antes** del fix) para comparación posterior.

- [ ] **Step 2: Modificar `.elite-body` — añadir `min-height: 0`**

Reemplazar el bloque actual (líneas 119-123):

```scss
/* ── Body (shared) ── */
.elite-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

Por:

```scss
/* ── Body (shared) ── */
.elite-body {
  flex: 1;
  min-height: 0;          /* permite contracción debajo del tamaño intrínseco del hijo */
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 3: Modificar `.image-body` — añadir `min-height: 0` y `overflow: hidden`**

Reemplazar el bloque actual (líneas 220-226):

```scss
/* ── Image ── */
.image-body {
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #080e19;
  flex: 1;
}
```

Por:

```scss
/* ── Image ── */
.image-body {
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #080e19;
  flex: 1;
  min-height: 0;          /* el contenedor puede contraerse — máx-height del hijo resuelve correctamente */
  overflow: hidden;       /* defensa en profundidad: nada se desborda del área visible */
}
```

> Nota: `.viewer-image` (líneas 228-234) NO se modifica — ya cumple los pasos 2 y 4 del requerimiento (`object-fit: contain`, `max-height: 100%`, sin altura fija).

- [ ] **Step 4: Compilar para verificar que no rompe el bundle**

Run:
```powershell
cd C:\proyectos\oj\sGED-frontend
npx ng build --configuration=production
```

Expected: build OK, sin errores SCSS, tamaño de bundle similar (cambio CSS marginal).

- [ ] **Step 5: Verificación visual en navegador (golden path)**

Recargar el dev server y validar **5 escenarios** de imagen:

| Caso | Tipo de imagen | Comportamiento esperado |
|------|----------------|-------------------------|
| 1 | Vertical alta (1080×1920) | Cabe entera, márgenes laterales, sin recorte top/bottom |
| 2 | Horizontal panorámica (3840×1080) | Cabe entera, márgenes arriba/abajo, sin recorte lateral |
| 3 | Cuadrada grande (3000×3000) | Cabe entera, sin recorte |
| 4 | Pequeña (300×200) | Se muestra a tamaño natural, centrada, sin estirar |
| 5 | Modo lectura + Pantalla completa | Se reescala correctamente al cambiar de tamaño |

- [ ] **Step 6: Verificación de no-regresión en otros tipos de archivo**

Probar que NO se rompe el visor de:
- PDF (`.pdf-body` + `.viewer-iframe`) — debe seguir ocupando todo el alto
- Video (`.video-body` + `.viewer-video`) — `max-height: 600px` sigue aplicando
- Audio (`.audio-card` centrado) — sin cambio
- Estado loading / error / unsupported (`.viewer-centered`) — centrado intacto

`.elite-body` es compartido por todos los body-types, por eso este paso es crítico. El cambio (`min-height: 0`) es **aditivo** y compatible con descendientes que ya tienen `flex: 1` (PDF iframe) o restricciones propias (video).

- [ ] **Step 7: Commit**

```powershell
cd C:\proyectos\oj
git add sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss
git commit -m "fix(viewer): corregir recorte de imágenes — añadir min-height:0 a contenedores flex anidados

Las imágenes verticales y panorámicas se mostraban recortadas top/bottom
porque .elite-body y .image-body no permitían contracción flex debajo
del tamaño intrínseco del hijo. Sin min-height:0, max-height:100% del
<img> resolvía contra una altura inflada y .elite-viewer (overflow:hidden)
recortaba el desbordamiento.

- .elite-body: añadido min-height: 0
- .image-body: añadido min-height: 0 y overflow: hidden
- .viewer-image: sin cambios (ya tenía object-fit: contain y max-height: 100%)
"
```

---

## Self-Review (post-escritura)

**1. Cobertura del spec del usuario:**
- Step 1 (localizar archivo): ✅ archivo identificado y leído.
- Step 2 (`object-fit: contain` + `max-height: 100%` en `.viewer-image`): ✅ verificado — ya estaba aplicado (líneas 230-232). Sin cambios.
- Step 3 (flexbox que permita reducir escala sin desbordamiento): ✅ Task 1, Steps 2-3 — éste es el cambio real.
- Step 4 (sin alto fijo restrictivo): ✅ verificado — no hay `height` fijo en la cadena. Sin cambios.

**2. Placeholder scan:** sin TBD/TODO/"add appropriate handling". Cada step trae código exacto y comando exacto.

**3. Consistencia de tipos/selectores:** los selectores referenciados (`.elite-body`, `.image-body`, `.viewer-image`, `.elite-viewer`) coinciden con los del HTML (líneas 66-67) y SCSS actual.

**4. Riesgo:** mínimo — cambio puramente CSS, aditivo, en archivo aislado del componente.

---

## Resumen ejecutivo

**Causa raíz:** falta `min-height: 0` en `.elite-body` (línea 119) — flex anidado no puede contraerse, la imagen desborda y `.elite-viewer { overflow: hidden }` produce el recorte visible.

**Fix:** 2 propiedades CSS añadidas a `.elite-body`, 2 a `.image-body`. Sin tocar `.viewer-image` (ya correcto).

**Esfuerzo:** ~10 minutos de edición + 15 min de verificación visual.
