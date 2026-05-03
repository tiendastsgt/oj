---
Documento: OPERACIONES — 03 MONITOREO
Proyecto: SGED
Version: 1.0
Ultima actualizacion: 2026-05-03
Estado: Vigente
---

# 03 — Monitoreo del Sistema

## 1. Health Check

El backend expone un endpoint de salud que retorna el estado general del sistema.
Es el primer comando a ejecutar ante cualquier sospecha de problema.

```bash
# Health check directo al backend (desde el VPS)
curl -s http://localhost:8086/api/health

# Respuesta esperada cuando el sistema esta bien:
# {"status":"UP"}
```

El endpoint esta configurado en `application.yml` bajo
`management.endpoints.web.exposure.include: health,info`.

Para verificar el health desde fuera del VPS (dominio publico o IP):

```bash
curl -s http://<ip-vps>:8086/api/health
```

---

## 2. Estado de los Contenedores

```bash
# Ver el estado de todos los contenedores del stack
docker compose -f docker-compose-vps.yml ps

# Salida esperada (todos en estado Up):
# NAME                  STATUS
# sged-backend-lite     Up (healthy)
# sged-frontend-lite    Up
# sged-mysql-lite       Up

# Ver todos los contenedores Docker en el servidor (no solo SGED)
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 3. Logs de los Contenedores

### Logs en tiempo real

```bash
# Todos los servicios del stack a la vez
docker compose -f docker-compose-vps.yml logs -f

# Solo el backend (recomendado para debuggear errores de negocio)
docker logs -f --tail=100 sged-backend-lite

# Solo MySQL
docker logs -f --tail=50 sged-mysql-lite

# Solo el frontend/Nginx
docker logs -f --tail=50 sged-frontend-lite
```

### Buscar errores especificos

```bash
# Buscar errores en los logs del backend
docker logs sged-backend-lite 2>&1 | grep -i "ERROR" | tail -20

# Buscar excepciones de Java
docker logs sged-backend-lite 2>&1 | grep -i "Exception" | tail -10

# Ver logs de los ultimos 5 minutos
docker logs --since=5m sged-backend-lite

# Ver logs de la ultima hora y filtrar errores
docker logs --since=1h sged-backend-lite 2>&1 | grep -c "ERROR"
```

### Errores de base de datos

```bash
# Buscar problemas de conexion a MySQL
docker logs sged-backend-lite 2>&1 | grep -i "connection\|hikari\|mysql"

# Ver logs de MySQL directamente
docker logs sged-mysql-lite 2>&1 | tail -30
```

---

## 4. Uso de Recursos

### En tiempo real

```bash
# Ver CPU y memoria de todos los contenedores SGED
docker stats sged-backend-lite sged-frontend-lite sged-mysql-lite

# Sin modo interactivo (una sola captura, util en scripts)
docker stats --no-stream sged-backend-lite sged-frontend-lite sged-mysql-lite
```

Columnas clave en la salida de `docker stats`:

| Columna      | Significado                                    |
|--------------|------------------------------------------------|
| `CPU %`      | Porcentaje de CPU consumido                    |
| `MEM USAGE`  | Memoria actual utilizada vs limite configurado |
| `MEM %`      | Porcentaje de uso sobre el limite              |
| `NET I/O`    | Trafico de red entrante / saliente             |
| `BLOCK I/O`  | Lecturas / escrituras en disco                 |

### Limites de memoria configurados

| Contenedor           | Limite | Uso normal esperado |
|----------------------|--------|---------------------|
| `sged-backend-lite`  | 350 MB | 200–320 MB          |
| `sged-frontend-lite` | 30 MB  | 10–25 MB            |
| `sged-mysql-lite`    | 200 MB | 120–180 MB          |

Si el backend se acerca a 340 MB de forma sostenida, considerar reiniciarlo o
investigar una posible fuga de memoria.

### Espacio en disco

```bash
# Ver espacio ocupado por volumenes Docker
docker system df -v | grep -E "sged_docs_lite|mysql_data_lite"

