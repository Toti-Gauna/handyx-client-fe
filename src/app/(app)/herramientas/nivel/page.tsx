'use client';

import { useState } from 'react';
import { useIr } from '@/components/nav';
import {
  TEXTO_NIVEL,
  estadoNivel,
  formatoGrados,
  guardarItem,
  inclinacionTotal,
  posicionBurbuja,
} from '@/domain/herramientas';
import { Boton, Chip, type TonoChip } from '@/ui';
import { AvisoSeguridad, PantallaOscura, PedirPermiso } from '@/ui/herramientas';
import { type EstadoSensor, useInclinacion } from '../_lib/useInclinacion';

const PROBLEMA: Partial<Record<EstadoSensor, string>> = {
  denegado:
    'No diste permiso para usar el sensor de inclinación. Podés cambiarlo en los ajustes del navegador.',
  'no-disponible':
    'Este teléfono no manda datos de inclinación al navegador, así que no podemos mostrar el nivel.',
};
const TONO = { derecho: 'exito', casi: 'amarillo', torcido: 'error' } as const satisfies Record<
  string,
  TonoChip
>;
const ICONO = { derecho: 'check', casi: 'info', torcido: 'alerta' } as const;
/** Cuánto se corre la burbuja: el recorrido libre del aro (36 % del aro) sobre el tamaño de la burbuja (28 %). */
const RECORRIDO = 128.5;

/** Nivel con el sensor de inclinación: burbuja, grados grandes y estado en palabras. Apoyar el teléfono. */
export default function Nivel() {
  const ir = useIr();
  const sensor = useInclinacion();
  const [fijado, setFijado] = useState<{ beta: number; gamma: number } | null>(null);
  const a = fijado ?? sensor.angulos;
  const grados = inclinacionTotal(a.beta, a.gamma);
  const estado = estadoNivel(grados);
  const burbuja = posicionBurbuja(a.beta, a.gamma);
  const activo = sensor.estado === 'activo';

  const mandar = () => {
    guardarItem({
      tipo: 'nivel',
      titulo: 'Nivel',
      detalle: `Inclinación de ${formatoGrados(grados)} · ${TEXTO_NIVEL[estado].toLowerCase()}`,
    });
    ir('/herramientas/destino/');
  };

  const escena = activo ? (
    <div className="dh-nivel">
      <span
        className="dh-nivel__aro"
        role="img"
        aria-label={`Inclinación: ${formatoGrados(grados).replace('°', ' grados')}`}
      >
        <span className="dh-nivel__centro" />
        <span
          className="dh-nivel__burbuja"
          style={{ translate: `${burbuja.x * RECORRIDO}% ${burbuja.y * RECORRIDO}%` }}
        />
      </span>
      <span className="dh-nivel__grados" aria-hidden="true">
        {formatoGrados(grados)}
      </span>
      <span role="status">
        <Chip tono={TONO[estado]} icono={ICONO[estado]}>
          {TEXTO_NIVEL[estado]}
        </Chip>
      </span>
    </div>
  ) : (
    <PedirPermiso
      icono="nivel"
      titulo="Para el nivel usamos el sensor del teléfono"
      texto="Sirve para saber si algo está derecho. Se usa solo acá y no se manda nada."
      boton="Activar el nivel"
      onPedir={() => void sensor.iniciar()}
      ocupado={sensor.estado === 'pidiendo'}
      problema={PROBLEMA[sensor.estado] ?? null}
    />
  );

  return (
    <PantallaOscura titulo="Nivel" escena={escena}>
      {activo ? (
        <section className="dh-panel" aria-label="Qué hacer">
          <p>Apoyá el celular acostado sobre el estante, el marco o lo que quieras revisar.</p>
          {fijado ? (
            <>
              <Boton onClick={mandar} icono="enviar">
                Guardar y mandar
              </Boton>
              <Boton variante="contorno" onClick={() => setFijado(null)} icono="reintentar">
                Seguir midiendo
              </Boton>
            </>
          ) : (
            <Boton onClick={() => setFijado(sensor.angulos)} icono="candado">
              Fijar la medida
            </Boton>
          )}
        </section>
      ) : (
        <AvisoSeguridad />
      )}
    </PantallaOscura>
  );
}
