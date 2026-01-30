# 📋 INSTRUCCIONES DE PRÓXIMOS PASOS
## Agente de Smoke Tests - Post-Implementación

**Fecha**: Enero 28, 2026  
**Estado**: ✅ Implementación completada, listo para operación

---

## ✅ QUÉ SE HA COMPLETADO

### Documentación (100%)
- ✅ Plan maestro: `PLAN_SMOKE_TESTS_PRODUCCION.md`
- ✅ Guía rápida: `QUICK_START_SMOKE_TESTS.md`
- ✅ Plantilla reporte: `TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md`
- ✅ Resumen entrega: `SMOKE_TESTS_ENTREGA_COMPLETADA.md`
- ✅ Índice: `INDICE_SMOKE_TESTS.md`
- ✅ Resumen ejecutivo: `SMOKE_TESTS_RESUMEN_EJECUTIVO.md`

### Tests Automatizados (100%)
- ✅ Script Playwright: `sGED-frontend/e2e-tests/smoke.spec.ts`
- ✅ 25+ test cases implementados
- ✅ 6 flujos smoke definidos
- ✅ Tags para filtering

### Proceso (100%)
- ✅ Timeline post-despliegue definido
- ✅ Matriz GO/NO-GO establecida
- ✅ Escalation path documentado
- ✅ Criterios de aceptación claros

---

## 🎯 PRÓXIMAS ACCIONES (Por rol)

### 1️⃣ DevOps - Preparación para Primer Despliegue

**Tarea 1: Crear usuarios de smoke en BD Producción**

```sql
-- Conectar a BD PROD
-- Crear usuarios de prueba

INSERT INTO USERS (username, password, rol, estado, email, created_at)
VALUES 
  ('admin_smoke', HASH('AdminSmoke123!'), 'ADMINISTRADOR', 1, 'admin-smoke@sged.local', NOW()),
  ('secretario_smoke', HASH('SecSmoke123!'), 'SECRETARIO', 1, 'sec-smoke@sged.local', NOW()),
  ('auxiliar_smoke', HASH('AuxSmoke123!'), 'AUXILIAR', 1, 'aux-smoke@sged.local', NOW()),
  ('consulta_smoke', HASH('ConSmoke123!'), 'CONSULTA', 1, 'consulta-smoke@sged.local', NOW());

-- Crear expediente de prueba
INSERT INTO EXPEDIENTES (numero, estado, demandante, demandado, fecha_creacion)
VALUES ('EXP-2026-0001', 'ABIERTO', 'Demandante Smoke', 'Demandado Smoke', NOW());

-- Crear documento de prueba (PDF)
INSERT INTO DOCUMENTOS (id, expediente_id, nombre, tipo, contenido, fecha_carga)
VALUES ('DOC-12345', 'EXP-2026-0001', 'Documento de Prueba.pdf', 'PDF', [CONTENIDO_PDF], NOW());

-- Commit
COMMIT;
```

**Tarea 2: Inyectar variables de entorno en CI/CD**

```bash
# En GitHub Actions (Settings > Secrets and variables > Actions):

SMOKE_BASE_URL_PROD = "https://sged.oj.gob/"
SMOKE_ADMIN_USER = "admin_smoke"
SMOKE_ADMIN_PASS = "[generar en vault]"
SMOKE_SECRETARIO_USER = "secretario_smoke"
SMOKE_SECRETARIO_PASS = "[generar en vault]"
SMOKE_AUXILIAR_USER = "auxiliar_smoke"
SMOKE_AUXILIAR_PASS = "[generar en vault]"
SMOKE_CONSULTA_USER = "consulta_smoke"
SMOKE_CONSULTA_PASS = "[generar en vault]"
SMOKE_EXPEDIENTE_NUMERO = "EXP-2026-0001"
SMOKE_DOCUMENTO_ID = "DOC-12345"
```

**Tarea 3: Validar accesibilidad de Producción**

```bash
# Ejecutar desde máquina QA
curl -I https://sged.oj.gob/login
# Debe responder: HTTP 200 OK

curl -s https://sged.oj.gob/api/v1/health | jq .status
# Debe responder: { "status": "UP" }
```

**Tarea 4: Confirmar con QA cuando esté listo**

Enviar mensaje a #sged-incidents:
```
✅ DevOps: Usuarios smoke + datos de prueba creados en BD prod
✅ DevOps: Variables de entorno inyectadas en CI/CD
✅ DevOps: URL https://sged.oj.gob/ accesible
✅ DevOps: API health check OK

QA: Listo para ejecutar smoke tests cuando despliegue se complete
```

---

### 2️⃣ QA / Agente Smoke Tests - Preparación para Ejecución

