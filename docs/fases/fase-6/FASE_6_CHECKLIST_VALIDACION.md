---
Documento: FASE_6_CHECKLIST_VALIDACION
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.0
Última actualización: 2026-05-03
Vigente para: v1.2.4 y superiores
Estado: ✅ Vigente
---

# Fase 6 - Checklist de Validación y Despliegue

## Pre-Despliegue (QA)

### Infraestructura
- [ ] Certificados TLS generados (openssl)
  ```bash
  openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/private.key \
    -out nginx/certs/certificate.crt -days 365 -nodes
  ```
- [ ] Variables `.env.qa` configuradas
- [ ] Directorio `data/` creado con permisos correctos
  ```bash
  mkdir -p data/documentos data/oracle-db
  chmod 755 data/*
  ```

### Backend
- [ ] Maven build exitoso
  ```bash
  cd sGED-backend && ./mvnw clean package -DskipTests
  ```
- [ ] Tests pasando
  ```bash
  ./mvnw verify -Ptest-coverage
  ```
- [ ] Perfil `qa` configurado en `application.yml`
- [ ] X-Forwarded-* headers configurados en Spring Boot

### Frontend
- [ ] npm ci sin errores
  ```bash
  cd sGED-frontend && npm ci
  ```
- [ ] Build Angular completado
  ```bash
  npm run build
  ```
- [ ] `dist/sged-frontend/` contiene index.html + assets

### NGINX
- [ ] `nginx/nginx.conf` válido
  ```bash
  docker run --rm -v $(pwd)/nginx:/etc/nginx:ro nginx:latest nginx -t
  ```
- [ ] Certificados en `nginx/certs/`
- [ ] Headers de seguridad presentes:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Content-Security-Policy`

### Docker Compose
- [ ] `docker-compose-qa.yml` válido
  ```bash
  docker-compose -f docker-compose-qa.yml config > /dev/null
  ```
- [ ] Todas las imágenes pueden ser builtdas
  ```bash
  docker-compose -f docker-compose-qa.yml build
  ```

---

## Despliegue (QA)

### Levantamiento de stack
- [ ] Servicios se levantan sin errores
  ```bash
  docker-compose -f docker-compose-qa.yml up -d
  ```
- [ ] Todos los servicios en estado "Up (healthy)"
  ```bash
  docker-compose -f docker-compose-qa.yml ps
  ```

### Health checks
- [ ] Backend responde en `http://localhost:8080/health`
  ```bash
  curl -s http://localhost:8080/health | jq .status
  # Output: "UP"
  ```
- [ ] NGINX responde en `https://localhost/health`
  ```bash
  curl -k -s https://localhost/health | jq .status
  # Output: "UP"
  ```
- [ ] Frontend accesible en `https://localhost/app/`
  ```bash
  curl -k -s https://localhost/app/ | grep -q "<!DOCTYPE" && echo "OK"
  ```

### Validación de seguridad
- [ ] HTTP redirige a HTTPS (301)
  ```bash
  curl -I http://localhost/ | grep "301\|Location: https"
  ```
- [ ] Headers de seguridad presentes
  ```bash
  curl -I -k https://localhost/ | grep -E "Strict-Transport|X-Content-Type|X-Frame"
  # Debe listar todos los headers
  ```
- [ ] Rate limiting funciona
  ```bash
  for i in {1..20}; do 
    curl -s https://localhost/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"test","password":"test"}' \
      -o /dev/null -w "%{http_code}\n" -k
  done
  # Después de 5 req/s: 429
  ```

### Funcionalidad API
- [ ] Login API responde
  ```bash
  curl -k -X POST https://localhost/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password"}' | jq '.token'
  # Debe devolver token
  ```
- [ ] Endpoints documentos accesibles
  ```bash
  TOKEN=$(curl -k -X POST https://localhost/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password"}' | jq -r '.token')
  
  curl -k -H "Authorization: Bearer $TOKEN" \
    https://localhost/api/v1/expedientes | jq .
  # Debe devolver lista de expedientes
  ```

### Persistencia de datos
- [ ] Datos persisten después de restart
  ```bash
  # Crear expediente
  curl -k -X POST https://localhost/api/v1/expedientes \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"numero":"EXP-2026-001"}' | jq '.id'
  
  # Detener servicios
  docker-compose -f docker-compose-qa.yml down
  
  # Reiniciar
  docker-compose -f docker-compose-qa.yml up -d
  
  # Verificar que expediente sigue
  curl -k https://localhost/api/v1/expedientes | jq '.[] | select(.numero=="EXP-2026-001")'
  # Debe encontrar el expediente
  ```

