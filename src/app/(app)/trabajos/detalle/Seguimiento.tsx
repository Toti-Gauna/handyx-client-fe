'use client';

import { Barra, ChipsVerificacion, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import {
  HECHAS_POR_ESTADO,
  esObra,
  etapasConfirmadas,
  pasosTurno,
  totalAcordado,
  turnoTexto,
} from '@/components/Trabajo';
import { RUBROS_INFO, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import {
  AccionesFijas,
  Avatar,
  Boton,
  Chip,
  Etapas,
  MosaicoIcono,
  Monto,
  Nota,
  Tarjeta,
  Ticket,
} from '@/ui';
import { PedidoAmarillo } from '@/ui/seguimiento';
import { AtajosTrabajo } from './AtajosTrabajo';
import type { ContextoTrabajo } from './contexto';
import { AvisoError, PedidosPendientes } from './Avisos';
import { EnCamino } from './EnCamino';

const VOLVER = { href: '/pedidos/', etiqueta: 'Volver a Actividad' };
const GAP = (v: string) => ({ ['--ds-gap' as string]: v });

export function Seguimiento(c: ContextoTrabajo) {
  if (c.t.estado === 'en_camino') return <EnCamino {...c} />;
  if (c.t.estado === 'agendado') return <Agendado {...c} />;
  if (c.t.estado === 'en_sitio') return <Llego {...c} />;
  return <Trabajando {...c} />;
}

function Agendado(c: ContextoTrabajo) {
  const { t, esp } = c;
  const turno = turnoTexto(t);
  const rubro = c.pedido ? RUBROS_INFO[c.pedido.rubro].nombre : 'Trabajo';
  const lugar = c.pedido?.ubicacion;
  return (
    <Pantalla
      arriba={<Barra titulo="Tu turno" volver={VOLVER} sub={`${rubro} · ${esp}`} />}
      pie={
        <AccionesFijas>
          <Boton
            variante="contorno"
            icono="calendario"
            href={ruta('/trabajos/cambiar/', { id: t.id })}
          >
            Cambiar el turno
          </Boton>
          <Boton variante="peligro" icono="cerrar" onClick={c.abrirCancelar}>
            Cancelar el turno
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <Ticket
          etiqueta="Tu turno"
          arriba={
            <>
              <Avatar nombre={esp} tam={3.25} />
              <span className="ds-crece ds-pila" style={GAP('0.25rem')}>
                <strong style={{ fontSize: '1rem' }}>{esp}</strong>
                <span className="ds-fila" style={{ flexWrap: 'wrap', ...GAP('0.375rem') }}>
                  <ChipsVerificacion e={t.especialista} />
                </span>
              </span>
            </>
          }
          abajo={
            <>
              <span className="ds-fila" style={{ justifyContent: 'space-between' }}>
                <span className="ds-pila" style={GAP('0.125rem')}>
                  <span className="ds-etiqueta">{turno.dia}</span>
                  <strong className="ds-titulo" style={{ ['--ds-tam' as string]: '1.25rem' }}>
                    {turno.hora}
                  </strong>
                </span>
                <Monto centavos={totalAcordado(t)} tam={1.375} />
              </span>
              {lugar ? (
                <span className="ds-fila" style={{ fontSize: '0.9375rem' }}>
                  <Icono nombre="pin" />
                  {lugar.direccion}
                  {lugar.barrio ? ` · ${lugar.barrio}` : ''}
                </span>
              ) : null}
            </>
          }
        />
        <Tarjeta etiqueta="Etapas del turno">
          <Etapas
            pasos={pasosTurno(t)}
            hechas={HECHAS_POR_ESTADO[t.estado]}
            etiqueta="Etapas del turno"
          />
        </Tarjeta>
        <PedidosPendientes c={c} />
        <AvisoError c={c} />
        <Nota icono="campana">
          El día del turno te avisamos cuando {esp} salga para tu casa. Vas a poder verlo en el mapa
          solo mientras viene.
        </Nota>
        <AtajosTrabajo c={c} />
      </div>
    </Pantalla>
  );
}

/** Llegó: lo marcó el especialista desde su celular. No hay nada que tocar salvo escribirle si algo no cierra. */
function Llego(c: ContextoTrabajo) {
  const { t, esp } = c;
  return (
    <Pantalla
      arriba={<Barra titulo={`Llegó ${esp}`} volver={VOLVER} sub="Lo marcó desde su celular" />}
      pie={
        <AccionesFijas>
          <Boton icono="chat" href={ruta('/chats/conversacion/', { id: t.conversacionId })}>
            Escribirle a {esp}
          </Boton>
          <Boton variante="contorno" icono="escudo" href="/soporte/">
            Avisar a Soporte
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <div className="dss-codigo-llegada">
          <Avatar nombre={esp} tam={6} />
          <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.5rem' }}>
            {esp} llegó
          </h2>
          <span className="ds-fila" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <ChipsVerificacion e={t.especialista} />
          </span>
        </div>
        <Tarjeta etiqueta="Etapas del turno">
          <Etapas
            pasos={pasosTurno(t)}
            hechas={HECHAS_POR_ESTADO[t.estado]}
            etiqueta="Etapas del turno"
          />
        </Tarjeta>
        <PedidosPendientes c={c} />
        <Nota icono="escudo" tono="amarillo">
          Si no es quien esperabas, no abras y escribile a Soporte de Handyx.
        </Nota>
        <AvisoError c={c} />
        <button type="button" className="dss-enlace-texto" onClick={c.abrirCancelar}>
          Cancelar el trabajo
        </button>
      </div>
    </Pantalla>
  );
}

/** Trabajando: como el «Trabajo» del especialista (título, estado, etapas, pedidos, último movimiento y atajos). */
function Trabajando(c: ContextoTrabajo) {
  const { t, esp } = c;
  const rubro = c.pedido ? RUBROS_INFO[c.pedido.rubro] : null;
  const ultimo = c.eventos?.length ? c.eventos[c.eventos.length - 1]! : null;
  const obra = esObra(t);
  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Trabajo"
          volver={VOLVER}
          sub={cuando(t.acuerdo.aceptadoEn).split(' · ')[0] ?? ''}
        />
      }
    >
      <div className="ds ds-cuerpo">
        <div className="ds-fila" style={GAP('0.875rem')}>
          <MosaicoIcono icono={rubro?.icono ?? 'engranaje'} tam={4} />
          <span className="ds-crece ds-pila" style={GAP('0.25rem')}>
            <span>
              <Chip tono="azul" icono="engranaje">
                {etiquetaTrabajo(t).texto}
              </Chip>
            </span>
            <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.5rem' }}>
              {rubro ? rubro.nombre : 'Trabajo'}
            </h2>
            <span className="ds-fila-enlace__sub">{esp}</span>
          </span>
        </div>
        <Tarjeta etiqueta="Etapas del turno">
          <Etapas
            pasos={pasosTurno(t)}
            hechas={HECHAS_POR_ESTADO[t.estado]}
            etiqueta="Etapas del turno"
          />
        </Tarjeta>
        <PedidosPendientes c={c} />
        {obra ? (
          <PedidoAmarillo
            icono="obra"
            titulo="Es una obra por etapas"
            sub={`${etapasConfirmadas(t)} de ${t.etapas.length} etapas confirmadas · ver la obra`}
            href={ruta('/obras/detalle/', { id: t.id })}
          />
        ) : null}
        {ultimo ? (
          <Tarjeta etiqueta="Último movimiento">
            <span className="ds-etiqueta">ÚLTIMO MOVIMIENTO</span>
            <p className="ds-texto">
              <strong>{etiquetaTrabajo({ estado: ultimo.a }).texto}</strong>
              <br />
              <span className="ds-fila-enlace__sub">{cuando(ultimo.ocurridoEn)}</span>
            </p>
          </Tarjeta>
        ) : null}
        <AvisoError c={c} />
        <AtajosTrabajo c={c} />
        <Enlace
          className="dss-enlace-texto"
          href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
        >
          Abrir un reclamo
        </Enlace>
      </div>
    </Pantalla>
  );
}
