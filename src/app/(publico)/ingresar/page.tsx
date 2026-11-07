'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BotonHx, CampoContrasena, Flujo } from '@/components/acceso';
import { Icono } from '@/components/Icono';
import { Enlace, destinoSeguro, useIr } from '@/components/nav';
import { Aviso, Campo } from '@/components/ui';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { CUENTA_PRUEBA } from '@/data/prueba';
import { erroresDe, esEmail } from '@/domain/formularios';

/** Ingresar en 2 pasos (rediseño 3.2): email › contraseña. */
export default function Ingresar() {
  const params = useSearchParams();
  const ir = useIr();
  const { enviar, pendiente, error, limpiar } = useEnvio();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };
  const motivo = params.get('motivo');

  function seguir() {
    if (!esEmail(email)) return setLocal({ email: 'Escribí un email válido.' });
    setLocal({});
    limpiar();
    setPaso(2);
  }

  async function ingresar() {
    if (!contrasena) return setLocal({ contrasena: 'Escribí tu contraseña.' });
    setLocal({});
    const r = await enviar(
      'login',
      { cuerpo: { email: email.trim(), contrasena } },
      `${email}|${contrasena}`,
    );
    if (r?.ok) ir(destinoSeguro(params.get('volver')), { reemplazar: true });
    else if (r && !r.ok && erroresDe(r.error).email) setPaso(1);
  }

  const avisoMotivo =
    motivo === 'sesion' ? (
      <Aviso tipo="alerta" titulo="Tu sesión venció">
        Ingresá de nuevo para seguir.
      </Aviso>
    ) : motivo === 'clave' ? (
      <Aviso tipo="ok" rol="status">
        Listo: ya podés ingresar con la contraseña nueva.
      </Aviso>
    ) : null;

  if (paso === 1)
    return (
      <Flujo
        titulo="¡Hola! ¿Cuál es tu ==email==?"
        sub="El de tu cuenta de Handyx."
        atras={{ href: '/', etiqueta: 'Volver a la bienvenida' }}
        paso={1}
        total={2}
        onSubmit={(e) => {
          e.preventDefault();
          seguir();
        }}
        pie={
          <>
            <BotonHx type="submit">Seguir</BotonHx>
            <Enlace href="/registro/" className="hd-boton hd-boton--fantasma">
              Tengo una invitación
            </Enlace>
          </>
        }
      >
        {avisoMotivo}
        <Campo etiqueta="Email" error={errores.email} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
        {esVistaDePrueba ? (
          <Aviso tipo="info" titulo="Vista de prueba">
            <p>Cuenta ficticia para probar:</p>
            <p className="codigo">
              {CUENTA_PRUEBA.email}
              <br />
              {CUENTA_PRUEBA.contrasena}
            </p>
          </Aviso>
        ) : null}
      </Flujo>
    );

  return (
    <Flujo
      titulo="Ahora tu ==contraseña=="
      atras={{ alTocar: () => setPaso(1), etiqueta: 'Volver al email' }}
      paso={2}
      total={2}
      onSubmit={(e) => {
        e.preventDefault();
        void ingresar();
      }}
      pie={
        <>
          <BotonHx type="submit" cargando={pendiente}>
            Ingresar
          </BotonHx>
          <Enlace href="/recuperar/" className="hd-boton hd-boton--fantasma">
            Olvidé mi contraseña
          </Enlace>
        </>
      }
    >
      <div className="du-email-elegido">
        <Icono nombre="usuario" />
        <span>{email.trim()}</span>
        <button type="button" onClick={() => setPaso(1)}>
          Cambiar
        </button>
      </div>
      {/* Para los gestores de contraseñas: el usuario de este formulario. */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      <CampoContrasena
        etiqueta="Contraseña"
        valor={contrasena}
        onCambio={setContrasena}
        error={errores.contrasena}
      />
      {error && !Object.keys(erroresDe(error)).length ? (
        <Aviso tipo="error" titulo="No pudimos ingresar">
          {error.mensaje}
        </Aviso>
      ) : null}
    </Flujo>
  );
}
