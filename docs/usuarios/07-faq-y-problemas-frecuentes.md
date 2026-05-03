# Capitulo 7 — Preguntas frecuentes y problemas comunes

## Objetivo de este capitulo

Este capitulo reune los problemas que los usuarios reportan con mayor frecuencia al usar el SGED. Para cada situacion encontrara: el sintoma observable, la causa probable y los pasos para resolverlo.

---

## Problema 1: "Mis credenciales son invalidas y no puedo ingresar"

**Sintoma:** Al intentar iniciar sesion, el sistema muestra un mensaje como "Credenciales invalidas", "Usuario o contrasena incorrectos" o "Acceso denegado", pero usted esta seguro de que sus datos son correctos.

**Causa probable:**
- El nombre de usuario fue escrito con espacios adicionales al inicio o al final.
- La contrasena fue escrita con errores de mayusculas o minusculas (el campo de contrasena distingue entre mayusculas y minusculas).
- Sus credenciales han cambiado desde la ultima vez que inicio sesion y no fue notificado.
- Su cuenta fue desactivada por el administrador.

**Solucion:**
1. Verifique que no haya espacios antes o despues de su nombre de usuario al escribirlo.
2. Verifique que la tecla **Bloq Mayus** (Caps Lock) de su teclado no este activada. Cuando esta activa, las letras se escriben en mayusculas aunque usted no lo quiera.
3. Intente escribir la contrasena despacio y con atencion.
4. Si el problema persiste, contacte al administrador del sistema y solicite verificacion de su cuenta o restablecimiento de contrasena.

> [!WARNING]
> Recuerde que despues de 5 intentos fallidos consecutivos su cuenta quedara bloqueada. Si cree que puede haber un error en su contrasena pero no esta seguro, solicite ayuda al administrador antes de intentar nuevamente.

---

## Problema 2: "Mi cuenta esta bloqueada"

**Sintoma:** El sistema muestra un mensaje indicando que su cuenta esta bloqueada o suspendida, y no le permite ingresar aunque escriba su contrasena correctamente.

**Causa probable:**
- Se ingresaron credenciales incorrectas 5 veces de forma consecutiva, lo que activo el bloqueo automatico de seguridad.

**Solucion:**
1. No intente ingresar nuevamente; cada nuevo intento fallido no desbloquea la cuenta.
2. Contacte al **administrador del sistema** o a su supervisor inmediato y comuniqueles que su cuenta esta bloqueada.
3. El administrador tendra que desbloquear su cuenta desde el modulo de gestion de usuarios.
4. Una vez que el administrador confirme que desbloquearon su cuenta, intente ingresar nuevamente con sus credenciales correctas.

> [!NOTE]
> El bloqueo automatico es una medida de seguridad para proteger la informacion del sistema ante intentos de acceso no autorizados. No puede ser desactivado por el usuario final.

---

## Problema 3: "El sistema me saca y me pide iniciar sesion de nuevo"

**Sintoma:** Mientras estaba trabajando, el sistema lo redirige de repente a la pantalla de inicio de sesion, perdiendo aparentemente lo que estaba haciendo.

**Causa probable:**
- Su sesion expiro por inactividad o por haber transcurrido las 8 horas maximas de sesion activa.
- Su conexion a internet se interrumpio momentaneamente y al restablecerse el sistema requiere reautenticacion.

**Solucion:**
1. Ingrese nuevamente su nombre de usuario y contrasena en la pantalla de inicio de sesion.
2. Una vez que ingrese, regrese al modulo donde estaba trabajando. En la mayoria de los casos los datos que ya estaban guardados se conservan; unicamente se pierden datos de formularios que no habian sido guardados aun.

> [!TIP]
> Para evitar perder trabajo no guardado, desarrolle el habito de hacer clic en **Guardar** con frecuencia mientras edita expedientes o completa formularios. No espere a tener todo listo para guardar por primera vez.

> [!NOTE]
> La sesion dura un maximo de 8 horas continuas desde el inicio de sesion. Si su jornada de trabajo supera este tiempo, debera iniciar sesion nuevamente al expirar la sesion. Esta limitacion no puede modificarse desde el usuario final.

---

## Problema 4: "Abri un documento pero no se ve, la pantalla esta en blanco o da error"

**Sintoma:** Hizo clic en el icono de visualizar un documento y el visor se abrio, pero muestra una pantalla en blanco, un mensaje de error, o el documento no carga despues de varios segundos de espera.

