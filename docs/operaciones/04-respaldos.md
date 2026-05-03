---
Documento: OPERACIONES — 04 RESPALDOS
Proyecto: SGED
Version: 1.0
Ultima actualizacion: 2026-05-03
Estado: Vigente
---

# 04 — Respaldos (Backups)

## 1. Que se debe respaldar

El sistema SGED tiene dos fuentes de datos criticas que deben respaldarse de
forma independiente:

| Fuente                  | Contenedor        | Volumen Docker     | Descripcion                       |
|-------------------------|-------------------|--------------------|-----------------------------------|
| Base de datos MySQL     | `sged-mysql-lite` | `mysql_data_lite`  | Expedientes, usuarios, documentos metadata |
| Archivos de documentos  | `sged-backend-lite` | `sged_docs_lite` | PDFs, Word, archivos subidos por usuarios |

---

## 2. Backup Manual de MySQL con mysqldump

### Backup completo de la base de datos

```bash
# Crear directorio de backups si no existe
mkdir -p /opt/sged-backups/mysql

# Ejecutar mysqldump dentro del contenedor MySQL
docker exec sged-mysql-lite \
  mysqldump \
    -u sged_user \
    -psged_password \
    --single-transaction \
    --routines \
    --triggers \
    --databases sged_db \
  > /opt/sged-backups/mysql/sged_db_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el archivo fue creado y tiene contenido
ls -lh /opt/sged-backups/mysql/
```

### Backup comprimido (recomendado para ahorrar espacio)

```bash
docker exec sged-mysql-lite \
  mysqldump \
    -u sged_user \
    -psged_password \
    --single-transaction \
    --routines \
    --triggers \
    sged_db \
  | gzip > /opt/sged-backups/mysql/sged_db_$(date +%Y%m%d_%H%M%S).sql.gz

# Verificar integridad del archivo comprimido
gzip -t /opt/sged-backups/mysql/sged_db_*.sql.gz && echo "OK"
```

El flag `--single-transaction` garantiza que el dump sea consistente sin bloquear
tablas, lo cual es seguro para usar con InnoDB (motor de MySQL usado en SGED).

---

## 3. Backup Automatizado con Cron

Configurar un cron job para ejecutar el backup diariamente a las 2:00 AM:

```bash
# Abrir el crontab del usuario actual (o root)
crontab -e
```

Agregar la siguiente linea:

```cron
# Backup MySQL de SGED — diario a las 2:00 AM
0 2 * * * docker exec sged-mysql-lite mysqldump -u sged_user -psged_password --single-transaction sged_db | gzip > /opt/sged-backups/mysql/sged_db_$(date +\%Y\%m\%d).sql.gz 2>> /opt/sged-backups/mysql/backup.log
```

Verificar que el cron esta activo:

```bash
crontab -l | grep sged
```

Para validar manualmente que el script de cron funciona:

```bash
docker exec sged-mysql-lite mysqldump \
  -u sged_user \
  -psged_password \
  --single-transaction \
  sged_db \
  | gzip > /opt/sged-backups/mysql/test_backup.sql.gz \
  && echo "Backup exitoso" || echo "ERROR en backup"
```

---

## 4. Backup del Volumen de Documentos con tar

El volumen `sged_docs_lite` esta montado en `/opt/sged-docs` dentro del
contenedor `sged-backend-lite`. Para respaldarlo:

```bash
# Crear directorio de backups de documentos
mkdir -p /opt/sged-backups/docs

# Pausar escrituras al volumen (opcional pero recomendado)
# Si no es posible pausar, tar igual crea un snapshot consistente en la mayoria de casos.

# Backup del volumen usando un contenedor temporal
docker run --rm \
  -v sged_docs_lite:/source:ro \
  -v /opt/sged-backups/docs:/backup \
  alpine \
  tar -czf /backup/sged_docs_$(date +%Y%m%d_%H%M%S).tar.gz -C /source .

# Verificar el archivo
ls -lh /opt/sged-backups/docs/
tar -tzf /opt/sged-backups/docs/sged_docs_*.tar.gz | head -20
```

