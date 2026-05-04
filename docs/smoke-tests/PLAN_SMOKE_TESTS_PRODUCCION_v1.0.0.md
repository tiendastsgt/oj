---
Documento: PLAN_SMOKE_TESTS_PRODUCCION_v1.2.4
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# 🚀 PLAN DE SMOKE TESTS - PRODUCCIÓN
## SGED v1.2.4+ - Post-Deployment Validation

**Propósito**: Validar rápidamente (< 15 minutos) que un despliegue a Producción está sano  
**Responsable**: Agente de Smoke Tests + QA + DevOps  
**Alcance**: Flujos críticos mínimos (Auth, Expedientes, Documentos, Admin, Auditoría, RBAC)  
**Versión del Plan**: v1.2.4 (se actualiza para cada mayor release)

---

## 📋 CONTEXTO DE DESPLIEGUE

### Versión Objetivo
- **Versión**: v1.2.4
- **Entorno**: Producción (prod)
- **Tipo de despliegue**: Full release / Hotfix (especificar en ejecución)
- **Ventana**: Fuera de horario de negocio (especificar en ejecución)

### Variables de Configuración
Estas variables deben inyectarse **por el equipo DevOps/Seguridad antes de ejecutar los smoke tests**:

| Variable | Valor Placeholder | Ejemplo Real | Nota |
|----------|-------------------|--------------|------|
| `BASE_URL_PROD` | `https://sged.oj.gob/` | TBD por DevOps | URL base de la app en producción |
| `API_URL_PROD` | `https://api.sged.oj.gob/api/v1` | TBD por DevOps | Endpoint API |
| `ADMIN_SMOKE_USER` | `admin_smoke` | Generado por Seguridad | Usuario ADMIN para tests |
| `ADMIN_SMOKE_PASS` | `[VAULTED]` | En vault/secrets | Contraseña (NO en git) |
| `SECRETARIO_SMOKE_USER` | `secretario_smoke` | Generado por Seguridad | Usuario SECRETARIO |
| `SECRETARIO_SMOKE_PASS` | `[VAULTED]` | En vault/secrets | Contraseña (NO en git) |
| `AUXILIAR_SMOKE_USER` | `auxiliar_smoke` | Generado por Seguridad | Usuario AUXILIAR |
| `AUXILIAR_SMOKE_PASS` | `[VAULTED]` | En vault/secrets | Contraseña (NO en git) |
| `CONSULTA_SMOKE_USER` | `consulta_smoke` | Generado por Seguridad | Usuario CONSULTA (readonly) |
| `CONSULTA_SMOKE_PASS` | `[VAULTED]` | En vault/secrets | Contraseña (NO en git) |
| `EXPEDIENTE_SMOKE_NUMERO` | `EXP-2026-0001` | Definido por QA | Expediente de prueba existente en BD |
| `DOCUMENTO_SMOKE_ID` | `DOC-12345` | Definido por QA | Documento dentro del expediente de prueba |

### Datos de Prueba Requeridos en Producción

**Antes de ejecutar smoke tests, validar que estos datos existan en la BD de producción:**

```sql
-- Usuarios de prueba
ADMIN_SMOKE_USER: rol = ADMINISTRADOR, activo = true
SECRETARIO_SMOKE_USER: rol = SECRETARIO, activo = true
AUXILIAR_SMOKE_USER: rol = AUXILIAR, activo = true
CONSULTA_SMOKE_USER: rol = CONSULTA, activo = true

-- Expediente de prueba
EXPEDIENTE_SMOKE_NUMERO: 
  - Estado: ABIERTO
  - Tiene documentos adjuntos
  - Accesible por al menos SECRETARIO/AUXILIAR

-- Documento de prueba
DOCUMENTO_SMOKE_ID:
  - Formato: PDF (o formato que soporte el visor)
  - Expediente: EXPEDIENTE_SMOKE_NUMERO
  - Visible para: SECRETARIO/AUXILIAR/CONSULTA
```

