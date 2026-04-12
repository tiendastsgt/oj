---
Documento: MONITOREO_OPERACIONES_PRODUCCION
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# 📊 GUÍA DE MONITOREO Y OPERACIONES - PRODUCCIÓN
## SGED - Post-Deployment Monitoring (72+ horas)

**Responsable**: Operations Team + DevOps  
**Período crítico**: 72 horas post-deployment  
**Periodo de estabilización**: 7-14 días  

---

## 🎯 OBJETIVOS DE MONITOREO

1. ✅ Detectar anomalías en las primeras 24h
2. ✅ Validar performance vs baseline
3. ✅ Identificar memory leaks/resource issues
4. ✅ Capturar datos para documentación
5. ✅ Escalar issues críticos inmediatamente

---

## 📈 MÉTRICAS CLAVE A MONITOREAR

### 1. Disponibilidad

| Métrica | Umbral OK | Alerta | Crítico |
|---------|-----------|--------|---------|
| Health Check (UP) | = UP | != UP | != UP |
| API Response (200) | = 200 | timeout | Down |
| Frontend (200) | = 200 | > 1s | Down |
| Health Check Interval | ≤ 30s | > 30s | N/A |

**Monitoreo**:
```bash
# Cada 5 minutos
while true; do
  curl -s --max-time 5 https://sged.example.com/api/v1/health | jq .status
  sleep 300
done
```

### 2. Latencia

| Métrica | Target | Alerta | Crítico |
|---------|--------|--------|---------|
| p50 latencia | < 200ms | > 300ms | > 1000ms |
| p95 latencia | < 300ms | > 500ms | > 2000ms |
| p99 latencia | < 400ms | > 800ms | > 3000ms |
| Max latencia | < 1s | > 2s | > 5s |

**Cómo capturar**:
```bash
# Desde logs de NGINX
tail -1000 /var/log/nginx/sged-access.log | \
  awk '{print $NF}' | \
  sort -n | \
  awk '{
    if (NR == 1) min = $1
    if (NR == int(NR*0.5)) p50 = $1
    if (NR == int(NR*0.95)) p95 = $1
    if (NR == int(NR*0.99)) p99 = $1
    max = $1
  }
  END {
    print "p50: " p50 "ms"
    print "p95: " p95 "ms"
    print "p99: " p99 "ms"
    print "max: " max "ms"
  }'
```

### 3. Error Rates

| Métrica | Target | Alerta | Crítico |
|---------|--------|--------|---------|
| 4xx rate | 1-2% | > 5% | > 10% |
| 5xx rate | < 0.1% | > 0.5% | > 5% |
| Timeout rate | 0% | > 0.1% | > 1% |

**Monitoreo**:
```bash
# Cada 30 minutos
tail -1000 /var/log/nginx/sged-access.log | awk '{print $9}' | sort | uniq -c | sort -rn

# Resultados esperados:
# 960 200    (96% success)
# 25  404    (2.5% not found)
# 12  401    (1.2% auth)
# 3   500    (0.3% server error) ← Si > 5, alerta
```

### 4. Recursos del Backend

| Métrica | Target | Alerta | Crítico |
|---------|--------|--------|---------|
| CPU | 30-50% | > 70% | > 85% |
| Memoria | 1.5-2.5GB | > 3GB | > 3.5GB |
| Threads | 50-100 | > 150 | > 200 |
| DB Connections | 10-15 | > 18 | > 20 |

**Monitoreo en tiempo real**:
```bash
watch -n 5 'docker stats sged-backend-prod --no-stream'

# Interpretar:
# MEMORY: 2.5GB / 4GB  ← Si > 3GB, investigar
# CPU%: 45%            ← Si sostenido > 70%, escalar
```

### 5. Base de Datos

| Métrica | Target | Alerta | Crítico |
|---------|--------|--------|---------|
| Query latencia | < 100ms | > 200ms | > 500ms |
| Conexiones activas | < 15 | > 18 | > 20 |
| Transacciones/sec | 10-50 | > 100 | > 150 |
| Locks | 0 | > 5 | > 10 |

