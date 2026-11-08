'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment } from 'react';
import { usePropuestasDelPedido } from '@/app/(app)/pedidos/propuestas/_datos';
import { Enlace, ruta } from '@/components/nav';
import { garantiaTexto, horarioCorto, materialesTexto, nombreCorto } from '@/components/Propuesta';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { candidataDe, esVisita, formatoPuntaje, frase, puntuar } from '@/domain/comparar';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Avatar, Boton, Nota } from '@/ui';
import { PantallaPedir, TarjetaPromedio } from '@/ui/pedir';

const primerNombre = (p: Propuesta) => nombreCorto(p.especialista.nombrePublico);
/** El nombre corto, salvo que dos lo compartan. */
const nombreColumna = (p: Propuesta, todas: readonly Propuesta[]) =>
  todas.filter((x) => primerNombre(x) === primerNombre(p)).length > 1
    ? p.especialista.nombrePublico
    : primerNombre(p);

/**
 * Comparar lado a lado (Fase 7 · C-Comparar): arriba, la que más suma con un promedio de reglas fijas y públicas
 * (src/domain/comparar.ts), en una tarjeta corta; abajo, la tabla con los mismos datos para todas. Solo entran las
 * propuestas de trabajo con precio: las visitas para presupuestar se nombran aparte. Elegir es siempre de la persona.
 */
export default function Comparar() {
  const pedidoId = useSearchParams().get('pedido');
  const d = usePropuestasDelPedido(pedidoId);

  if (!pedidoId)
    return (
      <Vacio titulo="Falta el pedido" texto="El enlace está incompleto.">
        <Boton href="/pedidos/" chico>
          Ver mis pedidos
        </Boton>
      </Vacio>
    );
  if (d.error) return <ErrorEstado error={d.error} onReintentar={d.recargar} />;
  if (!d.lista.datos || !d.pedido.datos) return <Cargando />;

  const pedido = d.pedido.datos;
  const pares = d.vigentes.flatMap((p) => {
    const c = candidataDe(p);
    return c ? [{ p, c }] : [];
  });
  const puntajes = puntuar(pares.map((x) => x.c));
  // Las columnas siguen el orden del promedio: la primera es la que más suma.
  const columnas = puntajes.flatMap((s) => {
    const par = pares.find((x) => x.p.id === s.id);
    return par ? [{ ...par, s }] : [];
  });
  const primera = columnas.length >= 2 ? columnas[0] : undefined;
  const visitas = d.vigentes.filter(esVisita);
  const volver = ruta('/pedidos/propuestas/', { pedido: pedido.id });

  const filas: readonly [string, (x: (typeof columnas)[number]) => React.ReactNode, boolean?][] = [
    ['Promedio', (x) => formatoPuntaje(x.s.puntaje), true],
    ['Precio', (x) => pesos(x.c.totalCentavos), true],
    ['Fecha', (x) => horarioCorto(x.p).replace(' · ', '\n')],
    [
      'Materiales',
      (x) =>
        (materialesTexto(x.p.detalle?.materiales ?? null) ?? '—')
          .replace('Materiales i', 'I')
          .replace('Materiales a', 'A'),
    ],
    ['Garantía', (x) => (x.p.detalle ? garantiaTexto(x.p.detalle.garantiaDias) : '—')],
    ['Verificaciones', (x) => String(x.c.verificaciones)],
    [
      'Trabajos',
      (x) =>
        x.p.especialista.trabajosRealizados === null
          ? '—'
          : String(x.p.especialista.trabajosRealizados),
    ],
  ];

  return (
    <PantallaPedir
      titulo="Comparar"
      sub={`${RUBROS_INFO[pedido.rubro].nombre} · ${columnas.length} con precio`}
      volver={{ href: volver, etiqueta: 'Volver a las propuestas' }}
    >
      {primera ? (
        <TarjetaPromedio
          nombre={primera.p.especialista.nombrePublico}
          puntaje={formatoPuntaje(primera.s.puntaje)}
          frase={frase(primera.s, primera.c, puntajes)}
        />
      ) : null}

      {columnas.length >= 2 ? (
        <div role="region" aria-label="Propuestas lado a lado" tabIndex={0}>
          <table className="dsp-tabla">
            <caption className="ds-solo-lector">Propuestas lado a lado</caption>
            <thead>
              <tr>
                <td />
                {columnas.map((x, i) => (
                  <th key={x.p.id} scope="col" data-destacada={i === 0 ? '' : undefined}>
                    <span className="dsp-tabla__quien">
                      <Avatar nombre={x.p.especialista.nombrePublico} tam={2.25} />
                      {nombreColumna(
                        x.p,
                        columnas.map((y) => y.p),
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map(([titulo, valor, fuerte]) => (
                <tr key={titulo}>
                  <th scope="row">{titulo}</th>
                  {columnas.map((x, i) => (
                    <td
                      key={x.p.id}
                      data-destacada={i === 0 ? '' : undefined}
                      className={fuerte ? 'dsp-tabla__fuerte' : undefined}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {valor(x)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td>
                  <span className="ds-solo-lector">Abrir</span>
                </td>
                {columnas.map((x, i) => (
                  <td key={x.p.id} data-destacada={i === 0 ? '' : undefined}>
                    <Enlace
                      href={ruta('/propuestas/detalle/', { id: x.p.id })}
                      className={`ds-boton ds-boton--chico ${i === 0 ? 'ds-boton--primario' : 'ds-boton--suave'}`}
                      aria-label={`Ver la propuesta de ${x.p.especialista.nombrePublico}`}
                    >
                      Ver
                    </Enlace>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <Nota icono="info" tono="gris">
          Para comparar hacen falta al menos dos propuestas con precio.
        </Nota>
      )}

      {visitas.map((v) => (
        <Fragment key={v.id}>
          <Nota icono="info" tono="gris">
            La visita de {primerNombre(v)} no entra en la comparación: todavía no tiene precio del
            trabajo.
          </Nota>
        </Fragment>
      ))}
      <Nota icono="grafico" tono="gris">
        Cómo se calcula: precio 30 · reseñas 25 · verificaciones 20 · garantía 15 · fecha 10. Sin
        reseñas cargadas, ese punto no cuenta para ninguna.
      </Nota>
    </PantallaPedir>
  );
}