---

## 🧪 FLUJOS SMOKE DEFINIDOS

### Smoke-1: Autenticación (Auth)

**Severidad si falla**: 🔴 **BLOQUEANTE** (NO-GO + Rollback inmediato)

**Descripción**: Validar login/logout de los 4 roles principales  
**Duración estimada**: 3-4 minutos

#### Pasos

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 1.1 | Navegar a `BASE_URL_PROD/login` | Página de login carga (HTTP 200, sin errores JS) | Timeout si > 5s |
| 1.2 | Ingresar credenciales ADMIN (`ADMIN_SMOKE_USER` / `ADMIN_SMOKE_PASS`) | Login exitoso → redirige a dashboard ADMIN | Verificar URL contiene `/dashboard` o `/admin` |
| 1.3 | Verificar token en cookies/localStorage | Token JWT válido presente | No expirado |
| 1.4 | Logout (click botón logout) | Redirige a `/login` nuevamente | Session limpiada |
| 1.5 | Repetir 1.2-1.4 con SECRETARIO_SMOKE_USER | Login SECRETARIO exitoso | Redirige a `/dashboard` normal (no admin) |
| 1.6 | Repetir 1.2-1.4 con AUXILIAR_SMOKE_USER | Login AUXILIAR exitoso | Rol correcto asignado |
| 1.7 | Repetir 1.2-1.4 con CONSULTA_SMOKE_USER | Login CONSULTA exitoso | Acceso limitado (readonly) |
| 1.8 | Intentar login con credenciales inválidas | Muestra error 401 / mensaje "credenciales inválidas" | No 500 / no crash |
| 1.9 | Intentar acceder a `/admin` sin autenticación | Redirige a `/login` | No 500 / 403 esperado |

#### Criterios de Aceptación

- ✅ Los 4 roles logean correctamente
- ✅ No hay errores 500
- ✅ No hay errores JavaScript en consola
- ✅ Logout limpia la sesión
- ✅ Rechazo de credenciales inválidas es graceful y sin crash
- 🟡 **Importante** = Monitorear, fallos no bloquean despliegue

---

## 3. TIMING DE EJECUCIÓN

### 📋 Timeline Recomendado (Post-Despliegue)

```
T+0 min:   DevOps avisa "Despliegue completado en PROD"
           ├─ Verificar que API responde (curl /health)
           └─ Cambiar tráfico a 1% (canary)

T+2 min:   EJECUTAR QUICK SMOKE (SMOKE-1, 2, 7)
           ├─ Si todos PASS → Continuar
           ├─ Si alguno FAIL → ROLLBACK inmediato
           └─ Documentar en reporte

T+5 min:   Si quick pass → Cambiar tráfico a 10%

T+10 min:  EJECUTAR FULL SMOKE (todos los tests)
           ├─ Si todos PASS → Cambiar tráfico a 50%
           └─ Si fallos menores → Cambiar a 25%

T+30 min:  Si todo OK → Cambiar tráfico a 100%

T+60 min:  EJECUTAR SMOKE NUEVAMENTE (validación final)
           └─ Documentar resultado final
```

### Escenarios de Decisión

#### ✅ Todos los tests PASS
```
→ Cambiar tráfico a 100% inmediatamente
→ Considerar despliegue exitoso
→ Continuar monitoreo estándar
```

#### ⚠️ SMOKE-1, 2 o 7 FAIL (Críticos)
```
→ DETENER incremento de tráfico
→ INVESTIGAR incidencia en equipo backend
→ ROLLBACK si no se resuelve en 15 minutos
→ Documentar causa raíz
```

#### 🟡 SMOKE-3, 4, 5 o 6 FAIL (Importantes)
```
→ Continuar con tráfico actual (no reducir)
→ Investigar en paralelo
→ Ajustar si es necesario (ej: agregar índices)
→ Reintentar en 10 minutos
```

