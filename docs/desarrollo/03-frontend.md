---
Documento: FRONTEND
Proyecto: SGED
Versión del sistema: v1.3.0
Versión del documento: 1.0
Última actualización: 2026-05-03
Estado: Vigente
---

# 03 — Frontend

## 1. Estructura de Módulos Angular

El frontend está construido con **Angular 21 Standalone Components**. No se usan `NgModules` tradicionales como módulos de enrutamiento raíz; cada componente se declara standalone y las rutas usan `loadComponent()` para lazy-loading granular.

```
sGED-frontend/src/app/
│
├── app.component.ts              ← Componente raíz (shell de la aplicación)
├── app.config.ts                 ← Configuración de la aplicación (provideRouter, provideHttpClient)
├── app.routes.ts                 ← Definición central de todas las rutas con lazy-loading
│
├── core/                         ← MÓDULO CORE: Servicios singleton, guards e interceptors
│   │                                Toda esta carpeta es de uso global — no se importa por feature
│   ├── guards/
│   │   ├── auth.guard.ts         │  AuthGuard — verifica sesión activa antes de activar la ruta
│   │   └── role.guard.ts         │  RoleGuard — verifica que el rol del usuario coincide con data.requiredRole
│   ├── interceptors/
│   │   ├── auth.interceptor.ts   │  AuthInterceptor — añade Authorization: Bearer <token> a peticiones API
│   │   └── error.interceptor.ts  │  ErrorInterceptor — captura 401/403 y redirige a /login
│   ├── models/                   │  Interfaces TypeScript (contrato de datos)
│   │   ├── api-response.model.ts │  ApiResponse<T> — envoltorio genérico de respuestas
│   │   ├── auth-user.model.ts    │  AuthUser — usuario decodificado almacenado en sessionStorage
│   │   ├── login-request.model.ts
│   │   ├── login-response.model.ts
│   │   ├── expediente.model.ts
│   │   ├── busqueda.model.ts
│   │   ├── catalogos.model.ts
│   │   ├── auditoria.model.ts
│   │   ├── admin-usuarios.model.ts
│   │   ├── change-password-request.model.ts
│   │   └── page.model.ts         │  Page<T> — paginación de Spring Data
│   └── services/                 │  Servicios HTTP (todos providedIn: 'root' — singletons)
│       ├── auth.service.ts       │  Login, logout, cambiar-password, isAuthenticated()
│       ├── storage.service.ts    │  Abstracción sobre sessionStorage
│       ├── expedientes.service.ts
│       ├── documentos.service.ts
│       ├── catalogos.service.ts
│       ├── busqueda-expedientes.service.ts
│       ├── auditoria.service.ts
│       └── admin-usuarios.service.ts
│
├── features/                     ← MÓDULOS DE FUNCIONALIDAD: Carga lazy por ruta
│   ├── auth/                     │  Autenticación (rutas públicas)
│   │   ├── auth.module.ts
│   │   ├── login/login.component.ts
│   │   └── change-password/change-password.component.ts
│   │
│   ├── dashboard/                │  Dashboard con KPIs (carga tras login)
│   │   └── dashboard.component.ts
│   │
│   ├── expedientes/              │  Gestión completa de expedientes
│   │   ├── expedientes.module.ts
│   │   ├── expedientes-list/expedientes-list.component.ts
│   │   ├── expediente-form/expediente-form.component.ts     │  Crear y editar
│   │   ├── expediente-detail/expediente-detail.component.ts
│   │   ├── documentos-list/documentos-list.component.ts
│   │   └── documento-viewer/documento-viewer.component.ts
│   │
│   ├── documentos/               │  Vista de documentos de un expediente
│   │   ├── documentos.module.ts
│   │   ├── documentos-page.component.ts
│   │   ├── list/documentos-list.component.ts
│   │   ├── upload/documentos-upload.component.ts
│   │   ├── visor-pdf/visor-pdf.component.ts        │  Render nativo de PDF en <embed>
│   │   ├── visor-imagen/visor-imagen.component.ts
│   │   ├── reproductor-audio/reproductor-audio.component.ts
│   │   └── reproductor-video/reproductor-video.component.ts
│   │
│   ├── busqueda/                 │  Búsqueda avanzada multi-criterio
│   │   ├── busqueda-container/busqueda-container.component.ts
│   │   ├── busqueda-rapida/busqueda-rapida.component.ts
│   │   ├── resultados-busqueda/resultados-busqueda.component.ts
│   │   └── busqueda-avanzada/
│   │       ├── busqueda-avanzada.component.ts
│   │       └── components/          │  Sub-componentes de criterios de búsqueda
│   │           ├── criterios-generales/
│   │           ├── criterios-fechas/
│   │           ├── criterios-referencia/
│   │           └── criterios-sujetos/
│   │
│   └── admin/                    │  Administración (requiere rol ADMINISTRADOR)
│       ├── usuarios/
│       │   ├── usuarios-list/usuarios-list.component.ts
│       │   ├── usuario-form/usuario-form.component.ts
│       │   └── usuario-detail/usuario-detail.component.ts
│       └── auditoria/
│           └── auditoria-list/auditoria-list.component.ts
│
└── shared/                       ← COMPONENTES COMPARTIDOS: Reutilizables entre features
    ├── components/
    │   ├── empty-state/empty-state.component.ts  │  Estado vacío genérico para tablas
    │   ├── kpi-card.component.ts                 │  Tarjeta de KPI para el dashboard
    │   └── status-badge.component.ts             │  Badge de estado de expediente con color
    └── pipes/
        └── file-size.pipe.ts     │  Formatea bytes como KB, MB, GB
```

