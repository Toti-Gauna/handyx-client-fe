# Piezas de la app del USUARIO, sobre las comunes del especialista (piezas.py, piezas2.py).
# Mismo sistema visual: fondo blanco, cabecera azul redondeada en las raíz, barra compacta en el resto, pestañas de
# vidrio flotantes (con HandIA como círculo en el medio), mosaicos grises, tarjetas con franja «Ver …», botones con base,
# una acción fija abajo, chips con ícono y texto, montos en Archivo 900 ensanchado y una palabra con marcador por título.
import sys
sys.path.insert(0, 'usuario/gen')
from piezas2 import *  # noqa: F401,F403

VERDE = '#137140'; VERDE_H = '#0B4F2C'; ROJO = '#A8261C'; GRIS2 = '#F4F5F7'

IC.update({
 'telefono': '<rect x="7" y="2" width="10" height="20" rx="2.5"></rect><path d="M11 18h2"></path>',
 'documento': '<path d="M6 2h9l5 5v15H6V2Z"></path><path d="M14 2v6h6M9 13h8M9 17h6"></path>',
 'cara': '<circle cx="12" cy="12" r="9"></circle><path d="M9 10h.01M15 10h.01M8.5 15a5 5 0 0 0 7 0"></path>',
 'llave2': '<circle cx="8" cy="15" r="4"></circle><path d="M11 12l9-9M17 6l2 2M15 8l2 2"></path>',
 'sobre': '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path>',
 'hogar': '<path d="M3 11l9-7 9 7"></path><path d="M5 10v10h14V10"></path><path d="M12 17s-3-1.8-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.8-3 3.6-3 3.6Z"></path>',
 'foto': '<rect x="3" y="5" width="18" height="15" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5-5-9 9"></path>',
 'linterna': '<path d="M8 2h8v5l-2 3v12h-4V10L8 7V2Z"></path><path d="M12 13v2"></path>',
 'lupa': '<circle cx="11" cy="11" r="7"></circle><path d="M16.5 16.5L21 21"></path>',
 'cubo': '<path d="M12 2l9 5v10l-9 5-9-5V7l9-5Z"></path><path d="M3 7l9 5 9-5M12 12v10"></path>',
 'ar': '<path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3"></path><path d="M12 7l5 3v5l-5 3-5-3v-5l5-3Z"></path>',
 'editar': '<path d="M4 20h4L19 9l-4-4L4 16v4Z"></path><path d="M13.5 6.5l4 4"></path>',
 'flecha_curva': '<path d="M4 14c4-8 12-8 16-2"></path><path d="M20 7v5h-5"></path>',
 'texto': '<path d="M5 6h14M12 6v13M9 19h6"></path>',
 'circulo': '<circle cx="12" cy="12" r="8"></circle>',
 'deshacer': '<path d="M9 14L4 9l5-5"></path><path d="M4 9h11a5 5 0 0 1 0 10h-3"></path>',
 'compartir': '<path d="M12 3v13M7 8l5-5 5 5"></path><path d="M5 13v7h14v-7"></path>',
 'efectivo': '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 9v.01M18 15v.01"></path>',
 'tarjeta2': '<rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20M6 15h4"></path>',
 'ojo': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle>',
 'chispas': '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"></path>',
 'onda': '<path d="M3 12h1M7 8v8M11 5v14M15 9v6M19 7v10M22 12h-1"></path>',
 'teclado': '<rect x="2.5" y="6" width="19" height="12" rx="2"></rect><path d="M6.5 10h1M10.5 10h1M14.5 10h1M17.5 10h.5M6.5 14h11"></path>',
 'cerrar': '<path d="M6 6l12 12M18 6L6 18"></path>',
 'pausa': '<path d="M9 5v14M15 5v14"></path>',
 'menu': '<path d="M4 7h16M4 12h16M4 17h16"></path>',
 'filtro': '<path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"></path>',
 'columnas': '<rect x="3" y="4" width="8" height="16" rx="2"></rect><rect x="13" y="4" width="8" height="16" rx="2"></rect>',
 'deslizar': '<path d="M12 3v18"></path><path d="M8 9l-3 3 3 3M16 9l3 3-3 3"></path>',
 'sol': '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"></path>',
 'info': '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5h.01"></path>',
 'llave_ing': '<path d="M15 7a4 4 0 1 1-3.5 6L5 19.5V22H2.5v-2.5L9 13a4 4 0 0 1 6-6Z"></path>',
 'ubicacion': '<circle cx="12" cy="12" r="3"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>',
 'firma': '<path d="M3 17c3-6 5-6 6-3s3 3 5-1 4-2 7 1"></path><path d="M3 21h18"></path>',
 'tornillo': '<path d="M9 3h6l-1 4h-4L9 3Z"></path><path d="M12 7v13M9.5 10l5 1.5M9.5 13l5 1.5M9.5 16l5 1.5"></path>',
 'grafico': '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"></path>',
 'pulgar': '<path d="M7 11v10H3V11h4Z"></path><path d="M7 11l4-8a2.5 2.5 0 0 1 3 3l-1 4h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7"></path>',
 'sello': '<circle cx="12" cy="10" r="6"></circle><path d="M9 15l-2 7 5-3 5 3-2-7"></path><path d="M9.5 10l2 2 3-3.5"></path>',
 'mapa_pin': '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"></path><path d="M9 3v15M15 6v15"></path>',
})

