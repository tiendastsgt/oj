---
Documento: NGINX_SECURITY_GUIDE
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

# NGINX Security Configuration Guide - SGED Fase 6

## Resumen ejecutivo

Esta guía documenta la configuración de NGINX como reverse proxy seguro para SGED, incluyendo:
- Redirección HTTP → HTTPS obligatoria
- TLS 1.2+ con ciphers fuertes
- Headers de seguridad (HSTS, CSP, X-Frame-Options, etc.)
- Rate limiting en endpoints críticos
- Proxy seguro a backend Java

---

## 1. Configuración TLS/SSL

### Generar certificados autofirmados (QA/Desarrollo)

```bash
# Crear directorio de certificados
mkdir -p nginx/certs
cd nginx/certs

# Generar clave privada (RSA 4096 bits)
openssl genrsa -out private.key 4096

# Generar certificado autofirmado válido por 365 días
openssl req -new -x509 -key private.key -out certificate.crt -days 365 \
  -subj "/C=SV/ST=San Salvador/L=San Salvador/O=Organismo Judicial/CN=sged-qa.local"

# Verificar certificado
openssl x509 -in certificate.crt -text -noout
```

### Certificados Let's Encrypt (Producción)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtener certificado (requiere DNS públicamente resolvible)
sudo certbot certonly --standalone \
  -d sged.example.com \
  -d www.sged.example.com \
  --email admin@example.com

# Renovación automática (cron)
# 0 3 * * * /usr/bin/certbot renew --quiet
```

### Configuración en NGINX (nginx.conf)

```nginx
ssl_certificate /etc/nginx/certs/certificate.crt;
ssl_certificate_key /etc/nginx/certs/private.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
```

---

## 2. Headers de Seguridad

### Explicación por header

| Header | Valor | Propósito |
|--------|-------|----------|
| **Strict-Transport-Security (HSTS)** | `max-age=31536000; includeSubDomains; preload` | Fuerza HTTPS en navegadores (1 año + subdomios + preload list) |
| **X-Content-Type-Options** | `nosniff` | Previene MIME type sniffing (protege contra XSS) |
| **X-Frame-Options** | `DENY` | Impide clickjacking (no se puede embebedar en iframes) |
| **X-XSS-Protection** | `1; mode=block` | Activa XSS filter del navegador |
| **Referrer-Policy** | `no-referrer-when-downgrade` | Controla qué información se envía en referer HTTP |
| **Content-Security-Policy** | Restrictiva con `'self'` | Control granular de qué scripts/estilos se ejecutan |
| **Permissions-Policy** | `geolocation=(), microphone=(), camera=()` | Desactiva permisos de navegador (geo, micrófono, cámara) |

### Configuración en NGINX (producción)

```nginx
# Headers de seguridad (añadir en bloque server HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# CSP (ajustar según necesidades del frontend Angular)
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https:;
  frame-ancestors 'none';
  base-uri 'self';
" always;
```

### CSP Explicada

- **default-src 'self'**: Solo recursos del mismo origen
- **script-src**: Scripts permitidos (nota: 'unsafe-inline' necesario para Angular, considerar nonce)
- **style-src**: Estilos permitidos
- **img-src**: Imágenes locales, data URIs, HTTPS
- **font-src**: Fuentes locales
- **connect-src**: APIs permitidas (mismo origen, HTTPS externo)
- **frame-ancestors 'none'**: No se puede embebedar en iframes

---

## 3. Rate Limiting

### Protección contra DDoS/Fuerza bruta

```nginx
# Definir zonas de rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;      # API general
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;      # Auth (más estricto)

# Aplicar en ubicaciones
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;  # 10 req/s, permitir burst de 20
    proxy_pass http://backend;
}

location /api/v1/auth/ {
    limit_req zone=auth_limit burst=5 nodelay;  # 5 req/s, permitir burst de 5
    proxy_pass http://backend;
}
```

**Valores recomendados**:
- API general: 10 req/s
- Auth (login, cambio contraseña): 5 req/s
- Documentos (descarga): 3 req/s

---

## 4. Configuración de Reverse Proxy Seguro

### Headers proxy (en NGINX)

```nginx
location /api/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    
    # Headers que envía NGINX al backend
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;          # http/https
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    
    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### Backend (Spring Boot) debe validar X-Forwarded-*

