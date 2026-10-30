<!-- Generado por `npm run mapa` desde src/mapa/*.ts y src/contracts/v1. No editar a mano. -->

# Matriz pantalla → acción → estado → API → entidad → prueba

36 pantallas/modales · 54 endpoints del contrato v1 · 18 escenarios mock.
Entidades: nombres lógicos de TECH-03 (diccionario en handyx-client-be/docs/data-model.md).

## Acceso

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Bienvenida** | `/` | 2.1 | 3 tarjetas: contá qué pasó, recibí propuestas, elegís vos<br>Crear cuenta → registro (con invitación)<br>Ya tengo cuenta → ingresar | normal<br>sesion_activa → inicio<br>api_incompatible (versión de contrato distinta) | `GET /v1/version` | — | sin invitación no hay camino a una cuenta<br>no se ofrece registro público abierto |
| **Ingresar** | `/ingresar/?motivo` | 2.1 | Paso 1: email<br>Paso 2: contraseña (ver/ocultar)<br>Olvidé mi contraseña | inicial<br>enviando<br>credenciales_invalidas (mensaje genérico)<br>limite<br>sesion_vencida<br>sin_red | `POST /v1/auth/csrf`<br>`POST /v1/auth/login` | accounts<br>sessions | el error no revela si el email existe<br>sesión vencida vuelve acá sin perder el destino |
| **Crear cuenta** | `/registro/` | 2.1 | Paso 1: código de invitación<br>Paso 2: email<br>Paso 3: contraseña con medidor<br>Paso 4: aceptar términos y privacidad (versión mostrada)<br>Paso 5: confirmar el email (solo vista de prueba, simulado) | inicial<br>invitacion_invalida<br>validacion_por_campo<br>enviando<br>conflicto (genérico)<br>sin_red | `POST /v1/auth/csrf`<br>`POST /v1/auth/registro` | accounts<br>policy_acceptances | aceptaciones sin tildar por defecto<br>si el servidor rechaza un dato, vuelve al paso de ese dato<br>un preregistro de la landing no crea ni activa la cuenta<br>no pide DNI, CUIT ni certificados |
| **Cuenta creada** | `/registro/listo/` | 2.1 | Leer el aviso de tarifa 0 % hasta el 10/12<br>Completar perfil | normal<br>fee_sin_dato (no se inventa la fecha) | `GET /v1/cuenta/fee` | fee_policies | avisa que la tarifa 0 % dura hasta el 10/12<br>aclara que el servicio del especialista se paga entero |
| **Recuperar contraseña** | `/recuperar/` | 2.1 | Paso 1: pedir el enlace por email<br>Paso 2: revisá tu email (reenviar) | inicial<br>enviado (respuesta uniforme)<br>funcion_inactiva (sin proveedor de email: escribir a soporte) | `POST /v1/auth/csrf`<br>`POST /v1/auth/recuperacion` | accounts | la respuesta es igual exista o no la cuenta |
| **Nueva contraseña** | `/recuperar/nueva/` | 2.1 | Paso 3: elegir contraseña nueva (con medidor) | inicial<br>token_vencido_o_usado<br>listo → ingresar | `POST /v1/auth/csrf`<br>`POST /v1/auth/recuperacion/confirmar` | accounts<br>sessions | el token viaja en el fragmento (#t=), no en la query<br>cambiar la contraseña revoca las sesiones |

## Perfil

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Completá tu perfil** | `/perfil/` | 2.1 | Nombre y apellido<br>Fecha de nacimiento, nacionalidad y género<br>Pre-permiso de ubicación, después la dirección (a mano o "usar mi ubicación" una vez)<br>Mapa: mover el mapa hasta que el pin quede en la puerta (barrio cercano)<br>Pre-permiso de avisos (solo si el navegador puede preguntar)<br>Completar después (lo que falta queda vacío) | paso_1..4<br>validacion_por_campo<br>guardando<br>conflicto_version<br>ubicacion_denegada → carga manual<br>ubicacion_imprecisa<br>sin_cobertura (otra ciudad: interés registrado, sin servicio) | `GET /v1/sesion`<br>`PATCH /v1/cuenta/perfil`<br>`GET /v1/cobertura` | user_profiles | la geolocalización se pide una vez y nunca en segundo plano<br>denegar el permiso no bloquea el alta<br>el navegador pregunta solo después de explicar para qué (pre-permiso)<br>el mapa usa solo datos de la propia app (sin terceros) y sin datos se ve ilustrado y rotulado<br>otra ciudad no promete cobertura |
| **Bienvenida a la demo** | `/inicio/` (modal) | 2.1 | Entendido (registra la versión aceptada) | primera_vez<br>version_nueva_de_la_politica<br>ya_aceptada (no aparece) | `GET /v1/cuenta/fee`<br>`POST /v1/cuenta/fee/aceptacion` | fee_policies<br>fee_acceptances | explica demo cerrada, tarifa Handy 0 % hasta el 10/12 y pago directo (MP o efectivo)<br>no presenta el 0 % como descuento sobre el precio del especialista<br>no anuncia una tarifa posterior no aprobada |

## Inicio

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Inicio**<br><sub>demo: u-inicio, u-sin-especialistas</sub> | `/inicio/` | 2.2 | Elegir rubro → pedir<br>Ver trabajo en curso o próximo turno<br>Ir a avisos | cargando<br>sin_historial<br>con_trabajo_activo<br>con_turno_proximo<br>sin_cobertura<br>error_reintentable | `GET /v1/sesion`<br>`GET /v1/rubros`<br>`GET /v1/trabajos`<br>`GET /v1/pedidos`<br>`GET /v1/cuenta/fee` | service_categories<br>service_requests<br>jobs | no muestra especialistas "cerca" ni reseñas inventadas<br>los 6 rubros aprobados |

## Pedido

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Pedir un servicio**<br><sub>demo: u-opciones, u-programar, u-describir</sub> | `/pedir/?rubro&tipo&tarea&desde` | 2.2 | Rubro (con su Handy), si no viene elegido<br>Para cuándo: urgencia / programado / obra<br>Día en tira y franja (programado y obra), "Quiero elegir otra fecha" y "otro horario"<br>Contanos con tus palabras y fotos opcionales<br>Dirección en el mapa<br>Revisar con "Cambiar" en cada dato; precio y autoaceptación opcionales<br>Pedir presupuestos | paso_n<br>foto_subiendo / foto_error / tipo_no_permitido / payload_grande<br>ubicacion_denegada → manual<br>fecha_pasada o hora_invalida (bloqueadas; las franjas de hoy que ya pasaron, deshabilitadas)<br>enviando<br>error_reintentable (misma Idempotency-Key)<br>enviado → detalle | `POST /v1/media`<br>`GET /v1/cobertura`<br>`POST /v1/pedidos` | service_requests<br>media_assets | doble tap no crea dos pedidos<br>urgente sin fecha; programado y obra con fecha<br>las fotos no se pierden al cambiar de paso<br>un rechazo del servidor vuelve al paso del dato<br>zona horaria de Buenos Aires |
| **Mis pedidos** | `/pedidos/?vista` | 2.2 | Activos / historial<br>Abrir un pedido | cargando<br>vacio<br>lista_paginada<br>error_reintentable | `GET /v1/pedidos` | service_requests | paginado en servidor<br>solo pedidos propios |
| **Tu pedido**<br><sub>demo: u-buscando, u-sin-especialistas</sub> | `/pedidos/detalle/?id` | 2.2 | Búsqueda: mapa con tu casa y la hoja azul (u-buscando)<br>Ver propuestas<br>Editar mientras se busca<br>Relanzar búsqueda<br>Pedir búsqueda manual<br>Cancelar | buscando (sin ETA)<br>con_propuestas<br>sin_respuesta (urgente 20 min / programado 12 h)<br>busqueda_manual (Operations, sin ETA)<br>contratado → trabajo<br>cancelado<br>vencido<br>no_encontrado (también si es ajeno) | `GET /v1/pedidos/{id}`<br>`PATCH /v1/pedidos/{id}`<br>`POST /v1/pedidos/{id}/relanzar`<br>`POST /v1/pedidos/{id}/busqueda-manual`<br>`POST /v1/pedidos/{id}/cancelar` | service_requests<br>job_events | cambiar el id no muestra pedidos ajenos (404)<br>relanzar tiene intentos limitados<br>no se inventan especialistas disponibles |
| **HandIA**<br><sub>demo: u-handia</sub> | `/handia/` | 3.1 | Contar el problema (texto o ejemplos)<br>Confirmar o cambiar el rubro sugerido<br>Pedir para hoy o programar turno (arma el pedido) | inicio<br>pensando<br>rubro sugerido<br>rubro dudoso<br>sin rubro<br>aviso de seguridad<br>no disponible | — | borrador del pedido (en memoria) | tacha emails, teléfonos y documentos antes de enviar<br>no recibe fotos<br>solo sugiere: la persona confirma el rubro y revisa el pedido<br>olor a gas o chispas: primero el aviso de seguridad |

## Propuestas

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Propuestas**<br><sub>demo: u-presupuestos</sub> | `/pedidos/propuestas/?pedido` | 2.3 | Comparar propuestas<br>Abrir una propuesta | cargando<br>vacia<br>una<br>varias<br>vencidas<br>error_reintentable | `GET /v1/pedidos/{id}`<br>`GET /v1/pedidos/{id}/propuestas` | proposals<br>specialist_profiles | sin ranking ni superlativos<br>"verificado" solo con dato real del backend<br>importe total del especialista + comisión Handy 0 % por separado |
| **Propuesta**<br><sub>demo: u-perfil, u-historial, u-confirmar</sub> | `/propuestas/detalle/?id&elegir` | 2.3 | Perfil del especialista: verificaciones reales, rubros, trabajos con Handyx, historial con vos<br>Total final con desglose, horario y vigencia<br>Aceptar → "Confirmá el turno" (u-confirmar): deslizá para confirmar o "Sí, acepto estas condiciones"<br>Rechazar<br>Hacer contrapropuesta<br>Hablar con el especialista | pendiente (con vigencia)<br>aceptando<br>aceptada → trabajo<br>rechazada<br>vencida<br>reemplazada<br>conflicto: version / vencida / ya_resuelta | `GET /v1/propuestas/{id}`<br>`POST /v1/propuestas/{id}/aceptar`<br>`POST /v1/propuestas/{id}/rechazar` | proposals<br>jobs | deslizar a medias no acepta; el botón alternativo siempre está (WCAG 2.5.7)<br>no hay acuerdo hasta aceptar la misma versión<br>aceptación duplicada no crea dos trabajos<br>vencida no se puede aceptar |
| **Contrapropuesta**<br><sub>demo: u-chat3</sub> | `/propuestas/contraoferta/?id` | 2.3 | Proponer monto, alcance y horario | inicial<br>validacion<br>enviando<br>enviada (la anterior queda reemplazada)<br>conflicto | `GET /v1/propuestas/{id}`<br>`POST /v1/propuestas/{id}/contrapropuesta` | proposals | la contraparte acepta o rechaza; nada cambia hasta entonces |

## Chat

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Mensajes**<br><sub>demo: u-mensajes</sub> | `/chats/` | 2.4 | Abrir conversación | cargando<br>vacio<br>lista<br>error_reintentable | `GET /v1/conversaciones` | conversations | solo hilos propios |
| **Conversación**<br><sub>demo: u-chat, u-chat2, u-chat3</sub> | `/chats/conversacion/?id` | 2.4 | Enviar texto<br>Enviar foto<br>Reintentar un envío fallido<br>Ver tarjetas de propuesta | cargando<br>mensaje_pendiente<br>mensaje_error → reintentar<br>foto_subiendo<br>sin_red<br>no_encontrado | `GET /v1/conversaciones/{id}/mensajes`<br>`POST /v1/conversaciones/{id}/mensajes`<br>`POST /v1/media`<br>`POST /v1/conversaciones/{id}/leido` | conversations<br>messages<br>media_assets | existe desde la cotización, antes del trabajo<br>reintentar no duplica (clienteId)<br>otro usuario no lo lee |

## Trabajo

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Trabajo**<br><sub>demo: u-seguimiento, u-terminado</sub> | `/trabajos/detalle/?id` | 2.4 | Ver acuerdo vigente e historial<br>Confirmar que terminó<br>Confirmar etapa (obra)<br>Cancelar<br>Pagar<br>Reclamar | agendado<br>en_camino<br>en_sitio ("Llegué" del especialista)<br>en_curso<br>terminado_por_especialista<br>finalizado<br>cancelado | `GET /v1/trabajos/{id}`<br>`GET /v1/trabajos/{id}/eventos`<br>`POST /v1/trabajos/{id}/confirmar-fin`<br>`POST /v1/trabajos/{id}/etapas/{etapaId}/confirmar`<br>`POST /v1/trabajos/{id}/cancelar` | jobs<br>job_events | el acuerdo no cambia sin otra propuesta aceptada<br>cada cambio de estado tiene actor y fecha |
| **Cambiar turno o condiciones**<br><sub>demo: u-cambiar, u-cancelar</sub> | `/trabajos/cambiar/?id` | 2.4 | Proponer otra fecha, hora, alcance o monto | inicial<br>enviando<br>pendiente (vale el acuerdo actual)<br>aceptada<br>rechazada | `GET /v1/trabajos/{id}`<br>`POST /v1/trabajos/{id}/propuestas` | proposals<br>jobs | mientras está pendiente se conserva el turno actual |
| **Tu agenda**<br><sub>demo: u-turnos, u-turno-detalle</sub> | `/agenda/` | 2.4 | Elegir día<br>Abrir trabajo | cargando<br>dia_vacio<br>dia_con_trabajos<br>error_reintentable | `GET /v1/trabajos` | jobs | días en Buenos Aires aunque el celular esté en otra zona |
| **Calificar el trabajo**<br><sub>demo: u-resena</sub> | `/trabajos/resena/?id` | 3.6 | Estrellas de 1 a 5<br>Lo mejor o lo que estuvo mal (chips)<br>Comentario opcional sin datos personales | todavía no se puede (trabajo sin confirmar)<br>calificando<br>enviada → gracias<br>funcion_inactiva (API real sin resenaCrear) | `GET /v1/trabajos/{id}`<br>`GET /v1/pedidos/{id}` | — | solo después de confirmar que terminó<br>el comentario se envía sin teléfonos, emails ni documentos<br>con la API real queda inactiva hasta resenaCrear (Fase 4.4) |

## Pagos

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Pago al especialista**<br><sub>demo: u-pagos</sub> | `/trabajos/pago/?id` | 2.5 | Mercado Pago directo al especialista<br>Efectivo<br>Reportar que pagué | pendiente<br>reportado (no verificado)<br>verificado<br>fallido → reintentar<br>checkout_inactivo (gate MP) | `GET /v1/trabajos/{id}`<br>`GET /v1/trabajos/{id}/pagos`<br>`POST /v1/trabajos/{id}/pagos`<br>`POST /v1/pagos/{id}/checkout` | payment_records | reportado nunca se muestra como verificado<br>Handy no figura como receptor del dinero<br>sin "Agregar tarjeta" ni datos de tarjeta en Handy |
| **Volviste del pago** | `/pagos/retorno/?id` | 2.5 | Consultar el estado real<br>Volver al trabajo | consultando<br>pendiente<br>verificado<br>fallido<br>cancelado | `GET /v1/pagos/{id}` | payment_records | volver de la URL de checkout no confirma el pago |

## Soporte

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Reclamos** | `/reclamos/` | 2.4 | Abrir un reclamo<br>Ver un reclamo | cargando<br>vacio<br>lista<br>error_reintentable | `GET /v1/reclamos` | support_cases | solo reclamos propios |
| **Nuevo reclamo**<br><sub>demo: u-soporte</sub> | `/reclamos/nuevo/?pedido&trabajo` | 2.4 | Categoría<br>Detalle<br>Adjuntar fotos | inicial<br>validacion<br>adjunto_error<br>enviando<br>enviado | `POST /v1/media`<br>`POST /v1/reclamos` | support_cases<br>media_assets | sin plazos de respuesta inventados<br>reintento no duplica |
| **Reclamo** | `/reclamos/detalle/?id` | 2.4 | Sumar información cuando la piden | abierto<br>en_revision<br>esperando_usuario<br>resuelto<br>cerrado | `GET /v1/reclamos/{id}`<br>`POST /v1/reclamos/{id}/respuestas`<br>`POST /v1/media` | support_cases<br>support_events | historial con actor y fecha |
| **Ayuda**<br><sub>demo: u-ayuda, u-ayuda-detalle, u-handia</sub> | `/ayuda/` | 2.4 | Preguntas frecuentes<br>Abrir reclamo | normal | — | — | HandIA: acceso al asistente (sin datos personales a terceros) |

## Avisos

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Avisos**<br><sub>demo: u-notificaciones</sub> | `/notificaciones/` | 2.5 | Abrir el aviso<br>Activar avisos del celular (contextual) | cargando<br>vacio<br>lista<br>push_denegado<br>push_no_disponible (iOS sin instalar) | `GET /v1/notificaciones`<br>`POST /v1/notificaciones/{id}/leida`<br>`POST /v1/cuenta/push` | notification_outbox | sin push la app sigue funcionando<br>el aviso no lleva datos personales |

## Cuenta

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Cuenta**<br><sub>demo: u-cuenta</sub> | `/cuenta/` | 2.1 | Mis datos<br>Tarifa y demo<br>Avisos<br>Privacidad<br>Eliminar cuenta<br>Cerrar sesión | normal<br>perfil_incompleto<br>baja_en_curso | `GET /v1/sesion`<br>`GET /v1/cuenta/fee`<br>`POST /v1/auth/logout` | accounts<br>fee_policies | contador hasta el 10/12 con el reloj del servidor<br>cerrar sesión no es baja |
| **Mis datos**<br><sub>demo: u-datos</sub> | `/cuenta/datos/` | 2.1 | Editar perfil operativo | normal<br>guardando<br>validacion<br>conflicto_version | `GET /v1/sesion`<br>`PATCH /v1/cuenta/perfil` | user_profiles | los campos faltantes se muestran vacíos, no inventados |
| **Tarifa y demo** | `/cuenta/tarifa/` | 2.1 | Ver condiciones y versión aceptada | demo_vigente<br>demo_terminada_sin_tarifa_aprobada<br>sin_dato | `GET /v1/cuenta/fee`<br>`POST /v1/cuenta/fee/aceptacion` | fee_policies<br>fee_acceptances | al vencer el contador no aparece ninguna tarifa no aprobada |
| **Preferencias de avisos** | `/cuenta/notificaciones/` | 2.5 | Activar o desactivar push | normal<br>permiso_denegado<br>no_soportado | `GET /v1/cuenta/notificaciones`<br>`PATCH /v1/cuenta/notificaciones`<br>`POST /v1/cuenta/push`<br>`DELETE /v1/cuenta/push` | notification_outbox | el permiso se pide solo al tocar, nunca al abrir la app |
| **Privacidad** | `/cuenta/privacidad/` | 2.1 | Ver textos y versiones aceptadas<br>Aceptar una versión nueva | normal<br>version_nueva_pendiente | `GET /v1/sesion`<br>`POST /v1/cuenta/aceptaciones` | policy_acceptances<br>consents | HandIA explicada (sin datos personales ni fotos)<br>la versión aceptada queda registrada |
| **Eliminar cuenta** | `/cuenta/baja/` | 2.1 | Solicitar la eliminación real (con contraseña)<br>Ver el estado de la solicitud | sin_solicitud<br>recibida<br>en_proceso<br>completada<br>completada_con_retencion (qué y hasta cuándo) | `POST /v1/cuenta/baja`<br>`GET /v1/cuenta/baja` | account_deletion_requests | muestra el estado verdadero, no un éxito ficticio<br>compatible con la solicitud web de las tiendas |

## Sistema

| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Sin conexión** | `/sin-conexion/` | 3.3 | Reintentar<br>Ir al inicio | offline (pantalla no guardada) | — | — | ninguna acción se da por hecha sin respuesta del servidor<br>tests/e2e/pwa.cjs: aceptar y mandar mensajes sin conexión fallan a la vista<br>el caché del service worker no guarda API, ids ni datos personales |

## Escenarios obligatorios del mock

| # | Escenario | Lote | Pantallas | Resultado esperado |
| --- | --- | --- | --- | --- |
| 1 | Nuevo usuario (`nuevo-usuario`) | 2.1 | `/` | registro, registro-listo, perfil, modal-fee, inicio | Alta con invitación, aviso de fee 0 % hasta el 10/12, perfil por pasos y modal una sola vez. |
| 2 | Usuario de otra ciudad sin cobertura (`otra-ciudad`) | 2.1 | `/inicio/?escenario=otra-ciudad` | perfil, inicio | Se registra el interés; no se promete cobertura ni se puede pedir como si la hubiera. |
| 3 | Ubicación denegada (`ubicacion-denegada`) | 2.2 | `/perfil/?escenario=ubicacion-denegada` | perfil, pedir | Sigue con carga manual; nunca se bloquea ni se vuelve a pedir en bucle. |
| 4 | Ningún especialista (`sin-especialistas`) | 2.2 | `/pedidos/?escenario=sin-especialistas` | pedido | Sin respuesta al vencer la ventana: relanzar, búsqueda manual o cancelar, sin ETA. |
| 5 | Varias propuestas (`varias-propuestas`) | 2.3 | `/pedidos/?escenario=varias-propuestas` | propuestas, propuesta | Comparación sin ranking; importe del especialista y comisión 0 % separados. |
| 6 | Contrapropuesta (`contrapropuesta`) | 2.3 | `/pedidos/?escenario=contrapropuesta` | propuesta, contrapropuesta, conversacion | La anterior queda reemplazada; no hay acuerdo hasta que la otra parte acepta. |
| 7 | Aceptación duplicada rechazada (`aceptacion-duplicada`) | 2.3 | `/pedidos/?escenario=aceptacion-duplicada` | propuesta | El segundo intento recibe 409 ya_resuelta y muestra el trabajo existente. |
| 8 | Propuesta vencida (`propuesta-vencida`) | 2.3 | `/pedidos/?escenario=propuesta-vencida` | propuesta | A los 5 min (urgente) pasa a vencida; aceptar devuelve 409 vencida. |
| 9 | Urgencia sin respuesta (`urgencia-sin-respuesta`) | 2.2 | `/pedidos/?escenario=urgencia-sin-respuesta` | pedido | A los 20 min sin propuestas: sin_respuesta con intentos limitados. |
| 10 | Programado (`programado`) | 2.2 | `/pedidos/?escenario=programado` | pedir, pedido, agenda | Fecha/hora como solicitud; a las 12 h sin propuestas ofrece revisar o relanzar. |
| 11 | Obra por etapa (`obra-por-etapas`) | 2.4 | `/pedidos/?escenario=obra-por-etapas` | trabajo, pago | Etapas con monto propio; cada una se confirma y se paga por separado. |
| 12 | Chat fallido (`chat-fallido`) | 2.4 | `/chats/?escenario=chat-fallido` | conversacion | Mensaje con error y "Reintentar"; reintentar no lo duplica. |
| 13 | Cancelación (`cancelacion`) | 2.4 | `/pedidos/?escenario=cancelacion` | pedido, trabajo | Cancelar pedido o trabajo agendado con motivo; queda en el historial. |
| 14 | Efectivo reportado (`efectivo-reportado`) | 2.5 | `/pedidos/?escenario=efectivo-reportado` | pago | Queda "reportado", nunca "verificado" por el reporte solo. |
| 15 | Mercado Pago pendiente/fallido (`mp-pendiente-fallido`) | 2.5 | `/pedidos/?escenario=mp-pendiente-fallido` | pago, pago-retorno | Volver del checkout consulta el estado; pendiente y fallido se distinguen. |
| 16 | Reclamo (`reclamo`) | 2.4 | `/reclamos/?escenario=reclamo` | reclamo-nuevo, reclamo | Categoría, detalle, adjuntos y estado con historial; sin plazos inventados. |
| 17 | Sesión vencida (`sesion-vencida`) | 2.1 | `/inicio/?escenario=sesion-vencida` | ingresar | Vuelve al ingreso sin perder lo tipeado ni simular la acción. |
| 18 | Baja solicitada (`baja-solicitada`) | 2.1 | `/cuenta/?escenario=baja-solicitada` | cuenta-baja, cuenta | Estado real de la solicitud y retenciones informadas. |

## Endpoints sin pantalla

Ninguno: cada endpoint del contrato tiene al menos una pantalla.
