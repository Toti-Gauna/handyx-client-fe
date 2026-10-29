'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta, useIr } from '@/components/nav';
import { useAhora } from '@/components/SesionProvider';
import { Encabezado } from '@/components/Titulo';
import { Aviso, Boton, Campo, Cargando, Datos, ErrorEstado, Vacio } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { centavosDePesos, erroresDe } from '@/domain/formularios';
import { cuando, hoyEnArgentina, instanteBA } from '@/domain/fechas';

export default function CambiarTrabajo() {
  const id = useSearchParams().get('id');
  const t = useConsulta('trabajo', id ? { parametros: { id } } : null);
  if (!id)
    return (
      <Vacio titulo="Falta el trabajo">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (t.estado === 'cargando') return <Cargando />;
  if (t.estado === 'error' && t.error)
    return <ErrorEstado error={t.error} onReintentar={t.recargar} />;
  return t.datos ? <Formulario t={t.datos} /> : null;
}

function Formulario({ t }: { t: Trabajo }) {
  const ir = useIr();
  const ahora = useAhora(60_000);
  const hoy = hoyEnArgentina(new Date(ahora));
  const { enviar, pendiente, error } = useEnvio();
  const [cambiaTurno, setCambiaTurno] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cambiaMonto, setCambiaMonto] = useState(false);
  const [monto, setMonto] = useState('');
  const [alcance, setAlcance] = useState(t.acuerdo.alcance);
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };

  async function proponer(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!cambiaTurno && !cambiaMonto && alcance.trim() === t.acuerdo.alcance)
      n.general = 'Elegí qué querés cambiar.';
    if (cambiaTurno && (!fecha || !hora)) n.horario = 'Elegí día y hora.';
    const centavos = cambiaMonto ? centavosDePesos(monto) : t.acuerdo.monto.centavos;
    if (!centavos) n.monto = 'Escribí un importe en pesos.';
    setLocal(n);
    if (Object.keys(n).length || !centavos) return;
    const cuerpo = {
      montoCentavos: centavos,
      alcance: alcance.trim(),
      horario: cambiaTurno ? { inicio: instanteBA(fecha, hora), fin: null } : t.acuerdo.horario,
    };
    const r = await enviar(
      'trabajoProponerCambio',
      { parametros: { id: t.id }, cuerpo },
      JSON.stringify(cuerpo),
    );
    if (r?.ok) ir(ruta('/trabajos/detalle/', { id: t.id }), { reemplazar: true });
  }

  return (
    <>
      <Encabezado
        titulo="Cambiar ==turno o condiciones=="
        volver={{ href: ruta('/trabajos/detalle/', { id: t.id }), etiqueta: 'Volver al trabajo' }}
      />
      <section className="tarjeta">
        <div className="tarjeta__cuerpo">
          <p className="tarjeta__titulo">Lo acordado hoy</p>
          <Datos
            filas={[
              ['Precio', pesos(t.acuerdo.monto.centavos)],
              ['Horario', t.acuerdo.horario ? cuando(t.acuerdo.horario.inicio) : 'A coordinar'],
            ]}
          />
        </div>
      </section>
      <Aviso tipo="info">
        Es una <strong>propuesta</strong>: el acuerdo actual sigue valiendo hasta que{' '}
        {t.especialista.nombrePublico} la acepte. Si la rechaza, no cambia nada.
      </Aviso>
      <form onSubmit={proponer} noValidate>
        {errores.general ? <Aviso tipo="alerta">{errores.general}</Aviso> : null}
        <label className="opcion">
          <input
            type="checkbox"
            checked={cambiaTurno}
            onChange={(e) => setCambiaTurno(e.target.checked)}
          />
          <span>
            <span className="opcion__titulo">Cambiar el día o la hora</span>
          </span>
        </label>
        {cambiaTurno ? (
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
        <label className="opcion">
          <input
            type="checkbox"
            checked={cambiaMonto}
            onChange={(e) => setCambiaMonto(e.target.checked)}
          />
          <span>
            <span className="opcion__titulo">Cambiar el precio</span>
          </span>
        </label>
        {cambiaMonto ? (
          <Campo etiqueta="Precio nuevo" error={errores.monto ?? errores.montoCentavos} requerido>
            {(c) => (
              <input
                {...c}
                className="entrada"
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            )}
          </Campo>
        ) : null}
        <Campo etiqueta="Qué incluye" error={errores.alcance}>
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
        {error && !Object.keys(erroresDe(error)).length ? (
          <Aviso tipo={error.codigo === 'conflicto' ? 'alerta' : 'error'}>{error.mensaje}</Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Enviar la propuesta
          </Boton>
          <Enlace className="boton boton--claro" href={ruta('/trabajos/detalle/', { id: t.id })}>
            Volver
          </Enlace>
        </div>
      </form>
    </>
  );
}
