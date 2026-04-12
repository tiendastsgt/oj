---
Documento: README_INFRAESTRUCTURA
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# SGED - Infraestructura y Despliegue (Fase 6)

## Descripción General

Este documento describe la infraestructura de SGED después de la **Fase 6**: NGINX, HTTPS, headers de seguridad, análisis de seguridad en CI/CD, y gestión de secretos.

**Estado**: ✅ Completado
**Última actualización**: Enero 2026

---

## Estructura de Archivos

```
sged/
├── nginx/
│   ├── nginx.conf              # Configuración QA (HTTP redirect, HTTPS, headers)
│   ├── nginx-prod.conf         # Configuración Prod (optimizada)
│   └── certs/
│       ├── certificate.crt     # Certificado TLS (generar con openssl)
│       └── private.key         # Clave privada (generar con openssl)
│
├── docker-compose-qa.yml       # Stack QA (NGINX + Backend + Frontend + Oracle/H2)
├── docker-compose-prod.yml     # Stack Prod (NGINX + Backend + Frontend + Oracle)
│
├── .github/workflows/
│   └── ci.yml                  # CI/CD con CodeQL + DAST + Docker build
│
├── .env.example                # Plantilla variables (comitear)
├── .env.qa                      # Variables QA (Vault/GitHub Secrets)
├── .env.prod                    # Variables Prod (Vault/GitHub Secrets)
│
└── docs/
    ├── NGINX_SECURITY_GUIDE.md # Cómo configurar TLS, headers, rate limiting
    ├── DEPLOYMENT_GUIDE.md     # Paso a paso despliegue QA/Prod
    ├── SECRETS_MANAGEMENT.md   # Gestión de secretos (Vault, GitHub, AWS)
    └── FASE_6_INFORME_EJECUTIVO.md  # Resumen ejecutivo de Fase 6
```

---

## Inicio Rápido

### Despliegue Local (Desarrollo)

```bash
# 1. Compilar Backend (Maven)
cd sGED-backend
./mvnw clean package -DskipTests
cd ..

# 2. Compilar Frontend (npm)
cd sGED-frontend
npm ci
npm run build
cd ..

# 3. Desplegar con Docker Compose (QA)
docker-compose -f docker-compose-qa.yml up -d

# 4. Verificar servicios
docker-compose -f docker-compose-qa.yml ps

# 5. Validar
curl -k https://localhost/health
curl -k https://localhost/app/
```

### Despliegue Producción

```bash
# 1. Obtener certificado TLS (Let's Encrypt)
sudo certbot certonly --standalone \
  -d sged.example.com \
  --email admin@example.com

# 2. Crear archivo .env.prod con secretos desde Vault
# (Ver SECRETS_MANAGEMENT.md)

# 3. Desplegar
docker-compose -f docker-compose-prod.yml up -d

# 4. Validar HTTPS
curl https://sged.example.com/health
```

---

## Comandos Comunes

### Docker Compose

```bash
# Ver estado de servicios
docker-compose -f docker-compose-qa.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose-qa.yml logs -f

# Logs de un servicio específico
docker-compose -f docker-compose-qa.yml logs -f sged-backend

# Entrar en contenedor
docker exec -it sged-backend-qa bash

# Recargar NGINX sin downtime
docker exec sged-nginx-qa nginx -s reload

# Detener servicios
docker-compose -f docker-compose-qa.yml down

# Detener y limpiar volúmenes
docker-compose -f docker-compose-qa.yml down -v
```

### Validación de NGINX

```bash
# Verificar sintaxis
docker exec sged-nginx-qa nginx -t

# Ver headers de seguridad
curl -I -k https://localhost/ | grep -E "Strict-Transport|X-Content-Type|CSP"

# Test de rate limiting
for i in {1..50}; do curl -s https://localhost/api/v1/auth/login -d '{}'; done
# Debe devolver 429 después de 5 req/s

# Test de redirección HTTP → HTTPS
curl -I http://localhost/
# Debe devolver: 301 Moved Permanently
```

### Certificados TLS

```bash
# Generar autofirmado (QA)
openssl req -x509 -newkey rsa:4096 \
  -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt \
  -days 365 -nodes \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"

# Verificar certificado
openssl x509 -in nginx/certs/certificate.crt -text -noout

# Verificar expiración
openssl x509 -in nginx/certs/certificate.crt -noout -dates
```

### Secretos y Variables de Entorno

```bash
# Crear .env local (copia de .env.example)
cp .env.example .env.local

# Editar con valores reales
vi .env.local

# Usar con docker-compose
docker-compose --env-file .env.local -f docker-compose-qa.yml up -d

# Verificar variables en contenedor
docker exec sged-backend-qa env | grep DB_
```

---

## Configuración de Entornos

### Desarrollo (local)

**Archivo**: `.env.local` (NO comitear)

```bash
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:h2:mem:sged
DB_USER=sa
DB_PASSWORD=
JWT_SECRET=dev-secret
DOCUMENTOS_BASE_PATH=/tmp/sged
LOGGING_LEVEL_COM_OJ_SGED=DEBUG
```

**Comando**: 
```bash
docker-compose -f docker-compose-qa.yml up -d
```

### QA

**Archivo**: `.env.qa` (en GitHub Secrets o Vault)

```bash
SPRING_PROFILES_ACTIVE=qa
DB_URL=jdbc:oracle:thin:@sged-db:1521/SGED
DB_USER=sged_qa
DB_PASSWORD=${VAULT_DB_PASSWORD}
JWT_SECRET=${VAULT_JWT_SECRET}
DOCUMENTOS_BASE_PATH=/data/documentos
LOGGING_LEVEL_COM_OJ_SGED=INFO
```

