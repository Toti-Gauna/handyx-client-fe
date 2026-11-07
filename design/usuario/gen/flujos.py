# Flujos de la app del usuario (FL-*). Cada nodo de pantalla abre su .dc.html en el lienzo.
import sys, json
sys.path.insert(0, 'usuario/gen')
from flujos_base import *  # noqa: F401,F403

FL = []


def F(*a, **k):
    W, H = flujo(*a, **k)
    FL.append((a[0], a[1], W, H))


F('FL-Mapa.dc.html', 'Mapa de la app', 'Cinco pestañas con HandIA en el medio, y la cuenta en tu avatar. Desde acá sale todo lo demás.',
  [('ini', 0, 0, 'Inicio', 'Rubros, HandIA y lo tuyo', 'casa', 'I-Inicio.dc.html', 'i'), ('act', 1, 0, 'Actividad', 'En curso, agenda, historial', 'agenda', 'X-Actividad.dc.html', 'i'),
   ('han', 2, 0, 'HandIA', 'Círculo flotante del medio', 'chispas', 'I-HandIA.dc.html', 'i'), ('men', 3, 0, 'Mensajes', 'Chats con tarjetas', 'chat', 'M-Mensajes.dc.html', 'i'),
   ('hog', 4, 0, 'Mi hogar', 'Ficha de la casa', 'hogar', 'H-Hogar.dc.html', 'i'), ('cta', 5, 0, 'Cuenta', 'Desde tu avatar', 'cuenta', 'X-Cuenta.dc.html', 'i'),
   ('ped', 0, 1, 'Pedir', 'Rubro, fotos, día, zona', 'caja', 'P-Rubro.dc.html', 'p'), ('seg', 1, 1, 'Seguimiento', 'Viaje, informe, pago', 'reloj', 'S-Agendado.dc.html', 'p'),
   ('voz', 2, 1, 'HandIA voz', 'En el dispositivo', 'onda', 'I-Voz.dc.html', 'p'), ('chat', 3, 1, 'Chat', 'Aceptás en la tarjeta', 'chat', 'M-Chat.dc.html', 'p'),
   ('rec', 4, 1, 'Recordatorios', 'Mantenimiento a tiempo', 'campana', 'H-Recordatorios.dc.html', 'p'), ('ayu', 5, 1, 'Ayuda', 'Temas y preguntas', 'ayuda', 'X-Ayuda.dc.html', 'p'),
   ('pro', 0, 2, 'Propuestas', 'Comparar y aceptar', 'billete', 'C-Propuestas.dc.html', 'p'), ('obr', 1, 2, 'Obra', 'Días, equipo, etapas', 'obra', 'O-Obra.dc.html', 'p'),
   ('fic', 2, 2, 'Ficha del pedido', 'La revisás vos', 'documento', 'I-HandIAFicha.dc.html', 'p'), ('her', 3, 2, 'Herramientas', 'Medir, nivel, 3D, AR', 'regla', 'T-Herramientas.dc.html', 'p'),
   ('cam', 4, 2, 'Camino del hogar', 'Insignias sin azar', 'medalla', 'G-Camino.dc.html', 'p'), ('sop', 5, 2, 'Soporte', 'Personas de Handyx', 'sobre', 'M-Soporte.dc.html', 'p')],
  [('ini', 'ped', ''), ('ped', 'pro', ''), ('act', 'seg', ''), ('seg', 'obr', 'Varios días'), ('han', 'voz', ''), ('voz', 'fic', ''),
   ('men', 'chat', ''), ('chat', 'her', 'Adjuntar'), ('hog', 'rec', ''), ('rec', 'cam', 'A tiempo suma'), ('cta', 'ayu', ''), ('ayu', 'sop', '')],
  'Las pestañas van en una barra flotante de vidrio; HandIA es el círculo azul del medio. Cuenta, datos, pagos y privacidad se abren desde el avatar de la cabecera.')