# Personas (todas ficticias). La usuaria de la app es Lucía Ferreyra.
GENTE.update({
 'lucia': ('LF', 'Lucía Ferreyra', AMARILLO, TINTA),
 'julian': ('JO', 'Julián Ortiz', AZUL, '#FFFFFF'),
 'diego': ('DH', 'Diego Herrera', TINTE, HONDO),
 'sofia': ('SR', 'Sofía Ruiz', '#CDE7D6', '#137140'),
 'pablo': ('PV', 'Pablo Vega', '#E7D9F5', '#5B3A8C'),
 'carla': ('CI', 'Carla Ibáñez', '#F6D7A7', TINTA),
 'handyx': ('H', 'Soporte Handyx', NOCHE, '#FFFFFF'),
})

RUBROS = [
 ('electricidad', 'Electricidad', 'lamparita', 'rayo'),
 ('plomeria', 'Plomería', 'cano', 'gota'),
 ('gas', 'Gas', 'gota', 'llama'),
 ('cerrajeria', 'Cerrajería', 'llave', 'llave2'),
 ('albanileria', 'Albañilería', None, 'ladrillo'),
 ('aire', 'Aire acond.', 'engranaje', 'copo'),
]


def img(nombre, w, h, extra=''):
    return f'<img src="{BLOB[nombre]}" alt="" style="width: {w}px; height: {h}px; object-fit: contain; {extra}">'


# ── Estructura de pantalla ──────────────────────────────────────────────────────────────────────────
def cont(html, top=72, gap=14, lado=16):
    """Contenido de la pantalla (data-c: lo mide revisar.cjs contra lo fijo de abajo)."""
    return f'  <div data-c="1" style="position: absolute; top: {top}px; left: {lado}px; right: {lado}px; display: flex; flex-direction: column; gap: {gap}px">{html}</div>'


def fijo(*botones, nota=''):
    n = f'<p style="margin: 0; text-align: center; font-size: 12px; color: {SUAVE}">{nota}</p>' if nota else ''
    return f'''  <div data-f="1" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px 22px; background: #FFFFFF; border-top: 1px solid {BORDE}; display: flex; flex-direction: column; gap: 10px">{n}{''.join(botones)}</div>'''


