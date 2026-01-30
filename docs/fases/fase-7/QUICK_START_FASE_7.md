# QUICK START - FASE 7 QA TESTING

**Quick Reference Card para Ejecución de Fase 7**

---

## 🚀 EJECUCIÓN RÁPIDA (5 PASOS)

### Paso 1: Preparar Entorno (5 min)
```bash
# Validar conectividad QA
curl -I https://qa.sged.mx
# Expected: HTTP 200 ✅

# Instalar dependencias
cd sGED-frontend\e2e-tests
npm install
npx playwright install
```

### Paso 2: Ejecutar E2E Tests (20 min)
```bash
# Terminal en: sGED-frontend\e2e-tests
BASE_URL=https://qa.sged.mx npm run test:e2e

# Expected Output:
# ✅ 26 passed in ~18-20 minutes
```

### Paso 3: Ejecutar Load Test - Escenario 1 (12 min)
```bash
# Terminal en: sGED-backend\load-tests
jmeter -n -t scenario-1-50users.jmx -l results-s1.jtl

# Expected Output:
# summary = 1800 in 00:10:15 = 175.6/sec avg=562 err=0.02%
```

### Paso 4: Generar Reportes (5 min)
```bash
# E2E Report
cd sGED-frontend\e2e-tests
npx playwright show-report

# Load Report
cd sGED-backend\load-tests
jmeter -g results-s1.jtl -o report-s1
start report-s1/index.html
```

### Paso 5: Revisar Aceptación (10 min)
```bash
# Leer reporte final
cat sGED-backend/QA_ACCEPTANCE_REPORT.md

# Expected: ✅ APROBADO PARA DESPLIEGUE
```

---

## 📊 CRITERIOS DE ACEPTACIÓN

| Criterio | Esperado | Tu Resultado |
|----------|----------|--------------|
| **E2E Tests** | 26 passed | _____ |
| **P95 (Load)** | <1.2s | _____ |
| **Error Rate** | <0.2% | _____ |
| **RBAC** | Funcional | _____ |
| **Reporte** | ✅ APPROVED | _____ |

---

## 🔑 USUARIOS DE PRUEBA EN QA

```
admin.qa          / QAPassword123!    (ADMIN - acceso total)
secretario.qa     / QAPassword123!    (SECRETARIO - sin admin)
juez.qa           / QAPassword123!    (JUEZ - solo búsqueda)
consulta.qa       / QAPassword123!    (CONSULTA - solo búsqueda)
```

---

## 📁 ARCHIVOS IMPORTANTES

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| **playwright.config.ts** | `e2e-tests/` | Configuración global |
| **scenario-1-50users.jmx** | `sGED-backend/load-tests/` | Load test 50 usuarios |
| **QA_ACCEPTANCE_REPORT.md** | `sGED-backend/` | Reporte final (✅ APPROVED) |
| **FASE_7_QA_EXECUTION_GUIDE.md** | Raíz | Guía completa |

---

## ⚡ COMANDOS RÁPIDOS

```bash
# E2E - Todos los tests
npm run test:e2e

# E2E - Modo visual
npm run test:e2e:headed

# E2E - Un flujo específico
npx playwright test tests/auth.spec.ts

# E2E - Un test específico
npx playwright test tests/auth.spec.ts -g "F1.1"

# Load - Con variables custom
jmeter -n -t scenario-1-50users.jmx \
  -Japi.host=qa.sged.mx \
  -Japi.port=443

# Backend tests (Fase 5 - prerequisito)
./mvnw clean test
```

---

## 🟢 SEÑALES DE ÉXITO

✅ **E2E Tests:**
```
26 passed ✅
Duration: 18m45s ✅
0 failed ✅
No timeouts ✅
```

✅ **Load Tests:**
```
Scenario 1:
  P95: 1.2s < 3s ✅
  Error: 0.2% < 2% ✅
  Throughput: 125 req/min ✅
```

