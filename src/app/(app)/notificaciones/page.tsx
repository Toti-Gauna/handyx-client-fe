'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Barra, Pantalla, entra } from '@/components/hx';
import type { NombreIcono } from '@/components/trazos';
import { Aviso, EstadoConsulta } from '@/components/ui';
import type { Notificacion, TIPOS_NOTIFICACION } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { useConsulta } from '@/data/hooks';
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
    <Pantalla
      arriba={
        <Barra
          titulo="Tus ==avisos=="
          volver={{ href: '/inicio/', etiqueta: 'Volver al inicio' }}
        />
      }
      clase="du-avisos-hx"
    >
      <div className="du-cuerpo">
        {push === 'pendiente' ? (
          <Aviso tipo="info" titulo="¿Querés que te avisemos en el celular?">
            <Enlace className="enlace-tarjeta" href="/cuenta/notificaciones/">
              Activar avisos del celular
            </Enlace>
          </Aviso>
        ) : push === 'denegado' || push === 'ios_sin_instalar' || push === 'no_soportado' ? (
          <Aviso tipo="info">
            Los avisos del celular no están activos. No pasa nada: los ves acá cuando abrís la app.{' '}
            <Enlace className="enlace-tarjeta" href="/cuenta/notificaciones/">
              Más info
            </Enlace>
          </Aviso>
        ) : null}
        <EstadoConsulta consulta={lista}>
          {(d) =>
            d.items.length === 0 ? (
              <div className="du-vacio-hx">
                <Image
                  className="hd-handy"
                  src="/img/handy-lamparita.webp"
                  alt=""
                  width={202}
                  height={346}
                />
                <p className="hd-titulo hd-titulo--chico">No tenés avisos</p>
                <p className="du-vacio-hx__texto">
                  Acá aparecen las propuestas, los mensajes y las novedades de tus trabajos.
                </p>
              </div>
            ) : (
              <ul className="du-avisos-hx__lista">
                {d.items.map((n, i) => (
                  <li key={n.id} {...entra(i + 1)}>
                    <button
                      type="button"
                      className={`du-aviso-card du-aviso-card--${n.leidaEn ? 'leido' : 'nuevo'}`}
                      onClick={() => void abrir(n)}
                    >
                      <span className="du-aviso-card__ico" aria-hidden="true">
                        <Icono nombre={ICONO[n.tipo] ?? 'campana'} />
                      </span>
                      <span className="du-aviso-card__texto">
                        <strong>{TEXTO[n.tipo]}</strong>
                        <small>
                          {cuando(n.creadaEn)}
                          {n.leidaEn ? '' : ' · nuevo'}
                        </small>
                      </span>
                      <Icono nombre="derecha" />
                    </button>
                  </li>
                ))}
              </ul>
            )
          }
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}
