'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Barra, Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { estadoDeCarga } from '@/components/Trabajo';
import { Cargando, ErrorEstado } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { AccionesFijas, Boton, Nota, Pastilla, Tarjeta, Texto } from '@/ui';
import { Comparador, LadoALado, SelectorVistas } from '@/ui/seguimiento';

/** Antes y después: deslizar para comparar o verlas lado a lado. Las fotos son las del informe del especialista. */
export default function AntesDespues() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null);
  const informe = useConsulta('informe', id ? { parametros: { id } } : null);
  const [vista, setVista] = useState<'deslizar' | 'lado'>('deslizar');
  const [par, setPar] = useState(0);

  const carga = estadoDeCarga(id, [trabajo]);
  const t = trabajo.datos;
  if (carga || !t) return carga;
  if (informe.estado === 'error' && informe.error)
    return <ErrorEstado error={informe.error} onReintentar={informe.recargar} />;
  if (informe.estado === 'cargando') return <Cargando forma="detalle" />;

  const volver = { href: ruta('/trabajos/informe/', { id: t.id }), etiqueta: 'Volver al informe' };
  const i = informe.datos;
  const pares = i ? Math.max(i.fotosAntes.length, i.fotosDespues.length) : 0;
  const antes = i?.fotosAntes[par]?.url ?? null;
  const despues = i?.fotosDespues[par]?.url ?? null;
  const completo = antes !== null && despues !== null;

  return (
    <Pantalla
      arriba={<Barra titulo="Antes y después" volver={volver} sub={t.especialista.nombrePublico} />}
      pie={
        <AccionesFijas>
          <Boton variante="contorno" href={volver.href}>
            Volver al informe
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        {!i || pares === 0 ? (
          <Nota icono="imagen" rol="status">
            Este trabajo todavía no tiene fotos del antes y el después.
          </Nota>
        ) : (
          <>
            <SelectorVistas
              etiqueta="Cómo ver las fotos"
              opciones={[
                { texto: 'Deslizar', activa: vista === 'deslizar' && completo, onElegir: () => setVista('deslizar') },
                { texto: 'Lado a lado', activa: vista === 'lado' || !completo, onElegir: () => setVista('lado') },
              ]}
            />
            {pares > 1 ? (
              <div className="dss-resena__pastillas" role="group" aria-label="Elegí el par de fotos">
                {Array.from({ length: pares }, (_, n) => (
                  <Pastilla key={n} elegida={par === n} onElegir={() => setPar(n)}>
                    Foto {n + 1}
                  </Pastilla>
                ))}
              </div>
            ) : null}
            {vista === 'deslizar' && completo ? (
              <Comparador
                key={par}
                antes={antes}
                despues={despues}
                altAntes="Antes: cómo estaba"
                altDespues="Después: cómo quedó"
              />
            ) : (
              <LadoALado antes={antes} despues={despues} />
            )}
            <Tarjeta etiqueta="Qué encontró">
              <span className="ds-etiqueta">QUÉ ENCONTRÓ</span>
              <Texto>{i.encontrado}</Texto>
            </Tarjeta>
          </>
        )}
      </div>
    </Pantalla>
  );
}