F('FL-Acceso.dc.html', 'Acceso y alta', 'Demo cerrada: se entra con invitación. Sin contraseñas: código por email o SMS, o Google y Apple.',
  [('bien', 0, 0, 'Bienvenida', 'Mar del Plata en SVG', 'casa', 'A-Bienvenida.dc.html', 'i'), ('inv', 1, 0, 'Invitación', 'Código HX-…', 'sobre', 'A-Invitacion.dc.html', 'p'),
   ('hx', 2, 0, 'Valida la invitación', 'Vigente y sin usar', 'escudo', None, 's'), ('ent', 3, 0, 'Entrar', 'Email, SMS, Google, Apple', 'cuenta', 'A-Entrar.dc.html', 'p'),
   ('cod', 4, 0, 'Código', '6 números', 'candado', 'A-Codigo.dc.html', 'p'), ('seg', 5, 0, 'Segunda verificación', 'Solo si la activaste', 'escudo', 'A-Segunda.dc.html', 'p'),
   ('dat', 0, 1, 'Tus datos', 'Nombre y celular', 'cuenta', 'A-Datos.dc.html', 'p'), ('zon', 1, 1, 'Tu zona', 'Barrio aproximado', 'pin', 'A-Zona.dc.html', 'p'),
   ('ava', 2, 1, 'Avisos', 'Elegís cuáles', 'campana', 'A-Avisos.dc.html', 'p'), ('lis', 3, 1, '¡Listo!', 'Tarifa 0 % hasta el 10/12', 'check', 'A-Listo.dc.html', 'p'),
   ('ini', 4, 1, 'Inicio', 'Primer ingreso', 'casa', 'I-Inicio.dc.html', 'p')],
  [('bien', 'inv', ''), ('inv', 'hx', ''), ('hx', 'ent', ''), ('ent', 'cod', ''), ('cod', 'seg', ''), ('seg', 'dat', 'Primera vez'),
   ('dat', 'zon', ''), ('zon', 'ava', ''), ('ava', 'lis', ''), ('lis', 'ini', '')],
  'Datos mínimos: nombre y celular, sin DNI ni CUIT. La zona es aproximada; la dirección exacta se comparte solo con el especialista que aceptás.')

F('FL-Pedir.dc.html', 'Pedir con HandIA', 'Dos caminos al mismo pedido: contarle a HandIA o elegir el rubro. Los dos siguen en ¿Cuándo? y terminan en Revisar.',
  [('ini', 0, 0, 'Inicio', 'Rubros y HandIA', 'casa', 'I-Inicio.dc.html', 'i'), ('han', 1, 0, 'Contale a HandIA', 'Texto o voz local', 'chispas', 'I-HandIA.dc.html', 'p'),
   ('pie', 2, 0, 'HandIA piensa', 'Riesgos primero', 'chispas', 'I-HandIAPiensa.dc.html', 'p'), ('fic', 3, 0, 'Ficha del pedido', 'La revisás vos', 'documento', 'I-HandIAFicha.dc.html', 'p'),
   ('rub', 0, 1, 'Rubro', 'Seis mosaicos', 'caja', 'P-Rubro.dc.html', 'p'), ('que', 1, 1, '¿Qué pasa?', 'Opciones del rubro', 'lista', 'P-Que.dc.html', 'p'),
   ('fot', 2, 1, 'Fotos', 'Hasta 6', 'foto', 'P-Fotos.dc.html', 'p'), ('cua', 3, 1, '¿Cuándo?', 'Urgente o programado', 'reloj', 'P-Cuando.dc.html', 'p'),
   ('fec', 4, 1, 'Día y franja', 'Calendario', 'agenda', 'P-Fecha.dc.html', 'p'), ('zon', 5, 1, 'Zona aproximada', 'Barrio, no la casa', 'pin', 'P-Zona.dc.html', 'p'),
   ('ano', 2, 2, 'Anotar la foto', 'Flechas y texto', 'editar', 'P-Anotar.dc.html', 'p'), ('med', 3, 2, 'Medir con la cámara', 'Aproximado', 'regla', 'P-Medir.dc.html', 'p'),
   ('rev', 4, 2, 'Revisar', 'Todo junto', 'lista', 'P-Revisar.dc.html', 'p'), ('pub', 5, 2, 'Publicado', 'Buscando especialistas', 'check', 'P-Publicado.dc.html', 'p'),
   ('hx', 5, 3, 'Avisa a verificados', 'Del rubro y la zona', 'escudo', None, 's')],
  [('ini', 'han', ''), ('han', 'pie', ''), ('pie', 'fic', ''), ('fic', 'cua', 'Ficha lista'), ('ini', 'rub', ''), ('rub', 'que', ''), ('que', 'fot', ''), ('fot', 'cua', ''),
   ('fot', 'ano', ''), ('fot', 'med', ''), ('cua', 'fec', ''), ('fec', 'zon', ''), ('zon', 'rev', ''), ('rev', 'pub', ''), ('pub', 'hx', '')],
  'HandIA conversa sin IA externa y tacha datos personales antes de procesar; no recibe fotos ni audio. Las fotos van al pedido, no a HandIA. Anotar y medir vuelven a Fotos.')

