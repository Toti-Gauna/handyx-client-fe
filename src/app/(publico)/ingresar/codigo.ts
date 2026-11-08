// Reglas del acceso con código (contrato draft.4): a dónde ir después, qué paso pide un rechazo y el texto del reenvío.
import type { Sesion } from '@/contracts/v1/cuenta';
import { destinoSeguro } from '@/components/nav';
import { TEXTOS_LEGALES } from '@/content/textos';
import type { ErrorCliente } from '@/data/cliente';

export type PasoCodigo = 'email' | 'codigo' | 'segundo' | 'textos';

/** Segundos de espera antes de poder pedir otro código. */
export const ESPERA_REENVIO = 60;

/** «Reenviar el código en 0:42» mientras corre la espera; «Reenviar el código» cuando ya se puede. */
export function textoReenvio(restantes: number): string {
  if (restantes <= 0) return 'Reenviar el código';
  const m = Math.floor(restantes / 60);
  const s = String(restantes % 60).padStart(2, '0');
  return `Reenviar el código en ${m}:${s}`;
}

/** Las versiones vigentes de términos y privacidad: se mandan solo si la persona tildó la casilla. */
export const aceptacionesVigentes = () => [
  { documento: 'terminos' as const, version: TEXTOS_LEGALES.terminos.version },
  { documento: 'privacidad' as const, version: TEXTOS_LEGALES.privacidad.version },
];

/** Cuenta recién creada (o sin nombre todavía): primero los datos mínimos; si no, a donde iba. */
export function destinoTrasAcceso(sesion: Sesion, volver: string | null): string {
  if (sesion.pendientes.camposPerfil.includes('nombre') || !sesion.perfil.nombre) return '/perfil/';
  return destinoSeguro(volver);
}

/** Qué paso corrige un rechazo de `accesoVerificar` (null: se muestra el mensaje junto al código). */
export function pasoPorError(error: ErrorCliente): PasoCodigo | null {
  const campos = new Set(error.campos.map((c) => c.campo));
  if (campos.has('segundoFactor')) return 'segundo';
  if (campos.has('aceptaciones')) return 'textos';
  if (campos.has('email')) return 'email';
  return null;
}
