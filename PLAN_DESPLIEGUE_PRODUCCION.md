# 📋 PLAN DE DESPLIEGUE CONTROLADO A PRODUCCIÓN
## SGED - Fase 8: Go-Live Production

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Responsable**: DevOps/Infraestructura  
**Status**: 📋 DOCUMENTO FORMAL DE DESPLIEGUE  

---

## 🎯 OBJETIVO

Desplegar el stack SGED a Producción de forma **controlada y segura**, con capacidad de rollback inmediato en caso de incidentes.

**Enfoque**: **Blue/Green Deployment** con **Canary gradual** (10% → 50% → 100%)

---

## 📊 RESUMEN EJECUTIVO

- **Duración total**: 72 horas (3 fases de 24h)
- **Riesgo**: BAJO (con rollback ready)
- **Downtime**: 0 minutos (blue/green)
- **Comunicación**: Cada 4 horas durante despliegue
- **Equipo necesario**: DevOps (2), Backend (1), Security (1), Operaciones (2)

---

## 🏗️ ARQUITECTURA DE DESPLIEGUE

```
PRODUCCIÓN (Blue/Green Setup)
═════════════════════════════════════════════════════════════

                    Clientes
                       │
                       ▼
            ┌─────────────────────┐
            │  DNS/Load Balancer  │ (AWS Route53, nginx)
            └──────────┬──────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
    ┌────────────────┐    ┌────────────────┐
    │ BLUE (Actual)  │    │GREEN (Nuevo)   │
    ├────────────────┤    ├────────────────┤
    │ NGINX v1       │    │ NGINX v2       │
    │ Backend v1.0   │    │ Backend v1.1   │
    │ Frontend v1.0  │    │ Frontend v1.1  │
    │ DB (shared)    │    │ (Lee de DB)    │
    └────────────────┘    └────────────────┘

Fase 1: 10% tráfico → GREEN
Fase 2: 50% tráfico → GREEN
Fase 3: 100% tráfico → GREEN
Rollback: 100% tráfico → BLUE (1 minuto)
```

---

## 📋 PRE-DESPLIEGUE (Checklist)

Ejecutar **72 horas antes** del despliegue:

### 1. Validación de Código ✅
```bash
# Backend
cd sGED-backend
./mvnw clean verify -Ptest-coverage
# Debe pasar 100% tests

# Frontend
cd sGED-frontend
npm run build
npm run test:coverage
# Debe pasar tests y coverage > 80%
```

**Criterio de paso**: Zero failing tests, coverage ≥ 80%

### 2. Validación de Imágenes Docker ✅
```bash
# Build producciones
docker build -t sged-backend:v1.1-prod ./sGED-backend
docker build -t sged-frontend:v1.1-prod ./sGED-frontend

# Escanear por vulnerabilidades
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image sged-backend:v1.1-prod
# Debe haber CRÍTICAS = 0 (MUY ALTAS MÁXIMO 1)

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image sged-frontend:v1.1-prod
```

**Criterio de paso**: 0 vulnerabilidades críticas

### 3. Backup Base de Datos ✅
```bash
# Backup completo (Oracle)
expdp sged_admin/PASSWORD@SGED \
  dumpfile=sged_prod_YYYY-MM-DD.dmp \
  logfile=sged_prod_YYYY-MM-DD.log \
  full=Y

# Guardar en S3
aws s3 cp sged_prod_YYYY-MM-DD.dmp s3://sged-backups/prod/

# Verificar integridad
impdp sged_admin/PASSWORD@SGED_DEV \
  dumpfile=sged_prod_YYYY-MM-DD.dmp \
  directory=DP_DIR
```

**Criterio de paso**: Backup verificado en BD de test

### 4. Backup Configuración ✅
```bash
# Respaldar configs prod actuales
mkdir -p /backup/sged-prod-YYYY-MM-DD
cp docker-compose-prod.yml /backup/sged-prod-YYYY-MM-DD/
cp -r nginx /backup/sged-prod-YYYY-MM-DD/
cp .env.prod /backup/sged-prod-YYYY-MM-DD/
tar -czf /backup/sged-prod-YYYY-MM-DD.tar.gz /backup/sged-prod-YYYY-MM-DD/

# Respaldar secrets actuales
# (NO guardar en texto; usar Vault snapshot)
vault write raft/snapshot \
  file=/backup/vault-snapshot-YYYY-MM-DD.snap
```

**Criterio de paso**: Backups en múltiples ubicaciones

