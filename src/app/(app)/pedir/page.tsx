'use client';

import { tareaPorId } from '@/content/inicio';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Calendario } from '@/components/Calendario';
import {
  FormUbicacion,
  UBICACION_VACIA,
  aUbicacion,
  deUbicacion,
  type UbicacionForm,
} from '@/components/FormUbicacion';
import { FotoSubida } from '@/components/FotoSubida';
import { Icono } from '@/components/Icono';
import { Enlace, ruta, useIr } from '@/components/nav';
import { useSesion, useAhora } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Campo, Datos, Pasos } from '@/components/ui';
import { RUBROS, type Rubro, TIPOS_PEDIDO } from '@/contracts/v1/pedidos';
import { useEnvio } from '@/data/hooks';
import { RUBROS_INFO, TIPOS_INFO } from '@/domain/etiquetas';
import { erroresDe, centavosDePesos } from '@/domain/formularios';
import { pesos } from '@/domain/dinero';
import { fechaCorta, fechaLarga, hoyEnArgentina, sumarDias, type FechaISO } from '@/domain/fechas';

type Tipo = (typeof TIPOS_PEDIDO)[number];
const PASOS = [
  'Rubro',
  'Tipo de pedido',
  'Qué pasa',
  'Dónde',
  'Cuándo',
  'Precio y opciones',
  'Revisá y enviá',
] as const;
const FRANJAS = [
  { t: '09:00', n: 'Mañana · 9:00' },
  { t: '12:00', n: 'Mediodía · 12:00' },
  { t: '16:00', n: 'Tarde · 16:00' },
] as const;

