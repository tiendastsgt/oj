---
Documento: SECRETS_MANAGEMENT
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# Secrets Management - SGED Fase 6

## Principios

1. **Nunca commitar secretos** en el repo (git, GitHub)
2. **Separar por entorno**: dev ≠ qa ≠ prod
3. **Rotación periódica**: JWT keys, DB passwords cada 90 días
4. **Auditar acceso**: Solo DevOps/SecOps pueden ver/modificar
5. **Usar secretos managers**: GitHub Secrets, HashiCorp Vault, AWS Secrets Manager

---

## 1. Secretos del Proyecto SGED

### Lista de secretos por tipo

| Secret | Entorno | Rotación | Almacenamiento |
|--------|---------|----------|-----------------|
| **JWT_SECRET** | dev,qa,prod | 90 días | GitHub Secrets + Vault |
| **DB_USER** | dev,qa,prod | Anual | Vault (no GitHub) |
| **DB_PASSWORD** | dev,qa,prod | 60 días | Vault (no GitHub) |
| **ORACLE_PWD** | qa,prod | Anual | Vault (container secret) |
| **SGT_V1_API_KEY** | qa,prod | 180 días | Vault |
| **SGT_V1_USERNAME** | qa,prod | N/A | Vault |
| **SGT_V2_API_KEY** | qa,prod | 180 días | Vault |
| **SGT_V2_USERNAME** | qa,prod | N/A | Vault |
| **DOCKER_REGISTRY** | all | N/A | GitHub Secrets |
| **DOCKER_USERNAME** | all | Anual | GitHub Secrets |
| **DOCKER_PASSWORD** | all | Anual | GitHub Secrets (token PAT) |

---

## 2. GitHub Secrets (CI/CD)

### Configurar en GitHub Actions

**Navegación**: Repo → Settings → Secrets and variables → Actions

### Crear secrets (ejemplo)

```bash
# En GitHub UI o GitHub CLI
gh secret set JWT_SECRET --body "$(openssl rand -base64 32)"
gh secret set DB_USER --body "sged_qa"
gh secret set DB_PASSWORD --body "$(openssl rand -base64 16)"
gh secret set DOCKER_USERNAME --body "your-username"
gh secret set DOCKER_PASSWORD --body "your-token"
```

### Usar en workflow

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: |
          docker-compose -f docker-compose-qa.yml up -d
```

### Protecciones

- [ ] Requerir aprobación para secretos en PRs
- [ ] No mostrar en logs de GitHub Actions
- [ ] Limitar a ramas específicas (main, develop)

---

## 3. HashiCorp Vault (Recomendado para Prod)

### Instalación (local/lab)

```bash
# Descargar Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin

# Iniciar servidor en modo dev (NO para producción)
vault server -dev
```

### Configurar secretos

```bash
# Crear motor de secretos KV
vault secrets enable -path=sged kv-v2

# Guardar secreto
vault kv put sged/backend/jwt \
  secret="$(openssl rand -base64 32)" \
  expiration-ms=28800000

vault kv put sged/database \
  username="sged_prod" \
  password="$(openssl rand -base64 16)"

vault kv put sged/sgt-v1 \
  api_key="xxx" \
  username="sgt_user"

# Leer secreto
vault kv get sged/backend/jwt
vault kv list sged
```

### Acceso desde aplicación

#### Backend (Spring Boot)

```yaml
# application-prod.yml
spring:
  cloud:
    vault:
      host: vault.sged.internal
      port: 8200
      scheme: https
      authentication: KUBERNETES
      kv-version: 2

jwt:
  secret: ${spring.cloud.vault.kv-version:jwt-secret}
```

#### NGINX/Docker

```bash
# Script para obtener secretos de Vault
#!/bin/bash
VAULT_ADDR="https://vault.sged.internal:8200"
VAULT_TOKEN=$(cat /run/secrets/vault_token)

# Obtener JWT secret
JWT_SECRET=$(curl -s \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  "$VAULT_ADDR/v1/sged/data/backend/jwt" | jq -r '.data.data.secret')

# Exportar para aplicación
export JWT_SECRET
```

---

## 4. AWS Secrets Manager (CloudFormation/IaC)

### Crear secreto

```bash
aws secretsmanager create-secret \
  --name sged/backend/jwt \
  --description "JWT secret for SGED backend" \
  --secret-string "$(openssl rand -base64 32)"

aws secretsmanager create-secret \
  --name sged/database \
  --description "Database credentials" \
  --secret-string '{
    "username": "sged_prod",
    "password": "'"$(openssl rand -base64 16)"'",
    "host": "sged-db.internal",
    "port": 1521,
    "database": "SGED"
  }'
```

### Usar en ECS/Lambda

```yaml
# docker-compose.yml con AWS Secrets
services:
  sged-backend:
    environment:
      JWT_SECRET: arn:aws:secretsmanager:us-east-1:123456789:secret:sged/backend/jwt
```

### Rotar secreto automáticamente

```python
# Lambda para rotación automática
import boto3
import secrets
import string

def lambda_handler(event, context):
    client = boto3.client('secretsmanager')
    
    # Generar nueva contraseña
    new_password = ''.join(
        secrets.choice(string.ascii_letters + string.digits) 
        for i in range(32)
    )
    
    # Actualizar secreto
    client.update-secret(
        SecretId='sged/database',
        SecretString=json.dumps({
            'username': 'sged_prod',
            'password': new_password
        })
    )
    
    return {'statusCode': 200, 'message': 'Secret rotated'}
