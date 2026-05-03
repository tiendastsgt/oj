# Capitulo 3 — Gestion de expedientes

## Objetivo de este capitulo

Al terminar de leer este capitulo usted sabra:
- Como ver el listado de expedientes registrados.
- Como crear un nuevo expediente con todos sus campos requeridos.
- Como ver el detalle completo de un expediente.
- Como editar los datos de un expediente existente.
- Que significan los distintos estados de un expediente.
- Que puede hacer cada rol en el modulo de expedientes.

---

## 3.1 Acceder al listado de expedientes

1. En el menu lateral, haga clic en **Expedientes**.
2. El sistema mostrara una tabla con todos los expedientes registrados a los que tiene acceso.
3. Cada fila de la tabla representa un expediente y muestra informacion resumida: numero de expediente, tipo de proceso, juzgado, estado y fecha de creacion.
4. Al final de cada fila encontrara botones de accion para operar sobre ese expediente.

> [!NOTE]
> La tabla de expedientes muestra los registros en paginas. Si hay muchos expedientes, use los controles de paginacion en la parte inferior de la tabla para navegar entre paginas.

---

## 3.2 Crear un nuevo expediente

> [!NOTE]
> Solo los usuarios con rol **ADMIN**, **SECRETARIO** o **AUXILIAR** pueden crear expedientes. Si no ve el boton para crear, es porque su rol (CONSULTA) no tiene este permiso.

Para crear un nuevo expediente:

1. En la pantalla de listado de expedientes, haga clic en el boton **Nuevo expediente** (generalmente ubicado en la esquina superior derecha con un icono de suma o la palabra "Nuevo").
2. Se abrira un formulario. Complete los campos requeridos (marcados con asterisco):

   | Campo | Descripcion | Obligatorio |
   |-------|-------------|:-----------:|
   | **Numero de expediente** | Codigo judicial unico que identifica el caso. No puede repetirse en el sistema. | Si |
   | **Tipo de proceso** | Clasificacion del proceso judicial (seleccione de la lista). | Si |
   | **Juzgado** | Organo judicial donde radica el expediente (seleccione de la lista). | Si |
   | **Estado** | Situacion actual del expediente: Activo, Archivado o Suspendido. | Si |
   | **Demandante** | Nombre de la parte demandante o accionante. | Segun configuracion |
   | **Demandado** | Nombre de la parte demandada o accionada. | Segun configuracion |
   | **Descripcion / Sinopsis** | Resumen breve del caso. | No |
   | **Fecha de inicio** | Fecha en que el expediente fue iniciado. | Segun configuracion |

3. Una vez completados los campos, haga clic en el boton **Guardar**.
4. Si todos los datos son validos, el sistema mostrara un mensaje de confirmacion y el nuevo expediente aparecera en el listado.

> [!WARNING]
> El campo **Numero de expediente** debe ser unico en todo el sistema. Si intenta guardar un numero que ya existe, el sistema le mostrara un mensaje de error indicando que ese numero ya esta registrado. Verifique el numero e intente nuevamente.

> [!TIP]
> Antes de crear un expediente, use la busqueda rapida para verificar que no existe ya un registro con el mismo numero. Esto le evitara mensajes de error y duplicados accidentales.

---

## 3.3 Ver el detalle de un expediente

Para consultar toda la informacion de un expediente especifico:

1. En el listado de expedientes, localice el expediente que desea consultar.
2. Haga clic en el icono de **Ver** (generalmente representado por un ojo o una lupa) en la columna de acciones de la fila correspondiente.
3. El sistema mostrara la pantalla de detalle con todos los campos del expediente y, en la parte inferior o en una pestana separada, la lista de documentos adjuntos.

Desde la pantalla de detalle tambien puede acceder directamente al visor de documentos del expediente.

---

## 3.4 Editar un expediente

> [!NOTE]
> Solo los usuarios con rol **ADMIN** o **SECRETARIO** pueden editar datos de expedientes.

Para modificar la informacion de un expediente:

1. En el listado, localice el expediente que desea editar.
2. Haga clic en el icono de **Editar** (generalmente un lapiz o la palabra "Editar") en la fila correspondiente.
3. Se abrira el formulario con los datos actuales del expediente ya cargados.
4. Modifique los campos que necesite actualizar.
5. Haga clic en **Guardar** para confirmar los cambios.
6. El sistema mostrara un mensaje de confirmacion si la operacion fue exitosa.

> [!WARNING]
> Tenga cuidado al modificar el numero de expediente o el tipo de proceso, ya que estos cambios pueden afectar la trazabilidad del caso. Realice modificaciones solo cuando sea estrictamente necesario y con respaldo de su supervisor.

---

## 3.5 Estados de un expediente

Cada expediente tiene asignado un **estado** que refleja su situacion actual. Los estados disponibles son:

| Estado | Significado |
|--------|-------------|
| **Activo** | El expediente esta en tramite o proceso activo. Se pueden agregar y gestionar documentos normalmente. |
| **Archivado** | El expediente ha concluido o fue resguardado. Queda visible para consulta pero generalmente no recibe nuevas actuaciones. |
| **Suspendido** | El tramite del expediente ha sido interrumpido temporalmente por alguna razon legal o administrativa. |

> [!TIP]
> El estado de un expediente puede cambiarse durante su edicion. Si necesita cambiar el estado y no tiene permiso para editar expedientes, solicite la actualizacion a un usuario con rol SECRETARIO o ADMIN.

---

## Permisos del modulo de expedientes

| Accion | ADMIN | SECRETARIO | AUXILIAR | CONSULTA |
|--------|:-----:|:----------:|:--------:|:--------:|
| Ver listado de expedientes | Si | Si | Si | Si |
| Ver detalle de un expediente | Si | Si | Si | Si |
| Crear expediente | Si | Si | Si | No |
| Editar datos de un expediente | Si | Si | No | No |
| Cambiar estado de un expediente | Si | Si | No | No |
| Eliminar un expediente | Si | No | No | No |

---

*Capitulo anterior: [Acceso y navegacion](02-acceso-y-navegacion.md)*
*Siguiente capitulo: [Gestion de documentos](04-documentos.md)*
