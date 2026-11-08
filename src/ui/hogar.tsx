'use client';
// Piezas de Mi hogar y del camino del hogar (lienzo: design/usuario/gen/fila_hogar.py y fila_camino.py). Reglas
// puras (textos, rutas al pedido, garantías, geometría del camino) y componentes compartidos por esas pantallas.
// Estilos en src/styles/ds-hogar.css (clases `dsh-*`, solo tokens).
import '@/styles/ds-hogar.css';
import type { ReactNode } from 'react';
import { Barra } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { Hoja } from '@/components/ui';
import { useAhora } from '@/components/SesionProvider';
import type { NombreIcono } from '@/components/trazos';
import type {
  Ambiente,
  Compartido,
  Equipo,
  Hogar,
  Recordatorio,
  TIPOS_AMBIENTE,
  TIPOS_EQUIPO,
} from '@/contracts/v1/hogar';
import type { Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { ErrorCliente } from '@/data/cliente';
import { hoyEnArgentina, nombreMes, partes, sumarDias, type FechaISO } from '@/domain/fechas';
import { Boton, Progreso } from './atomos';
import { Nota } from './moleculas';
import { IlustracionAmbiente } from './escenas';

type TipoAmbiente = (typeof TIPOS_AMBIENTE)[number];
type TipoEquipo = (typeof TIPOS_EQUIPO)[number];

// ── Diccionarios ────────────────────────────────────────────────────────────────────────────────────────
export const AMBIENTES: Record<TipoAmbiente, { nombre: string; icono: NombreIcono; el: string }> =
  {
    bano: { nombre: 'Baño', icono: 'ducha', el: 'el baño' },
    cocina: { nombre: 'Cocina', icono: 'cocina', el: 'la cocina' },
    living: { nombre: 'Living', icono: 'sofa', el: 'el living' },
    dormitorio: { nombre: 'Dormitorio', icono: 'cama', el: 'el dormitorio' },
    lavadero: { nombre: 'Lavadero', icono: 'lavarropas', el: 'el lavadero' },
    patio: { nombre: 'Patio', icono: 'hogar', el: 'el patio' },
    otro: { nombre: 'Otro lugar', icono: 'casa', el: 'ese lugar' },
  };

/** «el baño» si se llama como su tipo; si la persona le puso nombre, ese nombre («Baño de arriba»). */
export const elAmbiente = (a: Pick<Ambiente, 'tipo' | 'nombre'>) =>
  a.nombre === AMBIENTES[a.tipo].nombre ? AMBIENTES[a.tipo].el : a.nombre;

/** «del baño», «de la cocina», «de Baño de arriba». */
export const delAmbiente = (a: Pick<Ambiente, 'tipo' | 'nombre'>) => {
  const el = elAmbiente(a);
  return el.startsWith('el ') ? `del ${el.slice(3)}` : `de ${el}`;
};

/** Cada equipo con su ícono y el rubro con el que se arma el pedido (null: lo elige la persona). */
export const EQUIPOS: Record<TipoEquipo, { nombre: string; icono: NombreIcono; rubro: Rubro | null }> =
  {
    calefon: { nombre: 'Calefón', icono: 'llama', rubro: 'gas' },
    termotanque: { nombre: 'Termotanque', icono: 'termometro', rubro: 'gas' },
    anafe: { nombre: 'Anafe', icono: 'llama', rubro: 'gas' },
    horno: { nombre: 'Horno', icono: 'cocina', rubro: 'gas' },
    aire_acondicionado: { nombre: 'Aire acondicionado', icono: 'aire', rubro: 'aire_acondicionado' },
    tablero_electrico: { nombre: 'Tablero eléctrico', icono: 'rayo', rubro: 'electricidad' },
    canilla: { nombre: 'Canilla', icono: 'canilla', rubro: 'plomeria' },
    inodoro: { nombre: 'Inodoro', icono: 'caja', rubro: 'plomeria' },
    ducha: { nombre: 'Ducha', icono: 'ducha', rubro: 'plomeria' },
    cerradura: { nombre: 'Cerradura', icono: 'llave', rubro: 'cerrajeria' },
    otro: { nombre: 'Otro equipo', icono: 'caja', rubro: null },
  };

export const VIVIENDAS = { casa: 'Casa', departamento: 'Departamento', ph: 'PH' } as const;

// ── Reglas puras ────────────────────────────────────────────────────────────────────────────────────────
/**
 * A dónde lleva «Algo se rompió» o «Pedir una revisión»: el pedido arranca con el rubro del equipo (y, si es una
 * revisión, como programado). Nunca se manda texto libre ni datos de la casa por la URL.
 */
export function hrefPedir(tipo: TipoEquipo | null, motivo: 'rompio' | 'revision'): string {
  const rubro = tipo ? EQUIPOS[tipo].rubro : null;
  if (!rubro) return '/pedir/';
  return ruta('/pedir/', motivo === 'revision' ? { rubro, tipo: 'programado' } : { rubro });
}

const metros = (cm: number) =>
  (cm / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** «2,10 × 1,80 m · 2,60 de alto». */
export function medidasTexto(m: Ambiente['medidas'], conAlto = true): string | null {
  if (!m) return null;
  const base = `${metros(m.anchoCm)} × ${metros(m.largoCm)} m`;
  return conAlto && m.altoCm ? `${base} · ${metros(m.altoCm)} de alto` : base;
}

/** Bajada de la tarjeta del ambiente: equipos y medidas (o lo que falta). */
export function resumenAmbiente(a: Ambiente, equipos: readonly Equipo[]): string {
  const n = equipos.filter((e) => e.ambienteId === a.id).length;
  const eq = n === 0 ? 'Sin equipos' : n === 1 ? '1 equipo' : `${n} equipos`;
  return `${eq} · ${medidasTexto(a.medidas, false) ?? 'falta medir'}`;
}

/** Lo que le falta a la ficha de un ambiente, en palabras. */
export function faltaAmbiente(a: Ambiente, equipos: readonly Equipo[]): string[] {
  return [
    a.fotos.length ? null : 'fotos',
    a.medidas ? null : 'medidas',
    a.materiales ? null : 'materiales',
    equipos.some((e) => e.ambienteId === a.id) ? null : 'equipos',
  ].filter((x): x is string => x !== null);
}

export const garantiaVigente = (hasta: FechaISO | null, hoy: FechaISO): boolean =>
  hasta !== null && hasta >= hoy;

const diaNumero = (f: FechaISO) => {
  const { anio, mes, dia } = partes(f);
  return Date.UTC(anio, mes - 1, dia) / 86_400_000;
};

/** Cuánto de la garantía ya pasó (0 a 100): del día del informe al último día cubierto. */
export function avanceGarantia(desde: FechaISO, hasta: FechaISO, hoy: FechaISO): number {
  const total = diaNumero(hasta) - diaNumero(desde);
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((diaNumero(hoy) - diaNumero(desde)) / total) * 100)));
}

