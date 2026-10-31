'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { FotoSubida } from '@/components/FotoSubida';
import { MapaHx } from '@/components/MapaHx';
import { ESTADOS_BUSQUEDA, PedidoBuscando } from '@/components/PedidoBuscando';
import { Enlace, ruta } from '@/components/nav';
import { Barra, ChipEstado, HandyRubro, Pantalla, entra } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Aviso, Boton, Campo, Cargando, ErrorEstado, Hoja, Vacio } from '@/components/ui';
import type { Pedido } from '@/contracts/v1/pedidos';
import { useConsulta, useEnvio } from '@/data/hooks';
import { RUBROS_INFO, TIPOS_INFO, etiquetaPedido } from '@/domain/etiquetas';
import { cuando, fechaLarga, horaDeInstante } from '@/domain/fechas';
import { pesos } from '@/domain/dinero';

const MOTIVOS = [
  { id: 'ya_no_lo_necesito', texto: 'Ya no lo necesito' },
  { id: 'lo_resolvi_por_otro_lado', texto: 'Lo resolví por otro lado' },
  { id: 'otro', texto: 'Otro motivo' },
] as const;

export default function DetallePedido() {
  const id = useSearchParams().get('id');
  const pedido = useConsulta('pedido', id ? { parametros: { id } } : null, { cada: 4_000 });
  const accion = useEnvio();
  const [hoja, setHoja] = useState<'cancelar' | 'editar' | null>(null);
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]['id']>('ya_no_lo_necesito');
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState<string[] | null>(null);

  if (!id)
    return (
      <Vacio titulo="No encontramos el pedido" texto="El enlace está incompleto.">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (pedido.estado === 'cargando') return <Cargando forma="mapa" />;
  if (pedido.estado === 'error' && pedido.error)
    return <ErrorEstado error={pedido.error} onReintentar={pedido.recargar} />;
  const p = pedido.datos;
  if (!p) return null;
  const e = etiquetaPedido(p);
  const f = p.fechaSolicitada;

  async function correr(idEndpoint: 'pedidoRelanzar' | 'pedidoBusquedaManual', p0: Pedido) {
    const r = await accion.enviar(
      idEndpoint,
      { parametros: { id: p0.id }, cuerpo: { version: p0.version } },
      `${idEndpoint}|${p0.version}`,
    );
    if (r?.ok) pedido.recargar();
  }
  async function cancelar(p0: Pedido) {
    const r = await accion.enviar(
      'pedidoCancelar',
      { parametros: { id: p0.id }, cuerpo: { version: p0.version, motivo } },
      `${p0.version}|${motivo}`,
    );
    if (r?.ok) {
      setHoja(null);
      pedido.recargar();
    }
  }
  async function editar(p0: Pedido) {
    const r = await accion.enviar(
      'pedidoEditar',
      {
        parametros: { id: p0.id },
        cuerpo: {
          version: p0.version,
          ...(descripcion.trim().length >= 10 ? { descripcion: descripcion.trim() } : {}),
          ...(fotos ? { fotos } : {}),
        },
      },
      `${p0.version}|${descripcion}|${fotos?.join()}`,
    );
    if (r?.ok) {
      setHoja(null);
      pedido.recargar();
    }
  }
  const puedeCancelar = ['buscando', 'con_propuestas', 'sin_respuesta', 'busqueda_manual'].includes(
    p.estado,
  );

  const hojas = (
    <>
      <Hoja
        abierta={hoja === 'cancelar'}
        onCerrar={() => setHoja(null)}
        titulo="¿Cancelar el pedido?"
      >
        <p>Se retiran las propuestas que tengas. Esto no se puede deshacer.</p>
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="sr-only">Motivo</legend>
          {MOTIVOS.map((m) => (
            <label key={m.id} className="opcion">
              <input
                type="radio"
                name="motivo"
                checked={motivo === m.id}
                onChange={() => setMotivo(m.id)}
              />
              <span className="opcion__titulo">{m.texto}</span>
            </label>
          ))}
        </fieldset>
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
        <div className="acciones">
          <Boton variante="peligro" cargando={accion.pendiente} onClick={() => cancelar(p)}>
            Sí, cancelar el pedido
          </Boton>
          <Boton variante="claro" onClick={() => setHoja(null)}>
            No, volver
          </Boton>
        </div>
      </Hoja>

      <Hoja abierta={hoja === 'editar'} onCerrar={() => setHoja(null)} titulo="Editar el pedido">
        <p className="texto-suave">
          Podés editarlo mientras se busca. Cuando llegan propuestas ya no.
        </p>
        <Campo etiqueta="Qué necesitás" requerido>
          {(c) => (
            <textarea
              {...c}
              className="entrada"
              maxLength={1000}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          )}
        </Campo>
        <h3 className="subtitulo">Fotos nuevas</h3>
        <FotoSubida onCambio={setFotos} />
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
        <div className="acciones">
          <Boton cargando={accion.pendiente} onClick={() => editar(p)}>
            Guardar
          </Boton>
          <Boton variante="claro" onClick={() => setHoja(null)}>
            Cerrar
          </Boton>
        </div>
      </Hoja>
      <p className="sr-only" aria-live="polite">
        {pedido.refrescando ? 'Actualizando' : ''}
      </p>
    </>
  );

  if (ESTADOS_BUSQUEDA.includes(p.estado))
    return (
      <>
        <PedidoBuscando
          p={p}
          pendiente={accion.pendiente}
          error={hoja ? null : (accion.error?.mensaje ?? null)}
          onEditar={() => {
            setDescripcion(p.descripcion);
            setFotos(null);
            setHoja('editar');
          }}
          onCancelar={() => setHoja('cancelar')}
          onRelanzar={() => void correr('pedidoRelanzar', p)}
          onBusquedaManual={() => void correr('pedidoBusquedaManual', p)}
        />
        {hojas}
      </>
    );

  const principal =
    p.estado === 'con_propuestas' ? (
      <Enlace className="hd-boton" href={ruta('/pedidos/propuestas/', { pedido: p.id })}>
        <Icono nombre="etiqueta" />
        Ver propuestas{p.propuestasPendientes ? ` (${p.propuestasPendientes})` : ''}
      </Enlace>
    ) : p.estado === 'contratado' && p.trabajoId ? (
      <Enlace className="hd-boton" href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>
        Ver el trabajo
        <Icono nombre="derecha" />
      </Enlace>
    ) : ['cancelado', 'vencido'].includes(p.estado) ? (
      <Enlace className="hd-boton" href={ruta('/pedir/', { rubro: p.rubro, tipo: p.tipo })}>
        <Icono nombre="reintentar" />
        Pedir de nuevo
      </Enlace>
    ) : null;

  return (
    <Pantalla
      arriba={
        <Barra
          titulo={`${RUBROS_INFO[p.rubro].nombre} · ==${TIPOS_INFO[p.tipo].nombre}==`}
          volver={{ href: '/pedidos/', etiqueta: 'Volver a Actividad' }}
          icono={RUBROS_INFO[p.rubro].icono}
          sub={f ? `Pedido para el ${fechaLarga(f.fecha)} · ${f.desde} h` : 'Lo antes posible'}
        />
      }
      pie={
        principal || puedeCancelar ? (
          <>
            {principal}
            {puedeCancelar ? (
              <button
                type="button"
                className="hd-boton hd-boton--fantasma du-rojo"
                onClick={() => setHoja('cancelar')}
              >
                <Icono nombre="cerrar" />
                Cancelar el pedido
              </button>
            ) : null}
          </>
        ) : undefined
      }
      clase="du-pedido-hx"
    >
      <div className="du-cuerpo">
        <div className="du-pedido-hx__estado" {...entra(1)}>
          <ChipEstado e={e} vivo />
        </div>
        {accion.error ? (
          <Aviso
            tipo={accion.error.codigo === 'conflicto' ? 'alerta' : 'error'}
            titulo={accion.error.codigo === 'conflicto' ? 'Esto cambió' : 'No se pudo'}
          >
            <p>{accion.error.mensaje}</p>
            {accion.error.codigo === 'conflicto' ? (
              <Boton
                chico
                variante="claro"
                onClick={() => {
                  accion.limpiar();
                  pedido.recargar();
                }}
              >
                Actualizar
              </Boton>
            ) : null}
          </Aviso>
        ) : null}

        {p.estado === 'con_propuestas' ? (
          <section
            className="hd-tarjeta hd-tarjeta--amarillo du-pedido-hx__aviso"
            role="status"
            data-vt-destino
            {...entra(2, 'pop')}
          >
            <HandyRubro rubro={p.rubro} clase="du-pedido-hx__handy" />
            <span>
              <strong>
                {p.propuestasPendientes
                  ? `Tenés ${p.propuestasPendientes} ${p.propuestasPendientes === 1 ? 'propuesta' : 'propuestas'}`
                  : 'Las propuestas vencieron'}
              </strong>
              <small>
                {p.propuestasPendientes
                  ? 'Compará, aceptá, rechazá o contraofertá. Nada queda acordado hasta que aceptes.'
                  : `Ninguna sigue vigente. La búsqueda sigue hasta las ${horaDeInstante(p.busqueda.ventanaHasta)}.`}
              </small>
            </span>
          </section>
        ) : null}
        {p.estado === 'cancelado' ? (
          <p className="du-nota" {...entra(2)}>
            <Icono nombre="info" />
            <span>Cancelaste este pedido.</span>
          </p>
        ) : null}
        {p.estado === 'vencido' ? (
          <p className="du-nota" {...entra(2)}>
            <Icono nombre="reloj" />
            <span>La fecha que pediste ya pasó sin un acuerdo. Podés hacer un pedido nuevo.</span>
          </p>
        ) : null}

        {p.ubicacion.coordenadas ? (
          <div className="du-pedido-hx__mapa" {...entra(3)}>
            <MapaHx
              modo="ver"
              centro={p.ubicacion.coordenadas}
              etiqueta="Mapa: dónde es el trabajo"
              clase="detalle-mapa"
            />
          </div>
        ) : null}

        <section className="du-bloque" aria-labelledby="pedido-t" {...entra(4)}>
          <h2 id="pedido-t" className="hd-sobre du-sobre">
            Tu pedido
          </h2>
          <div className="hd-tarjeta hd-tarjeta--gris du-pedido-hx__datos">
            <p className="du-pedido-hx__descripcion">{p.descripcion}</p>
            {p.fotos.length ? (
              <ul className="fotos">
                {p.fotos.map((x) => (
                  <li key={x.id} className="foto">
                    <FotoPrivada url={x.url} alt="Foto del pedido" />
                  </li>
                ))}
              </ul>
            ) : null}
            <dl className="du-datos-hx__lista">
              {(
                [
                  [
                    'Dónde',
                    `${p.ubicacion.barrio ? `${p.ubicacion.barrio}, ` : ''}${p.ubicacion.ciudad}`,
                  ],
                  f
                    ? [
                        'Cuándo (solicitud)',
                        `${f.fecha.split('-').reverse().join('/')} · ${f.desde}${f.hasta ? ` a ${f.hasta}` : ''}`,
                      ]
                    : ['Cuándo', 'Lo antes posible'],
                  [
                    'Precio que propusiste',
                    p.precioPropuestoCentavos ? pesos(p.precioPropuestoCentavos) : 'Ninguno',
                  ],
                  [
                    'Aceptación automática',
                    p.autoaceptacion
                      ? `Hasta ${pesos(p.autoaceptacion.montoMaximoCentavos)}`
                      : 'Desactivada',
                  ],
                  ['Pedido', cuando(p.creadoEn)],
                ] as const
              ).map(([dt, dd]) => (
                <div key={dt} className="hd-dato">
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Enlace
            className="du-pedido-hx__reclamo"
            href={ruta('/reclamos/nuevo/', { pedido: p.id })}
          >
            <Icono nombre="alerta" />
            ¿Algo salió mal? Abrí un reclamo
          </Enlace>
        </section>
      </div>
      {hojas}
    </Pantalla>
  );
}
