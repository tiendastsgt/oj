# Demo Mode — Mocks en DTOs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que el frontend SGED funcione completamente sin backend con `environment.useMocks = true`, mostrando los mismos 6 expedientes, 3 usuarios, y 8 entradas de auditoría del seed real del backend OJ Guatemala.

**Architecture:** Se crean 5 archivos de constantes en `src/app/core/mocks/`. Los DTOs importan esas constantes como valor inicial de sus signals. Cada feature service añade `if (environment.useMocks) return;` antes de sus llamadas HTTP. `environment.prod.ts` no se toca.

**Tech Stack:** Angular 21, TypeScript, signals, `environment.ts` flag.

---

## Mapa de archivos

| Tarea | Archivos | Acción |
|-------|----------|--------|
| 1 | `src/app/core/mocks/catalogos.mock.ts` | Crear |
| 2 | `src/app/core/mocks/expedientes.mock.ts` | Crear |
| 3 | `src/app/core/mocks/documentos.mock.ts` | Crear |
| 4 | `src/app/core/mocks/usuarios.mock.ts` | Crear |
| 5 | `src/app/core/mocks/auditoria.mock.ts` | Crear |
| 6 | `src/environments/environment.ts` | Modificar (`useMocks: true`) |
| 6 | `features/dashboard/dashboard.dto.ts` | Modificar |
| 6 | `features/dashboard/dashboard.service.ts` | Modificar |
| 7 | `features/expedientes/expedientes-list/expedientes-list.dto.ts` | Modificar |
| 7 | `features/expedientes/expedientes-list/expedientes-list.service.ts` | Modificar |
| 8 | `features/expedientes/expediente-form/expediente-form.dto.ts` | Modificar |
| 8 | `features/expedientes/expediente-form/expediente-form.service.ts` | Modificar |
| 9 | `features/expedientes/expediente-detail/expediente-detail.dto.ts` | Modificar |
| 9 | `features/expedientes/expediente-detail/expediente-detail.service.ts` | Modificar |
| 10 | `features/expedientes/documentos-list/documentos-list.dto.ts` | Modificar |
| 10 | `features/expedientes/documentos-list/documentos-list.service.ts` | Modificar |
| 10 | `features/expedientes/documento-viewer/documento-viewer.dto.ts` | Modificar |
| 10 | `features/expedientes/documento-viewer/documento-viewer.service.ts` | Modificar |
| 11 | `features/documentos/documentos-page.dto.ts` | Modificar |
| 11 | `features/documentos/documentos-page.service.ts` | Modificar |
| 12 | `features/admin/usuarios/usuarios-list/usuarios-list.dto.ts` | Modificar |
| 12 | `features/admin/usuarios/usuarios-list/usuarios-list.service.ts` | Modificar |
| 13 | `features/admin/usuarios/usuario-form/usuario-form.dto.ts` | Modificar |
| 13 | `features/admin/usuarios/usuario-form/usuario-form.service.ts` | Modificar |
| 13 | `features/admin/usuarios/usuario-detail/usuario-detail.dto.ts` | Modificar |
| 13 | `features/admin/usuarios/usuario-detail/usuario-detail.service.ts` | Modificar |
| 14 | `features/admin/auditoria/auditoria-list/auditoria-list.dto.ts` | Modificar |
| 14 | `features/admin/auditoria/auditoria-list/auditoria-list.service.ts` | Modificar |
| 15 | `features/busqueda/busqueda-rapida/busqueda-rapida.dto.ts` | Modificar |
| 16 | Build final + verificación visual | Verificar |

---

## Task 1: Crear `catalogos.mock.ts`

**Files:**
- Create: `sGED-frontend/src/app/core/mocks/catalogos.mock.ts`

- [ ] **Step 1.1: Crear el archivo con los 9 tipos de proceso, 3 estados y 1 juzgado reales del seed**

```typescript
// sGED-frontend/src/app/core/mocks/catalogos.mock.ts
import { TipoProceso, EstadoExpediente, Juzgado } from '../models/catalogos.model';

export const MOCK_TIPOS_PROCESO: TipoProceso[] = [
  { id: 1, nombre: 'Civil' },
  { id: 2, nombre: 'Penal' },
  { id: 3, nombre: 'Laboral' },
  { id: 4, nombre: 'Familia' },
  { id: 5, nombre: 'Mercantil' },
  { id: 6, nombre: 'Niñez y Adolescencia' },
  { id: 7, nombre: 'Femicidio y VCM' },
  { id: 8, nombre: 'Contencioso Administrativo' },
  { id: 9, nombre: 'Económico Coactivo' },
];

export const MOCK_ESTADOS: EstadoExpediente[] = [
  { id: 1, nombre: 'ACTIVO' },
  { id: 2, nombre: 'CERRADO' },
  { id: 3, nombre: 'PENDIENTE' },
];

export const MOCK_JUZGADOS: Juzgado[] = [
  { id: 1, nombre: 'Juzgado General de Pruebas' },
];
```

- [ ] **Step 1.2: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: `Build at: ... - Hash: ...` sin errores.

- [ ] **Step 1.3: Commit**

```bash
git add sGED-frontend/src/app/core/mocks/catalogos.mock.ts
git commit -m "feat(frontend): add catalogos mock constants (9 tipos proceso, 3 estados, 1 juzgado)"
```

---

## Task 2: Crear `expedientes.mock.ts`

**Files:**
- Create: `sGED-frontend/src/app/core/mocks/expedientes.mock.ts`

- [ ] **Step 2.1: Crear los 6 expedientes exactos del seed backend**