**Tarea 1: Setup local (one-time)**

```bash
cd sGED-frontend

# Instalar dependencias
npm install @playwright/test

# Descargar navegadores
npx playwright install

# Verificar que todo está listo
npx playwright test --version
npx playwright test smoke.spec.ts --dry-run
```

**Tarea 2: Crear archivo .env.smoke-prod (NO versionado)**

```bash
# En: .env.smoke-prod (agregar a .gitignore si no está)

BASE_URL_PROD=https://sged.oj.gob/
ADMIN_SMOKE_USER=admin_smoke
ADMIN_SMOKE_PASS=<from-vault>
SECRETARIO_SMOKE_USER=secretario_smoke
SECRETARIO_SMOKE_PASS=<from-vault>
AUXILIAR_SMOKE_USER=auxiliar_smoke
AUXILIAR_SMOKE_PASS=<from-vault>
CONSULTA_SMOKE_USER=consulta_smoke
CONSULTA_SMOKE_PASS=<from-vault>
EXPEDIENTE_SMOKE_NUMERO=EXP-2026-0001
DOCUMENTO_SMOKE_ID=DOC-12345
```

**Tarea 3: Cargar archivo .env**

```bash
# En sesión de terminal
source .env.smoke-prod
# O en Windows:
Get-Content .env.smoke-prod | ForEach-Object { $var = $_.Split('='); [Environment]::SetEnvironmentVariable($var[0], $var[1]) }
```

**Tarea 4: Validar setup con dry-run**

```bash
npx playwright test smoke.spec.ts --dry-run
# Debe listar todos los tests sin ejecutarlos
```

**Tarea 5: Leer documentación (30 min)**

- [ ] [QUICK_START_SMOKE_TESTS.md](QUICK_START_SMOKE_TESTS.md) (10 min)
- [ ] [PLAN_SMOKE_TESTS_PRODUCCION.md](PLAN_SMOKE_TESTS_PRODUCCION.md) - Sección "FLUJOS SMOKE DEFINIDOS" (15 min)
- [ ] [smoke.spec.ts](sGED-frontend/e2e-tests/smoke.spec.ts) - Revisar estructura (10 min)

---

### 3️⃣ Producto/PO - Aprobación

**Tarea: Revisar y aprobar**

- [ ] Leer: [SMOKE_TESTS_RESUMEN_EJECUTIVO.md](SMOKE_TESTS_RESUMEN_EJECUTIVO.md)
- [ ] Confirmar: Los 6 flujos smoke cubren casos críticos
- [ ] Validar: Matriz GO/NO-GO es aceptable
- [ ] Aprobar: Uso en primer despliegue v1.0.0

Enviar confirmación:
```
✅ Producto: Flujos smoke validados
✅ Producto: GO/NO-GO criteria aprobado
✅ Producto: Listo para primer despliegue
```

---

## 📅 EJECUTAR SMOKE TESTS - PASO A PASO

### Cuando DevOps diga "Despliegue v1.0.0 completado"

**T+0 minutos: Validación inicial**

```bash
# Verificar que URL es accesible
curl -I https://sged.oj.gob/login

# Verificar que API responde
curl https://sged.oj.gob/api/v1/health | jq .

# Cargar variables de entorno
source .env.smoke-prod  # o cargar desde CI/CD
```

**T+2-5 minutos: Quick Smoke**

```bash
cd sGED-frontend

# Ejecutar solo tests críticos
npm run test:smoke:quick

# Ver resultados en:
# playwright-report/index.html

# Decisión:
#   - Si PASS: Continuar a Full Smoke
#   - Si FAIL: Escalar a DevOps (posible rollback)
```

**T+10-15 minutos: Full Smoke**

```bash
# Ejecutar todos los smoke tests
npm run test:smoke:full

# Esto ejecuta todos los 25+ test cases
# Duración: ~12-15 minutos

# Ver resultados en:
# playwright-report/index.html
# playwright-report/test-results.json
```

**T+20 minutos: Reporte**

```bash
# Copiar plantilla y rellenar
cp TEMPLATE_PROD_SMOKE_REPORT_v1.0.0.md \
   PROD_SMOKE_REPORT_v1.0.0_$(date +%Y%m%d_%H%M%S).md

# Rellenar con resultados:
#   - Versión, entorno, timestamp
#   - Resultados de cada Smoke-1 a Smoke-8
#   - Incidencias (si aplica)
#   - Decisión: GO / NO-GO / GO+MONITOREO

# Publicar reporte
git add PROD_SMOKE_REPORT_v1.0.0_*.md
git commit -m "Smoke tests v1.0.0: [DECISIÓN]"
git push

# Compartir en Slack
echo "Smoke tests v1.0.0 completado: [LINK al reporte]"
```

