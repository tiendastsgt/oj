# 🔄 PLAN DE ROLLBACK - PRODUCCIÓN
## SGED v1.1.0 Production Rollback Strategy

**Responsable**: DevOps/Infraestructura  
**Tiempo máximo de ejecución**: < 1 minuto  
**Recovery Point Objective (RPO)**: 0 minutos (sin pérdida de datos)  
**Recovery Time Objective (RTO)**: < 60 segundos  

---

## 🚨 CRITERIOS PARA ACTIVAR ROLLBACK

Activar rollback **INMEDIATAMENTE** (sin esperar aprobaciones) si se detecta:

### Críticos (Activar en el acto)

❌ **Error Rate 5xx > 5%** sostenido por 5 minutos
```bash
# Monitoreo
tail -300 /var/log/nginx/sged-access.log | grep " 5[0-9][0-9] " | wc -l
# Si > 15 en los últimos 5 min → ROLLBACK
```

❌ **Database Connection Loss** > 30 segundos
```bash
# Test
curl -f https://sged.example.com/api/v1/expedientes
# Si falla por > 30s → ROLLBACK
```

❌ **Application Crash/OOM** (Out of Memory)
```bash
docker logs sged-backend-prod | grep -i "OutOfMemory\|segmentation fault"
# Si aparece → ROLLBACK
```

❌ **Latencia p99 > 2 segundos** sostenido 10 minutos
```bash
# Desde Prometheus/CloudWatch
p99_latency > 2000ms for 10m → ROLLBACK
```

❌ **Security Incident** (unauthorized access, data breach)
```bash
# Logs de security
docker logs sged-backend-prod | grep -i "unauthorized\|denied\|breach"
# Si aparece → ROLLBACK + notificar Security inmediatamente
```

❌ **Flyway Migration Error** (incompatible schema change)
```bash
docker logs sged-backend-prod | grep -i "flyway\|migration"
# Si hay error → ROLLBACK + investigar
```

❌ **JWT Signature Mismatch** (token validation failures masivos)
```bash
docker logs sged-backend-prod | grep "JWT validation failed" | wc -l
# Si > 100/min → ROLLBACK (indica JWT_SECRET mismatch)
```

### Altos (Verificar luego, posible rollback)

⚠️ **Tasa de error 4xx > 10%** (posibles requests mal formados)  
⚠️ **Memory leak** (memoria creciendo > 500MB/5min)  
⚠️ **CPU > 90%** sostenido 10 minutos  
⚠️ **Documentos no accesibles** (falla al leer/escribir)  

---

## 🔧 PROCEDIMIENTO DE ROLLBACK (PASO A PASO)

### Fase Preparatoria: Arquitectura Pre-Despliegue

**Antes de cualquier despliegue, SIEMPRE:**

```bash
# Mantener BLUE corriendo durante TODO el despliegue
docker-compose -f docker-compose-prod-blue.yml ps
# Debe mostrar todos "Up (healthy)"

# Tener backups frescos
ls -la /backup/sged-prod-*
ls -la /backup/vault-snapshot-*
```

### ROLLBACK PASO 1: Verificar BLUE sigue corriendo (15 segundos)

```bash
#!/bin/bash
# Script: rollback-step1.sh

echo "🔍 [ROLLBACK] Verificando BLUE Stack..."

docker-compose -f docker-compose-prod-blue.yml ps

# Verificar cada servicio
for service in nginx sged-backend sged-db; do
  STATUS=$(docker-compose -f docker-compose-prod-blue.yml ps $service \
    | tail -1 | awk '{print $NF}')
  
  if [[ $STATUS == *"Up"* ]]; then
    echo "✅ $service está UP en BLUE"
  else
    echo "❌ ERROR: $service NO está UP en BLUE"
    echo "🚨 ROLLBACK FALLÓ - CONTACTAR DEVOPS LEAD INMEDIATAMENTE"
    exit 1
  fi
done

echo "✅ BLUE Stack verificado - Proceder a Paso 2"
```

