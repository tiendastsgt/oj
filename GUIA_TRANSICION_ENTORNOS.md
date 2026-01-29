# Guía de Transición: Dev → QA → Producción

**Propósito**: Documentar cómo promover cambios entre entornos de forma segura

---

## 1. Ciclo de Desarrollo

### Desarrollo Local (Dev)

```bash
# Setup inicial
git clone https://github.com/organismo-judicial/sged.git
cd sged

# Crear .env local (copia de .env.example)
cp .env.example .env.local

# Editar valores locales
vi .env.local
# Incluir:
# - H2 en memoria o Oracle local
# - JWT secret simple
# - Rutas locales para documentos

# Backend: ejecutar localmente (sin Docker)
cd sGED-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend: en otra terminal
cd sGED-frontend
npm start  # ng serve en puerto 4200

# Navegador: http://localhost:4200
```

### Pruebas Unitarias (Dev)

```bash
# Backend
cd sGED-backend
./mvnw test -Ptest-coverage

# Frontend
cd sGED-frontend
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

### Validación Local

```bash
# API local responde
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Frontend compila sin warnings
npm run build -- --aot
```

---

## 2. Promoción a QA

### Pre-requisitos

- [ ] Todos los tests pasan
- [ ] Code coverage > 70% (backend), > 60% (frontend)
- [ ] CodeQL analysis sin high/critical findings
- [ ] PR revisado y aprobado
- [ ] Merge a `develop` completado

### Proceso de Promoción

```bash
# 1. En desarrollo local, asegurar que develop está actualizado
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/xyz-description

# 3. Implementar cambios, commit, push
git add .
git commit -m "feat: descripcion del cambio"
git push origin feature/xyz-description

# 4. GitHub crea PR automáticamente
# → GitHub Actions ejecuta CI (tests + CodeQL + build Docker)
# → PR review por equipo
# → Merge a develop

# 5. GitHub Actions dispara deploy a QA
# → Descarga latest images
# → Despliega con docker-compose-qa.yml
# → Ejecuta smoke tests
```

### Verificación en QA

```bash
# SSH a servidor QA
ssh qa-deployer@sged-qa.example.com

# Ver logs
docker-compose -f docker-compose-qa.yml logs -f

# Validar API
curl -k https://sged-qa.example.com/health

# Ejecutar tests de integración
curl -k -X POST https://sged-qa.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Pruebas de QA

```bash
# Testing manual (Selenium, Cypress, o manual)
# - Login
# - Crear expediente
# - Buscar expediente
# - Upload documento
# - Descargar documento

# Testing de seguridad
# - Verificar HTTPS
curl -I https://sged-qa.example.com/
# - Rate limiting
for i in {1..20}; do curl -s https://sged-qa.example.com/api/v1/auth/login -d '{}'; done
# - Headers de seguridad
curl -I https://sged-qa.example.com/ | grep -E "Strict-Transport|CSP"

# Performance testing
# - Load test (Apache JMeter, k6)
# - Verificar respuesta < 200ms
```

### Duración estimada en QA

- **Smoke tests**: 15 minutos
- **Testing manual**: 2-4 horas
- **Security testing**: 1 hora
- **Performance testing**: 1 hora

**Total**: 4-7 horas antes de promover a Prod

---

## 3. Promoción a Producción

### Pre-requisitos

- [ ] QA sign-off completado
- [ ] Security review aprobado
- [ ] DBA backup creado
- [ ] Runbook de rollback listo
- [ ] Change request aprobado

### Preparación

```bash
# 1. Crear rama de release
git checkout -b release/v1.0.0

# 2. Actualizar version en pom.xml, package.json
# - Backend: <version>1.0.0</version>
# - Frontend: "version": "1.0.0"

# 3. Update CHANGELOG
vi CHANGELOG.md
# - Listar features, bugs, security fixes

# 4. Commit
git commit -m "chore: release v1.0.0"
git push origin release/v1.0.0

# 5. GitHub crea PR a main
# → Code review
# → CodeQL confirmation
# → Merge a main

# 6. GitHub Actions crea tag y release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Proceso de Despliegue a Producción

```bash
# 1. Obtener certificado TLS (si es nuevo)
sudo certbot certonly --standalone -d sged.example.com \
  --email admin@example.com