def btn(texto, href=None, ic=None, var='azul', alto=56, chico=False):
    """Botón con base que se hunde. var: azul | verde | amarillo | contorno | rojo | blanco | gris."""
    est = {
        'azul': f'background: {AZUL}; color: #FFFFFF; box-shadow: 0 4px 0 {HONDO}',
        'verde': f'background: {VERDE}; color: #FFFFFF; box-shadow: 0 4px 0 {VERDE_H}',
        'amarillo': f'background: {AMARILLO}; color: {TINTA}; box-shadow: 0 4px 0 #C9C85A',
        'contorno': f'background: #FFFFFF; color: {AZUL}; border: 2px solid {AZUL}',
        'rojo': f'background: #FFFFFF; color: {ROJO}; border: 2px solid {ROJO}',
        'blanco': f'background: #FFFFFF; color: {AZUL}; box-shadow: 0 4px 0 #C9D3E6',
        'gris': f'background: {MOSAICO}; color: {TINTA}; box-shadow: 0 4px 0 #D3D6DC',
    }[var]
    col = '#FFFFFF' if var in ('azul', 'verde') else (ROJO if var == 'rojo' else (TINTA if var in ('amarillo', 'gris') else AZUL))
    i = svg(IC[ic], col, 20) if ic else ''
    alto = 48 if chico else alto
    base = f'display: flex; align-items: center; justify-content: center; gap: 8px; min-height: {alto}px; padding: 0 18px; border-radius: 16px; {est}; font-family: \'DM Sans\', sans-serif; font-size: {14 if chico else 16}px; font-weight: 800; text-decoration: none; box-sizing: border-box'
    if href:
        return f'<a href="{href}" style="{base}">{i}{texto}</a>'
    return f'<button type="button" style="{base}; border-width: {2 if var in ("contorno", "rojo") else 0}px; cursor: pointer">{i}{texto}</button>'


def fila_botones(*b):
    return f'<div style="display: grid; grid-template-columns: repeat({len(b)}, minmax(0, 1fr)); gap: 10px">{"".join(b)}</div>'


def monto(v, size=40, color=TINTA):
    return f'<strong style="{TIT}; font-size: {size}px; line-height: 1; color: {color}; font-variant-numeric: tabular-nums">{v}</strong>'


def texto(t, size=14, color=TEXTO, peso=400):
    return f'<p style="margin: 0; font-size: {size}px; line-height: 1.42; color: {color}; font-weight: {peso}">{t}</p>'


def titulo(antes, marcado='', despues='', size=30, sup='', sub=''):
    s = etiqueta(sup) if sup else ''
    b = f'<p style="margin: 0; font-size: 14px; line-height: 1.4; color: {SUAVE}">{sub}</p>' if sub else ''
    return f'<section style="display: flex; flex-direction: column; gap: 6px">{s}<h1 style="margin: 0; {TIT}; font-size: {size}px; line-height: 1.04">{antes}{marcador(marcado) if marcado else ""}{despues}</h1>{b}</section>'


def aviso(t, ic='info', tono='tinte'):
    f, c = {'tinte': (TINTE, HONDO), 'amarillo': ('#FBFBD2', TINTA), 'exito': ('#E3F4EA', '#137140'), 'error': ('#FCE8E6', ROJO), 'gris': (GRIS2, TEXTO), 'noche': (NOCHE, '#FFFFFF')}[tono]
    return f'<div role="note" style="display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 16px; background: {f}; color: {c}; font-size: 13px; line-height: 1.4">{svg(IC[ic], c, 18)}<span>{t}</span></div>'


def campo(label, valor='', ph='', ic=None, tipo='text'):
    i = f'<span style="position: absolute; left: 14px; top: 50%; translate: 0 -50%">{svg(IC[ic], SUAVE, 18)}</span>' if ic else ''
    pad = 42 if ic else 14
    return (f'<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 800; color: {TEXTO}">{label}'
            f'<span style="position: relative; display: block">{i}<input type="{tipo}" value="{valor}" placeholder="{ph}" readonly style="width: 100%; box-sizing: border-box; min-height: 52px; padding: 0 14px 0 {pad}px; border-radius: 14px; border: 1.5px solid {BORDE}; background: #FFFFFF; font-family: \'DM Sans\', sans-serif; font-size: 16px; color: {TINTA}"></span></label>')


