# Auditoría UX — SGED v1.3.0
**Fecha:** 1 mayo 2026  
**Versión base:** `708fbb7` (snapshot pre-auditoría)  
**Ejecutada por:** Agentes Frontend, QA, Code-Reviewer  
**Skills aplicados:** ui-ux-pro-max, high-end-visual-design, product-design, frontend-ui-dark-ts, angular-best-practices

---

## Resumen

Se identificaron **18 hallazgos** clasificados por severidad:

| Severidad | Cantidad | Ejemplos clave |
|-----------|----------|----------------|
| 🔴 Crítico | 3 | Word sin visualizar, documentos-list sin design system, upload sin diseño |
| 🟠 Alto | 3 | KPIs falsos, filtros decorativos, sin búsqueda global |
| 🟡 Medio | 6 | Sin focus-visible, sin aria-labels, sin responsive grid, sin OnPush |
| 🟢 Bajo | 6 | Tamaño en bytes crudos, legacy *ngIf, takeUntilDestroyed |

## Plan de Sprints

### Sprint UX-1: Coherencia Sistémica + Accesibilidad ✅ COMPLETADO
**Branch:** `feature/sprint-ux-1` → merged a `main`  
**Code Review:** opus — aprobado con 3 fixes (C1 a11y, I1 reduced-motion, I4 takeUntilDestroyed)
- [x] Reestilizar documentos-list con p-table + design system (`cb8890c`)
- [x] Rediseñar documentos-upload con glassmorphism drag&drop (`fd1b765`)
- [x] Añadir focus-visible global (`251d34f`)
- [x] Añadir aria-label en sidebar (`c39cab0`)
- [x] Añadir cursor:pointer en elementos interactivos (`251d34f`)
- [x] Crear componente empty-state (`6223262`)
- [x] Fix: drop-zone accesible por teclado (`301d067`)
- [x] Fix: prefers-reduced-motion global (`301d067`)
- [x] Fix: takeUntilDestroyed en upload (`301d067`)

### Sprint UX-2: Performance Angular ✅ COMPLETADO
**Branch:** `feature/sprint-ux-2` → merged a `main`  
**Code Review:** opus — detectó regresión de seguridad (RoleGuard eliminado en lazy loading)
- [x] OnPush en todos los componentes — 35/35 (`8266db9`)
- [x] Lazy loading de rutas — 14 rutas con loadComponent (`f6d4c31`)
- [x] Migrar *ngIf/*ngFor a @if/@for — 0 ocurrencias legacy (`0d7a0ef`)
- [x] takeUntilDestroyed — 0 patrones Subject+ngOnDestroy (`d378919`)
- [x] Refactorizar nested subscribe con switchMap (`142df58`)
- [x] Fix: RoleGuard restaurado + markForCheck en catálogos (`a583c15`)

### Sprint UX-3: Datos Reales + Responsividad
- [ ] Endpoint /api/v1/expedientes/estadisticas
- [ ] Conectar filtros con binding Angular
- [ ] Búsqueda global en topbar
- [ ] Media queries para grid-4
- [ ] prefers-reduced-motion
- [ ] Contraste WCAG AA en footer login
- [ ] Confirmación de logout

### Sprint UX-4: Word → PDF
- [ ] Decidir: LibreOffice vs docx4j (Java-pura)
- [ ] Implementar conversión confiable
- [ ] Asegurar conversion.enabled=true
- [ ] Feedback de error al usuario en frontend

## Referencia de Skills Utilizados

| Skill | Ubicación | Uso principal |
|-------|-----------|---------------|
| ui-ux-pro-max | `.ai/skills/ui-ux-pro-max/SKILL.md` | Checklist de accesibilidad, touch targets, layout |
| high-end-visual-design | `.ai/skills/high-end-visual-design/SKILL.md` | Anti-patterns, double-bezel, motion |
| product-design | `.ai/skills/product-design/SKILL.md` | Principios Apple, design cognitivo, crítica |
| frontend-ui-dark-ts | `.ai/skills/frontend-ui-dark-ts/SKILL.md` | Glass patterns, dark tokens |
| angular-best-practices | `.ai/skills/angular-best-practices/SKILL.md` | OnPush, Signals, lazy loading |
| code-reviewer | `.ai/agents/code-reviewer.md` | Plan alignment, issue categorization |
