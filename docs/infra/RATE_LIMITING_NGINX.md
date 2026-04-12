---
Documento: RATE_LIMITING_NGINX
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Estado: ✅ Vigente
---

# 🚦 Guía de Rate Limiting (Nginx)

Para proteger la disponibilidad del sistema contra ataques de fuerza bruta y DoS, se ha implementado una capa de **Rate Limiting** directamente en Nginx.

## 1. Zonas de Limitación

Las zonas están definidas en el contexto `http` de la configuración de Nginx (`nginx-prod.conf`):

```nginx
# Zonas definidas por IP ($binary_remote_addr)
limit_req_zone $binary_remote_addr zone=general:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;
```

## 2. Aplicación en Auth Endpoints

La protección más estricta se aplica a los endpoints de autenticación para mitigar ataques de diccionario:

```nginx
location /api/v1/auth/ {
    limit_req zone=auth burst=5 nodelay;
    limit_req_status 429;
    proxy_pass http://backend;
}
```

### Parámetros Explicados:
- **rate=5r/s:** Límite base de 5 peticiones por segundo por IP.
- **burst=5:** Permite una ráfaga temporal de hasta 5 peticiones adicionales por encima del límite antes de rechazar.
- **nodelay:** Las peticiones dentro del burst se procesan inmediatamente; si se excede el burst, se devuelve `429` al instante.
- **status 429:** Código HTTP estándar para "Too Many Requests".

---

## 3. Monitoreo y Ajuste

### Logs de Rechazo
Cuando un usuario es limitado, Nginx registrará el evento en el archivo de error log:
`limiting requests, excess: 0.500 by zone "auth", client: <IP>`

### Cómo aumentar los límites
Si se detectan falsos positivos en una red interna muy concurrida (muchos usuarios tras la misma IP), se recomienda:
1. Aumentar el `burst` (ej. `burst=20`).
2. Ajustar el `rate` a `10r/s` o `20r/s`.
3. Recargar Nginx: `nginx -s reload`.

---

## 4. Diferencia con el Backend
> [!NOTE]
> El backend Java **no tiene** lógica de Rate Limiting. Esto es intencional para descargar al servidor de aplicaciones de esta tarea y filtrar el tráfico malicioso lo antes posible en la capa de infraestructura.
