---
Documento: OPERACIONES — 02 CONFIGURACION
Proyecto: SGED
Version: 1.0
Ultima actualizacion: 2026-05-03
Estado: Vigente
---

# 02 — Configuracion del Sistema

## 1. Variables de Entorno

Todas las variables que controlan el comportamiento del sistema se inyectan a los
contenedores desde `docker-compose-vps.yml`. La tabla siguiente incluye cada variable
con su valor actual en VPS Lite y una descripcion de su proposito.

### Backend (`sged-backend-lite`)

| Variable de entorno                            | Valor en VPS Lite                                  | Descripcion                                              |
|------------------------------------------------|----------------------------------------------------|----------------------------------------------------------|
| `SPRING_DATASOURCE_URL`                        | `jdbc:mysql://sged-mysql-lite:3306/sged_db`        | URL JDBC de conexion a MySQL                             |
| `SPRING_DATASOURCE_USERNAME`                   | `sged_user`                                        | Usuario de base de datos                                 |
| `SPRING_DATASOURCE_PASSWORD`                   | `sged_password`                                    | Contrasena de base de datos (cambiar en produccion)      |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME`          | `com.mysql.cj.jdbc.Driver`                         | Driver JDBC MySQL 8                                      |
| `SPRING_JPA_DATABASE_PLATFORM`                 | `org.hibernate.dialect.MySQL8Dialect`              | Dialecto JPA para MySQL 8                                |
| `SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT`      | `org.hibernate.dialect.MySQL8Dialect`              | Dialecto Hibernate (redundante por compatibilidad)       |
| `SPRING_JPA_HIBERNATE_DDL_AUTO`                | `update`                                           | Estrategia DDL: `update` en VPS, `validate` en standard |
| `SPRING_FLYWAY_ENABLED`                        | `false`                                            | Flyway deshabilitado en VPS (DDL auto gestionado)        |
| `JWT_SECRET`                                   | `sged-vps-lite-secret-key-minimum-32-chars-ok`     | Clave secreta para firmar tokens JWT (cambiar)           |
| `DOCUMENTOS_BASE_PATH`                         | `/opt/sged-docs`                                   | Ruta interna del volumen de documentos                   |
| `DOCUMENTOS_CONVERSION_ENABLED`                | `true`                                             | Habilita conversion Word→PDF                             |
| `JAVA_OPTS`                                    | `-Xms128m -Xmx256m --add-opens ...`                | Opciones de JVM para limitar memoria a 256 MB de heap    |

### Frontend (`sged-frontend-lite`)

| Variable de entorno | Valor en VPS Lite              | Descripcion                            |
|---------------------|--------------------------------|----------------------------------------|
| `BACKEND_URL`       | `http://51.161.32.204:8086`    | URL publica del backend accedida por el cliente Angular |

### Base de datos MySQL (`sged-mysql-lite`)

| Variable de entorno    | Valor en VPS Lite | Descripcion                                   |
|------------------------|-------------------|-----------------------------------------------|
| `MYSQL_ROOT_PASSWORD`  | `root_password`   | Contrasena del usuario root (cambiar)         |
| `MYSQL_DATABASE`       | `sged_db`         | Nombre de la base de datos creada al inicio   |
| `MYSQL_USER`           | `sged_user`       | Usuario de aplicacion                         |
| `MYSQL_PASSWORD`       | `sged_password`   | Contrasena del usuario de aplicacion (cambiar)|

---

## 2. Variables de application.yml (Valores por Defecto)

El archivo `sGED-backend/src/main/resources/application.yml` define los valores por
defecto que se usan cuando una variable de entorno no esta presente. Los valores
entre `${}` y despues de `:` son los defaults.

| Propiedad Spring                          | Variable de entorno          | Default                            |
|-------------------------------------------|------------------------------|------------------------------------|
| `spring.datasource.url`                   | `DB_URL`                     | `jdbc:oracle:thin:@localhost:1521/SGED` |
| `spring.datasource.username`              | `DB_USER`                    | `sged`                             |
| `spring.datasource.password`              | `DB_PASSWORD`                | `change-me`                        |
| `spring.datasource.hikari.maximum-pool-size` | `DB_POOL_MAX`             | `10`                               |
| `spring.datasource.hikari.minimum-idle`   | `DB_POOL_MIN`                | `2`                                |
| `spring.datasource.hikari.connection-timeout` | `DB_POOL_TIMEOUT_MS`    | `30000`                            |
| `spring.datasource.hikari.keepalive-time` | —                            | `60000` ms                         |
| `spring.datasource.hikari.max-lifetime`   | —                            | `1800000` ms (30 min)              |
| `jwt.secret`                              | `JWT_SECRET`                 | `change-me`                        |
| `jwt.expiration-ms`                       | `JWT_EXPIRATION_MS`          | `28800000` (8 horas)               |
| `sged.documentos.storage.base-path`       | `DOCUMENTOS_BASE_PATH`       | `C:/sged/documentos`               |
| `sged.documentos.storage.max-size-bytes`  | `DOCUMENTOS_MAX_SIZE`        | `104857600` (100 MB)               |
| `sged.documentos.storage.conversion.enabled` | `DOCUMENTOS_CONVERSION_ENABLED` | `true`                     |
| `spring.servlet.multipart.max-file-size`  | —                            | `100MB`                            |
| `spring.servlet.multipart.max-request-size` | —                          | `100MB`                            |
| `management.endpoints.web.exposure.include` | —                          | `health,info`                      |

