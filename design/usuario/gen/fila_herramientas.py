# Fila T · Herramientas que comparten usuario y especialista (portada, medir, nivel, linterna y lupa, escanear en 3D,
# a dónde va lo que hiciste). Todo termina en el chat o en el pedido. Oscuro solo donde hay cámara.
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def herramienta(ic, t, s, href, fondo=MOSAICO, color=TINTA):
    return f'<a href="{href}" style="display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 22px; background: {fondo}; box-shadow: 0 4px 0 #D3D6DC; color: {color}; text-decoration: none"><span aria-hidden="true" style="width: 46px; height: 46px; border-radius: 14px; background: #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC[ic], AZUL, 24)}</span><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></a>'


def cab_camara(t, atras='T-Herramientas.dc.html', derecha=''):
    return f'''  <header style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center">
    <a href="{atras}" aria-label="Volver" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(14,29,54,0.72); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>
    <h1 style="margin: 0; padding: 8px 16px; border-radius: 999px; background: rgba(14,29,54,0.72); color: #FFFFFF; {TIT}; font-size: 17px">{t}</h1>
    {derecha or '<span style="width: 48px"></span>'}
  </header>'''


def pie_camara(*b):
    return f'  <div data-f="1" style="position: absolute; left: 16px; right: 16px; bottom: 26px; display: grid; grid-template-columns: repeat({len(b)}, minmax(0, 1fr)); gap: 10px">{"".join(b)}</div>'


# T-Herramientas
guardar_u('T-Herramientas.dc.html', 'Herramientas', barra('Herramientas', 'H-Hogar.dc.html') + cont(
    titulo('Tu ', 'caja', ' de herramientas', size=28, sub='Las mismas que usan los especialistas. Lo que hagas termina en el chat o en tu pedido.')
    + '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">'
    + herramienta('regla', 'Medir', 'Con la cámara (AR)', 'T-Medir.dc.html') + herramienta('nivel', 'Nivel', '¿Está derecho?', 'T-Nivel.dc.html')
    + herramienta('linterna', 'Linterna y lupa', 'Para ver de cerca', 'T-Linterna.dc.html') + herramienta('editar', 'Foto anotada', 'Flechas y texto', 'P-Anotar.dc.html')
    + herramienta('cubo', 'Escanear en 3D', 'Un ambiente entero', 'T-Escanear.dc.html') + herramienta('ar', 'Ver en AR', 'Un equipo propuesto', 'H-AR.dc.html')
    + '</div>' + aviso('Funcionan en tu celular. Nada se manda hasta que vos elegís a dónde.', 'candado', 'gris'), gap=12))

# T-Medir
guardar_u('T-Medir.dc.html', 'Medir', camara(extra=f'<div style="position: absolute; left: 0; right: 0; top: 0; height: 560px; background: #CFC8BA"></div><div style="position: absolute; left: 70px; top: 160px; width: 250px; height: 300px; background: #EDE9E0; border: 8px solid #FFFFFF"></div>') + cab_camara('Medir', derecha=f'<button type="button" style="min-height: 44px; padding: 0 14px; border-radius: 999px; border: 0; background: rgba(14,29,54,0.6); color: #FFFFFF; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">cm</button>') + f'''
  <svg aria-hidden="true" width="390" height="844" style="position: absolute; inset: 0"><path d="M70 480 H320" stroke="{AMARILLO}" stroke-width="4"></path><path d="M340 160 V460" stroke="{AMARILLO}" stroke-width="4"></path>{"".join(f'<circle cx="{x}" cy="{y}" r="8" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="2"></circle>' for x, y in [(70, 480), (320, 480), (340, 160), (340, 460)])}</svg>
  <span style="position: absolute; left: 160px; top: 494px; padding: 6px 12px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; {TIT}; font-size: 18px">1,20 m</span>
  <span style="position: absolute; left: 280px; top: 290px; padding: 6px 12px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; {TIT}; font-size: 18px">1,10 m</span>
  <div data-c="1" style="position: absolute; top: 580px; left: 16px; right: 16px; padding: 12px 14px; border-radius: 18px; background: #FFFFFF; display: flex; flex-direction: column; gap: 4px"><strong style="font-size: 15px">Ventana del living</strong><span style="font-size: 13px; color: {SUAVE}">1,20 × 1,10 m · medida aproximada (±1 cm)</span></div>
''' + pie_camara(btn('Guardar en Mi hogar', 'H-Modelo3D.dc.html', 'hogar', 'blanco', chico=True), btn('Mandar…', 'T-Destino.dc.html', 'enviar', 'azul', chico=True)))

# T-Nivel (fondo oscuro permitido)
guardar_u('T-Nivel.dc.html', 'Nivel', camara() + cab_camara('Nivel') + f'''
  <div data-c="1" style="position: absolute; top: 160px; left: 24px; right: 24px; display: flex; flex-direction: column; align-items: center; gap: 22px">
    <span role="img" aria-label="Inclinación: 0,4 grados" style="position: relative; width: 300px; height: 300px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.4); display: block">
      <span style="position: absolute; left: 50%; top: 50%; width: 120px; height: 120px; margin: -60px; border-radius: 50%; border: 2px dashed rgba(255,255,255,0.5)"></span>
      <span style="position: absolute; left: 50%; top: 50%; width: 86px; height: 86px; margin: -46px 0 0 -40px; border-radius: 50%; background: {AMARILLO}; box-shadow: 0 0 30px rgba(245,245,154,0.6)"></span>
    </span>
    <span style="{TIT}; font-size: 56px; color: #FFFFFF">0,4°</span>
    {chip("Está derecho", "check", "exito")}
    <p style="margin: 0; text-align: center; font-size: 14px; color: #FFFFFF">Apoyá el celular sobre el estante o el marco.</p>
  </div>
''' + pie_camara(btn('Fijar', None, 'candado', 'blanco', chico=True), btn('Mandar…', 'T-Destino.dc.html', 'enviar', 'azul', chico=True)))

