'use client';

import { useSearchParams } from 'next/navigation';
import { Barra, Pantalla } from '@/components/hx';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Aviso } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { fechaDeInstante, fechaLarga, horaDeInstante } from '@/domain/fechas';
import { pesos } from '@/domain/dinero';
import { AccionesFijas, Boton, Nota, Tarjeta, Titulo } from '@/ui';
import { useObra } from '../compartido';

/**
 * Cambio de fecha de la obra: lo propone el especialista (o vos) como un cambio del acuerdo. Mientras no se acepte,
 * vale el horario actual.
 */
export default function FechaObra() {
  const o = useObra({ exigirObra: false });
  const propuestaId = useSearchParams().get('propuesta');
  const directa = useConsulta('propuesta', propuestaId ? { parametros: { id: propuestaId } } : null);
  const accion = useEnvio();
  const ir = useIr();
  const { t } = o;
  if (o.carga || !t) return o.carga;
  const esp = t.especialista.nombrePublico;
  const volver = { href: ruta('/obras/detalle/', { id: t.id }), etiqueta: 'Volver a la obra' };
  const candidata = directa.datos ?? o.pendientes.find((x) => x.tipo === 'cambio_acuerdo') ?? null;
  const p =
    candidata && candidata.tipo === 'cambio_acuerdo' && candidata.estado === 'pendiente' && candidata.trabajoId === t.id
      ? candidata
      : null;
  const dia = (i: string) => (
    <>
      {fechaLarga(fechaDeInstante(i))}
      <br />
      {horaDeInstante(i)} h
    </>
  );
  const antes = t.acuerdo.horario?.inicio ?? null;
  const nuevo = p?.horario?.inicio ?? null;
  const cambiaPrecio = p !== null && p.monto.centavos !== t.acuerdo.monto.centavos;
  const suyo = p?.autorRol === 'especialista';

  async function responder(que: 'propuestaAceptar' | 'propuestaRechazar') {
    if (!p) return;
    const r = await accion.enviar(
      que,
      { parametros: { id: p.id }, cuerpo: { version: p.version } },
      `${p.id}|${p.version}|${que}`,
    );
    if (r?.ok) ir(volver.href, { reemplazar: true });
  }

  return (
    <Pantalla
      arriba={<Barra titulo="Cambio de fecha" volver={volver} sub={p ? (suyo ? `Lo propone ${esp}` : 'Lo propusiste vos') : undefined} />}
      pie={
        <AccionesFijas>
          {p && suyo ? (
            <>
              <Boton icono="check" ocupado={accion.pendiente} onClick={() => void responder('propuestaAceptar')}>
                Aprobar el cambio
              </Boton>
              <div className="ds-grilla">
                <Boton variante="contorno" chico href={ruta('/trabajos/cambiar/', { id: t.id })}>
                  Proponer otro día
                </Boton>
                <Boton variante="peligro" chico icono="cerrar" ocupado={accion.pendiente} onClick={() => void responder('propuestaRechazar')}>
                  No, gracias
                </Boton>
              </div>
            </>
          ) : (
            <Boton icono="calendario" href={ruta('/trabajos/cambiar/', { id: t.id })}>
              Proponer otro día
            </Boton>
          )}
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        {p ? (
          <>
            <div className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
              <Titulo nivel={2} texto={suyo ? '¿Aceptás el ==cambio==?' : 'Tu ==cambio== espera respuesta'} tam={1.75} />
              <p className="ds-sub">Mientras no se acepte, sigue valiendo el horario actual.</p>
            </div>
            {antes && nuevo ? (
              <div className="dss-cambio" role="group" aria-label="Antes y propuesto">
                <span>
                  <span className="ds-etiqueta">ANTES</span>
                  <strong style={{ display: 'block', textDecoration: 'line-through' }}>{dia(antes)}</strong>
                </span>
                <span>
                  <span className="ds-etiqueta" style={{ color: 'inherit' }}>PROPUESTO</span>
                  <strong style={{ display: 'block' }}>{dia(nuevo)}</strong>
                </span>
              </div>
            ) : (
              <Nota icono="info">Este cambio no trae un día nuevo: mirá el detalle.</Nota>
            )}
            <Tarjeta etiqueta="Qué dice el cambio">
              <span className="ds-etiqueta">QUÉ DICE EL CAMBIO</span>
              <blockquote className="dss-cita">{p.alcance}</blockquote>
            </Tarjeta>
            {cambiaPrecio ? (
              <Nota icono="alerta" tono="amarillo">
                También cambia el precio: de {pesos(t.acuerdo.monto.centavos)} a {pesos(p.monto.centavos)}. Mirá el{' '}
                <Enlace href={ruta('/propuestas/detalle/', { id: p.id })}>detalle completo</Enlace> antes de aceptar.
              </Nota>
            ) : null}
          </>
        ) : (
          <>
            <Titulo nivel={2} texto="Sin cambios de ==fecha==" tam={1.75} />
            <Nota icono="info" rol="status">
              No hay ningún cambio de fecha esperando respuesta. Si hace falta mover algo, proponé otro día y
              {` ${esp}`} lo ve.
            </Nota>
          </>
        )}
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
      </div>
    </Pantalla>
  );
}
