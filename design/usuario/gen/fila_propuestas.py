# Fila C · Recibir y comparar propuestas (buscando, propuestas, comparar, detalle, certificados, cambios, aceptar, aceptada).
import sys
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403

ORIENTATIVO = f'<section style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 16px; background: {MOSAICO}">{svg(IC["grafico"], TINTA, 20)}<span style="flex: 1; font-size: 13px; line-height: 1.35">Orientativo de Handyx: <strong>$ 38.000 a $ 52.000</strong>. Sugiere, no impone.</span></section>'


def resenas(n, trabajos):
    return f'<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: {TEXTO}">{svg(IC["estrella"], NARANJA, 15)}<strong>{n}</strong> · {trabajos} trabajos</span>'


def propuesta(k, precio, fecha, extras, verifs, nres, ntr, href='C-Detalle.dc.html', nueva=False):
    ch = ''.join(verificado(v) for v in verifs)
    nv = chip('Nueva', None, 'amarillo') if nueva else ''
    return tarjeta(
        f'<div style="display: flex; align-items: center; gap: 12px">{avatar(k, 48)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 16px">{nombre(k)}</strong>{resenas(nres, ntr)}</span>{nv}</div>'
        f'<div style="display: flex; flex-wrap: wrap; gap: 6px">{ch}</div>'
        f'<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 10px"><span style="display: flex; flex-direction: column; gap: 4px">{monto(precio, 30)}<span style="font-size: 13px; color: {SUAVE}">{extras}</span></span>{chip(fecha, "agenda", "tinte")}</div>',
        franja('Ver la propuesta', href))


# C-Buscando
guardar_u('C-Buscando.dc.html', 'Tu pedido', mapa(top=0, alto=520, zona=(196, 260, 92)) + barra('Tu pedido', 'I-Inicio.dc.html', sub='Plomería · jue 19/11')
          + hoja(f'''<div data-c="1" style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; align-items: center; gap: 12px">{mosaico_handy("cano", 56)}<span style="flex: 1; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 17px">Canilla que gotea</strong><span style="font-size: 13px; color: {SUAVE}">Publicado hoy 09:52 · La Perla</span></span>{chip("Con propuestas", "check", "exito")}</div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: {TINTE}">{avatares(["julian", "diego", "sofia"], 34)}<span style="flex: 1; font-size: 14px; color: {HONDO}"><strong>3 propuestas</strong> llegaron. Podés esperar más o elegir ahora.</span></div>
    {aviso("Tu dirección exacta todavía no se compartió con nadie.", "candado", "gris")}
    {btn("Ver las propuestas", "C-Propuestas.dc.html")}
    {btn("Editar o cancelar el pedido", "C-Buscando.dc.html", var="contorno")}</div>''', top=440))

# ── Piezas de propuestas ──────────────────────────────────────────────────────────────────────────
ORIENT = tarjeta_noche(f'<div style="display: flex; align-items: center; gap: 12px">{mosaico_ic("grafico", 40, fondo="rgba(255,255,255,0.12)", color=AMARILLO, radio=12, iconsize=19)}'
                       f'<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">ORIENTATIVO DE HANDYX</span>'
                       f'<strong style="font-size: 17px; white-space: nowrap">$ 38.000 a $ 52.000</strong><span style="font-size: 12px; color: #C9D3E6">Sugiere, no impone: cada uno pone su precio.</span></span></div>')


def estrellas(n, trabajos, color=TEXTO):
    return f'<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: {color}; white-space: nowrap">{svg(IC["estrella_llena"], NARANJA, 15)}<strong>{n}</strong> · {trabajos} trabajos</span>'


def dato_mini(ic, t, v):
    return (f'<span style="display: flex; flex-direction: column; gap: 3px; padding: 10px; border-radius: 14px; background: {GRIS2}; min-width: 0">'
            f'<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; color: {SUAVE}">{svg(IC[ic], AZUL, 14)}{t}</span><strong style="font-size: 13px; line-height: 1.2">{v}</strong></span>')