def interr(label, on=True, sub=''):
    pista = AZUL if on else '#C7CDD8'
    lado = 'right: 3px' if on else 'left: 3px'
    s = f'<span style="display: block; font-size: 12px; font-weight: 400; color: {SUAVE}">{sub}</span>' if sub else ''
    return (f'<button type="button" role="switch" aria-checked="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 8px 0; border: 0; background: none; text-align: left; font-family: \'DM Sans\', sans-serif; font-size: 15px; font-weight: 700; color: {TINTA}; cursor: pointer">'
            f'<span style="flex: 1">{label}{s}</span><span style="width: 48px; height: 28px; flex: none; border-radius: 14px; background: {pista}; position: relative; display: block"><span style="position: absolute; top: 3px; {lado}; width: 22px; height: 22px; border-radius: 50%; background: #FFFFFF; display: block"></span></span></button>')


def seg(items, activa, label='Vista'):
    out = []
    for t, href in items:
        on = t == activa
        s = f'background: #FFFFFF; color: {TINTA}; box-shadow: {ELEV1}' if on else f'color: {SUAVE}'
        out.append(f'<a href="{href}"{" aria-current=\"page\"" if on else ""} style="flex: 1; min-height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; text-decoration: none; {s}">{t}</a>')
    return f'<nav aria-label="{label}" style="display: flex; gap: 4px; padding: 4px; border-radius: 16px; background: {MOSAICO}">{"".join(out)}</nav>'


def pasos(n, total):
    p = ''.join(f'<span style="flex: 1; height: 6px; border-radius: 3px; background: {AZUL if i < n else MOSAICO}"></span>' for i in range(total))
    return f'<div role="progressbar" aria-label="Paso {n} de {total}" aria-valuemin="0" aria-valuemax="{total}" aria-valuenow="{n}" style="display: flex; gap: 4px">{p}</div>'


def ticket(arriba, abajo, corte=96):
    mask = (f'radial-gradient(circle at 0 {corte}px, transparent 11px, #000 12px) left / 51% 100% no-repeat, '
            f'radial-gradient(circle at 100% {corte}px, transparent 11px, #000 12px) right / 51% 100% no-repeat')
    return (f'<section style="filter: drop-shadow(0 8px 14px rgba(14,29,54,0.12)) drop-shadow(0 1px 2px rgba(14,29,54,0.08))"><div style="border-radius: 24px; background: #FFFFFF; -webkit-mask: {mask}; mask: {mask}">'
            f'<div style="height: {corte}px; box-sizing: border-box; padding: 16px; display: flex; align-items: center; gap: 12px">{arriba}</div>'
            f'<div style="margin: 0 16px; border-top: 2px dashed #D9DEE7"></div><div style="padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px">{abajo}</div></div></section>')


def verificado(t='Identidad verificada'):
    return chip(t, 'escudo', 'exito')


def mosaico_rubro(clave, nombre, handy, ic, href, tam=None):
    dibujo = img(handy, 46, 50) if handy else f'<span style="width: 46px; height: 46px; border-radius: 14px; background: #FFFFFF; display: flex; align-items: center; justify-content: center">{svg(IC[ic], AZUL, 24)}</span>'
    return f'<a href="{href}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; aspect-ratio: 1 / 0.92; border-radius: 22px; background: {MOSAICO}; box-shadow: 0 4px 0 #D3D6DC; color: {TINTA}; font-size: 13px; font-weight: 800; text-decoration: none">{dibujo}{nombre}</a>'


def grilla_rubros(href='P-Que.dc.html'):
    return '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">' + ''.join(mosaico_rubro(*r[:4], href) for r in RUBROS) + '</div>'


