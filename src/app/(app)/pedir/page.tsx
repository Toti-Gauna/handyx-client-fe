'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BotonHx, Flujo } from '@/components/acceso';
import { Calendario } from '@/components/Calendario';
import {
  FormUbicacion,
  UBICACION_VACIA,
  aUbicacion,
  deUbicacion,
  type UbicacionForm,
} from '@/components/FormUbicacion';
import { FotoSubida, useFotos } from '@/components/FotoSubida';
import { HandyRubro } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta, useIr } from '@/components/nav';
import { useAhora, useSesion } from '@/components/SesionProvider';
import type { NombreIcono } from '@/components/trazos';
import { Aviso, Campo, Hoja } from '@/components/ui';
import { tareaPorId } from '@/content/inicio';
import { RUBROS, TIPOS_PEDIDO, type Rubro } from '@/contracts/v1/pedidos';
import { descartarBorrador, verBorrador } from '@/data/borrador';
import { useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO, TIPOS_INFO } from '@/domain/etiquetas';
import {
  ZONA_ARGENTINA,
  fechaCorta,
  fechaLarga,
  hoyEnArgentina,
  sumarDias,
  type FechaISO,
} from '@/domain/fechas';
import { centavosDePesos, erroresDe } from '@/domain/formularios';

type Tipo = (typeof TIPOS_PEDIDO)[number];
type Paso = 'rubro' | 'cuando' | 'programar' | 'contanos' | 'direccion' | 'revisar';

/** Para cuándo (u-opciones de la demo). */
const OPCIONES: readonly {
  tipo: Tipo;
  texto: string;
  detalle: string;
  icono: NombreIcono;
  etiqueta: string;
}[] = [
  {
    tipo: 'urgente',
    texto: 'Urgencia',
    detalle: 'Lo antes posible, para lo que no puede esperar',
    icono: 'alerta',
    etiqueta: 'Hoy',
  },
  {
    tipo: 'programado',
    texto: 'Programado',
    detalle: 'Elegís el día y la franja que te quedan cómodos',
    icono: 'calendario',
    etiqueta: 'Vos elegís',
  },
  {
    tipo: 'obra',
    texto: 'Obra',
    detalle: 'Trabajos grandes, que se hacen y se pagan por etapas',
    icono: 'ladrillos',
    etiqueta: 'Por etapas',
  },
];

/** Franjas de la demo (u-programar). */
const FRANJAS = [
  { desde: '08:00', hasta: '10:00', momento: 'Mañana', texto: '8 a 10 h' },
  { desde: '10:00', hasta: '12:00', momento: 'Mañana', texto: '10 a 12 h' },
  { desde: '12:00', hasta: '14:00', momento: 'Mediodía', texto: '12 a 14 h' },
  { desde: '14:00', hasta: '16:00', momento: 'Tarde', texto: '14 a 16 h' },
  { desde: '16:00', hasta: '18:00', momento: 'Tarde', texto: '16 a 18 h' },
  { desde: '18:00', hasta: '20:00', momento: 'Noche', texto: '18 a 20 h' },
] as const;

/** Dónde se corrige cada dato que el servidor puede rechazar. */
const PASO_DEL_CAMPO = (campo: string): Paso | null =>
  campo === 'rubro'
    ? 'rubro'
    : campo === 'tipo'
      ? 'cuando'
      : campo.startsWith('fechaSolicitada')
        ? 'programar'
        : campo === 'descripcion' || campo === 'fotos'
          ? 'contanos'
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

/**
 * Pedir (rediseño 3.4): una decisión por pantalla, como la demo. Rubro › para cuándo › día y franja (si es programado u
 * obra) › contanos y fotos › dirección › revisar. Lo que se elige es una solicitud: no hay turno ni precio hasta que la
 * persona acepta una propuesta. Nunca se promete cuánto tarda.
 */
