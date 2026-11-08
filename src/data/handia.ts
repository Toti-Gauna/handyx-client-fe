// HandIA desde la capa de datos. Hoy responde el motor de src/domain/handia-motor.ts, que corre entero en el celular
// (sin IA externa ni servidor). Con la API real queda inactiva hasta que handyx-client-be sume el endpoint (contrato
// v1.1): lo que se mande irá sin datos personales (tacharDatosPersonales) y nunca con fotos ni audio.
import { detectarRubro, type Deteccion } from '@/domain/handia';
import { type Accion, type EstadoHandia, type Turno, responder } from '@/domain/handia-motor';
import { ErrorCliente } from './cliente.ts';
import { esVistaDePrueba } from './index.ts';

export const handiaDisponible = esVistaDePrueba;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

const inactiva = () =>
  new ErrorCliente({
    codigo: 'funcion_inactiva',
    mensaje: 'HandIA todavía no está disponible. Podés elegir el rubro directamente.',
  });

/** Un turno de la conversación (el texto ya viene sin datos personales). `pausa`: el "escribiendo…" natural. */
export async function conversarConHandia(
  estado: EstadoHandia,
  entrada: { texto: string } | { accion: Accion },
  pausa = 700,
): Promise<Turno> {
  if (!handiaDisponible) throw inactiva();
  if (pausa) await esperar(pausa);
  return responder(estado, entrada);
}

/** Solo el rubro (lo usa quien necesita una sugerencia rápida, sin conversación). */
export async function consultarHandia(textoSinDatos: string): Promise<Deteccion> {
  if (!handiaDisponible) throw inactiva();
  await esperar(900);
  return detectarRubro(textoSinDatos);
}