### Diferencia entre `core/` y `features/`

| | `core/` | `features/` |
|---|---------|------------|
| **Carga** | Siempre (en el arranque de la app) | Lazy (solo cuando el usuario navega a esa ruta) |
| **Instancias** | Singletons (`providedIn: 'root'`) | Pueden ser múltiples instancias |
| **Contenido** | Servicios HTTP, guards, interceptors, modelos | Componentes de UI, lógica de presentación |
| **Importación** | Desde `app.config.ts` | Via `loadComponent()` en `app.routes.ts` |

---

## 2. Servicios HTTP Core y sus Responsabilidades

Todos los servicios de `core/services/` son singletons (`providedIn: 'root'`) y usan `HttpClient` de Angular.

| Servicio | Archivo | Responsabilidad |
|---------|---------|-----------------|
| **AuthService** | `auth.service.ts` | Gestiona el ciclo de vida de la sesión: login (POST `/auth/login`), logout (POST `/auth/logout`), cambio de contraseña. Almacena token en sessionStorage y expone `currentUser$` como Observable. Verifica expiración del JWT decodificando el payload base64 en el cliente. |
| **StorageService** | `storage.service.ts` | Abstracción sobre `sessionStorage`. Métodos: `getItem`, `setItem`, `removeItem`, `getJson<T>`, `setJson`. Permite testear la capa de sesión sin depender del navegador. |
| **ExpedientesService** | `expedientes.service.ts` | CRUD de expedientes: listar (paginado), obtener detalle, crear, editar. Mapea respuestas `ApiResponse<T>` a observables directos. |
| **DocumentosService** | `documentos.service.ts` | Subir documentos (multipart/form-data), listar por expediente, descargar (blob), eliminar. |
| **CatalogosService** | `catalogos.service.ts` | Obtener catálogos: estados de expediente, tipos de proceso, juzgados. Los resultados se almacenan en cache local (BehaviorSubject) para evitar llamadas repetidas. |
| **BusquedaExpedientesService** | `busqueda-expedientes.service.ts` | Búsqueda avanzada paginada: envía `BusquedaAvanzadaRequest` a `POST /busqueda/avanzada` y retorna `Page<ExpedienteBusquedaResponse>`. |
| **AuditoriaService** | `auditoria.service.ts` | Consulta el log de auditoría paginado con filtros de fecha, usuario, acción y módulo. Solo disponible para ADMINISTRADOR. |
| **AdminUsuariosService** | `admin-usuarios.service.ts` | CRUD de usuarios del sistema: crear, listar, obtener detalle, actualizar, desbloquear cuenta, reset de contraseña. Exclusivo de la sección `/admin/usuarios`. |