F('FL-Propuestas.dc.html', 'Propuestas y aceptar', 'Cada especialista pone su precio. Handyx sugiere un rango, nunca lo impone.',
  [('pub', 0, 0, 'Publicado', 'Tu pedido', 'check', 'P-Publicado.dc.html', 'i'), ('bus', 1, 0, 'Buscando', 'Sin prometer tiempos', 'lupa', 'C-Buscando.dc.html', 'p'),
   ('esp', 2, 0, 'Mandan su propuesta', 'Precio, fecha, mensaje', 'billete', None, 'e'), ('pro', 3, 0, 'Propuestas', 'Una tarjeta por especialista', 'billete', 'C-Propuestas.dc.html', 'p'),
   ('com', 4, 0, 'Comparar', 'Precio, fecha, reseñas', 'columnas', 'C-Comparar.dc.html', 'p'),
   ('cam', 2, 1, 'Pedir cambios', 'Otro precio u horario', 'editar', 'C-Cambios.dc.html', 'p'), ('det', 3, 1, 'Detalle y perfil', 'Verificados con dato real', 'cuenta', 'C-Detalle.dc.html', 'p'),
   ('cer', 4, 1, 'Certificados', 'Verificado ≠ cargado', 'escudo', 'C-Certificados.dc.html', 'p'),
   ('acp', 3, 2, 'Aceptar', 'Resumen y confirmación', 'check', 'C-Aceptar.dc.html', 'p'), ('ok', 4, 2, 'Aceptada', 'Turno confirmado', 'check', 'C-Aceptada.dc.html', 'p'),
   ('dir', 5, 2, 'Comparte tu dirección', 'Solo con quien aceptaste', 'pin', None, 's')],
  [('pub', 'bus', ''), ('bus', 'esp', ''), ('esp', 'pro', ''), ('pro', 'com', ''), ('pro', 'det', ''), ('det', 'cer', ''), ('det', 'cam', ''), ('cam', 'esp', 'Contrapropuesta'),
   ('det', 'acp', ''), ('acp', 'ok', ''), ('ok', 'dir', '')],
  'El rango sugerido orienta y no obliga. «Verificado» solo con dato real.')

