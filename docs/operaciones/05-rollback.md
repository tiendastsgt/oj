---
Documento: OPERACIONES — 05 ROLLBACK E INCIDENTES
Proyecto: SGED
Version: 1.0
Ultima actualizacion: 2026-05-03
Estado: Vigente
---

# 05 — Rollback e Incidentes

## 1. Criterios para Activar un Rollback

Activar el procedimiento de rollback cuando se detecte alguna de las siguientes
condiciones despues de una actualizacion de version:

| Condicion                                          | Umbral                             |
|----------------------------------------------------|------------------------------------|
| Tasa de errores 5xx                                | > 5% sostenido por 5 minutos       |
| Backend no responde al health check                | > 30 segundos consecutivos         |
| Error de conexion a base de datos                  | > 30 segundos consecutivos         |
| Error de inicio (`OOM`, `Flyway migration error`)  | Inmediato al detectarse            |
| Latencia de respuesta anormalmente alta            | p99 > 2 segundos por 10 minutos    |

---

## 2. Rollback de Version del Backend

### Paso 1 — Identificar la imagen anterior disponible

```bash
# Listar todas las imagenes del backend disponibles en el servidor
docker images sged-backend-lite

# Salida ejemplo:
# REPOSITORY           TAG       IMAGE ID       CREATED         SIZE
# sged-backend-lite    latest    abc123def456   2 hours ago     320MB
# sged-backend-lite    <none>    old789xyz012   3 days ago      315MB

# O si se usaron tags de version:
docker images | grep sged-backend
```

### Paso 2 — Etiquetar la imagen anterior para poder usarla

Si la imagen anterior perdio su tag (quedó como `<none>`), asignarle uno:

```bash
# Etiquetar por IMAGE ID (usar el ID del docker images del paso anterior)
docker tag old789xyz012 sged-backend-lite:rollback
```

### Paso 3 — Actualizar docker-compose-vps.yml para usar la imagen anterior

Editar `docker-compose-vps.yml` y cambiar la referencia de imagen del servicio
`sged-backend`:

```yaml
# Antes (version nueva con problema):
sged-backend:
  image: sged-backend-lite:latest

# Despues (rollback a imagen anterior):
sged-backend:
  image: sged-backend-lite:rollback
```

Tambien es posible hacer rollback sin editar el compose, recreando el contenedor
con la imagen especificada directamente:

```bash
# Detener y eliminar el contenedor actual del backend
docker compose -f docker-compose-vps.yml stop sged-backend
docker rm sged-backend-lite

# Iniciar con la imagen anterior
docker run -d \
  --name sged-backend-lite \
  --network sged-vps-net \
  --restart unless-stopped \
  -p 8086:8080 \
  --memory 350m \
  -v sged_docs_lite:/opt/sged-docs \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://sged-mysql-lite:3306/sged_db \
  -e SPRING_DATASOURCE_USERNAME=sged_user \
  -e SPRING_DATASOURCE_PASSWORD=sged_password \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver \
  -e SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQL8Dialect \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO=update \
  -e SPRING_FLYWAY_ENABLED=false \
  -e JWT_SECRET=sged-vps-lite-secret-key-minimum-32-chars-ok \
  -e DOCUMENTOS_BASE_PATH=/opt/sged-docs \
  -e DOCUMENTOS_CONVERSION_ENABLED=true \
  -e "JAVA_OPTS=-Xms128m -Xmx256m" \
  sged-backend-lite:rollback
```

### Paso 4 — Verificar que el rollback fue exitoso

```bash
# Esperar que el backend inicie (puede tardar 30-60 segundos)
sleep 45

# Verificar health
curl -s http://localhost:8086/api/health
# Esperado: {"status":"UP"}

# Verificar logs sin errores
docker logs sged-backend-lite 2>&1 | tail -30
docker logs sged-backend-lite 2>&1 | grep -c "ERROR"
```

---

## 3. Nota Importante: Flyway y Migraciones de Base de Datos

**Las migraciones de Flyway NO se revierten automaticamente.**

En el entorno VPS Lite, Flyway esta deshabilitado (`SPRING_FLYWAY_ENABLED=false`).
El esquema de base de datos lo gestiona Hibernate con `ddl-auto: update`.

Para entornos donde Flyway esta habilitado, tener en cuenta:

- Si una nueva version ejecuto migraciones de esquema (nuevas columnas, tablas,
  indices), hacer rollback de la imagen del backend NO revierte esos cambios en la BD.
- La version anterior del backend puede fallar al iniciar si el esquema tiene
  columnas nuevas que el codigo anterior no espera, o si faltan columnas que el
  codigo anterior requeria.

**Procedimiento cuando hay migraciones de esquema involucradas:**

```bash
# 1. Detener el backend
docker compose -f docker-compose-vps.yml stop sged-backend

# 2. Restaurar el backup de MySQL tomado ANTES del despliegue
#    (Ver 04-respaldos.md seccion 5)
gunzip -c /opt/sged-backups/mysql/sged_db_FECHA_PREVIA.sql.gz \
  | docker exec -i sged-mysql-lite \
      mysql -u sged_user -psged_password sged_db

# 3. Iniciar la version anterior del backend
docker compose -f docker-compose-vps.yml start sged-backend

# 4. Verificar
sleep 45
curl -s http://localhost:8086/api/health
```

Siempre tomar un backup completo de MySQL ANTES de cualquier despliegue que incluya
migraciones de esquema.

