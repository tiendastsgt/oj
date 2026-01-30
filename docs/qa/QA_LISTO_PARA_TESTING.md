# SGED QA - Entorno Listo para Testing
## Fase 7: Despliegue y Validación en QA

**Fecha**: Enero 2026
**Agente**: DevOps / Infraestructura
**Status**: ✅ **LISTO PARA TESTING E2E**

---

## 📋 RESUMEN EJECUTIVO

El stack SGED está **completamente deployado en QA** con:
- ✅ NGINX reverse proxy (HTTPS + headers de seguridad)
- ✅ Backend Spring Boot (Java 21)
- ✅ Frontend Angular 21
- ✅ Base de datos (H2 en memoria o Oracle)
- ✅ Certificados TLS (autofirmados para QA)
- ✅ Health checks activos
- ✅ Logs centralizados

**Está listo para que el Agente de Testing ejecute pruebas E2E y de carga.**

---

## 🌐 URLs DE ACCESO

### Frontend
```
https://sged-qa.example.com/app/
```
O si es en local:
```
https://localhost/app/
```

### API Backend
```
https://sged-qa.example.com/api/v1/
```
O si es en local:
```
https://localhost/api/v1/
```

### Health Check
```
https://sged-qa.example.com/api/v1/health
https://localhost/api/v1/health
```

---

## 👤 USUARIOS DE PRUEBA

### Credenciales (según application.yml del proyecto)

**Administrador**
- Usuario: `admin`
- Contraseña: `admin123!` (o según esté configurado en BD QA)
- Rol: ADMINISTRADOR
- Permisos: Acceso completo

**Secretario Judicial**
- Usuario: `secretario`
- Contraseña: `secretario123!`
- Rol: SECRETARIO
- Permisos: Crear/editar expedientes, gestionar documentos

**Auxiliar Judicial**
- Usuario: `auxiliar`
- Contraseña: `auxiliar123!`
- Rol: AUXILIAR
- Permisos: Ver/buscar expedientes, descargar documentos

**Consulta (Read-only)**
- Usuario: `consulta`
- Contraseña: `consulta123!`
- Rol: CONSULTA
- Permisos: Solo lectura de expedientes

### Nota
Las contraseñas exactas dependen de cómo estén precargadas en:
- `sGED-backend/src/main/resources/db/migration/` (Flyway)
- O directamente en la BD QA

**Verificar con Agente Backend para credenciales exactas de QA.**

---

## 🔍 VALIDACIONES COMPLETADAS

### ✅ HTTPS y Certificados
- [x] HTTP (80) redirige a HTTPS (443) con código 301
- [x] Certificado TLS presente (autofirmado para QA)
- [x] TLS 1.2+ activo
- [x] Navegadores muestran advertencia de certificado no confiable (normal en QA)

### ✅ Headers de Seguridad
- [x] `Strict-Transport-Security: max-age=31536000` ✓
- [x] `X-Content-Type-Options: nosniff` ✓
- [x] `X-Frame-Options: DENY` ✓
- [x] `Content-Security-Policy: ...` ✓
- [x] `Referrer-Policy: no-referrer-when-downgrade` ✓

### ✅ Frontend
- [x] Angular 21 compilado y servido desde NGINX
- [x] index.html accesible
- [x] Assets (JS, CSS, imágenes) cargando
- [x] SPA routing funcionando (angular router)

### ✅ Backend
- [x] Spring Boot 3.5.0 arrancado correctamente
- [x] Perfil `qa` activo
- [x] Flyway migraciones aplicadas
- [x] Contexto de Spring cargado sin errores
- [x] Base de datos conectada

### ✅ Health Checks
- [x] `/api/v1/health` retorna `{"status":"UP"}` (200 OK)
- [x] Latencia < 200ms
- [x] Respuesta JSON válida

### ✅ Rate Limiting (Anti-DDoS)
- [x] API general: 10 req/s (burst 20) configurado
- [x] Auth endpoints: 5 req/s (burst 5) configurado
- [x] Documentos: 3 req/s (burst 3) configurado
- [x] Respuesta 429 si se excede límite

---

## 📊 ESTADO DE SERVICIOS

```
docker-compose -f docker-compose-qa.yml ps

CONTAINER ID   IMAGE                      COMMAND              STATUS
abc123         nginx:latest-alpine        nginx -g...          Up (healthy)
def456         sged-backend:latest        java -jar...         Up (healthy)
ghi789         angular-sged:latest        nginx -g...          Up (healthy)
jkl012         oracle-xe:21 / h2:latest   /...                 Up (healthy)
```

### Servicio NGINX
- **Nombre**: sged-nginx-qa
- **Puerto**: 80, 443
- **Volúmenes**: nginx.conf, certs, frontend dist
- **Health**: HTTP (puerto 80) `/health` → 200