/** Recordatorios activos, del más cercano al más lejano. */
export const pendientes = (items: readonly Recordatorio[]): Recordatorio[] =>
  items.filter((r) => r.activo).sort((a, b) => a.fecha.localeCompare(b.fecha));

/** Cuántos recordatorios activos vencen en los próximos 7 días (o ya vencieron). */
export const paraEstaSemana = (items: readonly Recordatorio[], hoy: FechaISO): number =>
  pendientes(items).filter((r) => r.fecha <= sumarDias(hoy, 7)).length;

/** «Cada 3 meses · antes del 28/01» o «Una vez · antes del 28/01». */
export function cuandoRecordatorio(r: Recordatorio): string {
  const { dia, mes } = partes(r.fecha);
  const fecha = `antes del ${dia}/${mes}`;
  if (!r.cadaMeses) return `Una vez · ${fecha}`;
  return `${r.cadaMeses === 1 ? 'Cada mes' : `Cada ${r.cadaMeses} meses`} · ${fecha}`;
}

export const ORIGEN_RECORDATORIO: Record<Recordatorio['origen'], string> = {
  informe: 'lo sugirió un informe',
  sugerido: 'sugerencia de Handyx',
  usuario: 'lo sumaste vos',
};

/** «Marzo 2021». */
export const mesAnio = (f: FechaISO) => {
  const { anio, mes } = partes(f);
  return nombreMes(anio, mes);
};

