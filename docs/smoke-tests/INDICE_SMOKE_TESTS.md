---
Documento: INDICE_SMOKE_TESTS
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# 📚 ÍNDICE - DOCUMENTACIÓN DE SMOKE TESTS
## SGED v1.0.0+ Smoke Testing en Producción

**Fecha**: Enero 28, 2026  
**Agente**: Smoke Tests QA  
**Estado**: ✅ Completado

---

## 📂 ARCHIVOS CREADOS/ACTUALIZADOS

### 1. **PLAN_SMOKE_TESTS_PRODUCCION.md** ⭐
**Ubicación**: Raíz (`/c:/proyectos/oj/`)  
**Tipo**: Documento maestro  
**Propósito**: Plan completo de smoke tests para producción

**Contiene**:
- Contexto de despliegue (v1.0.0, variables, usuarios)
- Definición detallada de 6 flujos Smoke (Smoke-1 a Smoke-6)
- Timeline post-despliegue (T+0, T+2-5, T+10-15, T+20)
- Matriz de decisión GO/NO-GO
- Criterios de aceptación y severidades
- Datos de prueba requeridos
- Escalation path

**Cuándo usar**: Lectura de referencia antes de ejecutar smoke tests

---

### 2. **smoke.spec.ts** ⭐
**Ubicación**: `sGED-frontend/e2e-tests/smoke.spec.ts`  
**Tipo**: Tests automatizados (Playwright)  
**Propósito**: Tests ejecutables post-despliegue

**Contiene**:
- 8 describe blocks (Smoke-1 a Smoke-8)
- 25+ test cases
- Helper functions (login, logout, error checking)
- Inyección de variables de entorno
- Tags para filtering (@smoke-quick, @smoke-full)
- Manejo de timeouts y errores

**Cuándo usar**: Ejecutar en T+2-5 (Quick) y T+10-15 (Full) después de despliegue

**Comandos**:
```bash
npm run test:smoke:quick   # ~4-5 minutos
npm run test:smoke:full    # ~12-15 minutos
```

---

### 3. **TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md** ⭐
**Ubicación**: Raíz (`/c:/proyectos/oj/`)  
**Tipo**: Plantilla de reporte  
**Propósito**: Documentar resultados de smoke tests

**Contiene**:
- Información general (versión, entorno, timestamp)
- Resumen ejecutivo
- Resultados detallados por Smoke-1 a Smoke-8
- Matriz de decisión visual
- Sección de incidencias
- Métricas de baseline
- Artefactos y evidencia
- Firmas de aprobación

**Cuándo usar**: Rellenar en T+20 después de ejecutar smoke tests

**Cómo usar**:
```bash
cp TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md \
   PROD_SMOKE_REPORT_v1.0.0_$(date +%Y%m%d_%H%M%S).md
# Rellenar campos y entregar
```

---

### 4. **QUICK_START_SMOKE_TESTS.md** ⭐
**Ubicación**: Raíz (`/c:/proyectos/oj/`)  
**Tipo**: Guía operativa rápida  
**Propósito**: Referencia diaria para ejecución de smoke tests

**Contiene**:
- Resumen ejecutivo (TL;DR)
- Flujo de trabajo paso a paso
- Tabla de 6 flujos smoke
- Setup inicial (one-time)
- Comandos listos para ejecutar
- Cómo interpretar resultados (3 escenarios)
- Cómo rellenar reporte
- Matriz rápida GO/NO-GO
- Checklist pre-smoke
- Escalation path
- Tips y trucos
- FAQ

**Cuándo usar**: Guía principal para ejecución diaria

---

### 5. **SMOKE_TESTS_ENTREGA_COMPLETADA.md** ⭐
**Ubicación**: Raíz (`/c:/proyectos/oj/`)  
**Tipo**: Resumen de entrega  
**Propósito**: Documentar lo que se ha completado

**Contiene**:
- Resumen ejecutivo
- Descripción detallada de cada artefacto
- Capacidades del Agente
- Cómo usar (flujo operativo)
- Matriz de severidades
- Integración con otros equipos
- Evolución futura
- Checklist de completación
- Próximos pasos

