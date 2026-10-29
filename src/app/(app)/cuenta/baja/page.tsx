'use client';

import { useState } from 'react';
import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Encabezado } from '@/components/Titulo';
import { Aviso, Boton, Campo, Cargando, Datos, ErrorEstado, Pastilla } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { cuando } from '@/domain/fechas';

const ESTADOS: Record<
  string,
  { texto: string; explica: string; tono: 'azul' | 'alerta' | 'ok' | 'gris' }
> = {
  recibida: {
    texto: 'Recibida',
    explica: 'Recibimos tu pedido. Todavía no se eliminó nada.',
    tono: 'alerta',
  },
  en_proceso: {
    texto: 'En proceso',
    explica: 'Estamos eliminando tus datos. Todavía no terminó.',
    tono: 'azul',
  },
  completada: { texto: 'Completada', explica: 'Eliminamos tu cuenta y tus datos.', tono: 'ok' },
  completada_con_retencion: {
    texto: 'Completada con retención',
    explica:
      'Eliminamos tu cuenta y tus datos, salvo lo que tenemos que conservar por obligación legal.',
    tono: 'ok',
  },
  cancelada: { texto: 'Cancelada', explica: 'La solicitud se canceló.', tono: 'gris' },
};

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

  if (solicitud.estado === 'cargando') return <Cargando />;
  if (
    solicitud.estado === 'error' &&
    solicitud.error?.codigo !== 'no_encontrado' &&
    solicitud.error
  )
    return <ErrorEstado error={solicitud.error} onReintentar={solicitud.recargar} />;

  const s = solicitud.datos;
  if (s) {
    const e = ESTADOS[s.estado] ?? ESTADOS.recibida!;
    return (
      <>
        <Encabezado
          titulo="Eliminar ==cuenta=="
          volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
        />
        <section className="tarjeta" aria-live="polite">
          <div className="tarjeta__cuerpo">
            <p style={{ margin: '0 0 8px' }}>
              <Pastilla tono={e.tono}>{e.texto}</Pastilla>
            </p>
            <p style={{ margin: '0 0 8px' }}>{e.explica}</p>
            <Datos
              filas={[
                ['Pedida', cuando(s.creadaEn)],
                ['Última novedad', cuando(s.actualizadaEn)],
              ]}
            />
          </div>
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
        <Aviso tipo="info">
          Mientras tanto no podés crear pedidos nuevos. Cerrar sesión no cancela la eliminación.
        </Aviso>
        <div className="acciones">
          <Boton variante="contorno" onClick={cerrarSesion}>
            Cerrar sesión
          </Boton>
        </div>
      </>
    );
  }

  return (
    <>
      <Encabezado
        titulo="Eliminar ==cuenta=="
        volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
      />
      <p>Pedir la eliminación borra de verdad tu cuenta y tus datos. Cerrar sesión no lo hace.</p>
      <ul className="lista-plana">
        <li>Te mostramos el estado de la solicitud en cada paso.</li>
        <li>
          Si por obligación legal tenemos que conservar algún dato (por ejemplo, de pagos o
          reclamos), te decimos cuál y por cuánto tiempo.
        </li>
        <li>No podés tener un trabajo en curso.</li>
      </ul>
      <form onSubmit={pedir} noValidate>
        <Campo
          etiqueta="Tu contraseña"
          error={
            local.contrasena ?? (error?.codigo === 'no_autenticado' ? error.mensaje : undefined)
          }
          requerido
        >
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          )}
        </Campo>
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
        <div className="acciones">
          <Boton type="submit" variante="peligro" cargando={pendiente}>
            Solicitar la eliminación
          </Boton>
          <Enlace href="/cuenta/" className="boton boton--claro">
            Volver
          </Enlace>
        </div>
      </form>
    </>
  );
}
