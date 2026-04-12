---
Documento: QUICK_START_PRUEBAS
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# 🧪 QUICK START: Prueba el Sistema Ahora

## ⚡ Test en 5 Minutos (Opción Simple)

```bash
# 1. Ve a la raíz del proyecto
cd c:\proyectos\oj

# 2. Prepara variables de entorno (PowerShell)
$env:DB_PASSWORD = "sged-qa-password-123"
$env:JWT_SECRET = "sged-qa-jwt-secret-key-32-chars"

# O en Linux/Mac:
# export DB_PASSWORD="sged-qa-password-123"
# export JWT_SECRET="sged-qa-jwt-secret-key-32-chars"

# 3. Levanta los contenedores
docker-compose -f docker-compose-qa.yml up -d

# 4. Espera a que arranque (30 segundos)
# docker-compose logs -f sged-backend-qa

# 5. Valida que funciona
curl http://localhost:8080/api/v1/health

# Esperado: {"status":"UP","database":"Oracle"}
```

✅ **¡Listo!** El sistema está corriendo.

---

## 🔐 Test de Secrets en 10 Minutos

### Paso 1: Crear archivos de secrets

```bash
# PowerShell Windows
New-Item -ItemType Directory -Path "./secrets" -Force
"sged-qa-password-123" | Out-File -FilePath "./secrets/db_password.txt" -NoNewline
"sged-qa-jwt-secret-key-32-chars" | Out-File -FilePath "./secrets/jwt_secret.txt" -NoNewline

# Linux/Mac
mkdir -p ./secrets
echo "sged-qa-password-123" > ./secrets/db_password.txt
echo "sged-qa-jwt-secret-key-32-chars" > ./secrets/jwt_secret.txt
```

### Paso 2: Modificar docker-compose-qa.yml

En la sección `sged-backend.environment`, cambiar:

```yaml
# DE:
DB_PASSWORD: ${DB_PASSWORD:?error}
JWT_SECRET: ${JWT_SECRET:?error}

# A:
DB_PASSWORD_FILE: /run/secrets/db_password
JWT_SECRET_FILE: /run/secrets/jwt_secret

# Y agregar al final del servicio backend:
secrets:
  - db_password
  - jwt_secret

# Y al final del archivo, después de networks:
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### Paso 3: Levantar con secrets

```bash
# Detener si estaba corriendo
docker-compose -f docker-compose-qa.yml down

# Levantar nuevamente
docker-compose -f docker-compose-qa.yml up -d

# Ver logs
docker logs -f sged-backend-qa
# Deberías ver: [SECRETS] Loaded DB_PASSWORD from file...

# Validar
curl http://localhost:8080/api/v1/health
# {"status":"UP","database":"Oracle"}
```

✅ **¡Secrets cargados correctamente!**

---

## 🔓 Test de Login (15 minutos)

```bash
# 1. Obtener token JWT
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }' | jq .

# Esperado:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiresIn": 28800000,
#   "user": {
#     "id": 1,
#     "username": "admin",
#     "rol": "ADMIN"
#   }
# }

# 2. Guardar el token en variable
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.token')

echo "Token: $TOKEN"

# 3. Usar el token para acceder a recursos protegidos
curl -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | .[0:2]'

# 4. Intentar acceder sin token (debería fallar)
curl -X GET http://localhost:8080/api/v1/expedientes
# Esperado: 401 Unauthorized

# 5. Intentar acceder con token inválido (debería fallar)
curl -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer invalid-token"
# Esperado: 401 Unauthorized
```

✅ **¡JWT funcionando correctamente!**

---

## 📋 Test de Operaciones CRUD (20 minutos)

```bash
# Usar el TOKEN de antes
TOKEN=$(...)

# 1. LISTAR expedientes
curl -s -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

# 2. CREAR expediente
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "EXP-2025-001",
    "descripcion": "Expediente de prueba",
    "juzgado": "1er Juzgado",
    "estado": "ACTIVO"
  }')

EXPEDIENTE_ID=$(echo $RESPONSE | jq -r '.id')
echo "Expediente creado con ID: $EXPEDIENTE_ID"

# 3. OBTENER expediente específico
curl -s -X GET http://localhost:8080/api/v1/expedientes/$EXPEDIENTE_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.numero'

