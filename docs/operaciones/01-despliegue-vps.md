---
Documento: OPERACIONES — 01 DESPLIEGUE VPS
Proyecto: SGED
Version: 1.0
Ultima actualizacion: 2026-05-03
Estado: Vigente
---

# 01 — Despliegue en VPS Lite

## 1. Prerequisitos

Antes de ejecutar cualquier paso de despliegue, verificar que el servidor cumple lo
siguiente:

| Requisito               | Valor minimo / Detalle                              |
|-------------------------|-----------------------------------------------------|
| Sistema operativo       | Ubuntu 22.04 LTS                                    |
| Docker Engine           | Version 24 o superior                              |
| Docker Compose          | Plugin integrado (`docker compose`) v2.x            |
| Puerto 8085 abierto     | Frontend — Nginx                                    |
| Puerto 8086 abierto     | Backend — API REST                                  |
| Puerto 3307 (opcional)  | MySQL (solo si necesitas acceso externo desde DBA)  |
| Espacio en disco        | Minimo 5 GB libres en la particion de datos         |
| Acceso SSH              | Usuario con permisos para ejecutar Docker           |

### Verificar Docker instalado

```bash
docker --version
# Docker version 24.x.x o superior

docker compose version
# Docker Compose version v2.x.x
```

---

## 2. Primer Despliegue (desde cero)

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/organismo-judicial/sged.git
cd sged
```

### Paso 2 — Verificar el archivo de composicion

El archivo principal para VPS Lite es `docker-compose-vps.yml` en la raiz del
repositorio. No usar `docker-compose.yml` ni `docker-compose-prod.yml`.

```bash
ls docker-compose-vps.yml
```

### Paso 3 — Revisar y ajustar variables de entorno en el compose

El archivo `docker-compose-vps.yml` define las variables de entorno directamente.
Para produccion real, editar los valores sensibles antes de levantar:

```bash
# Editar el JWT_SECRET y las credenciales de base de datos
# NUNCA dejar los valores de ejemplo en un entorno publico
nano docker-compose-vps.yml
```

Variables criticas a reemplazar:

| Variable                         | Valor por defecto (ejemplo)                          |
|----------------------------------|------------------------------------------------------|
| `JWT_SECRET`                     | `sged-vps-lite-secret-key-minimum-32-chars-ok`       |
| `SPRING_DATASOURCE_PASSWORD`     | `sged_password`                                      |
| `MYSQL_ROOT_PASSWORD`            | `root_password`                                      |
| `MYSQL_PASSWORD`                 | `sged_password`                                      |

Generar un JWT_SECRET seguro:

```bash
openssl rand -base64 48
```

### Paso 4 — Construir las imagenes

```bash
docker compose -f docker-compose-vps.yml build
```

Este comando construye `sged-backend-lite:latest` y `sged-frontend-lite:latest`
desde los Dockerfiles en `sGED-backend/` y `sGED-frontend/`.

### Paso 5 — Levantar el stack

```bash
docker compose -f docker-compose-vps.yml up -d
```

Aguardar 60-90 segundos para que MySQL inicie y el backend complete el arranque
(incluyendo migraciones Flyway si estan habilitadas).

### Paso 6 — Verificar que todos los servicios estan corriendo

```bash
docker compose -f docker-compose-vps.yml ps
```

Salida esperada:

```
NAME                  IMAGE                      STATUS          PORTS
sged-backend-lite     sged-backend-lite:latest   Up (healthy)    0.0.0.0:8086->8080/tcp
sged-frontend-lite    sged-frontend-lite:latest  Up              0.0.0.0:8085->80/tcp
sged-mysql-lite       mysql:8.0-debian           Up              0.0.0.0:3307->3306/tcp
```

### Paso 7 — Verificar el health endpoint

```bash
curl -s http://localhost:8086/api/health
# Respuesta esperada: {"status":"UP"} o similar
```

Si el backend responde con status UP, el despliegue inicial fue exitoso.

---

## 3. Actualizacion de Version

Cuando hay una nueva version del codigo (push a main/rama de release):

```bash
# 1. Obtener los cambios
git pull origin main

# 2. Reconstruir imagenes con los nuevos artefactos
docker compose -f docker-compose-vps.yml build

# 3. Reemplazar los contenedores en caliente
docker compose -f docker-compose-vps.yml up -d

# Docker Compose actualizara solo los contenedores cuya imagen cambio.
# El volumen mysql_data_lite y sged_docs_lite NO se pierden.

# 4. Verificar estado post-actualizacion
docker compose -f docker-compose-vps.yml ps

# 5. Confirmar health
curl -s http://localhost:8086/api/health
```

---

## 4. Servicios y Puertos del Stack

Definidos en `docker-compose-vps.yml`:

| Contenedor           | Imagen                      | Puerto host | Puerto contenedor | Descripcion                |
|----------------------|-----------------------------|-------------|-------------------|----------------------------|
| `sged-backend-lite`  | `sged-backend-lite:latest`  | 8086        | 8080              | API REST Spring Boot       |
| `sged-frontend-lite` | `sged-frontend-lite:latest` | 8085        | 80                | Frontend Angular + Nginx   |
| `sged-mysql-lite`    | `mysql:8.0-debian`          | 3307        | 3306              | Base de datos MySQL 8      |

Volumenes persistentes declarados:

| Volumen          | Montado en                    | Descripcion                     |
|------------------|-------------------------------|---------------------------------|
| `sged_docs_lite` | `/opt/sged-docs` (backend)    | Documentos subidos por usuarios |
| `mysql_data_lite`| `/var/lib/mysql` (mysql)      | Datos de la base de datos       |

Red interna: `sged-vps-net` (bridge). Los contenedores se comunican usando el
nombre de contenedor como hostname (ej.: `sged-mysql-lite` desde el backend).

---

## 5. Comandos Basicos de Gestion

```bash
# Ver estado de todos los servicios
docker compose -f docker-compose-vps.yml ps

# Ver logs en tiempo real de todos los servicios
docker compose -f docker-compose-vps.yml logs -f

# Ver logs solo del backend (ultimas 100 lineas)
docker logs -f --tail=100 sged-backend-lite

# Ver logs solo de MySQL
docker logs -f --tail=50 sged-mysql-lite

# Reiniciar un servicio especifico (sin bajar los demas)
docker compose -f docker-compose-vps.yml restart sged-backend

# Detener todo el stack (los volumenes se conservan)
docker compose -f docker-compose-vps.yml down

# Detener y eliminar volumenes (DESTRUCTIVO — perder datos)
# docker compose -f docker-compose-vps.yml down -v

# Ver uso de recursos en tiempo real
docker stats sged-backend-lite sged-frontend-lite sged-mysql-lite

# Acceder a la shell del backend
docker exec -it sged-backend-lite /bin/bash

# Acceder a MySQL
docker exec -it sged-mysql-lite mysql -u sged_user -p sged_db
```

---

## 6. Checklist Post-Despliegue

- [ ] `docker compose -f docker-compose-vps.yml ps` muestra todos los servicios activos
- [ ] `curl -s http://localhost:8086/api/health` devuelve status UP
- [ ] Acceso al frontend en `http://<ip-vps>:8085`
- [ ] Login funcional en la aplicacion Angular
- [ ] Los logs del backend no muestran errores criticos de startup
- [ ] Los volumenes `sged_docs_lite` y `mysql_data_lite` estan creados
