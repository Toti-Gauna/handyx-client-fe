'use client';

import Image from 'next/image';
import { Contador } from '@/components/Contador';
import { Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import type { NombreIcono } from '@/components/trazos';
import { Aviso } from '@/components/ui';
import { resumirFee, textoFee } from '@/domain/fee';
import { diaMes } from '@/domain/fechas';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };

/**
 * Tarifa y demo (rediseño 3.8): la tarifa de Handy de la demo cerrada, su vigencia con el contador y cómo se paga. Nunca
 * se presenta como descuento ni se anuncian tarifas que no están aprobadas.
 */
export default function Tarifa() {
  const { fee } = useSesion();
  const r = resumirFee(fee);
  const v = fee?.vigente;
  return (
    <Pantalla arriba={<Barra titulo="Tarifa y demo" volver={VOLVER} />} clase="du-tarifa-hx">
      <div className="du-cuerpo">
        {r.tipo === 'sin_dato' || !v ? (
          <Aviso tipo="alerta">No pudimos cargar las condiciones. Probá de nuevo en un rato.</Aviso>
        ) : (
          <>
            {r.cuenta.terminada ? (
              <Aviso tipo="info" titulo="La demo terminó" rol="status">
                Todavía no hay una tarifa aprobada. No se aplica ninguna hasta que esté aprobada y
                te la avisemos antes.
              </Aviso>
            ) : (
              <section
                className="hd-tarjeta hd-tarjeta--amarillo du-tarifa-hx__hero"
                aria-labelledby="tarifa-t"
                {...entra(1, 'pop')}
              >
                <Image
                  className="hd-handy du-tarifa-hx__handy"
                  src="/img/handy-lamparita.webp"
                  alt=""
                  width={202}
                  height={346}
                />
                <div>
                  <h2 id="tarifa-t" className="du-tarifa-hx__titulo">
                    Tarifa de Handy: <strong>{r.porcentajeUsuario}</strong> hasta el {r.hasta}
                  </h2>
                  <p>{textoFee(r)}</p>
                  <p className="du-tarifa-hx__falta">
                    Faltan{' '}
                    <strong>
                      <Contador hasta={v.vigenteHasta ?? ''} />
                    </strong>
                  </p>
                </div>
              </section>
            )}
            <dl className="hd-tarjeta hd-tarjeta--gris du-datos-hx__lista" {...entra(2)}>
              {(
                [
                  ['Alcance', 'Demo cerrada (Mar del Plata)'],
                  ['Tarifa para vos', r.porcentajeUsuario],
                  ['Tarifa para el especialista', r.porcentajeEspecialista],
                  ['Vigente desde', diaMes(v.vigenteDesde)],
                  ['Hasta', r.hasta],
                  ['Versión', v.version],
                  [
                    'Tu aceptación',
                    fee.aceptada ? `Aceptada el ${diaMes(fee.aceptada.aceptadaEn)}` : 'Pendiente',
                  ],
                ] as const
              ).map(([dt, dd]) => (
                <div key={dt} className="hd-dato">
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
            <section className="du-bloque" aria-labelledby="como-t" {...entra(3)}>
              <h2 id="como-t" className="hd-sobre du-sobre">
                Cómo se paga
              </h2>
              <ul className="du-puntos-hx">
                {(
                  [
                    [
                      'etiqueta',
                      'El precio lo pone el especialista y se acuerda con una propuesta que las dos partes aceptan.',
                    ],
                    [
                      'billetera',
                      'Pagás directo al especialista, por Mercado Pago o en efectivo. Handy no recibe ni reparte ese dinero.',
                    ],
                    [
                      'info',
                      'Tarifa de Handy 0 % no significa trabajo gratis: el servicio se paga entero.',
                    ],
                    [
                      'calendario',
                      `Después del ${r.hasta} no se aplica ninguna tarifa que no esté aprobada y avisada antes.`,
                    ],
                  ] as const satisfies readonly (readonly [NombreIcono, string])[]
                ).map(([icono, texto]) => (
                  <li key={texto} className="du-nota">
                    <Icono nombre={icono} />
                    <span>{texto}</span>
                  </li>
                ))}
              </ul>
              <p className="du-nota">
                <Icono nombre="pregunta" />
                <span>
                  ¿Dudas? Mirá{' '}
                  <Enlace href={ruta('/ayuda/respuesta/', { p: 'tarifa' })}>
                    cuánto cobra Handy
                  </Enlace>{' '}
                  en el centro de ayuda.
                </span>
              </p>
            </section>
          </>
        )}
      </div>
    </Pantalla>
  );
}