def burbuja(t, de='otra', hora=''):
    if de == 'yo':
        est = f'align-self: flex-end; border-radius: 18px 18px 6px 18px; background: {AZUL}; color: #FFFFFF'
    else:
        est = f'align-self: flex-start; border-radius: 18px 18px 18px 6px; background: {MOSAICO}; color: {TINTA}'
    h = f'<span style="display: block; margin-top: 4px; font-size: 11px; opacity: 0.85; text-align: right">{hora}</span>' if hora else ''
    return f'<div style="max-width: 78%; padding: 10px 14px; font-size: 14px; line-height: 1.4; {est}">{t}{h}</div>'


# ── HandIA ──────────────────────────────────────────────────────────────────────────────────────────
def handia_avatar(tam=40):
    return (f'<span aria-hidden="true" style="position: relative; width: {tam}px; height: {tam}px; flex: none; border-radius: {int(tam*0.32)}px; background: {AZUL}; box-shadow: 0 3px 0 {HONDO}; display: flex; align-items: center; justify-content: center; overflow: hidden">'
            f'<span style="position: absolute; width: {int(tam*0.7)}px; height: {int(tam*0.7)}px; border-radius: 50%; background: #FFCF5A; opacity: 0.55; filter: blur({max(3,tam//10)}px)"></span>'
            f'{img("lamparita", int(tam*0.5), int(tam*0.78), "position: relative")}</span>')


def estado_handia(tipo, tam=150):
    """Ilustración SVG del estado de HandIA (provisoria: Ignacio va a mandar las finales de «pensando» y «respondiendo»)."""
    if tipo == 'pensando':
        deco = (f'<circle cx="112" cy="40" r="7" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="2"></circle><circle cx="126" cy="22" r="4.5" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="2"></circle>'
                f'<g transform="translate(118 64)" fill="none" stroke="{AZUL}" stroke-width="3"><circle r="9"></circle><path d="M0 -14v5M0 9v5M-14 0h5M9 0h5M-10 -10l3.5 3.5M6.5 6.5l3.5 3.5M-10 10l3.5-3.5M6.5 -6.5l3.5-3.5"></path></g>')
        etq = 'HandIA está pensando'
    elif tipo == 'respondiendo':
        deco = (f'<path d="M100 22h44a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8h-26l-10 9v-9h-8a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z" fill="#FFFFFF" stroke="{AZUL}" stroke-width="3"></path>'
                f'<path d="M108 34h28M108 44h18" stroke="{AZUL}" stroke-width="3" stroke-linecap="round"></path>')
        etq = 'HandIA te está respondiendo'
    else:
        deco = f'<path d="M110 30l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1Z" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="2" stroke-linejoin="round"></path>'
        etq = 'HandIA encontró lo que buscabas'
    return (f'<span role="img" aria-label="{etq}" style="position: relative; width: {tam}px; height: {tam}px; display: block">'
            f'<span style="position: absolute; left: 6%; top: 18%; width: 62%; height: 62%; border-radius: 50%; background: #FFE8A3"></span>'
            f'{img("lamparita", int(tam*0.48), int(tam*0.78), f"position: absolute; left: {int(tam*0.13)}px; top: {int(tam*0.12)}px")}'
            f'<svg viewBox="0 0 160 160" width="{tam}" height="{tam}" style="position: absolute; inset: 0" aria-hidden="true">{deco}</svg></span>')


