# Fila A · Acceso y alta (bienvenida, entrar, código, segunda verificación, datos, zona, avisos, listo).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403


def opcion(ic, titulo_, sub, href, on=False, letra=None):
    dibujo = (f'<span aria-hidden="true" style="width: 44px; height: 44px; flex: none; border-radius: 14px; background: {MOSAICO}; display: flex; align-items: center; justify-content: center; {TIT}; font-size: 20px">{letra}</span>'
              if letra else mosaico_ic(ic, 44, radio=14, iconsize=21))
    borde = f'border: 2px solid {AZUL}; box-shadow: 0 3px 0 {HONDO}' if on else f'border: 1px solid {BORDE}; box-shadow: {ELEV1}'
    marca = f'<span aria-hidden="true" style="width: 24px; height: 24px; border-radius: 50%; background: {AZUL}; display: flex; align-items: center; justify-content: center">{svg(IC["check"], "#FFFFFF", 14, 3)}</span>' if on else svg(IC['flecha'], SUAVE, 18)
    return (f'<a href="{href}"{" aria-current=\"true\"" if on else ""} style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: #FFFFFF; {borde}; color: {TINTA}; text-decoration: none">'
            f'{dibujo}<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><strong style="font-size: 15px">{titulo_}</strong><span style="font-size: 13px; color: {SUAVE}">{sub}</span></span>{marca}</a>')


# A-Bienvenida
guardar_u('A-Bienvenida.dc.html', 'Bienvenida', ciudad() + f'''
  <div style="position: absolute; top: 30px; left: 22px; display: flex; flex-direction: column; gap: 2px"><span style="{TIT}; font-size: 44px; line-height: 1; color: #FFFFFF">Handyx</span><span style="font-size: 12px; font-weight: 700; color: #FFFFFF">Soluciones, no problemas</span></div>
''' + cont(f'''{etiqueta("PARA VECINOS DE MAR DEL PLATA", AZUL)}
<h1 style="margin: 0; {TIT}; font-size: 32px; line-height: 1.04">Arreglos de casa con especialistas {marcador("verificados")}</h1>
{texto("Contás qué pasa, recibís propuestas con precio y elegís vos. Pagás directo al especialista.", 15)}''', top=452, gap=10)
 + fijo(btn('Crear cuenta', 'A-Entrar.dc.html'), btn('Ya tengo cuenta', 'A-Entrar.dc.html', var='contorno')))

# A-Entrar
guardar_u('A-Entrar.dc.html', 'Cómo entrar', barra('Entrar', 'A-Bienvenida.dc.html', sub='Paso 1 de 5') + cont(
    pasos(1, 5) + titulo('¿Cómo querés ', 'entrar', '?', sub='Sin contraseñas: cada vez te mandamos un código.')
    + opcion('sobre', 'Con tu email', 'Código de 6 dígitos', 'A-Codigo.dc.html', on=True)
    + opcion('telefono', 'Con un SMS', 'Al celular que elijas', 'A-Codigo.dc.html')
    + opcion(None, 'Continuar con Google', 'Tu cuenta de Google', 'A-Datos.dc.html', letra='G')
    + opcion('candado', 'Continuar con Apple', 'Tu Apple ID', 'A-Datos.dc.html')
    + campo('Tu email', 'lucia@example.test', ic='sobre', tipo='email'), gap=12)
    + fijo(btn('Mandar el código', 'A-Codigo.dc.html'), nota='Al seguir aceptás los términos y la política de privacidad.'))

# A-Codigo
cajas = ''.join(f'<input aria-label="Dígito {i+1}" value="{d}" readonly style="width: 100%; box-sizing: border-box; height: 60px; border-radius: 16px; border: {"2px solid " + AZUL if i == 4 else "1.5px solid " + BORDE}; text-align: center; {TIT}; font-size: 26px; color: {TINTA}; background: #FFFFFF">' for i, d in enumerate(['4', '8', '1', '2', '', '']))
guardar_u('A-Codigo.dc.html', 'Código', barra('Código', 'A-Entrar.dc.html', sub='Paso 2 de 5') + cont(
    pasos(2, 5) + titulo('Revisá tu ', 'email', '', sub='Mandamos un código de 6 dígitos a lucia@example.test.')
    + f'<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px">{cajas}</div>'
    + f'<button type="button" style="align-self: flex-start; min-height: 44px; padding: 0 4px; border: 0; background: none; color: {AZUL}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">Reenviar el código en 0:42</button>'
    + aviso('El código vence en 10 minutos. Nunca te lo vamos a pedir por teléfono ni por WhatsApp.', 'escudo'))
    + fijo(btn('Verificar', 'A-Datos.dc.html')))

