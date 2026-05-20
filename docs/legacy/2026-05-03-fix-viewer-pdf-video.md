# Fix Viewer — PDF iframe & Video min-height — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan. Pasos con checkbox (`- [ ]`).

**Goal:** Aplicar los 2 cambios CSS aprobados en el spec `2026-05-03-fix-viewer-pdf-video-design.md`: refuerzo `height: 100%` al iframe PDF y selector compuesto para `min-height` del video.

**Architecture:** CSS-only en un solo archivo. Sin tocar HTML, TS ni backend.

**Tech Stack:** Angular 21, SCSS.

**Precondición:** Esperar merge a `main` de:
1. Fix de recorte de imagen (plan `2026-05-03-fix-image-viewer-crop.md`).
2. Fix de icono fullscreen (branch `fix/viewer-fullscreen-icon`, commit `145d757`).

Hacer rebase/branch desde `main` actualizado con ambos mergeados.

---

### Task 1: Branch y baseline visual

**Files:** ninguno (solo git + verificación).

- [ ] **Step 1: Verificar que precondiciones están en main**

```powershell
git checkout main
git pull origin main
git log --oneline -5
```

Esperado: ver merges de fix-image-viewer-crop y fix-viewer-fullscreen-icon. Si falta alguno, **detener** y avisar.

- [ ] **Step 2: Crear branch**

```powershell
git checkout -b fix/viewer-pdf-video-robustness
```

- [ ] **Step 3: Levantar dev server y capturar baseline**

```powershell
cd C:\proyectos\oj\sGED-frontend
npx ng serve
```

Abrir un expediente con PDF y otro con video. Para el PDF, en DevTools → Inspector sobre `.viewer-iframe` → anotar `computed height`. Para el video, anotar `min-height` computado en `.video-body`. Capturar screenshots para comparar después.

---

### Task 2: Aplicar fix PDF + verificar

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss:210-216`

- [ ] **Step 1: Reemplazar bloque `.viewer-iframe`**

Bloque actual (líneas 210-216):

```scss
.viewer-iframe {
  width: 100%;
  flex: 1;
  min-height: 0;
  border: none;
  display: block;
}
```

Reemplazar por:

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

- [ ] **Step 2: Verificar visualmente**

Recargar visor PDF. Validar:
- PDF ocupa toda la altura del `.elite-body`.
- DevTools → `.viewer-iframe` computed height ≥ alto del padre.
- Scroll interno del PDF sigue funcionando.
- (Si hay acceso) Probar en Safari/iOS — es donde el bug está latente.

Si hay regresión (PDF tapado por header, scroll roto), revertir el cambio y avisar.

---

### Task 3: Aplicar fix Video + verificar + no-regresión

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss:238-243`

- [ ] **Step 1: Reemplazar bloque `.video-body`**

Bloque actual (líneas 238-243):

```scss
.video-body {
  background: #000;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
```

Reemplazar por:

```scss
/* Selector compuesto: especificidad 0,2,0 para vencer a .elite-body sin depender del orden de cascada */
.elite-body.video-body {
  background: #000;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
```

- [ ] **Step 2: Verificar visualmente video**

Recargar visor video. Validar:
- Video con `min-height: 400px` confirmado en DevTools sobre `.elite-body.video-body`, regla **sin tachado**.
- Centrado horizontal y vertical sobre fondo negro.

- [ ] **Step 3: No-regresión sobre los demás formatos**

Recorrer en el mismo dev server: imagen vertical (debe seguir sin recorte), imagen horizontal, audio (tarjeta centrada con animaciones), formato no soportado (mensaje correcto). Si todo OK, los 2 cambios son seguros.

---

### Task 4: Build prod, commit y PR

**Files:** ninguno (build + git).

- [ ] **Step 1: Build producción**

```powershell
cd C:\proyectos\oj\sGED-frontend
npx ng build --configuration=production
```

Esperado: build sin errores ni warnings nuevos. Delta de bundle CSS de pocos bytes.

- [ ] **Step 2: Commit**

```powershell
git add sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.scss
git status --short
```

Verificar que solo `documento-viewer.component.scss` aparece staged.

```powershell
git commit -m "fix(viewer): robustecer altura de PDF iframe y min-height de video

- PDF: añade height: 100% al .viewer-iframe como refuerzo cross-browser
  (evita fallback de ~150px en WebKit cuando flex: 1 no resuelve por
  anidamiento de flex containers).
- Video: eleva especificidad del selector a .elite-body.video-body
  para que min-height: 400px no dependa del orden de declaracion CSS."
```

- [ ] **Step 3: Push y PR**

```powershell
git push -u origin fix/viewer-pdf-video-robustness
```

PR manual desde GitHub (gh CLI no está instalado localmente). Usar URL que devuelve el push. Body sugerido:

```markdown
## Resumen

Iteración separada del fix de recorte de imagen y del fix de icono fullscreen. Atiende dos pendientes detectados en revisión:

1. **PDF (`.viewer-iframe`)**: añade `height: 100%` como refuerzo a `flex: 1` para evitar fallback de ~150px en WebKit con flex containers anidados.
2. **Video (`.video-body`)**: eleva el selector a `.elite-body.video-body` (especificidad 0,2,0) para que `min-height: 400px` no dependa del orden de cascada.

## Test plan

- [x] Visual Chromium: PDF altura completa, video min-height confirmado en DevTools.
- [ ] Visual Safari/iOS: pendiente (especialmente iframe).
- [x] No-regresión: imagen, audio, formato no soportado intactos.
- [x] Build prod: sin warnings nuevos.
```

---

## Self-Review

- **Spec coverage:** los 2 cambios del spec están en Task 2 y Task 3. Precondición de merge previo en Task 1 Step 1.
- **Placeholder scan:** sin TBD/TODO. Snippets completos.
- **Type consistency:** N/A (CSS). Selectores y líneas verificadas contra el archivo real.
