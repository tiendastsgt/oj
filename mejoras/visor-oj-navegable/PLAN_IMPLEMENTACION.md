# Plan de implementación — Visor Documental OJ (rediseño UX)

> **Para agentes ejecutores:** este plan se ejecuta por fases. Tras cada fase: `npx ng build` + `npx ng build --configuration=production` deben compilar limpios antes de continuar. Cada fase incluye un commit. Si una fase rompe otra ya migrada, revertir y replantear antes de seguir.

**Goal:** Migrar el frontend Angular `sGED-frontend` del tema dark inmersivo al nuevo lenguaje institucional del Organismo Judicial (light, azul cobalto + dorado quetzal, tipografía serif/mono) según el mockup HTML navegable de `mejoras/visor-oj-navegable/`.

**Architecture:** Migración incremental por componente, respetando el patrón de 6 artefactos vigente (`ARCHITECTURE.md`). Se introduce un segundo set de tokens CSS (`oj-tokens.css`) que coexiste con el dark theme actual; cada componente migrado activa el theme institucional vía `:host` en su SCSS. Componentes no migrados siguen funcionando sin cambios.

**Tech Stack:** Angular 21 standalone + signals, PrimeNG 21, SCSS, fuente del mockup en `mejoras/visor-oj-navegable/`. Sin librerías nuevas.

**Fuente de verdad visual:** `mejoras/visor-oj-navegable/*.html` (HTML del cliente). Cada tarea referencia el archivo y rango de líneas relevante.

---

## Restricciones inquebrantables

1. **NO tocar** `sGED-frontend/src/styles.scss` (35KB compartidos, romperían el dark theme de pantallas aún no migradas).
2. **NO tocar** `core/services/` ni `core/models/` (otros componentes dependen).
3. **NO** introducir `any`, `ChangeDetectionRef`, `setTimeout()`, templates inline, ni styles inline.
4. **SÍ** seguir el patrón de 6 artefactos (`component.ts` orquestador, `dto.ts` signals, `service.ts` lógica, `types.ts`, `component.html`, `component.scss`).
5. **SÍ** mantener PrimeNG. Donde el mockup usa elementos vanilla, envolver/estilar PrimeNG para lograr el mismo resultado visual sin reinventar componentes.
6. **SÍ** ejecutar `npx ng build` y `npx ng build --configuration=production` al final de cada fase. No avanzar si alguno falla.
7. **NO** commitear pantallas mockup (`mejoras/visor-oj-navegable/`) ni `login.json`, `upload_docs.py` en los commits de migración. Son artefactos de referencia.

---

## Mapeo de pantallas mockup → componentes Angular

| Mockup HTML | Componente Angular | Acción |
|---|---|---|
| `login.html` | `features/auth/login/` | Migrar (split layout) |
| `busqueda.html` (vacío) | `features/busqueda/busqueda-container/` | Migrar (hero + anclados + estado vacío) |
| `busqueda-resultados.html` | `features/busqueda/busqueda-container/` (mismo) | Extender con resultados + drawer filtros |
| `expediente.html` | `features/expedientes/expediente-detail/` | Migrar header + tabs General/Archivos |
| `expediente.html` (visor) | `features/documentos/documentos-page.component` + `components/visor-*` y `reproductor-*` | Reestilar 4 visores |
| `presentacion.html` | **NUEVO** `features/presentacion/` | Crear desde cero |
| `reportes.html` | **NUEVO** `features/reportes/` | Crear desde cero |
| `usuarios.html` | `features/admin/usuarios/usuarios-list/` + forms | Migrar visual |
| `auditoria.html` | `features/admin/auditoria/auditoria-list/` | Migrar visual |
| Shell global (sidebar + topbar) | **NUEVO** `shared/components/oj-shell/` | Crear y consumir desde cada feature |
| Anclados (pin) | **NUEVO** `core/services/anclados.service.ts` (frontend-only, localStorage) | Crear |

---

## Fase 0 — Infraestructura visual (tokens, fuentes, assets, shell)

**Objetivo:** Dejar disponibles las variables CSS, fuentes Google, escudo PNG y el componente `oj-shell` reutilizable, sin tocar ningún componente existente.

### Tarea 0.1: Copiar assets visuales del mockup

**Files:**
- Create: `sGED-frontend/src/assets/oj/escudo-oj-dorado.png`
- Create: `sGED-frontend/src/assets/oj/escudo-oj-azul.png`
- Create: `sGED-frontend/src/assets/oj/escudo-oj-blanco.png`

- [ ] **Step 1:** Crear carpeta `sGED-frontend/src/assets/oj/`.
- [ ] **Step 2:** Copiar los 3 PNG desde `mejoras/visor-oj-navegable/escudo-oj-*.png` a `sGED-frontend/src/assets/oj/`.
  ```powershell
  Copy-Item mejoras/visor-oj-navegable/escudo-oj-*.png sGED-frontend/src/assets/oj/
  ```
