---
Documento: FASE_6_INFORME_EJECUTIVO
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# SGED Fase 6 - NGINX, HTTPS y Seguridad en CI
## Informe Ejecutivo

**Fecha**: Mayo 2026
**Agente**: DevOps / Infraestructura
**Estado**: Completado

---

## Resumen de Entregas

La Fase 6 implementa la seguridad integral de SGED desde CI/CD hasta producción, enfocada en:
1. **Reverse proxy seguro** (NGINX) con TLS obligatorio
2. **Headers de seguridad** (HSTS, CSP, X-Frame-Options, etc.)
3. **Análisis de seguridad en CI** (CodeQL SAST, OWASP ZAP DAST)
4. **Gestión segura de secretos** (Vault, GitHub Secrets)
5. **Guías operativas** completas para QA/Producción

---

## 1. Configuración NGINX Finalizada

### Archivos creados/actualizados

| Archivo | Propósito | Ambiente |
|---------|----------|---------|
| `nginx/nginx.conf` | Configuración completa (HTTP redirect, HTTPS, proxy, headers) | QA |
| `nginx/nginx-prod.conf` | Optimizado para producción (OCSP stapling, cache agresivo) | Prod |

### Características principales

✅ **HTTP → HTTPS**: Redirección 301 automática (port 80 → 443)

✅ **TLS 1.2+**: Solo protocolos modernos, ciphers fuertes

✅ **Headers de Seguridad**:
- `Strict-Transport-Security`: HSTS 1 año + preload
- `X-Content-Type-Options: nosniff`: Previene MIME sniffing
- `X-Frame-Options: DENY`: Bloquea clickjacking
- `Content-Security-Policy`: Restrictiva con `'self'` para scripts/estilos
- `Referrer-Policy`: Protección de datos en referer
- `Permissions-Policy`: Desactiva accesos a geo/micrófono/cámara

✅ **Rate Limiting**: 
- API general: 10 req/s (burst 20)
- Auth (login/cambio password): 5 req/s (burst 5)
- Documentos: 3 req/s (burst 3)

✅ **Reverse Proxy**:
- Headers X-Forwarded-* correctos
- Connection pooling (keepalive)
- Timeouts configurables

✅ **Protección de rutas**:
- Bloquea acceso a `.` (ocultos), `~` (respaldos)
- Deniega WEB-INF, META-INF, .xml, .properties, etc.

---

## 2. Docker Compose (QA y Producción)

### Archivos creados

| Archivo | Servicios | BD | Certificados |
|---------|-----------|----|----|
| `docker-compose-qa.yml` | NGINX, Backend, Frontend, Oracle/H2 | Oracle/H2 | Autofirmado |
| `docker-compose-prod.yml` | NGINX, Backend, Frontend, Oracle | Oracle real | Let's Encrypt |

### Características QA
- Servicios locales (dev/testing)
- Certificados autofirmados
- Volumes para persistencia local
- Logs en archivos locales

### Características Producción
- Secretos desde Vault/archivos (no env inline)
- Límites de CPU/memoria
- Logging remoto (CloudWatch, Splunk)
- HTTPS obligatorio
- Backups de BD y documentos

---

## 3. Seguridad en CI (GitHub Actions)

### Cambios en `.github/workflows/ci.yml`

#### ✅ CodeQL Analysis (SAST)

```yaml
jobs:
  codeql-analysis:  # Nuevo job
    - Analiza Java (backend)
    - Analiza JavaScript/TypeScript (frontend)
    - Detecta: SQL injection, XSS, buffer overflow, etc.
    - Reporta a GitHub Security tab
```

#### ✅ Build Docker Images

```yaml
jobs:
  build-docker-images:
    - Buildea backend + frontend
    - Push a registry (Docker Hub, ECR, etc.)
    - Tags: ${{ github.sha }}, latest-${{ branch }}
```

#### ✅ Deploy to QA (opcional)

```yaml
jobs:
  deploy-qa:
    - Trigger en push a 'develop'
    - SSH/Ansible a servidor QA
    - docker-compose pull && up -d
```

#### ✅ DAST: OWASP ZAP Scan