def acciones_prop(perfil='C-Certificados.dc.html', aceptar='C-Aceptar.dc.html', rechazar='C-Rechazar.dc.html', texto_ok='Aceptar'):
    b = lambda h, t, ic, est, label='': (f'<a href="{h}"{f" aria-label={chr(34)}{label}{chr(34)}" if label else ""} style="display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; border-radius: 14px; font-size: 14px; font-weight: 800; text-decoration: none; {est}">{ic}{t}</a>')
    return (f'<div style="display: grid; grid-template-columns: 48px minmax(0, 1fr) minmax(0, 1.25fr); gap: 8px">'
            + b(rechazar, '', svg(IC['cerrar'], ROJO, 20, 2.5), f'background: #FFFFFF; border: 2px solid {ROJO}', 'Rechazar')
            + b(perfil, 'Ver perfil', svg(IC['cuenta'], AZUL, 18), f'background: #FFFFFF; color: {AZUL}; border: 2px solid {AZUL}')
            + b(aceptar, texto_ok, svg(IC['check'], '#FFFFFF', 18, 3), f'background: {AZUL}; color: #FFFFFF; box-shadow: 0 4px 0 {HONDO}') + '</div>')


def prop_card(k, precio, sub_precio, fecha, datos, verifs, nres, ntr, marca='', detalle='C-Detalle.dc.html', tipo='Propuesta', acc=None):
    v = ''.join(chip(t, 'escudo', 'exito') for t in verifs)
    cab = (f'<div style="display: flex; align-items: center; gap: 12px">{avatar(k, 50)}'
           f'<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px"><strong style="font-size: 17px">{nombre(k)}</strong>{estrellas(nres, ntr)}</span>{marca}</div>')
    precio_h = (f'<a href="{detalle}" aria-label="Ver el detalle de {nombre(k).split()[0]}" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; padding: 14px; border-radius: 18px; background: {TINTE}; color: {TINTA}; text-decoration: none">'
                f'<span style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; color: {HONDO}">{tipo.upper()}</span>{monto(precio, 32)}<span style="font-size: 12px; color: {HONDO}">{sub_precio}</span></span>'
                f'<span style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px">{chip(fecha, "agenda", "blanco")}<span style="display: inline-flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 800; color: {AZUL}">Detalle{svg(IC["flecha"], AZUL, 15)}</span></span></a>')
    mini = '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px">' + ''.join(dato_mini(*d) for d in datos) + '</div>'
    return (f'<section style="padding: 16px; border-radius: 26px; background: #FFFFFF; border: 1px solid {BORDE}; box-shadow: 0 2px 6px rgba(14,29,54,0.06), 0 18px 34px -24px rgba(14,29,54,0.45); display: flex; flex-direction: column; gap: 12px">'
            f'{cab}{precio_h}{mini}<div style="display: flex; flex-wrap: wrap; gap: 6px">{v}</div>{acc or acciones_prop()}</section>')


MEJOR = f'<a href="C-Comparar.dc.html" style="display: inline-flex; align-items: center; gap: 5px; min-height: 44px; padding: 0 12px; border-radius: 999px; background: {AMARILLO}; color: {TINTA}; font-size: 12px; font-weight: 800; text-decoration: none; white-space: nowrap">{svg(IC["trofeo"], TINTA, 14)}Mejor promedio</a>'

