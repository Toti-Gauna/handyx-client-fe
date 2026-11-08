'use client';

import { useSearchParams } from 'next/navigation';
import { useConsulta } from '@/data/hooks';
import { estadoDeCarga, pagoVigente } from '@/components/Trabajo';
import { Elegir } from './Elegir';
import { Informado } from './Informado';
import { objetivosDe } from './objetivos';

/**
 * Pagar: le pagás directo al especialista (Mercado Pago o efectivo); Handyx no recibe ni reparte la plata. Un pago
 * informado no es un pago verificado, y volver del checkout no confirma nada: se consulta el estado real.
 */
export default function Pago() {
  const params = useSearchParams();
  const id = params.get('id');
  const etapa = params.get('etapa');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null, { cada: 6_000 });
  const pagos = useConsulta('pagos', id ? { parametros: { id } } : null, { cada: 4_000 });
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const propuestas = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
  );

  const carga = estadoDeCarga(id, [trabajo, pagos, propuestas]);
  const t = trabajo.datos;
  if (carga || !t || !pagos.datos || !propuestas.datos) return carga;

  const lista = pagos.datos.items;
  const objetivos = objetivosDe(t, propuestas.datos.items);
  // Con etapas: la pedida, o la primera confirmada que todavía no tiene un pago vigente.
  const objetivo =
    objetivos.find((o) => o.etapaId === etapa) ??
    objetivos.find((o) => o.pagable && !pagoVigente(lista, o.etapaId)) ??
    objetivos.at(-1)!;
  const hecho = pagoVigente(lista, objetivo.etapaId);

  return hecho ? (
    <Informado t={t} objetivo={objetivo} pago={hecho} />
  ) : (
    <Elegir
      t={t}
      objetivo={objetivo}
      objetivos={objetivos}
      pagos={lista}
      recargar={() => {
        pagos.recargar();
        trabajo.recargar();
      }}
    />
  );
}
