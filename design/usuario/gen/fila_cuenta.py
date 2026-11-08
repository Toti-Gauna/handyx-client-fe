# Fila X · Actividad, cuenta, ayuda y errores (actividad, cuenta, datos y direcciones, seguridad, pagos registrados,
# privacidad, ayuda, respuesta, error, sin conexión, no encontrada).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def tit_raiz(t):
    return f'  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 22px 16px 8px"><h1 style="margin: 0; {TIT}; font-size: 32px">{t}</h1></header>'


# X-Actividad (pantalla raíz)
item = lambda handy, t, s, est, tono, href, extra='': tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_handy(handy, 52) if handy else mosaico_ic("obra", 52, radio=18, iconsize=24)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></span></div><span style="display: flex; gap: 6px; flex-wrap: wrap">{chip(est, "check" if tono == "exito" else ("alerta" if tono == "amarillo" else "reloj"), tono)}{extra}</span>', franja('Ver', href))
guardar_u('X-Actividad.dc.html', 'Actividad', tit_raiz(marcador('Actividad')) + cont(
    seg([('En curso', 'X-Actividad.dc.html'), ('Agenda', 'S-Agendado.dc.html'), ('Historial', 'H-Historial.dc.html')], 'En curso', 'Actividad')
    + item('cano', 'Canilla del baño', 'Julián Ortiz · jue 19/11 · 10 a 12 h', 'Turno confirmado', 'exito', 'S-Agendado.dc.html')
    + item(None, 'Obra · baño completo', 'Día 4 de 6 · Sofía hoy de 9 a 17 h', 'Repuesto para aprobar', 'amarillo', 'O-Obra.dc.html')
    + item('lamparita', 'Tablero eléctrico', 'Publicado ayer · 1 propuesta', 'Presupuesto para revisar', 'tinte', 'M-Presupuesto.dc.html'), top=76, gap=10)
    + barra_u('Actividad'))

