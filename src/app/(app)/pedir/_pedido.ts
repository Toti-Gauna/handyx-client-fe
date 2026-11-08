'use client';
// Estado y reglas del pedido (Fase 7 · camino corto): rubro › ¿qué pasa? › revisar y publicar. Cuándo, día y franja,
// dirección y fotos se cambian desde «Revisar». Misma lógica de envío que antes: clave de idempotencia estable entre
// reintentos (useEnvio), fotos subidas una por una (useFotos) y la dirección guardada del perfil.
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  UBICACION_VACIA,
  aUbicacion,
  deUbicacion,
  type UbicacionForm,
} from '@/components/FormUbicacion';
import { useFotos } from '@/components/FotoSubida';
import { useAhora, useSesion } from '@/components/SesionProvider';
import { tareaPorId } from '@/content/inicio';
import { RUBROS, TIPOS_PEDIDO, type Rubro } from '@/contracts/v1/pedidos';
import { descartarBorrador, verBorrador } from '@/data/borrador';
import { useEnvio } from '@/data/hooks';
import { ZONA_ARGENTINA, hoyEnArgentina, type FechaISO } from '@/domain/fechas';
import { centavosDePesos, erroresDe } from '@/domain/formularios';
import { armarDescripcion } from './_problemas';

export type Tipo = (typeof TIPOS_PEDIDO)[number];
export type Paso =
  'rubro' | 'que' | 'fotos' | 'revisar' | 'cuando' | 'programar' | 'direccion' | 'publicado';

/** Franjas preferidas (P-Fecha). */
export const FRANJAS = [
  { desde: '08:00', hasta: '10:00', texto: '8 a 10 h' },
  { desde: '10:00', hasta: '12:00', texto: '10 a 12 h' },
  { desde: '12:00', hasta: '14:00', texto: '12 a 14 h' },
  { desde: '14:00', hasta: '16:00', texto: '14 a 16 h' },
  { desde: '16:00', hasta: '18:00', texto: '16 a 18 h' },
  { desde: '18:00', hasta: '20:00', texto: '18 a 20 h' },
] as const;

/** Dónde se corrige cada dato que el servidor puede rechazar. */
export const PASO_DEL_CAMPO = (campo: string): Paso | null =>
  campo === 'rubro'
    ? 'rubro'
    : campo === 'tipo'
      ? 'cuando'
      : campo.startsWith('fechaSolicitada')
        ? 'programar'
        : campo === 'descripcion'
          ? 'que'
          : campo === 'fotos'
            ? 'fotos'
            : campo.startsWith('ubicacion')
              ? 'direccion'
              : campo === 'precioPropuestoCentavos' || campo.startsWith('autoaceptacion')
                ? 'revisar'
                : null;

