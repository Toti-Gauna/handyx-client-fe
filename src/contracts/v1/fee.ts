// Contrato v1 · tarifa de Handy (fee) y su aceptación.
// Durante la demo cerrada la tarifa de Handy es 0 % para usuario y especialista. Eso NO es un descuento sobre el
// precio del especialista: su servicio se paga entero, directo a él. Al terminar la demo no se activa ninguna
// tarifa que no esté aprobada: `siguiente` queda `null` o `aprobada: false` y la app solo informa la fecha.
import { z } from 'zod';
import { Id, Importe, Instante, PuntosBasicos, ZONA_HORARIA } from './comunes.ts';
import { VersionDocumento } from './cuenta.ts';

export const PoliticaFee = z
  .object({
    id: Id,
    version: VersionDocumento,
    alcance: z.enum(['demo_cerrada', 'general']),
    usuarioBp: PuntosBasicos,
    especialistaBp: PuntosBasicos,
    vigenteDesde: Instante,
    vigenteHasta: Instante.nullable(),
    zonaHoraria: z.literal(ZONA_HORARIA),
  })
  .strict();
export type PoliticaFee = z.infer<typeof PoliticaFee>;

/** GET /v1/cuenta/fee: lo que alimenta el modal de primer ingreso, el aviso post-registro y el contador de Cuenta. */
export const EstadoFee = z
  .object({
    vigente: PoliticaFee.nullable(),
    siguiente: z.object({ vigenteDesde: Instante, aprobada: z.boolean() }).strict().nullable(),
    aceptada: z
      .object({ politicaId: Id, version: VersionDocumento, aceptadaEn: Instante })
      .strict()
      .nullable(),
    /** Reloj del servidor: el contador no depende de la hora del celular. */
    ahora: Instante,
  })
  .strict();
export type EstadoFee = z.infer<typeof EstadoFee>;

export const AceptarFeeEntrada = z.object({ politicaId: Id, version: VersionDocumento }).strict();

/** Comisión de Handy calculada por el servidor sobre un importe. En la demo: `bp: 0`, `importe.centavos: 0`. */
export const ComisionHandy = z
  .object({ politicaId: Id, bp: PuntosBasicos, importe: Importe })
  .strict();
