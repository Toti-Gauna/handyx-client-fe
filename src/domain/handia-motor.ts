// Motor de conversación de HandIA (rama handia-premium). Puro y en el celular: (estado, lo que dijo la persona) →
// (estado nuevo, respuestas, opciones). Lo usan igual el chat y el modo voz. Reglas del bloque: no inventa un rubro,
// la persona confirma todo, avisa de riesgos antes que nada, no promete tiempos y no manda nada a ninguna IA.
import { RUBROS, type Rubro } from '@/contracts/v1/pedidos';
import { RUBROS_INFO } from './etiquetas';
import { AVISO_SEGURIDAD, detectarRubro, normalizar, quitarNegaciones } from './handia';
import { GUIAS, URGENTES, consejoMientras, type PreguntaGuia } from './handia-guias';

export type Etapa = 'contar' | 'confirmar' | 'elegir' | 'pregunta' | 'resumen';
export type Aviso = keyof typeof AVISOS;

export interface EstadoHandia {
  readonly etapa: Etapa;
  /** Lo que contó la persona, ya sin datos personales. */
  readonly relato: string;
  readonly rubro: Rubro | null;
  /** Rubros para elegir cuando hay duda. */
  readonly opcionesRubro: readonly Rubro[];
  readonly respuestas: Readonly<Record<string, string>>;
  readonly pregunta: string | null;
  readonly avisados: readonly Aviso[];
  readonly urgente: boolean;
  readonly intentos: number;
  /** Pregunta que ya se repitió una vez porque la respuesta no coincidía con ninguna opción. */
  readonly repreguntada: string | null;
}

export type Accion =
  | { readonly tipo: 'rubro'; readonly rubro: Rubro }
  | { readonly tipo: 'otro_rubro' }
  | { readonly tipo: 'responder'; readonly pregunta: string; readonly opcion: string }
  | { readonly tipo: 'saltear' }
  | { readonly tipo: 'pedir'; readonly modo: 'urgente' | 'programado' }
  | { readonly tipo: 'reiniciar' };

export interface Opcion {
  readonly texto: string;
  readonly accion: Accion;
  readonly icono?: string;
  readonly destacada?: boolean;
}

export type Salida =
  | { readonly de: 'ia'; readonly texto: string }
  | { readonly de: 'aviso'; readonly texto: string; readonly riesgo?: boolean }
  | { readonly de: 'detectado'; readonly rubro: Rubro }
  | { readonly de: 'ficha' };

export interface Turno {
  readonly estado: EstadoHandia;
  readonly dice: readonly Salida[];
  readonly opciones: readonly Opcion[];
  /** Pregunta en curso: número y total, para la barra de progreso. */
  readonly progreso: { readonly actual: number; readonly total: number } | null;
  /** Lo que la persona eligió hacer al final (la pantalla navega). */
  readonly pedir?: 'urgente' | 'programado';
}

const AVISOS = {
  gas: AVISO_SEGURIDAD.gas,
  electricidad: AVISO_SEGURIDAD.electricidad,
  monoxido:
    'Ojo: si la llama sale amarilla, hay hollín o alguien siente dolor de cabeza o mareos cerca del artefacto, apagalo, ventilá y salgan al aire libre. Si alguien se siente mal, llamá al 107 o al 911.',
  agua_luz:
    'Ojo: si el agua llega a enchufes, cables o al tablero, no los toques. Si podés hacerlo con las manos y los pies secos, bajá la térmica general.',
} as const;

const nombre = (r: Rubro) => RUBROS_INFO[r].nombre;
const minus = (r: Rubro) => RUBROS_INFO[r].nombre.toLowerCase();

export const ESTADO_INICIAL: EstadoHandia = {
  etapa: 'contar',
  relato: '',
  rubro: null,
  opcionesRubro: [],
  respuestas: {},
  pregunta: null,
  avisados: [],
  urgente: false,
  intentos: 0,
  repreguntada: null,
};

export const SALUDO =
  '¡Hola! Soy HandIA. Contame qué pasó en tu casa, como te salga, y te ayudo a armar el pedido.';

