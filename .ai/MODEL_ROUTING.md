# Routing de Modelos — Enjambre de Agentes SGED
# Para uso con Claude Code (claude-code CLI)

## Estrategia de Asignación

| Tier | Modelo | Costo relativo | Cuándo usar |
|------|--------|---------------|-------------|
| 🔴 **Tier 1** | `opus` | $$$ | Decisiones arquitectónicas, code review crítico, debugging complejo |
| 🟡 **Tier 2** | `sonnet` | $$ | Codificación sustancial, refactoring, diseño UX, lógica de negocio |
| 🟢 **Tier 3** | `haiku` | $ | Configs, scaffolding, formateo, lookups, tareas repetitivas |

---

## Agentes → Modelo

| Agente | Modelo | Justificación |
|--------|--------|---------------|
| `orchestrator` | `opus` | Toma decisiones arquitectónicas, coordina agentes, diseña planes. Requiere razonamiento profundo. |
| `code-reviewer` | `opus` | Quality gate crítico. Debe detectar bugs sutiles, violaciones de SOLID, vulnerabilidades. No se ahorra aquí. |
| `frontend` | `sonnet` | Genera código Angular sustancial, aplica design system, refactoriza componentes. Balance costo/calidad. |
| `backend` | `sonnet` | Lógica de negocio Java/Spring, servicios, seguridad. Necesita buen razonamiento pero es código estructurado. |
| `dba` | `sonnet` | Diseño de esquemas, queries de optimización, migraciones Flyway. Requiere razonamiento medio-alto. |
| `qa` | `haiku` | Tests unitarios siguen patrones repetitivos (Arrange-Act-Assert). Scaffolding de tests es mecánico. Escalar a `sonnet` para tests de integración complejos. |
| `devops` | `haiku` | Dockerfiles, nginx.conf, scripts de deploy son templated. Baja complejidad cognitiva. |

## Skills → Modelo (cuando se invoquen como referencia)

| Skill | Modelo al invocar | Justificación |
|-------|-------------------|---------------|
| `systematic-debugging` | `opus` | Debugging es la tarea más difícil. Requiere razonamiento profundo, hipótesis, eliminación de causas. |
| `writing-plans` | `opus` | Planes de implementación necesitan visión holística del sistema. |
| `product-design` | `opus` | Decisiones de producto nivel Apple requieren juicio profundo. |
| `angular-best-practices` | `sonnet` | Aplicar patterns (OnPush, Signals, lazy loading) es codificación guiada. |
| `java-pro` | `sonnet` | Patterns de Java 21 necesitan buen razonamiento pero son estructurados. |
| `test-driven-development` | `sonnet` | TDD requiere entender la lógica para escribir tests-first. |
| `high-end-visual-design` | `sonnet` | Traducir principios de diseño a CSS/HTML requiere creatividad controlada. |
| `ui-ux-pro-max` | `sonnet` | Evaluación UX con checklists. Razonamiento medio. |
| `frontend-ui-dark-ts` | `haiku` | Es un lookup de tokens y patrones glassmorphism. Referencia directa. |
| `database-architect` | `sonnet` | Diseño de esquemas necesita razonamiento relacional. |
| `sql-pro` | `haiku` | Queries SQL son mecánicas una vez definido el esquema. |
| `docker-expert` | `haiku` | Configs de Docker son templated y predecibles. |

---

## Asignación por Sprint del Plan UX

### Sprint UX-1: Coherencia Sistémica + Accesibilidad
| Tarea | Agente | Modelo |
|-------|--------|--------|
| Planificación del sprint | orchestrator | `opus` |
| Reestilizar documentos-list con p-table | frontend | `sonnet` |
| Rediseñar upload con glassmorphism | frontend | `sonnet` |
| Añadir focus-visible, aria-labels | frontend | `haiku` |
| Crear componente empty-state | frontend | `sonnet` |
| Code review del sprint | code-reviewer | `opus` |

### Sprint UX-2: Performance Angular
| Tarea | Agente | Modelo |
|-------|--------|--------|
| Planificación del sprint | orchestrator | `opus` |
| OnPush + lazy loading rutas | frontend | `sonnet` |
| Migrar *ngIf a @if, *ngFor a @for | frontend | `haiku` |
| takeUntilDestroyed refactor | frontend | `haiku` |
| switchMap en documentos | frontend | `sonnet` |
| Code review del sprint | code-reviewer | `opus` |

### Sprint UX-3: Datos Reales + Responsividad
| Tarea | Agente | Modelo |
|-------|--------|--------|
| Planificación del sprint | orchestrator | `opus` |
| Endpoint /api/v1/expedientes/estadisticas | backend | `sonnet` |
| Conectar filtros con binding Angular | frontend | `sonnet` |
| Búsqueda global en topbar | frontend | `sonnet` |
| Media queries, prefers-reduced-motion | frontend | `haiku` |
| Tests del endpoint nuevo | qa | `haiku` |
| Code review del sprint | code-reviewer | `opus` |

### Sprint UX-4: Word → PDF
| Tarea | Agente | Modelo |
|-------|--------|--------|
| Planificación del sprint | orchestrator | `opus` |
| Implementar converter Java-pura o LibreOffice | backend | `sonnet` |
| Configurar Dockerfile si LibreOffice | devops | `haiku` |
| Feedback de error en frontend | frontend | `sonnet` |
| Tests de conversión | qa | `sonnet` |
| Code review del sprint | code-reviewer | `opus` |

---

## Estimación de Tokens por Sprint

| Sprint | Opus (tokens) | Sonnet (tokens) | Haiku (tokens) | Costo relativo |
|--------|--------------|----------------|---------------|----------------|
| UX-1 | ~15K (plan+review) | ~60K (4 componentes) | ~8K (a11y) | $$ |
| UX-2 | ~10K (plan+review) | ~30K (2 refactors) | ~20K (migraciones mecánicas) | $ |
| UX-3 | ~12K (plan+review) | ~50K (endpoint+filtros+búsqueda) | ~15K (CSS+tests) | $$ |
| UX-4 | ~12K (plan+review) | ~40K (converter+feedback) | ~10K (docker+tests) | $$ |

**Total estimado:** ~49K Opus + ~180K Sonnet + ~53K Haiku
**Optimización:** ~83% del código generado usa Sonnet/Haiku. Opus solo para planificación y quality gates.