**T+25 minutos: Decisión**

```
SI resultado = TODOS PASS:
   → Decisión: 🟢 GO
   → Acción: Aumentar tráfico a 100%
   → Siguiente: MONITOREO_OPERACIONES_PRODUCCION.md

SI resultado = ALGUNOS FALLOS (no críticos):
   → Decisión: 🟡 GO + MONITOREO
   → Acción: Mantener 50% tráfico
   → Siguiente: Investigación en paralelo

SI resultado = FALLOS CRÍTICOS:
   → Decisión: 🔴 NO-GO
   → Acción: Activar ROLLBACK_PLAN_PRODUCCION.md
   → Siguiente: Investigación causa raíz
```

---

## 🛠️ TROUBLESHOOTING RÁPIDO

### "Tests no encuentran elemento X"
→ Puede ser que la UI cambió. Actualizar selectors en smoke.spec.ts

### "Timeout en login"
→ Verificar credenciales en .env.smoke-prod
→ Verificar que usuario existe en BD prod

### "HTTP 500 en búsqueda"
→ Verificar que expediente de prueba existe
→ Revisar logs del backend: `docker logs sged-backend-prod`

### "Test ejecuta pero no valida correctamente"
→ Abrir con `--headed --debug` para ver en tiempo real
→ Verificar selectores en navegador

---

## 📞 QUIÉN HACE QUÉ

| Rol | Tarea | Cuando | Duración |
|-----|-------|--------|----------|
| **DevOps** | Setup BD, variables env | Antes del despliegue | 30 min |
| **QA** | Formación y setup local | Antes del despliegue | 30 min |
| **QA** | Ejecutar Quick Smoke | T+2-5 min post-deploy | 5 min |
| **QA** | Ejecutar Full Smoke | T+10-15 min post-deploy | 15 min |
| **QA** | Rellenar reporte | T+20 min post-deploy | 5 min |
| **Product/PO** | Decisión GO/NO-GO | T+25 min post-deploy | 5 min |
| **DevOps** | Rollout o rollback | T+30 min post-deploy | - |
| **Ops** | Monitoreo 72h | Post-smoke hasta baseline | Continuo |

---

## 📋 CHECKLIST FINAL

### Antes del Primer Despliegue

**DevOps**:
- [ ] Usuarios smoke creados en BD prod
- [ ] Datos de prueba (expediente, documento) creados
- [ ] Variables de entorno en CI/CD
- [ ] URL prod accesible
- [ ] Health check OK

**QA**:
- [ ] Playwright instalado
- [ ] Navegadores descargados
- [ ] smoke.spec.ts verificado
- [ ] .env.smoke-prod configurado
- [ ] Formación completada (30 min)
- [ ] Dry-run ejecutado

**Producto**:
- [ ] Flujos smoke aprobados
- [ ] GO/NO-GO criteria entendidos
- [ ] Team comunicado

**Operaciones**:
- [ ] MONITOREO_OPERACIONES_PRODUCCION.md revisado
- [ ] Dashboard preparado
- [ ] On-call team notificado

---

## 📞 CONTACTO Y ESCALATION

**Preguntas operativas**:
- Agente de Smoke Tests (QA)

**Problemas técnicos**:
- DevOps + Backend Lead

**Decisión GO/NO-GO**:
- Product Owner + CTO

**Rollback necesario**:
- DevOps (activar ROLLBACK_PLAN_PRODUCCION.md)

---

## 🚀 LANZAMIENTO

**Cuando todo esté listo:**

1. DevOps: "Iniciar despliegue v1.0.0"
2. QA: Ejecutar smoke tests (T+0 a T+20)
3. PO: Decidir GO/NO-GO (T+25)
4. DevOps: Rollout (T+30) o Rollback
5. Ops: Monitorear 72h

---

```
╔════════════════════════════════════════════════════════╗
║                                                         ║
║  ✅ AGENTE SMOKE TESTS - LISTO PARA OPERACIÓN         ║
║                                                         ║
║  Documentación: 100% ✅                                ║
║  Tests: 100% ✅                                        ║
║  Proceso: 100% ✅                                      ║
║                                                         ║
║  Próximos pasos: Ver secciones arriba                 ║
║  Estimado tiempo setup: 1-2 días                      ║
║  Estimado tiempo ejecución: 20-25 min por deploy      ║
║                                                         ║
╚════════════════════════════════════════════════════════╝
```

---

**Preparado por**: Agente de Smoke Tests  
**Fecha**: Enero 28, 2026  
**Versión**: v1.0.0