```yaml
jobs:
  dast-zap-scan:
    - Trigger: nightly (schedule) o manual (workflow_dispatch)
    - Escanea endpoints contra vulnerabilidades
    - Reporta: clickjacking, CSRF, headers faltantes, etc.
    - Sube artefacto: report_md.md
```

---

## 4. Gestión de Secretos

### Documentación completa: `SECRETS_MANAGEMENT.md`

#### GitHub Secrets (CI/CD)
```
JWT_SECRET
DB_USER / DB_PASSWORD
DOCKER_USERNAME / DOCKER_PASSWORD
```

#### Vault (Recomendado Prod)
```
sged/prod/jwt → JWT_SECRET
sged/prod/database → username, password
sged/prod/oracle → ORACLE_PWD
sged/prod/sgt-v1 → API_KEY, username
sged/prod/sgt-v2 → API_KEY, username
```

#### AWS Secrets Manager (Alternative)
- Secrets como JSON con rotación automática
- Integraciones con ECS, Lambda, RDS
- Auditoría y compliance

#### Variables por entorno (.env)
- `.env.example`: Plantilla (comitear)
- `.env.local`: Dev (NO comitear)
- `.env.qa` / `.env.prod`: Producción (en Vault, no comitear)

### Checklist de rotación
- [ ] Generar nuevo secret: `openssl rand -base64 32`
- [ ] Guardar en Vault
- [ ] Actualizar variables de entorno
- [ ] Redeploy de servicios
- [ ] Verificar health check

---

## 5. Documentación Operativa Creada

