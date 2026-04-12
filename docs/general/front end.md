---
Documento: front end
Proyecto: SGED
Versión del sistema: v1.0.0
Versión del documento: 1.0
Última actualización: 2026-04-11
Vigente para: v1.0.0 y superiores
Estado: ✅ Vigente
---

## Front End: Estructura de la página del visor documental

### Objetivo
Documentar cómo se estructurará la página del visor documental en **Angular 21**, indicando:
- dónde se mostrará cada documento,
- cómo se ordenarán,
- cómo se visualizarán,
- cómo funcionarán las búsquedas avanzadas,
- y cómo se aplicará el ordenamiento por fecha o tipo de documento.

---

### 1. Ubicación funcional dentro del sistema

La funcionalidad del visor documental se integra en el flujo ya definido del SGED, específicamente dentro de:

- **Módulo de Expedientes**
- **Pantalla de detalle de expediente**
- **Pestaña o panel de Documentos**

Esto mantiene consistencia con la documentación existente, donde los documentos siempre están vinculados a un expediente y se administran desde su detalle.

---

### 2. Tecnología frontend

La implementación se realiza con:

- **Angular 21.x LTS**
- **TypeScript 5.7+**
- **PrimeNG 21.x**
- **RxJS 7.9+**

La interfaz debe respetar la arquitectura modular ya definida en el proyecto:
- `core/`
- `shared/`
- `features/documentos/`
- `features/expedientes/`

---

### 3. Estructura funcional de la página del visor

La página del visor documental debe estructurarse como una vista compuesta dentro del detalle del expediente, con tres zonas principales:

#### 3.1 Encabezado del expediente
Debe mostrar el contexto del expediente actual:
- número de expediente,
- tipo de proceso,
- juzgado,
- estado,
- referencia SGT si existe.

Esto evita que el usuario pierda contexto mientras consulta documentos.

---

#### 3.2 Panel de gestión documental
Debe ubicarse debajo o dentro de una pestaña del detalle del expediente, y contener:

- listado de documentos del expediente,
- filtros de búsqueda,
- ordenamiento,
- acciones por documento,
- acceso a carga de archivos según permisos,
- acceso al visor o reproductor según tipo de archivo.

---

#### 3.3 Área de visualización
Debe abrir el documento seleccionado en una zona de visualización consistente, que puede implementarse como:

- modal,
- panel lateral,
- o vista expandida,

según el tipo de archivo y la experiencia definida para el sistema.

La decisión debe priorizar:
- continuidad del flujo del usuario,
- claridad visual,
- mínimo número de clics,
- y consistencia con el diseño ya documentado.

---

### 4. Organización visual del listado de documentos

El listado documental debe presentarse en formato tabla, utilizando un componente de datos paginado, consistente con el resto del sistema.

#### 4.1 Información mínima por documento
Cada fila debe mostrar como mínimo:

- nombre original del documento,
- tipo de documento,
- tamaño,
- extensión,
- categoría,
- usuario de creación,
- fecha de creación,
- acciones disponibles.

Esto está alineado con el modelo de datos y con los DTOs ya definidos.

---

#### 4.2 Acciones por documento
Las acciones visibles dependen del rol del usuario y deben incluir, según corresponda:

- **Ver**
- **Descargar**
- **Imprimir**
- **Eliminar** (si la política lo permite y el rol lo autoriza)

Estas acciones ya están contempladas en la documentación funcional y en la matriz de permisos.

---

### 5. Visualización según tipo de documento

La visualización debe seguir estrictamente el comportamiento ya definido en la documentación del proyecto.

#### 5.1 PDF
Los archivos PDF deben visualizarse en el navegador mediante visor integrado.

Capacidades esperadas:
- navegación,
- zoom,
- descarga,
- impresión.

---

#### 5.2 Word
Los archivos Word no se visualizan directamente como Word.
Deben mostrarse a través de su **conversión a PDF desde backend**, manteniendo una experiencia uniforme con el visor PDF.

---

#### 5.3 Imágenes
Las imágenes deben abrirse en visor de imagen con capacidades de:
- ampliación,
- ajuste,
- descarga,
- impresión cuando aplique.

---

#### 5.4 Audio
Los archivos de audio deben reproducirse mediante reproductor nativo HTML5.

---

#### 5.5 Video
Los archivos de video deben reproducirse mediante reproductor nativo HTML5, con soporte de controles estándar y pantalla completa cuando el navegador lo permita.

---

#### 5.6 Formatos no visualizables nativamente
Cuando un archivo no pueda visualizarse de forma directa en navegador, el sistema debe ofrecer:
- descarga,
- metadatos,
- y mensaje claro al usuario.

No debe forzarse una experiencia inconsistente.

---

### 6. Búsqueda dentro del listado de documentos

La página del visor debe incluir capacidades de búsqueda documental a nivel expediente.

#### 6.1 Búsqueda simple
Debe permitir localizar documentos del expediente por:
- nombre del archivo,
- tipo de documento,
- extensión,
- categoría.

La búsqueda debe ser clara, rápida y orientada a reducir el tiempo de localización.

---

#### 6.2 Búsqueda avanzada
Si se requiere búsqueda avanzada dentro del conjunto de documentos del expediente, debe apoyarse en filtros combinables, por ejemplo:

- tipo de documento,
- categoría del archivo,
- rango de fechas de carga,
- usuario que cargó el documento,
- estado lógico del documento (activo/eliminado, si aplica a perfiles autorizados).

Esto debe seguir el patrón ya definido para las búsquedas avanzadas del sistema:
- filtros combinables,
- resultados paginados,
- limpieza de filtros,
- ordenamiento por columnas.

---

### 7. Ordenamiento de documentos

El listado documental debe permitir ordenamiento al menos por los criterios solicitados y alineados al modelo existente.

#### 7.1 Ordenamiento por fecha
Debe permitirse ordenar por:
- fecha de creación ascendente,
- fecha de creación descendente.

Este ordenamiento es prioritario porque responde al uso natural del expediente y a la secuencia documental.

---

#### 7.2 Ordenamiento por tipo de documento
Debe permitirse ordenar por:
- tipo de documento,
- categoría,
- o nombre del documento, si está disponible como columna ordenable.

---

#### 7.3 Ordenamiento recomendado por defecto
Por buenas prácticas y por trazabilidad documental, el orden por defecto debe privilegiar:
- **fecha de creación descendente**,
para mostrar primero los documentos más recientes.

---

### 8. Paginación y volumen de documentos

El listado debe manejar paginación consistente con el resto del sistema.

Valores esperados:
- 10,
- 25,
- 50 registros por página.

Esto evita sobrecarga visual y mantiene el rendimiento en expedientes con alto volumen documental.

---

### 9. Reglas de interacción y permisos

La interfaz debe respetar completamente RBAC y la regla de juzgado ya definidas.

#### 9.1 Acciones por rol
- **ADMINISTRADOR**: acceso total sobre visualización y gestión documental.
- **SECRETARIO**: carga, visualización, descarga, impresión y eliminación según política vigente.
- **AUXILIAR**: carga y consulta, sin acciones restringidas de administración documental.
- **CONSULTA**: solo visualización, descarga e impresión.

#### 9.2 Regla por juzgado
Para usuarios no administradores, la interacción documental debe limitarse a expedientes de su juzgado.

---

### 10. Comportamiento UX esperado

La página del visor documental debe cumplir con los principios ya establecidos de:
- simplicidad,
- consistencia,
- feedback visual,
- accesibilidad,
- eficiencia.

Por lo tanto, debe incluir:

- estados de carga,
- mensajes claros en español,
- estado vacío cuando no existan documentos,
- confirmación visual de acciones exitosas,
- mensajes de error comprensibles,
- deshabilitación temporal de acciones mientras haya operaciones en curso.

---

### 11. Estructura funcional recomendada del frontend

Sin entrar en código, la estructura debe mantenerse dentro de la organización ya definida:

- `features/expedientes/` para el detalle del expediente,
- `features/documentos/` para los componentes documentales especializados,
- `shared/` para elementos reutilizables,
- `core/` para servicios, guards e interceptores.

Los componentes documentales deben separarse por responsabilidad:
- listado,
- carga,
- visor,
- reproductores,
- filtros.

Esto mantiene mantenibilidad y coherencia con Angular 21 y la arquitectura del proyecto.

---


---

## Sección consolidada sugerida para tu documento

### Front End
La página del visor documental del SGED se estructurará dentro del detalle del expediente, en una sección específica de documentos. La implementación se realizará con Angular 21 y PrimeNG, manteniendo la arquitectura modular ya definida para el proyecto. El usuario visualizará un listado paginado de documentos asociados al expediente, con columnas de identificación, tipo documental, categoría, tamaño, usuario de carga y fecha de creación. Desde este listado podrá ejecutar acciones según su rol: ver, descargar, imprimir y, cuando corresponda, eliminar.

La visualización del contenido dependerá del tipo de archivo. Los PDF se mostrarán en visor integrado; los documentos Word se presentarán convertidos a PDF por backend; las imágenes se abrirán en visor de imagen; y los archivos de audio y video se reproducirán con reproductores nativos HTML5. El listado deberá soportar búsqueda y filtrado documental, así como ordenamiento por fecha de carga y por tipo de documento, priorizando por defecto la fecha de creación descendente. Todo el comportamiento visual y funcional deberá respetar los principios de simplicidad, consistencia, accesibilidad, feedback visual y control por roles ya definidos para SGED.

### Back End
El backend del SGED se implementará con Spring Boot sobre Java 21 y se desplegará como archivo WAR en un servidor Tomcat instalado sobre infraestructura física institucional. La API expondrá los servicios REST del sistema y centralizará la lógica de negocio, autenticación, autorización, auditoría e integración con fuentes externas. Su operación contemplará la conexión a múltiples bases de datos Oracle, incluyendo la base principal de SGED y las fuentes legadas SGTv1 y SGTv2 en modo solo lectura.

Para validaciones y recuperación de información del expediente, la API podrá consumir Stored Procedures definidos en base de datos, especialmente en escenarios donde la lógica de validación o integración dependa de Oracle o de sistemas existentes. Asimismo, la API deberá integrar acceso a un NAS institucional para consultar expedientes físicos digitalizados o documentos almacenados externamente, encapsulando esta integración en una capa específica de servicios. Toda configuración sensible, incluyendo conexiones, rutas y credenciales, deberá gestionarse externamente al artefacto desplegado, respetando las políticas de seguridad, trazabilidad y mantenibilidad establecidas en el proyecto.