/** «17/02/2027». */
export const fechaDMA = (f: FechaISO) => {
  const { anio, mes, dia } = partes(f);
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`;
};

/** Los beneficios están en borrador legal: ningún monto se muestra como vigente. */
export const sinMontos = (texto: string) => texto.replace(/\$\s?\d[\d.,]*/g, '$ [MONTO]');

/**
 * Quién respondería por la garantía de un equipo: el último trabajo terminado de su rubro (el contrato no une el
 * equipo con el trabajo; si el equipo no tiene garantía vigente, nadie).
 */
export function trabajoDeGarantia(
  equipo: Equipo,
  trabajos: readonly Trabajo[],
  hoy: FechaISO,
): Trabajo | null {
  const rubro = EQUIPOS[equipo.tipo].rubro;
  if (!rubro || !garantiaVigente(equipo.garantiaHasta, hoy)) return null;
  return (
    trabajos
      .filter((t) => t.estado === 'finalizado' && t.especialista.rubros.includes(rubro))
      .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))[0] ?? null
  );
}

export type ItemCompartido = Compartido['items'][number];
export interface Compartible {
  readonly item: ItemCompartido;
  readonly titulo: string;
  readonly sub: string;
  readonly icono: NombreIcono;
}
export const claveItem = (i: ItemCompartido) => `${i.tipo}:${i.refId}`;

/**
 * Lo que se puede compartir con un pedido: fotos y medidas de cada ambiente (si las hay), sus equipos y los informes
 * de trabajos terminados. Con `ambienteId`, solo lo de ese ambiente (más los informes). La dirección nunca está acá.
 */
export function compartibles(
  hogar: Hogar,
  trabajos: readonly Trabajo[],
  ambienteId: string | null = null,
): Compartible[] {
  const lista: Compartible[] = [];
  for (const a of hogar.ambientes.filter((x) => !ambienteId || x.id === ambienteId)) {
    if (a.fotos.length)
      lista.push({
        item: { tipo: 'ambiente_fotos', refId: a.id },
        titulo: `Fotos ${delAmbiente(a)}`,
        sub: `${a.fotos.length} ${a.fotos.length === 1 ? 'foto' : 'fotos'}`,
        icono: 'camara',
      });
    if (a.medidas)
      lista.push({
        item: { tipo: 'ambiente_medidas', refId: a.id },
        titulo: `Medidas ${delAmbiente(a)}`,
        sub: `${medidasTexto(a.medidas)} · aproximadas`,
        icono: 'regla',
      });
    for (const e of hogar.equipos.filter((x) => x.ambienteId === a.id))
      lista.push({
        item: { tipo: 'equipo', refId: e.id },
        titulo: e.nombre,
        sub: e.marca ? `${e.marca} · marca, modelo y garantía` : 'Datos y garantía',
        icono: EQUIPOS[e.tipo].icono,
      });
  }
  for (const t of trabajos.filter((x) => TERMINADOS.includes(x.estado)))
    lista.push({
      item: { tipo: 'informe', refId: t.id },
      titulo: `Informe de ${t.especialista.nombrePublico}`,
      sub: `Trabajo de ${mesAnio(t.creadoEn.slice(0, 10)).toLowerCase()}`,
      icono: 'documento',
    });
  return lista;
}

const TERMINADOS: readonly Trabajo['estado'][] = ['terminado_por_especialista', 'finalizado'];

/** Nombre de algo compartido para la lista de «Lo que compartiste» (si ya no existe, lo dice). */
export function nombreCompartido(i: ItemCompartido, hogar: Hogar | null): string {
  if (i.tipo === 'informe') return 'Informe de un trabajo';
  if (i.tipo === 'equipo') return hogar?.equipos.find((e) => e.id === i.refId)?.nombre ?? 'Un equipo';
  const a = hogar?.ambientes.find((x) => x.id === i.refId);
  const de = a ? ` ${delAmbiente(a)}` : '';
  return i.tipo === 'ambiente_fotos' ? `Fotos${de}` : `Medidas${de}`;
}

export function useHoy(): FechaISO {
  return hoyEnArgentina(new Date(useAhora(60_000)));
}

// ── Componentes ─────────────────────────────────────────────────────────────────────────────────────────
/** Barra «← Título» con una acción opcional a la derecha (sumar, editar). */
export function BarraHogar({
  titulo,
  volver,
  sub,
  accion,
}: {
  titulo: string;
  volver: { href: string; etiqueta: string };
  sub?: ReactNode;
  accion?: { icono: NombreIcono; etiqueta: string; href?: string; onClick?: () => void } | undefined;
}) {
  const dentro = accion ? <Icono nombre={accion.icono} /> : null;
  return (
    <div className="dsh-barra">
      <Barra titulo={titulo} volver={volver} sub={sub} />
      {accion?.href ? (
        <Enlace href={accion.href} className="du-atras dsh-barra__accion" aria-label={accion.etiqueta}>
          {dentro}
        </Enlace>
      ) : accion ? (
        <button
          type="button"
          className="du-atras dsh-barra__accion"
          aria-label={accion.etiqueta}
          onClick={accion.onClick}
        >
          {dentro}
        </button>
      ) : (
        <span className="dsh-barra__accion" aria-hidden="true" />
      )}
    </div>
  );
}

/** Portada del ambiente: su primera foto o la ilustración del tipo. */
export function PortadaAmbiente({ ambiente, alto = 96 }: { ambiente: Ambiente; alto?: number }) {
  const foto = ambiente.fotos[0];
  if (foto)
    // eslint-disable-next-line @next/next/no-img-element -- export estático: sin optimizador de imágenes.
    return <img className="dsh-foto" src={foto.url} alt="" style={{ height: `${alto / 16}rem` }} />;
  return <IlustracionAmbiente tipo={ambiente.tipo} alto={alto} />;
}

export function TarjetaAmbiente({ ambiente, equipos }: { ambiente: Ambiente; equipos: readonly Equipo[] }) {
  return (
    <Enlace href={ruta('/hogar/ambiente/', { id: ambiente.id })} className="dsh-amb">
      <PortadaAmbiente ambiente={ambiente} />
      <span className="dsh-amb__textos">
        <strong>{ambiente.nombre}</strong>
        <span className="dsh-suave">{resumenAmbiente(ambiente, equipos)}</span>
        <span className="ds-fila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
          <span className="ds-crece">
            <Progreso
              valor={ambiente.completitud}
              etiqueta={`Ficha del ${ambiente.nombre}: ${ambiente.completitud} %`}
              alto={0.375}
            />
          </span>
          <span className="dsh-pct" aria-hidden="true">
            {ambiente.completitud} %
          </span>
        </span>
      </span>
    </Enlace>
  );
}

/** Pestañas de una vista (enlaces): la actual con aria-current. */
export function Segmentos({
  opciones,
  actual,
  etiqueta,
}: {
  opciones: readonly { texto: string; href: string }[];
  actual: string;
  etiqueta: string;
}) {
  return (
    <nav className="dsh-seg" aria-label={etiqueta}>
      {opciones.map((o) => (
        <Enlace
          key={o.texto}
          href={o.href}
          transicion={false}
          className="dsh-seg__item"
          aria-current={o.texto === actual ? 'page' : undefined}
        >
          {o.texto}
        </Enlace>
      ))}
    </nav>
  );
}

/** Error de un envío; si otro cambio llegó antes (versión vieja), ofrece actualizar. */
export function AvisoEnvio({
  error,
  onActualizar,
}: {
  error: ErrorCliente | null;
  onActualizar?: () => void;
}) {
  if (!error) return null;
  return (
    <Nota tono="error" icono="alerta" rol="alert">
      {error.mensaje}{' '}
      {error.codigo === 'conflicto' && onActualizar ? (
        <button type="button" className="dsh-enlace" onClick={onActualizar}>
          Ver lo último
        </button>
      ) : null}
    </Nota>
  );
}

/** Medalla de insignia (decorativa: el nombre y el estado van en texto al lado). */
export function Medalla({
  icono,
  obtenida,
  tam = 4,
}: {
  icono: NombreIcono;
  obtenida: boolean;
  tam?: number;
}) {
  return (
    <span
      className="dsh-medalla"
      data-obtenida={obtenida ? '' : undefined}
      style={{ ['--dsh-tam' as string]: `${tam}rem` }}
      aria-hidden="true"
    >
      <span className="dsh-medalla__aro" />
      <Icono nombre={icono} />
    </span>
  );
}

/** «2,10» o «2.10» (metros) → 210 cm; vacío → null; cualquier otra cosa → NaN. */
export function cmDeMetros(texto: string): number | null {
  const t = texto.trim().replace(',', '.');
  if (!t) return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t)) return Number.NaN;
  const cm = Math.round(Number(t) * 100);
  return cm >= 1 ? cm : Number.NaN;
}

/** Metros para un campo de texto: 210 → «2,10». */
export const metrosDeCm = (cm: number | null | undefined) => (cm ? metros(cm) : '');

/** Hoja para confirmar algo que no se deshace (borrar, dejar de compartir): el foco arranca en el título. */
export function Confirmar({
  abierta,
  titulo,
  texto,
  si,
  onSi,
  onNo,
  ocupado,
  error,
}: {
  abierta: boolean;
  titulo: string;
  texto: string;
  si: string;
  onSi: () => void;
  onNo: () => void;
  ocupado: boolean;
  error: ErrorCliente | null;
}) {
  return (
    <Hoja abierta={abierta} onCerrar={onNo} titulo={titulo}>
      <div className="ds ds-pila">
        <p className="ds-texto">{texto}</p>
        <AvisoEnvio error={error} />
        <Boton variante="peligro" icono="tacho" onClick={onSi} ocupado={ocupado}>
          {si}
        </Boton>
        <Boton variante="contorno" chico onClick={onNo}>
          No, volver
        </Boton>
      </div>
    </Hoja>
  );
}