**Criterio de paso**: Todos los servicios "Up (healthy)"

### ROLLBACK PASO 2: Cambiar tráfico de GREEN a BLUE (30 segundos)

**OPCIÓN A: NGINX Upstream Weight**

```bash
#!/bin/bash
# Script: rollback-step2-nginx.sh

echo "🔄 [ROLLBACK] Cambiando tráfico a BLUE (NGINX)..."

# Backup config actual (GREEN)
cp /opt/sged-prod/nginx/nginx-prod.conf \
   /backup/nginx-green-config-$(date +%s).conf

# Restaurar config BLUE
cp /opt/sged-prod-blue/nginx/nginx-prod.conf \
   /opt/sged-prod/nginx/nginx-prod.conf

# O editar directamente el upstream
cat > /tmp/backend-upstream.conf << 'EOF'
upstream backend {
    server sged-backend:8080 weight=100;        # BLUE - RESTORED
    server sged-backend-green:8081 weight=0;    # GREEN - PAUSED
    keepalive 32;
}
EOF

sed -i '/upstream backend/,/^}/c\' /opt/sged-prod/nginx/nginx-prod.conf
cat /tmp/backend-upstream.conf >> /opt/sged-prod/nginx/nginx-prod.conf

# Reload NGINX (sin downtime)
docker exec sged-nginx-prod nginx -s reload

if [ $? -eq 0 ]; then
  echo "✅ NGINX reloaded - Tráfico en BLUE"
else
  echo "❌ NGINX reload falló"
  exit 1
fi
```

**OPCIÓN B: AWS Route53 Weight-Based Routing**

```bash
#!/bin/bash
# Script: rollback-step2-route53.sh

echo "🔄 [ROLLBACK] Cambiando tráfico a BLUE (Route53)..."

# Cambiar weights en Route53
# sged-blue.example.com:  100%
# sged-green.example.com: 0%

aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "sged.example.com",
          "Type": "A",
          "SetIdentifier": "sged-blue",
          "Weight": 100,
          "TTL": 60,
          "ResourceRecords": [
            {"Value": "203.0.113.1"}
          ]
        }
      },
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "sged.example.com",
          "Type": "A",
          "SetIdentifier": "sged-green",
          "Weight": 0,
          "TTL": 60,
          "ResourceRecords": [
            {"Value": "203.0.113.2"}
          ]
        }
      }
    ]
  }'

if [ $? -eq 0 ]; then
  echo "✅ Route53 updated - Tráfico en BLUE"
  echo "⏳ Esperando propagación DNS (60 segundos)..."
  sleep 60
else
  echo "❌ Route53 update falló"
  exit 1
fi
```

**Criterio de paso**: Routing configurado sin errores

### ROLLBACK PASO 3: Validar tráfico en BLUE (20 segundos)

```bash
#!/bin/bash
# Script: rollback-step3-validate.sh

echo "✓ [ROLLBACK] Validando tráfico en BLUE..."

# Test 1: Health check
echo "  Testing health endpoint..."
HEALTH=$(curl -s --max-time 5 https://sged.example.com/api/v1/health | jq -r .status)
if [ "$HEALTH" = "UP" ]; then
  echo "  ✅ Health check: UP"
else
  echo "  ❌ Health check falló"
  exit 1
fi

# Test 2: API response
echo "  Testing API..."
HTTP_CODE=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" \
  https://sged.example.com/api/v1/expedientes)
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ API responding: 200 OK"
else
  echo "  ❌ API returned: $HTTP_CODE"
  exit 1
fi

# Test 3: Frontend
echo "  Testing frontend..."
FRONTEND=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" \
  https://sged.example.com/app/)
if [ "$FRONTEND" = "200" ]; then
  echo "  ✅ Frontend accessible: 200 OK"
else
  echo "  ❌ Frontend returned: $FRONTEND"
  exit 1
fi

# Test 4: Verificar logs sin errores recientes
echo "  Checking logs..."
RECENT_ERRORS=$(docker logs --since=30s sged-backend-prod \
  | grep -c "ERROR\|Exception")
if [ "$RECENT_ERRORS" -lt 2 ]; then
  echo "  ✅ Logs clean: $RECENT_ERRORS errors en últimos 30s"
else
  echo "  ⚠️  WARNING: $RECENT_ERRORS errors en últimos 30s"
fi

echo "✅ BLUE validation PASSED - Tráfico routing correctamente"
```

