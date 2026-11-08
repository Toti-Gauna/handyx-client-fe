'use client';

import { Icono } from '@/components/Icono';
import { MapaHx } from '@/components/MapaHx';
import { Enlace } from '@/components/nav';
import { iniciales } from '@/components/Propuesta';
import { TituloDocumento } from '@/components/TituloDocumento';
import { HECHAS_POR_ESTADO, horarioAcordado, pasosTurno } from '@/components/Trabajo';
import { useViaje } from '@/data/hooks';
import { textosViaje } from '@/domain/viaje';
import { Avatar, Chip, Etapas, Nota, Tarjeta } from '@/ui';
import { AtajosTrabajo } from './AtajosTrabajo';
import type { ContextoTrabajo } from './contexto';
import { AvisoError, PedidosPendientes } from './Avisos';

/**
 * En camino: tu casa en el mapa y, solo mientras comparte, la posición, el recorrido y la llegada estimada que manda
 * el servidor (decisión del 31/10). La pantalla no estima ningún tiempo.
 */
export function EnCamino(c: ContextoTrabajo) {
  const { t, esp } = c;
  const vivo = useViaje(t.id, true);
  const enViaje = textosViaje(vivo.viaje, vivo.error, vivo.enVivo);
  const compartiendo = vivo.viaje?.estado === 'compartiendo' ? vivo.viaje : null;
  const casa = c.pedido?.ubicacion.coordenadas ?? null;
  const titulo = `${esp} está en camino`;
  return (
    <div className="pantalla du-app hd-entrando">
      <TituloDocumento texto={titulo} />
      <div className="dss-mapa-zona">
        {casa ? (
          <MapaHx
            modo="ver"
            centro={casa}
            etiqueta={
              compartiendo
                ? `Mapa: tu casa y ${esp}, que viene en camino`
                : 'Mapa: tu casa, donde es el trabajo'
            }
            especialista={
              compartiendo?.ultimaPosicion
                ? { ...compartiendo.ultimaPosicion.punto, iniciales: iniciales(esp) }
                : null
            }
            trayecto={compartiendo?.trayecto?.linea ?? null}
          />
        ) : (
          <div aria-hidden="true" />
        )}
        <Enlace href="/pedidos/" className="ds-cuadro" aria-label="Volver a Actividad">
          <Icono nombre="atras" />
        </Enlace>
      </div>
      <div className="dss-hoja-mapa">
        <div className="ds ds-cuerpo">
          <div className="ds-fila">
            <Avatar nombre={esp} tam={3.25} />
            <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
              <h1 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.1875rem' }} aria-live="polite">
                {titulo}
              </h1>
              <span className="ds-fila-enlace__sub">{enViaje.chip ?? horarioAcordado(t)}</span>
            </span>
            {compartiendo ? (
              <Chip tono="azul" icono="pin">
                En vivo
              </Chip>
            ) : null}
          </div>
          <Nota icono="info" rol="status">
            {enViaje.nota}
          </Nota>
          {enViaje.detalle ? <Nota icono="pin">{enViaje.detalle}</Nota> : null}
          {enViaje.corte ? (
            <Nota icono="alerta" tono="amarillo" rol="status">
              {enViaje.corte}
            </Nota>
          ) : null}
          <Tarjeta etiqueta="Etapas del turno">
            <Etapas pasos={pasosTurno(t)} hechas={HECHAS_POR_ESTADO[t.estado]} etiqueta="Etapas del turno" />
          </Tarjeta>
          <PedidosPendientes c={c} />
          <AvisoError c={c} />
          <Nota icono="escudo" tono="gris">
            Nosotros no seguimos tu ubicación. La del especialista se ve solo mientras viene en camino
            y la comparte.
          </Nota>
          <AtajosTrabajo c={c} />
          <button type="button" className="dss-enlace-texto" onClick={c.abrirCancelar}>
            Cancelar el trabajo
          </button>
        </div>
      </div>
    </div>
  );
}

