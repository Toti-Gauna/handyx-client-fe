'use client';

import { useSearchParams } from 'next/navigation';
import { Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { ruta } from '@/components/nav';
import { EstadoConsulta, ErrorEstado } from '@/components/ui';
import { ErrorCliente } from '@/data/cliente';
import { useConsulta } from '@/data/hooks';
import { Boton, Chip, Nota, Progreso, Sub, Tarjeta, Titulo } from '@/ui';
import { BarraHogar, Medalla, cuandoRecordatorio, fechaDMA } from '@/ui/hogar';
import { HITO_DE_INSIGNIA, iconoInsignia } from '../piezas';

/** Una insignia (G-Insignia): qué pide, cuánto llevás y cómo se completa. Vale igual lo que hacés por tu cuenta. */
export default function InsigniaDetalle() {
  const id = useSearchParams().get('id');
  const camino = useConsulta('camino', {});
  const recordatorios = useConsulta('recordatorios', {});
  const ins = camino.datos?.insignias.find((i) => i.id === id) ?? null;
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo={ins?.nombre ?? 'Insignia'}
          volver={{ href: '/camino/insignias/', etiqueta: 'Volver a tus insignias' }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <EstadoConsulta consulta={camino} cargando="Cargando la insignia…">
          {(c) => {
            if (!ins)
              return (
                <ErrorEstado
                  error={new ErrorCliente({ codigo: 'no_encontrado', mensaje: 'Esta insignia no existe.' })}
                />
              );
            const hito = c.hitos.find((h) => h.id === HITO_DE_INSIGNIA[ins.id]);
            const hechos = (recordatorios.datos?.items ?? []).filter((r) => r.activo || r.hechoEn);
            return (
              <>
                <div className="ds-fila" style={{ justifyContent: 'center', padding: '0.625rem 0' }}>
                  <Medalla icono={iconoInsignia(ins.id)} obtenida={ins.obtenidaEn !== null} tam={8.75} />
                </div>
                <Titulo texto={`==${ins.nombre}==`} nivel={2} tam={1.875} />
                <Sub>{ins.descripcion}</Sub>
                {ins.obtenidaEn ? (
                  <>
                    <span>
                      <Chip tono="exito" icono="check">
                        La ganaste el {fechaDMA(ins.obtenidaEn)}
                      </Chip>
                    </span>
                    <Boton variante="contorno" chico icono="medalla" href={ruta('/camino/hito/', { id: ins.id })}>
                      Ver el festejo
                    </Boton>
                  </>
                ) : null}
                {hito ? (
                  <Tarjeta>
                    <span className="ds-fila" style={{ justifyContent: 'space-between', fontWeight: 800 }}>
                      <span>Tu avance</span>
                      <span>
                        {hito.progreso.actual} de {hito.progreso.total}
                      </span>
                    </span>
                    <Progreso
                      valor={hito.progreso.actual}
                      max={hito.progreso.total}
                      etiqueta={`Tu avance: ${hito.progreso.actual} de ${hito.progreso.total}`}
                      alto={0.625}
                    />
                    {ins.id === 'al_dia'
                      ? hechos.map((r) => (
                          <span key={r.id} className="ds-fila" style={{ ['--ds-gap' as string]: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ display: 'flex', width: '1.125rem', color: r.hechoEn ? 'var(--ds-exito)' : 'var(--ds-suave)' }}>
                              <Icono nombre={r.hechoEn ? 'check' : 'reloj'} />
                            </span>
                            <span>
                              {r.titulo} · {r.hechoEn ? `hecho el ${fechaDMA(r.hechoEn)}` : cuandoRecordatorio(r).toLowerCase()}
                            </span>
                          </span>
                        ))
                      : null}
                  </Tarjeta>
                ) : null}
                <Nota tono="gris">
                  Vale igual si lo hacés con un especialista de Handyx o por tu cuenta: lo marcás vos en Mi hogar.
                </Nota>
              </>
            );
          }}
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}
