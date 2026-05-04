---
Documento: QUICK_START_SMOKE_TESTS
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# 🚀 GUÍA RÁPIDA - EJECUCIÓN DE SMOKE TESTS
## SGED v1.2.4+ Smoke Testing en Producción

**Estado**: ✅ LISTO PARA USAR  
**Última actualización**: Enero 28, 2026

---

## 📋 TL;DR - Resumen Ejecutivo

Eres el **Agente de Smoke Tests** de SGED. Tus responsabilidades:

✅ **Validar rápidamente** (< 15 min) que un despliegue a Prod está sano  
✅ **Recomendar GO/NO-GO** para rollout de tráfico  
✅ **Ejecutar tests automatizados** (Playwright)  
✅ **Documentar resultados** en reporte

**No haces**: Regresión completa, cambios de código, investigación profunda (eso es para equipo backend/frontend)

---

## 🎯 FLUJO DE TRABAJO POST-DESPLIEGUE

### T+0 minutos (Momento de despliegue)

```bash
DevOps dice en Slack:
  "✅ Despliegue v1.2.4 completado"
  
Tu acción:
  1. Confirmar URL_PROD accesible (curl -I https://sged.oj.gob/)
  2. Confirmó credenciales de smoke (ADMIN_SMOKE_USER, etc.)
  3. Confirmar datos de prueba en BD (EXPEDIENTE_SMOKE_NUMERO, etc.)
  4. Listo para ejecutar tests
```

### T+2-5 minutos (Quick Smoke)

```bash
# Ejecutar validación rápida (Auth + Expedientes + Admin)
cd sGED-frontend
npm run test:smoke:quick

# Toma ~4-5 minutos
# Si PASS → proceder
# Si FAIL → escalate a DevOps (posible rollback)
```

### T+10-15 minutos (Full Smoke)

```bash
# Ejecutar todos los smoke tests (Smoke-1 a Smoke-8)
npm run test:smoke:full

# Toma ~12-15 minutos
# Revisar resultados en: playwright-report/index.html
```

### T+20 minutos (Decisión GO/NO-GO)

```bash
# Completar reporte basado en resultados
# Reporte template: TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md

# Decisión:
  🟢 GO        → aumentar tráfico a 100%
  🟡 GO+MON    → mantener 50%, monitorear 48h
  🔴 NO-GO     → rollback inmediato
```

---

## 📂 ARCHIVOS PRINCIPALES

| Archivo | Propósito | Cuándo usarlo |
|---------|----------|---------------|
| [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) | **Plan maestro** con 6 flujos, timeline, criterios GO/NO-GO | Antes de ejecutar (referencia) |
| [smoke.spec.ts](sGED-frontend/e2e-tests/smoke.spec.ts) | **Tests automatizados** (Playwright) | Ejecutar post-despliegue |
| [TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md](TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md) | **Plantilla de reporte** | Rellenar después de tests |

---

## 🧪 LOS 6 FLUJOS SMOKE

| # | Flujo | Severidad | Qué valida | Duración |
|---|-------|-----------|-----------|----------|
| **1** | **Auth** | 🔴 Bloqueante | Login/logout de 4 roles | 3-4 min |
| **2** | **Expedientes** | 🔴 Bloqueante | Búsqueda y detalle | 3-4 min |
| **3** | **Documentos** | 🟡 Importante | Listar, ver, descargar | 3-4 min |
| **4** | **Admin Users** | 🔴 Bloqueante | Panel de usuarios | 2-3 min |
| **5** | **Auditoría** | 🟡 Importante | Logs y filtros | 2-3 min |
| **6** | **RBAC** | 🔴 Bloqueante | Control de acceso por rol | 3-4 min |

**Bloqueantes** (🔴): Si fallan → NO-GO + Rollback  
**Importantes** (🟡): Si fallan → GO + Monitoreo intensivo

---

## 🔧 SETUP INICIAL (Una sola vez)

### 1. Instalar dependencias Playwright

```bash
cd sGED-frontend

# Instalar Playwright
npm install @playwright/test

# Descargar navegadores
npx playwright install
```

### 2. Inyectar credenciales (ANTES de ejecutar tests)

**Opción A: Variables de entorno**

```bash
# Crear .env.smoke-prod (NO versionado)
export BASE_URL_PROD="https://sged.oj.gob/"
export ADMIN_SMOKE_USER="admin_smoke"
export ADMIN_SMOKE_PASS="<de-vault>"
export SECRETARIO_SMOKE_USER="secretario_smoke"
export SECRETARIO_SMOKE_PASS="<de-vault>"
export AUXILIAR_SMOKE_USER="auxiliar_smoke"
export AUXILIAR_SMOKE_PASS="<de-vault>"
export CONSULTA_SMOKE_USER="consulta_smoke"
export CONSULTA_SMOKE_PASS="<de-vault>"
export EXPEDIENTE_SMOKE_NUMERO="EXP-2026-0001"
export DOCUMENTO_SMOKE_ID="DOC-12345"
```

**Opción B: GitHub Actions** (para CI/CD)

