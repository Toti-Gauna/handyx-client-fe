'use client';

import { useState } from 'react';
import { useIr } from '@/components/nav';
import { Campo } from '@/components/ui';
import type { Ambiente, Equipo } from '@/contracts/v1/hogar';
import { useEnvio } from '@/data/hooks';
import { erroresDe } from '@/domain/formularios';
import { Boton } from '@/ui';
import { AvisoEnvio, Confirmar } from '@/ui/hogar';

/** Edición en el lugar de un equipo (con la versión que se estaba mirando) y quitarlo de la casa. */
export function EditarEquipo({
  equipo: e,
  ambientes,
  onListo,
  onCancelar,
  onActualizar,
}: {
  equipo: Equipo;
  ambientes: readonly Ambiente[];
  onListo: () => void;
  onCancelar: () => void;
  onActualizar: () => void;
}) {
  const ir = useIr();
  const [nombre, setNombre] = useState(e.nombre);
  const [marca, setMarca] = useState(e.marca ?? '');
  const [modelo, setModelo] = useState(e.modelo ?? '');
  const [instalado, setInstalado] = useState(e.instaladoEn ?? '');
  const [ambienteId, setAmbienteId] = useState(e.ambienteId);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [borrar, setBorrar] = useState(false);
  const guardado = useEnvio();
  const borrado = useEnvio();
  const errores = { ...erroresDe(guardado.error), ...local };

  const guardar = async () => {
    if (!nombre.trim()) return setLocal({ nombre: 'Poné un nombre, por ejemplo «Calefón».' });
    setLocal({});
    const cuerpo = {
      version: e.version,
      ambienteId,
      nombre: nombre.trim(),
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      instaladoEn: instalado || null,
    };
    const r = await guardado.enviar(
      'equipoEditar',
      { parametros: { id: e.id }, cuerpo },
      JSON.stringify(cuerpo),
    );
    if (r?.ok) onListo();
  };

  return (
    <form
      className="ds-pila"
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        void guardar();
      }}
    >
      <Campo etiqueta="Qué es" error={errores.nombre} requerido>
        {(p) => (
          <input
            {...p}
            className="entrada"
            value={nombre}
            maxLength={60}
            onChange={(ev) => setNombre(ev.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Marca" error={errores.marca} opcional>
        {(p) => (
          <input
            {...p}
            className="entrada"
            value={marca}
            maxLength={60}
            onChange={(ev) => setMarca(ev.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Modelo" error={errores.modelo} opcional>
        {(p) => (
          <input
            {...p}
            className="entrada"
            value={modelo}
            maxLength={60}
            onChange={(ev) => setModelo(ev.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Dónde está" error={errores.ambienteId}>
        {(p) => (
          <select
            {...p}
            className="entrada"
            value={ambienteId}
            onChange={(ev) => setAmbienteId(ev.target.value)}
          >
            {ambientes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo etiqueta="Instalado (aproximado)" error={errores.instaladoEn} opcional>
        {(p) => (
          <input
            {...p}
            type="date"
            className="entrada"
            value={instalado}
            onChange={(ev) => setInstalado(ev.target.value)}
          />
        )}
      </Campo>
      <AvisoEnvio
        error={guardado.error?.codigo === 'validacion' ? null : guardado.error}
        onActualizar={onActualizar}
      />
      <Boton type="submit" icono="check" ocupado={guardado.pendiente}>
        Guardar los cambios
      </Boton>
      <Boton variante="contorno" chico onClick={onCancelar}>
        Cancelar
      </Boton>
      <Boton variante="peligro" chico icono="tacho" onClick={() => setBorrar(true)}>
        Quitar este equipo
      </Boton>
      <Confirmar
        abierta={borrar}
        titulo={`¿Quitar ${e.nombre}?`}
        texto="Se borran sus datos de tu casa. No se puede deshacer."
        si="Sí, quitarlo"
        ocupado={borrado.pendiente}
        error={borrado.error}
        onNo={() => setBorrar(false)}
        onSi={async () => {
          const r = await borrado.enviar('equipoBorrar', { parametros: { id: e.id } }, e.id);
          if (r?.ok) ir('/hogar/casa/?ver=equipos', { reemplazar: true });
        }}
      />
    </form>
  );
}