# C-Propuestas (lista con jerarquía y acciones en cada tarjeta)
guardar_u('C-Propuestas.dc.html', 'Propuestas', barra('Propuestas', 'C-Buscando.dc.html', accion_icono('columnas', 'Comparar lado a lado', 'C-Comparar.dc.html'), sub='Plomería · 4 propuestas') + cont(
    ORIENT
    + f'<div style="display: flex; align-items: center; justify-content: space-between"><span style="{TIT}; font-size: 22px">4 {marcador("propuestas")}</span><span style="font-size: 12px; color: {SUAVE}">En el orden en que llegaron</span></div>'
    + prop_card('julian', '$ 45.000', 'Materiales incluidos', 'Jue 19 · 10 a 12 h', [('reloj', 'Dura', '1 a 2 h'), ('escudo', 'Garantía', '90 días'), ('personas', 'Equipo', 'Va solo')], ['Identidad', 'Antecedentes'], '4,9', 23, MEJOR)
    + prop_card('diego', '$ 41.000', 'Materiales aparte (≈ $ 6.000)', 'Vie 20 · 14 a 16 h', [('reloj', 'Dura', '2 h'), ('escudo', 'Garantía', '60 días'), ('personas', 'Equipo', 'Va solo')], ['Identidad'], '4,7', 11, chip('Nueva', None, 'amarillo'))
    + prop_card('sofia', '$ 49.500', 'Materiales incluidos', 'Jue 19 · 16 a 18 h', [('reloj', 'Dura', '2 a 3 h'), ('escudo', 'Garantía', '120 días'), ('personas', 'Equipo', '2 personas')], ['Identidad', 'Antecedentes'], '5,0', 6)
    + prop_card('martin', '$ 8.000', 'Visita para ver y presupuestar', 'Mié 18 · 9 a 10 h', [('reloj', 'Dura', '30 min'), ('billete', 'Trabajo', 'A presupuestar'), ('ojo', 'Antes', 'Quiere ver')], ['Identidad'], '4,8', 31, chip('Consulta', 'ojo', 'tinte'), 'C-Visita.dc.html', 'Visita', acciones_prop(aceptar='C-Visita.dc.html', texto_ok='Ver visita'))
    + aviso('Aceptar una cierra las demás. Rechazar no se le explica a nadie si no querés.', 'info', 'gris'), gap=14)
    + fijo(btn('Comparar lado a lado', 'C-Comparar.dc.html', 'columnas', 'contorno')), alto=1900)

# C-Comparar (con «La mejor en perfil y precio» por promedio, no por elección)
ganadora = tarjeta_amarilla(
    f'<div style="display: flex; align-items: center; gap: 12px">{avatar("julian", 48)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; letter-spacing: 1.2px">{svg(IC["trofeo"], TINTA, 14)}LA MEJOR EN PERFIL Y PRECIO</span><strong style="{TIT}; font-size: 20px">Julián Ortiz</strong></span><span style="display: flex; flex-direction: column; align-items: flex-end">{monto("8,7", 28)}<span style="font-size: 11px; font-weight: 800">de 10</span></span></div>'
    f'<span style="font-size: 14px; line-height: 1.4">Buen precio con materiales incluidos, las mejores reseñas y las dos verificaciones.</span>'
    f'<span style="font-size: 12px; line-height: 1.35">Sale de un promedio con las mismas reglas para todas. Elegís vos.</span>')
cols = [('julian', '$ 45.000', 'Jue 19<br>10 a 12 h', 'Incluidos', '90 días', '2', '4,9 · 23', '8,7'),
        ('diego', '$ 41.000', 'Vie 20<br>14 a 16 h', 'Aparte', '60 días', '1', '4,7 · 11', '7,4'),
        ('sofia', '$ 49.500', 'Jue 19<br>16 a 18 h', 'Incluidos', '120 días', '2', '5,0 · 6', '8,1')]
filas_c = ['Promedio', 'Precio', 'Fecha', 'Materiales', 'Garantía', 'Verificaciones', 'Reseñas']
idx = {'Promedio': 7, 'Precio': 1, 'Fecha': 2, 'Materiales': 3, 'Garantía': 4, 'Verificaciones': 5, 'Reseñas': 6}
cab = (f'<th scope="col" style="width: 84px"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Dato</span></th>'
       + ''.join(f'<th scope="col" style="padding: 8px 4px; vertical-align: bottom; {"background: #FBFBD2; border-radius: 16px 16px 0 0" if i == 0 else ""}"><span style="display: flex; flex-direction: column; align-items: center; gap: 4px">{avatar(c[0], 36)}<span style="font-size: 12px; font-weight: 800">{nombre(c[0]).split()[0]}</span></span></th>' for i, c in enumerate(cols)))
cuerpo_t = ''.join('<tr>' + f'<th scope="row" style="padding: 11px 6px 11px 0; text-align: left; font-size: 12px; font-weight: 800; color: {SUAVE}; border-top: 1px solid {BORDE}">{t}</th>'
                   + ''.join(f'<td style="padding: 11px 4px; text-align: center; border-top: 1px solid {BORDE}; font-size: {18 if t == "Promedio" else (13 if t == "Precio" else 13)}px; white-space: nowrap; font-weight: {900 if t in ("Precio", "Promedio") else 600}; {TIT if t in ("Precio", "Promedio") else ""}; {"background: #FBFBD2" if i == 0 else ""}">{c[idx[t]]}</td>' for i, c in enumerate(cols)) + '</tr>' for t in filas_c)
