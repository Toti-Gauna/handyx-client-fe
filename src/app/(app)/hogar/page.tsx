'use client';

import { Pantalla } from '@/components/hx';
import { useSesion } from '@/components/SesionProvider';
import { TituloDocumento } from '@/components/TituloDocumento';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import {
  CabeceraAzul,
  CuadroCabecera,
  Etiqueta,
  FilaEnlace,
  MosaicoIcono,
  Progreso,
  Puerta,
  Tarjeta,
} from '@/ui';
import {
  ORIGEN_RECORDATORIO,
  VIVIENDAS,
  cuandoRecordatorio,
  garantiaVigente,
  paraEstaSemana,
  pendientes,
  useHoy,
} from '@/ui/hogar';

/**
 * Mi hogar (H-Hogar): la ficha privada de la casa con cuatro puertas, cada una con su camino. Abajo, el próximo
 * mantenimiento y lo que compartiste. Nada sale de acá sin que la persona lo elija.
 */
export default function MiHogar() {
  const { sesion } = useSesion();
  const hoy = useHoy();
  const hogar = useConsulta('hogar', {});
  const recordatorios = useConsulta('recordatorios', {});
  const compartidos = useConsulta('compartidos', {});
  const trabajos = useConsulta('trabajos', { consulta: { vista: 'historial', limite: 50 } });
  const camino = useConsulta('camino', {});

  const u = sesion.perfil.ubicacion;
  const h = hogar.datos;
  const lugar = [h?.vivienda ? VIVIENDAS[h.vivienda] : null, u?.direccion, u?.barrio]
    .filter(Boolean)
    .join(' · ');
  const lista = recordatorios.datos?.items ?? [];
  const semana = paraEstaSemana(lista, hoy);
  const proximo = pendientes(lista)[0];
  const garantias = h?.equipos.filter((e) => garantiaVigente(e.garantiaHasta, hoy)).length ?? 0;
  const nTrabajos = trabajos.datos?.items.length ?? 0;
  const activos = compartidos.datos?.items.filter((c) => c.estado === 'activo') ?? [];
  const hitos = camino.datos?.hitos ?? [];
  const hechos = hitos.filter((x) => x.estado === 'hecho').length;

  return (
    <Pantalla
      arriba={
        <CabeceraAzul
          titulo="Mi hogar"
          sub={lugar || 'Tu casa'}
          accion={
            <CuadroCabecera
              icono="editar"
              etiqueta="Editar la ficha de la casa"
              href="/hogar/casa/"
            />
          }
        >
          {h ? (
            <div className="dsh-ficha">
              <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
                <span className="dsh-ficha__titulo">
                  <span>Ficha de tu casa</span>
                  <span>{h.completitud} %</span>
                </span>
                <Progreso valor={h.completitud} etiqueta="Ficha de tu casa completa" />
              </span>
              <span className="dsh-ficha__cuenta">
                <strong>{h.ambientes.length}</strong>
                {h.ambientes.length === 1 ? 'ambiente' : 'ambientes'}
              </span>
              <span className="dsh-ficha__cuenta">
                <strong>{h.equipos.length}</strong>
                {h.equipos.length === 1 ? 'equipo' : 'equipos'}
              </span>
            </div>
          ) : null}
        </CabeceraAzul>
      }
    >
      <TituloDocumento texto="Mi hogar" />
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <EstadoConsulta consulta={hogar} cargando="Cargando tu casa…">
          {() => (
            <>
              <nav aria-label="Mi hogar" className="ds-grilla">
                <Puerta
                  letra="A"
                  icono="casa"
                  titulo="Mi casa"
                  sub="Ambientes y equipos, con fotos y medidas"
                  href="/hogar/casa/"
                />
                <Puerta
                  letra="B"
                  icono="alerta"
                  titulo="Algo se rompió"
                  sub="Elegís qué y el pedido sale armado"
                  href="/hogar/rompio/"
                  tono="azul"
                />
                <Puerta
                  letra="C"
                  icono="campana"
                  titulo="Mantenimiento"
                  sub={
                    semana
                      ? `${semana} para esta semana`
                      : `${pendientes(lista).length} recordatorios activos`
                  }
                  href="/hogar/recordatorios/"
                  tono="amarilla"
                />
                <Puerta
                  letra="D"
                  icono="reloj"
                  titulo="Historial y garantías"
                  sub={`${nTrabajos} ${nTrabajos === 1 ? 'trabajo' : 'trabajos'} · ${garantias} ${
                    garantias === 1 ? 'garantía activa' : 'garantías activas'
                  }`}
                  href="/hogar/historial/"
                  tono="noche"
                />
              </nav>
              {proximo ? (
                <Tarjeta pie={{ texto: 'Ver recordatorios', href: '/hogar/recordatorios/' }}>
                  <div className="ds-fila">
                    <MosaicoIcono icono="campana" tono="amarillo" />
                    <span
                      className="ds-crece ds-pila"
                      style={{ ['--ds-gap' as string]: '0.125rem' }}
                    >
                      <Etiqueta como="h2">Próximo mantenimiento</Etiqueta>
                      <strong>{proximo.titulo}</strong>
                      <span className="dsh-suave">
                        {cuandoRecordatorio(proximo)} · {ORIGEN_RECORDATORIO[proximo.origen]}
                      </span>
                    </span>
                  </div>
                </Tarjeta>
              ) : null}
              <div className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
                <FilaEnlace
                  icono="compartir"
                  titulo="Lo que compartiste"
                  sub={
                    activos.length === 0
                      ? 'Ahora no compartís nada'
                      : `${activos.length} ${activos.length === 1 ? 'pedido ve' : 'pedidos ven'} datos de tu casa`
                  }
                  href="/hogar/compartidos/"
                />
                <FilaEnlace
                  icono="medalla"
                  titulo="El camino de tu casa"
                  sub={
                    hitos.length
                      ? `${hechos} de ${hitos.length} · se avanza cuidando la casa`
                      : 'Se avanza cuidando la casa'
                  }
                  href="/camino/"
                  tono="amarillo"
                />
              </div>
            </>
          )}
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}
