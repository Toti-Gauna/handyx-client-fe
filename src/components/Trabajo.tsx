'use client';

// Piezas y cuentas del trabajo contratado (Fase 7): las etapas del turno, lo acordado con su desglose, los totales de
// una obra y el historial. Las usan el seguimiento, el cierre, el pago y las pantallas de obra.
import type { EventoTrabajo as EsquemaEvento, Propuesta, Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { pesos, porcentaje } from '@/domain/dinero';
import { ACTOR_TEXTO, etiquetaPago, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando, fechaDeInstante, fechaLarga, horaDeInstante } from '@/domain/fechas';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import type { Consulta } from '@/data/hooks';
import { Boton, DatoFila, Etiqueta, Tarjeta } from '@/ui';
import { FilaTotal } from '@/ui/seguimiento';

import type { ReactNode } from 'react';

type EventoTrabajo = import('zod').infer<typeof EsquemaEvento>;

export const totalAcordado = (t: Trabajo) =>
  t.acuerdo.monto.centavos + t.acuerdo.comisionHandy.importe.centavos;
export const horarioAcordado = (t: Trabajo) =>
  t.acuerdo.horario ? cuando(t.acuerdo.horario.inicio) : 'A coordinar con el especialista';

/** El turno en dos líneas: «JUEVES 19/11» y «10:00 a 12:00 h» (o «A coordinar»). */
export function turnoTexto(t: Trabajo): { dia: string; hora: string } {
  const h = t.acuerdo.horario;
  if (!h) return { dia: 'A COORDINAR', hora: 'Con el especialista' };
  const desde = horaDeInstante(h.inicio);
  return {
    dia: fechaLarga(fechaDeInstante(h.inicio)).toUpperCase(),
    hora: h.fin ? `${desde} a ${horaDeInstante(h.fin)} h` : `Desde las ${desde} h`,
  };
}

// ── Etapas del turno (5 pasos) ─────────────────────────────────────────────────────────────────────────
/** Cuántas de las 5 etapas del turno están hechas según el estado; la que sigue es la actual. */
export const HECHAS_POR_ESTADO: Record<Trabajo['estado'], number> = {
  agendado: 1,
  en_camino: 1,
  en_sitio: 2,
  en_curso: 3,
  terminado_por_especialista: 4,
  finalizado: 5,
  cancelado: 0,
};

export const pasosTurno = (t: Trabajo) =>
  [
    { titulo: 'Turno confirmado', sub: horarioAcordado(t) },
    { titulo: 'En camino', sub: t.estado === 'en_camino' ? 'Ahora' : '' },
    { titulo: 'Llegó', sub: '' },
    { titulo: 'Trabajando', sub: '' },
    { titulo: 'Terminado y pago', sub: '' },
  ] as const;

// ── Cuentas ────────────────────────────────────────────────────────────────────────────────────────────
export const adicionalesAprobados = (propuestas: readonly Propuesta[], trabajoId: string) =>
  propuestas
    .filter((p) => p.tipo === 'adicional' && p.estado === 'aceptada' && p.trabajoId === trabajoId)
    .reduce((s, p) => s + p.monto.centavos, 0);

export interface Desglose {
  /** Lo acordado sin los adicionales aprobados. */
  readonly acuerdo: number;
  readonly adicional: number;
  /** Precio del especialista (acuerdo + adicional). */
  readonly especialista: number;
  readonly tarifa: number;
  /** Lo que se paga: especialista + tarifa de Handyx (0 % en la demo). */
  readonly total: number;
}

export function desglose(t: Trabajo, propuestas: readonly Propuesta[]): Desglose {
  const adicional = Math.min(adicionalesAprobados(propuestas, t.id), t.acuerdo.monto.centavos);
  const especialista = t.acuerdo.monto.centavos;
  const tarifa = t.acuerdo.comisionHandy.importe.centavos;
  return {
    acuerdo: especialista - adicional,
    adicional,
    especialista,
    tarifa,
    total: especialista + tarifa,
  };
}

/** Lo que pasaría con el total si se aprueba un adicional. */
export const totalSiAprueba = (t: Trabajo, adicionalCentavos: number) =>
  totalAcordado(t) +
  adicionalCentavos +
  Math.round((adicionalCentavos * t.acuerdo.comisionHandy.bp) / 10_000);

/** Texto del estado de un pago: lo que informó la persona se dice «informado», nunca «pagado» ni «verificado». */
export const textoPago = (p: Pick<RegistroPago, 'estado'>) =>
  p.estado === 'reportado' ? 'Informado (sin verificar)' : etiquetaPago(p).texto;

const VIGENTES: readonly RegistroPago['estado'][] = ['pendiente', 'reportado', 'verificado'];

/** El último pago vigente (no fallido ni cancelado) de una etapa, o del trabajo entero con `null`. */
export const pagoVigente = (pagos: readonly RegistroPago[], etapaId: string | null) =>
  [...pagos].reverse().find((p) => p.etapaId === etapaId && VIGENTES.includes(p.estado)) ?? null;

export interface TotalesObra {
  readonly total: number;
  /** Confirmado por otra fuente (verificado). */
  readonly verificado: number;
  /** Lo que informó la persona y todavía nadie confirmó. */
  readonly informado: number;
  readonly falta: number;
  readonly etapasPagas: number;
}

/** Informado ≠ verificado: cada importe se cuenta en un solo lugar según el estado real del pago. */
export function totalesObra(t: Trabajo, pagos: readonly RegistroPago[]): TotalesObra {
  const ids = t.etapas.length ? t.etapas.map((e) => e.id) : [null];
  let verificado = 0;
  let informado = 0;
  let etapasPagas = 0;
  for (const id of ids) {
    const p = pagoVigente(pagos, id);
    if (!p) continue;
    if (p.estado === 'verificado') verificado += p.monto.centavos;
    else if (p.estado === 'reportado') informado += p.monto.centavos;
    if (p.estado === 'verificado' || p.estado === 'reportado') etapasPagas += 1;
  }
  const total = totalAcordado(t);
  return {
    total,
    verificado,
    informado,
    falta: Math.max(0, total - verificado - informado),
    etapasPagas,
  };
}

export const etapasConfirmadas = (t: Trabajo) =>
  t.etapas.filter((e) => e.estado === 'confirmada').length;
export const etapaActual = (t: Trabajo) => t.etapas.find((e) => e.estado !== 'confirmada') ?? null;
export const esObra = (t: Trabajo) => t.etapas.length > 0;

export const TEXTO_ETAPA: Record<
  string,
  { texto: string; tono: 'exito' | 'amarillo' | 'azul' | 'gris' }
> = {
  pendiente: { texto: 'Pendiente', tono: 'gris' },
  en_curso: { texto: 'En curso', tono: 'azul' },
  terminada_por_especialista: { texto: 'Falta tu confirmación', tono: 'amarillo' },
  confirmada: { texto: 'Confirmada', tono: 'exito' },
};

// ── Lo acordado (en una hoja) ──────────────────────────────────────────────────────────────────────────
export function Acordado({ t, propuestas }: { t: Trabajo; propuestas: readonly Propuesta[] }) {
  const d = desglose(t, propuestas);
  return (
    <div className="ds-pila">
      <Tarjeta etiqueta="Lo acordado">
        <FilaTotal texto="Acuerdo" centavos={d.acuerdo} />
        {d.adicional ? <FilaTotal texto="Adicional aprobado" centavos={d.adicional} mas /> : null}
        {d.tarifa ? (
          <FilaTotal
            texto={`Tarifa de Handyx (${porcentaje(t.acuerdo.comisionHandy.bp)})`}
            centavos={d.tarifa}
          />
        ) : null}
        <FilaTotal texto="Total" centavos={d.total} fuerte />
      </Tarjeta>
      <DatoFila icono="calendario" etiqueta="Horario" valor={horarioAcordado(t)} />
      <p className="ds-texto">{t.acuerdo.alcance}</p>
      <p className="ds-fila-enlace__sub">Aceptado el {cuando(t.acuerdo.aceptadoEn)}</p>
      {t.historialAcuerdos.length ? (
        <details>
          <summary style={{ minHeight: '2.75rem', display: 'flex', alignItems: 'center' }}>
            Acuerdos anteriores ({t.historialAcuerdos.length})
          </summary>
          <ul className="ds-texto">
            {[...t.historialAcuerdos].reverse().map((a) => (
              <li key={a.propuestaId}>
                {pesos(a.monto.centavos)} · {a.horario ? cuando(a.horario.inicio) : 'sin horario'} ·
                aceptado {cuando(a.aceptadoEn)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

/** Historial del trabajo: quién hizo qué y cuándo. */
export function HistorialTrabajo({ eventos }: { eventos: readonly EventoTrabajo[] | null }) {
  if (!eventos?.length) return null;
  return (
    <Tarjeta etiqueta="Historial del trabajo">
      <Etiqueta como="h2">Historial del trabajo</Etiqueta>
      <ol className="ds-pila" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {eventos.map((ev) => (
          <li key={ev.id} className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
            <strong>{etiquetaTrabajo({ estado: ev.a }).texto}</strong>
            <span className="ds-fila-enlace__sub">
              {cuando(ev.ocurridoEn)} · {ACTOR_TEXTO[ev.actor] ?? ev.actor}
            </span>
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

/**
 * Lo que se ve mientras la pantalla no tiene todo: falta el id, cargando o error. Devuelve `null` cuando ya se puede
 * dibujar. Las consultas con `null` de parámetros (todavía no se pidieron) cuentan como cargando.
 */
export function estadoDeCarga(
  id: string | null,
  consultas: readonly Pick<Consulta<unknown>, 'estado' | 'error' | 'datos' | 'recargar'>[],
  faltaTitulo = 'Falta el trabajo',
): ReactNode | null {
  if (!id)
    return (
      <Vacio titulo={faltaTitulo}>
        <Boton href="/pedidos/" ancho={false} chico>
          Ver mi actividad
        </Boton>
      </Vacio>
    );
  const fallo = consultas.find((c) => c.estado === 'error' && c.error);
  if (fallo?.error)
    return (
      <ErrorEstado
        error={fallo.error}
        onReintentar={() => consultas.forEach((c) => c.estado === 'error' && c.recargar())}
      />
    );
  if (consultas.some((c) => c.datos === null)) return <Cargando forma="detalle" />;
  return null;
}
