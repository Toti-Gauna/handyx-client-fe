// Íconos SVG de línea (24×24, currentColor), copiados de Handy-landing-page-fe/src/render/iconos.ts.
// Decorativos: llevan aria-hidden; el texto accesible va en el control que los contiene.

export const TRAZOS = {
  // Rubros
  rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  canilla:
    '<path d="M4 9h7a3 3 0 0 1 3 3v1"/><path d="M4 6v6"/><path d="M8 9V6h3"/><path d="M7 5h5"/><path d="M14 13h3a2 2 0 0 1 2 2v1"/><path d="M19 19.5c0 .8-.7 1.5-1.5 1.5S16 20.3 16 19.5c0-1 1.5-2.5 1.5-2.5s1.5 1.5 1.5 2.5Z"/>',
  llama:
    '<path d="M12 22c4 0 7-2.7 7-6.7 0-3.4-2.3-5.9-4-7.8-.4 1.8-1.4 3-2.6 3.5C12.9 8 12 4.6 9.5 2 9.6 5.4 5 8.6 5 15.3 5 19.3 8 22 12 22Z"/><path d="M12 22c-1.7 0-3-1.2-3-3 0-2 1.8-3.2 3-4.8 1.2 1.6 3 2.8 3 4.8 0 1.8-1.3 3-3 3Z"/>',
  llave:
    '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8"/><path d="m16 7 3 3"/><path d="m18.5 4.5 2 2"/>',
  ladrillos:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.3h18M3 14.7h18"/><path d="M9 4v5.3M15 4v5.3M12 9.3v5.4M7 14.7V20M17 14.7V20"/>',
  aire: '<rect x="2.5" y="4" width="19" height="9" rx="2"/><path d="M6 10h12"/><path d="M8 16.5c0 1.5-1 2-1 3.5M12 16.5v4M16 16.5c0 1.5 1 2 1 3.5"/>',
  // Confianza
  escudo:
    '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  telefono:
    '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/><path d="M3 3l18 18"/>',
  billetera:
    '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M3 7h16a2 2 0 0 1 2 2v3h-5a2 2 0 0 0 0 4h5"/>',
  // Herramientas del especialista
  interruptor: '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="17" cy="12" r="3"/>',
  etiqueta:
    '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/><path d="M11 14.5c.4.9 1.3 1.5 2.3 1.4 1.2-.1 1.9-1 1.7-2s-1.2-1.3-2.2-1.6-1.9-.8-2-1.8.6-1.8 1.7-1.9c1-.1 1.8.4 2.2 1.2"/>',
  calendario:
    '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12Z"/><path d="M8.5 11h7M8.5 14h4"/>',
  caja: '<path d="M3 10h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z"/><path d="M5 10 7 4h10l2 6"/><path d="M9 15h6"/><path d="M10 7h4"/>',
  // Interfaz
  mas: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  enviar: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5L21 3Z"/>',
  imagen:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-9 9"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  prohibido: '<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
  caminar:
    '<circle cx="13" cy="4.5" r="2"/><path d="M10 21l2-6 3 3v3"/><path d="M8 11l3-3h3l2 4 3 1"/><path d="m12 8-1.5 5"/>',
  abajo: '<path d="m6 9 6 6 6-6"/>',
  izquierda: '<path d="m15 6-6 6 6 6"/>',
  derecha: '<path d="m9 6 6 6-6 6"/>',
  maletin:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
  camara:
    '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  expandir: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  pausa: '<path d="M8 5v14M16 5v14"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5Z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  campana: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z"/><path d="M10 21h4"/>',
  casa: '<path d="M3 11 12 3l9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  alerta: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
  verificado:
    '<path d="m12 2 2.4 1.8 3 .1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3 .1L12 22l-2.4-1.8-3-.1-.9-2.9-2.4-1.8.9-2.9-.9-2.9 2.4-1.8.9-2.9 3-.1Z"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>',
  reintentar:
    '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
  // Demo (cuenta, avisos, chat, calificación)
  arriba: '<path d="m6 15 6-6 6 6"/>',
  engranaje:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  tacho:
    '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M9 7V4h6v3"/>',
  pregunta:
    '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.6"/><path d="M12 17h.01"/>',
  salir:
    '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>',
  contactos:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.9 4.5 4.5"/>',
  checkCirculo: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  estrella:
    '<path stroke-width="1.8" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9Z"/>',
  whatsapp:
    '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1l-4.7 1.4Z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2L9 8.5Z"/>',
  // Demo · usuario
  lupa: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  chispas:
    '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.5 6.5 2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/>',
  // Demo · usuario (ronda 3)
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  foco: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z"/>',
  mueble:
    '<rect x="4" y="4" width="16" height="13" rx="1.5"/><path d="M4 10.5h16"/><path d="M11 7.2h2M11 13.8h2"/><path d="M6 17v3M18 17v3"/>',
  ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  ojoTachado:
    '<path d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .4 4.2 1M21.5 12s-1.2 2.3-3.5 4.1M14.1 14.1a3 3 0 0 1-4.2-4.2"/><path d="M12 18.5c-6 0-9.5-6.5-9.5-6.5s.9-1.7 2.6-3.3"/><path d="m3.5 3.5 17 17"/>',
  sobre: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  tarjeta:
    '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/><path d="M6.5 15h4"/>',
  // HandIA premium · modo voz
  microfono:
    '<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5v3.5"/><path d="M8.5 21h7"/>',
  parlante:
    '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  teclado:
    '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h1M10.5 10h1M14.5 10h1M17.5 10h.5M6.5 14h11"/>',
  microfonoNo:
    '<path d="M9 9v2a3 3 0 0 0 5.1 2.1M15 9.3V5.5a3 3 0 0 0-5.7-1.3"/><path d="M5.5 11a6.5 6.5 0 0 0 11 4.7M18.5 11c0 .6-.1 1.2-.2 1.8"/><path d="M12 17.5v3.5M8.5 21h7"/><path d="M3 3l18 18"/>',
  ajustes:
    '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  candado:
    '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  nuevoChat:
    '<path d="M12 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V12"/><path d="M17.6 3.6a1.9 1.9 0 0 1 2.8 2.8L13 13.8l-3.5.7.7-3.5 7.4-7.4Z"/>',
  // Propios de HandIA (R3): la lamparita como marca, la onda de voz, subtítulos, encuadre de cámara y sin señal.
  handia:
    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.3V16h6v-.9c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3Z"/><path d="M12 7.5v1M10 9.5h.01M14 9.5h.01M10.5 11.5c.9.7 2.1.7 3 0"/>',
  onda: '<path d="M3 12h1M7 8v8M11 5v14M15 9v6M19 7v10M22 12h-1"/>',
  subtitulos:
    '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M6.5 11.5h5M13.5 11.5h4M6.5 15h3M11.5 15h6"/>',
  encuadre:
    '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3.5"/>',
  sinSenal:
    '<path d="M3 3l18 18"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M14.5 10.3A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.3-2.7M10.7 5.1A15 15 0 0 1 22 9.5"/><path d="M12 20h.01"/>',
  vibrar:
    '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 9v6M20 9v6M2 11v2M22 11v2"/>',
  // Lienzo de la app del usuario (design/usuario): Mi hogar, herramientas, camino, chat y pagos
  hogar:
    '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M12 15.5c-1.6-1.3-3-2.2-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.4-1.4 2.3-3 3.6Z"/>',
  regla: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v4M10 7v3M14 7v4M18 7v3"/>',
  cubo: '<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="M3 7l9 5 9-5M12 12v10"/>',
  ar: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M12 7l5 3v5l-5 3-5-3v-5l5-3Z"/>',
  nivel:
    '<rect x="2" y="8" width="20" height="8" rx="2"/><rect x="9" y="10" width="6" height="4" rx="2"/><path d="M12 10v4"/>',
  linterna: '<path d="M8 2h8v5l-2 3v12h-4V10L8 7V2Z"/><path d="M8 7h8M12 14v2"/>',
  trofeo:
    '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4"/>',
  compartir:
    '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  personas:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.6.2 4.6 1.9 5.4 5.4"/>',
  ducha:
    '<path d="M4 20V8a4 4 0 0 1 8 0"/><path d="M9 8h6"/><path d="M10 12v1M13 12v1M16 12v1M11.5 15v1M14.5 15v1"/>',
  sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2v-5Z"/><path d="M5 17v2M19 17v2"/>',
  cama: '<path d="M3 18V7M21 18v-5a3 3 0 0 0-3-3h-8v6"/><path d="M3 15h18"/><circle cx="6.5" cy="11" r="2"/>',
  cocina:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16"/><rect x="8" y="12" width="8" height="6" rx="1"/>',
  lavarropas:
    '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M7 5.5h3"/>',
  termometro: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0Z"/>',
  copiar:
    '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  reenviar: '<path d="m14 5 7 7-7 7"/><path d="M21 12H9a6 6 0 0 0-6 6v1"/>',
  medalla: '<circle cx="12" cy="15" r="6"/><path d="M8.5 9.5 6 2h4l2 5 2-5h4l-2.5 7.5"/>',
  regalo:
    '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9Zm0 0c2-4 6-4 6-1.5S14 9 12 9Z"/>',
  pulgar:
    '<path d="M7 11v10H4V11h3Z"/><path d="M7 11l4-8a2 2 0 0 1 2.7 2.3L13 9h5.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.1 20H7"/>',
  documento: '<path d="M6 2h9l5 5v15H6V2Z"/><path d="M14 2v6h6M9 13h8M9 17h6"/>',
  grafico: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  columnas:
    '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/>',
  deslizar: '<path d="M12 3v18"/><path d="m7 8-4 4 4 4M17 8l4 4-4 4"/>',
  obra: '<path d="M3 21h18"/><path d="M5 21V11l7-5 7 5v10"/><path d="M10 21v-6h4v6"/>',
  tornillo:
    '<path d="M9 3h6l-1 4h-4L9 3Z"/><path d="M12 7v13M9.5 10l5 1.5M9.5 13l5 1.5M9.5 16l5 1.5"/>',
  billete:
    '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  efectivo:
    '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9v6M19 9v6"/>',
  filtro: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  onda2: '<path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2"/>',
} as const satisfies Record<string, string>;

export type NombreIcono = keyof typeof TRAZOS;
