'use client';

import { useState, useSyncExternalStore } from 'react';
import { BotonHx } from '@/components/acceso';
import {
  FormUbicacion,
  UBICACION_VACIA,
  aUbicacion,
  type UbicacionForm,
} from '@/components/FormUbicacion';
import { Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import type { NombreIcono } from '@/components/trazos';
import { Aviso, Campo } from '@/components/ui';
import type { Ubicacion } from '@/contracts/v1/cuenta';
import { ErrorCliente } from '@/data/cliente';
import {
  MAXIMO_DIRECCIONES,
  TIPOS_DIRECCION,
  direccionesDisponibles,
  direccionesGuardadas,
  direccionesServidor,
  guardarDireccion,
  quitarDireccion,
  suscribirDirecciones,
  type TipoDireccion,
} from '@/data/direcciones';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const TIPO: Record<TipoDireccion, { texto: string; icono: NombreIcono }> = {
  casa: { texto: 'Casa', icono: 'casa' },
  trabajo: { texto: 'Trabajo', icono: 'maletin' },
  otra: { texto: 'Otra', icono: 'pin' },
};
const texto = (u: Ubicacion) => [u.direccion, u.barrio, u.ciudad].filter(Boolean).join(', ');

/**
 * Direcciones (rediseño 3.8): la principal es la del perfil (se edita en Datos personales); las otras se guardan con un
 * nombre para elegirlas al pedir. Fuera del contrato v1 hasta la Fase 4.2 (ver src/data/direcciones.ts).
 */
export default function Direcciones() {
  const { sesion } = useSesion();
  const otras = useSyncExternalStore(
    suscribirDirecciones,
    direccionesGuardadas,
    direccionesServidor,
  );
  const [nueva, setNueva] = useState(false);
  const [quitando, setQuitando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const principal = sesion.perfil.ubicacion;
  const lleno = otras.length >= MAXIMO_DIRECCIONES - 1;

  if (nueva) return <NuevaDireccion onListo={() => setNueva(false)} />;

  async function quitar(id: string) {
    setQuitando(id);
    setError(null);
    try {
      await quitarDireccion(id);
    } catch (e) {
      setError(e instanceof ErrorCliente ? e.mensaje : 'No pudimos quitarla.');
    } finally {
      setQuitando(null);
    }
  }

  return (
    <Pantalla
      arriba={<Barra titulo="Direcciones" volver={VOLVER} />}
      pie={
        direccionesDisponibles && !lleno ? (
          <BotonHx icono="mas" onClick={() => setNueva(true)}>
            Agregar una dirección
          </BotonHx>
        ) : undefined
      }
      clase="du-direcciones-hx"
    >
      <div className="du-cuerpo">
        <ul className="du-lista-tarjetas" {...entra(1)}>
          <li className="du-tarjeta du-tarjeta-hx">
            <div className="du-tarjeta__cuerpo">
              <span className="du-tarjeta__ico du-tarjeta__ico--azul" aria-hidden="true">
                <Icono nombre="casa" />
              </span>
              <span className="du-tarjeta__datos">
                <strong>Principal</strong>
                <small>{principal ? texto(principal) : 'Todavía no cargaste tu dirección'}</small>
              </span>
            </div>
            <Enlace
              className="du-tarjeta__franja tarjeta--enlace"
              href={ruta('/cuenta/datos/', { editar: '1' })}
              aria-label="Editar la dirección principal"
            >
              {principal ? 'Editar' : 'Cargarla'}
              <Icono nombre="derecha" />
            </Enlace>
          </li>
          {otras.map((d) => (
            <li key={d.id} className="du-tarjeta du-tarjeta-hx">
              <div className="du-tarjeta__cuerpo">
                <span className="du-tarjeta__ico du-tarjeta__ico--azul" aria-hidden="true">
                  <Icono nombre={TIPO[d.tipo].icono} />
                </span>
                <span className="du-tarjeta__datos">
                  <strong>{d.nombre}</strong>
                  <small>{texto(d.ubicacion)}</small>
                </span>
              </div>
              <button
                type="button"
                className="du-tarjeta__franja du-direccion__quitar"
                aria-label={`Quitar ${d.nombre}`}
                disabled={quitando !== null}
                aria-busy={quitando === d.id || undefined}
                onClick={() => void quitar(d.id)}
              >
                {quitando === d.id ? 'Un momento…' : 'Quitar'}
                <Icono nombre="tacho" />
              </button>
            </li>
          ))}
        </ul>
        {error ? <Aviso tipo="error">{error}</Aviso> : null}
        {!direccionesDisponibles ? (
          <Aviso tipo="info" titulo="Pronto vas a poder guardar otras direcciones">
            Por ahora usamos la de tu perfil. Al pedir un servicio podés escribir otra.
          </Aviso>
        ) : lleno ? (
          <p className="du-nota">
            <Icono nombre="info" />
            <span>Llegaste a {MAXIMO_DIRECCIONES} direcciones. Quitá una para sumar otra.</span>
          </p>
        ) : null}
        <p className="du-nota" {...entra(2)}>
          <Icono nombre="escudo" />
          <span>
            Las direcciones son tuyas: la del pedido la ve solo el especialista con el que acordás
            el trabajo.
          </span>
        </p>
      </div>
    </Pantalla>
  );
}

function NuevaDireccion({ onListo }: { onListo: () => void }) {
  const [tipo, setTipo] = useState<TipoDireccion>('trabajo');
  const [nombre, setNombre] = useState('Trabajo');
  const [ubicacion, setUbicacion] = useState<UbicacionForm>(UBICACION_VACIA);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!nombre.trim()) n.nombre = 'Ponele un nombre.';
    if (!ubicacion.ciudad.trim()) n.ciudad = 'Escribí la ciudad.';
    if (!ubicacion.direccion.trim()) n.direccion = 'Escribí la dirección.';
    setErrores(n);
    if (Object.keys(n).length) return;
    setGuardando(true);
    setError(null);
    try {
      await guardarDireccion({ tipo, nombre, ubicacion: aUbicacion(ubicacion) });
      onListo();
    } catch (err) {
      setError(err instanceof ErrorCliente ? err.mensaje : 'No pudimos guardarla.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pantalla
      arriba={
        <div className="du-barra" {...entra(0)}>
          <button
            type="button"
            className="du-atras"
            aria-label="Volver a tus direcciones"
            onClick={onListo}
          >
            <Icono nombre="atras" />
          </button>
          <span className="du-barra__textos">
            <h1>
              <strong>Nueva dirección</strong>
            </h1>
          </span>
        </div>
      }
      pie={
        <BotonHx type="submit" form="form-direccion" icono="check" cargando={guardando}>
          Guardar la dirección
        </BotonHx>
      }
      clase="du-direcciones-hx"
    >
      <form id="form-direccion" className="du-cuerpo" onSubmit={guardar} noValidate>
        <fieldset className="du-direccion__tipos">
          <legend className="hd-sobre du-sobre">¿Qué es?</legend>
          <div className="hd-chips">
            {TIPOS_DIRECCION.map((t) => (
              <button
                key={t}
                type="button"
                className="hd-chip hd-chip--tinte du-chip-voto"
                aria-pressed={tipo === t}
                onClick={() => {
                  setTipo(t);
                  setNombre(t === 'otra' ? '' : TIPO[t].texto);
                }}
              >
                <Icono nombre={TIPO[t].icono} />
                {TIPO[t].texto}
              </button>
            ))}
          </div>
        </fieldset>
        <Campo
          etiqueta="Nombre"
          error={errores.nombre}
          ayuda="Para reconocerla al pedir: «Trabajo», «Lo de mamá»."
          requerido
        >
          {(p) => (
            <input
              {...p}
              className="entrada"
              maxLength={30}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          )}
        </Campo>
        <FormUbicacion valor={ubicacion} onCambio={setUbicacion} errores={errores} />
        {error ? <Aviso tipo="error">{error}</Aviso> : null}
      </form>
    </Pantalla>
  );
}