---

## 4. COMANDOS RÁPIDOS

### Quick Smoke (2 minutos - Después de cambio de tráfico 1%)
```bash
cd sGED-frontend/e2e-tests

# Solo tests críticos (autenticación + health)
BASE_URL=https://sged.produccion.mx \
  npx playwright test tests/smoke.spec.ts \
  -g "SMOKE-1|SMOKE-2|SMOKE-7" \
  --project=chromium
```

### Full Smoke (5-8 minutos - Después de despliegue completo)
```bash
# Todos los smoke tests
BASE_URL=https://sged.produccion.mx \
  npx playwright test tests/smoke.spec.ts \
  --project=chromium \
  --reporter=html,json,junit
```

### Con opciones adicionales
```bash
# Debug mode (ver navegador)
BASE_URL=https://sged.produccion.mx \
  npx playwright test tests/smoke.spec.ts \
  --headed \
  --debug

# Con timeout extendido (en caso de lentitud)
BASE_URL=https://sged.produccion.mx \
  npx playwright test tests/smoke.spec.ts \
  --timeout 120000
```

---

## 5. USUARIOS DE PRUEBA EN PRODUCCIÓN

**ANTES de despliegue, DevOps debe crear estos usuarios:**

| Username | Password | Rol | Estado |
|----------|----------|-----|--------|
| `admin.prod` | `AdminProd123!` | ADMIN | Debe existir |
| `secretario.prod` | `SecretarioProd123!` | SECRETARIO | Debe existir |
| `juez.prod` | `JuezProd123!` | JUEZ | Debe existir |
| `consulta.prod` | `ConsultaProd123!` | CONSULTA_PUBLICA | Debe existir |

**NOTA:** Si estos usuarios no existen, los tests fallarán. Coordinar con DevOps/BD.

---

## 6. MATRIZ DE DECISIÓN RÁPIDA

```
┌─────────────────────────────────────────────────────────┐
│         SMOKE TEST RESULT DECISION MATRIX               │
└─────────────────────────────────────────────────────────┘

QUICK SMOKE (T+2 min):
├─ ✅ ALL PASS    → Cambiar tráfico a 10%
├─ ⚠️ SMOKE-1 FAIL → ROLLBACK inmediato
├─ ⚠️ SMOKE-2 FAIL → ROLLBACK inmediato
└─ ⚠️ SMOKE-7 FAIL → ROLLBACK inmediato

FULL SMOKE (T+10 min):
├─ ✅ ALL PASS    → Cambiar tráfico a 100%
├─ 🟡 SMOKE-3-6 FAIL → Cambiar tráfico a 50%
└─ 🔴 SMOKE-1,2,7 FAIL → ROLLBACK + investigar

DURANTE OPERACIÓN:
├─ ✅ Métricas normales (P95 < 3s) → Continuar
├─ 🟡 P95 > 3s, Error rate > 2% → Investigar
└─ 🔴 Indisponibilidad → ROLLBACK
```

---

## 7. ARTEFACTOS GENERADOS

Después de ejecutar smoke tests, se generarán:

```
playwright-report/
├── index.html                 ← Abrir en navegador para reporte visual
├── test-results.json          ← Datos en JSON (para CI/CD)
└── results/
    └── screenshots/           ← Si hay fallos

PROD_SMOKE_REPORT_v1.2.4.md   ← Reporte final (ver sección 8)
```

---

## 8. TEMPLATE DE REPORTE (PROD_SMOKE_REPORT_v1.2.4.md)

El siguiente documento se completará después de ejecución:

