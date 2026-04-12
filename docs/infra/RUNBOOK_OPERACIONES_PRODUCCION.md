---
Documento: RUNBOOK_OPERACIONES_PRODUCCION
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# 🏃 RUNBOOK DE OPERACIONES - PRODUCCIÓN
## SGED - Quick Reference Guide for Operations Team

**Para**: Equipo de Operaciones  
**Duración**: 2 minutos para aprender, 30 segundos para ejecutar  
**Prerequisito**: Acceso SSH a prod servers  

---

## ⚡ COMANDOS MÁS USADOS

### Status Rápido (5 segundos)
```bash
# ¿Está todo up?
docker-compose -f docker-compose-prod.yml ps

# Esperado:
# nginx       ... Up (healthy)
# sged-backend ... Up (healthy)  
# sged-frontend ... Up (running)
# sged-db    ... Up (healthy)
```

### Health Check (10 segundos)
```bash
# ¿Está respondiendo?
curl https://sged.example.com/api/v1/health | jq .status

# Esperado: "UP"
```

### Ver Logs (20 segundos)
```bash
# Errores recientes
docker logs sged-backend-prod | grep ERROR | tail -10

# Last 100 lines con follow
docker logs -f --tail=100 sged-backend-prod

# Solo últimos 5 minutos
docker logs --since=5m sged-backend-prod
```

### Recursos (10 segundos)
```bash
# CPU, Memoria
docker stats sged-backend-prod --no-stream

# Esperado:
# Memory: < 3.5 GB
# CPU: 30-70%
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema: "Connection Refused"

```bash
# 1. ¿Está el contenedor corriendo?
docker ps | grep sged-backend-prod

# 2. Si no está, iniciar:
docker-compose -f docker-compose-prod.yml up -d sged-backend

# 3. Esperar 60 segundos
sleep 60

# 4. Verificar nuevamente
curl https://sged.example.com/api/v1/health
```

### Problema: Latencia alta (slow requests)

```bash
# 1. Check backend memory
docker stats sged-backend-prod --no-stream
# Si Memory > 3.5 GB → restart backend

# 2. Check database
docker logs sged-db-prod | tail -20
# Si hay errores → contact DBA

# 3. Check NGINX
docker logs sged-nginx-prod | tail -20

# Solución rápida: Restart backend
docker-compose -f docker-compose-prod.yml restart sged-backend
```

### Problema: Muchos errores 5xx

```bash
# 1. Ver el error específico
docker logs sged-backend-prod | grep "ERROR" | head -5

# 2. Si es "Database Connection"
docker logs sged-db-prod | tail -50

# 3. Si es "Out of Memory"
# → Restart backend (ver arriba)
docker-compose -f docker-compose-prod.yml restart sged-backend

# 4. Si es "JWT Error"
# → Database corruption? Contact DevOps Lead
```

### Problema: Database Down

```bash
# 1. Verificar estado
docker-compose -f docker-compose-prod.yml ps sged-db

# 2. Si dice "Exited", reinicar
docker-compose -f docker-compose-prod.yml restart sged-db

# 3. Esperar 30 segundos
sleep 30

# 4. Verificar logs
docker logs sged-db-prod | tail -50

# Si persiste → Escalate to DBA immediately
```

### Problema: Frontend No Carga (/app/)

```bash
# 1. Check NGINX
curl -I https://sged.example.com/app/
# Esperado: HTTP 200

# 2. Si 502 Bad Gateway
docker logs sged-nginx-prod | grep backend

# 3. Si 404
docker logs sged-nginx-prod | grep -i "open file"

# 4. Restart NGINX
docker-compose -f docker-compose-prod.yml restart nginx

# 5. Verify
curl https://sged.example.com/app/ | head -5
```

---

## 🔄 RESTART PROCEDURES

### Restart Individual Service

```bash
# Backend
docker-compose -f docker-compose-prod.yml restart sged-backend
# Esperar: 60-90 segundos

# Frontend/NGINX (graceful)
docker exec sged-nginx-prod nginx -s reload
# Instantáneo - sin downtime

