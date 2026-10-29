'use client';

import type { Importe } from '@/contracts/v1/comunes';
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

type ComisionHandy = Propuesta['comisionHandy'];

/** Iniciales para el avatar ("Especialista 1" → "E1"). Sin foto: el contrato no expone fotos de perfil. */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return partes
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();
}

export function Avatar({ nombre, grande = false }: { nombre: string; grande?: boolean }) {
  return (
    <span className={`avatar${grande ? ' avatar--grande' : ''}`} aria-hidden="true">
      {iniciales(nombre)}
    </span>
  );
}

/** Verificaciones tal como las informa el backend. Sin datos, no se afirma nada. */
export function Verificaciones({ e }: { e: EspecialistaResumen }) {
  return (
    <ul className="etiquetas" aria-label="Verificaciones registradas">
      {e.verificaciones.length ? (
        e.verificaciones.map((v) => (
          <li key={v.tipo} className="etiqueta-v">
            <Icono nombre="verificado" />
            {VERIFICACION_TEXTO[v.tipo] ?? v.tipo}
          </li>
        ))
      ) : (
        <li className="etiqueta-v etiqueta-v--sin">Todavía sin verificaciones registradas</li>
      )}
    </ul>
  );
}

/** Datos profesionales autorizados. "Verificado" solo con dato real; sin rankings ni claims de matrícula. */
export function PerfilProfesional({ e }: { e: EspecialistaResumen }) {
  return (
    <div className="perfil-pro">
      <Avatar nombre={e.nombrePublico} />
      <div className="perfil-pro__datos">
        <strong className="perfil-pro__nombre">{e.nombrePublico}</strong>
        <Verificaciones e={e} />
        {e.trabajosRealizados !== null ? (
          <p className="perfil-pro__trabajos">
            {e.trabajosRealizados}{' '}
            {e.trabajosRealizados === 1 ? 'trabajo realizado' : 'trabajos realizados'} en Handy
          </p>
        ) : null}
      </div>
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

/**
 * Desglose de un importe. La tarifa de Handy es la del usuario (`usuarioBp`) y la calcula el servidor; el total es
 * la suma, sin redondeos propios. El precio del especialista se le paga entero, directo a él.
 */
export function Desglose({
  monto,
  comision,
  etiquetaTotal = 'Total para vos',
}: {
  monto: Importe;
  comision: ComisionHandy;
  etiquetaTotal?: string;
}) {
  const total = monto.centavos + comision.importe.centavos;
  return (
    <dl className="desglose">
      <div className="desglose__fila">
        <dt>Precio del especialista</dt>
        <dd>{pesos(monto.centavos)}</dd>
      </div>
      <div className="desglose__fila">
        <dt>Tarifa de Handy ({porcentaje(comision.bp)})</dt>
        <dd>{pesos(comision.importe.centavos)}</dd>
      </div>
      <div className="desglose__fila desglose__total">
        <dt>{etiquetaTotal}</dt>
        <dd className="importe">{pesos(total)}</dd>
      </div>
    </dl>
  );
}

/** Condiciones que se aceptan junto con el precio: horario y vigencia, en una caja propia. */
export function Condiciones({ p }: { p: Propuesta }) {
  return (
    <ul className="condiciones">
      <li>
        <Icono nombre="calendario" />
        <span>
          <span className="condiciones__rotulo">Horario</span>
          {p.horario ? cuando(p.horario.inicio) : 'Lo declara el especialista al aceptar'}
        </span>
      </li>
      <li>
        <Icono nombre="reloj" />
        <span>
          <span className="condiciones__rotulo">
            {p.estado === 'pendiente' ? 'Vigencia' : 'Respondida'}
          </span>
          {p.estado === 'pendiente' ? (
            <Vigencia hasta={p.venceEn} />
          ) : p.respondidaEn ? (
            cuando(p.respondidaEn)
          ) : (
            '—'
          )}
        </span>
      </li>
    </ul>
  );
}

/**
 * Tarjeta de una propuesta (lista de propuestas y chat). No acepta ni rechaza: eso se hace en el detalle, con el
 * desglose completo y una confirmación explícita.
 */
export function TarjetaPropuesta({ p, destacar = false }: { p: Propuesta; destacar?: boolean }) {
  const e = etiquetaPropuesta(p);
  const propia = p.autorRol === 'usuario';
  const total = p.monto.centavos + p.comisionHandy.importe.centavos;
  return (
    <article
      className={`tarjeta tarjeta-prop${destacar ? ' tarjeta-prop--destacada' : ''}`}
      aria-label={`${propia ? 'Tu contrapropuesta a' : 'Propuesta de'} ${p.especialista.nombrePublico}`}
    >
      <div className="tarjeta__cuerpo">
        <div className="tarjeta-prop__cab">
          <PerfilProfesional e={p.especialista} />
          <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
            {propia ? `Tu contrapropuesta · ${e.texto}` : e.texto}
          </Pastilla>
        </div>
        <div className="tarjeta-prop__monto">
          <span className="tarjeta-prop__rotulo">Total para vos</span>
          <span className="importe">{pesos(total)}</span>
          <span className="tarjeta-prop__nota">
            Precio {pesos(p.monto.centavos)} + tarifa de Handy{' '}
            {pesos(p.comisionHandy.importe.centavos)} ({porcentaje(p.comisionHandy.bp)})
          </span>
        </div>
        <Condiciones p={p} />
        <p className="tarjeta-prop__alcance">
          <span className="condiciones__rotulo">Incluye</span>
          {p.alcance}
        </p>
      </div>
      <Enlace className="tarjeta__franja" href={ruta('/propuestas/detalle/', { id: p.id })}>
        {p.estado === 'pendiente' && !propia ? 'Ver y responder' : 'Ver detalle'}
        <Icono nombre="derecha" />
      </Enlace>
    </article>
  );
}