```typescript
// sGED-frontend/src/app/core/mocks/expedientes.mock.ts
import { ExpedienteResponse } from '../models/expediente.model';

export const MOCK_EXPEDIENTES: ExpedienteResponse[] = [
  {
    id: 1,
    numero: '01173-2026-00045',
    tipoProcesoId: 1,
    juzgadoId: 1,
    estadoId: 1,
    fechaInicio: '2026-04-19',
    descripcion: 'Juicio Ordinario de Daños y Perjuicios',
    actorPrincipal: 'María García López',
    demandado: 'Construcciones Rápidas S.A.',
    usuarioCreacion: 'admin.qa',
    fechaCreacion: '2026-04-19T08:30:00',
    totalDocumentos: 5,
  },
  {
    id: 2,
    numero: '01108-2026-01234',
    tipoProcesoId: 2,
    juzgadoId: 1,
    estadoId: 1,
    fechaInicio: '2026-04-10',
    descripcion: 'Proceso Penal por Estafa Propia',
    actorPrincipal: 'Ministerio Público',
    demandado: 'Carlos Rodríguez Estrada',
    usuarioCreacion: 'admin.qa',
    fechaCreacion: '2026-04-10T10:15:00',
    totalDocumentos: 6,
  },
  {
    id: 3,
    numero: '01024-2026-00088',
    tipoProcesoId: 3,
    juzgadoId: 1,
    estadoId: 1,
    fechaInicio: '2026-04-05',
    descripcion: 'Juicio Ordinario Laboral por Despido Injustificado',
    actorPrincipal: 'Ana Lucía Pérez Morales',
    demandado: 'Empresa Textil Guatemala S.A.',
    usuarioCreacion: 'secretario.qa',
    fechaCreacion: '2026-04-05T09:00:00',
    totalDocumentos: 3,
  },
  {
    id: 4,
    numero: '01044-2026-00321',
    tipoProcesoId: 4,
    juzgadoId: 1,
    estadoId: 1,
    fechaInicio: '2026-04-12',
    descripcion: 'Pensión Alimenticia Provisional',
    actorPrincipal: 'Sofía Mendoza de López',
    demandado: 'Roberto López Juárez',
    usuarioCreacion: 'secretario.qa',
    fechaCreacion: '2026-04-12T11:00:00',
    totalDocumentos: 3,
  },
  {
    id: 5,
    numero: '01069-2026-00012',
    tipoProcesoId: 7,
    juzgadoId: 1,
    estadoId: 3,
    fechaInicio: '2026-04-08',
    descripcion: 'Femicidio en grado de tentativa — Decreto 22-2008',
    actorPrincipal: 'Ministerio Público',
    demandado: 'Jorge Vásquez Ramírez',
    usuarioCreacion: 'admin.qa',
    fechaCreacion: '2026-04-08T07:45:00',
    totalDocumentos: 3,
  },
  {
    id: 6,
    numero: '01075-2025-00992',
    tipoProcesoId: 5,
    juzgadoId: 1,
    estadoId: 2,
    fechaInicio: '2025-11-20',
    descripcion: 'Ejecución Mercantil por Cobro de Pagaré',
    actorPrincipal: 'Banco de Guatemala',
    demandado: 'Importaciones del Sur S.A.',
    usuarioCreacion: 'admin.qa',
    fechaCreacion: '2025-11-20T14:30:00',
    totalDocumentos: 2,
  },
];

// Expediente de referencia para vistas de detalle (el primero, 5 docs PDF)
export const MOCK_EXPEDIENTE_DETALLE: ExpedienteResponse = MOCK_EXPEDIENTES[0];
```

- [ ] **Step 2.2: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 2.3: Commit**

```bash
git add sGED-frontend/src/app/core/mocks/expedientes.mock.ts
git commit -m "feat(frontend): add expedientes mock constants (6 expedientes del seed backend)"
```

---

## Task 3: Crear `documentos.mock.ts`

**Files:**
- Create: `sGED-frontend/src/app/core/mocks/documentos.mock.ts`

- [ ] **Step 3.1: Crear los 5 documentos del expediente id:1 (todos PDF, para el visor)**

```typescript
// sGED-frontend/src/app/core/mocks/documentos.mock.ts
import { Documento } from '../../features/documentos/models/documento.model';

export const MOCK_DOCUMENTOS_EXP1: Documento[] = [
  {
    id: 1,
    expedienteId: 1,
    expedienteNumero: '01173-2026-00045',
    nombreOriginal: 'Demanda_Inicial.pdf',
    tipoDocumento: 'Demanda',
    tipoDocumentoId: 1,
    tamanio: 250880,
    mimeType: 'application/pdf',
    extension: 'pdf',
    categoria: 'pdf',
    usuarioCreacion: 'secretario.qa',
    fechaCreacion: '2026-04-19T09:00:00',
  },
  {
    id: 2,
    expedienteId: 1,
    expedienteNumero: '01173-2026-00045',
    nombreOriginal: 'Resolucion_Admision.pdf',
    tipoDocumento: 'Auto',
    tipoDocumentoId: 9,
    tamanio: 193536,
    mimeType: 'application/pdf',
    extension: 'pdf',
    categoria: 'pdf',
    usuarioCreacion: 'juez.qa',
    fechaCreacion: '2026-04-20T10:30:00',
  },
  {
    id: 3,
    expedienteId: 1,
    expedienteNumero: '01173-2026-00045',
    nombreOriginal: 'Contestacion_Demanda.pdf',
    tipoDocumento: 'Contestación de demanda',
    tipoDocumentoId: 2,
    tamanio: 319488,
    mimeType: 'application/pdf',
    extension: 'pdf',
    categoria: 'pdf',
    usuarioCreacion: 'secretario.qa',
    fechaCreacion: '2026-04-25T11:00:00',
  },
  {
    id: 4,
    expedienteId: 1,
    expedienteNumero: '01173-2026-00045',
    nombreOriginal: 'Cedula_Notificacion.pdf',
    tipoDocumento: 'Cédula de notificación',
    tipoDocumentoId: 17,
    tamanio: 100352,
    mimeType: 'application/pdf',
    extension: 'pdf',
    categoria: 'pdf',
    usuarioCreacion: 'secretario.qa',
    fechaCreacion: '2026-04-26T08:15:00',
  },
  {
    id: 5,
    expedienteId: 1,
    expedienteNumero: '01173-2026-00045',
    nombreOriginal: 'Sentencia_Ordinario.pdf',
    tipoDocumento: 'Sentencia',
    tipoDocumentoId: 11,
    tamanio: 430080,
    mimeType: 'application/pdf',
    extension: 'pdf',
    categoria: 'pdf',
    usuarioCreacion: 'juez.qa',
    fechaCreacion: '2026-05-10T16:00:00',
  },
];

// Documento de referencia para el visor (la demanda inicial)
export const MOCK_DOCUMENTO_VIEWER: Documento = MOCK_DOCUMENTOS_EXP1[0];
```