export function iniciar(): Turno {
  return {
    estado: ESTADO_INICIAL,
    dice: [{ de: 'ia', texto: SALUDO }],
    opciones: [],
    progreso: null,
  };
}

// ── Comprensión ─────────────────────────────────────────────────────────────────────────────────────────

/** Una clave aparece si empieza en un borde de palabra; las cortas (≤ 3 letras) además tienen que terminar en uno. */
function aparece(texto: string, clave: string): boolean {
  const c = normalizar(clave).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fin = clave.length <= 3 ? '(?![a-z0-9])' : '';
  return new RegExp(`(^|[^a-z0-9])${c}${fin}`).test(texto);
}

const SI = [
  'si',
  'dale',
  'es eso',
  'correcto',
  'exacto',
  'claro',
  'perfecto',
  'confirmo',
  'obvio',
  'de una',
  'ok',
];
const NO = ['no', 'nop', 'para nada', 'es otro', 'otro rubro', 'te equivocaste', 'no es eso'];
const SALTEAR = [
  'no se',
  'ni idea',
  'saltear',
  'salteala',
  'paso',
  'siguiente',
  'no sabria',
  'despues',
];
const REINICIAR = [
  'empezar de nuevo',
  'de nuevo',
  'empecemos de nuevo',
  'reiniciar',
  'otra cosa distinta',
];
// En el resumen solo cuentan frases con intención clara ("ya probé…" no es "pedilo ya").
const HOY = [
  'para hoy',
  'hoy mismo',
  'pedilo hoy',
  'pedir hoy',
  'urgente',
  'lo antes posible',
  'cuanto antes',
];
const PROGRAMAR = [
  'programar',
  'programalo',
  'un turno',
  'otro dia',
  'mas adelante',
  'para manana',
  'la semana que viene',
];
const soloHoy = (t: string) => /^\s*(hoy|para hoy)[.!]?\s*$/.test(t);

const dice = (t: string, claves: readonly string[]) => claves.some((c) => aparece(t, c));
/** "sí", "dale"… sin un "no" adelante. */
const esSi = (t: string) => dice(t, SI) && !dice(t, ['no']);
const esNo = (t: string) => dice(t, NO) && !dice(t, ['no se']);

