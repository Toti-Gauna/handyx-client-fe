'use client';
// Marco del chat de HandIA (Fase 7, lienzo design/usuario · I-HandIA): la cabecera con volver, el nombre y el estado
// y el menú; la caja de escribir con dictado y el botón del modo voz; y la hoja de opciones. Estilos: handia.css.
import { type Ref, useState } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { Hoja } from '@/components/ui';
import { FilaEnlace, Nota } from '@/ui';

export function CabeceraHandia({
  sub,
  onMenu,
  refMenu,
}: {
  sub: string;
  onMenu: () => void;
  refMenu?: Ref<HTMLButtonElement>;
}) {
  return (
    <header className="hia7-cabecera">
      <Enlace href="/inicio/" className="hia7-redondo" aria-label="Volver al inicio">
        <Icono nombre="atras" />
      </Enlace>
      <span className="hia7-cabecera__textos">
        <h1>HandIA</h1>
        <small role="status">{sub}</small>
      </span>
      <button
        ref={refMenu}
        type="button"
        className="hia7-redondo"
        aria-label="Opciones de HandIA"
        aria-haspopup="dialog"
        onClick={onMenu}
      >
        <Icono nombre="menu" />
      </button>
    </header>
  );
}

/** Caja de escribir: el texto, el dictado (solo si el celular reconoce la voz por sí mismo) y voz o enviar. */
export function Escribir({
  texto,
  onTexto,
  onEnviar,
  placeholder,
  deshabilitado,
  dictado,
  onModoVoz,
  refVoz,
}: {
  texto: string;
  onTexto: (t: string) => void;
  onEnviar: () => void;
  placeholder: string;
  deshabilitado: boolean;
  /** null: este celular no reconoce la voz por sí mismo (no se ofrece dictar). */
  dictado: { escuchando: boolean; alternar: () => void } | null;
  onModoVoz: () => void;
  refVoz?: Ref<HTMLButtonElement>;
}) {
  const hayTexto = !!texto.trim();
  return (
    <form
      className="hia7-escribir"
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar();
      }}
    >
      <span className="hia7-escribir__campo">
        <label className="ds-solo-lector" htmlFor="handia-texto">
          Escribile a HandIA
        </label>
        <input
          id="handia-texto"
          placeholder={placeholder}
          autoComplete="off"
          maxLength={500}
          value={texto}
          disabled={deshabilitado}
          onChange={(e) => onTexto(e.target.value)}
        />
        {dictado ? (
          <button
            type="button"
            className="hia7-escribir__dictar"
            aria-label={dictado.escuchando ? 'Dejar de escuchar' : 'Dictarle a HandIA'}
            aria-pressed={dictado.escuchando}
            disabled={deshabilitado}
            onClick={dictado.alternar}
          >
            <Icono nombre="microfono" />
          </button>
        ) : null}
      </span>
      {hayTexto ? (
        <button
          type="submit"
          className="hia7-escribir__principal"
          aria-label="Enviar a HandIA"
          disabled={deshabilitado}
        >
          <Icono nombre="enviar" />
        </button>
      ) : (
        <button
          ref={refVoz}
          type="button"
          className="hia7-escribir__principal"
          aria-label="Modo voz"
          disabled={deshabilitado}
          onClick={onModoVoz}
        >
          <Icono nombre="onda" />
        </button>
      )}
    </form>
  );
}

/** Opciones de HandIA: modo voz, empezar de nuevo, elegir el rubro a mano y cómo cuida los datos. */
export function MenuHandia({
  abierta,
  onCerrar,
  onModoVoz,
  onReiniciar,
  puedeReiniciar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  onModoVoz: () => void;
  onReiniciar: () => void;
  puedeReiniciar: boolean;
}) {
  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="HandIA">
      <div className="ds ds-pila">
        <FilaEnlace
          icono="onda"
          titulo="Modo voz"
          sub="Hablale y te responde en voz alta"
          onClick={onModoVoz}
        />
        {puedeReiniciar ? (
          <FilaEnlace
            icono="reintentar"
            titulo="Empezar de nuevo"
            sub="Borra esta conversación"
            onClick={onReiniciar}
          />
        ) : null}
        <FilaEnlace
          icono="lupa"
          titulo="Elegir el rubro yo"
          sub="Armá el pedido sin HandIA"
          href="/pedir/"
        />
        <Nota tono="gris" icono="candado">
          HandIA corre en tu celular, sin IA externa. Saca teléfonos, emails y documentos antes de
          leer lo que escribís, no ve fotos y no guarda tu voz.
        </Nota>
      </div>
    </Hoja>
  );
}

/** Estado local de la hoja de opciones (para que la página no crezca). */
export function useAbierta() {
  const [abierta, setAbierta] = useState(false);
  return { abierta, abrir: () => setAbierta(true), cerrar: () => setAbierta(false) };
}