```markdown
# SMOKE TEST REPORT - Producción v1.2.4

**Fecha/Hora:** [COMPLETAR]
**Versión Desplegada:** v1.2.4
**Ambiente:** Producción (sged.produccion.mx)
**Ejecutado por:** [Agente de Testing]
**Tráfico en el momento:** [0% → 1% → 10% → 50% → 100%]

## Resumen
- **Duración Total:** [X minutos]
- **Tests Ejecutados:** 15+
- **Tests Pasados:** [X]/[Y]
- **Tests Fallidos:** [X]
- **Status General:** ✅ OK / ⚠️ WITH ISSUES / 🔴 FAILED

## Resultados por Categoría

### SMOKE-1: Autenticación
- ✅ Login ADMIN: OK
- ✅ Login SECRETARIO: OK
- ✅ Login JUEZ: OK
- ✅ Login CONSULTA: OK

### SMOKE-2: RBAC
- ✅ ADMIN /admin/usuarios: OK
- ✅ ADMIN /admin/auditoria: OK
- ✅ SECRETARIO blocked: OK
- ✅ CONSULTA menu: OK

### SMOKE-3: Búsqueda
- ✅ Quick search: OK
- ✅ Advanced search: OK

### SMOKE-4: Documentos
- ✅ Ver documento: [OK / N/A / FAIL]
- ✅ Descargar documento: [OK / N/A / FAIL]

### SMOKE-5: Auditoría
- ✅ Cargar auditoría: OK
- ✅ Filtrar auditoría: OK

### SMOKE-6: Performance
- ✅ Búsqueda < 5s: OK ([X]ms)
- ✅ Login < 10s: OK ([X]ms)

### SMOKE-7: API Health
- ✅ GET /health: OK
- ✅ POST /auth/login: OK

## Incidencias Identificadas
[COMPLETAR si hay]

## Recomendación
🟢 **PROCEDER CON TRÁFICO AL 100%** o ⚠️ **MONITOREAR CON CAUTELA** o 🔴 **ROLLBACK**

## Logs y Evidencia
- [Adjuntar playwright-report/index.html]
- [Adjuntar screenshots si hay fallos]
- [Adjuntar test-results.json]
```

---

## 9. RESPUESTA A INCIDENCIAS

### Si una prueba falla:

#### 1️⃣ **Paso Inmediato (< 2 min)**
```
□ Detener incremento de tráfico
□ Anotar hora y test que falló
□ Tomar screenshot
□ Ejecutar test nuevamente (puede ser flaky)
```

#### 2️⃣ **Investigación (< 10 min)**
```
□ Revisar logs del servidor
□ Revisar estado de API (/health)
□ Revisar BD (conexiones, bloqueos)
□ Revisar red/firewall
```

#### 3️⃣ **Decisión**
```
Si es flaky (pasa en reintento):
  → Continuar monitoreo frecuente
  
Si es reproducible:
  → ROLLBACK si es crítico (SMOKE-1,2,7)
  → Investigar en paralelo si es importante (SMOKE-3-6)
  
Si es data-related (ej: no hay expedientes):
  → Crear datos de prueba
  → Reintentar smoke tests
```

---

## 10. MONITOREO POST-SMOKE

Después de completar smoke tests exitosamente:

### Métricas a Monitorear (Primeros 60 minutos)

```
API Latency:
  ✅ P95 < 3 segundos
  ✅ P99 < 5 segundos
  ✅ Error rate < 2%

Database:
  ✅ Conexiones activas < 50
  ✅ Query time < 500ms
  ✅ No hay deadlocks

Application:
  ✅ Memory usage < 80%
  ✅ No hay exceptions críticas
  ✅ Auditoría registrando acciones
```

### Comandos para Validar (SSH a servidor PROD)

```bash
# Verificar API health
curl https://sged.produccion.mx/api/v1/health

# Ver logs de errores
tail -f /var/log/sged/application.log | grep ERROR

# Monitor de sistema
top
df -h
```

---

## 11. CHECKLIST PRE-EJECUCIÓN

Antes de ejecutar smoke tests:

