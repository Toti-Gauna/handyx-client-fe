'use client';

import { useState } from 'react';
import { ZOOMS, cambiarZoom } from '@/domain/herramientas';
import { Boton, Interruptor, Nota } from '@/ui';
import { AvisoSeguridad, PantallaOscura, PedirPermiso, VideoCamara } from '@/ui/herramientas';
import { useCamara, type EstadoCamara } from '../_lib/useCamara';

const PROBLEMA: Partial<Record<EstadoCamara, string>> = {
  denegada: 'No diste permiso para usar la cámara. Lo podés cambiar en los ajustes del navegador.',
  'no-disponible': 'No encontramos una cámara que podamos usar en este teléfono.',
  error: 'No pudimos abrir la cámara. Probá de nuevo.',
};

/** Linterna (si el teléfono la deja prender desde el navegador) y lupa (la cámara con aumento). */
export default function Linterna() {
  const cam = useCamara();
  const [zoom, setZoom] = useState(1);
  const [fallo, setFallo] = useState(false);
  const lista = cam.estado === 'lista' && cam.stream !== null;

  const alternar = async () => setFallo(!(await cam.alternarLinterna()));

  const escena = lista ? (
    <>
      <VideoCamara stream={cam.stream!} zoom={zoom} />
      <p className="dh-zoom" role="status">
        Aumento {zoom}×
      </p>
    </>
  ) : (
    <PedirPermiso
      icono="lupa"
      titulo="Para la lupa usamos tu cámara"
      texto="Se usa solo en esta pantalla, en tu teléfono. No se graba ni se manda nada. Desde acá también podés prender la linterna si tu teléfono lo permite."
      boton="Activar la cámara"
      onPedir={() => void cam.iniciar()}
      ocupado={cam.estado === 'pidiendo'}
      problema={PROBLEMA[cam.estado] ?? null}
    />
  );

  return (
    <PantallaOscura titulo="Linterna y lupa" escena={escena}>
      {lista ? (
        <section className="dh-panel" aria-label="Controles">
          {cam.linterna.soportada ? (
            <Interruptor
              etiqueta="Linterna"
              sub={cam.linterna.encendida ? 'Prendida' : 'Apagada'}
              activo={cam.linterna.encendida}
              onCambiar={() => void alternar()}
            />
          ) : (
            <Nota icono="info" tono="gris">
              Este teléfono no deja prender la linterna desde acá. La lupa sí funciona.
            </Nota>
          )}
          {fallo ? (
            <Nota icono="info" tono="error" rol="alert">
              No se pudo cambiar la linterna. Probá de nuevo.
            </Nota>
          ) : null}
          <div className="dh-panel__fila">
            <Boton
              variante="suave"
              icono="lupa"
              onClick={() => setZoom((z) => cambiarZoom(z, 1))}
              deshabilitado={zoom === ZOOMS[ZOOMS.length - 1]}
            >
              Acercar
            </Boton>
            <Boton
              variante="suave"
              icono="abajo"
              onClick={() => setZoom((z) => cambiarZoom(z, -1))}
              deshabilitado={zoom === ZOOMS[0]}
            >
              Alejar
            </Boton>
          </div>
        </section>
      ) : (
        <AvisoSeguridad />
      )}
    </PantallaOscura>
  );
}
