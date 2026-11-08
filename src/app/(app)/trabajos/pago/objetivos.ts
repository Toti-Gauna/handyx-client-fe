// Qué se puede pagar en un trabajo: el trabajo entero, o cada etapa de una obra.
import { desglose, type Desglose } from '@/components/Trabajo';
import type { Propuesta, Trabajo } from '@/contracts/v1/propuestas';

export interface Objetivo {
  readonly etapaId: string | null;
  readonly titulo: string;
  readonly centavos: number;
  /** Se puede pagar ahora (la etapa está confirmada, o el trabajo ya terminó o está en curso). */
  readonly pagable: boolean;
  /** Desglose completo cuando se paga el trabajo entero. */
  readonly desglose: Desglose | null;
}

export function objetivosDe(t: Trabajo, propuestas: readonly Propuesta[]): Objetivo[] {
  if (t.etapas.length)
    return t.etapas.map((e) => ({
      etapaId: e.id,
      titulo: `Etapa ${e.orden} · ${e.titulo}`,
      centavos: e.monto.centavos,
      pagable: e.estado === 'confirmada',
      desglose: null,
    }));
  const d = desglose(t, propuestas);
  return [
    {
      etapaId: null,
      titulo: 'El trabajo completo',
      centavos: d.total,
      pagable: ['en_curso', 'terminado_por_especialista', 'finalizado'].includes(t.estado),
      desglose: d,
    },
  ];
}
