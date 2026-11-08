'use client';

import { useState } from 'react';
import { useAhora } from '@/components/SesionProvider';
import { Cargando, ErrorEstado, Hoja } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { cuando } from '@/domain/fechas';
import { AccionesFijas, Boton, Chip, Etiqueta, MosaicoIcono, Nota, Tarjeta, Texto } from '@/ui';
import { BarraCentro, Movimiento, PantallaM, dispositivo, haceCuanto } from '@/ui/mensajes';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const METODO = { app: 'App autenticadora', email: 'Código por email' } as const;

/**
 * Seguridad (lienzo X-Seguridad): el estado de la segunda verificación (se puede apagar desde acá) y las sesiones
 * abiertas, con «Cerrar las otras». Se entra siempre con un código: no hay contraseñas. Sin IP ni datos del aparato.
 */
export default function Seguridad() {
  const ahora = useAhora(60_000);
  const segunda = useConsulta('segundaVerificacion', {});
  const sesiones = useConsulta('sesionesAbiertas', {});
  const apagar = useEnvio();
  const cerrar = useEnvio();
  const [hoja, setHoja] = useState<'apagar' | 'cerrar' | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const error = segunda.error ?? sesiones.error;
  const s = segunda.datos;
  const otras = (sesiones.datos?.items ?? []).filter((x) => !x.actual).length;

  async function apagarSegunda() {
    const r = await apagar.enviar('segundaVerificacionApagar', {}, 'apagar');
    if (r?.ok) {
      setHoja(null);
      setAviso('Apagaste la segunda verificación.');
      segunda.recargar();
    }
  }
  async function cerrarOtras() {
    const r = await cerrar.enviar('sesionesCerrarOtras', {}, 'cerrar');
    if (r?.ok) {
      setHoja(null);
      setAviso('Cerramos las otras sesiones. Quedó abierta solo esta.');
      sesiones.recargar();
    }
  }

  return (
    <PantallaM
      arriba={<BarraCentro titulo="Seguridad" volver={VOLVER} />}
      pie={
        <AccionesFijas nota={otras ? undefined : 'No hay otras sesiones abiertas.'}>
          <Boton
            variante="peligro"
            icono="salir"
            deshabilitado={!otras}
            onClick={() => setHoja('cerrar')}
          >
            Cerrar las otras sesiones
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds-cuerpo">
        {error ? (
          <ErrorEstado
            error={error}
            onReintentar={() => {
              segunda.recargar();
              sesiones.recargar();
            }}
          />
        ) : null}
        {!error && (!s || !sesiones.datos) ? <Cargando /> : null}
        {aviso ? (
          <Nota icono="check" tono="exito" rol="status">
            {aviso}
          </Nota>
        ) : null}
        {s ? (
          <Tarjeta etiqueta="Segunda verificación">
            <div className="ds-fila">
              <MosaicoIcono icono="escudo" tam={3} tono={s.activa ? 'tinte' : 'gris'} />
              <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
                <strong style={{ fontSize: '1.0625rem' }}>Segunda verificación</strong>
                <span className="ds-fila-enlace__sub">
                  {s.activa && s.metodo ? `${METODO[s.metodo]} · activa` : 'Apagada'}
                </span>
              </span>
              {s.activa ? (
                <Chip tono="exito" icono="check">
                  Activa
                </Chip>
              ) : (
                <Chip tono="gris">Apagada</Chip>
              )}
            </div>
            {s.activa ? (
              <>
                {s.activadaEn ? <Texto>La activaste el {cuando(s.activadaEn)}.</Texto> : null}
                <Boton variante="contorno" chico onClick={() => setHoja('apagar')}>
                  Apagar la segunda verificación
                </Boton>
              </>
            ) : (
              <Texto>
                Con ella, además del código que te llega por email, te pedimos un segundo código
                para entrar. Activarla desde acá todavía no está disponible.
              </Texto>
            )}
          </Tarjeta>
        ) : null}
        {sesiones.datos ? (
          <Tarjeta etiqueta="Sesiones abiertas">
            <Etiqueta como="h2">Sesiones abiertas</Etiqueta>
            {sesiones.datos.items.map((x) => {
              const d = dispositivo(x.dispositivo);
              return (
                <Movimiento
                  key={x.id}
                  icono={d.icono}
                  titulo={x.actual ? `Este ${d.texto.toLowerCase()}` : d.texto}
                  sub={`Último uso ${haceCuanto(x.ultimoUso, ahora)}`}
                  derecha={
                    x.actual ? (
                      <Chip tono="exito" icono="check">
                        Este
                      </Chip>
                    ) : undefined
                  }
                />
              );
            })}
          </Tarjeta>
        ) : null}
        <Nota icono="candado" tono="gris">
          Entrás siempre con un código que te mandamos: no hay contraseñas que se puedan filtrar.
        </Nota>
      </div>

      <Hoja
        abierta={hoja === 'apagar'}
        onCerrar={() => setHoja(null)}
        titulo="¿Apagar la segunda verificación?"
      >
        <div className="ds ds-pila">
          <Texto>
            Vas a entrar solo con el código que te mandamos por email. Podés volver a activarla
            cuando quieras.
          </Texto>
          {apagar.error ? (
            <Nota icono="alerta" tono="error" rol="alert">
              {apagar.error.mensaje}
            </Nota>
          ) : null}
          <Boton variante="peligro" ocupado={apagar.pendiente} onClick={() => void apagarSegunda()}>
            Sí, apagarla
          </Boton>
          <Boton variante="contorno" onClick={() => setHoja(null)}>
            Mejor no
          </Boton>
        </div>
      </Hoja>
      <Hoja
        abierta={hoja === 'cerrar'}
        onCerrar={() => setHoja(null)}
        titulo="¿Cerrar las otras sesiones?"
      >
        <div className="ds ds-pila">
          <Texto>Se cierra Handyx en los demás aparatos. En este seguís adentro.</Texto>
          {cerrar.error ? (
            <Nota icono="alerta" tono="error" rol="alert">
              {cerrar.error.mensaje}
            </Nota>
          ) : null}
          <Boton variante="peligro" ocupado={cerrar.pendiente} onClick={() => void cerrarOtras()}>
            Sí, cerrarlas
          </Boton>
          <Boton variante="contorno" onClick={() => setHoja(null)}>
            Mejor no
          </Boton>
        </div>
      </Hoja>
    </PantallaM>
  );
}