# Database (cuidado!)
docker-compose -f docker-compose-prod.yml restart sged-db
# Esperar: 120-180 segundos, verificar luego
```

### Restart Todo (si es necesario)

```bash
# ADVERTENCIA: Causa momentáneo downtime (~30 segundos)

docker-compose -f docker-compose-prod.yml down
sleep 10
docker-compose -f docker-compose-prod.yml up -d
sleep 60

# Verificar
docker-compose -f docker-compose-prod.yml ps
curl https://sged.example.com/api/v1/health
```

---

## 📊 VERIFICAR PERFORMANCE

### Latencia

```bash
# Measuring latencia promedio (útil para comparar)
for i in {1..10}; do \
  time curl -s https://sged.example.com/api/v1/health > /dev/null; \
done

# Esperado: Cada request < 500ms
```

### Error Rate en Últimas 100 Requests

```bash
tail -100 /var/log/nginx/sged-access.log | \
  awk '{print $9}' | sort | uniq -c | sort -rn

# Esperado:
# 96 200
# 2  401
# 1  404
# 1  500  ← Si hay, investigar
```

### Database Connections

```bash
docker logs sged-db-prod | tail -5 | grep "connections"

# O via SQL:
docker exec sged-db-prod sqlplus sged_admin/PASSWORD << EOF
SELECT COUNT(*) FROM v\$session WHERE status = 'ACTIVE';
EOF

# Esperado: 10-15 connections
```

---

## 🔐 SECRETOS Y ACCESO

### Cambiar JWT Secret (si fue comprometido)

```bash
# ⚠️ SOLO en emergencia - coordinar con Security

# 1. Generar nuevo
NEW_JWT=$(openssl rand -base64 32)
echo $NEW_JWT

# 2. Actualizar en Vault
vault kv put secret/sged/prod/jwt secret=$NEW_JWT

# 3. Recrear secret en Docker
echo -n $NEW_JWT | docker secret create jwt_secret_new -
# Update docker-compose to reference new secret

# 4. Restart backend
docker-compose -f docker-compose-prod.yml up -d --force-recreate

# ⚠️ Nota: Todos los tokens existentes serán inválidos
```

### Acceder a Base de Datos (lectura)

```bash
docker exec -it sged-db-prod sqlplus sged_admin/PASSWORD

# Comandos útiles:
SELECT * FROM expedientes WHERE id = 12345;
SELECT COUNT(*) FROM documentos;
SELECT * FROM v$session WHERE status = 'ACTIVE';

# Exit: EXIT
```

---

## 📞 ESCALACIÓN

### Si problema persiste > 5 minutos

```bash
# 1. Contactar DevOps Lead
slack @devops-lead "Backend latency spike, need help"
call +1-XXX-XXX-0001

# 2. Proporcionar info
- Status: docker-compose ps
- Error: docker logs sged-backend-prod | grep ERROR
- Resources: docker stats

# 3. Enlazarse en conferencia si es crítico
```

### Si es Critical (múltiples errores)

```bash
# 1. Page on-call immediately
pagerduty incident create \
  --title "SGED Production Down" \
  --urgency high

# 2. Slack #sged-incidents
@here 🚨 CRITICAL: [issue description]

# 3. Considerar rollback
# Ver ROLLBACK_PLAN_PRODUCCION.md
```

---

## 📋 DAILY CHECKLIST

**Ejecutar cada mañana** (5 minutos):

```bash
# 1. Status
docker-compose -f docker-compose-prod.yml ps

# 2. Health
curl https://sged.example.com/api/v1/health | jq .

# 3. Recent errors (última 1 hora)
docker logs --since=1h sged-backend-prod | grep ERROR | wc -l
# Esperado: ≤ 5

# 4. Resources
docker stats sged-backend-prod sged-nginx-prod --no-stream

# 5. Disk usage
df -h /mnt/sged/
# Esperado: < 80% full

# Si todo ✓, puedes continuar con el día
```

---

## 🔍 DEBUG MODE

### Enable detailed logging

```bash
# Cambiar logging level (temporal)
# Edit docker-compose-prod.yml, change:
# LOGGING_LEVEL_COM_OJ_SGED: INFO → DEBUG

