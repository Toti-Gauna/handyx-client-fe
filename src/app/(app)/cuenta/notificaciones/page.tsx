'use client';

import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';
import { BotonHx } from '@/components/acceso';
import { Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { Aviso, EstadoConsulta } from '@/components/ui';
import { ErrorCliente } from '@/data/cliente';
import { useConsulta, useEnvio } from '@/data/hooks';
import { activarPush, estadoPush, suscribirPush, type EstadoPush } from '@/data/push';

const TEXTO: Record<
  Exclude<EstadoPush, 'pendiente' | 'concedido'>,
  { titulo: string; texto: string }
> = {
  no_soportado: {
    titulo: 'Tu navegador no permite avisos del celular',
    texto: 'No pasa nada: los avisos aparecen dentro de la app, en la campana.',
  },
  ios_sin_instalar: {
    titulo: 'En iPhone, primero instalá Handyx',
    texto:
      'Los avisos del celular funcionan cuando agregás Handyx a la pantalla de inicio. Mientras tanto, los ves dentro de la app.',
  },
  denegado: {
    titulo: 'Los avisos están bloqueados',
    texto:
      'Los bloqueaste en el navegador. Podés activarlos desde los ajustes del sitio. La app sigue funcionando: los avisos aparecen en la campana.',
  },
};

export default function AvisosCelular() {
  const preferencias = useConsulta('preferencias', {});
  const { enviar, pendiente } = useEnvio();
  const estado = useSyncExternalStore<EstadoPush | null>(suscribirPush, estadoPush, () => null);
  const [fallo, setFallo] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  async function activar() {
    setFallo(null);
    setTrabajando(true);
    try {
      await activarPush();
      preferencias.recargar();
    } catch (e) {
      setFallo(e instanceof ErrorCliente ? e.mensaje : 'No pudimos activar los avisos.');
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Avisos del celular"
          volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
        />
      }
      clase="du-avisos-cel-hx"
    >
      <div className="du-cuerpo">
        <div className="du-avisos-cel-hx__hero" {...entra(1, 'pop')}>
          <Image
            className="hd-handy"
            src="/img/handy-engranaje.webp"
            alt=""
            width={338}
            height={339}
          />
          <p>
            Te avisamos cuando llega una propuesta, cuando el especialista está en camino o
            responde. Los avisos no llevan datos personales.
          </p>
        </div>
        <EstadoConsulta consulta={preferencias}>
          {(pref) => (
            <>
              {estado && estado !== 'pendiente' && estado !== 'concedido' ? (
                <Aviso tipo="info" titulo={TEXTO[estado].titulo}>
                  {TEXTO[estado].texto}
                </Aviso>
              ) : null}
              {fallo ? <Aviso tipo="alerta">{fallo}</Aviso> : null}
              {estado === 'pendiente' ? (
                <BotonHx cargando={trabajando} icono="campana" onClick={activar}>
                  Activar avisos del celular
                </BotonHx>
              ) : null}
              {estado === 'concedido' ? (
                <label className="hd-tarjeta hd-tarjeta--gris du-interruptor-hx">
                  <span className="du-interruptor-hx__texto">
                    <strong>Recibir avisos en este celular</strong>
                    <small>{pref.push ? 'Activados' : 'Desactivados'}</small>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    className="du-interruptor-hx__control"
                    checked={pref.push}
                    disabled={pendiente}
                    onChange={async (e) => {
                      if (e.target.checked) await activar();
                      else {
                        await enviar('pushBaja', {});
                        preferencias.recargar();
                      }
                    }}
                  />
                </label>
              ) : null}
            </>
          )}
        </EstadoConsulta>
        <p className="du-nota" {...entra(2)}>
          <Icono nombre="campana" />
          <span>
            Los avisos dentro de la app (<Enlace href="/notificaciones/">la campana</Enlace>) no
            dependen de este permiso.
          </span>
        </p>
      </div>
    </Pantalla>
  );
}
