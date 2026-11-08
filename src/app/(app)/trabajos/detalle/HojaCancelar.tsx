'use client';

import { useState } from 'react';
import { Hoja } from '@/components/ui';
import { Aviso } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { useEnvio } from '@/data/hooks';
import { Boton, Opcion } from '@/ui';

const MOTIVOS = [
  { id: 'cambio_de_planes', texto: 'Cambié de planes' },
  { id: 'no_se_presento', texto: 'No se presentó' },
  { id: 'otro', texto: 'Otro motivo' },
] as const;

/** Cancelar el trabajo: se avisa al especialista y queda en el historial. Siempre se puede volver atrás. */
export function HojaCancelar({
  abierta,
  cerrar,
  t,
  esp,
  accion,
  alCancelar,
}: {
  abierta: boolean;
  cerrar: () => void;
  t: Trabajo;
  esp: string;
  accion: ReturnType<typeof useEnvio>;
  alCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]['id']>('cambio_de_planes');
  async function cancelar() {
    const r = await accion.enviar(
      'trabajoCancelar',
      { parametros: { id: t.id }, cuerpo: { version: t.version, motivo } },
      `${t.version}|${motivo}`,
    );
    if (r?.ok) {
      cerrar();
      alCancelar();
    }
  }
  return (
    <Hoja abierta={abierta} onCerrar={cerrar} titulo="¿Cancelar el trabajo?">
      <p>Le avisamos a {esp}. Queda en tu historial.</p>
      <div className="ds-pila" role="radiogroup" aria-label="Motivo">
        {MOTIVOS.map((m) => (
          <Opcion
            key={m.id}
            titulo={m.texto}
            elegida={motivo === m.id}
            onElegir={() => setMotivo(m.id)}
          />
        ))}
      </div>
      {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
      <div className="ds-pila">
        <Boton variante="peligro" icono="cerrar" ocupado={accion.pendiente} onClick={cancelar}>
          Sí, cancelar el trabajo
        </Boton>
        <Boton variante="contorno" onClick={cerrar}>
          No, volver
        </Boton>
      </div>
    </Hoja>
  );
}
