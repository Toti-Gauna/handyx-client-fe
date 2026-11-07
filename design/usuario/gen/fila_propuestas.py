# Fila C · Recibir y comparar propuestas (buscando, propuestas, comparar, detalle, certificados, cambios, aceptar, aceptada).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403

ORIENTATIVO = f'<section style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 16px; background: {MOSAICO}">{svg(IC["grafico"], TINTA, 20)}<span style="flex: 1; font-size: 13px; line-height: 1.35">Orientativo de Handyx: <strong>$ 38.000 a $ 52.000</strong>. Sugiere, no impone.</span></section>'


def resenas(n, trabajos):
    return f'<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: {TEXTO}">{svg(IC["estrella"], NARANJA, 15)}<strong>{n}</strong> · {trabajos} trabajos</span>'


def propuesta(k, precio, fecha, extras, verifs, nres, ntr, href='C-Detalle.dc.html', nueva=False):
    ch = ''.join(verificado(v) for v in verifs)
    nv = chip('Nueva', None, 'amarillo') if nueva else ''
    return tarjeta(
        f'<div style="display: flex; align-items: center; gap: 12px">{avatar(k, 48)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 16px">{nombre(k)}</strong>{resenas(nres, ntr)}</span>{nv}</div>'
        f'<div style="display: flex; flex-wrap: wrap; gap: 6px">{ch}</div>'
        f'<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 10px"><span style="display: flex; flex-direction: column; gap: 4px">{monto(precio, 30)}<span style="font-size: 13px; color: {SUAVE}">{extras}</span></span>{chip(fecha, "agenda", "tinte")}</div>',
        franja('Ver la propuesta', href))


# C-Buscando
guardar_u('C-Buscando.dc.html', 'Tu pedido', mapa(top=0, alto=520, zona=(196, 260, 92)) + barra('Tu pedido', 'I-Inicio.dc.html', sub='Plomería · jue 19/11')
          + hoja(f'''<div data-c="1" style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; align-items: center; gap: 12px">{mosaico_handy("cano", 56)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 17px">Canilla que gotea</strong><span style="font-size: 13px; color: {SUAVE}">Publicado hoy 09:52 · La Perla</span></span>{chip("Con propuestas", "check", "exito")}</div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: {TINTE}">{avatares(["julian", "diego", "sofia"], 34)}<span style="flex: 1; font-size: 14px; color: {HONDO}"><strong>3 propuestas</strong> llegaron. Podés esperar más o elegir ahora.</span></div>
    {aviso("Tu dirección exacta todavía no se compartió con nadie.", "candado", "gris")}
    {btn("Ver las propuestas", "C-Propuestas.dc.html")}
    {btn("Editar o cancelar el pedido", "C-Buscando.dc.html", var="contorno")}</div>''', top=440))

# C-Propuestas
guardar_u('C-Propuestas.dc.html', 'Propuestas', barra('Propuestas', 'C-Buscando.dc.html', accion_icono('columnas', 'Comparar lado a lado', 'C-Comparar.dc.html'), sub='Plomería · 3 propuestas') + cont(
    ORIENTATIVO + aviso('En el orden en que llegaron. Handyx no las ordena ni recomienda a nadie.', 'info', 'gris')
    + propuesta('julian', '$ 45.000', 'Jue 19 · 10 a 12 h', 'Incluye materiales · garantía 90 días', ['Identidad verificada', 'Antecedentes verificados'], '4,9', 23)
    + propuesta('diego', '$ 41.000', 'Vie 20 · 14 a 16 h', 'Sin materiales · garantía 60 días', ['Identidad verificada'], '4,7', 11, nueva=True), gap=10)
    + fijo(btn('Comparar las 3 lado a lado', 'C-Comparar.dc.html', 'columnas', 'contorno')))

# C-Comparar
cols = [('julian', '$ 45.000', 'Jue 19\n10 a 12 h', 'Incluidos', '90 días', '2', '4,9 · 23'),
        ('diego', '$ 41.000', 'Vie 20\n14 a 16 h', 'Aparte', '60 días', '1', '4,7 · 11'),
        ('sofia', '$ 49.500', 'Jue 19\n16 a 18 h', 'Incluidos', '120 días', '2', '5,0 · 6')]
