# Recorridos con pantallas (copiado de handyx-specialist-fe/design/deluxe/gen/recorridos.py y adaptado):
# cada paso muestra la pantalla real en miniatura, su número, qué es y cómo se llega; en amarillo, lo que pasa entre pantallas.
import sys, re, json; sys.path.insert(0,'usuario/gen')
from piezas_u import *
DESC=json.load(open('usuario/gen/descripciones.json'))
D='usuario/project/'
ESC=0.5; TW=195; GAP=104; POR_FILA=6
def miniatura(f):
    h=open(D+f+'.dc.html').read()
    raiz=h.split('<x-dc>')[1].split('</x-dc>')[0]
    raiz=re.sub(r'<helmet>[\s\S]*?</helmet>','',raiz).strip()
    raiz=re.sub(r' tabindex="\d+"','',raiz)
    raiz=re.sub(r'<a ','<span ',raiz).replace('</a>','</span>')
    raiz=re.sub(r'<button ','<span data-b="1" ',raiz).replace('</button>','</span>')
    raiz=re.sub(r' role="(button|switch|tab|tablist|radio|radiogroup|checkbox|listbox|option|img|dialog|toolbar|progressbar|status|note|group)"','',raiz)
    raiz=re.sub(r'<input([^>]*?) value="([^"]*)"([^>]*)>', r'<span data-i="1"\1\3>\2</span>', raiz)
    raiz=re.sub(r'<input([^>]*?) placeholder="([^"]*)"([^>]*)>', r'<span data-i="1"\1\3>\2</span>', raiz)
    raiz=re.sub(r'<input([^>]*)>', r'<span data-i="1"\1></span>', raiz)
    raiz=re.sub(r'<textarea([^>]*)>(.*?)</textarea>', r'<span data-i="1"\1>\2</span>', raiz, flags=re.S)
    raiz=re.sub(r'<(/?)(label|details|summary)\b', r'<\1span', raiz)
    raiz=re.sub(r' (readonly|open|disabled)(?=[ >])', '', raiz)
    raiz=re.sub(r' data-[cfx]="1"','',raiz)
    raiz=re.sub(r'<h([1-6])\b', r'<div data-h="\1"', raiz); raiz=re.sub(r'</h[1-6]>', '</div>', raiz)
    m=re.search(r'"width":(\d+),"height":(\d+)',h); w,hh=int(m.group(1)),int(m.group(2))
    e=TW/w
    return raiz, int(hh*e), e, w