F('FL-Seguimiento.dc.html', 'Seguimiento y pago', 'Del turno confirmado a la reseña. El viaje en vivo existe solo mientras el especialista lo comparte.',
  [('ag', 0, 0, 'Turno agendado', 'Día y franja', 'agenda', 'S-Agendado.dc.html', 'i'), ('esp', 1, 0, 'Sale para tu casa', 'Comparte el viaje', 'camion', None, 'e'),
   ('enc', 2, 0, 'En camino', 'Llegada del servidor', 'pin', 'S-EnCamino.dc.html', 'p'), ('lle', 3, 0, 'Llegó', 'Termina el viaje', 'check', 'S-Llego.dc.html', 'p'),
   ('tra', 4, 0, 'Trabajando', 'Avances con fotos', 'herramienta', 'S-Trabajando.dc.html', 'p'), ('adi', 5, 0, 'Adicional', 'Si hace falta, lo aprobás', 'alerta', 'S-Adicional.dc.html', 'p'),
   ('fin', 0, 1, 'Termina e informa', 'Fotos y garantía', 'documento', None, 'e'), ('ad', 1, 1, 'Antes y después', 'Deslizador', 'deslizar', 'S-AntesDespues.dc.html', 'p'),
   ('lal', 2, 1, 'Lado a lado', 'Las dos fotos', 'columnas', 'S-LadoALado.dc.html', 'p'), ('inf', 3, 1, 'Informe', 'Con garantía', 'documento', 'S-Informe.dc.html', 'p'),
   ('con', 4, 1, 'Conformidad', 'Un toque', 'pulgar', 'S-Conformidad.dc.html', 'p'), ('pag', 5, 1, 'Pagar', 'Directo: MP o efectivo', 'billete', 'S-Pagar.dc.html', 'p'),
   ('pin', 0, 2, 'Pago informado', 'Informado ≠ verificado', 'reloj', 'S-PagoInformado.dc.html', 'p'), ('ok', 1, 2, 'Confirma el pago', 'Pasa a verificado', 'check', None, 'e'),
   ('res', 2, 2, 'Reseña', 'Opcional', 'estrella', 'S-Resena.dc.html', 'p')],
  [('ag', 'esp', ''), ('esp', 'enc', ''), ('enc', 'lle', ''), ('lle', 'tra', ''), ('tra', 'adi', ''), ('adi', 'fin', 'Sigue el trabajo'), ('fin', 'ad', ''),
   ('ad', 'lal', ''), ('lal', 'inf', ''), ('inf', 'con', ''), ('con', 'pag', ''), ('pag', 'pin', 'Efectivo o MP'), ('pin', 'ok', ''), ('ok', 'res', '')],
  'La llegada estimada la calcula el servidor; el front nunca estima. Handyx no recibe ni reparte la plata. Volver del checkout no confirma nada.')

F('FL-Obra.dc.html', 'Obra de varios días', 'Propuesta de obra con días y etapas; repuestos y cambios de fecha se aprueban desde el chat.',
  [('pro', 0, 0, 'Propuesta de obra', 'La aprobás: días y etapas', 'documento', 'O-Propuesta.dc.html', 'i'), ('obr', 1, 0, 'Tu obra', 'Día 4 de 6', 'obra', 'O-Obra.dc.html', 'p'),
   ('dia', 2, 0, 'El día', 'Quién viene y qué hace', 'agenda', 'O-Dia.dc.html', 'p'), ('esp', 3, 0, 'Pide un repuesto', 'Con foto y precio', 'tornillo', None, 'e'),
   ('rep', 4, 0, 'Aprobar repuesto', 'Sí o no, con motivo', 'check', 'O-Repuesto.dc.html', 'p'), ('chat', 5, 0, 'Queda en el chat', 'Tarjeta respondida', 'chat', 'M-Chat.dc.html', 'p'),
   ('eta', 0, 1, 'Termina una etapa', 'Fotos de la etapa', 'check', None, 'e'), ('pag', 1, 1, 'Pagos por etapa', 'Según el reparto', 'billete', 'O-Pagos.dc.html', 'p'),
   ('gas', 2, 1, 'Total gastado', 'Etapas y repuestos', 'grafico', 'O-Gastado.dc.html', 'p'), ('esf', 4, 1, 'Propone mover un día', 'Con motivo', 'agenda', None, 'e'),
   ('fec', 5, 1, 'Cambio de fecha', 'Aceptás u ofrecés otra', 'reloj', 'O-Fecha.dc.html', 'p')],
  [('pro', 'obr', ''), ('obr', 'dia', ''), ('dia', 'esp', ''), ('esp', 'rep', ''), ('rep', 'chat', ''), ('dia', 'eta', ''), ('eta', 'pag', ''), ('pag', 'gas', ''),
   ('dia', 'esf', ''), ('esf', 'fec', ''), ('fec', 'chat', '')],
  'Cada pago por etapa va directo a quien la hizo. Handyx no recibe ni reparte la plata; el total suma lo informado y lo verificado por separado.')