# 4. ACTUALIZAR expediente
curl -s -X PUT http://localhost:8080/api/v1/expedientes/$EXPEDIENTE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Expediente actualizado",
    "estado": "EN_REVISIÓN"
  }' | jq '.estado'

# 5. BUSCAR expedientes
curl -s -X POST http://localhost:8080/api/v1/expedientes/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "EXP-2025",
    "limit": 10
  }' | jq '.data | length'
```

✅ **¡CRUD funcionando correctamente!**

---

## 📄 Test de Documentos (25 minutos)

```bash
TOKEN=$(...)

# 1. Crear un archivo de prueba
echo "Este es un documento de prueba" > test-document.txt

# 2. SUBIR documento
UPLOAD=$(curl -s -X POST http://localhost:8080/api/v1/documentos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "expedienteId=1" \
  -F "file=@test-document.txt")

DOCUMENTO_ID=$(echo $UPLOAD | jq -r '.id')
echo "Documento subido con ID: $DOCUMENTO_ID"

# 3. LISTAR documentos del expediente
curl -s -X GET "http://localhost:8080/api/v1/expedientes/1/documentos" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

# 4. OBTENER información del documento
curl -s -X GET http://localhost:8080/api/v1/documentos/$DOCUMENTO_ID/info \
  -H "Authorization: Bearer $TOKEN" | jq '.nombre'

# 5. DESCARGAR documento
curl -s -X GET http://localhost:8080/api/v1/documentos/$DOCUMENTO_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded-document.txt

# 6. Verificar que se descargó correctamente
cat downloaded-document.txt
# Debería mostrar: "Este es un documento de prueba"
```

✅ **¡Gestión de documentos funcionando!**

---

## 🔍 Test de Búsqueda (30 minutos)

```bash
TOKEN=$(...)

# 1. Full-text search
curl -s -X POST http://localhost:8080/api/v1/expedientes/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "juzgado",
    "filters": {
      "estado": "ACTIVO"
    },
    "limit": 20,
    "offset": 0
  }' | jq '.'

# 2. Search con filtros complejos
curl -s -X POST http://localhost:8080/api/v1/expedientes/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "EXP",
    "filters": {
      "estado": ["ACTIVO", "EN_REVISIÓN"],
      "juzgado": "1er Juzgado",
      "fechaDesde": "2025-01-01",
      "fechaHasta": "2025-12-31"
    },
    "limit": 50,
    "sort": {
      "field": "fecha",
      "order": "DESC"
    }
  }' | jq '.data | .[0:3]'

# 3. Validar que retorna resultados
curl -s -X POST http://localhost:8080/api/v1/expedientes/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "*", "limit": 1}' | jq '.totalResults'
# Debería ser > 0
```

✅ **¡Búsqueda full-text funcionando!**

---

## 📊 Test de Auditoría (35 minutos)

```bash
TOKEN=$(...)

# 1. Ver logs de auditoría
curl -s -X GET http://localhost:8080/api/v1/auditoria \
  -H "Authorization: Bearer $TOKEN" | jq '.audits | .[0:5]'

# 2. Auditoría con filtros
curl -s -X GET "http://localhost:8080/api/v1/auditoria?usuario=admin&accion=CREATE&limit=20" \
  -H "Authorization: Bearer $TOKEN" | jq '.audits | length'

# 3. Validar que todas tus acciones están auditadas
# - Login → AUD_LOGIN
# - Create expediente → AUD_CREATE_EXPEDIENTE
# - Upload documento → AUD_UPLOAD_DOCUMENTO
# - Search → AUD_SEARCH
# - Access recurso → AUD_ACCESS

curl -s -X GET "http://localhost:8080/api/v1/auditoria?limit=50" \
  -H "Authorization: Bearer $TOKEN" | jq '.audits[].accion' | sort | uniq -c
```

✅ **¡Auditoría funcionando correctamente!**

---

## 🚨 Test de Errores y Edge Cases (45 minutos)

```bash
TOKEN=$(...)

# 1. BD no disponible
docker stop sged-db-qa
curl http://localhost:8080/api/v1/health
# Esperado: 503 Service Unavailable
docker start sged-db-qa

# 2. Token expirado (esperar o simular)
OLD_TOKEN="eyJhbGci..."  # Token muy viejo
curl -X GET http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $OLD_TOKEN"
# Esperado: 401 Unauthorized (token expired)