- [ ] DevOps confirma despliegue completado
- [ ] URL de Producción es accesible (curl -I)
- [ ] Usuarios de prueba existen en BD PROD
- [ ] Datos de prueba mínimos cargados (ej: expedientes 2026-*)
- [ ] Playwright instalado localmente (`npm install`)
- [ ] Navegadores descargados (`npx playwright install`)
- [ ] Variable BASE_URL configurada correctamente
- [ ] Red permite acceso a PROD (sin firewall bloqueando)

---

## 12. SALIDA ESPERADA

### ✅ Smoke Tests EXITOSOS

```
========== QUICK SMOKE RESULTS ==========
✅ SMOKE-1.1: Login como ADMIN - PASSED
✅ SMOKE-1.2: Login como SECRETARIO - PASSED
✅ SMOKE-1.3: Login como JUEZ - PASSED
✅ SMOKE-1.4: Login como CONSULTA - PASSED
✅ SMOKE-2.1: ADMIN /admin/usuarios - PASSED
✅ SMOKE-2.2: ADMIN /admin/auditoria - PASSED
✅ SMOKE-2.3: SECRETARIO blocked - PASSED
✅ SMOKE-7.1: API /health - PASSED
✅ SMOKE-7.2: API /auth/login - PASSED

========== DECISION ==========
🟢 ALL CRITICAL TESTS PASSED
→ PROCEED TO NEXT TRAFFIC INCREMENT
→ Time: 2 minutes
```

### 🔴 Smoke Tests CON FALLOS

```
========== FULL SMOKE RESULTS ==========
✅ SMOKE-1.1-1.4: Authentication - PASSED
✅ SMOKE-2.1-2.3: RBAC - PASSED
✅ SMOKE-7.1-7.2: API Health - PASSED
✅ SMOKE-3.1-3.2: Search - PASSED
❌ SMOKE-4.1: View Document - FAILED (timeout)
❌ SMOKE-4.2: Download Document - FAILED (404)
⚠️ SMOKE-5.1: Audit - PASSED with warnings
✅ SMOKE-6.1-6.2: Performance - PASSED
✅ SMOKE-5.2: Audit Filters - PASSED

========== DECISION ==========
⚠️ NON-CRITICAL TESTS FAILED
→ CONTINUE WITH CURRENT TRAFFIC (don't increase)
→ Investigate document viewer in parallel
→ Rerun tests in 10 minutes
```

---

## 🎯 Smoke-2: Expedientes (Búsqueda y Detalle)

**Severidad si falla**: 🔴 **BLOQUEANTE** (NO-GO)

**Descripción**: Validar búsqueda de expediente conocido y carga de detalle  
**Duración estimada**: 3-4 minutos  
**Usuario**: SECRETARIO_SMOKE_USER (rol principal para gestión de expedientes)

#### Pasos

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 2.1 | Login como SECRETARIO_SMOKE_USER | Autenticación exitosa | (Ver Smoke-1) |
| 2.2 | Navegar a `/expedientes` o `/app/expedientes` | Página de búsqueda carga (HTTP 200) | Sin errores 500 |
| 2.3 | Buscar por número: `EXPEDIENTE_SMOKE_NUMERO` | Resultado aparece en tabla/lista | < 3 segundos |
| 2.4 | Click en expediente encontrado | Detalle de expediente carga (`/expedientes/{id}`) | Estado, demandante, demandado visibles |
| 2.5 | Verificar secciones principales | Datos, historial, documentos, auditoría | Sin errores |
| 2.6 | Logout | Session limpiada | |

#### Criterios de Aceptación

- ✅ Búsqueda retorna resultados en < 3s
- ✅ Detalle carga sin errores
- ✅ Todas las secciones renderean correctamente
- ✅ No hay errores 500 ni JS

---

## 🎯 Smoke-3: Documentos (Listar, Ver, Descargar)

**Severidad si falla**: 🟡 **IMPORTANTE** (pausa, pero no rollback automático)

