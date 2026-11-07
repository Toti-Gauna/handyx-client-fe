# Fila P · Pedir un servicio (rubro, qué pasa, fotos, anotar, medir, cuándo, fecha, zona, revisar, publicado).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def radio(titulo_, sub='', on=False, ic=None):
    borde = f'border: 2px solid {AZUL}; background: {TINTE} !important; box-shadow: 0 3px 0 {HONDO}' if on else f'border: 1px solid {BORDE}'
    marca = (f'<span aria-hidden="true" style="width: 24px; height: 24px; flex: none; border-radius: 50%; background: {AZUL}; display: flex; align-items: center; justify-content: center">{svg(IC["check"], "#FFFFFF", 14, 3)}</span>' if on
             else f'<span aria-hidden="true" style="width: 22px; height: 22px; flex: none; border-radius: 50%; border: 2px solid #AEB6C4"></span>')
    i = mosaico_ic(ic, 40, fondo='#FFFFFF' if on else TINTE, color=AZUL, radio=12, iconsize=20) if ic else ''
    s = f'<span style="font-size: 13px; color: {SUAVE}">{sub}</span>' if sub else ''
    return (f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 10px 14px; border-radius: 16px; background: #FFFFFF; {borde}; text-align: left; font-family: \'DM Sans\', sans-serif; color: {TINTA}">'
            f'{i}<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><strong style="font-size: 15px">{titulo_}</strong>{s}</span>{marca}</button>')


def grupo(label, *items):
    return f'<div role="radiogroup" aria-label="{label}" style="display: flex; flex-direction: column; gap: 8px">{"".join(items)}</div>'


# P-Rubro
guardar_u('P-Rubro.dc.html', 'Pedir: rubro', barra('Pedir un arreglo', 'I-Inicio.dc.html') + cont(
    titulo('¿Qué tipo de ', 'arreglo', '?', sub='Elegí el rubro. Si no sabés cuál es, HandIA te ayuda.') + grilla_rubros()
    + fila_ic('chispas', '¿No sabés qué rubro es?', 'Contale a HandIA lo que pasa', '', 'I-HandIA.dc.html', borde=False)
    + aviso('Por ahora Handyx trabaja con estos seis rubros en Mar del Plata.', 'info', 'gris'), gap=12))

# P-Que: el centro del camino corto (rubro › qué pasa › revisar y publicar). Fotos y medidas, opcionales.
mini = lambda ic, t, href: f'<a href="{href}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 76px; border-radius: 18px; background: {TINTE}; color: {HONDO}; font-size: 13px; font-weight: 800; text-decoration: none">{svg(IC[ic], AZUL, 22)}{t}</a>'
guardar_u('P-Que.dc.html', 'Pedir: qué pasa', barra('Plomería', 'I-Inicio.dc.html', sub='Paso 1 de 2') + cont(
    f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("canilla_ic", 56, fondo=TINTE, color=AZUL, radio=18, iconsize=28)}{titulo("¿Qué ", "pasa", "?", size=28)}</div>'
    + grupo('Qué pasa', radio('Pierde o gotea una canilla', on=True), radio('Se tapó un desagüe'), radio('Pérdida de agua en una pared'), radio('Instalar o cambiar algo'))
    + f'<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 800; color: {TEXTO}">Contalo con tus palabras (opcional)<textarea readonly rows="2" style="box-sizing: border-box; width: 100%; padding: 12px 14px; border-radius: 14px; border: 1.5px solid {BORDE}; font-family: \'DM Sans\', sans-serif; font-size: 15px; color: {TINTA}; resize: none">Gotea toda la noche. Ya cerré la llave de paso.</textarea></label>'
    + f'<span style="display: flex; align-items: center; justify-content: space-between">{etiqueta("FOTOS Y MEDIDAS")}{chip("Opcional", None, "gris")}</span>'
    + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{mini("camara", "Foto", "P-Fotos.dc.html")}{mini("regla", "Medir", "P-Medir.dc.html")}{mini("hogar", "De Mi hogar", "H-Compartir.dc.html")}</div>', gap=12)
    + fijo(btn('Revisar y publicar', 'P-Revisar.dc.html', 'flecha'), nota='Si no elegís día, va como «lo antes posible».'))

