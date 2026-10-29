'use client';

import { useSesion } from '@/components/SesionProvider';
import { Enlace } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Datos } from '@/components/ui';
import { AVISO_LEGAL_PROVISORIO, TEXTOS_LEGALES } from '@/content/textos';
import { useEnvio } from '@/data/hooks';
import { diaMes } from '@/domain/fechas';

export default function Privacidad() {
  const { sesion, recargar } = useSesion();
  const { enviar, pendiente, error } = useEnvio();
  const pendientes = sesion.pendientes.documentos;

  async function aceptar(documento: 'terminos' | 'privacidad', version: string) {
    const r = await enviar(
      'aceptacion',
      { cuerpo: { documento, version } },
      `${documento}|${version}`,
    );
    if (r?.ok) recargar();
  }

  return (
    <>
      <Titulo texto="==Privacidad== y textos" />
      <Aviso tipo="alerta">{AVISO_LEGAL_PROVISORIO}</Aviso>
      {pendientes.length ? (
        <Aviso tipo="info" titulo="Hay textos nuevos para aceptar">
          {pendientes.map((d) => (
            <p key={d.documento}>
              <Boton
                chico
                onClick={() => aceptar(d.documento as 'terminos' | 'privacidad', d.version)}
                cargando={pendiente}
              >
                Aceptar{' '}
                {TEXTOS_LEGALES[d.documento as 'terminos' | 'privacidad'].titulo.toLowerCase()}
              </Boton>
            </p>
          ))}
        </Aviso>
      ) : null}
      {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
      <h2 className="subtitulo">Lo que aceptaste</h2>
      <section className="tarjeta">
        <div className="tarjeta__cuerpo">
          {sesion.aceptaciones.length ? (
            <Datos
              filas={sesion.aceptaciones.map(
                (a) =>
                  [
                    a.documento === 'terminos'
                      ? 'Términos de uso'
                      : a.documento === 'privacidad'
                        ? 'Privacidad'
                        : 'Tarifa',
                    `${a.version} · ${diaMes(a.aceptadaEn)}`,
                  ] as const,
              )}
            />
          ) : (
            <p style={{ margin: 0 }}>Todavía no aceptaste ningún texto.</p>
          )}
        </div>
      </section>
      {Object.values(TEXTOS_LEGALES).map((t) => (
        <details key={t.version}>
          <summary>{t.titulo}</summary>
          {t.parrafos.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </details>
      ))}
      <h2 className="subtitulo">HandIA</h2>
      <Aviso tipo="info" titulo="Desactivada">
        No enviamos tus datos personales ni documentos a servicios de inteligencia artificial. Si
        algún día se activa, te pedimos un consentimiento aparte.
      </Aviso>
      <h2 className="subtitulo">Tus derechos</h2>
      <p>
        Podés pedir acceso, corrección o eliminación de tus datos. La eliminación de la cuenta se
        hace desde{' '}
        <Enlace className="enlace-tarjeta" href="/cuenta/baja/">
          Eliminar cuenta
        </Enlace>
        .
      </p>
    </>
  );
}
