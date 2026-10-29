'use client';

import { useState } from 'react';
import { GENEROS, type PerfilUsuario } from '@/contracts/v1/cuenta';
import { useEnvio } from '@/data/hooks';
import { GENEROS_ETIQUETA, NACIONALIDADES, erroresDe, nombrePais } from '@/domain/formularios';
import { FormUbicacion, aUbicacion, deUbicacion, type UbicacionForm } from './FormUbicacion';
import { useSesion } from './SesionProvider';
import { Aviso, Boton, Campo, Pasos } from './ui';

const TITULOS = ['Tus datos', 'Sobre vos', 'Dónde estás'] as const;

/**
 * Perfil operativo (PROD-15): nombre, apellido, fecha de nacimiento, nacionalidad, género y ubicación real.
 * Por pasos al registrarse (con "completar después") o completo al editar. Sin DNI, CUIT ni certificados.
 */
export function FormPerfil({
  modo,
  alTerminar,
  alPosponer,
}: {
  modo: 'pasos' | 'completo';
  alTerminar: () => void;
  alPosponer?: () => void;
}) {
  const { sesion, recargar } = useSesion();
  const p = sesion.perfil;
  const { enviar, pendiente, error, limpiar } = useEnvio();
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState(p.nombre ?? '');
  const [apellido, setApellido] = useState(p.apellido ?? '');
  const [nacimiento, setNacimiento] = useState(p.fechaNacimiento ?? '');
  const [nacionalidad, setNacionalidad] = useState(p.nacionalidad ?? 'AR');
  const [genero, setGenero] = useState<PerfilUsuario['genero'] | ''>(p.genero ?? '');
  const [ubicacion, setUbicacion] = useState<UbicacionForm>(deUbicacion(p.ubicacion));
  const [local, setLocal] = useState<Record<string, string>>({});
  const [guardado, setGuardado] = useState(false);
  const errores = { ...erroresDe(error), ...local };
  const completo = modo === 'completo';

  function validar(pasos: readonly number[]): Record<string, string> {
    const n: Record<string, string> = {};
    if (pasos.includes(1)) {
      if (!nombre.trim()) n.nombre = 'Escribí tu nombre.';
      if (!apellido.trim()) n.apellido = 'Escribí tu apellido.';
    }
    if (pasos.includes(2)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(nacimiento))
        n.fechaNacimiento = 'Elegí tu fecha de nacimiento.';
      if (!genero) n.genero = 'Elegí una opción.';
    }
    if (pasos.includes(3)) {
      if (!ubicacion.ciudad.trim()) n.ciudad = 'Escribí tu ciudad.';
      if (!ubicacion.direccion.trim()) n.direccion = 'Escribí tu dirección.';
    }
    return n;
  }

  async function guardar(pasos: readonly number[]) {
    const n = validar(pasos);
    setLocal(n);
    setGuardado(false);
    if (Object.keys(n).length) return false;
    const cuerpo: Record<string, unknown> = { version: sesion.perfilVersion };
    if (pasos.includes(1))
      Object.assign(cuerpo, { nombre: nombre.trim(), apellido: apellido.trim() });
    if (pasos.includes(2))
      Object.assign(cuerpo, { fechaNacimiento: nacimiento, nacionalidad, genero });
    if (pasos.includes(3)) Object.assign(cuerpo, { ubicacion: aUbicacion(ubicacion) });
    const r = await enviar('perfil', { cuerpo: cuerpo as never }, JSON.stringify(cuerpo));
    if (r?.ok) {
      recargar();
      return true;
    }
    return false;
  }

  async function siguiente() {
    if (!(await guardar([paso]))) return;
    if (paso < 3) setPaso(paso + 1);
    else alTerminar();
  }

  async function guardarTodo(e: React.FormEvent) {
    e.preventDefault();
    if (await guardar([1, 2, 3])) setGuardado(true);
  }

  const campos = (pasos: readonly number[]) => (
    <>
      {pasos.includes(1) ? (
        <>
          <Campo etiqueta="Nombre" error={errores.nombre} requerido>
            {(c) => (
              <input
                {...c}
                className="entrada"
                autoComplete="given-name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Apellido" error={errores.apellido} requerido>
            {(c) => (
              <input
                {...c}
                className="entrada"
                autoComplete="family-name"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            )}
          </Campo>
        </>
      ) : null}
      {pasos.includes(2) ? (
        <>
          <Campo
            etiqueta="Fecha de nacimiento"
            error={errores.fechaNacimiento}
            ayuda="Tenés que ser mayor de 18 años."
            requerido
          >
            {(c) => (
              <input
                {...c}
                className="entrada"
                type="date"
                autoComplete="bday"
                value={nacimiento}
                onChange={(e) => setNacimiento(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Nacionalidad" error={errores.nacionalidad} requerido>
            {(c) => (
              <select
                {...c}
                className="entrada"
                value={nacionalidad}
                onChange={(e) => setNacionalidad(e.target.value)}
              >
                {NACIONALIDADES.map((n) => (
                  <option key={n} value={n}>
                    {nombrePais(n)}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo etiqueta="Género" error={errores.genero} requerido>
            {(c) => (
              <select
                {...c}
                className="entrada"
                value={genero}
                onChange={(e) => setGenero(e.target.value as PerfilUsuario['genero'])}
              >
                <option value="">Elegí una opción</option>
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {GENEROS_ETIQUETA[g]}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </>
      ) : null}
      {pasos.includes(3) ? (
        <FormUbicacion valor={ubicacion} onCambio={setUbicacion} errores={errores} />
      ) : null}
    </>
  );

  const avisoError =
    error && !Object.keys(erroresDe(error)).length ? (
      <Aviso tipo="error" titulo="No pudimos guardar">
        {error.mensaje}
      </Aviso>
    ) : null;
  const conflicto =
    error?.conflicto === 'version' ? (
      <Aviso tipo="alerta" titulo="Tu perfil cambió en otro lado">
        <Boton
          chico
          variante="claro"
          onClick={() => {
            limpiar();
            recargar();
          }}
        >
          Actualizar
        </Boton>
      </Aviso>
    ) : null;

  if (completo)
    return (
      <form onSubmit={guardarTodo} noValidate>
        {campos([1, 2, 3])}
        {conflicto ?? avisoError}
        {guardado ? (
          <Aviso tipo="ok" rol="status">
            Guardamos tus datos.
          </Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Guardar cambios
          </Boton>
        </div>
      </form>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void siguiente();
      }}
      noValidate
    >
      <Pasos actual={paso} total={3} titulo={TITULOS[paso - 1] ?? ''} />
      {campos([paso])}
      {conflicto ?? avisoError}
      <div className="acciones">
        <Boton type="submit" cargando={pendiente}>
          {paso < 3 ? 'Guardar y seguir' : 'Terminar'}
        </Boton>
        {paso > 1 ? (
          <Boton variante="claro" onClick={() => setPaso(paso - 1)}>
            Volver
          </Boton>
        ) : null}
        {alPosponer ? (
          <Boton variante="texto" onClick={alPosponer}>
            Completar después
          </Boton>
        ) : null}
      </div>
    </form>
  );
}
