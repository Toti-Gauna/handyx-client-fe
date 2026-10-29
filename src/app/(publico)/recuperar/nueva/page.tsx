'use client';

import { useState } from 'react';
import { Enlace, useIr } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Campo } from '@/components/ui';
import { useEnvio, useParametroDeFragmento } from '@/data/hooks';

export default function NuevaContrasena() {
  const ir = useIr();
  const { enviar, pendiente, error } = useEnvio();
  // El token viaja en el fragmento (#t=): no llega al servidor ni al Referer.
  const token = useParametroDeFragmento('t');
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (contrasena.length < 10) n.contrasena = 'Usá al menos 10 caracteres.';
    if (repetida !== contrasena) n.repetida = 'Las contraseñas no coinciden.';
    setLocal(n);
    if (Object.keys(n).length || !token) return;
    const r = await enviar(
      'recuperacionConfirmar',
      { cuerpo: { token, contrasena } },
      `${token}|${contrasena}`,
    );
    if (r?.ok) ir('/ingresar/?motivo=clave', { reemplazar: true });
  }

  if (token === null) return null;
  if (!token)
    return (
      <>
        <Titulo texto="Enlace ==incompleto==" />
        <Aviso tipo="error">Este enlace no es válido. Pedí uno nuevo.</Aviso>
        <div className="acciones">
          <Enlace href="/recuperar/" className="boton">
            Pedir un enlace nuevo
          </Enlace>
        </div>
      </>
    );

  return (
    <>
      <Titulo texto="Elegí una ==contraseña nueva==" />
      <form onSubmit={guardar} noValidate>
        <Campo
          etiqueta="Contraseña nueva"
          error={local.contrasena}
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
        <Campo etiqueta="Repetila" error={local.repetida} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="password"
              autoComplete="new-password"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
            />
          )}
        </Campo>
        {error ? (
          <Aviso
            tipo="error"
            titulo={error.codigo === 'conflicto' ? 'El enlace ya no sirve' : 'No pudimos guardarla'}
          >
            {error.mensaje}{' '}
            {error.codigo === 'conflicto' ? (
              <Enlace className="enlace-tarjeta" href="/recuperar/">
                Pedir uno nuevo
              </Enlace>
            ) : null}
          </Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Guardar contraseña
          </Boton>
        </div>
      </form>
    </>
  );
}
