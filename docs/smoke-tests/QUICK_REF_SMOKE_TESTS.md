---
Documento: QUICK_REF_SMOKE_TESTS
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# QUICK REFERENCE - POST-DEPLOYMENT SMOKE TESTS

**Para DevOps y Tech Teams**  
**v1.0.0 Production Deployment**

---

## ⚡ 30 SEGUNDO SUMMARY

**Smoke tests = Validación rápida que el sistema funciona después de despliegue**

✅ No es la batería completa de QA  
✅ 15 tests críticos en 5-8 minutos  
✅ Ejecutar después de cambiar tráfico (1% → 10% → 50% → 100%)  
✅ Todos PASS = GO, Alguno FAIL = ROLLBACK  

---

## 📋 QUICK CHECKLIST

### Pre-Deployment (Hacer antes de desplegar)
```
☐ Crear usuarios de prueba en PROD:
  - admin.prod / AdminProd123! (ADMIN)
  - secretario.prod / SecretarioProd123! (SECRETARIO)
  - juez.prod / JuezProd123! (JUEZ)
  - consulta.prod / ConsultaProd123! (CONSULTA_PUBLICA)

☐ Crear expedientes de prueba mínimos (ej: 2024-001, 2024-002)
☐ Cargar documentos de prueba si es posible
☐ Validar BD conexiones OK
☐ Validar API /health endpoint
```

### Durante Deployment
```
☐ T+0: Despliegue completado → Tráfico 0%
☐ T+2m: Ejecutar QUICK SMOKE
    └─ Si FAIL → ROLLBACK inmediato
    └─ Si PASS → Cambiar tráfico a 10%
☐ T+10m: Ejecutar FULL SMOKE
    └─ Si FAIL → CAMBIAR A 25% y monitorear
    └─ Si PASS → Cambiar tráfico a 100%
```

---

## 🚀 COMANDO PARA EJECUTAR

### Quick Smoke (2 min - después de 1% tráfico)
```powershell
cd sGED-frontend\e2e-tests
BASE_URL=https://sged.produccion.mx `
  npx playwright test tests/smoke.spec.ts `
  -g "SMOKE-1|SMOKE-2|SMOKE-7" `
  --project=chromium
```

### Full Smoke (8 min - después de despliegue completo)
```powershell
cd sGED-frontend\e2e-tests
BASE_URL=https://sged.produccion.mx `
  npx playwright test tests/smoke.spec.ts `
  --project=chromium `
  --reporter=html,json,junit
```

---

## 🎯 DECISION MATRIX

### Quick Smoke Results (T+2 min)

```
SCENARIO 1: ✅ ALL PASS
├─ Action: Cambiar tráfico a 10%
└─ Timeline: Continuar con full smoke a T+10m

SCENARIO 2: ❌ SMOKE-1, 2 o 7 FAIL
├─ Action: ROLLBACK INMEDIATO
├─ Reason: Sistema no disponible / RBAC broken / API down
└─ Timeline: Investigar + reintentar mañana

SCENARIO 3: ⚠️ Timeout (network issue)
├─ Action: Reintentar una vez
└─ Si continúa: Investigar conectividad
```

### Full Smoke Results (T+10 min)

```
SCENARIO 1: ✅ ALL PASS
├─ Action: Cambiar tráfico a 100%
└─ Status: Deployment completado exitosamente

SCENARIO 2: ⚠️ SMOKE-3 a 6 FAIL (búsqueda/docs/etc)
├─ Action: Cambiar tráfico a 50% (no aumentar rápido)
├─ Parallel: Investigar módulo fallido
└─ Si resuelve en 15m: Incrementar tráfico

SCENARIO 3: 🔴 SMOKE-1, 2 o 7 FAIL
├─ Action: ROLLBACK INMEDIATO
└─ Status: Deployment fallido
```

---

## ✅ SUCCESS CRITERIA

**Test pasa si:**

```
SMOKE-1 (Authentication)
├─ Login como ADMIN OK
├─ Login como SECRETARIO OK
├─ Login como JUEZ OK
└─ Login como CONSULTA OK

SMOKE-2 (RBAC)
├─ ADMIN accede a /admin OK
├─ SECRETARIO bloqueado (403) OK
└─ CONSULTA menú limitado OK

SMOKE-3 (Búsqueda)
├─ Quick search retorna resultados OK
└─ Advanced search con filtros OK

SMOKE-4 (Documentos)
├─ Ver/Descargar documento OK (si existen datos)

SMOKE-5 (Auditoría)
├─ Auditoría carga y filtra OK

SMOKE-6 (Performance)
├─ Búsqueda < 5s OK
├─ Login < 10s OK

SMOKE-7 (API)
├─ GET /health OK
└─ POST /auth/login OK
```

---

## 🔴 FAIL SCENARIOS - RESPUESTA RÁPIDA

### Si Auth falla (SMOKE-1)
```
Cause: Problema con autenticación
Check:
  ☐ Usuarios existen en BD? (SELECT * FROM usuarios WHERE username='admin.prod')
  ☐ Password correcto?
  ☐ Server JWT configurado?
