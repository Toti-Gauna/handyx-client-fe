'use client';

// Piezas del trabajo contratado (rediseño 3.6): lo acordado, las etapas de una obra y el historial. Las usan el
// seguimiento (u-seguimiento) y el cierre (u-terminado).
import type { EventoTrabajo as EsquemaEvento, Trabajo } from '@/contracts/v1/propuestas';
import { pesos, porcentaje } from '@/domain/dinero';
import { ACTOR_TEXTO, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { BotonHx } from './acceso';
import { ChipEstado } from './hx';
import { Icono } from './Icono';

type EventoTrabajo = import('zod').infer<typeof EsquemaEvento>;

const ESTADO_ETAPA: Record<string, { texto: string; tono: 'azul' | 'gris' | 'ok' | 'alerta' }> = {
  pendiente: { texto: 'Pendiente', tono: 'gris' },
  en_curso: { texto: 'En curso', tono: 'azul' },
  terminada_por_especialista: { texto: 'Falta tu confirmación', tono: 'alerta' },
  confirmada: { texto: 'Confirmada', tono: 'ok' },
};

export const totalAcordado = (t: Trabajo) =>
  t.acuerdo.monto.centavos + t.acuerdo.comisionHandy.importe.centavos;
export const horarioAcordado = (t: Trabajo) =>
  t.acuerdo.horario ? cuando(t.acuerdo.horario.inicio) : 'A coordinar con el especialista';

/** Lo acordado: el total vigente, su desglose, el horario y qué incluye (copia inmutable de lo aceptado). */
export function Acordado({ t, desplegable = false }: { t: Trabajo; desplegable?: boolean }) {
  const contenido = (
    <>
      <dl className="du-acordado__plata">
        <div className="hd-dato">
          <dt>Precio del especialista</dt>
          <dd>{pesos(t.acuerdo.monto.centavos)}</dd>
        </div>
        <div className="hd-dato">
          <dt>Tarifa de Handyx ({porcentaje(t.acuerdo.comisionHandy.bp)})</dt>
          <dd>{pesos(t.acuerdo.comisionHandy.importe.centavos)}</dd>
        </div>
        <div className="hd-dato hd-dato--total">
          <dt>Total acordado</dt>
          <dd className="hd-precio">{pesos(totalAcordado(t))}</dd>
        </div>
      </dl>
      <p className="du-acordado__dato">
        <Icono nombre="calendario" />
        <span>
          <small>Horario</small>
          <strong>{horarioAcordado(t)}</strong>
        </span>
      </p>
      <p className="du-acordado__alcance">{t.acuerdo.alcance}</p>
      <p className="du-acordado__aceptado">Aceptado el {cuando(t.acuerdo.aceptadoEn)}</p>
      {t.historialAcuerdos.length ? (
        <details className="du-acordado__antes">
          <summary>Acuerdos anteriores ({t.historialAcuerdos.length})</summary>
          <ul>
            {[...t.historialAcuerdos].reverse().map((a) => (
              <li key={a.propuestaId}>
                {pesos(a.monto.centavos)} · {a.horario ? cuando(a.horario.inicio) : 'sin horario'} ·
                aceptado {cuando(a.aceptadoEn)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
  return desplegable ? (
    <details className="hd-tarjeta du-acordado">
      <summary>
        <span>
          <small>Total vigente para vos</small>
          <strong className="hd-precio">{pesos(totalAcordado(t))}</strong>
        </span>
        <span className="du-acordado__ver">
          Lo acordado <Icono nombre="abajo" />
        </span>
      </summary>
      {contenido}
    </details>
  ) : (
    <section className="hd-tarjeta du-acordado" aria-labelledby="lo-acordado">
      <h2 id="lo-acordado" className="du-acordado__titulo">
        Lo acordado
      </h2>
      {contenido}
    </section>
  );
}

/** Etapas de una obra: cada una se confirma por separado, y la obra no se cierra con etapas sin confirmar. */
export function EtapasObra({
  t,
  pendiente,
  onConfirmar,
}: {
  t: Trabajo;
  pendiente: boolean;
  onConfirmar: (etapaId: string, version: number) => void;
}) {
  if (!t.etapas.length) return null;
  return (
    <section className="du-etapas-obra" aria-labelledby="etapas">
      <h2 id="etapas" className="hd-sobre du-sobre">
        Etapas de la obra
      </h2>
      <ol>
        {t.etapas.map((et) => {
          const s = ESTADO_ETAPA[et.estado] ?? ESTADO_ETAPA.pendiente!;
          return (
            <li key={et.id} className={`du-etapa-obra du-etapa-obra--${et.estado}`}>
              <span className="du-etapa-obra__fila">
                <strong>
                  {et.orden}. {et.titulo}
                </strong>
                <ChipEstado e={s} />
              </span>
              <span className="du-etapa-obra__monto">{pesos(et.monto.centavos)}</span>
              {et.estado === 'terminada_por_especialista' ? (
                <BotonHx
                  variante="amarillo"
                  icono="check"
                  cargando={pendiente}
                  onClick={() => onConfirmar(et.id, et.version)}
                >
                  Confirmar esta etapa
                </BotonHx>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Historial del trabajo: quién hizo qué y cuándo. */
export function HistorialTrabajo({ eventos }: { eventos: readonly EventoTrabajo[] | null }) {
  return (
    <details className="du-historial-trabajo">
      <summary>Historial del trabajo</summary>
      {eventos ? (
        <ol>
          {eventos.map((ev) => (
            <li key={ev.id}>
              <strong>{etiquetaTrabajo({ estado: ev.a }).texto}</strong>
              <span>
                {cuando(ev.ocurridoEn)} · {ACTOR_TEXTO[ev.actor] ?? ev.actor}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p>Cargando…</p>
      )}
    </details>
  );
}