# A-Segunda
guardar_u('A-Segunda.dc.html', 'Segunda verificación', barra('Segunda verificación', 'A-Listo.dc.html') + cont(
    f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("escudo", 64, fondo=TINTE, color=AZUL, radio=20, iconsize=30)}{chip("Opcional", "info", "tinte")}</div>'
    + titulo('Un paso más de ', 'seguridad', '', sub='Si la activás, al entrar te pedimos un segundo código. La podés apagar desde Cuenta.')
    + opcion('candado', 'App autenticadora', 'La más segura · sin señal', 'A-Segunda.dc.html', on=True)
    + opcion('telefono', 'SMS', 'Al 223 555-0100', 'A-Segunda.dc.html')
    + opcion('sobre', 'Email', 'A lucia@example.test', 'A-Segunda.dc.html'), gap=12)
    + fijo(btn('Activar', 'I-Inicio.dc.html'), btn('Ahora no', 'I-Inicio.dc.html', var='contorno')))

# A-Datos
guardar_u('A-Datos.dc.html', 'Tus datos', barra('Tus datos', 'A-Codigo.dc.html', sub='Paso 3 de 5') + cont(
    pasos(3, 5) + titulo('¿Cómo te ', 'llamás', '?', sub='Solo lo justo: tu nombre y un teléfono para coordinar el turno.')
    + fila_botones(campo('Nombre', 'Lucía'), campo('Apellido', 'Ferreyra'))
    + campo('Celular', '223 555-0100', ic='telefono', tipo='tel')
    + aviso('No te pedimos DNI ni CUIT. Tu teléfono lo ve solo el especialista que elijas, cuando se acuerda el turno.', 'candado'))
    + fijo(btn('Seguir', 'A-Zona.dc.html')))

# A-Zona
guardar_u('A-Zona.dc.html', 'Tu zona', barra('Tu zona', 'A-Datos.dc.html', sub='Paso 4 de 5') + mapa(top=64, alto=300, zona=(196, 200, 78))
    + f'  <div style="position: absolute; top: 112px; left: 16px">{chip("La Perla · Mar del Plata", "pin", "blanco")}</div>'
    + cont(pasos(4, 5) + titulo('¿En qué ', 'zona', ' estás?', size=28)
           + campo('Calle y número', 'Calle De Prueba 123', ic='pin')
           + aviso('Los especialistas ven solo la zona aproximada. La dirección exacta se comparte cuando aceptás una propuesta.', 'candado'), top=380, gap=12)
    + fijo(btn('Seguir', 'A-Avisos.dc.html')))

# A-Avisos
guardar_u('A-Avisos.dc.html', 'Avisos', barra('Avisos', 'A-Zona.dc.html', sub='Paso 5 de 5') + cont(
    pasos(5, 5) + f'<div style="display: flex; gap: 12px; align-items: center">{mosaico_ic("campana", 64, fondo=AMARILLO, color=TINTA, radio=20, iconsize=30)}</div>'
    + titulo('¿Te ', 'avisamos', '?', sub='Solo lo que te sirve. Nada de publicidad.')
    + f'<div style="display: flex; flex-direction: column; border-top: 1px solid {BORDE}">'
    + interr('Propuestas nuevas', True, 'Cuando un especialista te responde')
    + interr('Turno y llegada', True, 'El día antes y cuando sale para tu casa')
    + interr('Recordatorios del hogar', True, 'Mantenimientos que conviene hacer')
    + interr('Novedades de Handyx', False, 'Pocas veces al mes') + '</div>', gap=12)
    + fijo(btn('Permitir avisos', 'A-Casa.dc.html'), btn('Ahora no', 'A-Casa.dc.html', var='contorno')))

