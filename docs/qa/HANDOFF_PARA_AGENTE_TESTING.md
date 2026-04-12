---
Documento: HANDOFF_PARA_AGENTE_TESTING
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# HANDOFF: Agente Testing - SGED QA Listo
## De: DevOps/Infraestructura | A: Testing | Fecha: Enero 2026

---

## 🎯 MISIÓN

El stack SGED está **completamente deployado en QA** y listo para que inicies:
1. **Pruebas E2E** (Cypress, Selenium, etc.)
2. **Pruebas de Carga** (JMeter, k6, Locust)
3. **Pruebas de Seguridad** (OWASP ZAP, etc.)
4. **Pruebas de Rendimiento**

**Status**: ✅ GREEN - Proceder con testing

---

## 📍 UBICACIÓN QA

### Frontend
```
https://sged-qa.example.com/app/
```
O localmente:
```
https://localhost/app/
```

### API
```
https://sged-qa.example.com/api/v1/
```
O localmente:
```
https://localhost/api/v1/
```

---

## 👤 CREDENCIALES DE PRUEBA (4 roles)

```bash
# ADMINISTRADOR - Acceso total
Usuario:  admin
Password: admin123!
Rol:      ADMINISTRADOR

# SECRETARIO JUDICIAL - Crear/editar expedientes
Usuario:  secretario
Password: secretario123!
Rol:      SECRETARIO

# AUXILIAR JUDICIAL - Ver/buscar/descargar
Usuario:  auxiliar
Password: auxiliar123!
Rol:      AUXILIAR

# CONSULTA - Solo lectura
Usuario:  consulta
Password: consulta123!
Rol:      CONSULTA
```

---

## ✅ CHECKLIST PRE-TESTING

Antes de empezar pruebas E2E, valida esto:

```bash
# 1. Frontend carga
curl -k https://localhost/app/ | grep -q "<!DOCTYPE" && echo "✓" || echo "✗"

# 2. API health
curl -k https://localhost/api/v1/health | jq .status | grep -q "UP" && echo "✓" || echo "✗"

# 3. Headers de seguridad
curl -k -I https://localhost/ | grep -q "Strict-Transport-Security" && echo "✓" || echo "✗"

# 4. Login funciona
curl -k -X POST https://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' \
  | jq .token | grep -q "ey" && echo "✓" || echo "✗"

# Si todos ✓, proceder a pruebas
```

---

## 🧪 PRUEBAS E2E - SCENARIOS BÁSICOS

### 1. Login
```gherkin
Scenario: Admin puede hacer login
  Given Estoy en https://localhost/app/
  When Ingreso username "admin"
  And Ingreso password "admin123!"
  And Click en "Ingresar"
  Then Debo ver el dashboard
  And URL debe ser https://localhost/app/dashboard
```

### 2. Crear Expediente
```gherkin
Scenario: Secretario crea nuevo expediente
  Given Estoy logged como "secretario"
  When Click en "Nuevo Expediente"
  And Completo formulario:
    | Campo | Valor |
    | Caratula | Prueba E2E |
    | Juzgado | JDC-101 |
    | Demandante | Test Corp |
    | Demandado | Test Inc |
  And Click en "Guardar"
  Then Debo ver mensaje "Expediente creado"
  And ID debe aparecer en listado
```

### 3. Buscar Expediente
```gherkin
Scenario: Auxiliar busca expediente por caratula
  Given Estoy logged como "auxiliar"
  When Click en "Buscar Expedientes"
  And Ingreso "Prueba E2E" en campo de búsqueda
  And Presiono Enter
  Then Debo ver expediente creado
  And Puedo click en expediente para ver detalles
```

### 4. Subir Documento
```gherkin
Scenario: Secretario sube documento a expediente
  Given Estoy en detalle de expediente
  When Click en "Añadir Documento"
  And Selecciono archivo "test_doc.pdf"
  And Ingreso descripción "Demanda"
  And Click en "Subir"
  Then Debo ver "Documento subido exitosamente"
  And Archivo debe aparecer en lista de documentos
```

### 5. Descargar Documento
```gherkin
Scenario: Auxiliar descarga documento
  Given Estoy en detalle de expediente con documentos
  When Click en icono descargar del documento
  Then El archivo PDF debe descargarse
  And Contenido del PDF debe ser válido
```

