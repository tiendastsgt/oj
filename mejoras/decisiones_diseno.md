# Decisiones de Diseño — Migración sGED al Estándar Angular 21

> Documento complementario al [implementation_plan.md](file:///C:/Users/PC/.gemini/antigravity/brain/dc60a878-80f7-49cf-bff0-f739d3dc7e5e/implementation_plan.md).
> Detalla cada decisión de diseño con contexto, código real, pros/contras y recomendación.

---

## 1. 🎨 PrimeNG — ¿Mantener o eliminar?

### ¿Qué es el dilema?

El código actual usa PrimeNG extensivamente para tablas, botones, diálogos, etc.:

```typescript
// expedientes-list.component.ts — HOY
imports: [TableModule, ButtonModule, ProgressBarModule, MessageModule, ...]
```

El piloto en `mejoras/` **NO usa PrimeNG en absoluto** — todo es HTML puro + CSS con tokens:

```html
<!-- Piloto: tabla hecha a mano -->
<table class="users-table">
  @for (u of users(); track u.id) {
    <tr><td>{{ u.name }}</td>...</tr>
  }
</table>
```

### ¿Por qué importa?

| Factor | Mantener PrimeNG | Eliminar PrimeNG |
|--------|------------------|------------------|
| **Velocidad de migración** | ✅ Más rápido — solo cambias la arquitectura interna | ❌ Más lento — reescribes UI completa |
| **Bundle size** | ❌ PrimeNG añade ~200KB+ | ✅ HTML puro es más ligero |
| **Consistencia con el estándar** | ❌ El ARCHITECTURE.md no lo contempla | ✅ 100% alineado |
| **Funcionalidad gratis** | ✅ Paginación, sort, filtros, dialogs | ❌ Tienes que reimplementarlos |
| **Riesgo** | ✅ Bajo — solo cambias arquitectura | ❌ Alto — cambias TODO |

### Recomendación

> [!TIP]
> **Mantener PrimeNG** durante la migración. El estándar de 6 artefactos (DTO, Service, types, etc.) funciona perfectamente con o sin PrimeNG. Cambiar la librería de UI al mismo tiempo que la arquitectura es duplicar el riesgo innecesariamente. Se podría eliminar PrimeNG después en una fase separada si se quisiera.

---

## 2. ⚡ Zone.js → Zoneless — ¿Cuándo hacer el switch?

### ¿Qué cambia exactamente?

Hoy el `app.config.ts` tiene:

```typescript
provideZoneChangeDetection({ eventCoalescing: true })  // ← usa Zone.js
```

El piloto usa:

```typescript
provideZonelessChangeDetection()  // ← sin Zone.js, todo via signals
```

### ¿Por qué es delicado?

Con Zone.js, Angular detecta cambios automáticamente cuando se completa una operación async (HTTP, setTimeout, etc.). **Sin Zone.js**, Angular SOLO re-renderiza cuando cambia un signal.

El código actual depende de Zone.js sin saberlo:

```typescript
// dashboard.component.ts — HOY
// Estas propiedades planas FUNCIONAN porque Zone.js detecta
// el subscribe y dispara change detection automáticamente
this.loading = true;                                    // ← propiedad plana, no signal
this.expedientesRecientes = res?.data?.content ?? [];   // ← plana
this.loading = false;                                   // ← plana
this.cdr.markForCheck();  // ← necesario por OnPush + Zone.js
```

Si se quita Zone.js **sin migrar a signals**, el componente deja de actualizarse. El `this.loading = false` no dispara re-render porque no es un signal.

Después de migrar al estándar sería:

```typescript
// dashboard.service.ts — NUEVO (con signals)
this.dto.loading.set(true);     // ← signal, dispara re-render automático
this.dto.expedientes.set(data); // ← signal
this.dto.loading.set(false);    // ← signal
// No necesitas cdr.markForCheck() ni cdr.detectChanges()
```

### Las 2 opciones

| | Switch al inicio (Fase 0) | Switch al final (Fase 6) |
|---|---|---|
| **Ventaja** | Fuerza disciplina — si algo no es signal, se rompe y lo ves inmediato | Seguro — nada se rompe durante la migración |
| **Desventaja** | Los componentes NO migrados dejan de funcionar (dashboard, expedientes, etc.) hasta que los migres | Podrías olvidar patrones que dependen de Zone.js y descubrirlos al final |
| **Práctica** | Necesitas migrar TODO de corrido o aceptar un frontend parcialmente roto | Puedes ir de a poco, un PR por componente |

### Recomendación

> [!TIP]
> **Switch al final** (después de migrar todos los componentes a signals). Así se puede mergear cada fase como un PR independiente sin romper nada. El último PR quita Zone.js y es un cambio de 1 línea.

---

## 3. 📦 Scope de migración — ¿Prueba de concepto o plan completo?

### ¿Cuánto trabajo es cada fase?

| Fase | Componentes | Estimación |
|------|------------|------------|
| **Fase 0** — Infraestructura | `error.ts`, `environment.ts`, cleanup módulos | ~1-2 horas |
| **Fase 1** — Dashboard | 1 componente monolítico → 6 artefactos + 3 subcomponentes | ~3-4 horas |
| **Fase 2** — Expedientes List | 1 componente → 6 artefactos | ~2-3 horas |
| **Fase 3** — Form & Detail | 2 componentes con forms complejos | ~4-5 horas |
| **Fase 4** — Documentos | 1 page + 5 subcomponentes existentes | ~3-4 horas |
| **Fase 5** — Admin & Búsqueda | 5 componentes | ~4-5 horas |
| **Fase 6** — Routes & Cleanup | Refactor routes, eliminar dead code, zoneless | ~2-3 horas |

**Total estimado: ~20-26 horas de trabajo.**

### ¿Por qué empezar con Fase 0+1?

El Dashboard es el caso más dramático — **360 líneas en un solo archivo** con template inline, styles inline, lógica HTTP, filtros, transformaciones, todo mezclado. Si el patrón funciona bien ahí, funciona en cualquier componente. Además:

- Establece el ejemplo concreto para el equipo
- Valida que signals + httpResource + PrimeNG (o sin él) conviven bien
- Es autocontenido — no tiene dependencias de otros features

> [!TIP]
> Después de ver el resultado del Dashboard migrado, se puede decidir si continuar con las fases restantes, ajustar el estándar, o priorizar diferente.

---

## 4. 🔌 Tipos del Backend — ¿Coinciden o no?

### El piloto asume este shape del API

```typescript
// piloto: user-list.types.ts
interface UserApiResponse {
  id: number;
  full_name: string;    // ← snake_case
  role_id: number;      // ← FK numérica
  is_active: boolean;   // ← snake_case
}
```

### El backend real (Java 21) usa este shape

```typescript
// actual: core/models/expediente.model.ts
interface ExpedienteResponse {
  id: number;
  numero: string;
  descripcion: string;        // ← camelCase
  usuarioCreacion: string;    // ← camelCase
  fechaCreacion: string;      // ← camelCase
}
```

### ¿Qué implica esto?

El patrón de `types.ts` con tipos API vs UI separados **funciona exactamente igual** — solo hay que definir los tipos API para que coincidan con lo que el backend Java realmente devuelve (camelCase). La transformación API→UI se hace igual en el `.service.ts`:

```typescript
// Así quedaría con el backend real:
private toExpedienteRow(api: ExpedienteApiResponse): ExpedienteRow {
  return {
    id: api.id,
    numero: api.numero,
    descripcion: api.descripcion || 'Sin descripción',
    usuario: api.usuarioCreacion,     // ← renombrar para la UI
    fecha: api.fechaCreacion,
  };
}
```

> [!NOTE]
> **No hay conflicto real** — simplemente los tipos del piloto son de ejemplo y los reales se adaptan al backend Java. El **patrón** es el mismo.

---

## Resumen de Recomendaciones

| Decisión | Recomendación | Razón principal |
|----------|--------------|-----------------|
| **PrimeNG** | ✅ Mantener | Reducir riesgo — un cambio a la vez |
| **Zoneless** | ✅ Al final (Fase 6) | No romper componentes no migrados |
| **Scope** | ✅ Empezar Fase 0+1 | Validar el patrón con el caso más complejo |
| **Tipos backend** | ✅ Se adaptan sin problema | El patrón es agnóstico al naming del API |