# ── Navegación ──────────────────────────────────────────────────────────────────────────────────────
def barra_u(activa):
    """Pestañas flotantes de vidrio: Inicio · Actividad · HandIA (círculo en el medio) · Mensajes · Mi hogar."""
    tabs = [('Inicio', 'casa', 'I-Inicio.dc.html'), ('Actividad', 'agenda', 'X-Actividad.dc.html'), None,
            ('Mensajes', 'chat', 'M-Mensajes.dc.html'), ('Mi hogar', 'hogar', 'H-Hogar.dc.html')]
    items = []
    for t in tabs:
        if t is None:
            on = activa == 'HandIA'
            items.append(
                f'<a href="I-HandIA.dc.html" aria-label="HandIA, tu asistente"{" aria-current=\"page\"" if on else ""} style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 6px; color: {TINTA}; font-size: 11px; font-weight: 800; text-decoration: none">'
                f'<span style="position: absolute; top: -30px; left: 50%; margin-left: -33px; width: 66px; height: 66px; box-sizing: border-box; border-radius: 50%; border: 4px solid #FFFFFF; background: {AZUL}; box-shadow: 0 4px 0 {HONDO}, 0 14px 26px -10px rgba(31,87,168,0.7); display: flex; align-items: center; justify-content: center; overflow: hidden">'
                f'<span style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #FFCF5A; opacity: 0.55; filter: blur(7px)"></span>{img("lamparita", 30, 44, "position: relative")}</span>HandIA</a>')
            continue
        nombre, ic, href = t
        on = nombre == activa
        fondo = f'background: {AZUL}; box-shadow: 0 3px 0 {HONDO};' if on else ''
        color = '#FFFFFF' if on else TEXTO
        items.append(f'<a href="{href}"{" aria-current=\"page\"" if on else ""} style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-radius: 22px; {fondo} color: {color}; font-size: 11px; font-weight: {800 if on else 700}; text-decoration: none">{svg(IC[ic], color, 21)}{nombre}</a>')
    return ('  <nav data-f="1" aria-label="Secciones" style="position: absolute; left: 14px; right: 14px; bottom: 14px; height: 70px; box-sizing: border-box; padding: 6px; border-radius: 30px; '
            'background: rgba(255,255,255,0.62); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); '
            f'border: 1px solid rgba(255,255,255,0.75); box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), {ELEV2}; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 2px">\n    '
            + '\n    '.join(items) + '\n  </nav>')


def cabecera_u(chica=False):
    """Cabecera azul redondeada (solo pantallas principales): marca, avisos y tu cuenta."""
    return f'''  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 22px 16px 20px 22px; background: {AZUL}; border-radius: 0 0 30px 30px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 12px 30px -16px rgba(14,29,54,0.55)">
    <span style="display: flex; flex-direction: column; gap: 2px"><span style="{TIT}; font-size: 40px; line-height: 1; color: #FFFFFF">Handyx</span><span style="font-size: 11px; font-weight: 700; color: #FFFFFF">Soluciones, no problemas</span></span>
    <span style="display: flex; gap: 10px">
      <a href="I-Avisos.dc.html" aria-label="Avisos, 2 sin leer" style="position: relative; width: 58px; height: 58px; border-radius: 18px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center">{svg(IC['campana'],'#FFFFFF',24)}<span style="position: absolute; top: 12px; right: 13px; width: 10px; height: 10px; border-radius: 50%; background: {AMARILLO}"></span></a>
      <a href="X-Cuenta.dc.html" aria-label="Tu cuenta" style="width: 58px; height: 58px; border-radius: 18px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center"><span style="width: 38px; height: 38px; border-radius: 50%; background: {AMARILLO}; color: {TINTA}; display: flex; align-items: center; justify-content: center; {TIT}; font-size: 14px">LF</span></a>
    </span>
  </header>'''


def barra(titulo_, atras, accion='', sub=''):
    return barra_compacta(titulo_, atras, accion, sub)


def accion_icono(ic, label, href='#'):
    return f'<a href="{href}" aria-label="{label}" style="width: 44px; height: 44px; border-radius: 50%; border: 1px solid {BORDE}; background: #FFFFFF; box-shadow: {ELEV1}; display: flex; align-items: center; justify-content: center">{svg(IC[ic], TINTA, 20)}</a>'