# P-Fotos
foto_mini = lambda tipo, etq='', marca='': f'<span style="position: relative; display: block">{foto(tipo, 110, 110, 18)}{marca}</span>'
guardar_u('P-Fotos.dc.html', 'Pedir: fotos', barra('Fotos y medidas', 'P-Que.dc.html', sub='Opcional') + cont(
    titulo('Sumá ', 'fotos', '', sub='Opcional: ayudan a que las propuestas sean más justas. Hasta 6.')
    + '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">'
    + foto_mini('canilla', marca=f'<span style="position: absolute; left: 6px; bottom: 6px">{chip("Anotada", "editar", "amarillo")}</span>')
    + foto_mini('humedad')
    + f'<button type="button" style="height: 110px; border-radius: 18px; border: 2px dashed #AEB6C4; background: {GRIS2}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-family: \'DM Sans\', sans-serif; font-size: 13px; font-weight: 800; color: {AZUL}">{svg(IC["camara"], AZUL, 26)}Sacar foto</button></div>'
    + fila_botones(btn('Anotar', 'P-Anotar.dc.html', 'editar', 'gris', chico=True), btn('Medir', 'P-Medir.dc.html', 'regla', 'gris', chico=True))
    + aviso('Antes de subirlas les sacamos la ubicación y los datos del teléfono. Que no se vean caras, documentos ni la dirección.', 'escudo')
    + aviso('HandIA no ve tus fotos: van al pedido, para los especialistas.', 'info', 'gris'), gap=12)
    + fijo(btn('Listo', 'P-Revisar.dc.html', 'check')))

# P-Anotar (editor de foto: fondo oscuro permitido)
herr = ''.join(f'<button type="button" aria-label="{t}"{" aria-pressed=\"true\"" if i == 0 else ""} style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-width: 64px; min-height: 60px; border-radius: 16px; border: 0; background: {"#FFFFFF" if i == 0 else "rgba(255,255,255,0.12)"}; color: {TINTA if i == 0 else "#FFFFFF"}; font-family: \'DM Sans\', sans-serif; font-size: 12px; font-weight: 800">{svg(IC[ic], TINTA if i == 0 else "#FFFFFF", 22)}{t}</button>' for i, (ic, t) in enumerate([('flecha_curva', 'Flecha'), ('circulo', 'Círculo'), ('texto', 'Texto'), ('deshacer', 'Deshacer')]))
guardar_u('P-Anotar.dc.html', 'Anotar la foto', camara() + f'''
  <header style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center">
    <a href="P-Fotos.dc.html" style="min-height: 44px; padding: 0 16px; border-radius: 999px; background: rgba(255,255,255,0.14); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; display: flex; align-items: center">Cancelar</a>
    <h1 style="margin: 0; color: #FFFFFF; {TIT}; font-size: 18px">Anotar</h1>
    <a href="P-Fotos.dc.html" style="min-height: 44px; padding: 0 16px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; font-size: 15px; font-weight: 800; text-decoration: none; display: flex; align-items: center">Listo</a>
  </header>
  <div data-c="1" style="position: absolute; top: 90px; left: 16px; right: 16px; display: flex; flex-direction: column; gap: 14px">
    <span style="position: relative; display: block">{foto('canilla', 358, 470, 24)}
      <svg aria-hidden="true" width="358" height="470" style="position: absolute; inset: 0"><circle cx="222" cy="306" r="40" fill="none" stroke="{AMARILLO}" stroke-width="5"></circle><path d="M90 400 C 130 380, 160 350, 182 322" stroke="{AMARILLO}" stroke-width="5" fill="none" stroke-linecap="round"></path><path d="M168 318 l16 2 -6 15" stroke="{AMARILLO}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      <span style="position: absolute; left: 24px; top: 400px; padding: 6px 12px; border-radius: 10px; background: {AMARILLO}; color: {TINTA}; font-size: 15px; font-weight: 800">Gotea acá</span>
    </span>
  </div>
  <div data-f="1" role="toolbar" aria-label="Herramientas para anotar" style="position: absolute; left: 16px; right: 16px; bottom: 26px; display: flex; justify-content: space-between; gap: 8px">{herr}</div>''')

