'use client';

import { useSearchParams } from 'next/navigation';
import { Barra, Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { estadoDeCarga } from '@/components/Trabajo';
import { Cargando, ErrorEstado } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { fechaNumerica } from '@/domain/fechas';
import { AccionesFijas, Boton, Chip, DatoFila, MosaicoIcono, Nota, Tarjeta } from '@/ui';

/**
 * Informe del trabajo (lo arma el especialista al terminar): qué encontró, antes y después, pruebas, materiales,
 * garantía y qué conviene hacer después. Sin informe todavía, un aviso claro y nada inventado.
 */
export default function InformeTrabajo() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null);
  const informe = useConsulta('informe', id ? { parametros: { id } } : null);
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);

  const carga = estadoDeCarga(id, [trabajo]);
  const t = trabajo.datos;
  if (carga || !t) return carga;
  if (informe.estado === 'error' && informe.error)
    return <ErrorEstado error={informe.error} onReintentar={informe.recargar} />;
  if (informe.estado === 'cargando') return <Cargando forma="detalle" />;

  const esp = t.especialista.nombrePublico;
  const i = informe.datos;
  const volver = { href: ruta('/trabajos/detalle/', { id: t.id }), etiqueta: 'Volver al trabajo' };
  const rubro = pedido.datos ? RUBROS_INFO[pedido.datos.rubro].nombre : 'Trabajo';
  const fotos = i ? i.fotosAntes.length + i.fotosDespues.length : 0;
  const falta = t.estado === 'terminado_por_especialista';

  return (
    <Pantalla
      arriba={<Barra titulo="Informe" volver={volver} sub={`${esp} · ${rubro}`} />}
      pie={
        <AccionesFijas nota={i ? 'El informe queda guardado en Mi hogar.' : undefined}>
          {falta ? (
            <Boton icono="check" href={ruta('/trabajos/conformidad/', { id: t.id })}>
              Dar la conformidad
            </Boton>
          ) : (
            <Boton href={volver.href}>Volver al trabajo</Boton>
          )}
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        {!i ? (
          <Nota icono="documento" rol="status">
            Todavía no hay informe. {esp} lo carga cuando termina el trabajo. Mientras tanto, podés
            escribirle.
          </Nota>
        ) : (
          <>
            <div className="ds-fila">
              <MosaicoIcono icono="documento" tam={3.5} />
              <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
                <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.375rem' }}>
                  {rubro}
                </h2>
                {i.garantiaHasta ? (
                  <span>
                    <Chip tono="exito" icono="escudo">
                      Garantía hasta el {fechaNumerica(i.garantiaHasta)}
                    </Chip>
                  </span>
                ) : null}
              </span>
            </div>
            <Tarjeta etiqueta="Informe del trabajo">
              <DatoFila icono="lupa" etiqueta="Qué encontró" valor={i.encontrado} />
              {fotos ? (
                <DatoFila
                  icono="imagen"
                  etiqueta="Antes y después"
                  valor={`${fotos} ${fotos === 1 ? 'foto' : 'fotos'}`}
                  derecha={
                    <Boton
                      chico
                      ancho={false}
                      variante="suave"
                      href={ruta('/trabajos/antes-despues/', { id: t.id })}
                    >
                      Verlas
                    </Boton>
                  }
                />
              ) : null}
              {i.pruebas ? <DatoFila icono="check" etiqueta="Pruebas" valor={i.pruebas} /> : null}
              {i.materiales.length ? (
                <DatoFila icono="caja" etiqueta="Materiales" valor={i.materiales.join(' · ')} />
              ) : null}
              {i.recomendaciones.length ? (
                <DatoFila
                  icono="calendario"
                  etiqueta="Qué conviene hacer después"
                  valor={
                    <>
                      {i.recomendaciones.map((r) => (
                        <span key={r.texto} style={{ display: 'block' }}>
                          {r.texto}
                          {r.enMeses
                            ? ` · en ${r.enMeses} ${r.enMeses === 1 ? 'mes' : 'meses'}`
                            : ''}
                        </span>
                      ))}
                    </>
                  }
                />
              ) : null}
            </Tarjeta>
          </>
        )}
      </div>
    </Pantalla>
  );
}