---

## 🚀 PRUEBAS DE CARGA

### Setup
```bash
# 1. Instalar herramienta (ejemplo k6)
npm install -g k6

# 2. Script básico k6
cat > test_load.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,           // 10 usuarios virtuales
  duration: '5m',    // 5 minutos
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% requests < 200ms
    http_req_failed: ['rate<0.1'],     // < 10% failures
  },
};

export default function () {
  // Login
  let loginRes = http.post('https://localhost/api/v1/auth/login', 
    JSON.stringify({
      username: 'admin',
      password: 'admin123!'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tlsClientAuth: { 
        cert: 'path/to/cert.pem',
        key: 'path/to/key.pem'
      }
    }
  );
  
  let token = loginRes.json('token');
  
  // Health check
  let healthRes = http.get('https://localhost/api/v1/health', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  check(healthRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
EOF

# 3. Ejecutar test
k6 run test_load.js --insecure-skip-tls-verify
```

### Métricas a Monitorear
- Latencia p50, p95, p99
- Error rate (5xx, timeouts)
- Throughput (req/sec)
- Memory usage
- CPU usage

---

## 🔒 PRUEBAS DE SEGURIDAD

### Headers
```bash
curl -k -I https://localhost/ | grep -E "Strict-Transport|X-Frame|X-Content|Content-Security"
```
Debe ver:
```
Strict-Transport-Security: max-age=31536000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: ...
```

### Rate Limiting
```bash
# Enviar 50 requests rápidos
for i in {1..50}; do 
  curl -k -s -o /dev/null -w "%{http_code}\n" https://localhost/api/v1/health
done
# Después del 5to request aprox, debe ver 429s
```

### HTTPS/TLS
```bash
# Validar protocolo
openssl s_client -connect localhost:443 -tls1_2 < /dev/null | grep "Cipher"
# Debe soportar TLS 1.2+

# Validar certificado
openssl s_client -connect localhost:443 < /dev/null | openssl x509 -noout -dates
```

### SQL Injection
```bash
# Intenta injection en búsqueda
curl -k 'https://localhost/api/v1/expedientes?search="; DROP TABLE--'
# Debe retornar 400 o escapar la entrada
```

---

## 📊 CUÁLES SON LOS LOGS Y DÓNDE VERLOS

### En QA Host
```bash
# Ver logs de todos servicios
docker-compose -f docker-compose-qa.yml logs -f

# Específicamente backend
docker-compose -f docker-compose-qa.yml logs -f sged-backend-qa

# Específicamente NGINX
docker-compose -f docker-compose-qa.yml logs -f nginx

# Buscar errores
docker logs sged-backend-qa | grep ERROR | tail -20
```

### Ubicación de archivos
```
logs/
├── backend/access.log      # Requests HTTP
├── backend/error.log       # Errores Spring Boot
├── backend/app.log         # Logs aplicación
└── nginx/
    ├── access.log          # Accesos NGINX
    └── error.log           # Errores NGINX
```

---

## 🐛 TROUBLESHOOTING RÁPIDO

### "502 Bad Gateway"
```bash
# Verificar backend
docker-compose -f docker-compose-qa.yml ps sged-backend-qa
# Debe decir "Up (healthy)"

# Ver logs backend
docker logs sged-backend-qa | tail -50

# Reiniciar
docker-compose -f docker-compose-qa.yml restart sged-backend-qa
```

### "Connection refused"
```bash
# Verificar servicios
docker-compose -f docker-compose-qa.yml ps
# Todos deben estar "Up (healthy)"

# Reiniciar todo
docker-compose -f docker-compose-qa.yml restart
sleep 60  # Esperar a que se estabilice
```

### "Database Connection Error"
```bash
# Verificar BD
docker-compose -f docker-compose-qa.yml ps sged-db-qa

# Ver logs BD
docker logs sged-db-qa | tail -50

# Reiniciar BD + backend
docker-compose -f docker-compose-qa.yml restart sged-db-qa sged-backend-qa
```

