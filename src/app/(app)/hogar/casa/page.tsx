'use client';

import { useSearchParams } from 'next/navigation';
import { Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import type { Hogar } from '@/contracts/v1/hogar';
import { useConsulta, useEnvio } from '@/data/hooks';
import { Chip, Etiqueta, FilaEnlace, Nota, Pastilla } from '@/ui';
import {
  AvisoEnvio,
  BarraHogar,
  EQUIPOS,
  Segmentos,
  TarjetaAmbiente,
  VIVIENDAS,
  garantiaVigente,
  useHoy,
} from '@/ui/hogar';

/** Mi casa (H-MiCasa, puerta A): los ambientes con su portada y cuánto falta, o la lista de equipos. */
export default function MiCasa() {
  const verEquipos = useSearchParams().get('ver') === 'equipos';
  const hogar = useConsulta('hogar', {});
  const h = hogar.datos;
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Mi casa"
          volver={{ href: '/hogar/', etiqueta: 'Volver a Mi hogar' }}
          sub={h ? `${h.ambientes.length} ambientes · ${h.equipos.length} equipos` : undefined}
          accion={{
            icono: 'mas',
            etiqueta: verEquipos ? 'Sumar un equipo' : 'Sumar un ambiente',
            href: verEquipos ? '/hogar/sumar/?que=equipo' : '/hogar/sumar/',
          }}
        />
      }
    >
      <div className="ds ds-cuerpo">
        <Segmentos
          etiqueta="Ver la casa por"
          actual={verEquipos ? 'Equipos' : 'Ambientes'}
          opciones={[
            { texto: 'Ambientes', href: '/hogar/casa/' },
            { texto: 'Equipos', href: '/hogar/casa/?ver=equipos' },
          ]}
        />
        <EstadoConsulta consulta={hogar} cargando="Cargando tu casa…">
          {(datos) => (
            <>
              <Vivienda hogar={datos} onCambio={hogar.recargar} />
              {verEquipos ? <ListaEquipos hogar={datos} /> : <Ambientes hogar={datos} />}
            </>
          )}
        </EstadoConsulta>
        <Nota icono="candado" tono="gris">
          Tu ficha es privada. Se comparte solo lo que elegís, con quien elegís y para un pedido.
        </Nota>
      </div>
    </Pantalla>
  );
}

/** Tipo de vivienda (con la versión de la ficha: si cambió en otro lado, avisa). */
function Vivienda({ hogar, onCambio }: { hogar: Hogar; onCambio: () => void }) {
  const { enviar, pendiente, error } = useEnvio();
  const elegir = async (vivienda: keyof typeof VIVIENDAS) => {
    if (vivienda === hogar.vivienda || pendiente) return;
    const r = await enviar('hogarEditar', { cuerpo: { vivienda, version: hogar.version } }, vivienda);
    if (r?.ok) onCambio();
  };
  return (
    <div className="ds-pila" role="radiogroup" aria-label="Tipo de vivienda">
      <Etiqueta>Tu vivienda</Etiqueta>
      <div className="ds-fila" style={{ ['--ds-gap' as string]: '0.5rem', flexWrap: 'wrap' }}>
        {(Object.keys(VIVIENDAS) as (keyof typeof VIVIENDAS)[]).map((v) => (
          <Pastilla key={v} rol="radio" elegida={hogar.vivienda === v} onElegir={() => void elegir(v)}>
            {VIVIENDAS[v]}
          </Pastilla>
        ))}
      </div>
      <AvisoEnvio error={error} onActualizar={onCambio} />
    </div>
  );
}

function Ambientes({ hogar }: { hogar: Hogar }) {
  return (
    <div className="ds-grilla" style={{ ['--ds-gap' as string]: '0.75rem' }}>
      {hogar.ambientes.map((a) => (
        <TarjetaAmbiente key={a.id} ambiente={a} equipos={hogar.equipos} />
      ))}
      <Enlace href="/hogar/sumar/" className="dsh-sumar">
        <Icono nombre="mas" />
        Sumar un ambiente
      </Enlace>
    </div>
  );
}

function ListaEquipos({ hogar }: { hogar: Hogar }) {
  const hoy = useHoy();
  if (hogar.equipos.length === 0)
    return (
      <Nota tono="gris">
        Todavía no sumaste equipos. Empezá por el calefón o el termotanque: son los que más conviene
        tener a mano.
      </Nota>
    );
  const nombreDe = (id: string) => hogar.ambientes.find((a) => a.id === id)?.nombre ?? '';
  return (
    <div className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
      {hogar.equipos.map((e) => (
        <FilaEnlace
          key={e.id}
          icono={EQUIPOS[e.tipo].icono}
          titulo={e.nombre}
          sub={[nombreDe(e.ambienteId), e.marca].filter(Boolean).join(' · ')}
          href={ruta('/hogar/equipo/', { id: e.id })}
          derecha={
            garantiaVigente(e.garantiaHasta, hoy) ? (
              <Chip tono="exito" icono="escudo">
                Garantía
              </Chip>
            ) : undefined
          }
        />
      ))}
      <FilaEnlace icono="mas" titulo="Sumar un equipo" href="/hogar/sumar/?que=equipo" />
    </div>
  );
}