# 2. Recuperar secretos desde Vault
VAULT_TOKEN=$(vault login -method=oidc)
VAULT_ADDR=https://vault.sged.internal

DB_PASSWORD=$(vault kv get -field=password sged/prod/database)
JWT_SECRET=$(vault kv get -field=secret sged/prod/jwt)

# 3. Crear .env.prod
cat > .env.prod << EOF
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:oracle:thin:@oracle.sged.internal:1521/SGED
DB_USER=sged_prod
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
DOCUMENTOS_BASE_PATH=/mnt/sged/documentos
EOF

# 4. Backup de BD (antes de despliegue)
docker exec sged-db-prod sqlplus -s sys/as sysdba << EOF
CREATE RESTORE POINT pre_deployment_v1_0_0;
BACKUP DATABASE PLUS ARCHIVELOG;
EXIT;
EOF

# 5. Backup de documentos
rsync -av /mnt/sged/documentos /backup/documentos-v1.0.0/

# 6. Detener servicios
docker-compose -f docker-compose-prod.yml down

# 7. Actualizar imágenes
docker-compose -f docker-compose-prod.yml pull

# 8. Levantar nuevas versiones
docker-compose -f docker-compose-prod.yml up -d

# 9. Esperar health checks
sleep 60
docker-compose -f docker-compose-prod.yml ps
# Todos deben estar "Up (healthy)"
```

### Validación en Producción

```bash
# 1. Health check
curl https://sged.example.com/health

