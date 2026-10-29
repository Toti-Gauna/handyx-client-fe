'use client';

import Image from 'next/image';
import { Icono } from '@/components/Icono';
import { ModalFee } from '@/components/ModalFee';
import { Enlace, ruta } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { TarjetaDePedido, TarjetaDeTrabajo } from '@/components/TarjetaPedido';
import { Titulo } from '@/components/Titulo';
import { Aviso, Cargando, ErrorEstado } from '@/components/ui';
import { RUBROS } from '@/contracts/v1/pedidos';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO, TIPOS_INFO } from '@/domain/etiquetas';

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
        <section aria-labelledby="prio">
          <h2 id="prio" className="subtitulo">
            Tu trabajo en curso
          </h2>
          <ul className="lista-tarjetas">
            <TarjetaDeTrabajo t={enCurso} rubro={pedidoPorId(enCurso.pedidoId)?.rubro ?? null} />
          </ul>
        </section>
      ) : conPropuestas ? (
        <section aria-labelledby="prio">
          <h2 id="prio" className="subtitulo">
            Tenés propuestas
          </h2>
          <ul className="lista-tarjetas">
            <TarjetaDePedido p={conPropuestas} />
          </ul>
        </section>
      ) : buscando ? (
        <section aria-labelledby="prio">
          <h2 id="prio" className="subtitulo">
            Tu pedido
          </h2>
          <ul className="lista-tarjetas">
            <TarjetaDePedido p={buscando} />
          </ul>
        </section>
      ) : proximo ? (
        <section aria-labelledby="prio">
          <h2 id="prio" className="subtitulo">
            Tu próximo turno
          </h2>
          <ul className="lista-tarjetas">
            <TarjetaDeTrabajo t={proximo} />
          </ul>
        </section>
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
              {RUBROS_INFO[r].corto}
            </Enlace>
          </li>
        ))}
      </ul>

      <h2 className="subtitulo">Quiero…</h2>
      <div className="acciones">
        {(['urgente', 'programado', 'obra'] as const).map((t) => (
          <Enlace key={t} href={ruta('/pedir/', { tipo: t })} className="boton boton--claro">
            {TIPOS_INFO[t].nombre}: {TIPOS_INFO[t].texto.split('.')[0]?.toLowerCase()}
          </Enlace>
        ))}
      </div>

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