# A-Casa · onboarding opcional de Mi hogar (se puede saltar y completar después)
guardar_u('A-Casa.dc.html', 'Armá tu casa', f'''  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 330px; background: {AZUL}; border-radius: 0 0 36px 36px; display: flex; align-items: center; justify-content: center">{casa_iso(300, 210, "Tu casa en Handyx (ilustración)").replace('role="img"', 'aria-hidden="true"')}</div>
  <a href="A-Listo.dc.html" style="position: absolute; top: 14px; right: 16px; min-height: 44px; padding: 0 16px; border-radius: 22px; background: rgba(255,255,255,0.18); color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; display: flex; align-items: center">Saltar</a>
''' + cont(titulo('Armá tu ', 'casa', '', size=34, sup='OPCIONAL · 2 MINUTOS', sub='Cargá ambientes y equipos una vez. La próxima vez que algo se rompa, lo elegís y el pedido sale armado.')
           + ''.join(f'<div style="display: flex; gap: 12px; align-items: center">{mosaico_ic(ic, 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}<span style="display: flex; flex-direction: column"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{sub}</span></span></div>'
                     for ic, t, sub in [('casa', 'Ambientes y equipos', 'Con fotos y medidas, a tu ritmo'), ('compartido', 'Compartís sin sacar fotos', 'Elegís qué ve el especialista'), ('candado', 'Es privada', 'Nadie la ve si no la compartís')]), top=350, gap=12)
    + fijo(btn('Empezar', 'A-CasaAmbientes.dc.html', 'flecha'), btn('Más tarde', 'A-Listo.dc.html', var='contorno')))

cont_amb = lambda ic, t, n: (f'<div style="display: flex; align-items: center; gap: 12px; min-height: 60px; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 40, fondo=TINTE, color=AZUL, radio=12, iconsize=19)}<strong style="flex: 1; font-size: 15px">{t}</strong>'
                             f'<span style="display: flex; align-items: center; gap: 6px"><button type="button" aria-label="Uno menos: {t}" style="width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid {BORDE}; background: #FFFFFF; font-size: 20px; font-weight: 800; color: {TINTA}">−</button>'
                             f'<strong style="width: 22px; text-align: center; font-size: 17px">{n}</strong><button type="button" aria-label="Uno más: {t}" style="width: 44px; height: 44px; border-radius: 50%; border: 0; background: {AZUL}; box-shadow: 0 3px 0 {HONDO}; font-size: 20px; font-weight: 800; color: #FFFFFF">+</button></span></div>')
guardar_u('A-CasaAmbientes.dc.html', 'Tu casa: ambientes', barra('Tu casa', 'A-Casa.dc.html', sub='1 de 3 · ambientes') + cont(
    pasos(1, 3) + titulo('¿Qué ', 'ambientes', ' tiene?', size=28, sub='Contá los que tenés. Después les sumás fotos si querés.')
    + seg([('Casa', 'A-CasaAmbientes.dc.html'), ('Depto', 'A-CasaAmbientes.dc.html'), ('PH', 'A-CasaAmbientes.dc.html')], 'Casa', 'Tipo de vivienda')
    + '<div style="display: flex; flex-direction: column">' + cont_amb('ducha', 'Baños', 1).replace(f'border-top: 1px solid {BORDE}; ', '', 1) + cont_amb('cocina', 'Cocina', 1) + cont_amb('sofa', 'Living', 1) + cont_amb('cama', 'Dormitorios', 2) + cont_amb('lavarropas', 'Lavadero', 1) + cont_amb('casa', 'Patio o terraza', 0) + '</div>', gap=12)
    + fijo(btn('Seguir', 'A-CasaEquipos.dc.html')))

