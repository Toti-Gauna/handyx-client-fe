# Fila O · Obras de varios días (propuesta de obra, obra, día, repuesto, cambio de fecha, chat grupal, pagos, gastado).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403

ETAPAS = [('1', 'Demolición', '2 días', '$ 180.000', 'julian', 'Pagada · verificada', 'exito'),
          ('2', 'Cañerías', '1 día', '$ 220.000', 'diego', 'Pagada · verificada', 'exito'),
          ('3', 'Revestimiento', '2 días', '$ 260.000', 'sofia', 'En curso', 'tinte'),
          ('4', 'Sanitarios', '1 día', '$ 190.000', 'julian', 'Pendiente', 'gris')]
EQUIPO = avatares(['julian', 'sofia', 'diego'], 32)


def kpi(t, v, s):
    return f'<div style="padding: 10px 12px; border-radius: 16px; background: {MOSAICO}; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: {SUAVE}">{t}</span><strong style="{TIT}; font-size: 15px; font-variant-numeric: tabular-nums; white-space: nowrap">{v}</strong><span style="font-size: 11px; color: {SUAVE}">{s}</span></div>'


def tabs_obra(activa):
    return seg([('Días', 'O-Obra.dc.html'), ('Repuestos', 'O-Repuesto.dc.html'), ('Equipo', 'O-Grupo.dc.html'), ('Pagos', 'O-Pagos.dc.html')], activa, 'Secciones de la obra')


# O-Propuesta
filas_e = ''.join(f'<div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid {BORDE}"><span style="width: 32px; height: 32px; flex: none; border-radius: 10px; background: {TINTE}; color: {HONDO}; display: flex; align-items: center; justify-content: center; {TIT}; font-size: 15px">{n}</span><span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{d} · {nombre(k)}</span></span><strong style="{TIT}; font-size: 15px">{m}</strong></div>' for n, t, d, m, k, _, _ in ETAPAS)
guardar_u('O-Propuesta.dc.html', 'Propuesta de obra', barra('Propuesta de obra', 'M-Chat.dc.html', sub='Baño completo · de Julián Ortiz') + cont(
    f'<div style="display: flex; align-items: center; justify-content: space-between"><span style="display: flex; flex-direction: column; gap: 4px">{etiqueta("TOTAL DE LA OBRA")}{monto("$ 850.000", 34)}<span style="font-size: 13px; color: {SUAVE}">6 días · del jue 12 al vie 20/11</span></span><span style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px">{EQUIPO}<span style="font-size: 12px; color: {SUAVE}">3 profesionales</span></span></div>'
    + tarjeta(f'{etiqueta("ETAPAS Y A QUIÉN LE PAGÁS CADA UNA")}{filas_e}')
    + aviso('Pagás cada etapa cuando la confirmás terminada, directo a quien la hizo. Handyx no recibe ni reparte la plata.', 'billete', 'gris')
    + aviso('Los repuestos que surjan te llegan para aprobar: nada se suma sin tu OK.', 'check'), gap=10)
    + fijo(btn('Aprobar la obra', 'O-Obra.dc.html', 'check', 'verde'), btn('Pedir cambios', 'C-Cambios.dc.html', var='contorno')))

# O-Obra
dias = [('JUE', '12', 'Jornada 1 · Demolición', 'Julián · 4 fotos', 'Hecha', 'exito'), ('VIE', '13', 'Jornada 2 · Demolición', 'Julián', 'Hecha', 'exito'),
        ('LUN', '16', 'Jornada 3 · Cañerías', 'Diego · sin pérdidas', 'Hecha', 'exito'), ('MAR', '17', 'Jornada 4 · Revestimiento', 'Sofía · 9 a 17 h', 'Hoy', 'amarillo'),
        ('MIÉ', '18', 'Jornada 5 · Revestimiento', 'Sofía', 'Repuesto para aprobar', 'error')]
