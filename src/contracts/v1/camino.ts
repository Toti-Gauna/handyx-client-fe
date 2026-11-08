// Contrato v1 · Camino del hogar: se avanza cuidando la casa (ficha completa, informes leídos, mantenimientos a
// tiempo, conformidades), no gastando más. Sin azar ni rankings ni envíos a contactos. Los beneficios con montos o
// premios quedan en `borrador_legal` hasta que Legal los apruebe: el cliente nunca los muestra como vigentes.
import { z } from 'zod';
import { FechaLocal, Id, Texto } from './comunes.ts';

export const Hito = z
  .object({
    id: z.string().regex(/^[a-z_]{3,40}$/),
    titulo: Texto(60),
    descripcion: Texto(160),
    estado: z.enum(['hecho', 'ahora', 'falta']),
    progreso: z.object({ actual: z.int().min(0), total: z.int().min(1) }).strict(),
  })
  .strict();
export const Insignia = z
  .object({
    id: z.string().regex(/^[a-z_]{3,40}$/),
    nombre: Texto(40),
    descripcion: Texto(160),
    obtenidaEn: FechaLocal.nullable(),
  })
  .strict();
export const Beneficio = z
  .object({
    id: Id,
    titulo: Texto(80),
    descripcion: Texto(200),
    requisito: Texto(80),
    estado: z.enum(['borrador_legal', 'disponible', 'usado']),
  })
  .strict();
export const Camino = z
  .object({
    hitos: z.array(Hito).max(20),
    insignias: z.array(Insignia).max(40),
    beneficios: z.array(Beneficio).max(20),
  })
  .strict();
export type Camino = z.infer<typeof Camino>;