### Logs
- [ ] No hay errores críticos en logs
  ```bash
  docker-compose logs | grep -i "error" | grep -v "INFO\|DEBUG"
  # No debe devolver nada
  ```
- [ ] Backend inicia correctamente
  ```bash
  docker logs sged-backend-qa | grep "Started\|Tomcat"
  ```
- [ ] NGINX reinicia sin problemas
  ```bash
  docker logs sged-nginx-qa | grep "master process"
  ```

---

## Post-Despliegue

### Documentación
- [ ] README_INFRAESTRUCTURA.md actualizado
- [ ] NGINX_SECURITY_GUIDE.md disponible
- [ ] DEPLOYMENT_GUIDE.md disponible
- [ ] SECRETS_MANAGEMENT.md disponible

### Backup
- [ ] BD tiene snapshot
  ```bash
  docker exec sged-db-qa sqlplus -s sys/as sysdba << EOF
  CREATE RESTORE POINT qa_baseline;
  EXIT;
  EOF
  ```
- [ ] Documentos respaldados
  ```bash
  rsync -av data/documentos /backup/documentos-$(date +%Y%m%d)
  ```

### Monitoreo
- [ ] Alertas configuradas (CPU, memoria, disk)
- [ ] Logs centralizados (si aplica)
- [ ] Métricas de NGINX/Backend visibles

---

## CI/CD (GitHub Actions)

### Workflow ci.yml
- [ ] CodeQL analysis job presente
- [ ] Backend tests job exitoso
- [ ] Frontend tests job exitoso
- [ ] Docker build job buildea imágenes
- [ ] DAST job configurado (nightly)

### Validación
- [ ] PR triggers workflow automáticamente
- [ ] Push a develop/main triggers workflow
- [ ] Artifacts (JaCoCo, frontend-coverage) se generan
- [ ] Fallos en tests bloquean merge a main

---

## Producción

### Pre-despliegue
- [ ] Certificado TLS válido (Let's Encrypt)
  ```bash
  openssl x509 -in /etc/letsencrypt/live/sged.example.com/fullchain.pem -noout -dates
  ```
- [ ] Secretos en Vault/GitHub Secrets
  ```bash
  # Verificar JWT_SECRET en GitHub Secrets
  # Verificar DB_PASSWORD en Vault
  ```
- [ ] BD Oracle en servidor separado (accesible)
  ```bash
  sqlplus sged/password@sged.example.com:1521/SGED "select 1 from dual;"
  ```
- [ ] Storage NFS montado para documentos
  ```bash
  mount | grep /mnt/sged/documentos
  ```

### Despliegue
- [ ] `docker-compose-prod.yml` usa secrets correctamente
- [ ] Logs remoto configurado (CloudWatch, Splunk)
- [ ] Health checks más estrictos (retries=5)
- [ ] Recursos limitados (CPU, memoria)

### Post-despliegue
- [ ] HTTPS obligatorio
  ```bash
  curl -I http://sged.example.com/ | grep 301
  ```
- [ ] Certificado válido
  ```bash
  openssl s_client -connect sged.example.com:443 -servername sged.example.com < /dev/null | grep "Verify return code: 0"
  ```
- [ ] Headers de seguridad presentes
- [ ] Rate limiting activo
- [ ] Backups automáticos en schedule
- [ ] Alertas activas

---

## Rollback

### En caso de problemas
1. [ ] Identificar problema (error en logs)
2. [ ] Documentar (ticket de soporte)
3. [ ] Revert a versión anterior
   ```bash
   docker-compose -f docker-compose-qa.yml down
   # Cambiar tag en yaml: latest → v1.2.0
   docker-compose -f docker-compose-qa.yml up -d
   ```
4. [ ] Validar health checks
5. [ ] Comunicar a equipo

---

## Sign-off

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| DevOps Lead | _________ | ___/___/___ | _________ |
| QA Lead | _________ | ___/___/___ | _________ |
| Security | _________ | ___/___/___ | _________ |
| Manager | _________ | ___/___/___ | _________ |

---

**Preparado por**: Agente DevOps/Infraestructura
**Revisado por**: Equipo de Seguridad
**Aprobado por**: Orquestador SGED