def recorrido(archivo, titulo, sub, pasos):
    # pasos: (pantalla, leyenda, evento_antes)
    filas=[pasos[i:i+POR_FILA] for i in range(0,len(pasos),POR_FILA)]
    y=150; bloques=[]; n=0
    for fila in filas:
        alturas=[miniatura(p[0])[1] for p in fila]; hmax=max(alturas)
        for k,(f,ley,ev) in enumerate(fila):
            n+=1; raiz,th,esc,wo=miniatura(f); x=40+k*(TW+GAP)
            if ev:
                bloques.append(f'<div style="position: absolute; left: {x-GAP+6}px; top: {y+90}px; width: {GAP-12}px; padding: 6px 8px; border-radius: 14px; background: {AMARILLO}; font-size: 11px; font-weight: 800; text-align: center; line-height: 1.2; box-shadow: 0 3px 0 #C9C85A">{ev}</div>') if k>0 else bloques.append(f'<div style="position: absolute; left: {x}px; top: {y-34}px; padding: 5px 10px; border-radius: 12px; background: {AMARILLO}; font-size: 11px; font-weight: 800">{ev} ↓</div>')
            if k>0:
                bloques.append(f'<svg aria-hidden="true" style="position: absolute; left: {x-GAP+10}px; top: {y+170}px" width="{GAP-20}" height="20"><line x1="0" y1="10" x2="{GAP-32}" y2="10" stroke="{AZUL}" stroke-width="3" stroke-linecap="round"></line><path d="M{GAP-34} 3 L{GAP-22} 10 L{GAP-34} 17 Z" fill="{AZUL}"></path></svg>')
            bloques.append(f'<div aria-hidden="true" style="position: absolute; left: {x}px; top: {y}px; width: {TW}px; height: {th}px; border-radius: 22px; overflow: hidden; box-shadow: 0 0 0 1px {BORDE}, {ELEV2}"><div style="width: {wo}px; transform: scale({esc}); transform-origin: 0 0; pointer-events: none">{raiz}</div></div>')
            d=DESC.get(f,{}); que=d.get('que',''); lleg=d.get('llegas',[])[:2]
            ll=(f'<span style="font-size: 11px; line-height: 1.35; color: {SUAVE}"><strong style="color: {HONDO}">Cómo llegás:</strong> '+' · '.join(lleg)+'</span>') if lleg else ''
            bloques.append(f'<div style="position: absolute; left: {x}px; top: {y+th+12}px; width: {TW}px; display: flex; flex-direction: column; gap: 6px"><div style="display: flex; gap: 8px; align-items: flex-start"><span style="width: 26px; height: 26px; flex: none; border-radius: 50%; background: {AZUL}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900">{n}</span><a href="{f}.dc.html" style="flex: 1; display: flex; align-items: center; font-size: 14px; font-weight: 800; line-height: 1.2; color: {TINTA}; text-decoration: none; min-height: 44px">{ley}</a></div><span style="font-size: 12px; line-height: 1.4; color: {TEXTO}">{que}</span>{ll}</div>')
        y+=hmax+340
    W=40+POR_FILA*TW+(POR_FILA-1)*GAP+40 if len(pasos)>=POR_FILA else 40+len(pasos)*TW+(len(pasos)-1)*GAP+40
    W=max(W,1100); H=y-120
    html=f'''<div style="width: {W}px; height: {H}px; box-sizing: border-box; background: #F6F7F9; font-family: 'DM Sans', system-ui, sans-serif; color: {TINTA}; position: relative; overflow: hidden">
  <div style="position: absolute; left: 40px; top: 32px; display: flex; flex-direction: column; gap: 6px">{etiqueta("RECORRIDO CON PANTALLAS", AZUL)}<h1 style="margin: 0; {TIT}; font-size: 34px; line-height: 1">{titulo}</h1><span style="font-size: 14px; color: {SUAVE}">{sub}</span></div>
  <div style="position: absolute; right: 40px; top: 40px; display: flex; gap: 14px; font-size: 12px; color: {SUAVE}"><span style="display: inline-flex; gap: 6px; align-items: center"><span style="width: 18px; height: 12px; border-radius: 4px; background: {AMARILLO}"></span>Lo que pasa entre pantallas</span><span style="display: inline-flex; gap: 6px; align-items: center"><span style="width: 18px; height: 12px; border-radius: 4px; background: {AZUL}"></span>Orden del recorrido</span></div>
  <style>[data-b]{{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;text-align:center;font:inherit}}[data-b][style*="text-align: left"]{{justify-content:flex-start;text-align:left}}[data-i]{{display:flex;align-items:center;box-sizing:border-box}}</style>
  {"".join(bloques)}
</div>'''
    doc=documento(titulo,'').replace(f'<div style="width: 390px; height: 844px; box-sizing: border-box; background: #FFFFFF; font-family: \'DM Sans\', system-ui, sans-serif; color: {TINTA}; overflow: hidden; position: relative">\n\n</div>', html).replace('{"width":390,"height":844}', f'{{"width":{W},"height":{H}}}')
    open(D+archivo,'w').write(doc); return (archivo,titulo,W,H)

R=[]
R.append(recorrido('RC-Alta.dc.html','Crear cuenta y armar tu casa','Registro directo, sin contraseña. Al final, «Armá tu casa» es opcional y se puede saltar.',[
 ('A-Bienvenida','Bienvenida: «Crear cuenta»',None),('A-Entrar','Email, SMS, Google o Apple',None),('A-Codigo','El código de 6 números',None),('A-Datos','Nombre y celular',None),('A-Zona','Tu zona',None),('A-Avisos','Qué avisos querés',None),
 ('A-Casa','Armá tu casa (opcional)','Primera vez'),('A-CasaAmbientes','Ambientes',None),('A-CasaEquipos','Equipos',None),('A-CasaFotos','Una foto por ambiente',None),('A-Listo','¡Listo! Tarifa 0 %',None),('I-Inicio','Primer ingreso',None)]))