filas = [('Precio', 1), ('Fecha', 2), ('Materiales', 3), ('Garantía', 4), ('Verificaciones', 5), ('Reseñas', 6)]
cab = '<th scope="col" style="width: 84px"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Dato</span></th>' + ''.join(f'<th scope="col" style="padding: 6px 4px; vertical-align: bottom"><span style="display: flex; flex-direction: column; align-items: center; gap: 4px">{avatar(c[0], 40)}<span style="font-size: 12px; font-weight: 800">{nombre(c[0]).split()[0]}</span></span></th>' for c in cols)
cuerpo_t = ''.join('<tr>' + f'<th scope="row" style="padding: 12px 6px 12px 0; text-align: left; font-size: 12px; font-weight: 800; color: {SUAVE}; border-top: 1px solid {BORDE}">{t}</th>' + ''.join(f'<td style="padding: 12px 4px; text-align: center; border-top: 1px solid {BORDE}; font-size: {15 if i == 1 else 13}px; font-weight: {900 if i == 1 else 700}; white-space: pre-line; {TIT if i == 1 else ""}">{c[i]}</td>' for c in cols) + '</tr>' for t, i in filas)
botones = '<tr><td></td>' + ''.join(f'<td style="padding: 12px 3px 0"><a href="C-Detalle.dc.html" style="display: flex; align-items: center; justify-content: center; min-height: 44px; border-radius: 12px; background: {TINTE}; color: {HONDO}; font-size: 13px; font-weight: 800; text-decoration: none">Ver</a></td>' for _ in cols) + '</tr>'
guardar_u('C-Comparar.dc.html', 'Comparar propuestas', barra('Comparar', 'C-Propuestas.dc.html', sub='Plomería · 3 propuestas') + cont(
    ORIENTATIVO + f'<table style="width: 100%; border-collapse: collapse; table-layout: fixed"><caption style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Propuestas lado a lado</caption><thead><tr>{cab}</tr></thead><tbody>{cuerpo_t}{botones}</tbody></table>'
    + aviso('Las mismas columnas para todos y sin destacar a nadie: el precio no es lo único que importa.', 'info', 'gris'), gap=12))

# C-Detalle
incluye = ''.join(f'<li style="display: flex; gap: 8px; align-items: flex-start; font-size: 14px">{svg(IC["check"], "#137140", 18, 3)}<span>{t}</span></li>' for t in ['Cambio del cuerito y del vástago', 'Cartucho si hace falta (incluido)', 'Prueba de pérdidas al terminar', 'Garantía de 90 días'])
guardar_u('C-Detalle.dc.html', 'Propuesta de Julián', barra('Propuesta', 'C-Propuestas.dc.html', accion_icono('chat', 'Escribirle a Julián', 'M-Chat.dc.html')) + cont(
    f'<div style="display: flex; align-items: center; gap: 14px">{avatar("julian", 64)}<span style="display: flex; flex-direction: column; gap: 5px"><span style="{TIT}; font-size: 22px">Julián Ortiz</span>{resenas("4,9", 23)}<span style="display: flex; flex-wrap: wrap; gap: 6px">{verificado()}{verificado("Antecedentes verificados")}</span></span></div>'
    + f'<section style="padding: 16px; border-radius: 22px; background: {MOSAICO}; display: flex; flex-direction: column; gap: 6px">{etiqueta("PRECIO DE JULIÁN")}{monto("$ 45.000", 40)}<span style="align-self: flex-start">{chip("Dentro del orientativo de Handyx", "check", "exito")}</span>'
    + f'<span style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700">{svg(IC["agenda"], AZUL, 18)}Jue 19/11 · 10 a 12 h · tu horario</span></section>'
    + tarjeta(f'{etiqueta("QUÉ INCLUYE")}<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px">{incluye}</ul>', franja('Ver certificados y reseñas', 'C-Certificados.dc.html')), gap=12)
    + fijo(btn('Aceptar esta propuesta', 'C-Aceptar.dc.html', 'check', 'verde'), fila_botones(btn('Pedir cambios', 'C-Cambios.dc.html', var='contorno', chico=True), btn('Otro horario', 'C-Cambios.dc.html', var='contorno', chico=True))))

# C-Certificados
cert = lambda ic, t, sub, estado: f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 44, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{sub}</span></span>{estado}</div>'
res = lambda k, t, txt: f'<div style="padding: 12px 14px; border-radius: 16px; background: {GRIS2}; display: flex; flex-direction: column; gap: 6px"><span style="display: flex; align-items: center; gap: 8px">{avatar(k, 28)}<strong style="font-size: 13px">{t}</strong><span style="margin-left: auto; display: inline-flex; gap: 2px">{"".join(svg(IC["estrella"], NARANJA, 13) for _ in range(5))}</span></span><span style="font-size: 13px; line-height: 1.4">{txt}</span></div>'
guardar_u('C-Certificados.dc.html', 'Certificados de Julián', barra('Julián Ortiz', 'C-Detalle.dc.html', sub='Verificaciones y reseñas') + cont(
    etiqueta('VERIFICADO POR OPERATIONS DE HANDYX')
    + '<div style="display: flex; flex-direction: column">'
    + cert('cara', 'Identidad', 'DNI y selfie · 02/11/2026', verificado('Verificada'))
    + cert('escudo', 'Antecedentes', 'Revisados en persona · 02/11/2026', verificado('Verificados'))
    + cert('documento', 'Curso de instalaciones sanitarias', 'Lo cargó Julián · todavía no revisado', chip('Cargado', 'info', 'gris'))
    + '</div>' + aviso('«Cargado» no es «verificado»: solo mostramos como verificado lo que revisó Operations.', 'info', 'gris')
    + etiqueta('RESEÑAS · 4,9 DE 23 TRABAJOS')
    + res('carla', 'Carla I. · Plomería', 'Llegó en el horario, explicó todo y dejó limpio.')
    + res('pablo', 'Pablo V. · Gas', 'Cambió el flexible del calefón y probó todo antes de irse.'), gap=10))