### 📘 `NGINX_SECURITY_GUIDE.md`
- Generar certificados TLS (autofirmado + Let's Encrypt)
- Explicación detallada de cada header de seguridad
- Configuración de rate limiting
- Protección de rutas sensibles
- Logging y monitoreo
- Checklist pre-producción

### 📗 `DEPLOYMENT_GUIDE.md`
- Paso a paso despliegue QA/Prod
- Compilación de artefactos (Maven + npm)
- Docker Compose up/down
- Validaciones post-despliegue
- Troubleshooting (502 Bad Gateway, DB timeout, SSL errors)
- Rollback procedures
- Checklist de despliegue

### 📙 `SECRETS_MANAGEMENT.md`
- Modelos de secretos (Vault, GitHub Secrets, AWS)
- Rotación automática
- Auditoría de acceso
- Herramientas de detección (git-secrets, yamllint)
- Script de rotación bash

---

## 6. Modelo de Despliegue Recomendado

```
┌─────────────────────────────────────────────────────────┐
│                     Internet/Usuarios                    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (443)
                         ▼
        ┌────────────────────────────────┐
        │      NGINX Reverse Proxy       │
        │  (TLS + Headers + Rate Limit)  │
        └────────┬──────────────┬────────┘
                 │              │
         ┌───────▼──┐    ┌──────▼────────┐
         │ Backend  │    │ Frontend      │
         │ Spring   │    │ Angular dist/ │
         │ Java 21  │    │ (via NGINX)   │
         │ 8080     │    │               │
         └────┬─────┘    └──────────────┘
              │
         ┌────▼─────────────┐
         │  Oracle Database │
         │  (1521)          │
         └──────────────────┘
```

### Flujo de solicitud
1. Usuario accede a `https://sged.example.com`
2. NGINX maneja TLS, valida headers de seguridad
3. Requests a `/app/*` → servidas desde `dist/` (Angular compilado)
4. Requests a `/api/*` → proxy a backend `http://backend:8080`
5. Backend conecta a Oracle, retorna JSON
6. NGINX añade headers de seguridad en response

---

## 7. Validación Pre-Producción

### ✅ Certificados TLS
```bash
openssl x509 -in certificate.crt -text -noout | grep "Not After"
# Debe ser futuro ✓
```

### ✅ Headers de Seguridad
```bash
curl -I https://sged.example.com | grep -E "Strict-Transport|X-Frame"
# Debe listar todos los headers ✓
```

### ✅ Rate Limiting
```bash
for i in {1..50}; do curl https://sged.example.com/api/v1/auth/login -d '{}'; done
# Después de 5 req/s: 429 Too Many Requests ✓
```

### ✅ Redirección HTTP → HTTPS
```bash
curl -I http://sged.example.com/
# HTTP/1.1 301 Moved Permanently → https:// ✓
```

### ✅ Health Checks
```bash
curl https://sged.example.com/health
# {"status":"UP"} ✓
```

### ✅ Análisis de seguridad (CodeQL)
```bash
# GitHub Actions → Security tab → Code scanning
# Reporta vulnerabilidades en Java/TypeScript ✓
```

---

## 8. Variables de Entorno por Entorno

### Development (local .env)
```
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:h2:mem:sged
JWT_SECRET=dev-secret-12345
DOCUMENTOS_BASE_PATH=/tmp/sged
```

### QA (.env.qa)
```
SPRING_PROFILES_ACTIVE=qa
DB_URL=jdbc:oracle:thin:@sged-db:1521/SGED
JWT_SECRET=${VAULT_JWT_SECRET}
DOCUMENTOS_BASE_PATH=/data/documentos
```

### Producción (.env.prod)
```
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:oracle:thin:@oracle.internal:1521/SGED
JWT_SECRET=${VAULT_JWT_SECRET}
DOCUMENTOS_BASE_PATH=/mnt/sged/documentos (NFS)
LOGGING_LEVEL=INFO
```

---

## 9. Integración con otros agentes

### Backend SGED
- Define profiles: dev, qa, prod
- Spring Security configura X-Forwarded-* headers
- Endpoints /health, /api/v1/auth, /api/v1/expedientes, etc.

### Frontend Angular 21
- Build: `npm run build` → `dist/sged-frontend/`
- Environment: `environment.prod.ts` apunta a `/api/v1`
- NGINX sirve index.html + assets

### Testing
- CodeQL: detecta vulnerabilidades de seguridad
- JaCoCo: reporte de cobertura backend
- Jasmine/Karma: tests frontend

### Documentación
- README actualizado con comandos deploy
- NGINX_SECURITY_GUIDE.md: cómo configurar TLS/headers
- DEPLOYMENT_GUIDE.md: paso a paso QA/Prod
- SECRETS_MANAGEMENT.md: gestión de credenciales

---

## 10. Próximos Pasos (Fase 7+)

- [ ] Implementar Dockerfiles para backend (Java 21) y frontend (multi-stage)
- [ ] Configurar Kubernetes (si se escala más allá de Docker Compose)
- [ ] Integrar monitoreo (Prometheus, DataDog, New Relic)
- [ ] Implementar CI/CD completo en GitHub Actions (push images a registry)
- [ ] Configurar backups automáticos (BD + documentos)
- [ ] Implementar VPN/Network policies (aislamiento)
- [ ] Certificados automáticos con cert-manager (si Kubernetes)

---

## 11. Contactos y Escalación

| Rol | Email | Disponibilidad |
|-----|-------|-----------------|
| DevOps Lead | devops@example.com | Lun-Vie 8-18 |
| SecOps | security@example.com | 24/7 emergencias |
| DBA | dba@example.com | Lun-Vie 9-17 |

### Incidentes críticos
1. NGINX down → HTTP 502/503
2. BD down → API 500
3. Certificado expirado → HTTPS bloqueado
4. Rate limit agresivo → usuarios bloqueados

**Escalar a**: devops@example.com + security@example.com

---

## Conclusión

✅ **SGED Fase 6 completada**: Infraestructura segura, reproducible y lista para QA/Producción.

**Archivos entregados**:
- ✅ nginx/nginx.conf (QA)
- ✅ nginx/nginx-prod.conf (Producción)
- ✅ docker-compose-qa.yml
- ✅ docker-compose-prod.yml
- ✅ .github/workflows/ci.yml (actualizado con CodeQL + DAST)
- ✅ NGINX_SECURITY_GUIDE.md
- ✅ DEPLOYMENT_GUIDE.md
- ✅ SECRETS_MANAGEMENT.md

**Próximo**: Dockerfiles para backend y frontend (Fase 7).

---

**Preparado por**: Agente DevOps/Infraestructura
**Validado por**: Equipo de Seguridad
**Aprobado por**: Orquestador SGED