R.append(recorrido('RC-Entrar.dc.html','Volver a entrar','Sin contraseñas: código por email o SMS, o Google y Apple; la segunda verificación si la activaste.',[
 ('A-Bienvenida','«Ya tengo cuenta»',None),('A-Entrar','Cómo entrar',None),('A-Codigo','Código',None),('I-Inicio','Adentro',None),('A-Segunda','Activar la segunda verificación','Opcional'),('X-Seguridad','Sesiones abiertas','Desde Cuenta')]))
R.append(recorrido('RC-Pedir.dc.html','Pedir un arreglo','Camino corto en 3 toques; fotos, medidas, día y dirección son opcionales y se cambian desde Revisar.',[
 ('I-Inicio','Tocás un rubro',None),('P-Que','1 · ¿Qué pasa?','Toca «Plomería»'),('P-Revisar','2 · Revisar y publicar','Camino corto'),('P-Publicado','Publicado','Publicar'),('C-Buscando','Llegan propuestas',None),
 ('P-Fotos','Sumar fotos (opcional)','Si querés'),('P-Anotar','Anotar la foto',None),('P-Medir','Medir con la cámara',None),('P-Cuando','Cambiar cuándo','Desde Revisar'),('P-Fecha','Día y franja',None),('P-Zona','Cambiar dónde','Desde Revisar'),('P-Rubro','Si no hay rubro elegido','Otra entrada')]))
R.append(recorrido('RC-HandIA.dc.html','Pedir con HandIA','HandIA conversa en el celular, sin IA externa: pregunta lo justo, avisa riesgos y arma la ficha que revisás.',[
 ('I-Inicio','«Contale a HandIA»',None),('I-HandIA','Chat vacío',None),('I-HandIAChat','Le contás qué pasa','Escribís'),('I-HandIAPiensa','Piensa y te avisa el riesgo',None),('I-HandIAFicha','La ficha del pedido',None),('P-Revisar','Revisar y publicar','«Pedir así»'),
 ('I-Voz','O por voz: te escucha','Toca la onda'),('I-VozHabla','Te responde',None),('I-VozAjustes','Ajustes del modo voz',None)]))
R.append(recorrido('RC-Propuestas.dc.html','Elegir una propuesta','Cada tarjeta trae aceptar, rechazar y ver perfil; la mejor en perfil y precio sale de un promedio.',[
 ('C-Buscando','Tu pedido',None),('C-Propuestas','Las propuestas','Llegan'),('C-Comparar','Comparar lado a lado',None),('C-Detalle','Detalle de una',None),('C-Certificados','Perfil del especialista',None),('C-Aceptar','Aceptar','Te convence'),
 ('C-Aceptada','Turno confirmado',None),('C-Cambios','Pedir cambios','Otra opción'),('C-Rechazar','Rechazar','Otra opción'),('C-Visita','Si es solo una consulta','Otra opción')]))
R.append(recorrido('RC-Trabajo.dc.html','Del turno al pago','El viaje en vivo solo mientras se comparte; pago directo, informado ≠ verificado.',[
 ('S-Agendado','Tu turno',None),('S-EnCamino','En camino','Sale para tu casa'),('S-Llego','Llegó: el código',None),('S-Trabajando','Trabajando','Abrís la puerta'),('S-Adicional','Un adicional','Si hace falta'),('S-AntesDespues','Antes y después','Termina'),
 ('S-LadoALado','Lado a lado',None),('S-Informe','Informe con garantía',None),('S-Conformidad','Conformidad',None),('S-Pagar','Pagar directo',None),('S-PagoInformado','Pago informado',None),('S-Resena','Reseña (opcional)',None)]))
