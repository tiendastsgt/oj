# Capitulo 6 — Panel principal (Dashboard)

## Objetivo de este capitulo

Al terminar de leer este capitulo usted sabra:
- Como acceder al panel principal del sistema.
- Que informacion muestran los indicadores del panel.
- Como interpretar cada contador para tomar decisiones rapidas.

---

## 6.1 Que es el panel principal

El **panel principal** (tambien llamado Dashboard) es la primera pantalla que ve al iniciar sesion en el SGED. Su proposito es darle una vista general e inmediata del estado de la informacion gestionada en el sistema, sin necesidad de navegar por cada modulo.

El panel muestra indicadores numericos actualizados que resumen la actividad documental y el estado de los expedientes registrados.

---

## 6.2 Como acceder al panel principal

El panel principal se carga automaticamente al iniciar sesion. Sin embargo, puede volver a el en cualquier momento:

1. Haga clic en la opcion **Panel principal** o **Dashboard** del menu lateral izquierdo.
2. O bien, haga clic en el nombre o logotipo del sistema en la barra superior.

El panel se actualiza con los datos mas recientes cada vez que lo visita.

---

## 6.3 Indicadores disponibles en el panel

El panel principal muestra los siguientes contadores e indicadores:

| Indicador | Descripcion | Para que sirve |
|-----------|-------------|----------------|
| **Total de expedientes** | Numero total de expedientes registrados en el sistema, independientemente de su estado. | Conocer el volumen total de la base documental gestionada. |
| **Expedientes activos** | Cantidad de expedientes con estado "Activo". | Identificar cuantos casos estan en tramite actualmente. |
| **Expedientes archivados** | Cantidad de expedientes con estado "Archivado". | Medir el volumen de casos concluidos o resguardados. |
| **Expedientes suspendidos** | Cantidad de expedientes con estado "Suspendido". | Identificar casos en espera o con tramite interrumpido. |
| **Total de documentos cargados** | Numero total de archivos subidos al sistema en todos los expedientes. | Evaluar el nivel de digitalizacion documental alcanzado. |
| **Documentos recientes** | Documentos subidos en el periodo mas reciente (generalmente los ultimos 7 o 30 dias, segun configuracion). | Monitorear la actividad reciente de carga de documentos. |

> [!NOTE]
> Los valores de los indicadores reflejan el estado en tiempo real de la base de datos del sistema. Cada vez que se crea un expediente, se cambia su estado, o se sube un documento, los contadores del panel se actualizan automaticamente.

---

## 6.4 Como usar los indicadores para su trabajo diario

Los indicadores del panel le permiten obtener una vision rapida de la situacion sin necesidad de revisar cada expediente individualmente. Algunos ejemplos de uso practico:

- Si el contador de **expedientes activos** es muy alto, puede significar que hay muchos casos abiertos que requieren atencion.
- Si el contador de **documentos recientes** muestra una cifra baja, podria indicar poca actividad de digitalizacion en los ultimos dias.
- Comparar el total de expedientes con los activos y archivados le da una idea de la proporcion de casos en curso versus cerrados.

> [!TIP]
> Use el panel como punto de partida al inicio de su jornada laboral para tener una referencia rapida del estado general antes de comenzar a trabajar en expedientes especificos.

---

## 6.5 Acceso a los modulos desde el panel

En algunos casos, los indicadores del panel son interactivos: al hacer clic sobre un indicador, el sistema puede llevarlo directamente al listado de expedientes filtrado por el criterio correspondiente. Por ejemplo, hacer clic en "Expedientes activos" podria llevarle directamente al listado mostrando solo los expedientes con estado Activo.

Si esta funcionalidad esta disponible en su version del sistema, aproveche estos accesos directos para ganar tiempo.

---

## Permisos del panel principal

| Accion | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|--------|:-----:|:----------:|:--------:|:--------:|
| Ver el panel principal | Si | Si | Si | Si |
| Ver todos los indicadores | Si | Si | Si | Si |
| Acceder a modulos desde el panel | Si | Si | Si | Si |

> [!NOTE]
> Todos los roles tienen acceso al panel principal. Sin embargo, los valores que muestran los indicadores pueden variar segun los permisos de cada rol: algunos roles podrian ver unicamente los expedientes o documentos a los que tienen acceso.

---

*Capitulo anterior: [Busqueda de expedientes](05-busqueda.md)*
*Siguiente capitulo: [Preguntas frecuentes y problemas comunes](07-faq-y-problemas-frecuentes.md)*
