'use client';

import { useSyncExternalStore } from 'react';
import { Enlace, ruta, useIr } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import { EstadoConsulta } from '@/components/ui';
import type { Notificacion, TIPOS_NOTIFICACION } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { useConsulta } from '@/data/hooks';
import { FilaEnlace, Nota, Texto, Titulo } from '@/ui';
import { BarraCentro, EscenaVacio, PantallaM } from '@/ui/mensajes';
import { estadoPush, suscribirPush, type EstadoPush } from '@/data/push';
import { cuando } from '@/domain/fechas';
import type { z } from 'zod';

type Aviso_ = z.output<typeof Notificacion>;

const TEXTO: Record<(typeof TIPOS_NOTIFICACION)[number], string> = {
  propuesta_recibida: 'Te llegó una propuesta',
  propuesta_vencida: 'Una propuesta venció',
  propuesta_aceptada: 'Se acordó un trabajo',
  propuesta_rechazada: 'Una propuesta fue rechazada',
  busqueda_sin_respuesta: 'Tu búsqueda no tuvo respuesta',
  busqueda_manual_iniciada: 'El equipo empezó la búsqueda manual',
  mensaje_nuevo: 'Tenés un mensaje nuevo',
  trabajo_en_camino: 'El especialista va en camino',
  trabajo_llego: 'El especialista llegó',
  trabajo_terminado: 'Hay novedades del trabajo',
  trabajo_cancelado: 'El especialista canceló el trabajo',
  pago_verificado: 'Se verificó un pago',
  reclamo_actualizado: 'Tu reclamo tuvo novedades',
  baja_actualizada: 'Novedades de la eliminación de tu cuenta',
};

const ICONO: Partial<Record<(typeof TIPOS_NOTIFICACION)[number], NombreIcono>> = {
  propuesta_recibida: 'etiqueta',
  propuesta_vencida: 'reloj',
  propuesta_aceptada: 'check',
  propuesta_rechazada: 'cerrar',
  busqueda_sin_respuesta: 'lupa',
  busqueda_manual_iniciada: 'lupa',
  mensaje_nuevo: 'chat',
  trabajo_en_camino: 'caminar',
  trabajo_llego: 'pin',
  trabajo_terminado: 'checkCirculo',
  trabajo_cancelado: 'cerrar',
  pago_verificado: 'billetera',
  reclamo_actualizado: 'escudo',
  baja_actualizada: 'usuario',
};

function destino(n: Aviso_): string {
  switch (n.entidad.tipo) {
    case 'propuesta':
      return ruta('/propuestas/detalle/', { id: n.entidad.id });
    case 'pedido':
      return ruta('/pedidos/detalle/', { id: n.entidad.id });
    case 'trabajo':
      return ruta('/trabajos/detalle/', { id: n.entidad.id });
    case 'conversacion':
      return ruta('/chats/conversacion/', { id: n.entidad.id });
    case 'reclamo':
      return ruta('/reclamos/detalle/', { id: n.entidad.id });
    case 'pago':
      return ruta('/pagos/retorno/', { id: n.entidad.id });
    case 'cuenta':
      return '/cuenta/baja/';
  }
}

export default function Avisos() {
  const lista = useConsulta('notificaciones', { consulta: { limite: 50 } }, { cada: 8_000 });
  const ir = useIr();
  const push = useSyncExternalStore<EstadoPush | null>(suscribirPush, estadoPush, () => null);

  async function abrir(n: Aviso_) {
    if (!n.leidaEn) {
      try {
        await cliente.llamar('notificacionLeida', { parametros: { id: n.id } });
      } catch {
        /* si no se pudo marcar, igual se abre */
      }
      lista.recargar();
    }
    ir(destino(n));
  }

  return (
    <PantallaM
      arriba={
        <BarraCentro
          titulo="Tus avisos"
          volver={{ href: '/inicio/', etiqueta: 'Volver al inicio' }}
        />
      }
    >
      <div className="ds-cuerpo ds-cuerpo--raiz">
        {push === 'pendiente' ? (
          <Nota icono="campana">
            ¿Querés que te avisemos en el celular?{' '}
            <Enlace href="/cuenta/notificaciones/">Activar avisos del celular</Enlace>
          </Nota>
        ) : push === 'denegado' || push === 'ios_sin_instalar' || push === 'no_soportado' ? (
          <Nota icono="info" tono="gris">
            Los avisos del celular no están activos. No pasa nada: los ves acá cuando abrís la app.{' '}
            <Enlace href="/cuenta/notificaciones/">Más info</Enlace>
          </Nota>
        ) : null}
        <EstadoConsulta consulta={lista}>
          {(d) =>
            d.items.length === 0 ? (
              <div className="ds-m-vacio">
                <EscenaVacio />
                <Titulo nivel={2} tam={1.375} texto="No tenés avisos" />
                <Texto>
                  Acá aparecen las propuestas, los mensajes y las novedades de tus trabajos.
                </Texto>
              </div>
            ) : (
              <ul
                className="ds-pila"
                style={{ listStyle: 'none', margin: 0, padding: 0, ['--ds-gap' as string]: 0 }}
              >
                {d.items.map((n) => (
                  <li key={n.id}>
                    <FilaEnlace
                      icono={ICONO[n.tipo] ?? 'campana'}
                      tono={n.leidaEn ? 'gris' : 'tinte'}
                      titulo={TEXTO[n.tipo]}
                      sub={`${cuando(n.creadaEn)}${n.leidaEn ? '' : ' · nuevo'}`}
                      onClick={() => void abrir(n)}
                    />
                  </li>
                ))}
              </ul>
            )
          }
        </EstadoConsulta>
      </div>
    </PantallaM>
  );
}