pie = '<tr><td></td>' + ''.join(f'<td style="padding: 10px 3px 0; {"background: #FBFBD2; border-radius: 0 0 16px 16px; padding-bottom: 8px" if i == 0 else ""}"><a href="C-Detalle.dc.html" style="display: flex; align-items: center; justify-content: center; min-height: 44px; border-radius: 12px; background: {AZUL if i == 0 else TINTE}; color: {"#FFFFFF" if i == 0 else HONDO}; font-size: 13px; font-weight: 800; text-decoration: none">Ver</a></td>' for i, c in enumerate(cols)) + '</tr>'
guardar_u('C-Comparar.dc.html', 'Comparar propuestas', barra('Comparar', 'C-Propuestas.dc.html', sub='Plomería · 3 con precio') + cont(
    ganadora
    + f'<table style="width: 100%; border-collapse: collapse; table-layout: fixed"><caption style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Propuestas lado a lado</caption><thead><tr>{cab}</tr></thead><tbody>{cuerpo_t}{pie}</tbody></table>'
    + aviso('La visita de Martín no entra en la comparación: todavía no tiene precio del trabajo.', 'info', 'gris'), gap=14), alto=900)

# C-Detalle (más información para decidir antes de contactar)
incluye = ''.join(f'<li style="display: flex; gap: 8px; align-items: flex-start; font-size: 14px">{svg(IC["check"], EXITO, 18, 3)}<span>{t}</span></li>' for t in ['Cambio del cuerito y del vástago', 'Cartucho cerámico si hace falta', 'Prueba de pérdidas al terminar', 'Retiro de lo que se cambia'])
no_incluye = ''.join(f'<li style="display: flex; gap: 8px; align-items: flex-start; font-size: 14px; color: {TEXTO}">{svg(IC["cerrar"], ROJO, 18, 2.5)}<span>{t}</span></li>' for t in ['Cambiar la grifería completa', 'Arreglos de pared o cerámica'])
guardar_u('C-Detalle.dc.html', 'Propuesta de Julián', barra('Propuesta', 'C-Propuestas.dc.html', accion_icono('chat', 'Escribirle a Julián', 'M-Chat.dc.html')) + cont(
    f'<div style="display: flex; align-items: center; gap: 14px">{avatar("julian", 64)}<span style="flex: 1; display: flex; flex-direction: column; gap: 5px"><span style="{TIT}; font-size: 22px">Julián Ortiz</span>{estrellas("4,9", 23)}<span style="display: flex; flex-wrap: wrap; gap: 6px">{chip("Identidad", "escudo", "exito")}{chip("Antecedentes", "escudo", "exito")}</span></span></div>'
    + f'<a href="C-Certificados.dc.html" style="display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; border-radius: 14px; background: {TINTE}; color: {HONDO}; font-size: 14px; font-weight: 800; text-decoration: none">{svg(IC["cuenta"], AZUL, 18)}Ver perfil, trabajos y reseñas</a>'
    + tarjeta_azul(f'<span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">PRECIO DE JULIÁN</span>{monto("$ 45.000", 42, "#FFFFFF")}'
                   f'<span style="display: flex; flex-wrap: wrap; gap: 6px">{chip("Dentro del orientativo", "check", "amarillo")}{chip("Materiales incluidos", "caja", "blanco")}</span>'
                   f'<span style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700">{svg(IC["agenda"], "#FFFFFF", 18)}Jue 19/11 · 10 a 12 h · tu horario</span>')
    + tarjeta(etiqueta('CÓMO LO HACE')
              + dato_fila('caja', 'Materiales', 'Cuerito, vástago y cartucho', 'Marca FV o similar · los lleva él').replace(f'border-top: 1px solid {BORDE}; ', '', 1)
              + dato_fila('personas', 'Equipo', 'Va solo', 'Sin ayudantes')
              + dato_fila('reloj', 'Duración', '1 a 2 horas, en un día', 'Cortás el agua solo ese rato')
              + dato_fila('escudo', 'Garantía', '90 días', 'Sobre lo que cambia y la mano de obra')
              + dato_fila('ojo', 'Visita previa', 'No hace falta', 'Con tus fotos le alcanza'))
    + tarjeta(f'{etiqueta("QUÉ INCLUYE")}<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px">{incluye}</ul>'
              f'<div style="height: 1px; background: {BORDE}"></div>{etiqueta("NO INCLUYE")}<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px">{no_incluye}</ul>')
    + f'<blockquote style="margin: 0; padding: 14px 16px; border-radius: 18px; background: {GRIS2}; border-left: 4px solid {AZUL}; font-size: 14px; line-height: 1.45">«Vi tus fotos: es el cuerito o el cartucho. Llevo los dos para resolverlo en la visita.»<span style="display: block; margin-top: 6px; font-size: 12px; font-weight: 800; color: {SUAVE}">Julián, con la propuesta</span></blockquote>', gap=12)
    + fijo(btn('Aceptar esta propuesta', 'C-Aceptar.dc.html', 'check'), fila_botones(btn('Pedir cambios', 'C-Cambios.dc.html', 'editar', 'contorno', chico=True), btn('Rechazar', 'C-Rechazar.dc.html', 'cerrar', 'rojo', chico=True))), alto=1420)

