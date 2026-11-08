'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icono } from '@/components/Icono';
import type { Hogar } from '@/contracts/v1/hogar';
import { useEnvio } from '@/data/hooks';
import { Boton, Chip, Etiqueta, Nota, Pastilla } from '@/ui';
import { PantallaPaso } from '@/ui/acceso';
import { GRUPOS_EQUIPOS, ambienteDeGrupo, equiposPorCrear, type TipoEquipo } from './casa';

/**
 * Paso 2 de 3: qué equipos hay (sin marcar nada de entrada). Cada grupo se guarda en su ambiente; los que ya están
 * cargados se muestran como hechos y no se duplican. Marca y modelo, después (con una foto de la etiqueta).
 */
export function PasoEquipos({
  hogar,
  onListo,
  onAtras,
  onFalla,
}: {
  hogar: Hogar;
  onListo: () => void;
  onAtras: () => void;
  onFalla: () => void;
}) {
  const { enviar, pendiente, error } = useEnvio();
  const [elegidos, setElegidos] = useState<ReadonlySet<TipoEquipo>>(new Set());
  const ya = new Set(hogar.equipos.map((e) => e.tipo));
  const nuevos = equiposPorCrear(hogar, elegidos);
  const grupos = GRUPOS_EQUIPOS.filter((g) => ambienteDeGrupo(hogar, g));

  function alternar(t: TipoEquipo) {
    setElegidos((previos) => {
      const s = new Set(previos);
      if (s.has(t)) s.delete(t);
      else s.add(t);
      return s;
    });
  }

  async function guardar() {
    for (const e of nuevos) {
      const r = await enviar('equipoCrear', { cuerpo: e }, `equipo|${e.tipo}`);
      if (!r?.ok) return onFalla();
    }
    onListo();
  }

  return (
    <PantallaPaso
      titulo="¿Qué ==equipos== tenés?"
      tam={1.75}
      sub="Marcá los que hay. Marca y modelo, después (con una foto de la etiqueta)."
      barra={{ titulo: 'Tu casa', sub: '2 de 3 · equipos', atras: { alTocar: onAtras } }}
      paso={2}
      total={3}
      onSubmit={() => void guardar()}
      pie={
        <Boton type="submit" ocupado={pendiente}>
          {nuevos.length === 0
            ? 'Seguir sin sumar equipos'
            : `Seguir · ${nuevos.length} ${nuevos.length === 1 ? 'equipo' : 'equipos'}`}
        </Boton>
      }
    >
      {grupos.length === 0 ? (
        <Nota tono="gris">
          Para sumar equipos, primero cargá al menos un ambiente. Podés hacerlo después en Mi hogar.
        </Nota>
      ) : null}
      {grupos.map((g) => (
        <section
          key={g.titulo}
          className="ds-pila"
          style={{ '--ds-gap': '0.5rem' } as CSSProperties}
        >
          <Etiqueta como="h2">{g.titulo}</Etiqueta>
          <div className="dsa-chips">
            {g.equipos.map((e) =>
              ya.has(e.tipo) ? (
                <Chip key={e.tipo} tono="exito" icono="check">
                  {e.texto} · ya cargado
                </Chip>
              ) : (
                <Pastilla
                  key={e.tipo}
                  elegida={elegidos.has(e.tipo)}
                  onElegir={() => alternar(e.tipo)}
                >
                  <Icono nombre={elegidos.has(e.tipo) ? 'check' : e.icono} />
                  {e.texto}
                </Pastilla>
              ),
            )}
          </div>
        </section>
      ))}
      {error ? (
        <Nota tono="error" rol="alert" icono="alerta">
          {error.mensaje} Lo que ya se guardó queda guardado: tocá «Seguir» para terminar.
        </Nota>
      ) : null}
    </PantallaPaso>
  );
}
