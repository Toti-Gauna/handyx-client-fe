// Fotos de la vista de prueba: las URLs del contrato son https (privadas y firmadas en el servidor real). En la
// vista de prueba las subidas se muestran con una URL local temporal registrada acá; nunca sale del navegador.
export const locales = new Map<string, string>();

const MARCADOR = '/img/handy-lamparita.webp';

/** URL para mostrar una foto. En un build con API real es la URL firmada tal cual. */
export function urlDeFoto(url: string, prueba: boolean): string {
  return prueba ? (locales.get(url) ?? MARCADOR) : url;
}
