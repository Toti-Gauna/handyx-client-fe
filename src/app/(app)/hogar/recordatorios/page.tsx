'use client';

import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { EstadoConsulta } from '@/components/ui';
import type { Recordatorio } from '@/contracts/v1/hogar';
import { useConsulta, useEnvio } from '@/data/hooks';
import { Boton, Chip, Interruptor, Nota, Sub, Titulo } from '@/ui';
import {
  AvisoEnvio,
  BarraHogar,
  ORIGEN_RECORDATORIO,
  cuandoRecordatorio,
  fechaDMA,
} from '@/ui/hogar';
import { NuevoRecordatorio } from './NuevoRecordatorio';

/**
 * Recordatorios (H-Recordatorios, puerta C): avisan cuándo conviene revisar algo. Se pausan con el interruptor y se
 * marcan hechos a mano; el cambio se ve al instante y vuelve atrás si el servidor no lo guarda. Nada se pide solo.
 */
export default function Recordatorios() {
  const consulta = useConsulta('recordatorios', {});
  const hogar = useConsulta('hogar', {});
  const [sumar, setSumar] = useState(false);

  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Recordatorios"
          volver={{ href: '/hogar/', etiqueta: 'Volver a Mi hogar' }}
          accion={{ icono: 'mas', etiqueta: 'Sumar un recordatorio', onClick: () => setSumar(true) }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <Titulo texto="Tu casa al ==día==" nivel={2} />
        <Sub>Te avisamos cuándo conviene revisar algo. Nada se pide solo.</Sub>
        <EstadoConsulta consulta={consulta} cargando="Cargando tus recordatorios…">
          {({ items }) =>
            items.length === 0 ? (
              <Nota tono="gris" icono="campana">
                Todavía no tenés recordatorios. Sumá uno con el botón «+» de arriba.
              </Nota>
            ) : (
              <ul className="ds-pila" style={{ listStyle: 'none', margin: 0, padding: 0, ['--ds-gap' as string]: 0 }}>
                {[...items]
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))
                  .map((r) => (
                    <Fila key={r.id} recordatorio={r} onListo={consulta.recargar} />
                  ))}
              </ul>
            )
          }
        </EstadoConsulta>
        <Nota tono="amarillo" icono="medalla">
          Hacer un mantenimiento a tiempo suma en tu camino del hogar, lo hagas con Handyx o por tu cuenta.
        </Nota>
      </div>
      <NuevoRecordatorio
        abierta={sumar}
        equipos={hogar.datos?.equipos ?? []}
        onCerrar={() => setSumar(false)}
        onListo={() => {
          setSumar(false);
          consulta.recargar();
        }}
      />
    </Pantalla>
  );
}

/** Un recordatorio: el cambio se ve al instante y vuelve atrás si el servidor no lo guarda. */
function Fila({ recordatorio, onListo }: { recordatorio: Recordatorio; onListo: () => void }) {
  const [cambio, setCambio] = useState<{ activo?: boolean; hecho?: boolean } | null>(null);
  const { enviar, error } = useEnvio();
  const activo = cambio?.activo ?? recordatorio.activo;
  const hechoHoy = cambio?.hecho === true;
  const r = recordatorio;

  const editar = async (cuerpo: { activo?: boolean; hecho?: boolean }) => {
    setCambio(cuerpo);
    const res = await enviar(
      'recordatorioEditar',
      { parametros: { id: r.id }, cuerpo },
      `${r.id}:${JSON.stringify(cuerpo)}`,
    );
    setCambio(null);
    if (res?.ok) onListo();
  };

  return (
    <li>
      <Interruptor
        etiqueta={r.titulo}
        sub={`${cuandoRecordatorio(r)} · ${ORIGEN_RECORDATORIO[r.origen]}`}
        activo={activo}
        onCambiar={(si) => void editar({ activo: si })}
      />
      <div className="ds-fila" style={{ paddingBottom: '0.625rem', flexWrap: 'wrap' }}>
        {hechoHoy ? (
          <Chip tono="exito" icono="check">
            Hecho hoy
          </Chip>
        ) : r.hechoEn ? (
          <Chip tono="exito" icono="check">
            Hecho el {fechaDMA(r.hechoEn)}
          </Chip>
        ) : (
          <Chip tono={activo ? 'tinte' : 'gris'} icono={activo ? 'campana' : 'pausa'}>
            {activo ? 'Te avisamos' : 'En pausa'}
          </Chip>
        )}
        {activo && !hechoHoy ? (
          <Boton
            variante="suave"
            chico
            ancho={false}
            icono="check"
            etiqueta={`Ya hice: ${r.titulo}`}
            onClick={() => void editar({ hecho: true })}
          >
            Ya lo hice
          </Boton>
        ) : null}
      </div>
      <AvisoEnvio error={error} />
    </li>
  );
}