### "Certificate error"
```bash
# Verificar certificado
openssl x509 -in nginx/certs/certificate.crt -noout -dates

# Si está expirado, regenerar:
openssl req -x509 -newkey rsa:4096 \
  -keyout nginx/certs/private.key \
  -out nginx/certs/certificate.crt \
  -days 365 -nodes \
  -subj "/CN=sged-qa"

docker-compose -f docker-compose-qa.yml restart nginx
```

---

## 📝 CÓMO REPORTAR ISSUES

### Formato de Reporte
```
TÍTULO: Breve descripción del issue
SEVERIDAD: Critical / High / Medium / Low
REPRODUCIBLE: Sí / No

PASOS PARA REPRODUCIR:
1. ...
2. ...
3. ...

RESULTADO ESPERADO:
...

RESULTADO ACTUAL:
...

LOGS RELEVANTES:
[Pegar logs del backend/nginx]

SCREENSHOTS/VIDEO:
[Adjuntar si aplica]

ENTORNO:
- QA Host: [IP/hostname]
- Navegador: [Chrome 120, Firefox, etc.]
- Usuario: [admin, secretario, etc.]
```

### Contacto Escalación
- **DevOps (primer nivel)**: devops@example.com / Slack #devops
- **Backend (bugs lógica)**: backend-team@example.com / Slack #backend
- **Frontend (bugs UI)**: frontend-team@example.com / Slack #frontend
- **Security (vulnerabilidades)**: security@example.com / Slack #security
- **On-call (emergencias 24/7)**: oncall@example.com

---

## 📚 DOCUMENTOS RELACIONADOS

| Documento | Propósito |
|---|---|
| **QA_LISTO_PARA_TESTING.md** | Guía de acceso y URLs |
| **DEPLOYMENT_GUIDE.md** | Cómo fue deployado |
| **NGINX_SECURITY_GUIDE.md** | Detalles de seguridad |
| **README_INFRAESTRUCTURA.md** | Visión general infraestructura |

---

## ✨ CASOS DE USO PARA TESTING

### Usuarios + Roles
- [ ] Admin puede acceder a todas las secciones
- [ ] Secretario puede crear expedientes
- [ ] Auxiliar puede buscar y ver expedientes
- [ ] Consulta solo puede leer (no crear/editar)
- [ ] Logout funciona correctamente

### Expedientes
- [ ] Crear expediente nuevo
- [ ] Editar expediente existente
- [ ] Buscar expediente por caratula
- [ ] Filtrar por juzgado, estado, etc.
- [ ] Ver historial de cambios

### Documentos
- [ ] Subir documento a expediente
- [ ] Descargar documento
- [ ] Ver vista previa
- [ ] Eliminar documento
- [ ] Comentar en documento

### Performance
- [ ] Página carga en < 2 segundos
- [ ] Búsqueda con 1000+ expedientes funciona
- [ ] Rate limiting bloquea después de 10 req/s
- [ ] No hay memory leaks después de 1 hora uso

### Seguridad
- [ ] HTTPS está habilitado
- [ ] Headers de seguridad presentes
- [ ] Login requiere contraseña válida
- [ ] Token JWT expira correctamente
- [ ] SQL injection no funciona

---

## 🎬 INICIO RÁPIDO

```bash
# 1. Validar QA está up
curl -k https://localhost/api/v1/health

# 2. Abrir navegador
# https://localhost/app/

# 3. Login como admin
# Usuario: admin
# Password: admin123!

# 4. Navegar por la app
# Dashboard → Expedientes → Crear nuevo

# 5. Si algo falla:
# docker-compose logs -f
```

---

## ✅ DEFINICIÓN DE "LISTO PARA PROD"

Antes de pasar a Producción, validar:

- [ ] Suite E2E 100% pasando
- [ ] Load test: p95 < 200ms, error rate < 1%
- [ ] Security test: 0 vulnerabilidades críticas
- [ ] Performance baseline establecido
- [ ] Documentación completada
- [ ] Equipo Backend aprobó calidad
- [ ] Equipo Security aprobó seguridad
- [ ] Aprox. 50+ horas de testing completadas

---

**De**: Agente DevOps/Infraestructura  
**Para**: Agente Testing  
**Status**: ✅ **READY TO TEST**  
**Próximo**: Testing E2E + Load Testing (Fase 8)
