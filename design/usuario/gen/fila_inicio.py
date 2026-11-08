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


def esfera(estado, cx=195, cy=300, r=104):
    """Esfera de HandIA en SVG: capas de luz difuminadas dentro de un círculo, brillo arriba y halo afuera.
    Escuchando: anillo de barras de audio. Hablando: más encendida, con un aro amarillo suave."""
    k = estado
    ondas = ''
    if k == 'escucha':
        import math
        n = 64
        alturas = [10 + 14 * abs(math.sin(i * 0.55)) * (0.55 + 0.45 * abs(math.cos(i * 0.21))) for i in range(n)]
        for i, h in enumerate(alturas):
            a = 2 * math.pi * i / n
            r1 = r + 22
            x1, y1 = cx + r1 * math.cos(a), cy + r1 * math.sin(a)
            x2, y2 = cx + (r1 + h) * math.cos(a), cy + (r1 + h) * math.sin(a)
            ondas += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="rgba(255,255,255,{0.35 + 0.4 * (h - 10) / 14:.2f})" stroke-width="3" stroke-linecap="round"></line>'
    aro = (f'<circle cx="{cx}" cy="{cy}" r="{r + 16}" fill="none" stroke="url(#hxAro)" stroke-width="2"></circle>' if k == 'habla' else '')
    brillo = 1 if k == 'habla' else 0.88
    return f'''  <svg aria-hidden="true" width="390" height="560" viewBox="0 0 390 560" style="position: absolute; left: 0; top: 0">
    <defs>
      <radialGradient id="hxHalo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#7FB0F0" stop-opacity="{0.55 * brillo:.2f}"></stop><stop offset="60%" stop-color="#3A78D0" stop-opacity="0.18"></stop><stop offset="100%" stop-color="#1F57A8" stop-opacity="0"></stop></radialGradient>
      <radialGradient id="hxBase" cx="42%" cy="34%" r="75%"><stop offset="0%" stop-color="#EAF2FF"></stop><stop offset="30%" stop-color="#9CC2F4"></stop><stop offset="62%" stop-color="#3D7BD3"></stop><stop offset="100%" stop-color="#143E7E"></stop></radialGradient>
      <linearGradient id="hxAro" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F5F59A" stop-opacity="0.9"></stop><stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.2"></stop><stop offset="100%" stop-color="#F5F59A" stop-opacity="0.7"></stop></linearGradient>
      <filter id="hxBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"></feGaussianBlur></filter>
      <filter id="hxBlur2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6"></feGaussianBlur></filter>
      <clipPath id="hxClip"><circle cx="{cx}" cy="{cy}" r="{r}"></circle></clipPath>
    </defs>
    <circle cx="{cx}" cy="{cy}" r="{r + 90}" fill="url(#hxHalo)"></circle>
    {ondas}{aro}
    <g clip-path="url(#hxClip)">
      <circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#hxBase)"></circle>
      <g filter="url(#hxBlur)" opacity="{brillo}">
        <ellipse cx="{cx - 30}" cy="{cy + 34}" rx="{r * 0.75:.0f}" ry="{r * 0.34:.0f}" fill="#5B9BEA" transform="rotate(-18 {cx} {cy})"></ellipse>
        <ellipse cx="{cx + 36}" cy="{cy + 46}" rx="{r * 0.55:.0f}" ry="{r * 0.26:.0f}" fill="#9ED8FF" opacity="{0.85 if k == 'habla' else 0.65}" transform="rotate(14 {cx} {cy})"></ellipse>
        <ellipse cx="{cx + 44}" cy="{cy + 20}" rx="{r * 0.28:.0f}" ry="{r * 0.1:.0f}" fill="#FFF3CC" opacity="{0.8 if k == 'habla' else 0.45}" transform="rotate(20 {cx} {cy})"></ellipse>
        <ellipse cx="{cx + 10}" cy="{cy - 8}" rx="{r * 0.6:.0f}" ry="{r * 0.22:.0f}" fill="#FFFFFF" opacity="0.55" transform="rotate(-8 {cx} {cy})"></ellipse>
        <ellipse cx="{cx - 20}" cy="{cy + 78}" rx="{r * 0.7:.0f}" ry="{r * 0.3:.0f}" fill="#163F80"></ellipse>
      </g>
      <ellipse cx="{cx - 30}" cy="{cy - 52}" rx="{r * 0.42:.0f}" ry="{r * 0.2:.0f}" fill="#FFFFFF" opacity="0.7" filter="url(#hxBlur2)"></ellipse>
    </g>
    <circle cx="{cx}" cy="{cy}" r="{r - 0.5}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"></circle>
  </svg>'''


