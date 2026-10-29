'use client';

import { useEffect, useState } from 'react';
import type { Ubicacion } from '@/contracts/v1/cuenta';
import { useConsulta } from '@/data/hooks';
import { pedirUbicacionUnaVez } from '@/data/geo';
import { CENTRO_MDP, dentroDeMdp } from '@/geo/mdp';
import { MapaHx, type EstadoMapa } from './MapaHx';
import { Aviso, Boton, Campo } from './ui';

export type UbicacionForm = Pick<Ubicacion, 'ciudad' | 'direccion' | 'origen' | 'coordenadas'> & {
  barrio: string;
  referencia: string;
};

export const UBICACION_VACIA: UbicacionForm = {
  ciudad: 'Mar del Plata',
  barrio: '',
  direccion: '',
  referencia: '',
  origen: 'manual',
  coordenadas: null,
};

export const aUbicacion = (f: UbicacionForm): Ubicacion => ({
  ciudad: f.ciudad.trim(),
  barrio: f.barrio.trim() || null,
  direccion: f.direccion.trim(),
  referencia: f.referencia.trim() || null,
  origen: f.coordenadas ? f.origen : 'manual',
  coordenadas: f.coordenadas,
});

export const deUbicacion = (u: Ubicacion | undefined): UbicacionForm =>
  u
    ? {
        ciudad: u.ciudad,
        barrio: u.barrio ?? '',
        direccion: u.direccion,
        referencia: u.referencia ?? '',
        origen: u.origen,
        coordenadas: u.coordenadas,
      }
    : UBICACION_VACIA;

function useDebounced<T>(valor: T, ms: number): T {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}

export type ResultadoGeo = 'ok' | 'imprecisa' | 'denegada' | 'sin_senal' | 'no_soportada';

/**
 * Ubicación puntual (nunca en segundo plano): se pide solo cuando la persona toca el botón. Si hay posición, se guarda
 * como referencia en el formulario; la dirección se escribe igual.
 */
export function useGeoPuntual(valor: UbicacionForm, onCambio: (v: UbicacionForm) => void) {
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoGeo | null>(null);
  async function usar(): Promise<ResultadoGeo> {
    setBuscando(true);
    const r = await pedirUbicacionUnaVez();
    setBuscando(false);
    setResultado(r.tipo);
    if (r.tipo === 'ok' || r.tipo === 'imprecisa')
      onCambio({
        ...valor,
        origen: 'geolocalizacion_puntual',
        coordenadas: { lat: r.lat, lng: r.lng, precisionMetros: r.precisionMetros },
      });
    return r.tipo;
  }
  return { buscando, resultado, usar };
}

/**
 * Ubicación manual o con un permiso puntual de geolocalización (nunca en segundo plano). Avisa si la ciudad no tiene
 * cobertura: se guarda igual (queda el interés), pero no se puede pedir un servicio ahí. `geo` permite que la pantalla
 * que lo contiene haya pedido la ubicación antes (pre-permiso del onboarding).
 */