- [ ] **Step 3:** Verificar que `angular.json` (en `sGED-frontend/angular.json`) ya incluye `"src/assets"` en `assets`. Si no, añadir el patrón.

### Tarea 0.2: Crear archivo de tokens institucional independiente

**Files:**
- Create: `sGED-frontend/src/assets/oj/oj-tokens.css`

- [ ] **Step 1:** Crear el archivo con contenido idéntico a `mejoras/visor-oj-navegable/tokens.css` (tokens `--c-*`, `--font-*`, `--sp-*`, `--r-*`, `--shadow-*`, `--t-*`), **omitiendo** la sección de reset (`html, body`, `h1-h4`, `a`, etc.) — el reset choca con el dark theme actual y la pantalla aún no migrada se rompería.
- [ ] **Step 2:** Conservar las clases utilitarias `.btn`, `.btn-primary`, `.btn-secondary`, `.input`, `.field`, `.card`, `.badge*`, `.divider*` con sus tokens, pero **prefijarlas** con `.oj-theme` para activación opt-in:
  ```css
  .oj-theme .btn-primary { background: var(--c-azul-800); ... }
  ```
  Las variables `:root { --c-* }` quedan globales sin prefijo (no chocan, distinto namespace).
- [ ] **Step 3:** Conservar también las clases `.section-header-collapsible`, `.anclados-*` del mockup como utilitarias bajo `.oj-theme`.

### Tarea 0.3: Inyectar fuentes y tokens en `index.html`

**Files:**
- Modify: `sGED-frontend/src/index.html`

