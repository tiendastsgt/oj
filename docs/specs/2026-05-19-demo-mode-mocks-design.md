# Spec: Modo Demo — Mocks en DTOs sin Backend

**Fecha:** 2026-05-19
**Objetivo:** Permitir que el frontend SGED funcione completamente sin backend corriendo, mostrando datos realistas del OJ Guatemala para demos y presentaciones a stakeholders.
**Activación:** `environment.useMocks = true` en `environment.ts` (dev). Producción usa `environment.prod.ts` con `useMocks: false`.

---

## 1. Contexto

El frontend Angular ya implementa el patrón de 6 artefactos (component / html / scss / types / dto / service). Sin embargo, todos los DTOs inician con signals vacíos o en cero. Si el backend no está disponible, el UI queda en blanco o en estado de error.

La arquitectura (`mejoras/ARCHITECTURE.md`, sección 6) establece que los DTOs deben tener **mocks iniciales obligatorios** para que el UI funcione desde el primer commit. Este spec implementa esa premisa para modo demo.

---

## 2. Decisión de Arquitectura: Enfoque A

Se eligió el **Enfoque A** (mocks en DTOs + guard en servicios) sobre:
- Enfoque B (interceptor HTTP): complejo de mantener, requiere mapear todas las URLs
- Enfoque C (mock services separados): duplica la capa de servicios, complejidad alta

**Razón:** El Enfoque A sigue exactamente el patrón descrito en `ARCHITECTURE.md §7` (Opción A), es predecible, y el impacto está acotado a cambios mecánicos de 1-2 líneas por servicio.

---

## 3. Estructura de Archivos

### 3.1 Archivos nuevos

```
src/app/core/mocks/
├── catalogos.mock.ts      ← TiposProceso (9), Estados (3), Juzgados (1)
├── expedientes.mock.ts    ← 6 ExpedienteResponse (del seed backend)
├── documentos.mock.ts     ← 22 Documento (distribuidos en los 6 expedientes)
├── usuarios.mock.ts       ← 3 UsuarioAdminResponse (del seed backend)
└── auditoria.mock.ts      ← 8 AuditoriaResponse realistas
```

