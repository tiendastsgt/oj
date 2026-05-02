# Spec — Sprint UX-1: Coherencia Sistémica + Accesibilidad

**Fecha:** 2026-05-01  
**Basado en:** `docs/auditorias/2026-05-01-auditoria-ux.md`  
**Skills aplicados:** ui-ux-pro-max, high-end-visual-design, frontend-ui-dark-ts, angular-best-practices, product-design

---

## Alcance

6 tareas derivadas de los hallazgos 🔴 Crítico y 🟡 Medio de la auditoría UX v1.3.0.

---

## Tarea 1 — Reestilizar `documentos-list` con p-table + design system

**Archivo objetivo:** `sGED-frontend/src/app/features/documentos/list/documentos-list.component.*`

**Problema:** Tabla HTML nativa, `*ngIf/*ngFor` legacy, sin tokens del design system, sin `OnPush`, tamaño en bytes crudos.

**Cambios:**
- Reemplazar `<table>` nativo por `<p-table [value]="documentos">` de PrimeNG.
- Migrar `*ngIf` → `@if`, `*ngFor` → `@for (track doc.id)`.
- Añadir `changeDetection: ChangeDetectionStrategy.OnPush`.
- Añadir pipe `fileSizePipe` o función pura que convierta bytes → "1.2 MB" / "45 KB".
- Aplicar tokens CSS: `--surface-card`, `--text-primary`, `--text-secondary`, `--border-subtle`.
- Botones de acción: usar `<p-button>` con `severity` apropiado y `aria-label` en cada uno.
- Integrar `<app-empty-state>` (Tarea 6) cuando `documentos.length === 0`.

**Resultado esperado:** Tabla visualmente consistente con el design system dark, accesible y con CD optimizado.

---

## Tarea 2 — Rediseñar `documentos-upload` con glassmorphism drag&drop

**Archivo objetivo:** `sGED-frontend/src/app/features/documentos/upload/documentos-upload.component.*`

**Problema:** Botón azul hardcoded `#1976d2`, drop-zone con `background: #fafafa` y `border: 2px dashed #9e9e9e` — fuera del design system dark.

**Cambios:**
- Contenedor principal: clase `.glass-panel` del design system.
- Drop-zone:
  - Border hairline: `rgba(255,255,255,0.06)` con `border-style: dashed`.
  - Estado `dragover`: glow sutil `box-shadow: 0 0 0 2px var(--accent-primary)` + transición `cubic-bezier(0.16, 1, 0.3, 1) 200ms`.
  - Icono `pi pi-cloud-upload` centrado + texto descriptivo.
- Botón de selección: `<p-button>` con tokens del sistema, no color hardcoded.
- Progress bar: usar `<p-progressBar>` de PrimeNG.
- Error: usar `<p-message severity="error">`.
- Migrar `*ngIf` → `@if`.
- Añadir `changeDetection: ChangeDetectionStrategy.OnPush`.

**Resultado esperado:** Componente de upload visualmente premium, integrado en el dark theme, con feedback claro.

---

## Tarea 3 — Focus-visible global

**Archivo objetivo:** `sGED-frontend/src/styles.scss`

**Problema:** No existe regla `*:focus-visible` global. Sin navegación por teclado visual.

**Cambios:**
- Añadir en la sección de accessibility de `styles.scss`:

```scss
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
  border-radius: 4px;
}
```

- Asegurar que los componentes con estilos propios no sobreescriban `outline: none` sin alternativa.

**Resultado esperado:** Todos los elementos interactivos muestran un ring visible al navegar con teclado. Cumple WCAG 2.1 AA criterion 2.4.7.

---

## Tarea 4 — Aria-labels en sidebar

**Archivo objetivo:** `sGED-frontend/src/app/app.component.html`

**Problema:** `<aside class="sidebar">` sin `aria-label`. Cada `<a class="nav-item">` solo tiene `title=""` pero no `aria-label`. El botón logout sin `aria-label`.

**Cambios:**
- `<aside>`: añadir `role="navigation"` + `aria-label="Navegación principal"`.
- Cada `<a class="nav-item">`: añadir `aria-label="[nombre]"` explícito (Dashboard, Expedientes, Búsqueda, Usuarios, Auditoría, Configuración).
- `<button class="logout-btn">`: añadir `aria-label="Cerrar sesión"`.

**Resultado esperado:** Screen readers anuncian correctamente cada elemento de navegación. Cumple WCAG 2.1 AA criterion 4.1.2.

---

## Tarea 5 — Cursor pointer en elementos interactivos

**Archivo objetivo:** `sGED-frontend/src/styles.scss`

**Problema:** Elementos clickeables custom (`.nav-item`, `.user-avatar`, `.brand-icon`) sin `cursor: pointer` explícito.

**Cambios:**
- Añadir en la sección de base/reset de `styles.scss`:

```scss
.nav-item,
[role="button"],
label[for],
.clickable {
  cursor: pointer;
}
```

- Verificar que todos los elementos interactivos en `app.component.scss` tengan `cursor: pointer`.

**Resultado esperado:** Affordance clara — el usuario siempre sabe qué es clickeable.

---

## Tarea 6 — Componente `empty-state` reutilizable

**Archivo objetivo (nuevo):** `sGED-frontend/src/app/shared/components/empty-state/`

**Problema:** Mensajes de "sin datos" son strings planos sin diseño ni call-to-action.

**API del componente:**
```typescript
@Input() icon: string = 'pi pi-inbox';       // Icono PrimeIcons
@Input() titulo: string = 'Sin datos';        // Título principal
@Input() mensaje: string = '';                // Subtítulo descriptivo
@Input() ctaLabel: string = '';              // Texto del botón CTA (vacío = sin botón)
@Output() ctaClick = new EventEmitter<void>();
```

**Diseño:**
- Contenedor centrado con `.glass-panel`, padding generoso.
- Icono grande (2.5rem) con color `var(--text-muted)`.
- Título con `var(--text-primary)`, mensaje con `var(--text-secondary)`.
- CTA primario con `<p-button>` si `ctaLabel` no está vacío.
- Animación de entrada `.fade-in` + `.slide-up`.
- `changeDetection: ChangeDetectionStrategy.OnPush`.

**Uso en `documentos-list`:**
```html
<app-empty-state
  icon="pi pi-file"
  titulo="Sin documentos"
  mensaje="Aún no hay documentos adjuntos a este expediente."
  ctaLabel="Subir documento"
  (ctaClick)="onNuevoDocumento()"
/>
```

**Resultado esperado:** Empty states consistentes, con mensaje de oportunidad y CTA claro. Elimina los strings planos actuales.

---

## Criterios de Aceptación (Sprint UX-1 completo)

- [ ] `p-table` renderiza documentos con tokens del design system
- [ ] Drop-zone responde a drag con transición spring y glow
- [ ] Navegación por teclado muestra ring visible en TODOS los interactivos
- [ ] Screen reader anuncia "Navegación principal" al entrar al sidebar
- [ ] Hover sobre `.nav-item` muestra `cursor: pointer`
- [ ] `<app-empty-state>` aparece cuando la lista está vacía con icono + mensaje + CTA
- [ ] Cero `console.log` en archivos modificados
- [ ] Todos los componentes modificados usan `OnPush`
- [ ] Sin `*ngIf/*ngFor` en archivos modificados (usar `@if/@for`)
- [ ] Build de producción sin errores: `npx ng build --configuration=production`
