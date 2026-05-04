---
Documento: OPERACIONES_DIARIAS_QUICK_REFERENCE
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# Operaciones Diarias - SGED Infraestructura (Quick Reference)

## Monitoreo de Salud

### Health Check rápido

```bash
# Todos los servicios
docker-compose -f docker-compose-qa.yml ps

# Output esperado:
# NAME                COMMAND              SERVICE   STATUS
# sged-nginx-qa       "nginx -g..."        nginx     Up (healthy)
# sged-backend-qa     "java -jar..."       sged-backend  Up (healthy)
# sged-db-qa          "/bin/sh -c..."      sged-db   Up (healthy)
```

### Ver logs últimas 50 líneas

```bash
# Todos
docker-compose logs --tail 50

# Backend
docker-compose logs --tail 50 sged-backend

# NGINX
docker-compose logs --tail 50 nginx

# BD
docker-compose logs --tail 50 sged-db
```

### CPU/Memoria

```bash
docker stats --no-stream
```

---

## Restart de Servicios

### Reiniciar servicio específico

```bash
# Backend
docker-compose restart sged-backend

# NGINX
docker-compose restart nginx

# BD
docker-compose restart sged-db

# Todos
docker-compose restart
```

### Reiniciar y ver logs

```bash
docker-compose restart sged-backend && docker-compose logs -f sged-backend
```

---

## NGINX Operations

### Validar configuración

```bash
docker exec sged-nginx-qa nginx -t
```

### Recargar sin downtime

```bash
docker exec sged-nginx-qa nginx -s reload
```

### Ver logs de acceso (último error)

```bash
docker logs sged-nginx-qa | grep -i error | tail -20
```

### Test de rate limiting

```bash
for i in {1..50}; do 
  curl -s -o /dev/null -w "%{http_code}" https://localhost/api/v1/auth/login -k
  echo ""
done
# Debe mostrar 429 después de 5 req/s
```

---

## Backend Operations

### Ver logs de error

```bash
docker logs sged-backend-qa | grep ERROR
```

### Entrar en contenedor (debug)

```bash
docker exec -it sged-backend-qa bash

# Dentro:
ps aux
cat /proc/sys/net/ipv4/tcp_max_syn_backlog
curl http://localhost:8080/health
```

### Ver properties de aplicación

```bash
docker exec sged-backend-qa env | grep -E "DB_|JWT_|SPRING_"
```

### Test de conectividad a BD

```bash
docker exec sged-backend-qa curl http://localhost:8080/health
# {"status":"UP","components":{"db":{"status":"UP"}}}
```

---

## Base de Datos

### Entrar en BD Oracle

```bash
docker exec -it sged-db-qa sqlplus sged/password@localhost:1521/SGED
```

### Backup rápido

```bash
docker exec sged-db-qa sqlplus -s sys/as sysdba << EOF
CREATE RESTORE POINT qa_backup_$(date +%Y%m%d_%H%M%S);
EXIT;
EOF
```

### Listar restore points

```bash
docker exec sged-db-qa sqlplus -s sys/as sysdba << EOF
SELECT NAME, SCN, TIME_CREATED FROM V\$RESTORE_POINT;
EXIT;
EOF
```

---

## Certificados TLS

### Verificar fecha de expiración

```bash
openssl x509 -in nginx/certs/certificate.crt -noout -dates
# notBefore=Jan  1 00:00:00 2025 GMT
# notAfter=Jan  1 00:00:00 2026 GMT
```

### Si está próximo a expirar (QA)

```bash
openssl req -x509 -newkey rsa:4096 \
  -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt \
  -days 365 -nodes \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"

docker-compose restart nginx
```

### Si está próximo a expirar (Prod - Let's Encrypt)

```bash
sudo certbot renew --force-renewal

# O automático en cron (generalmente ya configurado)
sudo systemctl restart certbot.timer
```

---

## Secretos

### Rotar JWT Secret

```bash
# Generar nuevo secret
NEW_JWT=$(openssl rand -base64 32)

# Actualizar en GitHub Secrets o Vault
# (Manualmente en GitHub UI o con CLI)
gh secret set JWT_SECRET --body "$NEW_JWT"

# Redeploy
docker-compose down
docker-compose up -d
```

### Rotar DB Password

```bash
# Generar nueva contraseña
NEW_PASS=$(openssl rand -base64 16)

# Actualizar en BD
docker exec sged-db-qa sqlplus -s sys/as sysdba << EOF
ALTER USER sged IDENTIFIED BY '$NEW_PASS';
EXIT;
EOF

# Actualizar en .env y redeploy
vi .env.qa
docker-compose restart sged-backend
```