---

## 3. Perfiles de Spring

El backend soporta los siguientes perfiles declarados en `application.yml`:

| Perfil   | Uso                                               | Como activar                             |
|----------|---------------------------------------------------|------------------------------------------|
| `default`| Configuracion base (production-like, Oracle)      | No se especifica perfil                  |
| `dev`    | Desarrollo local con H2 en memoria               | `SPRING_PROFILES_ACTIVE=dev`             |
| `qa`     | Entorno QA con H2 en memoria                      | `SPRING_PROFILES_ACTIVE=qa`              |
| `test`   | Tests unitarios con H2                            | Activado automaticamente por Maven tests |

En el VPS Lite el perfil activo es `default` pero con las variables de entorno
sobreescritas para conectarse a MySQL en vez de Oracle.

Para ver el perfil activo al arrancar:

```bash
docker logs sged-backend-lite | grep "The following profiles are active"
```

---

## 4. Procedimiento de Inyeccion de Secrets

### Opcion A — Variables directas en docker-compose (VPS Lite actual)

El metodo actual en `docker-compose-vps.yml` inyecta valores directamente en la
seccion `environment`. Es el metodo mas simple pero menos seguro para valores
sensibles.

```yaml
environment:
  JWT_SECRET: sged-vps-lite-secret-key-minimum-32-chars-ok
  SPRING_DATASOURCE_PASSWORD: sged_password
```

Para cambiar un valor: editar el archivo y recrrar el contenedor:

```bash
# Editar el docker-compose-vps.yml con el nuevo valor
nano docker-compose-vps.yml

# Recrear solo el contenedor afectado
docker compose -f docker-compose-vps.yml up -d --force-recreate sged-backend
```

### Opcion B — Docker Secrets (Produccion avanzada)

El backend soporta la lectura de variables desde archivos mediante la convencion
`VARIABLE_FILE`. El `SecretsPropertySourceLocator` de Spring detecta variables
terminadas en `_FILE` y lee el contenido del archivo apuntado.

```bash
# Crear directorio de secrets (fuera del repo)
mkdir -p /opt/sged-secrets
chmod 700 /opt/sged-secrets

# Generar secrets seguros
openssl rand -base64 48 > /opt/sged-secrets/jwt_secret.txt
openssl rand -base64 32 > /opt/sged-secrets/db_password.txt
chmod 600 /opt/sged-secrets/*.txt
```

En `docker-compose-vps.yml` reemplazar las variables directas por:

```yaml
environment:
  JWT_SECRET_FILE: /run/secrets/jwt_secret
  SPRING_DATASOURCE_PASSWORD_FILE: /run/secrets/db_password
secrets:
  jwt_secret:
    file: /opt/sged-secrets/jwt_secret.txt
  db_password:
    file: /opt/sged-secrets/db_password.txt
```

### Precedencia de Variables

El sistema respeta el siguiente orden (de mayor a menor prioridad):

1. Variables de entorno directas (`JWT_SECRET=valor`)
2. Variables tipo `_FILE` (`JWT_SECRET_FILE=/ruta/archivo`)
3. Valores por defecto en `application.yml` (`${JWT_SECRET:change-me}`)

---

## 5. Actualizacion de Secrets en Caliente

Para rotar el JWT_SECRET sin reiniciar la base de datos:

```bash
# 1. Generar nuevo secret
NEW_JWT=$(openssl rand -base64 48)
echo "Nuevo JWT_SECRET: $NEW_JWT"

# 2. Actualizar en docker-compose-vps.yml
#    Reemplazar el valor de JWT_SECRET con el nuevo

# 3. Recrrar solo el backend (MySQL no se toca)
docker compose -f docker-compose-vps.yml up -d --force-recreate sged-backend

# 4. Verificar que el backend inicio correctamente
docker logs sged-backend-lite | tail -20
curl -s http://localhost:8086/api/health

# NOTA: Rotar el JWT_SECRET invalida todos los tokens activos.
# Los usuarios en sesion deberan iniciar sesion nuevamente.
```
