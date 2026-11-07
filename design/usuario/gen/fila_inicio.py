# Fila I · Inicio y HandIA (inicio, HandIA chat, pensando, ficha, voz escuchando y hablando, avisos).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def tarjeta_handia():
    """La tarjeta de la demo de la landing, intacta en espíritu: azul, la lamparita encendida y la flecha amarilla."""
    return (f'<a href="I-HandIA.dc.html" style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 22px; background: {AZUL}; box-shadow: 0 4px 0 {HONDO}; color: #FFFFFF; text-decoration: none">'
            f'<span aria-hidden="true" style="position: relative; width: 56px; height: 56px; flex: none; border-radius: 18px; background: rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center; overflow: hidden"><span style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: {AMARILLO}; opacity: 0.6; filter: blur(6px)"></span>{img("lamparita", 30, 46, "position: relative")}</span>'
            f'<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><span style="font-size: 12px; font-weight: 700">¿No sabés qué rubro es?</span><span style="{TIT}; font-size: 19px">Contale a HandIA</span><span style="font-size: 12px; font-weight: 700; color: {AMARILLO}">Te ayuda a armar el pedido</span></span>'
            f'<span aria-hidden="true" style="width: 40px; height: 40px; flex: none; border-radius: 50%; background: {AMARILLO}; display: flex; align-items: center; justify-content: center">{svg(IC["flecha"], TINTA, 20, 2.5)}</span></a>')


def turno_compacto():
    return tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{avatar("julian", 44)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">Julián Ortiz · Plomería</strong><span style="font-size: 13px; color: {SUAVE}">Jue 19/11 · 10 a 12 h</span></span>{chip("Confirmado", "check", "exito")}</div>',
                   franja('Ver el turno', 'S-Agendado.dc.html'))


guardar_u('I-Inicio.dc.html', 'Inicio', cabecera_u() + cont(
    f'<span style="align-self: flex-start">{chip("Calle De Prueba 123 · La Perla", "pin", "tinte")}</span>'
    + f'<h1 style="margin: 0; {TIT}; font-size: 30px; line-height: 1.04">¿Qué necesitás {marcador("hoy")}?</h1>'
    + grilla_rubros() + etiqueta('TU PRÓXIMO TURNO') + turno_compacto() + tarjeta_handia(), top=120, gap=10)
    + barra_u('Inicio'))


def composer(texto_='Contale a HandIA…'):
    return f'''  <div data-f="1" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 12px 20px; background: #FFFFFF; border-top: 1px solid {BORDE}; display: flex; align-items: center; gap: 8px">
    <button type="button" aria-label="Sumar una foto" style="width: 46px; height: 46px; flex: none; border-radius: 50%; border: 0; background: {MOSAICO}; display: flex; align-items: center; justify-content: center">{svg(IC['camara'], AZUL, 20)}</button>
    <label style="flex: 1; display: flex; align-items: center; min-height: 48px; padding: 0 6px 0 16px; border-radius: 999px; background: {GRIS2}"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Escribile a HandIA</span><input readonly placeholder="{texto_}" style="flex: 1; min-width: 0; height: 46px; border: 0; background: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: {TINTA}"><button type="button" aria-label="Dictar" style="width: 44px; height: 44px; border: 0; background: none; display: flex; align-items: center; justify-content: center">{svg(IC['micro'], AZUL, 20)}</button></label>
    <a href="I-Voz.dc.html" aria-label="Modo voz" style="width: 48px; height: 48px; flex: none; border-radius: 50%; background: {AZUL}; box-shadow: 0 3px 0 {HONDO}; display: flex; align-items: center; justify-content: center">{svg(IC['onda'], '#FFFFFF', 22)}</a>
  </div>'''


def cab_handia(sub='En tu celular · sin IA externa'):
    return barra('HandIA', 'I-Inicio.dc.html', accion_icono('menu', 'Opciones de HandIA', 'I-HandIA.dc.html'), sub=sub)