# 3. Rate limiting (20 req/s)
for i in {1..100}; do
  curl -s http://localhost/api/v1/health > /dev/null &
done
wait
# Algunos requests deberían retornar 429 Too Many Requests

# 4. Archivo muy grande
dd if=/dev/zero of=large-file.bin bs=1M count=200
curl -X POST http://localhost:8080/api/v1/documentos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large-file.bin"
# Esperado: 413 Payload Too Large

# 5. Datos inválidos
curl -X POST http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"numero": "", "descripcion": ""}'
# Esperado: 400 Bad Request (validation error)
```

✅ **¡Error handling funcionando!**

---

## 📈 Test de Rendimiento (60 minutos)

```bash
TOKEN=$(...)

# 1. Latencia individual
time curl -s http://localhost:8080/api/v1/health > /dev/null

# 2. Latencia en múltiples requests
for i in {1..50}; do
  /usr/bin/time -p curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1
done | grep real | awk '{print $2}' | sort | uniq -c

# 3. Monitorear recursos durante prueba de carga
# En una terminal:
watch -n 1 'docker stats sged-backend-qa --no-stream'

# En otra terminal (generar carga):
for i in {1..1000}; do
  curl -s -X GET http://localhost:8080/api/v1/expedientes \
    -H "Authorization: Bearer $TOKEN" > /dev/null &
  if [ $((i % 100)) -eq 0 ]; then
    sleep 1
  fi
done
wait

# 4. Verificar memoria no se incrementó indefinidamente
# Si viste incremento gradual, posible memory leak
```

✅ **¡Rendimiento validado!**

---

## ✅ Checklist de Pruebas

```
BASIC HEALTH
├─ [  ] curl /health → 200 UP
├─ [  ] docker containers corriendo (3)
└─ [  ] logs sin errores críticos

SECRETS
├─ [  ] Variables directas cargadas
├─ [  ] Variables _FILE cargadas
├─ [  ] BD conectada (health check)
└─ [  ] JWT válido

AUTH
├─ [  ] Login funciona
├─ [  ] Token generado
├─ [  ] Token válido protege recursos
└─ [  ] Token inválido → 401

CRUD
├─ [  ] GET expedientes
├─ [  ] POST expediente nuevo
├─ [  ] PUT expediente existente
└─ [  ] Datos validados

DOCUMENTS
├─ [  ] Upload documento
├─ [  ] Listar documentos
├─ [  ] Download documento
└─ [  ] Size limits respetados

SEARCH
├─ [  ] Full-text search funciona
├─ [  ] Filtros aplican
├─ [  ] Retorna resultados
└─ [  ] Paginación funciona

AUDIT
├─ [  ] Todas las acciones auditadas
├─ [  ] Logs contienen usuario
├─ [  ] Timestamps correctos
└─ [  ] Query logs funciona

SECURITY
├─ [  ] Rate limiting activo
├─ [  ] Size limits respetados
├─ [  ] Token expiration funciona
└─ [  ] CORS configurado correctamente

PERFORMANCE
├─ [  ] p50 latencia < 200ms
├─ [  ] p95 latencia < 500ms
├─ [  ] No memory leaks (10min test)
└─ [  ] CPU < 80% bajo carga
```

---

## 🎉 Resultado

Si todos estos tests pasan:

✅ **Sistema SGED v1.1.0 está LISTO PARA STAGING**

---

## 📞 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| `curl: (7) Failed to connect` | `docker-compose ps` - verificar contenedores corriendo |
| `401 Unauthorized` | Token inválido o expirado, hacer nuevo login |
| `503 Service Unavailable` | BD no conectada, `docker logs sged-backend-qa` |
| `413 Payload Too Large` | Archivo > 100MB, reducir tamaño |
| `429 Too Many Requests` | Rate limit alcanzado, esperar o aumentar límite |
| `500 Internal Server Error` | Error del servidor, ver logs |

---

```
╔═════════════════════════════════════╗
║  🚀 ¡COMIENZA A PROBAR AHORA! 🚀   ║
║                                     ║
║  Comando para empezar (5 min):      ║
║  docker-compose up -d               ║
║  curl localhost:8080/health         ║
║                                     ║
║  Luego sigue los tests de arriba    ║
╚═════════════════════════════════════╝
```