En `application.yml`:

```yaml
server:
  servlet:
    context-path: /
  tomcat:
    remoteip:
      remote-ip-header: X-Forwarded-For
      protocol-header: X-Forwarded-Proto
      protocol-header-value: https
```

---

## 5. Protección de Rutas Sensibles

### Bloquear acceso a archivos/carpetas peligrosas

```nginx
# Negar acceso a archivos ocultos
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# Negar acceso a respaldos (~)
location ~ ~$ {
    deny all;
    access_log off;
    log_not_found off;
}

# Negar acceso a directorios de configuración Java
location ~ ^/(WEB-INF|META-INF)/ {
    deny all;
}

# Negar acceso directo a web.xml, pom.xml, etc.
location ~ \.(xml|properties|gradle|maven)$ {
    deny all;
}
```

---

## 6. Logging y Monitoreo

### Formato de log mejorado

```nginx
log_format security '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '"$http_x_forwarded_for" "$ssl_protocol" "$ssl_cipher" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

access_log /var/log/nginx/sged-access.log security;
error_log /var/log/nginx/sged-error.log warn;
```

### Monitoreo en AWS CloudWatch

```yaml
# docker-compose.yml
logging:
  driver: "awslogs"
  options:
    awslogs-group: "/sged/nginx"
    awslogs-region: "us-east-1"
    awslogs-stream-prefix: "qa"
```

### Análisis de logs (detectar anomalías)

```bash
# Top 10 IPs haciendo más requests
tail -f /var/log/nginx/sged-access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Detectar escaneos (user agents sospechosos)
grep -i "bot\|curl\|wget\|sqlmap\|nikto" /var/log/nginx/sged-access.log

# Códigos HTTP 4xx/5xx
grep -E " (4|5)[0-9]{2} " /var/log/nginx/sged-access.log | wc -l
```

---

## 7. Despliegue en QA/Producción

### Validar configuración antes de reloadear

```bash
# Dentro del contenedor NGINX
nginx -t

# O desde el host
docker exec sged-nginx-qa nginx -t
```

### Recargar configuración sin downtime

```bash
# En el contenedor
docker exec sged-nginx-qa nginx -s reload

# O con docker-compose
docker-compose -f docker-compose-qa.yml exec nginx nginx -s reload
```

### Verificar que funciona

```bash
# Test HTTP → HTTPS redirect
curl -I http://localhost
# Output: HTTP/1.1 301 Moved Permanently
#         Location: https://localhost/

# Test HTTPS
curl -k https://localhost/health
# Output: {"status":"UP"}

# Test security headers
curl -I https://localhost | grep -E "Strict-Transport|X-Content-Type"
```

---

## 8. Checklist de Seguridad Pre-Producción

- [ ] Certificado TLS válido (Let's Encrypt o CA confiable)
- [ ] HTTPS obligatorio (redirección 301 desde HTTP)
- [ ] Headers de seguridad presentes (HSTS, CSP, X-Frame-Options, etc.)
- [ ] Rate limiting activo en auth endpoints
- [ ] Acceso a archivos sensibles bloqueado (.env, .git, WEB-INF, etc.)
- [ ] Logs centralizados (CloudWatch, Splunk, ELK)
- [ ] Backend X-Forwarded-* configurado correctamente
- [ ] TLS 1.2+ obligatorio (TLS 1.0/1.1 desactivos)
- [ ] Cipher suites fuertes (no RC4, 3DES, etc.)
- [ ] OCSP Stapling configurado (producción)
- [ ] Sesiones SSL cacheadas (no tickets)
- [ ] Healthchecks funcionando

---

## 9. Referencias

- [OWASP Secure NGINX Configuration](https://owasp.org/www-project-secure-headers/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [NGINX Official Security](https://docs.nginx.com/nginx/admin-guide/security-controls/)
- [CSP Reference](https://content-security-policy.com/)

---

**Mantenedor**: Equipo DevOps/Infraestructura
**Última actualización**: Enero 2026