# C-Visita (cuando es solo una consulta: lo que se sabe y lo que no)
guardar_u('C-Visita.dc.html', 'Visita de Martín', barra('Visita para presupuestar', 'C-Propuestas.dc.html', accion_icono('chat', 'Escribirle a Martín', 'M-Chat.dc.html')) + cont(
    f'<div style="display: flex; align-items: center; gap: 14px">{avatar("martin", 56)}<span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="{TIT}; font-size: 20px">Martín Sosa</span>{estrellas("4,8", 31)}{chip("Identidad", "escudo", "exito")}</span></div>'
    + tarjeta_noche(f'<span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">ES UNA CONSULTA</span><span style="font-size: 15px; line-height: 1.4">Martín quiere ver la canilla antes de darte un precio del trabajo.</span>'
                    f'<span style="display: flex; align-items: baseline; gap: 8px">{monto("$ 8.000", 30, "#FFFFFF")}<span style="font-size: 13px; color: #C9D3E6">la visita · se descuenta si después lo contratás</span></span>')
    + tarjeta(etiqueta('LO QUE YA SABEMOS')
              + dato_fila('agenda', 'Visita', 'Mié 18/11 · 9 a 10 h').replace(f'border-top: 1px solid {BORDE}; ', '', 1)
              + dato_fila('reloj', 'Dura', 'Unos 30 minutos')
              + dato_fila('personas', 'Equipo', 'Va solo'))
    + tarjeta(etiqueta('LO QUE DEFINE EN LA VISITA')
              + ''.join(f'<div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px">{svg(IC["reloj"], SUAVE, 18)}<span style="flex: 1">{t}</span>{chip("A definir", None, "gris")}</div>' for t in ['Precio del trabajo', 'Materiales', 'Duración y garantía']))
    + aviso('Después de la visita te manda la propuesta del trabajo y decidís igual que con las demás.', 'info', 'gris'), gap=12)
    + fijo(btn('Aceptar la visita', 'C-Aceptar.dc.html', 'check'), btn('Rechazar', 'C-Rechazar.dc.html', 'cerrar', 'rojo', chico=True)), alto=1020)


def fondo_detalle():
    """La propuesta de atrás (para las hojas de aceptar y rechazar)."""
    return barra('Propuesta', 'C-Detalle.dc.html') + cont(
        f'<div style="display: flex; align-items: center; gap: 14px">{avatar("julian", 64)}<span style="display: flex; flex-direction: column; gap: 5px"><span style="{TIT}; font-size: 22px">Julián Ortiz</span>{estrellas("4,9", 23)}</span></div>'
        + tarjeta_azul(f'<span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">PRECIO DE JULIÁN</span>{monto("$ 45.000", 42, "#FFFFFF")}<span style="font-size: 14px; font-weight: 700">Jue 19/11 · 10 a 12 h</span>'), gap=12).replace('data-c="1" ', '', 1)


