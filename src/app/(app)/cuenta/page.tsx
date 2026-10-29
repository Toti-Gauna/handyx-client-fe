'use client';

import { Contador } from '@/components/Contador';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton } from '@/components/ui';
import type { NombreIcono } from '@/components/trazos';
import { useState } from 'react';
import { resumirFee } from '@/domain/fee';

const MENU: readonly { href: string; icono: NombreIcono; texto: string }[] = [
  { href: '/cuenta/datos/', icono: 'usuario', texto: 'Mis datos' },
  { href: '/cuenta/tarifa/', icono: 'etiqueta', texto: 'Tarifa y demo' },
  { href: '/cuenta/notificaciones/', icono: 'campana', texto: 'Avisos del celular' },
  { href: '/cuenta/privacidad/', icono: 'escudo', texto: 'Privacidad' },
  { href: '/reclamos/', icono: 'alerta', texto: 'Reclamos' },
  { href: '/ayuda/', icono: 'pregunta', texto: 'Ayuda' },
  { href: '/cuenta/baja/', icono: 'tacho', texto: 'Eliminar cuenta' },
];

export default function Cuenta() {
  const { sesion, fee, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const resumen = resumirFee(fee);
  const nombre = [sesion.perfil.nombre, sesion.perfil.apellido].filter(Boolean).join(' ');
  return (
    <>
      <Titulo texto="Tu ==cuenta==" />
      <p style={{ margin: '0 0 12px' }}>
        <strong>{nombre || 'Tu perfil está incompleto'}</strong>
      </p>
      {sesion.cuenta.estado === 'perfil_incompleto' ? (
        <Aviso tipo="alerta" titulo="Falta completar tu perfil">
          <p>Lo necesitás para pedir servicios.</p>
          <Enlace href="/perfil/" className="boton boton--chico">
            Completar ahora
          </Enlace>
        </Aviso>
      ) : null}
      {sesion.cuenta.estado === 'baja_solicitada' ? (
        <Aviso tipo="info" titulo="Pediste eliminar tu cuenta">
          <Enlace className="enlace-tarjeta" href="/cuenta/baja/">
            Ver el estado
          </Enlace>
        </Aviso>
      ) : null}

      {/* Contador del fee 0 % (3 de 3 lugares) */}
      <section className="tarjeta" aria-labelledby="fee-t">
        <div className="tarjeta__cuerpo">
          <h2 id="fee-t" className="tarjeta__titulo">
            Tarifa de Handy
          </h2>
          {resumen.tipo === 'demo' ? (
            resumen.cuenta.terminada ? (
              <p style={{ margin: 0 }}>
                La demo terminó. Todavía no hay una tarifa aprobada: te avisamos antes de aplicar
                cualquier cambio.
              </p>
            ) : (
              <>
                <p className="importe" style={{ margin: '4px 0' }}>
                  {resumen.porcentajeUsuario}
                </p>
                <p style={{ margin: 0 }}>
                  hasta el {resumen.hasta} · faltan{' '}
                  <strong>
                    <Contador hasta={fee?.vigente?.vigenteHasta ?? ''} />
                  </strong>
                </p>
                <p className="texto-suave" style={{ margin: '6px 0 0' }}>
                  No es un descuento: el servicio del especialista se paga entero.
                </p>
              </>
            )
          ) : (
            <p style={{ margin: 0 }}>No pudimos cargar la tarifa.</p>
          )}
        </div>
        <Enlace className="tarjeta__franja" href="/cuenta/tarifa/">
          Ver condiciones
        </Enlace>
      </section>

      <ul className="lista-tarjetas">
        {MENU.map((m) => (
          <li key={m.href}>
            <Enlace href={m.href} className="tarjeta tarjeta--enlace">
              <span className="tarjeta__cuerpo tarjeta__fila">
                <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Icono nombre={m.icono} /> {m.texto}
                </span>
                <Icono nombre="derecha" />
              </span>
            </Enlace>
          </li>
        ))}
      </ul>
      <div className="acciones">
        <Boton
          variante="contorno"
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
        </Boton>
      </div>
      <p className="texto-suave" style={{ textAlign: 'center' }}>
        Cerrar sesión no elimina tu cuenta.
      </p>
    </>
  );
}
