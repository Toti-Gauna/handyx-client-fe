'use client';

import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';
import { BotonHx } from '@/components/acceso';
import { Contador } from '@/components/Contador';
import { AvatarHx, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import {
  instalar,
  puedeInstalar,
  puedeInstalarServidor,
  suscribirInstalacion,
} from '@/components/red';
import { useSesion } from '@/components/SesionProvider';
import { TituloDocumento } from '@/components/TituloDocumento';
import type { NombreIcono } from '@/components/trazos';
import { resumirFee } from '@/domain/fee';

interface Fila {
  readonly href: string;
  readonly icono: NombreIcono;
  readonly texto: string;
}
const CUENTA: readonly Fila[] = [
  { href: '/cuenta/datos/', icono: 'usuario', texto: 'Datos personales' },
  { href: '/cuenta/direcciones/', icono: 'casa', texto: 'Direcciones' },
  { href: '/cuenta/pagos/', icono: 'billetera', texto: 'Pagos registrados' },
  { href: '/agenda/', icono: 'calendario', texto: 'Tu agenda' },
  { href: '/reclamos/', icono: 'alerta', texto: 'Reclamos' },
];
const CONFIGURACION: readonly Fila[] = [
  { href: '/cuenta/notificaciones/', icono: 'campana', texto: 'Avisos del celular' },
  { href: '/cuenta/tarifa/', icono: 'etiqueta', texto: 'Tarifa y demo' },
  { href: '/cuenta/privacidad/', icono: 'escudo', texto: 'Privacidad' },
  { href: '/ayuda/', icono: 'pregunta', texto: 'Centro de ayuda' },
  { href: '/cuenta/baja/', icono: 'tacho', texto: 'Eliminar cuenta' },
];

function Filas({ filas }: { filas: readonly Fila[] }) {
  return (
    <ul className="hd-tarjeta hd-tarjeta--gris hd-tarjeta--compacta hd-lista">
      {filas.map((f) => (
        <li key={f.href}>
          <Enlace href={f.href} className="hd-fila">
            <span className="hd-fila__ico" aria-hidden="true">
              <Icono nombre={f.icono} />
            </span>
            <span className="hd-fila__texto">
              <strong>{f.texto}</strong>
            </span>
            <span className="hd-fila__fin">
              <Icono nombre="derecha" />
            </span>
          </Enlace>
        </li>
      ))}
    </ul>
  );
}

/**
 * Cuenta (rediseño 3.8, como u-cuenta de la demo): quién sos, la tarifa de la demo con su contador (tercer lugar donde
 * se avisa), instalar la app y los accesos. Sin foto de perfil (el contrato no la tiene) y sin "modo especialista"
 * hasta que exista su app (Fase 4.6).
 */
export default function Cuenta() {
  const { sesion, fee, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const resumen = resumirFee(fee);
  const instalable = useSyncExternalStore(
    suscribirInstalacion,
    puedeInstalar,
    puedeInstalarServidor,
  );
  const p = sesion.perfil;
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ');
  const zona = p.ubicacion
    ? [p.ubicacion.barrio, p.ubicacion.ciudad].filter(Boolean).join(', ')
    : '';

  return (
    <Pantalla clase="du-cuenta-hx">
      <TituloDocumento texto="Cuenta" />
      <div className="du-cuerpo du-cuenta">
        <div className="du-yo" {...entra(0)}>
          <span className="du-yo__avatar">
            <AvatarHx nombre={nombre || 'Handyx'} tamano="grande" />
          </span>
          <span className="du-yo__textos">
            <h1 className="hd-titulo hd-titulo--chico">{nombre || 'Tu cuenta'}</h1>
            {zona ? (
              <span className="hd-chip hd-chip--tinte hd-chip--mini">
                <Icono nombre="pin" />
                {zona}
              </span>
            ) : null}
          </span>
        </div>

        {sesion.cuenta.estado === 'perfil_incompleto' ? (
          <Enlace
            href="/perfil/"
            className="hd-tarjeta hd-tarjeta--amarillo du-aviso-cuenta"
            {...entra(1)}
          >
            <Icono nombre="alerta" />
            <span>
              <strong>Falta completar tu perfil</strong>
              <small>Lo necesitás para pedir servicios. Completalo ahora.</small>
            </span>
          </Enlace>
        ) : null}
        {sesion.cuenta.estado === 'baja_solicitada' ? (
          <Enlace
            href="/cuenta/baja/"
            className="hd-tarjeta hd-tarjeta--amarillo du-aviso-cuenta"
            {...entra(1)}
          >
            <Icono nombre="info" />
            <span>
              <strong>Pediste eliminar tu cuenta</strong>
              <small>Ver el estado de la solicitud.</small>
            </span>
          </Enlace>
        ) : null}

        {/* Contador del fee 0 % (3 de 3 lugares) */}
        <section className="du-tarjeta du-tarjeta-hx" aria-labelledby="fee-t" {...entra(1)}>
          <div className="du-tarjeta__cuerpo">
            <span className="du-tarjeta__ico du-tarjeta__ico--azul" aria-hidden="true">
              <Icono nombre="etiqueta" />
            </span>
            <span className="du-tarjeta__datos">
              {resumen.tipo === 'demo' ? (
                resumen.cuenta.terminada ? (
                  <>
                    <strong id="fee-t">Tarifa de Handy</strong>
                    <small>
                      La demo terminó. Todavía no hay una tarifa aprobada: te avisamos antes de
                      aplicar cualquier cambio.
                    </small>
                  </>
                ) : (
                  <>
                    <strong id="fee-t">
                      Tarifa de Handy: {resumen.porcentajeUsuario} hasta el {resumen.hasta}
                    </strong>
                    <small>
                      Faltan <Contador hasta={fee?.vigente?.vigenteHasta ?? ''} />. No es un
                      descuento: el servicio del especialista se paga entero.
                    </small>
                  </>
                )
              ) : (
                <>
                  <strong id="fee-t">Tarifa de Handy</strong>
                  <small>No pudimos cargar la tarifa.</small>
                </>
              )}
            </span>
          </div>
          <Enlace className="du-tarjeta__franja tarjeta--enlace" href="/cuenta/tarifa/">
            Ver condiciones
            <Icono nombre="derecha" />
          </Enlace>
        </section>

        {instalable ? (
          <button
            type="button"
            className="hd-tarjeta hd-tarjeta--amarillo du-modo"
            onClick={() => void instalar()}
            {...entra(2)}
          >
            <Image
              className="hd-handy du-modo__handy"
              src="/img/handy-llave.webp"
              alt=""
              width={581}
              height={547}
            />
            <span className="du-modo__textos">
              <strong>Instalá Handyx en este celular</strong>
              <small>Queda en la pantalla de inicio y se abre como una app.</small>
            </span>
            <span className="du-modo__flecha" aria-hidden="true">
              <Icono nombre="abajo" />
            </span>
          </button>
        ) : null}

        <section className="du-bloque" aria-labelledby="cuenta-t" {...entra(2)}>
          <h2 id="cuenta-t" className="hd-sobre du-sobre">
            Cuenta
          </h2>
          <Filas filas={CUENTA} />
        </section>
        <section className="du-bloque" aria-labelledby="config-t" {...entra(3)}>
          <h2 id="config-t" className="hd-sobre du-sobre">
            Configuración
          </h2>
          <Filas filas={CONFIGURACION} />
        </section>

        <div className="du-cuenta-hx__salir" {...entra(4)}>
          <BotonHx
            variante="fantasma"
            className="du-rojo"
            icono="salir"
            cargando={saliendo}
            onClick={async () => {
              setSaliendo(true);
              try {
                await cerrarSesion();
              } finally {
                setSaliendo(false);
              }
            }}
          >
            Cerrar sesión
          </BotonHx>
          <p className="du-nota du-nota--centro">
            <span>Cerrar sesión no elimina tu cuenta.</span>
          </p>
        </div>
      </div>
    </Pantalla>
  );
}
