'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  AvatarHx,
  CabeceraInicio,
  ChipEstado,
  HandyRubro,
  Marcado,
  Pantalla,
  entra,
} from '@/components/hx';
import { MapaHx } from '@/components/MapaHx';
import { Icono } from '@/components/Icono';
import { ModalFee } from '@/components/ModalFee';
import { Enlace, ruta } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { TituloDocumento } from '@/components/TituloDocumento';
import { ErrorEstado, Hoja } from '@/components/ui';
import { RUBROS, type Pedido } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { TAREAS } from '@/content/inicio';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO, TIPOS_INFO, etiquetaPedido, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando, fechaCorta } from '@/domain/fechas';

/**
 * Inicio (rediseño, pantalla modelo del lote 3.1). Igual que la demo de la landing (u-inicio): dirección, "¿Qué
 * necesitás hoy?", rubros, lo que está en curso como ticket, ayuda para elegir y arreglos frecuentes.
 */
export default function Inicio() {
  const { sesion } = useSesion();
  const [verDireccion, setVerDireccion] = useState(false);
  const trabajos = useConsulta('trabajos', { consulta: { limite: 20 } }, { cada: 12_000 });
  const pedidos = useConsulta(
    'pedidos',
    { consulta: { vista: 'activos', limite: 10 } },
    { cada: 8_000 },
  );
  const ubicacion = sesion.perfil.ubicacion;
  const ciudad = ubicacion?.ciudad ?? null;
  const cobertura = useConsulta('cobertura', ciudad ? { consulta: { ciudad } } : null);
  const incompleto = sesion.cuenta.estado === 'perfil_incompleto';
  const sinCobertura = cobertura.datos?.cubierta === false;
  const puedePedir = !incompleto && !sinCobertura && sesion.cuenta.estado === 'activa';
  const destino = (params: Record<string, string>) =>
    puedePedir ? ruta('/pedir/', params) : '/pedir/';

  const rubroDe = (pedidoId: string) =>
    pedidos.datos?.items.find((p) => p.id === pedidoId)?.rubro ?? null;
  const enCurso = trabajos.datos?.items.find((t) =>
    ['en_camino', 'en_sitio', 'en_curso', 'terminado_por_especialista'].includes(t.estado),
  );
  const proximo = trabajos.datos?.items
    .filter((t) => t.estado === 'agendado')
    .sort((a, b) =>
      (a.acuerdo.horario?.inicio ?? '').localeCompare(b.acuerdo.horario?.inicio ?? ''),
    )[0];
  const conPropuestas = pedidos.datos?.items.find((p) => p.estado === 'con_propuestas');
  const buscando = pedidos.datos?.items.find((p) =>
    ['buscando', 'sin_respuesta', 'busqueda_manual'].includes(p.estado),
  );

  const direccion = ubicacion
    ? [ubicacion.direccion, ubicacion.barrio].filter(Boolean).join(' · ')
    : 'Agregá tu dirección';

  return (
    <Pantalla arriba={<CabeceraInicio />}>
      <TituloDocumento texto="Inicio" />
      <ModalFee />
      <div className="du-cuerpo du-inicio">
        <button
          type="button"
          className="hd-chip hd-chip--tinte du-direccion"
          aria-label={`Tu dirección: ${direccion}. Ver en el mapa`}
          aria-haspopup="dialog"
          onClick={() => setVerDireccion(true)}
          {...entra(0)}
        >
          <Icono nombre="pin" />
          <span>{direccion}</span>
          <Icono nombre="abajo" />
        </button>
        <Hoja abierta={verDireccion} onCerrar={() => setVerDireccion(false)} titulo="Tu dirección">
          {ubicacion?.coordenadas ? (
            <MapaHx
              modo="ver"
              centro={ubicacion.coordenadas}
              etiqueta="Mapa: tu casa"
              clase="du-direccion-mapa"
            />
          ) : (
            <p className="texto-suave">Todavía no marcaste tu casa en el mapa.</p>
          )}
          <p>
            <strong>{ubicacion?.direccion ?? 'Sin dirección'}</strong>
            {ubicacion ? (
              <>
                <br />
                {[ubicacion.barrio, ubicacion.ciudad].filter(Boolean).join(', ')}
              </>
            ) : null}
          </p>
          <p className="texto-suave">
            Solo la ve el especialista que elijas, cuando se acuerda el trabajo.
          </p>
          <div className="acciones">
            <Enlace href="/cuenta/datos/" className="boton">
              Cambiar la dirección
            </Enlace>
          </div>
        </Hoja>
        <div {...entra(1)}>
          <h1 className="hd-titulo hd-titulo--grande du-inicio__titulo">
            <Marcado texto="¿Qué necesitás ==hoy==?" />
          </h1>
        </div>

        {incompleto ? (
          <div className="du-aviso" {...entra(2)}>
            <strong>Completá tu perfil para pedir.</strong> Te falta{' '}
            {sesion.pendientes.camposPerfil.length ? 'completar tus datos' : 'aceptar los textos'}.{' '}
            <Enlace href="/perfil/">Completar ahora</Enlace>
          </div>
        ) : null}
        {sinCobertura ? (
          <p className="du-nota" {...entra(2)}>
            <Icono nombre="info" />
            <span>
              Todavía no llegamos a {ciudad}. Empezamos en Mar del Plata: guardamos tu ciudad como
              interés y te avisamos cuando lleguemos.
            </span>
          </p>
        ) : null}

        <div className="hd-mosaicos du-rubros" role="group" aria-label="Rubros">
          {RUBROS.map((r, i) => (
            <Enlace
              key={r}
              href={destino({ rubro: r })}
              className="hd-mosaico du-rubro"
              {...entra(2 + i, 'pop')}
            >
              <HandyRubro rubro={r} />
              <span aria-hidden="true">{RUBROS_INFO[r].corto}</span>
              <span className="sr-only">{RUBROS_INFO[r].nombre}</span>
            </Enlace>
          ))}
        </div>

        {trabajos.estado === 'error' && trabajos.error ? (
          <ErrorEstado error={trabajos.error} onReintentar={trabajos.recargar} />
        ) : enCurso ? (
          <TicketTrabajo
            t={enCurso}
            sobre="Trabajo en curso"
            accion="Seguir el trabajo"
            rubro={rubroDe(enCurso.pedidoId)}
            vivo
          />
        ) : conPropuestas ? (
          <TicketPropuestas p={conPropuestas} />
        ) : buscando ? (
          <TicketPedido p={buscando} />
        ) : proximo ? (
          <TicketTrabajo
            t={proximo}
            sobre="Tu próximo turno"
            accion="Ver el turno"
            rubro={rubroDe(proximo.pedidoId)}
          />
        ) : null}

        <Enlace href="/handia/" className="hd-tarjeta hd-tarjeta--azul du-handia" {...entra(9)}>
          <span className="du-handia__luz" aria-hidden="true">
            <i />
            <Image
              className="hd-handy du-handia__img"
              src="/img/handy-lamparita.webp"
              alt=""
              width={202}
              height={346}
            />
          </span>
          <span className="du-handia__textos">
            <small>¿No sabés qué rubro es?</small>
            <strong>Contale a HandIA</strong>
            <span>
              <Icono nombre="chispas" />
              Te ayuda a armar el pedido
            </span>
          </span>
          <span className="du-handia__flecha" aria-hidden="true">
            <Icono nombre="flecha" />
          </span>
        </Enlace>

        <div {...entra(10)}>
          <h2 className="hd-titulo hd-titulo--chico hd-titulo--azul du-inicio__sub">Quiero…</h2>
        </div>
        <div
          className="hd-mosaicos du-quieros"
          role="group"
          aria-label="Arreglos frecuentes"
          {...entra(11)}
        >
          {TAREAS.map((t) => (
            <Enlace
              key={t.id}
              href={destino({ rubro: t.rubro, tarea: t.id })}
              className="hd-mosaico du-quiero"
            >
              <span className="du-quiero__ico">
                <Icono nombre={t.icono} />
              </span>
              <span>{t.texto}</span>
            </Enlace>
          ))}
        </div>
        <p className="du-info" {...entra(12)}>
          <Icono nombre="info" />
          <span>
            Son tareas, no rubros nuevos: cada una la toma un especialista del rubro que
            corresponde.
          </span>
        </p>
      </div>
    </Pantalla>
  );
}