### 5. Validación de Secretos ✅
```bash
# Verificar que todos los secretos existen en Vault
vault list secret/sged/prod/

# Verificar rotación reciente
# JWT_SECRET < 90 días
# DB_PASSWORD < 60 días
# Otros < 180 días
```

**Criterio de paso**: Todos los secretos presentes y rotados

### 6. Validación de Certificados ✅
```bash
# Verificar Let's Encrypt válido
openssl x509 -in /etc/letsencrypt/live/sged.example.com/cert.pem \
  -noout -dates

# Renovación automática funcionando
# certbot renew (con systemd timer o similar)
```

**Criterio de paso**: Certificado válido por > 30 días

### 7. Test de Comunicaciones ✅
```bash
# Database connectivity (desde backend container)
docker run --rm --network sged-prod-net \
  sged-backend:v1.1-prod \
  curl -f http://sged-db:1521
```

**Criterio de paso**: Conexiones OK

### 8. Equipo Listo ✅
- [ ] DevOps: 2 personas (una es lead)
- [ ] Backend: 1 persona disponible
- [ ] Security: 1 persona en Slack
- [ ] Operaciones: 2 personas disponibles
- [ ] PM: Comunicar a stakeholders

---

## 🚀 FASE 1: DESPLIEGUE GREEN (10% Tráfico)

**Duración**: 24 horas  
**Ventana**: Horario laboral (9 AM - 5 PM)  
**Objetivo**: Verificar que el nuevo código funciona bajo carga

### Paso 1.1: Preparar GREEN Environment
```bash
# En servidor de Producción
cd /opt/sged-prod

# Crear directorio GREEN paralelo
mkdir -p /opt/sged-prod-green
cp -r /opt/sged-prod/* /opt/sged-prod-green/

# Versionar docker-compose
cp docker-compose-prod.yml docker-compose-prod-blue.yml
cp docker-compose-prod.yml docker-compose-prod-green.yml

# Cambiar puertos internos en GREEN (para no conflictuar)
sed -i 's/sged-backend:8080/sged-backend-green:8081/g' \
  docker-compose-prod-green.yml
sed -i 's/sged-nginx-prod/sged-nginx-prod-green/g' \
  docker-compose-prod-green.yml
```

### Paso 1.2: Levantare GREEN Stack
```bash
# Cambiar a versión nueva
cd /opt/sged-prod-green

# Actualizar imágenes
docker-compose -f docker-compose-prod-green.yml pull

# Levantar (sin tocar BLUE)
docker-compose -f docker-compose-prod-green.yml up -d

# Esperar health checks
sleep 60
docker-compose -f docker-compose-prod-green.yml ps
# Debe mostrar todos "Up (healthy)"
```

### Paso 1.3: Validar GREEN
```bash
# Health check
curl -f https://sged-green.internal/api/v1/health

# Smoke tests
curl -X POST https://sged-green.internal/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' | jq .

# Database connectivity
curl -f https://sged-green.internal/api/v1/expedientes | jq '.total'

# NGINX check
curl -I https://sged-green.internal/app/
# Debe retornar 200 OK
```

**Criterio de paso**: Todos los checks retornan 200 OK

### Paso 1.4: Routing 10% Tráfico → GREEN
```bash
# OPCIÓN A: NGINX upstream weight
# Editar nginx-prod.conf
upstream backend {
    server sged-backend:8080 weight=90;        # BLUE
    server sged-backend-green:8081 weight=10;  # GREEN
    keepalive 32;
}

# Reload NGINX (sin downtime)
docker exec sged-nginx-prod nginx -s reload

# OPCIÓN B: AWS Route53 (si usa AWS)
# Crear weighted routing policy:
# - sged-blue.example.com:  90% de tráfico
# - sged-green.example.com: 10% de tráfico
```

### Paso 1.5: Monitorear Fase 1 (24 horas)

**Cada 1 hora**, revisar:

```bash
# Logs de backend
docker logs sged-backend-green | grep "ERROR" | wc -l
# Debe ser < 5 errores/hora

# Latencia
docker stats sged-backend-green
# Memoria: < 2GB, CPU: < 50%

# Rate de errores 5xx
tail -100 /var/log/nginx/sged-access.log | grep " 5[0-9][0-9] " | wc -l
# Debe ser = 0

# Health check endpoint
curl -s https://sged-green.internal/api/v1/health | jq .status
# Debe ser "UP"
```

**Cada 4 horas**, enviar reporte a #sged-deployment Slack:

```
🟢 FASE 1 - 10% TRÁFICO (Hora X)
═════════════════════════════════
✅ Errors: 0 en última 1h
✅ Latencia p95: 250ms
✅ Health: UP
✅ Database: Connected
✅ Logins: Working

Siguiente checkin: Hora X+4
```

