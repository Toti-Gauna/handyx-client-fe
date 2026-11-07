# Fila H · Mi hogar (portada, ambiente, equipo, historial, informes y garantías, recordatorios, modelo 3D y medidas, AR).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def cabecera_hogar():
    return f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 20px 16px 22px 20px; background: {AZUL}; border-radius: 0 0 30px 30px; color: #FFFFFF; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 12px 30px -16px rgba(14,29,54,0.55)">
    <div style="display: flex; align-items: center; justify-content: space-between"><span style="display: flex; flex-direction: column; gap: 4px"><h1 style="margin: 0; {TIT}; font-size: 34px; line-height: 1">Mi hogar</h1><span style="font-size: 13px; font-weight: 700; color: #DCE7F7">Casa · Calle De Prueba 123 · La Perla</span></span>
    <a href="H-MiCasa.dc.html" aria-label="Editar la ficha de la casa" style="width: 52px; height: 52px; border-radius: 16px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center">{svg(IC['editar'], '#FFFFFF', 22)}</a></div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 20px; background: rgba(255,255,255,0.14)">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 6px"><span style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 800"><span>Ficha de tu casa</span><span>80 %</span></span>{barra_progreso(80, 0, 8, "rgba(255,255,255,0.25)").replace(AZUL, AMARILLO)}</span>
      <span style="display: flex; gap: 14px; font-size: 12px; color: #FFFFFF">{"".join(f'<span style="display: flex; flex-direction: column; align-items: center"><strong style="{TIT}; font-size: 18px; color: #FFFFFF">{v}</strong>{t}</span>' for v, t in [("6", "ambientes"), ("11", "equipos")])}</span>
    </div>
  </header>'''


def puerta(letra, ic, t, s, href, est):
    f, c, sc, b = est
    return (f'<a href="{href}" style="position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; min-height: 132px; box-sizing: border-box; padding: 14px; border-radius: 24px; background: {f}; {b}; color: {c}; text-decoration: none">'
            f'<span style="display: flex; justify-content: space-between; align-items: flex-start"><span style="width: 44px; height: 44px; border-radius: 14px; background: {sc}; display: flex; align-items: center; justify-content: center">{svg(IC[ic], c if f == "#FFFFFF" else (TINTA if f == AMARILLO else "#FFFFFF"), 22)}</span><span aria-hidden="true" style="font-size: 11px; font-weight: 900; letter-spacing: 1px; opacity: 0.7">{letra}</span></span>'
            f'<span style="display: flex; flex-direction: column; gap: 2px"><strong style="{TIT}; font-size: 15px; line-height: 1.08; letter-spacing: -0.2px">{t}</strong><span style="font-size: 12px; line-height: 1.3; opacity: 0.85">{s}</span></span></a>')


E_AZUL = (AZUL, '#FFFFFF', 'rgba(255,255,255,0.18)', f'box-shadow: 0 4px 0 {HONDO}')
E_AMA = (AMARILLO, TINTA, '#FFFFFF', 'box-shadow: 0 4px 0 #C9C85A')
E_NOCHE = (NOCHE, '#FFFFFF', 'rgba(255,255,255,0.14)', 'box-shadow: 0 4px 0 #0E1A30')
E_BLANCO = ('#FFFFFF', TINTA, TINTE, f'border: 1px solid {BORDE}; box-shadow: {ELEV1}')

# H-Hogar (pantalla raíz): cuatro puertas, cada una con su camino
guardar_u('H-Hogar.dc.html', 'Mi hogar', cabecera_hogar() + cont(
    '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">'
    + puerta('A', 'casa', 'Mi casa', 'Ambientes y equipos, con fotos y medidas', 'H-MiCasa.dc.html', E_BLANCO)
    + puerta('B', 'alerta', 'Algo se rompió', 'Elegís qué y el pedido sale armado', 'H-Rompio.dc.html', E_AZUL)
    + puerta('C', 'campana', 'Mantenimiento', '1 para esta semana', 'H-Recordatorios.dc.html', E_AMA)
    + puerta('D', 'reloj', 'Historial y garantías', '4 trabajos · 2 garantías activas', 'H-Historial.dc.html', E_NOCHE) + '</div>'
    + tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("campana", 44, fondo=AMARILLO, color=TINTA, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px">{etiqueta("PRÓXIMO MANTENIMIENTO")}<strong style="font-size: 15px">Revisar el calefón</strong><span style="font-size: 12px; color: {SUAVE}">Antes del invierno · lo sugirió un informe</span></span></div>', franja('Ver recordatorios', 'H-Recordatorios.dc.html'))
    + f'<a href="H-Compartido.dc.html" style="display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 0 4px; color: {TINTA}; text-decoration: none">{mosaico_ic("compartido", 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}<span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 15px">Lo que compartiste</strong><span style="font-size: 12px; color: {SUAVE}">1 pedido ve datos del baño</span></span>{svg(IC["flecha"], SUAVE, 18)}</a>', top=214, gap=12)
    + barra_u('Mi hogar'), alto=900)

# H-MiCasa (puerta A): los ambientes con su foto de portada y qué falta
amb = lambda tipo, t, s, pct, href='H-Ambiente.dc.html': (f'<a href="{href}" style="display: flex; flex-direction: column; border-radius: 22px; overflow: hidden; background: #FFFFFF; border: 1px solid {BORDE}; box-shadow: {ELEV1}; color: {TINTA}; text-decoration: none">'
                                                          f'{foto_amb(tipo, 171, 96, 0)}<span style="padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 6px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span>'
                                                          f'<span style="display: flex; align-items: center; gap: 6px">{barra_progreso(pct, 0, 6, MOSAICO)}<span style="font-size: 11px; font-weight: 800; color: {SUAVE}">{pct} %</span></span></span></a>')
guardar_u('H-MiCasa.dc.html', 'Mi casa', barra('Mi casa', 'H-Hogar.dc.html', accion_icono('mas', 'Sumar un ambiente', 'H-Sumar.dc.html'), sub='6 ambientes · 11 equipos') + cont(
    seg([('Ambientes', 'H-MiCasa.dc.html'), ('Equipos', 'H-Equipo.dc.html'), ('Planos y 3D', 'H-Modelo3D.dc.html')], 'Ambientes', 'Ver la casa por')
    + '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">'
    + amb('bano', 'Baño', '3 equipos · 2,10 × 1,80 m', 100) + amb('cocina', 'Cocina', 'Calefón, anafe y bacha', 90)
    + amb('living', 'Living', 'Ventana y 4 enchufes', 70) + amb('dormitorio', 'Dormitorio', 'Aire acond. · falta medir', 50)
    + amb('lavadero', 'Lavadero', 'Termotanque', 80)
    + f'<a href="H-Sumar.dc.html" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 196px; border-radius: 22px; border: 2px dashed #AEB6C4; background: {GRIS2}; color: {AZUL}; font-size: 14px; font-weight: 800; text-decoration: none">{svg(IC["mas"], AZUL, 26)}Sumar un ambiente</a></div>'
    + aviso('Tu ficha es privada. Se comparte solo lo que elegís, con quien elegís y para un pedido.', 'candado', 'gris'), gap=12), alto=1040)

# H-Ambiente: el baño completo (fotos, medidas, materiales, equipos y notas)
equipo = lambda ic, t, s, est, tono, href='H-Equipo.dc.html': (f'<a href="{href}" style="display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 0; border-top: 1px solid {BORDE}; color: {TINTA}; text-decoration: none">{mosaico_ic(ic, 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}'
                                                              f'<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span>{chip(est, "escudo" if tono == "exito" else "mas", tono)}</a>')
guardar_u('H-Ambiente.dc.html', 'Baño', barra('Baño', 'H-MiCasa.dc.html', accion_icono('editar', 'Editar el baño', 'H-Ambiente.dc.html'), sub='Ficha completa') + cont(
    f'<div style="position: relative">{foto_amb("bano", 358, 190, 24)}<span style="position: absolute; left: 10px; bottom: 10px">{chip("1 de 4 fotos", "camara", "blanco")}</span></div>'
    + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{"".join(foto_amb(t, 114, 70, 14) for t in ("bano", "etiqueta", "bano"))}</div>'
    + tarjeta(etiqueta('MEDIDAS Y MATERIALES')
              + dato_fila('regla', 'Medidas', '2,10 × 1,80 m · 2,60 de alto', 'Medido con la cámara · aproximado').replace(f'border-top: 1px solid {BORDE}; ', '', 1)
              + dato_fila('ladrillo', 'Paredes y piso', 'Cerámica blanca 30 × 60', 'Sobraron 2 cajas, en el lavadero')
              + dato_fila('gota', 'Agua', 'Caños de termofusión · llave de paso bajo la bacha'))
    + tarjeta(etiqueta('EQUIPOS · 3') + equipo('canilla_ic', 'Canilla del lavatorio', 'FV · reparada el 19/11', 'Garantía', 'exito')
              + equipo('caja', 'Inodoro con mochila', 'Instalado en la obra · 23/11', 'Garantía', 'exito') + equipo('ducha', 'Ducha', 'Sin datos todavía', 'Completar', 'gris'))
    + f'<blockquote style="margin: 0; padding: 12px 14px; border-radius: 16px; background: {GRIS2}; font-size: 14px; line-height: 1.4">{etiqueta("NOTA")}<span style="display: block; margin-top: 4px">La llave de paso general está en la vereda, tapa verde.</span></blockquote>', gap=12)
    + fijo(btn('Algo se rompió acá', 'H-Rompio.dc.html', 'alerta'), btn('Compartir con un especialista', 'H-Compartir.dc.html', 'compartido', 'contorno', chico=True)), alto=1220)

# H-Equipo: el calefón con la foto de la etiqueta
guardar_u('H-Equipo.dc.html', 'Calefón', barra('Calefón', 'H-Ambiente.dc.html', accion_icono('editar', 'Editar el calefón', 'H-Equipo.dc.html'), sub='Cocina') + cont(
    f'<div style="display: flex; gap: 12px; align-items: stretch">{foto("calefon", 150, 170, 20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center"><span style="{TIT}; font-size: 24px; line-height: 1.02">Calefón 14 L</span><span style="font-size: 13px; color: {SUAVE}">Marca De Prueba · tiro natural</span>{chip("Revisar antes del invierno", "alerta", "amarillo")}</span></div>'
    + tarjeta(f'<div style="display: flex; gap: 12px; align-items: center">{foto_amb("etiqueta", 96, 72, 12)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px">{etiqueta("ETIQUETA")}<strong style="font-size: 14px">Modelo y potencia, a mano</strong><span style="font-size: 12px; color: {SUAVE}">El especialista la ve si la compartís</span></span></div>')
    + tarjeta(dato_fila('agenda', 'Instalado', 'Marzo 2021').replace(f'border-top: 1px solid {BORDE}; ', '', 1) + dato_fila('herramienta', 'Último mantenimiento', 'Marzo 2026 · Pablo Vega') + dato_fila('escudo', 'Garantía del trabajo', 'Vencida') + dato_fila('pin', 'Dónde está', 'Cocina, pared norte'))
    + tarjeta(etiqueta('INFORMES') + f'<a href="S-Informe.dc.html" style="display: flex; align-items: center; gap: 12px; min-height: 48px; color: {TINTA}; text-decoration: none">{mosaico_ic("documento", 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}<span style="flex: 1; font-size: 14px; font-weight: 700">Revisión de gas · mar 2026</span>{svg(IC["flecha"], SUAVE, 18)}</a>')
    + aviso('El recordatorio es solo eso: vos decidís si pedís la revisión y a quién.', 'info', 'gris'), gap=12)
    + fijo(btn('Pedir una revisión', 'P-Revisar.dc.html', 'llama')), alto=1000)

# H-Rompio (puerta B): elegís el ambiente y el equipo; el pedido sale con los datos de la casa
sel_amb = lambda tipo, t, on=False: (f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; flex-direction: column; gap: 6px; padding: 6px; border-radius: 18px; border: {"3px solid " + AZUL if on else "1px solid " + BORDE}; background: #FFFFFF; font-family: \'DM Sans\', sans-serif; font-size: 13px; font-weight: 800; color: {TINTA}">'
                                     f'{foto_amb(tipo, 100 if on else 102, 64, 12)}{t}</button>')
sel_eq = lambda ic, t, s, on=False: (f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 12px; border-radius: 16px; border: {"2px solid " + AZUL if on else "1px solid " + BORDE}; background: {TINTE if on else "#FFFFFF"}; font-family: \'DM Sans\', sans-serif; text-align: left; color: {TINTA}">'
                                     f'{mosaico_ic(ic, 40, fondo="#FFFFFF" if on else TINTE, color=AZUL, radio=12, iconsize=19)}<span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span></button>')
guardar_u('H-Rompio.dc.html', 'Algo se rompió', barra('Algo se rompió', 'H-Hogar.dc.html') + cont(
    titulo('¿Dónde ', 'pasa', '?', size=28, sub='Elegís el lugar y qué falla. El pedido sale con las fotos y los datos de tu casa, sin sacar nada de nuevo.')
    + f'<div role="radiogroup" aria-label="Ambiente" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{sel_amb("bano", "Baño", True)}{sel_amb("cocina", "Cocina")}{sel_amb("living", "Living")}</div>'
    + etiqueta('¿QUÉ FALLA EN EL BAÑO?')
    + f'<div role="radiogroup" aria-label="Qué falla" style="display: flex; flex-direction: column; gap: 8px">{sel_eq("canilla_ic", "Canilla del lavatorio", "FV · con garantía hasta el 17/02", True)}{sel_eq("caja", "Inodoro con mochila", "Instalado el 23/11")}{sel_eq("ducha", "Ducha", "Sin datos")}{sel_eq("mas", "Otra cosa del baño", "Lo contás vos")}</div>'
    + aviso('La canilla tiene garantía de Julián: podés pedirle a él que la revise.', 'escudo', 'amarillo'), gap=12)
    + fijo(btn('Armar el pedido', 'P-Que.dc.html', 'flecha'), btn('Pedírselo a Julián (garantía)', 'M-Chat.dc.html', 'escudo', 'contorno', chico=True)), alto=980)

# H-Compartir: hoja sobre el pedido para elegir qué ve el especialista
sw = lambda on, label: f'<button type="button" role="switch" aria-checked="{"true" if on else "false"}" aria-label="{label}" style="width: 52px; height: 44px; border: 0; background: none; padding: 0; display: flex; align-items: center"><span style="position: relative; display: block; width: 50px; height: 30px; border-radius: 15px; background: {AZUL if on else "#C7CDD8"}"><span style="position: absolute; top: 3px; {"right: 3px" if on else "left: 3px"}; width: 24px; height: 24px; border-radius: 50%; background: #FFFFFF"></span></span></button>'
item_c = lambda vis, t, s, on: f'<div style="display: flex; align-items: center; gap: 12px; min-height: 60px; border-top: 1px solid {BORDE}">{vis}<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span>{sw(on, t)}</div>'
fondo_rev = barra('Revisar y publicar', 'P-Que.dc.html') + cont(tarjeta_azul(f'<span style="{TIT}; font-size: 22px">Plomería</span><span style="font-size: 14px">Pierde o gotea una canilla</span>'), gap=12).replace('data-c="1" ', '', 1)
guardar_u('H-Compartir.dc.html', 'Compartir de Mi hogar', oscurecer(fondo_rev) + hoja_u(
    texto('Lo ven solo los especialistas de este pedido. Cuando termina, se deja de compartir solo.', 14, SUAVE)
    + item_c(foto_amb('bano', 56, 44, 10), 'Fotos del baño', '4 fotos · sin personas ni papeles', True).replace(f'border-top: 1px solid {BORDE}; ', '', 1)
    + item_c(mosaico_ic('regla', 44, fondo=TINTE, color=AZUL, radio=12, iconsize=20), 'Medidas del baño', '2,10 × 1,80 m · aproximadas', True)
    + item_c(foto_amb('etiqueta', 56, 44, 10), 'Canilla del lavatorio', 'Marca, foto y garantía', True)
    + item_c(mosaico_ic('documento', 44, fondo=TINTE, color=AZUL, radio=12, iconsize=20), 'Informe anterior', 'Reparación del 19/11', False)
    + f'<p style="margin: 0; font-size: 12px; color: {SUAVE}">Tu dirección exacta no va acá: se comparte solo al aceptar una propuesta.</p>'
    + btn('Sumar al pedido', 'P-Revisar.dc.html', 'check'), top=250, titulo_hoja=f'¿Qué {marcador("compartís")}?'))

# H-Compartido: qué se compartió, con quién y para qué pedido; se puede cortar
comp = lambda k, t, s, items, activo=True: tarjeta(
    f'<div style="display: flex; align-items: center; gap: 12px">{avatar(k, 44) if k else mosaico_ic("personas", 44, fondo=TINTE, color=AZUL, radio=14, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span>{chip("Activo" if activo else "Terminado", "check" if activo else "reloj", "exito" if activo else "gris")}</div>'
    + f'<div style="display: flex; flex-wrap: wrap; gap: 6px">{"".join(chip(i, None, "gris") for i in items)}</div>'
    + (btn('Dejar de compartir', None, 'cerrar', 'rojo', chico=True) if activo else ''))
guardar_u('H-Compartido.dc.html', 'Lo que compartiste', barra('Lo que compartiste', 'H-Hogar.dc.html') + cont(
    titulo('Lo que ', 'compartiste', '', size=28, sub='Cada vez que compartís algo de tu casa queda acá. Lo podés cortar cuando quieras.')
    + comp(None, 'Pedido de plomería', 'Lo ven las 4 propuestas · desde hoy', ['Fotos del baño', 'Medidas', 'Canilla del lavatorio'])
    + comp('pablo', 'Pablo Vega · revisión de gas', 'Marzo 2026', ['Calefón', 'Etiqueta'], False)
    + aviso('Nunca compartimos tu ficha con nadie sin que lo elijas, ni la usamos para publicidad.', 'candado', 'gris'), gap=12))

# H-Sumar: sumar un ambiente o un equipo (foto de la etiqueta y lo básico)
guardar_u('H-Sumar.dc.html', 'Sumar a tu casa', barra('Sumar a tu casa', 'H-MiCasa.dc.html') + cont(
    seg([('Ambiente', 'H-Sumar.dc.html'), ('Equipo', 'H-Sumar.dc.html')], 'Equipo', 'Qué sumás')
    + f'<button type="button" style="display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 22px; border: 2px dashed #AEB6C4; background: {GRIS2}; font-family: \'DM Sans\', sans-serif; text-align: left; color: {TINTA}">{mosaico_ic("camara", 52, fondo=AZUL, color="#FFFFFF", radio=16, iconsize=24)}<span style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">Sacale una foto a la etiqueta</strong><span style="font-size: 12px; color: {SUAVE}">Ahí están la marca, el modelo y la potencia</span></span></button>'
    + campo('Qué es', 'Termotanque', ic='caja') + fila_botones(campo('Marca', 'Marca De Prueba'), campo('Modelo', '80 L'))
    + campo('Dónde está', 'Lavadero', ic='pin') + campo('Instalado (aprox.)', '2019', ic='agenda')
    + aviso('Lo que no sepas lo dejás vacío: lo podés completar cuando venga un especialista.', 'info', 'gris'), gap=12)
    + fijo(btn('Guardar en Mi casa', 'H-MiCasa.dc.html', 'check')), alto=900)


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