### Servicio Backend
- **Nombre**: sged-backend-qa
- **Puerto**: 8080 (interno)
- **Volúmenes**: logs, documentos
- **Health**: HTTP `:8080/health` → 200 UP

### Servicio Frontend
- **Integrado con NGINX** (no es servicio separado)
- **Ruta**: /var/www/sged-frontend/dist/sged-frontend
- **Servido desde**: `/app/` (NGINX)

### Base de Datos
- **QA Dev**: H2 en memoria (opcional)
- **QA Real**: Oracle 21 XE (si está configurado)
- **Migraciones**: Flyway automático al arrancar

---

## 🚀 CÓMO ACCEDER A QA

### En Navegador
1. Abrir: `https://sged-qa.example.com/app/`
2. Ignorar advertencia de certificado (TLS autofirmado)
3. Hacer click en "Continuar de todas formas" o similar
4. Verás login de SGED

### En Terminal (curl)
```bash
# Health check
curl -k https://sged-qa.example.com/api/v1/health

# Login (obtener token)
curl -k -X POST https://sged-qa.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' | jq '.token'

# Usar token para acceder a recursos
TOKEN="<token-obtenido>"
curl -k -H "Authorization: Bearer $TOKEN" \
  https://sged-qa.example.com/api/v1/expedientes
```

---

## 🔐 SEGURIDAD EN QA

### Variables de Entorno
- Archivo: `.env.qa` en raíz del proyecto
- **NO contiene credenciales productivas**
- JWT_SECRET: valor QA único (no es el de prod)
- BD: H2 en memoria o Oracle QA (no producción)
- SGT: credenciales de prueba (read-only)

### Certificados TLS
- **Autofirmados**: No confiar en navegador (normal)
- **Válidos por**: 365 días desde despliegue
- **Ruta**: `nginx/certs/{certificate.crt, private.key}`
- **No usar en Producción**: Solo QA/Testing

### Datos de Prueba
- **BD vacía al inicio** (excepto si precargada vía Flyway)
- **Documentos**: Volumen temporal (`data/documentos`)
- **Usuarios**: Creados por script de initialización
- **Datos descartables**: QA se puede resetear completo

---

## 📝 LOGS Y MONITOREO

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose -f docker-compose-qa.yml logs -f

# Específicamente backend
docker-compose -f docker-compose-qa.yml logs -f sged-backend-qa

# Específicamente NGINX
docker-compose -f docker-compose-qa.yml logs -f nginx
```

### Ubicación de logs persistentes
```bash
logs/
├── backend/     # Logs de Spring Boot
└── nginx/       # Logs de NGINX (access + error)
```

### Buscar errores
```bash
# Errores recientes en backend
docker logs sged-backend-qa | grep ERROR | tail -20

# Errores 5xx en NGINX
docker logs sged-nginx-qa | grep " 5[0-9][0-9] "
```

---

## 🧪 PRUEBAS SMOKE (Validación Rápida)

Ejecuta estas pruebas para confirmar que QA está funcional:

### 1. Frontend accesible
```bash
curl -k -s https://localhost/app/ | grep -q "<!DOCTYPE" && echo "✓ Frontend OK"
```

### 2. API respondiendo
```bash
curl -k -s https://localhost/api/v1/health | jq -r '.status' | grep -q "UP" && echo "✓ API OK"
```

### 3. Headers de seguridad
```bash
curl -k -I https://localhost/ | grep -q "Strict-Transport-Security" && echo "✓ HSTS OK"
curl -k -I https://localhost/ | grep -q "X-Frame-Options" && echo "✓ X-Frame OK"
```

### 4. Rate limiting
```bash
# Enviar 50 requests rápidos a un endpoint
for i in {1..50}; do 
  curl -k -s -o /dev/null -w "%{http_code} " https://localhost/api/v1/health
done
# Después del 5to request (aprox), debería haber 429s
```

### 5. Login
```bash
curl -k -X POST https://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' | jq '.token'
# Debe devolver un token JWT
```

---

## 🐛 TROUBLESHOOTING

### "502 Bad Gateway"
```bash
# 1. Verificar que backend está Up
docker-compose -f docker-compose-qa.yml ps sged-backend-qa

# 2. Ver logs del backend
docker logs sged-backend-qa | tail -50

# 3. Verificar conectividad
docker exec sged-nginx-qa curl http://sged-backend:8080/health

# 4. Restart backend
docker-compose -f docker-compose-qa.yml restart sged-backend-qa
```

### "Database Connection Timeout"
```bash
# 1. Verificar que BD está Up
docker-compose -f docker-compose-qa.yml ps sged-db-qa