# P-Medir (cámara)
guardar_u('P-Medir.dc.html', 'Medir con la cámara', camara(extra=f'<div style="position: absolute; left: 30px; top: 170px; width: 330px; height: 420px; border-radius: 12px; background: #2A3242"></div><div style="position: absolute; left: 70px; top: 300px; width: 250px; height: 160px; border-radius: 8px; background: #3A4458"></div>') + f'''
  <header style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center">
    <a href="P-Fotos.dc.html" aria-label="Volver" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>
    <h1 style="margin: 0; color: #FFFFFF; {TIT}; font-size: 18px">Medir</h1>
    <button type="button" style="min-height: 44px; padding: 0 14px; border-radius: 999px; border: 0; background: rgba(255,255,255,0.14); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 800">cm</button>
  </header>
  <svg aria-hidden="true" width="390" height="844" style="position: absolute; inset: 0"><path d="M70 470 L320 470" stroke="{AMARILLO}" stroke-width="4" stroke-dasharray="2 0"></path><circle cx="70" cy="470" r="9" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="2"></circle><circle cx="320" cy="470" r="9" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="2"></circle><circle cx="195" cy="380" r="22" fill="none" stroke="#FFFFFF" stroke-width="2"></circle><path d="M195 366v28M181 380h28" stroke="#FFFFFF" stroke-width="2"></path></svg>
  <span role="status" style="position: absolute; left: 50%; top: 486px; translate: -50% 0; padding: 8px 16px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; {TIT}; font-size: 22px">62 cm</span>
  <div data-c="1" style="position: absolute; top: 100px; left: 16px; right: 16px; display: flex; justify-content: center"><span style="padding: 10px 16px; border-radius: 999px; background: rgba(10,31,72,0.75); color: #FFFFFF; font-size: 14px; font-weight: 700">Apuntá a un borde y tocá + para marcar</span></div>
  <div data-f="1" style="position: absolute; left: 16px; right: 16px; bottom: 26px; display: flex; flex-direction: column; gap: 12px">
    <p style="margin: 0; text-align: center; font-size: 13px; color: #FFFFFF">Medida aproximada · sirve para orientar, no para cortar</p>
    <div style="display: flex; align-items: center; justify-content: center; gap: 22px">
      <button type="button" aria-label="Deshacer el último punto" style="width: 56px; height: 56px; border-radius: 50%; border: 0; background: rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center">{svg(IC['deshacer'], '#FFFFFF', 22)}</button>
      <button type="button" aria-label="Marcar un punto" style="width: 76px; height: 76px; border-radius: 50%; border: 5px solid rgba(255,255,255,0.4); background: #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC['mas'], AZUL, 30, 3)}</button>
      <a href="P-Fotos.dc.html" aria-label="Guardar la medida en el pedido" style="width: 56px; height: 56px; border-radius: 50%; background: {AMARILLO}; display: flex; align-items: center; justify-content: center">{svg(IC['check'], TINTA, 24, 3)}</a>
    </div>
  </div>''')

# P-Cuando
guardar_u('P-Cuando.dc.html', 'Pedir: cuándo', barra('¿Para cuándo?', 'P-Revisar.dc.html', sub='Cambiar') + cont(
    titulo('¿Para ', 'cuándo', '?', sub='Si es urgente, no hace falta el calendario. Los especialistas proponen día y precio.')
    + grupo('Para cuándo', radio('Lo antes posible', 'Le avisamos a especialistas de tu zona; elegís entre las propuestas que lleguen', ic='reloj'),
            radio('Programar un día', 'Elegís el día y la franja que te queden bien', on=True, ic='agenda'),
            radio('Es una obra de varios días', 'Baño, cocina, pintura o ampliación: propuesta por etapas', ic='obra')), gap=12)
    + fijo(btn('Elegir el día', 'P-Fecha.dc.html', 'agenda'), btn('Lo antes posible', 'P-Revisar.dc.html', var='contorno')))