- [ ] **Step 3.2: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 3.3: Commit**

```bash
git add sGED-frontend/src/app/core/mocks/documentos.mock.ts
git commit -m "feat(frontend): add documentos mock constants (5 docs PDF del expediente id:1)"
```

---

## Task 4: Crear `usuarios.mock.ts`

**Files:**
- Create: `sGED-frontend/src/app/core/mocks/usuarios.mock.ts`

- [ ] **Step 4.1: Crear los 3 usuarios del seed**

```typescript
// sGED-frontend/src/app/core/mocks/usuarios.mock.ts
import { UsuarioAdminResponse } from '../models/admin-usuarios.model';

export const MOCK_USUARIOS: UsuarioAdminResponse[] = [
  {
    id: 1,
    username: 'admin.qa',
    nombreCompleto: 'Administrador QA',
    email: 'admin.qa@oj.gob.gt',
    rol: 'ADMINISTRADOR',
    juzgado: 'Juzgado General de Pruebas',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-04-01T00:00:00',
    fechaModificacion: '2026-04-01T00:00:00',
  },
  {
    id: 2,
    username: 'secretario.qa',
    nombreCompleto: 'Secretario QA',
    email: 'secretario.qa@oj.gob.gt',
    rol: 'SECRETARIO',
    juzgado: 'Juzgado General de Pruebas',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-04-01T00:00:00',
    fechaModificacion: '2026-04-01T00:00:00',
  },
  {
    id: 3,
    username: 'juez.qa',
    nombreCompleto: 'Juez QA',
    email: 'juez.qa@oj.gob.gt',
    rol: 'JUEZ',
    juzgado: 'Juzgado General de Pruebas',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-04-01T00:00:00',
    fechaModificacion: '2026-04-01T00:00:00',
  },
];

// Usuario de referencia para vistas de detalle
export const MOCK_USUARIO_DETALLE: UsuarioAdminResponse = MOCK_USUARIOS[0];

// Opciones de juzgado para el formulario de usuario
export const MOCK_JUZGADO_OPTIONS = [
  { label: 'Juzgado General de Pruebas', value: 1 },
];
```

- [ ] **Step 4.2: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 4.3: Commit**

```bash
git add sGED-frontend/src/app/core/mocks/usuarios.mock.ts
git commit -m "feat(frontend): add usuarios mock constants (3 usuarios del seed)"
```

---

## Task 5: Crear `auditoria.mock.ts`

**Files:**
- Create: `sGED-frontend/src/app/core/mocks/auditoria.mock.ts`

- [ ] **Step 5.1: Crear 8 entradas de auditoría realistas**

```typescript
// sGED-frontend/src/app/core/mocks/auditoria.mock.ts
import { AuditoriaResponse } from '../models/auditoria.model';

export const MOCK_AUDITORIA: AuditoriaResponse[] = [
  {
    id: 1,
    fecha: '2026-04-19T09:05:00',
    usuario: 'admin.qa',
    ip: '192.168.1.10',
    accion: 'CREATE',
    modulo: 'EXPEDIENTES',
    recursoId: 1,
    detalle: 'Expediente 01173-2026-00045 creado',
  },
  {
    id: 2,
    fecha: '2026-04-19T09:15:00',
    usuario: 'secretario.qa',
    ip: '192.168.1.11',
    accion: 'UPLOAD',
    modulo: 'DOCUMENTOS',
    recursoId: 1,
    detalle: 'Documento Demanda_Inicial.pdf subido al expediente 01173-2026-00045',
  },
  {
    id: 3,
    fecha: '2026-04-10T10:20:00',
    usuario: 'admin.qa',
    ip: '192.168.1.10',
    accion: 'CREATE',
    modulo: 'EXPEDIENTES',
    recursoId: 2,
    detalle: 'Expediente 01108-2026-01234 creado',
  },
  {
    id: 4,
    fecha: '2026-04-10T10:30:00',
    usuario: 'juez.qa',
    ip: '192.168.1.12',
    accion: 'LOGIN',
    modulo: 'AUTH',
    detalle: 'Inicio de sesión exitoso',
  },
  {
    id: 5,
    fecha: '2026-04-20T11:00:00',
    usuario: 'juez.qa',
    ip: '192.168.1.12',
    accion: 'UPLOAD',
    modulo: 'DOCUMENTOS',
    recursoId: 2,
    detalle: 'Documento Auto_Medida_Cautelar.pdf subido al expediente 01108-2026-01234',
  },
  {
    id: 6,
    fecha: '2026-05-10T16:05:00',
    usuario: 'admin.qa',
    ip: '192.168.1.10',
    accion: 'UPDATE',
    modulo: 'EXPEDIENTES',
    recursoId: 6,
    detalle: 'Estado del expediente 01075-2025-00992 cambiado a CERRADO',
  },
  {
    id: 7,
    fecha: '2026-05-10T16:30:00',
    usuario: 'juez.qa',
    ip: '192.168.1.12',
    accion: 'UPLOAD',
    modulo: 'DOCUMENTOS',
    recursoId: 1,
    detalle: 'Documento Sentencia_Ordinario.pdf subido al expediente 01173-2026-00045',
  },
  {
    id: 8,
    fecha: '2026-05-15T09:00:00',
    usuario: 'admin.qa',
    ip: '192.168.1.10',
    accion: 'RESET_PASSWORD',
    modulo: 'USUARIOS',
    recursoId: 2,
    detalle: 'Contraseña del usuario secretario.qa restablecida',
  },
];
```

- [ ] **Step 5.2: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 5.3: Commit**

```bash
git add sGED-frontend/src/app/core/mocks/auditoria.mock.ts
git commit -m "feat(frontend): add auditoria mock constants (8 entradas realistas)"
```

---

## Task 6: Activar flag + Dashboard

**Files:**
- Modify: `sGED-frontend/src/environments/environment.ts`
- Modify: `sGED-frontend/src/app/features/dashboard/dashboard.dto.ts`
- Modify: `sGED-frontend/src/app/features/dashboard/dashboard.service.ts`