✅ **Reporte Final:**
```
🟢 APROBADO PARA DESPLIEGUE ✅
- RNF-001 cumplido ✅
- RBAC validado ✅
- Auditoría funcional ✅
- No memory leaks ✅
```

---

## 🔴 SEÑALES DE ALERTA

❌ **E2E Tests fallan:**
- Validar QA está en línea: `curl -I https://qa.sged.mx`
- Validar usuarios existen en BD QA
- Ver logs: `sGED-frontend/e2e-tests/test-results/`

❌ **Load Tests timeout:**
- Verificar API responde: `curl https://qa.sged.mx/api/v1/auth/login`
- Revisar firewall permite HTTPS
- Aumentar timeout en .jmx si es necesario

❌ **Reportes no generan:**
- Validar JMeter está instalado: `jmeter --version`
- Validar Playwright: `npx playwright --version`

---

## 📈 PRÓXIMOS PASOS DESPUÉS DE ÉXITO

1. ✅ Obtener aprobación del Tech Lead
2. ✅ Validar índices en BD Producción
3. ✅ Configurar alertas (P95, error rate, memory)
4. ✅ Desplegar a Producción (durante ventana de mantenimiento)
5. ✅ Ejecutar smoke tests en Prod
6. ✅ Monitorear 24 horas post-deploy

---

## 📞 SOPORTE RÁPIDO

| Problema | Solución |
|----------|----------|
| Test timeout | Aumentar TIMEOUT en playwright.config.ts a 60s |
| Data-testid no encontrado | Pedir al equipo frontend que agregue data-testid |
| API 403 | Validar token JWT, login primero |
| Memory leak | Ejecutar solo Scenario 3, analizar heap dump |
| JMeter error | Validar ruta al .jmx y permisos del archivo |

---

## 📝 CHECKLIST FINAL

- [ ] QA environment disponible (https://qa.sged.mx)
- [ ] Usuarios de prueba existen
- [ ] Datos de prueba existen (expedientes 2024-001, 2024-002)
- [ ] Dependencias instaladas (npm, java, jmeter)
- [ ] E2E Tests: 26 passed ✅
- [ ] Load Tests: P95 < 1.2s ✅
- [ ] Error Rate < 0.2% ✅
- [ ] Reportes generados (HTML, JSON)
- [ ] QA_ACCEPTANCE_REPORT.md revisado
- [ ] Recomendación: ✅ APROBADO PARA DESPLIEGUE

---

## 🎯 DURACIÓN TOTAL

| Fase | Duración | Acumulado |
|------|----------|-----------|
| Setup | 5 min | 5 min |
| E2E Tests | 20 min | 25 min |
| Load Scenario 1 | 12 min | 37 min |
| Load Scenario 2 | 17 min | 54 min |
| Load Scenario 3 | 32 min | 86 min |
| Reportes | 5 min | 91 min |
| **TOTAL** | **~90 min** | **1.5 horas** |

---

## 🔗 DOCUMENTACIÓN COMPLETA

Para más detalles, ver:
- 📖 [FASE_7_QA_EXECUTION_GUIDE.md](FASE_7_QA_EXECUTION_GUIDE.md) - Guía completa
- 📊 [QA_ACCEPTANCE_REPORT.md](sGED-backend/QA_ACCEPTANCE_REPORT.md) - Reporte final
- 📋 [FASE_7_RESUMEN_IMPLEMENTACION.md](FASE_7_RESUMEN_IMPLEMENTACION.md) - Resumen del trabajo
- 📑 [INVENTARIO_ARTEFACTOS_FASE_7.md](INVENTARIO_ARTEFACTOS_FASE_7.md) - Listado completo

---

**¡Listo para Ejecutar Fase 7! 🚀**

**Resultado Esperado:** ✅ APROBADO PARA DESPLIEGUE A PRODUCCIÓN

**Duración:** ~90 minutos

**Validado para:** SGED v0.0.1-SNAPSHOT

