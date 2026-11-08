'use client';

import { useSearchParams } from 'next/navigation';
import { Boton, Nota, Sub, Titulo } from '@/ui';
import { PantallaPedir } from '@/ui/pedir';
import { usePedido } from './_pedido';
import { PasoDireccion, PasoProgramar } from './_PasosDatos';
import { PasoCuando, PasoFotos, PasoQue, PasoRubro } from './_PasosInicio';
import { PasoPublicado } from './_Publicado';
import { PasoRevisar } from './_Revisar';

/**
 * Pedir en tres toques (Fase 7, lienzo P-*): rubro › ¿qué pasa? › revisar y publicar › ¡pedido publicado!. Cuándo
 * (por defecto «lo antes posible»), día y franja, dirección (la guardada) y fotos se cambian desde «Revisar». Lo que se
 * elige es una solicitud: no hay turno ni precio hasta que la persona acepta una propuesta. Nunca se promete cuánto
 * tarda.
 */
export default function Pedir() {
  const f = usePedido();
  const desdeInicio = Boolean(useSearchParams().get('rubro'));
  const estado = f.sesion.cuenta.estado;

  if (estado !== 'activa' && f.paso !== 'publicado')
    return (
      <PantallaPedir
        titulo="Pedir un arreglo"
        volver={{ href: '/inicio/', etiqueta: 'Volver al inicio' }}
        pie={
          estado === 'perfil_incompleto' ? <Boton href="/perfil/">Completar mi perfil</Boton> : null
        }
      >
        <Titulo
          nivel={2}
          texto={
            estado === 'baja_solicitada'
              ? 'Pediste eliminar tu ==cuenta=='
              : 'Completá tu ==perfil=='
          }
        />
        <Sub>
          {estado === 'baja_solicitada'
            ? 'Mientras la baja está en curso no se pueden crear pedidos.'
            : 'Para pedir necesitamos tus datos y que aceptes los textos.'}
        </Sub>
        <Nota icono="info" tono="gris">
          Es un minuto: después volvés acá y pedís en tres toques.
        </Nota>
      </PantallaPedir>
    );

  switch (f.paso) {
    case 'rubro':
      return <PasoRubro f={f} />;
    case 'que':
      return <PasoQue f={f} desdeInicio={desdeInicio} />;
    case 'fotos':
      return <PasoFotos f={f} />;
    case 'cuando':
      return <PasoCuando f={f} />;
    case 'programar':
      return <PasoProgramar f={f} />;
    case 'direccion':
      return <PasoDireccion f={f} />;
    case 'revisar':
      return <PasoRevisar f={f} />;
    case 'publicado':
      return <PasoPublicado f={f} />;
  }
}