/** Ticket troquelado de la demo (du-proximo): arriba quién y el estado, abajo cuándo y la acción. */
function Ticket({
  sobre,
  href,
  arriba,
  abajo,
  accion,
  vivo = false,
}: {
  sobre: string;
  href: string;
  arriba: React.ReactNode;
  abajo: React.ReactNode;
  accion: string;
  vivo?: boolean;
}) {
  return (
    <section className="du-proximo" aria-label={sobre} {...entra(8)}>
      <p className="hd-sobre du-sobre">{sobre}</p>
      <Enlace href={href} className="hd-ticket du-proximo__ticket">
        <span
          className={`hd-ticket__papel du-proximo__papel${vivo ? ' du-proximo__papel--vivo' : ''}`}
        >
          <span className="du-proximo__arriba">{arriba}</span>
          <span className="hd-ticket__corte" />
          <span className="du-proximo__abajo">
            {abajo}
            <span className="du-proximo__ver">
              {accion}
              <Icono nombre="derecha" />
            </span>
          </span>
        </span>
      </Enlace>
    </section>
  );
}

function Quien({ titulo, rubro }: { titulo: string; rubro: Pedido['rubro'] | null }) {
  return (
    <span className="du-proximo__quien">
      <strong>{titulo}</strong>
      {rubro ? (
        <small>
          <span className="du-ico">
            <Icono nombre={RUBROS_INFO[rubro].icono} />
          </span>
          {RUBROS_INFO[rubro].nombre}
        </small>
      ) : null}
    </span>
  );
}