eq = lambda ic, t, on: f'<button type="button" aria-pressed="{"true" if on else "false"}" style="display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 14px; border-radius: 999px; border: {"2px solid " + AZUL if on else "1.5px solid " + BORDE}; background: {TINTE if on else "#FFFFFF"}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800; color: {HONDO if on else TINTA}">{svg(IC["check"] if on else IC[ic], AZUL if on else SUAVE, 16, 2.5 if on else 2)}{t}</button>'
grupo_eq = lambda t, items: f'<div style="display: flex; flex-direction: column; gap: 8px">{etiqueta(t)}<div style="display: flex; flex-wrap: wrap; gap: 8px">{"".join(eq(*i) for i in items)}</div></div>'
guardar_u('A-CasaEquipos.dc.html', 'Tu casa: equipos', barra('Tu casa', 'A-CasaAmbientes.dc.html', sub='2 de 3 · equipos') + cont(
    pasos(2, 3) + titulo('¿Qué ', 'equipos', ' tenés?', size=28, sub='Marcá los que hay. Marca y modelo, después (con una foto de la etiqueta).')
    + grupo_eq('COCINA', [('llama', 'Calefón', True), ('llama', 'Anafe a gas', True), ('caja', 'Horno', False)])
    + grupo_eq('BAÑO', [('canilla_ic', 'Canillas', True), ('ducha', 'Ducha', True), ('caja', 'Inodoro', True)])
    + grupo_eq('TODA LA CASA', [('rayo', 'Tablero eléctrico', True), ('aire_ic', 'Aire acond.', True), ('termometro', 'Termotanque', False), ('llave2', 'Cerraduras', False)]), gap=14)
    + fijo(btn('Seguir · 8 equipos', 'A-CasaFotos.dc.html')))

def foto_slot(tipo, t, hecho):
    if hecho:
        vis = foto_amb(tipo, 171, 104, 16)
    else:
        vis = (f'<button type="button" aria-label="Sacar foto: {t}" style="height: 104px; border-radius: 16px; border: 2px dashed #AEB6C4; background: {GRIS2}; display: flex; align-items: center; justify-content: center">'
               + svg(IC['camara'], AZUL, 26) + '</button>')
    marca = svg(IC['check'], EXITO, 14, 3) if hecho else ''
    return f'<div style="display: flex; flex-direction: column; gap: 6px">{vis}<span style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800">{marca}{t}</span></div>'

guardar_u('A-CasaFotos.dc.html', 'Tu casa: fotos', barra('Tu casa', 'A-CasaEquipos.dc.html', sub='3 de 3 · fotos') + cont(
    pasos(3, 3) + titulo('Una ', 'foto', ' por ambiente', size=28, sub='Opcional. Sin personas ni papeles: les sacamos la ubicación antes de guardarlas.')
    + '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">' + foto_slot('bano', 'Baño', True) + foto_slot('cocina', 'Cocina', True) + foto_slot('living', 'Living', False) + foto_slot('dormitorio', 'Dormitorio', False) + '</div>', gap=12)
    + fijo(btn('Guardar mi casa', 'A-Listo.dc.html', 'check'), btn('Lo completo después', 'A-Listo.dc.html', var='contorno')))

# A-Listo
guardar_u('A-Listo.dc.html', 'Cuenta lista', f'''  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 300px; background: {AZUL}; border-radius: 0 0 36px 36px; overflow: hidden">{escena_arreglado(390, 300).replace("¡", "")}</div>
''' + cont(titulo('¡Listo, ', 'Lucía', '!', size=34, sub='Ya podés pedir tu primer arreglo.')
           + tarjeta(f'{etiqueta("TARIFA DE SERVICIO")}<span style="display: flex; align-items: baseline; gap: 8px">{monto("0 %", 34)}<span style="font-size: 14px; font-weight: 700; color: {TEXTO}">hasta el 10/12/2026</span></span>'
                     + texto('Durante la demo no hay tarifa de servicio. Si algo cambia, te avisamos antes. El trabajo lo pagás directo al especialista: Handyx no recibe ni reparte la plata.', 13),
                     franja('Sumar una segunda verificación (opcional)', 'A-Segunda.dc.html')), top=320, gap=12)
    + fijo(btn('Ir al inicio', 'I-Inicio.dc.html')))
print('acceso ok')
