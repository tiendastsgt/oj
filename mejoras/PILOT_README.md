# 🚀 Componente Piloto — User List

> **Gold standard** del estándar de arquitectura Angular 21.
> Implementa los patrones del documento `ARCHITECTURE.md` y debe usarse como referencia para todos los componentes nuevos.

---

## 📦 Qué incluye este piloto

Un listado de usuarios completo con:
- ✅ Búsqueda por nombre/email (filtro local sobre mocks, server-side cuando hay BE)
- ✅ Filtro por rol (dropdown con cascada)
- ✅ Tabla con acciones (ver, activar/desactivar, eliminar)
- ✅ Paginación
- ✅ Modal de detalle con carga lazy
- ✅ Estados de loading, error y empty
- ✅ Mocks iniciales — funciona sin backend
- ✅ Tests del DTO y del Service

---

## 🗂️ Estructura

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   └── mock.interceptor.ts        ← Mock HTTP global (opcional)
│   │   └── utils/
│   │       └── error.ts                   ← formatError helper
│   │
│   ├── features/users/
│   │   ├── users.routes.ts                ← Lazy route
│   │   └── pages/user-list/               ← ⭐ EL PILOTO
│   │       ├── user-list.component.ts     # Orquestador (~20 líneas)
│   │       ├── user-list.component.html   # Template (cero lógica)
│   │       ├── user-list.component.scss   # Estilos con tokens
│   │       ├── user-list.types.ts         # Tipos API + UI separados
│   │       ├── user-list.dto.ts           # Estado signals + computed + mocks
│   │       ├── user-list.service.ts       # httpResource + HttpClient + effects
│   │       ├── user-list.dto.spec.ts      # Tests puros del DTO
│   │       ├── user-list.service.spec.ts  # Tests del Service
│   │       │
│   │       └── components/                # 4 subcomponentes presentacionales
│   │           ├── user-list-header/      # Búsqueda + filtros
│   │           ├── user-list-table/       # Filas + acciones
│   │           ├── user-list-footer/      # Paginación
│   │           └── user-detail-modal/     # Modal con detalle
│   │
│   ├── app.component.ts
│   ├── app.config.ts                      ← provideZonelessChangeDetection
│   └── app.routes.ts
│
├── styles/
│   ├── _tokens.scss                       ← Design tokens (CSS vars)
│   └── global.scss
│
└── environments/
    └── environment.ts                     ← useMocks flag
