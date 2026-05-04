---
Documento: PLAN_DETALLADO_SGED
Proyecto: SGED
Versión del sistema: v1.2.4
Versión del documento: 1.2
Última actualización: 2026-05-03
Vigente para: v1.2.4 (en desarrollo) y superiores
Estado: ✅ Vigente (Nueva Línea Base)
Responsable: Agente de Documentación
---

# PLAN TRABAJO DETALLADO - VISOR DOCUMENTAL OJ

## 1. Introducción
El presente documento constituye el Plan de Trabajo Detallado para el diseño, desarrollo e implementación del Sistema Informático Visor Documental del Organismo Judicial de Guatemala. Este plan se elabora en cumplimiento del Anexo 1 del contrato de asistencia técnica y sirve como referencia oficial para el seguimiento del proyecto.

El sistema tiene como objetivo centralizar la consulta de expedientes judiciales, integrando documentos, imágenes, audios y videos provenientes de los sistemas SGTv1, SGTv2 y la base de datos Oracle institucional, de forma segura, auditable y accesible vía web para los Juzgados de la Niñez y Adolescencia y de Adolescentes en Conflicto con la Ley Penal.

### 1.1 Objetivos del documento
•	Validar y detallar los requisitos funcionales y no funcionales del sistema.
•	Describir la arquitectura técnica de integración de datos.
•	Presentar el cronograma de sprints para los 5 meses de ejecución.
•	Definir las narrativas de usuario aprobadas con sus criterios de aceptación.

---

## 2. Análisis y Validación de Requisitos
A continuación se presenta la matriz de validación de los requisitos especificados en el Anexo 1. Cada requisito ha sido revisado por el equipo técnico y contrastado con las posibilidades tecnológicas del entorno institucional del Organismo Judicial.

### 2.1 Requisitos Funcionales (RF)
| ID | Descripción | Prioridad | Sprint | Estado |
|----|-------------|-----------|--------|--------|
| RF1 | Carga de expedientes con múltiples archivos asociados por expediente. | Alta | Sprint 3 | Validado |
| RF2 | Visualización en línea de documentos PDF, Word y RTF sin descarga obligatoria. | Alta | Sprint 4 | Validado |
| RF3 | Reproducción de audios y videos (mp4, mov, avi, wmv) desde la plataforma. | Alta | Sprint 4 | Validado |
| RF4 | Visualización de imágenes en distintos formatos (jpg, png, entre otros). | Media | Sprint 4 | Validado |
| RF5 | Búsqueda rápida por número/nomenclatura de expediente judicial. | Alta | Sprint 5 | Validado |
| RF6 | Generación de hasta 10 reportes con filtros: rango de fechas, número de expediente, nombre del menor. | Media | Sprint 6 | Validado |
| RF7 | Gestión de usuarios y roles diferenciados (CRUD de usuarios). | Alta | Sprint 2 | Validado |
| RF8 | Registro de auditoría de accesos y operaciones del sistema. | Alta | Sprint 7 | Validado |
| RF9 | Consulta general de información principal del expediente judicial. | Alta | Sprint 3 | Validado |
| RF10 | Integración de actuaciones e informes institucionales (Trabajo Social, Psicología). | Alta | Sprint 5 | Validado |

### 2.2 Requisitos No Funcionales (RNF)
| ID | Descripción | Categoría | Estado |
|----|-------------|-----------|--------|
| RNF1 | Acceso vía web desde cualquier navegador moderno. | Accesibilidad | Validado |
| RNF2 | Compatibilidad con Chrome, Firefox, Edge (versiones actuales). | Compatibilidad | Validado |
| RNF3 | Interfaz amigable, intuitiva y responsiva (adaptable a distintos dispositivos). | Usabilidad | Validado |
| RNF4 | Integridad de los datos y respaldo conforme a prácticas institucionales del OJ. | Integridad | Validado |
| RNF5 | Protocolos de seguridad y estándares del Organismo Judicial (autenticación, roles). | Seguridad | Validado |
| RNF6 | Escalabilidad para crecimiento de usuarios y volumen de expedientes. | Escalabilidad | Validado |
| RNF7 | Despliegue on-premise en infraestructura del Organismo Judicial. | Infraestructura | Validado |
| RNF8 | Control de versiones Git con commits diarios y cortes semanales. | DevOps | Validado |

---

## 3. Arquitectura Técnica de Integración
La siguiente sección describe el flujo técnico de obtención de documentos del Visor Documental, basado en el diseño propuesto y validado por el equipo técnico. El sistema utiliza un enfoque de alta disponibilidad mediante conexiones DB Link redundantes hacia las bases de datos Oracle.