- [ ] **Step 1:** Añadir antes de `</head>`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/oj/oj-tokens.css">
  ```
  (Inter ya carga en `styles.scss`; no la duplicamos.)
- [ ] **Step 2:** `npx ng serve` y abrir DevTools → Network → verificar que las 3 fuentes y `oj-tokens.css` cargan con status 200.

### Tarea 0.4: Crear componente compartido `OjShellComponent`

**Files:**
- Create: `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.component.ts`
- Create: `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.component.html`
- Create: `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.component.scss`
- Create: `sGED-frontend/src/app/shared/components/oj-shell/oj-shell.types.ts`

Es un componente "tonto" (solo `@Input`/`@Output`), no necesita los 6 artefactos.

- [ ] **Step 1:** `types.ts` con interfaz `OjShellNavItem { label; icon; route; badge?; active? }` y `OjShellSection { label; items: OjShellNavItem[] }`.
- [ ] **Step 2:** `component.ts` standalone, OnPush, `@Input() sections`, `@Input() breadcrumb`, `@Input() title`, `@Input() user: { name; role; initials }`, slots con `<ng-content select="[topbar-actions]">` y `<ng-content>` para contenido.
- [ ] **Step 3:** `component.html` copia la estructura del sidebar+topbar de `mejoras/visor-oj-navegable/busqueda.html` líneas 937–1090 adaptada a Angular: `*ngFor` sobre `sections`, `[routerLink]="item.route"`, `routerLinkActive="active"`.
- [ ] **Step 4:** `component.scss` con `:host { display: contents; }` y luego envolver todo el shell en `.oj-theme` para activar tokens. Copiar reglas relevantes de `mejoras/visor-oj-navegable/shell.css`.
- [ ] **Step 5:** `npx ng build` (sin uso aún, debe compilar el componente solo).

### Tarea 0.5: Commit fase 0

```bash
git add sGED-frontend/src/assets/oj/ sGED-frontend/src/index.html sGED-frontend/src/app/shared/components/oj-shell/
git commit -m "feat(frontend): add OJ institutional design tokens + shared shell (Phase 0 — visor redesign)"
```

---

## Fase 1 — Login institucional

**Mockup:** `mejoras/visor-oj-navegable/login.html` (526 líneas).

### Tarea 1.1: Reescribir template de login

**Files:**
- Modify: `sGED-frontend/src/app/features/auth/login/login.component.html`
- Modify: `sGED-frontend/src/app/features/auth/login/login.component.scss`

- [ ] **Step 1:** Reemplazar el contenido de `login.component.html` por la estructura del mockup `login.html` líneas 391–522: dos columnas (`.login-brand` azul con escudo, `.login-form-wrap` formulario). Sustituir inputs vanilla por PrimeNG (`<p-inputtext>`, `<p-password>`, `<p-button>`) preservando las clases visuales (`form-eyebrow`, `form-title`, `form-subtitle`, `security-notice`).
- [ ] **Step 2:** Mantener todos los bindings ya presentes en el template antiguo (`formGroup`, `formControlName="usuario"`, `formControlName="password"`, `(ngSubmit)="svc.iniciarSesion()"`, lectura de errores desde `dto`).
- [ ] **Step 3:** Eliminar el bloque "demo-users" del mockup — no aplica a producción (era apoyo del cliente para probar el HTML).
- [ ] **Step 4:** Reescribir `login.component.scss` con `:host { display: block; }` y bajo `:host` añadir la clase contenedora `.oj-theme.login-layout { ... }`. Copiar las reglas CSS del `<style>` del mockup (login.html líneas 11–386). Reemplazar `var(--c-blanco)` por `var(--c-blanco, #fff)` para fallback.

### Tarea 1.2: Ajustar component.ts si hace falta nuevo input

**Files:**
- Modify: `sGED-frontend/src/app/features/auth/login/login.component.ts` (solo si se necesita)

- [ ] **Step 1:** Revisar si el nuevo template requiere `@if` (Angular 17+) o `@for`. El componente ya importa `NgClass`; no se requieren cambios.
- [ ] **Step 2:** Confirmar que `providers: [LoginService]` y `protected dto = this.svc.dto` siguen siendo todo el contenido del component.ts (orquestador ≤30 líneas).

### Tarea 1.3: Build de verificación

- [ ] **Step 1:** `npx ng build` debe compilar sin errores.
- [ ] **Step 2:** `npx ng build --configuration=production` debe compilar sin errores.
- [ ] **Step 3:** `npx ng serve` y navegar a `/login`. Verificar visualmente: columna azul a la izquierda con escudo, formulario a la derecha, botón dorado/azul, aviso de seguridad inferior.
- [ ] **Step 4:** Probar el flujo: ingresar credenciales válidas → redirige a `/dashboard` (sigue funcionando como antes).

### Tarea 1.4: Commit fase 1

```bash
git add sGED-frontend/src/app/features/auth/login/
git commit -m "feat(frontend): migrate login to institutional design (Phase 1 — visor redesign)"
```

---

## Fase 2 — Búsqueda (hero + anclados + estado vacío)

**Mockup:** `mejoras/visor-oj-navegable/busqueda.html` (1487 líneas).

> Esta fase deja la búsqueda en estado vacío con los anclados. La sección de resultados con drawer de filtros se hace en Fase 3.

### Tarea 2.1: Crear servicio de anclados (frontend, localStorage)

**Files:**
- Create: `sGED-frontend/src/app/core/services/anclados.service.ts`
- Create: `sGED-frontend/src/app/core/models/anclado.model.ts`

> Excepción justificada a la regla "NO modificar core/services/": estamos **agregando** un servicio nuevo, no modificando uno existente. La regla protege la estabilidad de los servicios que otros componentes consumen; agregar uno nuevo no afecta a nadie.

- [ ] **Step 1:** `anclado.model.ts`:
  ```ts
  export interface AncladoDoc {
    id: string;            // ID del documento backend
    name: string;
    type: 'pdf' | 'doc' | 'img' | 'video' | 'audio';
    size: string;
    category: string;
  }
  export interface AncladoExpediente {
    numeroExpediente: string;
    juzgado: string;
    docs: AncladoDoc[];
    preparedAt: string;    // ISO
    audienciaAt?: string;  // ISO opcional
  }
  ```
- [ ] **Step 2:** `anclados.service.ts` con `@Injectable({ providedIn: 'root' })`. Estado en `signal<Map<string, AncladoExpediente>>()`. Métodos:
  - `toggle(expediente: string, doc: AncladoDoc): boolean` (retorna `true` si quedó anclado)
  - `getByExpediente(num: string): AncladoDoc[]`
  - `countByExpediente(num: string): number`
  - `expedientesConAnclados(): AncladoExpediente[]`
  - `totalCount(): number`
  - `clear(expediente: string): void`
- [ ] **Step 3:** Persistencia: leer al constructor de `localStorage.getItem('oj.anclados.v1')` y escribir en cada mutación. Usar `try/catch` y degradar silenciosamente si `localStorage` no está disponible.
- [ ] **Step 4:** Test `anclados.service.spec.ts` con casos: toggle agrega, toggle quita, persiste, lee al construir. Usar `localStorage.clear()` en `beforeEach`.

### Tarea 2.2: Migrar `busqueda-container` al hero

**Files:**
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.component.html`
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.component.scss`
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.component.ts` (si necesita más imports)
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.service.ts`
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.dto.ts`
- Reference (no modificar todavía): `busqueda-rapida` y `busqueda-avanzada` quedan ocultos detrás del nuevo hero (Fase 3 los integra al drawer).

- [ ] **Step 1:** En `busqueda-container.dto.ts` añadir signals: `query: signal('')`, `anclados: signal<AncladoExpediente[]>([])`, `mostrandoResultados: signal(false)`.
- [ ] **Step 2:** En `service.ts` inyectar `AncladosService` y actualizar `dto.anclados.set(...)` en el constructor + cuando localStorage cambia.
- [ ] **Step 3:** Reescribir `component.html` con la estructura del hero (`busqueda.html` líneas 1096–1131) + sección anclados (líneas 1134–1342) + estado vacío de resultados (líneas 1358–1368). Envolver todo en `<div class="oj-theme">`.
- [ ] **Step 4:** Reescribir `component.scss` copiando reglas relevantes del `<style>` del mockup (líneas 12–928), prefijadas con `:host` para encapsular.
- [ ] **Step 5:** Renderizar los anclados con `@for (anc of dto.anclados(); track anc.numeroExpediente)`.

### Tarea 2.3: Integrar `OjShellComponent` en búsqueda

**Files:**
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.component.ts` (imports)
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-container/busqueda-container.component.html`

- [ ] **Step 1:** Importar `OjShellComponent` en `imports`. Envolver el template con `<app-oj-shell [sections]="..." [breadcrumb]="..." [title]="...">` (definir las sections en el `dto.ts` como `computed` que dependa del rol del usuario).

### Tarea 2.4: Build + verificación visual

- [ ] **Step 1:** `npx ng build` limpio.
- [ ] **Step 2:** `npx ng build --configuration=production` limpio.
- [ ] **Step 3:** `npx ng serve` → `/busqueda`. Verificar: sidebar azul, topbar con breadcrumb, hero de búsqueda centrado con input mono, sección "Mis anclados" con tarjetas (vacía si no hay; tarjetas si se ancló en una sesión anterior), estado vacío al final.

### Tarea 2.5: Commit fase 2

```bash
git add sGED-frontend/src/app/core/services/anclados.service.ts sGED-frontend/src/app/core/services/anclados.service.spec.ts sGED-frontend/src/app/core/models/anclado.model.ts sGED-frontend/src/app/features/busqueda/busqueda-container/
git commit -m "feat(frontend): add anclados service + migrate busqueda hero with empty state (Phase 2 — visor redesign)"
```

---

## Fase 3 — Búsqueda con resultados + drawer de filtros

**Mockup:** `mejoras/visor-oj-navegable/busqueda-resultados.html` (leer completo antes de empezar).

### Tarea 3.1: Extender `busqueda-container.dto` con resultados

- [ ] **Step 1:** Añadir `resultados: signal<ExpedienteResultado[]>([])`, `filtrosAplicados: signal<FilterPill[]>([])`, `paginacion: signal<{ page; total; size }>(...)`, `filtersOpen: signal(false)`.
- [ ] **Step 2:** En `busqueda-container.service.ts` añadir métodos `buscar(query)`, `aplicarFiltros(filtros)`, `siguientePagina()`, `quitarFiltro(id)`. Reutilizar `BusquedaExpedientesService` ya existente (`core/services/busqueda-expedientes.service.ts`) para HTTP — **no duplicar** lógica.

### Tarea 3.2: Plantilla con tarjetas de resultados

- [ ] **Step 1:** En `component.html` reemplazar el `empty-state` por `@if (dto.mostrandoResultados()) { ... } @else { <empty-state /> }`.
- [ ] **Step 2:** Dentro del `@if`, copiar la estructura `.filters-bar` + `.results-list` con `@for` sobre `dto.resultados()` siguiendo las clases del mockup `busqueda-resultados.html`. Cada `.result-card` linkea a `/expedientes/:id`.
- [ ] **Step 3:** Paginación con `@for` de páginas + botones `[disabled]` según paginación.

### Tarea 3.3: Drawer de filtros avanzados

**Files:**
- Create: `sGED-frontend/src/app/features/busqueda/busqueda-container/components/filtros-drawer/filtros-drawer.component.ts`
- Create: `.html`, `.scss`
- Modify: `busqueda-container.component.html` (incluir el drawer)

- [ ] **Step 1:** Componente standalone, OnPush, `@Input() open: boolean`, `@Output() apply`, `@Output() clear`, `@Output() close`. Estructura visual de `busqueda.html` líneas 1389–1444.
- [ ] **Step 2:** Usar `PrimeNG Sidebar` (`<p-sidebar [(visible)]="open" position="right">`) para gestionar overlay y animación.
- [ ] **Step 3:** Aprovechar componentes ya migrados `busqueda-avanzada/components/criterios-*` (fechas, generales, referencia, sujetos) — meterlos dentro del drawer. **NO duplicar** controles.

### Tarea 3.4: Build + verificación

- [ ] **Step 1:** `npx ng build` + production limpios.
- [ ] **Step 2:** `npx ng serve` → `/busqueda`. Escribir un número, presionar Enter → aparecen resultados (mockeados si backend aún no responde). Abrir filtros → drawer derecho.

### Tarea 3.5: Commit fase 3

```bash
git add sGED-frontend/src/app/features/busqueda/
git commit -m "feat(frontend): add results list + filters drawer in busqueda (Phase 3 — visor redesign)"
```

---

## Fase 4 — Expediente: header + tab General

**Mockup:** `mejoras/visor-oj-navegable/expediente.html` (líneas 95–390 cubren el modo General).

### Tarea 4.1: Migrar `expediente-detail` header

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.component.html`
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.component.scss`
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.dto.ts` (añadir computed para el header)
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.service.ts` (transformaciones)

- [ ] **Step 1:** En `expediente-detail.dto.ts` añadir computed `headerStats` con shape `{ fechaIngreso; partes; proximaAudiencia; totalArchivos; anclados }`.
- [ ] **Step 2:** Service: enriquecer la transformación API→UI para llenar `headerStats`. Reutilizar `ExpedientesService` core para HTTP.
- [ ] **Step 3:** Reescribir el template con la estructura `.exp-header` del mockup (líneas 98–144). Envolver en `<app-oj-shell>` y `<div class="oj-theme">`.
- [ ] **Step 4:** SCSS: copiar reglas relevantes de `mejoras/visor-oj-navegable/expediente.css` (líneas 1–128), bajo `:host` y `.oj-theme`.

### Tarea 4.2: Vista General (info, partes, timeline, sidebar resumen)

**Files:**
- Create: `sGED-frontend/src/app/features/expedientes/expediente-detail/components/exp-general/exp-general.component.ts`
- Create: `.html`, `.scss`

- [ ] **Step 1:** Componente tonto con `@Input() expediente`, `@Input() resumenArchivos`, `@Input() partes`, `@Input() timeline`.
- [ ] **Step 2:** Template = `expediente.html` líneas 162–389 con sus 3 cards (información, partes intervinientes, línea de tiempo) + sidebar derecho (resumen archivos, últimos agregados).
- [ ] **Step 3:** SCSS copiado del mockup, encapsulado en `:host`.

### Tarea 4.3: Tabs General/Archivos

- [ ] **Step 1:** En `expediente-detail.component.html` añadir `.exp-mode-tabs` (mockup líneas 147–157). Por defecto `mode = signal('general')`.
- [ ] **Step 2:** Renderizar `@if (mode() === 'general') { <app-exp-general ... /> } @else { <!-- Fase 5 --> }`.
- [ ] **Step 3:** Persistir `mode` en URL como query param `?tab=general|archivos` (Angular Router).

### Tarea 4.4: Build + verificación

- [ ] **Step 1:** Build dev y prod limpios.
- [ ] **Step 2:** Navegar a `/expedientes/:id` → header institucional + tab General visible.

### Tarea 4.5: Commit fase 4

```bash
git add sGED-frontend/src/app/features/expedientes/expediente-detail/
git commit -m "feat(frontend): migrate expediente-detail header + General tab (Phase 4 — visor redesign)"
```

---

## Fase 5 — Expediente: tab Archivos + visores multi-tipo

**Mockup:** `expediente.html` líneas 395–774. Visores líneas 614–767.

### Tarea 5.1: Lista lateral de documentos con chips y categorías

**Files:**
- Create: `sGED-frontend/src/app/features/expedientes/expediente-detail/components/exp-archivos/exp-archivos.component.ts` + html + scss
- Reutilizar: `features/documentos/components/documentos-list/` (revisar si encaja o se hace nuevo).

- [ ] **Step 1:** Decisión rápida (5 min): leer `documentos-list.component.ts`. Si encaja como subcomponente con `@Input` mínimo, integrarlo. Si no, crear `exp-archivos`.
- [ ] **Step 2:** Implementar chips de tipo (`Todos | Documentos | Video | Audio | Imágenes | Solo anclados`), buscador secundario, chips de categoría judicial. Estado en el componente padre.
- [ ] **Step 3:** Lista con pin toggle. Pin llama `AncladosService.toggle(expedienteNum, doc)`. CSS hover y animación de escala según mockup CSS líneas pin (`expediente.css`).

### Tarea 5.2: Visor PDF/Word

**Files:**
- Modify: `sGED-frontend/src/app/features/documentos/components/visor-pdf/visor-pdf.component.ts` + html + scss

- [ ] **Step 1:** Reestilar el visor existente conservando la lógica de paginación y zoom. Toolbar = mockup líneas 589–611. Cuerpo del documento en `.pdf-page` con header y body institucional.
- [ ] **Step 2:** Si actualmente usa `ng2-pdf-viewer` o similar, mantenerlo. Solo cambiar wrappers visuales.

### Tarea 5.3: Visor Imagen con galería

**Files:**
- Modify: `sGED-frontend/src/app/features/documentos/components/visor-imagen/visor-imagen.component.*`

- [ ] **Step 1:** Estructura `.image-viewer-content` + thumbs (mockup líneas 647–674). Botones prev/next, click en thumb cambia imagen.
- [ ] **Step 2:** Si solo hay una imagen, ocultar los thumbs y los nav.

### Tarea 5.4: Visor Audio con waveform

**Files:**
- Modify: `sGED-frontend/src/app/features/documentos/components/reproductor-audio/reproductor-audio.component.*`

- [ ] **Step 1:** Layout `.audio-player` (mockup líneas 679–718) con icono grande, título, waveform, tiempo, controles, speed buttons.
- [ ] **Step 2:** Waveform: generar 80 barras con altura determinística (mockup líneas 858–872). Marcar "played" según `currentTime / duration`. Usar `signal` para el progreso.
- [ ] **Step 3:** Conectar `<audio>` HTML5 nativo (oculto) para reproducción; bindings via Angular event listeners (`(timeupdate)`, `(loadedmetadata)`).

### Tarea 5.5: Visor Video con controles custom

**Files:**
- Modify: `sGED-frontend/src/app/features/documentos/components/reproductor-video/reproductor-video.component.*`

- [ ] **Step 1:** Estructura `.video-player` + `.video-screen` (mockup líneas 724–767). `<video>` nativo con `controls="false"` y overlay propio.
- [ ] **Step 2:** Controles: play/pause, prev/next 10s, timeline, volumen, fullscreen.
- [ ] **Step 3:** Overlays: timestamp y cámara (datos del backend si existen, omitir si no).

### Tarea 5.6: Build + verificación

- [ ] **Step 1:** Build dev y prod limpios.
- [ ] **Step 2:** Probar los 4 tipos de archivo en un expediente. Verificar pin animation y persistencia en `localStorage`.

### Tarea 5.7: Commit fase 5

```bash
git add sGED-frontend/src/app/features/expedientes/expediente-detail/ sGED-frontend/src/app/features/documentos/
git commit -m "feat(frontend): migrate expediente Archivos tab + 4 viewers with pin support (Phase 5 — visor redesign)"
```

---

## Fase 6 — Modo presentación

**Mockup:** `mejoras/visor-oj-navegable/presentacion.html` (leer completo al empezar).

### Tarea 6.1: Crear feature `presentacion`

**Files:**
- Create: `sGED-frontend/src/app/features/presentacion/presentacion.component.ts` + .html + .scss
- Create: `presentacion.dto.ts`, `.service.ts`, `.types.ts`
- Modify: `app.routes.ts` (añadir ruta `presentacion/:expedienteNum`)

- [ ] **Step 1:** Tipos: `PresentacionDoc { id; name; type; url }`, `PresentacionState { docs; currentIdx; expediente }`.
- [ ] **Step 2:** DTO con signals: `docs`, `currentIdx`, `current` (computed), `progress` (computed).
- [ ] **Step 3:** Service: cargar los anclados del expediente desde `AncladosService` (transformar a `PresentacionDoc`). Métodos `next()`, `prev()`, `goto(idx)`, `exit()`.
- [ ] **Step 4:** Componente: layout fullscreen con `:host { position: fixed; inset: 0; background: #0f1419; z-index: 9999; }`. Mini-mapa lateral, área principal renderiza el visor según el tipo (reutilizar los 4 componentes de visor pero en modo "fullscreen").
- [ ] **Step 5:** Listener `(window:keydown.escape)="svc.exit()"` y `(window:keydown.arrowright)="svc.next()"` etc.
- [ ] **Step 6:** Bloquear scroll global mientras está montado (`document.body.style.overflow = 'hidden'` en `OnInit`, restaurar en `OnDestroy`).

### Tarea 6.2: Botón "Presentar" en expediente y en búsqueda

- [ ] **Step 1:** En `busqueda-container` y `expediente-detail`, el botón "Presentar" navega a `/presentacion/:expedienteNum`.

### Tarea 6.3: Build + verificación

- [ ] **Step 1:** Build limpio.
- [ ] **Step 2:** Probar entrada desde búsqueda, navegación con flechas y `Esc`.

### Tarea 6.4: Commit fase 6

```bash
git add sGED-frontend/src/app/features/presentacion/ sGED-frontend/src/app/app.routes.ts
git commit -m "feat(frontend): add presentacion (fullscreen mode) for anclados (Phase 6 — visor redesign)"
```

---

## Fase 7 — Usuarios admin (rediseño visual)

**Mockup:** `mejoras/visor-oj-navegable/usuarios.html` (leer al empezar).

### Tarea 7.1: Migrar `usuarios-list`

**Files:**
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuarios-list/usuarios-list.component.html`
- Modify: `.scss`
- Reutilizar `service.ts` y `dto.ts` existentes — solo reestilar.

- [ ] **Step 1:** Envolver en `<app-oj-shell>` con sidebar institucional.
- [ ] **Step 2:** Tabla con `<p-table>` PrimeNG reestilada para coincidir con el mockup (filas con avatar circular, badges de rol, acciones inline).
- [ ] **Step 3:** Modal de edición → reutilizar `usuario-form` en un `<p-dialog>` reestilado.

### Tarea 7.2: Migrar `usuario-form` y `usuario-detail`

- [ ] **Step 1:** Reestilar inputs y botones según `.oj-theme`. Mantener la lógica intacta.

### Tarea 7.3: Build + verificación + commit

```bash
git add sGED-frontend/src/app/features/admin/usuarios/
git commit -m "feat(frontend): restyle admin usuarios to institutional design (Phase 7 — visor redesign)"
```

---

## Fase 8 — Auditoría (rediseño visual)

**Mockup:** `mejoras/visor-oj-navegable/auditoria.html` (leer al empezar).

### Tarea 8.1: Migrar `auditoria-list`

**Files:**
- Modify: `sGED-frontend/src/app/features/admin/auditoria/auditoria-list/auditoria-list.component.html` + `.scss`

- [ ] **Step 1:** `<app-oj-shell>` + tabla institucional. Filtros superiores (fecha, tipo de acción, usuario) usando `<p-calendar>` y `<p-multiselect>` reestilados.
- [ ] **Step 2:** Botón "Exportar CSV/PDF" mantiene la lógica del service actual.

### Tarea 8.2: Build + commit

```bash
git add sGED-frontend/src/app/features/admin/auditoria/
git commit -m "feat(frontend): restyle admin auditoria to institutional design (Phase 8 — visor redesign)"
```

---

## Fase 9 — Reportes (feature nueva)

**Mockup:** `mejoras/visor-oj-navegable/reportes.html` (leer completo antes).

### Tarea 9.1: Crear feature `reportes`

**Files:**
- Create: `sGED-frontend/src/app/features/reportes/` con los 6 artefactos completos
- Modify: `app.routes.ts` (añadir ruta `/reportes` protegida por `AuthGuard`)

- [ ] **Step 1:** Tipos `ReporteConfig`, `ReporteResultado`, `ReporteResumen`.
- [ ] **Step 2:** DTO con signals para configuración (rango fechas, juzgado, tipo de reporte) y resultados (tabla + KPIs).
- [ ] **Step 3:** Service: por ahora, datos mock (no hay endpoint backend). Documentar TODO con `// API: endpoint pendiente` en el método HTTP placeholder. Cuando el backend lo entregue, se descomenta.
- [ ] **Step 4:** Componente con tabs/secciones: configurador izquierdo, preview derecho. Botones "Exportar PDF" / "Exportar Excel" reuse del patrón ya en auditoría si aplica.

### Tarea 9.2: Build + commit

```bash
git add sGED-frontend/src/app/features/reportes/ sGED-frontend/src/app/app.routes.ts
git commit -m "feat(frontend): add reportes feature with mocked data (Phase 9 — visor redesign)"
```

---

## Fase 10 — Dashboard / pantalla inicial

**Decisión pendiente:** el mockup no incluye un dashboard. La pantalla `dashboard.component` actual es dark theme.

### Tarea 10.1: Decisión rápida con el cliente / orquestador

- [ ] **Step 1:** Preguntar: ¿se elimina el dashboard y `/` redirige a `/busqueda`? ¿O se rediseña con el mismo lenguaje?
- [ ] **Step 2 (opción A — eliminar):** Cambiar `app.routes.ts`: `path: '', redirectTo: 'busqueda', pathMatch: 'full'`. Eliminar `features/dashboard/` y sus tests.
- [ ] **Step 2 (opción B — rediseñar):** Aplicar `<app-oj-shell>` + tarjetas resumen al dashboard. Solo reestilar.

### Tarea 10.2: Commit

```bash
git commit -m "chore(frontend): finalize dashboard decision (Phase 10 — visor redesign)"
```

---

## Fase 11 — Limpieza final

### Tarea 11.1: Evaluar uso restante del dark theme

- [ ] **Step 1:** Buscar referencias a tokens dark (`--primary`, `--surface-*`, `--bg-mesh`, etc.) en `sGED-frontend/src/app/`:
  ```bash
  npx grep -r "var(--surface-" sGED-frontend/src/app/
  npx grep -r "var(--text-primary)" sGED-frontend/src/app/
  ```
- [ ] **Step 2:** Si hay 0 referencias, se puede iniciar el reemplazo de `styles.scss` por una versión institucional. **Esto es un cambio mayor; abrir tarea separada con el orquestador antes de hacerlo.**
- [ ] **Step 3:** Si hay referencias, dejar conviviendo ambos themes hasta cubrirlas.

### Tarea 11.2: Eliminar `change-password` o reestilarlo

- [ ] **Step 1:** Decidir si entra al rediseño o no. Si entra, aplicar `<app-oj-shell>` + estilos institucionales (formulario simple, copiar patrón del login).

### Tarea 11.3: Auditoría final con `code-reviewer`

- [ ] **Step 1:** Lanzar agente `.ai/agents/code-reviewer.md` para auditar todos los componentes migrados según el checklist de `sGED-frontend/CLAUDE.md`.
- [ ] **Step 2:** Corregir issues 🔴 críticos antes del merge.

### Tarea 11.4: Commit final

```bash
git commit -m "chore(frontend): finalize visor redesign cleanup (Phase 11 — visor redesign)"
```

---

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Convivencia de 2 themes durante semanas → confusión visual | Cada componente migrado activa explícitamente `.oj-theme` en su `:host`. Sin solapamiento de tokens (prefijos distintos). |
| `PrimeNG` no permite ciertas customizaciones (ej. tabla 100% institucional) | Usar `pt:` (pass-through) de PrimeNG 21 para inyectar clases en partes internas. Si no alcanza, envolver en wrapper SCSS y atacar selectores `::ng-deep` solo en el SCSS del componente afectado. |
| Sistema de anclados sin backend → se pierde al cambiar de dispositivo | Documentado en `core/services/anclados.service.ts` con `// TODO API: cuando exista endpoint`. Mientras tanto, localStorage por usuario+navegador es aceptable para mockup funcional. |
| `mejoras/visor-oj-navegable/anclados.js` y `rol-switch.js` no se portan | Son apoyo del prototipo HTML. Sustituidos por `AncladosService` Angular y por el flujo real de autenticación. |
| `expediente.css` y demás `.css` del mockup contienen reglas pegadas (no scoped) | Al copiarlas al SCSS del componente, scopear bajo `:host` y `.oj-theme` para que no escapen. |
| Componentes ya migrados con dark theme se romperán visualmente | NO. El theme institucional es opt-in. Mientras la regla `.oj-theme` no se aplique, las pantallas siguen con dark theme. |

---

## Resumen de commits

11 commits, uno por fase:

```
Phase 0 → feat(frontend): add OJ institutional design tokens + shared shell
Phase 1 → feat(frontend): migrate login to institutional design
Phase 2 → feat(frontend): add anclados service + migrate busqueda hero with empty state
Phase 3 → feat(frontend): add results list + filters drawer in busqueda
Phase 4 → feat(frontend): migrate expediente-detail header + General tab
Phase 5 → feat(frontend): migrate expediente Archivos tab + 4 viewers with pin support
Phase 6 → feat(frontend): add presentacion (fullscreen mode) for anclados
Phase 7 → feat(frontend): restyle admin usuarios to institutional design
Phase 8 → feat(frontend): restyle admin auditoria to institutional design
Phase 9 → feat(frontend): add reportes feature with mocked data
Phase 10 → chore(frontend): finalize dashboard decision
Phase 11 → chore(frontend): finalize visor redesign cleanup
```

Cada commit es un punto de revert seguro.

---

## Estimación de esfuerzo

| Fase | Complejidad | Esfuerzo aprox |
|---|---|---|
| 0 — Infra | Baja | 1–2h |
| 1 — Login | Baja-media | 2–3h |
| 2 — Búsqueda hero + anclados | Media | 4–6h |
| 3 — Resultados + drawer | Media | 4–5h |
| 4 — Expediente General | Media | 4–5h |
| 5 — Visores multi-tipo | **Alta** | 8–12h |
| 6 — Presentación | Media-alta | 5–7h |
| 7 — Usuarios | Baja-media | 3–4h |
| 8 — Auditoría | Baja-media | 3–4h |
| 9 — Reportes | Media | 5–7h |
| 10 — Dashboard | Baja | 1–2h |
| 11 — Limpieza | Baja | 2–3h |
| **Total** | | **~45–65h** |

---

## Checklist global antes de declarar el proyecto cerrado

- [ ] Las 8 pantallas del mockup funcionan en Angular con la lógica real (no mock) donde el backend lo permita.
- [ ] `npx ng build` y `npx ng build --configuration=production` compilan sin warnings nuevos.
- [ ] Login → flujo completo funciona como antes.
- [ ] Anclados persisten entre recargas (localStorage).
- [ ] Modo presentación abre fullscreen y se sale con `Esc`.
- [ ] Tablas (usuarios, auditoría) siguen exportando.
- [ ] Auditoría `code-reviewer` aprobada (sin 🔴 críticos).
- [ ] El cliente firma la aprobación visual sobre las 8 pantallas en VPS de staging.
