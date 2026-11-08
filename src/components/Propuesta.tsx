'use client';
// Propuestas (Fase 7 · C-Propuestas): la tarjeta con jerarquía (quién, precio, datos chicos, verificaciones reales y
// acciones) y los textos que salen del detalle de la propuesta (draft.4). La tarjeta no acepta ni rechaza: cada acción
// lleva al detalle, al perfil o a la hoja de confirmación.
import type { EspecialistaResumen } from '@/contracts/v1/pedidos';
import type { DetallePropuesta, Propuesta } from '@/contracts/v1/propuestas';
import { etiquetaPropuesta } from '@/domain/etiquetas';
import { cuando, fechaCorta, fechaDeInstante, horaDeInstante } from '@/domain/fechas';
import { Avatar, Chip } from '@/ui';
import { AccionesPropuesta, BloquePrecio, DatoMini } from '@/ui/pedir';
import { Contador } from './Contador';
import { Icono } from './Icono';
import { ruta } from './nav';
import { useAhora } from './SesionProvider';

/** Iniciales para el avatar ("Especialista 1" → "E1"). Sin foto: el contrato no expone fotos de perfil. */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return partes
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();
}

const VERIF_CORTO: Record<string, string> = {
  identidad: 'Identidad',
  antecedentes: 'Antecedentes',
  matricula: 'Matrícula',
};