**Descripción**: Validar funcionalidad de documentos dentro de un expediente  
**Duración estimada**: 3-4 minutos  
**Usuario**: SECRETARIO_SMOKE_USER

#### Pasos

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 3.1 | Login y navegar a expediente (Smoke-2) | Expediente abierto | Sección de documentos visible |
| 3.2 | Verificar lista de documentos | Documento `DOCUMENTO_SMOKE_ID` visible en tabla | Nombre, tipo, fecha |
| 3.3 | Click "Ver" en documento (visor inline) | PDF/documento se abre en modal o iframe | Render correcto |
| 3.4 | Interactuar con visor: zoom, scroll, etc. | Controles funcionan | Sin errores JS |
| 3.5 | Click "Descargar" documento | Descarga se inicia | Archivo descargado (validar nombre/tamaño) |
| 3.6 | Verificar que descarga es el archivo correcto | Archivo local matches expediente | Integridad OK |
| 3.7 | Logout | | |

#### Criterios de Aceptación

- ✅ Documentos listan correctamente
- ✅ Visor abre sin error 500
- ✅ Descarga funciona
- ✅ Archivo descargado es íntegro

---

## 🎯 Smoke-4: Administración (Usuarios)

**Severidad si falla**: 🔴 **BLOQUEANTE** (acceso admin es crítico)

**Descripción**: Validar acceso a panel de administración y gestión de usuarios  
**Duración estimada**: 2-3 minutos  
**Usuario**: ADMIN_SMOKE_USER

#### Pasos

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 4.1 | Login como ADMIN_SMOKE_USER | Autenticación exitosa | (Ver Smoke-1) |
| 4.2 | Navegar a `/admin` o `/admin/dashboard` | Panel admin carga (HTTP 200) | Sin error 500 |
| 4.3 | Click en "Usuarios" | Vista lista de usuarios carga | < 3s, paginación funcional |
| 4.4 | Buscar usuario de prueba | Usuario aparece en resultados | Nombre, email, rol visible |
| 4.5 | Click en usuario para ver detalle | Detalle de usuario abre | Rol, estado, permisos mostrados |
| 4.6 | Verificar que no se modifiquen datos | Detalle es read-only o cambios se revierten | No alterar datos de producción |
| 4.7 | Logout | | |

#### Criterios de Aceptación

- ✅ Panel admin accesible solo con rol ADMIN
- ✅ Lista de usuarios carga sin errores
- ✅ Detalle de usuario visible
- ✅ No hay error 500

---

## 🎯 Smoke-5: Auditoría

**Severidad si falla**: 🟡 **IMPORTANTE** (compliance, pero no bloquea business)

**Descripción**: Validar que logs de auditoría se registran y consultan correctamente  
**Duración estimada**: 2-3 minutos  
**Usuario**: ADMIN_SMOKE_USER

#### Pasos

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 5.1 | Login como ADMIN_SMOKE_USER | Autenticación exitosa | |
| 5.2 | Navegar a `/admin/auditoria` | Página de auditoría carga | HTTP 200 |
| 5.3 | Buscar logs recientes (últimos 24h) | Lista de eventos | > 0 registros esperados |
| 5.4 | Filtrar por usuario | Logs filtrados aparecen | Fecha/hora/acción correctas |
| 5.5 | Verificar coherencia de eventos | Logins y accesos registrados | Timestamp coherente |
| 5.6 | Logout | | |

#### Criterios de Aceptación

- ✅ Página de auditoría carga sin errores
- ✅ Logs recientes se listan
- ✅ Filtros funcionan
- ✅ Datos de audit son coherentes
- ✅ No hay error 500

---

## 🎯 Smoke-6: RBAC (Control de Acceso Basado en Roles)

**Severidad si falla**: 🔴 **BLOQUEANTE** (seguridad crítica)

