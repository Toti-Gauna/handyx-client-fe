'use client';

import { useState } from 'react';
import { Campo } from '@/components/ui';
import type { Ambiente } from '@/contracts/v1/hogar';
import { useEnvio } from '@/data/hooks';
import { erroresDe } from '@/domain/formularios';
import { Boton, Nota } from '@/ui';
import { AvisoEnvio, cmDeMetros, metrosDeCm } from '@/ui/hogar';

/**
 * Edición en el lugar de un ambiente. Manda la versión que se estaba mirando: si otro cambio llegó antes, el servidor
 * lo rechaza y se ofrece ver lo último (nada se pisa en silencio).
 */
export function EditarAmbiente({
  ambiente: a,
  onListo,
  onCancelar,
  onActualizar,
}: {
  ambiente: Ambiente;
  onListo: () => void;
  onCancelar: () => void;
  onActualizar: () => void;
}) {
  const [nombre, setNombre] = useState(a.nombre);
  const [ancho, setAncho] = useState(metrosDeCm(a.medidas?.anchoCm));
  const [largo, setLargo] = useState(metrosDeCm(a.medidas?.largoCm));
  const [alto, setAlto] = useState(metrosDeCm(a.medidas?.altoCm));
  const [materiales, setMateriales] = useState(a.materiales ?? '');
  const [notas, setNotas] = useState(a.notas ?? '');
  const [local, setLocal] = useState<Record<string, string>>({});
  const { enviar, pendiente, error } = useEnvio();
  const errores = { ...erroresDe(error), ...local };

  const guardar = async () => {
    const [w, l, h] = [cmDeMetros(ancho), cmDeMetros(largo), cmDeMetros(alto)];
    const mal: Record<string, string> = {};
    if (!nombre.trim()) mal.nombre = 'Poné un nombre, por ejemplo «Baño de arriba».';
    if (Number.isNaN(w) || Number.isNaN(l) || Number.isNaN(h))
      mal.medidas = 'Escribí las medidas en metros, por ejemplo 2,10.';
    else if ((w === null) !== (l === null))
      mal.medidas = 'Para guardar las medidas hacen falta el ancho y el largo.';
    setLocal(mal);
    if (Object.keys(mal).length) return;
    const cuerpo = {
      version: a.version,
      nombre: nombre.trim(),
      medidas: w && l ? { anchoCm: w, largoCm: l, altoCm: h } : null,
      materiales: materiales.trim() || null,
      notas: notas.trim() || null,
    };
    const r = await enviar(
      'ambienteEditar',
      { parametros: { id: a.id }, cuerpo },
      JSON.stringify(cuerpo),
    );
    if (r?.ok) onListo();
  };

  return (
    <form
      className="ds-pila"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
      noValidate
    >
      <Campo etiqueta="Nombre" error={errores.nombre} requerido>
        {(p) => (
          <input
            {...p}
            className="entrada"
            value={nombre}
            maxLength={60}
            onChange={(e) => setNombre(e.target.value)}
          />
        )}
      </Campo>
      <Campo
        etiqueta="Ancho (metros)"
        ayuda="Aproximado alcanza. Lo que no sepas, dejalo vacío."
        error={errores.medidas}
        opcional
      >
        {(p) => (
          <input
            {...p}
            className="entrada"
            inputMode="decimal"
            placeholder="2,10"
            value={ancho}
            onChange={(e) => setAncho(e.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Largo (metros)" opcional>
        {(p) => (
          <input
            {...p}
            className="entrada"
            inputMode="decimal"
            placeholder="1,80"
            value={largo}
            onChange={(e) => setLargo(e.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Alto (metros)" opcional>
        {(p) => (
          <input
            {...p}
            className="entrada"
            inputMode="decimal"
            placeholder="2,60"
            value={alto}
            onChange={(e) => setAlto(e.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Materiales" ayuda="Paredes, piso, caños: lo que sepas." opcional>
        {(p) => (
          <textarea
            {...p}
            className="entrada"
            maxLength={300}
            value={materiales}
            onChange={(e) => setMateriales(e.target.value)}
          />
        )}
      </Campo>
      <Campo etiqueta="Nota" ayuda="Por ejemplo, dónde está la llave de paso." opcional>
        {(p) => (
          <textarea
            {...p}
            className="entrada"
            maxLength={500}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        )}
      </Campo>
      <Nota tono="gris" icono="camara">
        Por ahora las fotos no se pueden sumar desde acá.
      </Nota>
      <AvisoEnvio
        error={error?.codigo === 'validacion' ? null : error}
        onActualizar={onActualizar}
      />
      <Boton type="submit" icono="check" ocupado={pendiente}>
        Guardar los cambios
      </Boton>
      <Boton variante="contorno" chico onClick={onCancelar}>
        Cancelar
      </Boton>
    </form>
  );
}
