// Guías de HandIA por rubro (rama handia-premium): las preguntas cortas que hace un especialista antes de cotizar.
// Cada respuesta suma un dato al pedido para que las propuestas lleguen más precisas. Todo corre en el celular:
// nada de esto sale hacia una IA (reglas del bloque). Las claves van en minúsculas y sin acentos.
import type { Rubro } from '@/contracts/v1/pedidos';

export interface OpcionGuia {
  readonly id: string;
  /** Lo que se ve en el botón y lo que se lee en voz alta. */
  readonly texto: string;
  /** Cómo queda en el pedido ("En el baño"). */
  readonly detalle: string;
  /** Palabras que, dichas o escritas, eligen esta opción. */
  readonly claves: readonly string[];
}

export interface PreguntaGuia {
  readonly id: string;
  readonly texto: string;
  readonly opciones: readonly OpcionGuia[];
  /** Solo se pregunta si se cumple (p. ej. la llave de paso, solo si pierde agua). */
  readonly si?: (respuestas: Readonly<Record<string, string>>) => boolean;
}

const o = (id: string, texto: string, detalle: string, claves: readonly string[]): OpcionGuia => ({
  id,
  texto,
  detalle,
  claves,
});

const DESDE: PreguntaGuia = {
  id: 'desde',
  texto: '¿Desde cuándo pasa?',
  opciones: [
    o('hoy', 'Desde hoy', 'Pasa desde hoy', [
      'hoy',
      'recien',
      'ahora',
      'esta manana',
      'esta tarde',
      'esta noche',
    ]),
    o('dias', 'Hace unos días', 'Pasa hace unos días', ['ayer', 'dias', 'esta semana', 'semana']),
    o('tiempo', 'Hace tiempo', 'Pasa hace tiempo', [
      'mes',
      'meses',
      'ano',
      'siempre',
      'hace tiempo',
      'tiempo',
    ]),
  ],
};

