# 🧪 Guía de Prueba del Sistema SGED

## Estado Actual de las Pruebas (Enero 2026)

La plataforma SGED ha completado **7 fases** de desarrollo y QA. Ahora te ayudaré a estructurar las pruebas del sistema completo.

---

## 📋 Niveles de Prueba

### 1. **Pruebas Unitarias** (Desarrollador)
✅ **Estado**: Backend 85% cobertura, Frontend basic  
**Ejecución**:
```bash
# Backend
cd sGED-backend
./mvnw test

# Frontend
cd sGED-frontend
npm test
```

### 2. **Pruebas de Integración** (QA - Dev/Staging)
✅ **Estado**: Listo en docker-compose-qa.yml  
**Ejecución**:
```bash
docker-compose -f docker-compose-qa.yml up -d
sleep 30

# Health check
curl http://localhost:8080/api/v1/health

# Test de login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### 3. **Pruebas de Secretos (_FILE pattern)** ⭐ NUEVO
✅ **Implementado**: SecretsPropertySourceLocator  
**Ejecución**:

#### Opción A: Variables Directas (simple)
```bash
export DB_PASSWORD=sged-qa-password
export JWT_SECRET=sged-qa-jwt-secret

docker-compose -f docker-compose-qa.yml up -d
curl http://localhost:8080/api/v1/health
```

#### Opción B: Docker Secrets (_FILE pattern)
```bash
# Crear secrets files
mkdir -p ./secrets
echo "mi-contraseña-segura" > ./secrets/db_password.txt
echo "mi-jwt-secret-muy-largo-32-caracteres" > ./secrets/jwt_secret.txt

# Modificar docker-compose-qa.yml
# Cambiar en sged-backend.environment:
#   DB_PASSWORD_FILE: /run/secrets/db_password
#   JWT_SECRET_FILE: /run/secrets/jwt_secret

docker-compose -f docker-compose-qa.yml up -d
curl http://localhost:8080/api/v1/health
```

---

## 🔐 Inyección de Secrets: Verificación

### Verificar que el PropertySourceLocator funcionó

```bash
# 1. Ver logs del backend
docker logs sged-backend-qa 2>&1 | grep -i "SECRETS"

# Debería ver:
# [SECRETS] Loaded DB_PASSWORD from file: /run/secrets/db_password
# [SECRETS] Loaded JWT_SECRET from file: /run/secrets/jwt_secret
```

```bash
# 2. Verificar conexión a BD (implícitamente valida el password)
curl -s http://localhost:8080/api/v1/health | jq .
# {
#   "status": "UP",
#   "database": "Oracle"
# }
```

```bash
# 3. Verificar JWT (implícitamente valida el secret)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq .

# {
#   "token": "eyJhbGci...",
#   "expiresIn": 28800000
# }
```

---

## 🧪 Plan de Pruebas por Módulo

### Backend - Pruebas Funcionales

#### 🔓 Autenticación
```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  | jq '.token' -r > token.txt

TOKEN=$(cat token.txt)

# Acceso autorizado
curl -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

# Acceso no autorizado (sin token)
curl -X GET http://localhost:8080/api/v1/expedientes
# 401 Unauthorized
```

#### 📄 Documentos
```bash
# Subir documento
curl -X POST http://localhost:8080/api/v1/documentos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  | jq .

# Verificar documento
curl -X GET "http://localhost:8080/api/v1/documentos/{id}" \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

#### 📋 Expedientes
```bash
# Listar
curl -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

# Crear
curl -X POST http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "EXP-2025-001",
    "descripcion": "Expediente test"
  }' | jq .
```

#### 🔍 Búsqueda
```bash
# Full text search
curl -X POST http://localhost:8080/api/v1/expedientes/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "juzgado",
    "filters": {
      "estado": "activo"
    }
  }' | jq .
```

#### 📊 Auditoría
```bash
# Ver logs de auditoría
curl -X GET http://localhost:8080/api/v1/auditoria \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.audits | .[0:3]'
```

---

### Frontend - Pruebas Manuales

#### 1. Compilar y Servir
```bash
cd sGED-frontend
npm install
npm run build

# Servir localmente
npm start
# http://localhost:4200
```

