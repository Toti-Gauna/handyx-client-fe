'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import type { Hogar } from '@/contracts/v1/hogar';
import type { Pedido } from '@/contracts/v1/pedidos';
import { useConsulta, useEnvio } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Boton, Etiqueta, FilaEnlace, Interruptor, Nota, Sub, Tarjeta, Titulo } from '@/ui';
import { AvisoEnvio, BarraHogar, claveItem, compartibles } from '@/ui/hogar';

/**
 * Compartir de Mi hogar (H-Compartir): la persona elige, uno por uno, qué ven los especialistas de un pedido. Sin
 * pedido elegido, primero se elige el pedido. La dirección exacta nunca va acá.
 */
export default function Compartir() {
  const params = useSearchParams();
  const pedidoId = params.get('pedido');
  const ambienteId = params.get('ambiente');
  const volver = ambienteId
    ? { href: ruta('/hogar/ambiente/', { id: ambienteId }), etiqueta: 'Volver al ambiente' }
    : pedidoId
      ? { href: ruta('/pedidos/detalle/', { id: pedidoId }), etiqueta: 'Volver al pedido' }
      : { href: '/hogar/', etiqueta: 'Volver a Mi hogar' };
  return (
    <Pantalla arriba={<BarraHogar titulo="Compartir de Mi hogar" volver={volver} />}>
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        {pedidoId ? (
          <ConPedido pedidoId={pedidoId} ambienteId={ambienteId} />
        ) : (
          <ElegirPedido ambienteId={ambienteId} />
        )}
      </div>
    </Pantalla>
  );
}

const COMPARTIBLE: readonly Pedido['estado'][] = [
  'buscando',
  'con_propuestas',
  'sin_respuesta',
  'busqueda_manual',
];

function ElegirPedido({ ambienteId }: { ambienteId: string | null }) {
  const pedidos = useConsulta('pedidos', { consulta: { vista: 'activos', limite: 20 } });
  return (
    <EstadoConsulta consulta={pedidos} cargando="Buscando tus pedidos…">
      {({ items }) => {
        const abiertos = items.filter((p) => COMPARTIBLE.includes(p.estado));
        return (
          <>
            <Titulo texto="¿Con qué ==pedido==?" nivel={2} />
            <Sub>Lo que compartas lo ven solo los especialistas de ese pedido.</Sub>
            {abiertos.length === 0 ? (
              <>
                <Nota tono="gris">
                  Ahora no tenés pedidos buscando especialista. Cuando hagas uno, podés sumarle
                  datos de tu casa.
                </Nota>
                <Boton href="/pedir/" icono="mas">
                  Hacer un pedido
                </Boton>
              </>
            ) : (
              <div className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
                {abiertos.map((p) => (
                  <FilaEnlace
                    key={p.id}
                    icono={RUBROS_INFO[p.rubro].icono}
                    titulo={RUBROS_INFO[p.rubro].nombre}
                    sub={p.descripcion}
                    href={ruta('/hogar/compartir/', {
                      pedido: p.id,
                      ...(ambienteId ? { ambiente: ambienteId } : {}),
                    })}
                  />
                ))}
              </div>
            )}
          </>
        );
      }}
    </EstadoConsulta>
  );
}

function ConPedido({ pedidoId, ambienteId }: { pedidoId: string; ambienteId: string | null }) {
  const pedido = useConsulta('pedido', { parametros: { id: pedidoId } });
  const hogar = useConsulta('hogar', {});
  const trabajos = useConsulta('trabajos', { consulta: { vista: 'historial', limite: 50 } });
  return (
    <EstadoConsulta consulta={pedido}>
      {(p) => (
        <>
          <Tarjeta tono="azul">
            <span
              className="ds-titulo"
              style={{ ['--ds-tam' as string]: '1.375rem', color: 'inherit' }}
            >
              {RUBROS_INFO[p.rubro].nombre}
            </span>
            <span>{p.descripcion}</span>
          </Tarjeta>
          <EstadoConsulta consulta={hogar} cargando="Cargando tu casa…">
            {(h) => (
              <Elegir
                pedido={p}
                hogar={h}
                ambienteId={ambienteId}
                trabajos={trabajos.datos?.items ?? []}
              />
            )}
          </EstadoConsulta>
        </>
      )}
    </EstadoConsulta>
  );
}

function Elegir({
  pedido,
  hogar,
  ambienteId,
  trabajos,
}: {
  pedido: Pedido;
  hogar: Hogar;
  ambienteId: string | null;
  trabajos: Parameters<typeof compartibles>[1];
}) {
  const [elegidos, setElegidos] = useState<ReadonlySet<string>>(new Set());
  const { enviar, pendiente, error } = useEnvio();
  const [listo, setListo] = useState(false);
  const opciones = compartibles(hogar, trabajos, ambienteId);
  const items = opciones.filter((o) => elegidos.has(claveItem(o.item))).map((o) => o.item);

  if (listo)
    return (
      <>
        <Nota tono="exito" icono="check" rol="status">
          Listo: los especialistas de este pedido ven lo que elegiste. Cuando el pedido termina, se
          deja de compartir solo.
        </Nota>
        <Boton href="/hogar/compartidos/" icono="compartir">
          Ver lo que compartiste
        </Boton>
        <Boton variante="contorno" chico href={ruta('/pedidos/detalle/', { id: pedido.id })}>
          Volver al pedido
        </Boton>
      </>
    );

  if (!COMPARTIBLE.includes(pedido.estado))
    return (
      <Nota tono="gris">
        Este pedido ya no está buscando especialista: no hace falta compartir nada.
      </Nota>
    );

  return (
    <>
      <Titulo texto="¿Qué ==compartís==?" nivel={2} />
      <Sub>
        Lo ven solo los especialistas de este pedido. Cuando termina, se deja de compartir solo.
      </Sub>
      {opciones.length === 0 ? (
        <Nota tono="gris">
          Todavía no hay datos de tu casa para compartir. Sumá medidas o equipos en Mi casa.
        </Nota>
      ) : (
        <div role="group" aria-label="Qué compartís">
          <Etiqueta>Tocá cada cosa que quieras sumar</Etiqueta>
          {opciones.map((o) => {
            const k = claveItem(o.item);
            return (
              <Interruptor
                key={k}
                etiqueta={o.titulo}
                sub={o.sub}
                activo={elegidos.has(k)}
                onCambiar={(si) =>
                  setElegidos((prev) => {
                    const n = new Set(prev);
                    if (si) n.add(k);
                    else n.delete(k);
                    return n;
                  })
                }
              />
            );
          })}
        </div>
      )}
      <Nota tono="gris" icono="candado">
        Tu dirección exacta no va acá: se comparte solo al aceptar una propuesta.
      </Nota>
      {items.length > 20 ? (
        <Nota tono="amarillo" icono="alerta">
          Podés compartir hasta 20 cosas por vez. Sacá {items.length - 20} para seguir.
        </Nota>
      ) : null}
      <AvisoEnvio error={error} />
      <Boton
        icono="check"
        deshabilitado={items.length === 0 || items.length > 20}
        ocupado={pendiente}
        onClick={async () => {
          const r = await enviar(
            'compartir',
            { parametros: { id: pedido.id }, cuerpo: { items } },
            JSON.stringify(items),
          );
          if (r?.ok) setListo(true);
        }}
      >
        {items.length === 0
          ? 'Elegí qué compartir'
          : `Compartir ${items.length === 1 ? '1 cosa' : `${items.length} cosas`} con este pedido`}
      </Boton>
    </>
  );
}