### 3.1 Componentes del sistema
| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| Front-End | Angular (última versión estable) | Interfaz web responsiva para búsqueda, visualización y reportes. |
| Back-End / API | Java (estándares OJ) | API REST que orquesta las solicitudes entre front-end, SP y servicios de archivos. |
| Servicio Web/DB | Web Service interno / Oracle | Capa intermedia que centraliza el acceso a datos del Organismo Judicial. |
| Base de Datos | Oracle (SGTv1 / SGTv2) | Repositorio principal de expedientes y datos judiciales. Acceso de solo lectura. |
| Stored Procedure | Oracle SP (PL/SQL) | Procedimiento almacenado que ejecuta las consultas y maneja la lógica de DB Links. |
| DB Link_db01 | Oracle DB Link | Conexión primaria a la base de datos de expedientes (IMG, Video, Audio, Docs). |
| DB Link_db02 | Oracle DB Link | Conexión secundaria de respaldo, activa si DB Link_db01 no está disponible. |
| Memoria / Cache | Memoria del servidor (heap Java) | Resultados de cada conexión guardados en memoria para respuesta rápida al cliente. |

### 3.2 Flujo de obtención de documentos
El siguiente flujo describe el proceso completo desde que el usuario solicita un expediente hasta que los archivos (imágenes, video, audio, documentos) son presentados en pantalla:

1. El usuario ingresa el número de expediente en la interfaz Angular y presiona 'Buscar'.
2. El front-end realiza una llamada HTTP a la API REST (Java).
3. La API invoca el Servicio Web/DB del Organismo Judicial, que valida la sesión y permisos.
4. El Servicio Web ejecuta el Stored Procedure (SP) en la base de datos Oracle.
5. El SP valida la disponibilidad de DB Link_db01 (conexión primaria).
6. **Fase de obtención (db01):**
    - SI DB Link_db01 está activo → busca el ExpID y recupera los archivos (IMG, Video, Audio). El resultado se guarda en memoria.
    - NO (DB Link_db01 falla) → registra el error 'Error DB Link_db01', guarda el estado en memoria y procede a validar DB Link_db02.
7. El SP valida la disponibilidad de DB Link_db02 (conexión secundaria de respaldo).
8. **Fase de obtención (db02):**
    - SI DB Link_db02 está activo → busca el ExpID y recupera los archivos. El resultado se guarda en memoria.
    - NO (DB Link_db02 falla) → registra 'Error DB Link_db02' y guarda en memoria. El sistema retorna un mensaje de error controlado al usuario.
9. La API compila los archivos recuperados (de DB Link_db01 o _db02) y los retorna al front-end.
10. Angular renderiza el visor: muestra PDFs/Word con visor embebido, reproduce audio/video con player HTML5 y despliega imágenes en galería.

### 3.3 Estrategia de alta disponibilidad
El uso de dos DB Links (db01 y db02) garantiza continuidad del servicio ante fallas de red o mantenimiento de la base de datos primaria. Los resultados de cada intento de conexión se almacenan en memoria, lo que permite al sistema registrar el comportamiento de cada DB Link por sesión y ofrecer trazabilidad para auditoría técnica.

---

## 4. Plan de Trabajo Detallado – Sprints
El proyecto se ejecuta en un período de 5 meses (20 semanas), organizado en 10 sprints de 2 semanas cada uno. Cada sprint tiene un objetivo claro, entregables verificables y se somete a revisión al finalizar (Sprint Review) con participación del equipo del Organismo Judicial.

### 4.1 Resumen de sprints
| Sprint | Período | Objetivo | Entregables clave |
|--------|---------|----------|-------------------|
| **Sprint 1** | Sem 1–2 | Levantamiento y análisis | • Validación de requisitos, Bocetos de wireframes, Plan de trabajo. |
| **Sprint 2** | Sem 3–4 | Diseño de arquitectura y BD | • Diseño de BD, Setup de ambiente (Ang/Java/Ora), Gestión de usuarios. |
| **Sprint 3** | Sem 5–6 | Backend: integración Oracle y SP | • SP implementado, DB Links configurados, Carga de expedientes funcional. |
| **Sprint 4** | Sem 7–8 | Visor de archivos: docs, imágenes, A/V | • Visor embebido, Reproductor A/V, Integración API archivos. |
| **Sprint 5** | Sem 9–10 | Búsqueda y consulta de expedientes | • Búsqueda por nomenclatura, Informes institucionales, Filtros avanzados. |
| **Sprint 6** | Sem 11–12| Reportes y exportaciones | • 10 reportes parametrizables, Exportación PDF/Excel. |
| **Sprint 7** | Sem 13–14| Seguridad y auditoría | • Módulo de auditoría de accesos, Control por roles. |
| **Sprint 8** | Sem 15–16| Pruebas de integración y rendimiento| • Pruebas unitarias (cobertura ≥ 80%), Pruebas de carga. |
| **Sprint 9** | Sem 17–18| Pruebas de aceptación (UAT) | • Acta de resultados UAT, Documentación completa. |
| **Sprint 10**| Sem 19–20| Despliegue, capacitación y cierre| • Despliegue on-premise, Manuales, Capacitación. |

