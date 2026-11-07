// HandIA desde la capa de datos. En la vista de prueba responde el asistente simulado (src/domain/handia.ts, sin IA).
// Con la API real queda inactiva hasta que handyx-client-be sume el endpoint (contrato v1.1, Fase 4): el texto que se
// mande ya va sin datos personales (tacharDatosPersonales) y nunca con fotos.
import { detectarRubro, type Deteccion } from '@/domain/handia';
import { ErrorCliente } from './cliente.ts';
import { esVistaDePrueba } from './index.ts';

export const handiaDisponible = esVistaDePrueba;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Pide a HandIA que lea el problema (ya sin datos personales) y sugiera el rubro. */
export async function consultarHandia(textoSinDatos: string): Promise<Deteccion> {
  if (!handiaDisponible)
    throw new ErrorCliente({
      codigo: 'funcion_inactiva',
      mensaje: 'HandIA todavía no está disponible. Podés elegir el rubro directamente.',
    });
  await esperar(900); // el tiempo de "escribiendo…" de un asistente real
  return detectarRubro(textoSinDatos);
}
