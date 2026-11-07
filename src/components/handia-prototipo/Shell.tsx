'use client';

// Prototipo de la fase R de HandIA: direcciones (R2), lenguaje (R3), pantallas y puertas (R4 + R6) y movimiento (R5).
import { useState } from 'react';
import { InicioSeccion } from './InicioSeccion';
import { Lenguaje } from './Lenguaje';
import { Movimiento } from './Movimiento';
import { Pantallas } from './Pantallas';
import { Direcciones, Selector } from './Prototipo';

const SECCIONES = [
  { id: 'inicio', nombre: 'Inicio y voz (nuevo)', lote: 'R4 · ajuste del 07/11' },
  { id: 'pantallas', nombre: 'Pantallas', lote: 'R4 · R6' },
  { id: 'lenguaje', nombre: 'Lenguaje', lote: 'R3' },
  { id: 'movimiento', nombre: 'Movimiento y sonido', lote: 'R5' },
  { id: 'direcciones', nombre: 'Las 3 direcciones', lote: 'R2' },
] as const;
type Seccion = (typeof SECCIONES)[number]['id'];

export function PrototipoHandia() {
  const [seccion, setSeccion] = useState<Seccion>('inicio');
  const actual = SECCIONES.find((s) => s.id === seccion)!;
  return (
    <div className="hxp">
      <header>
        <p className="hxp-etiqueta">Prototipo · fase R · datos ficticios</p>
        <h1>HandIA premium</h1>
        <p className="hxp-intro">
          Cómo se ve, se mueve y suena HandIA antes de construirla. Dirección de trabajo:{' '}
          <strong>Luz cálida+</strong> (recomendada en R2; si Ignacio elige otra, cambia un bloque
          de tokens).
        </p>
      </header>
      <nav aria-label="Secciones del prototipo">
        <Selector
          etiqueta="Sección"
          opciones={SECCIONES.map((s) => ({ id: s.id, nombre: s.nombre }))}
          actual={seccion}
          elegir={setSeccion}
        />
      </nav>
      <section className="hxp-seccion" aria-labelledby="hxp-seccion-titulo">
        <h2 id="hxp-seccion-titulo">
          {actual.nombre} <span className="hxp-lote">{actual.lote}</span>
        </h2>
        {seccion === 'inicio' && <InicioSeccion />}
        {seccion === 'pantallas' && <Pantallas />}
        {seccion === 'lenguaje' && <Lenguaje />}
        {seccion === 'movimiento' && <Movimiento />}
        {seccion === 'direcciones' && <Direcciones />}
      </section>
    </div>
  );
}