### 4.2 Cronograma mensual
| Actividad / Hito | Mes 1 | Mes 2 | Mes 3 | Mes 4 | Mes 5 |
|------------------|-------|-------|-------|-------|-------|
| Análisis y validación de requisitos | ✓ | | | | |
| Diseño de arquitectura y base de datos | ✓ | ✓ | | | |
| Setup de ambientes y control de versiones | ✓ | | | | |
| Módulo de gestión de usuarios y roles | ✓ | | | | |
| Backend: API REST y conexión Oracle | | ✓ | | | |
| SP y DB Links (db01/db02) | | ✓ | | | |
| Visor de documentos, imágenes y A/V | | ✓ | ✓ | | |
| Búsqueda y consulta de expedientes | | | ✓ | | |
| Módulo de reportes | | | ✓ | ✓ | |
| Seguridad y auditoría | | | | ✓ | |
| Pruebas unitarias e integración | | | | ✓ | |
| Pruebas de aceptación (UAT) | | | | | ✓ |
| Despliegue productivo on-premise | | | | | ✓ |
| Documentación y manuales | | | | ✓ | ✓ |
| Capacitación a usuarios | | | | | ✓ |
| Entrega final y cierre del proyecto | | | | | ✓ |

---

## 5. Narrativas e Historias de Usuario Aprobadas
Definidas con la Gerencia de Informática del Organismo Judicial.

### HU-01 – Búsqueda de expediente judicial (Sprint 5)
Como usuario autorizado, quiero buscar un expediente ingresando su número, para acceder rápidamente a la información.
- **Criterios:** Resultados < 3s, incluye juzgado/partes/estado, mensaje "no encontrado" si no existe.

### HU-02 – Visualización de documentos en línea (Sprint 4)
Como juez/secretario, quiero visualizar PDF, Word y RTF directamente en el navegador sin descarga.
- **Criterios:** Visor embebido, zoom/navegación, carga PDF 5MB < 5s en LAN.

### HU-03 – Reproducción de audios y videos (Sprint 4)
Como usuario autorizado, quiero reproducir archivos de audio y video directamente desde el sistema.
- **Criterios:** Soporta mp4/mov/avi/mp3, controles nativos, streaming progresivo.

### HU-04 – Gestión de usuarios y roles (Sprint 2)
Como administrador, acceso a CRUD de usuarios y asignación de roles.
- **Criterios:** Roles Juez/Secretario/Consultor/Admin, bloqueo de cuentas, logs de auditoría.

### HU-05 – Generación de reportes (Sprint 6)
Filtros por fechas, expediente y nombre del menor.
- **Criterios:** Exportación PDF/Excel, vista previa, generación < 10s para 1k registros.

### HU-06 – Auditoría de accesos y operaciones (Sprint 7)
Registro de usuario, fecha, acción, expediente e IP.
- **Criterios:** Inmutable, filtros por fecha/usuario, accesible solo por Administradores.

### HU-07 – Integración con SGTv1 y SGTv2 via Oracle (Sprint 3)
Mecanismo de failover entre DB Links.
- **Criterios:** Validación de db01 antes de ejecutar, fallback automático a db02, solo lectura.

### HU-08 – Visualización de galería de imágenes (Sprint 4)
Galería organizada con miniaturas y zoom.
- **Criterios:** Soporta jpg/png/tiff, muestra nombre y fecha de carga.

---

## 6. Entregables y Criterios de Aceptación
1. Documento de análisis y diseño (S1).
2. Narrativas e Historias de Usuario (S1).
3. Cronograma de sprints (S1).
4. Documentación técnica SP/DB Links (S3).
5. Módulo de gestión de usuarios (S2).
6. Sistema Visor Documental funcional (S8).
7. Reporte de pruebas unitarias/E2E (S9).
8. Manual de usuario (S9).
9. Manual técnico (S9).
10. Código fuente en repositorio institucional (S10).
11. Capacitación y constancias (S10).
12. Acta de entrega final (S10).

---

## 7. Identificación de Riesgos y Mitigación
- **R01 (Accesos Oracle):** Gestionar desde S1.
- **R02 (Falla de ambos DB Links):** Alertas automáticas y notificación a DBA.
- **R03 (Cambio de requisitos):** Gestión de cambios formal.
- **R04 (Rendimiento):** Pruebas de carga en S8; optimización SP.
- **R05 (Resistencia al cambio):** Involucramiento temprano y UAT.

---

## 8. Equipo del Proyecto y Responsabilidades
- **Líder de Proyecto:** Coordinación y riesgos.
- **Arquitecto:** Diseño técnico (Meses 1-3).
- **Desarrolladores Backend (2):** Java + Oracle SP.
- **Desarrollador Frontend:** Angular + Reproductor A/V.
- **DBA/Integración:** DB Links y optimización.
- **QA / Tester:** Pruebas y UAT.
- **Documentador:** Manuales y guías de despliegue.

---

## 9. Glosario y Abreviaciones
- **DB Link:** Enlace Oracle para bases de datos remotas.
- **SGTv1/v2:** Sistemas origen de datos del Organismo Judicial.
- **Sprint:** Iteración de 2 semanas.
- **Visor:** Sistema Informático Visor Documental.