export default function Pedir() {
  const params = useSearchParams();
  const ir = useIr();
  const { sesion } = useSesion();
  const ahora = useAhora(60_000);
  const hoy = hoyEnArgentina(new Date(ahora));
  const horaAhora = horaEnArgentina(ahora);
  const rubroInicial = RUBROS.find((r) => r === params.get('rubro')) ?? null;
  const tipoInicial = TIPOS_PEDIDO.find((t) => t === params.get('tipo')) ?? null;
  const [rubro, setRubro] = useState<Rubro | null>(rubroInicial);
  const [tipo, setTipo] = useState<Tipo | null>(tipoInicial);
  const [paso, setPaso] = useState<Paso>(
    !rubroInicial
      ? 'rubro'
      : !tipoInicial
        ? 'cuando'
        : tipoInicial === 'urgente'
          ? 'contanos'
          : 'programar',
  );
  // Desde "Quiero…" llega una tarea conocida; desde HandIA, el borrador en memoria (nunca texto libre por la URL).
  const [descripcion, setDescripcion] = useState(
    () =>
      tareaPorId(params.get('tarea'))?.problema ??
      (params.get('desde') === 'handia' ? (verBorrador()?.descripcion ?? '') : ''),
  );
  const [fotos, setFotos] = useState<string[]>([]);
  const estadoFotos = useFotos(setFotos);
  const [ubicacion, setUbicacion] = useState<UbicacionForm>(
    deUbicacion(sesion.perfil.ubicacion) ?? UBICACION_VACIA,
  );
  const [cubierta, setCubierta] = useState<boolean | null>(null);
  const [fecha, setFecha] = useState<FechaISO | null>(null);
  const [calendario, setCalendario] = useState(false);
  const [otraHora, setOtraHora] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [precio, setPrecio] = useState('');
  const [auto, setAuto] = useState(false);
  const [autoMax, setAutoMax] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const { enviar, pendiente, error, limpiar } = useEnvio();
  const errores = { ...erroresDe(error), ...local };
  const programado = tipo !== null && tipo !== 'urgente';
  const activa = sesion.cuenta.estado === 'activa';

  const pasos: readonly Paso[] = programado
    ? ['rubro', 'cuando', 'programar', 'contanos', 'direccion', 'revisar']
    : ['rubro', 'cuando', 'contanos', 'direccion', 'revisar'];
  const numero = pasos.indexOf(paso) + 1;
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(hoy, i));
  const franja = FRANJAS.find((f) => f.desde === desde && f.hasta === hasta) ?? null;
  const yaPaso = (f: (typeof FRANJAS)[number]) => fecha === hoy && f.desde <= horaAhora;

  const cuerpo = useMemo(() => {
    if (!rubro || !tipo) return null;
    const p = precio ? centavosDePesos(precio) : null;
    const max = auto ? centavosDePesos(autoMax) : null;
    return {
      rubro,
      tipo,
      descripcion: descripcion.trim(),
      ubicacion: aUbicacion(ubicacion),
      fechaSolicitada:
        tipo !== 'urgente' && fecha && desde ? { fecha, desde, hasta: hasta || null } : null,
      precioPropuestoCentavos: p,
      autoaceptacion: max ? { montoMaximoCentavos: max } : null,
      fotos,
    };
  }, [rubro, tipo, descripcion, ubicacion, fecha, desde, hasta, precio, auto, autoMax, fotos]);

  function validar(p: Paso): Record<string, string> {
    const n: Record<string, string> = {};
    if (p === 'programar') {
      if (!fecha) n.fecha = 'Elegí un día.';
      else if (!desde) n.desde = 'Elegí una franja o un horario.';
      else if (hasta && hasta <= desde) n.hasta = 'La hora final tiene que ser posterior.';
      else if (fecha === hoy && desde <= horaAhora) n.desde = 'Ese horario ya pasó: elegí otro.';
    }
    if (p === 'contanos' && descripcion.trim().length < 10)
      n.descripcion = 'Contanos un poco más (al menos 10 caracteres).';
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

  function irAPaso(p: Paso) {
    setLocal({});
    setPaso(p);
  }
  function siguiente() {
    const n = validar(paso);
    setLocal(n);
    if (Object.keys(n).length) return;
    const sig = pasos[numero];
    if (sig) setPaso(sig);
  }
  function anterior() {
    const ant = pasos[numero - 2];
    if (ant) irAPaso(ant);
  }

  async function mandar() {
    const n = validar('revisar');
    setLocal(n);
    if (Object.keys(n).length || !cuerpo) return;
    const r = await enviar('pedidoCrear', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) {
      descartarBorrador();
      ir(ruta('/pedidos/detalle/', { id: r.datos.id }), { reemplazar: true });
    } else if (r && !r.ok) {
      const destino = Object.keys(erroresDe(r.error)).map(PASO_DEL_CAMPO).find(Boolean);
      if (destino && destino !== 'revisar') setPaso(destino);
    }
  }

  const atras =
    numero <= 1 || (paso === 'cuando' && rubroInicial)
      ? { href: '/inicio/', etiqueta: 'Volver al inicio' }
      : { alTocar: anterior, etiqueta: 'Volver al paso anterior' };
  const enviarCon = (accion: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    accion();
  };
  const cuandoTexto = !programado
    ? { fuerte: 'Lo antes posible', suave: 'Cada especialista te dice a qué hora puede ir' }
    : {
        fuerte: fecha ? fechaLarga(fecha) : 'Sin día',
        suave: franja
          ? franja.texto
          : desde
            ? `Desde las ${desde}${hasta ? ` a ${hasta}` : ''} h`
            : '',
      };

  if (!activa)
    return (
      <Flujo
        titulo="Pedir un ==servicio=="
        atras={{ href: '/inicio/', etiqueta: 'Volver al inicio' }}
        pie={
          sesion.cuenta.estado === 'perfil_incompleto' ? (
            <Enlace className="hd-boton" href="/perfil/">
              Completar mi perfil
            </Enlace>
          ) : null
        }
      >
        <Aviso
          tipo="alerta"
          titulo={
            sesion.cuenta.estado === 'baja_solicitada'
              ? 'Pediste eliminar tu cuenta'
              : 'Completá tu perfil primero'
          }
        >
          {sesion.cuenta.estado === 'baja_solicitada'
            ? 'Mientras la baja está en curso no se pueden crear pedidos.'
            : 'Para pedir necesitamos tus datos y que aceptes los textos.'}
        </Aviso>
      </Flujo>
    );

  if (paso === 'rubro')
    return (
      <Flujo
        titulo="¿Qué ==necesitás==?"
        sub="Elegí el rubro. Si no sabés cuál es, HandIA te ayuda."
        atras={atras}
        paso={numero}
        total={pasos.length}
        pie={
          <Enlace href="/handia/" className="hd-boton hd-boton--claro">
            <Icono nombre="chispas" />
            No sé qué rubro es
          </Enlace>
        }
      >
        <div className="hd-mosaicos du-rubros" role="group" aria-label="Rubros">
          {RUBROS.map((r) => (
            <button
              key={r}
              type="button"
              className="hd-mosaico du-rubro"
              aria-pressed={rubro === r}
              onClick={() => {
                setRubro(r);
                irAPaso('cuando');
              }}
            >
              <HandyRubro rubro={r} />
              <span aria-hidden="true">{RUBROS_INFO[r].corto}</span>
              <span className="sr-only">
                {RUBROS_INFO[r].nombre}: {RUBROS_INFO[r].ejemplo}
              </span>
            </button>
          ))}
        </div>
      </Flujo>
    );

  if (paso === 'cuando' && rubro)
    return (
      <Flujo
        titulo="¿Para ==cuándo== lo necesitás?"
        sub={
          <>
            Tu pedido de{' '}
            <span className="hd-chip hd-chip--tinte du-pedido-de">
              <Icono nombre={RUBROS_INFO[rubro].icono} />
              <strong>{RUBROS_INFO[rubro].nombre}</strong>
            </span>
          </>
        }
        atras={atras}
        paso={numero}
        total={pasos.length}
      >
        <div className="du-opciones" role="group" aria-label="Para cuándo">
          {OPCIONES.map((o, i) => (
            <button
              key={o.tipo}
              type="button"
              className={`du-opcion du-opcion--${i}`}
              aria-pressed={tipo === o.tipo}
              onClick={() => {
                setTipo(o.tipo);
                irAPaso(o.tipo === 'urgente' ? 'contanos' : 'programar');
              }}
            >
              <span className="du-opcion__ico">
                <Icono nombre={o.icono} />
              </span>
              <span className="du-opcion__textos">
                <strong>
                  {o.texto}
                  <span className="hd-chip hd-chip--mini du-opcion__chip">{o.etiqueta}</span>
                </strong>
                <small>{o.detalle}</small>
              </span>
              <Icono nombre="derecha" />
            </button>
          ))}
        </div>
        <p className="du-nota">
          <Icono nombre="info" />
          <span>
            En una urgencia les avisamos a los especialistas de tu zona que la toman. Cada uno te
            dice a qué hora puede ir: no prometemos cuánto tarda.
          </span>
        </p>
      </Flujo>
    );

  if (paso === 'programar')
    return (
      <Flujo
        titulo={tipo === 'obra' ? '¿Cuándo pueden ==visitar==?' : 'Programá el ==turno=='}
        sub="Es una solicitud: cada especialista la acepta, la rechaza o te propone otra."
        atras={atras}
        paso={numero}
        total={pasos.length}
        onSubmit={enviarCon(siguiente)}
        pie={
          <>
            <p className="du-resumen-linea">
              <Icono nombre="calendario" />
              <span>Tu pedido</span>
              <strong>
                {fecha ? fechaCorta(fecha) : 'Elegí el día'}
                {cuandoTexto.suave ? ` · ${cuandoTexto.suave}` : ''}
              </strong>
            </p>
            <BotonHx type="submit">Seguir</BotonHx>
          </>
        }
      >
        <section className="du-bloque">
          <p className="hd-sobre du-sobre" id="pedir-dia">
            ¿Qué día?
          </p>
          <div
            className="hd-chips hd-chips--carril du-dias"
            role="group"
            aria-labelledby="pedir-dia"
          >
            {dias.map((d, i) => (
              <button
                key={d}
                type="button"
                className="du-dia"
                aria-pressed={fecha === d}
                aria-label={i === 0 ? `Hoy, ${fechaLarga(d)}` : fechaLarga(d)}
                onClick={() => {
                  setFecha(d);
                  setLocal({});
                }}
              >
                <small>{i === 0 ? 'Hoy' : fechaCorta(d).split(' ')[0]}</small>
                <strong>{Number(d.slice(8))}</strong>
              </button>
            ))}
          </div>
          <button type="button" className="du-otra" onClick={() => setCalendario(true)}>
            <Icono nombre="calendario" />
            <span>Quiero elegir otra fecha</span>
            <Icono nombre="derecha" />
          </button>
          {fecha && !dias.includes(fecha) ? (
            <p className="du-pedis" role="status">
              <Icono nombre="calendario" />
              <strong>Pedís el {fechaLarga(fecha)}</strong>
            </p>
          ) : null}
          {(errores.fecha ?? errores['fechaSolicitada.fecha']) ? (
            <p className="campo__error" role="alert">
              {errores.fecha ?? errores['fechaSolicitada.fecha']}
            </p>
          ) : null}
        </section>
        <section className="du-bloque">
          <p className="hd-sobre du-sobre" id="pedir-franja">
            ¿En qué franja?
          </p>
          <div className="hd-mosaicos du-franjas" role="group" aria-labelledby="pedir-franja">
            {FRANJAS.map((f) => (
              <button
                key={f.desde}
                type="button"
                className="hd-mosaico du-franja"
                aria-pressed={franja === f}
                disabled={yaPaso(f)}
                onClick={() => {
                  setDesde(f.desde);
                  setHasta(f.hasta);
                  setOtraHora(false);
                  setLocal({});
                }}
              >
                <small>{f.momento}</small>
                <strong>{f.texto}</strong>
                {yaPaso(f) ? <span className="sr-only">(ya pasó)</span> : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="du-otra"
            aria-expanded={otraHora}
            onClick={() => setOtraHora(!otraHora)}
          >
            <Icono nombre="reloj" />
            <span>Quiero elegir otro horario</span>
            <Icono nombre={otraHora ? 'arriba' : 'abajo'} />
          </button>
          {otraHora ? (
            <div className="du-form__fila">
              <Campo etiqueta="Desde" error={errores.desde ?? errores['fechaSolicitada.desde']}>
                {(p) => (
                  <input
                    {...p}
                    className="entrada"
                    type="time"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                  />
                )}
              </Campo>
              <Campo
                etiqueta="Hasta"
                opcional
                error={errores.hasta ?? errores['fechaSolicitada.hasta']}
              >
                {(p) => (
                  <input
                    {...p}
                    className="entrada"
                    type="time"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                  />
                )}
              </Campo>
            </div>
          ) : errores.desde || errores.hasta ? (
            <p className="campo__error" role="alert">
              {errores.desde ?? errores.hasta}
            </p>
          ) : null}
        </section>
        <p className="du-info">
          <Icono nombre="info" />
          <span>Cada especialista te dice en qué horario puede ir, dentro de lo que declaró.</span>
        </p>
        <Hoja abierta={calendario} onCerrar={() => setCalendario(false)} titulo="Elegí otra fecha">
          <Calendario
            valor={fecha}
            onElegir={(f) => {
              setFecha(f);
              setLocal({});
              setCalendario(false);
            }}
          />
        </Hoja>
      </Flujo>
    );

  if (paso === 'contanos' && rubro && tipo)
    return (
      <Flujo
        titulo="Contanos qué ==pasó=="
        atras={atras}
        paso={numero}
        total={pasos.length}
        onSubmit={enviarCon(siguiente)}
        pie={<BotonHx type="submit">Seguir</BotonHx>}
      >
        <div className="du-resumen">
          <div className="du-resumen__tile du-resumen__tile--azul">
            <small>Rubro</small>
            <strong>
              <Icono nombre={RUBROS_INFO[rubro].icono} />
              {RUBROS_INFO[rubro].nombre}
            </strong>
            <span>{TIPOS_INFO[tipo].nombre}</span>
          </div>
          <div className="du-resumen__tile">
            <small>Cuándo</small>
            <strong>{cuandoTexto.fuerte}</strong>
            <span>{cuandoTexto.suave}</span>
          </div>
        </div>
        <Campo
          etiqueta="Contalo con tus palabras"
          error={errores.descripcion}
          ayuda={`Como te salga: el especialista lo lee antes de mandarte su precio. ${descripcion.length} / 1000`}
          requerido
        >
          {(p) => (
            <textarea
              {...p}
              className="entrada"
              maxLength={1000}
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          )}
        </Campo>
        <section className="du-bloque">
          <p className="hd-sobre du-sobre">Fotos (opcional)</p>
          <FotoSubida onCambio={setFotos} estado={estadoFotos} etiqueta="Sumar foto" />
        </section>
      </Flujo>
    );

  if (paso === 'direccion')
    return (
      <Flujo
        titulo="¿Dónde es el ==trabajo==?"
        sub="Solo la ve el especialista que elijas, cuando se acuerde el trabajo."
        atras={atras}
        paso={numero}
        total={pasos.length}
        onSubmit={enviarCon(siguiente)}
        pie={<BotonHx type="submit">Seguir</BotonHx>}
      >
        <FormUbicacion
          valor={ubicacion}
          onCambio={setUbicacion}
          errores={errores}
          onCobertura={setCubierta}
        />
      </Flujo>
    );

  if (!rubro || !tipo) return null;
  const precioOk = precio ? centavosDePesos(precio) : null;
  const maxOk = auto ? centavosDePesos(autoMax) : null;
  const filas: { etiqueta: string; valor: React.ReactNode; paso: Paso }[] = [
    {
      etiqueta: 'Rubro',
      valor: `${RUBROS_INFO[rubro].nombre} · ${TIPOS_INFO[tipo].nombre}`,
      paso: 'cuando',
    },
    ...(programado
      ? [
          {
            etiqueta: 'Cuándo (solicitud)',
            valor: `${cuandoTexto.fuerte}${cuandoTexto.suave ? ` · ${cuandoTexto.suave}` : ''}`,
            paso: 'programar' as const,
          },
        ]
      : []),
    { etiqueta: 'Lo que contaste', valor: descripcion.trim(), paso: 'contanos' },
    {
      etiqueta: 'Fotos',
      valor: fotos.length ? `${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}` : 'Ninguna',
      paso: 'contanos',
    },
    {
      etiqueta: 'Dónde',
      valor: [ubicacion.direccion, ubicacion.barrio, ubicacion.ciudad].filter(Boolean).join(', '),
      paso: 'direccion',
    },
  ];
  return (
    <Flujo
      titulo="Revisá y ==pedí=="
      atras={atras}
      paso={numero}
      total={pasos.length}
      onSubmit={enviarCon(() => void mandar())}
      pie={
        <>
          <BotonHx type="submit" icono="enviar" cargando={pendiente}>
            Pedir presupuestos
          </BotonHx>
          <p className="du-pie__nota">
            Ves cada precio antes de confirmar. Tarifa de Handy: 0 % durante la demo.
          </p>
        </>
      }
    >
      <dl className="hd-tarjeta hd-tarjeta--gris du-revisar">
        {filas.map((f) => (
          <div key={f.etiqueta} className="du-revisar__fila">
            <dt>{f.etiqueta}</dt>
            <dd>{f.valor}</dd>
            <button
              type="button"
              className="du-revisar__cambiar"
              aria-label={`Cambiar: ${f.etiqueta}`}
              onClick={() => {
                limpiar();
                irAPaso(f.paso);
              }}
            >
              Cambiar
            </button>
          </div>
        ))}
      </dl>
      <details className="du-textos du-mas" open={Boolean(precio || auto)}>
        <summary>Proponer un precio (opcional)</summary>
        <Campo
          etiqueta="Precio que te gustaría pagar"
          opcional
          error={errores.precio}
          ayuda="Es una propuesta para empezar: el especialista puede aceptarla, rechazarla o proponerte otra."
        >
          {(p) => (
            <input
              {...p}
              className="entrada"
              inputMode="numeric"
              placeholder="45.000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          )}
        </Campo>
        <label className="opcion">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          <span>
            <span className="opcion__titulo">
              Aceptar automáticamente una propuesta de hasta cierto importe
            </span>
            <span className="opcion__texto">
              Está apagado. Si lo activás, la primera propuesta que entre en tu máximo se acepta
              sola y se crea el trabajo.
            </span>
          </span>
        </label>
        {auto ? (
          <Campo etiqueta="Importe máximo" error={errores.autoMax} requerido>
            {(p) => (
              <input
                {...p}
                className="entrada"
                inputMode="numeric"
                placeholder="50.000"
                value={autoMax}
                onChange={(e) => setAutoMax(e.target.value)}
              />
            )}
          </Campo>
        ) : null}
      </details>
      {precioOk || maxOk ? (
        <p className="du-resumen-linea">
          <Icono nombre="billetera" />
          <span>Tus opciones</span>
          <strong>
            {[
              precioOk ? `Proponés ${pesos(precioOk)}` : null,
              maxOk ? `Aceptación automática hasta ${pesos(maxOk)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </strong>
        </p>
      ) : null}
      {error ? (
        <Aviso
          tipo="error"
          titulo={
            error.codigo === 'sin_permiso' ? 'No se pudo enviar' : 'No pudimos enviar el pedido'
          }
        >
          <p>{error.mensaje}</p>
          {error.recuperable ? (
            <p>
              Tus datos siguen acá: tocá “Pedir presupuestos” para reintentar. No se va a crear dos
              veces.
            </p>
          ) : null}
        </Aviso>
      ) : null}
    </Flujo>
  );
}
