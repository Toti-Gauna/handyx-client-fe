# Fila I · Inicio y HandIA (inicio, HandIA chat, pensando, ficha, voz escuchando y hablando, avisos).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def tarjeta_handia():
    """La tarjeta de la demo: azul, la lamparita encendida y la flecha amarilla."""
    return (f'<a href="I-HandIA.dc.html" style="display: flex; align-items: center; gap: 14px; padding: 14px 14px 14px 12px; border-radius: 24px; background: {AZUL}; box-shadow: 0 4px 0 {HONDO}, 0 18px 30px -18px rgba(20,62,126,0.8); color: #FFFFFF; text-decoration: none">'
            f'<span aria-hidden="true" style="position: relative; width: 64px; height: 64px; flex: none; border-radius: 20px; background: rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center; overflow: hidden"><span style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: #FFCF5A; opacity: 0.55; filter: blur(8px)"></span>{img("lamparita", 34, 52, "position: relative")}</span>'
            f'<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 700; color: #DCE7F7">¿No sabés qué rubro es?</span><span style="{TIT}; font-size: 21px; line-height: 1.05">Contale a HandIA</span><span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: {AMARILLO}">{svg(IC["chispas"], AMARILLO, 14)}Te ayuda a armar el pedido</span></span>'
            f'<span aria-hidden="true" style="width: 44px; height: 44px; flex: none; border-radius: 50%; background: {AMARILLO}; box-shadow: 0 3px 0 #C9C85A; display: flex; align-items: center; justify-content: center">{svg(IC["flecha"], TINTA, 20, 2.5)}</span></a>')


def turno_ticket():
    """Ticket troquelado de «Tu próximo turno», como la app real."""
    av = (f'<span style="position: relative; flex: none">{avatar("julian", 48)}<span aria-hidden="true" style="position: absolute; right: -3px; bottom: -3px; width: 20px; height: 20px; border-radius: 50%; background: {EXITO}; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC["check"], "#FFFFFF", 11, 3)}</span></span>')
    arriba = (f'{av}<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 16px">Julián Ortiz</strong><span style="display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: {SUAVE}">{svg(IC["canilla_ic"], SUAVE, 15)}Plomería</span></span>{chip("Confirmado", "check", "exito")}')
    abajo = (f'<a href="S-Agendado.dc.html" style="display: flex; align-items: center; gap: 10px; min-height: 44px; color: {TINTA}; text-decoration: none">{mosaico_ic("agenda", 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}'
             f'<strong style="flex: 1; font-size: 15px">Jue 19/11 · 10 a 12 h</strong><span style="display: inline-flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 800; color: {AZUL}">Ver el turno{svg(IC["flecha"], AZUL, 16)}</span></a>')
    return ticket(arriba, abajo, corte=84)


quiero = [('canilla_ic', 'Cambiar un flexible'), ('aire_ic', 'Service del aire'), ('rayo', 'Cambiar un enchufe'),
          ('llave2', 'Cambiar la cerradura'), ('gota', 'Arreglar humedad'), ('llama', 'Revisar el calefón')]
mos_quiero = ''.join(f'<a href="P-Que.dc.html" style="display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 8px 12px; border-radius: 18px; background: {MOSAICO}; box-shadow: 0 4px 0 #D3D6DC; color: {TINTA}; font-size: 13px; font-weight: 800; line-height: 1.2; text-decoration: none"><span style="width: 36px; height: 36px; flex: none; border-radius: 12px; background: #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC[ic], AZUL, 19)}</span>{t}</a>' for ic, t in quiero)

guardar_u('I-Inicio.dc.html', 'Inicio', cabecera_inicio() + cont(
    f'<h1 style="margin: 0; {TIT}; font-size: 27px; line-height: 1.04; white-space: nowrap">¿Qué necesitás {marcador("hoy")}?</h1>'
    + grilla_rubros()
    + f'<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px">{etiqueta("TU PRÓXIMO TURNO")}{turno_ticket()}</div>'
    + tarjeta_handia()
    + f'<h2 style="margin: 6px 0 0; {TIT}; font-size: 22px; color: {AZUL}">Quiero…</h2>'
    + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">{mos_quiero}</div>'
    + aviso('Son tareas, no rubros nuevos: cada una la toma un especialista del rubro que corresponde.', 'info', 'gris'), top=146, gap=12)
    + barra_u("Inicio"), alto=1200)


