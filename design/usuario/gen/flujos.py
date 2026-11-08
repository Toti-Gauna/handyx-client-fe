# Flujos de la app del usuario (FL-*). Cada nodo de pantalla abre su .dc.html en el lienzo.
import sys, json
sys.path.insert(0, 'usuario/gen')
from flujos_base import *  # noqa: F401,F403

FL = []


def F(*a, **k):
    W, H = flujo(*a, **k)
    FL.append((a[0], a[1], W, H))


F('FL-Mapa.dc.html', 'Mapa de la app', 'Cinco pestañas en una barra de vidrio azul; HandIA encastrada en el medio. La cuenta, desde tu avatar.',
  [('ini', 0, 0, 'Inicio', 'Rubros, turno, HandIA, Quiero…', 'casa', 'I-Inicio.dc.html', 'i'), ('act', 1, 0, 'Actividad', 'En curso, agenda, historial', 'agenda', 'X-Actividad.dc.html', 'i'),
   ('han', 2, 0, 'HandIA', 'Círculo del medio', 'chispas', 'I-HandIA.dc.html', 'i'), ('men', 3, 0, 'Mensajes', 'Chats con tarjetas', 'chat', 'M-Mensajes.dc.html', 'i'),
   ('hog', 4, 0, 'Mi hogar', 'Cuatro puertas', 'hogar', 'H-Hogar.dc.html', 'i'), ('cta', 5, 0, 'Cuenta', 'Desde tu avatar', 'cuenta', 'X-Cuenta.dc.html', 'i'),
   ('ped', 0, 1, 'Pedir', 'Qué pasa › revisar', 'caja', 'P-Que.dc.html', 'p'), ('seg', 1, 1, 'Seguimiento', 'Trabajo, informe, pago', 'reloj', 'S-Trabajando.dc.html', 'p'),
   ('voz', 2, 1, 'HandIA voz', 'Esfera de luz, sin personaje', 'onda', 'I-Voz.dc.html', 'p'), ('chat', 3, 1, 'Chat', 'Aceptás en la tarjeta', 'chat', 'M-Chat.dc.html', 'p'),
   ('casa', 4, 1, 'Mi casa', 'Ambientes y equipos', 'casa', 'H-MiCasa.dc.html', 'p'), ('ayu', 5, 1, 'Ayuda', 'Temas y preguntas', 'ayuda', 'X-Ayuda.dc.html', 'p'),
   ('pro', 0, 2, 'Propuestas', 'Aceptar, rechazar, perfil', 'billete', 'C-Propuestas.dc.html', 'p'), ('obr', 1, 2, 'Obra', 'Días, equipo, etapas', 'obra', 'O-Obra.dc.html', 'p'),
   ('fic', 2, 2, 'Ficha del pedido', 'La revisás vos', 'documento', 'I-HandIAFicha.dc.html', 'p'), ('sel', 3, 2, 'Seleccionar', 'Copiar, reenviar, borrar', 'check', 'M-Seleccion.dc.html', 'p'),
   ('rom', 4, 2, 'Algo se rompió', 'El pedido sale armado', 'alerta', 'H-Rompio.dc.html', 'p'), ('sop', 5, 2, 'Soporte', 'Personas de Handyx', 'sobre', 'M-Soporte.dc.html', 'p')],
  [('ini', 'ped', ''), ('ped', 'pro', ''), ('act', 'seg', ''), ('seg', 'obr', 'Varios días'), ('han', 'voz', ''), ('voz', 'fic', ''),
   ('men', 'chat', ''), ('chat', 'sel', 'Mantener'), ('hog', 'casa', ''), ('casa', 'rom', ''), ('cta', 'ayu', ''), ('ayu', 'sop', '')],
  'Las pestañas van en una barra de vidrio azul con un hueco que abraza a HandIA. Cuenta, datos, pagos y privacidad se abren desde el avatar del Inicio.')