**Causa probable:**
- El archivo fue subido de forma incompleta o podria estar danado.
- La conexion a internet es lenta o inestable y el archivo no termina de cargarse.
- El tipo de archivo no es compatible con el visor integrado en su navegador.

**Solucion:**
1. Espere al menos 15 segundos; en conexiones lentas los archivos grandes pueden tardar en cargar.
2. Intente cerrar el visor y abrirlo nuevamente.
3. Si el problema persiste con ese archivo especifico, intente descargarlo usando el icono de descarga y abrirlo directamente en su computadora con el programa correspondiente (Adobe Reader para PDF, Microsoft Word para .docx, etc.).
4. Si el archivo no puede abrirse ni descargarse correctamente, es posible que el archivo este danado. Notifique al responsable del expediente para que se vuelva a subir el documento original.
5. Si varios documentos presentan este problema, verifique su conexion a internet o contacte al administrador del sistema.

> [!TIP]
> Archivos de video o audio de gran tamanio pueden tardar varios segundos en cargar antes de reproducirse. Es normal ver una pantalla oscura o el icono de carga durante este tiempo.

---

## Problema 5: "No veo el boton para crear un expediente o subir un documento"

**Sintoma:** Busca el boton para crear un nuevo expediente o para subir un documento y no lo encuentra en la pantalla, aunque cree que deberia estar ahi.

**Causa probable:**
- Su rol de usuario no tiene permiso para realizar esa accion. El sistema oculta automaticamente los botones y opciones que su rol no puede usar.
- Esta viendo el modulo correcto pero en un expediente con un estado que no permite modificaciones.

**Solucion:**
1. Verifique su rol consultando con el administrador del sistema. Los roles **CONSULTA** no pueden crear expedientes ni subir documentos.
2. Si su rol deberia permitirle esa accion (es AUXILIAR, SECRETARIO o ADMIN) pero aun asi no ve el boton, cierre sesion y vuelva a ingresar para refrescar los permisos de su sesion.
3. Si el problema persiste, contacte al administrador del sistema para que verifique la configuracion de permisos de su cuenta.

> [!NOTE]
> Recuerde que el rol **AUXILIAR** puede crear expedientes y subir documentos, pero no puede editar ni eliminar. El rol **CONSULTA** solo puede ver y descargar, sin crear ni modificar nada.

---

## Problema 6: "El sistema va muy lento o las paginas tardan mucho en cargar"

**Sintoma:** Las pantallas del sistema demoran varios segundos en cargar, la tabla de expedientes tarda en aparecer, o las acciones como guardar o buscar no responden con rapidez.

**Causa probable:**
- Conexion a internet lenta o inestable desde su computadora o red local.
- El navegador tiene demasiadas pestanas abiertas o no se ha reiniciado en mucho tiempo.
- La computadora tiene poca memoria disponible por otros programas en ejecucion.

**Solucion:**
1. Verifique su conexion a internet abriendo otra pagina web en una pestana nueva. Si esa pagina tambien carga lento, el problema esta en su conexion y no en el SGED.
2. Cierre las pestanas del navegador que no este usando activamente.
3. Cierre otros programas en su computadora que no necesite en ese momento para liberar memoria.
4. Intente cerrar completamente el navegador y volver a abrirlo, luego ingrese nuevamente al sistema.
5. Si el problema persiste solo en el SGED y otras paginas cargan correctamente, notifique al administrador del sistema para que verifique el estado del servidor.

> [!TIP]
> Si trabaja con expedientes que tienen muchos documentos adjuntos, es normal que la carga de esa pantalla tome un poco mas de tiempo que la de expedientes con pocos documentos. Si el tiempo de espera es excesivo (mas de 30 segundos), consulte con el administrador.

---

## Contacto para soporte adicional

Si el problema que experimenta no esta en esta lista, o si siguio los pasos de solucion y el problema persiste, contacte al administrador del sistema o a la mesa de servicio de su institucion con la siguiente informacion:

- Su nombre de usuario.
- Descripcion exacta de lo que estaba haciendo cuando ocurrio el problema.
- El mensaje de error exacto que muestra el sistema (puede tomar una captura de pantalla).
- La hora aproximada en que ocurrio el problema.

Esta informacion ayudara a resolver su caso mas rapidamente.

---

*Capitulo anterior: [Panel principal (Dashboard)](06-dashboard.md)*
*Volver al inicio: [Indice del manual](INDEX.md)*
