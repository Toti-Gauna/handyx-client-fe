# Fila M · Mensajes (lista, chat con tarjetas, presupuesto en el chat, sumar al chat, soporte).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def escribir(placeholder='Escribí un mensaje'):
    return f'''  <div data-f="1" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 12px 20px; background: #FFFFFF; border-top: 1px solid {BORDE}; display: flex; align-items: center; gap: 8px">
    <a href="M-Adjuntar.dc.html" aria-label="Sumar foto, medida o tarjeta" style="width: 48px; height: 48px; flex: none; border-radius: 50%; background: {AZUL}; box-shadow: 0 3px 0 {HONDO}; display: flex; align-items: center; justify-content: center">{svg(IC['mas'], '#FFFFFF', 22)}</a>
    <label style="flex: 1; display: flex; align-items: center; min-height: 48px; padding: 0 16px; border-radius: 999px; background: {GRIS2}"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Mensaje</span><input readonly placeholder="{placeholder}" style="flex: 1; min-width: 0; height: 46px; border: 0; background: none; font-family: 'DM Sans', sans-serif; font-size: 15px"></label>
    <button type="button" aria-label="Enviar" style="width: 48px; height: 48px; flex: none; border-radius: 50%; border: 0; background: {MOSAICO}; display: flex; align-items: center; justify-content: center">{svg(IC['enviar'], AZUL, 20)}</button>
  </div>'''


def tarjeta_chat(tipo_ic, tipo, titulo_, sub, acciones, extra=''):
    a = ''.join(f'<a href="{h}" style="min-height: 48px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; text-decoration: none; {"background: " + VERDE + "; color: #FFFFFF" if v else "color: " + HONDO}; {"border-right: 1px solid " + BORDE if i == 0 else ""}">{t}</a>' for i, (t, h, v) in enumerate(acciones))
    return (f'<section style="align-self: flex-start; width: 86%; border-radius: 20px; border: 1px solid {BORDE}; background: #FFFFFF; box-shadow: {ELEV1}; overflow: hidden"><div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 6px">{chip(tipo, tipo_ic, "tinte")}<strong style="font-size: 15px">{titulo_}</strong><span style="font-size: 13px; color: {SUAVE}">{sub}</span>{extra}</div>'
            f'<div style="display: grid; grid-template-columns: repeat({len(acciones)}, minmax(0, 1fr)); border-top: 1px solid {BORDE}">{a}</div></section>')


def conversacion(k, titulo_, sub, href, hora, previa, sin_leer=0, grupo=None, fijada=False):
    av = avatares(grupo, 30) if grupo else (handia_avatar(48) if k == 'handia' else avatar(k, 48))
    n = f'<span style="min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box; border-radius: 11px; background: {AZUL}; color: #FFFFFF; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">sin leer: </span>{sin_leer}</span>' if sin_leer else ''
    fj = chip('Fijada', None, 'gris') if fijada else ''
    return (f'<a href="{href}" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}; color: {TINTA}; text-decoration: none">{av}'
            f'<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><span style="display: flex; justify-content: space-between; gap: 8px"><strong style="font-size: 15px">{titulo_}</strong><span style="font-size: 12px; color: {SUAVE}">{hora}</span></span>'
            f'<span style="font-size: 12px; font-weight: 700; color: {HONDO}">{sub}</span><span style="display: flex; justify-content: space-between; gap: 8px; align-items: center"><span style="font-size: 13px; color: {SUAVE}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{previa}</span>{n}{fj}</span></span></a>')


