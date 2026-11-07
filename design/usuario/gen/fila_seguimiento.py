# Fila S · Seguimiento y cierre (agendado, en camino, llegó, trabajando, adicional, antes y después, lado a lado,
# informe con garantía, conformidad, pagar, pago informado, reseña).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def etapas(hechas, actual, items):
    out = []
    for i, (t, s) in enumerate(items):
        if i < hechas:
            m = f'<span aria-hidden="true" style="width: 28px; height: 28px; flex: none; border-radius: 50%; background: {VERDE}; display: flex; align-items: center; justify-content: center">{svg(IC["check"], "#FFFFFF", 16, 3)}</span>'
            est = ''
        elif i == actual:
            m = f'<span aria-hidden="true" style="width: 28px; height: 28px; flex: none; border-radius: 50%; background: {AZUL}; box-shadow: 0 0 0 5px {TINTE}"></span>'
            est = 'font-weight: 800'
        else:
            m = f'<span aria-hidden="true" style="width: 28px; height: 28px; flex: none; border-radius: 50%; border: 2px solid #C7CDD8; box-sizing: border-box"></span>'
            est = f'color: {SUAVE}'
        out.append(f'<li style="display: flex; gap: 12px; align-items: center">{m}<span style="display: flex; flex-direction: column; {est}"><span style="font-size: 15px">{t}</span><span style="font-size: 12px; color: {SUAVE}; font-weight: 400">{s}</span></span></li>')
    return f'<ol aria-label="Etapas del trabajo" style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px">{"".join(out)}</ol>'


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

# S-Trabajando
guardar_u('S-Trabajando.dc.html', 'Trabajando', barra('Trabajando', 'S-Agendado.dc.html', accion_icono('chat', 'Escribirle a Julián', 'M-Chat.dc.html'), sub='Julián Ortiz · desde 10:25') + cont(
    tarjeta(etapas(3, 3, ETAPAS))
    + f'<a href="S-Adicional.dc.html" style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 20px; background: #FBFBD2; border: 1px solid #E5E39A; color: {TINTA}; text-decoration: none">{mosaico_ic("alerta", 44, fondo=AMARILLO, color=TINTA, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">Julián pide un adicional</strong><span style="font-size: 13px">Cartucho nuevo · $ 9.500 · para aprobar</span></span>{svg(IC["flecha"], TINTA, 18)}</a>'
    + tarjeta(f'{etiqueta("AVANCE DE JULIÁN")}<div style="display: flex; gap: 10px">{foto("canilla", 110, 90, 14)}<span style="font-size: 14px; line-height: 1.4">«Desarmé la canilla. El cuerito estaba gastado y el cartucho tiene una fisura.»<span style="display: block; margin-top: 4px; font-size: 12px; color: {SUAVE}">10:41</span></span></div>'), gap=12))

# S-Adicional
guardar_u('S-Adicional.dc.html', 'Aprobar un adicional', barra('Adicional', 'S-Trabajando.dc.html', sub='Pedido por Julián Ortiz') + cont(
    titulo('¿Aprobás el ', 'adicional', '?', size=28, sub='Nada se suma al acuerdo hasta que lo apruebes.')
    + tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("caja", 52, radio=16, iconsize=24)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 16px">Cartucho termostático</strong><span style="font-size: 13px; color: {SUAVE}">El de ahora tiene una fisura</span></span>{monto("$ 9.500", 22)}</div>'
              + foto('canilla', 326, 140, 16, 'Foto del cartucho fisurado')
              + f'<div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid {BORDE}; font-size: 14px"><span>Acuerdo actual</span><strong>$ 45.000</strong></div><div style="display: flex; justify-content: space-between; font-size: 15px"><strong>Total si aprobás</strong>{monto("$ 54.500", 22)}</div>'), gap=12)
    + fijo(btn('Aprobar $ 9.500', 'S-Trabajando.dc.html', 'check', 'verde'), btn('No, gracias', 'S-Trabajando.dc.html', var='rojo')))

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

# S-Resena
estrellas = ''.join(f'<button type="button" aria-label="{i} de 5" aria-pressed="{"true" if i <= 5 else "false"}" style="width: 52px; height: 52px; border: 0; background: none; display: flex; align-items: center; justify-content: center"><svg width="38" height="38" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" fill="{NARANJA}" stroke="{NARANJA}" stroke-width="1.5" stroke-linejoin="round"></path></svg></button>' for i in range(1, 6))
etq = ''.join(f'<button type="button" aria-pressed="{"true" if on else "false"}" style="min-height: 44px; padding: 0 14px; border-radius: 999px; border: {"0" if on else "1.5px solid " + BORDE}; background: {TINTE if on else "#FFFFFF"}; color: {HONDO if on else TINTA}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>' for t, on in [('Puntual', True), ('Prolijo', True), ('Explicó todo', False), ('Buen precio', False)])
guardar_u('S-Resena.dc.html', 'Reseña', barra('Tu reseña', 'S-PagoInformado.dc.html', sub='Julián Ortiz · Plomería') + cont(
    f'<div style="display: flex; flex-direction: column; align-items: center; gap: 8px">{avatar("julian", 72)}<span style="{TIT}; font-size: 22px">¿Cómo te fue?</span></div>'
    + f'<div role="group" aria-label="Calificación" style="display: flex; justify-content: center">{estrellas}</div>'
    + f'<div role="group" aria-label="Qué destacás" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center">{etq}</div>'
    + f'<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 800; color: {TEXTO}">Contá cómo fue (opcional)<textarea readonly rows="3" style="box-sizing: border-box; width: 100%; padding: 12px 14px; border-radius: 14px; border: 1.5px solid {BORDE}; font-family: \'DM Sans\', sans-serif; font-size: 15px; color: {TINTA}; resize: none">Llegó en horario y dejó todo limpio.</textarea></label>'
    + aviso('Tu reseña se publica con tu nombre y la inicial del apellido. Sumás un paso en tu camino del hogar.', 'medalla', 'gris'), gap=12)
    + fijo(btn('Publicar la reseña', 'X-Actividad.dc.html')))
print('seguimiento ok')
