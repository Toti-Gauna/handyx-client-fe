'use client';

// Pedido en búsqueda (rediseño 3.4, como u-buscando de la demo): tu casa en el mapa con el pulso y la hoja azul con lo
// que está pasando. Sin tiempos de llegada ni promesas de plazo: solo hasta cuándo sigue la búsqueda.
import Image from 'next/image';
import type { Pedido } from '@/contracts/v1/pedidos';
import { RUBROS_INFO, TIPOS_INFO } from '@/domain/etiquetas';
import { fechaLarga, horaDeInstante } from '@/domain/fechas';
import { BotonHx } from './acceso';
import { entra } from './hx';
import { Icono } from './Icono';
import { MapaHx } from './MapaHx';
import { Enlace, ruta } from './nav';
import { TituloDocumento } from './TituloDocumento';

export const ESTADOS_BUSQUEDA: readonly Pedido['estado'][] = [
  'buscando',
  'sin_respuesta',
  'busqueda_manual',
];

export function PedidoBuscando({
  p,
  pendiente,
  error,
  onEditar,
  onCancelar,
  onRelanzar,
  onBusquedaManual,
}: {
  p: Pedido;
  pendiente: boolean;
  error: string | null;
  onEditar: () => void;
  onCancelar: () => void;
  onRelanzar: () => void;
  onBusquedaManual: () => void;
}) {
  const zona = p.ubicacion.barrio ?? p.ubicacion.ciudad;
  const f = p.fechaSolicitada;
  const cuando = f
    ? `${fechaLarga(f.fecha)} · ${f.desde}${f.hasta ? ` a ${f.hasta}` : ''} h`
    : 'Lo antes posible';
  const quedanIntentos = p.busqueda.intento < p.busqueda.maxIntentos;
  const titulo =
    p.estado === 'buscando'
      ? 'Avisando a especialistas de tu ==zona=='
      : p.estado === 'busqueda_manual'
        ? 'El equipo de Handy busca ==por vos=='
        : p.tipo === 'urgente'
          ? 'Nadie respondió ==todavía=='
          : 'Todavía no hay ==propuestas==';

  return (
    <div className="pantalla du-app du-mapa-pantalla du-buscando hd-entrando">
      <TituloDocumento texto={`${RUBROS_INFO[p.rubro].nombre} · buscando`} />
      <div className="du-mapa-zona">
        {p.ubicacion.coordenadas ? (
          <MapaHx
            key={p.estado}
            modo="ver"
            centro={p.ubicacion.coordenadas}
            zoom={14.5}
            pulso={p.estado !== 'sin_respuesta'}
            etiqueta={`Mapa: tu casa en ${zona}`}
            clase="du-buscando__mapa"
          />
        ) : (
          <div className="du-buscando__sin-mapa" aria-hidden="true" />
        )}
        <Enlace href="/pedidos/" className="du-atras du-flotante" aria-label="Volver a Actividad">
          <Icono nombre="atras" />
        </Enlace>
        {p.estado !== 'sin_respuesta' ? (
          <span className="hd-chip hd-chip--noche hd-vivo du-mapa-chip" {...entra(1, 'pop')}>
            Buscando en {zona}
          </span>
        ) : null}
      </div>

      <section
        className="hd-hoja-azul du-hoja-azul du-hoja-azul--mapa du-buscando__hoja"
        aria-labelledby="buscando-titulo"
      >
        <span className="du-manija" aria-hidden="true" />
        {p.estado === 'sin_respuesta' ? (
          <Image
            className="hd-handy du-buscando__handy"
            src="/img/handy-engranaje-roto.webp"
            alt=""
            width={338}
            height={339}
          />
        ) : null}
        <h1 id="buscando-titulo" className="du-hoja-azul__titulo du-buscando__titulo">
          {titulo.split(/==(.+?)==/).map((t, i) => (i % 2 ? <mark key={i}>{t}</mark> : t))}
        </h1>
        <p className="du-buscando__pedido">
          <Icono nombre={RUBROS_INFO[p.rubro].icono} />
          <span>
            {RUBROS_INFO[p.rubro].nombre} · {TIPOS_INFO[p.tipo].nombre} · {cuando}
          </span>
        </p>

        {p.estado === 'buscando' ? (
          <>
            <div className="du-llegan" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="du-llega">
                  <span className="du-llega__vacio">
                    <i className="hd-esqueleto" />
                    <i className="hd-esqueleto" />
                    <i className="hd-esqueleto" />
                  </span>
                </div>
              ))}
            </div>
            <p className="du-hoja-azul__nota" role="status">
              Cada especialista revisa tu pedido y te manda su precio. Te avisamos cuando lleguen
              propuestas: no podemos prometer cuándo. La búsqueda sigue hasta las{' '}
              {horaDeInstante(p.busqueda.ventanaHasta)} (intento {p.busqueda.intento} de{' '}
              {p.busqueda.maxIntentos}).
            </p>
          </>
        ) : p.estado === 'busqueda_manual' ? (
          <p className="du-hoja-azul__nota" role="status">
            Una persona del equipo busca especialistas para tu pedido. No podemos prometer un plazo
            ni que haya disponibles. Te avisamos si aparece una propuesta.
          </p>
        ) : (
          <p className="du-hoja-azul__nota" role="status">
            {p.tipo === 'urgente'
              ? 'Ningún especialista respondió a tu pedido urgente en 20 minutos.'
              : 'Pasaron 12 horas sin propuestas.'}{' '}
            Podés relanzar la búsqueda
            {quedanIntentos
              ? ` (intento ${p.busqueda.intento + 1} de ${p.busqueda.maxIntentos})`
              : ''}
            , pedir que el equipo de Handy busque por vos o cancelar.
          </p>
        )}

        {error ? (
          <p className="du-buscando__error" role="alert">
            <Icono nombre="alerta" />
            {error}
          </p>
        ) : null}

        <div className="du-buscando__acciones">
          {p.estado === 'sin_respuesta' && quedanIntentos ? (
            <BotonHx
              variante="amarillo"
              icono="reintentar"
              cargando={pendiente}
              onClick={onRelanzar}
            >
              Relanzar la búsqueda
            </BotonHx>
          ) : null}
          {p.estado === 'sin_respuesta' ? (
            <BotonHx variante="blanco" cargando={pendiente} onClick={onBusquedaManual}>
              Pedir búsqueda manual
            </BotonHx>
          ) : null}
          {p.estado === 'buscando' ? (
            <BotonHx variante="blanco" icono="editar" onClick={onEditar}>
              Editar el pedido
            </BotonHx>
          ) : null}
          {p.estado === 'sin_respuesta' ? (
            <Enlace
              className="hd-boton du-boton-borde"
              href={ruta('/pedir/', { rubro: p.rubro, tipo: p.tipo })}
            >
              Hacer un pedido nuevo
            </Enlace>
          ) : null}
          <button type="button" className="du-buscando__cancelar" onClick={onCancelar}>
            Cancelar el pedido
          </button>
        </div>
      </section>
    </div>
  );
}