# X-Cuenta (cabecera azul)
fila_c = lambda ic, t, s, href: fila_ic(ic, t, s, '', href)
guardar_u('X-Cuenta.dc.html', 'Tu cuenta', f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 18px 16px 22px; background: {AZUL}; border-radius: 0 0 30px 30px; color: #FFFFFF; display: flex; flex-direction: column; gap: 14px">
    <span style="display: flex; justify-content: space-between; align-items: center"><a href="I-Inicio.dc.html" aria-label="Volver" style="width: 48px; height: 48px; border-radius: 16px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a>{etiqueta("TU CUENTA", "#FFFFFF")}<span style="width: 48px"></span></span>
    <span style="display: flex; align-items: center; gap: 14px"><span style="width: 72px; height: 72px; border-radius: 50%; background: {AMARILLO}; color: {TINTA}; box-shadow: 0 0 0 4px rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; {TIT}; font-size: 26px">LF</span><span style="display: flex; flex-direction: column; gap: 4px"><h1 style="margin: 0; {TIT}; font-size: 26px">Lucía Ferreyra</h1><span style="font-size: 13px; font-weight: 700">La Perla · Mar del Plata</span></span></span>
    <span style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{"".join(f'<span style="padding: 10px; border-radius: 16px; background: rgba(255,255,255,0.14); display: flex; flex-direction: column"><strong style="{TIT}; font-size: 20px">{v}</strong><span style="font-size: 12px; font-weight: 700">{t}</span></span>' for v, t in [("3", "trabajos"), ("1", "obra"), ("3/5", "tu camino")])}</span>
  </header>
''' + cont('<div style="display: flex; flex-direction: column">'
           + fila_c('cuenta', 'Tus datos y direcciones', 'Nombre, celular y 2 direcciones', 'X-Datos.dc.html')
           + fila_c('candado', 'Seguridad', 'Segunda verificación activa', 'X-Seguridad.dc.html')
           + fila_c('billete', 'Pagos registrados', 'Sin tarjetas guardadas', 'X-Pagos.dc.html')
           + fila_c('campana', 'Avisos', 'Propuestas, turnos y recordatorios', 'A-Avisos.dc.html')
           + fila_c('escudo', 'Privacidad', 'Tus datos, HandIA y borrar la cuenta', 'X-Privacidad.dc.html')
           + fila_c('ayuda', 'Ayuda', 'Preguntas y Soporte', 'X-Ayuda.dc.html') + '</div>'
           + aviso('Tarifa de servicio: 0 % hasta el 10/12/2026. Si algo cambia, te avisamos antes.', 'billete', 'gris'), top=292, gap=8))

# X-Datos
dir_ = lambda ic, t, s, on: f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 40, radio=12, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></span>{chip("Principal", "check", "tinte") if on else ""}</div>'
guardar_u('X-Datos.dc.html', 'Tus datos', barra('Tus datos', 'X-Cuenta.dc.html') + cont(
    fila_botones(campo('Nombre', 'Lucía'), campo('Apellido', 'Ferreyra')) + campo('Celular', '223 555-0100', ic='telefono', tipo='tel') + campo('Email', 'lucia@example.test', ic='sobre', tipo='email')
    + tarjeta(etiqueta('DIRECCIONES') + dir_('casa', 'Casa', 'Calle De Prueba 123 · La Perla', True) + dir_('edificio', 'Trabajo', 'Calle De Prueba 456 · Centro', False), franja('Sumar una dirección', 'A-Zona.dc.html'))
    + aviso('Sin DNI ni CUIT. La dirección exacta la ve solo el especialista que elegís.', 'candado', 'gris'), gap=10)
    + fijo(btn('Guardar', 'X-Cuenta.dc.html')))

# X-Seguridad
ses = lambda ic, t, s, actual: f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 40, radio=12, iconsize=20)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></span>{chip("Este", "check", "exito") if actual else ""}</div>'
guardar_u('X-Seguridad.dc.html', 'Seguridad', barra('Seguridad', 'X-Cuenta.dc.html') + cont(
    tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("escudo", 48, fondo="#E3F4EA", color="#137140", radio=16, iconsize=24)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 16px">Segunda verificación</strong><span style="font-size: 13px; color: {SUAVE}">App autenticadora · activa</span></span></div>', franja('Cambiar o apagar', 'A-Segunda.dc.html'))
    + tarjeta(etiqueta('SESIONES ABIERTAS') + ses('telefono', 'Este celular', 'Mar del Plata · ahora', True) + ses('grafico', 'Computadora', 'Navegador · hace 3 días', False))
    + aviso('Entrás siempre con un código: no hay contraseñas que se puedan filtrar.', 'candado', 'gris'), gap=12)
    + fijo(btn('Cerrar las otras sesiones', None, 'cerrar', 'rojo')))

# X-Pagos
pago = lambda t, s, m, est, tono: f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}"><span style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 3px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span>{chip(est, "check" if tono == "exito" else "reloj", tono)}</span><strong style="{TIT}; font-size: 16px; white-space: nowrap">{m}</strong></div>'
guardar_u('X-Pagos.dc.html', 'Pagos registrados', barra('Pagos registrados', 'X-Cuenta.dc.html') + cont(
    aviso('No guardamos tarjetas. Le pagás directo a cada especialista por Mercado Pago o en efectivo.', 'billete', 'gris')
    + tarjeta(pago('Canilla del baño', 'Julián Ortiz · efectivo · 19/11', '$ 54.500', 'Informado · sin confirmar', 'tinte')
              + pago('Obra · etapa 2', 'Diego Herrera · Mercado Pago · 16/11', '$ 220.000', 'Verificado', 'exito')
              + pago('Obra · etapa 1', 'Julián Ortiz · Mercado Pago · 13/11', '$ 180.000', 'Verificado', 'exito')
              + pago('Revisión de gas', 'Pablo Vega · efectivo · mar', '$ 32.000', 'Verificado', 'exito'))
    + aviso('Informado no es verificado: se verifica cuando el especialista lo confirma o llega el aviso de Mercado Pago.', 'info', 'gris'), gap=10))

# X-Privacidad
guardar_u('X-Privacidad.dc.html', 'Privacidad', barra('Privacidad', 'X-Cuenta.dc.html') + cont(
    tarjeta(f'<div style="display: flex; align-items: center; gap: 12px">{handia_avatar(44)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">HandIA y tus datos</strong><span style="font-size: 13px; color: {SUAVE}">Funciona en tu celular, sin IA externa. Saca teléfonos, emails y documentos antes de procesar.</span></span></div>')
    + f'<div style="display: flex; flex-direction: column; border-top: 1px solid {BORDE}">'
    + interr('Compartir medidas y modelo 3D', True, 'Solo con quien elijas, por pedido')
    + interr('Recordatorios del hogar', True, 'Usan tu ficha de la casa') + '</div>'
    + fila_ic('documento', 'Descargar mis datos', 'Un archivo con todo lo tuyo', '', 'X-Privacidad.dc.html')
    + fila_ic('lista', 'Políticas y textos', 'Términos y privacidad', '', 'X-Ayuda.dc.html'), gap=10)
    + fijo(btn('Borrar mi cuenta', None, 'cerrar', 'rojo'), nota='Se borra todo salvo lo que la ley obliga a guardar.'))

# X-Ayuda (cabecera azul)
tema = lambda ic, t: f'<a href="X-Respuesta.dc.html" style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 6px; border-radius: 20px; background: {MOSAICO}; box-shadow: 0 4px 0 #D3D6DC; color: {TINTA}; font-size: 13px; font-weight: 800; text-decoration: none">{svg(IC[ic], AZUL, 24)}{t}</a>'
preg = lambda t, abierta=False, r='': f'<details{" open" if abierta else ""} style="border-top: 1px solid {BORDE}"><summary style="min-height: 52px; display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 800; cursor: pointer">{t}</summary>{f"<p style=\"margin: 0 0 12px; font-size: 14px; line-height: 1.45; color: {TEXTO}\">{r}</p>" if r else ""}</details>'
guardar_u('X-Ayuda.dc.html', 'Ayuda', f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 18px 16px 22px; background: {AZUL}; border-radius: 0 0 30px 30px; color: #FFFFFF; display: flex; flex-direction: column; gap: 12px">
    <span style="display: flex; align-items: center; gap: 12px"><a href="X-Cuenta.dc.html" aria-label="Volver" style="width: 48px; height: 48px; border-radius: 16px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center">{svg(IC['atras'], '#FFFFFF', 22)}</a><h1 style="margin: 0; {TIT}; font-size: 25px; line-height: 1.05">¿En qué te ayudamos?</h1></span>
    <label style="display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 16px; border-radius: 16px; background: #FFFFFF">{svg(IC['lupa'], SUAVE, 20)}<span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Buscar en la ayuda</span><input readonly placeholder="Buscar: pago, turno, garantía…" style="flex: 1; height: 48px; border: 0; background: none; font-family: 'DM Sans', sans-serif; font-size: 15px"></label>
  </header>
''' + cont('<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">' + tema('caja', 'Pedir') + tema('billete', 'Propuestas') + tema('efectivo', 'Pagos') + tema('agenda', 'Turnos') + tema('hogar', 'Mi hogar') + tema('cuenta', 'Cuenta') + '</div>'
           + '<div style="display: flex; flex-direction: column">' + preg('¿Quién recibe mi pago?', True, 'Siempre el especialista, directo. Handyx no recibe ni reparte la plata.') + preg('¿Puedo cambiar el horario?') + preg('¿Qué cubre la garantía?') + '</div>', top=170, gap=12)
    + fijo(btn('Escribirle a Soporte', 'M-Soporte.dc.html', 'chat', 'contorno')))