# C-Aceptar (hoja sobre la propuesta, no sobre un gris)
paso_a = lambda ic, t, s: f'<li style="display: flex; gap: 12px; align-items: flex-start">{mosaico_ic(ic, 36, fondo=TINTE, color=AZUL, radio=12, iconsize=18)}<span style="display: flex; flex-direction: column; gap: 1px"><strong style="font-size: 14px">{t}</strong><span style="font-size: 13px; color: {SUAVE}">{s}</span></span></li>'
guardar_u('C-Aceptar.dc.html', 'Confirmar la propuesta', oscurecer(fondo_detalle()) + hoja_u(
    f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; border: 1px solid {BORDE}">{avatar("julian", 44)}<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">Julián · Plomería</strong><span style="font-size: 13px; color: {SUAVE}">Jue 19/11 · 10 a 12 h</span></span>{monto("$ 45.000", 22)}</div>'
    + f'<ol style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px">'
    + paso_a('candado', 'Julián ve tu dirección exacta', 'Y tu teléfono, solo para este turno')
    + paso_a('cerrar', 'Las otras propuestas se cierran', 'Les avisamos, sin dar motivos')
    + paso_a('billete', 'Pagás directo al terminar', 'Mercado Pago o efectivo · Handyx no toca la plata') + '</ol>'
    + f'<p style="margin: 0; font-size: 12px; color: {SUAVE}">Tarifa de servicio: 0 % hasta el 10/12/2026.</p>'
    + btn('Aceptar y compartir mi dirección', 'C-Aceptada.dc.html', 'check') + btn('Volver', 'C-Detalle.dc.html', var='contorno'),
    top=286, titulo_hoja=f'¿Aceptás la propuesta de {marcador("Julián")}?'))

# C-Rechazar (hoja: motivo opcional)
mot = lambda t, on=False: f'<button type="button" aria-pressed="{"true" if on else "false"}" style="min-height: 44px; padding: 0 14px; border-radius: 999px; border: {"2px solid " + AZUL if on else "1.5px solid " + BORDE}; background: {TINTE if on else "#FFFFFF"}; color: {HONDO if on else TINTA}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>'
guardar_u('C-Rechazar.dc.html', 'Rechazar la propuesta', oscurecer(fondo_detalle()) + hoja_u(
    texto('Le avisamos con un mensaje amable. El motivo es opcional y nos ayuda a mejorar; Julián no lo ve.', 14, SUAVE)
    + etiqueta('MOTIVO (OPCIONAL)')
    + f'<div style="display: flex; flex-wrap: wrap; gap: 8px">{mot("El precio", True)}{mot("La fecha")}{mot("Elegí otra")}{mot("Ya lo resolví")}{mot("Prefiero no decir")}</div>'
    + btn('Rechazar la propuesta', 'C-Propuestas.dc.html', 'cerrar', 'rojo') + btn('Volver', 'C-Detalle.dc.html', var='contorno'),
    top=372, titulo_hoja='¿Rechazás la propuesta de Julián?'))

# C-Aceptada (celebración premium, sin bloques verdes)
conf = ''.join(f'<span aria-hidden="true" style="position: absolute; left: {x}px; top: {y}px; width: {w}px; height: {h}px; border-radius: 3px; background: {c}; rotate: {r}deg"></span>'
               for x, y, w, h, c, r in [(34, 70, 10, 10, AMARILLO, 20), (70, 150, 8, 14, AZUL, 45), (318, 64, 10, 10, AZUL, 10), (346, 170, 8, 14, AMARILLO, 30), (56, 236, 10, 10, '#9DB7DE', 60), (326, 250, 10, 10, '#9DB7DE', 75), (196, 40, 8, 12, AMARILLO, 15)])
sello = (f'<div aria-hidden="true" style="position: absolute; top: 74px; left: 50%; margin-left: -80px; width: 160px; height: 160px; border-radius: 50%; background: {TINTE}; display: flex; align-items: center; justify-content: center">'
         f'<span style="width: 116px; height: 116px; border-radius: 50%; background: {AZUL}; box-shadow: 0 6px 0 {HONDO}, 0 24px 40px -16px rgba(20,62,126,0.8); display: flex; align-items: center; justify-content: center">{svg(IC["check"], "#FFFFFF", 56, 3)}</span>'
         f'<span style="position: absolute; right: 2px; top: 10px; width: 44px; height: 44px; border-radius: 50%; background: {AMARILLO}; border: 3px solid #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC["estrella_llena"], TINTA, 20)}</span></div>')
