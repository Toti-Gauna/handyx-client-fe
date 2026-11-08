'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ruta, useIr } from '@/components/nav';
import { ChipEstadoPropuesta } from '@/components/Propuesta';
import { Aviso, Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { Boton } from '@/ui';
import { AccionBarra, PantallaPedir } from '@/ui/pedir';
import { CuerpoPropuesta, Historial, Quien } from './_Cuerpo';
import { HojaAceptar, HojaRechazar } from './_Hojas';

/**
 * Propuesta (Fase 7 · C-Detalle y C-Visita): quién es (solo verificaciones reales), cuánto y cuándo con el desglose,
 * cómo lo hace, qué incluye y qué no. Aceptar abre la hoja sobre la propuesta oscurecida (deslizar o botón); rechazar,
 * su hoja; «Pedir cambios» es la contrapropuesta. Nada se acepta con un toque apurado.
 */
export default function DetallePropuesta() {
  const params = useSearchParams();
  const id = params.get('id');
  const ir = useIr();
  const prop = useConsulta('propuesta', id ? { parametros: { id } } : null, { cada: 3_000 });
  const pedidoId = prop.datos?.pedidoId ?? null;
  const historial = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const accion = useEnvio();
  // «Aceptar» o «Rechazar» desde la tarjeta abren directamente su hoja (que igual pide confirmar).
  const [hoja, setHoja] = useState<'aceptar' | 'rechazar' | null>(
    (params.get('rechazar') === '1' ? 'rechazar' : null) ??
      (params.get('elegir') === '1' ? 'aceptar' : null),
  );

  if (!id)
    return (
      <Vacio titulo="Falta la propuesta" texto="El enlace está incompleto.">
        <Boton href="/pedidos/" chico>
          Ver mis pedidos
        </Boton>
      </Vacio>
    );
  if (prop.estado === 'cargando') return <Cargando forma="detalle" />;
  if (prop.estado === 'error' && prop.error)
    return <ErrorEstado error={prop.error} onReintentar={prop.recargar} />;
  const p = prop.datos;
  if (!p) return null;
  const e = p.especialista;
  const propia = p.autorRol === 'usuario';
  const decidible = p.estado === 'pendiente' && !propia;
  const visita = p.detalle?.oferta === 'visita';
  const error = accion.error;
  const conflicto = error?.conflicto ?? null;
  const lista = ruta('/pedidos/propuestas/', { pedido: p.pedidoId });

  async function aceptar(): Promise<boolean> {
    if (!p) return false;
    const r = await accion.enviar(
      'propuestaAceptar',
      { parametros: { id: p.id }, cuerpo: { version: p.version } },
      `${p.id}|${p.version}`,
    );
    if (r?.ok) {
      ir(
        p.tipo === 'cotizacion'
          ? ruta('/propuestas/aceptada/', { id: p.id })
          : ruta('/trabajos/detalle/', { id: r.datos.trabajo.id }),
        { reemplazar: true },
      );
      return true;
    }
    if (r) {
      setHoja(null);
      prop.recargar();
    }
    return false;
  }
  async function rechazar() {
    if (!p) return;
    const r = await accion.enviar(
      'propuestaRechazar',
      { parametros: { id: p.id }, cuerpo: { version: p.version } },
      `${p.id}|${p.version}`,
    );
    if (r?.ok && p.tipo === 'cotizacion') ir(lista, { reemplazar: true });
    else if (r) {
      setHoja(null);
      prop.recargar();
    }
  }

  const cadena = (historial.datos?.items ?? [])
    .filter((x) => x.especialista.id === e.id)
    .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn));
  const titulo =
    p.tipo === 'cotizacion'
      ? propia
        ? 'Tu contrapropuesta'
        : visita
          ? 'Visita para presupuestar'
          : 'Propuesta'
      : p.tipo === 'adicional'
        ? 'Un adicional'
        : 'Cambio del acuerdo';
  const volver =
    p.tipo === 'cotizacion'
      ? { href: lista, etiqueta: 'Volver a todas las propuestas' }
      : p.trabajoId
        ? { href: ruta('/trabajos/detalle/', { id: p.trabajoId }), etiqueta: 'Volver al trabajo' }
        : { href: ruta('/pedidos/detalle/', { id: p.pedidoId }), etiqueta: 'Volver al pedido' };
  const abrir = (h: 'aceptar' | 'rechazar') => () => {
    accion.limpiar();
    setHoja(h);
  };

  const pie = decidible ? (
    <>
      <Boton icono="check" onClick={abrir('aceptar')}>
        {visita ? 'Aceptar la visita' : 'Aceptar esta propuesta'}
      </Boton>
      <div className="ds-grilla decision__botones">
        {p.tipo === 'cotizacion' && !visita ? (
          <Boton
            href={ruta('/propuestas/contraoferta/', { id: p.id })}
            variante="contorno"
            icono="editar"
            chico
          >
            Pedir cambios
          </Boton>
        ) : null}
        <Boton variante="peligro" icono="cerrar" chico onClick={abrir('rechazar')}>
          Rechazar
        </Boton>
      </div>
    </>
  ) : p.estado === 'pendiente' && propia ? (
    <Boton href={ruta('/chats/conversacion/', { id: p.conversacionId })} variante="contorno">
      Ir al chat
    </Boton>
  ) : p.estado === 'aceptada' && p.trabajoId ? (
    <Boton href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>Ver el trabajo</Boton>
  ) : (
    <Boton href={lista} variante="contorno">
      Ver las otras propuestas
    </Boton>
  );

  return (
    <PantallaPedir
      titulo={titulo}
      volver={volver}
      sub={p.estado === 'pendiente' ? undefined : <ChipEstadoPropuesta p={p} />}
      accion={
        <AccionBarra
          icono="chat"
          etiqueta={`Escribirle a ${e.nombrePublico}`}
          href={ruta('/chats/conversacion/', { id: p.conversacionId })}
        />
      }
      pie={pie}
    >
      <Quien p={p} />
      {conflicto === 'vencida' ? (
        <Aviso tipo="alerta" titulo="La propuesta venció">
          Ya no se puede aceptar. Mirá si hay otras o pedí una nueva.
        </Aviso>
      ) : null}
      {conflicto === 'ya_resuelta' ? (
        <Aviso tipo="info" titulo="Esto ya se resolvió">
          Otra acción (quizás desde otro celular) ya resolvió este pedido. No se creó otro trabajo.
        </Aviso>
      ) : null}
      {conflicto === 'version' ? (
        <Aviso tipo="alerta" titulo="La propuesta cambió">
          Actualizamos lo que ves. Revisala de nuevo antes de aceptar.
        </Aviso>
      ) : null}
      {error && !conflicto && hoja === null ? (
        <Aviso tipo="error" titulo="No se pudo">
          {error.mensaje}
        </Aviso>
      ) : null}
      <CuerpoPropuesta p={p} />
      <Historial p={p} cadena={cadena} />

      <HojaAceptar
        p={p}
        abierta={hoja === 'aceptar' && decidible}
        onCerrar={() => setHoja(null)}
        onAceptar={aceptar}
        pendiente={accion.pendiente}
        error={hoja === 'aceptar' ? error : null}
      />
      <HojaRechazar
        p={p}
        abierta={hoja === 'rechazar' && decidible}
        onCerrar={() => setHoja(null)}
        onRechazar={() => void rechazar()}
        pendiente={accion.pendiente}
        error={hoja === 'rechazar' ? error : null}
      />
    </PantallaPedir>
  );
}