- [ ] **Step 6.1: Activar `useMocks: true` en environment.ts**

Reemplazar el contenido completo del archivo:

```typescript
// sGED-frontend/src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080/api/v1',
  useMocks: true
};
```

- [ ] **Step 6.2: Actualizar `dashboard.dto.ts` con mocks reales**

`ExpedienteEstadisticas` viene de `../../core/services/expedientes.service`. Los campos son: `totalExpedientes`, `pendientes`, `enProceso`, `resueltos`, `archivados`.

Reemplazar el contenido completo:

```typescript
// sGED-frontend/src/app/features/dashboard/dashboard.dto.ts
import { signal, computed } from '@angular/core';
import { ExpedienteEstadisticas } from '../../core/services/expedientes.service';
import { ExpedienteResponse } from '../../core/models/expediente.model';
import { AuditoriaResponse } from '../../core/models/auditoria.model';
import { MOCK_EXPEDIENTES } from '../../core/mocks/expedientes.mock';
import { MOCK_AUDITORIA } from '../../core/mocks/auditoria.mock';

export class DashboardDto {
  // ─── Identidad ───────────────────────────────────────────────
  userName = signal('');
  today    = signal(new Date());

  // ─── KPI stats ───────────────────────────────────────────────
  stats = signal<ExpedienteEstadisticas>({
    totalExpedientes: 6,
    pendientes:       1,
    enProceso:        4,
    resueltos:        1,
    archivados:       0,
  });

  // ─── Expedientes recientes ────────────────────────────────────
  loading              = signal(false);
  expedientesRecientes = signal<ExpedienteResponse[]>(MOCK_EXPEDIENTES.slice(0, 5));
  hasExpedientes       = computed(() => this.expedientesRecientes().length > 0);

  // ─── Actividad (auditoría) ────────────────────────────────────
  loadingAuditoria  = signal(false);
  actividadReciente = signal<AuditoriaResponse[]>(MOCK_AUDITORIA.slice(0, 5));
  hasActividad      = computed(() => this.actividadReciente().length > 0);
}
```

> Nota: `loading` pasa de `true` a `false` y `loadingAuditoria` de `true` a `false` porque los mocks ya están cargados.

- [ ] **Step 6.3: Añadir guard en `dashboard.service.ts`**

Localizar el constructor e insertar `if (environment.useMocks) return;` después de `initUserName()`:

```typescript
// sGED-frontend/src/app/features/dashboard/dashboard.service.ts
// AÑADIR al inicio de los imports:
import { environment } from '../../../environments/environment';

// MODIFICAR el constructor:
constructor() {
  this.initUserName();
  if (environment.useMocks) return;
  this.cargarEstadisticas();
  this.observarFiltros();
  this.cargarAuditoria();
}
```

- [ ] **Step 6.4: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 6.5: Commit**

```bash
git add sGED-frontend/src/environments/environment.ts \
        sGED-frontend/src/app/features/dashboard/dashboard.dto.ts \
        sGED-frontend/src/app/features/dashboard/dashboard.service.ts
git commit -m "feat(frontend): enable useMocks flag and apply demo data to Dashboard"
```

---