export const GUIAS: Record<Rubro, readonly PreguntaGuia[]> = {
  plomeria: [
    {
      id: 'donde',
      texto: '¿Dónde es?',
      opciones: [
        o('cocina', 'Cocina', 'En la cocina', ['cocina', 'pileta de la cocina', 'bacha']),
        o('bano', 'Baño', 'En el baño', [
          'bano',
          'inodoro',
          'ducha',
          'bidet',
          'mochila',
          'lavatorio',
          'banera',
        ]),
        o('lavadero', 'Lavadero', 'En el lavadero', ['lavadero', 'lavarropas']),
        o('afuera', 'Afuera o patio', 'Afuera o en el patio', [
          'patio',
          'afuera',
          'terraza',
          'jardin',
          'vereda',
          'tanque',
        ]),
      ],
    },
    {
      id: 'que',
      texto: '¿Qué pasa?',
      opciones: [
        o('pierde', 'Pierde o gotea', 'Pierde o gotea', [
          'pierde',
          'gotea',
          'perdida',
          'chorrea',
          'filtra',
          'mancha de agua',
        ]),
        o('tapado', 'Está tapado', 'Está tapado', [
          'tapad',
          'se tapo',
          'tapo',
          'no traga',
          'no baja',
          'no desagota',
          'atascad',
          'atasco',
          'obstruid',
        ]),
        o('sin_agua', 'No sale agua o sale poca', 'No sale agua o sale con poca presión', [
          'no sale',
          'no hay agua',
          'sin agua',
          'poca presion',
          'sale poca',
        ]),
        o('cambiar', 'Cambiar o instalar algo', 'Hay que cambiar o instalar algo', [
          'cambiar',
          'instalar',
          'colocar',
          'poner',
          'nuevo',
          'nueva',
        ]),
      ],
    },
    {
      id: 'llave',
      texto: '¿Pudiste cerrar la llave de paso?',
      si: (r) => r.que === 'pierde',
      opciones: [
        o('si', 'Sí, la cerré', 'Ya cerró la llave de paso', [
          'si',
          'la cerre',
          'cerrada',
          'cerre',
        ]),
        o('no', 'Todavía no', 'Todavía no cerró la llave de paso', ['no', 'todavia no', 'abierta']),
        o('no_se', 'No sé dónde está', 'No sabe dónde está la llave de paso', [
          'no se donde',
          'no la encuentro',
          'donde esta',
          'no se',
        ]),
      ],
    },
    DESDE,
  ],
  electricidad: [
    {
      id: 'que',
      texto: '¿Qué pasa?',
      opciones: [
        o('termica', 'Salta la térmica', 'Salta la térmica o el disyuntor', [
          'termica',
          'disyuntor',
          'salta',
          'se baja',
          'salto',
        ]),
        o('enchufe', 'Un enchufe o una tecla no anda', 'Un enchufe o una tecla no anda', [
          'enchufe',
          'tomacorriente',
          'tecla',
          'interruptor',
          'toma',
        ]),
        o('sin_luz', 'Se cortó la luz en parte de la casa', 'Se cortó la luz en parte de la casa', [
          'sin luz',
          'no hay luz',
          'se corto la luz',
          'no anda la luz',
          'apagon',
        ]),
        o('instalar', 'Instalar algo nuevo', 'Hay que instalar algo nuevo', [
          'instalar',
          'colocar',
          'poner',
          'nuevo',
          'lampara',
          'ventilador',
          'agregar',
        ]),
      ],
    },
    {
      id: 'alcance',
      texto: '¿Afecta a toda la casa o a una parte?',
      si: (r) => r.que !== 'instalar',
      opciones: [
        o('toda', 'Toda la casa', 'Afecta a toda la casa', [
          'toda la casa',
          'toda',
          'todo',
          'entera',
          'completa',
        ]),
        o('parte', 'Una parte', 'Afecta a una parte de la casa', [
          'parte',
          'un ambiente',
          'una habitacion',
          'cocina',
          'bano',
          'dormitorio',
          'living',
        ]),
        o('uno', 'Un solo lugar', 'Afecta a un solo enchufe o artefacto', [
          'uno solo',
          'una sola',
          'solo uno',
          'un enchufe',
          'un artefacto',
        ]),
      ],
    },
    DESDE,
  ],
  gas: [
    {
      id: 'artefacto',
      texto: '¿Qué artefacto es?',
      opciones: [
        o('calefon', 'Calefón o termotanque', 'Calefón o termotanque', [
          'calefon',
          'termotanque',
          'caldera',
        ]),
        o('estufa', 'Estufa', 'Estufa', ['estufa', 'calefactor', 'tiro balanceado', 'pantalla']),
        o('cocina', 'Cocina u horno', 'Cocina u horno', ['cocina', 'horno', 'hornalla', 'anafe']),
        o('instalacion', 'La instalación o una garrafa', 'Instalación o garrafa', [
          'instalacion',
          'garrafa',
          'cano',
          'medidor',
          'conexion',
          'flexible',
        ]),
      ],
    },
    {
      id: 'sintoma',
      texto: '¿Qué le pasa?',
      opciones: [
        o('no_enciende', 'No enciende', 'No enciende', [
          'no enciende',
          'no prende',
          'no arranca',
          'piloto',
        ]),
        o('se_apaga', 'Se apaga solo', 'Se apaga solo', ['se apaga', 'se corta']),
        o('llama', 'Llama amarilla o con hollín', 'La llama sale amarilla o con hollín', [
          'amarilla',
          'naranja',
          'hollin',
          'tizne',
          'humo negro',
        ]),
        o('revision', 'Revisión o instalación', 'Necesita revisión o instalación', [
          'revision',
          'revisar',
          'instalar',
          'colocar',
          'conectar',
          'control',
        ]),
      ],
    },
    DESDE,
  ],
  cerrajeria: [
    {
      id: 'situacion',
      texto: '¿Qué necesitás?',
      opciones: [
        o('afuera', 'Me quedé afuera', 'Quedó afuera y no puede entrar', [
          'me quede afuera',
          'quede afuera',
          'no puedo entrar',
          'perdi la llave',
          'perdi las llaves',
          'se cerro',
        ]),
        o('falla', 'La cerradura anda mal', 'La cerradura anda mal', [
          'trabad',
          'se trabo',
          'trabo',
          'no abre',
          'no cierra',
          'dura',
          'no gira',
          'rota',
          'se rompio',
        ]),
        o('cambiar', 'Cambiar la cerradura', 'Quiere cambiar la cerradura o la combinación', [
          'cambiar',
          'nueva',
          'combinacion',
          'mudanza',
          'seguridad',
        ]),
        o('otro', 'Un mueble, candado o reja', 'Es un mueble, un candado o una reja', [
          'mueble',
          'candado',
          'reja',
          'porton',
          'placard',
          'cajon',
        ]),
      ],
    },
    {
      id: 'puerta',
      texto: '¿Qué puerta es?',
      si: (r) => r.situacion !== 'otro',
      opciones: [
        o('entrada', 'La de entrada', 'Puerta de entrada', [
          'entrada',
          'calle',
          'principal',
          'frente',
        ]),
        o('depto', 'De departamento', 'Puerta de departamento', [
          'departamento',
          'depto',
          'edificio',
        ]),
        o('interior', 'Una interior', 'Puerta interior', [
          'interior',
          'pieza',
          'dormitorio',
          'bano',
          'habitacion',
        ]),
      ],
    },
  ],
  albanileria: [
    {
      id: 'que',
      texto: '¿Qué hay que arreglar?',
      opciones: [
        o('humedad', 'Humedad o manchas', 'Humedad o manchas', [
          'humedad',
          'mancha',
          'moho',
          'hongo',
          'filtracion',
          'gotera',
        ]),
        o('grieta', 'Grieta o fisura', 'Grieta o fisura', ['grieta', 'fisura', 'rajadura', 'raja']),
        o('revoque', 'Revoque o pintura que se cae', 'Revoque o pintura que se cae', [
          'revoque',
          'descascar',
          'se cae',
          'pintura',
          'salitre',
        ]),
        o('pisos', 'Baldosas o cerámicos', 'Baldosas o cerámicos', [
          'baldosa',
          'ceramica',
          'ceramico',
          'piso',
          'azulejo',
          'zocalo',
        ]),
      ],
    },
    {
      id: 'donde',
      texto: '¿Dónde?',
      opciones: [
        o('interior', 'Pared de adentro', 'En una pared interior', [
          'adentro',
          'interior',
          'living',
          'cocina',
          'bano',
          'dormitorio',
          'habitacion',
        ]),
        o('exterior', 'Pared de afuera', 'En una pared exterior', [
          'afuera',
          'exterior',
          'fachada',
          'medianera',
          'patio',
        ]),
        o('techo', 'Techo', 'En el techo', ['techo', 'cielorraso', 'losa', 'terraza']),
        o('piso', 'Piso', 'En el piso', ['piso', 'suelo', 'contrapiso']),
      ],
    },
    {
      id: 'tamano',
      texto: '¿Qué tan grande es?',
      opciones: [
        o('chico', 'Chico (como una baldosa)', 'Es chico (como una baldosa)', [
          'chico',
          'chica',
          'pequen',
          'poco',
          'baldosa',
        ]),
        o('mediano', 'Mediano (como una puerta)', 'Es mediano (como una puerta)', [
          'mediano',
          'mediana',
          'puerta',
          'metro',
        ]),
        o('grande', 'Grande (una pared entera)', 'Es grande (una pared entera o más)', [
          'grande',
          'toda la pared',
          'entera',
          'mucho',
          'varios',
        ]),
      ],
    },
  ],
  aire_acondicionado: [
    {
      id: 'que',
      texto: '¿Qué necesitás?',
      opciones: [
        o('no_enfria', 'No enfría o no calienta', 'No enfría o no calienta', [
          'no enfria',
          'enfria poco',
          'no calienta',
          'calienta poco',
          'no tira frio',
          'aire caliente',
        ]),
        o('gotea', 'Gotea agua', 'Gotea agua', ['gotea', 'pierde agua', 'chorrea', 'agua']),
        o('ruido', 'Hace ruido o no prende', 'Hace ruido o no prende', [
          'ruido',
          'no prende',
          'no enciende',
          'no arranca',
          'vibra',
        ]),
        o('instalar', 'Instalación o service', 'Instalación, limpieza o service', [
          'instal',
          'service',
          'limpieza',
          'limpiar',
          'carga de gas',
          'mantenimiento',
          'mudar',
        ]),
      ],
    },
    {
      id: 'equipo',
      texto: '¿Qué equipo es?',
      opciones: [
        o('split', 'Split', 'Equipo split', ['split', 'pared']),
        o('ventana', 'De ventana', 'Equipo de ventana', ['ventana']),
        o('portatil', 'Portátil', 'Equipo portátil', ['portatil']),
        o('no_se', 'No sé', 'No sabe el tipo de equipo', ['no se', 'ni idea', 'no sabria']),
      ],
    },
    DESDE,
  ],
};

