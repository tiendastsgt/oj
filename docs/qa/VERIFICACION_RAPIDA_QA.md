---
Documento: VERIFICACION_RAPIDA_QA
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# ✅ VERIFICACIÓN RÁPIDA - QA SGED
## Validación Post-Despliegue

**Uso**: Ejecuta este checklist inmediatamente después de desplegar.
**Tiempo**: ~5 minutos
**Prerequisito**: `bash deploy-qa.sh` ya ejecutado exitosamente

---

## 🟢 STEP 1: Verificar que servicios estén corriendo

```bash
docker-compose -f docker-compose-qa.yml ps
```

**✅ Esperado:**
```
CONTAINER ID    IMAGE                        STATUS
abc123...       nginx:latest-alpine          Up (healthy)
def456...       sged-backend:latest          Up (healthy)
ghi789...       angular-sged:latest          Up (healthy)
jkl012...       oracle-xe:21 / h2:latest     Up (healthy)
```

**❌ Si alguno dice "Down" o "Exited":**
```bash
docker-compose -f docker-compose-qa.yml restart <servicio>
sleep 30
docker-compose -f docker-compose-qa.yml ps  # Verify again
```

---

## 🟢 STEP 2: Verificar HTTPS redirige correctamente

```bash
curl -I -L http://localhost/ 2>&1 | head -10
```

**✅ Esperado:**
```
HTTP/1.1 301 Moved Permanently    ← Redirección HTTP → HTTPS
Location: https://localhost/
...

HTTP/2 200                         ← Respuesta HTTPS
Content-Type: text/html
Strict-Transport-Security: max-age=31536000
...
```

**❌ Si ves "Connection refused":**
- NGINX no está respondiendo
- Reiniciar: `docker-compose -f docker-compose-qa.yml restart nginx`

---

## 🟢 STEP 3: Verificar Frontend carga

```bash
curl -k https://localhost/app/ 2>/dev/null | grep -c "<!DOCTYPE"
```

**✅ Esperado:** Retorna `1` (archivo HTML encontrado)

**O en navegador:**
```
https://localhost/app/
```

**✅ Debería ver:**
- Login SGED
- Logo de la institución
- Campos de usuario/contraseña
- Botón Ingresar

**❌ Si ves error 404 o página en blanco:**
```bash
docker logs sged-nginx-qa | grep -i error | tail -10
```

---

## 🟢 STEP 4: Verificar API Health Check

```bash
curl -k https://localhost/api/v1/health 2>/dev/null | jq .
```

**✅ Esperado:**
```json
{
  "status": "UP",
  "database": "UP",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**❌ Si dice "database: DOWN":**
```bash
docker-compose -f docker-compose-qa.yml restart sged-db-qa
sleep 30
curl -k https://localhost/api/v1/health
```

---

## 🟢 STEP 5: Verificar Headers de Seguridad

```bash
curl -k -I https://localhost/ 2>/dev/null | grep -i "Strict-Transport\|X-Frame\|X-Content-Type"
```

**✅ Debería ver estos 3 headers:**
```
Strict-Transport-Security: max-age=31536000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

**❌ Si faltan headers:**
- Verificar nginx/nginx.conf tiene las directivas add_header
- Reiniciar NGINX: `docker-compose restart nginx`

---

## 🟢 STEP 6: Verificar Login funciona

```bash
curl -k -X POST https://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' 2>/dev/null | jq .
```

**✅ Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "roles": ["ADMINISTRADOR"]
  }
}
```

**❌ Si dice error de credenciales o 401:**
- Credenciales en .env.qa no coinciden con BD
- Verificar: `docker logs sged-backend-qa | grep -i "authentication"`
- Verificar BD tiene usuarios: `docker exec sged-db-qa ...` (depende del motor)

---

## 🟢 STEP 7: Verificar Rate Limiting

```bash
# Enviar 50 requests rápidos a health endpoint
for i in {1..50}; do 
  RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost/api/v1/health)
  echo "$RESPONSE"
done | sort | uniq -c
```

**✅ Esperado:**
```
     10 200    ← Primeros 10 requests exitosos (dentro del límite 10/s)
     40 429    ← Siguientes 40 requests bloqueados por rate limit