# C-Cambios
guardar_u('C-Cambios.dc.html', 'Pedir cambios', barra('Pedir un cambio', 'C-Detalle.dc.html', sub='A Julián Ortiz') + cont(
    titulo('¿Qué querés ', 'cambiar', '?', size=28, sub='Julián recibe tu pedido y te manda una propuesta nueva. Nada cambia hasta que la aceptes.')
    + '<div role="radiogroup" aria-label="Qué cambiar" style="display: flex; flex-direction: column; gap: 8px">'
    + ''.join(f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 10px 14px; border-radius: 16px; background: #FFFFFF; border: {"2px solid " + AZUL if on else "1px solid " + BORDE}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; text-align: left; font-family: \'DM Sans\', sans-serif; color: {TINTA}">{mosaico_ic(ic, 40, radio=12, iconsize=20)}<strong style="flex: 1; font-size: 15px">{t}</strong></button>' for ic, t, on in [('agenda', 'Otro día u horario', True), ('caja', 'Que incluya los materiales', False), ('billete', 'Otro precio', False)])
    + '</div>' + etiqueta('PROPONÉ DÍA Y FRANJA')
    + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">' + ''.join(f'<button type="button" style="min-height: 48px; border-radius: 14px; border: {"0" if on else "1.5px solid " + BORDE}; background: {AZUL if on else "#FFFFFF"}; color: {"#FFFFFF" if on else TINTA}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>' for t, on in [('Vie 20 · 8 a 10 h', True), ('Sáb 21 · 10 a 12 h', False)]) + '</div>'
    + campo('Mensaje (opcional)', 'Ese día trabajo, ¿podés el viernes temprano?'), gap=12)
    + fijo(btn('Mandar a Julián', 'M-Chat.dc.html', 'enviar')))

# C-Aceptar (hoja de confirmación sobre el detalle)
guardar_u('C-Aceptar.dc.html', 'Confirmar la propuesta', barra('Propuesta', 'C-Detalle.dc.html') + f'''  <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(14,29,54,0.45)"></div>
''' + hoja(f'''<div data-c="1" style="display: flex; flex-direction: column; gap: 12px">
    {titulo("¿Aceptás la propuesta de ", "Julián", "?", size=24)}
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: {MOSAICO}">{avatar("julian", 44)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">Plomería · canilla</strong><span style="font-size: 13px; color: {SUAVE}">Jue 19/11 · 10 a 12 h</span></span>{monto("$ 45.000", 22)}</div>
    {aviso("Al aceptar, Julián ve tu dirección exacta y tu teléfono para el turno. Las otras propuestas se cierran.", "candado")}
    {aviso("Pagás directo a Julián al terminar: Mercado Pago o efectivo. Handyx no recibe ni reparte la plata. Tarifa de servicio: 0 % hasta el 10/12.", "billete", "gris")}
    {btn("Aceptar y compartir mi dirección", "C-Aceptada.dc.html", "check", "verde")}
    {btn("Volver", "C-Detalle.dc.html", var="contorno")}</div>''', top=300))

# C-Aceptada
confeti = ''.join(f'<span aria-hidden="true" style="position: absolute; left: {x}px; top: {y}px; width: 10px; height: 10px; border-radius: 3px; background: {c}; rotate: {r}deg"></span>' for x, y, c, r in [(40, 60, AMARILLO, 20), (90, 120, '#FFFFFF', 45), (300, 70, AMARILLO, 10), (340, 150, '#FFFFFF', 30), (60, 220, '#FFFFFF', 60), (320, 230, AMARILLO, 75), (200, 40, AMARILLO, 15)])
guardar_u('C-Aceptada.dc.html', 'Turno confirmado', f'''  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 290px; background: {AZUL}; border-radius: 0 0 36px 36px; display: flex; align-items: center; justify-content: center">{confeti}<span style="width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center">{img("cano", 100, 110)}</span></div>
''' + cont(titulo('¡Turno ', 'confirmado', '!', size=34, sub='Le avisamos a Julián. Te escribe para coordinar los detalles.')
           + ticket(f'{avatar("julian", 52)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 16px">Julián Ortiz · Plomería</strong><span style="font-size: 13px; color: {SUAVE}">Calle De Prueba 123 · La Perla</span></span>',
                    f'<div style="display: flex; justify-content: space-between; align-items: center"><span style="display: flex; flex-direction: column; gap: 2px">{etiqueta("CUÁNDO")}<strong style="font-size: 16px">Jue 19/11 · 10 a 12 h</strong></span>{monto("$ 45.000", 24)}</div>', corte=84), top=310, gap=14)
    + fijo(btn('Ver el turno', 'S-Agendado.dc.html'), btn('Escribirle a Julián', 'M-Chat.dc.html', 'chat', 'contorno')))
print('propuestas ok')