R.append(recorrido('RC-Obra.dc.html','Una obra de varios días','Propuesta por etapas, días, repuestos y fechas desde el chat, equipo y pagos por etapa.',[
 ('M-Chat','Llega la propuesta',None),('O-Propuesta','Propuesta de obra',None),('O-Obra','Tu obra','La aprobás'),('O-Dia','Una jornada',None),('O-Repuesto','Un repuesto','Lo pide'),('O-Fecha','Mover un día','Lo propone'),
 ('O-Grupo','Chat de la obra',None),('O-Pagos','Pagos por etapa','Termina una etapa'),('O-Gastado','Lo gastado',None)]))
R.append(recorrido('RC-Mensajes.dc.html','Mensajes y tarjetas','Cada chat atado a un pedido u obra; las tarjetas se aceptan ahí mismo.',[
 ('M-Mensajes','Tus mensajes',None),('M-Chat','Chat con tarjetas',None),('C-Aceptar','Aceptar desde la tarjeta',None),('M-Presupuesto','Un presupuesto',None),('M-Adjuntar','Sumar algo al chat',None),('T-Destino','¿A dónde va?',None),
 ('O-Grupo','Chat de la obra',None),('M-Seleccion','Seleccionar mensajes','Mantener apretado'),('M-Soporte','Soporte de Handyx',None)]))
R.append(recorrido('RC-Hogar.dc.html','Mi hogar','Cuatro puertas, cada una con su camino; lo que compartís es por pedido.',[
 ('H-Hogar','Mi hogar',None),('H-MiCasa','A · Mi casa',None),('H-Ambiente','Un ambiente',None),('H-Equipo','Un equipo',None),('H-Sumar','Sumar algo',None),('H-Rompio','B · Algo se rompió','Desde Mi hogar'),
 ('P-Que','El pedido sale armado',None),('H-Compartir','Qué compartís',None),('H-Compartido','Lo que compartiste',None),('H-Recordatorios','C · Mantenimiento','Desde Mi hogar'),('H-Historial','D · Historial','Desde Mi hogar'),('H-Garantias','Garantías',None)]))
R.append(recorrido('RC-Herramientas.dc.html','Herramientas, 3D y AR','Las mismas del especialista; todo termina en el chat o en el pedido.',[
 ('T-Herramientas','Tus herramientas',None),('T-Medir','Medir',None),('T-Nivel','Nivel',None),('T-Linterna','Linterna y lupa',None),('T-Escanear','Escanear en 3D',None),('H-Modelo3D','Modelo 3D',None),
 ('H-AR','Ver en AR',None),('T-Destino','¿A dónde va?',None)]))
R.append(recorrido('RC-Camino.dc.html','Camino del hogar','Se avanza cuidando la casa; sin azar, sin rankings y montos en borrador para Legal.',[
 ('G-Camino','Tu camino',None),('G-Insignias','Insignias',None),('G-Insignia','Una insignia',None),('G-Beneficios','Beneficios',None),('H-Recordatorios','Mantenimiento a tiempo','Suma'),('G-Hito','¡Insignia nueva!','Lográs un hito')]))
R.append(recorrido('RC-Actividad.dc.html','Actividad y avisos','Lo que está en curso, la agenda y el historial; los avisos llevan al detalle.',[
 ('X-Actividad','Actividad',None),('S-Agendado','Un turno',None),('O-Obra','Una obra',None),('M-Presupuesto','Un presupuesto',None),('I-Avisos','Avisos','La campana'),('H-Historial','Historial',None)]))
R.append(recorrido('RC-Cuenta.dc.html','Cuenta, ayuda y errores','Todo lo tuyo desde el avatar; ayuda con personas y errores que no dan nada por hecho.',[
 ('I-Inicio','Tu avatar',None),('X-Cuenta','Tu cuenta',None),('X-Datos','Datos y direcciones',None),('X-Seguridad','Seguridad',None),('X-Pagos','Pagos registrados',None),('X-Privacidad','Privacidad',None),
 ('X-Ayuda','Ayuda',None),('X-Respuesta','Una respuesta',None),('M-Soporte','Soporte',None),('X-Error','Algo falló','Aparece solo'),('X-SinConexion','Sin conexión','Aparece solo'),('X-NoEncontrado','No encontrada','Aparece solo')]))
json.dump(R,open('usuario/gen/recorridos.json','w'))
print([(a,w,h) for a,t,w,h in R])
