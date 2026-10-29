'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta, useIr } from '@/components/nav';
import { useAhora } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Campo, Cargando, Datos, ErrorEstado, Vacio } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { centavosDePesos, erroresDe } from '@/domain/formularios';
import { cuando, hoyEnArgentina, instanteBA } from '@/domain/fechas';

export default function Contraoferta() {
  const id = useSearchParams().get('id');
  const prop = useConsulta('propuesta', id ? { parametros: { id } } : null);
  if (!id)
    return (
      <Vacio titulo="Falta la propuesta">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (prop.estado === 'cargando') return <Cargando />;
  if (prop.estado === 'error' && prop.error)
    return <ErrorEstado error={prop.error} onReintentar={prop.recargar} />;
  if (!prop.datos) return null;
  return <Formulario p={prop.datos} />;
}

function Formulario({ p }: { p: Propuesta }) {
  const ir = useIr();
  const ahora = useAhora(60_000);
  const hoy = hoyEnArgentina(new Date(ahora));
  const { enviar, pendiente, error } = useEnvio();
  const [monto, setMonto] = useState('');
  const [alcance, setAlcance] = useState(p.alcance);
  const [cambiarHorario, setCambiarHorario] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };

  async function enviarContra(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    const centavos = centavosDePesos(monto);
    if (!centavos) n.monto = 'Escribí un importe en pesos, por ejemplo 40000.';
    if (alcance.trim().length < 5) n.alcance = 'Contá qué incluye.';
    if (cambiarHorario && (!fecha || !hora))
      n.horario = 'Elegí día y hora, o dejá el horario como está.';
    setLocal(n);
    if (Object.keys(n).length || !centavos) return;
    const horario = cambiarHorario ? { inicio: instanteBA(fecha, hora), fin: null } : p.horario;
    const cuerpo = {
      reemplazaA: p.id,
      versionAnterior: p.version,
      montoCentavos: centavos,
      alcance: alcance.trim(),
      horario,
    };
    const r = await enviar(
      'contrapropuesta',
      { parametros: { id: p.id }, cuerpo },
      JSON.stringify(cuerpo),
    );
    if (r?.ok)
      ir(ruta('/chats/conversacion/', { id: r.datos.conversacionId }), { reemplazar: true });
  }

  if (p.estado !== 'pendiente' || p.autorRol !== 'especialista')
    return (
      <>
        <Titulo texto="Contrapropuesta" />
        <Aviso tipo="info" titulo="Ya no se puede contraofertar">
          Esta propuesta {p.estado === 'pendiente' ? 'es tuya' : 'ya se resolvió'}.
        </Aviso>
        <div className="acciones">
          <Enlace className="boton" href={ruta('/propuestas/detalle/', { id: p.id })}>
            Volver a la propuesta
          </Enlace>
        </div>
      </>
    );

  return (
    <>
      <Titulo texto="Hacé tu ==contrapropuesta==" />
      <section className="tarjeta">
        <div className="tarjeta__cuerpo">
          <p className="tarjeta__titulo">La propuesta de {p.especialista.nombrePublico}</p>
          <Datos
            filas={[
              ['Precio', pesos(p.monto.centavos)],
              ['Horario', p.horario ? cuando(p.horario.inicio) : 'A coordinar'],
            ]}
          />
        </div>
      </section>
      <Aviso tipo="info">
        Tu contrapropuesta reemplaza a la anterior. <strong>No hay acuerdo</strong> hasta que{' '}
        {p.especialista.nombrePublico} acepte exactamente estas condiciones.
      </Aviso>
      <form onSubmit={enviarContra} noValidate>
        <Campo
          etiqueta="Precio que proponés"
          error={errores.monto ?? errores.montoCentavos}
          ayuda="En pesos, por el trabajo completo."
          requerido
        >
          {(c) => (
            <input
              {...c}
              className="entrada"
              inputMode="numeric"
              placeholder="40.000"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          )}
        </Campo>
        <Campo etiqueta="Qué incluye" error={errores.alcance} requerido>
          {(c) => (
            <textarea
              {...c}
              className="entrada"
              maxLength={1000}
              value={alcance}
              onChange={(e) => setAlcance(e.target.value)}
            />
          )}
        </Campo>
        <label className="opcion">
          <input
            type="checkbox"
            checked={cambiarHorario}
            onChange={(e) => setCambiarHorario(e.target.checked)}
          />
          <span>
            <span className="opcion__titulo">Proponer otro horario</span>
            <span className="opcion__texto">Si no, queda el de la propuesta.</span>
          </span>
        </label>
        {cambiarHorario ? (
          <div className="fila fila--2">
            <Campo etiqueta="Día" error={errores.horario}>
              {(c) => (
                <input
                  {...c}
                  className="entrada"
                  type="date"
                  min={hoy}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              )}
            </Campo>
            <Campo etiqueta="Hora">
              {(c) => (
                <input
                  {...c}
                  className="entrada"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              )}
            </Campo>
          </div>
        ) : null}
        {error && !Object.keys(erroresDe(error)).length ? (
          <Aviso
            tipo={error.codigo === 'conflicto' ? 'alerta' : 'error'}
            titulo={
              error.conflicto === 'vencida'
                ? 'La propuesta venció'
                : error.conflicto === 'ya_resuelta'
                  ? 'Esto ya se resolvió'
                  : error.conflicto === 'version'
                    ? 'La propuesta cambió'
                    : 'No se pudo enviar'
            }
          >
            <p>{error.mensaje}</p>
            {error.codigo === 'conflicto' ? (
              <Enlace className="enlace-tarjeta" href={ruta('/propuestas/detalle/', { id: p.id })}>
                Ver la propuesta
              </Enlace>
            ) : null}
          </Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Enviar contrapropuesta
          </Boton>
          <Enlace className="boton boton--claro" href={ruta('/propuestas/detalle/', { id: p.id })}>
            Volver
          </Enlace>
        </div>
      </form>
    </>
  );
}