Este metodo usa un contenedor Alpine temporal con acceso de solo lectura al volumen,
evitando interferir con el backend mientras esta corriendo.

### Backup del volumen MySQL (alternativa a mysqldump)

```bash
docker run --rm \
  -v mysql_data_lite:/source:ro \
  -v /opt/sged-backups/mysql-vol:/backup \
  alpine \
  tar -czf /backup/mysql_vol_$(date +%Y%m%d_%H%M%S).tar.gz -C /source .
```

Nota: El backup del volumen raw de MySQL solo deberia restaurarse con la misma
version de MySQL. Para restauraciones entre versiones, usar mysqldump.

---

## 5. Procedimiento de Restauracion

### Restaurar la base de datos desde mysqldump

```bash
# 1. Detener el backend para evitar escrituras durante la restauracion
docker compose -f docker-compose-vps.yml stop sged-backend

# 2. Restaurar el dump (reemplazar FECHA con el nombre del archivo)
gunzip -c /opt/sged-backups/mysql/sged_db_FECHA.sql.gz \
  | docker exec -i sged-mysql-lite \
      mysql -u sged_user -psged_password sged_db

# 3. Verificar la restauracion
docker exec sged-mysql-lite \
  mysql -u sged_user -psged_password sged_db \
  -e "SELECT COUNT(*) AS total_expedientes FROM expedientes;"

# 4. Reiniciar el backend
docker compose -f docker-compose-vps.yml start sged-backend

# 5. Verificar health
sleep 30
curl -s http://localhost:8086/api/health
```

### Restaurar el volumen de documentos

```bash
# 1. Detener el backend
docker compose -f docker-compose-vps.yml stop sged-backend

# 2. Crear un contenedor temporal para restaurar el volumen
docker run --rm \
  -v sged_docs_lite:/dest \
  -v /opt/sged-backups/docs:/backup:ro \
  alpine \
  sh -c "rm -rf /dest/* && tar -xzf /backup/sged_docs_FECHA.tar.gz -C /dest"

# 3. Reiniciar el backend
docker compose -f docker-compose-vps.yml start sged-backend

# 4. Verificar health
sleep 30
curl -s http://localhost:8086/api/health
```

---

## 6. Politica de Retencion Recomendada

| Tipo de backup          | Frecuencia   | Retencion recomendada        |
|-------------------------|--------------|------------------------------|
| MySQL dump (diario)     | Diario       | Ultimos 7 dias (diarios)     |
| MySQL dump (semanal)    | Semanal      | Ultimas 4 semanas            |
| MySQL dump (mensual)    | Mensual      | Ultimos 3 meses              |
| Volumen de documentos   | Semanal      | Ultimas 2 semanas            |

Script de limpieza para aplicar la retencion de 7 dias en backups MySQL:

```bash
# Eliminar backups MySQL con mas de 7 dias de antiguedad
find /opt/sged-backups/mysql/ -name "*.sql.gz" -mtime +7 -delete
echo "Backups antiguos eliminados: $(date)"
```

Agregar al cron para ejecutar despues del backup diario:

```cron
# Limpiar backups MySQL con mas de 7 dias — diario a las 2:30 AM
30 2 * * * find /opt/sged-backups/mysql/ -name "*.sql.gz" -mtime +7 -delete >> /opt/sged-backups/mysql/cleanup.log 2>&1
```

---

## 7. Verificacion del Backup

Siempre verificar los backups despues de crearlos:

```bash
# Verificar que el archivo existe y no esta vacio
ls -lh /opt/sged-backups/mysql/sged_db_$(date +%Y%m%d)*.sql.gz

# Verificar integridad del gzip
gzip -t /opt/sged-backups/mysql/sged_db_$(date +%Y%m%d)*.sql.gz && echo "Integridad OK"

# Ver cuantas tablas tiene el dump (debe ser > 10 para SGED)
zcat /opt/sged-backups/mysql/sged_db_$(date +%Y%m%d)*.sql.gz \
  | grep "^CREATE TABLE" | wc -l
```
