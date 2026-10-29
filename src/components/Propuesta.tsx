'use client';

import type { EspecialistaResumen } from '@/contracts/v1/pedidos';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { pesos, porcentaje } from '@/domain/dinero';
import { VERIFICACION_TEXTO, etiquetaPropuesta } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { Icono } from './Icono';
import { Enlace, ruta } from './nav';
import { Contador } from './Contador';
import { useAhora } from './SesionProvider';
import { Pastilla } from './ui';

/** Datos profesionales autorizados. "Verificado" solo con dato real; sin rankings ni claims de matrícula. */
export function PerfilProfesional({ e }: { e: EspecialistaResumen }) {
  return (
    <div>
      <strong>{e.nombrePublico}</strong>
      <ul className="etiquetas" aria-label="Verificaciones">
        {e.verificaciones.length ? (
          e.verificaciones.map((v) => (
            <li key={v.tipo} className="etiqueta-v">
              <Icono nombre="verificado" />
              {VERIFICACION_TEXTO[v.tipo] ?? v.tipo}
            </li>
          ))
        ) : (
          <li className="texto-suave">Todavía sin verificaciones registradas</li>
        )}
      </ul>
      {e.trabajosRealizados !== null ? (
        <p className="texto-suave" style={{ margin: '6px 0 0' }}>
          {e.trabajosRealizados}{' '}
          {e.trabajosRealizados === 1 ? 'trabajo realizado' : 'trabajos realizados'} en Handy
        </p>
      ) : null}
    </div>
  );
}

/** Vigencia de una propuesta: cuenta regresiva si falta menos de una hora; si no, la fecha. */
export function Vigencia({ hasta }: { hasta: string }) {
  const ahora = useAhora(1000);
  const falta = Date.parse(hasta) - ahora;
  if (falta <= 0) return <span>venció</span>;
  return falta < 3_600_000 ? (
    <span>
      vence en <Contador hasta={hasta} formato="corto" />
    </span>
  ) : (
    <span>vence el {cuando(hasta)}</span>
  );
}

export function ResumenMonto({ p }: { p: Propuesta }) {
  return (
    <>
      <p className="importe" style={{ margin: '4px 0' }}>
        {pesos(p.monto.centavos)}
      </p>
      <p style={{ margin: 0 }}>
        Comisión de Handy: <strong>{pesos(p.comisionHandy.importe.centavos)}</strong> (
        {porcentaje(p.comisionHandy.bp)}) · pagás directo al especialista
      </p>
    </>
  );
}

export function TarjetaPropuesta({ p, destacar = false }: { p: Propuesta; destacar?: boolean }) {
  const e = etiquetaPropuesta(p);
  const propia = p.autorRol === 'usuario';
  return (
    <li>
      <article
        className="tarjeta"
        aria-label={`Propuesta de ${p.especialista.nombrePublico}`}
        style={destacar ? { borderColor: 'var(--color-azul)', borderWidth: 2 } : undefined}
      >
        <div className="tarjeta__cuerpo">
          <div className="tarjeta__fila">
            <PerfilProfesional e={p.especialista} />
            <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
              {propia ? `Tu contrapropuesta · ${e.texto}` : e.texto}
            </Pastilla>
          </div>
          <ResumenMonto p={p} />
          <p style={{ margin: '8px 0 0' }}>
            {p.horario ? (
              <>
                Horario: <strong>{cuando(p.horario.inicio)}</strong>
              </>
            ) : (
              'El especialista declara su horario al aceptar.'
            )}
          </p>
          <p className="texto-suave" style={{ margin: '6px 0 0' }}>
            {p.estado === 'pendiente' ? (
              <Vigencia hasta={p.venceEn} />
            ) : (
              `Respondida: ${p.respondidaEn ? cuando(p.respondidaEn) : '—'}`
            )}
          </p>
        </div>
        <Enlace className="tarjeta__franja" href={ruta('/propuestas/detalle/', { id: p.id })}>
          {p.estado === 'pendiente' && !propia ? 'Ver y responder' : 'Ver detalle'}
        </Enlace>
      </article>
    </li>
  );
}
