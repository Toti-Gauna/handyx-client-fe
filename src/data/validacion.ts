import type { z } from 'zod';
import type { ErrorApi } from '../contracts/v1/comunes.ts';

type CampoRechazado = NonNullable<ErrorApi['campos']>[number];

/** Traduce un error de zod a campos del contrato (nombre y motivo, nunca el valor). */
export function camposDeZod(error: z.ZodError): CampoRechazado[] {
  const vistos = new Set<string>();
  const campos: CampoRechazado[] = [];
  for (const issue of error.issues) {
    const campo = issue.path.filter((parte) => typeof parte === 'string').join('.') || 'cuerpo';
    if (vistos.has(campo)) continue;
    vistos.add(campo);
    const motivo: CampoRechazado['motivo'] =
      issue.code === 'invalid_type' && issue.input === undefined
        ? 'requerido'
        : issue.code === 'too_small' || issue.code === 'too_big'
          ? issue.origin === 'string' || issue.origin === 'array'
            ? 'longitud'
            : 'rango'
          : issue.code === 'unrecognized_keys'
            ? 'no_permitido'
            : 'formato';
    campos.push({ campo, motivo });
  }
  return campos;
}