fila_dia = lambda d, n, t, s, e, tono: f'<a href="O-Dia.dc.html" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 18px; background: {"#FFFFFF" if e != "Hoy" else "#FFFDE6"}; border: 1px solid {BORDE if e != "Hoy" else "#E5E39A"}; color: {TINTA}; text-decoration: none"><span style="width: 46px; height: 50px; flex: none; border-radius: 14px; background: {AZUL if e == "Hoy" else MOSAICO}; color: {"#FFFFFF" if e == "Hoy" else TINTA}; display: flex; flex-direction: column; align-items: center; justify-content: center"><span style="font-size: 11px; font-weight: 800">{d}</span><span style="{TIT}; font-size: 18px">{n}</span></span><span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span>{chip(e, "check" if tono == "exito" else ("alerta" if tono == "error" else "reloj"), tono)}</a>'
guardar_u('O-Obra.dc.html', 'Obra', barra('Baño completo', 'X-Actividad.dc.html', accion_icono('chat', 'Chat del equipo', 'O-Grupo.dc.html'), sub='Obra · Calle De Prueba 123') + cont(
    f'<div style="display: flex; align-items: center; gap: 14px">{anillo(2, 4, 64)}<span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><strong style="font-size: 16px">Etapa 3 · Revestimiento</strong><span style="font-size: 13px; color: {SUAVE}">2 de 4 etapas confirmadas</span></span>{EQUIPO}</div>'
    + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{kpi("EN OBRA", "Día 4 de 6", "desde el 12/11")}{kpi("PAGADO", "$ 400.000", "2 etapas")}{kpi("FALTA", "$ 450.000", "+ repuestos")}</div>'
    + tabs_obra('Días') + ''.join(fila_dia(*d) for d in dias), gap=10)
    + fijo(btn('Ver lo gastado', 'O-Gastado.dc.html', 'grafico', 'contorno')))

# O-Dia
guardar_u('O-Dia.dc.html', 'Jornada de obra', barra('Jornada 4', 'O-Obra.dc.html', sub='Revestimiento · mar 17/11') + cont(
    f'<div style="display: flex; align-items: center; gap: 12px">{avatar("sofia", 48)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 16px">Sofía Ruiz</strong><span style="font-size: 13px; color: {SUAVE}">9 a 17 h · llegó 9:05</span></span>{chip("Hoy", "reloj", "amarillo")}</div>'
    + etiqueta('AVANCE DEL DÍA') + fila_botones(foto('pared_nueva', 172, 130, 16, 'Foto del revestimiento colocado'), foto('humedad', 172, 130, 16, 'Foto de la pared antes de revestir'))
    + tarjeta(f'<span style="font-size: 14px; line-height: 1.45">«Colocamos la pared de la ducha y la mitad de la del lavatorio. Mañana termino y empiezo con las juntas.»</span><span style="font-size: 12px; color: {SUAVE}">Sofía · 16:40</span>')
    + tarjeta(f'{etiqueta("MATERIALES DE HOY")}' + ''.join(f'<div style="display: flex; justify-content: space-between; font-size: 14px"><span>{a}</span><strong>{b}</strong></div>' for a, b in [('Porcelanato 60 × 60', '6 m²'), ('Pegamento', '2 bolsas'), ('Separadores', '1 caja')]))
    + aviso('Las etapas se confirman cuando terminan: la de Revestimiento se termina mañana.', 'info', 'gris'), gap=10)
    + fijo(btn('Escribir al equipo', 'O-Grupo.dc.html', 'chat', 'contorno')))

# O-Repuesto
guardar_u('O-Repuesto.dc.html', 'Repuesto para aprobar', barra('Repuesto', 'O-Obra.dc.html', sub='Lo pide Sofía Ruiz · jornada 5') + cont(
    titulo('¿Aprobás este ', 'repuesto', '?', size=28, sub='Hace falta para seguir mañana. Nada se suma al acuerdo sin tu OK.')
    + tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("caja", 52, radio=16, iconsize=24)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 16px">Pegamento para porcelanato</strong><span style="font-size: 13px; color: {SUAVE}">3 bolsas de 30 kg · Ferretería Simulación</span></span></div>'
              + f'<div style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 14px">Precio de la ferretería</span>{monto("$ 36.000", 24)}</div>'
              + f'<div style="display: flex; justify-content: space-between; font-size: 13px; color: {SUAVE}"><span>Lo compra y lo trae</span><span>Sofía Ruiz</span></div>',
              franja('Ver la foto del ticket', 'O-Repuesto.dc.html'))
    + tarjeta(f'<div style="display: flex; justify-content: space-between; font-size: 14px"><span>Obra acordada</span><strong>$ 850.000</strong></div><div style="display: flex; justify-content: space-between; font-size: 14px"><span>Repuestos aprobados</span><strong>$ 0</strong></div><div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 8px; border-top: 1px solid {BORDE}"><strong>Total si aprobás</strong>{monto("$ 886.000", 22)}</div>'), gap=10)
    + fijo(btn('Aprobar $ 36.000', 'O-Obra.dc.html', 'check', 'verde'), fila_botones(btn('Preguntar', 'O-Grupo.dc.html', var='contorno', chico=True), btn('No aprobar', 'O-Obra.dc.html', var='rojo', chico=True))))