def ia(html):
    return f'<div style="display: flex; align-items: flex-end; gap: 8px">{handia_avatar(32)}<div style="max-width: 80%; padding: 10px 14px; border-radius: 18px 18px 18px 6px; background: {MOSAICO}; font-size: 14px; line-height: 1.4; color: {TINTA}">{html}</div></div>'


def opciones(*o):
    return '<div role="group" aria-label="Respuestas rápidas" style="display: flex; flex-wrap: wrap; gap: 8px; padding-left: 40px">' + ''.join(f'<button type="button" style="min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid {AZUL}; background: #FFFFFF; color: {AZUL}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>' for t in o) + '</div>'


tramos = lambda n, t: f'<div role="progressbar" aria-label="Pregunta {n} de {t}" aria-valuemin="0" aria-valuemax="{t}" aria-valuenow="{n}" style="display: flex; align-items: center; gap: 8px"><span style="flex: 1; display: flex; gap: 4px">{"".join(f"<span style=\"flex: 1; height: 5px; border-radius: 3px; background: {AZUL if i < n else MOSAICO}\"></span>" for i in range(t))}</span><span style="font-size: 12px; font-weight: 800; color: {SUAVE}">Pregunta {n} de {t}</span></div>'

guardar_u('I-HandIA.dc.html', 'HandIA', cab_handia() + cont(
    f'<div style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 2px">{estado_handia("encontro", 96)}<span style="{TIT}; font-size: 22px">¡Hola! Soy HandIA</span><span style="font-size: 14px; color: {SUAVE}; text-align: center">¿Qué arreglo podemos hacer {marcador("hoy")}?</span></div>'
    + burbuja('Pierde la canilla del baño, gotea toda la noche', 'yo', '09:41')
    + ia(f'Por lo que contás, parece un trabajo de <strong>plomería</strong>. Te hago 3 preguntas cortas y armamos el pedido.')
    + tramos(1, 3)
    + ia('¿Dónde está la canilla?<span style="display: block; margin-top: 6px; font-size: 12px; color: ' + SUAVE + '">Así el especialista sabe qué llevar.</span>')
    + opciones('En el baño', 'En la cocina', 'Afuera', 'Saltear'), top=72, gap=10)
    + composer())

guardar_u('I-HandIAPiensa.dc.html', 'HandIA pensando', cab_handia('Pensando…') + cont(
    burbuja('Saltó la térmica y no vuelve a subir. Huele a quemado en el enchufe de la cocina.', 'yo', '09:43')
    + f'<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 0">{estado_handia("pensando", 170)}{chip("Ilustración provisoria · llegan los SVG finales", "info", "gris")}</div>'
    + ia(f'<strong style="display: block; margin-bottom: 6px">Primero, lo urgente</strong>No toques el enchufe ni el tablero. Si hay olor a quemado, dejá la térmica abajo hasta que venga el especialista.')
    + f'<ol aria-label="Lo que está haciendo HandIA" style="list-style: none; margin: 0 0 0 40px; padding: 12px 14px; border-radius: 16px; background: {GRIS2}; display: flex; flex-direction: column; gap: 8px; font-size: 14px">'
    + f'<li style="display: flex; gap: 8px; align-items: center">{svg(IC["check"], "#137140", 18, 3)}Entendí el problema</li><li style="display: flex; gap: 8px; align-items: center">{svg(IC["alerta"], ROJO, 18)}Te avisé el riesgo</li><li style="display: flex; gap: 8px; align-items: center; font-weight: 800">{svg(IC["reloj"], AZUL, 18)}Eligiendo el rubro…</li><li style="display: flex; gap: 8px; align-items: center; color: {SUAVE}">{svg(IC["lista"], SUAVE, 18)}Preguntas cortas</li></ol>', top=72, gap=10)
    + composer())

