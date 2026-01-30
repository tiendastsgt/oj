# Guía Operativa: Despliegue SGED QA/Producción - Fase 6

## Resumen: Desplegar Stack Completo (NGINX + Backend + Frontend + BD)

Este documento describe cómo desplegar SGED en entornos QA y Producción usando Docker Compose y configuración segura.

---

## 1. Preparación Pre-Despliegue

### 1.1 Verificar que todo está listo

```bash
# Clonar repo
git clone https://github.com/organismo-judicial/sged.git
cd sged

# Verificar estructura
ls -la sGED-backend sGED-frontend nginx docker-compose-qa.yml docker-compose-prod.yml
```

### 1.2 Generar certificados TLS

#### Para QA (autofirmado)

```bash
# Crear directorio
mkdir -p nginx/certs

# Generar certificado autofirmado válido 365 días
openssl req -x509 -newkey rsa:4096 \
  -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt \
  -days 365 -nodes \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"

# Verificar
openssl x509 -in nginx/certs/certificate.crt -text -noout | grep -E "Subject|Issuer|Not Before|Not After"
```

#### Para Producción (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado (requiere DNS públicamente resolvible y puerto 80 abierto)
sudo certbot certonly --standalone \
  -d sged.example.com \
  -d www.sged.example.com \
  --email devops@example.com \
  --agree-tos

# Certificado se guarda en: /etc/letsencrypt/live/sged.example.com/
# Fullchain: /etc/letsencrypt/live/sged.example.com/fullchain.pem
# Private key: /etc/letsencrypt/live/sged.example.com/privkey.pem

# Renovación automática (cron)
# (Certbot instala hook automático en /etc/cron.d/certbot)
sudo certbot renew --dry-run
```

### 1.3 Configurar variables de entorno

#### QA (.env.qa)

```bash
cat > .env.qa << 'EOF'
# Database (Oracle en QA)
DB_URL=jdbc:oracle:thin:@sged-db:1521/SGED
DB_USER=sged
DB_PASSWORD=QA_db_password_123!

# JWT (generar con: openssl rand -base64 32)
JWT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456789/+=

# Documents
DOCUMENTOS_BASE_PATH=/data/documentos
DOCUMENTOS_CONVERSION_ENABLED=true

# Oracle SID
ORACLE_SID=SGED
ORACLE_PWD=OracleQA123!

# Docker registry (si aplica)
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-token
EOF
```

#### Producción (.env.prod)

```bash
cat > .env.prod << 'EOF'
# Database (Oracle en producción real)
DB_URL=jdbc:oracle:thin:@sged-db.internal:1521/SGED
DB_USER=sged_prod
# Usar valor de Vault/Secrets Manager en CI/CD
DB_PASSWORD=${VAULT_DB_PASSWORD}

# JWT (usar valor de Vault/Secrets Manager)
JWT_SECRET=${VAULT_JWT_SECRET}

# Documents (NFS)
DOCUMENTOS_BASE_PATH=/mnt/sged/documentos
DOCUMENTOS_CONVERSION_ENABLED=true

# Oracle
ORACLE_SID=SGED
ORACLE_PWD=${VAULT_ORACLE_PWD}

# AWS CloudWatch
AWS_REGION=us-east-1
AWS_LOG_GROUP=/sged/production
EOF
```

### 1.4 Preparar estructura de directorios

```bash
# Crear directorios para datos persistentes
mkdir -p data/documentos data/oracle-db data/oracle-backups logs/{nginx,backend}

# Permisos correctos
chmod 755 data/documentos data/oracle-db
chmod 755 logs/nginx logs/backend

# Verificar
tree -L 2 data logs nginx
```

---

## 2. Despliegue en QA

### 2.1 Compilar Frontend y Backend

```bash
# Backend: compilación Maven
cd sGED-backend
./mvnw clean package -DskipTests -Ptest-coverage
cd ..

# Frontend: build Angular
cd sGED-frontend
npm ci
npm run build  # Genera dist/
cd ..

# Verificar artefactos
ls -la sGED-backend/target/sged-backend-0.0.1-SNAPSHOT.jar
ls -la sGED-frontend/dist/sged-frontend/
```

### 2.2 Buildear imágenes Docker (local o registry)

```bash
# Build backend (local)
docker build -t sged-backend:qa \
  --build-arg JAVA_VERSION=21 \
  sGED-backend/

# Build frontend con NGINX (multi-stage)
docker build -t sged-frontend:qa sGED-frontend/

# O usar docker-compose
docker-compose -f docker-compose-qa.yml build
```

### 2.3 Levantar stack con Docker Compose

```bash
# Crear redes y volúmenes
docker network create sged-qa-network

# Desplegar servicios (con detalle de logs)
docker-compose -f docker-compose-qa.yml up -d

# Monitorear logs
docker-compose -f docker-compose-qa.yml logs -f

# Verificar estado de servicios
docker-compose -f docker-compose-qa.yml ps