export default function Pedir() {
  const params = useSearchParams();
  const ir = useIr();
  const { sesion } = useSesion();
  const ahora = useAhora(60_000);
  const hoy = hoyEnArgentina(new Date(ahora));
  const rubroInicial = RUBROS.find((r) => r === params.get('rubro')) ?? null;
  const tipoInicial = TIPOS_PEDIDO.find((t) => t === params.get('tipo')) ?? null;
  const [paso, setPaso] = useState(rubroInicial ? (tipoInicial ? 3 : 2) : 1);
  const [rubro, setRubro] = useState<Rubro | null>(rubroInicial);
  const [tipo, setTipo] = useState<Tipo | null>(tipoInicial);
  // Desde "Quiero…" de Inicio llega una tarea conocida (nunca texto libre por la URL).
  const [descripcion, setDescripcion] = useState(
    () => tareaPorId(params.get('tarea'))?.problema ?? '',
  );
  const [fotos, setFotos] = useState<string[]>([]);
  const [ubicacion, setUbicacion] = useState<UbicacionForm>(
    deUbicacion(sesion.perfil.ubicacion) ?? UBICACION_VACIA,
  );
  const [cubierta, setCubierta] = useState<boolean | null>(null);
  const [fecha, setFecha] = useState<FechaISO | null>(null);
  const [otraFecha, setOtraFecha] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [precio, setPrecio] = useState('');
  const [auto, setAuto] = useState(false);
  const [autoMax, setAutoMax] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const { enviar, pendiente, error } = useEnvio();
  const errores = { ...erroresDe(error), ...local };
  const programado = tipo !== null && tipo !== 'urgente';
  const activa = sesion.cuenta.estado === 'activa';
  const total = programado ? 7 : 6;
  // Para urgente se saltea "Cuándo": los pasos siguientes se renumeran.
  const lista = useMemo(
    () => (programado ? PASOS : PASOS.filter((p) => p !== 'Cuándo')),
    [programado],
  );
  const nombrePaso = lista[paso - 1] ?? PASOS[0];

  const sugeridos = [1, 2, 3].map((n) => sumarDias(hoy, n));
  const cuerpo = useMemo(() => {
    if (!rubro || !tipo) return null;
    const p = precio ? centavosDePesos(precio) : null;
    const max = auto ? centavosDePesos(autoMax) : null;
    return {
      rubro,
      tipo,
      descripcion: descripcion.trim(),
      ubicacion: aUbicacion(ubicacion),
      fechaSolicitada: programado && fecha && desde ? { fecha, desde, hasta: hasta || null } : null,
      precioPropuestoCentavos: p,
      autoaceptacion: max ? { montoMaximoCentavos: max } : null,
      fotos,
    };
  }, [
    rubro,
    tipo,
    descripcion,
    ubicacion,
    programado,
    fecha,
    desde,
    hasta,
    precio,
    auto,
    autoMax,
    fotos,
  ]);

  function validar(): Record<string, string> {
    const n: Record<string, string> = {};
    if (nombrePaso === 'Rubro' && !rubro) n.rubro = 'Elegí un rubro.';
    if (nombrePaso === 'Tipo de pedido' && !tipo) n.tipo = 'Elegí una opción.';
    if (nombrePaso === 'Qué pasa' && descripcion.trim().length < 10)
      n.descripcion = 'Contanos un poco más (al menos 10 caracteres).';
    if (nombrePaso === 'Dónde') {
      if (!ubicacion.ciudad.trim()) n.ciudad = 'Escribí la ciudad.';
      if (!ubicacion.direccion.trim()) n.direccion = 'Escribí la dirección.';
      if (cubierta === false) n.ciudad = `Todavía no tenemos cobertura en ${ubicacion.ciudad}.`;
    }
    if (nombrePaso === 'Cuándo') {
      if (!fecha) n.fecha = 'Elegí un día.';
      else if (!desde) n.desde = 'Elegí una hora.';
      else if (hasta && hasta <= desde)
        n.hasta = 'La hora final tiene que ser posterior a la inicial.';
    }
    if (nombrePaso === 'Precio y opciones') {
      if (precio && !centavosDePesos(precio))
        n.precio = 'Escribí un importe en pesos, por ejemplo 45000.';
      if (auto && !centavosDePesos(autoMax))
        n.autoMax = 'Escribí el importe máximo que aceptarías.';
    }
    return n;
  }

  function siguiente() {
    const n = validar();
    setLocal(n);
    if (Object.keys(n).length) return;
    setPaso(Math.min(paso + 1, lista.length));
  }

  async function mandar() {
    if (!cuerpo) return;
    const r = await enviar('pedidoCrear', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) ir(ruta('/pedidos/detalle/', { id: r.datos.id }), { reemplazar: true });
  }

  if (!activa)
    return (
      <>
        <Titulo texto="Pedir un ==servicio==" />
        <Aviso
          tipo="alerta"
          titulo={
            sesion.cuenta.estado === 'baja_solicitada'
              ? 'Pediste eliminar tu cuenta'
              : 'Completá tu perfil primero'
          }
        >
          <p>
            {sesion.cuenta.estado === 'baja_solicitada'
              ? 'Mientras la baja está en curso no se pueden crear pedidos.'
              : 'Para pedir necesitamos tus datos y que aceptes los textos.'}
          </p>
          {sesion.cuenta.estado === 'perfil_incompleto' ? (
            <Enlace className="boton boton--chico" href="/perfil/">
              Completar perfil
            </Enlace>
          ) : null}
        </Aviso>
      </>
    );

  return (
    <>
      <Titulo texto="Pedir un ==servicio==" />
      <Pasos actual={paso} total={total} titulo={nombrePaso ?? ''} />

      {nombrePaso === 'Rubro' ? (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="sr-only">Rubro</legend>
          <div className="mosaicos">
            {RUBROS.map((r) => (
              <button
                key={r}
                type="button"
                className="mosaico"
                aria-pressed={rubro === r}
                onClick={() => {
                  setRubro(r);
                  setLocal({});
                }}
              >
                <Icono nombre={RUBROS_INFO[r].icono} />
                <span aria-hidden="true">{RUBROS_INFO[r].corto}</span>
                <span className="sr-only">{RUBROS_INFO[r].nombre}</span>
                {rubro === r ? (
                  <Icono nombre="checkCirculo" className="icono mosaico__tilde" />
                ) : null}
              </button>
            ))}
          </div>
          {errores.rubro ? (
            <p className="campo__error" role="alert">
              {errores.rubro}
            </p>
          ) : null}
          {rubro ? <p className="texto-suave">{RUBROS_INFO[rubro].ejemplo}</p> : null}
        </fieldset>
      ) : null}

      {nombrePaso === 'Tipo de pedido' ? (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="sr-only">Tipo de pedido</legend>
          {TIPOS_PEDIDO.map((t) => (
            <label key={t} className="opcion">
              <input
                type="radio"
                name="tipo"
                checked={tipo === t}
                onChange={() => {
                  setTipo(t);
                  setLocal({});
                }}
              />
              <span>
                <span className="opcion__titulo">{TIPOS_INFO[t].nombre}</span>
                <span className="opcion__texto">{TIPOS_INFO[t].texto}</span>
              </span>
            </label>
          ))}
          {errores.tipo ? (
            <p className="campo__error" role="alert">
              {errores.tipo}
            </p>
          ) : null}
          <Aviso tipo="info">
            Handy no promete llegada inmediata ni precio fijo: el especialista declara su horario y
            su precio.
          </Aviso>
        </fieldset>
      ) : null}

      {nombrePaso === 'Qué pasa' ? (
        <>
          <Campo
            etiqueta="Contanos qué necesitás"
            error={errores.descripcion}
            ayuda={`${descripcion.length} / 1000`}
            requerido
          >
            {(p) => (
              <textarea
                {...p}
                className="entrada"
                maxLength={1000}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            )}
          </Campo>
          <h2 className="subtitulo">
            Fotos <span className="campo__opcional">(opcional)</span>
          </h2>
          <FotoSubida onCambio={setFotos} />
        </>
      ) : null}

      {nombrePaso === 'Dónde' ? (
        <>
          <p className="texto-suave">
            Solo la ve el especialista que elijas, cuando se acuerde el trabajo.
          </p>
          <FormUbicacion
            valor={ubicacion}
            onCambio={setUbicacion}
            errores={errores}
            onCobertura={setCubierta}
          />
        </>
      ) : null}

      {nombrePaso === 'Cuándo' ? (
        <>
          <p>
            Lo que elijas es una <strong>solicitud</strong>: no es un turno confirmado hasta que el
            especialista acepte.
          </p>
          <fieldset style={{ border: 0, padding: 0 }}>
            <legend className="campo__etiqueta">Día</legend>
            <div className="acciones acciones--fila" style={{ marginTop: 8 }}>
              {sugeridos.map((f) => (
                <Boton
                  key={f}
                  chico
                  variante={fecha === f ? 'azul' : 'claro'}
                  aria-pressed={fecha === f}
                  onClick={() => {
                    setFecha(f);
                    setOtraFecha(false);
                  }}
                >
                  {fechaCorta(f)}
                </Boton>
              ))}
            </div>
            <Boton
              variante="texto"
              onClick={() => setOtraFecha(!otraFecha)}
              aria-expanded={otraFecha}
            >
              Quiero elegir otra fecha
            </Boton>
            {otraFecha ? <Calendario valor={fecha} onElegir={setFecha} /> : null}
            {fecha ? (
              <p role="status">
                <strong>{fechaLarga(fecha)}</strong>
              </p>
            ) : null}
            {errores.fecha ? (
              <p className="campo__error" role="alert">
                {errores.fecha}
              </p>
            ) : null}
          </fieldset>
          <fieldset style={{ border: 0, padding: 0 }}>
            <legend className="campo__etiqueta">Hora</legend>
            <div className="acciones" style={{ marginTop: 8 }}>
              {FRANJAS.map((f) => (
                <Boton
                  key={f.t}
                  chico
                  variante={desde === f.t ? 'azul' : 'claro'}
                  aria-pressed={desde === f.t}
                  onClick={() => setDesde(f.t)}
                >
                  {f.n}
                </Boton>
              ))}
            </div>
          </fieldset>
          <div className="fila fila--2">
            <Campo
              etiqueta="Otra hora"
              error={errores.desde}
              ayuda="Cualquier hora, de 00:00 a 23:59."
            >
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
            <Campo etiqueta="Hasta" opcional error={errores.hasta}>
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
        </>
      ) : null}

      {nombrePaso === 'Precio y opciones' ? (
        <>
          <Campo
            etiqueta="Precio que te gustaría pagar"
            opcional
            error={errores.precio}
            ayuda="Es una propuesta tuya para empezar a negociar: el especialista puede aceptarla, rechazarla o contraofertar."
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
                Está desactivado por defecto. Si lo activás, la primera propuesta que entre en tu
                máximo se acepta sola y se crea el trabajo.
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
        </>
      ) : null}

      {nombrePaso === 'Revisá y enviá' && rubro && tipo ? (
        <>
          <section className="tarjeta">
            <div className="tarjeta__cuerpo">
              <Datos
                filas={[
                  ['Rubro', RUBROS_INFO[rubro].nombre],
                  ['Tipo', TIPOS_INFO[tipo].nombre],
                  ['Dónde', `${ubicacion.direccion}, ${ubicacion.ciudad}`],
                  ...(programado && fecha
                    ? [
                        [
                          'Cuándo (solicitud)',
                          `${fechaLarga(fecha)} · ${desde}${hasta ? ` a ${hasta}` : ''}`,
                        ] as const,
                      ]
                    : []),
                  ['Fotos', String(fotos.length)],
                  [
                    'Precio que proponés',
                    precio && centavosDePesos(precio)
                      ? pesos(centavosDePesos(precio) as number)
                      : 'Sin propuesta',
                  ],
                  [
                    'Aceptación automática',
                    auto && centavosDePesos(autoMax)
                      ? `Hasta ${pesos(centavosDePesos(autoMax) as number)}`
                      : 'Desactivada',
                  ],
                ]}
              />
              <p style={{ margin: '10px 0 0' }}>{descripcion}</p>
            </div>
          </section>
          <Aviso tipo="info">
            Al enviar, buscamos especialistas. No prometemos cuánto tarda: te avisamos cuando haya
            propuestas. Tarifa de Handy: 0 % durante la demo.
          </Aviso>
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
                  Tus datos siguen acá: tocá “Enviar pedido” para reintentar. No se va a crear dos
                  veces.
                </p>
              ) : null}
              {Object.keys(erroresDe(error)).length ? (
                <ul className="lista-plana">
                  {error.campos.map((c) => (
                    <li key={c.campo}>{c.campo}</li>
                  ))}
                </ul>
              ) : null}
            </Aviso>
          ) : null}
        </>
      ) : null}

      <div className="acciones">
        {paso < lista.length ? (
          <Boton onClick={siguiente}>Seguir</Boton>
        ) : (
          <Boton cargando={pendiente} onClick={mandar}>
            Enviar pedido
          </Boton>
        )}
        {paso > 1 ? (
          <Boton
            variante="claro"
            onClick={() => {
              setLocal({});
              setPaso(paso - 1);
            }}
          >
            Volver
          </Boton>
        ) : null}
      </div>
    </>
  );
}
