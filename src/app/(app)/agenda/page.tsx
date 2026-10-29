'use client';

import { useMemo, useState } from 'react';
import { Calendario } from '@/components/Calendario';
import { TarjetaDeTrabajo } from '@/components/TarjetaPedido';
import { useAhora } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { fechaDeInstante, fechaLarga, hoyEnArgentina, type FechaISO } from '@/domain/fechas';

export default function Agenda() {
  const trabajos = useConsulta('trabajos', { consulta: { limite: 50 } }, { cada: 10_000 });
  const pedidos = useConsulta('pedidos', { consulta: { limite: 50 } });
  const ahora = useAhora(60_000);
  const [elegido, setElegido] = useState<FechaISO | null>(null);
  const dia = elegido ?? hoyEnArgentina(new Date(ahora));
  const items = trabajos.datos?.items;
  const porDia = useMemo(() => {
    const mapa = new Map<string, NonNullable<typeof items>>();
    for (const t of items ?? []) {
      if (t.estado === 'cancelado') continue;
      const f = fechaDeInstante(t.acuerdo.horario?.inicio ?? t.creadoEn);
      mapa.set(f, [...(mapa.get(f) ?? []), t]);
    }
    return mapa;
  }, [items]);

  if (trabajos.estado === 'cargando') return <Cargando />;
  if (trabajos.error)
    return <ErrorEstado error={trabajos.error} onReintentar={trabajos.recargar} />;
  const delDia = porDia.get(dia) ?? [];
  return (
    <>
      <Titulo texto="Tu ==agenda==" />
      <Calendario
        valor={dia}
        onElegir={setElegido}
        marcas={new Set(porDia.keys())}
        sinPasados={false}
      />
      <h2 className="subtitulo" aria-live="polite">
        {fechaLarga(dia)}
      </h2>
      {delDia.length ? (
        <ul className="lista-tarjetas">
          {delDia.map((t) => (
            <TarjetaDeTrabajo
              key={t.id}
              t={t}
              rubro={pedidos.datos?.items.find((p) => p.id === t.pedidoId)?.rubro ?? null}
            />
          ))}
        </ul>
      ) : (
        <Vacio
          titulo="No tenés nada este día"
          texto="Los días con puntito tienen trabajos."
          handy="/img/handy-gota.webp"
        />
      )}
    </>
  );
}
