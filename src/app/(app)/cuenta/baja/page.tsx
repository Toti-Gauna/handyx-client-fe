'use client';

import { useState } from 'react';
import { BotonHx, CampoContrasena } from '@/components/acceso';
import { Barra, ChipEstado, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Aviso, Cargando, ErrorEstado } from '@/components/ui';
import type { ESTADOS_BAJA } from '@/contracts/v1/cuenta';
import { useConsulta, useEnvio } from '@/data/hooks';
import type { Etiqueta } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const ESTADOS: Record<(typeof ESTADOS_BAJA)[number], Etiqueta & { explica: string }> = {
  recibida: {
    texto: 'Recibida',
    tono: 'alerta',
    icono: 'reloj',
    explica: 'Recibimos tu pedido. Todavía no se eliminó nada.',
  },
  en_proceso: {
    texto: 'En proceso',
    tono: 'azul',
    icono: 'engranaje',
    explica: 'Estamos eliminando tus datos. Todavía no terminó.',
  },
  completada: {
    texto: 'Completada',
    tono: 'ok',
    icono: 'checkCirculo',
    explica: 'Eliminamos tu cuenta y tus datos.',
  },
  completada_con_retencion: {
    texto: 'Completada con retención',
    tono: 'ok',
    icono: 'checkCirculo',
    explica:
      'Eliminamos tu cuenta y tus datos, salvo lo que tenemos que conservar por obligación legal.',
  },
  cancelada: {
    texto: 'Cancelada',
    tono: 'gris',
    icono: 'prohibido',
    explica: 'La solicitud se canceló.',
  },
};
const PASOS = ['recibida', 'en_proceso', 'completada'] as const;

/**
 * Eliminar cuenta (rediseño 3.8): baja real con contraseña y el estado verdadero de la solicitud, paso a paso. Cerrar
 * sesión no es baja, y lo que se conserva por obligación legal se informa, no se oculta.
 */
