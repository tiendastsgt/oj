---
Documento: MAPA_MENTAL_SMOKE_TESTS
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# 🗺️ MAPA MENTAL - SMOKE TESTS
## Navegación rápida por todos los artefactos

**Creado**: Enero 28, 2026  
**Estado**: ✅ Completo

---

## 🎯 EMPEZAR AQUÍ

### "Quiero entender qué es esto"
```
README_SMOKE_TESTS.md
    ↓
SMOKE_TESTS_RESUMEN_EJECUTIVO.md
    ↓
SMOKE_TESTS_ENTREGA_COMPLETADA.md
```

### "Voy a ejecutar smoke tests ahora"
```
QUICK_START_SMOKE_TESTS.md  ⭐ LEER PRIMERO
    ↓
npm run test:smoke:quick  (5 min)
    ↓
npm run test:smoke:full  (15 min)
    ↓
Rellenar: TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md
    ↓
Compartir en Slack
```

### "Necesito entender el plan completo"
```
PLAN_SMOKE_TESTS_PRODUCCION.md
    ├─ Variables
    ├─ 6 Flujos Smoke
    ├─ Timeline
    └─ GO/NO-GO
```

---

## 📚 DOCUMENTOS POR PROPÓSITO

### Para Ejecutar Tests
- **QUICK_START_SMOKE_TESTS.md** ⭐ Leer primero (5 min)
- **smoke.spec.ts** - Los tests reales (revisar 10 min)
- **TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md** - Reporte resultado

### Para Entender el Plan
- **PLAN_SMOKE_TESTS_PRODUCCION.md** - Plan integral (20 min)
- **INDICE_SMOKE_TESTS.md** - Índice completo
- **SMOKE_TESTS_ENTREGA_COMPLETADA.md** - Lo que se entregó

### Para Administración/Management
- **README_SMOKE_TESTS.md** - Resumen ejecutivo
- **SMOKE_TESTS_RESUMEN_EJECUTIVO.md** - Para presentaciones
- **PROXIMO_PASO_SMOKE_TESTS.md** - Tareas por rol

### Para Operaciones
- **MONITOREO_OPERACIONES_PRODUCCION.md** - Después de smoke OK
- **ROLLBACK_PLAN_PRODUCCION.md** - Si NO-GO
- **DEPLOYMENT_GUIDE.md** - Contexto general

---

## 🎯 MATRIZ DE REFERENCIAS

```
┌─────────────────────────────────────────────────────────┐
│ FLUJO DE DESPLIEGUE - QUÉ LEER CUÁNDO                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ANTES DE DESPLIEGUE                                    │
│ ├─ Leer: QUICK_START_SMOKE_TESTS.md                   │
│ ├─ Leer: PLAN_SMOKE_TESTS_PRODUCCION.md               │
│ ├─ Revisar: smoke.spec.ts                             │
│ └─ Setup: Playwright + variables env                   │
│                                                          │
│ DURANTE DESPLIEGUE (T+0 a T+20 min)                   │
│ ├─ T+2-5: Ejecutar npm run test:smoke:quick           │
│ ├─ T+10-15: Ejecutar npm run test:smoke:full          │
│ ├─ T+20: Rellenar TEMPLATE_PROD_SMOKE_REPORT          │
│ └─ T+25: Decisión GO/NO-GO                             │
│                                                          │
│ DESPUÉS DE SMOKE TESTS OK                              │
│ ├─ Leer: MONITOREO_OPERACIONES_PRODUCCION.md          │
│ ├─ Vigilancia: 72 horas                                │
│ └─ Baseline: Después de 24h                            │
│                                                          │
│ SI SMOKE TESTS FALLAN (NO-GO)                          │
│ ├─ Leer: ROLLBACK_PLAN_PRODUCCION.md                  │
│ ├─ Ejecutar: Rollback inmediato                        │
│ ├─ Validar: Smoke tests en versión anterior           │
│ └─ Investigar: Causa raíz                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 ESTRUCTURA DE CONTENIDOS

### PLAN_SMOKE_TESTS_PRODUCCION.md
```
├── 📋 Contexto (variables, datos)
├── 🧪 6 Flujos Smoke (definiciones)
├── 📅 Timeline post-despliegue
├── 🚦 Matriz GO/NO-GO
├── ⚙️ Configuración
└── 🔗 Referencias
```

### smoke.spec.ts
```
├── Smoke-1: Autenticación (7 tests)
├── Smoke-2: Expedientes (4 tests)
├── Smoke-3: Documentos (3 tests)
├── Smoke-4: Admin (4 tests)
├── Smoke-5: Auditoría (3 tests)
├── Smoke-6: RBAC (5 tests)
├── Smoke-7: API Health (3 tests)
└── Smoke-8: Performance (3 tests)
```

### TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md
```
├── 📋 Información general
├── 📊 Resumen ejecutivo
├── 📈 Resultados por flujo
├── 🔴 Incidencias
├── 🚦 Matriz decisión
├── 📸 Artefactos
└── ✍️ Firmas
```

---

## 🔄 CICLO DE VIDA

```
CREACIÓN (Hoy)
    ↓
FORMACIÓN (1-2 días)
    ├─ DevOps: Setup BD, variables
    ├─ QA: Setup Playwright
    └─ Producto: Aprobación
    ↓
EJECUCIÓN (T+0 a T+20 min en cada despliegue)
    ├─ Quick Smoke
    ├─ Full Smoke
    └─ Reporte
    ↓
DECISIÓN (T+25 min)
    ├─ 🟢 GO: Rollout 100%
    ├─ 🟡 GO+MON: Vigilancia 48h
    └─ 🔴 NO-GO: Rollback
    ↓
