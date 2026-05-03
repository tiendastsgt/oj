---
Documento: OPERACIONES — INDEX
Proyecto: SGED
Version: 1.0
Ultima actualizacion: 2026-05-03
Estado: Vigente
---

# Guia de Operaciones — SGED

## Descripcion del Sistema

SGED (Sistema de Gestion de Expedientes Digitales) es una aplicacion web desarrollada
para el Organismo Judicial con el objetivo de digitalizar y gestionar expedientes
judiciales de forma segura y eficiente. El sistema permite crear, buscar, actualizar y
archivar expedientes, asi como adjuntar y convertir documentos (Word → PDF).

El stack de produccion esta optimizado para funcionar en un VPS Lite de 2 GB de RAM,
priorizando el uso minimo de recursos sin sacrificar la disponibilidad ni la experiencia
de usuario.

---

## Secciones de esta Guia

| Archivo                      | Contenido                                                       |
|------------------------------|-----------------------------------------------------------------|
| `01-despliegue-vps.md`       | Prerequisitos, primer despliegue, actualizacion de version      |
| `02-configuracion.md`        | Variables de entorno, perfiles Spring, inyeccion de secrets     |
| `03-monitoreo.md`            | Health check, logs Docker, uso de recursos, alertas comunes     |
| `04-respaldos.md`            | Backup MySQL, backup volumen de documentos, restauracion        |
| `05-rollback.md`             | Volver a version anterior, Flyway, runbook de incidentes        |

---

## Infraestructura

| Componente       | Detalle                                                               |
|------------------|-----------------------------------------------------------------------|
| **Servidor**     | VPS Lite — Ubuntu 22.04 LTS, 2 GB RAM, 2 vCPU                       |
| **Orquestacion** | Docker Compose (`docker-compose-vps.yml`)                             |
| **Proxy inverso**| Nginx (integrado en el contenedor `sged-frontend-lite`, puerto 8085) |
| **Backend**      | Spring Boot 3.5, Java 21, imagen `sged-backend-lite:latest`          |
| **Base de datos**| MySQL 8.0 Debian, imagen oficial `mysql:8.0-debian`                  |
| **Almacenamiento de documentos** | Volumen Docker persistente `sged_docs_lite`        |
| **Datos BD**     | Volumen Docker persistente `mysql_data_lite`                         |
| **Red interna**  | Bridge network `sged-vps-net`                                        |
| **Health endpoint** | `GET /api/health` (expuesto internamente en el contenedor)        |

---

## Servicios y Puertos

| Contenedor           | Puerto host | Puerto interno | Descripcion              |
|----------------------|-------------|----------------|--------------------------|
| `sged-backend-lite`  | 8086        | 8080           | API REST Spring Boot     |
| `sged-frontend-lite` | 8085        | 80             | Frontend Angular + Nginx |
| `sged-mysql-lite`    | 3307        | 3306           | Base de datos MySQL 8    |

---

## Limites de Recursos

| Servicio             | Limite de memoria |
|----------------------|-------------------|
| `sged-backend-lite`  | 350 MB            |
| `sged-frontend-lite` | 30 MB             |
| `sged-mysql-lite`    | 200 MB            |

---

## Referencias Internas

- `docs/infra/DEPLOYMENT_GUIDE.md` — Guia detallada de despliegue QA/Produccion
- `docs/infra/ROLLBACK_PLAN_PRODUCCION.md` — Plan de rollback con criterios de activacion
- `docs/infra/MONITOREO_OPERACIONES_PRODUCCION.md` — Metricas y alertas de produccion
- `docs/infra/RUNBOOK_OPERACIONES_PRODUCCION.md` — Comandos frecuentes de operaciones
- `docs/infra/GUIA_SECRETS_INYECCION.md` — Manejo de secrets en backend
- `docker-compose-vps.yml` — Definicion completa de servicios para VPS Lite