# T-Linterna (linterna y lupa)
guardar_u('T-Linterna.dc.html', 'Linterna y lupa', camara(extra=f'<div style="position: absolute; left: 30px; top: 150px; width: 330px; height: 420px; border-radius: 24px; background: #E9EDF3; overflow: hidden"><div style="position: absolute; left: 70px; top: 90px; width: 190px; height: 240px; border-radius: 14px; background: #FFFFFF; border: 3px solid #9AA9BF"></div><div style="position: absolute; left: 150px; top: 230px; width: 30px; height: 30px; border-radius: 50%; background: #F3D9A0; border: 3px solid {NARANJA}"></div></div>') + cab_camara('Linterna y lupa') + f'''
  <span style="position: absolute; left: 50%; top: 590px; translate: -50% 0; padding: 6px 14px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; {TIT}; font-size: 18px">3×</span>
  <div data-c="1" style="position: absolute; top: 640px; left: 16px; right: 16px; padding: 4px 14px; border-radius: 20px; background: rgba(255,255,255,0.12)">
    <button type="button" role="switch" aria-checked="true" style="display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; border: 0; background: none; color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 800">{svg(IC['linterna'], '#FFFFFF', 20)}<span style="flex: 1; text-align: left">Linterna</span><span style="width: 48px; height: 28px; border-radius: 14px; background: {AMARILLO}; position: relative; display: block"><span style="position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; border-radius: 50%; background: {NOCHE}; display: block"></span></span></button>
  </div>
''' + pie_camara(btn('Acercar', None, 'lupa', 'blanco', chico=True), btn('Sacar foto', 'T-Destino.dc.html', 'camara', 'azul', chico=True)))

# T-Escanear (3D)
malla = ''.join(f'<path d="M{20 + i * 35} 160 L{60 + i * 30} 600" stroke="rgba(245,245,154,0.55)" stroke-width="1.5"></path>' for i in range(10)) + ''.join(f'<path d="M20 {160 + j * 44} L370 {150 + j * 46}" stroke="rgba(245,245,154,0.55)" stroke-width="1.5"></path>' for j in range(11))
guardar_u('T-Escanear.dc.html', 'Escanear en 3D', camara(extra=f'<div style="position: absolute; left: 0; right: 0; top: 0; height: 640px; background: #8E8676"></div>') + cab_camara('Escanear el baño') + f'''
  <svg aria-hidden="true" width="390" height="844" style="position: absolute; inset: 0">{malla}</svg>
  <div data-c="1" style="position: absolute; top: 90px; left: 16px; right: 16px; display: flex; flex-direction: column; gap: 10px">
    <span style="align-self: center; padding: 10px 16px; border-radius: 999px; background: rgba(14,29,54,0.75); color: #FFFFFF; font-size: 14px; font-weight: 700">Caminá despacio y apuntá a las paredes</span>
  </div>
  <div data-f="1" style="position: absolute; left: 16px; right: 16px; bottom: 26px; padding: 14px; border-radius: 22px; background: #FFFFFF; display: flex; flex-direction: column; gap: 10px">
    <span style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800"><span>Escaneando</span><span>64 %</span></span>{barra_progreso(64, 0, 8, MOSAICO)}
    <span style="font-size: 12px; color: {SUAVE}">Se procesa en tu celular. Queda en Mi hogar y lo compartís si querés.</span>
    {btn('Terminar', 'H-Modelo3D.dc.html', 'check', chico=True)}
  </div>''')

# T-Destino (a dónde va lo que hiciste)
dest = lambda av, t, s, on: f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; width: 100%; min-height: 60px; padding: 10px 14px; border-radius: 18px; background: #FFFFFF; border: {"2px solid " + AZUL if on else "1px solid " + BORDE}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; text-align: left; font-family: \'DM Sans\', sans-serif; color: {TINTA}">{av}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></span></button>'
guardar_u('T-Destino.dc.html', 'A dónde lo mandás', barra('Mandar', 'T-Medir.dc.html', sub='Ventana del living · 1,20 × 1,10 m') + cont(
    titulo('¿A dónde lo ', 'mandás', '?', size=28)
    + f'<div role="radiogroup" aria-label="Destino" style="display: flex; flex-direction: column; gap: 8px">'
    + dest(avatar('julian', 40), 'Chat con Julián Ortiz', 'Pedido · canilla del baño', True)
    + dest(avatares(['julian', 'sofia', 'diego'], 26), 'Chat de la obra', 'Baño completo', False)
    + dest(mosaico_ic('caja', 40, radio=12, iconsize=20), 'A un pedido nuevo', 'Arrancás un pedido con esto', False)
    + dest(mosaico_ic('hogar', 40, radio=12, iconsize=20), 'Solo a Mi hogar', 'Lo guardás para después', False) + '</div>'
    + aviso('Se manda sin ubicación ni datos del teléfono.', 'escudo', 'gris'), gap=12)
    + fijo(btn('Mandar', 'M-Chat.dc.html', 'enviar')))
print('herramientas ok')