# M-Mensajes (pantalla raíz)
guardar_u('M-Mensajes.dc.html', 'Mensajes', f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 22px 16px 10px; display: flex; flex-direction: column; gap: 12px">
    <h1 style="margin: 0; {TIT}; font-size: 32px">{marcador("Mensajes")}</h1>
    <label style="display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 14px; border-radius: 16px; background: {GRIS2}">{svg(IC['lupa'], SUAVE, 18)}<span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Buscar en mensajes</span><input readonly placeholder="Buscar en mensajes" style="flex: 1; height: 46px; border: 0; background: none; font-family: 'DM Sans', sans-serif; font-size: 15px"></label>
  </header>
''' + cont('<div style="display: flex; flex-direction: column">'
           + conversacion('handia', 'HandIA', 'Tu asistente', 'I-HandIA.dc.html', 'Hoy', 'Listo, armé tu pedido de plomería.', fijada=True)
           + conversacion('julian', 'Julián Ortiz', 'Pedido · canilla del baño', 'M-Chat.dc.html', '11:20', 'Te mandó una propuesta · $ 45.000', 2)
           + conversacion(None, 'Obra · Baño completo', 'Julián, Sofía y Diego', 'O-Grupo.dc.html', '11:40', 'Diego: Sí, paso el lunes a probar…', 1, grupo=['julian', 'sofia', 'diego'])
           + conversacion('diego', 'Diego Herrera', 'Pedido · tablero eléctrico', 'M-Presupuesto.dc.html', 'Ayer', 'Te mandó un presupuesto')
           + conversacion('handyx', 'Soporte de Handyx', 'Personas del equipo', 'M-Soporte.dc.html', 'Lun', 'Resuelto: cambio de horario')
           + '</div>' + aviso('Los chats se abren cuando hay un pedido o una obra. Nadie te puede escribir por fuera de eso.', 'candado', 'gris'), top=140, gap=10)
    + barra_u('Mensajes'))

# M-Chat (con tarjetas que se aceptan ahí mismo)
guardar_u('M-Chat.dc.html', 'Chat con Julián', barra('Julián Ortiz', 'M-Mensajes.dc.html', accion_icono('telefono', 'Llamar a Julián', 'M-Chat.dc.html'), sub='Pedido · canilla del baño') + cont(
    f'<span style="align-self: center">{chip("Hoy", None, "gris")}</span>'
    + burbuja('Hola Lucía. Vi las fotos: parece el cuerito y quizás el cartucho.', 'otra', '11:12')
    + tarjeta_chat('billete', 'Propuesta', '$ 45.000 · jue 19/11 de 10 a 12 h', 'Incluye materiales · garantía 90 días', [('Ver', 'C-Detalle.dc.html', False), ('Aceptar', 'C-Aceptar.dc.html', True)])
    + burbuja('¿Podés el viernes temprano? El jueves trabajo.', 'yo', '11:16')
    + tarjeta_chat('agenda', 'Otro horario', 'Vie 20/11 · 8 a 10 h', 'Mismo precio y condiciones', [('Otro día', 'C-Cambios.dc.html', False), ('Aceptar', 'C-Aceptada.dc.html', True)])
    + f'<span style="align-self: center; font-size: 12px; color: {SUAVE}">Las tarjetas se aceptan acá mismo y quedan en el pedido.</span>', gap=10)
    + escribir())

# M-Presupuesto
items = [('Térmica bipolar 25 A', '1', '$ 18.400'), ('Disyuntor 40 A', '1', '$ 41.600'), ('Mano de obra', '3 h', '$ 39.000')]
detalle = '<div style="display: flex; flex-direction: column; gap: 6px; padding: 8px 0; border-top: 1px solid ' + BORDE + '">' + ''.join(f'<div style="display: flex; justify-content: space-between; font-size: 13px"><span>{a} · {b}</span><strong>{c}</strong></div>' for a, b, c in items) + f'<div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 6px; border-top: 1px solid {BORDE}"><strong style="font-size: 14px">Total</strong>{monto("$ 99.000", 22)}</div></div>'
guardar_u('M-Presupuesto.dc.html', 'Presupuesto en el chat', barra('Diego Herrera', 'M-Mensajes.dc.html', sub='Pedido · tablero eléctrico') + cont(
    burbuja('Te paso el presupuesto con lo que vi en la foto del tablero.', 'otra', '18:02')
    + tarjeta_chat('documento', 'Presupuesto', 'Cambio de térmica y disyuntor', 'Vale hasta el 25/11 · materiales a precio de hoy', [('Responder', 'M-Presupuesto.dc.html', False), ('Aceptar', 'C-Aceptar.dc.html', True)], extra=detalle)
    + aviso('Handyx sugiere entre $ 85.000 y $ 110.000 para este trabajo. El precio lo pone Diego.', 'grafico', 'gris')
    + burbuja('Gracias, lo reviso esta noche.', 'yo', '18:20'), gap=10)
    + escribir())

# M-Adjuntar (hoja sobre el chat)
op = lambda ic, t, s, h: f'<a href="{h}" style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; border-radius: 18px; background: {MOSAICO}; color: {TINTA}; text-decoration: none; text-align: center"><span aria-hidden="true" style="width: 48px; height: 48px; border-radius: 14px; background: #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC[ic], AZUL, 24)}</span><strong style="font-size: 13px">{t}</strong><span style="font-size: 11px; color: {SUAVE}">{s}</span></a>'
guardar_u('M-Adjuntar.dc.html', 'Sumar al chat', barra('Julián Ortiz', 'M-Chat.dc.html', sub='Pedido · canilla del baño') + '  <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(14,29,54,0.45)"></div>\n'
    + hoja(f'''<div data-c="1" style="display: flex; flex-direction: column; gap: 12px">
    <h2 style="margin: 0; {TIT}; font-size: 22px">Sumar al chat</h2>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">
      {op("camara", "Foto", "Cámara o galería", "M-Chat.dc.html")}{op("editar", "Foto anotada", "Flechas y texto", "P-Anotar.dc.html")}{op("regla", "Medida", "Con la cámara", "T-Medir.dc.html")}
      {op("nivel", "Nivel", "¿Está derecho?", "T-Nivel.dc.html")}{op("cubo", "Escaneo 3D", "Un ambiente", "T-Escanear.dc.html")}{op("hogar", "De Mi hogar", "Equipo o informe", "H-Hogar.dc.html")}
    </div>
    {aviso("Las fotos se mandan sin ubicación ni datos del teléfono.", "escudo", "gris")}
    {btn("Cerrar", "M-Chat.dc.html", var="contorno")}</div>''', top=360))

# M-Soporte
temas = ''.join(f'<a href="M-Soporte.dc.html" style="min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid {AZUL}; color: {AZUL}; font-size: 14px; font-weight: 800; text-decoration: none; display: flex; align-items: center">{t}</a>' for t in ['Un pago', 'Un turno', 'Mi cuenta', 'Otra cosa'])
guardar_u('M-Soporte.dc.html', 'Soporte de Handyx', barra('Soporte de Handyx', 'M-Mensajes.dc.html', sub='Te responde una persona del equipo') + cont(
    f'<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 0">{img("grupo", 200, 110)}<span style="{TIT}; font-size: 22px">¿En qué te {marcador("ayudamos")}?</span></div>'
    + f'<div role="group" aria-label="Temas" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center">{temas}</div>'
    + burbuja('El código del especialista no coincidía y no le abrí.', 'yo', '10:30')
    + f'<div style="display: flex; gap: 8px; align-items: flex-end">{avatar("handyx", 32)}<div style="max-width: 76%; padding: 10px 14px; border-radius: 18px 18px 18px 6px; background: {MOSAICO}; font-size: 14px; line-height: 1.4"><span style="display: block; font-size: 12px; font-weight: 800; color: {HONDO}">Equipo de Soporte</span>Hiciste bien. Ya hablamos con Julián y te reprogramamos el turno sin costo.<span style="display: block; margin-top: 2px; font-size: 11px; color: {SUAVE}; text-align: right">10:34</span></div></div>', gap=10)
    + escribir('Contanos qué pasó'))
print('mensajes ok')