**Cuándo usar**: Referencia administrativa y handoff

---

### 6. **INDICE_SMOKE_TESTS.md** (este archivo) ⭐
**Ubicación**: Raíz (`/c:/proyectos/oj/`)  
**Tipo**: Índice y registro  
**Propósito**: Navegar entre todos los documentos de smoke tests

**Contiene**:
- Lista de todos los archivos
- Descripción de cada uno
- Cuándo usar cada archivo
- Matriz de referencias cruzadas
- Estructura de carpetas

**Cuándo usar**: Cuando necesitas encontrar un documento específico

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
/c:/proyectos/oj/
│
├── PLAN_SMOKE_TESTS_PRODUCCION.md          ✅ Plan maestro
├── TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md    ✅ Plantilla reporte
├── QUICK_START_SMOKE_TESTS.md              ✅ Guía operativa
├── SMOKE_TESTS_ENTREGA_COMPLETADA.md       ✅ Resumen entrega
├── INDICE_SMOKE_TESTS.md                   ✅ Este archivo
│
├── sGED-frontend/
│   └── e2e-tests/
│       └── smoke.spec.ts                   ✅ Tests Playwright
│
├── PLAN_DESPLIEGUE_PRODUCCION.md           (relacionado)
├── ROLLBACK_PLAN_PRODUCCION.md             (relacionado)
├── MONITOREO_OPERACIONES_PRODUCCION.md     (relacionado)
├── DEPLOYMENT_GUIDE.md                     (relacionado)
│
└── [otros archivos del proyecto]
```

---

## 📖 MATRIZ DE REFERENCIAS CRUZADAS

| Documento | Lee antes | Lee después | Relacionado con |
|-----------|-----------|-------------|-----------------|
| PLAN_SMOKE_TESTS_PRODUCCION.md | [nada] | smoke.spec.ts, QUICK_START | ROLLBACK_PLAN |
| smoke.spec.ts | QUICK_START | TEMPLATE_REPORT | PLAN_SMOKE |
| TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md | PLAN_SMOKE, QUICK_START | [enviado] | MONITOREO_OP |
| QUICK_START_SMOKE_TESTS.md | [nada] | smoke.spec.ts | PLAN_SMOKE, TEMPLATE |
| SMOKE_TESTS_ENTREGA_COMPLETADA.md | [nada] | Todos | Administrativo |

---

## 🎯 GUÍA RÁPIDA DE USO

### "Voy a ejecutar smoke tests ahora"

**Pasos**:
1. Lee: [QUICK_START_SMOKE_TESTS.md](QUICK_START_SMOKE_TESTS.md) (5 min)
2. Valida: Checklist pre-smoke (2 min)
3. Ejecuta: `npm run test:smoke:quick` (5 min)
4. Ejecuta: `npm run test:smoke:full` (15 min)
5. Relléna: [TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md](TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md) (5 min)
6. Comparte: En Slack #sged-incidents

**Total**: ~35-40 minutos

---

### "Necesito entender los 6 flujos smoke"

**Pasos**:
1. Lee: [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) - Sección "FLUJOS SMOKE DEFINIDOS" (15 min)
2. Revisa: [smoke.spec.ts](sGED-frontend/e2e-tests/smoke.spec.ts) - test.describe blocks (10 min)

---

### "Necesito revisar el plan maestro"

**Pasos**:
1. Abre: [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md)
2. Secciones clave:
   - "CONTEXTO DE DESPLIEGUE"
   - "FLUJOS SMOKE DEFINIDOS"
   - "TIMELINE POST-DESPLIEGUE"
   - "MATRIZ DE DECISIÓN GO/NO-GO"

---

### "Tengo un fallo en los smoke tests"

**Pasos**:
1. Revisa: [QUICK_START_SMOKE_TESTS.md](QUICK_START_SMOKE_TESTS.md) - Sección "INTERPRETAR RESULTADOS"
2. Valida: Matriz de severidades (¿es bloqueante?)
3. Decide: GO / NO-GO / GO+MON (según matriz)
4. Documenta: Abre [TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md](TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md)

---

### "Necesito hacer rollback"

**Pasos**:
1. Abre: [ROLLBACK_PLAN_PRODUCCION.md](ROLLBACK_PLAN_PRODUCCION.md)
2. Ejecuta plan de rollback
3. Re-ejecuta smoke tests en versión anterior
4. Documenta en reporte

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| **Documentos creados** | 5 |
| **Files modificados** | 1 (smoke.spec.ts) |
| **Test cases implementados** | 25+ |
| **Flujos smoke definidos** | 6 |
| **Timeline post-deploy (min)** | 20 |
| **Líneas de documentación** | 3,500+ |
| **Líneas de código (tests)** | 800+ |

---

## 🔄 CICLO DE VIDA DE LOS DOCUMENTOS

### Creación
✅ Enero 28, 2026 - Agente de Smoke Tests

### Actualización esperada
- **Antes de v1.0.1**: Revisar y actualizar si hay nuevos flujos
- **Antes de v1.1.0**: Agregar nuevos smoke tests si nuevas features críticas
- **Cada trimestre**: Mantener baseline de performance

### Archivos que se recrean después de cada despliegue
- `PROD_SMOKE_REPORT_v1.0.0_YYYYMMDD_HHMMSS.md` (copia del template)

---

## 🚀 PRÓXIMO DESPLIEGUE - CHECKLIST

- [ ] Leer QUICK_START_SMOKE_TESTS.md
- [ ] Validar checklist pre-smoke
- [ ] Ejecutar Quick Smoke
- [ ] Ejecutar Full Smoke
- [ ] Rellenar TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md
- [ ] Compartir en Slack
- [ ] Decidir GO / NO-GO / GO+MON
- [ ] Transición a MONITOREO_OPERACIONES_PRODUCCION.md

---

## 📞 CONTACTO Y SOPORTE

**Preguntas sobre documentos?**
- Agente de Smoke Tests (QA)

**Problemas técnicos con tests?**
- Revisar playwright-report/index.html
- Contactar DevOps si issue con URL/acceso

**Necesito agregar nuevos flujos?**
- Actualizar PLAN_SMOKE_TESTS_PRODUCCION.md
- Agregar test cases a smoke.spec.ts
- Comunicar cambios al equipo

---

## 🎓 PARA NUEVOS MIEMBROS DEL EQUIPO

**Onboarding - Smoke Tests (30 minutos)**:

1. **Lectura** (15 min):
   - [SMOKE_TESTS_ENTREGA_COMPLETADA.md](SMOKE_TESTS_ENTREGA_COMPLETADA.md) - Overview
   - [QUICK_START_SMOKE_TESTS.md](QUICK_START_SMOKE_TESTS.md) - Guía práctica

2. **Revisión de código** (10 min):
   - [smoke.spec.ts](sGED-frontend/e2e-tests/smoke.spec.ts) - Estructura de tests

3. **Dry-run** (5 min):
   - `npx playwright test --dry-run` (sin ejecutar realmente)

**Resultado**: Miembro puede ejecutar smoke tests independientemente

---

## ✅ CHECKLIST DE COMPLETACIÓN FINAL

- ✅ Plan maestro documentado
- ✅ Tests implementados (25+ cases)
- ✅ Plantilla de reporte lista
- ✅ Guía operativa completa
- ✅ 6 flujos definidos
- ✅ Variables de entorno configurables
- ✅ Timeline establecido
- ✅ GO/NO-GO criterios claros
- ✅ Escalation path definido
- ✅ Documentación completa
- ✅ Índice y referencias creadas

**ESTADO**: 🟢 **100% COMPLETADO**

---

```
╔════════════════════════════════════════════════════════════╗
║  ÍNDICE SMOKE TESTS COMPLETADO                            ║
║                                                             ║
║  5 documentos maestros entregados                          ║
║  25+ test cases implementados                              ║
║  6 flujos smoke definidos                                  ║
║  Proceso operativo documentado                             ║
║                                                             ║
║  Listo para primer despliegue a Producción v1.0.0          ║
╚════════════════════════════════════════════════════════════╝
```

---

**Creado por**: Agente de Smoke Tests  
**Fecha**: Enero 28, 2026  
**Versión**: v1.0.0  
**Estado**: ✅ COMPLETADO
