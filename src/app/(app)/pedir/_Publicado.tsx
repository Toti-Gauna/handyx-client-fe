'use client';
// Pedir · P-Publicado: la escena arma el pedido (si se permite el movimiento) y se cuenta qué sigue, sin tiempos.
import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { fechaLarga } from '@/domain/fechas';
import { Boton, FilaEnlace, Nota, Sub, Tarjeta, Titulo } from '@/ui';
import { EscenaPublicadoArma, QueSigue } from '@/ui/pedir';
import type { Pedido } from './_pedido';

export function PasoPublicado({ f }: { f: Pedido }) {
  if (!f.rubro || !f.pedidoId) return null;
  const cuando =
    f.tipo === 'urgente'
      ? 'Lo antes posible'
      : f.fecha
        ? `${fechaLarga(f.fecha)}${f.franja ? ` · ${f.franja.texto}` : ''}`
        : 'Con el día que elegiste';
  return (
    <Pantalla
      pie={
        <div className="ds ds-pila">
          <Boton href={ruta('/pedidos/detalle/', { id: f.pedidoId })}>Ver mi pedido</Boton>
          <Boton href="/inicio/" variante="contorno">
            Ir al inicio
          </Boton>
        </div>
      }
    >
      <TituloDocumento texto="Pedido publicado" />
      <EscenaPublicadoArma />
      <div className="ds ds-cuerpo">
        <div className="ds-pila">
          <Titulo tam={2.125} texto="¡Pedido ==publicado==!" />
          <Sub>
            Se lo mostramos a especialistas de {RUBROS_INFO[f.rubro].nombre} que trabajan en tu zona.
          </Sub>
        </div>
        <Tarjeta>
          <QueSigue
            pasos={[
              { icono: 'check', titulo: 'Publicado', sub: cuando, tono: 'azul' },
              { icono: 'billete', titulo: 'Te llegan propuestas', sub: 'Con precio, fecha y perfil' },
              {
                icono: 'estrella',
                titulo: 'Elegís vos',
                sub: 'Comparás y aceptás la que te sirva',
                tono: 'amarillo',
              },
            ]}
          />
        </Tarjeta>
        {f.deMiHogar ? (
          <FilaEnlace
            icono="hogar"
            titulo="Sumar datos de Mi hogar"
            sub="Elegís qué ven los especialistas de este pedido"
            href={ruta('/hogar/compartir/', { pedido: f.pedidoId })}
          />
        ) : null}
        <Nota icono="campana">
          Te avisamos cuando llegue cada propuesta. Los especialistas responden cuando pueden: no hay
          un tiempo fijo.
        </Nota>
      </div>
    </Pantalla>
  );
}
