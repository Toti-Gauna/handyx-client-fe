// Contenido del prototipo de HandIA (fase R). Solo textos de ejemplo, ficticios.

export type Direccion = 'calida' | 'noche' | 'vidrio';
export type EstadoVoz = 'reposo' | 'escuchando' | 'pensando' | 'hablando' | 'listo';
export type EstadoChat = 'vacio' | 'pensando' | 'respuesta' | 'ficha' | 'riesgo';

export const DIRECCIONES: readonly {
  id: Direccion;
  nombre: string;
  idea: string;
  claves: readonly string[];
}[] = [
  {
    id: 'calida',
    nombre: 'Luz cálida',
    idea: 'La lamparita es la fuente de luz: un resplandor ámbar que calienta el azul de la noche. Cercana, de casa.',
    claves: [
      'Fondo azul noche con la luz saliendo del personaje',
      'Chat sobre papel cálido, burbujas de HandIA en miel',
      'Lo más fiel a la landing: azul + amarillo',
    ],
  },
  {
    id: 'noche',
    nombre: 'Noche azul',
    idea: 'Oscura y precisa: casi negro, brillo azul que sube desde los controles y texto grande. Tecnología seria.',
    claves: [
      'Tema oscuro también en el chat',
      'La luz nace de la pastilla de controles',
      'Transcripción en vivo grande, tipo subtítulo',
    ],
  },
  {
    id: 'vidrio',
    nombre: 'Vidrio y brillo',
    idea: 'Clara y con volumen: manchas de color que flotan detrás de tarjetas de vidrio esmerilado. Fresca, de producto nuevo.',
    claves: [
      'Fondo claro con degradé vivo (azul, celeste y miel)',
      'Tarjetas y controles de vidrio con desenfoque',
      'El orbe es una esfera de vidrio con la lamparita adentro',
    ],
  },
];

export const ESTADOS_VOZ: readonly {
  id: EstadoVoz;
  nombre: string;
  rotulo: string;
  accion: string;
}[] = [
  { id: 'reposo', nombre: 'Lista', rotulo: 'Lista para escucharte', accion: 'Empezar a hablar' },
  { id: 'escuchando', nombre: 'Escucha', rotulo: 'Te escucho', accion: 'Terminar de hablar' },
  { id: 'pensando', nombre: 'Piensa', rotulo: 'Pensando', accion: 'Seguir' },
  {
    id: 'hablando',
    nombre: 'Habla',
    rotulo: 'Hablando · tocá para interrumpir',
    accion: 'Interrumpir',
  },
  { id: 'listo', nombre: 'Encontró', rotulo: 'Pedido listo', accion: 'Revisar el pedido' },
];

export const ESTADOS_CHAT: readonly { id: EstadoChat; nombre: string; subtitulo: string }[] = [
  { id: 'vacio', nombre: 'Bienvenida', subtitulo: 'En tu celular' },
  { id: 'pensando', nombre: 'Pensando', subtitulo: 'Pensando…' },
  { id: 'respuesta', nombre: 'Pregunta', subtitulo: 'Armando tu pedido' },
  { id: 'ficha', nombre: 'Ficha', subtitulo: 'Pedido listo para revisar' },
  { id: 'riesgo', nombre: 'Riesgo', subtitulo: 'Primero, tu seguridad' },
];
