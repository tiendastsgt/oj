# TASK: Fix UI Gaps — Live vs Mockup

> Lee este archivo completo. Ejecuta en orden. `npx ng build` tras cada fix.

---

## BUG 1 — Sidebar recortada (CRÍTICO)

**Problema:** `app.component.scss` `:host` tiene `overflow: hidden` + `width: 100vw`. El `oj-shell` necesita 260px+1fr pero el contenedor padre lo recorta.

**Archivo:** `sGED-frontend/src/app/app.component.scss`

**Fix:** Cambiar `.migrated-content` (línea 273-276) para que no esté limitado por el `:host` overflow:

```scss
// Cambiar :host de:
:host {
  display: block;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

// A:
:host {
  display: block;
  height: 100vh;
}

// Y cambiar .migrated-content de:
.migrated-content {
  min-height: 100vh;
  width: 100%;
}

// A:
.migrated-content {
  min-height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}
```

**Restricción:** NO tocar los estilos de `.app-shell`, `.sidebar`, `.main-content`, `.topbar` etc. que están arriba — esos son del shell legacy y siguen en uso para `/expedientes` list, `/cambiar-password`, etc.

**Verificar:** `npx ng build`

---

## BUG 2 — Iconos del sidebar muestran HTML crudo (CRÍTICO)

**Problema:** `oj-shell.component.html` línea 21 usa `[innerHTML]="item.icon"` pero Angular sanitiza el SVG.

**Archivos:**
- `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.component.ts`
- `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.types.ts`

**Fix — opción más limpia (sin DomSanitizer):** Cambiar de `[innerHTML]` a un `<i>` con clase PrimeIcons. Todos los componentes que usan `app-oj-shell` ya pasan iconos como strings SVG. Cambiarlos a nombres de PrimeIcon (`pi pi-search`, `pi pi-chart-bar`, etc.).

**Pasos:**

1. En `oj-shell.component.html`, cambiar línea 21:
   ```html
   <!-- DE: -->
   <span class="sidebar-link-icon" [innerHTML]="item.icon"></span>
   <!-- A: -->
   <i [class]="item.icon" class="sidebar-link-icon"></i>
   ```

2. En `oj-shell.component.scss`, cambiar `.sidebar-link-icon` (líneas 131-147):
   ```scss
   .sidebar-link-icon {
     display: inline-flex;
     width: 18px;
     height: 18px;
     flex-shrink: 0;
     font-size: 16px;
     align-items: center;
     justify-content: center;
   }
   ```
   Eliminar los bloques `::ng-deep svg` que ya no se necesitan.

3. En CADA componente que declara `sections` para `app-oj-shell`, cambiar los `icon` de SVG strings a clases PrimeIcons. Buscar con:
   ```bash
   grep -r "icon:" sGED-frontend/src/app/features/ --include="*.ts" -l
   ```
   Luego en cada archivo, reemplazar los SVG por:
   - Búsqueda de expedientes → `'pi pi-search'`
   - Reportes → `'pi pi-chart-bar'`
   - Usuarios y roles → `'pi pi-users'`
   - Auditoría → `'pi pi-history'`

   Los iconos exactos pueden variar — usa PrimeIcons que ya están instalados. Consulta https://primeng.org/icons para la lista.

**Verificar:** `npx ng build`

---

## BUG 3 — Juez QA tiene rol SECRETARIO en BD

**Problema:** En la tabla de usuarios, `juez.qa@oj.gob.gt` muestra badge SECRETARIO.

**Archivo:** Buscar el seed SQL:
```bash
grep -r "juez" sGED-backend/src/main/resources/ --include="*.sql" -l
```

**Fix:** Localizar el INSERT del usuario Juez QA y cambiar su `rol_id` al que corresponda a `JUEZ`. Si el rol JUEZ no existe en `cat_rol`, hay que insertarlo primero. Este fix requiere ejecutar SQL directamente en la BD del VPS, o agregar una migración Flyway.

**Alternativa rápida:** Conectar a la BD MySQL del VPS (puerto 3307, user `sged_user`, password `sged_password`, database `sged_db`) y ejecutar:
```sql
-- Primero verificar qué roles existen
SELECT * FROM cat_rol;
-- Luego actualizar
UPDATE usuario SET rol_id = (SELECT id FROM cat_rol WHERE nombre = 'JUEZ') WHERE username = 'juez.qa';
```

Si el rol JUEZ no existe:
```sql
INSERT INTO cat_rol (nombre) VALUES ('JUEZ');
UPDATE usuario SET rol_id = (SELECT id FROM cat_rol WHERE nombre = 'JUEZ') WHERE username = 'juez.qa';
```

**Verificar:** Recargar la página de usuarios y confirmar que Juez QA muestra badge JUEZ.

---

## FIN

Al terminar los 3 fixes, ejecutar:
```bash
npx ng build --configuration=production
```

NO hacer commit aún — informar que está listo para revisión.