**Descripción**: Validar que los controles de acceso por rol funcionan correctamente  
**Duración estimada**: 3-4 minutos  
**Usuario principal**: CONSULTA_SMOKE_USER (rol restrictivo)

#### Pasos

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 6.1 | Login como CONSULTA_SMOKE_USER | Autenticación exitosa | |
| 6.2 | Intentar acceder a `/admin` | Redirige a `/dashboard` o muestra 403 | No expone contenido admin |
| 6.3 | Intentar acceder a `/admin/usuarios` | Redirige a `/dashboard` o muestra 403 | Sin error 500 |
| 6.4 | Intentar acceder a `/admin/auditoria` | Redirige a `/dashboard` o muestra 403 | Sin error 500 |
| 6.5 | Navegar a `/expedientes` (búsqueda) | Expedientes cargados (lectura OK) | CONSULTA puede buscar |
| 6.6 | En detalle de expediente, verificar botones | "Editar", "Cambiar estado" NO aparecen | Acciones de escritura deshabilitadas |
| 6.7 | Intentar llamada API POST /api/v1/expedientes | Respuesta 403 Forbidden | No 500, acceso denegado gracefully |
| 6.8 | Intentar llamada API PATCH expediente | Respuesta 403 Forbidden | Sin cambio de datos |
| 6.9 | Logout | | |

**Repetir 6.2-6.8 con AUXILIAR_SMOKE_USER:**

| # | Paso | Resultado Esperado | Nota |
|---|------|-------------------|------|
| 6.10 | Login como AUXILIAR_SMOKE_USER | Autenticación exitosa | |
| 6.11 | Intentar acceder a `/admin` | Redirige o 403 | AUXILIAR no es ADMIN |
| 6.12 | Navegar a `/expedientes` | OK | Búsqueda y detalle |
| 6.13 | Botones de edición en expediente | DISPONIBLES | Según rol |
| 6.14 | Logout | | |

#### Criterios de Aceptación

- ✅ CONSULTA no accede a `/admin/**`
- ✅ CONSULTA no puede crear/editar expedientes (403 en API)
- ✅ AUXILIAR sí puede ver/editar expedientes
- ✅ Todos los bloqueos responden 403 (no 500)
- ✅ No hay exposición de datos sensibles

---

## 📅 TIMELINE POST-DESPLIEGUE

### T+0 (Momento de Despliegue)

**Actividad**: DevOps confirma que despliegue a producción completó

```
[DevOps → Slack #sged-incidents]
✅ Despliegue v1.2.4 completado
   - Tag: v1.2.4-prod
   - Containers: running
   - Health check: UP
   - Timestamp: 2026-01-28T09:00:00Z
```

---

### T+2 a T+5 minutos: **Quick Smoke** (Validación Rápida)

**Objetivo**: Decidir rápidamente si hay un problema bloqueante evidente

**Tests a ejecutar**:
- ✅ Smoke-1 (Auth): Login de ADMIN
- ✅ Smoke-2 (Expedientes): Búsqueda rápida
- ✅ Smoke-4 (Admin): Acceso a panel

**Tiempo**: ~4-5 minutos

**Resultado esperado**: PASS

---

### T+10 a T+15 minutos: **Full Smoke** (Validación Completa)

**Objetivo**: Ejecutar todos los smoke tests (Smoke-1 a Smoke-6)

**Tiempo**: ~12-15 minutos

---

## 🚦 MATRIZ DE DECISIÓN GO/NO-GO

| Smoke | Criticidad | FAIL → Acción |
|-------|-----------|-------------|
| **Smoke-1 (Auth)** | 🔴 Bloqueante | NO-GO → Rollback |
| **Smoke-2 (Expedientes)** | 🔴 Bloqueante | NO-GO → Rollback |
| **Smoke-3 (Documentos)** | 🟡 Importante | GO + Monitoreo |
| **Smoke-4 (Admin)** | 🔴 Bloqueante | NO-GO → Rollback |
| **Smoke-5 (Auditoría)** | 🟡 Importante | GO + Investigación |
| **Smoke-6 (RBAC)** | 🔴 Bloqueante | NO-GO → Rollback |

