'use client';

import { useState } from 'react';
import { CabeceraInicio, Pantalla } from '@/components/hx';
import { MapaHx } from '@/components/MapaHx';
import { ModalFee } from '@/components/ModalFee';
import { Enlace, ruta } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { TituloDocumento } from '@/components/TituloDocumento';
import { ErrorEstado, Hoja } from '@/components/ui';
import { RUBROS } from '@/contracts/v1/pedidos';
import { TAREAS } from '@/content/inicio';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Boton, Mosaico, Nota, Titulo } from '@/ui';
import { ChipDireccion, MosaicoTarea, TarjetaHandia } from '@/ui/inicio';
import { TicketPedido, TicketPropuestas, TicketTrabajo } from './tickets';

/**
 * Inicio (Fase 7, lienzo design/usuario · I-Inicio): cabecera blanca con avisos y la cuenta, la dirección en un chip,
 * «¿Qué necesitás hoy?», los seis rubros con íconos de línea, lo que está en curso como ticket, la tarjeta de HandIA y
 * las tareas de «Quiero…». Una sola decisión por mosaico: tocar y empezar el pedido.
 */
export default function Inicio() {
  const { sesion } = useSesion();
  const [verDireccion, setVerDireccion] = useState(false);
  const trabajos = useConsulta('trabajos', { consulta: { limite: 20 } }, { cada: 12_000 });
  const pedidos = useConsulta(
    'pedidos',
    { consulta: { vista: 'activos', limite: 10 } },
    { cada: 8_000 },
  );
  const ubicacion = sesion.perfil.ubicacion;
  const ciudad = ubicacion?.ciudad ?? null;
  const cobertura = useConsulta('cobertura', ciudad ? { consulta: { ciudad } } : null);
  const incompleto = sesion.cuenta.estado === 'perfil_incompleto';
  const sinCobertura = cobertura.datos?.cubierta === false;
  const puedePedir = !incompleto && !sinCobertura && sesion.cuenta.estado === 'activa';
  const destino = (params: Record<string, string>) =>
    puedePedir ? ruta('/pedir/', params) : '/pedir/';

  const rubroDe = (pedidoId: string) =>
    pedidos.datos?.items.find((p) => p.id === pedidoId)?.rubro ?? null;
  const enCurso = trabajos.datos?.items.find((t) =>
    ['en_camino', 'en_sitio', 'en_curso', 'terminado_por_especialista'].includes(t.estado),
  );
  const proximo = trabajos.datos?.items
    .filter((t) => t.estado === 'agendado')
    .sort((a, b) =>
      (a.acuerdo.horario?.inicio ?? '').localeCompare(b.acuerdo.horario?.inicio ?? ''),
    )[0];
  const conPropuestas = pedidos.datos?.items.find((p) => p.estado === 'con_propuestas');
  const buscando = pedidos.datos?.items.find((p) =>
    ['buscando', 'sin_respuesta', 'busqueda_manual'].includes(p.estado),
  );

  const direccion = ubicacion
    ? [ubicacion.direccion, ubicacion.barrio].filter(Boolean).join(' · ')
    : 'Agregá tu dirección';

  return (
    <Pantalla arriba={<CabeceraInicio />}>
      <TituloDocumento texto="Inicio" />
      <ModalFee />
      <div className="ds ds-cuerpo ds-cuerpo--raiz dsi-inicio">
        <ChipDireccion
          texto={direccion}
          etiqueta={`Tu dirección: ${direccion}. Ver o cambiar`}
          onTocar={() => setVerDireccion(true)}
        />
        <Hoja abierta={verDireccion} onCerrar={() => setVerDireccion(false)} titulo="Tu dirección">
          {ubicacion?.coordenadas ? (
            <MapaHx
              modo="ver"
              centro={ubicacion.coordenadas}
              etiqueta="Mapa: tu casa"
              clase="du-direccion-mapa"
            />
          ) : (
            <p className="texto-suave">Todavía no marcaste tu casa en el mapa.</p>
          )}
          <p>
            <strong>{ubicacion?.direccion ?? 'Sin dirección'}</strong>
            {ubicacion ? (
              <>
                <br />
                {[ubicacion.barrio, ubicacion.ciudad].filter(Boolean).join(', ')}
              </>
            ) : null}
          </p>
          <p className="texto-suave">
            Solo la ve el especialista que elijas, cuando se acuerda el trabajo.
          </p>
          <Boton href="/cuenta/datos/?editar=1" icono="editar">
            Cambiar la dirección
          </Boton>
        </Hoja>

        <div className="dsi-inicio__titulo">
          <Titulo texto="¿Qué necesitás ==hoy==?" />
        </div>

        {incompleto ? (
          <Nota tono="amarillo" icono="alerta">
            <strong>Completá tu perfil para pedir.</strong> Te falta{' '}
            {sesion.pendientes.camposPerfil.length ? 'completar tus datos' : 'aceptar los textos'}.{' '}
            <Enlace href="/perfil/">Completar ahora</Enlace>
          </Nota>
        ) : null}
        {sinCobertura ? (
          <Nota>
            Todavía no llegamos a {ciudad}. Empezamos en Mar del Plata: guardamos tu ciudad como
            interés y te avisamos cuando lleguemos.
          </Nota>
        ) : null}

        <div
          className="ds-grilla"
          style={{ ['--ds-cols' as string]: 3 }}
          role="group"
          aria-label="Rubros"
        >
          {RUBROS.map((r) => (
            <Mosaico
              key={r}
              icono={RUBROS_INFO[r].icono}
              texto={RUBROS_INFO[r].corto}
              href={destino({ rubro: r })}
            />
          ))}
        </div>

        {trabajos.estado === 'error' && trabajos.error ? (
          <ErrorEstado error={trabajos.error} onReintentar={trabajos.recargar} />
        ) : trabajos.estado === 'cargando' ? (
          <p className="dsi-cargando" role="status">
            Buscando tu actividad…
          </p>
        ) : enCurso ? (
          <TicketTrabajo
            t={enCurso}
            sobre="Trabajo en curso"
            accion="Seguir el trabajo"
            rubro={rubroDe(enCurso.pedidoId)}
          />
        ) : conPropuestas ? (
          <TicketPropuestas p={conPropuestas} />
        ) : buscando ? (
          <TicketPedido p={buscando} />
        ) : proximo ? (
          <TicketTrabajo
            t={proximo}
            sobre="Tu próximo turno"
            accion="Ver el turno"
            rubro={rubroDe(proximo.pedidoId)}
          />
        ) : null}

        <TarjetaHandia />

        <h2 className="dsi-inicio__quiero">Quiero…</h2>
        <div className="ds-grilla" role="group" aria-label="Arreglos frecuentes">
          {TAREAS.map((t) => (
            <MosaicoTarea
              key={t.id}
              icono={t.icono}
              texto={t.texto}
              href={destino({ rubro: t.rubro, tarea: t.id })}
            />
          ))}
        </div>
        <Nota tono="gris">
          Son tareas, no rubros nuevos: cada una la toma un especialista del rubro que corresponde.
        </Nota>
        {pedidos.estado === 'error' && pedidos.error && trabajos.estado !== 'error' ? (
          <ErrorEstado error={pedidos.error} onReintentar={pedidos.recargar} />
        ) : null}
      </div>
    </Pantalla>
  );
}