# Ejemplo output:
# NAME                COMMAND              SERVICE   STATUS
# sged-nginx-qa       "nginx -g..."        nginx     Up (healthy)
# sged-backend-qa     "java -jar..."       sged-backend  Up (healthy)
# sged-db-qa          "/bin/sh -c..."      sged-db   Up (healthy)
```

### 2.4 Validar funcionamiento

```bash
# Health check backend
curl -s http://localhost:8080/health | jq .
# Output: {"status":"UP"}

# Health check a través de NGINX HTTPS (ignorar certificado autofirmado)
curl -k https://localhost/health | jq .

# Test API (login)
curl -k -X POST https://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | jq .

# Verificar headers de seguridad
curl -I -k https://localhost/ | grep -E "Strict-Transport|X-Content-Type|X-Frame"

# Ejemplo output:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
```

### 2.5 Prueba de persistencia

```bash
# Crear expediente de prueba
curl -k -X POST https://localhost/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"numero":"EXP-2024-001","estado":"ACTIVO"}' | jq .

# Detener servicios (datos permanecen en docker volumes)
docker-compose -f docker-compose-qa.yml down

# Reiniciar
docker-compose -f docker-compose-qa.yml up -d

# Verificar que expediente sigue allí
curl -k https://localhost/api/v1/expedientes/1 | jq .
```

---

## 3. Despliegue en Producción

### 3.1 Pre-requisitos

- [ ] Certificado TLS válido (Let's Encrypt o CA)
- [ ] Secretos en Vault/GitHub Secrets
- [ ] Base de datos Oracle en servidor separado (no contenedorizado)
- [ ] Storage NFS para documentos (no local)
- [ ] Backups configurados (BD + documentos)
- [ ] Logs centralizados (CloudWatch, Splunk, ELK)
- [ ] Monitoreo y alertas (Prometheus, DataDog, New Relic)

### 3.2 Obtener secretos desde Vault

```bash
#!/bin/bash
# deploy-prod.sh

VAULT_ADDR="https://vault.sged.internal:8200"
VAULT_TOKEN=$(cat /run/secrets/vault_token)

# Obtener secretos
DB_PASSWORD=$(curl -s \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  "$VAULT_ADDR/v1/sged/data/prod/database" | jq -r '.data.data.password')

JWT_SECRET=$(curl -s \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  "$VAULT_ADDR/v1/sged/data/prod/jwt" | jq -r '.data.data.secret')

ORACLE_PWD=$(curl -s \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  "$VAULT_ADDR/v1/sged/data/prod/oracle" | jq -r '.data.data.password')

# Exportar como variables
export DB_PASSWORD JWT_SECRET ORACLE_PWD

# Desplegar
docker-compose -f docker-compose-prod.yml up -d
```

### 3.3 Levantar stack en producción

```bash
# Usar docker-compose-prod.yml
docker-compose -f docker-compose-prod.yml up -d

# Monitorear (no usar -f, solo estado)
docker-compose -f docker-compose-prod.yml logs --tail 100

# Verificar recurso
docker stats
# Debe mostrar límites configurados en docker-compose-prod.yml
```

### 3.4 Validaciones de seguridad

```bash
# Verificar que HTTPS es obligatorio
curl -i http://sged.example.com/
# Debe devolver: 301 Moved Permanently → https://

# Headers de seguridad
curl -I https://sged.example.com/ | grep -E "Strict-Transport|CSP|X-Frame"

# Verificar rate limiting
for i in {1..50}; do
  curl -s https://sged.example.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' | jq .
done
# Después de 5 req/s, debe obtener: 429 Too Many Requests

# Test SSL/TLS
openssl s_client -connect sged.example.com:443 -tls1_2
# Debe aceptar TLS 1.2 sin problemas

# Detectar información sensible en logs
docker logs sged-backend-prod | grep -E "password|secret|token|key"
# No debe encontrar nada
```

---

## 4. Mantenimiento Operacional

### 4.1 Backups

#### Base de datos (Oracle)

```bash
# Manual backup (dentro del contenedor)
docker exec sged-db-prod sqlplus -s sys/as sysdba << EOF
BACKUP DATABASE PLUS ARCHIVELOG;
EXIT;
EOF

# O usar RMAN (Recovery Manager)
docker exec sged-db-prod rman target / << EOF
RUN {
  BACKUP DATABASE PLUS ARCHIVELOG;
  BACKUP CURRENT CONTROLFILE;
}
EXIT;
EOF
```

#### Documentos (NFS/Storage)

```bash
# Backup diario a las 2 AM
0 2 * * * rsync -av /mnt/sged/documentos /mnt/backups/documentos-$(date +%Y%m%d) --delete
```

### 4.2 Logs y Monitoreo

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose-prod.yml logs -f

# Buscar errores
docker logs sged-backend-prod | grep ERROR

# Estadísticas de contenedores
docker stats --no-stream

# Health check manual
curl -s https://sged.example.com/health | jq .status
```

