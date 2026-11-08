'use client';

import { Hoja } from '@/components/ui';
import { Boton, Nota } from '@/ui';
import { OpcionAdjuntar } from '@/ui/mensajes';

/** «Sumar al chat» (lienzo M-Adjuntar): foto, medida y algo de Mi hogar. Las dos últimas se arman en su pantalla. */
export function Adjuntar({
  abierta,
  onCerrar,
  onFoto,
}: {
  abierta: boolean;
  onCerrar: () => void;
  onFoto: () => void;
}) {
  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Sumar al chat">
      <div className="ds ds-pila">
        <div className="ds-m-adjuntar">
          <OpcionAdjuntar
            icono="camara"
            texto="Foto"
            sub="Cámara o galería"
            onClick={() => {
              onCerrar();
              onFoto();
            }}
          />
          <OpcionAdjuntar icono="regla" texto="Medida" sub="Con la cámara" href="/herramientas/medir/" />
          <OpcionAdjuntar icono="hogar" texto="De Mi hogar" sub="Equipo o informe" href="/hogar/compartir/" />
        </div>
        <Nota icono="escudo" tono="gris">
          Las fotos se mandan sin ubicación ni datos del teléfono.
        </Nota>
        <Boton variante="contorno" onClick={onCerrar}>
          Cerrar
        </Boton>
      </div>
    </Hoja>
  );
}