ficha = ticket(
    f'{mosaico_handy("cano", 60)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px">{etiqueta("TU PEDIDO")}<span style="{TIT}; font-size: 24px">Plomería</span></span>{chip("Programado", "agenda", "tinte")}',
    '<div style="display: flex; flex-wrap: wrap; gap: 6px">' + ''.join(chip(t, None, 'tinte') for t in ['En el baño', 'Pierde o gotea', 'Llave cerrada', 'Desde ayer']) + '</div>'
    + texto('Pierde la canilla del baño, gotea toda la noche. Ya cerré la llave de paso.', 14)
    + fila_botones(btn('Corregir', None, 'editar', 'contorno', chico=True), btn('Pedir así', 'P-Fecha.dc.html', 'check', chico=True)), corte=88)

guardar_u('I-HandIAFicha.dc.html', 'HandIA: tu pedido', cab_handia('Pedido listo para revisar') + cont(
    ia('Listo, armé tu pedido. Revisalo: así lo leen los especialistas.') + ficha
    + ia('¿Le querés sumar una foto? Ayuda a que la propuesta sea más justa.')
    + opciones('Sumar foto', 'Medir con la cámara'), top=72, gap=12)
    + composer())


def voz(estado, rotulo, texto_html, extra=''):
    ondas = ''.join(f'<span style="position: absolute; inset: {i*-22}px; border-radius: 50%; border: 2px solid rgba(255,255,255,{0.5 - i*0.15})"></span>' for i in range(1, 4)) if estado == 'escucha' else ''
    luz = 0.95 if estado == 'habla' else 0.7
    return f'''  <div style="position: absolute; inset: 0; background: {AZUL}"></div>
  <div aria-hidden="true" style="position: absolute; left: 50%; top: 150px; margin-left: -230px; width: 460px; height: 460px; border-radius: 50%; background: rgba(47,107,255,0.45); filter: blur(40px)"></div>
  <header style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; align-items: center; justify-content: space-between">
    <a href="I-HandIA.dc.html" aria-label="Volver al chat" style="width: 48px; height: 48px; border-radius: 16px; background: rgba(255,255,255,0.18); box-shadow: 0 3px 0 rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>
    <span style="display: flex; flex-direction: column; align-items: center; gap: 4px; color: #FFFFFF"><h1 style="margin: 0; {TIT}; font-size: 20px">HandIA</h1><span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,0.18); font-size: 12px; font-weight: 800">{svg(IC['onda'], '#FFFFFF', 14)}Modo voz</span></span>
    <a href="X-Cuenta.dc.html" aria-label="Ajustes de voz" style="width: 48px; height: 48px; border-radius: 16px; background: rgba(255,255,255,0.18); box-shadow: 0 3px 0 rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center">{svg(IC['filtro'], '#FFFFFF', 20)}</a>
  </header>
  <div style="position: absolute; left: 50%; top: 168px; margin-left: -120px; width: 240px; height: 240px; border-radius: 50%; background: rgba(255,255,255,0.08); box-shadow: inset 0 0 0 2px rgba(255,255,255,0.16); display: flex; align-items: center; justify-content: center">
    {ondas}<span aria-hidden="true" style="position: absolute; width: 170px; height: 170px; border-radius: 50%; background: #FFCF5A; opacity: {luz}; filter: blur(22px)"></span>{img('lamparita', 100, 150, 'position: relative')}{extra}
  </div>
  <div data-c="1" style="position: absolute; top: 440px; left: 24px; right: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: #FFFFFF">
    <p role="status" style="margin: 0; font-size: 14px; font-weight: 800; color: #FFFFFF">{rotulo}</p>
    {texto_html}
  </div>
  <div data-f="1" style="position: absolute; left: 16px; right: 16px; bottom: 26px; display: flex; align-items: center; gap: 10px">
    <a href="I-HandIA.dc.html" style="flex: 1; display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 18px; border-radius: 999px; background: rgba(10,31,72,0.4); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none">{svg(IC['teclado'], '#FFFFFF', 20)}Escribir</a>
    <button type="button" aria-label="Apagar el micrófono" style="width: 56px; height: 56px; border-radius: 50%; border: 0; background: #FFFFFF; box-shadow: 0 4px 0 #C9D3E6; display: flex; align-items: center; justify-content: center">{svg(IC['micro'], AZUL, 24)}</button>
    <a href="I-HandIA.dc.html" aria-label="Terminar" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.16); box-shadow: 0 4px 0 rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center">{svg(IC['cerrar'], '#FFFFFF', 22)}</a>
  </div>'''


