'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { FotoSubida } from '@/components/FotoSubida';
import { Enlace, ruta } from '@/components/nav';
import { Encabezado } from '@/components/Titulo';
import {
  Aviso,
  Boton,
  Campo,
  Cargando,
  Datos,
  ErrorEstado,
  Hoja,
  Pastilla,
  Vacio,
} from '@/components/ui';
import type { Pedido } from '@/contracts/v1/pedidos';
import { useConsulta, useEnvio } from '@/data/hooks';
import { RUBROS_INFO, TIPOS_INFO, etiquetaPedido } from '@/domain/etiquetas';
import { cuando, horaDeInstante } from '@/domain/fechas';
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
  if (pedido.estado === 'cargando') return <Cargando />;
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

  return (
    <>
      <Encabezado
        titulo={`${RUBROS_INFO[p.rubro].nombre} · ==${TIPOS_INFO[p.tipo].nombre}==`}
        volver={{ href: '/pedidos/', etiqueta: 'Volver a mis pedidos' }}
        bajada={
          <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
            {e.texto}
          </Pastilla>
        }
      />

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

      {p.estado === 'buscando' ? (
        <Aviso tipo="info" titulo="Estamos buscando especialistas" rol="status">
          <p>
            Te avisamos cuando lleguen propuestas. No podemos prometer cuándo.
            <span className="buscando" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
          <p>
            Seguimos buscando hasta las {horaDeInstante(p.busqueda.ventanaHasta)} (intento{' '}
            {p.busqueda.intento} de {p.busqueda.maxIntentos}).
          </p>
        </Aviso>
      ) : null}
      {p.estado === 'con_propuestas' ? (
        <Aviso
          tipo="ok"
          titulo={
            p.propuestasPendientes
              ? `Tenés ${p.propuestasPendientes} ${p.propuestasPendientes === 1 ? 'propuesta' : 'propuestas'}`
              : 'Las propuestas vencieron'
          }
          rol="status"
        >
          {p.propuestasPendientes ? (
            <p>Compará, aceptá, rechazá o contraofertá. Nada queda acordado hasta que aceptes.</p>
          ) : (
            <p>
              Ninguna sigue vigente. La búsqueda sigue hasta las{' '}
              {horaDeInstante(p.busqueda.ventanaHasta)}.
            </p>
          )}
        </Aviso>
      ) : null}
      {p.estado === 'sin_respuesta' ? (
        <Aviso
          tipo="alerta"
          titulo={
            p.tipo === 'urgente' ? 'Nadie respondió en 20 minutos' : 'Todavía no hay propuestas'
          }
        >
          <p>
            {p.tipo === 'urgente'
              ? 'Ningún especialista respondió a tu pedido urgente.'
              : 'Pasaron 12 horas sin propuestas.'}{' '}
            Podés revisar el pedido y relanzar la búsqueda
            {p.busqueda.intento < p.busqueda.maxIntentos
              ? ` (intento ${p.busqueda.intento + 1} de ${p.busqueda.maxIntentos})`
              : ''}
            , pedir una búsqueda manual o cancelar.
          </p>
        </Aviso>
      ) : null}
      {p.estado === 'busqueda_manual' ? (
        <Aviso tipo="info" titulo="El equipo de Handy está buscando por vos" rol="status">
          <p>
            Una persona busca especialistas para tu pedido. No podemos prometer un plazo ni que haya
            disponibles. Te avisamos si aparece una propuesta.
          </p>
        </Aviso>
      ) : null}
      {p.estado === 'cancelado' ? <Aviso tipo="info">Cancelaste este pedido.</Aviso> : null}
      {p.estado === 'vencido' ? (
        <Aviso tipo="info">
          La fecha que pediste ya pasó sin un acuerdo. Podés hacer un pedido nuevo.
        </Aviso>
      ) : null}

      <section className="tarjeta">
        <div className="tarjeta__cuerpo">
          <Datos
            filas={[
              [
                'Dónde',
                `${p.ubicacion.barrio ? `${p.ubicacion.barrio}, ` : ''}${p.ubicacion.ciudad}`,
              ],
              ...(f
                ? [
                    [
                      'Cuándo (solicitud)',
                      `${f.fecha.split('-').reverse().join('/')} · ${f.desde}${f.hasta ? ` a ${f.hasta}` : ''}`,
                    ] as const,
                  ]
                : ([['Cuándo', 'Lo antes posible']] as const)),
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
            ]}
          />
          <p style={{ margin: '10px 0 0' }}>{p.descripcion}</p>
          {p.fotos.length ? (
            <ul className="fotos">
              {p.fotos.map((x) => (
                <li key={x.id} className="foto">
                  <FotoPrivada url={x.url} alt="Foto del pedido" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <div className="acciones">
        {['con_propuestas'].includes(p.estado) ? (
          <Enlace className="boton" href={ruta('/pedidos/propuestas/', { pedido: p.id })}>
            Ver propuestas{p.propuestasPendientes ? ` (${p.propuestasPendientes})` : ''}
          </Enlace>
        ) : null}
        {p.estado === 'sin_respuesta' && p.busqueda.intento < p.busqueda.maxIntentos ? (
          <Boton
            icono="reintentar"
            cargando={accion.pendiente}
            onClick={() => correr('pedidoRelanzar', p)}
          >
            Relanzar la búsqueda
          </Boton>
        ) : null}
        {p.estado === 'sin_respuesta' ? (
          <Boton
            variante="claro"
            cargando={accion.pendiente}
            onClick={() => correr('pedidoBusquedaManual', p)}
          >
            Pedir búsqueda manual
          </Boton>
        ) : null}
        {p.estado === 'contratado' && p.trabajoId ? (
          <Enlace className="boton" href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>
            Ver el trabajo
          </Enlace>
        ) : null}
        {p.estado === 'buscando' ? (
          <Boton
            variante="claro"
            icono="editar"
            onClick={() => {
              setDescripcion(p.descripcion);
              setFotos(null);
              setHoja('editar');
            }}
          >
            Editar el pedido
          </Boton>
        ) : null}
        {puedeCancelar ? (
          <Boton variante="peligro" icono="cerrar" onClick={() => setHoja('cancelar')}>
            Cancelar el pedido
          </Boton>
        ) : null}
        {['cancelado', 'vencido'].includes(p.estado) ? (
          <Enlace className="boton" href={ruta('/pedir/', { rubro: p.rubro, tipo: p.tipo })}>
            Pedir de nuevo
          </Enlace>
        ) : null}
        {p.estado === 'sin_respuesta' ? (
          <Enlace
            className="boton boton--texto"
            href={ruta('/pedir/', { rubro: p.rubro, tipo: p.tipo })}
          >
            Hacer un pedido nuevo
          </Enlace>
        ) : null}
      </div>

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
}