function TicketTrabajo({
  t,
  sobre,
  accion,
  rubro,
  vivo = false,
}: {
  t: Trabajo;
  sobre: string;
  accion: string;
  rubro: Pedido['rubro'] | null;
  vivo?: boolean;
}) {
  const e = etiquetaTrabajo(t);
  const horario = t.acuerdo.horario ? cuando(t.acuerdo.horario.inicio) : 'Horario a coordinar';
  return (
    <Ticket
      sobre={sobre}
      href={ruta('/trabajos/detalle/', { id: t.id })}
      vivo={vivo}
      accion={accion}
      arriba={
        <>
          <AvatarHx
            nombre={t.especialista.nombrePublico}
            verificado={t.especialista.verificaciones.length > 0}
          />
          <Quien titulo={t.especialista.nombrePublico} rubro={rubro} />
          <ChipEstado e={e} vivo={vivo} />
        </>
      }
      abajo={
        <>
          <Icono nombre="calendario" />
          <strong>{horario}</strong>
        </>
      }
    />
  );
}

function TicketPropuestas({ p }: { p: Pedido }) {
  const n = p.propuestasPendientes;
  return (
    <Ticket
      sobre="Para resolver"
      href={ruta('/pedidos/propuestas/', { pedido: p.id })}
      accion="Ver propuestas"
      arriba={
        <>
          <span className="hd-avatar du-avatar-icono" aria-hidden="true">
            <Icono nombre={RUBROS_INFO[p.rubro].icono} />
          </span>
          <Quien titulo={`${n} ${n === 1 ? 'propuesta' : 'propuestas'}`} rubro={p.rubro} />
          <span className="hd-chip hd-chip--amarillo hd-chip--mini">Para elegir</span>
        </>
      }
      abajo={
        <>
          <Icono nombre="info" />
          <strong>Compará y elegí</strong>
        </>
      }
    />
  );
}

const cuandoSolicitado = (f: NonNullable<Pedido['fechaSolicitada']>) =>
  `${fechaCorta(f.fecha)} · ${f.desde}${f.hasta ? ` a ${f.hasta}` : ''}`;

function TicketPedido({ p }: { p: Pedido }) {
  const e = etiquetaPedido(p);
  return (
    <Ticket
      sobre="Tu pedido"
      href={ruta('/pedidos/detalle/', { id: p.id })}
      accion="Ver el pedido"
      vivo={p.estado === 'buscando'}
      arriba={
        <>
          <span className="hd-avatar du-avatar-icono" aria-hidden="true">
            <Icono nombre={RUBROS_INFO[p.rubro].icono} />
          </span>
          <Quien
            titulo={`${RUBROS_INFO[p.rubro].nombre} · ${TIPOS_INFO[p.tipo].nombre}`}
            rubro={null}
          />
          <ChipEstado e={e} vivo={p.estado === 'buscando'} />
        </>
      }
      abajo={
        <>
          <Icono nombre="calendario" />
          <strong>
            {p.fechaSolicitada ? cuandoSolicitado(p.fechaSolicitada) : 'Lo antes posible'}
          </strong>
        </>
      }
    />
  );
}
