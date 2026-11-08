'use client';

import { Barra, Pantalla } from '@/components/hx';
import { AvisoSeguridad, Herramienta } from '@/ui/herramientas';
import { Nota, Sub, Titulo } from '@/ui';

/** Portada de las herramientas: seis mosaicos grandes. Todo corre en el teléfono. */
export default function Herramientas() {
  return (
    <Pantalla
      arriba={
        <Barra titulo="Herramientas" volver={{ href: '/hogar/', etiqueta: 'Volver a Mi hogar' }} />
      }
    >
      <div className="ds ds-cuerpo">
        <Titulo nivel={2} tam={1.75} texto="Tu ==caja== de herramientas" />
        <Sub>Lo que hagas termina en el chat o en tu pedido.</Sub>
        <div className="ds-grilla">
          <Herramienta
            icono="regla"
            titulo="Medir"
            sub="Con la cámara"
            href="/herramientas/medir/"
          />
          <Herramienta
            icono="nivel"
            titulo="Nivel"
            sub="¿Está derecho?"
            href="/herramientas/nivel/"
          />
          <Herramienta
            icono="linterna"
            titulo="Linterna y lupa"
            sub="Para ver de cerca"
            href="/herramientas/linterna/"
          />
          <Herramienta
            icono="cubo"
            titulo="Escanear en 3D"
            sub="Un ambiente entero"
            href="/herramientas/escanear/"
            experimental
          />
          <Herramienta
            icono="cubo"
            titulo="Modelo 3D"
            sub="Tu casa y sus medidas"
            href="/herramientas/modelo/"
            experimental
          />
          <Herramienta
            icono="ar"
            titulo="Ver en AR"
            sub="Un equipo propuesto"
            href="/herramientas/ar/"
            experimental
          />
        </div>
        <Nota icono="candado" tono="gris">
          Funcionan en tu celular. No se manda nada hasta que vos elegís a dónde.
        </Nota>
        <AvisoSeguridad />
      </div>
    </Pantalla>
  );
}