/** Verificaciones tal como las informa el backend. Sin datos, no se afirma nada. */
export function Verificaciones({ e, conVacio = false }: { e: EspecialistaResumen; conVacio?: boolean }) {
  if (!e.verificaciones.length)
    return conVacio ? (
      <Chip tono="gris" icono="info">
        Todavía sin verificaciones registradas
      </Chip>
    ) : null;
  return (
    <ul
      className="ds-fila"
      aria-label="Verificaciones de Handyx"
      style={{ listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', gap: '0.375rem' }}
    >
      {e.verificaciones.map((v) => (
        <li key={v.tipo}>
          <Chip tono="exito" icono="escudo">
            {VERIF_CORTO[v.tipo] ?? v.tipo}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

/** Vigencia de una propuesta: cuenta regresiva si falta menos de una hora; si no, la fecha. */
export function Vigencia({ hasta }: { hasta: string }) {
  const ahora = useAhora(1000);
  const falta = Date.parse(hasta) - ahora;
  if (falta <= 0) return <span>venció</span>;
  return falta < 3_600_000 ? (
    <span>
      vence en <Contador hasta={hasta} formato="corto" />
    </span>
  ) : (
    <span>vence el {cuando(hasta)}</span>
  );
}

// ── Textos del detalle ──────────────────────────────────────────────────────────────────────────────────
const hora = (i: string) => horaDeInstante(i).replace(/:00$/, '');

/** «Jue 19 · 10 a 12 h» o, sin horario (urgencias), «Horario al aceptar». */
export function horarioCorto(p: Pick<Propuesta, 'horario'>): string {
  if (!p.horario) return 'Horario al aceptar';
  const { inicio, fin } = p.horario;
  return `${fechaCorta(fechaDeInstante(inicio))} · ${hora(inicio)}${fin ? ` a ${hora(fin)}` : ''} h`;
}

export function duracionTexto(d: NonNullable<DetallePropuesta['duracion']>): string {
  const u = d.unidad === 'horas' ? (d.maximo === 1 ? 'hora' : 'horas') : d.maximo === 1 ? 'día' : 'días';
  return d.minimo === d.maximo ? `${d.maximo} ${u}` : `${d.minimo} a ${d.maximo} ${u}`;
}
export const equipoTexto = (e: DetallePropuesta['equipo']) =>
  e.personas === 1 ? 'Va solo' : `${e.personas} personas`;
export const garantiaTexto = (dias: number | null) =>
  dias ? `${dias} días` : 'Sin garantía';
export function materialesTexto(m: DetallePropuesta['materiales']): string | null {
  if (!m) return null;
  return m.incluidos ? 'Materiales incluidos' : 'Materiales aparte';
}

export const totalDe = (p: Pick<Propuesta, 'monto' | 'comisionHandy'>) =>
  p.monto.centavos + p.comisionHandy.importe.centavos;

// ── Tarjeta ──────────────────────────────────────────────────────────────────────────────────────────────
export function TarjetaOferta({ p, marca }: { p: Propuesta; marca?: React.ReactNode }) {
  const e = p.especialista;
  const d = p.detalle;
  const visita = d?.oferta === 'visita';
  const decidible = p.estado === 'pendiente' && p.autorRol === 'especialista';
  const detalle = ruta('/propuestas/detalle/', { id: p.id });
  const nombre = e.nombrePublico;
  const minis: [Parameters<typeof DatoMini>[0]['icono'], string, string][] = !d
    ? []
    : visita
      ? [
          ['reloj', 'Dura', d.duracion ? duracionTexto(d.duracion) : 'A coordinar'],
          ['billete', 'Trabajo', 'A presupuestar'],
          ['ojo', 'Antes', 'Quiere ver'],
        ]
      : [
          ['reloj', 'Dura', d.duracion ? duracionTexto(d.duracion) : 'A coordinar'],
          ['escudo', 'Garantía', garantiaTexto(d.garantiaDias)],
          ['personas', 'Equipo', equipoTexto(d.equipo)],
        ];
  return (
    <article
      className="ds-tarjeta dsp-prop"
      data-vt-origen
      aria-label={`${visita ? 'Visita' : 'Propuesta'} de ${nombre}`}
    >
      <div className="ds-fila">
        <Avatar nombre={nombre} tam={3.125} />
        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.1875rem' }}>
          <span className="dsp-prop__nombre">{nombre}</span>
          {e.trabajosRealizados !== null ? (
            <span className="dsp-dato-linea">
              <Icono nombre="medalla" />
              {e.trabajosRealizados === 0
                ? 'Nuevo en Handyx'
                : `${e.trabajosRealizados} ${e.trabajosRealizados === 1 ? 'trabajo' : 'trabajos'} con Handyx`}
            </span>
          ) : null}
        </span>
        {visita ? (
          <Chip tono="tinte" icono="ojo">
            Consulta
          </Chip>
        ) : (
          marca
        )}
      </div>
      <BloquePrecio
        tipo={visita ? 'Visita' : 'Propuesta'}
        centavos={totalDe(p)}
        sub={visita ? 'Visita para ver y presupuestar' : (materialesTexto(d?.materiales ?? null) ?? undefined)}
        fecha={
          <Chip tono="blanco" icono="calendario">
            {horarioCorto(p)}
          </Chip>
        }
        href={detalle}
        etiqueta={`Ver el detalle de ${nombre}`}
      />
      {minis.length ? (
        <div className="dsp-minis">
          {minis.map(([ic, t, v]) => (
            <DatoMini key={t} icono={ic} etiqueta={t} valor={v} />
          ))}
        </div>
      ) : null}
      <Verificaciones e={e} />
      {p.estado === 'pendiente' ? (
        <span className="dsp-dato-linea">
          <Icono nombre="reloj" />
          <span>
            Propuesta <Vigencia hasta={p.venceEn} />
          </span>
        </span>
      ) : null}
      {decidible ? (
        <AccionesPropuesta
          nombre={nombre}
          rechazar={ruta('/propuestas/detalle/', { id: p.id, rechazar: '1' })}
          perfil={ruta('/propuestas/perfil/', { id: p.id })}
          aceptar={visita ? detalle : ruta('/propuestas/detalle/', { id: p.id, elegir: '1' })}
          textoAceptar={visita ? 'Ver visita' : 'Aceptar'}
        />
      ) : null}
    </article>
  );
}

const TONO_CHIP = { ok: 'exito', gris: 'gris', azul: 'tinte', alerta: 'amarillo', error: 'error' } as const;

/** Estado de una propuesta resuelta como chip (texto + ícono, nunca solo color). */
export function ChipEstadoPropuesta({ p }: { p: Pick<Propuesta, 'estado'> }) {
  const e = etiquetaPropuesta(p);
  return (
    <Chip tono={TONO_CHIP[e.tono]} {...(e.icono ? { icono: e.icono } : {})}>
      {e.texto}
    </Chip>
  );
}