const horaEnArgentina = (ms: number) =>
  new Intl.DateTimeFormat('es-AR', {
    timeZone: ZONA_ARGENTINA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(ms));

export function usePedido() {
  const params = useSearchParams();
  const { sesion } = useSesion();
  const ahora = useAhora(60_000);
  const hoy = hoyEnArgentina(new Date(ahora));
  const horaAhora = horaEnArgentina(ahora);
  const rubroInicial = RUBROS.find((r) => r === params.get('rubro')) ?? null;
  const [rubro, setRubro] = useState<Rubro | null>(rubroInicial);
  // Sin elegir, el pedido va como «lo antes posible».
  const [tipo, setTipo] = useState<Tipo>(
    TIPOS_PEDIDO.find((t) => t === params.get('tipo')) ?? 'urgente',
  );
  const [paso, setPaso] = useState<Paso>(rubroInicial ? 'que' : 'rubro');
  const [problema, setProblema] = useState<string | null>(null);
  // Desde «Quiero…» llega una tarea conocida; desde HandIA (o al volver de medir), el borrador en memoria. Nunca texto
  // libre por la URL.
  const [texto, setTexto] = useState(() => {
    const tarea = tareaPorId(params.get('tarea'))?.problema;
    if (tarea) return tarea;
    const b = verBorrador();
    return b && (params.get('desde') === 'handia' || b.rubro === rubroInicial) ? b.descripcion : '';
  });
  const [fotos, setFotos] = useState<string[]>([]);
  const estadoFotos = useFotos(setFotos);
  const [deMiHogar, setDeMiHogar] = useState(false);
  const [ubicacion, setUbicacion] = useState<UbicacionForm>(
    deUbicacion(sesion.perfil.ubicacion) ?? UBICACION_VACIA,
  );
  const [cubierta, setCubierta] = useState<boolean | null>(null);
  const [fecha, setFecha] = useState<FechaISO | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [precio, setPrecio] = useState('');
  const [auto, setAuto] = useState(false);
  const [autoMax, setAutoMax] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const envio = useEnvio();
  const errores = { ...erroresDe(envio.error), ...local };
  const programado = tipo !== 'urgente';
  const descripcion = armarDescripcion(problema, texto);
  const franja = FRANJAS.find((f) => f.desde === desde && f.hasta === hasta) ?? null;
  const yaPaso = (f: { desde: string }) => fecha === hoy && f.desde <= horaAhora;

  const cuerpo = useMemo(() => {
    if (!rubro) return null;
    const p = precio ? centavosDePesos(precio) : null;
    const max = auto ? centavosDePesos(autoMax) : null;
    return {
      rubro,
      tipo,
      descripcion,
      ubicacion: aUbicacion(ubicacion),
      fechaSolicitada:
        tipo !== 'urgente' && fecha && desde ? { fecha, desde, hasta: hasta || null } : null,
      precioPropuestoCentavos: p,
      autoaceptacion: max ? { montoMaximoCentavos: max } : null,
      fotos,
    };
  }, [rubro, tipo, descripcion, ubicacion, fecha, desde, hasta, precio, auto, autoMax, fotos]);

  /** Lo que falta o está mal en un paso (vacío: está bien). */
  function validar(p: Paso): Record<string, string> {
    const n: Record<string, string> = {};
    if (p === 'que' && descripcion.length < 10)
      n.descripcion = 'Elegí lo que pasa o contalo con tus palabras (al menos 10 letras).';
    if (p === 'programar' && programado) {
      if (!fecha) n.fecha = 'Elegí un día.';
      else if (!desde) n.desde = 'Elegí una franja o un horario.';
      else if (hasta && hasta <= desde) n.hasta = 'La hora final tiene que ser posterior.';
      else if (fecha === hoy && desde <= horaAhora) n.desde = 'Ese horario ya pasó: elegí otro.';
    }
    if (p === 'direccion') {
      if (!ubicacion.ciudad.trim()) n.ciudad = 'Escribí la ciudad.';
      if (!ubicacion.direccion.trim()) n.direccion = 'Escribí la dirección.';
      if (cubierta === false) n.ciudad = `Todavía no tenemos cobertura en ${ubicacion.ciudad}.`;
    }
    if (p === 'revisar') {
      if (precio && !centavosDePesos(precio))
        n.precio = 'Escribí un importe en pesos, por ejemplo 45000.';
      if (auto && !centavosDePesos(autoMax))
        n.autoMax = 'Escribí el importe máximo que aceptarías.';
    }
    return n;
  }

  function ir(p: Paso) {
    setLocal({});
    setPaso(p);
  }
  /** Valida el paso y, si está bien, sigue. */
  function confirmar(p: Paso, despues: Paso): boolean {
    const n = validar(p);
    setLocal(n);
    if (Object.keys(n).length) return false;
    setPaso(despues);
    return true;
  }

  async function publicar() {
    // Antes de enviar, lo que falta se completa en su pantalla (con el aviso puesto).
    for (const p of ['que', 'programar', 'direccion', 'revisar'] as const) {
      const n = validar(p);
      if (Object.keys(n).length) {
        setLocal(n);
        setPaso(p);
        return;
      }
    }
    if (!cuerpo) return;
    const r = await envio.enviar('pedidoCrear', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) {
      descartarBorrador();
      setPedidoId(r.datos.id);
      setPaso('publicado');
    } else if (r && !r.ok) {
      const destino = Object.keys(erroresDe(r.error)).map(PASO_DEL_CAMPO).find(Boolean);
      if (destino && destino !== 'revisar') setPaso(destino);
    }
  }

  return {
    sesion,
    hoy,
    rubro,
    setRubro,
    tipo,
    setTipo,
    programado,
    paso,
    ir,
    confirmar,
    problema,
    setProblema,
    texto,
    setTexto,
    descripcion,
    fotos,
    estadoFotos,
    deMiHogar,
    setDeMiHogar,
    ubicacion,
    setUbicacion,
    setCubierta,
    fecha,
    setFecha,
    desde,
    setDesde,
    hasta,
    setHasta,
    franja,
    yaPaso,
    precio,
    setPrecio,
    auto,
    setAuto,
    autoMax,
    setAutoMax,
    errores,
    setLocal,
    envio,
    publicar,
    pedidoId,
  };
}

export type Pedido = ReturnType<typeof usePedido>;
