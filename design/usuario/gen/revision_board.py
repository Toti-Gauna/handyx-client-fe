# Tablero de revisión UX/UI (arriba del lienzo). Los números salen de usuario/gen/revision.json (revisar.cjs).
import sys, json, glob, os
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403

pant = len([f for f in glob.glob('usuario/project/*.dc.html') if os.path.basename(f)[:3] not in ('FL-', 'UX-', 'RC-')])
flu = len(glob.glob('usuario/project/FL-*.dc.html')); rc = len(glob.glob('usuario/project/RC-*.dc.html'))
W, H = 1346, 800


def kpi(v, t, f=AZUL, c='#FFFFFF'):
    return f'<div style="padding: 18px; border-radius: 22px; background: {f}; color: {c}; {"box-shadow: 0 4px 0 " + HONDO if f == AZUL else "border: 1px solid " + BORDE}; display: flex; flex-direction: column; gap: 4px"><strong style="{TIT}; font-size: 40px; line-height: 1">{v}</strong><span style="font-size: 14px; font-weight: 700">{t}</span></div>'


def lista(titulo, items, ic='check', color='#137140'):
    li = ''.join(f'<li style="display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-top: 1px solid {BORDE}; font-size: 13.5px; line-height: 1.35"><span style="flex: none; display: flex">{svg(IC[ic], color, 18)}</span><span>{t}</span></li>' for t in items)
    return f'<section style="padding: 18px; border-radius: 24px; background: #FFFFFF; border: 1px solid {BORDE}; box-shadow: {ELEV1}">{etiqueta(titulo)}<ul style="list-style: none; margin: 8px 0 0; padding: 0">{li}</ul></section>'


html = f'''<div style="width: {W}px; height: {H}px; box-sizing: border-box; padding: 34px 40px; background: #F6F7F9; font-family: 'DM Sans', system-ui, sans-serif; color: {TINTA}; display: flex; flex-direction: column; gap: 18px">
  <div style="display: flex; justify-content: space-between; align-items: flex-end"><div style="display: flex; flex-direction: column; gap: 6px">{etiqueta("REVISIÓN 2 · 07/11/2026 · APP DEL USUARIO", AZUL)}<h1 style="margin: 0; {TIT}; font-size: 40px; line-height: 1">Revisión UX/UI de todo el diseño</h1><span style="font-size: 15px; color: {SUAVE}">{pant} pantallas, {rc} recorridos con pantallas y {flu} flujos revisados en el navegador, uno por uno, con chequeos automáticos y a ojo.</span></div>{chip("Datos de prueba en todas las pantallas", "check", "exito")}</div>
  <div style="display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px">{kpi('0', 'errores de accesibilidad (axe, WCAG 2 A y AA)')}{kpi('0', 'botones o enlaces de menos de 44 px', '#FFFFFF', TINTA)}{kpi('0', 'textos de menos de 11 px', '#FFFFFF', TINTA)}{kpi('0', 'pantallas con contenido tapado por los botones fijos', '#FFFFFF', TINTA)}</div>
  <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px">
    {lista("LO QUE CAMBIÓ CON LAS NOTAS DE IGNACIO", ["Inicio como la app real; barra azul con HandIA encastrada; chat con mensajes abajo.", "HandIA voz sin personaje: esfera de luz, textos livianos y hoja de ajustes.", "Pedir en 3 toques; propuestas con aceptar, rechazar y perfil; «la mejor» por promedio.", "Sin verde en botones ni seguimiento: colores y piezas del especialista.", "Reseña en hoja tipo Uber; Mi hogar con cuatro puertas y «Armá tu casa» en el alta.", "Sin invitación: registro directo. Recorridos con pantallas como en el especialista."])}
    {lista("REGLAS DEL SISTEMA QUE SE RESPETAN", ["Cabecera azul en Inicio, Mi hogar, Cuenta, Ayuda y Camino; barra compacta con volver en el resto.", "Pestañas de vidrio solo en las raíz, con HandIA como círculo azul flotante en el medio.", "Una acción principal fija abajo, con base que se hunde; aceptar verde, rechazar en rojo de contorno.", "Estados con ícono y texto; montos en Archivo 900 ensanchado.", "Una palabra con marcador amarillo por título; Handys en vacíos, éxitos y errores.", "Oscuro solo en cámara, nivel, escaneo, AR y la voz de HandIA."], 'check', AZUL)}
    {lista("PARA EL DESARROLLO", ["SVG de HandIA pensando y respondiendo: hoy provisionales, llegan los definitivos.", "Movimiento con View Transitions; todo se apaga con «reducir movimiento».", "Esqueletos, vacíos y errores para cada pantalla que trae datos.", "Texto al 200 % y 320 px de ancho en el código real (acá, 390 × 844).", "Probar con VoiceOver y TalkBack, y la AR en un Android y un iPhone.", "Pasar a Figma primero las piezas comunes (design/usuario/gen)."], 'flechas', HONDO)}
  </div>
  <section style="padding: 18px; border-radius: 24px; background: {NOCHE}; color: #FFFFFF; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px">
    {''.join(f'<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: {AMARILLO}">{a}</span><span style="font-size: 14px">{b}</span></div>' for a, b in [('CONTRATO', 'Mi hogar, recordatorios, camino, herramientas, 3D y AR no existen en v1: hace falta contrato nuevo.'), ('LEGAL', 'Montos y premios del camino; textos de garantía, privacidad y baja.'), ('PROVEEDORES', 'SMS para el código, Google y Apple; 3D y AR en el navegador o app.'), ('PRODUCTO', 'Dirección exacta por día en obras en equipo; reparto por etapas.')])}
  </section>
</div>'''
doc = documento('Revisión UX/UI', '').replace(f'<div style="width: 390px; height: 844px; box-sizing: border-box; background: #FFFFFF; font-family: \'DM Sans\', system-ui, sans-serif; color: {TINTA}; overflow: hidden; position: relative">\n\n</div>', html).replace('{"width":390,"height":844}', f'{{"width":{W},"height":{H}}}')
assert html in doc
open('usuario/project/UX-Revision.dc.html', 'w').write(doc)
print('revision ok', pant, flu)