export function FormUbicacion({
  valor,
  onCambio,
  errores = {},
  onCobertura,
  geo: externo,
}: {
  valor: UbicacionForm;
  onCambio: (v: UbicacionForm) => void;
  errores?: Record<string, string>;
  onCobertura?: (cubierta: boolean | null) => void;
  geo?: ReturnType<typeof useGeoPuntual>;
}) {
  const interno = useGeoPuntual(valor, onCambio);
  const { buscando, resultado, usar } = externo ?? interno;
  const geo = resultado ? { tipo: resultado } : null;
  const ciudad = useDebounced(valor.ciudad.trim(), 450);
  const cobertura = useConsulta('cobertura', ciudad.length >= 2 ? { consulta: { ciudad } } : null);
  const cubierta =
    cobertura.datos && cobertura.datos.ciudad === ciudad ? cobertura.datos.cubierta : null;
  useEffect(() => onCobertura?.(cubierta), [cubierta, onCobertura]);

  const set = (campo: keyof UbicacionForm, v: string) => onCambio({ ...valor, [campo]: v });
  const [mapa, setMapa] = useState<EstadoMapa>('cargando');
  const [cerca, setCerca] = useState<string | null>(null);
  const fuera = valor.coordenadas ? !dentroDeMdp(valor.coordenadas) : false;
  return (
    <div className="form-ubicacion">
      <MapaHx
        modo="elegir"
        centro={valor.coordenadas ?? CENTRO_MDP}
        etiqueta="Mapa para ubicar tu casa: movelo hasta que el pin quede sobre la puerta"
        clase="form-ubicacion__mapa"
        onEstado={setMapa}
        onBarrio={setCerca}
        onMover={(p) =>
          onCambio({
            ...valor,
            origen: 'manual',
            coordenadas: p,
            barrio: valor.barrio || cerca || '',
          })
        }
      />
      <p className="campo__ayuda" role="status">
        {mapa === 'ilustrado'
          ? 'El mapa no está disponible ahora: escribí la dirección y listo.'
          : fuera
            ? 'Ese punto queda fuera de Mar del Plata: por ahora no llegamos ahí.'
            : cerca
              ? `Mové el mapa hasta tu puerta. Estás cerca de ${cerca}.`
              : 'Mové el mapa hasta que el pin quede sobre tu puerta.'}
      </p>
      <Boton variante="claro" icono="pin" cargando={buscando} onClick={() => void usar()}>
        Usar mi ubicación ahora
      </Boton>
      <p className="campo__ayuda">
        Te la pedimos una sola vez, solo si querés. No la seguimos ni la usamos en segundo plano.
      </p>
      {geo?.tipo === 'ok' ? (
        <Aviso tipo="ok" rol="status">
          Listo, tomamos tu ubicación de este momento. Completá la dirección.
        </Aviso>
      ) : null}
      {geo?.tipo === 'imprecisa' ? (
        <Aviso tipo="alerta" titulo="La ubicación es poco precisa" rol="status">
          La guardamos como referencia, pero escribí la dirección exacta.
        </Aviso>
      ) : null}
      {geo?.tipo === 'denegada' ? (
        <Aviso tipo="info" titulo="No hay problema" rol="status">
          No diste permiso de ubicación. Escribí la dirección a mano y seguí: no hace falta
          activarla.
        </Aviso>
      ) : null}
      {geo?.tipo === 'sin_senal' ? (
        <Aviso tipo="info" titulo="No pudimos ubicarte" rol="status">
          No hay señal de ubicación ahora. Escribí la dirección a mano.
        </Aviso>
      ) : null}
      {geo?.tipo === 'no_soportada' ? (
        <Aviso tipo="info" rol="status">
          Este dispositivo no permite ubicación. Escribí la dirección a mano.
        </Aviso>
      ) : null}

      <Campo etiqueta="Ciudad" error={errores.ciudad} requerido>
        {(p) => (
          <input
            {...p}
            className="entrada"
            autoComplete="address-level2"
            value={valor.ciudad}
            onChange={(e) => set('ciudad', e.target.value)}
          />
        )}
      </Campo>
      {cubierta === false ? (
        <Aviso tipo="alerta" titulo={`Todavía no llegamos a ${ciudad}`}>
          <p>
            Empezamos en Mar del Plata. Guardamos tu ciudad como interés, pero por ahora no podés
            pedir servicios ahí.
          </p>
        </Aviso>
      ) : null}
      <Campo etiqueta="Barrio" opcional>
        {(p) => (
          <input
            {...p}
            className="entrada"
            value={valor.barrio}
            onChange={(e) => set('barrio', e.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Dirección" error={errores.direccion} requerido>
        {(p) => (
          <input
            {...p}
            className="entrada"
            autoComplete="street-address"
            value={valor.direccion}
            onChange={(e) => set('direccion', e.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Referencia" opcional ayuda="Piso, timbre, entre calles…">
        {(p) => (
          <input
            {...p}
            className="entrada"
            value={valor.referencia}
            onChange={(e) => set('referencia', e.target.value)}
          />
        )}
      </Campo>
    </div>
  );
}
