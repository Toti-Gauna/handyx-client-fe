'use client';

import { useState } from 'react';
import {
  esPasada,
  fechaLarga,
  grillaMes,
  hoyEnArgentina,
  nombreMes,
  partes,
  sumarMeses,
  type FechaISO,
} from '@/domain/fechas';
import { Icono } from './Icono';
import { useAhora } from './SesionProvider';

const SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'] as const;

/** Calendario propio en la zona de Buenos Aires. Los días pasados no se pueden elegir; los marcados tienen trabajos. */
export function Calendario({
  valor,
  onElegir,
  marcas,
  sinPasados = true,
}: {
  valor: FechaISO | null;
  onElegir: (f: FechaISO) => void;
  marcas?: ReadonlySet<string>;
  sinPasados?: boolean;
}) {
  const ahora = useAhora(60_000);
  const hoy = hoyEnArgentina(new Date(ahora));
  const base = partes(valor ?? hoy);
  const [{ anio, mes }, setMes] = useState({ anio: base.anio, mes: base.mes });
  const celdas = grillaMes(anio, mes);
  const actual = partes(hoy);
  const puedeIrAtras = !sinPasados || anio * 12 + mes > actual.anio * 12 + actual.mes;
  return (
    <div className="cal">
      <div className="cal__cab">
        <button
          type="button"
          className="cal__nav"
          aria-label="Mes anterior"
          disabled={!puedeIrAtras}
          onClick={() => setMes(sumarMeses(anio, mes, -1))}
        >
          <Icono nombre="izquierda" />
        </button>
        <h3 className="cal__mes" aria-live="polite">
          {nombreMes(anio, mes)}
        </h3>
        <button
          type="button"
          className="cal__nav"
          aria-label="Mes siguiente"
          onClick={() => setMes(sumarMeses(anio, mes, 1))}
        >
          <Icono nombre="derecha" />
        </button>
      </div>
      <div className="cal__grilla" role="group" aria-label={nombreMes(anio, mes)}>
        {SEMANA.map((d, i) => (
          <span key={i} className="cal__dia-sem" aria-hidden="true">
            {d}
          </span>
        ))}
        {celdas.map((f, i) =>
          f === null ? (
            <span key={`v${i}`} className="cal__vacio" />
          ) : (
            <button
              key={f}
              type="button"
              className={`cal__dia${f === hoy ? ' cal__dia--hoy' : ''}`}
              aria-pressed={f === valor}
              aria-label={`${fechaLarga(f)}${f === hoy ? ', hoy' : ''}${marcas?.has(f) ? ', con trabajos' : ''}`}
              disabled={sinPasados && esPasada(f, hoy)}
              onClick={() => onElegir(f)}
            >
              {partes(f).dia}
              {marcas?.has(f) ? <span className="cal__marca" aria-hidden="true" /> : null}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
