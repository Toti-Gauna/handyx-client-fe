# Fila H · Mi hogar (portada, ambiente, equipo, historial, informes y garantías, recordatorios, modelo 3D y medidas, AR).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def cabecera_hogar():
    return f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 22px 16px 18px 22px; background: {AZUL}; border-radius: 0 0 30px 30px; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 12px 30px -16px rgba(14,29,54,0.55)">
    <span style="display: flex; flex-direction: column; gap: 4px"><h1 style="margin: 0; {TIT}; font-size: 34px; line-height: 1">Mi hogar</h1><span style="font-size: 13px; font-weight: 700">Casa · Calle De Prueba 123 · La Perla</span></span>
    <a href="H-Modelo3D.dc.html" aria-label="Ver el modelo 3D de tu casa" style="width: 58px; height: 58px; border-radius: 18px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center">{svg(IC['cubo'], '#FFFFFF', 26)}</a>
  </header>'''


def ambiente(ic, t, s, href='H-Ambiente.dc.html'):
    return f'<a href="{href}" style="display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 20px; background: {MOSAICO}; box-shadow: 0 4px 0 #D3D6DC; color: {TINTA}; text-decoration: none"><span aria-hidden="true" style="width: 40px; height: 40px; border-radius: 12px; background: #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC[ic], AZUL, 20)}</span><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></a>'


# H-Hogar (pantalla raíz)
guardar_u('H-Hogar.dc.html', 'Mi hogar', cabecera_hogar() + cont(
    f'<div style="display: flex; align-items: center; gap: 12px"><span style="flex: 1; display: flex; flex-direction: column; gap: 6px"><span style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 800"><span>Ficha de tu casa</span><span>80 %</span></span>{barra_progreso(80, 0, 8, MOSAICO)}</span></div>'
    + '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">'
    + ambiente('gota', 'Baño', '3 equipos') + ambiente('llama', 'Cocina', 'Calefón y anafe') + ambiente('casa', 'Living', '1 equipo')
    + ambiente('copo', 'Dormitorio', 'Aire acond.') + ambiente('herramienta', 'Lavadero', 'Termotanque')
    + f'<a href="H-Hogar.dc.html" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 20px; border: 2px dashed #AEB6C4; color: {AZUL}; font-size: 13px; font-weight: 800; text-decoration: none">{svg(IC["mas"], AZUL, 22)}Sumar</a></div>'
    + tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("campana", 44, fondo=AMARILLO, color=TINTA, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px">{etiqueta("PRÓXIMO MANTENIMIENTO")}<strong style="font-size: 15px">Revisar el calefón</strong><span style="font-size: 13px; color: {SUAVE}">Antes del invierno · lo sugirió un informe</span></span></div>', franja('Ver recordatorios', 'H-Recordatorios.dc.html'))
    + fila_botones(f'<a href="H-Garantias.dc.html" style="display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 20px; background: #E3F4EA; color: #137140; text-decoration: none"><strong style="{TIT}; font-size: 24px">2</strong><span style="font-size: 13px; font-weight: 800">garantías activas</span></a>',
                   f'<a href="G-Camino.dc.html" style="display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 20px; background: {AMARILLO}; color: {TINTA}; text-decoration: none"><strong style="{TIT}; font-size: 24px">3 de 5</strong><span style="font-size: 13px; font-weight: 800">tu camino del hogar</span></a>')
    + fila_ic('reloj', 'Historial de la casa', 'Trabajos, informes y pagos', '', 'H-Historial.dc.html', borde=False), top=132, gap=12)
    + barra_u('Mi hogar'))

# H-Ambiente
equipo = lambda ic, t, s, est, tono, href='H-Equipo.dc.html': f'<a href="{href}" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}; color: {TINTA}; text-decoration: none">{mosaico_ic(ic, 44, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span>{chip(est, "escudo" if tono == "exito" else "info", tono)}</a>'
guardar_u('H-Ambiente.dc.html', 'Baño', barra('Baño', 'H-Hogar.dc.html', accion_icono('editar', 'Editar el ambiente', 'H-Ambiente.dc.html'), sub='3 equipos · 2,10 × 1,80 m') + cont(
    foto('pared_nueva', 358, 160, 22, 'Foto del baño después de la obra')
    + tarjeta(etiqueta('EQUIPOS') + equipo('gota', 'Canilla del lavatorio', 'Reparada el 19/11 · Julián Ortiz', 'Garantía', 'exito')
              + equipo('caja', 'Inodoro', 'Instalado en la obra · 23/11', 'Garantía', 'exito') + equipo('herramienta', 'Ducha', 'Sin datos todavía', 'Completar', 'gris'))
    + fila_botones(btn('Medidas y 3D', 'H-Modelo3D.dc.html', 'cubo', 'gris', chico=True), btn('Pedir un arreglo', 'P-Rubro.dc.html', 'mas', 'gris', chico=True)), gap=12))

# H-Equipo
dato = lambda t, v: f'<div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid {BORDE}; font-size: 14px"><span style="color: {SUAVE}">{t}</span><strong>{v}</strong></div>'
guardar_u('H-Equipo.dc.html', 'Calefón', barra('Calefón', 'H-Ambiente.dc.html', sub='Cocina') + cont(
    f'<div style="display: flex; gap: 12px; align-items: center">{foto("calefon", 110, 130, 18)}<span style="display: flex; flex-direction: column; gap: 6px"><span style="{TIT}; font-size: 22px">Calefón 14 L</span><span style="font-size: 13px; color: {SUAVE}">Marca De Prueba · tiro natural</span>{chip("Revisar antes del invierno", "campana", "amarillo")}</span></div>'
    + tarjeta(dato('Instalado', 'Mar 2021') + dato('Último mantenimiento', 'Mar 2026 · Gas') + dato('Garantía del trabajo', 'Vencida') + dato('Ubicación', 'Cocina, pared norte'))
    + tarjeta(etiqueta('INFORMES') + f'<a href="S-Informe.dc.html" style="display: flex; align-items: center; gap: 12px; min-height: 48px; color: {TINTA}; text-decoration: none">{mosaico_ic("documento", 40, fondo=TINTE, color=AZUL, radio=12, iconsize=18)}<span style="flex: 1; font-size: 14px; font-weight: 700">Revisión de gas · mar 2026</span>{svg(IC["flecha"], SUAVE, 18)}</a>')
    + aviso('El recordatorio es solo eso: vos decidís si pedís la revisión y a quién.', 'info', 'gris'), gap=12)
    + fijo(btn('Pedir una revisión de gas', 'P-Rubro.dc.html')))

# H-Historial
hist = lambda fecha, ic, t, s, m, href: f'<a href="{href}" style="display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}; color: {TINTA}; text-decoration: none"><span style="width: 52px; flex: none; font-size: 12px; font-weight: 800; color: {SUAVE}">{fecha}</span>{mosaico_ic(ic, 40, radio=12, iconsize=18)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span><strong style="{TIT}; font-size: 14px">{m}</strong></a>'
guardar_u('H-Historial.dc.html', 'Historial de la casa', barra('Historial', 'H-Hogar.dc.html', sub='Todo lo que se hizo en tu casa') + cont(
    seg([('Todo', 'H-Historial.dc.html'), ('Informes', 'H-Garantias.dc.html'), ('Pagos', 'X-Pagos.dc.html')], 'Todo', 'Filtrar el historial')
    + etiqueta('2026') + '<div style="display: flex; flex-direction: column">'
    + hist('19 NOV', 'gota', 'Canilla del baño', 'Julián Ortiz · informe y garantía', '$ 54.500', 'S-Informe.dc.html')
    + hist('12 NOV', 'obra', 'Obra · baño completo', 'Julián, Sofía y Diego · 6 días', '$ 886.000', 'O-Obra.dc.html')
    + hist('MAR', 'llama', 'Revisión de gas', 'Pablo Vega · informe', '$ 32.000', 'H-Equipo.dc.html')
    + hist('ENE', 'copo', 'Limpieza del aire', 'Pablo Vega', '$ 28.000', 'H-Historial.dc.html') + '</div>'
    + aviso('El historial es tuyo: lo podés descargar o borrar desde Privacidad.', 'candado', 'gris'), gap=10))

# H-Garantias
gar = lambda t, s, hasta, pct, href: tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("escudo", 44, fondo="#E3F4EA", color="#137140", radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span></div><span style="display: flex; justify-content: space-between; font-size: 13px"><span>Garantía hasta</span><strong>{hasta}</strong></span>{barra_progreso(pct, 0, 6, MOSAICO)}', franja('Ver el informe', href))
guardar_u('H-Garantias.dc.html', 'Informes y garantías', barra('Informes y garantías', 'H-Hogar.dc.html') + cont(
    titulo('Tus ', 'garantías', '', size=28, sub='Cada informe guarda qué se hizo, con qué materiales y hasta cuándo lo cubre la garantía.')
    + gar('Canilla del baño', 'Julián Ortiz · 19/11/2026', '17/02/2027', 6, 'S-Informe.dc.html')
    + gar('Obra · baño completo', 'Equipo de Julián · 23/11/2026', '23/11/2027', 2, 'O-Gastado.dc.html')
    + aviso('Si algo falla dentro de la garantía, escribile al especialista desde el informe o pedile ayuda a Soporte.', 'info', 'gris'), gap=12))

# H-Recordatorios
guardar_u('H-Recordatorios.dc.html', 'Recordatorios', barra('Recordatorios', 'H-Hogar.dc.html', accion_icono('mas', 'Sumar un recordatorio', 'H-Recordatorios.dc.html')) + cont(
    titulo('Tu casa al ', 'día', '', size=28, sub='Te avisamos cuándo conviene revisar algo. Nada se pide solo.')
    + f'<div style="display: flex; flex-direction: column; border-top: 1px solid {BORDE}">'
    + interr('Revisar el calefón', True, 'Antes del 1/5 · lo sugirió el informe de gas')
    + interr('Limpiar los filtros del aire', True, 'Cada 3 meses · próximo en febrero')
    + interr('Probar el disyuntor', True, 'Cada 6 meses · tocás el botón de prueba')
    + interr('Revisar las otras canillas', False, 'En 12 meses · lo sugirió Julián') + '</div>'
    + aviso('Hacer un mantenimiento a tiempo suma en tu camino del hogar, lo hagas con Handyx o por tu cuenta.', 'medalla', 'amarillo'), gap=12))

# H-Modelo3D
med = lambda t, v, quien: f'<div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid {BORDE}">{mosaico_ic("regla", 40, radio=12, iconsize=18)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{quien}</span></span><strong style="{TIT}; font-size: 15px">{v}</strong></div>'
guardar_u('H-Modelo3D.dc.html', 'Modelo 3D y medidas', barra('Modelo 3D y medidas', 'H-Hogar.dc.html', accion_icono('compartir', 'Compartir con un especialista', 'H-Modelo3D.dc.html')) + cont(
    f'<div style="display: flex; justify-content: center; padding: 6px 0; border-radius: 24px; background: {GRIS2}">{casa_iso(300, 210)}</div>'
    + f'<span style="display: flex; gap: 8px">{chip("Escaneado el 10/11", "cubo", "tinte")}{chip("Arrastrá para girar", "flechas", "gris")}</span>'
    + tarjeta(etiqueta('MEDIDAS') + med('Baño', '2,10 × 1,80 m', 'Compartida con el equipo de la obra') + med('Pared de la ducha', '1,80 × 2,40 m', 'Solo vos') + med('Ventana del living', '1,20 × 1,10 m', 'Solo vos'))
    + aviso('Las medidas y el modelo se comparten por pedido y las podés dejar de compartir cuando quieras.', 'candado', 'gris'), gap=10))

# H-AR (cámara)
guardar_u('H-AR.dc.html', 'Ver en AR', camara(extra=f'<div style="position: absolute; left: 0; right: 0; top: 0; height: 520px; background: #D9D4C8"></div><div style="position: absolute; left: 0; right: 0; top: 520px; bottom: 0; background: #B9AE98"></div><div style="position: absolute; left: 250px; top: 150px; width: 90px; height: 220px; background: #F2EFE8; border: 6px solid #FFFFFF"></div>') + f'''
  <header style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center">
    <a href="C-Detalle.dc.html" aria-label="Volver a la propuesta" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(14,29,54,0.6); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>
    <h1 style="margin: 0; padding: 8px 14px; border-radius: 999px; background: rgba(14,29,54,0.6); color: #FFFFFF; {TIT}; font-size: 16px">Ver en tu pared</h1>
    <span style="width: 48px"></span>
  </header>
  <div aria-hidden="true" style="position: absolute; left: 40px; top: 210px; width: 190px; height: 66px; border-radius: 12px; background: #FFFFFF; box-shadow: 0 18px 30px -12px rgba(0,0,0,0.45); border: 2px solid {AZUL}"><div style="margin: 44px 14px 0; height: 6px; border-radius: 3px; background: #D5DAE3"></div></div>
  <svg aria-hidden="true" width="390" height="844" style="position: absolute; inset: 0"><path d="M40 296 H230" stroke="{AMARILLO}" stroke-width="3"></path><path d="M40 290v12M230 290v12" stroke="{AMARILLO}" stroke-width="3"></path></svg>
  <span style="position: absolute; left: 92px; top: 306px; padding: 4px 10px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; font-size: 13px; font-weight: 800">80 cm</span>
  <div data-c="1" style="position: absolute; top: 560px; left: 16px; right: 16px; padding: 14px; border-radius: 20px; background: #FFFFFF; display: flex; flex-direction: column; gap: 6px">
    <span style="display: flex; align-items: center; gap: 10px">{avatar("pablo", 36)}<span style="display: flex; flex-direction: column"><strong style="font-size: 15px">Split frío/calor 3000 frigorías</strong><span style="font-size: 12px; color: {SUAVE}">Propuesta de Pablo Vega · 80 × 30 cm</span></span></span>
    <span style="font-size: 13px; color: {TEXTO}">Medidas reales del equipo propuesto. Movelo con el dedo para ver cómo queda.</span>
  </div>
  <div data-f="1" style="position: absolute; left: 16px; right: 16px; bottom: 26px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
    {btn('Sacar foto', None, 'camara', 'blanco')}{btn('Volver a la propuesta', 'C-Detalle.dc.html', None, 'azul')}
  </div>''')
print('hogar ok')
