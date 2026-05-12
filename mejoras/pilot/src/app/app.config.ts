// ═══════════════════════════════════════════════════════════════
// app.config.ts
// Configuración global de la aplicación:
//   - Zoneless change detection (sin Zone.js)
//   - HttpClient con fetch nativo
//   - Router con las rutas top-level
// ═══════════════════════════════════════════════════════════════

import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { mockInterceptor } from './core/interceptors/mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(
      withFetch(),
      withInterceptors([mockInterceptor]),
    ),
    provideRouter(routes),
  ],
};
