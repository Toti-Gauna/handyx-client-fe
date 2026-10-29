// HandIA: asistente para armar el pedido (rediseño; decisión de Ignacio del 29/10: "HandIA va incluido").
// Reglas (prompt del bloque): no se transmiten datos personales ni documentos a la IA. Por eso:
//   - HandIA no recibe fotos (se suman después, en el pedido);
//   - antes de enviar un mensaje se tachan emails, teléfonos y números de documento;
//   - solo sugiere un rubro: la persona confirma, elige el tipo y revisa el pedido antes de mandarlo.
// En la vista de prueba responde este módulo, sin IA (reglas por palabras clave). Con la API real, el backend
// (Fase 4) aplica el mismo tachado antes de llamar al proveedor de IA.
import type { Rubro } from '@/contracts/v1/pedidos';

/** Palabras clave por rubro (minúsculas, sin acentos). Las más específicas pesan más. */
const CLAVES: Record<Rubro, readonly (readonly [string, number])[]> = {
  plomeria: [
    ['pileta', 2],
    ['canilla', 3],
    ['inodoro', 3],
    ['desague', 3],
    ['desagote', 3],
    ['caño', 2],
    ['cano', 1],
    ['perdida de agua', 3],
    ['pierde agua', 3],
    ['gotea', 2],
    ['tapad', 2],
    ['flexible', 3],
    ['ducha', 2],
    ['mochila', 2],
    ['termotanque', 1],
    ['agua', 1],
    ['bidet', 2],
    ['cloaca', 3],
  ],
  electricidad: [
    ['termica', 3],
    ['disyuntor', 3],
    ['enchufe', 3],
    ['tomacorriente', 3],
    ['luz', 2],
    ['lampara', 2],
    ['cable', 2],
    ['corto', 2],
    ['tablero', 2],
    ['electric', 2],
    ['ventilador de techo', 2],
    ['foco', 1],
    ['interruptor', 3],
    ['tecla', 2],
  ],
  gas: [
    ['gas', 3],
    ['calefon', 3],
    ['estufa', 3],
    ['horno', 2],
    ['hornalla', 3],
    ['piloto', 2],
    ['garrafa', 3],
    ['caldera', 2],
    ['termotanque a gas', 4],
  ],
  cerrajeria: [
    ['cerradura', 3],
    ['llave', 2],
    ['trabad', 2],
    ['puerta', 1],
    ['candado', 3],
    ['cerrojo', 3],
    ['me quede afuera', 4],
    ['no abre', 2],
    ['picaporte', 2],
  ],
  albanileria: [
    ['humedad', 3],
    ['pared', 2],
    ['revoque', 3],
    ['grieta', 3],
    ['fisura', 3],
    ['baldosa', 3],
    ['ceramica', 2],
    ['techo', 1],
    ['filtracion', 2],
    ['descascar', 2],
    ['mamposteria', 3],
    ['zocalo', 2],
  ],
  aire_acondicionado: [
    ['aire acondicionado', 4],
    ['aire', 2],
    ['split', 3],
    ['no enfria', 3],
    ['enfria poco', 3],
    ['no calienta', 2],
    ['frigorias', 3],
    ['service', 1],
  ],
};

const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export interface Deteccion {
  /** Rubros con puntaje, del más probable al menos. Vacío si no hubo pistas. */
  readonly candidatos: readonly Rubro[];
  /** true si los dos primeros están empatados o muy cerca: conviene preguntar. */
  readonly dudosa: boolean;
  /** Aviso de seguridad (olor a gas, chispas) que va antes de cualquier otra cosa. */
  readonly seguridad: 'gas' | 'electricidad' | null;
}

export function detectarRubro(texto: string): Deteccion {
  const t = normalizar(texto);
  const puntajes = (Object.keys(CLAVES) as Rubro[])
    .map((r) => ({
      r,
      p: CLAVES[r].reduce(
        (suma, [clave, peso]) => (t.includes(normalizar(clave)) ? suma + peso : suma),
        0,
      ),
    }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p);
  const [primero, segundo] = puntajes;
  const seguridad = /olor a gas|pierde gas|perdida de gas|huele a gas/.test(t)
    ? 'gas'
    : /chispa|humo|se quemo|olor a quemado|electrocut|patea/.test(t)
      ? 'electricidad'
      : null;
  return {
    candidatos: puntajes.map((x) => x.r),
    dudosa: !!primero && !!segundo && primero.p - segundo.p <= 1,
    seguridad,
  };
}

/**
 * Tacha datos personales antes de que el texto salga hacia HandIA: emails, teléfonos (8 dígitos o más, seguidos o con
 * separadores) y DNI/CUIT. Devuelve el texto limpio y qué se tachó, para avisarle a la persona.
 */
export function tacharDatosPersonales(texto: string): {
  texto: string;
  tachado: readonly string[];
} {
  const tachado = new Set<string>();
  let limpio = texto.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, () => {
    tachado.add('email');
    return '[email]';
  });
  limpio = limpio.replace(/\b(dni|cuit|cuil)\b[\s:]*[\d.-]{7,13}/gi, () => {
    tachado.add('documento');
    return '[documento]';
  });
  // 8 dígitos o más: un teléfono (los precios como "120.000" no llegan).
  limpio = limpio.replace(/(\+?\d[\d\s().-]{6,}\d)/g, (m) => {
    if (m.replace(/\D/g, '').length < 8) return m;
    tachado.add('teléfono');
    return '[teléfono]';
  });
  return { texto: limpio, tachado: [...tachado] };
}

export const AVISO_SEGURIDAD: Record<NonNullable<Deteccion['seguridad']>, string> = {
  gas: 'Antes que nada: si sentís olor a gas, no prendas luces ni fuego, abrí puertas y ventanas y cerrá la llave de paso. Si el olor es fuerte, salí y llamá a la emergencia de tu distribuidora o al 911.',
  electricidad:
    'Antes que nada: no toques cables ni el tablero. Si hay chispas o humo, bajá la térmica general si podés hacerlo sin riesgo y alejate.',
};

/** Arreglos de ejemplo para empezar (los mismos de la demo de la landing). */
export const RAPIDAS_HANDIA = [
  'Se tapó la pileta de la cocina',
  'Saltó la térmica y no vuelve',
  'Hay humedad en una pared',
] as const;