**Comandos**:
```bash
# Conectar a BD
docker exec -it sged-db-prod sqlplus sged_admin/PASSWORD

# Ver conexiones activas
SELECT COUNT(*) FROM v$session WHERE status = 'ACTIVE';

# Ver performance
SELECT * FROM v$sqlarea 
  WHERE disk_reads + buffer_gets > 1000
  ORDER BY elapsed_time DESC
  FETCH FIRST 10 ROWS ONLY;
```

---

## 🔴 ALERTAS CRÍTICAS (24/7)

### Alerta 1: High Error Rate 5xx
```
IF: 5xx > 1% en últimos 5 minutos
THEN: 
  1. Enviar alert a #sged-incidents (Slack)
  2. Email to devops-oncall@example.com
  3. PagerDuty escalation después de 10 min sin respuesta
```

### Alerta 2: Database Unreachable
```
IF: Backend no puede conectarse a BD > 30 segundos
THEN:
  1. Alerta crítica inmediata
  2. Verificar/reiniciar BD
  3. Si persiste > 60s: ROLLBACK activado
```

### Alerta 3: High Latency
```
IF: p99 latencia > 2 segundos por 10 minutos
THEN:
  1. Investigar causa (BD, CPU, memoria)
  2. Escalar si persiste
  3. Posible rollback si es issue de código
```

### Alerta 4: Memory Leak
```
IF: Memoria creciendo > 500MB cada 5 minutos
THEN:
  1. Alerta inmediata
  2. Dump de heap si posible
  3. Restart de backend para recuperar
  4. Investigar cause antes de siguiente despliegue
```

### Alerta 5: Security Incident
```
IF: Logs contienen "unauthorized access", "breach", etc.
THEN:
  1. Alerta crítica a Security team inmediatamente
  2. Logs respaldados para forensics
  3. Posible rollback + investigación
```

---

## 📋 HORARIOS DE MONITOREO

### Fase 1: Ultra-Critical (0-24 horas post-deploy)

**Asignaciones**:
- 🟢 DevOps Lead: Slack activo + terminal abierta
- 🟢 DevOps Secondary: Cobertura + relevos
- 🔵 Backend: Available on Slack
- 🔵 Operations: Monitoreando dashboard

**Checks**:
- Cada 5 minutos: Health check
- Cada 15 minutos: Error rates
- Cada 30 minutos: Resource metrics
- Cada 1 hora: Full review + Slack status update

**Slack Status Update Template** (cada hora):

```markdown
🟢 SGED Deployment - Hora 1 Update

✅ Metrics:
  • Availability: 100%
  • p95 Latency: 245ms (target: 300ms)
  • Error Rate 5xx: 0% (target: < 0.1%)
  • Memory: 2.2GB / 4GB (target: < 3GB)
  • CPU: 42% (target: 30-50%)

✅ Health:
  • API: ✓ UP
  • Frontend: ✓ UP
  • Database: ✓ Connected
  • Documentos: ✓ Readable

⚠️ Observations:
  • None

📊 Next check in 1 hour
```

### Fase 2: High-Vigilance (24-48 horas post-deploy)

**Frequency**: 
- Health: Cada 10 minutos
- Metrics: Cada 30 minutos
- Status update: Cada 2 horas

### Fase 3: Standard Monitoring (48-72 horas post-deploy)

**Frequency**:
- Health: Cada 30 minutos
- Metrics: Cada 1 hora
- Status update: Cada 4 horas

### Fase 4: Normal Operations (72+ horas)

**Frequency**:
- Health: Automated checks (every 5 min)
- Metrics: Dashboard automated
- Alerts: Only on anomalies

---

## 🛠️ HERRAMIENTAS DE MONITOREO

### Opción 1: Manual (sin herramientas)

```bash
# Create monitoring dashboard script
#!/bin/bash
# File: monitor-sged-prod.sh

while true; do
  clear
  echo "════════════════════════════════════════"
  echo "SGED PRODUCTION MONITORING"
  echo "Time: $(date)"
  echo "════════════════════════════════════════"
  echo ""
  
  echo "📊 HEALTH"
  curl -s --max-time 5 https://sged.example.com/api/v1/health | jq .
  echo ""
  
  echo "💾 RESOURCES"
  docker stats sged-backend-prod --no-stream
  echo ""
  
  echo "⚠️  RECENT ERRORS (last 50)"
  docker logs --since=30m sged-backend-prod | grep ERROR | tail -5
  echo ""
  
  echo "🌐 HTTP STATUS DISTRIBUTION"
  tail -100 /var/log/nginx/sged-access.log | \
    awk '{print $9}' | sort | uniq -c | sort -rn
  echo ""
  
  echo "Next update in 5 minutes..."
  sleep 300
done
```