/** La opción de la pregunta que mejor coincide (por largo de las claves); null si no hay o hay empate. */
export function opcionDe(pregunta: PreguntaGuia, textoCrudo: string): string | null {
  const t = quitarNegaciones(normalizar(textoCrudo));
  const puntos = pregunta.opciones
    .map((op) => ({
      id: op.id,
      p: op.claves.reduce((s, c) => (aparece(t, c) ? s + c.length : s), 0),
    }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p);
  const [a, b] = puntos;
  if (!a || (b && b.p === a.p)) return null;
  return a.id;
}

/** El rubro que nombró la persona ("plomería", "es de gas"). */
function rubroNombrado(t: string): Rubro | null {
  const sinNeg = quitarNegaciones(t);
  const nombres: Record<Rubro, readonly string[]> = {
    plomeria: ['plomeria', 'plomero'],
    electricidad: ['electricidad', 'electricista', 'electrico'],
    gas: ['gas', 'gasista'],
    cerrajeria: ['cerrajeria', 'cerrajero'],
    albanileria: ['albanileria', 'albanil'],
    aire_acondicionado: ['aire acondicionado', 'aire', 'refrigeracion'],
  };
  const hallados = RUBROS.filter((r) => nombres[r].some((n) => aparece(sinNeg, n)));
  return hallados.length === 1 ? hallados[0]! : null;
}

/** Avisos de seguridad que corresponden al texto (los ya dados no se repiten). */
function avisosPara(
  t: string,
  rubro: Rubro | null,
  respuestas: Readonly<Record<string, string>>,
): Aviso[] {
  const out: Aviso[] = [];
  const d = detectarRubro(t);
  if (d.seguridad) out.push(d.seguridad);
  if (
    /amarilla|hollin|tizne|monoxido|dolor de cabeza|mareo/.test(t) ||
    respuestas.sintoma === 'llama'
  )
    out.push('monoxido');
  if (
    /(agua|mojad|inund)[\s\S]{0,40}(enchufe|cable|tablero|toma)|(enchufe|cable|tablero|toma)[\s\S]{0,40}(agua|mojad)/.test(
      t,
    )
  )
    out.push('agua_luz');
  if (rubro === 'gas' && /olor/.test(t)) out.push('gas');
  return [...new Set(out)];
}

// ── Preguntas ────────────────────────────────────────────────────────────────────────────────────────────

function pendientes(rubro: Rubro, r: Readonly<Record<string, string>>): PreguntaGuia[] {
  return GUIAS[rubro].filter((p) => !(p.id in r) && (!p.si || p.si(r)));
}

/** Respuestas que ya estaban en lo que contó (si dijo "la canilla del baño gotea", no pregunta dónde ni qué pasa). */
function deducir(rubro: Rubro, relato: string, previas: Readonly<Record<string, string>>) {
  const r: Record<string, string> = { ...previas };
  for (const p of GUIAS[rubro]) {
    if (p.id in r || p.id === 'llave') continue; // la llave de paso siempre se pregunta
    const id = opcionDe(p, relato);
    if (id) r[p.id] = id;
  }
  return r;
}

const detalleDe = (rubro: Rubro, preguntaId: string, opcionId: string) =>
  GUIAS[rubro].find((p) => p.id === preguntaId)?.opciones.find((o) => o.id === opcionId)?.detalle ??
  null;

/** Los datos que suma HandIA al pedido, legibles ("En el baño · Pierde o gotea · Pasa desde hoy"). */
export function detallesDe(e: EstadoHandia): string[] {
  if (!e.rubro) return [];
  const rubro = e.rubro;
  return GUIAS[rubro]
    .filter((p) => p.id in e.respuestas)
    .map((p) => {
      const v = e.respuestas[p.id]!;
      return v.startsWith('texto:')
        ? `${p.texto.replace(/[¿?]/g, '')}: ${v.slice(6)}`
        : detalleDe(rubro, p.id, v);
    })
    .filter((x): x is string => !!x);
}

/**
 * Saca del relato los datos tachados y la frase que los pedía ("llamame al [teléfono]"): el especialista lee el
 * problema, no los huecos. El contacto va por la app, recién al contratar.
 */
export function sinMarcasDeTachado(t: string): string {
  return t
    .replace(
      /[,;]?\s*(?:(?:llamame|escribime|mandame un (?:mensaje|mail|whatsapp)|contactame|mi (?:celular|cel|telefono|tel|mail|email|dni|documento)(?: es)?)\s+(?:al|a|es)?\s*)?\[(?:email|teléfono|documento)\]/gi,
      '',
    )
    .replace(/\s+([,.;])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** La descripción que leen los especialistas: lo que contó + los datos de las preguntas. Máximo 1000 caracteres. */
export function descripcionPara(e: EstadoHandia): string {
  const detalles = detallesDe(e);
  const pie = detalles.length ? `\n\nDatos: ${detalles.join(' · ')}.` : '';
  const relato = sinMarcasDeTachado(e.relato);
  const lugar = 1000 - pie.length;
  return (relato.length > lugar ? `${relato.slice(0, lugar - 1)}…` : relato) + pie;
}

function opcionesDePregunta(p: PreguntaGuia): Opcion[] {
  return [
    ...p.opciones.map((o) => ({
      texto: o.texto,
      accion: { tipo: 'responder', pregunta: p.id, opcion: o.id } as const,
    })),
    { texto: 'Saltear', accion: { tipo: 'saltear' } as const },
  ];
}

function progreso(e: EstadoHandia) {
  if (!e.rubro || e.etapa !== 'pregunta' || !e.pregunta) return null;
  const respondidas = GUIAS[e.rubro].filter(
    (p) => p.id in e.respuestas && e.respuestas[p.id] !== 'saltada',
  ).length;
  const total = respondidas + pendientes(e.rubro, e.respuestas).length;
  return { actual: Math.min(total, respondidas + 1), total };
}

/** Siguiente pregunta o, si no quedan, el resumen. */
function seguir(e: EstadoHandia, previo: Salida[]): Turno {
  const rubro = e.rubro!;
  const [p] = pendientes(rubro, e.respuestas);
  if (p) {
    const est: EstadoHandia = { ...e, etapa: 'pregunta', pregunta: p.id };
    return {
      estado: est,
      dice: [...previo, { de: 'ia', texto: p.texto }],
      opciones: opcionesDePregunta(p),
      progreso: progreso(est),
    };
  }
  return resumen({ ...e, etapa: 'resumen', pregunta: null }, previo);
}

function resumen(e: EstadoHandia, previo: Salida[]): Turno {
  const rubro = e.rubro!;
  const urgente = e.urgente || URGENTES.some((r) => r.test(normalizar(e.relato)));
  const est = { ...e, urgente };
  const consejo = consejoMientras(rubro, e.respuestas);
  const salidas: Salida[] = [
    ...previo,
    {
      de: 'ia',
      texto: `Listo, armé tu pedido de ${minus(rubro)}. Revisalo: así lo van a leer los especialistas, y lo podés corregir.`,
    },
    { de: 'ficha' },
  ];
  if (consejo) salidas.push({ de: 'ia', texto: consejo });
  salidas.push({
    de: 'ia',
    texto: urgente
      ? 'Por lo que contás, conviene pedirlo para hoy. Las fotos las sumás en el pedido.'
      : '¿Lo pedís para hoy o preferís programar un turno? Las fotos las sumás en el pedido.',
  });
  const hoy: Opcion = {
    texto: 'Pedir para hoy',
    accion: { tipo: 'pedir', modo: 'urgente' },
    icono: 'reloj',
    destacada: urgente,
  };
  const programar: Opcion = {
    texto: 'Programar turno',
    accion: { tipo: 'pedir', modo: 'programado' },
    icono: 'calendario',
    destacada: !urgente,
  };
  return {
    estado: est,
    dice: salidas,
    opciones: [hoy, programar, { texto: 'Empezar de nuevo', accion: { tipo: 'reiniciar' } }],
    progreso: null,
  };
}

function confirmarRubro(e: EstadoHandia, rubro: Rubro, previo: Salida[] = []): Turno {
  const respuestas = deducir(rubro, e.relato, e.respuestas);
  const sabidas = Object.keys(respuestas).length;
  const quedan = pendientes(rubro, respuestas).length;
  const intro = quedan
    ? sabidas
      ? `Perfecto, ${minus(rubro)}. Ya me contaste parte: te hago ${quedan === 1 ? 'una pregunta más' : `${quedan} preguntas cortas`} y armamos el pedido.`
      : `Perfecto, ${minus(rubro)}. Te hago ${quedan === 1 ? 'una pregunta' : `${quedan} preguntas cortas`} para que las propuestas lleguen más precisas.`
    : `Perfecto, ${minus(rubro)}.`;
  return seguir({ ...e, rubro, respuestas, opcionesRubro: [] }, [
    ...previo,
    { de: 'ia', texto: intro },
  ]);
}

/** Lee el relato acumulado y decide: rubro claro, duda entre dos o sin pistas. */
function interpretar(e: EstadoHandia, nuevos: Salida[]): Turno {
  const d = detectarRubro(e.relato);
  const [primero, segundo] = d.candidatos;
  if (primero && (!d.dudosa || !segundo)) {
    const est: EstadoHandia = { ...e, etapa: 'confirmar', rubro: primero, opcionesRubro: [] };
    return {
      estado: est,
      dice: [
        ...nuevos,
        { de: 'ia', texto: `Por lo que contás, parece un trabajo de ${minus(primero)}.` },
        { de: 'detectado', rubro: primero },
      ],
      opciones: [
        {
          texto: `Sí, es ${nombre(primero)}`,
          accion: { tipo: 'rubro', rubro: primero },
          destacada: true,
        },
        { texto: 'Es otro rubro', accion: { tipo: 'otro_rubro' } },
      ],
      progreso: null,
    };
  }
  if (primero && segundo) {
    const est: EstadoHandia = {
      ...e,
      etapa: 'elegir',
      rubro: null,
      opcionesRubro: [primero, segundo],
    };
    return {
      estado: est,
      dice: [
        ...nuevos,
        { de: 'ia', texto: `¿Es más de ${minus(primero)} o de ${minus(segundo)}?` },
      ],
      opciones: opcionesRubros([primero, segundo], true),
      progreso: null,
    };
  }
  const est: EstadoHandia = {
    ...e,
    etapa: 'elegir',
    rubro: null,
    opcionesRubro: RUBROS,
    intentos: e.intentos + 1,
  };
  return {
    estado: est,
    dice: [
      ...nuevos,
      {
        de: 'ia',
        texto:
          e.intentos === 0
            ? 'No me quedó claro de qué rubro es. Contame un poco más (qué se rompió y dónde), o elegí el que más se parezca.'
            : 'Sigo sin darme cuenta. Elegí el rubro que más se parezca: después lo podés describir mejor en el pedido.',
      },
    ],
    opciones: opcionesRubros(RUBROS, false),
    progreso: null,
  };
}

function opcionesRubros(rubros: readonly Rubro[], conOtro: boolean): Opcion[] {
  return [
    ...rubros.map((r) => ({
      texto: nombre(r),
      accion: { tipo: 'rubro', rubro: r } as const,
      icono: RUBROS_INFO[r].icono,
    })),
    ...(conOtro ? [{ texto: 'Es otro rubro', accion: { tipo: 'otro_rubro' } as const }] : []),
  ];
}

// ── Turno ────────────────────────────────────────────────────────────────────────────────────────────────

function sumarRelato(relato: string, texto: string) {
  const crudo = texto.trim();
  const t = relato ? crudo.charAt(0).toUpperCase() + crudo.slice(1) : crudo;
  if (!t) return relato;
  return relato ? `${relato}${/[.!?…]$/.test(relato) ? '' : '.'} ${t}` : t;
}

/** Avisos nuevos (los que todavía no se dieron) como salidas y estado actualizado. */
function conAvisos(e: EstadoHandia, textoNorm: string): [EstadoHandia, Salida[]] {
  const nuevos = avisosPara(textoNorm, e.rubro, e.respuestas).filter(
    (a) => !e.avisados.includes(a),
  );
  if (!nuevos.length) return [e, []];
  const urgente =
    e.urgente || nuevos.some((a) => a === 'gas' || a === 'electricidad' || a === 'agua_luz');
  return [
    { ...e, avisados: [...e.avisados, ...nuevos], urgente },
    nuevos.map((a) => ({ de: 'aviso', texto: AVISOS[a], riesgo: true }) as const),
  ];
}

/**
 * Un turno de la conversación. `entrada` es lo que escribió o dijo la persona (ya sin datos personales) o una opción
 * que tocó. Devuelve el estado nuevo, lo que responde HandIA y las opciones para seguir.
 */
export function responder(e: EstadoHandia, entrada: { texto: string } | { accion: Accion }): Turno {
  if ('accion' in entrada) return porAccion(e, entrada.accion);
  const crudo = entrada.texto.trim();
  if (!crudo) return { estado: e, dice: [], opciones: [], progreso: progreso(e) };
  const t = normalizar(crudo);

  if (dice(t, REINICIAR)) return porAccion(e, { tipo: 'reiniciar' });

  switch (e.etapa) {
    case 'contar': {
      const [est, avisos] = conAvisos({ ...e, relato: sumarRelato(e.relato, crudo) }, t);
      return interpretar(est, avisos);
    }
    case 'confirmar': {
      if (esSi(t) && e.rubro) return confirmarRubro(e, e.rubro);
      const nombrado = rubroNombrado(t);
      if (nombrado) return confirmarRubro(e, nombrado);
      if (esNo(t)) return porAccion(e, { tipo: 'otro_rubro' });
      const [est, avisos] = conAvisos({ ...e, relato: sumarRelato(e.relato, crudo) }, t);
      return interpretar(est, avisos);
    }
    case 'elegir': {
      const nombrado = rubroNombrado(t);
      if (nombrado) return confirmarRubro(e, nombrado);
      const [est, avisos] = conAvisos({ ...e, relato: sumarRelato(e.relato, crudo) }, t);
      return interpretar(est, avisos);
    }
    case 'pregunta': {
      const rubro = e.rubro!;
      const p = GUIAS[rubro].find((x) => x.id === e.pregunta)!;
      const [est, avisos] = conAvisos(e, t);
      const id = opcionDe(p, crudo);
      if (id) return porAccion(est, { tipo: 'responder', pregunta: p.id, opcion: id }, avisos);
      if (dice(t, SALTEAR)) return porAccion(est, { tipo: 'saltear' }, avisos);
      // No coincide con ninguna opción: lo que dijo suma al pedido y se repregunta una vez; si vuelve a pasar, se
      // guarda tal cual como respuesta (puede ser un dato que las opciones no contemplan).
      if (est.repreguntada !== p.id) {
        const conRelato = { ...est, relato: sumarRelato(est.relato, crudo), repreguntada: p.id };
        return {
          estado: conRelato,
          dice: [
            ...avisos,
            {
              de: 'ia',
              texto: `Lo sumo al pedido. Y ${p.texto.replace(/^¿(.)/u, (_, c: string) => `¿${c.toLowerCase()}`)}`,
            },
          ],
          opciones: opcionesDePregunta(p),
          progreso: progreso(conRelato),
        };
      }
      const libre = crudo.length > 120 ? `${crudo.slice(0, 119)}…` : crudo;
      return seguir({ ...est, respuestas: { ...est.respuestas, [p.id]: `texto:${libre}` } }, [
        ...avisos,
        { de: 'ia', texto: 'Anotado.' },
      ]);
    }
    case 'resumen': {
      if (dice(t, PROGRAMAR)) return porAccion(e, { tipo: 'pedir', modo: 'programado' });
      if (dice(t, HOY) || soloHoy(t)) return porAccion(e, { tipo: 'pedir', modo: 'urgente' });
      const [est, avisos] = conAvisos({ ...e, relato: sumarRelato(e.relato, crudo) }, t);
      return resumen(est, [...avisos, { de: 'ia', texto: 'Lo sumé al pedido.' }]);
    }
  }
}

function porAccion(e: EstadoHandia, a: Accion, previo: Salida[] = []): Turno {
  switch (a.tipo) {
    case 'reiniciar':
      return {
        estado: ESTADO_INICIAL,
        dice: [{ de: 'ia', texto: 'Empecemos de nuevo. Contame qué pasó.' }],
        opciones: [],
        progreso: null,
      };
    case 'rubro':
      return confirmarRubro(e, a.rubro, previo);
    case 'otro_rubro': {
      const est: EstadoHandia = { ...e, etapa: 'elegir', rubro: null, opcionesRubro: RUBROS };
      return {
        estado: est,
        dice: [
          ...previo,
          {
            de: 'ia',
            texto:
              'Elegí el rubro que más se parezca. Por ahora Handyx trabaja con estos seis: si tu arreglo no entra en ninguno, todavía no tenemos especialistas para eso.',
          },
        ],
        opciones: opcionesRubros(RUBROS, false),
        progreso: null,
      };
    }
    case 'responder': {
      if (!e.rubro) return { estado: e, dice: previo, opciones: [], progreso: null };
      const respuestas = { ...e.respuestas, [a.pregunta]: a.opcion };
      const [est, avisos] = conAvisos({ ...e, respuestas }, '');
      return seguir(est, [...previo, ...avisos]);
    }
    case 'saltear': {
      if (!e.rubro || !e.pregunta) return { estado: e, dice: previo, opciones: [], progreso: null };
      return seguir({ ...e, respuestas: { ...e.respuestas, [e.pregunta]: 'saltada' } }, [
        ...previo,
        { de: 'ia', texto: 'No pasa nada, sigamos.' },
      ]);
    }
    case 'pedir':
      return { estado: e, dice: previo, opciones: [], progreso: null, pedir: a.modo };
  }
}

/** Texto que se lee en voz alta para las opciones ("Podés decir: Cocina, Baño o Lavadero."). */
export function opcionesHabladas(opciones: readonly Opcion[]): string | null {
  const textos = opciones.filter((o) => o.accion.tipo !== 'reiniciar').map((o) => o.texto);
  if (!textos.length) return null;
  const lista =
    textos.length === 1 ? textos[0]! : `${textos.slice(0, -1).join(', ')} o ${textos.at(-1)}`;
  return `Podés decir: ${lista}.`;
}