F('FL-Acceso.dc.html', 'Acceso y alta', 'La gente se registra directo, sin invitación ni contraseñas. Al final, «Armá tu casa» es opcional.',
  [('bien', 0, 0, 'Bienvenida', 'Mar del Plata en SVG', 'casa', 'A-Bienvenida.dc.html', 'i'), ('ent', 1, 0, 'Entrar', 'Email, SMS, Google, Apple', 'cuenta', 'A-Entrar.dc.html', 'p'),
   ('cod', 2, 0, 'Código', '6 números', 'candado', 'A-Codigo.dc.html', 'p'), ('dat', 3, 0, 'Tus datos', 'Nombre y celular', 'cuenta', 'A-Datos.dc.html', 'p'),
   ('zon', 4, 0, 'Tu zona', 'Barrio aproximado', 'pin', 'A-Zona.dc.html', 'p'), ('ava', 5, 0, 'Avisos', 'Elegís cuáles', 'campana', 'A-Avisos.dc.html', 'p'),
   ('casa', 0, 1, 'Armá tu casa', 'Opcional · se salta', 'hogar', 'A-Casa.dc.html', 'p'), ('amb', 1, 1, 'Ambientes', 'Cuántos hay', 'casa', 'A-CasaAmbientes.dc.html', 'p'),
   ('equ', 2, 1, 'Equipos', 'Calefón, aire, tablero…', 'herramienta', 'A-CasaEquipos.dc.html', 'p'), ('fot', 3, 1, 'Una foto por ambiente', 'Opcional', 'camara', 'A-CasaFotos.dc.html', 'p'),
   ('lis', 4, 1, '¡Listo!', 'Tarifa 0 % hasta el 10/12', 'check', 'A-Listo.dc.html', 'p'), ('ini', 5, 1, 'Inicio', 'Primer ingreso', 'casa', 'I-Inicio.dc.html', 'p'),
   ('seg', 4, 2, 'Segunda verificación', 'Opcional, desde ¡Listo!', 'escudo', 'A-Segunda.dc.html', 'p')],
  [('bien', 'ent', 'Crear cuenta'), ('ent', 'cod', ''), ('cod', 'dat', ''), ('dat', 'zon', ''), ('zon', 'ava', ''), ('ava', 'casa', 'Primera vez'),
   ('casa', 'amb', ''), ('amb', 'equ', ''), ('equ', 'fot', ''), ('fot', 'lis', ''), ('lis', 'ini', ''), ('lis', 'seg', '')],
  'Datos mínimos: nombre y celular, sin DNI ni CUIT. La dirección exacta se comparte solo al aceptar una propuesta. La ficha de la casa es privada.')

F('FL-Pedir.dc.html', 'Pedir con HandIA', 'Camino corto en 3 toques: rubro › qué pasa › revisar y publicar. Lo demás es opcional y se cambia desde Revisar.',
  [('ini', 0, 0, 'Inicio', 'Rubros y HandIA', 'casa', 'I-Inicio.dc.html', 'i'), ('han', 1, 0, 'HandIA', 'Chat vacío y sugerencias', 'chispas', 'I-HandIA.dc.html', 'p'),
   ('cha', 2, 0, 'Conversación', 'Mensajes sobre la caja', 'chat', 'I-HandIAChat.dc.html', 'p'), ('pie', 3, 0, 'HandIA piensa', 'Riesgos primero', 'chispas', 'I-HandIAPiensa.dc.html', 'p'),
   ('fic', 4, 0, 'Ficha del pedido', 'La revisás vos', 'documento', 'I-HandIAFicha.dc.html', 'p'),
   ('que', 0, 1, '1 · ¿Qué pasa?', 'Rubro ya elegido', 'lista', 'P-Que.dc.html', 'p'), ('rev', 4, 1, '2 · Revisar y publicar', 'Cuándo y dónde, ya puestos', 'check', 'P-Revisar.dc.html', 'p'),
   ('pub', 5, 1, 'Publicado', 'Buscando especialistas', 'enviar', 'P-Publicado.dc.html', 'p'),
   ('fot', 0, 2, 'Fotos', 'Opcional', 'camara', 'P-Fotos.dc.html', 'p'), ('ano', 1, 2, 'Anotar', 'Flechas y texto', 'editar', 'P-Anotar.dc.html', 'p'),
   ('med', 2, 2, 'Medir', 'Aproximado', 'regla', 'P-Medir.dc.html', 'p'), ('cua', 3, 2, '¿Cuándo?', 'Si no, lo antes posible', 'reloj', 'P-Cuando.dc.html', 'p'),
   ('fec', 4, 2, 'Día y franja', 'Calendario', 'agenda', 'P-Fecha.dc.html', 'p'), ('hx', 5, 2, 'Avisa a verificados', 'Del rubro y la zona', 'escudo', None, 's')],
  [('ini', 'han', ''), ('han', 'cha', ''), ('cha', 'pie', ''), ('pie', 'fic', ''), ('fic', 'rev', 'Pedir así'), ('ini', 'que', 'Toca un rubro'),
   ('que', 'rev', 'Camino corto'), ('rev', 'pub', ''), ('pub', 'hx', ''), ('que', 'fot', ''), ('fot', 'ano', ''), ('ano', 'med', ''), ('rev', 'cua', 'Cambiar'), ('cua', 'fec', '')],
  'HandIA conversa sin IA externa y tacha datos personales; no recibe fotos ni audio. Fotos, medidas, día y dirección son opcionales y se cambian desde Revisar.')