### Patrón de respuesta API

Todos los servicios mapean el envoltorio `ApiResponse<T>` usando `map(response => response.data)`:

```typescript
// Patrón estándar en todos los servicios
listarExpedientes(page: number, size: number): Observable<Page<ExpedienteResponse>> {
  return this.http
    .get<ApiResponse<Page<ExpedienteResponse>>>(`${this.baseUrl}/expedientes`, {
      params: { page, size }
    })
    .pipe(map(response => response.data!));
}
```

---

## 3. Interceptors HTTP

Los interceptors se registran en `app.config.ts` usando `provideHttpClient(withInterceptorsFromDi())`.

### AuthInterceptor (`core/interceptors/auth.interceptor.ts`)

**Propósito:** Añade automáticamente el header `Authorization: Bearer <token>` a todas las peticiones que van a la API del backend.

**Comportamiento:**
1. En cada petición HTTP saliente, verifica si la URL empieza por `environment.apiUrl` o contiene `/api/v1/`.
2. Si hay un token válido en sessionStorage y la URL es del API, clona la request y añade el header `Authorization`.
3. Si no hay token o no es una petición al API, reenvía la request sin modificar.

```typescript
intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  const token = this.authService.getToken();
  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/v1/');

  if (token && isApiRequest) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token.trim()}` }
    });
    return next.handle(authReq);
  }
  return next.handle(req);
}
```

### ErrorInterceptor (`core/interceptors/error.interceptor.ts`)

**Propósito:** Capturar errores HTTP 401 (No autorizado) y 403 (Prohibido) provenientes del API y redirigir al usuario a la pantalla de login, limpiando la sesión.

**Comportamiento:**
1. Envuelve toda petición con `catchError`.
2. Si el error es 401 o 403 y la petición era al API (no a recursos estáticos), llama a `authService.clearSession()` y navega a `/login`.
3. Siempre re-lanza el error para que el componente pueda mostrarlo si lo necesita.

**Caso especial:** Si el usuario ya está en `/login`, no redirige nuevamente para evitar bucles.

---

## 4. Guards de Ruta

### AuthGuard (`core/guards/auth.guard.ts`)

Protege todas las rutas que requieren sesión activa. Implementa `CanActivate`.

```typescript
canActivate(): boolean {
  if (this.authService.isAuthenticated()) {
    return true;
  }
  this.router.navigate(['/login']);
  return false;
}
```

`isAuthenticated()` en `AuthService` no solo verifica la existencia del token, sino que también decodifica el payload JWT para verificar que `exp` (expiración) no haya pasado. Si el token expiró, limpia la sesión automáticamente.

### RoleGuard (`core/guards/role.guard.ts`)

Protege rutas que requieren un rol específico. Se usa en combinación con `AuthGuard` en la definición de rutas. Lee el rol requerido desde `route.data.requiredRole`.

```typescript
canActivate(route: ActivatedRouteSnapshot): boolean {
  const requiredRole = route.data['requiredRole'];
  const currentUser = this.authService.getCurrentUser();

  if (!requiredRole) return true;

  if (currentUser && currentUser.rol === requiredRole) {
    return true;
  }
  this.router.navigate(['/expedientes']);   // Redirige a zona segura, no a login
  return false;
}
```

**Rutas protegidas por RoleGuard con `ADMINISTRADOR`:**

| Ruta | Guard | Rol Requerido |
|------|-------|--------------|
| `/admin/usuarios` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/usuarios/nuevo` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/usuarios/:id` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/usuarios/:id/editar` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/auditoria` | AuthGuard + RoleGuard | ADMINISTRADOR |

---

## 5. Convenciones de Componentes PrimeNG

El proyecto usa **PrimeNG 21** con el tema **Aura** para lograr una interfaz premium consistente.

### Componentes PrimeNG en uso

| Componente PrimeNG | Uso en SGED |
|-------------------|-------------|
| `p-table` | Listados de expedientes, documentos, usuarios, auditoría con paginación server-side |
| `p-dialog` | Modales de confirmación, formularios de creación rápida |
| `p-fileUpload` | Carga de documentos con drag-and-drop y validación client-side |
| `p-dropdown` | Selectores de catálogos (estado, juzgado, tipo de proceso) |
| `p-calendar` | Selección de fechas en búsqueda avanzada y formularios |
| `p-badge` / `p-tag` | Estado del expediente con colores semánticos |
| `p-toast` | Notificaciones de éxito/error no bloqueantes |
| `p-progressBar` | Progreso de carga de archivos |
| `p-card` | Tarjetas de KPI en el dashboard |
| `p-menubar` | Barra de navegación principal |
| `p-breadcrumb` | Ruta de navegación contextual |
| `p-confirmDialog` | Confirmación antes de operaciones destructivas |

### Convenciones de componentes

1. **Standalone por defecto**: Todos los componentes usan `standalone: true` y declaran sus imports directamente.
2. **Input/Output tipados**: Uso de `input<T>()` y `output<T>()` de Angular 17+ donde aplique.
3. **Changedetección OnPush**: En componentes de listado con datos estáticos para optimizar rendimiento.
4. **SCSS scoped**: Estilos de componente en archivo `.scss` propio, sin estilos globales.
5. **Cero `console.log`**: Prohibido en todos los archivos TypeScript en producción.
6. **Unsubscribe obligatorio**: Usar `takeUntilDestroyed()` o `DestroyRef` para evitar memory leaks en suscripciones.

---

## 6. Enrutamiento Completo

Todas las rutas se definen en `app.routes.ts` con lazy-loading:

| Ruta | Componente | Guards | Rol |
|------|-----------|--------|-----|
| `/login` | `LoginComponent` | — | Público |
| `/dashboard` | `DashboardComponent` | AuthGuard | Todos |
| `/cambiar-password` | `ChangePasswordComponent` | AuthGuard | Todos |
| `/busqueda` | `BusquedaContainerComponent` | AuthGuard | Todos |
| `/expedientes` | `ExpedientesListComponent` | AuthGuard | Todos |
| `/expedientes/nuevo` | `ExpedienteFormComponent` | AuthGuard | ADMINISTRADOR, SECRETARIO, AUXILIAR |
| `/expedientes/:id` | `ExpedienteDetailComponent` | AuthGuard | Todos |
| `/expedientes/:id/editar` | `ExpedienteFormComponent` | AuthGuard | ADMINISTRADOR, SECRETARIO |
| `/expedientes/:id/documentos` | `DocumentosPageComponent` | AuthGuard | Todos |
| `/admin/usuarios` | `UsuariosListComponent` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/usuarios/nuevo` | `UsuarioFormComponent` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/usuarios/:id` | `UsuarioDetailComponent` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/usuarios/:id/editar` | `UsuarioFormComponent` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/admin/auditoria` | `AuditoriaListComponent` | AuthGuard + RoleGuard | ADMINISTRADOR |
| `/` | Redirect a `/dashboard` | — | — |
| `/**` | Redirect a `/dashboard` | — | — |

**Nota:** Los guards del frontend son una medida de UX. La autorización real se aplica en el backend con `@PreAuthorize`. Un usuario con token válido pero rol incorrecto recibirá 403 del API aunque sortee el guard del frontend.

---

## 7. Entornos Angular

```typescript
// src/environments/environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};

// src/environments/environment.prod.ts (producción)
export const environment = {
  production: true,
  apiUrl: 'http://51.161.32.204:8086/api/v1'
};
```

El build de producción usa `ng build --configuration=production`, que reemplaza automáticamente `environment.ts` por `environment.prod.ts` mediante el `fileReplacements` de `angular.json`.

---

*Siguiente: [04-base-de-datos.md](./04-base-de-datos.md) — Diagrama ER, catálogos y estrategia Flyway.*