def composer(texto_='Contale a HandIA…', escrito=''):
    v = f' value="{escrito}"' if escrito else ''
    return f'''  <div data-f="1" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 12px 20px; background: #FFFFFF; border-top: 1px solid {BORDE}; display: flex; align-items: center; gap: 8px">
    <button type="button" aria-label="Sumar una foto al pedido" style="width: 46px; height: 46px; flex: none; border-radius: 50%; border: 0; background: {MOSAICO}; display: flex; align-items: center; justify-content: center">{svg(IC['camara'], AZUL, 20)}</button>
    <label style="flex: 1; display: flex; align-items: center; min-height: 48px; padding: 0 6px 0 16px; border-radius: 999px; background: {GRIS2}"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Escribile a HandIA</span><input readonly placeholder="{texto_}"{v} style="flex: 1; min-width: 0; height: 46px; border: 0; background: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: {TINTA}"><button type="button" aria-label="Dictar" style="width: 44px; height: 44px; border: 0; border-radius: 50%; background: none; display: flex; align-items: center; justify-content: center">{svg(IC['micro'] if 'micro' in IC else IC['onda'], SUAVE, 20)}</button></label>
    <a href="I-Voz.dc.html" aria-label="Modo voz" style="width: 48px; height: 48px; flex: none; border-radius: 50%; background: {AZUL}; box-shadow: 0 3px 0 {HONDO}; display: flex; align-items: center; justify-content: center">{svg(IC['onda'], '#FFFFFF', 22)}</a>
  </div>'''


def cab_handia(sub='En tu celular · sin IA externa'):
    return barra('HandIA', 'I-Inicio.dc.html', accion_icono('menu', 'Opciones de HandIA', 'I-HandIA.dc.html'), sub=sub)


def ia(html):
    return f'<div style="display: flex; align-items: flex-end; gap: 8px">{handia_avatar(30)}<div style="max-width: 80%; padding: 10px 14px; border-radius: 20px 20px 20px 6px; background: {MOSAICO}; font-size: 15px; line-height: 1.4; color: {TINTA}">{html}</div></div>'


def opciones(*o):
    return '<div role="group" aria-label="Respuestas rápidas" style="display: flex; flex-wrap: wrap; gap: 8px; padding-left: 38px">' + ''.join(f'<button type="button" style="min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid {AZUL}; background: #FFFFFF; color: {AZUL}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>' for t in o) + '</div>'


def tramos(n, t):
    return (f'<div role="progressbar" aria-label="Pregunta {n} de {t}" aria-valuemin="0" aria-valuemax="{t}" aria-valuenow="{n}" style="display: flex; align-items: center; gap: 8px; padding-left: 38px"><span style="flex: 1; display: flex; gap: 4px">'
            + ''.join(f'<span style="flex: 1; height: 5px; border-radius: 3px; background: {AZUL if i < n else MOSAICO}"></span>' for i in range(t)) + f'</span><span style="font-size: 12px; font-weight: 800; color: {SUAVE}">Pregunta {n} de {t}</span></div>')


def yo(t, hora):
    return burbuja(t, 'yo', hora)


# I-HandIA: chat vacío. La lamparita grande y las sugerencias solo antes de escribir.
sug = lambda ic, t: f'<button type="button" style="display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 14px; border-radius: 16px; border: 1px solid {BORDE}; background: #FFFFFF; box-shadow: {ELEV1}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 700; color: {TINTA}; text-align: left">{mosaico_ic(ic, 32, fondo=TINTE, color=AZUL, radio=10, iconsize=16)}{t}</button>'
guardar_u('I-HandIA.dc.html', 'HandIA', cab_handia() + chat_abajo(
    f'<div style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; padding-bottom: 10px">{estado_handia("encontro", 128)}'
    f'<h1 style="margin: 0; {TIT}; font-size: 27px; line-height: 1.05">¡Hola! Soy {marcador("HandIA")}</h1><span style="font-size: 15px; color: {SUAVE}">¿Qué arreglo podemos hacer hoy?</span></div>'
    + etiqueta('PROBÁ CON')
    + sug('canilla_ic', 'Pierde la canilla del baño') + sug('rayo', 'Saltó la térmica y no sube') + sug('llama', 'El calefón no prende'),
    bottom=92) + composer())