---

## 4. Runbook de Incidentes

### Incidente: Backend no inicia

**Sintomas:**
- `docker compose ps` muestra `sged-backend-lite` en estado `Restarting` o `Exited`
- `curl http://localhost:8086/api/health` falla con conexion rechazada

**Procedimiento de diagnostico:**

```bash
# 1. Ver los logs de inicio del backend
docker logs sged-backend-lite 2>&1 | tail -60

# 2. Verificar si es un error de configuracion (variables de entorno mal configuradas)
docker inspect sged-backend-lite | grep -A 30 '"Env"'

# 3. Buscar errores especificos conocidos
docker logs sged-backend-lite 2>&1 | grep -iE "error|exception|failed|refused"
```

**Causas comunes y soluciones:**

| Causa                                       | Log caracteristico                                          | Solucion                                                                     |
|---------------------------------------------|-------------------------------------------------------------|------------------------------------------------------------------------------|
| MySQL aun no esta listo al iniciar          | `Communications link failure` / `Connection refused`       | Reiniciar: `docker compose -f docker-compose-vps.yml restart sged-backend` luego de 30 segundos |
| JWT_SECRET muy corto (menos de 32 chars)   | `The specified key byte array is 0 bits...`                 | Actualizar `JWT_SECRET` con valor de al menos 32 caracteres y recrear contenedor |
| Error de Flyway (si esta habilitado)        | `Flyway: Validate failed. Migration ... not resolved`       | Ver seccion 3 de este documento; puede requerir restaurar BD                |
| OOM: Java sin memoria                       | `OutOfMemoryError: Java heap space`                         | Aumentar `JAVA_OPTS`: `-Xmx512m`; verificar limite de memoria del contenedor |
| Ruta de documentos no existe               | `No such file or directory: /opt/sged-docs`                 | Verificar que el volumen `sged_docs_lite` esta montado correctamente         |
| Puerto 8086 en uso por otro proceso         | `Address already in use`                                    | `ss -tlnp | grep 8086`; detener el proceso que usa el puerto                |

---

### Incidente: Base de datos no responde

**Sintomas:**
- `docker compose ps` muestra `sged-mysql-lite` en estado `Restarting` o `Exited`
- Logs del backend muestran `HikariPool ... connection refused`

**Procedimiento:**

```bash
# 1. Verificar estado del contenedor MySQL
docker compose -f docker-compose-vps.yml ps mysql

# 2. Ver logs de MySQL
docker logs sged-mysql-lite 2>&1 | tail -50

# 3. Si el contenedor esta parado, intentar reiniciarlo
docker compose -f docker-compose-vps.yml restart mysql

# 4. Esperar que MySQL este listo (puede tardar 30-60 segundos)
sleep 45

# 5. Verificar que MySQL acepta conexiones
docker exec sged-mysql-lite \
  mysql -u sged_user -psged_password sged_db \
  -e "SELECT 'OK' AS test_conexion;"

# 6. Si MySQL inicio correctamente, reiniciar el backend tambien
docker compose -f docker-compose-vps.yml restart sged-backend
sleep 45
curl -s http://localhost:8086/api/health
```

**Causas comunes:**

| Causa                              | Sintoma en logs MySQL                          | Solucion                                                      |
|------------------------------------|------------------------------------------------|---------------------------------------------------------------|
| Disco lleno                        | `[ERROR] InnoDB: ... out of disk space`        | Liberar espacio; `df -h /`; limpiar backups o logs antiguos   |
| Corrupcion de tablas InnoDB        | `[ERROR] InnoDB: ... Unable to lock ./ibdata1` | Restaurar desde backup (ver 04-respaldos.md)                  |
| Contraseña incorrecta              | `Access denied for user 'sged_user'`           | Verificar `MYSQL_PASSWORD` y `SPRING_DATASOURCE_PASSWORD`     |
| Pool de conexiones agotado         | `HikariPool ... Connection is not available`   | Aumentar `DB_POOL_MAX` o reiniciar backend para liberar conexiones |

---

### Incidente: Disco lleno en el VPS

**Sintomas:**
- Backend falla al escribir documentos
- MySQL no puede escribir nuevos registros
- Logs truncados

**Procedimiento de emergencia:**

```bash
# Verificar espacio
df -h /

# Encontrar los archivos mas grandes
du -sh /opt/sged-backups/* | sort -rh | head -10
du -sh /var/lib/docker/* | sort -rh | head -10

# Limpiar imagenes Docker no utilizadas
docker image prune -f

# Limpiar contenedores detenidos y redes sin uso
docker system prune -f

# Eliminar backups antiguos (ajustar la cantidad de dias)
find /opt/sged-backups/mysql/ -name "*.sql.gz" -mtime +3 -delete

# Verificar espacio recuperado
df -h /
```

---

## 5. Checklist Post-Rollback

Despues de ejecutar un rollback, verificar:

- [ ] `docker compose -f docker-compose-vps.yml ps` muestra todos los servicios en estado Up
- [ ] `curl -s http://localhost:8086/api/health` devuelve `{"status":"UP"}`
- [ ] Los logs del backend no muestran errores criticos
- [ ] El frontend es accesible en el puerto 8085
- [ ] El login de un usuario funciona correctamente
- [ ] Documentar la causa del rollback y la accion tomada
- [ ] Tomar un backup fresco de MySQL despues de estabilizarse
- [ ] Investigar la causa raiz antes del siguiente intento de actualizacion
