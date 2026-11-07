# Arma usuario/project/canvas.json: tablero de revisión arriba, flujos (Mapa primero) y una fila de pantallas por fase.
import json, re
FL = json.load(open('usuario/gen/flujos.json'))
FILAS = [
 ('A · Acceso y alta', 'blue', 'Bienvenida con Mar del Plata en SVG. Invitación, código por email o SMS, Google y Apple; segunda verificación opcional. Datos mínimos y zona aproximada. Al final, «Armá tu casa» (opcional, se salta).',
  'A-Bienvenida A-Invitacion A-Entrar A-Codigo A-Segunda A-Datos A-Zona A-Avisos A-Casa A-CasaAmbientes A-CasaEquipos A-CasaFotos A-Listo'),
 ('I · Inicio y HandIA', 'yellow', 'Inicio como la app real (imagen 2). HandIA encastrada en la barra. Chat con los mensajes abajo y la ilustración solo vacío. Voz sin personaje: esfera de luz, textos livianos y ajustes.',
  'I-Inicio I-HandIA I-HandIAChat I-HandIAPiensa I-HandIAFicha I-Voz I-VozHabla I-VozAjustes I-Avisos'),
 ('P · Pedir un servicio', 'blue', 'Camino corto en 3 toques: rubro › qué pasa › revisar y publicar. Fotos, medidas, día y dirección opcionales, desde Revisar.',
  'P-Rubro P-Que P-Fotos P-Anotar P-Medir P-Cuando P-Fecha P-Zona P-Revisar P-Publicado'),
 ('C · Recibir y comparar propuestas', 'green', 'Cada tarjeta: aceptar, rechazar y ver perfil. «La mejor en perfil y precio» por promedio. Detalle con materiales, equipo y duración; visita si es solo consulta.',
  'C-Buscando C-Propuestas C-Comparar C-Detalle C-Visita C-Certificados C-Cambios C-Rechazar C-Aceptar C-Aceptada'),
 ('S · Seguimiento, informe y pago', 'green', 'Viaje en vivo solo mientras se comparte, con llegada del servidor. Antes y después en deslizador y lado a lado. Pago directo: informado ≠ verificado.',
  'S-Agendado S-EnCamino S-Llego S-Trabajando S-Adicional S-AntesDespues S-LadoALado S-Informe S-Conformidad S-Pagar S-PagoInformado S-Resena'),
 ('O · Obras de varios días y en equipo', 'green', 'Propuesta de obra, días, repuestos y cambios de fecha desde el chat, grupo con el equipo, pagos por etapa según el reparto y total gastado.',
  'O-Propuesta O-Obra O-Dia O-Repuesto O-Fecha O-Grupo O-Pagos O-Gastado'),
 ('M · Mensajes', 'blue', 'Tarjetas que se aceptan o se responden ahí mismo. Nada se manda solo a tus contactos.',
  'M-Mensajes M-Chat M-Seleccion M-Presupuesto M-Adjuntar M-Soporte'),
 ('H · Mi hogar', 'teal', 'Cuatro puertas: Mi casa, Algo se rompió, Mantenimiento, Historial y garantías. Ficha completa con fotos; se comparte con el especialista sin sacar fotos.',
  'H-Hogar H-MiCasa H-Ambiente H-Equipo H-Sumar H-Rompio H-Compartir H-Compartido H-Recordatorios H-Historial H-Garantias H-Modelo3D H-AR'),
 ('T · Herramientas compartidas', 'teal', 'Medir con la cámara, nivel, linterna y lupa, escanear en 3D. Todo termina en el chat o en el pedido. El teléfono no detecta gas ni tensión.',
  'T-Herramientas T-Medir T-Nivel T-Linterna T-Escanear T-Destino'),
 ('G · Camino del hogar', 'yellow', 'Gamificación pensada de cero: se avanza cuidando la casa. Insignias y beneficios sin azar, sin rankings ni presión para contratar. Montos y premios en borrador para Legal.',
  'G-Camino G-Insignias G-Insignia G-Beneficios G-Hito'),
 ('X · Actividad, cuenta, ayuda y errores', 'gray', 'Actividad como pestaña; cuenta desde el avatar. Pagos registrados sin tarjetas, privacidad con HandIA sin datos personales, ayuda premium y errores con Handys.',
  'X-Actividad X-Cuenta X-Datos X-Seguridad X-Pagos X-Privacidad X-Ayuda X-Respuesta X-Error X-SinConexion X-NoEncontrado'),
]
titulo = lambda f: re.search(r'<title>([^<]*)</title>', open('usuario/project/' + f).read()).group(1)
boards, order, notes, nord = {}, [], {}, []
boards['UX-Revision.dc.html'] = {'x': 0, 'y': 0, 'w': 1346, 'h': 800, 'title': 'Revisión UX/UI'}; order.append('UX-Revision.dc.html')
notes['tituloUX'] = {'x': 0, 'y': -300, 'text': 'Handyx · app del usuario', 'kind': 'title1', 'maxW': 1800, 'w': 240}; nord.append('tituloUX')
y = 800 + 260
notes['tituloFlujos'] = {'x': 0, 'y': y, 'text': 'Flujos de la app', 'kind': 'title1', 'maxW': 1800, 'w': 240}; nord.append('tituloFlujos')
y += 300
notes['notaFlujos'] = {'x': 1500, 'y': y, 'w': 420, 'size': 24, 'fill': 'yellow', 'text': 'Empezá por «Mapa de la app». Cada caja es una pantalla (se toca para abrirla), un paso del especialista, algo que hace Handyx u Operations u otro profesional.'}; nord.append('notaFlujos')
for f, t, W, H in FL:
    boards[f] = {'x': 0, 'y': y, 'w': W, 'h': H, 'title': 'Flujo · ' + t}; order.append(f); y += H + 160
y += 200
total = 0
for i, (t, color, nota, lista) in enumerate(FILAS):
    archivos = [a + '.dc.html' for a in lista.split()]
    notes[f'titulo{i}'] = {'x': 0, 'y': y, 'text': t, 'kind': 'title1', 'maxW': len(archivos) * 470, 'w': 240}; nord.append(f'titulo{i}')
    alto_fila = 844
    for k, a in enumerate(archivos):
        m = re.search(r'"width":(\d+),"height":(\d+)', open('usuario/project/' + a).read())
        hh = int(m.group(2)) if m else 844
        alto_fila = max(alto_fila, hh)
        boards[a] = {'x': k * 470, 'y': y + 300, 'w': 390, 'h': hh, 'title': t.split(' · ')[0] + ' · ' + titulo(a)}; order.append(a); total += 1
    notes[f'nota{i}'] = {'x': len(archivos) * 470 + 40, 'y': y + 300, 'w': 380, 'size': 24, 'fill': color, 'text': nota}; nord.append(f'nota{i}')
    y += 300 + alto_fila + 120
c = {'v': 3, 'attachments': [], 'boards': boards, 'createdOnFiles': {'at': '2026-11-07T18:00:00Z', 'v': 1}, 'designSystems': [], 'launch': {'view': 'canvas'},
     'noteOrder': nord, 'notes': notes, 'order': order, 'pages': [], 'title': 'Handyx · Diseño completo de la app del usuario'}
json.dump(c, open('usuario/project/canvas.json', 'w'), ensure_ascii=False, indent=1)
print('lienzo', len(order), 'tableros,', total, 'pantallas')
