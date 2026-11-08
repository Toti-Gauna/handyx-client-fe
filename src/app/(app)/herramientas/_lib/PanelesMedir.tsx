'use client';
import { type ChangeEvent } from 'react';
import { Icono } from '@/components/Icono';
import { REFERENCIAS, type Referencia } from '@/domain/herramientas';
import { Boton, Pastilla } from '@/ui';

/** Paso 1: qué objeto conocido hay al lado de lo que se mide. */
export function PanelReferencia({
  elegida,
  onElegir,
  otraCm,
  onOtraCm,
  valida,
  onListo,
  aviso,
}: {
  elegida: Referencia;
  onElegir: (r: Referencia) => void;
  otraCm: string;
  onOtraCm: (t: string) => void;
  valida: boolean;
  onListo: () => void;
  aviso: string | null;
}) {
  return (
    <section className="dh-panel" aria-labelledby="dh-m1">
      <h2 id="dh-m1">1. Poné al lado algo que sepas cuánto mide</h2>
      <div
        role="radiogroup"
        aria-label="Objeto de referencia"
        className="ds-fila"
        style={{ flexWrap: 'wrap' }}
      >
        {REFERENCIAS.map((r) => (
          <Pastilla
            key={r.id}
            rol="radio"
            elegida={r.id === elegida.id}
            onElegir={() => onElegir(r)}
          >
            {r.titulo}
          </Pastilla>
        ))}
      </div>
      <p>{elegida.sub}</p>
      {elegida.cm === null ? (
        <label className="dh-campo">
          Cuánto mide, en centímetros
          <input
            inputMode="decimal"
            autoComplete="off"
            value={otraCm}
            onChange={(e) => onOtraCm(e.target.value)}
            placeholder="Por ejemplo 12,5"
          />
        </label>
      ) : null}
      <p>
        Llevá los dos puntos amarillos a los extremos de ese objeto. No muevas el teléfono después.
      </p>
      {aviso ? <p role="alert">{aviso}</p> : null}
      <Boton onClick={onListo} deshabilitado={!valida} icono="check">
        Listo, ya lo marqué
      </Boton>
    </section>
  );
}

/** Paso 2: marcar lo que se quiere medir y guardar. */
export function PanelMedida({
  nombre,
  onNombre,
  onGuardar,
  onRecalibrar,
}: {
  nombre: string;
  onNombre: (t: string) => void;
  onGuardar: () => void;
  onRecalibrar: () => void;
}) {
  return (
    <section className="dh-panel" aria-labelledby="dh-m2">
      <h2 id="dh-m2">2. Llevá los puntos a los extremos de lo que querés medir</h2>
      <p>
        La medida es aproximada: puede variar unos centímetros. No uses esto para cortar material
        caro.
      </p>
      <label className="dh-campo">
        ¿Qué estás midiendo? (si querés)
        <input
          value={nombre}
          maxLength={60}
          autoComplete="off"
          onChange={(e) => onNombre(e.target.value)}
          placeholder="Por ejemplo, la ventana del living"
        />
      </label>
      <Boton onClick={onGuardar} icono="enviar">
        Guardar y mandar
      </Boton>
      <Boton variante="contorno" onClick={onRecalibrar} icono="reintentar">
        Volver a calibrar
      </Boton>
    </section>
  );
}

/** Botón de archivo: elegir una foto de la galería. La foto no sale del teléfono. */
export function BotonFoto({ onFoto }: { onFoto: (archivo: File) => void }) {
  const alElegir = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) onFoto(f);
    e.target.value = '';
  };
  return (
    <label className="ds-boton ds-boton--contorno ds-boton--ancho dh-archivo">
      <Icono nombre="imagen" />
      Medir sobre una foto de mi galería
      <input type="file" accept="image/*" className="ds-solo-lector" onChange={alElegir} />
    </label>
  );
}