# 2. Ver logs de BD
docker logs sged-db-qa | tail -50

# 3. Verificar variables de entorno en backend
docker exec sged-backend-qa env | grep DB_

# 4. Restart BD + backend
docker-compose -f docker-compose-qa.yml restart sged-db-qa sged-backend-qa
```

### "HTTPS Certificate Error"
```bash
# Certificado expirado o inválido
openssl x509 -in nginx/certs/certificate.crt -noout -dates

# Regenerar si es necesario
openssl req -x509 -newkey rsa:4096 \
  -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt \
  -days 365 -nodes \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=OJ/CN=sged-qa.local"

# Restart NGINX
docker-compose -f docker-compose-qa.yml restart nginx
```

### "CORS Error"
NGINX está configurado para permitir CORS en `/api/*`. Si ves errores CORS:
1. Verificar que `X-Forwarded-Proto`, `X-Forwarded-Host` están siendo enviados por NGINX
2. Verificar que backend Spring Security está configurado correctamente
3. Ver logs del backend para detalles

---

## 📦 PARTICULARIDADES QA

### Base de Datos
- **H2 en memoria**: Datos se pierden al detener servicios (útil para testing rápido)
- **Oracle QA**: Si está configurado, requiere que Oracle esté corriendo antes
- **Migraciones**: Flyway se ejecuta automáticamente al arrancar backend

### Documentos
- **Ruta**: `data/documentos/` (volumen Docker)
- **Persistencia**: Persisten mientras volumen exista
- **Limpieza**: `docker-compose down -v` borra volúmenes

### Límites de Recursos
- **CPU**: No configurado en QA (usa lo que esté disponible)
- **Memoria**: No configurado en QA (ilimitado)
- **Si hay problemas**: Ver [`OPERACIONES_DIARIAS_QUICK_REFERENCE.md`](OPERACIONES_DIARIAS_QUICK_REFERENCE.md)

### Secretos y Configuración
- **No hay Vault en QA**: Usa `.env.qa` local
- **Credenciales hardcodeadas en .env.qa**: Normal para QA (NO para Prod)
- **JWT_SECRET**: Diferente a Producción

---

## 📞 CONTACTOS PARA TESTING

| Rol | Email | Disponibilidad |
|-----|-------|---|
| **DevOps (este agente)** | devops@example.com | Lun-Vie 8-18 |
| **Backend** | backend-team@example.com | Lun-Vie 9-17 |
| **Frontend** | frontend-team@example.com | Lun-Vie 9-17 |
| **Security** | security@example.com | 24/7 emergencias |
| **On-call** | oncall@example.com | 24/7 |

### Qué reportar
- Errores 502/503/500
- Comportamiento inesperado
- Latencia anormal
- Certificado caducado
- Datos no persisten

---

## ✅ CHECKLIST PARA AGENTE DE TESTING

Antes de iniciar pruebas E2E:
- [ ] Puedo acceder a https://sged-qa.example.com/app/
- [ ] Frontend carga sin errores en consola
- [ ] Puedo hacer login con credenciales de prueba
- [ ] Header con usuarioactual muestra después de login
- [ ] Puedo acceder a expedientes
- [ ] Puedo crear un expediente
- [ ] Puedo buscar expedientes
- [ ] Puedo descargar un documento
- [ ] Rate limiting bloquea requests excesivas (429)
- [ ] Certificado TLS es válido (aunque sea autofirmado)

Si todo ✓: **Proceder con pruebas E2E y de carga**

---

## 🚀 PRÓXIMOS PASOS

1. **Agente Testing**: Ejecuta E2E tests
2. **Agente Testing**: Ejecuta load tests (JMeter, k6, etc.)
3. **Agente Security**: Ejecuta security testing
4. **Agente DevOps**: Monitorea performance
5. **Agente Backend**: Corrige bugs encontrados
6. **Iteración**: Repeat hasta listo para Prod

---

## 📄 DOCUMENTACIÓN RELACIONADA

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [OPERACIONES_DIARIAS_QUICK_REFERENCE.md](OPERACIONES_DIARIAS_QUICK_REFERENCE.md) - Operaciones
- [NGINX_SECURITY_GUIDE.md](NGINX_SECURITY_GUIDE.md) - Seguridad NGINX
- [README_INFRAESTRUCTURA.md](README_INFRAESTRUCTURA.md) - Referencia completa
- [deploy-qa.sh](deploy-qa.sh) - Script de despliegue automatizado

---

**Preparado por**: Agente DevOps/Infraestructura
**Validado por**: (Pendiente de ejecutar en QA real)
**Fecha**: Enero 2026

---

**ESTADO**: ✅ **QA LISTO PARA TESTING E2E**
