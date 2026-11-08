'use client';
// Piezas del Inicio y de HandIA (fila I del lienzo design/usuario): la tarjeta azul «Contale a HandIA», los mosaicos
// de «Quiero…», el chip de la dirección, el avatar con sello y el avatar de HandIA. Estilos en src/styles/ds-inicio.css.
import Image from 'next/image';
import type { ReactNode } from 'react';
import '@/styles/ds-inicio.css';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import type { Etiqueta } from '@/domain/etiquetas';
import { Avatar, Chip, type TonoChip } from './atomos';

const LAMPARITA = '/img/handy-lamparita.webp';

/** Tarjeta azul de la demo: la lamparita encendida, «Contale a HandIA» y la flecha amarilla. */
export function TarjetaHandia({ href = '/handia/' }: { href?: string }) {
  return (
    <Enlace href={href} className="dsi-handia">
      <span className="dsi-handia__luz" aria-hidden="true">
        <i />
        <Image src={LAMPARITA} alt="" width={68} height={116} />
      </span>
      <span className="dsi-handia__textos">
        <span className="dsi-handia__antes">¿No sabés qué rubro es?</span>
        <span className="dsi-handia__titulo">Contale a HandIA</span>
        <span className="dsi-handia__sub">
          <Icono nombre="chispas" />
          Te ayuda a armar el pedido
        </span>
      </span>
      <span className="dsi-handia__flecha" aria-hidden="true">
        <Icono nombre="derecha" />
      </span>
    </Enlace>
  );
}

/** Mosaico de «Quiero…»: tarea concreta con su ícono en un cuadrito blanco. */
export function MosaicoTarea({
  icono,
  texto,
  href,
}: {
  icono: NombreIcono;
  texto: string;
  href: string;
}) {
  return (
    <Enlace href={href} className="dsi-tarea">
      <span className="dsi-tarea__ic" aria-hidden="true">
        <Icono nombre={icono} />
      </span>
      <span>{texto}</span>
    </Enlace>
  );
}

/** Chip de la dirección (se toca para verla o cambiarla). */
export function ChipDireccion({
  texto,
  onTocar,
  etiqueta,
}: {
  texto: string;
  onTocar: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      className="dsi-direccion"
      aria-label={etiqueta}
      aria-haspopup="dialog"
      onClick={onTocar}
    >
      <Icono nombre="pin" />
      <span>{texto}</span>
      <Icono nombre="abajo" />
    </button>
  );
}

/** Avatar con el sello verde: solo cuando hay una verificación real del especialista. */
export function AvatarSello({
  nombre,
  verificado,
  tam = 3,
}: {
  nombre: string;
  verificado: boolean;
  tam?: number;
}) {
  return (
    <span className="dsi-avatar-sello">
      <Avatar nombre={nombre} tam={tam} tono={0} />
      {verificado ? (
        <span className="dsi-avatar-sello__marca" role="img" aria-label="Con verificación">
          <Icono nombre="check" />
        </span>
      ) : null}
    </span>
  );
}

const TONO_CHIP: Record<Etiqueta['tono'], TonoChip> = {
  azul: 'azul',
  ok: 'exito',
  alerta: 'amarillo',
  error: 'noche',
  gris: 'gris',
};

/** Estado del dominio como chip del sistema (siempre con texto). */
export function ChipEtiqueta({ e }: { e: Etiqueta }) {
  const icono = e.icono ?? (e.tono === 'ok' ? 'check' : null);
  return (
    <Chip tono={TONO_CHIP[e.tono]} {...(icono ? { icono } : {})}>
      <span className="ds-solo-lector">Estado: </span>
      {e.texto}
    </Chip>
  );
}

/** Avatar cuadrado de HandIA: la lamparita con su luz. Decorativo. */
export function AvatarHandia({ tam = 'chico' }: { tam?: 'chico' | 'grande' }) {
  return (
    <span className={`dsi-ia-avatar dsi-ia-avatar--${tam}`} aria-hidden="true">
      <i />
      <Image src={LAMPARITA} alt="" width={68} height={116} />
    </span>
  );
}

/** Fila del ticket: ícono en mosaico, el dato y a la derecha la acción. */
export function FilaTicket({
  icono,
  dato,
  accion,
}: {
  icono: NombreIcono;
  dato: ReactNode;
  accion: string;
}) {
  return (
    <span className="dsi-fila-ticket">
      <span className="dsi-fila-ticket__ic" aria-hidden="true">
        <Icono nombre={icono} />
      </span>
      <strong className="ds-crece">{dato}</strong>
      <span className="dsi-fila-ticket__accion">
        {accion}
        <Icono nombre="derecha" />
      </span>
    </span>
  );
}