## Task 7: Expedientes-List

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/expedientes-list/expedientes-list.dto.ts`
- Modify: `sGED-frontend/src/app/features/expedientes/expedientes-list/expedientes-list.service.ts`

- [ ] **Step 7.1: Actualizar `expedientes-list.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/expedientes/expedientes-list/expedientes-list.dto.ts
import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, Juzgado } from '../../../core/models/catalogos.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ExpedienteListFilters, ListPagination, LoadState } from './expedientes-list.types';
import { MOCK_EXPEDIENTES } from '../../../core/mocks/expedientes.mock';
import { MOCK_TIPOS_PROCESO, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedientesListDto {
  state = signal<LoadState>(LoadState.Idle);
  error = signal<string | null>(null);

  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expedientes  = signal<ExpedienteResponse[]>(MOCK_EXPEDIENTES);
  totalRecords = signal(MOCK_EXPEDIENTES.length);

  pagination = signal<ListPagination>({
    page: 0,
    rows: 10,
    first: 0,
    sortField: 'fechaCreacion',
    sortDir: 'desc',
  });

  tiposProceso = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  juzgados     = signal<Juzgado[]>(MOCK_JUZGADOS);
  currentUser  = signal<AuthUser | null>(null);

  filters = signal<ExpedienteListFilters>({
    search: '',
    estadoId: null,
    juzgadoId: null,
  });
}
```

- [ ] **Step 7.2: Añadir guard en `expedientes-list.service.ts`**

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../environments/environment';

// MODIFICAR el constructor:
constructor() {
  this.dto.currentUser.set(this.authService.getCurrentUser());
  if (environment.useMocks) return;
  this.cargarCatalogos();
  // cargarExpedientes() lo dispara el primer evento onLazyLoad de p-table
}
```

- [ ] **Step 7.3: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 7.4: Commit**

```bash
git add sGED-frontend/src/app/features/expedientes/expedientes-list/expedientes-list.dto.ts \
        sGED-frontend/src/app/features/expedientes/expedientes-list/expedientes-list.service.ts
git commit -m "feat(frontend): apply demo mocks to expedientes-list"
```

---

## Task 8: Expediente-Form

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-form/expediente-form.dto.ts`
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-form/expediente-form.service.ts`

- [ ] **Step 8.1: Actualizar `expediente-form.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/expedientes/expediente-form/expediente-form.dto.ts
import { signal, computed } from '@angular/core';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { FormMode, LoadState } from './expediente-form.types';
import { MOCK_TIPOS_PROCESO, MOCK_ESTADOS, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedienteFormDto {
  state          = signal<LoadState>(LoadState.Idle);
  isLoading      = computed(() => this.state() === LoadState.Loading);

  errors         = signal<string[]>([]);
  successMessage = signal<string>('');

  mode           = signal<FormMode>('create');
  isEditMode     = computed(() => this.mode() === 'edit');

  tiposProceso   = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  estados        = signal<EstadoExpediente[]>(MOCK_ESTADOS);
  juzgados       = signal<Juzgado[]>(MOCK_JUZGADOS);
}
```

- [ ] **Step 8.2: Añadir guard en `expediente-form.service.ts`**

Leer el archivo actual para identificar el constructor. El servicio carga catálogos y opcionalmente carga el expediente a editar (si hay id en la ruta). El guard va antes de las llamadas HTTP pero después de leer la ruta.

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../environments/environment';
```

Localizar el bloque del constructor. Buscar la línea donde se inicia la carga de catálogos (usualmente `this.cargarCatalogos()`) y anteponer el guard:

```typescript
constructor() {
  // ... lectura de ruta (sin cambio)
  if (environment.useMocks) return;
  this.cargarCatalogos();
  // ... resto sin cambio
}
```

> Nota: Si el constructor lee parámetros de ruta con `this.route.params.pipe(...)`, ese bloque debe conservarse tal cual. El guard `return` solo salta las llamadas HTTP que cargan catálogos y datos del expediente a editar.

- [ ] **Step 8.3: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 8.4: Commit**

```bash
git add sGED-frontend/src/app/features/expedientes/expediente-form/expediente-form.dto.ts \
        sGED-frontend/src/app/features/expedientes/expediente-form/expediente-form.service.ts
git commit -m "feat(frontend): apply demo mocks to expediente-form"
```

---

## Task 9: Expediente-Detail

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.dto.ts`
- Modify: `sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.service.ts`

- [ ] **Step 9.1: Actualizar `expediente-detail.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.dto.ts
import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { Documento } from '../../documentos/models/documento.model';
import { OjShellSection, OjShellUser, OjShellBreadcrumbItem } from '../../../shared/components/oj-shell/oj-shell.types';
import { LoadState, ExpedienteTab, ExpedienteHeaderStats } from './expediente-detail.types';
import { MOCK_EXPEDIENTE_DETALLE } from '../../../core/mocks/expedientes.mock';
import { MOCK_TIPOS_PROCESO, MOCK_ESTADOS, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedienteDetailDto {
  state     = signal<LoadState>(LoadState.Idle);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expediente   = signal<ExpedienteResponse | null>(MOCK_EXPEDIENTE_DETALLE);
  errorMessage = signal<string>('');

  tiposProceso = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  estados      = signal<EstadoExpediente[]>(MOCK_ESTADOS);
  juzgados     = signal<Juzgado[]>(MOCK_JUZGADOS);

  selectedDocumento = signal<Documento | null>(null);
  readingModeActive = signal<boolean>(false);

  mode         = signal<ExpedienteTab>('general');
  ancladosCount = signal<number>(0);

  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);
  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Consulta', route: '/busqueda' },
    { label: 'Expedientes', route: '/expedientes' },
    { label: 'Detalle' }
  ];

  readonly headerStats = computed<ExpedienteHeaderStats>(() => {
    const e = this.expediente();
    const partes = [e?.actorPrincipal, e?.demandado].filter(Boolean).join(' · ');
    return {
      fechaIngreso: e ? String(e.fechaInicio) : '',
      partes: partes || 'N/D',
      totalArchivos: e?.totalDocumentos ?? 0,
      ancladosCount: this.ancladosCount(),
    };
  });
}
```

- [ ] **Step 9.2: Añadir guard en `expediente-detail.service.ts`**

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../environments/environment';

// MODIFICAR el constructor — el guard va después de leer el usuario y ANTES de cargar datos HTTP:
constructor() {
  // ... initShell() o initUser() síncronos si existen (sin cambio)
  if (environment.useMocks) return;
  // ... cargarExpediente(), cargarCatalogos(), etc. (sin cambio)
}
```

- [ ] **Step 9.3: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 9.4: Commit**

```bash
git add sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.dto.ts \
        sGED-frontend/src/app/features/expedientes/expediente-detail/expediente-detail.service.ts
git commit -m "feat(frontend): apply demo mocks to expediente-detail"
```

---

## Task 10: Documentos-List y Documento-Viewer (en expedientes)

**Files:**
- Modify: `sGED-frontend/src/app/features/expedientes/documentos-list/documentos-list.dto.ts`
- Modify: `sGED-frontend/src/app/features/expedientes/documentos-list/documentos-list.service.ts`
- Modify: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.dto.ts`
- Modify: `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.service.ts`

- [ ] **Step 10.1: Actualizar `documentos-list.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/expedientes/documentos-list/documentos-list.dto.ts
import { signal } from '@angular/core';
import { Documento } from '../../documentos/models/documento.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { MOCK_DOCUMENTOS_EXP1 } from '../../../core/mocks/documentos.mock';

export class DocumentosListDto {
  readonly documentos     = signal<Documento[]>(MOCK_DOCUMENTOS_EXP1);
  readonly loading        = signal(false);
  readonly uploading      = signal(false);
  readonly progress       = signal(0);
  readonly errorMessages  = signal<string[]>([]);
  readonly currentUser    = signal<AuthUser | null>(null);
}
```

- [ ] **Step 10.2: Añadir guard en `documentos-list.service.ts`**

El servicio carga documentos desde `cargarDocumentos(expedienteId)`, llamado externamente. El guard va en ese método:

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../environments/environment';

// MODIFICAR el método cargarDocumentos:
cargarDocumentos(expedienteId: number): void {
  this.expedienteId = expedienteId;
  if (!expedienteId) {
    this.dto.errorMessages.set(['Expediente inválido']);
    return;
  }
  if (environment.useMocks) return;   // ← guard: conserva los mocks del DTO
  this.dto.loading.set(true);
  this.dto.errorMessages.set([]);
  // ... resto sin cambio
}
```

- [ ] **Step 10.3: Actualizar `documento-viewer.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.dto.ts
import { computed, signal } from '@angular/core';
import { SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Documento } from '../../documentos/models/documento.model';
import { MOCK_DOCUMENTO_VIEWER } from '../../../core/mocks/documentos.mock';

export class DocumentoViewerDto {
  readonly documento         = signal<Documento | null>(MOCK_DOCUMENTO_VIEWER);
  readonly loading           = signal(false);
  readonly error             = signal('');
  readonly frameUrl          = signal<SafeResourceUrl | null>(null);
  readonly mediaUrl          = signal<SafeUrl | null>(null);
  readonly rawBlobUrl        = signal<string | null>(null);
  readonly previewAsPdf      = signal(false);
  readonly readingModeActive = signal(false);
  readonly isFullscreen      = signal(false);

  readonly isPdf    = computed(() => this.documento()?.extension?.toLowerCase() === 'pdf');
  readonly isImage  = computed(() =>
    ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly isAudio  = computed(() =>
    ['mp3', 'wav', 'ogg'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly isVideo  = computed(() =>
    ['mp4', 'webm', 'avi', 'mov'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly isWord   = computed(() =>
    ['doc', 'docx'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly blobReady = computed(() => !!this.rawBlobUrl());
  readonly fileIcon  = computed(() => {
    if (this.isPdf())   return 'pi-file-pdf';
    if (this.isWord())  return 'pi-file-word';
    if (this.isImage()) return 'pi-image';
    if (this.isAudio()) return 'pi-headphones';
    if (this.isVideo()) return 'pi-video';
    return 'pi-file';
  });
}
```

- [ ] **Step 10.4: Añadir guard en `documento-viewer.service.ts`**

El método `loadDocumento()` hace el fetch del blob. El guard va al inicio de ese método, pero dejamos que `dto.documento.set(documento)` se ejecute para que los metadatos sean visibles:

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../environments/environment';

// MODIFICAR loadDocumento (las primeras líneas del método):
loadDocumento(documento: Documento | null): void {
  this.revocarBlobUrl();
  this.dto.previewAsPdf.set(false);
  this.dto.documento.set(documento);
  if (!documento) return;
  if (environment.useMocks) return;   // ← metadatos visibles; sin fetch de blob en demo
  if (!(this.dto.isPdf() || this.dto.isImage() || this.dto.isAudio() || this.dto.isVideo() || this.dto.isWord())) return;
  // ... resto sin cambio
}
```

- [ ] **Step 10.5: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 10.6: Commit**

```bash
git add sGED-frontend/src/app/features/expedientes/documentos-list/documentos-list.dto.ts \
        sGED-frontend/src/app/features/expedientes/documentos-list/documentos-list.service.ts \
        sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.dto.ts \
        sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.service.ts
git commit -m "feat(frontend): apply demo mocks to documentos-list and documento-viewer"
```

---

## Task 11: Documentos-Page (feature documentos)

**Files:**
- Modify: `sGED-frontend/src/app/features/documentos/documentos-page.dto.ts`
- Modify: `sGED-frontend/src/app/features/documentos/documentos-page.service.ts`

- [ ] **Step 11.1: Actualizar `documentos-page.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/documentos/documentos-page.dto.ts
import { signal, computed } from '@angular/core';
import { Documento } from './models/documento.model';
import { ViewerType, LoadState } from './documentos-page.types';
import { MOCK_DOCUMENTOS_EXP1 } from '../../core/mocks/documentos.mock';

export class DocumentosPageDto {
  state     = signal<LoadState>(LoadState.Idle);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expedienteId      = signal<number>(1);
  documentos        = signal<Documento[]>(MOCK_DOCUMENTOS_EXP1);
  errorMessage      = signal<string>('');

  viewerType        = signal<ViewerType>(null);
  viewerUrl         = signal<string>('');
  selectedDocumento = signal<Documento | null>(null);
  viewerVisible     = computed(() => this.viewerType() !== null);
  viewerTitle       = computed(() =>
    this.selectedDocumento()?.nombreOriginal ?? 'Visor de Documentos'
  );

  showPdfViewer   = computed(() => this.viewerType() === 'PDF' || this.viewerType() === 'WORD');
  showImageViewer = computed(() => this.viewerType() === 'IMAGEN');
  showAudioPlayer = computed(() => this.viewerType() === 'AUDIO');
  showVideoPlayer = computed(() => this.viewerType() === 'VIDEO');
}
```

- [ ] **Step 11.2: Añadir guard en `documentos-page.service.ts`**

El constructor tiene un pipeline `route.paramMap → switchMap → documentosCoreSvc.listar()`. El guard envuelve el pipeline completo. El `expedienteId` ya está inicializado en el DTO con `1`, así que no es necesario leer la ruta en modo mock.

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../environments/environment';

// MODIFICAR el constructor:
constructor() {
  if (environment.useMocks) return;
  this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    filter(id => !Number.isNaN(id) && id > 0),
    tap(id => {
      this.dto.expedienteId.set(id);
      this.dto.state.set(LoadState.Loading);
      this.dto.errorMessage.set('');
    }),
    switchMap(id => this.documentosCoreSvc.listar(id)),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe({
    next: (response) => {
      this.dto.documentos.set(response.data ?? []);
      this.dto.state.set(LoadState.Success);
    },
    error: (error) => {
      this.dto.state.set(LoadState.Error);
      this.dto.errorMessage.set(error?.error?.message ?? 'No se pudo cargar documentos');
    }
  });
}
```

- [ ] **Step 11.3: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 11.4: Commit**

```bash
git add sGED-frontend/src/app/features/documentos/documentos-page.dto.ts \
        sGED-frontend/src/app/features/documentos/documentos-page.service.ts
git commit -m "feat(frontend): apply demo mocks to documentos-page"
```

---

## Task 12: Usuarios-List

**Files:**
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuarios-list/usuarios-list.dto.ts`
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuarios-list/usuarios-list.service.ts`

- [ ] **Step 12.1: Actualizar `usuarios-list.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/admin/usuarios/usuarios-list/usuarios-list.dto.ts
import { signal, computed } from '@angular/core';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../../../shared/components/oj-shell/oj-shell.types';
import { UsuarioAdminResponse, LoadState } from './usuarios-list.types';
import { MOCK_USUARIOS } from '../../../../core/mocks/usuarios.mock';

export class UsuariosListDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  usuarios     = signal<UsuarioAdminResponse[]>(MOCK_USUARIOS);
  totalRecords = signal<number>(MOCK_USUARIOS.length);
  currentPage  = signal<number>(0);
  pageSize     = signal<number>(20);
  errorMessage = signal<string>('');

  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);

  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Administración' },
    { label: 'Usuarios y roles' }
  ];

  readonly totalActivos   = computed(() => this.usuarios().filter(u => u.activo && !u.bloqueado).length);
  readonly totalInactivos = computed(() => this.usuarios().filter(u => !u.activo).length);
}
```

- [ ] **Step 12.2: Añadir guard en `usuarios-list.service.ts`**

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../../environments/environment';

// MODIFICAR el constructor:
constructor() {
  // ... initShell/initUser si existen (sin cambio)
  if (environment.useMocks) return;
  // ... cargarUsuarios() o similar (sin cambio)
}
```

- [ ] **Step 12.3: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 12.4: Commit**

```bash
git add sGED-frontend/src/app/features/admin/usuarios/usuarios-list/usuarios-list.dto.ts \
        sGED-frontend/src/app/features/admin/usuarios/usuarios-list/usuarios-list.service.ts
git commit -m "feat(frontend): apply demo mocks to usuarios-list"
```

---

## Task 13: Usuario-Form y Usuario-Detail

**Files:**
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuario-form/usuario-form.dto.ts`
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuario-form/usuario-form.service.ts`
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuario-detail/usuario-detail.dto.ts`
- Modify: `sGED-frontend/src/app/features/admin/usuarios/usuario-detail/usuario-detail.service.ts`

- [ ] **Step 13.1: Actualizar `usuario-form.dto.ts`**

El DTO ya tiene `roles = signal<RolOption[]>(ROLES_ESTATICOS)` — los roles no requieren mock. Solo falta `juzgados`:

```typescript
// sGED-frontend/src/app/features/admin/usuarios/usuario-form/usuario-form.dto.ts
import { signal, computed } from '@angular/core';
import { LoadState, RolOption, JuzgadoOption } from './usuario-form.types';
import { MOCK_JUZGADO_OPTIONS } from '../../../../core/mocks/usuarios.mock';

export const ROLES_ESTATICOS: RolOption[] = [
  { label: 'ADMINISTRADOR', value: 1 },
  { label: 'SECRETARIO',    value: 2 },
  { label: 'AUXILIAR',      value: 3 },
  { label: 'CONSULTA',      value: 4 }
];

export class UsuarioFormDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);

  isCreation   = signal<boolean>(true);
  usuarioId    = signal<number | null>(null);
  juzgados     = signal<JuzgadoOption[]>(MOCK_JUZGADO_OPTIONS);
  roles        = signal<RolOption[]>(ROLES_ESTATICOS);
  submitting   = signal<boolean>(false);
  errorMessage = signal<string>('');
}
```

- [ ] **Step 13.2: Añadir guard en `usuario-form.service.ts`**

El constructor lee la ruta para detectar si es edición (hay `params['id']`). El guard va después de esa lectura de ruta pero antes de las llamadas HTTP (`cargarJuzgados()`, `cargarUsuario()`):

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../../environments/environment';

// MODIFICAR el constructor (el bloque this.route.params.pipe continúa pero sin HTTP):
constructor() {
  if (environment.useMocks) return;
  this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
    if (params['id']) {
      this.dto.isCreation.set(false);
      this.dto.usuarioId.set(+params['id']);
      this.form.get('username')?.disable();
      this.cargarUsuario();
    }
    this.cargarJuzgados();
  });
}
```

- [ ] **Step 13.3: Actualizar `usuario-detail.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/admin/usuarios/usuario-detail/usuario-detail.dto.ts
import { signal, computed } from '@angular/core';
import { LoadState, UsuarioAdminResponse } from './usuario-detail.types';
import { MOCK_USUARIO_DETALLE } from '../../../../core/mocks/usuarios.mock';

export class UsuarioDetailDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  usuario      = signal<UsuarioAdminResponse | null>(MOCK_USUARIO_DETALLE);
  usuarioId    = signal<number | null>(null);
  errorMessage = signal<string>('');

  initials = computed(() => {
    const u = this.usuario();
    if (!u?.nombreCompleto) return '?';
    const parts = u.nombreCompleto.trim().split(/[\s._-]+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : u.nombreCompleto.substring(0, 2).toUpperCase();
  });
}
```

- [ ] **Step 13.4: Añadir guard en `usuario-detail.service.ts`**

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../../environments/environment';

// MODIFICAR el constructor:
constructor() {
  if (environment.useMocks) return;
  // ... resto sin cambio
}
```

- [ ] **Step 13.5: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 13.6: Commit**

```bash
git add sGED-frontend/src/app/features/admin/usuarios/usuario-form/usuario-form.dto.ts \
        sGED-frontend/src/app/features/admin/usuarios/usuario-form/usuario-form.service.ts \
        sGED-frontend/src/app/features/admin/usuarios/usuario-detail/usuario-detail.dto.ts \
        sGED-frontend/src/app/features/admin/usuarios/usuario-detail/usuario-detail.service.ts
git commit -m "feat(frontend): apply demo mocks to usuario-form and usuario-detail"
```

---

## Task 14: Auditoría-List

**Files:**
- Modify: `sGED-frontend/src/app/features/admin/auditoria/auditoria-list/auditoria-list.dto.ts`
- Modify: `sGED-frontend/src/app/features/admin/auditoria/auditoria-list/auditoria-list.service.ts`

- [ ] **Step 14.1: Actualizar `auditoria-list.dto.ts`**

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/admin/auditoria/auditoria-list/auditoria-list.dto.ts
import { computed, signal } from '@angular/core';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../../../shared/components/oj-shell/oj-shell.types';
import { AuditoriaResponse, LoadState } from './auditoria-list.types';
import { MOCK_AUDITORIA } from '../../../../core/mocks/auditoria.mock';

export class AuditoriaListDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  auditoria    = signal<AuditoriaResponse[]>(MOCK_AUDITORIA);
  totalRecords = signal<number>(MOCK_AUDITORIA.length);
  currentPage  = signal<number>(0);
  pageSize     = signal<number>(50);
  errorMessage = signal<string>('');
  now          = signal<Date>(new Date());

  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);

  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Administración' },
    { label: 'Auditoría' }
  ];
}
```

- [ ] **Step 14.2: Añadir guard en `auditoria-list.service.ts`**

```typescript
// AÑADIR al inicio de los imports:
import { environment } from '../../../../../environments/environment';

// MODIFICAR el constructor (después de initShell/initUser síncronos):
constructor() {
  // ... initShell() o authSvc síncronos si existen (sin cambio)
  if (environment.useMocks) return;
  // ... cargarAuditoria() etc. (sin cambio)
}
```

- [ ] **Step 14.3: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 14.4: Commit**

```bash
git add sGED-frontend/src/app/features/admin/auditoria/auditoria-list/auditoria-list.dto.ts \
        sGED-frontend/src/app/features/admin/auditoria/auditoria-list/auditoria-list.service.ts
git commit -m "feat(frontend): apply demo mocks to auditoria-list"
```

---

## Task 15: Búsqueda Rápida

**Files:**
- Modify: `sGED-frontend/src/app/features/busqueda/busqueda-rapida/busqueda-rapida.dto.ts`

- [ ] **Step 15.1: Actualizar `busqueda-rapida.dto.ts`**

`ExpedienteBusquedaResponse` tiene campos: `id`, `numero`, `juzgado`, `estado`, `tipoProceso`, `fechaInicio`, `fuente`, `actorPrincipal`, `demandadoPrincipal`.
`Page<T>` tiene: `content: T[]`, `totalElements: number`, `totalPages: number`, `number: number`, `size: number`.

Reemplazar contenido completo:

```typescript
// sGED-frontend/src/app/features/busqueda/busqueda-rapida/busqueda-rapida.dto.ts
import { signal } from '@angular/core';
import { Page } from '../../../core/models/page.model';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';

const MOCK_RESULTADOS_BUSQUEDA: Page<ExpedienteBusquedaResponse> = {
  content: [
    {
      id: 1,
      numero: '01173-2026-00045',
      juzgado: 'Juzgado General de Pruebas',
      estado: 'ACTIVO',
      tipoProceso: 'Civil',
      fechaInicio: '2026-04-19',
      fuente: 'SGED',
      actorPrincipal: 'María García López',
      demandadoPrincipal: 'Construcciones Rápidas S.A.',
    },
    {
      id: 2,
      numero: '01108-2026-01234',
      juzgado: 'Juzgado General de Pruebas',
      estado: 'ACTIVO',
      tipoProceso: 'Penal',
      fechaInicio: '2026-04-10',
      fuente: 'SGED',
      actorPrincipal: 'Ministerio Público',
      demandadoPrincipal: 'Carlos Rodríguez Estrada',
    },
    {
      id: 3,
      numero: '01024-2026-00088',
      juzgado: 'Juzgado General de Pruebas',
      estado: 'ACTIVO',
      tipoProceso: 'Laboral',
      fechaInicio: '2026-04-05',
      fuente: 'SGED',
      actorPrincipal: 'Ana Lucía Pérez Morales',
      demandadoPrincipal: 'Empresa Textil Guatemala S.A.',
    },
  ],
  totalElements: 3,
  totalPages: 1,
  number: 0,
  size: 10,
};

export class BusquedaRapidaDto {
  readonly resultados    = signal<Page<ExpedienteBusquedaResponse> | undefined>(MOCK_RESULTADOS_BUSQUEDA);
  readonly loading       = signal(false);
  readonly errorMessages = signal<string[]>([]);
}
```

- [ ] **Step 15.2: Verificar compilación**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -5
```
Expected: sin errores.

- [ ] **Step 15.3: Commit**

```bash
git add sGED-frontend/src/app/features/busqueda/busqueda-rapida/busqueda-rapida.dto.ts
git commit -m "feat(frontend): apply demo mocks to busqueda-rapida"
```

---

## Task 16: Verificación final completa

- [ ] **Step 16.1: Build de desarrollo**

```bash
cd sGED-frontend && npx ng build 2>&1 | tail -10
```
Expected: `Build at: ... - Hash: ...` sin ningún error ni warning de tipo.

- [ ] **Step 16.2: Build de producción**

```bash
cd sGED-frontend && npx ng build --configuration=production 2>&1 | tail -10
```
Expected: compilación exitosa. El build de prod usa `environment.prod.ts` con `useMocks: false`, lo que confirma que los guards no afectan producción.

- [ ] **Step 16.3: Iniciar servidor de desarrollo y recorrer la ruta de demo**

```bash
cd sGED-frontend && npx ng serve --open
```

Verificar visualmente estas rutas (sin que el backend esté corriendo):
1. `/dashboard` → KPIs con valores (6 expedientes, 1 pendiente, 4 en proceso, 1 resuelto) + tabla de recientes con 5 expedientes + actividad con 5 entradas
2. `/expedientes` → tabla con 6 expedientes, filtros con 9 tipos de proceso
3. `/expedientes/1` → detalle del expediente 01173-2026-00045, nombre "Juicio Ordinario de Daños y Perjuicios"
4. `/admin/usuarios` → 3 usuarios, badges "2 activos", "0 inactivos"
5. `/admin/auditoria` → 8 entradas de log
6. `/busqueda` → búsqueda rápida con 3 resultados pre-cargados

- [ ] **Step 16.4: Commit final de cierre**

```bash
git add -A
git commit -m "feat(frontend): complete demo mode — all DTOs with realistic mock data (Phase 18)"
```

---

## Notas de implementación

### ¿Qué funciona en modo demo?
- Navegación completa entre todas las rutas
- Filtros y búsqueda del lado cliente (los signals computed filtran sobre los mocks)
- KPIs del dashboard
- Lista de expedientes, detalle, formulario (creación/edición sin submit HTTP)
- Lista de documentos con metadatos
- Lista de usuarios, formulario de usuario
- Log de auditoría

### ¿Qué NO funciona en modo demo?
- Vista previa de PDFs/multimedia en el visor (requiere blob URL real del backend)
- Submit de formularios (POST/PUT/DELETE van contra el backend)
- Login real (el AuthService sigue siendo real; para la demo, el usuario debe haber hecho login previamente o usar un token mock)

### Reversión a backend real
```typescript
// sGED-frontend/src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080/api/v1',
  useMocks: false   // ← cambiar esta línea
};
```
El build de producción (`ng build --configuration=production`) usa `environment.prod.ts` y nunca toca este flag.
