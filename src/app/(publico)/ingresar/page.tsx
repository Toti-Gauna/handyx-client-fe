'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, destinoSeguro, useIr } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Campo } from '@/components/ui';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { CUENTA_PRUEBA } from '@/data/prueba';
import { erroresDe, esEmail } from '@/domain/formularios';

export default function Ingresar() {
  const params = useSearchParams();
  const ir = useIr();
  const { enviar, pendiente, error } = useEnvio();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };
  const motivo = params.get('motivo');

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    if (!esEmail(email)) nuevos.email = 'Escribí un email válido.';
    if (!contrasena) nuevos.contrasena = 'Escribí tu contraseña.';
    setLocal(nuevos);
    if (Object.keys(nuevos).length) return;
    const r = await enviar(
      'login',
      { cuerpo: { email: email.trim(), contrasena } },
      `${email}|${contrasena}`,
    );
    if (r?.ok) ir(destinoSeguro(params.get('volver')), { reemplazar: true });
  }

  return (
    <>
      <Titulo texto="Ingresá a ==Handyx==" />
      {motivo === 'sesion' ? (
        <Aviso tipo="alerta" titulo="Tu sesión venció">
          Ingresá de nuevo para seguir.
        </Aviso>
      ) : null}
      {motivo === 'clave' ? (
        <Aviso tipo="ok" rol="status">
          Listo: ya podés ingresar con la contraseña nueva.
        </Aviso>
      ) : null}
      <form onSubmit={ingresar} noValidate>
        <Campo etiqueta="Email" error={errores.email} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
        <Campo etiqueta="Contraseña" error={errores.contrasena} requerido>
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
        {error && !Object.keys(erroresDe(error)).length ? (
          <Aviso
            tipo="error"
            titulo={error.recuperable ? 'No pudimos ingresar' : 'No pudimos ingresar'}
          >
            {error.mensaje}
          </Aviso>
        ) : null}
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
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Ingresar
          </Boton>
          <Enlace href="/recuperar/" className="boton boton--texto">
            Olvidé mi contraseña
          </Enlace>
          <Enlace href="/registro/" className="boton boton--contorno">
            Tengo una invitación
          </Enlace>
        </div>
      </form>
    </>
  );
}