# I-HandIAChat: ya se escribió. Sin ilustración: los mensajes apoyados sobre la caja de escribir.
guardar_u('I-HandIAChat.dc.html', 'HandIA: conversación', cab_handia() + chat_abajo(
    yo('Pierde la canilla del baño, gotea toda la noche', '09:41')
    + ia('Por lo que contás, parece un trabajo de <strong>plomería</strong>. Te hago 3 preguntas cortas y armamos el pedido.')
    + tramos(1, 3)
    + ia(f'¿Dónde está la canilla?<span style="display: block; margin-top: 4px; font-size: 12px; color: {SUAVE}">Así el especialista sabe qué llevar.</span>')
    + opciones('En el baño', 'En la cocina', 'Afuera', 'Saltear'), bottom=92) + composer())

# I-HandIAPiensa: pensando, en una línea chica junto al avatar (sin la ilustración grande).
pasos_ia = (f'<ol aria-label="Lo que está haciendo HandIA" style="list-style: none; margin: 0 0 0 38px; padding: 12px 14px; border-radius: 18px; background: #FFFFFF; border: 1px solid {BORDE}; box-shadow: {ELEV1}; display: flex; flex-direction: column; gap: 8px; font-size: 14px">'
            f'<li style="display: flex; gap: 8px; align-items: center">{svg(IC["check"], EXITO, 18, 3)}Entendí el problema</li>'
            f'<li style="display: flex; gap: 8px; align-items: center">{svg(IC["alerta"], NARANJA, 18)}Te avisé el riesgo</li>'
            f'<li style="display: flex; gap: 8px; align-items: center; font-weight: 800">{svg(IC["reloj"], AZUL, 18)}Eligiendo el rubro…</li>'
            f'<li style="display: flex; gap: 8px; align-items: center; color: {SUAVE}">{svg(IC["lista"], SUAVE, 18)}Preguntas cortas</li></ol>')
pensando = (f'<div role="status" style="display: flex; align-items: center; gap: 8px">{handia_avatar(30)}<span style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 20px 20px 20px 6px; background: {TINTE}; color: {HONDO}; font-size: 14px; font-weight: 800">'
            f'<span aria-hidden="true" style="display: inline-flex; gap: 4px">{"".join(f"<span style=\"width: 7px; height: 7px; border-radius: 50%; background: {AZUL}; opacity: {o}\"></span>" for o in (1, 0.6, 0.3))}</span>Pensando</span></div>')
guardar_u('I-HandIAPiensa.dc.html', 'HandIA pensando', cab_handia('Pensando…') + chat_abajo(
    yo('Saltó la térmica y no vuelve a subir. Huele a quemado en el enchufe de la cocina.', '09:43')
    + ia(f'<strong style="display: block; margin-bottom: 4px">Primero, lo urgente</strong>No toques el enchufe ni el tablero. Si hay olor a quemado, dejá la térmica abajo hasta que venga el especialista.')
    + pasos_ia + pensando, bottom=92) + composer())

ficha = ticket(
    f'{mosaico_ic("canilla_ic", 52, fondo=TINTE, color=AZUL, radio=16, iconsize=26)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px">{etiqueta("TU PEDIDO")}<span style="{TIT}; font-size: 22px">Plomería</span></span>{chip("Programado", "agenda", "tinte")}',
    '<div style="display: flex; flex-wrap: wrap; gap: 6px">' + ''.join(chip(t, None, 'gris') for t in ['En el baño', 'Pierde o gotea', 'Llave cerrada']) + '</div>'
    + texto('Pierde la canilla del baño, gotea toda la noche. Ya cerré la llave de paso.', 14)
    + fila_botones(btn('Corregir', None, 'editar', 'contorno', chico=True), btn('Pedir así', 'P-Revisar.dc.html', 'check', chico=True)), corte=84)