**Criterio de paso Fase 1**: 
- ✅ 0 errores críticos en 24h
- ✅ Latencia p95 < 500ms
- ✅ Tasa error 5xx = 0
- ✅ Health check = UP

**Si falla Fase 1**:
→ Ejecutar ROLLBACK INMEDIATO (ver sección "Plan de Rollback")

---

## 🚀 FASE 2: ESCALAR A 50% Tráfico

**Duración**: 24 horas (después de Fase 1 exitosa)  
**Objetivo**: Validar que el código soporta tráfico moderado

### Paso 2.1: Cambiar Peso del Balanceador
```bash
# OPCIÓN A: NGINX upstream weight
upstream backend {
    server sged-backend:8080 weight=50;        # BLUE
    server sged-backend-green:8081 weight=50;  # GREEN
}

# Reload NGINX
docker exec sged-nginx-prod nginx -s reload

# OPCIÓN B: AWS Route53
# Actualizar weighted routing: 50% azul, 50% verde
```

### Paso 2.2: Monitorear (cada 30 minutos)
```bash
# Logs
docker logs sged-backend-green | tail -50 | grep -c ERROR
# Debe ser ≤ 2

# Performance
docker stats sged-backend-green --no-stream
# Memoria: < 3GB, CPU: < 70%

# Health
curl -s https://sged-green.internal/api/v1/health | jq .
```

**Reporte cada 2 horas**: #sged-deployment

**Criterio de paso Fase 2**:
- ✅ 0 errores críticos en 24h
- ✅ Latencia p95 < 600ms
- ✅ Tasa error 5xx < 0.5%
- ✅ Memoria < 3.5GB

---

## 🚀 FASE 3: FULL CUTOVER (100% Tráfico)

**Duración**: 24 horas  
**Objetivo**: Validar que nuevo código soporta tráfico full

### Paso 3.1: Cambiar 100% Tráfico a GREEN
```bash
# OPCIÓN A: NGINX
upstream backend {
    server sged-backend-green:8081 weight=100;  # GREEN
    server sged-backend:8080 weight=0;          # BLUE (standby)
}
docker exec sged-nginx-prod nginx -s reload

# OPCIÓN B: AWS Route53
# Cambiar: 100% a sged-green.example.com
```

### Paso 3.2: Monitorear Intensamente (cada 10 minutos)

```bash
# Script de monitoreo
#!/bin/bash
while true; do
  echo "=== $(date) ==="
  
  # Health
  curl -s https://sged.example.com/api/v1/health | jq .status
  
  # Latency
  time curl -s https://sged.example.com/app/ > /dev/null
  
  # Errors in last 5 min
  tail -50 /var/log/nginx/sged-access.log | grep -c " [45][0-9][0-9] "
  
  # Backend status
  docker stats sged-backend-green --no-stream
  
  sleep 10
done
```

### Paso 3.3: Publicar "Go-Live Completado"

**Después de 24 horas sin incidentes**:
- [ ] Notificar a PM/Stakeholders
- [ ] Enviar comunicado a usuarios (si aplica)
- [ ] Documentar deployment en changelog

```markdown
## v1.1.0 - Production Release

**Deployment Date**: 2026-01-28
**Deployment Type**: Blue/Green (72h rollout)
**Issues Found & Fixed**: [list]
**Performance**: Baseline established

### Changes
- Feature X
- Fix Y
- Security patch Z

### Rollback Status
✅ Ready (can rollback in < 1 min if needed)
```

---

## 🔄 PLAN DE ROLLBACK

**Objetivo**: Revertir a BLUE en < 1 minuto si hay issues críticos

### Criterios para Activar Rollback

Activar rollback INMEDIATAMENTE si:

❌ **Error Rate 5xx > 5%** sostenido por 5 minutos  
❌ **Database Connection Loss** > 30 segundos  
❌ **Latencia p99 > 2 segundos** sostenido 10 minutos  
❌ **Memory Leak** (memoria creciendo > 1GB/min)  
❌ **Security Incident** detectado  
❌ **Flyway Migration Error** en BD  
❌ **JWT Token Validation Failure** masivo  

### Pasos de Rollback (1 minuto)

**Paso R1: Verificar BLUE sigue corriendo**
```bash
docker-compose -f docker-compose-prod-blue.yml ps
# Debe mostrar todos "Up"
```