sigue = lambda ic, t, s, on=False: f'<li style="display: flex; gap: 12px; align-items: center">{mosaico_ic(ic, 36, fondo=AZUL if on else TINTE, color="#FFFFFF" if on else AZUL, radio=12, iconsize=18)}<span style="display: flex; flex-direction: column"><strong style="font-size: 14px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span></li>'
guardar_u('C-Aceptada.dc.html', 'Turno confirmado', conf + sello + cont(
    f'<div style="text-align: center; display: flex; flex-direction: column; gap: 6px"><h1 style="margin: 0; {TIT}; font-size: 34px; line-height: 1.02">¡Turno {marcador("confirmado")}!</h1><span style="font-size: 14px; color: {SUAVE}">Le avisamos a Julián. Te escribe para coordinar.</span></div>'
    + tarjeta_azul(f'<div style="display: flex; align-items: center; gap: 12px">{avatar("julian", 48)}<span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 16px">Julián Ortiz</strong><span style="font-size: 13px; color: #DCE7F7">Plomería · canilla del baño</span></span></div>'
                   f'<div style="height: 1px; background: rgba(255,255,255,0.22)"></div>'
                   f'<div style="display: flex; justify-content: space-between; align-items: flex-end"><span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">CUÁNDO</span><strong style="font-size: 16px">Jue 19/11 · 10 a 12 h</strong></span>{monto("$ 45.000", 24, "#FFFFFF")}</div>')
    + f'<ol aria-label="Qué sigue" style="list-style: none; margin: 0; padding: 0 4px; display: flex; flex-direction: column; gap: 10px">{sigue("chat", "Julián te escribe", "Para coordinar el acceso", True)}{sigue("pin", "El día del turno", "Lo ves venir solo mientras comparte el viaje")}{sigue("billete", "Al terminar, pagás directo", "Mercado Pago o efectivo")}</ol>', top=262, gap=16)
    + fijo(btn('Ver el turno', 'S-Agendado.dc.html'), btn('Escribirle a Julián', 'M-Chat.dc.html', 'chat', 'contorno')))

# C-Certificados → perfil premium (cifras, verificaciones, trabajos y reseñas)
cifra = lambda v, t: f'<span style="display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 6px; border-radius: 18px; background: {GRIS2}"><strong style="{TIT}; font-size: 22px">{v}</strong><span style="font-size: 12px; color: {SUAVE}; text-align: center">{t}</span></span>'
cert = lambda ic, t, sub, estado: f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDE}">{mosaico_ic(ic, 42, fondo=TINTE, color=AZUL, radio=14, iconsize=20)}<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{sub}</span></span>{estado}</div>'
res = lambda k, t, txt: f'<div style="padding: 14px; border-radius: 18px; border: 1px solid {BORDE}; display: flex; flex-direction: column; gap: 8px"><span style="display: flex; align-items: center; gap: 8px">{avatar(k, 30)}<strong style="flex: 1; font-size: 13px">{t}</strong><span role="img" aria-label="5 de 5 estrellas" style="display: inline-flex">{"".join(svg(IC["estrella_llena"], NARANJA, 14) for _ in range(5))}</span></span><span style="font-size: 14px; line-height: 1.4">{txt}</span></div>'
guardar_u('C-Certificados.dc.html', 'Perfil de Julián', barra('Perfil', 'C-Detalle.dc.html', sub='Así lo ves antes de elegir') + cont(
    f'<div style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center">{avatar("julian", 84)}<span style="{TIT}; font-size: 26px">Julián Ortiz</span><span style="font-size: 13px; color: {SUAVE}">Plomería · Mar del Plata · en Handyx desde 2026</span>{chip("Verificado por Handyx", "escudo", "exito")}</div>'
    + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{cifra("23", "trabajos")}{cifra("4,9", "de 5 en reseñas")}{cifra("2", "verificaciones")}</div>'
    + tarjeta(etiqueta('VERIFICADO POR OPERATIONS')
              + cert('cara', 'Identidad', 'Revisada · 02/11/2026', chip('Verificada', 'check', 'exito'))
              + cert('escudo', 'Antecedentes', 'Revisados en persona · 02/11/2026', chip('Verificados', 'check', 'exito'))
              + cert('documento', 'Curso de instalaciones sanitarias', 'Lo cargó Julián · sin revisar', chip('Cargado', 'info', 'gris'))
              + aviso('«Cargado» no es «verificado»: solo mostramos como verificado lo que revisó Operations.', 'info', 'gris'))
    + etiqueta('TRABAJOS RECIENTES')
    + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{foto("pared_nueva", 112, 96, 16, "Trabajo reciente: canilla cambiada")}{foto("calefon", 112, 96, 16, "Trabajo reciente: calefón")}{foto("canilla", 112, 96, 16, "Trabajo reciente: canilla de cocina")}</div>'
    + etiqueta('RESEÑAS · 4,9 DE 23 TRABAJOS')
    + res('carla', 'Carla I. · octubre', 'Llegó en el horario, explicó todo y dejó limpio.')
    + res('pablo', 'Pablo V. · septiembre', 'Cambió el flexible y probó todo antes de irse.'), gap=12)
    + fijo(btn('Aceptar su propuesta', 'C-Aceptar.dc.html', 'check'), btn('Escribirle', 'M-Chat.dc.html', 'chat', 'contorno', chico=True)), alto=1300)