Pedir al DevOps que agregue secrets a GitHub:
- `SMOKE_BASE_URL_PROD`
- `SMOKE_ADMIN_USER`
- `SMOKE_ADMIN_PASS`
- etc.

### 3. Validar datos de prueba en BD

```sql
-- Conectar a BD de producción
-- Verificar que existen:

SELECT * FROM USERS 
WHERE username IN ('admin_smoke', 'secretario_smoke', 'auxiliar_smoke', 'consulta_smoke');

SELECT * FROM EXPEDIENTES 
WHERE numero = 'EXP-2026-0001';

SELECT * FROM DOCUMENTOS 
WHERE id = 'DOC-12345' AND expediente_id = 'EXP-2026-0001';
```

---

## 🚀 EJECUTAR SMOKE TESTS

### Quick Smoke (4-5 minutos)

```bash
cd sGED-frontend

# Ejecutar solo tests críticos
npm run test:smoke:quick

# O manualmente:
npx playwright test \
  --grep="@smoke-quick" \
  e2e-tests/smoke.spec.ts
```

**Qué valida:**
- Login de ADMIN (Smoke-1)
- Búsqueda de expedientes (Smoke-2)
- Acceso admin (Smoke-4)
- Health API

### Full Smoke (12-15 minutos)

```bash
# Ejecutar todos los tests
npm run test:smoke:full

# O manualmente:
npx playwright test \
  --grep="@smoke-full" \
  e2e-tests/smoke.spec.ts \
  --reporter=html,json,junit
```

**Qué valida:** Todo (Smoke-1 a Smoke-8)

### Con Opciones Adicionales

```bash
# Debug mode (ver navegador)
npx playwright test smoke.spec.ts \
  --headed \
  --debug

# Timeout extendido (si servidor lento)
npx playwright test smoke.spec.ts \
  --timeout=120000  # 120 segundos

# Solo un test específico
npx playwright test smoke.spec.ts \
  -g "S1.1 - ADMIN login"
```

---

## 📊 INTERPRETAR RESULTADOS

### ✅ Todos los tests PASS

```
========== RESULTADO ==========
PASS: S1.1 - ADMIN login
PASS: S1.2 - SECRETARIO login
PASS: S1.3 - AUXILIAR login
PASS: S1.4 - CONSULTA login
PASS: S2.1 - Expedientes search
PASS: S2.2 - Expedientes detail
PASS: S3.1 - Ver documento
PASS: S3.2 - Descargar documento
PASS: S4.1 - Admin usuarios
PASS: S4.2 - Admin auditoria
PASS: S6.1 - RBAC CONSULTA blocked
PASS: S6.2 - RBAC AUXILIAR OK
... [más tests]

Results: 25/25 PASS

DECISIÓN: 🟢 GO COMPLETO
→ Aumentar tráfico a 100%
```

### ⚠️ Algunos tests fallan (pero no críticos)

```
========== RESULTADO ==========
PASS: S1.1 - ADMIN login ✅
PASS: S1.2 - SECRETARIO login ✅
PASS: S2.1 - Expedientes search ✅
PASS: S4.1 - Admin usuarios ✅
PASS: S6.1 - RBAC CONSULTA blocked ✅

FAIL: S3.1 - Ver documento ❌  (timeout)
FAIL: S3.2 - Descargar documento ❌  (404)
PASS: S5.1 - Auditoría logs ✅

Results: 23/25 PASS (92%)

DECISIÓN: 🟡 GO + MONITOREO
→ Mantener tráfico en 50%
→ Asignar backend a revisar visor de documentos
→ Reintentar en 10 minutos
```

### 🔴 Tests críticos fallan

```
========== RESULTADO ==========
FAIL: S1.1 - ADMIN login ❌  (500 Error)
FAIL: S2.1 - Expedientes search ❌  (timeout)
FAIL: S4.1 - Admin usuarios ❌  (HTTP 500)
FAIL: S6.1 - RBAC check ❌  (security issue)

Results: 15/25 PASS (60%)

DECISIÓN: 🔴 NO-GO (ROLLBACK)
→ Detener tráfico inmediatamente
→ Activar plan de rollback
→ Volver a v0.9.x
→ Investigar causa raíz
```

---

## 📋 RELLENAR REPORTE

Después de ejecutar tests:

1. **Copiar plantilla**
   ```bash
   cp TEMPLATE_PROD_SMOKE_REPORT_v1.2.4.md \
      PROD_SMOKE_REPORT_v1.2.4_$(date +%Y%m%d_%H%M%S).md
   ```

2. **Rellenar secciones:**
   - Versión, fecha, duración
   - Resultados para cada Smoke-1 a Smoke-8
   - Incidencias (si aplica)
   - Recomendación final (GO / NO-GO / GO+MON)
   - Firmas

3. **Adjuntar artefactos:**
   - `playwright-report/index.html` (abrir en navegador)
   - `playwright-report/test-results.json`
   - Screenshots de fallos (si aplica)

4. **Publicar reporte:**
   - Commit a git (rama main o docs/)
   - Compartir enlace en Slack #sged-incidents

---

## 🔗 MATRIZ RÁPIDA GO/NO-GO

