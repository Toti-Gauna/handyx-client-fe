'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta, useIr } from '@/components/nav';
import { useAhora } from '@/components/SesionProvider';
import { BotonHx, Flujo } from '@/components/acceso';
import { Aviso, Campo, Cargando, ErrorEstado, Vacio } from '@/components/ui';
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

  const volver = {
    href: ruta('/propuestas/detalle/', { id: p.id }),
    etiqueta: 'Volver a la propuesta',
  };

  if (p.estado !== 'pendiente' || p.autorRol !== 'especialista')
    return (
      <Flujo
        titulo="==Contrapropuesta=="
        atras={volver}
        pie={
          <Enlace className="hd-boton" href={volver.href}>
            Volver a la propuesta
          </Enlace>
        }
      >
        <Aviso tipo="info" titulo="Ya no se puede contraofertar">
          Esta propuesta {p.estado === 'pendiente' ? 'es tuya' : 'ya se resolvió'}.
        </Aviso>
      </Flujo>
    );

  return (
    <Flujo
      titulo="Hacé tu ==contrapropuesta=="
      sub={
        <>
          Reemplaza a la de {p.especialista.nombrePublico}. <strong>No hay acuerdo</strong> hasta
          que acepte exactamente estas condiciones.
        </>
      }
      atras={volver}
      onSubmit={enviarContra}
      pie={
        <BotonHx type="submit" icono="enviar" cargando={pendiente}>
          Enviar contrapropuesta
        </BotonHx>
      }
    >
      <div className="du-resumen">
        <div className="du-resumen__tile du-resumen__tile--azul">
          <small>Te propone</small>
          <strong>{pesos(p.monto.centavos + p.comisionHandy.importe.centavos)}</strong>
          <span>Total final</span>
        </div>
        <div className="du-resumen__tile">
          <small>Horario</small>
          <strong>{p.horario ? cuando(p.horario.inicio) : 'A coordinar'}</strong>
          <span>{p.especialista.nombrePublico}</span>
        </div>
      </div>
      <Campo
        etiqueta="Precio que proponés"
        error={errores.monto ?? errores.montoCentavos}
        ayuda="En pesos, por el trabajo completo. Lo que le pagás al especialista."
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
            rows={4}
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
        <div className="du-form__fila">
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
            <Enlace className="enlace-tarjeta" href={volver.href}>
              Ver la propuesta
            </Enlace>
          ) : null}
        </Aviso>
      ) : null}
    </Flujo>
  );
}