# C-Cambios (más premium: la propuesta actual arriba y lo que cambia, claro)
op = lambda ic, t, s, on=False: (f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 10px 14px; border-radius: 18px; background: {TINTE if on else "#FFFFFF"}; border: {"2px solid " + AZUL if on else "1px solid " + BORDE}; {"box-shadow: 0 3px 0 " + HONDO + ";" if on else ""} font-family: \'DM Sans\', sans-serif; text-align: left; color: {TINTA}">'
                                 f'{mosaico_ic(ic, 40, fondo="#FFFFFF" if on else TINTE, color=AZUL, radio=12, iconsize=19)}<span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 15px">{t}</strong><span style="font-size: 12px; color: {SUAVE}">{s}</span></span></button>')
franja_b = lambda t, on=False: f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="min-height: 52px; border-radius: 16px; border: {"0" if on else "1.5px solid " + BORDE}; background: {AZUL if on else "#FFFFFF"}; box-shadow: {"0 3px 0 " + HONDO if on else "none"}; color: {"#FFFFFF" if on else TINTA}; font-family: \'DM Sans\', sans-serif; font-size: 14px; font-weight: 800">{t}</button>'
guardar_u('C-Cambios.dc.html', 'Pedir cambios', barra('Pedir un cambio', 'C-Detalle.dc.html', sub='A Julián Ortiz') + cont(
    f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: {GRIS2}"><span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; color: {SUAVE}">PROPUESTA ACTUAL</span><strong style="font-size: 14px">Jue 19/11 · 10 a 12 h</strong></span>{monto("$ 45.000", 22)}</div>'
    + titulo('¿Qué querés ', 'cambiar', '?', size=28, sub='Julián te manda una propuesta nueva. Nada cambia hasta que la aceptes.')
    + '<div role="radiogroup" aria-label="Qué cambiar" style="display: flex; flex-direction: column; gap: 8px">'
    + op('agenda', 'Otro día u horario', 'Proponé cuándo te queda bien', True) + op('caja', 'Que incluya los materiales', 'Y que te diga cuáles') + op('billete', 'Otro precio', 'Contale por qué, sin presión') + '</div>'
    + etiqueta('PROPONÉ DÍA Y FRANJA')
    + f'<div role="radiogroup" aria-label="Día y franja" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{franja_b("Vie 20 · 8 a 10 h", True)}{franja_b("Sáb 21 · 10 a 12 h")}</div>'
    + campo('Mensaje (opcional)', 'Ese día trabajo, ¿podés el viernes temprano?'), gap=12)
    + fijo(btn('Mandar a Julián', 'M-Chat.dc.html', 'enviar')), alto=930)
print('propuestas ok')
