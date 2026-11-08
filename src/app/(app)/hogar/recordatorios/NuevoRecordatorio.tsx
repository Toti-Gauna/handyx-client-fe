'use client';

import { useState } from 'react';
import { Campo, Hoja } from '@/components/ui';
import type { Equipo } from '@/contracts/v1/hogar';
import { useEnvio } from '@/data/hooks';
import { erroresDe } from '@/domain/formularios';
import { Boton } from '@/ui';
import { AvisoEnvio } from '@/ui/hogar';

const CADA = [
  { valor: '', texto: 'Una sola vez' },
  { valor: '3', texto: 'Cada 3 meses' },
  { valor: '6', texto: 'Cada 6 meses' },
  { valor: '12', texto: 'Una vez por año' },
] as const;

/** Hoja para sumar un recordatorio propio: qué, cuándo, cada cuánto y (si hace falta) de qué equipo. */
export function NuevoRecordatorio({
  abierta,
  equipos,
  onCerrar,
  onListo,
}: {
  abierta: boolean;
  equipos: readonly Equipo[];
  onCerrar: () => void;
  onListo: () => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [cada, setCada] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const { enviar, pendiente, error } = useEnvio();
  const errores = { ...erroresDe(error), ...local };

  const guardar = async () => {
    const mal: Record<string, string> = {};
    if (!titulo.trim()) mal.titulo = 'Escribí qué hay que revisar.';
    if (!fecha) mal.fecha = 'Elegí para cuándo.';
    setLocal(mal);
    if (Object.keys(mal).length) return;
    const cuerpo = {
      titulo: titulo.trim(),
      fecha,
      cadaMeses: cada ? Number(cada) : null,
      equipoId: equipoId || null,
    };
    const r = await enviar('recordatorioCrear', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) {
      setTitulo('');
      setFecha('');
      setCada('');
      setEquipoId('');
      onListo();
    }
  };

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Sumar un recordatorio">
      <form
        className="ds ds-pila"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void guardar();
        }}
      >
        <Campo etiqueta="Qué hay que revisar" error={errores.titulo} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              maxLength={80}
              placeholder="Limpiar la rejilla del baño"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          )}
        </Campo>
        <Campo etiqueta="Para cuándo" error={errores.fecha} requerido>
          {(p) => (
            <input
              {...p}
              type="date"
              className="entrada"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          )}
        </Campo>
        <Campo etiqueta="Cada cuánto" error={errores.cadaMeses}>
          {(p) => (
            <select {...p} className="entrada" value={cada} onChange={(e) => setCada(e.target.value)}>
              {CADA.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.texto}
                </option>
              ))}
            </select>
          )}
        </Campo>
        {equipos.length ? (
          <Campo etiqueta="De qué equipo" opcional error={errores.equipoId}>
            {(p) => (
              <select
                {...p}
                className="entrada"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
              >
                <option value="">De ninguno en especial</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        ) : null}
        <AvisoEnvio error={error?.codigo === 'validacion' ? null : error} />
        <Boton type="submit" icono="check" ocupado={pendiente}>
          Guardar el recordatorio
        </Boton>
        <Boton variante="contorno" chico onClick={onCerrar}>
          Cancelar
        </Boton>
      </form>
    </Hoja>
  );
}
