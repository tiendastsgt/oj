import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrintBlockService {
  private installed = false;

  install(): void {
    if (this.installed) return;
    this.installed = true;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true });

    window.addEventListener('beforeprint', (e: Event) => {
      e.preventDefault();
    });

    try {
      Object.defineProperty(window, 'print', {
        value: () => {},
        writable: false,
        configurable: false
      });
    } catch { /* algunos navegadores no permiten redefinir */ }

    window.addEventListener('contextmenu', (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || t?.isContentEditable) return;
      e.preventDefault();
    }, { capture: true });
  }
}