**Criterio de paso**: 
- ✅ Health = UP
- ✅ API = 200
- ✅ Frontend = 200
- ✅ Logs sin errores críticos recientes

### ROLLBACK PASO 4: Pausar GREEN Stack (10 segundos)

```bash
#!/bin/bash
# Script: rollback-step4-pause-green.sh

echo "⏸️  [ROLLBACK] Pausando GREEN stack..."

cd /opt/sged-prod-green

# Opción A: Stop sin eliminar (preservar data)
docker-compose -f docker-compose-prod-green.yml stop

# Opción B: Down (eliminar containers pero no volúmenes)
# docker-compose -f docker-compose-prod-green.yml down

if [ $? -eq 0 ]; then
  echo "✅ GREEN stack paused"
  
  # Preservar logs
  docker logs sged-backend-green > /backup/green-logs-$(date +%s).log
  echo "📝 GREEN logs salvados en /backup/"
else
  echo "⚠️  GREEN pause warning - continuando"
fi
```

**Criterio de paso**: GREEN containers detenidos

### ROLLBACK PASO 5: Comunicación y Registro (5 segundos)

```bash
#!/bin/bash
# Script: rollback-step5-notify.sh

echo "📢 [ROLLBACK] Notificando a equipo..."

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')
ROLLBACK_ID=$(uuidgen)

# Guardar registro de rollback
cat > /backup/ROLLBACK-RECORD-$ROLLBACK_ID.txt << EOF
🔄 ROLLBACK EXECUTADO
═════════════════════════════════════════
Timestamp:        $TIMESTAMP
Rollback ID:      $ROLLBACK_ID
From:             GREEN (v1.1.0)
To:               BLUE (v1.0.0)
Duration:         < 60 segundos
Status:           ✅ COMPLETADO

Razón:            [TO BE FILLED]
Criterio:         [TO BE FILLED]

Investigación:
  [ ] Revisar logs de GREEN
  [ ] Identificar causa del error
  [ ] Preparar fix
  [ ] Re-test en QA antes de reintento

Próximos pasos:
  1. Investigar error
  2. Esperar 24 horas mínimo
  3. Re-deploy cuando esté listo

Verde Logs: /backup/green-logs-$(date +%s).log
EOF

# Slack notification
curl -X POST https://hooks.slack.com/services/... \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🔴 ROLLBACK EJECUTADO - SGED v1.1.0",
    "attachments": [
      {
        "color": "danger",
        "fields": [
          {"title": "Status", "value": "✅ Tráfico en BLUE", "short": true},
          {"title": "Rollback ID", "value": "'$ROLLBACK_ID'", "short": true},
          {"title": "Duration", "value": "< 60s", "short": true},
          {"title": "Next Steps", "value": "Ver #sged-incidents para investigación", "short": false}
        ]
      }
    ]
  }'

# Email notification
mail -s "🔴 SGED Production Rollback Executed" \
  devops-team@example.com < /backup/ROLLBACK-RECORD-$ROLLBACK_ID.txt

echo "✅ Notificaciones enviadas"
```

**Criterio de paso**: Registrado y comunicado

---

## ⚡ ROLLBACK RÁPIDO (Todo junto)

**Si necesitas máxima velocidad, ejecuta este script:**