guardar_u('I-HandIAFicha.dc.html', 'HandIA: tu pedido', cab_handia('Pedido listo para revisar') + chat_abajo(
    yo('En el baño. Ya cerré la llave de paso.', '09:44')
    + ia('Listo, armé tu pedido. Revisalo: así lo leen los especialistas.') + ficha
    + opciones('Sumar una foto', 'Elegir de Mi hogar'), bottom=92) + composer())


def esfera(estado):
    """Esfera de luz en los colores de Handyx (sin personaje): escucha con anillos finos, habla más encendida."""
    anillos = ''.join(f'<span style="position: absolute; inset: {-i * 20}px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,{0.32 - i * 0.08})"></span>' for i in range(1, 4)) if estado == 'escucha' else ''
    brillo = 1 if estado == 'habla' else 0.82
    return (f'<div aria-hidden="true" style="position: absolute; left: 50%; top: 178px; margin-left: -110px; width: 220px; height: 220px">{anillos}'
            f'<span style="position: absolute; inset: -30px; border-radius: 50%; background: radial-gradient(circle, rgba(255,207,90,{0.38 * brillo}) 0%, rgba(255,207,90,0) 65%)"></span>'
            f'<span style="position: absolute; inset: 0; border-radius: 50%; opacity: {brillo}; background: radial-gradient(circle at 34% 28%, #FFFFFF 0%, #DCE9FB 16%, #8DB4EC 42%, #3F7BD2 70%, {HONDO} 100%); box-shadow: inset -16px -22px 40px rgba(14,29,54,0.35), 0 30px 60px -20px rgba(8,20,48,0.6)"></span>'
            f'<span style="position: absolute; left: 22%; top: 54%; width: 58%; height: 30%; border-radius: 50%; background: radial-gradient(ellipse, rgba(245,245,154,0.55), rgba(245,245,154,0) 70%); filter: blur(6px)"></span>'
            f'<span style="position: absolute; left: 18%; top: 12%; width: 34%; height: 22%; border-radius: 50%; background: rgba(255,255,255,0.55); filter: blur(10px)"></span></div>')


def voz(estado, rotulo, texto_html, extra=''):
    ctrl = 'rgba(255,255,255,0.16)'
    return f'''  <div style="position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 30%, #2A66BC 0%, {AZUL} 48%, #173F7C 100%)"></div>
  <header style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; align-items: center; justify-content: space-between">
    <a href="I-HandIAChat.dc.html" aria-label="Volver al chat" style="width: 48px; height: 48px; border-radius: 50%; background: {ctrl}; display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>
    <span style="display: flex; flex-direction: column; align-items: center; gap: 2px; color: #FFFFFF"><h1 style="margin: 0; font-size: 17px; font-weight: 800">HandIA</h1><span style="font-size: 12px; color: #DCE7F7">Modo voz · en tu celular</span></span>
    <a href="I-VozAjustes.dc.html" aria-label="Ajustes del modo voz" style="width: 48px; height: 48px; border-radius: 50%; background: {ctrl}; display: flex; align-items: center; justify-content: center">{svg(IC['ajustes'], '#FFFFFF', 20)}</a>
  </header>
  {esfera(estado)}
  <div data-c="1" style="position: absolute; top: 456px; left: 28px; right: 28px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; color: #FFFFFF">
    <p role="status" style="margin: 0; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #DCE7F7"><span aria-hidden="true" style="width: 8px; height: 8px; border-radius: 50%; background: {AMARILLO}"></span>{rotulo}</p>
    {texto_html}
  </div>
  {extra}
  <div data-f="1" style="position: absolute; left: 16px; right: 16px; bottom: 28px; display: flex; align-items: center; gap: 10px">
    <a href="I-HandIAChat.dc.html" style="flex: 1; display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 18px; border-radius: 999px; background: {ctrl}; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none">{svg(IC['teclado'], '#FFFFFF', 20)}Escribir</a>
    <button type="button" aria-label="Silenciar el micrófono" style="width: 56px; height: 56px; border-radius: 50%; border: 0; background: {ctrl}; display: flex; align-items: center; justify-content: center">{svg(IC['micro'], '#FFFFFF', 24)}</button>
    <a href="I-HandIAChat.dc.html" aria-label="Terminar el modo voz" style="width: 56px; height: 56px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 4px 0 #C9D3E6; display: flex; align-items: center; justify-content: center">{svg(IC['cerrar'], AZUL, 22, 2.5)}</a>
  </div>'''


