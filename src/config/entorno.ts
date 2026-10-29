// Entorno del build. Todo `NEXT_PUBLIC_*` es PÚBLICO: queda compilado en el JS del celular.
// Nunca van ahí contraseñas, tokens, claves de base de datos ni de Mercado Pago.

export type Entorno = 'local' | 'preview' | 'produccion';
export type ModoDatos = 'mock' | 'http';

export interface ConfiguracionBuild {
  readonly entorno: Entorno;
  readonly modo: ModoDatos;
  /** Origen de handyx-client-be (sin barra final). `null` en modo mock. */
  readonly apiBaseUrl: string | null;
}

export class EntornoInvalido extends Error {
  constructor(mensaje: string) {
    super(`Entorno inválido: ${mensaje}`);
    this.name = 'EntornoInvalido';
  }
}

const LOCAL = new Set(['localhost', '127.0.0.1']);

/**
 * Reglas (las aplica `next.config.ts` al compilar y la app al arrancar):
 * - Con `NEXT_PUBLIC_API_BASE_URL` hay API real y nunca fixtures; sin ella, solo la vista de prueba con datos ficticios.
 * - Producción exige API real por HTTPS: un build de producción jamás cae en mocks.
 */
export function leerEntorno(fuente: {
  NEXT_PUBLIC_ENTORNO?: string | undefined;
  NEXT_PUBLIC_API_BASE_URL?: string | undefined;
}): ConfiguracionBuild {
  const entorno = (fuente.NEXT_PUBLIC_ENTORNO?.trim() || 'local') as Entorno;
  if (!['local', 'preview', 'produccion'].includes(entorno))
    throw new EntornoInvalido('NEXT_PUBLIC_ENTORNO debe ser local, preview o produccion');

  const crudo = fuente.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';
  if (!crudo) {
    if (entorno === 'produccion')
      throw new EntornoInvalido('producción necesita NEXT_PUBLIC_API_BASE_URL');
    return { entorno, modo: 'mock', apiBaseUrl: null };
  }

  let url: URL;
  try {
    url = new URL(crudo);
  } catch {
    throw new EntornoInvalido('NEXT_PUBLIC_API_BASE_URL no es una URL');
  }
  const local = LOCAL.has(url.hostname);
  if (url.origin !== crudo.replace(/\/$/, '') || url.username || url.password)
    throw new EntornoInvalido(
      'NEXT_PUBLIC_API_BASE_URL tiene que ser solo un origen (sin ruta, credenciales ni query)',
    );
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local && entorno === 'local'))
    throw new EntornoInvalido('la API tiene que ser HTTPS (http solo para localhost en local)');
  return { entorno, modo: 'http', apiBaseUrl: url.origin };
}