#### 2. Tests Automatizados
```bash
# Pruebas unitarias
npm test

# Pruebas E2E (si existen)
npm run e2e
```

#### 3. Validar Compilación en Docker
```bash
# El docker-compose-qa.yml sirve el frontend via NGINX
docker-compose -f docker-compose-qa.yml up -d
curl http://localhost/app/
# Debería retornar index.html compilado
```

---

## 🏗️ Pruebas de Arquitectura

### Base de Datos

```bash
# Acceso directo a Oracle
docker exec sged-db-qa sqlplus -s sged/$(cat .env.qa | grep DB_PASSWORD | cut -d= -f2)

# Dentro de sqlplus:
SELECT COUNT(*) FROM expedientes;
SELECT COUNT(*) FROM documentos;
SELECT * FROM audit_logs ORDER BY fecha DESC FETCH FIRST 5 ROWS ONLY;
EXIT;
```

### Reverse Proxy (NGINX)

```bash
# Verificar configuración
docker exec sged-nginx-qa nginx -t

# Ver logs
docker logs -f sged-nginx-qa

# Test endpoints
curl -I http://localhost/app/
curl -I http://localhost/api/v1/health
curl -I http://localhost/health
```

### Network

```bash
# Verificar conectividad entre contenedores
docker network ls
docker network inspect sged-qa-network

# Ping entre servicios
docker exec sged-backend-qa ping sged-db-qa
docker exec sged-backend-qa ping sged-nginx-qa
```

---

## 🚨 Pruebas de Error Handling

### Casos de Error Esperados

#### 1. Base de Datos No Disponible
```bash
docker stop sged-db-qa
curl http://localhost:8080/api/v1/health
# 503 Service Unavailable + circuitbreaker
```

#### 2. JWT Inválido
```bash
curl -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer invalid-token"
# 401 Unauthorized
```

#### 3. Archivo Muy Grande
```bash
dd if=/dev/zero of=large_file.bin bs=1M count=200
curl -X POST http://localhost:8080/api/v1/documentos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large_file.bin"
# 413 Payload Too Large
```

#### 4. Rate Limiting
```bash
# NGINX tiene límite de 20 req/s general
for i in {1..100}; do
  curl -s http://localhost/api/v1/health > /dev/null &
done
wait
# Algunos deberían retornar 429 Too Many Requests
```

---

## 📊 Pruebas de Rendimiento

### Latencia

```bash
# Medir latencia del endpoint
time curl -s http://localhost:8080/api/v1/health > /dev/null

# Con múltiples requests
for i in {1..100}; do
  time curl -s http://localhost:8080/api/v1/health > /dev/null
done | grep real | awk '{print $2}' | sort | uniq -c
```

### Carga

```bash
# Instalación necesaria
# apt install apache2-utils (Linux)
# o descargar Apache Bench

# Test de carga: 100 conexiones, 1000 requests
ab -n 1000 -c 100 http://localhost/api/v1/health

# Test con auth
ab -n 1000 -c 100 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost/api/v1/expedientes
```

### Memory Leak

```bash
# Monitorear memoria durante 10 minutos de carga
watch -n 1 'docker stats sged-backend-qa --no-stream | head -3'

# En otra terminal, generar carga
while true; do
  curl -s http://localhost:8080/api/v1/health > /dev/null
  sleep 0.1
done

# La memoria NO debería aumentar continuamente
```

---

## 🔍 Pruebas de Secretos (Focus Area)

### Scenario 1: Variables Directas

```bash
# Preparar
export DB_PASSWORD=test123
export JWT_SECRET=jwttest456

docker-compose -f docker-compose-qa.yml up -d

# Verificar
docker exec sged-backend-qa env | grep -E "DB_PASSWORD|JWT_SECRET"
# DB_PASSWORD=test123
# JWT_SECRET=jwttest456

curl http://localhost:8080/api/v1/health
# "status": "UP" → Password correcto
```

### Scenario 2: Docker Secrets (_FILE)

