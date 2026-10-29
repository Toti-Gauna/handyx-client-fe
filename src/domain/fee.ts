// Tarifa de Handy durante la demo cerrada. La app la avisa en tres lugares (decisión de Ignacio):
// 1) después del registro, 2) modal de primer ingreso, 3) contador en Cuenta. Siempre "hasta el 10/12".
// Reglas: el 0 % es la tarifa de Handy, no un descuento sobre el precio del especialista; al vencer no se
// anuncia ni se aplica una tarifa posterior que no esté aprobada (la decide el servidor, no el contador).
import type { EstadoFee } from '../contracts/v1/fee.ts';
import { porcentaje } from './dinero.ts';
import { diaMes } from './fechas.ts';

export interface CuentaRegresiva {
  readonly dias: number;
  readonly horas: number;
  readonly minutos: number;
  readonly terminada: boolean;
}

export function cuentaRegresiva(ahora: string, hasta: string): CuentaRegresiva {
  const restante = Math.max(0, Date.parse(hasta) - Date.parse(ahora));
  const minutosTotales = Math.floor(restante / 60000);
  return {
    dias: Math.floor(minutosTotales / 1440),
    horas: Math.floor((minutosTotales % 1440) / 60),
    minutos: minutosTotales % 60,
    terminada: restante === 0,
  };
}

export type ResumenFee =
  | { readonly tipo: 'sin_dato' }
  | {
      readonly tipo: 'demo';
      readonly porcentajeUsuario: string;
      readonly porcentajeEspecialista: string;
      /** "10/12" en Buenos Aires. */
      readonly hasta: string;
      readonly cuenta: CuentaRegresiva;
      /** Hay que mostrar el modal de primer ingreso (no aceptó esta versión). */
      readonly pendienteDeAceptar: boolean;
      /** Qué decir del después: solo lo que el servidor confirma como aprobado. */
      readonly despues: 'sin_definir' | 'aprobada';
    };

export function resumirFee(estado: EstadoFee | null): ResumenFee {
  const vigente = estado?.vigente;
  if (!estado || !vigente || vigente.alcance !== 'demo_cerrada' || vigente.vigenteHasta === null)
    return { tipo: 'sin_dato' };
  return {
    tipo: 'demo',
    porcentajeUsuario: porcentaje(vigente.usuarioBp),
    porcentajeEspecialista: porcentaje(vigente.especialistaBp),
    hasta: diaMes(vigente.vigenteHasta),
    cuenta: cuentaRegresiva(estado.ahora, vigente.vigenteHasta),
    pendienteDeAceptar:
      estado.aceptada?.politicaId !== vigente.id || estado.aceptada.version !== vigente.version,
    despues: estado.siguiente?.aprobada ? 'aprobada' : 'sin_definir',
  };
}

/** Texto base de los tres avisos. */
export function textoFee(resumen: Extract<ResumenFee, { tipo: 'demo' }>): string {
  return `Durante la demo, la tarifa de Handy es ${resumen.porcentajeUsuario} hasta el ${resumen.hasta}. El precio del especialista no cambia: se le paga entero y directo, por Mercado Pago o en efectivo.`;
}