```

**❌ Si todos retornan 200:**
- Rate limiting no está activo
- Verificar nginx.conf tiene directivas limit_req
- Reiniciar NGINX

---

## 🟢 STEP 8: Verificar Base de Datos conectada

```bash
# Hacer query a BD desde backend
curl -k -X POST https://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' 2>/dev/null | jq .user.id
```

**✅ Esperado:** Retorna un número (usuario encontrado en BD)

**❌ Si retorna null o error:**
```bash
docker logs sged-backend-qa | grep -i "database\|connection" | tail -20
docker logs sged-db-qa | tail -20
```

---

## 🟢 STEP 9: Verificar Logs no tienen errores críticos

```bash
# Buscar errores en últimos logs
docker logs sged-backend-qa 2>&1 | grep "ERROR\|Exception" | head -10
```

**✅ Esperado:** Poco o ningún ERROR

**❌ Si hay muchos errores:**
```bash
# Ver contexto completo
docker logs sged-backend-qa | tail -100
```

---

## 🟢 STEP 10: Verificar Latencia es aceptable

```bash
# Hacer 10 health checks y medir tiempo
for i in {1..10}; do
  curl -k -s -w "Tiempo: %{time_total}s\n" -o /dev/null https://localhost/api/v1/health
done
```

**✅ Esperado:** Cada uno < 0.5 segundos (idealmente < 0.2s)

**❌ Si > 1 segundo:**
- Backend está lento o sobrecargado
- Check: `docker stats` para ver CPU/memoria
- Posible necesidad de escalamiento

---

## 📊 RESUMEN VISUAL

```
┌─────────────────────────────────────────────┐
│  QA SGED - POST-DEPLOYMENT VALIDATION      │
├─────────────────────────────────────────────┤
│                                             │
│  Step 1: Servicios running      [ ✅ ]     │
│  Step 2: HTTP→HTTPS redirect    [ ✅ ]     │
│  Step 3: Frontend carga         [ ✅ ]     │
│  Step 4: Health check           [ ✅ ]     │
│  Step 5: Security headers       [ ✅ ]     │
│  Step 6: Login funciona         [ ✅ ]     │
│  Step 7: Rate limiting bloquea  [ ✅ ]     │
│  Step 8: BD conectada           [ ✅ ]     │
│  Step 9: Sin errores críticos   [ ✅ ]     │
│  Step 10: Latencia < 500ms      [ ✅ ]     │
│                                             │
│  STATUS: ✅ LISTO PARA TESTING              │
└─────────────────────────────────────────────┘
```

---

## 🚀 SI TODO PASO (10/10 ✅)

**¡Excelente! QA está listo. Próximos pasos:**

1. **Informar al Agente de Testing:**
   - URL: https://localhost/app/
   - Credenciales: admin / admin123!
   - Status: ✅ GREEN

2. **Testing puede empezar:**
   - E2E tests
   - Load testing
   - Security testing

3. **Documentos de referencia:**
   - Leer: QA_LISTO_PARA_TESTING.md
   - Leer: HANDOFF_PARA_AGENTE_TESTING.md

---

## ❌ SI ALGUNO FALLO (< 10/10)

**Diagnosticar:**

```bash
# Ver estado detallado de todos servicios
docker-compose -f docker-compose-qa.yml logs | tail -200

# Ver recursos consumidos
docker stats

# Ver network
docker network inspect sged-qa-network

# Reintentar todo
docker-compose -f docker-compose-qa.yml down
docker-compose -f docker-compose-qa.yml up -d
sleep 60
# Ejecutar checklist de nuevo
```

**Contactar DevOps si persiste error.**

---

## 📋 TEMPLATE PARA REPORTAR

Si algo falla, reportar:

```
FECHA: 2026-01-15
HORA: 10:30

PASO QUE FALLÓ: [Step X]
ERROR: [Error message]
TIMESTAMP: [cuando occurió]

LOGS RELEVANTES:
[Pegar salida de: docker logs sged-backend-qa]
[Pegar salida de: docker logs sged-nginx-qa]

AMBIENTE:
- QA Host: localhost
- Docker version: [docker --version]
- Tiempo desde deploy: [X minutos]

ACCIONES INTENTADAS:
- docker restart [servicio]
- docker logs ...

CONTACTAR: devops@example.com
```

---

**Uso**: Guardar este documento y correr después de cada deploy  
**Duración**: 5 minutos max  
**Operador**: Devops / SRE  
**Fecha**: Mayo 2026  
**Fase**: 7 - Despliegue QA
