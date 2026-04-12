---
Documento: GUIA_SECRETS_INYECCION
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# 🔐 Guía: Inyección de Secrets en Backend SGED

## Problema

- **docker-compose-qa.yml**: Usa variables de entorno directas (`DB_PASSWORD=xxx`)
- **docker-compose-prod.yml**: Usa el patrón Docker secrets (`DB_PASSWORD_FILE=/run/secrets/db_password`)
- **Backend**: Originalmente SOLO soportaba variables directas

## Solución

Se implementó **SecretsPropertySourceLocator** - un PropertySourceLocator de Spring Boot que automáticamente detecta y carga variables `*_FILE`.

---

## 🏗️ Arquitectura Implementada

### 1. SecretsPropertySourceLocator.java
Componente Spring que:
- Lee variables de entorno terminadas en `_FILE`
- Busca archivos en `/run/secrets/` (patrón Docker)
- Carga el contenido del archivo como valor de la variable

### 2. spring.factories
Registra el locator en Spring Boot via `PropertySourceLocator` SPI:
```
org.springframework.boot.env.PropertySourceLocator=com.oj.sged.infrastructure.config.SecretsPropertySourceLocator
```

### 3. application.yml
Continúa usando las mismas variables:
```yaml
spring:
  datasource:
    password: ${DB_PASSWORD:change-me}

jwt:
  secret: ${JWT_SECRET:change-me}
```

---

## 📝 Cómo Usar

### Opción 1: Variables Directas (Desarrollo QA)

```yaml
services:
  sged-backend:
    environment:
      DB_PASSWORD: "mi-contraseña-aqui"
      JWT_SECRET: "mi-jwt-secret-aqui"
```

**Ventajas**: Simple, directo, visible en docker-compose  
**Desventajas**: Inseguro para producción, expone secrets en archivos

---

### Opción 2: Docker Secrets (Producción)

```yaml
version: '3.8'

services:
  sged-backend:
    environment:
      # El backend leerá estas variables de archivos
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

**Ventajas**: Seguro para producción, secrets nunca en docker-compose  
**Desventajas**: Requiere archivos separados

---

### Opción 3: Secrets en /run/secrets/ (Kubernetes/Vault)

```yaml
services:
  sged-backend:
    # Los secrets se montan automáticamente en /run/secrets/
    # El PropertySourceLocator los detecta y carga
    volumes:
      - /path/to/secrets/db_password:/run/secrets/db_password:ro
      - /path/to/secrets/jwt_secret:/run/secrets/jwt_secret:ro
```

El backend automáticamente:
1. Busca `/run/secrets/db_password`
2. Convierte `db_password` → `DB_PASSWORD`
3. Carga el contenido del archivo

---

## 🔄 Precedencia de Variables

El sistema respeta esta precedencia:

```
1. Variables de entorno DIRECTAS (más alta)
   DB_PASSWORD=xxx

2. Variables _FILE
   DB_PASSWORD_FILE=/run/secrets/db_password

3. Valores default en application.yml (más baja)
   ${DB_PASSWORD:change-me}
```

**Ejemplo**:
```yaml
environment:
  DB_PASSWORD: "valor-directo"
  DB_PASSWORD_FILE: /run/secrets/db_password
```

→ Se usa `DB_PASSWORD: "valor-directo"` (la variable directa gana)

---

## 🔐 Secrets Soportados

El PropertySourceLocator soporta estos secrets:

```
DB_PASSWORD        → Contraseña base de datos
DB_USER            → Usuario base de datos
JWT_SECRET         → Clave JWT
ORACLE_PASSWORD    → Password Oracle
SGT_API_KEY        → API key para sistemas externos
ENCRYPTION_KEY     → Clave de encriptación
```

---

## 📋 Ejemplo: docker-compose-prod.yml Completo

```yaml
version: '3.8'

services:
  sged-backend:
    image: sged-backend:1.1.0
    environment:
      SPRING_PROFILES_ACTIVE: prod
      
      DB_URL: jdbc:oracle:thin:@sged-db:1521/SGED
      DB_USER: sged
      DB_PASSWORD_FILE: /run/secrets/db_password
      DB_POOL_MAX: 20
      
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      JWT_EXPIRATION_MS: 28800000
      
      DOCUMENTOS_BASE_PATH: /mnt/sged/documentos
      LOGGING_LEVEL_COM_OJ_SGED: WARN
      
    secrets:
      - db_password
      - jwt_secret
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

secrets:
  db_password:
    external: true        # Gestionar en Vault/AWS Secrets Manager
  jwt_secret:
    external: true
```

---

## 🚀 Cómo Crear los Archivos de Secrets

### Linux/Mac:
```bash
# Crear directorio
mkdir -p ./secrets

# Generar contraseñas seguras
openssl rand -base64 32 > ./secrets/db_password.txt
openssl rand -base64 64 > ./secrets/jwt_secret.txt

