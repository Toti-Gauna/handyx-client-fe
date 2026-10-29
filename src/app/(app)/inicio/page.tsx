'use client';

import Image from 'next/image';
import { Icono } from '@/components/Icono';
import { ModalFee } from '@/components/ModalFee';
import { Enlace, ruta } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Aviso, Cargando, ErrorEstado } from '@/components/ui';
import { RUBROS } from '@/contracts/v1/pedidos';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO, TIPOS_INFO, etiquetaPedido, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import type { NombreIcono } from '@/components/trazos';

const ICONO_TIPO: Record<'urgente' | 'programado' | 'obra', NombreIcono> = {
  urgente: 'reloj',
  programado: 'calendario',
  obra: 'ladrillos',
};

/** Lo primero que hay que mirar o decidir, en el panel azul de la demo. Una sola prioridad a la vez. */
function PanelPrioridad({
  rotulo,
  titulo,
  detalle,
  accion,
  href,
}: {
  rotulo: string;
  titulo: string;
  detalle: string;
  accion: string;
  href: string;
}) {
  return (
    <section className="panel-marca" aria-labelledby="prioridad">
      <p className="panel-marca__rotulo">{rotulo}</p>
      <h2 id="prioridad" className="panel-marca__titulo">
        {titulo}
      </h2>
      <p className="panel-marca__texto">{detalle}</p>
      <Enlace className="boton boton--amarillo" href={href}>
        {accion}
        <Icono nombre="derecha" />
      </Enlace>
    </section>
  );
}

export default function Inicio() {
  const { sesion } = useSesion();
  const trabajos = useConsulta('trabajos', { consulta: { limite: 20 } }, { cada: 12_000 });
  const pedidos = useConsulta(
    'pedidos',
    { consulta: { vista: 'activos', limite: 10 } },
    { cada: 8_000 },
  );
  const ciudad = sesion.perfil.ubicacion?.ciudad ?? null;
  const cobertura = useConsulta('cobertura', ciudad ? { consulta: { ciudad } } : null);
  const incompleto = sesion.cuenta.estado === 'perfil_incompleto';
  const sinCobertura = cobertura.datos?.cubierta === false;
  const puedePedir = !incompleto && !sinCobertura && sesion.cuenta.estado === 'activa';

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
  const cargando = trabajos.estado === 'cargando' || pedidos.estado === 'cargando';
  const sinHistorial = trabajos.datos?.items.length === 0 && pedidos.datos?.items.length === 0;
  const pedidoPorId = (id: string) => pedidos.datos?.items.find((p) => p.id === id);
  const rubroDe = (pedidoId: string) => {
    const r = pedidoPorId(pedidoId)?.rubro;
    return r ? `${RUBROS_INFO[r].nombre} con ` : '';
  };

  return (
    <>
      <ModalFee />
      <Titulo texto={`Hola${sesion.perfil.nombre ? `, ${sesion.perfil.nombre}` : ''}`} />

      {incompleto ? (
        <Aviso tipo="alerta" titulo="Completá tu perfil para pedir">
          <p>
            Te falta{' '}
            {sesion.pendientes.camposPerfil.length ? 'completar tus datos' : 'aceptar los textos'}.
            Son pocos.
          </p>
          <Enlace className="boton boton--chico" href="/perfil/">
            Completar ahora
          </Enlace>
        </Aviso>
      ) : null}
      {sinCobertura ? (
        <Aviso tipo="info" titulo={`Todavía no llegamos a ${ciudad}`}>
          Empezamos en Mar del Plata. Guardamos tu ciudad como interés; por ahora no podés pedir
          servicios ahí.
        </Aviso>
      ) : null}

      {trabajos.estado === 'error' && trabajos.error ? (
        <ErrorEstado error={trabajos.error} onReintentar={trabajos.recargar} />
      ) : null}
      {cargando ? <Cargando /> : null}

      {enCurso ? (
        <PanelPrioridad
          rotulo="Tu trabajo en curso"
          titulo={`${rubroDe(enCurso.pedidoId)}${enCurso.especialista.nombrePublico}`}
          detalle={etiquetaTrabajo(enCurso).texto}
          accion="Ver el trabajo"
          href={ruta('/trabajos/detalle/', { id: enCurso.id })}
        />
      ) : conPropuestas ? (
        <PanelPrioridad
          rotulo="Para resolver"
          titulo={`${conPropuestas.propuestasPendientes} ${
            conPropuestas.propuestasPendientes === 1 ? 'propuesta' : 'propuestas'
          } para tu pedido`}
          detalle={`${RUBROS_INFO[conPropuestas.rubro].nombre} · ${TIPOS_INFO[conPropuestas.tipo].nombre}. Nada queda acordado hasta que aceptes.`}
          accion="Ver propuestas"
          href={ruta('/pedidos/propuestas/', { pedido: conPropuestas.id })}
        />
      ) : buscando ? (
        <PanelPrioridad
          rotulo="Tu pedido"
          titulo={`${RUBROS_INFO[buscando.rubro].nombre} · ${etiquetaPedido(buscando).texto}`}
          detalle="Te avisamos cuando llegue una propuesta. No hay tiempos garantizados."
          accion="Ver el pedido"
          href={ruta('/pedidos/detalle/', { id: buscando.id })}
        />
      ) : proximo ? (
        <PanelPrioridad
          rotulo="Tu próximo turno"
          titulo={proximo.acuerdo.horario ? cuando(proximo.acuerdo.horario.inicio) : 'A coordinar'}
          detalle={`${rubroDe(proximo.pedidoId)}${proximo.especialista.nombrePublico}`}
          accion="Ver el trabajo"
          href={ruta('/trabajos/detalle/', { id: proximo.id })}
        />
      ) : null}

      <h2 className="subtitulo">¿Qué necesitás?</h2>
      <ul className="mosaicos" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {RUBROS.map((r) => (
          <li key={r} style={{ display: 'grid' }}>
            <Enlace
              href={puedePedir ? ruta('/pedir/', { rubro: r }) : '/pedir/'}
              className="mosaico"
            >
              <Icono nombre={RUBROS_INFO[r].icono} />
              <span aria-hidden="true">{RUBROS_INFO[r].corto}</span>
              <span className="sr-only">{RUBROS_INFO[r].nombre}</span>
            </Enlace>
          </li>
        ))}
      </ul>

      <h2 className="subtitulo">¿Para cuándo?</h2>
      <ul className="lista-opciones">
        {(['urgente', 'programado', 'obra'] as const).map((t) => (
          <li key={t}>
            <Enlace href={ruta('/pedir/', { tipo: t })} className="opcion-enlace">
              <Icono nombre={ICONO_TIPO[t]} />
              <span>
                <span className="opcion__titulo">{TIPOS_INFO[t].nombre}</span>
                <span className="opcion__texto">{TIPOS_INFO[t].texto}</span>
              </span>
              <Icono nombre="derecha" />
            </Enlace>
          </li>
        ))}
      </ul>

      {sinHistorial ? (
        <div className="estado">
          <Image
            className="estado__handy"
            src="/img/handys-grupo.webp"
            alt=""
            width={200}
            height={130}
            style={{ width: 200, height: 'auto' }}
          />
          <p style={{ margin: 0 }}>
            <strong>Todavía no pediste nada.</strong> Elegí un rubro para empezar. No te mostramos
            especialistas hasta que haya propuestas reales.
          </p>
        </div>
      ) : null}
    </>
  );
}