F('FL-Equipo.dc.html', 'Obra en equipo', 'Cuando hace falta otro oficio, el especialista a cargo propone sumarlo y vos lo aprobás.',
  [('obr', 0, 0, 'Tu obra', 'Revestimiento del baño', 'obra', 'O-Obra.dc.html', 'i'), ('esp', 1, 0, 'Propone sumar a alguien', 'Sofía Ruiz, a cargo', 'cuenta', None, 'e'),
   ('apr', 2, 0, 'Aprobás quién y el reparto', 'Monto de cada etapa', 'check', 'O-Propuesta.dc.html', 'p'), ('otr', 3, 0, 'Se suma Diego', 'Electricidad', 'cuenta', None, 'o'),
   ('gru', 4, 0, 'Grupo de la obra', 'Todos con iniciales', 'chat', 'O-Grupo.dc.html', 'p'), ('dia', 5, 0, 'Quién viene cada día', 'Por día y franja', 'agenda', 'O-Dia.dc.html', 'p'),
   ('eta', 0, 1, 'Termina su etapa', 'Diego, con fotos', 'check', None, 'o'), ('con', 1, 1, 'Confirmás la etapa', 'Un toque', 'pulgar', 'S-Conformidad.dc.html', 'p'),
   ('pag', 2, 1, 'Le pagás a Diego', 'Directo, su parte', 'billete', 'O-Pagos.dc.html', 'p'), ('gas', 3, 1, 'Total gastado', 'De toda la obra', 'grafico', 'O-Gastado.dc.html', 'p')],
  [('obr', 'esp', ''), ('esp', 'apr', ''), ('apr', 'otr', ''), ('otr', 'gru', ''), ('gru', 'dia', ''), ('dia', 'eta', ''), ('eta', 'con', ''), ('con', 'pag', ''), ('pag', 'gas', '')],
  'Cada profesional ve tu dirección exacta solo para los días que trabaja. En el grupo nadie ve tu celular.')

F('FL-Mensajes.dc.html', 'Mensajes y tarjetas', 'Presupuestos, repuestos y fechas llegan como tarjetas: se aceptan o se responden ahí mismo.',
  [('men', 0, 0, 'Mensajes', 'Por pedido y obra', 'chat', 'M-Mensajes.dc.html', 'i'), ('esp', 1, 0, 'Manda una tarjeta', 'Presupuesto o repuesto', 'billete', None, 'e'),
   ('chat', 2, 0, 'Chat', 'Tarjetas con acciones', 'chat', 'M-Chat.dc.html', 'p'), ('pres', 3, 0, 'Presupuesto', 'Detalle por ítem', 'billete', 'M-Presupuesto.dc.html', 'p'),
   ('acp', 4, 0, 'Aceptar', 'Confirmación', 'check', 'C-Aceptar.dc.html', 'p'), ('ok', 5, 0, 'Aceptada', 'Queda en el chat', 'check', 'C-Aceptada.dc.html', 'p'),
   ('adj', 2, 1, 'Adjuntar', 'Foto, medida, 3D', 'foto', 'M-Adjuntar.dc.html', 'p'), ('her', 3, 1, 'Herramientas', 'Medir, nivel, 3D', 'regla', 'T-Herramientas.dc.html', 'p'),
   ('des', 4, 1, '¿A dónde va?', 'Chat o pedido', 'compartir', 'T-Destino.dc.html', 'p'),
   ('sop', 0, 2, 'Soporte', 'Conversación con Handyx', 'sobre', 'M-Soporte.dc.html', 'p'), ('hx', 1, 2, 'Responde una persona', 'Soporte de Handyx', 'ayuda', None, 's')],
  [('men', 'chat', ''), ('esp', 'chat', ''), ('chat', 'pres', ''), ('pres', 'acp', ''), ('acp', 'ok', ''), ('chat', 'adj', ''), ('adj', 'her', ''), ('her', 'des', ''),
   ('men', 'sop', ''), ('sop', 'hx', '')],
  'Nada se manda solo a tus contactos. Las respuestas rápidas son sugerencias: siempre las mandás vos.')