### 3.2 Archivos modificados

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/environments/environment.ts` | `useMocks: true` |
| `features/dashboard/dashboard.dto.ts` | mocks: stats KPIs, expedientes recientes, auditoría |
| `features/expedientes/expedientes-list/expedientes-list.dto.ts` | mocks: 6 expedientes, catálogos |
| `features/expedientes/expediente-form/expediente-form.dto.ts` | mocks: catálogos (tipos, estados, juzgados) |
| `features/expedientes/expediente-detail/expediente-detail.dto.ts` | mocks: expediente id:1 + catálogos |
| `features/expedientes/documentos-list/documentos-list.dto.ts` | mocks: 5 docs expediente id:1 |
| `features/expedientes/documento-viewer/documento-viewer.dto.ts` | mocks: 1 doc PDF |
| `features/documentos/documentos-page.dto.ts` | mocks: 5 docs expediente id:1 |
| `features/admin/usuarios/usuarios-list/usuarios-list.dto.ts` | mocks: 3 usuarios |
| `features/admin/usuarios/usuario-form/usuario-form.dto.ts` | mocks: roles[], juzgados[] |
| `features/admin/usuarios/usuario-detail/usuario-detail.dto.ts` | mocks: usuario admin.qa |
| `features/admin/auditoria/auditoria-list/auditoria-list.dto.ts` | mocks: 8 entradas |
| `features/busqueda/busqueda-rapida/busqueda-rapida.dto.ts` | mocks: 3 expedientes resultado |
| `features/dashboard/dashboard.service.ts` | guard: `if (environment.useMocks) return;` |
| `features/expedientes/expedientes-list/expedientes-list.service.ts` | guard |
| `features/expedientes/expediente-form/expediente-form.service.ts` | guard |
| `features/expedientes/expediente-detail/expediente-detail.service.ts` | guard |
| `features/expedientes/documentos-list/documentos-list.service.ts` | guard |
| `features/expedientes/documento-viewer/documento-viewer.service.ts` | guard |
| `features/documentos/documentos-page.service.ts` | guard |
| `features/admin/usuarios/usuarios-list/usuarios-list.service.ts` | guard |
| `features/admin/usuarios/usuario-form/usuario-form.service.ts` | guard |
| `features/admin/usuarios/usuario-detail/usuario-detail.service.ts` | guard |
| `features/admin/auditoria/auditoria-list/auditoria-list.service.ts` | guard |

**Total:** 5 archivos nuevos + 23 archivos modificados = **28 archivos**

---

## 4. Datos Mock (Basados en Seed Real del Backend)

### 4.1 Catálogos (`catalogos.mock.ts`)

**TiposProceso** (9 — ramos OJ Guatemala):
```
id:1  Civil                        id:6  Niñez y Adolescencia
id:2  Penal                        id:7  Femicidio y VCM
id:3  Laboral                      id:8  Contencioso Administrativo
id:4  Familia                      id:9  Económico Coactivo
id:5  Mercantil
```

**Estados** (3):
```
id:1  ACTIVO     id:2  CERRADO     id:3  PENDIENTE
```

**Juzgados** (1):
```
id:1  Juzgado General de Pruebas
```

### 4.2 Expedientes (`expedientes.mock.ts`)

| id | Número | Tipo | Estado | Descripción | Docs |
|----|--------|------|--------|-------------|------|
| 1 | 01173-2026-00045 | Civil (1) | ACTIVO (1) | Juicio Ordinario de Daños y Perjuicios | 5 |
| 2 | 01108-2026-01234 | Penal (2) | ACTIVO (1) | Proceso Penal por Estafa Propia | 6 |
| 3 | 01024-2026-00088 | Laboral (3) | ACTIVO (1) | Juicio Ordinario Laboral por Despido Injustificado | 3 |
| 4 | 01044-2026-00321 | Familia (4) | ACTIVO (1) | Pensión Alimenticia Provisional | 3 |
| 5 | 01069-2026-00012 | Femicidio (7) | PENDIENTE (3) | Femicidio en grado de tentativa — Decreto 22-2008 | 3 |
| 6 | 01075-2025-00992 | Mercantil (5) | CERRADO (2) | Ejecución Mercantil por Cobro de Pagaré | 2 |

Campos adicionales: `actorPrincipal`, `demandado`, `usuarioCreacion: 'admin.qa'`, `fechaCreacion`, `fechaInicio`.

### 4.3 Documentos (`documentos.mock.ts`)

22 documentos distribuidos. Para el expediente id:1 (5 docs, demo principal):
```
Demanda_Inicial.pdf          pdf  | Demanda           | 245 KB
Resolucion_Admision.pdf      pdf  | Auto              | 189 KB
Contestacion_Demanda.pdf     pdf  | Contestación      | 312 KB
Cedula_Notificacion.pdf      pdf  | Cédula            |  98 KB
Sentencia_Ordinario.pdf      pdf  | Sentencia         | 421 KB
```

Expediente id:2 incluye multimedia: `.mp3`, `.mp4`, `.jpg` para demostrar el visor multimedia.

### 4.4 Usuarios (`usuarios.mock.ts`)

```
admin.qa      | Administrador QA | ADMINISTRADOR | activo=true  | bloqueado=false
secretario.qa | Secretario QA    | SECRETARIO    | activo=true  | bloqueado=false
juez.qa       | Juez QA          | JUEZ          | activo=true  | bloqueado=false
```

### 4.5 Auditoría (`auditoria.mock.ts`)

8 entradas que cubren: login, creación de expediente, subida de documento, edición de estado, reset de password.

---

## 5. Patrón de Implementación

### 5.1 Mock constants

```typescript
// core/mocks/expedientes.mock.ts
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
    demandado: 'Construcciones S.A.',
    usuarioCreacion: 'admin.qa',
    fechaCreacion: '2026-04-19T08:30:00',
    totalDocumentos: 5,
  },
  // ... 5 más
];
```

### 5.2 DTO con mock inicial

```typescript
// expedientes-list.dto.ts
import { MOCK_EXPEDIENTES } from '../../../core/mocks/expedientes.mock';
import { MOCK_TIPOS_PROCESO, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedientesListDto {
  state        = signal<LoadState>(LoadState.Idle);   // Idle, no Loading
  expedientes  = signal<ExpedienteResponse[]>(MOCK_EXPEDIENTES);
  tiposProceso = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  juzgados     = signal<Juzgado[]>(MOCK_JUZGADOS);
  // ...resto sin cambio
}
```

> Nota: `state` cambia de `Loading` a `Idle` en DTOs que iniciaban en estado de carga.

### 5.3 Service guard

```typescript
// expedientes-list.service.ts
import { environment } from '../../../../environments/environment';

constructor() {
  this.dto.currentUser.set(this.authService.getCurrentUser());
  if (environment.useMocks) return;   // ← única línea nueva
  this.cargarCatalogos();
}
```

El guard se coloca **después** de cualquier operación síncrona (como leer el usuario actual del AuthService), y **antes** de todas las llamadas HTTP.

---

## 6. Alcance Excluido

- `login.dto.ts`, `change-password.dto.ts`: no necesitan mocks (son formularios sin datos de listado)
- `busqueda-avanzada.dto.ts`, `resultados-busqueda.dto.ts`, `busqueda-container.dto.ts`: el flujo de búsqueda retorna resultados on-demand; con los mocks de `busqueda-rapida` cubre la demo
- `presentacion.dto.ts`, `reportes.dto.ts`: se evalúan durante implementación según contenido real
- `core/services/`: no se modifican (restricción del CLAUDE.md del frontend)
- `styles.scss`: no se toca

---

## 7. Verificación Post-Implementación

Después de cada feature implementado:
```bash
cd sGED-frontend && npx ng build
```

Ruta de demo completa:
1. Login → Dashboard con KPIs
2. Expedientes → lista de 6 → click en 01173-2026-00045 → detalle → tab Archivos
3. Documentos → visor PDF de Demanda_Inicial.pdf
4. Admin → Usuarios (3 usuarios) → Auditoría (8 entradas)
5. Búsqueda rápida → resultados

---

## 8. Reversión a Producción

Cambiar `environment.ts`:
```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api/v1',
  useMocks: false   // ← volver a false
};
```

El `environment.prod.ts` nunca se modifica, por lo que `ng build --configuration=production` siempre apunta al backend real.