---

## Troubleshooting Rápido

### "502 Bad Gateway"

```bash
# 1. Backend está Up?
docker-compose ps sged-backend

# 2. Backend responde?
curl http://localhost:8080/health

# 3. NGINX puede alcanzar backend?
docker exec sged-nginx-qa curl http://sged-backend:8080/health

# 4. Restart backend
docker-compose restart sged-backend
```

### "Database Connection Timeout"

```bash
# 1. BD está Up?
docker-compose ps sged-db

# 2. BD es accesible?
docker exec sged-backend-qa sqlplus sged/password@sged-db:1521/SGED "select 1 from dual;"

# 3. Restart BD
docker-compose restart sged-db
```

### "HTTPS Certificate Error"

```bash
# 1. Certificado expirado?
openssl x509 -in nginx/certs/certificate.crt -noout -dates

# 2. Certificado mal configurado?
openssl x509 -in nginx/certs/certificate.crt -text -noout | grep -E "Subject|Issuer"

# 3. Regenerar
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt -days 365 -nodes \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"

# 4. Restart NGINX
docker-compose restart nginx
```

### "Out of Memory"

```bash
# 1. Ver consumo
docker stats

# 2. Qué contenedor usa más?
docker ps --format "{{.Names}}" | xargs -I {} docker stats {} --no-stream

# 3. Aumentar límites en docker-compose.yml
# deploy.resources.limits.memory: 8G

# 4. Redeploy
docker-compose down && docker-compose up -d
```

---

## Backup & Recovery

### Backup manual (BD + documentos)

```bash
#!/bin/bash
# backup-sged.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/sged-$DATE"

mkdir -p "$BACKUP_DIR"

# Backup BD
docker exec sged-db-qa sqlplus -s sys/as sysdba << EOF
CREATE RESTORE POINT backup_$DATE;
BACKUP DATABASE PLUS ARCHIVELOG;
EXIT;
EOF

# Backup documentos
rsync -av data/documentos "$BACKUP_DIR/"

echo "✓ Backup completado: $BACKUP_DIR"
```

### Restore desde backup

```bash
# 1. Detener servicios
docker-compose down

# 2. Restore BD
docker exec sged-db-qa sqlplus -s sys/as sysdba << EOF
RESTORE DATABASE FROM RESTORE POINT backup_2026_05_03;
EXIT;
EOF

# 3. Restore documentos
rsync -av /backup/sged-2026_05_03/documentos data/

# 4. Reiniciar
docker-compose up -d
```

---

## Logs y Auditoría

### Buscar en logs (fecha específica)

```bash
# Errores de hoy
docker logs sged-backend-qa | grep "$(date +%Y-%m-%d)" | grep ERROR

# Errores en el último acceso
docker logs sged-nginx-qa | grep "$(date +%d/%b/%Y)" | tail -20
```

### Auditoría de cambios

```bash
# Quién accedió a secretos?
cat ~/.bash_history | grep secret

# Quién restarteó servicios?
docker events --filter 'type=container' --filter 'action=start' --since '2024-01-01T00:00:00'
```

---

## Métricas Básicas

### Performance del API

```bash
# Tiempo de respuesta promedio
for i in {1..10}; do 
  curl -w "%{time_total}\n" -o /dev/null -s https://localhost/api/v1/health
done | awk '{sum+=$1; count++} END {print "Promedio:", sum/count, "segundos"}'
```

### Throughput (requests por segundo)

```bash
# 100 requests en paralelo
ab -n 100 -c 10 https://localhost/api/v1/health
```

---

## Mantenimiento Mensual

- [ ] Revisar certificados TLS (próximas expiraciones)
- [ ] Rotar secrets (JWT, DB password)
- [ ] Revisar alertas y logs de error
- [ ] Backup completo de BD y documentos
- [ ] Actualizar parches de seguridad (OS, Docker, etc.)
- [ ] Revisar uso de disco
- [ ] Verificar retención de logs

---

## Contactos de Emergencia

| Problema | Contacto | Teléfono |
|----------|----------|----------|
| Caída del servicio | devops@example.com | +503-xxxx-xxxx |
| Seguridad | security@example.com | +503-xxxx-xxxx |
| BD Oracle | dba@example.com | +503-xxxx-xxxx |
| 24/7 Emergency | on-call@example.com | +503-xxxx-xxxx |

---

**Última actualización**: Mayo 2026
**Mantenedor**: Equipo DevOps/Infraestructura