F('FL-Hogar.dc.html', 'Mi hogar y mantenimiento', 'La ficha de la casa junta ambientes, equipos, historial, garantías y recordatorios.',
  [('hog', 0, 0, 'Mi hogar', 'Ficha de la casa', 'hogar', 'H-Hogar.dc.html', 'i'), ('amb', 1, 0, 'Ambiente', 'Baño, cocina…', 'casa', 'H-Ambiente.dc.html', 'p'),
   ('equ', 2, 0, 'Equipo', 'Calefón, aire…', 'herramienta', 'H-Equipo.dc.html', 'p'), ('mod', 3, 0, 'Modelo 3D', 'Medidas compartidas', 'cubo', 'H-Modelo3D.dc.html', 'p'),
   ('ar', 4, 0, 'Ver en AR', 'Equipo propuesto', 'ar', 'H-AR.dc.html', 'p'), ('acp', 5, 0, 'Aceptar propuesta', 'Si te convence', 'check', 'C-Aceptar.dc.html', 'p'),
   ('rec', 0, 1, 'Recordatorios', 'Mantenimiento', 'campana', 'H-Recordatorios.dc.html', 'p'), ('his', 1, 1, 'Historial', 'Todo lo que se hizo', 'reloj', 'H-Historial.dc.html', 'p'),
   ('gar', 2, 1, 'Garantías', 'Hasta cuándo cubre', 'escudo', 'H-Garantias.dc.html', 'p'), ('inf', 3, 1, 'Informe', 'Del trabajo', 'documento', 'S-Informe.dc.html', 'p'),
   ('ped', 0, 2, 'Pedir el service', 'Ya con los datos', 'caja', 'P-Que.dc.html', 'p'), ('cam', 1, 2, 'Suma al camino', 'Mantenimiento a tiempo', 'medalla', 'G-Camino.dc.html', 'p')],
  [('hog', 'amb', ''), ('amb', 'equ', ''), ('equ', 'mod', ''), ('mod', 'ar', ''), ('ar', 'acp', ''), ('hog', 'rec', ''), ('hog', 'his', ''), ('his', 'gar', ''), ('gar', 'inf', ''),
   ('rec', 'ped', ''), ('rec', 'cam', '')],
  'Medidas y modelos 3D se comparten solo con quien elegís y por pedido. Las medidas con la cámara son aproximadas.')

F('FL-Herramientas.dc.html', 'Herramientas y AR', 'Las mismas herramientas que usa el especialista. Todo termina en el chat o en el pedido.',
  [('her', 0, 0, 'Herramientas', 'Para tu casa', 'regla', 'T-Herramientas.dc.html', 'i'),
   ('med', 0, 1, 'Medir con la cámara', '± 1 cm aprox.', 'regla', 'T-Medir.dc.html', 'p'), ('niv', 1, 1, 'Nivel', 'Giroscopio', 'nivel', 'T-Nivel.dc.html', 'p'),
   ('lin', 2, 1, 'Linterna y lupa', 'Para ver de cerca', 'linterna', 'T-Linterna.dc.html', 'p'), ('esc', 3, 1, 'Escanear en 3D', 'Fotos alrededor', 'cubo', 'T-Escanear.dc.html', 'p'),
   ('des', 0, 2, '¿A dónde va?', 'Chat o pedido', 'compartir', 'T-Destino.dc.html', 'p'), ('mod', 3, 2, 'Modelo 3D', 'Con medidas', 'cubo', 'H-Modelo3D.dc.html', 'p'),
   ('ar', 4, 2, 'Ver en AR', 'Tamaño real', 'ar', 'H-AR.dc.html', 'p'),
   ('chat', 0, 3, 'Al chat', 'Con el especialista', 'chat', 'M-Chat.dc.html', 'p'), ('ped', 1, 3, 'Al pedido', 'Se suma a Revisar', 'caja', 'P-Revisar.dc.html', 'p')],
  [('her', 'med', ''), ('her', 'niv', ''), ('her', 'lin', ''), ('her', 'esc', ''), ('med', 'des', ''), ('des', 'chat', ''), ('des', 'ped', ''), ('esc', 'mod', ''), ('mod', 'ar', '')],
  'Las medidas son aproximadas. El teléfono no detecta gas, tensión ni monóxido: ante olor a gas, salí y llamá a emergencias.')

