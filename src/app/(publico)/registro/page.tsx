'use client';

import { useState } from 'react';
import { useIr } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Campo } from '@/components/ui';
import { AVISO_LEGAL_PROVISORIO, TEXTOS_LEGALES } from '@/content/textos';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { INVITACION_PRUEBA } from '@/data/prueba';
import { erroresDe, esEmail } from '@/domain/formularios';

export default function Registro() {
  const ir = useIr();
  const { enviar, pendiente, error } = useEnvio();
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  // Sin tildar por defecto: la aceptación tiene que ser un acto explícito.
  const [terminos, setTerminos] = useState(false);
  const [privacidad, setPrivacidad] = useState(false);
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!/^[A-Za-z0-9]{6,16}$/.test(codigo.trim()))
      n.codigoInvitacion = 'El código tiene entre 6 y 16 letras y números.';
    if (!esEmail(email)) n.email = 'Escribí un email válido.';
    if (contrasena.length < 10) n.contrasena = 'Usá al menos 10 caracteres.';
    if (!terminos || !privacidad)
      n.aceptaciones = 'Tenés que aceptar los términos y la política de privacidad.';
    setLocal(n);
    if (Object.keys(n).length) return;
    const r = await enviar(
      'registro',
      {
        cuerpo: {
          email: email.trim(),
          contrasena,
          codigoInvitacion: codigo.trim().toUpperCase(),
          aceptaciones: [
            { documento: 'terminos', version: TEXTOS_LEGALES.terminos.version },
            { documento: 'privacidad', version: TEXTOS_LEGALES.privacidad.version },
          ],
        },
      },
      `${codigo}|${email}|${contrasena}`,
    );
    if (r?.ok) ir('/registro/listo/', { reemplazar: true });
  }

  return (
    <>
      <Titulo texto="Creá tu ==cuenta==" />
      <p>La demo es cerrada: para registrarte necesitás un código de invitación.</p>
      <form onSubmit={crear} noValidate>
        <Campo etiqueta="Código de invitación" error={errores.codigoInvitacion} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              autoCapitalize="characters"
              autoComplete="off"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          )}
        </Campo>
        <Campo
          etiqueta="Email"
          error={errores.email}
          ayuda="Lo usamos para ingresar y recuperar tu contraseña."
          requerido
        >
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
        <Campo
          etiqueta="Contraseña"
          error={errores.contrasena}
          ayuda="Al menos 10 caracteres."
          requerido
        >
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="password"
              autoComplete="new-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          )}
        </Campo>

        <fieldset style={{ border: 0, padding: 0, margin: '14px 0' }}>
          <legend className="campo__etiqueta">Antes de seguir</legend>
          <label className="opcion">
            <input
              type="checkbox"
              checked={terminos}
              onChange={(e) => setTerminos(e.target.checked)}
            />
            <span>
              <span className="opcion__titulo">Acepto los términos de uso</span>
              <span className="opcion__texto">{TEXTOS_LEGALES.terminos.version}</span>
            </span>
          </label>
          <label className="opcion">
            <input
              type="checkbox"
              checked={privacidad}
              onChange={(e) => setPrivacidad(e.target.checked)}
            />
            <span>
              <span className="opcion__titulo">Acepto la política de privacidad</span>
              <span className="opcion__texto">{TEXTOS_LEGALES.privacidad.version}</span>
            </span>
          </label>
          {errores.aceptaciones ? (
            <p className="campo__error" role="alert">
              {errores.aceptaciones}
            </p>
          ) : null}
          <details>
            <summary>Leer los textos</summary>
            <Aviso tipo="alerta">{AVISO_LEGAL_PROVISORIO}</Aviso>
            {Object.values(TEXTOS_LEGALES).map((t) => (
              <section key={t.version}>
                <h3 className="subtitulo">{t.titulo}</h3>
                {t.parrafos.map((x) => (
                  <p key={x}>{x}</p>
                ))}
              </section>
            ))}
          </details>
        </fieldset>

        {error && !Object.keys(erroresDe(error)).length ? (
          <Aviso tipo="error" titulo="No pudimos crear la cuenta">
            {error.mensaje}
          </Aviso>
        ) : null}
        {esVistaDePrueba ? (
          <Aviso tipo="info" titulo="Vista de prueba">
            Código de invitación ficticio: <span className="codigo">{INVITACION_PRUEBA}</span>
          </Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Crear cuenta
          </Boton>
        </div>
      </form>
    </>
  );
}