Action: ROLLBACK
```

### Si RBAC falla (SMOKE-2)
```
Cause: Control de acceso no funcionando
Check:
  ☐ Tabla de permisos actualizada?
  ☐ Roles asignados correctamente?
  ☐ API security filters activos?
Action: ROLLBACK
```

### Si API health falla (SMOKE-7)
```
Cause: API no responde o down
Check:
  ☐ Servidor corriendo? (ps aux | grep java)
  ☐ Puerto abierto? (netstat -an | grep 8080)
  ☐ Logs de error? (tail /var/log/sged/*)
Action: ROLLBACK
```

### Si búsqueda falla (SMOKE-3)
```
Cause: Módulo de búsqueda down
Check:
  ☐ BD conexiones OK?
  ☐ Índices en lugar?
  ☐ Logs de error?
Action: Cambiar tráfico a 25%, investigar en paralelo
```

---

## 📊 EXPECTED OUTPUTS

### ✅ Success Output
```
========== QUICK SMOKE RESULTS ==========
✅ SMOKE-1.1: Login ADMIN - PASSED (2.1s)
✅ SMOKE-1.2: Login SECRETARIO - PASSED (2.3s)
✅ SMOKE-1.3: Login JUEZ - PASSED (2.0s)
✅ SMOKE-1.4: Login CONSULTA - PASSED (1.9s)
✅ SMOKE-2.1: ADMIN /admin/usuarios - PASSED (0.8s)
✅ SMOKE-2.2: ADMIN /admin/auditoria - PASSED (0.7s)
✅ SMOKE-2.3: SECRETARIO blocked - PASSED (0.5s)
✅ SMOKE-7.1: API /health - PASSED (0.2s)
✅ SMOKE-7.2: API /auth/login - PASSED (0.4s)

========== DECISION ==========
🟢 ALL CRITICAL TESTS PASSED (2 minutes)
→ PROCEED TO NEXT TRAFFIC STEP (1% → 10%)
```

### ❌ Fail Output
```
========== QUICK SMOKE RESULTS ==========
✅ SMOKE-1.1: Login ADMIN - PASSED (2.1s)
✅ SMOKE-1.2: Login SECRETARIO - PASSED (2.3s)
❌ SMOKE-1.3: Login JUEZ - FAILED (timeout)
   Error: Page did not load within 30s
   Status: No response from API

========== DECISION ==========
🔴 CRITICAL TEST FAILED (2 minutes)
→ ROLLBACK IMMEDIATELY
→ Reason: Auth system unavailable
```

---

## 📞 ESCALATION

### Critical Issue (SMOKE-1/2/7 FAIL)
```
To: DevOps Lead, Backend Lead, CTO
Severity: P1 - ROLLBACK NEEDED
Action: Revert deployment v1.0.0
Timeline: Immediate (< 5 minutes)
```

### Non-Critical Issue (SMOKE-3-6 FAIL)
```
To: QA Lead, Backend Team
Severity: P2 - INVESTIGATE
Action: Root cause analysis in parallel
Timeline: Resolve within 30 minutes
```

---

## 🕐 TIMELINE AT A GLANCE

```
T+0:   "Deployment complete" → Tráfico 0%
T+2m:  QUICK SMOKE
       ├─ ✅ PASS → Tráfico 1% → 10%
       └─ ❌ FAIL → ROLLBACK
       
T+10m: FULL SMOKE (si passed T+2m)
       ├─ ✅ PASS → Tráfico 10% → 50% → 100%
       └─ ⚠️ PARTIAL → Tráfico 10% → 25%, monitorear
       
T+30m: Tráfico 100% (si todo OK)
T+60m: Validación final + monitoreo continuo
```

---

## 🔗 RELATED DOCUMENTS

| Documento | Propósito | Lectores |
|-----------|-----------|----------|
| [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) | Guía completa de smoke tests | QA, DevOps |
| [TEMPLATE_PROD_SMOKE_REPORT.md](TEMPLATE_PROD_SMOKE_REPORT.md) | Template de reporte | QA |
| tests/smoke.spec.ts | Tests automatizados | DevOps, QA |

---

## 💡 PRO TIPS

1. **Ejecuta QUICK SMOKE en tu laptop** (no en servidor PROD)
2. **Ten rollback plan listo** antes de ejecutar
3. **Monitorea logs** mientras se ejecutan tests
4. **No aumentes tráfico** si tests pasan pero con warnings
5. **Documenta TODO** en PROD_SMOKE_REPORT_v1.0.0.md

---

## ❓ FAQ

**Q: Cuánto tiempo toma?**  
A: Quick smoke 2 min, full smoke 8 min, total < 15 min

**Q: Qué pasa si un test falla?**  
A: Depende - si es crítico → ROLLBACK, si es importante → monitorear

**Q: Necesito todos los datos de prueba?**  
A: No, usuario ADMIN es suficiente para validación mínima

**Q: Puedo saltarme los smoke tests?**  
A: ❌ NO - son validación crítica pre-go-live

**Q: Qué hago si necesito más info?**  
A: Leer [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md)

---

**Quick Reference Card**  
**SGED v1.0.0 Production Deployment**  
**Keep handy during deployment! 📋**