```
SI FALLA...           ENTONCES...             ACCIÓN
────────────────────────────────────────────────────────
Smoke-1 (Auth)        NO-GO                   → ROLLBACK
Smoke-2 (Expedientes) NO-GO                   → ROLLBACK
Smoke-3 (Documentos)  GO + Monitoreo          → Investigar
Smoke-4 (Admin)       NO-GO                   → ROLLBACK
Smoke-5 (Auditoría)   GO + Monitoreo          → Investigar
Smoke-6 (RBAC)        NO-GO                   → ROLLBACK
Smoke-7 (API)         NO-GO                   → ROLLBACK
Smoke-8 (Performance) GO + Monitoreo          → Tune

TODOS PASS            GO Completo             → 100% tráfico
```

---

## 🎯 CHECKLIST PRE-SMOKE

Antes de ejecutar, validar:

- [ ] DevOps confirmó despliegue (Slack message)
- [ ] URL_PROD accesible: `curl -I https://sged.oj.gob/`
- [ ] Usuarios de smoke existen en BD
- [ ] Expediente de prueba (EXP-2026-0001) existe
- [ ] Documento de prueba (DOC-12345) existe
- [ ] Variables de entorno inyectadas (`env | grep SMOKE`)
- [ ] Playwright instalado: `npm ls @playwright/test`
- [ ] Navegadores descargados: `npx playwright install --check`
- [ ] Tests ejecutables: `npx playwright test smoke.spec.ts --dry-run`

---

## 📞 ESCALATION PATH

### Si tests fallan:

**Inmediato (< 2 min)**:
- Notificar #sged-incidents en Slack
- Adjuntar screenshot/error

**< 5 min**:
- DevOps + Backend Lead + CTO en conferencia

**Decisión**:
- Rollback si es crítico (Smoke-1, 2, 4, 6, 7)
- Debug rápido si es no-crítico (máximo 15 minutos)

---

## 🔗 REFERENCIAS

**Documentación principal:**
- [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) - Plan completo
- [smoke.spec.ts](sGED-frontend/e2e-tests/smoke.spec.ts) - Tests code

**Referencia para operaciones:**
- [ROLLBACK_PLAN_PRODUCCION.md](ROLLBACK_PLAN_PRODUCCION.md) - Si se necesita rollback
- [MONITOREO_OPERACIONES_PRODUCCION.md](MONITOREO_OPERACIONES_PRODUCCION.md) - Monitoreo 72h

**Despliegue:**
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía general
- [PLAN_DESPLIEGUE_PRODUCCION.md](PLAN_DESPLIEGUE_PRODUCCION.md) - Plan detallado

---

## 💡 TIPS Y TRUCOS

### Test es flaky (a veces pasa, a veces no)

```bash
# Reintentar el test
npx playwright test smoke.spec.ts \
  -g "test name" \
  --retries=3
```

### Debuggear un test específico

```bash
# Ejecutar con navegador visible
npx playwright test smoke.spec.ts \
  -g "S2.2 - Búsqueda" \
  --headed \
  --debug

# Pausa el test, puedes interactuar en DevTools
```

### Ver video de ejecución

```bash
# Grabar video
npx playwright test smoke.spec.ts \
  --record-video=on

# Video guardado en: test-results/
```

### Analizar network requests

```javascript
// En los tests Playwright:
page.on('response', response => {
  console.log(`${response.status()} ${response.url()}`);
});
```

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Qué hago si no tengo credenciales de smoke?**  
R: Pedir a DevOps/Seguridad que creen usuarios de prueba en BD prod y proporcionen credenciales vía vault.

**P: ¿Qué si los datos de prueba no existen?**  
R: Crear manualmente en BD prod O usar datos conocidos que ya existan. Documentar el change.

**P: ¿Puedo modificar tests mientras se ejecutan?**  
R: No, espera a que terminen. Los tests son idempotentes por diseño.

**P: ¿Qué pasa si test cuelga (timeout)?**  
R: Ctrl+C para cancelar, aumentar timeout (`--timeout=120000`) y reintentar.

**P: ¿Puedo hacer smoke tests en staging?**  
R: Sí, mismo plan aplica. Solo cambia BASE_URL_PROD por URL de staging.

---

## 📞 SOPORTE

**Problemas con tests?**
- Revisar [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) sección "Troubleshooting"
- Revisar logs: `playwright-report/index.html`

**Problemas con producción?**
- Contactar a DevOps/Backend Lead
- Activar [ROLLBACK_PLAN_PRODUCCION.md](ROLLBACK_PLAN_PRODUCCION.md) si es necesario

---

```
╔════════════════════════════════════════════════╗
║  SMOKE TESTS - GUÍA RÁPIDA LISTA              ║
║  ✅ Setup completado                           ║
║  ✅ Tests listos                               ║
║  ✅ Proceso documentado                        ║
║  ✅ Listo para primer despliegue               ║
╚════════════════════════════════════════════════╝
```

**Creado por**: Agente de Smoke Tests  
**Fecha**: Enero 28, 2026  
**Estado**: ✅ OPERACIONAL