**Paso R2: Cambiar tráfico a BLUE**
```bash
# OPCIÓN A: NGINX
upstream backend {
    server sged-backend:8080 weight=100;        # BLUE
    server sged-backend-green:8081 weight=0;    # GREEN (pause)
}
docker exec sged-nginx-prod nginx -s reload

# OPCIÓN B: AWS Route53
# Cambiar: 100% a sged-blue.example.com
```

**Paso R3: Validar tráfico en BLUE**
```bash
# Esperar 30 segundos
sleep 30

# Health check
curl -f https://sged.example.com/api/v1/health
# Debe retornar 200

# Verificar logs
tail -20 /var/log/nginx/sged-access.log
# No debe haber errores recientes
```

**Paso R4: Parar GREEN**
```bash
cd /opt/sged-prod-green
docker-compose -f docker-compose-prod-green.yml down
```

**Paso R5: Comunicar**
```bash
# Slack #incidents
🔴 ROLLBACK EJECUTADO
Hora: [timestamp]
Razón: [specific error]
Status: BLUE en 100%
Acción requerida: Investigar error en GREEN
```

### Post-Rollback (Inmediatamente)

1. **Investigar causa del error**
   - [ ] Revisar logs de GREEN
   - [ ] Revisar cambios de código
   - [ ] Revisar cambios de infraestructura

2. **Arreglar el problema**
   - [ ] Hacer fix en `develop` branch
   - [ ] Ejecutar tests
   - [ ] Re-build imagen

3. **Retry deployment** (cuando esté listo)
   - [ ] Esperar 24h antes de reintentar (si fue error crítico)
   - [ ] Seguir plan nuevamente desde Paso 1.2

---

## 📊 MONITOREO POST-DESPLIEGUE (Primeras 72 horas)

### Métricas a Monitorear

| Métrica | Umbral Normal | Alerta | Crítica |
|---------|---|---|---|
| **Latencia p95** | < 300ms | > 500ms | > 2000ms |
| **Latencia p99** | < 400ms | > 800ms | > 3000ms |
| **Error Rate 4xx** | 1-2% | > 5% | > 10% |
| **Error Rate 5xx** | < 0.1% | > 1% | > 5% |
| **Database latencia** | < 100ms | > 200ms | > 500ms |
| **CPU Backend** | 30-50% | > 70% | > 85% |
| **Memoria Backend** | 50-70% | > 80% | > 90% |
| **Conexiones BD** | 10-15 | > 18 | > 20 (pool max) |

### Comandos de Monitoreo en Tiempo Real

```bash
# Terminal 1: Logs backend (errors)
docker logs -f sged-backend-prod | grep -i "error\|warn\|exception"

# Terminal 2: Logs nginx (4xx/5xx)
tail -f /var/log/nginx/sged-access.log | grep " [45][0-9][0-9] "

# Terminal 3: Métricas de recursos
watch -n 2 'docker stats sged-backend-prod sged-nginx-prod --no-stream'

# Terminal 4: Health endpoint (cada 5s)
watch -n 5 'curl -s https://sged.example.com/api/v1/health | jq .'

# Terminal 5: Latencia (traceroute a endpoints)
while true; do \
  time curl -s https://sged.example.com/api/v1/expedientes > /dev/null; \
  sleep 5; \
done
```

### Dashboard Prometheus/Grafana (si disponible)

```yaml
# prometheus-sged.yml
scrape_configs:
  - job_name: 'sged-prod'
    static_configs:
      - targets: ['localhost:9090']
    
alerts:
  - alert: HighErrorRate5xx
    expr: rate(http_request_total{status=~"5.."}[5m]) > 0.01
    for: 5m
    annotations:
      summary: "High 5xx error rate detected"

  - alert: HighLatency
    expr: http_request_duration_seconds{quantile="0.99"} > 2
    for: 10m
    annotations:
      summary: "p99 latency > 2s"

  - alert: DatabaseConnectivity
    expr: mysql_up == 0
    for: 1m
    annotations:
      summary: "Database is down"
```

### Alertas por Email/Slack

```yaml
# alertmanager-config.yml
receivers:
  - name: 'sged-critical'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#sged-incidents'
        text: 'CRITICAL: {{ .GroupLabels.alertname }}'
```

---

## 📋 RUNBOOK DE OPERACIONES

### Comandos Frecuentes