Ejecutar:
```bash
bash monitor-sged-prod.sh | tee /tmp/sged-monitoring.log
```

### Opción 2: Prometheus + Grafana

```yaml
# prometheus-rules-sged.yml
groups:
  - name: sged_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate5xx
        expr: >
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.01
        for: 5m
        annotations:
          summary: "High 5xx error rate: {{ $value | humanizePercentage }}"
          dashboard: "https://grafana.example.com/d/sged-prod"

      - alert: HighLatency
        expr: histogram_quantile(0.99, http_request_duration_seconds) > 2
        for: 10m
        annotations:
          summary: "High p99 latency: {{ $value }}s"

      - alert: HighMemory
        expr: container_memory_usage_bytes{name="sged-backend"} > 3.5e9
        for: 5m
        annotations:
          summary: "Backend memory > 3.5GB: {{ $value | humanize1024 }}"

      - alert: DatabaseDown
        expr: mysql_up == 0
        for: 1m
        annotations:
          summary: "Database is unreachable"
```

Grafana Dashboard:
```json
{
  "dashboard": {
    "title": "SGED Production Monitoring",
    "panels": [
      {
        "title": "Request Latency",
        "targets": [
          {"expr": "histogram_quantile(0.95, http_request_duration_seconds)"}
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {"expr": "rate(http_requests_total{status=~\"5..\"}[5m])"}
        ]
      },
      {
        "title": "Resource Usage",
        "targets": [
          {"expr": "container_memory_usage_bytes{name=\"sged-backend\"}"},
          {"expr": "rate(container_cpu_usage_seconds_total[5m])"}
        ]
      }
    ]
  }
}
```

---

## 📝 REGISTROS DE MONITOREO

### Archivo de Log Daily

```bash
# File: /var/log/sged-monitoring/daily-YYYY-MM-DD.log

SGED PRODUCTION MONITORING LOG
==============================
Date: 2026-01-28
Deployment Version: v1.1.0
Monitoring Period: 09:00 UTC - 09:00 UTC+1 (24h)

═══ RESUMEN DE MÉTRICAS ═══

Hour 00-01:
  Latency p95: 245ms ✓
  Error 5xx: 0/1000 requests ✓
  Memory peak: 2.3GB ✓
  CPU avg: 38% ✓
  Status: ✅ NORMAL

Hour 01-02:
  Latency p95: 260ms ✓
  Error 5xx: 1/1000 requests (0.1%) ✓
  Memory peak: 2.4GB ✓
  CPU avg: 41% ✓
  Status: ✅ NORMAL

...

═══ INCIDENTS ═══
00:00 - Brief spike in latency (500ms), resolved in 2 min
06:00 - Memory reached 2.8GB, slight increase but within limits

═══ FINAL STATUS ═══
✅ All systems normal
✅ Performance baseline established
📊 Ready for extended operations
```

---

## 🚨 ESCALATION MATRIX

| Issue | Tier 1 | Tier 2 | Tier 3 |
|-------|--------|--------|--------|
| 5xx rate > 1% | Alert DevOps | Page on-call | CTO |
| p99 > 2s | Alert DevOps | Investigate | Rollback decision |
| DB Down | Immediate escalation | CEO | Incident response |
| Memory leak | Alert + investigate | Page backend | Consider rollback |
| Security breach | Immediate security | CTO + CEO | Incident response |

---

## 📊 BASELINE ESTABLISHMENT

**Después de 24 horas sin issues, capturar baseline:**

