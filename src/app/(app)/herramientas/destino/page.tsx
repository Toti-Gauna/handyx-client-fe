'use client';

import { useState } from 'react';
import { Barra, Pantalla } from '@/components/hx';
import { useIr } from '@/components/nav';
import { DESTINOS, type Destino, leerItem } from '@/domain/herramientas';
import { AccionesFijas, Boton, Nota, Opcion, Titulo } from '@/ui';

/** ¿A dónde lo mandás?: al chat o a un pedido. Solo navega; lo hecho queda en memoria, sin guardarse. */
export default function DestinoPantalla() {
  const ir = useIr();
  const [elegido, setElegido] = useState<Destino['id']>('chat');
  const [item] = useState(leerItem);
  const destino = DESTINOS.find((d) => d.id === elegido)!;

  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Mandar"
          volver={{ href: '/herramientas/', etiqueta: 'Volver a las herramientas' }}
          sub={item ? `${item.titulo} · ${item.detalle}` : undefined}
        />
      }
      pie={
        item ? (
          <AccionesFijas nota="Se manda sin ubicación ni datos del teléfono.">
            <Boton icono="enviar" onClick={() => ir(destino.href)}>
              Mandar
            </Boton>
          </AccionesFijas>
        ) : (
          <Boton href="/herramientas/">Volver a las herramientas</Boton>
        )
      }
    >
      <div className="ds ds-cuerpo">
        <Titulo nivel={2} tam={1.75} texto="¿A dónde lo ==mandás==?" />
        {item ? (
          <div role="radiogroup" aria-label="Destino" className="ds-pila">
            {DESTINOS.map((d) => (
              <Opcion
                key={d.id}
                icono={d.icono}
                titulo={d.titulo}
                sub={d.sub}
                elegida={d.id === elegido}
                onElegir={() => setElegido(d.id)}
              />
            ))}
          </div>
        ) : (
          <Nota icono="info" tono="gris" rol="status">
            Todavía no hay nada para mandar. Medí algo o usá el nivel y volvé acá.
          </Nota>
        )}
        <Nota icono="escudo" tono="gris">
          No se manda nada hasta que apretás «Mandar».
        </Nota>
      </div>
    </Pantalla>
  );
}
