---
Documento: Back end
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

## Back End: API Spring Boot desplegada como WAR en Tomcat

### Objetivo
Documentar la sección backend considerando que:

- la API se construye con **Spring Boot**,
- se despliega como **WAR**,
- corre sobre un **Tomcat** instalado en un servidor físico,
- se conecta a diferentes bases de datos,
- consume lógica de base de datos mediante **Stored Procedures (SP)** para validar y obtener información del expediente,
- y debe conectarse a un **NAS** para obtener expedientes físicos digitalizados.

---

### 1. Plataforma backend

El backend del SGED se basa en:

- **Java 21 LTS**
- **Spring Boot 3.5.x**
- **Spring Security 6.5.x**
- **Spring Data JPA 3.5.x**
- **Hibernate 6.7.x**
- **Oracle Database**
- **Maven**
- **Tomcat** como contenedor de despliegue del WAR

Esto es consistente con el stack técnico aprobado.

---

### 2. Modelo de despliegue

#### 2.1 Empaquetado
La aplicación backend debe empaquetarse como **WAR** para despliegue en Tomcat institucional.

#### 2.2 Entorno de ejecución
El despliegue se realiza sobre:
- **servidor físico del OJ**,
- con **Tomcat** como servidor de aplicaciones,
- y configuración externa por ambiente.

#### 2.3 Configuración externa
Toda configuración sensible debe permanecer fuera del artefacto desplegado:
- credenciales de base de datos,
- secretos JWT,
- rutas NAS,
- parámetros de timeout,
- perfiles de ambiente.

Esto es coherente con la restricción de no hardcodear configuración.

---

### 3. Responsabilidad funcional de la API

La API debe encargarse de:

- exponer endpoints REST del SGED,
- autenticar y autorizar usuarios,
- consultar expedientes y documentos,
- consumir procedimientos almacenados cuando corresponda,
- integrar información de varias fuentes de datos,
- aplicar reglas de negocio del sistema,
- registrar auditoría,
- y entregar respuestas normalizadas al frontend.

---

### 4. Conexión a diferentes bases de datos

Según la arquitectura aprobada, el backend debe conectarse al menos a:

- **Base principal SGED**
- **Base SGTv1** en solo lectura
- **Base SGTv2** en solo lectura

Esta estrategia ya está contemplada en la arquitectura con múltiples DataSources.

#### 4.1 Principio de separación de fuentes
Cada conexión debe mantener una responsabilidad clara:

- **SGED**: persistencia propia del sistema.
- **SGTv1**: consulta de expedientes históricos.
- **SGTv2**: consulta de expedientes activos.

#### 4.2 Buenas prácticas de integración
La lógica de acceso debe:
- aislar la conexión por fuente,
- manejar timeouts,
- controlar errores por disponibilidad,
- y evitar acoplar directamente la lógica de negocio a detalles físicos de cada base.

---

### 5. Uso de Stored Procedures (SP)

### 5.1 Rol de los SP
De acuerdo con tu requerimiento, la API debe consumir **Stored Procedures** para:

- validar expedientes,
- obtener información del expediente,
- consultar estados o metadatos relacionados,
- y aplicar reglas centralizadas en base de datos cuando así esté definido por la infraestructura o sistemas legados.

### 5.2 Criterio de uso
Los SP deben utilizarse especialmente en escenarios donde:
- la lógica ya existe en base de datos,
- se requiere interoperabilidad con sistemas existentes,
- o la validación debe mantenerse centralizada a nivel Oracle.

### 5.3 Buenas prácticas
El consumo de SP debe:
- encapsularse en la capa de acceso a datos o integración,
- no exponerse directamente al controlador,
- devolver contratos claros al servicio de negocio,
- manejar parámetros de entrada y salida de forma consistente,
- registrar errores técnicos sin exponer detalles internos al frontend.

---

### 6. Estructura lógica recomendada del backend

Manteniendo la arquitectura ya definida, el backend debe estructurarse por capas:

#### 6.1 Controladores
Responsables de:
- recibir peticiones HTTP,
- validar entrada,
- delegar al servicio,
- retornar respuestas estandarizadas.

#### 6.2 Servicios
Responsables de:
- orquestar la lógica de negocio,
- combinar información de distintas fuentes,
- decidir si la consulta va a SGED, SGT o NAS,
- registrar auditoría,
- aplicar reglas funcionales.

#### 6.3 Capa de acceso a datos/integración
Responsable de:
- repositorios JPA para entidades SGED,
- integración con SGTv1 y SGTv2,
- invocación de SP,
- acceso a ubicaciones documentales externas como NAS.

Esta separación evita mezclar reglas de negocio con detalles de infraestructura.

---

### 7. Integración con NAS para expedientes físicos

### 7.1 Objetivo
La API debe poder conectarse a un **NAS** para obtener expedientes físicos digitalizados o documentos almacenados externamente.

### 7.2 Rol del NAS dentro del sistema
El NAS debe considerarse una fuente documental externa orientada a:
- consulta,
- obtención,
- lectura de archivos,
- y posible incorporación controlada al flujo documental del expediente.

### 7.3 Consideraciones funcionales
La integración con NAS debe contemplar:

- ubicación de archivos por estructura conocida,
- validación de existencia del recurso,
- acceso controlado por permisos,
- trazabilidad de consulta,
- manejo de indisponibilidad del repositorio,
- separación clara entre documentos SGED y documentos provenientes de almacenamiento externo.

### 7.4 Buenas prácticas
La conexión a NAS debe:
- abstraerse en un servicio específico de integración documental,
- no mezclarse con el acceso directo a la base de datos,
- manejar errores de red y disponibilidad,
- registrar eventos relevantes de acceso,
- proteger rutas y credenciales mediante configuración externa.

---

### 8. Flujo lógico recomendado para consulta de expediente

A nivel funcional, la API debe poder seguir un flujo como este:

1. recibir solicitud del frontend,
2. validar autenticación y permisos,
3. determinar la fuente de información necesaria,
4. consultar base SGED o fuentes SGT según corresponda,
5. invocar SP si la validación o recuperación depende de base de datos,
6. consultar NAS si se requiere expediente físico/documental externo,
7. consolidar la respuesta,
8. registrar auditoría si la operación es exitosa,
9. retornar datos normalizados al frontend.

Esto es consistente con la arquitectura general del SGED y con la política de auditoría existente.

---

### 9. Consideraciones operativas del despliegue en Tomcat

#### 9.1 Artefacto
El backend debe generarse como WAR listo para despliegue institucional.

#### 9.2 Servidor físico
El servidor debe garantizar:
- conectividad hacia Oracle,
- conectividad hacia SGTv1/SGTv2,
- conectividad hacia NAS,
- acceso seguro interno,
- logs de aplicación y operación.

#### 9.3 Configuración por ambiente
Debe mantenerse diferenciación por ambiente:
- desarrollo,
- QA,
- producción.

#### 9.4 Seguridad operacional
El despliegue debe respetar lo ya definido:
- HTTPS,
- JWT,
- RBAC,
- auditoría inmutable,
- control de secretos,
- trazabilidad con logs.
