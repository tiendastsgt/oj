# Capitulo 5 — Busqueda de expedientes

## Objetivo de este capitulo

Al terminar de leer este capitulo usted sabra:
- Como realizar una busqueda rapida por numero de expediente.
- Como usar la busqueda avanzada con multiples criterios de filtrado.
- Como interpretar los resultados que muestra el sistema.

---

## 5.1 Tipos de busqueda disponibles

El SGED ofrece dos modalidades de busqueda para localizar expedientes:

| Modalidad | Cuando usarla |
|-----------|---------------|
| **Busqueda rapida** | Cuando conoce el numero exacto o parcial del expediente y quiere encontrarlo de forma inmediata. |
| **Busqueda avanzada** | Cuando necesita filtrar expedientes por varios criterios combinados: tipo de proceso, estado, juzgado, partes del caso, rango de fechas, etc. |

---

## 5.2 Busqueda rapida

La busqueda rapida es la forma mas directa de encontrar un expediente cuando conoce su numero:

1. En el modulo de **Expedientes**, localice el campo de busqueda en la parte superior de la tabla (generalmente un cuadro de texto con un icono de lupa).
2. Escriba el numero del expediente que desea encontrar, o una parte de el.
3. Presione la tecla **Enter** o haga clic en el icono de lupa para ejecutar la busqueda.
4. La tabla se actualizara mostrando unicamente los expedientes cuyo numero coincida con el texto ingresado.

> [!TIP]
> No necesita escribir el numero completo. Si escribe solo los primeros digitos o una parte del numero, el sistema buscara todos los expedientes que contengan ese fragmento en su numero. Por ejemplo, si escribe "2024", aparecera todo expediente que tenga "2024" en su numero.

> [!NOTE]
> Para volver a ver todos los expedientes despues de una busqueda, borre el texto del campo de busqueda y presione Enter, o haga clic en el boton para limpiar el filtro si aparece disponible.

---

## 5.3 Busqueda avanzada

La busqueda avanzada permite combinar multiples criterios para obtener resultados mas precisos. Es util cuando necesita encontrar todos los expedientes de un tipo de proceso especifico, de un juzgado determinado, o dentro de un rango de fechas.

Para usar la busqueda avanzada:

1. En el modulo de **Expedientes**, haga clic en el boton o enlace de **Busqueda avanzada** (generalmente ubicado cerca del campo de busqueda rapida, o como un boton adicional).
2. Se desplegara un panel o formulario con los siguientes criterios de filtrado:

   | Criterio | Descripcion |
   |----------|-------------|
   | **Numero de expediente** | Permite buscar por numero exacto o fragmento del numero. |
   | **Tipo de proceso** | Seleccione de la lista el tipo de proceso que desea filtrar (ej. Civil, Penal, Laboral). |
   | **Estado** | Filtre por el estado actual del expediente: Activo, Archivado o Suspendido. |
   | **Juzgado** | Seleccione el juzgado o tribunal donde radica el expediente. |
   | **Demandante** | Escriba el nombre o parte del nombre de la parte demandante para filtrar. |
   | **Demandado** | Escriba el nombre o parte del nombre de la parte demandada para filtrar. |
   | **Fecha de inicio (desde)** | Limite los resultados a expedientes iniciados a partir de esta fecha. |
   | **Fecha de inicio (hasta)** | Limite los resultados a expedientes iniciados hasta esta fecha. |

3. Complete uno o varios de los criterios segun lo que necesite encontrar. No es obligatorio completar todos los campos; use solo los que le sean utiles.
4. Haga clic en el boton **Buscar** o **Aplicar filtros**.
5. El sistema mostrara en la tabla los expedientes que cumplan con todos los criterios ingresados simultaneamente.

> [!TIP]
> Combine criterios para afinar sus resultados. Por ejemplo, si busca expedientes de tipo "Civil" en el "Juzgado 3" con estado "Activo", complete esos tres campos y el sistema le devolvera unicamente los expedientes que cumplan las tres condiciones al mismo tiempo.

> [!NOTE]
> Los campos de texto en la busqueda avanzada (como demandante o demandado) aceptan coincidencias parciales. No necesita escribir el nombre completo; con escribir una parte del nombre es suficiente para que el sistema encuentre coincidencias.

---

## 5.4 Como limpiar los filtros de busqueda

Despues de realizar una busqueda avanzada, para volver a ver todos los expedientes:

1. Haga clic en el boton **Limpiar** o **Limpiar filtros** (generalmente ubicado junto al boton Buscar).
2. Todos los campos del formulario se vaciaran y la tabla mostrara nuevamente todos los expedientes disponibles para su rol.

---

## 5.5 Interpretar los resultados de la busqueda

Los resultados de cualquier busqueda se muestran en la misma tabla del listado de expedientes, con las siguientes columnas habituales:

| Columna | Informacion que muestra |
|---------|------------------------|
| **Numero de expediente** | Codigo unico del expediente |
| **Tipo de proceso** | Clasificacion del proceso judicial |
| **Juzgado** | Organo judicial donde radica |
| **Estado** | Situacion actual (Activo, Archivado, Suspendido) |
| **Demandante** | Nombre de la parte accionante |
| **Demandado** | Nombre de la parte accionada |
| **Fecha de inicio** | Fecha de apertura del expediente |
| **Acciones** | Botones para ver, editar o acceder a documentos |

Si la busqueda no encuentra resultados, la tabla mostrara un mensaje indicando que no se encontraron expedientes con los criterios ingresados. En ese caso:

- Verifique que los criterios escritos no tengan errores ortograficos.
- Pruebe con criterios menos restrictivos.
- Si esta seguro de que el expediente existe pero no aparece, contacte al administrador del sistema.

---

## 5.6 Paginacion de resultados

Si la busqueda devuelve muchos resultados, el sistema los muestra en paginas. Al pie de la tabla encontrara los controles de paginacion:

- Flechas para avanzar o retroceder de pagina.
- Numero de pagina actual y total de paginas.
- En algunos casos, un selector para elegir cuantos resultados mostrar por pagina.

> [!TIP]
> Si los resultados son demasiados, agregue mas criterios a la busqueda avanzada para reducir la cantidad y encontrar mas rapidamente lo que busca.

---

## Permisos del modulo de busqueda

| Accion | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|--------|:-----:|:----------:|:--------:|:--------:|
| Usar busqueda rapida | Si | Si | Si | Si |
| Usar busqueda avanzada | Si | Si | Si | Si |
| Ver resultados de busqueda | Si | Si | Si | Si |
| Acceder al detalle de un resultado | Si | Si | Si | Si |

---

*Capitulo anterior: [Gestion de documentos](04-documentos.md)*
*Siguiente capitulo: [Panel principal (Dashboard)](06-dashboard.md)*