**Comando**:
```bash
docker-compose -f docker-compose-qa.yml up -d
```

### Producción

**Archivo**: `.env.prod` (Vault/GitHub Secrets)

```bash
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:oracle:thin:@oracle.sged.internal:1521/SGED
DB_USER=sged_prod
DB_PASSWORD=${VAULT_DB_PASSWORD}
JWT_SECRET=${VAULT_JWT_SECRET}
DOCUMENTOS_BASE_PATH=/mnt/sged/documentos
LOGGING_LEVEL_COM_OJ_SGED=INFO
```

**Comando**:
```bash
docker-compose -f docker-compose-prod.yml up -d
```

---

## Seguridad

### HTTPS Obligatorio

- HTTP (80) → redirección 301 a HTTPS (443)
- Certificado TLS válido (autofirmado para QA, Let's Encrypt para Prod)
- TLS 1.2+ obligatorio
- Ciphers fuertes (no 3DES, RC4, etc.)

### Headers de Seguridad

Añadidos automáticamente por NGINX:
- `Strict-Transport-Security`: HSTS 1 año
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`: Restrictiva
- `Referrer-Policy`: no-referrer-when-downgrade
- `Permissions-Policy`: Desactiva geo/micrófono/cámara

### Rate Limiting

- API general: 10 req/s (burst 20)
- Auth endpoints: 5 req/s (burst 5)
- Documentos: 3 req/s (burst 3)

Protege contra DDoS y fuerza bruta.

### Gestión de Secretos

**Nunca comitear**:
- `.env` (excepto `.env.example`)
- Claves privadas de TLS
- Credenciales de BD
- JWT secrets

**Almacenar en**:
- GitHub Secrets (CI/CD)
- HashiCorp Vault (Producción)
- AWS Secrets Manager (si AWS)

Ver `SECRETS_MANAGEMENT.md` para detalles.

---

## CI/CD en GitHub Actions

### Workflow: `.github/workflows/ci.yml`

**Triggers**: push a develop/main, PRs

**Jobs**:
1. **codeql-analysis**: Análisis de seguridad (SAST)
   - Java: detecta SQL injection, buffer overflow, etc.
   - TypeScript: detecta XSS, inyecciones, etc.
   - Reporta en GitHub Security tab

2. **backend-tests**: Tests unitarios + cobertura
   - `./mvnw verify -Ptest-coverage`
   - JaCoCo report

3. **frontend-tests**: Tests unitarios
   - `npm ci && npm test -- --watch=false --browsers=ChromeHeadless`

4. **build-docker-images**: Build de imágenes Docker
   - Backend: `sged-backend:latest`
   - Frontend: `sged-frontend:latest`

5. **deploy-qa**: Despliegue a QA (en develop)
   - Ejecuta en servidor QA

6. **dast-zap-scan**: Escaneo dinámico (OWASP ZAP)
   - Nightly o manual
   - Detecta vulnerabilidades en endpoints

---

## Monitoreo y Logs

### Logs locales

```bash
# NGINX
docker logs sged-nginx-qa | tail -100

# Backend
docker logs sged-backend-qa | tail -100

# BD
docker logs sged-db-qa | tail -100
```

### Logs centralizados (Producción)

Configurado en `docker-compose-prod.yml`:
- **CloudWatch** (AWS): `/sged/nginx`, `/sged/backend`, `/sged/database`
- **Splunk**: `splunk-token` + `splunk-url`

### Monitoreo de recursos

```bash
# Ver CPU/Memoria en tiempo real
docker stats
```

---

## Troubleshooting

### NGINX no responde (502 Bad Gateway)

```bash
# 1. Verificar estado del backend
docker-compose ps sged-backend
# Debe estar "Up (healthy)"

# 2. Ver logs de NGINX
docker logs sged-nginx-qa | grep upstream

# 3. Test conectividad
docker exec sged-nginx-qa curl http://sged-backend:8080/health

# 4. Reiniciar backend
docker-compose restart sged-backend
```

### Base de datos timeout

```bash
# 1. Verificar estado de BD
docker-compose ps sged-db
# Debe estar "Up (healthy)"

# 2. Ver logs de BD
docker logs sged-db-qa | tail -50

# 3. Verificar variables de conexión
docker exec sged-backend-qa env | grep DB_

# 4. Reiniciar BD
docker-compose restart sged-db
```

### HTTPS no funciona (ERR_SSL_PROTOCOL_ERROR)

```bash
# 1. Verificar certificado
docker exec sged-nginx-qa ls -la /etc/nginx/certs/

# 2. Validar certificado
openssl x509 -in nginx/certs/certificate.crt -text -noout

# 3. Ver errores SSL
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

---

## Documentación Relacionada

- **[NGINX_SECURITY_GUIDE.md](NGINX_SECURITY_GUIDE.md)**: Configuración TLS, headers, rate limiting
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**: Guía paso a paso para desplegar
- **[SECRETS_MANAGEMENT.md](SECRETS_MANAGEMENT.md)**: Gestión de credenciales
- **[FASE_6_INFORME_EJECUTIVO.md](FASE_6_INFORME_EJECUTIVO.md)**: Resumen de Fase 6

---

## Contacto

**DevOps Lead**: devops@example.com
**SecOps**: security@example.com
**Escalación 24/7**: devops-oncall@example.com

---

**Mantenedor**: Agente DevOps/Infraestructura
**Última actualización**: Enero 2026