# 2. Funcionalidad crítica
TOKEN=$(curl -X POST https://sged.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" https://sged.example.com/api/v1/expedientes

# 3. Headers de seguridad
curl -I https://sged.example.com/ | grep -E "Strict-Transport|X-Frame"

# 4. Logs sin errores
docker logs sged-backend-prod | grep ERROR | wc -l
# Debe ser 0 o muy bajo

# 5. Monitoreo
# - CPU, memoria
# - Número de conexiones DB
# - Requests por segundo
docker stats
```

### Duración estimada en Prod

- **Backup**: 15 minutos
- **Downtime**: 5-10 minutos
- **Health checks**: 5 minutos
- **Validación funcional**: 15 minutos
- **Estabilización**: 30 minutos

**Ventana de mantenimiento total**: 1-2 horas

---

## 4. Rollback de Emergencia

### Escenario: Bug en Producción

```bash
# 1. Evaluar impacto
# - ¿Afecta a usuarios?
# - ¿Pérdida de datos?
# - ¿Seguridad comprometida?

# 2. Si es crítico, iniciar rollback
docker-compose -f docker-compose-prod.yml down

# 3. Restaurar versión anterior en docker-compose-prod.yml
# - Cambiar tag: latest → v0.9.9

# 4. Levantar versión anterior
docker-compose -f docker-compose-prod.yml up -d

# 5. Validar
curl https://sged.example.com/health

# 6. Si BD fue afectada, restore
docker exec sged-db-prod sqlplus -s sys/as sysdba << EOF
RESTORE DATABASE FROM RESTORE POINT pre_deployment_v1_0_0;
EXIT;
EOF

# 7. Reiniciar backend
docker-compose -f docker-compose-prod.yml restart sged-backend

# 8. Notificar a equipo
echo "Rollback completado a v0.9.9" | mail -s "SGED Prod Rollback" team@example.com
```

### Prevención: Testing en QA

```bash
# Ejecutar tests de regresión completos
# - Smoke tests: 15 min
# - API integration tests: 30 min
# - Security tests: 15 min
# - Performance tests: 30 min
# - Browser tests: 1 hora

# Solo si todo pasa, promover a Prod
```

---

## 5. Matriz de Cambio por Entorno

| Aspecto | Dev | QA | Prod |
|---------|-----|----|----|
| **Certificado** | Self-signed | Self-signed | Let's Encrypt |
| **BD** | H2 memoria | Oracle test | Oracle real |
| **Storage** | `/tmp/sged` | `/data/sged` | NFS `/mnt/sged` |
| **Secretos** | Hardcoded | GitHub/Vault | Vault |
| **Logging** | stdout | Local files | CloudWatch/Splunk |
| **Rate Limit** | Desactivo | 10 req/s | 10 req/s |
| **Health Check** | Loose | Strict | Strict |
| **Rollback** | git revert | docker image | restore point |

---

## 6. Ventanas de Cambio

### Política de despliegue

- **Desarrollo**: Continuo (cualquier hora)
- **QA**: Lun-Vie 9-17 (coordinado con testing)
- **Producción**: Lun-Jue 14-16 UTC (fuera de horas pico)
  - NO en viernes (riesgo de fin de semana)
  - NO en días feriados

### Comunicación de cambio

```bash
# 1. Anuncio previo (48h antes)
Asunto: [CHANGE] SGED Prod Deployment v1.0.0
Hora: 2026-02-01 14:00 UTC (2 horas de ventana)
Componentes: Backend v1.0.0 + Frontend v1.0.0
Cambios: [listar features principales]
Rollback: Si hay problema, versión v0.9.9 disponible

# 2. Actualización en vivo
14:00 - Inicio
14:10 - Backup DB + documentos
14:20 - Deploy nuevas imágenes
14:25 - Health checks
14:30 - Validación funcional
14:45 - Cierre de ventana
16:00 - Fin de monitoreo intenso

# 3. Retrospectiva (1 día después)
- ¿Problemas?
- ¿Lecciones aprendidas?
- ¿Mejorar runbook?
```

---

## 7. Checklist de Transición

### Dev → QA

```
Antes del merge a develop:
- [ ] Tests unitarios pasan
- [ ] Code coverage aceptable
- [ ] Code review aprobado
- [ ] CodeQL sin high/critical
- [ ] No hardcoded secrets

Después del deploy a QA:
- [ ] Health check OK
- [ ] Smoke tests pasan
- [ ] Headers de seguridad OK
- [ ] Rate limiting funciona
- [ ] Logs sin errores
- [ ] Testing manual completado
```

### QA → Prod

```
Antes del merge a main:
- [ ] QA sign-off
- [ ] Security review
- [ ] Performance tests OK
- [ ] Release notes creadas
- [ ] Rollback plan documentado
- [ ] DBA backup completado
- [ ] Change request aprobado

Durante el deploy:
- [ ] Certificados válidos
- [ ] Secretos recuperados de Vault
- [ ] BD backup creado
- [ ] Servicios en "Up (healthy)"
- [ ] Health checks pasan
- [ ] Funcionalidad crítica validada
- [ ] Equipo monitoreando

Después del deploy:
- [ ] 1 hora monitoreo intenso
- [ ] 24h monitoreo normal
- [ ] Retrospectiva en 1 día
```

---

## 8. Contactos de Escalación

| Nivel | Descripción | Contacto | Teléfono |
|-------|-------------|----------|----------|
| 1 | DevOps on-call | devops-oncall@example.com | +503-xxxx-xxxx |
| 2 | DBA on-call | dba-oncall@example.com | +503-xxxx-xxxx |
| 3 | Security | security@example.com | +503-xxxx-xxxx |
| 4 | Manager | manager@example.com | +503-xxxx-xxxx |

---

## 9. Automatización Futura

```bash
# GitOps con ArgoCD (si Kubernetes)
# - git push → GitHub Actions → merge a develop/main
# - ArgoCD despliega automáticamente a QA/Prod
# - Rollback con git revert

# CI/CD mejorado
# - Tests de seguridad automáticos
# - Performance benchmarks
# - Canary deployments (10% → 100%)
# - Blue/green deployments
```

---

**Última actualización**: Enero 2026
**Mantenedor**: Equipo DevOps/Infraestructura