def voz(estado, rotulo, texto_html, extra=''):
    glass = 'background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px)'
    dot = AMARILLO if estado == 'habla' else '#7FE0A8'
    return f'''  <div style="position: absolute; inset: 0; background: linear-gradient(180deg, #0F2C5C 0%, #17468E 45%, #0C2550 100%)"></div>
  <div aria-hidden="true" style="position: absolute; inset: 0; background: radial-gradient(60% 40% at 50% 34%, rgba(63,123,211,0.35), rgba(15,44,92,0) 70%)"></div>
{esfera(estado)}
  <header style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; align-items: center; justify-content: space-between">
    <a href="I-HandIAChat.dc.html" aria-label="Volver al chat" style="width: 46px; height: 46px; border-radius: 50%; {glass}; display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 20)}</a>
    <span role="status" style="display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 14px; border-radius: 18px; {glass}; color: #FFFFFF; font-size: 13px; font-weight: 700; letter-spacing: 0.2px"><span aria-hidden="true" style="width: 8px; height: 8px; border-radius: 50%; background: {dot}; box-shadow: 0 0 0 4px rgba(255,255,255,0.08)"></span>{rotulo}</span>
    <a href="I-VozAjustes.dc.html" aria-label="Ajustes del modo voz" style="width: 46px; height: 46px; border-radius: 50%; {glass}; display: flex; align-items: center; justify-content: center">{svg(IC['ajustes'], '#FFFFFF', 20)}</a>
  </header>
  <div data-c="1" style="position: absolute; top: 478px; left: 28px; right: 28px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; color: #FFFFFF">
    {texto_html}
  </div>
  {extra}
  <div data-f="1" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 0 28px 30px; display: flex; flex-direction: column; align-items: center; gap: 14px">
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #C9D8EF">{svg(IC['candado'], '#C9D8EF', 13)}Se reconoce en tu celular · no se graba</span>
    <div style="width: 100%; display: flex; align-items: center; justify-content: space-between">
      <a href="I-HandIAChat.dc.html" aria-label="Escribir en el chat" style="width: 58px; height: 58px; border-radius: 50%; {glass}; display: flex; align-items: center; justify-content: center">{svg(IC['teclado'], '#FFFFFF', 22)}</a>
      <button type="button" aria-label="Silenciar el micrófono" style="width: 80px; height: 80px; border-radius: 50%; border: 0; background: #FFFFFF; box-shadow: 0 10px 30px -8px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center">{svg(IC['micro'], AZUL, 30)}</button>
      <a href="I-HandIAChat.dc.html" aria-label="Terminar el modo voz" style="width: 58px; height: 58px; border-radius: 50%; background: rgba(232,77,61,0.9); display: flex; align-items: center; justify-content: center">{svg(IC['cerrar'], '#FFFFFF', 22, 2.5)}</a>
    </div>
  </div>'''


FRASE = 'font-size: 24px; font-weight: 500; line-height: 1.38; letter-spacing: -0.3px; color: #FFFFFF'
guardar_u('I-Voz.dc.html', 'HandIA voz: te escucha', voz('escucha', 'Escuchando',
    f'<p style="margin: 0; {FRASE}">Pierde la canilla del baño, <span style="color: rgba(255,255,255,0.6)">gotea toda la…</span></p>'
    f'<p style="margin: 0; font-size: 14px; color: #C9D8EF">Hacé una pausa y te respondo.</p>'))

pal = 'Parece un trabajo de plomería. ¿Dónde está la canilla?'.split()
sub = ' '.join(f'<span style="color: {"#FFFFFF" if k < 6 else "rgba(255,255,255,0.55)"}; {"text-decoration: underline; text-decoration-color: " + AMARILLO + "; text-decoration-thickness: 2px; text-underline-offset: 6px" if k == 5 else ""}">{p}</span>' for k, p in enumerate(pal))
resp = ''.join(f'<button type="button" style="min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); background: rgba(255,255,255,0.12); display: inline-flex; align-items: center; justify-content: center; color: #FFFFFF; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 700">{t}</button>' for t in ['En el baño', 'En la cocina', 'Afuera'])
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