/** Qué conviene hacer mientras llega una propuesta: solo consejos seguros, nada que reemplace al especialista. */
export function consejoMientras(rubro: Rubro, r: Readonly<Record<string, string>>): string | null {
  switch (rubro) {
    case 'plomeria':
      if (r.que === 'pierde' && r.llave !== 'si')
        return 'Mientras tanto, si podés, cerrá la llave de paso: suele estar cerca del medidor o abajo de la pileta. Así no sigue saliendo agua.';
      if (r.que === 'tapado')
        return 'Mientras tanto, evitá tirar más agua por ahí y no uses productos químicos fuertes: pueden dañar los caños y al especialista le complican el trabajo.';
      return null;
    case 'electricidad':
      return 'Mientras tanto, no abras el tablero ni toques cables. Si salta la térmica, desenchufá lo que estaba prendido antes de volver a subirla una sola vez.';
    case 'gas':
      return 'Mientras tanto, no uses ese artefacto y mantené el ambiente ventilado.';
    case 'cerrajeria':
      return r.situacion === 'afuera'
        ? 'Mientras tanto, fijate si alguien de confianza tiene una copia de la llave. No fuerces la cerradura: suele salir más caro.'
        : null;
    case 'albanileria':
      return r.que === 'humedad'
        ? 'Si podés, sacale una foto a la mancha y sumala en el pedido: ayuda mucho a cotizar.'
        : 'Si podés, sumá una foto en el pedido: ayuda mucho a cotizar.';
    case 'aire_acondicionado':
      return r.que === 'gotea'
        ? 'Mientras tanto, apagá el equipo y poné un recipiente o un trapo donde gotea.'
        : null;
  }
}

/** Frases que hacen conveniente pedirlo para hoy (sin prometer cuándo llega nadie). */
export const URGENTES: readonly RegExp[] = [
  /me quede afuera|no puedo entrar|no puedo salir|quede encerrad/,
  /inund|sale mucha agua|no para de salir|se llena de agua|chorro/,
  /(toda la casa|todo el departamento|toda la casa) sin luz|sin luz en toda|se corto la luz en toda/,
  /sin agua|no hay agua en (toda|ningun)/,
  /olor a gas|huele a gas|pierde gas|perdida de gas/,
  /chispa|humo|olor a quemado|se quemo/,
];
