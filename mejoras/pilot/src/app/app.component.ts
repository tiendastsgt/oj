// ═══════════════════════════════════════════════════════════════
// app.component.ts
// Componente raíz. Solo contiene <router-outlet>.
// ═══════════════════════════════════════════════════════════════

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {}