# P-Fecha
franjas = ''.join(f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="min-height: 48px; border-radius: 14px; border: {"0" if on else "1.5px solid " + BORDE}; background: {AZUL if on else "#FFFFFF"}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; color: {"#FFFFFF" if on else TINTA}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>' for t, on in [('8 a 10 h', False), ('10 a 12 h', True), ('14 a 16 h', False), ('16 a 18 h', False)])
guardar_u('P-Fecha.dc.html', 'Pedir: fecha y franja', barra('Día y franja', 'P-Cuando.dc.html') + cont(
    f'<div style="display: flex; align-items: center; justify-content: space-between"><span style="{TIT}; font-size: 22px">Noviembre 2026</span><span style="display: flex; gap: 6px">{accion_icono("atras", "Mes anterior")}{accion_icono("flecha", "Mes siguiente")}</span></div>'
    + calendario(19, hoy=17, marcados=(19,)) + etiqueta('FRANJA PREFERIDA')
    + f'<div role="radiogroup" aria-label="Franja" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{franjas}</div>'
    + aviso('Es tu preferencia: el especialista puede proponerte otro horario y vos decidís.', 'info'), gap=10)
    + fijo(btn('Listo · jue 19/11, 10 a 12 h', 'P-Revisar.dc.html', 'check')))

# P-Zona
guardar_u('P-Zona.dc.html', 'Pedir: zona', barra('¿Dónde?', 'P-Revisar.dc.html', sub='Solo la primera vez') + mapa(top=64, alto=260, zona=(196, 190, 80))
    + f'  <div style="position: absolute; top: 280px; left: 16px">{chip("Zona que ven los especialistas", "ojo", "blanco")}</div>'
    + cont(tarjeta(f'{etiqueta("TU DIRECCIÓN")}<strong style="font-size: 17px">Calle De Prueba 123 · La Perla</strong>'
                                 + f'<span style="display: flex; gap: 8px; align-items: center; font-size: 13px; color: {TEXTO}">{svg(IC["candado"], "#137140", 16)}Se comparte solo con el especialista que elijas, al aceptar su propuesta.</span>',
                                 franja('Usar otra dirección', 'X-Datos.dc.html'))
           + campo('Indicaciones para llegar (opcional)', 'Portón verde, timbre 2'), top=340, gap=12)
    + fijo(btn('Usar esta dirección', 'P-Revisar.dc.html', 'check')))

# P-Revisar: resumen azul (como el informe del especialista), lo que falta se completa ahí mismo y el precio orientativo en noche.
fila_r = lambda ic, t, v, acc, href: (f'<a href="{href}" style="display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 0; border-top: 1px solid {BORDE}; color: {TINTA}; text-decoration: none">{mosaico_ic(ic, 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}'
                                      f'<span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 12px; font-weight: 800; color: {SUAVE}">{t}</span><strong style="font-size: 15px">{v}</strong></span><span style="font-size: 13px; font-weight: 800; color: {AZUL}">{acc}</span></a>')
guardar_u('P-Revisar.dc.html', 'Pedir: revisar', barra('Revisar y publicar', 'P-Que.dc.html', sub='Paso 2 de 2') + cont(
    tarjeta_azul(f'<div style="display: flex; align-items: center; gap: 12px"><span style="width: 52px; height: 52px; flex: none; border-radius: 16px; background: rgba(255,255,255,0.16); display: flex; align-items: center; justify-content: center">{svg(IC["canilla_ic"], "#FFFFFF", 26)}</span>'
                 f'<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: {AMARILLO}">TU PEDIDO</span><span style="{TIT}; font-size: 22px; line-height: 1.05">Plomería</span><span style="font-size: 13px; color: #DCE7F7">Pierde o gotea una canilla</span></span></div>'
                 f'<span style="font-size: 14px; line-height: 1.4">«Gotea toda la noche. Ya cerré la llave de paso.»</span>')
    + tarjeta(fila_r('reloj', 'Cuándo', 'Lo antes posible', 'Cambiar', 'P-Cuando.dc.html').replace(f'border-top: 1px solid {BORDE}; ', '', 1)
              + fila_r('pin', 'Dónde', 'Calle De Prueba 123 · guardada', 'Cambiar', 'P-Zona.dc.html')
              + fila_r('camara', 'Fotos y medidas', '2 fotos · 1 anotada', 'Sumar', 'P-Fotos.dc.html'))
    + tarjeta_noche(f'<span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">PRECIO ORIENTATIVO DE HANDYX</span>'
                    f'<span style="display: flex; align-items: baseline; gap: 8px">{monto("$ 38.000", 28, "#FFFFFF")}<span style="font-size: 14px; color: #C9D3E6">a</span>{monto("$ 52.000", 28, "#FFFFFF")}</span>'
                    f'<span style="font-size: 13px; line-height: 1.4; color: #C9D3E6">Sale de trabajos parecidos en tu zona. Handyx sugiere, nunca impone: cada especialista pone su precio.</span>')
    + aviso('Tarifa de servicio: 0 % hasta el 10/12/2026. El trabajo lo pagás directo al especialista.', 'billete', 'gris'), gap=12)
    + fijo(btn('Publicar el pedido', 'P-Publicado.dc.html', 'enviar')))

# P-Publicado
guardar_u('P-Publicado.dc.html', 'Pedido publicado', f'''  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 290px; background: {AZUL}; border-radius: 0 0 36px 36px; display: flex; align-items: center; justify-content: center"><span style="width: 170px; height: 170px; border-radius: 50%; background: rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center">{img("cano", 110, 120)}</span></div>
''' + cont(titulo('¡Pedido ', 'publicado', '!', size=34, sub='Se lo mostramos a especialistas verificados de Plomería cerca de tu zona.')
           + tarjeta(f'<ol aria-label="Qué sigue" style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px">'
                     + ''.join(f'<li style="display: flex; gap: 12px; align-items: center">{mosaico_ic(ic, 36, fondo=f, color=c, radio=12, iconsize=18)}<span style="display: flex; flex-direction: column"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></span></li>'
                               for ic, f, c, t, s in [('check', '#E3F4EA', '#137140', 'Publicado', 'Jue 19/11 · 10 a 12 h'), ('billete', TINTE, AZUL, 'Te llegan propuestas', 'Con precio, fecha y perfil verificado'), ('estrella', AMARILLO, TINTA, 'Elegís vos', 'Comparás y aceptás la que te sirva')])
                     + '</ol>')
           + aviso('Te avisamos cuando llegue cada propuesta. Los especialistas responden cuando pueden: no hay un tiempo fijo.', 'campana'), top=310, gap=14)
    + fijo(btn('Ver mi pedido', 'C-Buscando.dc.html'), btn('Ir al inicio', 'I-Inicio.dc.html', var='contorno')))
print('pedir ok')