```

---

## 5. Variables de Entorno (.env)

### Plantilla .env (desarrollo local)

**archivo**: `.env.example` (comitear)

```bash
# Database
DB_URL=jdbc:oracle:thin:@localhost:1521/SGED
DB_USER=sged
DB_PASSWORD=change-me-in-local-dev

# JWT
JWT_SECRET=my-super-secret-key-256-bits-minimum
JWT_EXPIRATION_MS=28800000

# Storage
DOCUMENTOS_BASE_PATH=/tmp/sged/documentos

# SGT
SGT_V1_USERNAME=sgt_user
SGT_V1_API_KEY=change-me
SGT_V2_USERNAME=sgt_user
SGT_V2_API_KEY=change-me

# Logging
LOGGING_LEVEL_COM_OJ_SGED=DEBUG
```

**archivo**: `.env` (NO comitear - solo local)

```bash
# Copiar desde .env.example
cp .env.example .env

# Editar con valores reales (locales)
DB_PASSWORD=mi-contraseña-local
JWT_SECRET=mi-jwt-secreto-local
```

### Docker Compose usa .env

```bash
# Leer variables desde .env
docker-compose -f docker-compose-qa.yml up -d

# O especificar env file
docker-compose --env-file .env.qa up -d
```

---

## 6. Archivo .env por Entorno

### Estructura

```
.
├── .env.example          ← Plantilla (comitear)
├── .env.local            ← Dev (NO comitear)
├── .env.qa               ← QA (en Vault/GitHub Secrets)
├── .env.prod             ← Prod (en Vault/GitHub Secrets)
└── .gitignore            ← Excluir .env.*
```

### .gitignore

```bash
# Secretos
.env
.env.local
.env.qa
.env.prod
.env.*.local

# No commitir certificados privados
nginx/certs/private.key
nginx/certs/*.key

# Credenciales de Docker
.docker/
~/.docker
```

---

## 7. Rotación de Secretos

### Script de rotación (ejemplo)

```bash
#!/bin/bash
# rotate-secrets.sh

set -e

ENVIRONMENT=$1  # dev, qa, prod
VAULT_ADDR="https://vault.sged.internal:8200"

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: $0 {dev|qa|prod}"
  exit 1
fi

# Generar nuevo JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Generar nueva contraseña DB
NEW_DB_PASSWORD=$(openssl rand -base64 16)

# Guardar en Vault
vault kv put sged/$ENVIRONMENT/jwt \
  secret="$NEW_JWT_SECRET" \
  rotated="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

vault kv put sged/$ENVIRONMENT/database \
  password="$NEW_DB_PASSWORD" \
  rotated="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Notificar a equipo DevOps
echo "✓ Secrets rotated for $ENVIRONMENT"
echo "✓ JWT secret updated in Vault"
echo "✓ DB password updated in Vault"
echo ""
echo "NEXT STEPS:"
echo "1. Update application configuration in Docker/K8s"
echo "2. Deploy new version with updated secrets"
echo "3. Verify health check: curl -k https://sged-$ENVIRONMENT.example.com/health"

# Auditar
vault audit list
vault audit logs --path=file/
```

### Cron para rotación automática

```bash
# Rotación mensual (1er día del mes, 2 AM UTC)
0 2 1 * * /usr/local/bin/rotate-secrets.sh prod >> /var/log/rotate-secrets.log 2>&1
```

---

## 8. Auditoría de Secretos

### Historial de cambios (Vault)

```bash
# Listar versiones de secreto
vault kv metadata get sged/backend/jwt

# Ver changelog
vault kv metadata list sged/

# Buscar quién accedió qué
vault audit list
vault read sys/audit
```

### Logs (Vault)

```bash
# Configurar audit logging a archivo
vault audit enable file file_path=/var/log/vault-audit.log

# Tail audit log
tail -f /var/log/vault-audit.log | jq '.request | {path, operation, auth}'
```

---

## 9. Checklist de Seguridad

- [ ] No hay secretos en .git (git secrets --install)
- [ ] .env no está comiteado (.gitignore)
- [ ] GitHub Secrets configurados (JWT, DB, Docker)
- [ ] Vault/secretos manager en producción
- [ ] Rotación automática de credenciales cada 60-90 días
- [ ] Acceso limitado a secretos (RBAC)
- [ ] Auditoría habilitada (logs de quién accedió qué)
- [ ] Alertas si secreto se revela en logs/stdout
- [ ] Certificados TLS en /run/secrets (no /etc/nginx/certs)
- [ ] Secretos nunca en Dockerfile COPY (usar secrets de Docker/K8s)

---

## 10. Herramientas útiles

```bash
# Detectar secretos en git
pip install git-secrets
git secrets --install
git secrets --register-aws
git secrets --scan

# Validar YAML (secretos no expuestos)
yamllint docker-compose-prod.yml

# Escanear contenedor por secretos
docker run --rm -i hadolint/hadolint < sGED-backend/Dockerfile

# Verificar permisos de archivo
ls -la nginx/certs/private.key
# Debe ser: -rw------- (600) para que solo nginx pueda leerlo
```

---

**Mantenedor**: Equipo DevOps/Infraestructura
**Última actualización**: Enero 2026