# Restart
docker-compose -f docker-compose-prod.yml restart sged-backend

# Ver logs detallados
docker logs -f sged-backend-prod

# Cuando termines, cambiar back a INFO
```

### Access container shell

```bash
# Backend
docker exec -it sged-backend-prod /bin/bash
# Comandos útiles: ps, top, curl, etc.

# NGINX
docker exec -it sged-nginx-prod sh
# Ver config: cat /etc/nginx/nginx.conf
```

---

## 📈 PERFORMANCE TARGETS

**Para comparar con baseline**, valores esperados después de v1.1.0:

```
✅ p95 Latency:        250-350 ms
✅ p99 Latency:        350-500 ms
✅ Error Rate 5xx:     < 0.1%
✅ Error Rate 4xx:     1-3%
✅ Availability:       99.9%+
✅ Backend Memory:     1.5-2.5 GB
✅ Backend CPU:        30-50%
✅ DB Connections:     10-15
```

Si ves valores fuera de estos rangos:
- Investigar cambios recientes
- Revisar logs
- Contactar DevOps si no encuentras causa

---

## 🚨 DISASTER RECOVERY

### If everything is completely down

```bash
# Step 1: Verify hardware connectivity
ping 8.8.8.8
ifconfig

# Step 2: Restart Docker daemon
sudo systemctl restart docker

# Step 3: Check Docker status
sudo systemctl status docker
docker ps

# Step 4: Restart compose stack
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod.yml up -d

# Step 5: Verify
docker-compose -f docker-compose-prod.yml ps
curl https://sged.example.com/api/v1/health

# If still down after 5 min → Page on-call
```

### If database is corrupted

```bash
# ⚠️ CRITICAL - Coordinate with DBA

# 1. Stop application
docker-compose -f docker-compose-prod.yml stop sged-backend

# 2. Restore from backup
# (detailed procedure in SECRETS_MANAGEMENT.md)

# 3. Restart application
docker-compose -f docker-compose-prod.yml up -d

# 4. Verify
curl https://sged.example.com/api/v1/health
```

---

## 🎓 LEARNING RESOURCES

**Para aprender más**:

- Deployment plan: PLAN_DESPLIEGUE_PRODUCCION.md
- Rollback: ROLLBACK_PLAN_PRODUCCION.md
- Monitoring: MONITOREO_OPERACIONES_PRODUCCION.md
- Infrastructure: README_INFRAESTRUCTURA.md
- Secrets: SECRETS_MANAGEMENT.md

---

## ✅ QUICK COMMAND REFERENCE

```bash
# Status
docker-compose -f docker-compose-prod.yml ps

# Health
curl https://sged.example.com/api/v1/health

# Logs
docker logs -f sged-backend-prod

# Restart
docker-compose -f docker-compose-prod.yml restart sged-backend

# Stats
docker stats sged-backend-prod --no-stream

# DB Access
docker exec -it sged-db-prod sqlplus sged_admin/PASSWORD

# NGINX Reload
docker exec sged-nginx-prod nginx -s reload

# Emergency Rollback
# See ROLLBACK_PLAN_PRODUCCION.md
```

---

## 📞 CONTACTS

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| DevOps Lead | John Doe | +1-XXX-0001 | @john-devops |
| Backend Lead | Jane Smith | +1-XXX-0002 | @jane-backend |
| DBA | Bob Johnson | +1-XXX-0003 | @bob-dba |
| On-Call | [Rotation] | Check Slack | #oncall-rotation |

---

```
╔════════════════════════════════════════╗
║  RUNBOOK IMPRESO Y DISTRIBUIDO         ║
║                                        ║
║  ✅ Operaciones tiene acceso 24/7      ║
║  ✅ Procedimientos listos              ║
║  ✅ Escalación clara                   ║
║  ✅ Emergencias cubiertos              ║
║                                        ║
╚════════════════════════════════════════╝
```

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Estado**: ✅ LISTO PARA USAR  
**Próxima revisión**: Mensual