```bash
# Preparar
echo "secretpassword123" > ./secrets/db_password.txt
echo "secretjwt456key" > ./secrets/jwt_secret.txt

# docker-compose-qa.yml con:
# environment:
#   DB_PASSWORD_FILE: /run/secrets/db_password
#   JWT_SECRET_FILE: /run/secrets/jwt_secret
# secrets:
#   - db_password
#   - jwt_secret

docker-compose -f docker-compose-qa.yml up -d

# Verificar
docker logs sged-backend-qa | grep SECRETS
# [SECRETS] Loaded DB_PASSWORD from file: /run/secrets/db_password
# [SECRETS] Loaded JWT_SECRET from file: /run/secrets/jwt_secret

curl http://localhost:8080/api/v1/health
# "status": "UP" → Secrets cargados correctamente
```

### Scenario 3: Precedencia (Variable + _FILE)

```bash
# Preparar
export DB_PASSWORD=direct-value
echo "file-value" > ./secrets/db_password.txt

# docker-compose-qa.yml con AMBOS:
# DB_PASSWORD: ${DB_PASSWORD}
# DB_PASSWORD_FILE: /run/secrets/db_password

docker-compose -f docker-compose-qa.yml up -d

# Verificar: Debería usar la variable directa "direct-value"
# Porque tiene precedencia sobre _FILE

curl http://localhost:8080/api/v1/health
# Si status=UP → usó "direct-value"
# Si status!=UP → hay un error de precedencia
```

---

## ✅ Checklist de Pruebas Completo

```
PREPARACIÓN
├─ [  ] Clonar repositorio
├─ [  ] Instalar Docker + Docker Compose
├─ [  ] Copiar .env.qa (si es necesario)
└─ [  ] Verificar puertos disponibles (80, 443, 8080, 1521)

BACKEND - UNITARIAS
├─ [  ] mvn test en sGED-backend
└─ [  ] 85%+ cobertura

BACKEND - INTEGRACIÓN
├─ [  ] docker-compose up -d
├─ [  ] curl /health → UP
├─ [  ] Login funciona
├─ [  ] CRUD expedientes funciona
└─ [  ] Búsqueda funciona

SECRETOS
├─ [  ] Variables directas cargadas correctamente
├─ [  ] Variables _FILE cargadas correctamente
├─ [  ] Precedencia respetada
└─ [  ] Docker logs muestran "[SECRETS]"

FRONTEND
├─ [  ] npm test
├─ [  ] npm run build
├─ [  ] localhost/app/ carga
└─ [  ] Formularios funcionan

NETWORKING
├─ [  ] NGINX ↔ Backend comunicación
├─ [  ] Backend ↔ Database comunicación
└─ [  ] Todos en mismo network

SEGURIDAD
├─ [  ] JWT válido → acceso
├─ [  ] JWT inválido → 401
├─ [  ] Sin token → 401
└─ [  ] Rate limiting activo

RENDIMIENTO
├─ [  ] Latencia < 500ms (p95)
├─ [  ] No memory leaks (10min test)
├─ [  ] Rate limit ~20req/s
└─ [  ] CPU < 80% en carga

PRODUCCIÓN SIMULADA
├─ [  ] docker-compose-prod.yml con secrets
├─ [  ] Blue/Green deployment simulado
└─ [  ] Rollback < 60 segundos
```

---

## 📈 Reportes de Pruebas

### Template de Reporte

```markdown
# Test Report - SGED v1.1.0
Fecha: 2026-01-28
Entorno: QA

## Summary
- Tests ejecutados: 150
- Pasaron: 150
- Fallaron: 0
- Coverage: 87%

## Resultado Final
✅ LISTO PARA STAGING

## Issues Encontrados
- Ninguno crítico
- 2 warnings menores en logs

## Recomendaciones
- Monitorear JWT secret rotation
- Optimizar query de búsqueda full-text
```

---

## 🚀 Siguientes Pasos

1. **Inmediato**: Ejecutar pruebas unitarias y de integración
2. **Hoy**: Validar inyección de secrets (ambas opciones)
3. **Esta semana**: Pruebas de rendimiento y carga
4. **Próxima semana**: Deployment a Staging
5. **Posterior**: Preparar producción

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs: `docker logs sged-backend-qa`
2. Verificar red: `docker network inspect sged-qa-network`
3. Verificar BD: `docker exec sged-db-qa sqlplus`
4. Revisar [GUIA_SECRETS_INYECCION.md](./GUIA_SECRETS_INYECCION.md)