---

## 📋 CONFIGURACIÓN DE ENTORNO

**Variables a inyectar (Pre-Smoke):**

```bash
# .env.smoke-prod (NO versionado, solo en CI/CD)
BASE_URL_PROD=https://sged.oj.gob/
API_URL_PROD=https://api.sged.oj.gob/api/v1
ADMIN_SMOKE_USER=admin_smoke_prod
ADMIN_SMOKE_PASS=<from-vault>
SECRETARIO_SMOKE_USER=sec_smoke_prod
SECRETARIO_SMOKE_PASS=<from-vault>
AUXILIAR_SMOKE_USER=aux_smoke_prod
AUXILIAR_SMOKE_PASS=<from-vault>
CONSULTA_SMOKE_USER=cons_smoke_prod
CONSULTA_SMOKE_PASS=<from-vault>
EXPEDIENTE_SMOKE_NUMERO=EXP-2026-0001
DOCUMENTO_SMOKE_ID=DOC-12345
```

---

## ✅ CHECKLIST PRE-SMOKE

- [ ] DevOps confirma despliegue completado
- [ ] URL_PROD es accesible (curl health)
- [ ] Usuarios de smoke existen en BD
- [ ] Expediente de prueba existe
- [ ] Documento de prueba existe
- [ ] Variables de entorno inyectadas
- [ ] Scripts de smoke listos
- [ ] Reporte template preparado

---

## 🔗 REFERENCIAS

- [ROLLBACK_PLAN_PRODUCCION.md](ROLLBACK_PLAN_PRODUCCION.md) - Plan de rollback
- [MONITOREO_OPERACIONES_PRODUCCION.md](MONITOREO_OPERACIONES_PRODUCCION.md) - Monitoreo 72h
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía de despliegue

---

```
╔═══════════════════════════════════════════════╗
║  SMOKE TESTS v1.2.4 - PLAN ACTUALIZADO       ║
║  ✅ Flujos definidos (Smoke-1 a Smoke-6)     ║
║  ✅ Timeline establecido                      ║
║  ✅ GO/NO-GO definido                         ║
║  ✅ Listo para implementar                    ║
╚═══════════════════════════════════════════════╝
```

**Estado**: ✅ APROBADO  
**Última actualización**: Enero 28, 2026
→ INVESTIGATE document module in parallel
→ RETRY FULL SMOKE in 10 minutes
→ Time: 8 minutes
```

---

## 13. ENTREGABLES

Este documento proporciona:

✅ **Smoke tests definidos** (15+ tests en 5-8 min)  
✅ **Timing de ejecución** (con decision matrix)  
✅ **Comandos ejecutables** (copiar y pegar)  
✅ **Matriz de decisión** (qué hacer si falla algo)  
✅ **Template de reporte** (para documentación)  
✅ **Guía de respuesta** (ante incidencias)  
✅ **Checklist pre-ejecución** (antes de comenzar)  

---

## 14. PRÓXIMAS ACCIONES

### Cuando DevOps avise "Despliegue completado":

1. ✅ Leer este documento (5 min)
2. ✅ Validar checklist pre-ejecución (5 min)
3. ✅ Ejecutar QUICK SMOKE (2 min)
4. ✅ Tomar decisión (PROCEED / INVESTIGATE / ROLLBACK)
5. ✅ Documentar en PROD_SMOKE_REPORT_v1.2.4.md
6. ✅ Compartir reporte con Equipo DevOps

**Tiempo Total Desde Despliegue hasta Go-Live: ~30 minutos**

---

**Documento Preparado por:** Agente de Testing  
**Versión:** 1.0  
**Status:** 🟢 Listo para ejecución  
**Validado para:** SGED v1.2.4 - Producción