F('FL-Camino.dc.html', 'Camino del hogar', 'Se avanza cuidando la casa, no gastando más. Sin azar, sin rankings y sin envíos a contactos.',
  [('cam', 0, 0, 'Camino del hogar', '3 de 5', 'medalla', 'G-Camino.dc.html', 'i'), ('ins', 1, 0, 'Insignias', '2 de 6', 'medalla', 'G-Insignias.dc.html', 'p'),
   ('una', 2, 0, 'Una insignia', 'Qué falta', 'medalla', 'G-Insignia.dc.html', 'p'), ('ben', 3, 0, 'Beneficios', 'Borrador · Legal', 'regalo', 'G-Beneficios.dc.html', 'p'),
   ('leg', 4, 0, 'Legal aprueba', 'Montos y condiciones', 'documento', None, 's'),
   ('rec', 0, 1, 'Mantenimiento a tiempo', 'Con Handyx o por tu cuenta', 'campana', 'H-Recordatorios.dc.html', 'p'), ('con', 1, 1, 'Conformidad', 'Trabajo terminado', 'pulgar', 'S-Conformidad.dc.html', 'p'),
   ('inf', 2, 1, 'Informe leído', 'Sabés qué se hizo', 'documento', 'S-Informe.dc.html', 'p'), ('hit', 1, 2, '¡Insignia nueva!', 'Celebración breve', 'estrella', 'G-Hito.dc.html', 'p')],
  [('cam', 'ins', ''), ('ins', 'una', ''), ('una', 'ben', ''), ('ben', 'leg', ''), ('rec', 'hit', ''), ('con', 'hit', ''), ('inf', 'hit', '')],
  'Nada se compra ni se sortea; no hay comparaciones con otras personas. Montos y premios en borrador hasta que los apruebe Legal.')

F('FL-Cuenta.dc.html', 'Cuenta y ayuda', 'Todo lo tuyo desde el avatar: datos, seguridad, pagos registrados, privacidad y ayuda.',
  [('ini', 0, 0, 'Inicio', 'Tocás tu avatar', 'casa', 'I-Inicio.dc.html', 'i'), ('cta', 1, 0, 'Tu cuenta', 'Resumen y menú', 'cuenta', 'X-Cuenta.dc.html', 'p'),
   ('err', 3, 0, 'Algo se rompió', 'Desde cualquier lado', 'alerta', 'X-Error.dc.html', 'p'), ('sin', 4, 0, 'Sin conexión', 'No se mandó nada', 'wifi', 'X-SinConexion.dc.html', 'p'),
   ('noe', 5, 0, 'No encontrada', 'Ir al inicio', 'lupa', 'X-NoEncontrado.dc.html', 'p'),
   ('ayu', 0, 1, 'Ayuda', 'Temas y preguntas', 'ayuda', 'X-Ayuda.dc.html', 'p'), ('dat', 1, 1, 'Datos y direcciones', 'Sin DNI ni CUIT', 'cuenta', 'X-Datos.dc.html', 'p'),
   ('seg', 2, 1, 'Seguridad', 'Sesiones abiertas', 'candado', 'X-Seguridad.dc.html', 'p'), ('pag', 3, 1, 'Pagos registrados', 'Sin tarjetas', 'billete', 'X-Pagos.dc.html', 'p'),
   ('pri', 4, 1, 'Privacidad', 'HandIA, descarga, baja', 'escudo', 'X-Privacidad.dc.html', 'p'),
   ('res', 0, 2, 'Respuesta', '¿Te sirvió?', 'documento', 'X-Respuesta.dc.html', 'p'), ('zon', 1, 2, 'Sumar dirección', 'Zona aproximada', 'pin', 'A-Zona.dc.html', 'p'),
   ('sfa', 2, 2, 'Segunda verificación', 'Activar o cambiar', 'escudo', 'A-Segunda.dc.html', 'p'), ('esp', 3, 2, 'Confirma el efectivo', 'Pasa a verificado', 'check', None, 'e'),
   ('hx', 4, 2, 'Borra la cuenta', 'Salvo lo que pide la ley', 'cerrar', None, 's'), ('sop', 0, 3, 'Soporte', 'Una persona', 'sobre', 'M-Soporte.dc.html', 'p')],
  [('ini', 'cta', ''), ('cta', 'ayu', ''), ('cta', 'dat', ''), ('cta', 'seg', ''), ('cta', 'pag', ''), ('cta', 'pri', ''), ('ayu', 'res', ''), ('res', 'sop', ''),
   ('dat', 'zon', ''), ('seg', 'sfa', ''), ('pag', 'esp', ''), ('pri', 'hx', '')],
  'Error, sin conexión y página no encontrada aparecen desde cualquier lado; ninguna da por hecho algo que no se mandó.')

json.dump(FL, open('usuario/gen/flujos.json', 'w'))
print('flujos', len(FL))