# ── Ilustraciones propias (SVG plano, sin gradientes) ───────────────────────────────────────────────
def foto(tipo, w=358, h=200, radio=20, etq=None):
    fondos = {
        'canilla': ('#DCE6F2', f'<g stroke="#9AA9BF" stroke-width="2">{"".join(f"<path d=\"M0 {y}H{w}\"></path>" for y in range(30, h, 34))}{"".join(f"<path d=\"M{x} 0V{h}\"></path>" for x in range(40, w, 52))}</g>'
                    f'<rect x="{w*0.32}" y="{h*0.22}" width="{w*0.36}" height="22" rx="8" fill="#B8C2D0"></rect><rect x="{w*0.6}" y="{h*0.22}" width="18" height="{h*0.32}" rx="6" fill="#B8C2D0"></rect>'
                    f'<path d="M{w*0.62} {h*0.6} q8 14 0 22 q-8 -8 0 -22Z" fill="{AZUL}"></path><path d="M{w*0.62} {h*0.78} q6 10 0 16 q-6 -6 0 -16Z" fill="{AZUL}" opacity="0.7"></path>', 'Foto de la canilla que gotea'),
        'humedad': ('#EFE9DD', f'<path d="M{w*0.2} {h*0.2} q{w*0.15} -30 {w*0.3} 0 t{w*0.25} 10 q10 {h*0.3} -20 {h*0.45} q-{w*0.2} 20 -{w*0.4} 0 q-30 -{h*0.2} -10 -{h*0.45}Z" fill="#CFC3A8"></path><path d="M{w*0.3} {h*0.35} q{w*0.1} -10 {w*0.2} 5" stroke="#B4A47F" stroke-width="3" fill="none"></path>', 'Foto de una mancha de humedad'),
        'tablero': ('#E7EAF0', f'<rect x="{w*0.25}" y="{h*0.12}" width="{w*0.5}" height="{h*0.76}" rx="10" fill="#FFFFFF" stroke="#9AA9BF" stroke-width="3"></rect>{"".join(f"<rect x=\"{w*0.31+i*w*0.08}\" y=\"{h*0.3}\" width=\"{w*0.05}\" height=\"{h*0.34}\" rx=\"3\" fill=\"{NOCHE if i!=2 else NARANJA}\"></rect>" for i in range(5))}', 'Foto del tablero eléctrico'),
        'calefon': ('#E9EDF3', f'<rect x="{w*0.36}" y="{h*0.08}" width="{w*0.28}" height="{h*0.84}" rx="14" fill="#FFFFFF" stroke="#9AA9BF" stroke-width="3"></rect><circle cx="{w*0.5}" cy="{h*0.62}" r="14" fill="#F3D9A0" stroke="{NARANJA}" stroke-width="3"></circle><rect x="{w*0.43}" y="{h*0.2}" width="{w*0.14}" height="10" rx="5" fill="#B8C2D0"></rect>', 'Foto del calefón'),
        'pared_nueva': ('#EEF2F7', f'<g stroke="#C9D3E2" stroke-width="2">{"".join(f"<path d=\"M0 {y}H{w}\"></path>" for y in range(30, h, 34))}{"".join(f"<path d=\"M{x} 0V{h}\"></path>" for x in range(40, w, 52))}</g><rect x="{w*0.32}" y="{h*0.22}" width="{w*0.36}" height="22" rx="8" fill="#AEB9C9"></rect><rect x="{w*0.6}" y="{h*0.22}" width="18" height="{h*0.32}" rx="6" fill="#AEB9C9"></rect><circle cx="{w*0.7}" cy="{h*0.75}" r="16" fill="{VERDE}"></circle><path d="M{w*0.7-7} {h*0.75} l5 5 9 -10" stroke="#FFFFFF" stroke-width="3" fill="none"></path>', 'Foto de la canilla arreglada'),
        'cerradura': ('#E6E1D6', f'<rect x="{w*0.3}" y="0" width="{w*0.4}" height="{h}" fill="#C9B79A"></rect><rect x="{w*0.58}" y="{h*0.4}" width="{w*0.08}" height="{h*0.2}" rx="6" fill="#8D8A84"></rect><circle cx="{w*0.62}" cy="{h*0.47}" r="5" fill="{TINTA}"></circle>', 'Foto de la cerradura'),
    }
    fondo, dib, label = fondos[tipo]
    return f'<svg role="img" aria-label="{etq or label}" width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display: block; border-radius: {radio}px; background: {fondo}">{dib}</svg>'