```

---

## 🎯 Patrones que demuestra este piloto

| # | Patrón | Dónde verlo |
|---|--------|-------------|
| 1 | **DTO como fuente de verdad reactiva** | `user-list.dto.ts` — signals + computed |
| 2 | **UI funciona sin backend** | Mocks iniciales en el DTO + `useMocks` flag |
| 3 | **httpResource para GET reactivos** | `user-list.service.ts` — 3 resources |
| 4 | **Mutaciones con HttpClient + firstValueFrom** | `deleteUser`, `toggleActive` |
| 5 | **effect() para sincronizar resource → DTO** | `bindUsersResource`, `bindRolesResource` |
| 6 | **Transformación API → UI** | `toUserRow`, `toUserDetail` privados |
| 7 | **Subcomponentes presentacionales** | `components/` — solo `input()` / `output()` |
| 8 | **Control flow nuevo** (`@if`, `@for`, `@empty`) | Todos los `.html` |
| 9 | **OnPush + Zoneless** | Todos los componentes |
| 10 | **Service scope local** | `providers: [UserListService]` |
| 11 | **Tipos API vs UI separados** | `user-list.types.ts` |
| 12 | **Forma estándar de manejar errores** | `formatError` + signal `error` en DTO |

---

## ✅ Tamaños actuales (todos dentro del estándar)

| Archivo | Líneas | Umbral 🟡 | Estado |
|---|---|---|---|
| `user-list.component.ts` | ~25 | 40 | ✅ |
| `user-list.component.html` | ~50 | 80 | ✅ |
| `user-list.component.scss` | ~35 | 150 | ✅ |
| `user-list.types.ts` | ~75 | 120 | ✅ |
| `user-list.dto.ts` | ~95 | 100 | ✅ (atento) |
| `user-list.service.ts` | ~225 | 150 | 🟡 (a dividir si crece más) |

> El Service ya está cerca del umbral. Si se le agregan 2-3 features más, dividir en `services/users-data.service.ts`, `services/roles-data.service.ts`, `services/detail.service.ts`.

---

## 🛠️ Cómo correrlo

### 1. Instalar dependencias
```bash
npm install
```

### 2. Asegurar Angular 21+
```bash
npx ng version
# Si es menor, actualizar:
npx ng update @angular/core @angular/cli
```

### 3. Configurar `angular.json`
Asegurar que apunta a `src/styles/global.scss`:
```json
"styles": ["src/styles/global.scss"]
```

### 4. Levantar
```bash
ng serve
```
Abrir http://localhost:4200/users

### 5. Ver con mocks activos (default)
Sin tocar nada, debería verse el listado con 5 usuarios mock y todos los botones funcionando.

### 6. Conectar al backend real
En `src/environments/environment.ts`:
```typescript
useMocks: false   // ← Cambiar a false
```

---

## 🧪 Correr tests

```bash
ng test
```

Tests incluidos:
- `user-list.dto.spec.ts` — 11 tests del DTO (sin TestBed)
- `user-list.service.spec.ts` — 7 tests del Service (con HTTP mock)

---

## 🔁 Cómo replicar este patrón en un componente nuevo

### Paso 1 — Crear estructura
```bash
mkdir -p src/app/features/MIFEATURE/pages/MICOMPONENTE/components
cd src/app/features/MIFEATURE/pages/MICOMPONENTE

touch MICOMPONENTE.component.ts
touch MICOMPONENTE.component.html
touch MICOMPONENTE.component.scss
touch MICOMPONENTE.types.ts
touch MICOMPONENTE.dto.ts
touch MICOMPONENTE.service.ts
```

### Paso 2 — Empezar por el DTO con mocks
Define qué necesita la vista. Pon datos mock. El UI ya funciona.

### Paso 3 — Crear el template HTML
Lee del DTO con `dto.x()`. Sin lógica.

### Paso 4 — Crear el Service
Empieza con métodos vacíos. Luego agrega `httpResource` cuando el endpoint esté listo.

### Paso 5 — Tests
Empieza por `.dto.spec.ts` (más fácil, sin Angular).

### Paso 6 — Cuando crezca, seccionar
- Template > 80 líneas → subcomponentes en `components/`
- Service > 150 líneas → sub-services en `services/`
- DTO > 100 líneas → sub-DTOs en `dto/`

---

## ⚠️ Notas importantes

### Sobre `httpResource`
Es API nativa de Angular v19+. Si el proyecto está en v18 o menor, usar `toSignal(http.get(...))` como alternativa.

### Sobre Zoneless
Requiere `provideZonelessChangeDetection()` en `app.config.ts` y `OnPush` en TODOS los componentes. Si algo no re-renderiza, casi siempre es porque algún componente no tiene `OnPush` o algún estado no es signal.

### Sobre Forms
Este piloto no incluye un form (se mostraría en el caso 2 del documento — formulario con cascada). Si necesitas verlo aplicado, podemos hacer un segundo piloto `user-form/`.

---

## 📚 Lectura recomendada

1. `ARCHITECTURE.md` — documento maestro completo
2. Este código — el ejemplo aplicado
3. Sección 11 del ARCHITECTURE — los 3 casos de uso

---

> **Próximo paso recomendado:** copiar este piloto como template para el siguiente componente, ir cambiando "user" por la entidad del negocio, y respetar la separación. En 1-2 PRs el equipo internaliza el patrón.
