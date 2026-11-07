# Base de los flujos (copiada de handyx-specialist-fe/design/deluxe/gen/flujos.py y adaptada al usuario).
# Nodos: (clave, columna, fila, título, bajada, ícono, pantalla, tipo) con tipo p = pantalla, i = punto de partida,
# e = lo hace el especialista, o = otro profesional, s = lo hace Handyx u Operations. Aristas: (desde, hasta, rótulo).
import sys, math
sys.path.insert(0, 'usuario/gen')
from piezas_u import *  # noqa: F401,F403
NW, NH, DX, DY, X0, Y0 = 176, 104, 214, 176, 40, 160

def flujo(archivo, titulo, sub, nodos, aristas, nota=''):
    pos={}
    for n in nodos:
        k,c,r=n[0],n[1],n[2]
        pos[k]=(X0+c*DX, Y0+r*DY)
    W=max(1346, max(x for x,y in pos.values())+NW+60)
    H=max(y for x,y in pos.values())+NH+110
    cards=[]
    for k,c,r,t,s,ic,href,tipo in nodos:
        x,y=pos[k]
        if tipo=='p':   est=f'background: #FFFFFF; border: 1px solid {BORDE}; box-shadow: {ELEV1}; color: {TINTA}'; icf,icc='#E9EFF9',AZUL; etq='PANTALLA'
        elif tipo=='i': est=f'background: {AZUL}; box-shadow: 0 4px 0 {HONDO}; color: #FFFFFF'; icf,icc='rgba(255,255,255,0.18)','#FFFFFF'; etq='PANTALLA'
        elif tipo=='e': est=f'background: {AMARILLO}; box-shadow: 0 4px 0 #C9C85A; color: {TINTA}'; icf,icc='#FFFFFF',TINTA; etq='EL ESPECIALISTA'
        elif tipo=='o': est=f'background: #FFFFFF; border: 2px dashed {AZUL}; color: {TINTA}'; icf,icc=TINTE,AZUL; etq='OTRO PROFESIONAL'
        else:           est=f'background: {NOCHE}; color: #FFFFFF'; icf,icc='rgba(255,255,255,0.14)',AMARILLO; etq='HANDYX'
        tag='a' if href else 'div'
        h=f' href="{href}"' if href else ''
        cards.append(f'<{tag}{h} style="position: absolute; left: {x}px; top: {y}px; width: {NW}px; height: {NH}px; box-sizing: border-box; padding: 10px 12px; border-radius: 18px; {est}; text-decoration: none; display: flex; flex-direction: column; gap: 4px"><span style="display: flex; align-items: center; gap: 8px"><span style="width: 30px; height: 30px; flex: none; border-radius: 10px; background: {icf}; display: flex; align-items: center; justify-content: center">{svg(IC[ic],icc,17)}</span><span style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; opacity: 0.75">{etq}</span></span><strong style="font-size: 14px; line-height: 1.15">{t}</strong><span style="font-size: 11px; opacity: 0.75; line-height: 1.2">{s}</span></{tag}>')
    paths=[]; labels=[]
    for a,b,lab in aristas:
        (x1,y1),(x2,y2)=pos[a],pos[b]
        arco=None
        if y2>y1+10: p1=(x1+NW/2,y1+NH); d1=(0,1); p2=(x2+NW/2,y2-6); d2=(0,-1)
        elif y2<y1-10: p1=(x1+NW/2,y1); d1=(0,-1); p2=(x2+NW/2,y2+NH+6); d2=(0,1)
        elif x2-x1 > DX*1.5: p1=(x1+NW/2,y1); d1=(0,-1); p2=(x2+NW/2,y2-6); d2=(0,1); arco=-1
        elif x2>x1: p1=(x1+NW,y1+NH/2); d1=(1,0); p2=(x2-6,y2+NH/2); d2=(-1,0)
        else: p1=(x1+NW/2,y1+NH); d1=(0,1); p2=(x2+NW/2,y2+NH+6); d2=(0,-1); arco=1
        dist=max(50,min(120,math.hypot(p2[0]-p1[0],p2[1]-p1[1])/2.2))
        if d1[1]!=0 and d2[1]!=0 and not arco:
            gap=abs(p2[1]-p1[1]); dist=max(24,min(dist,gap*0.45)) if abs(p2[0]-p1[0])>DX*0.6 else dist
        if arco: c1=(p1[0],p1[1]+arco*55); c2=(p2[0],p2[1]+arco*55)
        else: c1=(p1[0]+d1[0]*dist,p1[1]+d1[1]*dist); c2=(p2[0]+d2[0]*dist,p2[1]+d2[1]*dist)
        paths.append(f'<path d="M{p1[0]:.0f} {p1[1]:.0f} C {c1[0]:.0f} {c1[1]:.0f}, {c2[0]:.0f} {c2[1]:.0f}, {p2[0]:.0f} {p2[1]:.0f}" fill="none" stroke="{AZUL}" stroke-width="2.5" marker-end="url(#punta)"></path>')
        if lab:
            mx=(p1[0]+3*c1[0]+3*c2[0]+p2[0])/8; my=(p1[1]+3*c1[1]+3*c2[1]+p2[1])/8
            if abs(y2-y1)<10 and 0 < x2-x1 <= DX*1.5: my-=22
            labels.append(f'<span style="position: absolute; left: {mx:.0f}px; top: {my:.0f}px; translate: -50% -50%; padding: 3px 8px; border-radius: 999px; background: #FFFFFF; border: 1px solid {BORDE}; font-size: 11px; font-weight: 800; color: {HONDO}; white-space: nowrap">{lab}</span>')
    leyenda=''.join(f'<span style="display: inline-flex; align-items: center; gap: 6px"><span style="width: 18px; height: 12px; border-radius: 4px; {e}"></span>{t}</span>' for e,t in [(f'background: #FFFFFF; border: 1px solid {BORDE}','Pantalla'),(f'background: {AZUL}','Punto de partida'),(f'background: {AMARILLO}','Lo hace el especialista'),(f'background: {NOCHE}','Lo hace Handyx u Operations'),(f'border: 2px dashed {AZUL}','Otro profesional')])
    nt=f'<p style="position: absolute; left: 40px; right: 40px; bottom: 26px; margin: 0; font-size: 13px; color: {SUAVE}">{nota}</p>' if nota else ''
    html=f'''<div style="width: {W}px; height: {H}px; box-sizing: border-box; background: #FFFFFF; font-family: 'DM Sans', system-ui, sans-serif; color: {TINTA}; position: relative; overflow: hidden">
  <div style="position: absolute; left: 40px; top: 30px; display: flex; flex-direction: column; gap: 6px">{etiqueta("FLUJO", AZUL)}<h1 style="margin: 0; {TIT}; font-size: 34px; line-height: 1">{titulo}</h1><span style="font-size: 14px; color: {SUAVE}">{sub}</span></div>
  <div style="position: absolute; right: 40px; top: 40px; display: flex; gap: 16px; font-size: 12px; color: {SUAVE}">{leyenda}</div>
  <svg aria-hidden="true" width="{W}" height="{H}" style="position: absolute; inset: 0"><defs><marker id="punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="{AZUL}"></path></marker></defs>{"".join(paths)}</svg>
  {"".join(cards)}
  {"".join(labels)}
  {nt}
</div>'''
    doc=documento(titulo, '').replace(f'<div style="width: 390px; height: 844px; box-sizing: border-box; background: #FFFFFF; font-family: \'DM Sans\', system-ui, sans-serif; color: {TINTA}; overflow: hidden; position: relative">\n\n</div>', html).replace('{"width":390,"height":844}', f'{{"width":{W},"height":{H}}}')
    open('usuario/project/'+archivo,'w').write(doc)
    return W,H
