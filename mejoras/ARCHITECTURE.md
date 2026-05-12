# 🏛️ Arquitectura Angular 21 — Estándar de Componentes

> **Documento maestro** del estándar de desarrollo frontend.
> Versión idiomática para **Angular 21** con **Signals**, **zoneless change detection**, **control flow nuevo** (`@if`/`@for`) y **`httpResource`**.

---

## 📑 Tabla de Contenidos

1. [Filosofía y Principios](#1-filosofía-y-principios)
2. [Estructura Global del Proyecto](#2-estructura-global-del-proyecto)
3. [Anatomía de un Componente](#3-anatomía-de-un-componente)
4. [Los 6 Artefactos por Componente](#4-los-6-artefactos-por-componente)
5. [Reglas de Cohesión y Seccionamiento](#5-reglas-de-cohesión-y-seccionamiento)
6. [El Patrón DTO con Signals](#6-el-patrón-dto-con-signals)
7. [HTTP con `httpResource`](#7-http-con-httpresource)
8. [Scopes de Servicio (local / feature / global)](#8-scopes-de-servicio)
9. [Forms en Angular 21](#9-forms-en-angular-21)
10. [Flujo de Datos (Diagramas)](#10-flujo-de-datos-diagramas)
11. [Casos de Uso Completos](#11-casos-de-uso-completos)
12. [Testing](#12-testing)
13. [Error Handling Estándar](#13-error-handling-estándar)
14. [Checklist de Code Review](#14-checklist-de-code-review)
15. [Convenciones de Nomenclatura](#15-convenciones-de-nomenclatura)
16. [Plantilla / Generador](#16-plantilla--generador)

---

## 1. Filosofía y Principios

### 🎯 Objetivo
Construir una arquitectura donde **cada archivo tiene una sola razón para cambiar**, donde el **UI funciona completamente sin backend** gracias a DTOs con datos mock, y donde el código es **idiomático de Angular 21** (signals, zoneless, control flow nuevo).

### 🧱 Principios Inviolables

| # | Principio | Por qué |
|---|-----------|---------|
| 1 | **Una responsabilidad por archivo** | Si un archivo cambia por dos razones distintas, son dos archivos |
| 2 | **El HTML vive en `.html` separado** | Preservamos type-checking, autocompletado y Angular Language Service |
| 3 | **El Service maneja TODA la lógica** | Estados, llamadas API, transformaciones, validaciones |
| 4 | **El DTO es la fuente de verdad reactiva** | Compuesto por signals. View lee `dto.x()`, Service escribe `dto.x.set(...)` |
| 5 | **Tipos centralizados en `.types.ts`** | Nunca declarar `interface`/`type` fuera de ahí |
| 6 | **Estilos en `.scss` aislados** | Cero CSS inline, cero estilos en el HTML |
| 7 | **Seccionar por cohesión, no por líneas** | Las líneas son síntoma; la cohesión es la métrica real |

### 🚫 Anti-patrones Prohibidos

- ❌ `template: '...'` inline (perdemos LSP)
- ❌ Lógica de negocio en el template (cálculos, formateos)
- ❌ Llamadas HTTP fuera del Service
- ❌ `any` como tipo (usar `unknown` si es necesario)
- ❌ Mutación de objetos del DTO sin usar `set()` / `update()` de signals
- ❌ Estados sueltos en el componente (todo va en el DTO)
- ❌ `.subscribe()` sin `takeUntilDestroyed()` (cuando se use RxJS)

---

## 2. Estructura Global del Proyecto

```
src/
├── app/
│   ├── core/                          # Singletons globales
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/                  # AuthService, ConfigService, etc.
│   │   ├── types/                     # Tipos globales (User, Permission)
│   │   └── core.providers.ts
│   │
│   ├── shared/                        # Componentes reutilizables sin estado
│   │   ├── components/                # Button, Dropdown, Modal, Table
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── types/
│   │
│   ├── features/                      # Módulos de negocio (lazy)
│   │   ├── users/
│   │   │   ├── pages/                 # Componentes inteligentes (rutas)
│   │   │   │   └── user-list/
│   │   │   │       ├── user-list.component.ts
│   │   │   │       ├── user-list.component.html
│   │   │   │       ├── user-list.component.scss
│   │   │   │       ├── user-list.types.ts
│   │   │   │       ├── user-list.dto.ts
│   │   │   │       ├── user-list.service.ts
│   │   │   │       └── components/    # Subcomponentes presentacionales
│   │   │   │           ├── user-list-header/
│   │   │   │           ├── user-list-table/
│   │   │   │           └── user-list-footer/
│   │   │   │
│   │   │   ├── data/                  # FeatureService compartido (opcional)
│   │   │   │   └── users-feature.service.ts
│   │   │   │
│   │   │   ├── components/            # Componentes locales reusables del feature
│   │   │   └── users.routes.ts
│   │   │
│   │   └── products/
│   │
│   ├── layouts/
│   │   ├── main-layout/
│   │   └── auth-layout/
│   │
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.config.ts                  # provideZonelessChangeDetection() aquí
│   └── app.routes.ts
│
├── styles/
│   ├── _tokens.scss                   # Variables CSS (colors, spacing)
│   ├── _themes.scss                   # Light / dark / brand
│   └── global.scss
│
├── assets/
└── environments/
```

### 📌 Reglas de Estructura

- **`core/`** → Importado una vez en `app.config.ts`. Singletons.
- **`shared/`** → Sin estado propio. Importable donde sea.
- **`features/`** → Autocontenido, lazy-loaded.
- **`features/<x>/pages/`** → Componentes inteligentes (orquestan Service + DTO).
- **`features/<x>/pages/<y>/components/`** → Subcomponentes presentacionales del page.
- **`features/<x>/components/`** → Subcomponentes reusables dentro del feature.
- **`features/<x>/data/`** → Servicio de feature compartido entre pages hermanas.

---

## 3. Anatomía de un Componente

Cada componente vive en **su propia carpeta** con **6 artefactos base**. Cuando el HTML o la lógica crecen, **se descompone en subcomponentes** (no en strings concatenados).

```
user-list/
├── user-list.component.ts          ← Orquestador (Angular component)
├── user-list.component.html        ← Template real con type-checking
├── user-list.component.scss        ← Estilos aislados (:host)
├── user-list.types.ts              ← Tipos, interfaces, enums
├── user-list.dto.ts                ← Estado reactivo (signals)
├── user-list.service.ts            ← Lógica + httpResource
└── components/                     ← Subcomponentes para seccionar
    ├── user-list-header/
    ├── user-list-table/
    └── user-list-footer/
```

### 🔄 Diagrama de Relaciones

```
┌────────────────────────────────────────────────────────────┐
│                user-list.component.ts                      │
│                    (ORQUESTADOR)                           │
│                                                            │
│   - Decorator @Component                                   │
│   - Inyecta el Service                                     │
│   - Expone el DTO a la vista                               │
│   - Sin lógica                                             │
└────┬───────────┬──────────────┬────────────┬───────────────┘
     │           │              │            │
     │ ref.      │ usa          │ usa        │ usa
     ▼           ▼              ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐
│ .html   │ │ .scss    │ │ .service.ts  │ │ .types.ts    │
│ Template│ │ Estilos  │ │ Lógica + API │ │ Contratos    │
└────┬────┘ └──────────┘ └──────┬───────┘ └──────────────┘
     │                          │
     │ lee signals              │ muta signals
     │                          │
     │      ┌───────────────────┘
     │      │
     ▼      ▼
   ┌─────────────┐
   │  .dto.ts    │
   │  (signals)  │ ← fuente de verdad reactiva
   └─────────────┘
```

---

## 4. Los 6 Artefactos por Componente

### 4.1 `*.component.ts` — El Orquestador

**Responsabilidad:** Declarar el componente Angular, inyectar el Service, exponer el DTO al template.

**Reglas:**
- ✅ Decorator + inject + lifecycle hooks mínimos
- ✅ Expone `dto` como `protected` para que el template lo lea
- ✅ `standalone: true` (Angular 21 lo es por defecto)
- ✅ `changeDetection: OnPush` (obligatorio en proyectos zoneless)
- ❌ NO métodos de negocio
- ❌ NO llamadas HTTP
- ❌ NO transformaciones

```typescript
// user-list.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UserListService } from './user-list.service';
import { UserListHeaderComponent } from './components/user-list-header/user-list-header.component';
import { UserListTableComponent } from './components/user-list-table/user-list-table.component';
import { UserListFooterComponent } from './components/user-list-footer/user-list-footer.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserListHeaderComponent, UserListTableComponent, UserListFooterComponent],
  providers: [UserListService],
})
export class UserListComponent {
  protected svc = inject(UserListService);
  protected dto = this.svc.dto;
}
```

> **Tamaño objetivo:** < 30 líneas.

---

### 4.2 `*.component.html` — La Vista

**Responsabilidad:** HTML puro con bindings al DTO. **Cero lógica.**

**Reglas:**
- ✅ Solo HTML + bindings Angular (`{{}}`, `@if`, `@for`, `(click)`)
- ✅ Lee SIEMPRE desde `dto.<x>()` (signals son funciones)
- ✅ Llama SIEMPRE métodos del Service (`svc.<...>()`)
- ✅ Cuando crece, **seccionar en subcomponentes**, no en strings
- ❌ NO cálculos en el template
- ❌ NO funciones inline complejas

```html
<!-- user-list.component.html -->
<section class="user-list">
  <app-user-list-header
    [searchTerm]="dto.filters().search"
    [roleOptions]="dto.roleOptions()"
    [selectedRole]="dto.filters().roleId"
    (searchChange)="svc.onSearch($event)"
    (roleChange)="svc.onRoleChange($event)"
  />

  @if (dto.isLoading()) {
    <p class="user-list__loading">Cargando usuarios…</p>
  } @else if (dto.error()) {
    <p class="user-list__error">{{ dto.error() }}</p>
  } @else {
    <app-user-list-table
      [users]="dto.filteredUsers()"
      (editClick)="svc.openModal($event)"
    />
  }

  <app-user-list-footer
    [total]="dto.totalRecords()"
    [page]="dto.page()"
    (pageChange)="svc.goToPage($event)"
  />
</section>
```

> **Cuándo seccionar en subcomponentes:**
> Si el template supera ~80 líneas, o si una sección tiene ≥3 inputs distintos lógicamente agrupados, extráela a un subcomponente presentacional con `input()` / `output()` signals.

---

### 4.3 `*.component.scss` — Los Estilos

**Responsabilidad:** Estilos aislados del componente usando `:host` y BEM o utility classes según convención del proyecto.

**Reglas:**
- ✅ Usar `:host` para el contenedor del componente
- ✅ Variables CSS de los tokens globales (`var(--spacing-md)`)
- ✅ Si crece (>200 líneas), dividir en `_partials.scss` e importar
- ❌ NO `!important`
- ❌ NO estilos inline en el template

```scss
// user-list.component.scss
:host {
  display: block;
  padding: var(--spacing-md);
}

.user-list {
  &__loading {
    color: var(--color-text-muted);
    text-align: center;
  }

  &__error {
    color: var(--color-danger);
    padding: var(--spacing-sm);
    background: var(--color-danger-bg);
    border-radius: var(--radius-sm);
  }
}
```

---

### 4.4 `*.types.ts` — Los Tipos

**Responsabilidad:** Centralizar TODOS los tipos del componente. Separar tipos **API** de tipos **UI**.

```typescript
// user-list.types.ts

// ═══ Tipos del API (lo que llega del backend) ═══
export interface UserApiResponse {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
}

export interface RoleApiResponse {
  id: number;
  name: string;
}

// ═══ Tipos del UI (lo que consume la vista) ═══
export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface DropdownOption {
  value: number | string;
  label: string;
}

export interface UserListFilters {
  search: string;
  roleId: number | null;
}

// ═══ Enums ═══
export enum LoadState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}
```

> Si crece >120 líneas, dividir: `user-list.api.types.ts` y `user-list.ui.types.ts`.

---

### 4.5 `*.dto.ts` — El Corazón Reactivo

**Responsabilidad:** Estado del componente como **signals**. Mocks iniciales para que el UI funcione sin backend. **Computed signals** para datos derivados.

**Reglas:**
- ✅ Exporta una clase con propiedades `signal()` y `computed()`
- ✅ Incluye datos mock realistas
- ✅ El View lee `dto.x()` (con paréntesis)
- ✅ El Service muta con `dto.x.set(...)` o `dto.x.update(...)`
- ❌ NO lógica (eso va en el Service)
- ❌ NO inyectar dependencias en el DTO

```typescript
// user-list.dto.ts
import { signal, computed } from '@angular/core';
import { UserRow, DropdownOption, UserListFilters, LoadState } from './user-list.types';

export class UserListDto {
  // ═══ Estado de carga ═══
  state = signal<LoadState>(LoadState.Idle);
  isLoading = computed(() => this.state() === LoadState.Loading);
  error = signal<string | null>(null);

  // ═══ Datos principales ═══
  users = signal<UserRow[]>([
    // Mock inicial — el UI ya funciona sin BE
    { id: 1, name: 'Juan Pérez', email: 'juan@demo.com', role: 'Admin', active: true },
    { id: 2, name: 'Ana López',  email: 'ana@demo.com',  role: 'Editor', active: true },
    { id: 3, name: 'Luis Soto',  email: 'luis@demo.com', role: 'Viewer', active: false },
  ]);

  // ═══ Filtros ═══
  filters = signal<UserListFilters>({
    search: '',
    roleId: null,
  });

  // ═══ Dropdowns ═══
  roleOptions = signal<DropdownOption[]>([
    { value: '', label: 'Todos los roles' },
    { value: 1, label: 'Admin (mock)' },
    { value: 2, label: 'Editor (mock)' },
    { value: 3, label: 'Viewer (mock)' },
  ]);

  // ═══ Paginación ═══
  page = signal(1);
  pageSize = signal(10);
  totalRecords = signal(3);

  // ═══ Modal ═══
  modal = signal<{ isOpen: boolean; userId: number | null }>({
    isOpen: false,
    userId: null,
  });

  // ═══ DERIVADOS (computed) ═══
  filteredUsers = computed(() => {
    const { search, roleId } = this.filters();
    const term = search.toLowerCase();
    return this.users().filter(u => {
      const matchesSearch = !term || u.name.toLowerCase().includes(term);
      const matchesRole = !roleId || u.role === this.roleLabelById(roleId);
      return matchesSearch && matchesRole;
    });
  });

  hasResults = computed(() => this.filteredUsers().length > 0);

  // ═══ Helper interno ═══
  private roleLabelById(id: number): string {
    return this.roleOptions().find(r => r.value === id)?.label ?? '';
  }
}
```

> **Por qué signals + clase y no solo signals sueltos:**
> La clase encapsula el "shape" del estado y permite instanciar una nueva por cada componente (estado local aislado). Los computed dentro de la clase resuelven derivados de forma reactiva sin código en el Service.

---

### 4.6 `*.service.ts` — La Lógica

**Responsabilidad:** Lógica del componente. HTTP via `httpResource`. Transformaciones API→UI. Actualizaciones del DTO.

**Reglas:**
- ✅ `@Injectable()` provisto en `providers: [Service]` del componente (local)
- ✅ Mantiene la instancia del DTO como propiedad pública
- ✅ Usa `httpResource` para GET reactivos
- ✅ Métodos atómicos (una acción cada uno)
- ✅ Transforma del shape del API al shape del UI antes de guardar
- ❌ NO HTML
- ❌ NO estilos

```typescript
// user-list.service.ts
import { Injectable, inject, effect } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserListDto } from './user-list.dto';
import { LoadState, UserApiResponse, RoleApiResponse } from './user-list.types';

@Injectable()
export class UserListService {
  private http = inject(HttpClient);
  public dto = new UserListDto();

  // ═══ Recursos reactivos (httpResource) ═══
  // Se re-ejecutan automáticamente cuando cambia cualquier signal del que dependen.
  private usersResource = httpResource<UserApiResponse[]>(() => {
    const { search, roleId } = this.dto.filters();
    const page = this.dto.page();
    return {
      url: '/api/users',
      params: {
        ...(search && { q: search }),
        ...(roleId && { role: String(roleId) }),
        page: String(page),
      },
    };
  });

  private rolesResource = httpResource<RoleApiResponse[]>(() => '/api/roles');

  constructor() {
    // ═══ Sincroniza el resource con el DTO ═══
    effect(() => {
      const status = this.usersResource.status();
      if (status === 'loading') {
        this.dto.state.set(LoadState.Loading);
      } else if (status === 'error') {
        this.dto.state.set(LoadState.Error);
        this.dto.error.set(this.usersResource.error()?.message ?? 'Error desconocido');
      } else if (status === 'resolved') {
        const data = this.usersResource.value();
        if (data) {
          this.dto.users.set(data.map(u => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: this.getRoleLabel(u.role_id),
            active: u.is_active,
          })));
          this.dto.state.set(LoadState.Success);
          this.dto.error.set(null);
        }
      }
    });

    effect(() => {
      const data = this.rolesResource.value();
      if (data) {
        this.dto.roleOptions.set([
          { value: '', label: 'Todos los roles' },
          ...data.map(r => ({ value: r.id, label: r.name })),
        ]);
      }
    });
  }

  // ═══ Acciones desde el View ═══
  onSearch(term: string): void {
    this.dto.filters.update(f => ({ ...f, search: term }));
  }

  onRoleChange(roleId: number | null): void {
    this.dto.filters.update(f => ({ ...f, roleId }));
  }

  goToPage(page: number): void {
    this.dto.page.set(page);
  }

  openModal(userId: number): void {
    this.dto.modal.set({ isOpen: true, userId });
  }

  closeModal(): void {
    this.dto.modal.set({ isOpen: false, userId: null });
  }

  // ═══ Mutaciones (POST/PUT/DELETE) ═══
  async deleteUser(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/users/${id}`));
      this.usersResource.reload();   // Re-trigger del listado
    } catch {
      this.dto.error.set('No se pudo eliminar el usuario');
    }
  }

  // ═══ Privados ═══
  private getRoleLabel(id: number): string {
    return this.dto.roleOptions().find(r => r.value === id)?.label ?? '—';
  }
}
```

> **Patrón clave:** los GET son **declarativos** (`httpResource` + signals como entrada). Las mutaciones (POST/PUT/DELETE) son **imperativas** (`HttpClient` + `firstValueFrom`) y al terminar llaman `resource.reload()`.

---

## 5. Reglas de Cohesión y Seccionamiento

### 📏 Criterio principal: **cohesión, no líneas**

Una buena pregunta antes de dividir:
> *"¿Este archivo cambia por más de una razón?"*

Si sí → dividir. Si no → dejar tranquilo aunque tenga 200 líneas.

### 📐 Umbrales como **referencia** (no regla dura)

| Archivo | 🟡 Revisar | 🔴 Casi seguro dividir |
|---|---|---|
| `*.component.ts` | 40 | 60 |
| `*.component.html` | 80 | 120 |
| `*.component.scss` | 150 | 250 |
| `*.types.ts` | 120 | 180 |
| `*.dto.ts` | 100 | 150 |
| `*.service.ts` | 150 | 220 |

**Cuando se acerque al umbral:**
1. Identificar si hay más de una responsabilidad
2. Si sí → dividir por responsabilidad
3. Si no → comentar en PR y dejarlo

### 🔪 Estrategias de División

#### Service muy grande → sub-services

```
user-list/
├── user-list.service.ts             ← Orquestador, delega
├── services/
│   ├── users-data.service.ts        ← httpResource de usuarios
│   ├── roles-data.service.ts        ← httpResource de roles
│   ├── filters.service.ts           ← Lógica de filtros
│   └── modal.service.ts             ← Modal
```

El orquestador recibe el DTO y lo pasa a los sub-services:

```typescript
@Injectable()
export class UserListService {
  public dto = new UserListDto();
  private users = inject(UsersDataService);
  private roles = inject(RolesDataService);

  constructor() {
    this.users.bind(this.dto);
    this.roles.bind(this.dto);
  }
}
```

#### Template muy grande → subcomponentes presentacionales

```
user-list/
├── user-list.component.html         ← Compone subcomponentes
└── components/
    ├── user-list-header/
    │   ├── user-list-header.component.ts
    │   ├── user-list-header.component.html
    │   └── user-list-header.component.scss
    ├── user-list-table/
    └── user-list-footer/
```

Cada subcomponente:
- Recibe datos con `input()` (signals)
- Emite eventos con `output()` (signals)
- NO inyecta el Service del page
- NO tiene su propio DTO (es "tonto")

```typescript
// user-list-header.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DropdownOption } from '../../user-list.types';

@Component({
  selector: 'app-user-list-header',
  templateUrl: './user-list-header.component.html',
  styleUrl: './user-list-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListHeaderComponent {
  // Inputs como signals
  searchTerm = input.required<string>();
  roleOptions = input.required<DropdownOption[]>();
  selectedRole = input<number | null>(null);

  // Outputs
  searchChange = output<string>();
  roleChange = output<number | null>();
}
```

#### DTO muy grande → sub-DTOs

```typescript
// user-list.dto.ts
import { FiltersDto } from './dto/filters.dto';
import { TableDto } from './dto/table.dto';
import { ModalDto } from './dto/modal.dto';

export class UserListDto {
  filters = new FiltersDto();
  table = new TableDto();
  modal = new ModalDto();
}

// View:    dto.filters.search()
// Service: this.dto.filters.search.set(...)
```

---

## 6. El Patrón DTO con Signals

### 💡 La idea central

El DTO es la **interfaz contractual reactiva** entre View y Service.
- **Signals** dan reactividad fina y compatibilidad con zoneless.
- **Computed** da derivados sin código en el Service.
- **Mocks iniciales** permiten que el UI funcione sin backend.

```
                  ┌──────────────────┐
                  │   DTO (signals)  │
                  │   + computed     │
                  └────────┬─────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
       LEE  │ dto.users()                 │  ESCRIBE
            ▼                             ▼  dto.users.set(...)
      ┌──────────┐                  ┌──────────┐
      │   VIEW   │                  │ SERVICE  │
      │  (HTML)  │                  │ (Lógica) │
      └──────────┘                  └─────┬────┘
                                          │
                                          │ httpResource(() => ...)
                                          ▼
                                    ┌──────────┐
                                    │   API    │
                                    └──────────┘
```

### 🎬 Flujo: cargar un dropdown desde el API

#### Paso 1 — Tipos

```typescript
// .types.ts
export interface RoleApiResponse { id: number; name: string; }
export interface DropdownOption { value: number | string; label: string; }
```

#### Paso 2 — DTO con mock

```typescript
// .dto.ts
roleOptions = signal<DropdownOption[]>([
  { value: 1, label: 'Admin (mock)' },
  { value: 2, label: 'Editor (mock)' },
]);
```
➡️ El UI ya funciona aunque el backend no exista.

#### Paso 3 — View lee del DTO

```html
<select>
  @for (r of dto.roleOptions(); track r.value) {
    <option [value]="r.value">{{ r.label }}</option>
  }
</select>
```

#### Paso 4 — Service trae del API y popula

```typescript
private rolesResource = httpResource<RoleApiResponse[]>(() => '/api/roles');

constructor() {
  effect(() => {
    const data = this.rolesResource.value();
    if (data) {
      this.dto.roleOptions.set(data.map(r => ({ value: r.id, label: r.name })));
    }
  });
}
```

### ✅ Beneficios

1. **UI funcional desde el primer commit** — mocks dan datos visibles.
2. **Desacoplamiento total** — si el backend cambia, solo cambia el `.map()`.
3. **Reactividad fina** — los `computed` se recalculan solo cuando cambia su dependencia.
4. **Zoneless-ready** — sin Zone.js, todo funciona via signals.
5. **Testing trivial** — instanciar el DTO con datos de prueba.

---

## 7. HTTP con `httpResource`

### 🌐 Por qué `httpResource`

Es la API nativa de Angular 19+ para GET declarativos. Combina HTTP + signals: la request se re-ejecuta automáticamente cuando cambia un signal del que depende.

### 📐 Patrón estándar

```typescript
// GET reactivo basado en signals
private usersResource = httpResource<UserApiResponse[]>(() => ({
  url: '/api/users',
  params: {
    q: this.dto.filters().search,
    role: this.dto.filters().roleId,
  },
}));
```

Cuando `dto.filters` cambia → `httpResource` re-ejecuta la request.

### 📥 Estados del resource

| Property | Tipo | Uso |
|---|---|---|
| `status()` | `'idle' \| 'loading' \| 'resolved' \| 'error'` | Estado actual |
| `value()` | `T \| undefined` | Datos cuando resolvió |
| `error()` | `Error \| undefined` | Error si falló |
| `isLoading()` | `boolean` | Atajo de status |
| `reload()` | método | Re-ejecuta manualmente |

### 🔁 Sincronización con el DTO

Usar `effect()` para mapear del resource al DTO con transformación:

```typescript
constructor() {
  effect(() => {
    if (this.usersResource.status() === 'resolved') {
      const data = this.usersResource.value();
      if (data) {
        this.dto.users.set(data.map(toUserRow));
      }
    }
  });
}
```

### ✏️ Mutaciones (POST/PUT/DELETE)

`httpResource` es **solo GET**. Para mutaciones, usar `HttpClient` clásico:

```typescript
async createUser(payload: UserFormPayload): Promise<void> {
  this.dto.isSubmitting.set(true);
  try {
    await firstValueFrom(this.http.post('/api/users', payload));
    this.usersResource.reload();   // Refresca el listado
  } catch {
    this.dto.error.set('Error al crear');
  } finally {
    this.dto.isSubmitting.set(false);
  }
}
```

### 🧪 Mocks durante desarrollo

Mientras el BE no existe, el `httpResource` fallará. Dos opciones:

**Opción A — Saltarse el resource si está en modo mock:**
```typescript
private usersResource = httpResource<UserApiResponse[]>(() =>
  environment.useMocks ? undefined : '/api/users'
);
```

Cuando la función retorna `undefined`, el resource queda en `idle` y el DTO conserva sus mocks.

**Opción B — Interceptor que sirve mocks:**
Un `HttpInterceptor` global que intercepta rutas `/api/*` y responde con datos fake. Más flexible, no requiere tocar los Services.

---

## 8. Scopes de Servicio

Tres niveles claros, en orden de uso preferido:

### 🟢 **Local (per-component)** — Default

Estado privado de UNA pantalla. Una instancia nueva por cada componente.

```typescript
@Injectable()  // SIN providedIn
export class UserListService { ... }

@Component({
  providers: [UserListService],   // ← Aquí
})
export class UserListComponent { ... }
```

**Cuándo:** 90% de los casos. Cada page tiene su propio Service y DTO.

### 🟡 **Feature** — Compartido entre pages hermanas

Cuando dos pages dentro del mismo feature deben compartir estado (ej: tabs que comparten filtros).

```typescript
// features/users/data/users-feature.service.ts
@Injectable()
export class UsersFeatureService { ... }

// features/users/users.routes.ts
export const usersRoutes: Routes = [
  {
    path: '',
    providers: [UsersFeatureService],   // ← Scope feature
    children: [
      { path: 'list', component: UserListComponent },
      { path: 'archive', component: UserArchiveComponent },
    ],
  },
];
```

Las dos pages reciben la misma instancia.

### 🔴 **Global (singleton)** — Excepción

Auth, theme, current user, feature flags. Cualquier cosa que viva durante toda la sesión.

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService { ... }
```

**Regla:** si dudas, empieza local. Promueve a feature/global solo cuando tengas el dolor real.

---

## 9. Forms en Angular 21

### 📋 Recomendación: **Reactive Forms tipados**

Angular 21 mejora los reactive forms con `FormGroup` tipado. Encajan así con la arquitectura:

| Pieza | Dónde vive |
|---|---|
| Definición del `FormGroup` | `*.service.ts` (es lógica) |
| Estado del form (`form.value`, `form.invalid`) | Reflejado al DTO via signal |
| Validators personalizados | `*.service.ts` o `validators/` si reusan |
| Mensajes de error | `*.dto.ts` (signal) |
| Bindings en HTML | `formGroup`, `formControlName` (sin lógica) |

### 🎬 Ejemplo

```typescript
// user-form.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { UserFormDto } from './user-form.dto';

@Injectable()
export class UserFormService {
  private http = inject(HttpClient);
  public dto = new UserFormDto();

  form = new FormGroup({
    name:   new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email:  new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    roleId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  constructor() {
    // Sincroniza estado del form al DTO (para que computed lo vea)
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.dto.isValid.set(this.form.valid));
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.dto.isSubmitting.set(true);
    try {
      await firstValueFrom(this.http.post('/api/users', this.form.getRawValue()));
      this.form.reset();
    } catch {
      this.dto.error.set('No se pudo guardar');
    } finally {
      this.dto.isSubmitting.set(false);
    }
  }
}
```

```html
<!-- user-form.component.html -->
<form [formGroup]="svc.form" (ngSubmit)="svc.submit()">
  <input formControlName="name" placeholder="Nombre" />
  <input formControlName="email" placeholder="Email" />
  <select formControlName="roleId">
    @for (r of dto.roleOptions(); track r.value) {
      <option [value]="r.value">{{ r.label }}</option>
    }
  </select>
  <button type="submit" [disabled]="!dto.isValid() || dto.isSubmitting()">
    Guardar
  </button>
</form>
```

> Cuando `@angular/forms` Signal Forms sea estable, migrar a esa API mantiene el mismo patrón pero todo es signal nativo.

---

## 10. Flujo de Datos (Diagramas)

### 10.1 Inicialización del Componente

```
USER navega a /users
        │
        ▼
┌──────────────────────────┐
│ UserListComponent ngInit │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  Service constructor     │
│  - new UserListDto()     │
│  - httpResource()        │
│  - effect() bindings     │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
  rolesResource  usersResource
   GET /roles    GET /users
       │           │
       ▼           ▼
   effect()    effect()
       │           │
       ▼           ▼
dto.roleOptions  dto.users
   .set(...)     .set(...)
       │           │
       └─────┬─────┘
             │
             ▼
   HTML re-renderiza
   (signals reactivos)
```

### 10.2 Interacción Usuario → API → UI

```
USER escribe en buscador
        │
        ▼
(input)="svc.onSearch($event)"
        │
        ▼
┌─────────────────────────────┐
│ Service.onSearch(term)      │
│  dto.filters.update(...)    │
└────────────┬────────────────┘
             │ signal cambió
             ▼
┌─────────────────────────────┐
│ usersResource recalcula     │
│ params automáticamente      │
│ y dispara GET /users?q=...  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ effect() detecta resolved   │
│ dto.users.set(transformed)  │
└────────────┬────────────────┘
             │
             ▼
HTML actualiza tabla
(solo el bloque @for)
```

### 10.3 Dependencias entre Archivos

```
                  ┌──────────────────┐
                  │ .component.ts    │
                  └────────┬─────────┘
                           │
        ┌────────────┬─────┴─────┬────────────┐
        │            │           │            │
        ▼            ▼           ▼            ▼
   ┌────────┐  ┌────────┐  ┌─────────┐  ┌─────────────┐
   │ .html  │  │ .scss  │  │.service │  │ components/ │
   └───┬────┘  └────────┘  └────┬────┘  │ (sub-cmps)  │
       │                        │        └─────────────┘
       │ binds                  │ usa
       │                        │
       └────────────┐  ┌────────┘
                    ▼  ▼
                ┌────────┐
                │  .dto  │ (signals)
                └───┬────┘
                    │
                    ▼
                ┌────────┐
                │ .types │
                └────────┘
```

---

## 11. Casos de Uso Completos

### 🎯 Caso 1 — Listado con Filtros (Reactivo Completo)

**Necesidad:** Pantalla que lista usuarios con búsqueda y filtro por rol.

**Estructura:**
```
user-list/
├── user-list.component.ts
├── user-list.component.html
├── user-list.component.scss
├── user-list.types.ts
├── user-list.dto.ts
├── user-list.service.ts
└── components/
    ├── user-list-header/
    └── user-list-table/
```

Los archivos `.types.ts`, `.dto.ts` y `.service.ts` ya están mostrados en la sección 4 — son justo este caso.

#### `user-list.component.ts`
```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UserListService } from './user-list.service';
import { UserListHeaderComponent } from './components/user-list-header/user-list-header.component';
import { UserListTableComponent } from './components/user-list-table/user-list-table.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserListHeaderComponent, UserListTableComponent],
  providers: [UserListService],
})
export class UserListComponent {
  protected svc = inject(UserListService);
  protected dto = this.svc.dto;
}
```

#### `user-list.component.html`
```html
<section class="user-list">
  <app-user-list-header
    [searchTerm]="dto.filters().search"
    [roleOptions]="dto.roleOptions()"
    [selectedRole]="dto.filters().roleId"
    (searchChange)="svc.onSearch($event)"
    (roleChange)="svc.onRoleChange($event)"
  />

  @if (dto.isLoading()) {
    <p>Cargando…</p>
  } @else if (dto.error(); as err) {
    <p class="error">{{ err }}</p>
  } @else {
    <app-user-list-table
      [users]="dto.filteredUsers()"
      (editClick)="svc.openModal($event)"
    />
  }
</section>
```

#### Subcomponente `user-list-table.component.ts`
```typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { UserRow } from '../../user-list.types';

@Component({
  selector: 'app-user-list-table',
  templateUrl: './user-list-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListTableComponent {
  users = input.required<UserRow[]>();
  editClick = output<number>();
}
```

#### `user-list-table.component.html`
```html
<table class="users-table">
  <thead>
    <tr><th>Nombre</th><th>Email</th><th>Rol</th><th></th></tr>
  </thead>
  <tbody>
    @for (u of users(); track u.id) {
      <tr [class.inactive]="!u.active">
        <td>{{ u.name }}</td>
        <td>{{ u.email }}</td>
        <td>{{ u.role }}</td>
        <td><button (click)="editClick.emit(u.id)">Editar</button></td>
      </tr>
    } @empty {
      <tr><td colspan="4">No hay usuarios</td></tr>
    }
  </tbody>
</table>
```

---

### 🎯 Caso 2 — Formulario con Dropdowns en Cascada

**Necesidad:** Crear usuario con País → Ciudad dependiente.

#### `user-form.types.ts`
```typescript
export interface CountryApi { id: number; name: string; }
export interface CityApi { id: number; name: string; country_id: number; }
export interface DropdownOption { value: number; label: string; }
```

#### `user-form.dto.ts`
```typescript
import { signal, computed } from '@angular/core';
import { DropdownOption } from './user-form.types';

export class UserFormDto {
  countries = signal<DropdownOption[]>([]);
  cities = signal<DropdownOption[]>([]);

  selectedCountryId = signal<number | null>(null);
  isSubmitting = signal(false);
  isValid = signal(false);
  error = signal<string | null>(null);

  hasCountries = computed(() => this.countries().length > 0);
  hasCities = computed(() => this.cities().length > 0);
}
```

#### `user-form.service.ts`
```typescript
import { Injectable, inject, effect } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { UserFormDto } from './user-form.dto';
import { CountryApi, CityApi } from './user-form.types';

@Injectable()
export class UserFormService {
  private http = inject(HttpClient);
  public dto = new UserFormDto();

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    countryId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    cityId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  // GET de países (siempre se carga)
  private countriesResource = httpResource<CountryApi[]>(() => '/api/countries');

  // GET de ciudades — DEPENDE del país seleccionado (signal)
  private citiesResource = httpResource<CityApi[]>(() => {
    const countryId = this.dto.selectedCountryId();
    return countryId ? { url: `/api/cities`, params: { country: countryId } } : undefined;
  });

  constructor() {
    // Sincroniza countries
    effect(() => {
      const data = this.countriesResource.value();
      if (data) {
        this.dto.countries.set(data.map(c => ({ value: c.id, label: c.name })));
      }
    });

    // Sincroniza cities
    effect(() => {
      const data = this.citiesResource.value();
      this.dto.cities.set(data?.map(c => ({ value: c.id, label: c.name })) ?? []);
    });

    // Cuando cambia el país en el form, resetear ciudad y disparar fetch
    this.form.controls.countryId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(countryId => {
        this.dto.selectedCountryId.set(countryId);
        this.form.controls.cityId.setValue(null);
      });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.dto.isSubmitting.set(true);
    try {
      await firstValueFrom(this.http.post('/api/users', this.form.getRawValue()));
      this.form.reset();
    } catch {
      this.dto.error.set('No se pudo crear el usuario');
    } finally {
      this.dto.isSubmitting.set(false);
    }
  }
}
```

#### `user-form.component.html`
```html
<form [formGroup]="svc.form" (ngSubmit)="svc.submit()">
  <input formControlName="name" placeholder="Nombre" />
  <input formControlName="email" placeholder="Email" type="email" />

  <select formControlName="countryId">
    <option [ngValue]="null">— País —</option>
    @for (c of dto.countries(); track c.value) {
      <option [ngValue]="c.value">{{ c.label }}</option>
    }
  </select>

  <select formControlName="cityId" [disabled]="!dto.hasCities()">
    <option [ngValue]="null">— Ciudad —</option>
    @for (c of dto.cities(); track c.value) {
      <option [ngValue]="c.value">{{ c.label }}</option>
    }
  </select>

  <button type="submit" [disabled]="svc.form.invalid || dto.isSubmitting()">
    @if (dto.isSubmitting()) { Guardando… } @else { Guardar }
  </button>

  @if (dto.error(); as err) {
    <p class="error">{{ err }}</p>
  }
</form>
```

> **Lo elegante:** cambiar el país del form actualiza `selectedCountryId`, el `citiesResource` lo detecta y dispara el GET automáticamente. **Cero llamadas manuales a `loadCities()`**.

---

### 🎯 Caso 3 — Modal con Detalle Lazy

**Necesidad:** Click en fila abre modal y carga detalle por ID.

#### En el DTO
```typescript
export class UserListDto {
  // ...estado anterior...
  modal = signal<{ isOpen: boolean; userId: number | null }>({
    isOpen: false, userId: null,
  });
  selectedUser = signal<UserDetail | null>(null);
  isLoadingDetail = signal(false);
}
```

#### En el Service (fragmento del modal)
```typescript
// Resource reactivo basado en modal.userId
private detailResource = httpResource<UserApiResponse>(() => {
  const userId = this.dto.modal().userId;
  return userId ? `/api/users/${userId}` : undefined;
});

constructor() {
  effect(() => {
    this.dto.isLoadingDetail.set(this.detailResource.status() === 'loading');

    const data = this.detailResource.value();
    if (data) {
      this.dto.selectedUser.set({
        id: data.id,
        name: data.full_name,
        email: data.email,
      });
    }
  });
}

openModal(id: number): void {
  this.dto.modal.set({ isOpen: true, userId: id });
  // El detailResource se dispara solo
}

closeModal(): void {
  this.dto.modal.set({ isOpen: false, userId: null });
  this.dto.selectedUser.set(null);
}
```

#### HTML del modal
```html
@if (dto.modal().isOpen) {
  <div class="modal">
    @if (dto.isLoadingDetail()) {
      <p>Cargando…</p>
    } @else if (dto.selectedUser(); as u) {
      <h3>{{ u.name }}</h3>
      <p>{{ u.email }}</p>
    }
    <button (click)="svc.closeModal()">Cerrar</button>
  </div>
}
```

---

## 12. Testing

### 📐 Qué testear de cada artefacto

| Archivo | Qué testear | Cómo |
|---|---|---|
| `*.dto.ts` | Computed derivan correctamente; mocks iniciales válidos | Test puro de TS, sin TestBed |
| `*.service.ts` | Lógica de transformación, mutaciones del DTO, validaciones | `TestBed` + `HttpClient` mock |
| `*.component.ts` | Wiring (Service inyectado, DTO expuesto) | Smoke test |
| `*.component.html` (a través del component) | Renderiza según estado del DTO; emite eventos | Component test con DTO mock |
| Subcomponentes | Inputs/outputs funcionan | Test aislado |
| `*.types.ts` | Nada (son tipos) | — |

### 🎬 Test del DTO (lo más fácil)

```typescript
// user-list.dto.spec.ts
describe('UserListDto', () => {
  it('filteredUsers respeta el filtro de búsqueda', () => {
    const dto = new UserListDto();
    dto.users.set([
      { id: 1, name: 'Juan', email: 'a', role: 'Admin', active: true },
      { id: 2, name: 'Ana',  email: 'b', role: 'Admin', active: true },
    ]);
    dto.filters.update(f => ({ ...f, search: 'Juan' }));

    expect(dto.filteredUsers().length).toBe(1);
    expect(dto.filteredUsers()[0].name).toBe('Juan');
  });
});
```

### 🎬 Test del Service

```typescript
describe('UserListService', () => {
  let service: UserListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserListService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('transforma users del API al shape del UI', () => {
    const req = httpMock.expectOne(r => r.url === '/api/users');
    req.flush([{ id: 1, full_name: 'Juan', email: 'a', role_id: 1, is_active: true }]);

    TestBed.tick();  // dispara los effects
    expect(service.dto.users()[0].name).toBe('Juan');
  });
});
```

### 🎬 Test del Componente (smoke)

```typescript
it('renderiza tabla cuando hay usuarios', () => {
  const fixture = TestBed.createComponent(UserListComponent);
  const svc = fixture.componentRef.injector.get(UserListService);
  svc.dto.users.set([{ id: 1, name: 'Juan', email: 'a', role: 'Admin', active: true }]);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Juan');
});
```

---

## 13. Error Handling Estándar

### 📐 Patrón único de errores

**Regla:** los errores se reflejan en el DTO como signal de string. La vista decide si mostrarlos.

```typescript
// .dto.ts
export class UserListDto {
  error = signal<string | null>(null);
}
```

### 🎯 Origen 1: `httpResource`

```typescript
effect(() => {
  if (this.usersResource.status() === 'error') {
    const err = this.usersResource.error();
    this.dto.error.set(formatError(err));
  } else if (this.usersResource.status() === 'resolved') {
    this.dto.error.set(null);
  }
});
```

### 🎯 Origen 2: Mutaciones (`HttpClient`)

```typescript
async deleteUser(id: number): Promise<void> {
  try {
    await firstValueFrom(this.http.delete(`/api/users/${id}`));
    this.dto.error.set(null);
  } catch (err) {
    this.dto.error.set(formatError(err));
  }
}
```

### 🎯 Helper compartido

En `core/utils/error.ts`:
```typescript
import { HttpErrorResponse } from '@angular/common/http';

export function formatError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Sin conexión';
    if (err.status === 401) return 'No autorizado';
    if (err.status === 422) return err.error?.message ?? 'Datos inválidos';
    if (err.status >= 500) return 'Error del servidor';
    return err.error?.message ?? err.message;
  }
  return 'Ocurrió un error inesperado';
}
```

### 🎯 Errores globales (interceptor)

Para errores universales (401 → redirigir a login), un `HttpInterceptor`:

```typescript
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) router.navigate(['/login']);
      return throwError(() => err);
    })
  );
};
```

---

## 14. Checklist de Code Review

### 📋 Estructura
- [ ] Carpeta del componente tiene los 6 artefactos esperados
- [ ] Nombres siguen convención `<nombre>.<rol>.ts`
- [ ] HTML grande está dividido en **subcomponentes**, no en strings
- [ ] Service grande está dividido en **sub-services**, no en archivos sueltos

### 📋 Cohesión
- [ ] Ningún archivo tiene más de una razón para cambiar
- [ ] Si un archivo está cerca de los umbrales, se justifica en el PR
- [ ] Los subcomponentes son "tontos" (solo `input()` / `output()`)

### 📋 Responsabilidades
- [ ] `.component.ts` solo orquesta
- [ ] `.component.html` no tiene cálculos ni funciones inline
- [ ] `.service.ts` contiene todas las llamadas HTTP
- [ ] `.dto.ts` tiene mocks iniciales válidos
- [ ] `.types.ts` centraliza todos los tipos del componente

### 📋 Signals & Reactividad
- [ ] El DTO usa `signal()` y `computed()`, no propiedades planas
- [ ] El View accede con paréntesis: `dto.users()`
- [ ] Los GET usan `httpResource` cuando dependen de signals
- [ ] Las mutaciones usan `HttpClient` + `firstValueFrom` + `resource.reload()`
- [ ] `changeDetection: OnPush` en todos los componentes

### 📋 Tipos
- [ ] Cero `any` (usar `unknown` si es necesario)
- [ ] Tipos `Api*` separados de tipos de UI
- [ ] El Service transforma del shape API al shape UI

### 📋 Forms
- [ ] `FormGroup` tipado declarado en el Service
- [ ] Validators en el Service o en `validators/` si se reusan
- [ ] El submit captura errores y los refleja en `dto.error`

### 📋 Estilos
- [ ] `:host` define el contenedor
- [ ] Variables CSS de tokens globales
- [ ] Sin `!important`

---

## 15. Convenciones de Nomenclatura

### Archivos

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componente | `<nombre>.component.ts` | `user-list.component.ts` |
| Template | `<nombre>.component.html` | `user-list.component.html` |
| Estilo | `<nombre>.component.scss` | `user-list.component.scss` |
| Tipos | `<nombre>.types.ts` | `user-list.types.ts` |
| DTO | `<nombre>.dto.ts` | `user-list.dto.ts` |
| Servicio | `<nombre>.service.ts` | `user-list.service.ts` |
| Sub-service | `<acción>.service.ts` | `users-data.service.ts` |
| Subcomponente | `<padre>-<sección>.component.ts` | `user-list-header.component.ts` |

### Identificadores TypeScript

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componente | `PascalCase` + `Component` | `UserListComponent` |
| Servicio | `PascalCase` + `Service` | `UserListService` |
| DTO | `PascalCase` + `Dto` | `UserListDto` |
| Interface API | `<Nombre>ApiResponse` o `<Nombre>Api` | `UserApiResponse` |
| Interface UI | `<Nombre>Row`, `<Nombre>Form` | `UserRow`, `UserForm` |
| Enum | `PascalCase` | `LoadState` |

### Signals dentro del DTO

| Tipo de dato | Convención | Ejemplo |
|---|---|---|
| Colecciones | plural | `users`, `roles` |
| Booleans | `is*`, `has*`, `can*` | `isLoading`, `hasError`, `canEdit` |
| Opciones dropdown | `<x>Options` | `roleOptions`, `countryOptions` |
| Filtros agrupados | `filters` (objeto) | `filters: { search, roleId }` |
| Modal | `modal` (objeto) | `modal: { isOpen, userId }` |
| Estado | `state` (enum) | `state: LoadState` |

---

## 16. Plantilla / Generador

### 🛠️ Script bash para nuevo componente

```bash
#!/bin/bash
# scripts/new-component.sh
# Uso: ./scripts/new-component.sh users user-list

FEATURE=$1
NAME=$2
BASE="src/app/features/$FEATURE/pages/$NAME"

mkdir -p "$BASE/components"
touch "$BASE/$NAME.component.ts"
touch "$BASE/$NAME.component.html"
touch "$BASE/$NAME.component.scss"
touch "$BASE/$NAME.types.ts"
touch "$BASE/$NAME.dto.ts"
touch "$BASE/$NAME.service.ts"

echo "✅ Componente creado en $BASE"
```

### 🧬 Templates iniciales

Crear `templates/component/` en la raíz del repo con los 6 archivos pre-llenados con la estructura mínima de cada uno. El script anterior puede copiarlos y reemplazar `__NAME__`.

```bash
# Plantilla con sustitución
sed "s/__NAME__/$NAME/g" templates/component/component.ts > "$BASE/$NAME.component.ts"
```

### 🚀 Alternativa: Schematic personalizado

Si el equipo crece, vale la pena un schematic propio:

```bash
ng generate @mi-equipo/schematics:component user-list --feature=users
```

Genera los 6 archivos + subcomponentes vacíos con la convención exacta. Inversión inicial alta pero ROI grande.

---

## 📌 Resumen Final

| Concepto | Decisión |
|---|---|
| **Componente** | 1 carpeta + 6 artefactos + `components/` para subcomponentes |
| **HTML** | Archivo `.html` separado (no strings); seccionar con subcomponentes |
| **Estilos** | Archivo `.scss` con `:host` y tokens globales |
| **DTO** | Clase con **signals** y **computed**; mocks iniciales obligatorios |
| **Service** | Lógica + `httpResource` (GET) + `HttpClient` (mutaciones) |
| **Tipos** | Centralizados en `.types.ts`, separados Api/UI |
| **Forms** | Reactive Forms tipados, definidos en el Service |
| **Change Detection** | `OnPush` siempre; preparados para zoneless |
| **Control Flow** | `@if`, `@for`, `@switch` (nuevos) |
| **Scope de Service** | Local por defecto; feature si se comparte; global solo singletons |
| **Tamaño** | Cohesión > líneas; umbrales como guía |
| **Errores** | Signal `error` en el DTO + interceptor para 401/500 |

### 🟢 Garantías de esta arquitectura

1. **Type-safety total** — Angular Language Service valida templates contra el DTO.
2. **UI funcional sin BE** — mocks en el DTO desde el primer commit.
3. **Reactividad fina** — signals + computed + httpResource.
4. **Zoneless-ready** — todo el patrón funciona sin Zone.js.
5. **Testeable** — DTO puro, Service aislado, componentes con DTO mock.
6. **Escalable** — divide por cohesión cuando duela, no antes.
7. **Onboarding rápido** — un dev nuevo entiende cualquier componente en 5 minutos.

---

> 📅 **Versión del documento:** 2.0 — Angular 21 idiomático
> 🔄 **Próxima revisión:** cuando Signal Forms sea estable
