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

### Sprint UX-1: Coherencia Sistémica + Accesibilidad
- [ ] Reestilizar documentos-list con p-table + design system
- [ ] Rediseñar documentos-upload con glassmorphism drag&drop
- [ ] Añadir focus-visible global
- [ ] Añadir aria-label en sidebar
- [ ] Añadir cursor:pointer en elementos interactivos
- [ ] Crear componente empty-state

### Sprint UX-2: Performance Angular
- [ ] OnPush en todos los componentes
- [ ] Lazy loading de rutas (admin, busqueda, expedientes)
- [ ] Migrar *ngIf/*ngFor a @if/@for
- [ ] takeUntilDestroyed
- [ ] Refactorizar nested subscribe con switchMap

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