# X-Respuesta
guardar_u('X-Respuesta.dc.html', 'Respuesta de ayuda', barra('Pagos', 'X-Ayuda.dc.html') + cont(
    titulo('¿Quién recibe mi ', 'pago', '?', size=28)
    + texto('Le pagás directo al especialista: por Mercado Pago (con su cobro) o en efectivo, cuando termina el trabajo y das la conformidad. Handyx no recibe ni reparte la plata, y no guarda tarjetas.', 15)
    + texto('Si pagás en efectivo, lo informás en la app y el especialista confirma que lo recibió. Informado no es verificado: se verifica con su confirmación o con el aviso de Mercado Pago.', 15)
    + tarjeta(f'<strong style="font-size: 15px">¿Te sirvió?</strong>' + fila_botones(btn('Sí', None, 'pulgar', 'gris', chico=True), btn('No', None, None, 'gris', chico=True))), gap=12)
    + fijo(btn('Escribirle a Soporte', 'M-Soporte.dc.html', 'chat', 'contorno')))


def error(nombre_, handy, t, marcado, sub, b1, b2=None, ic=None):
    dib = img(handy, 150, 170) if handy else mosaico_ic(ic, 120, fondo=MOSAICO, color=TINTA, radio=36, iconsize=56)
    botones = [btn(*b1)] + ([btn(*b2)] if b2 else [])
    guardar_u(nombre_, t + marcado, cont(f'<div style="display: flex; justify-content: center; padding: 60px 0 10px">{dib}</div>' + titulo(t, marcado, '', size=34, sub=sub), top=40, gap=12) + fijo(*botones))


error('X-Error.dc.html', 'lamparita_rota', 'Algo se ', 'rompió', 'No pudimos cargar esto. No se perdió nada de lo que hiciste. Probá de nuevo en un rato.', ('Reintentar', 'I-Inicio.dc.html', 'flechas'), ('Escribirle a Soporte', 'M-Soporte.dc.html', None, 'contorno'))
error('X-SinConexion.dc.html', None, 'Estás sin ', 'conexión', 'No se mandó nada. Cuando vuelva la señal, revisá que tu mensaje o tu pedido se hayan enviado.', ('Reintentar', 'I-Inicio.dc.html', 'flechas'), ic='wifi')
error('X-NoEncontrado.dc.html', 'llave_rota', 'No encontramos esta ', 'página', 'Puede que el enlace esté viejo o que ya no tengas acceso.', ('Ir al inicio', 'I-Inicio.dc.html'))
print('cuenta ok')
