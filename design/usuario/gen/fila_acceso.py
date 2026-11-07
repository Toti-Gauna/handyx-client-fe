# Fila A · Acceso y alta (bienvenida, invitación, entrar, código, segunda verificación, datos, zona, avisos, listo).
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
 + fijo(btn('Crear cuenta', 'A-Invitacion.dc.html'), btn('Ya tengo cuenta', 'A-Entrar.dc.html', var='contorno')))

# A-Invitacion
guardar_u('A-Invitacion.dc.html', 'Invitación', barra('Crear cuenta', 'A-Bienvenida.dc.html', sub='Paso 1 de 6') + cont(
    pasos(1, 6) + titulo('Tu ', 'invitación', '', sub='Handyx está en demo cerrada: entrás con el código que te mandaron.')
    + campo('Código de invitación', 'HX-PRUEBA-24', ic='ticket')
    + aviso('¿No tenés código? Anotate en la lista de espera desde handyc.com y te avisamos cuando haya lugar.', 'info')
    + f'<div style="display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 20px; background: {MOSAICO}">{img("grupo", 120, 70)}<span style="font-size: 13px; line-height: 1.4; color: {TEXTO}">Los Handys te acompañan en cada paso. Empezamos con seis rubros en Mar del Plata.</span></div>')
    + fijo(btn('Seguir', 'A-Entrar.dc.html')))

# A-Entrar
guardar_u('A-Entrar.dc.html', 'Cómo entrar', barra('Entrar', 'A-Invitacion.dc.html', sub='Paso 2 de 6') + cont(
    pasos(2, 6) + titulo('¿Cómo querés ', 'entrar', '?', sub='Sin contraseñas: cada vez te mandamos un código.')
    + opcion('sobre', 'Con tu email', 'Código de 6 dígitos', 'A-Codigo.dc.html', on=True)
    + opcion('telefono', 'Con un SMS', 'Al celular que elijas', 'A-Codigo.dc.html')
    + opcion(None, 'Continuar con Google', 'Tu cuenta de Google', 'A-Datos.dc.html', letra='G')
    + opcion('candado', 'Continuar con Apple', 'Tu Apple ID', 'A-Datos.dc.html')
    + campo('Tu email', 'lucia@example.test', ic='sobre', tipo='email'), gap=12)
    + fijo(btn('Mandar el código', 'A-Codigo.dc.html'), nota='Al seguir aceptás los términos y la política de privacidad.'))

# A-Codigo
cajas = ''.join(f'<input aria-label="Dígito {i+1}" value="{d}" readonly style="width: 100%; box-sizing: border-box; height: 60px; border-radius: 16px; border: {"2px solid " + AZUL if i == 4 else "1.5px solid " + BORDE}; text-align: center; {TIT}; font-size: 26px; color: {TINTA}; background: #FFFFFF">' for i, d in enumerate(['4', '8', '1', '2', '', '']))
guardar_u('A-Codigo.dc.html', 'Código', barra('Código', 'A-Entrar.dc.html', sub='Paso 2 de 6') + cont(
    pasos(2, 6) + titulo('Revisá tu ', 'email', '', sub='Mandamos un código de 6 dígitos a lucia@example.test.')
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
guardar_u('A-Datos.dc.html', 'Tus datos', barra('Tus datos', 'A-Codigo.dc.html', sub='Paso 3 de 6') + cont(
    pasos(3, 6) + titulo('¿Cómo te ', 'llamás', '?', sub='Solo lo justo: tu nombre y un teléfono para coordinar el turno.')
    + fila_botones(campo('Nombre', 'Lucía'), campo('Apellido', 'Ferreyra'))
    + campo('Celular', '223 555-0100', ic='telefono', tipo='tel')
    + aviso('No te pedimos DNI ni CUIT. Tu teléfono lo ve solo el especialista que elijas, cuando se acuerda el turno.', 'candado'))
    + fijo(btn('Seguir', 'A-Zona.dc.html')))

# A-Zona
guardar_u('A-Zona.dc.html', 'Tu zona', barra('Tu zona', 'A-Datos.dc.html', sub='Paso 4 de 6') + mapa(top=64, alto=300, zona=(196, 200, 78))
    + f'  <div style="position: absolute; top: 112px; left: 16px">{chip("La Perla · Mar del Plata", "pin", "blanco")}</div>'
    + cont(pasos(4, 6) + titulo('¿En qué ', 'zona', ' estás?', size=28)
           + campo('Calle y número', 'Calle De Prueba 123', ic='pin')
           + aviso('Los especialistas ven solo la zona aproximada. La dirección exacta se comparte cuando aceptás una propuesta.', 'candado'), top=380, gap=12)
    + fijo(btn('Seguir', 'A-Avisos.dc.html')))

# A-Avisos
guardar_u('A-Avisos.dc.html', 'Avisos', barra('Avisos', 'A-Zona.dc.html', sub='Paso 5 de 6') + cont(
    pasos(5, 6) + f'<div style="display: flex; gap: 12px; align-items: center">{mosaico_ic("campana", 64, fondo=AMARILLO, color=TINTA, radio=20, iconsize=30)}</div>'
    + titulo('¿Te ', 'avisamos', '?', sub='Solo lo que te sirve. Nada de publicidad.')
    + f'<div style="display: flex; flex-direction: column; border-top: 1px solid {BORDE}">'
    + interr('Propuestas nuevas', True, 'Cuando un especialista te responde')
    + interr('Turno y llegada', True, 'El día antes y cuando sale para tu casa')
    + interr('Recordatorios del hogar', True, 'Mantenimientos que conviene hacer')
    + interr('Novedades de Handyx', False, 'Pocas veces al mes') + '</div>', gap=12)
    + fijo(btn('Permitir avisos', 'A-Listo.dc.html'), btn('Ahora no', 'A-Listo.dc.html', var='contorno')))

# A-Listo
guardar_u('A-Listo.dc.html', 'Cuenta lista', f'''  <div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: 300px; background: {AZUL}; border-radius: 0 0 36px 36px; display: flex; align-items: flex-end; justify-content: center">{img("grupo", 300, 200, "margin-bottom: 26px")}</div>
''' + cont(pasos(6, 6) + titulo('¡Listo, ', 'Lucía', '!', size=34, sub='Ya podés pedir tu primer arreglo.')
           + tarjeta(f'{etiqueta("TARIFA DE SERVICIO")}<span style="display: flex; align-items: baseline; gap: 8px">{monto("0 %", 34)}<span style="font-size: 14px; font-weight: 700; color: {TEXTO}">hasta el 10/12/2026</span></span>'
                     + texto('Durante la demo no hay tarifa de servicio. Si algo cambia, te avisamos antes. El trabajo lo pagás directo al especialista: Handyx no recibe ni reparte la plata.', 13),
                     franja('Sumar una segunda verificación (opcional)', 'A-Segunda.dc.html')), top=320, gap=12)
    + fijo(btn('Ir al inicio', 'I-Inicio.dc.html')))
print('acceso ok')
