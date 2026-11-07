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

/** Mínimo del contrato (Contrasena): 10 caracteres. */
export const CONTRASENA_MINIMA = 10;

/**
 * Medidor de contraseña (orientativo, en el navegador; el BE valida lo suyo). 0: no llega al mínimo; 1-3: aceptable,
 * buena, muy buena según largo y variedad. Repeticiones y secuencias obvias quedan en "aceptable".
 */
export function fuerzaContrasena(c: string): { nivel: 0 | 1 | 2 | 3; texto: string } {
  if (c.length < CONTRASENA_MINIMA)
    return {
      nivel: 0,
      texto: c
        ? `Muy corta: faltan ${CONTRASENA_MINIMA - c.length}`
        : `Al menos ${CONTRASENA_MINIMA} caracteres`,
    };
  const obvia =
    /^(.)\1+$/.test(c) || /^(0123456789|1234567890|contrasena|password|qwerty)/i.test(c);
  let puntos = 0;
  if (c.length >= 14) puntos++;
  if (/[a-z]/.test(c) && /[A-Z]/.test(c)) puntos++;
  if (/\d/.test(c)) puntos++;
  if (/[^A-Za-z0-9]/.test(c)) puntos++;
  if (obvia || puntos === 0) return { nivel: 1, texto: 'Aceptable' };
  return puntos >= 3 ? { nivel: 3, texto: 'Muy buena' } : { nivel: 2, texto: 'Buena' };
}

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
