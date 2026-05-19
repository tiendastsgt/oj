# TASK: Fix Sidebar Recortada (BUG FINAL)

> Lee completo. Un solo fix. `npx ng build` al final.

---

## CAUSA RAÍZ

`styles.scss` (archivo global, ~1056 líneas) tiene en líneas 539-543:

```scss
.app-shell { 
  display: flex; 
  height: 100vh; 
  overflow: hidden; 
}
```

Y en líneas 546-558 redefine `.sidebar` con `width: 68px; position: fixed;`.

Estas reglas globales se aplican TAMBIÉN al `.app-shell` de `oj-shell.component.scss`, que usa `display: grid; grid-template-columns: 260px 1fr`. El resultado es que el `display: flex` global sobreescribe el `display: grid` del componente, y `overflow: hidden` corta el sidebar de 260px.

**El PLAN_IMPLEMENTACION.md prohíbe tocar `styles.scss`**, pero ese constraint es para no romper los componentes dark que aún la usan. La solución es agregar un scope selector que evite el conflicto SIN modificar `styles.scss`.

---

## FIX — Scope el `.app-shell` del oj-shell para ganar especificidad

**Archivo:** `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.component.scss`

**Cambiar** las líneas 1-11 (`:host` y `.app-shell`) a:

```scss
:host {
  display: block;
  min-height: 100vh;
}

:host .app-shell {
  display: grid !important;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: var(--c-fondo);
  overflow: visible !important;
}
```

El `!important` en `display: grid` y `overflow: visible` es necesario porque `styles.scss` define `.app-shell { display: flex; overflow: hidden; }` a nivel global y NO se puede tocar. Una vez que todas las pantallas estén migradas y se elimine `styles.scss`, se podrán quitar los `!important`.

**NO** tocar `styles.scss`. **NO** tocar `app.component.scss`.

---

## VERIFICACIÓN

```bash
npx ng build --configuration=production
```

Si compila, hacer commit + deploy:

```bash
git add sGED-frontend/src/app/shared/components/oj-shell/oj-shell.component.scss
git commit -m "fix(frontend): override global .app-shell flex/overflow to fix sidebar clipping (Phase 14)"
git push origin main
python docs/infra/scripts/deploy_vps.py
```