guardar_u('I-Voz.dc.html', 'HandIA voz: te escucha', voz('escucha', 'Te escucho', f'<p style="margin: 0; {TIT}; font-size: 26px; line-height: 1.15; color: #FFFFFF">Pierde la canilla del baño, gotea toda la…</p><p style="margin: 0; font-size: 13px; color: #FFFFFF">Tu voz se reconoce en el celular: no se graba ni se manda.</p>'))
sub = ''.join(f'<span style="box-shadow: inset 0 -0.2em 0 {AMARILLO if i < 6 else "transparent"}">{p} </span>' for i, p in enumerate('Parece un trabajo de plomería. ¿Dónde está la canilla?'.split()))
guardar_u('I-VozHabla.dc.html', 'HandIA voz: te responde', voz('habla', 'HandIA te está respondiendo', f'<p style="margin: 0; {TIT}; font-size: 26px; line-height: 1.2; color: #FFFFFF">{sub}</p><div role="group" aria-label="Respuestas rápidas" style="display: flex; gap: 8px">' + ''.join(f'<button type="button" style="min-height: 44px; padding: 0 16px; border-radius: 999px; border: 0; background: rgba(10,31,72,0.4); color: #FFFFFF; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>' for t in ['En el baño', 'En la cocina']) + '</div>'))


def aviso_fila(ic, fondo, color, titulo_, sub, cuando, href, nuevo=False):
    punto = f'<span role="img" aria-label="Sin leer" style="width: 10px; height: 10px; border-radius: 50%; background: {AZUL}"></span>' if nuevo else ''
    return (f'<a href="{href}" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}; color: {TINTA}; text-decoration: none">{mosaico_ic(ic, 44, fondo=fondo, color=color, radio=14, iconsize=20)}'
            f'<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px">{titulo_}</strong><span style="font-size: 13px; color: {SUAVE}">{sub}</span><span style="font-size: 12px; color: {SUAVE}">{cuando}</span></span>{punto}</a>')


guardar_u('I-Avisos.dc.html', 'Avisos', barra('Avisos', 'I-Inicio.dc.html', accion_icono('filtro', 'Elegir qué avisos recibir', 'X-Cuenta.dc.html')) + cont(
    etiqueta('HOY')
    + '<div style="display: flex; flex-direction: column">'
    + aviso_fila('billete', TINTE, AZUL, 'Julián Ortiz te mandó una propuesta', 'Plomería · $ 45.000 · jue 19/11', 'Hace 8 min', 'C-Detalle.dc.html', True)
    + aviso_fila('chat', MOSAICO, TINTA, 'Diego Herrera te escribió', '«¿Me mandás una foto del tablero?»', 'Hace 40 min', 'M-Chat.dc.html', True)
    + aviso_fila('alerta', '#FBFBD2', TINTA, 'Hay un repuesto para aprobar', 'Obra del baño · cartucho termostático', 'Hace 2 h', 'O-Repuesto.dc.html')
    + '</div>' + etiqueta('ESTA SEMANA') + '<div style="display: flex; flex-direction: column">'
    + aviso_fila('agenda', TINTE, AZUL, 'Mañana: turno de plomería', 'Jue 19/11 · 10 a 12 h · Julián Ortiz', 'Ayer', 'S-Agendado.dc.html')
    + aviso_fila('hogar', '#E3F4EA', '#137140', 'Recordatorio de tu casa', 'Revisá el calefón antes del invierno', 'Lun', 'H-Recordatorios.dc.html')
    + aviso_fila('medalla', AMARILLO, TINTA, 'Sumaste un paso en tu camino', '«Ficha completa»: ya cargaste tu casa', 'Dom', 'G-Camino.dc.html')
    + '</div>' + aviso('Los avisos te llevan al detalle: nunca aceptan ni pagan nada por vos.', 'info', 'gris'), top=72, gap=10))
print('inicio ok')