# Espacio total disponible en el servidor
df -h /
```

---

## 5. Script de Monitoreo Manual

El siguiente script genera un resumen del estado del sistema cada 5 minutos:

```bash
#!/bin/bash
# Guardar como /opt/sged-scripts/monitor.sh y ejecutar con:
# bash /opt/sged-scripts/monitor.sh

while true; do
  clear
  echo "=============================================="
  echo "SGED — Monitoreo VPS Lite"
  echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=============================================="

  echo ""
  echo "--- HEALTH ---"
  curl -s --max-time 5 http://localhost:8086/api/health || echo "BACKEND NO RESPONDE"

  echo ""
  echo "--- CONTENEDORES ---"
  docker compose -f /ruta/al/proyecto/docker-compose-vps.yml ps

  echo ""
  echo "--- RECURSOS ---"
  docker stats --no-stream sged-backend-lite sged-frontend-lite sged-mysql-lite

  echo ""
  echo "--- ERRORES RECIENTES (ultimos 5 min) ---"
  docker logs --since=5m sged-backend-lite 2>&1 | grep -i "ERROR" | tail -5 \
    || echo "Sin errores recientes"

  echo ""
  echo "Proximo chequeo en 5 minutos..."
  sleep 300
done
```

---

## 6. Tabla de Alertas Comunes

| Sintoma observado                        | Causa probable                                    | Accion correctiva                                                                                                    |
|------------------------------------------|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `curl /api/health` no responde           | Backend caido o reiniciando                       | `docker compose -f docker-compose-vps.yml ps`; si el contenedor esta detenido: `docker compose ... up -d sged-backend` |
| Backend usa >340 MB de memoria           | Fuga de memoria o carga alta                      | Reiniciar: `docker compose -f docker-compose-vps.yml restart sged-backend`                                           |
| Logs muestran `HikariPool ... connection refused` | MySQL no esta listo o caido         | Revisar `docker logs sged-mysql-lite`; reiniciar MySQL si necesario                                                  |
| Logs muestran `Flyway error` al iniciar  | Migracion Flyway con conflicto de esquema         | Ver seccion 05-rollback.md; requiere intervencion manual del DBA                                                     |
| Frontend devuelve 502 Bad Gateway        | El backend no responde a Nginx                    | Verificar que `sged-backend-lite` esta arriba; revisar `BACKEND_URL` en el contenedor frontend                       |
| MySQL en estado `Restarting`             | Error critico en la BD (disco lleno, corrruption) | `docker logs sged-mysql-lite`; verificar espacio en disco; restaurar desde backup si hay corrupcion                  |
| `docker stats` muestra CPU al 100%       | Consultas lentas, GC de JVM o ataque             | Revisar logs del backend por excepciones; `docker exec sged-backend-lite top`                                        |
| Conversion de documentos falla           | LibreOffice no instalado en imagen o error tmp    | Verificar `DOCUMENTOS_CONVERSION_ENABLED=true`; revisar logs del backend por errores de conversion                   |
| `JWT expired` en todas las respuestas    | `JWT_EXPIRATION_MS` muy bajo o relojes desincronizados | Verificar valor de `JWT_EXPIRATION_MS`; sincronizar hora del servidor con NTP                                |

---

## 7. Checklist Diario de Monitoreo

Ejecutar cada manana (menos de 5 minutos):

```bash
# 1. Estado general
docker compose -f docker-compose-vps.yml ps

# 2. Health del backend
curl -s http://localhost:8086/api/health

# 3. Errores en la ultima hora
docker logs --since=1h sged-backend-lite 2>&1 | grep -c "ERROR"
# Esperado: 0 o muy pocos (< 5)

# 4. Uso de recursos
docker stats --no-stream sged-backend-lite sged-mysql-lite

# 5. Espacio en disco
df -h /
# Si supera el 80%, limpiar logs o backups antiguos
```
