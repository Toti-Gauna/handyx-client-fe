# Fila G · Camino del hogar (gamificación para el usuario, pensada de cero): se avanza cuidando la casa, no gastando
# más. Sin azar, sin rankings, sin presión para contratar y sin envíos a contactos. Montos y premios en borrador (Legal).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def cab_camino(t, sub):
    return f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 18px 16px 20px; background: {AZUL}; border-radius: 0 0 30px 30px; color: #FFFFFF; display: flex; flex-direction: column; gap: 10px">
    <span style="display: flex; justify-content: space-between; align-items: center"><a href="H-Hogar.dc.html" aria-label="Volver" style="width: 48px; height: 48px; border-radius: 16px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>{chip("Sin sorteos ni azar", "check", "blanco")}</span>
    <h1 style="margin: 0; {TIT}; font-size: 30px; line-height: 1.02">{t}</h1><span style="font-size: 13px; font-weight: 700">{sub}</span>
  </header>'''


def medalla(nombre_, ic, on=True, tam=86):
    f, c, b = (AMARILLO, TINTA, '#C9C85A') if on else (MOSAICO, '#5F6B84', '#D3D6DC')
    return (f'<span aria-hidden="true" style="position: relative; width: {tam}px; height: {tam}px; display: flex; align-items: center; justify-content: center">'
            f'<span style="position: absolute; inset: 0; border-radius: 50%; background: {f}; box-shadow: 0 4px 0 {b}"></span>'
            f'<span style="position: absolute; inset: {tam//7}px; border-radius: 50%; border: 2px dashed {c}; opacity: 0.4"></span>{svg(IC[ic], c, int(tam*0.4))}</span>')


# G-Camino
pasos_c = [('Ficha de tu casa', 'Cargaste ambientes y equipos', 'hogar', 'hecho', 70, 610),
           ('Primer informe leído', 'Sabés qué se hizo y hasta cuándo cubre', 'documento', 'hecho', 270, 530),
           ('Mantenimiento a tiempo', 'Revisá el calefón antes del 1/5', 'campana', 'ahora', 90, 450),
           ('Tres conformidades', 'Confirmaste trabajos terminados · 1 de 3', 'pulgar', 'falta', 260, 370),
           ('Casa al día', 'Todo revisado este año', 'medalla', 'falta', 110, 290)]
nodos = ''
for t, s, ic, est, x, y in pasos_c:
    f = {'hecho': AZUL, 'ahora': AMARILLO, 'falta': '#FFFFFF'}[est]
    c = {'hecho': '#FFFFFF', 'ahora': TINTA, 'falta': SUAVE}[est]
    i = 'check' if est == 'hecho' else ic
    b = 'box-shadow: 0 4px 0 #143E7E' if est == 'hecho' else ('box-shadow: 0 4px 0 #C9C85A' if est == 'ahora' else f'border: 2px solid {BORDE}')
    lado = 'left: 70px' if x < 200 else 'right: 70px'
    nodos += (f'<li style="position: absolute; left: {x - 28}px; top: {y - 28}px; width: 56px; height: 56px; border-radius: 50%; background: {f}; {b}; display: flex; align-items: center; justify-content: center; box-sizing: border-box">{svg(IC[i], c, 24, 2.5)}'
              f'<span style="position: absolute; {lado}; top: 0; width: 164px; padding: 6px 10px; border-radius: 14px; background: rgba(255,255,255,0.94); box-shadow: 0 2px 8px rgba(14,29,54,0.08); display: flex; flex-direction: column; text-align: {"left" if x < 200 else "right"}"><strong style="font-size: 14px; color: {TINTA}">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span></li>')
ruta = f'<svg aria-hidden="true" width="390" height="844" style="position: absolute; inset: 0"><path d="M70 610 C 160 590, 260 580, 270 530 S 100 490, 90 450 S 250 410, 260 370 S 120 320, 110 290" fill="none" stroke="{MOSAICO}" stroke-width="22" stroke-linecap="round"></path><path d="M70 610 C 160 590, 260 580, 270 530 S 100 490, 90 450" fill="none" stroke="{AZUL}" stroke-width="22" stroke-linecap="round"></path></svg>'
guardar_u('G-Camino.dc.html', 'Camino del hogar', cab_camino('El camino de tu ' + marcador('casa'), '3 de 5 · se avanza cuidando la casa, no gastando más') + ruta
          + f'<ol aria-label="Pasos del camino" style="list-style: none; margin: 0; padding: 0">{nodos}</ol>'
          + cont(fila_botones(btn('Insignias', 'G-Insignias.dc.html', 'medalla', 'gris', chico=True), btn('Beneficios', 'G-Beneficios.dc.html', 'regalo', 'gris', chico=True)), top=666)
          + barra_u('Mi hogar'))

# G-Insignias
ins = lambda n, ic, s, on: f'<a href="G-Insignia.dc.html" style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; border-radius: 20px; background: {"#FFFFFF" if on else GRIS2}; border: 1px solid {BORDE}; color: {TINTA}; text-decoration: none; text-align: center">{medalla(n, ic, on, 64)}<strong style="font-size: 13px">{n}</strong><span style="font-size: 11px; color: {SUAVE}">{s}</span></a>'
guardar_u('G-Insignias.dc.html', 'Insignias', barra('Insignias', 'G-Camino.dc.html', sub='2 de 6') + cont(
    titulo('Tus ', 'insignias', '', size=28, sub='Cada una dice qué hiciste por tu casa. No se compran ni se sortean.')
    + '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">'
    + ins('Casa fichada', 'hogar', 'Ficha completa', True) + ins('Ojo de inspector', 'lupa', 'Leíste tu primer informe', True) + ins('Al día', 'campana', '3 mantenimientos a tiempo', False)
    + ins('Conforme', 'pulgar', '3 conformidades', False) + ins('Medidor', 'regla', 'Mediste 5 cosas', False) + ins('Buen vecino', 'estrella', '3 reseñas', False)
    + '</div>' + aviso('Sin rankings ni comparaciones con otras personas. Tus insignias no se comparten con nadie.', 'candado', 'gris'), gap=12))

# G-Insignia
guardar_u('G-Insignia.dc.html', 'Insignia Al día', barra('Al día', 'G-Insignias.dc.html') + cont(
    f'<div style="display: flex; justify-content: center; padding: 10px 0">{medalla("Al día", "campana", False, 140)}</div>'
    + titulo('Casa al ', 'día', '', size=30, sub='Hacé tres mantenimientos antes de que venzan sus recordatorios.')
    + tarjeta(f'<span style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800"><span>Tu avance</span><span>1 de 3</span></span>{barra_progreso(33, 0, 10, MOSAICO)}'
              + ''.join(f'<span style="display: flex; gap: 8px; align-items: center; font-size: 14px">{svg(IC["check" if ok else "reloj"], "#137140" if ok else SUAVE, 18)}{t}</span>' for t, ok in [('Limpieza de filtros del aire · ene', True), ('Revisión del calefón · antes del 1/5', False), ('Prueba del disyuntor · antes del 1/6', False)]))
    + aviso('Vale igual si lo hacés con un especialista de Handyx o por tu cuenta: lo marcás vos en Mi hogar.', 'info', 'gris'), gap=12))

# G-Beneficios
ben = lambda ic, t, s, req: tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic(ic, 44, fondo=AMARILLO, color=TINTA, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span></div><span style="display: flex; gap: 6px; flex-wrap: wrap">{chip(req, "medalla", "tinte")}{chip("Borrador · Legal", "documento", "gris")}</span>')
guardar_u('G-Beneficios.dc.html', 'Beneficios', barra('Beneficios', 'G-Camino.dc.html') + cont(
    titulo('Lo que ', 'ganás', ' cuidando tu casa', size=26, sub='Se desbloquean con tu camino. Sin azar y sin tener que contratar más.')
    + ben('documento', 'Guía de mantenimiento de invierno', 'PDF con lo que conviene revisar', 'Con «Casa fichada»')
    + ben('agenda', 'Recordatorios con fecha sugerida', 'Te proponemos el mejor momento del año', 'Con «Ojo de inspector»')
    + ben('billete', '$ [MONTO] en una revisión anual', 'Monto y condiciones a definir', 'Con «Casa al día»')
    + aviso('Montos, premios y condiciones están en borrador hasta que los apruebe Legal. Nada se comparte con tus contactos.', 'info', 'amarillo'), gap=10))

# G-Hito
confeti = ''.join(f'<span aria-hidden="true" style="position: absolute; left: {x}px; top: {y}px; width: 10px; height: 10px; border-radius: 3px; background: {c}; rotate: {r}deg"></span>' for x, y, c, r in [(40, 70, AMARILLO, 20), (90, 140, '#FFFFFF', 45), (300, 80, AMARILLO, 10), (340, 170, '#FFFFFF', 30), (60, 240, '#FFFFFF', 60), (320, 250, AMARILLO, 75), (190, 50, AMARILLO, 15), (230, 270, '#FFFFFF', 40)])
guardar_u('G-Hito.dc.html', '¡Insignia nueva!', f'''  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 330px; background: {AZUL}; border-radius: 0 0 36px 36px; display: flex; align-items: center; justify-content: center">{confeti}{medalla("Ojo de inspector", "lupa", True, 150)}</div>
''' + cont(titulo('¡Sos ', 'Ojo de inspector', '!', size=32, sub='Leíste tu primer informe: ahora sabés qué se hizo en tu casa y hasta cuándo cubre la garantía.')
           + f'<div style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 20px; background: {MOSAICO}">{img("grupo", 110, 64)}<span style="font-size: 14px; line-height: 1.4">Desbloqueaste la <strong>guía de recordatorios con fecha sugerida</strong>.</span></div>', top=350, gap=14)
    + fijo(btn('Ver mi camino', 'G-Camino.dc.html'), btn('Seguir', 'H-Hogar.dc.html', var='contorno')))
print('camino ok')