### 4.3 Recargar configuración NGINX sin downtime

```bash
# Editar nginx.conf
vi nginx/nginx.conf

# Validar sintaxis
docker exec sged-nginx-prod nginx -t

# Recargar
docker exec sged-nginx-prod nginx -s reload

# Verificar tráfico (no debe haber drops)
curl -I https://sged.example.com/
```

### 4.4 Rotación de secretos

```bash
# Generar nuevo JWT secret
NEW_JWT=$(openssl rand -base64 32)

# Guardar en Vault
vault kv put sged/prod/jwt secret="$NEW_JWT"

# Actualizar variable de entorno
export JWT_SECRET="$NEW_JWT"

# Restart backend
docker-compose -f docker-compose-prod.yml up -d --force-recreate sged-backend

# Verifi que sigue funcionando
curl -k https://sged.example.com/health
```

### 4.5 Escalar recursos (si es necesario)

```bash
# Aumentar límites de memoria en docker-compose-prod.yml
# deploy.resources.limits.memory: 8G

# Reapply
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod.yml up -d

# Verificar
docker stats sged-backend-prod
```

---

## 5. Troubleshooting

### Problema: Backend no responde (502 Bad Gateway)

```bash
# 1. Verificar que backend está Up
docker-compose -f docker-compose-qa.yml ps sged-backend
# Status debe ser "Up (healthy)"

# 2. Ver logs del backend
docker logs sged-backend-qa | tail -50

# 3. Test connectivity desde NGINX
docker exec sged-nginx-qa curl http://sged-backend:8080/health

# 4. Reiniciar backend
docker-compose -f docker-compose-qa.yml restart sged-backend
```

### Problema: Database connection timeout

```bash
# 1. Verificar que BD está Up
docker-compose -f docker-compose-qa.yml ps sged-db
# Status debe ser "Up (healthy)"

# 2. Ver logs de BD
docker logs sged-db-qa | tail -50

# 3. Test conexión desde backend
docker exec sged-backend-qa sqlplus sged/password@sged-db:1521/SGED

# 4. Verificar variables de entorno en backend
docker exec sged-backend-qa env | grep DB_

# 5. Reiniciar BD
docker-compose -f docker-compose-qa.yml restart sged-db
```

### Problema: HTTPS no funciona (ERR_SSL_PROTOCOL_ERROR)

```bash
# 1. Verificar que NGINX tiene certificado
docker exec sged-nginx-qa ls -la /etc/nginx/certs/

# 2. Validar certificado
openssl x509 -in nginx/certs/certificate.crt -text -noout

# 3. Ver errors en NGINX
docker logs sged-nginx-qa | grep ssl

# 4. Regenear certificado si está expirado
openssl req -x509 -newkey rsa:4096 \
  -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt \
  -days 365 -nodes \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"

# 5. Recargar NGINX
docker exec sged-nginx-qa nginx -s reload
```

### Problema: Out of Memory

```bash
# 1. Ver consumo actual
docker stats

# 2. Ver qué servicio consume más
docker ps --format "{{.Names}}" | xargs docker stats --no-stream

# 3. Aumentar límites en docker-compose
# deploy.resources.limits.memory: 8G

# 4. Reiniciar con nuevos límites
docker-compose down && docker-compose up -d
```

---

## 6. Rollback ante problemas

### Revertir a versión anterior

```bash
# Detener servicios actuales
docker-compose -f docker-compose-qa.yml down

# Cambiar tag de imagen en docker-compose.yml
# sged-backend:latest → sged-backend:v1.2.0

# Reiniciar con versión anterior
docker-compose -f docker-compose-qa.yml up -d

# Verificar
docker-compose -f docker-compose-qa.yml ps
```

---

## 7. Checklist de Despliegue

### Pre-despliegue
- [ ] Certificados TLS generados y validados
- [ ] Variables de entorno (.env) configuradas
- [ ] Secretos en Vault/GitHub Secrets
- [ ] Base de datos lista (Oracle)
- [ ] Storage de documentos disponible
- [ ] Backups configurados

### Despliegue
- [ ] `docker-compose build` sin errores
- [ ] `docker-compose up -d` sin errores
- [ ] Todos los servicios en estado "Up (healthy)"
- [ ] Health checks pasando
- [ ] NGINX sirviendo frontend (GET /)
- [ ] API respondiendo (GET /api/v1/health)
- [ ] Headers de seguridad presentes

### Post-despliegue
- [ ] Pruebas funcionales (login, crear expediente)
- [ ] Verificar logs (sin errores críticos)
- [ ] Validar backups
- [ ] Alertas y monitoreo activos
- [ ] Documentar cambios en log de despliegues

---

**Mantenedor**: Equipo DevOps/Infraestructura
**Última actualización**: Enero 2026
**Contacto de emergencia**: devops@example.com
