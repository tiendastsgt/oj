# sGED Frontend — Guía para Agentes IA

## Stack
- Angular 21, standalone components, OnPush, PrimeNG 21, SCSS, Zone.js (activo)
- Backend: Java 21 Spring Boot, respuestas camelCase
- Build: `npx ng build` | Dev: `npx ng serve`

## Estándar de Arquitectura (OBLIGATORIO)

El estándar completo está en `C:\proyectos\oj\mejoras\ARCHITECTURE.md` (1701 líneas).
El componente piloto funcional está en `C:\proyectos\oj\mejoras\pilot\src\`.
**Lee ambos antes de crear o modificar cualquier componente.**

### Resumen: 6 Artefactos por Componente

Cada componente page vive en su carpeta con estos 6 archivos:

```
feature/pages/mi-componente/
├── mi-componente.component.ts     ← Orquestador (≤30 líneas). Solo inject + expose dto
├── mi-componente.component.html   ← Template. Lee dto.x(), llama svc.metodo()
├── mi-componente.component.scss   ← Estilos con :host y tokens CSS
├── mi-componente.types.ts         ← Tipos API (del backend) + tipos UI (de la vista)
├── mi-componente.dto.ts           ← Estado reactivo: signal() + computed(). Con mocks
├── mi-componente.service.ts       ← TODA la lógica, HTTP, transformaciones API→UI
└── components/                    ← Subcomponentes tontos (solo input/output)
```

### Reglas del Patrón

**component.ts (orquestador):**
- `providers: [MiService]` → scope local
- `protected svc = inject(MiService); protected dto = this.svc.dto;`
- Sin lógica, sin HTTP, sin transformaciones

**dto.ts (estado reactivo):**
- Clase pura con `signal()` y `computed()`. Sin inject. Sin lógica
- Mocks iniciales obligatorios para que UI funcione sin backend
- View lee con paréntesis: `dto.users()`, `dto.isLoading()`

**service.ts (lógica):**
- `public dto = new MiDto()`
- Inyecta servicios core existentes (`ExpedientesService`, `AuthService`, etc.)
- Muta el DTO con `.set()` / `.update()`
- Transforma datos API → UI antes de guardar en DTO
- Usa `takeUntilDestroyed(this.destroyRef)` en suscripciones

**types.ts:**
- Tipos API: importar desde `core/models/` si ya existen, no duplicar
- Tipos UI: interfaces nuevas específicas de la vista
- Enums: `LoadState { Idle, Loading, Success, Error }`

### Anti-patrones PROHIBIDOS
- ❌ `template: '...'` inline
- ❌ `styles: [...]` inline
- ❌ Lógica/HTTP/cálculos en el component.ts o en el template
- ❌ `any` (usar `unknown`)
- ❌ `ChangeDetectorRef` en componentes nuevos (signals lo reemplazan)
- ❌ `setTimeout()` para workarounds de change detection
- ❌ Propiedades planas en vez de signals en el DTO

### Decisiones Vigentes
1. **PrimeNG: MANTENER** en todos los componentes
2. **Zone.js: NO TOCAR** — no cambiar a zoneless hasta que todo esté migrado
3. **httpResource: NO USAR AÚN** — usar subscribe + signals mientras haya Zone.js
4. **core/services/ y core/models/: NO MODIFICAR** — otros componentes dependen de ellos
5. **styles.scss global: NO TOCAR** — 35KB de estilos compartidos

### Verificación Obligatoria
Después de CADA componente migrado:
```bash
npx ng build
npx ng build --configuration=production
```
Si no compila, arreglar antes de continuar. Nunca dejar código que no compile.

---

## Checklist de Auditoría Post-Migración

Cuando se pida auditar un componente migrado, usar el rol de `.ai/agents/code-reviewer.md` y verificar:

### Patrón de 6 Artefactos
- [ ] `component.ts` es solo orquestador (≤30 líneas, sin lógica, sin HTTP)
- [ ] `dto.ts` usa `signal()` y `computed()` correctamente, tiene mocks iniciales
- [ ] `service.ts` contiene TODA la lógica, muta el DTO con `.set()`/`.update()`
- [ ] `types.ts` separa tipos API de tipos UI, reutiliza `core/models/` sin duplicar
- [ ] `component.html` lee del DTO con paréntesis `dto.x()`, llama `svc.metodo()`, sin lógica inline
- [ ] `component.scss` usa `:host` y tokens CSS, sin `!important`

### Anti-patrones Ausentes
- [ ] Cero `ChangeDetectorRef` en archivos nuevos
- [ ] Cero `setTimeout()` workarounds
- [ ] Cero `any` (usar `unknown`)
- [ ] Cero templates o styles inline
- [ ] Cero propiedades planas (todo signal en el DTO)
- [ ] Cero lógica de negocio en el template

### Integridad del Sistema
- [ ] `ng build` y `ng build --configuration=production` compilan sin errores
- [ ] No hay imports huérfanos (archivos eliminados que aún se referencian)
- [ ] Componentes no migrados siguen funcionando (rutas de otros features cargan)

### Formato del Reporte
Clasificar hallazgos como:
- ✅ Correcto
- 🔴 Crítico (debe arreglar antes de continuar)
- 🟡 Importante (debería arreglar)
- 💡 Sugerencia (nice to have)

---

## Routing de Modelos por Tarea

| Tarea | Modelo | Por qué |
|-------|--------|---------|
| **Migrar componente** (crear 6 artefactos) | Sonnet | Trabajo operativo, sigue reglas claras |
| **Corregir issues** post-auditoría | Sonnet | Aplica fixes puntuales |
| **Auditar** migración | Opus | Requiere análisis profundo y criterio |
| **Git commit** | Haiku | Tarea mecánica, cero análisis |
| **Verificar build** (`ng build`) | Haiku | Ejecutar comando y reportar |

### Prompts por rol:

**Sonnet — Migrar:**
```
Migra src/app/features/<componente>/ al patrón de 6 artefactos. ng build al terminar.
```

**Sonnet — Corregir:**
```
Corrige estos issues en src/app/features/<componente>/: <lista de issues del audit>
```

**Opus — Auditar:**
```
Adopta .ai/agents/code-reviewer.md. Audita src/app/features/<componente>/ según el checklist de CLAUDE.md.
```

**Haiku — Commit:**
```
Haz git add -A && git commit con el mensaje de la fase correspondiente según CLAUDE.md.
```

---

## Git Workflow — Un Commit por Fase

Después de cada fase completada Y auditada:
```bash
git add -A
git commit -m "refactor(frontend): migrate <componente> to 6-artifact pattern — Phase <N>"
```

Convención de mensajes:
- Fase 0: `chore(frontend): add migration infrastructure (error helper, env, cleanup modules)`
- Fase 1: `refactor(frontend): migrate dashboard to 6-artifact pattern`
- Fase 2: `refactor(frontend): migrate expedientes-list to 6-artifact pattern`
- Fase 3: `refactor(frontend): migrate expediente-form and detail to 6-artifact pattern`
- Fase 4: `refactor(frontend): migrate documentos to 6-artifact pattern`
- Fase 5: `refactor(frontend): migrate admin and busqueda to 6-artifact pattern`
- Fase 6: `refactor(frontend): finalize routes, cleanup, enable zoneless`
