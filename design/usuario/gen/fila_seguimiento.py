# Fila S · Seguimiento y cierre (agendado, en camino, llegó, trabajando, adicional, antes y después, lado a lado,
# informe con garantía, conformidad, pagar, pago informado, reseña).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def etapas(hechas, actual, items):
    out = []
    n = len(items)
    for k, (t, sub) in enumerate(items):
        if k < hechas:
            m = f'<span aria-hidden="true" style="position: relative; z-index: 1; width: 28px; height: 28px; flex: none; border-radius: 50%; background: {AZUL}; display: flex; align-items: center; justify-content: center">{svg(IC["check"], "#FFFFFF", 15, 3)}</span>'
            est = ''
        elif k == actual:
            m = f'<span aria-hidden="true" style="position: relative; z-index: 1; width: 28px; height: 28px; flex: none; box-sizing: border-box; border-radius: 50%; background: #FFFFFF; border: 3px solid {AMARILLO}; box-shadow: 0 0 0 3px #FBFBD2; display: flex; align-items: center; justify-content: center"><span style="width: 10px; height: 10px; border-radius: 50%; background: {AZUL}"></span></span>'
            est = 'font-weight: 800'
        else:
            m = f'<span aria-hidden="true" style="position: relative; z-index: 1; width: 28px; height: 28px; flex: none; border-radius: 50%; border: 2px solid #C7CDD8; background: #FFFFFF; box-sizing: border-box"></span>'
            est = f'color: {SUAVE}'
        linea = f'<span aria-hidden="true" style="position: absolute; left: 13px; top: 28px; bottom: -14px; width: 2px; background: {AZUL if k < hechas else BORDE}"></span>' if k < n - 1 else ''
        out.append(f'<li style="position: relative; display: flex; gap: 12px; align-items: center">{linea}{m}<span style="display: flex; flex-direction: column; {est}"><span style="font-size: 15px">{t}</span><span style="font-size: 12px; color: {SUAVE}; font-weight: 400">{sub}</span></span></li>')
    return f'<ol aria-label="Etapas del trabajo" style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px">{"".join(out)}</ol>'


ETAPAS = [('Turno confirmado', 'Lun 16/11'), ('En camino', 'Jue 19/11'), ('Llegó', ''), ('Trabajando', ''), ('Terminado y pago', '')]

# S-Agendado
guardar_u('S-Agendado.dc.html', 'Turno agendado', barra('Tu turno', 'X-Actividad.dc.html', accion_icono('chat', 'Escribirle a Julián', 'M-Chat.dc.html'), sub='Plomería · canilla') + cont(
    ticket(f'{avatar("julian", 52)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 16px">Julián Ortiz</strong><span style="display: flex; gap: 6px">{verificado()}</span></span>',
           f'<div style="display: flex; justify-content: space-between; align-items: center"><span style="display: flex; flex-direction: column; gap: 2px">{etiqueta("JUEVES 19/11")}<strong style="{TIT}; font-size: 24px">10 a 12 h</strong></span>{monto("$ 45.000", 22)}</div>'
           + f'<span style="display: flex; gap: 8px; align-items: center; font-size: 13px; color: {TEXTO}">{svg(IC["pin"], AZUL, 16)}Calle De Prueba 123 · La Perla</span>', corte=90)
    + tarjeta(etapas(1, 1, ETAPAS))
    + aviso('El día del turno te avisamos cuando Julián salga para tu casa. Vas a poder verlo en el mapa solo mientras viene.', 'campana'), gap=12)
    + fijo(fila_botones(btn('Cambiar el turno', 'C-Cambios.dc.html', var='contorno', chico=True), btn('Cancelar', 'X-Actividad.dc.html', var='rojo', chico=True))))

# S-EnCamino
guardar_u('S-EnCamino.dc.html', 'En camino', mapa(top=0, alto=500, punto=(250, 300), ruta=[(80, 120), (80, 230), (180, 230), (180, 300), (250, 300)],
          extra=f'<div style="position: absolute; left: 66px; top: 106px; width: 28px; height: 28px; border-radius: 50%; background: {AMARILLO}; border: 3px solid #FFFFFF; box-shadow: {ELEV1}"></div>')
          + barra('Julián viene', 'S-Agendado.dc.html', sub='En vivo mientras viaja')
          + hoja(f'''<div data-c="1" style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; align-items: center; gap: 12px">{avatar("julian", 52)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 17px">Julián está en camino</strong><span style="font-size: 13px; color: {SUAVE}">A 1,8 km · sale de Constitución</span></span>{chip("En vivo", "ubicacion", "azul")}</div>
    <div style="display: flex; align-items: baseline; gap: 10px; padding: 12px 14px; border-radius: 18px; background: {MOSAICO}"><span style="font-size: 13px; font-weight: 800; color: {SUAVE}">LLEGADA ESTIMADA</span>{monto("10:24", 30)}<span style="font-size: 12px; color: {SUAVE}">la calcula el servidor</span></div>
    {aviso("Ves a Julián solo mientras viene y comparte su ubicación. Cuando llega, el mapa se apaga.", "candado", "gris")}
    {fila_botones(btn("Escribirle", "M-Chat.dc.html", "chat", "contorno", chico=True), btn("Llamar", None, "telefono", "contorno", chico=True))}</div>''', top=440))