# Ver contenido
cat ./secrets/db_password.txt
cat ./secrets/jwt_secret.txt

# Fijar permisos
chmod 600 ./secrets/db_password.txt
chmod 600 ./secrets/jwt_secret.txt
```

### Windows PowerShell:
```powershell
# Crear directorio
New-Item -ItemType Directory -Path "./secrets" -Force

# Generar contraseñas
$db_pwd = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
$jwt_secret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString() + (New-Guid).ToString()))

# Guardar
$db_pwd | Out-File -FilePath "./secrets/db_password.txt" -NoNewline
$jwt_secret | Out-File -FilePath "./secrets/jwt_secret.txt" -NoNewline

# Ver
cat ./secrets/db_password.txt
cat ./secrets/jwt_secret.txt
```

---

## ✅ Testing

### Test 1: Verificar que PropertySourceLocator se registró

```bash
docker logs sged-backend-qa 2>&1 | grep -i "PropertySourceLocator"
```

Debería ver algo como:
```
Registering PropertySourceLocator: SecretsPropertySourceLocator
```

### Test 2: Verificar que Spring cargó los secrets

```bash
# Ver las propiedades cargadas
curl -s http://localhost:8080/actuator/configprops | jq '.contexts.sged-backend.beans | .[]' | grep -i secret
```

### Test 3: Verificar database.yml resolve los secretos

```bash
curl -s http://localhost:8080/api/v1/health | jq .
```

Si responde "UP", significa que la DB se conectó con éxito usando el secret.

### Test 4: Test JWT

```bash
# Hacer login (usará JWT_SECRET)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }' | jq .
```

---

## 🔧 Logs de Debug

Si hay problemas, verificar logs:

```bash
# Ver si hay errores al leer secrets
docker logs sged-backend-qa | grep -i "secret\|file"

# Ver todas las variables de entorno cargadas
docker logs sged-backend-qa | grep -i "environment"

# Ver Spring Boot startup log
docker logs sged-backend-qa | head -100
```

---

## 📊 Comparativa: Opciones de Inyección

| Característica | Variables Directas | Variables _FILE | /run/secrets/ |
|---|---|---|---|
| **Seguridad** | ❌ Baja | ✅ Media | ✅ Alta |
| **Desarrollo** | ✅ Fácil | ⚠️ Medio | ❌ Complejo |
| **Producción** | ❌ No recomendado | ✅ Recomendado | ✅ Recomendado |
| **Kubernetes** | ❌ No | ✅ Sí | ✅ Sí |
| **Docker Compose** | ✅ Sí | ✅ Sí | ⚠️ Con volumes |
| **Visibilidad en archivo** | ✅ Visible | ❌ Oculto | ❌ Oculto |
| **Rotación de secrets** | ❌ Requiere redeploy | ✅ Sín redeploy | ✅ Sín redeploy |

---

## 🎯 Recomendaciones por Entorno

### 🔧 QA/Dev
```yaml
# .env.qa
DB_PASSWORD=sged-qa-password-123
JWT_SECRET=sged-qa-jwt-secret-key-123
```

```bash
# docker-compose-qa.yml
services:
  sged-backend:
    environment:
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
```

### 🌐 Staging
```yaml
# docker-compose-staging.yml
services:
  sged-backend:
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### 🚀 Producción
```yaml
# docker-compose-prod.yml + Vault/AWS Secrets Manager
services:
  sged-backend:
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true  # Gestionar en Vault
  jwt_secret:
    external: true
```

---

## ⚠️ Troubleshooting

### Problema: "DB_PASSWORD no definido"
```
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'dataSource'
```

**Solución**:
```bash
# Verificar que DB_PASSWORD_FILE apunta a archivo válido
docker exec sged-backend-qa cat /run/secrets/db_password

# O usar variable directa
docker-compose -f docker-compose-qa.yml up -e DB_PASSWORD=test
```

### Problema: "Archivo no existe"
```
java.nio.file.NoSuchFileException: /run/secrets/db_password
```

**Solución**:
```bash
# Verificar que el secret está montado
docker exec sged-backend-qa ls -la /run/secrets/

# O crear manualmente
echo "mi-password" > ./secrets/db_password.txt
```

### Problema: "PropertySourceLocator no se ejecuta"
**Solución**: Verificar que `spring.factories` existe:
```bash
docker exec sged-backend-qa cat META-INF/spring.factories | grep PropertySourceLocator
```

---

## 🚀 Siguientes Pasos

1. ✅ **Backend**: PropertySourceLocator implementado
2. ⏳ **QA**: Probar con variables directas
3. ⏳ **Staging**: Probar con Docker secrets (_FILE)
4. ⏳ **Producción**: Integrar con Vault/AWS Secrets Manager

