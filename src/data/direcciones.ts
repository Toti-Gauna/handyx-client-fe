// Direcciones guardadas (rediseño 3.8): además de la dirección del perfil (la principal, que sí está en el contrato v1),
// la persona puede guardar otras con un nombre ("Trabajo", "Lo de mamá") para elegirlas al pedir. El contrato v1 todavía
// no tiene `direcciones` (Fase 4.2): en la vista de prueba quedan en memoria (se pierden al recargar, nunca en el
// navegador); con la API real solo está la principal y agregar avisa que todavía no está disponible.
import { z } from 'zod';
import { Ubicacion } from '../contracts/v1/cuenta.ts';
import { ErrorCliente } from './cliente.ts';
import { esVistaDePrueba } from './index.ts';

export const direccionesDisponibles = esVistaDePrueba;
export const MAXIMO_DIRECCIONES = 5;

export const TIPOS_DIRECCION = ['casa', 'trabajo', 'otra'] as const;
export type TipoDireccion = (typeof TIPOS_DIRECCION)[number];

const NuevaDireccion = z
  .object({
    tipo: z.enum(TIPOS_DIRECCION),
    nombre: z.string().trim().min(1).max(30),
    ubicacion: Ubicacion,
  })
  .strict();
export type NuevaDireccion = z.input<typeof NuevaDireccion>;
export interface DireccionGuardada extends z.output<typeof NuevaDireccion> {
  readonly id: string;
}

let guardadas: readonly DireccionGuardada[] = [];
let siguiente = 1;
const oyentes = new Set<() => void>();
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function suscribirDirecciones(f: () => void): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
export const direccionesGuardadas = (): readonly DireccionGuardada[] => guardadas;
export const direccionesServidor = (): readonly DireccionGuardada[] => [];

function cambiar(nuevas: readonly DireccionGuardada[]) {
  guardadas = nuevas;
  oyentes.forEach((f) => f());
}

function inactiva(): never {
  throw new ErrorCliente({
    codigo: 'funcion_inactiva',
    mensaje:
      'Todavía no se pueden guardar otras direcciones. Usá la de tu perfil o escribila al pedir.',
  });
}

/** Guarda una dirección más (la principal es la del perfil y se edita en Datos personales). */
export async function guardarDireccion(d: NuevaDireccion): Promise<DireccionGuardada> {
  if (!direccionesDisponibles) inactiva();
  const r = NuevaDireccion.safeParse(d);
  if (!r.success)
    throw new ErrorCliente({ codigo: 'validacion', mensaje: 'Revisá el nombre y la dirección.' });
  if (guardadas.length >= MAXIMO_DIRECCIONES - 1)
    throw new ErrorCliente({
      codigo: 'conflicto',
      mensaje: `Podés tener hasta ${MAXIMO_DIRECCIONES} direcciones. Quitá una para sumar otra.`,
    });
  await esperar(400);
  const nueva = { ...r.data, id: `direccion-${siguiente++}` };
  cambiar([...guardadas, nueva]);
  return nueva;
}

export async function quitarDireccion(id: string): Promise<void> {
  if (!direccionesDisponibles) inactiva();
  await esperar(300);
  cambiar(guardadas.filter((d) => d.id !== id));
}

/** Solo para las pruebas. */
export function vaciarDirecciones(): void {
  cambiar([]);
}
