'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import type { Hogar } from '@/contracts/v1/hogar';
import { useConsulta } from '@/data/hooks';
import { Boton, Etiqueta, Nota, Opcion, Sub, Titulo } from '@/ui';
import {
  BarraHogar,
  EQUIPOS,
  PortadaAmbiente,
  elAmbiente,
  fechaDMA,
  hrefPedir,
  mesAnio,
  trabajoDeGarantia,
  useHoy,
} from '@/ui/hogar';

/**
 * Algo se rompió (H-Rompio, puerta B): se elige el lugar y qué falla, y el pedido arranca con el rubro del equipo. Si
 * el equipo tiene garantía vigente, se ofrece escribirle al especialista que hizo el trabajo.
 */
export default function Rompio() {
  const params = useSearchParams();
  const hogar = useConsulta('hogar', {});
  const desde = params.get('ambiente');
  if (hogar.datos) return <Elegir hogar={hogar.datos} inicial={desde} />;
  return (
    <Pantalla arriba={<BarraHogar titulo="Algo se rompió" volver={VOLVER} />}>
      <EstadoConsulta consulta={hogar} cargando="Cargando tu casa…">
        {() => null}
      </EstadoConsulta>
    </Pantalla>
  );
}

const OTRA = 'otra';
const VOLVER = { href: '/hogar/', etiqueta: 'Volver a Mi hogar' };

function Elegir({ hogar, inicial }: { hogar: Hogar; inicial: string | null }) {
  const hoy = useHoy();
  const trabajos = useConsulta('trabajos', { consulta: { vista: 'historial', limite: 50 } });
  const [ambienteId, setAmbienteId] = useState(
    hogar.ambientes.find((a) => a.id === inicial)?.id ?? hogar.ambientes[0]?.id ?? null,
  );
  const [equipoId, setEquipoId] = useState<string | null>(null);
  const amb = hogar.ambientes.find((a) => a.id === ambienteId) ?? null;
  const equipos = hogar.equipos.filter((e) => e.ambienteId === ambienteId);
  const equipo = equipos.find((e) => e.id === equipoId) ?? null;
  const garantia = equipo ? trabajoDeGarantia(equipo, trabajos.datos?.items ?? [], hoy) : null;
  const elegido = equipoId !== null || hogar.ambientes.length === 0;

  return (
    <Pantalla
      arriba={<BarraHogar titulo="Algo se rompió" volver={VOLVER} />}
      pie={
        <>
          <Boton
            icono="flecha"
            href={hrefPedir(equipo?.tipo ?? null, 'rompio')}
            deshabilitado={!elegido}
          >
            Armar el pedido
          </Boton>
          {garantia && equipo ? (
            <Boton
              variante="contorno"
              chico
              icono="escudo"
              href={ruta('/chats/conversacion/', { id: garantia.conversacionId })}
            >
              {`Pedírselo a ${garantia.especialista.nombrePublico} (garantía)`}
            </Boton>
          ) : null}
        </>
      }
    >
      <div className="ds ds-cuerpo">
        <div className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
          <Titulo texto="¿Dónde ==pasa==?" nivel={2} />
          <Sub>
            Elegís el lugar y qué falla, y el pedido arranca con eso. Después podés compartir los
            datos de tu casa con ese pedido.
          </Sub>
        </div>
        {hogar.ambientes.length === 0 ? (
          <Nota tono="gris">
            Todavía no cargaste ambientes. Podés armar el pedido igual y contar qué pasó.
          </Nota>
        ) : (
          <div role="radiogroup" aria-label="Dónde pasa" className="dsh-elegir">
            {hogar.ambientes.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={a.id === ambienteId}
                className="dsh-elegir__amb"
                onClick={() => {
                  setAmbienteId(a.id);
                  setEquipoId(null);
                }}
              >
                <PortadaAmbiente ambiente={a} alto={64} />
                {a.nombre}
              </button>
            ))}
          </div>
        )}
        {amb ? (
          <>
            <Etiqueta como="h2">¿Qué falla en {elAmbiente(amb)}?</Etiqueta>
            <div
              role="radiogroup"
              aria-label="Qué falla"
              className="ds-pila"
              style={{ ['--ds-gap' as string]: '0.5rem' }}
            >
              {equipos.map((e) => (
                <Opcion
                  key={e.id}
                  icono={EQUIPOS[e.tipo].icono}
                  titulo={e.nombre}
                  sub={
                    e.garantiaHasta && e.garantiaHasta >= hoy
                      ? `Con garantía hasta el ${fechaDMA(e.garantiaHasta)}`
                      : e.instaladoEn
                        ? `Instalado en ${mesAnio(e.instaladoEn).toLowerCase()}`
                        : 'Sin datos'
                  }
                  elegida={equipoId === e.id}
                  onElegir={() => setEquipoId(e.id)}
                />
              ))}
              <Opcion
                icono="mas"
                titulo={`Otra cosa en ${elAmbiente(amb)}`}
                sub="Lo contás vos"
                elegida={equipoId === OTRA}
                onElegir={() => setEquipoId(OTRA)}
              />
            </div>
          </>
        ) : null}
        {garantia && equipo ? (
          <Nota tono="amarillo" icono="escudo">
            {equipo.nombre} tiene garantía hasta el {fechaDMA(equipo.garantiaHasta ?? hoy)}: podés
            pedirle a {garantia.especialista.nombrePublico} que la revise.
          </Nota>
        ) : !elegido ? (
          <Nota tono="gris">Elegí qué falla para seguir.</Nota>
        ) : null}
      </div>
    </Pantalla>
  );
}
