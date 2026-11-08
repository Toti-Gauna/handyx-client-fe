// Modo voz de HandIA (rama handia-premium): reglas puras, sin navegador, para probarlas.
// Privacidad (reglas del bloque: nada de IA externa con datos personales): la voz es un dato personal, así que
//   - solo se escucha con reconocimiento EN EL DISPOSITIVO (Web Speech API con `processLocally` o `mode: 'ondevice-only'`);
//     si el navegador lo haría mandando el audio a un servidor, HandIA no escucha y lo dice;
//   - solo se habla con voces del sistema (`localService: true`): las voces "en la nube" mandan el texto afuera.

export type Oido = 'local' | 'descargable' | 'descargando' | 'no';

/** Idiomas a probar, del más cercano al rioplatense al más general. */
export const IDIOMAS = ['es-AR', 'es-419', 'es-US', 'es-MX', 'es-ES'] as const;

type Disponibilidad = 'available' | 'downloadable' | 'downloading' | 'unavailable' | boolean;

/** Lo que exponen los navegadores con reconocimiento local (dos versiones del borrador de la Web Speech API). */
export interface ConstructorReconocimiento {
  /** Versión actual: `SpeechRecognition.available({ langs, processLocally: true })`. */
  available?: (o: { langs: string[]; processLocally: boolean }) => Promise<Disponibilidad>;
  install?: (o: { langs: string[]; processLocally: boolean }) => Promise<boolean>;
  /** Versión anterior: `availableOnDevice(lang)` / `installOnDevice(lang)`. */
  availableOnDevice?: (lang: string) => Promise<Disponibilidad>;
  installOnDevice?: (lang: string) => Promise<boolean>;
}

const comoOido = (d: Disponibilidad): Oido =>
  d === true || d === 'available'
    ? 'local'
    : d === 'downloadable'
      ? 'descargable'
      : d === 'downloading'
        ? 'descargando'
        : 'no';

const ORDEN: Record<Oido, number> = { local: 0, descargando: 1, descargable: 2, no: 3 };

/**
 * ¿Puede este navegador reconocer la voz sin mandarla afuera? Devuelve la mejor opción entre los idiomas en español.
 * Sin las funciones de reconocimiento local, la respuesta es 'no' (aunque exista SpeechRecognition: sería en la nube).
 */
export async function capacidadOido(
  ctor: ConstructorReconocimiento | null | undefined,
): Promise<{ oido: Oido; idioma: string | null }> {
  if (!ctor) return { oido: 'no', idioma: null };
  const consultar = ctor.available
    ? (l: string) => ctor.available!({ langs: [l], processLocally: true })
    : ctor.availableOnDevice
      ? (l: string) => ctor.availableOnDevice!(l)
      : null;
  if (!consultar) return { oido: 'no', idioma: null };
  let mejor: { oido: Oido; idioma: string | null } = { oido: 'no', idioma: null };
  for (const idioma of IDIOMAS) {
    let oido: Oido = 'no';
    try {
      oido = comoOido(await consultar(idioma));
    } catch {
      oido = 'no';
    }
    if (ORDEN[oido] < ORDEN[mejor.oido]) mejor = { oido, idioma };
    if (oido === 'local') break;
  }
  return mejor;
}

/** Descarga el reconocimiento en el dispositivo (una vez). */
export async function instalarOido(
  ctor: ConstructorReconocimiento,
  idioma: string,
): Promise<boolean> {
  try {
    if (ctor.install) return await ctor.install({ langs: [idioma], processLocally: true });
    if (ctor.installOnDevice) return await ctor.installOnDevice(idioma);
  } catch {
    return false;
  }
  return false;
}

/**
 * Deja la instancia en modo local. Si no tiene ninguna de las dos propiedades, devuelve false y no se usa: así nunca
 * se escucha "en la nube" por accidente.
 */
export function forzarLocal(rec: object): boolean {
  if ('processLocally' in rec) {
    (rec as { processLocally: boolean }).processLocally = true;
    return true;
  }
  if ('mode' in rec) {
    (rec as { mode: string }).mode = 'ondevice-only';
    return true;
  }
  return false;
}

export interface VozSistema {
  readonly name: string;
  readonly lang: string;
  readonly localService: boolean;
  readonly voiceURI: string;
}

/** La voz para leer: solo locales y en español; primero rioplatense, después latinoamericana y por último de España. */
export function elegirVoz<V extends VozSistema>(voces: readonly V[]): V | null {
  const puntaje = (v: V) => {
    const l = v.lang.replace('_', '-').toLowerCase();
    if (!l.startsWith('es')) return -1;
    if (l === 'es-ar') return 5;
    if (['es-419', 'es-uy', 'es-cl', 'es-py'].includes(l)) return 4;
    if (['es-us', 'es-mx', 'es-co', 'es-pe'].includes(l)) return 3;
    if (l === 'es-es') return 2;
    return 1;
  };
  return (
    voces
      .filter((v) => v.localService && puntaje(v) > 0)
      .sort((a, b) => puntaje(b) - puntaje(a))[0] ?? null
  );
}

/** El texto tal como conviene decirlo: sin marcas visuales y con plata, horas y datos tachados legibles. */
export function paraHablar(texto: string): string {
  return texto
    .replace(/[«»"]/g, '')
    .replace(/\[(email|teléfono|documento)\]/g, 'dato tachado')
    .replace(/\$\s?([\d.]+)/g, '$1 pesos')
    .replace(/(\d{1,2}):00\b/g, '$1')
    .replace(/\s*·\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type ComandoVoz = 'salir' | 'repetir' | 'callar';

/** Órdenes para el modo voz (lo demás va a la conversación). Recibe el texto ya normalizado. */
export function comandoVoz(t: string): ComandoVoz | null {
  if (/\b(salir|cerrar|terminar) (del )?modo voz\b|\bvolver al chat\b|\bquiero escribir\b/.test(t))
    return 'salir';
  if (/^(repeti|repetilo|repetime|que dijiste|no te escuche|de nuevo eso)\b/.test(t.trim()))
    return 'repetir';
  // Solo como frase entera: "para hoy" es una respuesta, no la orden "pará".
  if (/^(silencio|para|para de hablar|calla|callate|basta)[.!]?$/.test(t.trim())) return 'callar';
  return null;
}