```bash
#!/bin/bash
# File: capture-baseline.sh

BASELINE_FILE="/tmp/sged-baseline-$(date +%Y%m%d).json"

{
  echo "{"
  echo "  \"timestamp\": \"$(date -Iseconds)\","
  echo "  \"deployment_version\": \"v1.1.0\","
  
  echo "  \"latency\": {"
  echo "    \"p50_ms\": $(get_p50),"
  echo "    \"p95_ms\": $(get_p95),"
  echo "    \"p99_ms\": $(get_p99),"
  echo "    \"max_ms\": $(get_max)"
  echo "  },"
  
  echo "  \"availability\": {"
  echo "    \"uptime_percent\": $(get_uptime),"
  echo "    \"error_4xx_percent\": $(get_4xx_rate),"
  echo "    \"error_5xx_percent\": $(get_5xx_rate)"
  echo "  },"
  
  echo "  \"resources\": {"
  echo "    \"memory_avg_gb\": $(get_memory_avg),"
  echo "    \"memory_max_gb\": $(get_memory_max),"
  echo "    \"cpu_avg_percent\": $(get_cpu_avg),"
  echo "    \"cpu_max_percent\": $(get_cpu_max)"
  echo "  },"
  
  echo "  \"database\": {"
  echo "    \"connections_avg\": $(get_db_connections),"
  echo "    \"latency_avg_ms\": $(get_db_latency)"
  echo "  }"
  echo "}"
} > $BASELINE_FILE

echo "✅ Baseline captured to $BASELINE_FILE"
cat $BASELINE_FILE | jq .
```

---

## 🔍 TROUBLESHOOTING RÁPIDO

### Problem: High Latency Spike

```bash
# Step 1: Check database
docker exec sged-db-prod sqlplus ... @check_perf.sql

# Step 2: Check NGINX upstream
docker logs sged-nginx-prod | grep upstream

# Step 3: Check backend memory
docker stats sged-backend-prod

# Step 4: Check active connections
netstat -an | grep :8080 | wc -l

# Solution: Usually memory-related or DB locks
```

### Problem: 5xx Errors Increasing

```bash
# Step 1: Check recent backend logs
docker logs --since=5m sged-backend-prod | grep -i "error\|exception"

# Step 2: Decode the error
[Look for specific exception, e.g., OutOfMemory, SQL error]

# Step 3: If database:
docker logs sged-db-prod | tail -50

# Step 4: If memory:
docker stats
# Restart if > 90% utilization

# Solution depends on error type
```

### Problem: Frontend Slow/Unresponsive

```bash
# Step 1: Check NGINX logs
tail -20 /var/log/nginx/sged-access.log | grep "/app/"

# Step 2: Check asset delivery
curl -I https://sged.example.com/app/assets/main.js

# Step 3: Check CDN (if applicable)
# Verify cache headers are correct

# Solution: Usually cache/compression issue
```

---

## 📞 ON-CALL RUNBOOK

### First Response (< 5 minutes)

```bash
# 1. Acknowledge alert
echo "Alert acknowledged at $(date)" >> /tmp/incident-log.txt

# 2. Quick health check
curl -s https://sged.example.com/api/v1/health | jq .

# 3. Check recent errors
docker logs --since=5m sged-backend-prod | grep -i error

# 4. Resource check
docker stats sged-backend-prod --no-stream

# 5. Determine if critical
# If yes → Go to Escalation
# If no → Continue monitoring
```

### Escalation (> 10 minutes)

```
1. Page on-call backend engineer
2. Start conference bridge
3. Share screen
4. Begin investigation
5. Document findings
6. Decide: Continue or Rollback
```

---

## ✅ END-OF-MONITORING CHECKLIST

**Después de 72 horas de monitoreo exitoso:**

- [ ] Todos los checks pasando
- [ ] Baseline establecido
- [ ] Performance metrics documentados
- [ ] Cero incidentes críticos
- [ ] Team descanso/rotación
- [ ] Transición a monitoreo normal
- [ ] Deployment marcado como exitoso

---

```
╔════════════════════════════════════════╗
║  MONITOREO 24/7 - LISTO PARA DEPLOY   ║
║                                        ║
║  ✅ Herramientas configuradas          ║
║  ✅ Alertas definidas                  ║
║  ✅ Runbooks preparados                ║
║  ✅ Equipo entrenado                   ║
║                                        ║
╚════════════════════════════════════════╝
```

---

**Preparado por**: DevOps/Infraestructura  
**Fecha**: Enero 2026  
**Estado**: ✅ LISTO PARA IMPLEMENTAR  
**Próxima revisión**: Post-deployment (72h)