F('FL-Propuestas.dc.html', 'Propuestas y aceptar', 'Cada tarjeta trae aceptar, rechazar y ver perfil. Handyx sugiere un rango y marca la mejor por promedio.',
  [('pub', 0, 0, 'Publicado', 'Tu pedido', 'check', 'P-Publicado.dc.html', 'i'), ('bus', 1, 0, 'Buscando', 'Sin prometer tiempos', 'lupa', 'C-Buscando.dc.html', 'p'),
   ('esp', 2, 0, 'Mandan su propuesta', 'Precio, fecha, detalle', 'billete', None, 'e'), ('pro', 3, 0, 'Propuestas', 'Aceptar · rechazar · perfil', 'billete', 'C-Propuestas.dc.html', 'p'),
   ('com', 4, 0, 'Comparar', 'La mejor por promedio', 'trofeo', 'C-Comparar.dc.html', 'p'), ('vis', 5, 0, 'Visita', 'Si es solo una consulta', 'ojo', 'C-Visita.dc.html', 'p'),
   ('cam', 2, 1, 'Pedir cambios', 'Otro día o precio', 'editar', 'C-Cambios.dc.html', 'p'), ('det', 3, 1, 'Detalle', 'Materiales, equipo, duración', 'documento', 'C-Detalle.dc.html', 'p'),
   ('per', 4, 1, 'Perfil', 'Verificaciones y reseñas', 'cuenta', 'C-Certificados.dc.html', 'p'), ('rec', 5, 1, 'Rechazar', 'Motivo opcional', 'cerrar', 'C-Rechazar.dc.html', 'p'),
   ('acp', 3, 2, 'Aceptar', 'Hoja sobre la propuesta', 'check', 'C-Aceptar.dc.html', 'p'), ('ok', 4, 2, 'Turno confirmado', 'Qué sigue', 'check', 'C-Aceptada.dc.html', 'p'),
   ('dir', 5, 2, 'Comparte tu dirección', 'Solo con quien aceptaste', 'pin', None, 's')],
  [('pub', 'bus', ''), ('bus', 'esp', ''), ('esp', 'pro', ''), ('pro', 'com', ''), ('com', 'vis', ''), ('pro', 'det', ''), ('det', 'per', ''), ('per', 'rec', ''),
   ('det', 'cam', ''), ('cam', 'esp', 'Contrapropuesta'), ('det', 'acp', ''), ('acp', 'ok', ''), ('ok', 'dir', '')],
  'El rango orienta y no obliga. «La mejor en perfil y precio» sale de un promedio con los mismos pesos para todas: elegís vos.')

F('FL-Seguimiento.dc.html', 'Seguimiento y pago', 'Del turno a la reseña. El viaje en vivo existe solo mientras el especialista lo comparte.',
  [('ag', 0, 0, 'Turno agendado', 'Día y franja', 'agenda', 'S-Agendado.dc.html', 'i'), ('esp', 1, 0, 'Sale para tu casa', 'Comparte el viaje', 'camion', None, 'e'),
   ('enc', 2, 0, 'En camino', 'Llegada del servidor', 'pin', 'S-EnCamino.dc.html', 'p'), ('lle', 3, 0, 'Llegó', 'Código para abrir', 'check', 'S-Llego.dc.html', 'p'),
   ('tra', 4, 0, 'Trabajo', 'Etapas y avance', 'herramienta', 'S-Trabajando.dc.html', 'p'), ('adi', 5, 0, 'Adicional', 'Foto, motivo y total', 'alerta', 'S-Adicional.dc.html', 'p'),
   ('fin', 0, 1, 'Termina e informa', 'Fotos y garantía', 'documento', None, 'e'), ('ad', 1, 1, 'Antes y después', 'Deslizador', 'deslizar', 'S-AntesDespues.dc.html', 'p'),
   ('lal', 2, 1, 'Lado a lado', 'Las dos fotos', 'columnas', 'S-LadoALado.dc.html', 'p'), ('inf', 3, 1, 'Informe', 'Con garantía', 'documento', 'S-Informe.dc.html', 'p'),
   ('con', 4, 1, 'Conformidad', 'Un toque', 'pulgar', 'S-Conformidad.dc.html', 'p'), ('pag', 5, 1, 'Pagar', 'Directo: MP o efectivo', 'billete', 'S-Pagar.dc.html', 'p'),
   ('pin', 0, 2, 'Pago informado', 'Informado ≠ verificado', 'reloj', 'S-PagoInformado.dc.html', 'p'), ('ok', 1, 2, 'Confirma el pago', 'Pasa a verificado', 'check', None, 'e'),
   ('res', 2, 2, 'Reseña', 'Hoja tipo Uber · opcional', 'estrella', 'S-Resena.dc.html', 'p')],
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
   ('chat', 2, 0, 'Chat', 'Mensajes sobre la caja', 'chat', 'M-Chat.dc.html', 'p'), ('pres', 3, 0, 'Presupuesto', 'Detalle por ítem', 'billete', 'M-Presupuesto.dc.html', 'p'),
   ('acp', 4, 0, 'Aceptar', 'Confirmación', 'check', 'C-Aceptar.dc.html', 'p'), ('ok', 5, 0, 'Aceptada', 'Queda en el chat', 'check', 'C-Aceptada.dc.html', 'p'),
   ('adj', 2, 1, 'Adjuntar', 'Foto, medida, 3D', 'foto', 'M-Adjuntar.dc.html', 'p'), ('her', 3, 1, 'Herramientas', 'Medir, nivel, 3D', 'regla', 'T-Herramientas.dc.html', 'p'),
   ('des', 4, 1, '¿A dónde va?', 'Chat o pedido', 'compartir', 'T-Destino.dc.html', 'p'),
   ('sop', 0, 2, 'Soporte', 'Conversación con Handyx', 'sobre', 'M-Soporte.dc.html', 'p'), ('hx', 1, 2, 'Responde una persona', 'Soporte de Handyx', 'ayuda', None, 's'),
   ('gru', 2, 2, 'Grupo de la obra', 'Todo el equipo', 'personas', 'O-Grupo.dc.html', 'p'), ('sel', 3, 2, 'Seleccionar', 'Copiar, reenviar, borrar los tuyos', 'check', 'M-Seleccion.dc.html', 'p')],
  [('men', 'chat', ''), ('esp', 'chat', ''), ('chat', 'pres', ''), ('pres', 'acp', ''), ('acp', 'ok', ''), ('chat', 'adj', ''), ('adj', 'her', ''), ('her', 'des', ''),
   ('men', 'sop', ''), ('sop', 'hx', ''), ('hx', 'gru', ''), ('gru', 'sel', 'Mantener')],
  'Nada se manda solo a tus contactos. Al borrar, solo se quitan tus mensajes: las tarjetas quedan.')

