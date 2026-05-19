# TASK: Fix Shell Doble + Redirección Login

> **Ejecutor:** Lee este archivo completo antes de tocar código. Ejecuta en el orden indicado. `npx ng build` después de cada fix.

---

## CAUSA RAÍZ

El `PLAN_IMPLEMENTACION.md` (11 fases, commits `15e3d2e..9108a6f`) migró 6 componentes a `<app-oj-shell>` institucional pero **NUNCA incluyó una tarea para modificar `app.component.html` ni `app.component.ts`**. La Restricción #1 del plan dice "NO tocar `styles.scss`" pero no dice nada sobre `app.component`. Simplemente se olvidó.

Resultado: `app.component.html` sigue renderizando su sidebar dark + topbar viejo envolviendo `<router-outlet>`, y los componentes migrados internamente agregan un segundo shell institucional. Doble shell.

`git log 15e3d2e..9108a6f -- sGED-frontend/src/app/app.component.*` devuelve CERO commits. Confirmado: nunca fue tocado.

---

## BUG 1 — Login redirige a ruta legacy (1 línea)

**Archivo:** `sGED-frontend/src/app/features/auth/login/login.types.ts`

**Problema:** `DEFAULT_REDIRECT = '/expedientes'` manda al usuario a la lista legacy (dark theme). La pantalla principal institucional es `/busqueda`.

**Fix:** Cambiar a `'/busqueda'`.

---

## BUG 2 — Doble Shell (CRÍTICO)

**Problema:** `app.component.html` (L2-90) renderiza sidebar dark (68px, iconos PrimeNG) + topbar viejo SIEMPRE que hay usuario autenticado. Pero 6 componentes migrados YA renderizan `<app-oj-shell>` internamente con su propio sidebar+topbar institucional. Resultado: DOS sidebars y DOS topbars apilados.

### Componentes MIGRADOS (usan `<app-oj-shell>`, NO necesitan shell viejo):
- `/busqueda` → `busqueda-container.component`
- `/expedientes/:id` (solo detalle, sin sub-ruta) → `expediente-detail.component`
- `/admin/usuarios` → `usuarios-list.component`
- `/admin/auditoria` → `auditoria-list.component`
- `/reportes` → `reportes.component`
- `/presentacion/:expedienteNum` → `presentacion.component`

### Componentes LEGACY (NO usan `<app-oj-shell>`, SÍ necesitan shell viejo):
- `/expedientes` (lista exacta)
- `/expedientes/nuevo`
- `/expedientes/:id/editar`
- `/expedientes/:id/documentos`
- `/cambiar-password`

### Fix en `app.component.ts`:
1. Inyectar `Router`.
2. Crear signal `useLegacyShell = signal(true)`.
3. En constructor, suscribirse a `router.events` filtrado por `NavigationEnd`.
4. Evaluar `event.urlAfterRedirects`:
   - Empieza con `/busqueda` → `false`
   - Empieza con `/admin/` → `false`
   - Empieza con `/reportes` → `false`
   - Empieza con `/presentacion/` → `false`
   - Match regex `/expedientes/[^/]+$` (ID sin sub-ruta) → `false`
   - Match regex `/expedientes/[^/]+\?` (ID con queryParams) → `false`
   - Todo lo demás autenticado → `true`

### Fix en `app.component.html`:
Estructura actual (simplificada):
```html
@if (currentUser$ | async; as user) {
  <div class="app-shell">
    <aside class="sidebar">...</aside>
    <div class="main-content">
      <header class="topbar">...</header>
      <main><router-outlet></router-outlet></main>
    </div>
  </div>
} @else {
  <router-outlet></router-outlet>
}
```

Cambiar a:
```html
@if (currentUser$ | async; as user) {
  @if (useLegacyShell()) {
    <div class="app-shell">
      <aside class="sidebar">...</aside>
      <div class="main-content">
        <header class="topbar">...</header>
        <main class="page-content fade-in"><router-outlet></router-outlet></main>
      </div>
    </div>
  } @else {
    <main class="migrated-content"><router-outlet></router-outlet></main>
  }
} @else {
  <router-outlet></router-outlet>
}
```

**CSS para `.migrated-content`** en `app.component.scss`:
```scss
.migrated-content {
  min-height: 100vh;
  width: 100%;
}
```

---

## BUG 3 — Buscador global no conecta con búsqueda

**Archivo:** `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.service.ts`

**Problema:** El topbar viejo navega a `/busqueda?numero=TEXTO` pero el servicio de búsqueda no lee `queryParams`.

**Fix:** En el constructor, después de `this.initShell()`:
1. Inyectar `ActivatedRoute` en el constructor.
2. Suscribirse a `this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef))`.
3. Si `params['numero']` existe y tiene valor, hacer `this.dto.query.set(valor)` y `this.buscar(valor)`.

---

## ORDEN DE EJECUCIÓN

1. ✅ Bug 1 (login.types.ts — 1 línea) → `npx ng build`
2. ✅ Bug 2 (app.component.ts + .html + .scss) → `npx ng build`
3. ✅ Bug 3 (busqueda-container.service.ts) → `npx ng build`
4. ✅ `npx ng build --configuration=production` final

## RESTRICCIONES

- NO tocar `styles.scss`
- NO tocar `core/services/` ni `core/models/` existentes
- NO introducir `any`, `setTimeout()`, templates inline, styles inline
- SÍ usar signals, OnPush, standalone (patrón existente del proyecto)
- SÍ importar `NavigationEnd` de `@angular/router` y `filter` de `rxjs`
