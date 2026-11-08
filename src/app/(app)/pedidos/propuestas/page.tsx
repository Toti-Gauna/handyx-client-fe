'use client';

import { useSearchParams } from 'next/navigation';
import { ruta } from '@/components/nav';
import { ChipEstadoPropuesta, TarjetaOferta } from '@/components/Propuesta';
import { useAhora } from '@/components/SesionProvider';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { candidataDe, destacada } from '@/domain/comparar';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Boton, Chip, FilaEnlace, MosaicoIcono, Nota, Tarjeta, Titulo } from '@/ui';
import { AccionBarra, ChipPromedio, PantallaPedir } from '@/ui/pedir';
import { usePropuestasDelPedido } from './_datos';

const NUEVA_MS = 30 * 60_000;

/**
 * Propuestas de un pedido (Fase 7 · C-Propuestas): cada tarjeta con quién es, el precio en tinte con «Detalle», datos
 * chicos del detalle, verificaciones reales y Rechazar · Ver perfil · Aceptar (que abren el detalle o la hoja: nada se
 * decide desde la tarjeta). En el orden en que llegaron. Las visitas van marcadas como «Consulta».
 */
export default function Propuestas() {
  const pedidoId = useSearchParams().get('pedido');
  const d = usePropuestasDelPedido(pedidoId);
  const ahora = useAhora(60_000);

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

  const p = d.pedido.datos;
  const { vigentes, mias, anteriores } = d;
  const candidatas = vigentes.map((x) => candidataDe(x)).filter((c) => c !== null);
  const mejor = destacada(candidatas);
  const comparar = ruta('/propuestas/comparar/', { pedido: p.id });
  const precios = candidatas.map((c) => c.totalCentavos);
  const n = vigentes.length;

  return (
    <PantallaPedir
      titulo="Propuestas"
      sub={`${RUBROS_INFO[p.rubro].nombre} · ${n} ${n === 1 ? 'propuesta' : 'propuestas'}`}
      volver={{ href: ruta('/pedidos/detalle/', { id: p.id }), etiqueta: 'Volver al pedido' }}
      accion={
        candidatas.length >= 2 ? (
          <AccionBarra icono="columnas" etiqueta="Comparar lado a lado" href={comparar} />
        ) : undefined
      }
      pie={
        candidatas.length >= 2 ? (
          <Boton href={comparar} variante="contorno" icono="columnas">
            Comparar lado a lado
          </Boton>
        ) : undefined
      }
    >
      {precios.length >= 2 ? (
        <Tarjeta tono="noche" etiqueta="Precios de las propuestas">
          <div className="ds-fila">
            <MosaicoIcono icono="grafico" tam={2.5} tono="velo" />
            <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
              <span className="ds-etiqueta">De las propuestas que llegaron</span>
              <strong style={{ fontSize: '1.0625rem' }}>
                {pesos(Math.min(...precios))} a {pesos(Math.max(...precios))}
              </strong>
              <span className="ds-sub">El precio lo pone cada especialista.</span>
            </span>
          </div>
        </Tarjeta>
      ) : null}

      <div className="ds-fila" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Titulo
          nivel={2}
          tam={1.375}
          texto={n ? `${n} ==${n === 1 ? 'propuesta' : 'propuestas'}==` : 'Sin propuestas ==vigentes=='}
        />
        {n > 1 ? <span className="ds-sub">En el orden en que llegaron</span> : null}
      </div>

      {p.estado === 'contratado' && p.trabajoId ? (
        <FilaEnlace
          icono="check"
          tono="azul"
          titulo="Ya hay un acuerdo"
          sub="Ver el trabajo"
          href={ruta('/trabajos/detalle/', { id: p.trabajoId })}
        />
      ) : null}
      {mias.length ? (
        <Nota icono="reloj">
          Tu contrapropuesta está pendiente: nada queda acordado hasta que el especialista la acepte.
        </Nota>
      ) : null}
      {n === 0 && mias.length === 0 && p.estado !== 'contratado' ? (
        <Nota icono="info" tono="gris">
          {anteriores.length
            ? 'Las propuestas que llegaron ya vencieron o se resolvieron.'
            : 'Todavía no llegaron propuestas. Te avisamos cuando llegue cada una.'}
        </Nota>
      ) : null}

      {vigentes.map((x) => (
        <TarjetaOferta
          key={x.id}
          p={x}
          marca={
            mejor?.id === x.id ? (
              <ChipPromedio href={comparar} />
            ) : ahora - Date.parse(x.creadaEn) < NUEVA_MS ? (
              <Chip tono="amarillo">Nueva</Chip>
            ) : undefined
          }
        />
      ))}
      {mias.map((x) => (
        <TarjetaOferta key={x.id} p={x} marca={<Chip tono="gris" icono="editar">Tuya</Chip>} />
      ))}
      {n > 1 ? (
        <Nota icono="info" tono="gris">
          Aceptar una cierra las demás. Si rechazás, no hace falta dar motivos.
        </Nota>
      ) : null}
      {anteriores.length ? (
        <details className="ds-pila">
          <summary className="ds-boton ds-boton--suave ds-boton--chico">
            Anteriores ({anteriores.length})
          </summary>
          {anteriores.map((x) => (
            <TarjetaOferta key={x.id} p={x} marca={<ChipEstadoPropuesta p={x} />} />
          ))}
        </details>
      ) : null}
    </PantallaPedir>
  );
}