# S-Llego
guardar_u('S-Llego.dc.html', 'Llegó el especialista', barra('Llegó Julián', 'S-EnCamino.dc.html', sub='10:22') + cont(
    f'<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 8px 0">{avatar("julian", 96)}<span style="{TIT}; font-size: 24px">Julián llegó</span>{verificado()}</div>'
    + tarjeta(f'{etiqueta("PARA QUE SEPAS QUE ES ÉL")}<span style="font-size: 14px">Pedile que te diga este código antes de abrir:</span><span style="display: flex; gap: 8px">{"".join(f"<span style=\"flex: 1; height: 58px; border-radius: 14px; background: {MOSAICO}; display: flex; align-items: center; justify-content: center; {TIT}; font-size: 28px\">{d}</span>" for d in "4827")}</span>')
    + aviso('Si el código no coincide, no abras y escribile a Soporte de Handyx.', 'escudo', 'amarillo'), gap=12)
    + fijo(btn('Es Julián, ya entró', 'S-Trabajando.dc.html', 'check'), btn('Avisar a Soporte', 'M-Soporte.dc.html', var='contorno')))

# S-Trabajando (como el «Trabajo» del especialista: título del trabajo, etapas, aviso amarillo y avance)
tile = lambda ic, t, href: f'<a href="{href}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 72px; border-radius: 18px; background: {MOSAICO}; box-shadow: 0 4px 0 #D3D6DC; color: {TINTA}; font-size: 13px; font-weight: 800; text-decoration: none">{svg(IC[ic], TINTA, 22)}{t}</a>'
guardar_u('S-Trabajando.dc.html', 'Trabajando', barra('Trabajo', 'X-Actividad.dc.html', sub='Hoy · desde 10:25') + cont(
    f'<div style="display: flex; align-items: center; gap: 14px">{mosaico_ic("canilla_ic", 64, fondo=TINTE, color=AZUL, radio=20, iconsize=30)}<span style="display: flex; flex-direction: column; gap: 4px">{chip("Trabajando", "herramienta", "azul")}<span style="{TIT}; font-size: 24px; line-height: 1.02">Canilla del baño</span><span style="font-size: 13px; color: {SUAVE}">Julián Ortiz · Plomería</span></span></div>'
    + tarjeta(etapas(3, 3, ETAPAS))
    + f'<a href="S-Adicional.dc.html" style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 22px; background: {AMARILLO}; box-shadow: 0 4px 0 #C9C85A; color: {TINTA}; text-decoration: none">{mosaico_ic("alerta", 44, fondo="#FFFFFF", color=TINTA, radio=14, iconsize=20)}'
      f'<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">Julián pide un adicional</strong><span style="font-size: 13px">Cartucho nuevo · $ 9.500 · para aprobar</span></span>{svg(IC["flecha"], TINTA, 20)}</a>'
    + tarjeta(f'{etiqueta("AVANCE DE JULIÁN · 10:41")}<div style="display: flex; gap: 12px; align-items: flex-start">{foto("canilla", 104, 96, 16, "Foto del avance: canilla desarmada")}<span style="font-size: 14px; line-height: 1.45">«Desarmé la canilla. El cuerito estaba gastado y el cartucho tiene una fisura.»</span></div>')
    + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{tile("chat", "Mensaje", "M-Chat.dc.html")}{tile("telefono", "Llamar", "S-Trabajando.dc.html")}{tile("documento", "Acuerdo", "C-Detalle.dc.html")}</div>', gap=12), alto=900)

# S-Adicional (foto, motivo y cómo cambia el total; sin bloques verdes)
guardar_u('S-Adicional.dc.html', 'Aprobar un adicional', barra('Adicional', 'S-Trabajando.dc.html', sub='Pedido por Julián Ortiz') + cont(
    titulo('¿Aprobás el ', 'adicional', '?', size=28, sub='Nada se suma al acuerdo hasta que lo apruebes.')
    + f'<section style="border-radius: 24px; overflow: hidden; border: 1px solid {BORDE}; box-shadow: 0 18px 34px -24px rgba(14,29,54,0.45)">{foto("canilla", 358, 150, 0, "Foto del cartucho fisurado")}'
      f'<div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 10px"><div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("caja", 44, fondo=TINTE, color=AZUL, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 16px">Cartucho termostático</strong><span style="font-size: 13px; color: {SUAVE}">Repuesto + 20 min de mano de obra</span></span>{monto("+ $ 9.500", 20)}</div>'
      f'<blockquote style="margin: 0; padding: 10px 12px; border-radius: 14px; background: {GRIS2}; font-size: 14px; line-height: 1.4">«El de ahora tiene una fisura: si solo cambio el cuerito, en unos meses vuelve a gotear.»</blockquote></div></section>'
    + tarjeta_noche(f'<div style="display: flex; justify-content: space-between; font-size: 14px; color: #C9D3E6"><span>Acuerdo actual</span><span>$ 45.000</span></div><div style="display: flex; justify-content: space-between; font-size: 14px; color: #C9D3E6"><span>Adicional</span><span>+ $ 9.500</span></div>'
                    f'<div style="height: 1px; background: rgba(255,255,255,0.18)"></div><div style="display: flex; justify-content: space-between; align-items: baseline"><strong style="font-size: 15px">Total si aprobás</strong>{monto("$ 54.500", 28, "#FFFFFF")}</div>'), gap=12)
    + fijo(btn('Aprobar $ 9.500', 'S-Trabajando.dc.html', 'check'), fila_botones(btn('Preguntar', 'M-Chat.dc.html', 'chat', 'contorno', chico=True), btn('No, gracias', 'S-Trabajando.dc.html', 'cerrar', 'rojo', chico=True))), alto=900)

# S-AntesDespues (deslizar)
guardar_u('S-AntesDespues.dc.html', 'Antes y después', barra('Antes y después', 'S-Informe.dc.html', sub='Canilla del baño') + cont(
    seg([('Deslizar', 'S-AntesDespues.dc.html'), ('Lado a lado', 'S-LadoALado.dc.html')], 'Deslizar', 'Cómo ver las fotos')
    + f'''<div style="position: relative; height: 460px; border-radius: 24px; overflow: hidden">
      <span style="position: absolute; inset: 0">{foto('pared_nueva', 358, 460, 0, 'Después: canilla arreglada')}</span>
      <span style="position: absolute; top: 0; left: 0; bottom: 0; width: 180px; overflow: hidden">{foto('canilla', 358, 460, 0, 'Antes: canilla que goteaba')}</span>
      <span aria-hidden="true" style="position: absolute; top: 0; bottom: 0; left: 178px; width: 4px; background: #FFFFFF"></span>
      <button type="button" aria-label="Deslizar para comparar" style="position: absolute; left: 152px; top: 206px; width: 56px; height: 56px; border-radius: 50%; border: 0; background: #FFFFFF; box-shadow: {ELEV2}; display: flex; align-items: center; justify-content: center">{svg(IC['deslizar'], AZUL, 24)}</button>
      <span style="position: absolute; left: 12px; top: 12px">{chip('Antes', None, 'noche')}</span><span style="position: absolute; right: 12px; top: 12px">{chip('Después', 'check', 'exito')}</span>
    </div>'''
    + texto('«Cambié el cuerito, el vástago y el cartucho. Probé sin pérdidas durante 10 minutos.» — Julián', 14), gap=12))

# S-LadoALado
guardar_u('S-LadoALado.dc.html', 'Lado a lado', barra('Antes y después', 'S-Informe.dc.html', sub='Canilla del baño') + cont(
    seg([('Deslizar', 'S-AntesDespues.dc.html'), ('Lado a lado', 'S-LadoALado.dc.html')], 'Lado a lado', 'Cómo ver las fotos')
    + fila_botones(f'<figure style="margin: 0; display: flex; flex-direction: column; gap: 6px">{foto("canilla", 172, 300, 18)}<figcaption>{chip("Antes", None, "noche")}</figcaption></figure>',
                   f'<figure style="margin: 0; display: flex; flex-direction: column; gap: 6px">{foto("pared_nueva", 172, 300, 18)}<figcaption>{chip("Después", "check", "exito")}</figcaption></figure>')
    + tarjeta(f'{etiqueta("QUÉ CAMBIÓ")}<ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6"><li>Cuerito y vástago nuevos</li><li>Cartucho termostático nuevo (adicional aprobado)</li><li>Prueba sin pérdidas</li></ul>'), gap=12))

# S-Informe
sec = lambda ic, t, txt: f'<div style="display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 40, radio=12, iconsize=20)}<span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px">{t}</strong><span style="font-size: 13px; line-height: 1.4; color: {TEXTO}">{txt}</span></span></div>'
guardar_u('S-Informe.dc.html', 'Informe del trabajo', barra('Informe', 'S-Trabajando.dc.html', accion_icono('compartir', 'Descargar el PDF', 'S-Informe.dc.html'), sub='Julián Ortiz · jue 19/11') + cont(
    f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("documento", 56, fondo=TINTE, color=AZUL, radio=18, iconsize=26)}<span style="display: flex; flex-direction: column; gap: 4px"><span style="{TIT}; font-size: 22px">Canilla del baño</span>{chip("Garantía activa hasta el 17/02/2027", "escudo", "exito")}</span></div>'
    + tarjeta(sec('lupa', 'Qué encontró', 'Cuerito gastado y cartucho con una fisura.')
              + sec('foto', 'Antes y después', '2 fotos · <a href="S-AntesDespues.dc.html" style="display: inline-block; min-height: 44px; line-height: 44px; padding: 0 8px; font-weight: 800">verlas</a>')
              + sec('check', 'Pruebas', 'Sin pérdidas durante 10 minutos con la llave abierta.')
              + sec('caja', 'Materiales y garantía', 'Cartucho termostático · 90 días de garantía del trabajo.')
              + sec('agenda', 'Qué conviene hacer después', 'Revisar las otras canillas en 12 meses. Lo agendamos en Mi hogar.')), gap=12)
    + fijo(btn('Dar la conformidad', 'S-Conformidad.dc.html', 'check'), nota='El informe queda guardado en Mi hogar.'))

# S-Conformidad
guardar_u('S-Conformidad.dc.html', 'Conformidad', barra('Conformidad', 'S-Informe.dc.html') + cont(
    f'<div style="display: flex; justify-content: center; padding: 6px 0">{img("cano", 120, 130)}</div>'
    + titulo('¿Quedó ', 'arreglado', '?', size=32, sub='Con un toque confirmás que el trabajo terminó. Después pagás directo a Julián.')
    + tarjeta(f'<div style="display: flex; justify-content: space-between; font-size: 14px"><span>Acuerdo</span><strong>$ 45.000</strong></div><div style="display: flex; justify-content: space-between; font-size: 14px"><span>Adicional aprobado</span><strong>$ 9.500</strong></div><div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 10px; border-top: 1px solid {BORDE}"><strong style="font-size: 15px">A pagarle a Julián</strong>{monto("$ 54.500", 26)}</div>'), gap=12)
    + fijo(btn('Sí, quedó bien', 'S-Pagar.dc.html', 'pulgar', 'verde'), btn('Hay un problema', 'M-Soporte.dc.html', var='rojo')))

# S-Pagar
medio = lambda ic, t, sub, on: f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 10px 14px; border-radius: 18px; background: #FFFFFF; border: {"2px solid " + AZUL if on else "1px solid " + BORDE}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; text-align: left; font-family: \'DM Sans\', sans-serif; color: {TINTA}">{mosaico_ic(ic, 44, radio=14, iconsize=22)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{sub}</span></span></button>'
guardar_u('S-Pagar.dc.html', 'Pagar', barra('Pagar a Julián', 'S-Conformidad.dc.html') + cont(
    f'<section style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 18px; border-radius: 24px; background: {MOSAICO}">{etiqueta("TOTAL ACORDADO")}{monto("$ 54.500", 46)}<span style="font-size: 13px; color: {SUAVE}">$ 45.000 + adicional $ 9.500</span></section>'
    + etiqueta('¿CÓMO LE PAGÁS?')
    + f'<div role="radiogroup" aria-label="Cómo pagás" style="display: flex; flex-direction: column; gap: 8px">{medio("tarjeta2", "Mercado Pago", "Te llevamos al cobro de Julián", True)}{medio("efectivo", "Efectivo", "Le pagás en mano", False)}</div>'
    + aviso('El pago va directo a Julián. Handyx no recibe ni reparte la plata. Tarifa de servicio: 0 % hasta el 10/12.', 'billete', 'gris')
    + aviso('Volver de Mercado Pago no confirma el pago: lo confirmamos cuando llega el aviso de Mercado Pago o cuando Julián lo marca.', 'info'), gap=10)
    + fijo(btn('Pagar con Mercado Pago', 'S-PagoInformado.dc.html'), btn('Pagué en efectivo', 'S-PagoInformado.dc.html', var='contorno')))

# S-PagoInformado
guardar_u('S-PagoInformado.dc.html', 'Pago informado', barra('Pago', 'S-Pagar.dc.html') + cont(
    f'<div style="display: flex; justify-content: center">{mosaico_ic("efectivo", 84, fondo=TINTE, color=AZUL, radio=26, iconsize=40)}</div>'
    + titulo('Pago ', 'informado', '', size=32, sub='Avisaste que le pagaste $ 54.500 en efectivo a Julián.')
    + tarjeta(etapas(1, 1, [('Vos informaste el pago', 'Jue 19/11 · 11:52'), ('Julián confirma que lo recibió', 'Le avisamos'), ('Pago verificado', 'Queda en tu historial')]))
    + aviso('Informado no es verificado: el pago queda verificado cuando Julián lo confirma.', 'info', 'gris'), gap=12)
    + fijo(btn('Dejar una reseña', 'S-Resena.dc.html', 'estrella'), btn('Listo', 'X-Actividad.dc.html', var='contorno')))

# S-Resena: hoja que sube sobre «¡Quedó arreglado!» (como Uber): estrellas grandes, chips y comentario opcional.
fondo_ok = (f'  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 380px; background: {AZUL}; border-radius: 0 0 36px 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #FFFFFF">'
            f'{img("cano", 120, 130)}<span style="{TIT}; font-size: 28px">¡Quedó arreglado!</span><span style="font-size: 14px; color: #DCE7F7">Pago informado · $ 54.500</span></div>\n')
star = lambda k: f'<button type="button" aria-label="{k} de 5" aria-pressed="true" style="width: 54px; height: 54px; border: 0; background: none; display: flex; align-items: center; justify-content: center">{svg(IC["estrella_llena"], NARANJA, 40)}</button>'
chip_b = lambda t, on=False: f'<button type="button" aria-pressed="{"true" if on else "false"}" style="min-height: 44px; padding: 0 14px; border-radius: 999px; border: {"2px solid " + AZUL if on else "1.5px solid " + BORDE}; background: {TINTE if on else "#FFFFFF"}; color: {HONDO if on else TINTA}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>'
guardar_u('S-Resena.dc.html', 'Reseña', oscurecer(fondo_ok)
    + f'  <div aria-hidden="true" style="position: absolute; top: 236px; left: 50%; margin-left: -40px; z-index: 2; border-radius: 50%; box-shadow: 0 0 0 5px #FFFFFF, 0 12px 24px -8px rgba(14,29,54,0.5)">{avatar("julian", 80)}</div>\n'
    + hoja_u(f'<div style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 26px; text-align: center"><h2 style="margin: 0; {TIT}; font-size: 24px">¿Cómo te fue con Julián?</h2><span style="font-size: 13px; color: {SUAVE}">Plomería · canilla del baño · jue 19/11</span></div>'
             + f'<div role="group" aria-label="Calificación: 5 de 5" style="display: flex; justify-content: center">{"".join(star(k) for k in range(1, 6))}</div>'
             + f'<span style="align-self: center; font-size: 15px; font-weight: 800; color: {HONDO}">¡Excelente!</span>'
             + etiqueta('¿QUÉ ESTUVO BIEN?')
             + f'<div role="group" aria-label="Qué estuvo bien" style="display: flex; flex-wrap: wrap; gap: 8px">{chip_b("Puntual", True)}{chip_b("Prolijo", True)}{chip_b("Explicó todo")}{chip_b("Buen precio")}</div>'
             + f'<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 800; color: {TEXTO}">Comentario (opcional)<input readonly value="Llegó en horario y dejó todo limpio." style="box-sizing: border-box; width: 100%; min-height: 50px; padding: 0 14px; border-radius: 14px; border: 1.5px solid {BORDE}; font-family: \'DM Sans\', sans-serif; font-size: 15px; color: {TINTA}"></label>'
             + btn('Publicar la reseña', 'X-Actividad.dc.html')
             + f'<a href="X-Actividad.dc.html" style="align-self: center; min-height: 44px; display: flex; align-items: center; font-size: 14px; font-weight: 800; color: {AZUL}; text-decoration: none">Ahora no</a>',
             top=276))
print('seguimiento ok')
