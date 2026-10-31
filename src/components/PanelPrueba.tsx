'use client';

// Panel de la vista de prueba: escenarios, reloj y acciones de la contraparte. Solo existe con el adaptador mock.
import { useState, useSyncExternalStore } from 'react';
import { controlesPrueba, esVistaDePrueba } from '@/data';
import { emitir } from '@/data/eventos';
import { CUENTA_PRUEBA, INVITACION_PRUEBA } from '@/data/prueba';
import { ESCENARIOS } from '@/mapa/escenarios';
import { Hoja } from './ui';
import { hayVersionNueva } from './version';

function irAEscenario(esc: (typeof ESCENARIOS)[number]): void {
  const destino = `${esc.entrada}${esc.id === 'nuevo-usuario' ? '' : `?escenario=${esc.id}`}`;
  // Recarga completa a propósito: el mundo de la vista de prueba vive en memoria y se arma al cargar.
  window.location.assign(new URL(destino, window.location.origin));
}

export function AvisoVistaPrueba() {
  const [abierto, setAbierto] = useState(false);
  const [registro, setRegistro] = useState('');
  // El escenario sale de la URL del navegador: en el servidor vale el de por defecto, sin desfasar la hidratación.
  const escenario = useSyncExternalStore(
    () => () => undefined,
    () => controlesPrueba?.mundo.escenario ?? 'nuevo-usuario',
    () => 'nuevo-usuario',
  );
  if (!esVistaDePrueba || !controlesPrueba) return null;
  const controles = controlesPrueba;
  const grupos = [...new Set(controles.acciones.map((a) => a.grupo))];

  function ejecutar(id: string) {
    setRegistro(controles.ejecutar(id));
    emitir('actualizar');
  }

  return (
    <>
      <p className="aviso-prueba" role="note">
        <span>
          <strong>Vista de prueba</strong> · datos ficticios
          <span className="sr-only">, sin backend ni cuentas reales</span>
        </span>
        <button type="button" className="panel-prueba__abrir" onClick={() => setAbierto(true)}>
          Panel de prueba
        </button>
      </p>
      <Hoja abierta={abierto} onCerrar={() => setAbierto(false)} titulo="Panel de prueba">
        <p className="texto-suave">
          Controla lo que en producción hacen el especialista, Operations y el reloj. No existe
          fuera de la vista de prueba.
        </p>
        <p className="codigo">
          Cuenta: {CUENTA_PRUEBA.email} · {CUENTA_PRUEBA.contrasena}
          <br />
          Invitación: {INVITACION_PRUEBA}
        </p>
        <h3 className="panel-prueba__grupo">Escenario</h3>
        <label className="sr-only" htmlFor="escenario-prueba">
          Escenario
        </label>
        <select
          id="escenario-prueba"
          className="entrada"
          value={escenario}
          onChange={(e) => {
            const esc = ESCENARIOS.find((x) => x.id === e.target.value);
            // Recarga completa a propósito: el mundo de la vista de prueba vive en memoria y se arma al cargar.
            if (esc) irAEscenario(esc);
          }}
        >
          {ESCENARIOS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.titulo}
            </option>
          ))}
        </select>
        <p className="campo__ayuda">
          Al elegir uno se recarga la vista de prueba en su punto de partida.
        </p>
        {grupos.map((g) => (
          <section key={g} aria-labelledby={`pp-${g}`}>
            <h3 id={`pp-${g}`} className="panel-prueba__grupo">
              {g}
            </h3>
            <div className="panel-prueba__acciones">
              {controles.acciones
                .filter((a) => a.grupo === g)
                .map((a) => (
                  <button key={a.id} type="button" onClick={() => ejecutar(a.id)}>
                    {a.etiqueta}
                  </button>
                ))}
            </div>
          </section>
        ))}
        <section aria-labelledby="pp-app">
          <h3 id="pp-app" className="panel-prueba__grupo">
            App
          </h3>
          <div className="panel-prueba__acciones">
            <button
              type="button"
              onClick={() => {
                // Simulación: "Actualizar" solo recarga (no hay un service worker nuevo de verdad).
                hayVersionNueva({ actualizar: () => window.location.reload() });
                setAbierto(false);
              }}
            >
              Simular versión nueva
            </button>
          </div>
        </section>
        <p className="panel-prueba__log" role="status" aria-live="polite">
          {registro || 'Sin acciones todavía.'}
        </p>
      </Hoja>
    </>
  );
}
