// Utilidades de formularios: errores por campo del contrato y validaciones simples del lado del cliente.
// El servidor valida igual (la validación del cliente solo ahorra un viaje y marca el campo).
import type { ErrorCliente } from '@/data/cliente';

const MENSAJES: Record<string, string> = {
  requerido: 'Completá este campo.',
  formato: 'Revisá el formato.',
  rango: 'El valor no es válido.',
  longitud: 'Revisá la longitud.',
  no_permitido: 'Este dato no se acepta.',
};

/** `{ campo: mensaje }` a partir de los errores de campo del contrato (nunca incluye el valor tipeado). */
export function erroresDe(error: ErrorCliente | null): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const c of error?.campos ?? []) salida[c.campo] = MENSAJES[c.motivo] ?? 'Revisá este campo.';
  return salida;
}

export const esEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const GENEROS_ETIQUETA: Record<string, string> = {
  mujer: 'Mujer',
  varon: 'Varón',
  no_binario: 'No binario',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiero no decirlo',
};

/** Nacionalidades más frecuentes (ISO 3166-1 alfa-2). La lista completa se define con el aviso de Legal. */
export const NACIONALIDADES: readonly string[] = [
  'AR',
  'UY',
  'PY',
  'BO',
  'CL',
  'BR',
  'PE',
  'VE',
  'CO',
  'EC',
  'MX',
  'ES',
  'IT',
  'US',
  'CN',
];

export function nombrePais(codigo: string): string {
  try {
    return new Intl.DisplayNames('es-AR', { type: 'region' }).of(codigo) ?? codigo;
  } catch {
    return codigo;
  }
}

/** "45.000" o "45000" → 4500000 centavos. Solo pesos enteros; `null` si no es un importe válido. */
export function centavosDePesos(texto: string): number | null {
  const limpio = texto.replace(/[\s.$]/g, '');
  if (!/^\d{1,9}$/.test(limpio)) return null;
  const pesos = Number(limpio);
  return pesos > 0 ? pesos * 100 : null;
}
