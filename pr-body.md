## Resumen

El botón de Pantalla Completa en el visor documental se renderizaba vacío porque `pi-compress` y `pi-expand` no existen en PrimeIcons `^6.0.0`.

- **Causa raíz:** nombres de ícono inválidos para la versión instalada.
- **Fix:** reemplazados por `pi-arrows-alt` (expandir) y `pi-window-minimize` (comprimir), ambos verificados en `primeicons.css` v6 (líneas 140 y 864).
- **Alcance:** un solo botón afectado — no hay otros `pi-compress`/`pi-expand` en `sGED-frontend/src`.

## Archivos

- `sGED-frontend/src/app/features/expedientes/documento-viewer/documento-viewer.component.html` — 1 línea modificada.

## Test plan

- [ ] Visual: botón Pantalla Completa muestra ícono de 4 flechas (`pi-arrows-alt`) en estado normal.
- [ ] Visual: al activar fullscreen, ícono cambia a `pi-window-minimize` (comprimir).
- [ ] No-regresión: botón "Modo Lectura" adyacente sigue usando `pi-window-minimize`/`pi-window-maximize` sin conflicto.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