export default function Baja() {
  const { recargar, cerrarSesion } = useSesion();
  const solicitud = useConsulta('baja', {}, { cada: 15_000 });
  const { enviar, pendiente, error } = useEnvio();
  const [contrasena, setContrasena] = useState('');
  const [entiendo, setEntiendo] = useState(false);
  const [local, setLocal] = useState<Record<string, string>>({});

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!contrasena) n.contrasena = 'Escribí tu contraseña para confirmar.';
    if (!entiendo) n.entiendo = 'Confirmá que lo entendés.';
    setLocal(n);
    if (Object.keys(n).length) return;
    const r = await enviar('bajaSolicitar', { cuerpo: { contrasena } }, 'baja');
    if (r?.ok) {
      setContrasena('');
      solicitud.recargar();
      recargar();
    }
  }

  const barra = <Barra titulo="Eliminar cuenta" volver={VOLVER} />;
  if (solicitud.estado === 'cargando')
    return (
      <Pantalla arriba={barra}>
        <Cargando />
      </Pantalla>
    );
  if (solicitud.estado === 'error' && solicitud.error && solicitud.error.codigo !== 'no_encontrado')
    return (
      <Pantalla arriba={barra}>
        <ErrorEstado error={solicitud.error} onReintentar={solicitud.recargar} />
      </Pantalla>
    );

  const s = solicitud.datos;
  if (s) {
    const e = ESTADOS[s.estado];
    const actual =
      s.estado === 'completada_con_retencion'
        ? 2
        : PASOS.indexOf(s.estado as (typeof PASOS)[number]);
    return (
      <Pantalla
        arriba={barra}
        pie={
          <BotonHx variante="fantasma" icono="salir" onClick={cerrarSesion}>
            Cerrar sesión
          </BotonHx>
        }
        clase="du-baja-hx"
      >
        <div className="du-cuerpo">
          <section
            className="hd-tarjeta hd-tarjeta--gris du-baja-hx__estado"
            aria-live="polite"
            aria-labelledby="baja-estado"
            {...entra(1)}
          >
            <h2 id="baja-estado" className="sr-only">
              Estado de la solicitud
            </h2>
            <ChipEstado e={e} vivo />
            <p>{e.explica}</p>
            {actual >= 0 ? (
              <ol
                className="du-baja-hx__pasos"
                aria-label={`Paso ${actual + 1} de ${PASOS.length}`}
              >
                {PASOS.map((p, i) => (
                  <li
                    key={p}
                    className={i < actual ? 'is-hecho' : i === actual ? 'is-actual' : ''}
                    aria-current={i === actual ? 'step' : undefined}
                  >
                    <i aria-hidden="true">{i <= actual ? <Icono nombre="check" /> : null}</i>
                    <span>{ESTADOS[p].texto}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            <dl className="du-datos-hx__lista">
              <div className="hd-dato">
                <dt>Pedida</dt>
                <dd>{cuando(s.creadaEn)}</dd>
              </div>
              <div className="hd-dato">
                <dt>Última novedad</dt>
                <dd>{cuando(s.actualizadaEn)}</dd>
              </div>
            </dl>
          </section>
          {s.retenciones.length ? (
            <Aviso tipo="info" titulo="Lo que conservamos">
              <ul className="lista-plana">
                {s.retenciones.map((r) => (
                  <li key={r.categoria}>
                    {r.categoria.replace(/_/g, ' ')}:{' '}
                    {r.hasta ? `hasta el ${r.hasta}` : 'plazo a confirmar por Legal'}
                  </li>
                ))}
              </ul>
            </Aviso>
          ) : null}
          <p className="du-nota" {...entra(2)}>
            <Icono nombre="info" />
            <span>
              Mientras tanto no podés crear pedidos nuevos. Cerrar sesión no cancela la eliminación.
              Qué datos tratamos, en <Enlace href="/cuenta/privacidad/">Privacidad</Enlace>.
            </span>
          </p>
        </div>
      </Pantalla>
    );
  }

  return (
    <Pantalla
      arriba={barra}
      pie={
        <>
          <BotonHx
            type="submit"
            form="form-baja"
            variante="peligro"
            icono="tacho"
            cargando={pendiente}
          >
            Solicitar la eliminación
          </BotonHx>
          <Enlace href="/cuenta/" className="hd-boton hd-boton--fantasma">
            Volver
          </Enlace>
        </>
      }
      clase="du-baja-hx"
    >
      <form id="form-baja" className="du-cuerpo" onSubmit={pedir} noValidate>
        <p className="du-baja-hx__intro" {...entra(1)}>
          Pedir la eliminación borra de verdad tu cuenta y tus datos. Cerrar sesión no lo hace.
        </p>
        <ul className="du-puntos-hx" {...entra(2)}>
          <li className="du-nota">
            <Icono nombre="reloj" />
            <span>Te mostramos el estado de la solicitud en cada paso.</span>
          </li>
          <li className="du-nota">
            <Icono nombre="escudo" />
            <span>
              Si por obligación legal tenemos que conservar algún dato (por ejemplo, de pagos o
              reclamos), te decimos cuál y por cuánto tiempo.
            </span>
          </li>
          <li className="du-nota">
            <Icono nombre="alerta" />
            <span>No podés tener un trabajo en curso.</span>
          </li>
        </ul>
        <CampoContrasena
          etiqueta="Tu contraseña"
          valor={contrasena}
          onCambio={setContrasena}
          error={
            local.contrasena ?? (error?.codigo === 'no_autenticado' ? error.mensaje : undefined)
          }
        />
        <label className="opcion">
          <input
            type="checkbox"
            checked={entiendo}
            onChange={(e) => setEntiendo(e.target.checked)}
          />
          <span>
            <span className="opcion__titulo">Entiendo que se elimina mi cuenta</span>
            <span className="opcion__texto">Esto no se puede deshacer una vez completado.</span>
          </span>
        </label>
        {local.entiendo ? (
          <p className="campo__error" role="alert">
            {local.entiendo}
          </p>
        ) : null}
        {error && error.codigo !== 'no_autenticado' ? (
          <Aviso tipo="error">{error.mensaje}</Aviso>
        ) : null}
      </form>
    </Pantalla>
  );
}