FRASE = 'font-size: 23px; font-weight: 600; line-height: 1.35; letter-spacing: -0.2px; color: #FFFFFF'
guardar_u('I-Voz.dc.html', 'HandIA voz: te escucha', voz('escucha', 'Te escucho',
    f'<p style="margin: 0; {FRASE}">Pierde la canilla del baño, <span style="color: rgba(255,255,255,0.6)">gotea toda la…</span></p>'
    f'<p style="margin: 0; font-size: 13px; color: #DCE7F7">Hablá tranquilo: cuando hagas una pausa, te respondo.</p>'))

pal = 'Parece un trabajo de plomería. ¿Dónde está la canilla?'.split()
sub = ' '.join(f'<span style="color: {"#FFFFFF" if k < 6 else "rgba(255,255,255,0.55)"}; {"text-decoration: underline; text-decoration-color: " + AMARILLO + "; text-decoration-thickness: 2px; text-underline-offset: 6px" if k == 5 else ""}">{p}</span>' for k, p in enumerate(pal))
resp = ''.join(f'<button type="button" style="min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.1); color: #FFFFFF; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 700">{t}</button>' for t in ['En el baño', 'En la cocina', 'Afuera'])
guardar_u('I-VozHabla.dc.html', 'HandIA voz: te responde', voz('habla', 'HandIA está hablando',
    f'<p style="margin: 0; {FRASE}">{sub}</p><div role="group" aria-label="Respuestas rápidas" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px">{resp}</div>'))

# I-VozAjustes: la hoja de ajustes del modo voz (como en tu captura), sobre la voz.
aj = lambda ic, t, s, ctl: (f'<div style="display: flex; align-items: center; gap: 12px; min-height: 56px; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 38, fondo=TINTE, color=AZUL, radio=12, iconsize=18)}'
                            f'<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span>{ctl}</div>')
sw = lambda on, label: f'<button type="button" role="switch" aria-checked="{"true" if on else "false"}" aria-label="{label}" style="width: 52px; height: 44px; border: 0; background: none; padding: 0; display: flex; align-items: center"><span style="position: relative; display: block; width: 50px; height: 30px; border-radius: 15px; background: {AZUL if on else "#C7CDD8"}"><span style="position: absolute; top: 3px; {"right: 3px" if on else "left: 3px"}; width: 24px; height: 24px; border-radius: 50%; background: #FFFFFF"></span></span></button>'
guardar_u('I-VozAjustes.dc.html', 'HandIA voz: ajustes', voz('habla', 'HandIA está hablando', f'<p style="margin: 0; {FRASE}">¿Desde cuándo pasa?</p>').replace('data-f="1"', 'data-x="1"').replace('data-c="1"', 'data-x="1"')
    + '  <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(8,20,48,0.45)"></div>\n'
    + hoja_u(aj('onda', 'Voz', 'La del sistema, en español', f'<a href="I-VozAjustes.dc.html" style="min-height: 44px; display: flex; align-items: center; font-size: 13px; font-weight: 800; color: {AZUL}; text-decoration: none">Cambiar</a>').replace(f'border-top: 1px solid {BORDE}; ', '', 1)
             + aj('texto', 'Subtítulos', 'Lo que dice HandIA, escrito', sw(True, 'Subtítulos'))
             + aj('campana', 'Sonido al empezar y terminar', 'Un tono corto, sin vibrar', sw(False, 'Sonido al empezar y terminar'))
             + aj('candado', 'Tu voz se reconoce en el celular', 'No se graba ni se manda a ningún lado', '')
             + btn('Listo', 'I-VozHabla.dc.html'), top=436, titulo_hoja='Modo voz'))


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