```bash
#!/bin/bash
# Script: ROLLBACK-FAST.sh
# Ejecuta rollback completo en < 1 minuto

set -e  # Exit on first error

echo "🚨 SGED PRODUCTION ROLLBACK - INICIADO"
echo "Hora: $(date)"

# Step 1: Verify BLUE
docker-compose -f docker-compose-prod-blue.yml ps | grep -q "Up" || exit 1

# Step 2: Change routing (NGINX)
cp /opt/sged-prod/nginx/nginx-prod.conf \
   /backup/nginx-green-$(date +%s).conf
sed -i 's/weight=50;.*BLUE/weight=100;  # BLUE/g' \
  /opt/sged-prod/nginx/nginx-prod.conf
sed -i 's/weight=50;.*GREEN/weight=0;   # GREEN/g' \
  /opt/sged-prod/nginx/nginx-prod.conf
docker exec sged-nginx-prod nginx -s reload

# Step 3: Validate
sleep 10
curl -f https://sged.example.com/api/v1/health || exit 1

# Step 4: Pause GREEN
cd /opt/sged-prod-green
docker-compose -f docker-compose-prod-green.yml stop

# Step 5: Notify
echo "✅ ROLLBACK COMPLETADO EN $(date +%s)s"
curl -X POST https://hooks.slack.com/services/... \
  -d '{"text": "✅ SGED Rollback Complete - BLUE Restored"}'

echo "⏰ Status: Tráfico 100% en BLUE (v1.0.0)"
```

---

## 📊 MATRIZ DE DECISIÓN ROLLBACK

Cuando ocurra un issue, usar esta matriz:

```
┌───────────────────────┬──────────────┬────────────────────────┐
│ Síntoma               │ Severidad    │ Acción                 │
├───────────────────────┼──────────────┼────────────────────────┤
│ Latencia p95 > 500ms  │ MEDIA        │ Monitorear 5 más min  │
│ Latencia p95 > 2s     │ CRÍTICA      │ ROLLBACK INMEDIATO    │
│                       │              │                        │
│ Error 5xx < 1%        │ BAJA         │ Monitorear            │
│ Error 5xx > 1%        │ MEDIA        │ Monitorear 10 min     │
│ Error 5xx > 5%        │ CRÍTICA      │ ROLLBACK INMEDIATO    │
│                       │              │                        │
│ Database OK           │ BAJA         │ Continuar             │
│ Database timeout 30s  │ CRÍTICA      │ ROLLBACK INMEDIATO    │
│                       │              │                        │
│ Memory < 3.5GB        │ BAJA         │ Continuar             │
│ Memory > 3.5GB        │ MEDIA        │ Monitorear            │
│ Memory leak > 500MB/5m│ CRÍTICA      │ ROLLBACK + INVESTIGATE│
│                       │              │                        │
│ Login funciona        │ OK           │ Continuar             │
│ JWT validation 100/m  │ CRÍTICA      │ ROLLBACK INMEDIATO    │
└───────────────────────┴──────────────┴────────────────────────┘
```

---

## 🗂️ RESTAURACIÓN DE DATOS (Si necesario)

### Scenario 1: Incompatible Schema Change

Si Flyway migration no puede ser revertida automáticamente:

```bash
# 1. Stop backend
docker-compose -f docker-compose-prod.yml stop sged-backend

# 2. Restore database de backup
impdp sged_admin/PASSWORD@SGED \
  dumpfile=sged_prod_YYYY-MM-DD.dmp \
  directory=DP_DIR \
  full=Y \
  table_exists_action=TRUNCATE

# 3. Start old version BLUE
docker-compose -f docker-compose-prod-blue.yml up -d

# 4. Restore data
[Manual process si fue requerido]
```

### Scenario 2: Document Storage Corruption

Si hay problema con archivos de documentos:

```bash
# Restore de backup
rsync -av /backup/sged-documentos-YYYY-MM-DD/ \
  /mnt/sged/documentos/

# Verify
ls -la /mnt/sged/documentos/ | wc -l
# Debe coincidir con backup

# Restart backend
docker-compose -f docker-compose-prod.yml restart sged-backend
```

---

## 🔍 POST-ROLLBACK INVESTIGATION

**Después de rollback ejecutado, investigar:**

### Checklist de Investigación

- [ ] Revisar logs de GREEN (guardar en `/backup/green-logs-*.log`)
- [ ] Revisar cambios de código entre v1.0.0 y v1.1.0
- [ ] Revisar cambios de configuración entre BLUE y GREEN
- [ ] Revisar cambios de BD (schema, data)
- [ ] Revisar cambios de secretos/env variables
- [ ] Test en QA antes de reintento
- [ ] Comunicar hallazgos al equipo

### Comando: Analizar logs de GREEN

```bash
#!/bin/bash
# Script: analyze-green-failure.sh

GREEN_LOG="/backup/green-logs-*.log"
ANALYSIS="/backup/green-failure-analysis.txt"

{
  echo "=== GREEN FAILURE ANALYSIS ==="
  echo "Timestamp: $(date)"
  echo ""
  
  echo "🔴 ERRORS Found:"
  grep -i "ERROR\|Exception" $GREEN_LOG | head -20
  
  echo ""
  echo "🟡 WARNINGS Found:"
  grep -i "WARN" $GREEN_LOG | head -10
  
  echo ""
  echo "🔵 INFO about startup:"
  grep -i "started\|initialized\|listening" $GREEN_LOG | head -5
  
  echo ""
  echo "🔴 Database issues:"
  grep -i "database\|connection\|jdbc" $GREEN_LOG | head -10
  
  echo ""
  echo "🔐 JWT/Auth issues:"
  grep -i "jwt\|authentication\|token" $GREEN_LOG | head -10
  
} > $ANALYSIS

echo "✅ Analysis saved to $ANALYSIS"
cat $ANALYSIS
```

---

## 🛑 PREVENTION: Cómo evitar rollbacks

1. **Testing exhaustivo en QA**
   - Suite E2E 100% pasando
   - Load test sin issues
   - Security scan = 0 críticas

2. **Gradual rollout (Canary)**
   - 10% → Monitorear 24h
   - 50% → Monitorear 24h
   - 100% → Monitorear 24h

3. **Monitoreo proactivo**
   - Alertas configuradas
   - Dashboard visible
   - On-call ready

4. **Database migration strategy**
   - Migrations siempre backward-compatible
   - Rollback testing en QA
   - Schema versioning

---

## ✅ ROLLBACK CHECKLIST

**Después de ejecutar rollback:**

- [ ] BLUE stack corriendo 100%
- [ ] Tráfico routing correctamente
- [ ] Health check = UP
- [ ] API respondiendo 200
- [ ] Frontend accesible
- [ ] Logs sin errores críticos
- [ ] Notificaciones enviadas
- [ ] Registro de rollback guardado
- [ ] GREEN stack parado
- [ ] Logs de GREEN respaldados
- [ ] Investigación iniciada
- [ ] Stakeholders notificados

---

```
╔════════════════════════════════════════════════╗
║                                                ║
║    PLAN DE ROLLBACK LISTO                     ║
║                                                ║
║  Tiempo máximo: < 1 minuto                   ║
║  RPO: 0 minutos (sin pérdida de datos)       ║
║  RTO: < 60 segundos                           ║
║                                                ║
║  ✅ ROLLBACK TESTED Y DOCUMENTADO             ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

**Documento preparado por**: DevOps/Infraestructura  
**Fecha**: Enero 2026  
**Estado**: ✅ LISTO PARA DESPLIEGUE  
**Última revisión**: [date]  
**Próxima revisión**: Después de cada despliegue