# O-Fecha
guardar_u('O-Fecha.dc.html', 'Cambio de fecha', barra('Cambio de fecha', 'O-Grupo.dc.html', sub='Lo propone Julián Ortiz') + cont(
    titulo('¿Movemos la ', 'jornada', '?', size=28, sub='Julián propone pasar Sanitarios del vie 20 al lun 23/11 porque el inodoro llega el sábado.')
    + f'<div style="display: flex; align-items: center; gap: 10px"><span style="flex: 1; padding: 12px; border-radius: 16px; background: {MOSAICO}; text-align: center"><span style="display: block; font-size: 12px; font-weight: 800; color: {SUAVE}">ANTES</span><strong style="{TIT}; font-size: 18px; text-decoration: line-through">Vie 20/11</strong></span>{svg(IC["flecha"], AZUL, 24)}<span style="flex: 1; padding: 12px; border-radius: 16px; background: {TINTE}; text-align: center"><span style="display: block; font-size: 12px; font-weight: 800; color: {HONDO}">PROPUESTO</span><strong style="{TIT}; font-size: 18px; color: {HONDO}">Lun 23/11</strong></span></div>'
    + '<div role="radiogroup" aria-label="Qué se mueve" style="display: flex; flex-direction: column; gap: 8px">'
    + ''.join(f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-height: 56px; padding: 10px 14px; border-radius: 16px; background: #FFFFFF; border: {"2px solid " + AZUL if on else "1px solid " + BORDE}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; text-align: left; font-family: \'DM Sans\', sans-serif; color: {TINTA}"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></button>' for t, s, on in [('Solo esta jornada', 'Las demás quedan igual', True), ('Esta y las que siguen', 'Todo corre un día hábil', False)])
    + '</div>' + aviso('Si no te sirve, proponé otro día: la jornada sigue en el vie 20 hasta que se acuerde.', 'info', 'gris'), gap=12)
    + fijo(btn('Aprobar el cambio', 'O-Grupo.dc.html', 'check', 'verde'), btn('Proponer otro día', 'P-Fecha.dc.html', var='contorno')))


def msj(k, t, hora=''):
    ini, nom, f, c = GENTE[k]
    return f'<div style="display: flex; gap: 8px; align-items: flex-end">{avatar(k, 30)}<div style="max-width: 76%; padding: 8px 12px; border-radius: 18px 18px 18px 6px; background: {MOSAICO}; font-size: 14px; line-height: 1.4"><span style="display: block; font-size: 12px; font-weight: 800; color: {HONDO}">{nom}</span>{t}<span style="display: block; margin-top: 2px; font-size: 11px; color: {SUAVE}; text-align: right">{hora}</span></div></div>'


tarjeta_fecha = (f'<section style="margin-left: 38px; border-radius: 20px; border: 1px solid {BORDE}; background: #FFFFFF; box-shadow: {ELEV1}; overflow: hidden"><div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 6px">{chip("Cambio de fecha", "agenda", "tinte")}<strong style="font-size: 15px">Sanitarios: vie 20 → lun 23/11</strong><span style="font-size: 13px; color: {SUAVE}">El inodoro llega el sábado</span></div>'
                 f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid {BORDE}"><a href="O-Fecha.dc.html" style="min-height: 48px; display: flex; align-items: center; justify-content: center; color: {HONDO}; font-size: 14px; font-weight: 800; text-decoration: none; border-right: 1px solid {BORDE}">Ver</a><a href="O-Grupo.dc.html" style="min-height: 48px; display: flex; align-items: center; justify-content: center; background: {VERDE}; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none">Aprobar</a></div></section>')
guardar_u('O-Grupo.dc.html', 'Chat de la obra', barra('Obra · Baño completo', 'O-Obra.dc.html', accion_icono('usuario2', 'Ver el equipo', 'O-Obra.dc.html'), sub='Vos, Julián, Sofía y Diego') + cont(
    f'<span style="align-self: center">{chip("Martes 17/11", None, "gris")}</span>'
    + msj('sofia', 'Buen día. Arranco con la pared de la ducha.', '9:06')
    + msj('julian', 'Lucía, el inodoro llega el sábado. Te propongo mover Sanitarios al lunes.', '11:20') + tarjeta_fecha
    + burbuja('Dale, me sirve el lunes. ¿Diego viene también?', 'yo', '11:34')
    + msj('diego', 'Sí, paso el lunes a probar las conexiones.', '11:40'), gap=10)
    + f'''  <div data-f="1" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 12px 20px; background: #FFFFFF; border-top: 1px solid {BORDE}; display: flex; align-items: center; gap: 8px">
    <a href="M-Adjuntar.dc.html" aria-label="Sumar" style="width: 48px; height: 48px; flex: none; border-radius: 50%; background: {AZUL}; box-shadow: 0 3px 0 {HONDO}; display: flex; align-items: center; justify-content: center">{svg(IC['mas'], '#FFFFFF', 22)}</a>
    <label style="flex: 1; display: flex; align-items: center; min-height: 48px; padding: 0 16px; border-radius: 999px; background: {GRIS2}"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Mensaje para el equipo</span><input readonly placeholder="Escribí un mensaje" style="flex: 1; min-width: 0; height: 46px; border: 0; background: none; font-family: 'DM Sans', sans-serif; font-size: 15px"></label>
    <button type="button" aria-label="Enviar" style="width: 48px; height: 48px; flex: none; border-radius: 50%; border: 0; background: {MOSAICO}; display: flex; align-items: center; justify-content: center">{svg(IC['enviar'], AZUL, 20)}</button>
  </div>''')

# O-Pagos
fila_pago = lambda n, t, m, k, est, tono: f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}">{avatar(k, 40)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px">Etapa {n} · {t}</strong><span style="font-size: 12px; color: {SUAVE}">A {nombre(k)}</span>{chip(est, "check" if tono == "exito" else ("reloj" if tono == "tinte" else "info"), tono)}</span><strong style="{TIT}; font-size: 16px">{m}</strong></div>'
guardar_u('O-Pagos.dc.html', 'Pagos de la obra', barra('Pagos de la obra', 'O-Obra.dc.html', sub='Baño completo') + cont(
    tabs_obra('Pagos')
    + f'<span style="font-size: 14px; color: {TEXTO}">Pagaste <strong>$ 400.000</strong> · faltan <strong>$ 486.000</strong></span>'
    + tarjeta(''.join(fila_pago(e[0], e[1], e[3], e[4], e[5], e[6]) for e in ETAPAS) + fila_pago('+', 'Repuesto aprobado', '$ 36.000', 'sofia', 'Al terminar la jornada 5', 'gris'))
    + aviso('El reparto lo acordó el equipo. Pagás a cada uno directo, por Mercado Pago o en efectivo; Handyx no toca la plata.', 'billete', 'gris'), gap=10)
    + fijo(btn('Pagar la etapa 3 cuando termine', None, 'billete', 'gris')))

# O-Gastado
barra_g = f'<div role="img" aria-label="Pagado $ 400.000, falta $ 450.000 y repuestos $ 36.000" style="display: flex; height: 16px; border-radius: 8px; overflow: hidden; background: {MOSAICO}"><span style="width: 45%; background: {AZUL}"></span><span style="width: 51%; background: #A9BEE0"></span><span style="width: 4%; background: {AMARILLO}; box-shadow: inset 0 0 0 1px #D8D36A"></span></div>'
ley = ''.join(f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px"><span aria-hidden="true" style="width: 14px; height: 10px; border-radius: 3px; background: {c}"></span>{t}</span>' for c, t in [(AZUL, 'Pagado'), ('#A9BEE0', 'Falta'), (AMARILLO, 'Repuestos')])
guardar_u('O-Gastado.dc.html', 'Lo gastado en la obra', barra('Lo gastado', 'O-Obra.dc.html', accion_icono('compartir', 'Descargar el resumen', 'O-Gastado.dc.html'), sub='Baño completo') + cont(
    f'<section style="display: flex; flex-direction: column; gap: 6px">{etiqueta("TOTAL CON REPUESTOS")}{monto("$ 886.000", 42)}<span style="font-size: 14px; color: {SUAVE}">Pagaste $ 400.000 · faltan $ 486.000</span></section>'
    + barra_g + f'<div style="display: flex; gap: 14px">{ley}</div>'
    + tarjeta(''.join(f'<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid {BORDE}"><span style="display: flex; flex-direction: column"><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span><strong style="{TIT}; font-size: 15px">{m}</strong></div>' for t, s, m in [('Mano de obra y materiales', '4 etapas acordadas', '$ 850.000'), ('Repuestos aprobados', '1 · pegamento', '$ 36.000'), ('Tarifa de servicio', '0 % hasta el 10/12', '$ 0')]))
    + aviso('Al terminar, el resumen y las garantías quedan en Mi hogar.', 'hogar', 'gris'), gap=12))
print('obras ok')