F('FL-Hogar.dc.html', 'Mi hogar', 'Cuatro puertas en la portada, cada una con su camino. Nada mezclado.',
  [('casa', 0, 0, 'A · Mi casa', 'Desde Mi hogar', 'casa', 'H-MiCasa.dc.html', 'i'), ('amb', 1, 0, 'Ambiente', 'Fotos, medidas, materiales', 'casa', 'H-Ambiente.dc.html', 'p'),
   ('equ', 2, 0, 'Equipo', 'Etiqueta, garantía, informes', 'herramienta', 'H-Equipo.dc.html', 'p'), ('sum', 3, 0, 'Sumar', 'Ambiente o equipo', 'mas', 'H-Sumar.dc.html', 'p'),
   ('mod', 4, 0, 'Planos y 3D', 'Más adelante', 'cubo', 'H-Modelo3D.dc.html', 'p'),
   ('rom', 0, 1, 'B · Algo se rompió', 'Desde Mi hogar', 'alerta', 'H-Rompio.dc.html', 'i'), ('que', 1, 1, 'Pedido armado', 'Con datos de la casa', 'lista', 'P-Que.dc.html', 'p'),
   ('cmp', 2, 1, 'Qué compartís', 'Solo para este pedido', 'compartido', 'H-Compartir.dc.html', 'p'), ('rev', 3, 1, 'Revisar y publicar', 'Ya con todo', 'check', 'P-Revisar.dc.html', 'p'),
   ('esp', 4, 1, 'Lo ve el especialista', 'Sin pedirte fotos', 'ojo', None, 'e'),
   ('rec', 0, 2, 'C · Mantenimiento', 'Desde Mi hogar', 'campana', 'H-Recordatorios.dc.html', 'i'), ('cam', 1, 2, 'Suma al camino', 'A tiempo', 'medalla', 'G-Camino.dc.html', 'p'),
   ('his', 0, 3, 'D · Historial', 'Desde Mi hogar', 'reloj', 'H-Historial.dc.html', 'i'), ('gar', 1, 3, 'Garantías', 'Hasta cuándo cubre', 'escudo', 'H-Garantias.dc.html', 'p'),
   ('com', 2, 3, 'Lo que compartiste', 'Cortalo cuando quieras', 'compartido', 'H-Compartido.dc.html', 'p')],
  [('casa', 'amb', ''), ('amb', 'equ', ''), ('equ', 'sum', ''), ('sum', 'mod', ''), ('rom', 'que', ''), ('que', 'cmp', ''),
   ('cmp', 'rev', ''), ('rev', 'esp', ''), ('rec', 'cam', ''), ('his', 'gar', ''), ('gar', 'com', '')],
  'La ficha es privada. Se comparte lo que elegís, con quien elegís y para un pedido; se deja de compartir sola al terminar.')

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