MANTENIMIENTO (Contínuo)
    ├─ Actualizar plan si hay nuevos flujos
    ├─ Mantener tests actualizados
    └─ Evolucionarlos para v1.1, v1.2, etc.
```

---

## 🎯 TAREAS POR ROL

### DevOps
```
[ ] Usuarios smoke en BD prod
[ ] Datos de prueba (expediente, documento)
[ ] Variables env en CI/CD
[ ] Confirmar URL accesible
[ ] Health check OK
```

### QA / Agente Smoke Tests
```
[ ] Instalar Playwright
[ ] Leer QUICK_START_SMOKE_TESTS.md
[ ] Setup .env.smoke-prod
[ ] Dry-run tests
[ ] Ejecutar Quick Smoke (T+2-5)
[ ] Ejecutar Full Smoke (T+10-15)
[ ] Rellenar reporte (T+20)
[ ] Compartir en Slack
```

### Producto/PO
```
[ ] Revisar flujos smoke
[ ] Aprobar GO/NO-GO criteria
[ ] Comunicar a team
[ ] Decidir en caso de fallo
```

### Operaciones
```
[ ] Leer MONITOREO_OPERACIONES_PRODUCCION.md
[ ] Preparar dashboard
[ ] Setup alertas
[ ] Team on-call 24/7 por 72h
```

---

## 📞 RESOLUCIÓN DE PROBLEMAS

### "¿Cómo ejecuto smoke tests?"
→ [QUICK_START_SMOKE_TESTS.md](QUICK_START_SMOKE_TESTS.md)

### "¿Qué significa si falla Smoke-X?"
→ [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) + severidad

### "¿Cuál es el proceso GO/NO-GO?"
→ [SMOKE_TESTS_ENTREGA_COMPLETADA.md](SMOKE_TESTS_ENTREGA_COMPLETADA.md) + matriz

### "¿Necesito rollback?"
→ [ROLLBACK_PLAN_PRODUCCION.md](ROLLBACK_PLAN_PRODUCCION.md)

### "¿Qué hago después de smoke OK?"
→ [MONITOREO_OPERACIONES_PRODUCCION.md](MONITOREO_OPERACIONES_PRODUCCION.md)

### "¿Cuáles son los próximos pasos?"
→ [PROXIMO_PASO_SMOKE_TESTS.md](PROXIMO_PASO_SMOKE_TESTS.md)

---

## 🚀 TIMELINE ESTIMADO

```
Hoy (T+0)          Implementación completada ✅
Días 1-2           DevOps + QA setup (1-2 horas)
Día del deploy     Ejecución de smoke tests (20 min)
Post-deploy        Monitoreo 72h
```

---

## 🎓 FORMACIÓN

### Mínimo (15 minutos)
- Leer: QUICK_START_SMOKE_TESTS.md

### Estándar (45 minutos)
- Leer: QUICK_START_SMOKE_TESTS.md (10 min)
- Leer: PLAN_SMOKE_TESTS_PRODUCCION.md (20 min)
- Revisar: smoke.spec.ts (10 min)
- Dry-run: tests (5 min)

### Completo (1.5 horas)
- Leer: Todos los documentos
- Revisar: smoke.spec.ts detalladamente
- Dry-run y pruebas
- Q&A con equipo

---

## 🔗 DOCUMENTO RÁPIDO

```
EMPEZAR AQUÍ
    ├─ Ejecutar ahora → QUICK_START_SMOKE_TESTS.md
    ├─ Entender → PLAN_SMOKE_TESTS_PRODUCCION.md
    ├─ Resultados → TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md
    ├─ Referencia → INDICE_SMOKE_TESTS.md
    └─ Setup → PROXIMO_PASO_SMOKE_TESTS.md

DESPUÉS DE SMOKE OK
    ├─ Monitoreo → MONITOREO_OPERACIONES_PRODUCCION.md
    └─ Referencias → STACK_TECNICO_ACTUALIZADO.md

DESPUÉS DE SMOKE FAIL
    └─ Rollback → ROLLBACK_PLAN_PRODUCCION.md
```

---

## ✅ CHECKLIST DE LECTURA

### Obligatorio para ejecutar
- [ ] QUICK_START_SMOKE_TESTS.md (10 min)

### Recomendado antes del primer deploy
- [ ] PLAN_SMOKE_TESTS_PRODUCCION.md (20 min)
- [ ] smoke.spec.ts (10 min)
- [ ] PROXIMO_PASO_SMOKE_TESTS.md (10 min)

### Referencia (según necesidad)
- [ ] TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md
- [ ] INDICE_SMOKE_TESTS.md
- [ ] MONITOREO_OPERACIONES_PRODUCCION.md
- [ ] ROLLBACK_PLAN_PRODUCCION.md

---

## 📊 ESTADÍSTICAS RÁPIDAS

| Métrica | Valor |
|---------|-------|
| **Documentos** | 8+ |
| **Test Cases** | 25+ |
| **Flujos Smoke** | 6 |
| **Líneas de código** | 800+ |
| **Líneas de documentación** | 5,000+ |
| **Tiempo lectura min** | 10 min |
| **Tiempo ejecución tests** | 20 min |
| **Tiempo setup** | 1-2 horas |

---

```
╔═════════════════════════════════════════════════════════╗
║                                                          ║
║  🗺️ MAPA MENTAL - SMOKE TESTS                          ║
║                                                          ║
║  ✅ Todos los documentos indexados                      ║
║  ✅ Flujos claros definidos                            ║
║  ✅ Listo para navegar                                  ║
║                                                          ║
║  Empezar por: QUICK_START_SMOKE_TESTS.md              ║
║                                                          ║
╚═════════════════════════════════════════════════════════╝
```

---

**Creado por**: Agente de Smoke Tests  
**Fecha**: Enero 28, 2026  
**Actualización**: Contínua