def ciudad(w=390, h=430):
    """Mar del Plata en SVG propio: edificios de la costa, el faro, la rambla y el mar. Bandas planas."""
    edif = [(10, 210, 52), (66, 160, 44), (114, 230, 60), (178, 140, 40), (222, 200, 54), (280, 170, 46)]
    e = ''
    for x, alto, an in edif:
        y = h - 140 - alto
        e += f'<rect x="{x}" y="{y}" width="{an}" height="{alto}" fill="#2B65B8"></rect>'
        for fy in range(int(y) + 14, h - 150, 26):
            for fx in range(x + 8, x + an - 10, 14):
                on = ((fx * 7 + fy * 3) % 5) == 0
                e += f'<rect x="{fx}" y="{fy}" width="7" height="10" fill="{AMARILLO if on else "#4A7CC7"}"></rect>'
    faro = f'<path d="M340 {h-140} l6 -150 h14 l6 150Z" fill="#FFFFFF"></path><rect x="344" y="{h-310}" width="22" height="18" fill="{AMARILLO}"></rect><path d="M340 {h-312} h30 l-15 -14Z" fill="#E43D30"></path><path d="M352 {h-250} h10 M350 {h-210} h14" stroke="#E43D30" stroke-width="10"></path>'
    luna = f'<circle cx="300" cy="70" r="30" fill="{AMARILLO}"></circle>'
    return (f'<svg aria-hidden="true" width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position: absolute; left: 0; top: 0; display: block">'
            f'<rect width="{w}" height="{h}" fill="{AZUL}"></rect>{luna}{e}{faro}'
            f'<rect y="{h-140}" width="{w}" height="22" fill="#E9D9B6"></rect><rect y="{h-118}" width="{w}" height="118" fill="#173F7C"></rect>'
            f'<path d="M0 {h-96} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#4A7CC7" stroke-width="3" fill="none"></path>'
            f'<path d="M0 {h-66} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#4A7CC7" stroke-width="3" fill="none"></path></svg>')


def casa_iso(w=300, h=210, etq='Modelo 3D de tu casa (ilustración)'):
    return (f'<svg role="img" aria-label="{etq}" width="{w}" height="{h}" viewBox="0 0 300 210" style="display: block">'
            f'<path d="M150 20 L270 80 L150 140 L30 80Z" fill="#DCE6F2" stroke="{AZUL}" stroke-width="2"></path>'
            f'<path d="M30 80 L30 150 L150 210 L150 140Z" fill="#B9CCE8" stroke="{AZUL}" stroke-width="2"></path>'
            f'<path d="M270 80 L270 150 L150 210 L150 140Z" fill="#9DB7DE" stroke="{AZUL}" stroke-width="2"></path>'
            f'<path d="M150 20 L150 80 M90 50 L210 110 M210 50 L90 110" stroke="{AZUL}" stroke-width="1.5" opacity="0.6"></path>'
            f'<rect x="168" y="60" width="26" height="14" rx="3" fill="{AMARILLO}" stroke="{TINTA}" stroke-width="1.5" transform="skewY(26.5) translate(0 -84)"></rect>'
            f'<text x="196" y="44" font-family="DM Sans, sans-serif" font-size="12" font-weight="800" fill="{HONDO}">Cocina</text>'
            f'<text x="58" y="72" font-family="DM Sans, sans-serif" font-size="12" font-weight="800" fill="{HONDO}">Living</text>'
            f'<text x="120" y="122" font-family="DM Sans, sans-serif" font-size="12" font-weight="800" fill="{HONDO}">Baño</text></svg>')


def camara(alto=844, extra=''):
    """Fondo de cámara (oscuro solo en cámara, medir, nivel, escaneo y AR)."""
    return f'  <div aria-hidden="true" style="position: absolute; inset: 0; height: {alto}px; background: #1B2230">{extra}</div>'


def guardar_u(nombre, titulo_, cuerpo):
    guardar(nombre, titulo_, cuerpo)