```bash
# === Ver estado general ===
docker-compose -f docker-compose-prod.yml ps
docker-compose -f docker-compose-prod-green.yml ps

# === Reiniciar servicio ===
# Backend
docker-compose -f docker-compose-prod.yml restart sged-backend

# NGINX
docker exec sged-nginx-prod nginx -s reload  # graceful reload
# o completo:
docker-compose -f docker-compose-prod.yml restart nginx

# === Ver logs ===
# Últimas 100 líneas
docker logs -n 100 sged-backend-prod

# Últimas líneas con follow
docker logs -f --tail=50 sged-backend-prod

# Solo errors
docker logs sged-backend-prod | grep ERROR | head -20

# === Acceder a contenedor ===
docker exec -it sged-backend-prod bash
docker exec -it sged-db-prod sqlplus sged_admin/PASSWORD

# === Revisar recursos ===
docker stats sged-backend-prod --no-stream
docker inspect sged-backend-prod | jq .State

# === Escalar recursos ===
# Edit docker-compose-prod.yml:
# deploy.resources.limits.cpus: '4' → '8'
docker-compose -f docker-compose-prod.yml up -d --force-recreate
```

### Cadena de Escalación

| Problema | Primer Contacto | Si no responde | Si persiste |
|----------|---|---|---|
| Latencia alta | DevOps (lead) | Backend team | Manager |
| Error 5xx masivo | DevOps (lead) + Backend | CTO | Rollback inmediato |
| Database down | DevOps (lead) | DBA | CEO (critical) |
| Security incident | Security | DevOps | CEO + Legal |

### Contactos de Emergencia

```
📞 SGED Production Incident Contacts

DevOps Lead:        +1-XXX-XXX-0001 (24/7)
Backend Lead:       +1-XXX-XXX-0002 (9-18)
Security:           +1-XXX-XXX-0003 (emergencies)
Database Admin:     +1-XXX-XXX-0004 (9-18)
CTO On-Call:        +1-XXX-XXX-0005 (escalations)
Slack Channel:      #sged-incidents (always monitored)
```

---

## 📝 DOCUMENTACIÓN Y REGISTROS

### Qué Documentar Durante Despliegue

```markdown
## Deployment Record - v1.1.0

**Start Time**: 2026-01-28 09:00 UTC
**End Time**: [to be filled]

### Fase 1 (10% tráfico)
- [X] GREEN levantado exitosamente
- [X] Health checks pasados
- [X] Routing configurado
- [X] Monitored 24h sin issues
- Status: ✅ PASSED

### Fase 2 (50% tráfico)
- [ ] Routing escalado
- [ ] Monitored 24h sin issues
- Status: ⏳ IN PROGRESS

### Fase 3 (100% tráfico)
- [ ] Full cutover ejecutado
- [ ] Monitored 24h sin issues
- Status: ⏳ PENDING

### Issues Found & Resolution
[List any issues and how they were fixed]

### Performance Baseline (post-deployment)
- Latencia p95: 250ms
- Error rate: 0.02%
- CPU avg: 45%
- Memory avg: 2.5GB

### Rollback Status
✅ READY - Can rollback in < 1 min
```

---

## ✅ CHECKLIST FINAL PRE-DESPLIEGUE

**48 horas antes de iniciar:**

- [ ] Todos los tests pasando (backend + frontend)
- [ ] Vulnerabilities scan = 0 críticas
- [ ] Database backup verificado
- [ ] Configuración backup completado
- [ ] Secretos en Vault confirmados
- [ ] Certificados válidos (> 30 días)
- [ ] Equipo disponible (DevOps, Backend, Security, Ops)
- [ ] Stakeholders notificados
- [ ] Runbook distribuido
- [ ] BLUE environment está estable y funcional
- [ ] GREEN infrastructure preparada

---

## 📞 SOPORTE Y CONTACTOS

| Rol | Email | Slack | Disponibilidad |
|---|---|---|---|
| DevOps Lead | devops-lead@example.com | @devops-lead | 24/7 durante despliegue |
| Backend Lead | backend-lead@example.com | @backend-lead | 9-18 |
| Security | security@example.com | @security-on-call | 24/7 emergencias |
| Operations | ops@example.com | #sged-incidents | Rotativo 24/7 |

---

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    PLAN DE DESPLIEGUE A PRODUCCIÓN - VERSIÓN FINAL       ║
║                                                            ║
║  Blue/Green Deployment                                   ║
║  3 Fases de 24h cada una (Canary: 10% → 50% → 100%)     ║
║  Rollback listo en < 1 minuto                            ║
║  Monitoreo 24/7 durante 72 horas                         ║
║                                                            ║
║         ✅ LISTO PARA DESPLIEGUE A PRODUCCIÓN             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

**Documento preparado por**: Agente DevOps/Infraestructura  
**Fecha**: Enero 2026  
**Estado**: ✅ APROBADO PARA DESPLIEGUE  
**Próximo paso**: Ejecutar checklist pre-despliegue
