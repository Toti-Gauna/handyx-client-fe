'use client';
// Hojas de decisión sobre la propuesta (C-Aceptar / C-Rechazar): se abren sobre la propuesta oscurecida. Aceptar pide
// deslizar o el botón alternativo (WCAG 2.5.7); el foco arranca en el título, así un Enter apurado no confirma nada.
import { DeslizarConfirmar } from '@/components/Deslizar';
import { horarioCorto, totalDe } from '@/components/Propuesta';
import { Aviso, Hoja } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import type { ErrorCliente } from '@/data/cliente';
import { porcentaje } from '@/domain/dinero';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Avatar, Boton, Monto, Texto } from '@/ui';
import { QueSigue } from '@/ui/pedir';

const primer = (p: Propuesta) => p.especialista.nombrePublico.split(/\s+/)[0] ?? '';

export function HojaAceptar({
  p,
  abierta,
  onCerrar,
  onAceptar,
  pendiente,
  error,
}: {
  p: Propuesta;
  abierta: boolean;
  onCerrar: () => void;
  onAceptar: () => Promise<boolean>;
  pendiente: boolean;
  error: ErrorCliente | null;
}) {
  const cotizacion = p.tipo === 'cotizacion';
  const visita = p.detalle?.oferta === 'visita';
  const rubro = p.especialista.rubros[0];
  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={
        !cotizacion
          ? 'Aceptar el cambio'
          : visita
            ? `¿Aceptás la visita de ${primer(p)}?`
            : `¿Aceptás la propuesta de ${primer(p)}?`
      }
    >
      <div className="ds ds-pila" style={{ ['--ds-gap' as string]: '0.875rem' }}>
        <div className="ds-tarjeta" style={{ flexDirection: 'row', alignItems: 'center', boxShadow: 'none' }}>
          <Avatar nombre={p.especialista.nombrePublico} tam={2.75} />
          <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
            <strong>
              {primer(p)}
              {rubro ? ` · ${RUBROS_INFO[rubro].nombre}` : ''}
            </strong>
            <span className="ds-sub">{horarioCorto(p)}</span>
          </span>
          <Monto centavos={totalDe(p)} tam={1.375} />
        </div>
        {cotizacion ? (
          <QueSigue
            pasos={[
              {
                icono: 'candado',
                titulo: `${primer(p)} ve tu dirección exacta`,
                sub: 'Solo para este trabajo',
              },
              {
                icono: 'cerrar',
                titulo: 'Las otras propuestas se cierran',
                sub: 'Les avisamos, sin dar motivos',
              },
              {
                icono: 'billete',
                titulo: 'Pagás directo al terminar',
                sub: 'Mercado Pago o efectivo · Handyx no toca la plata',
              },
            ]}
          />
        ) : null}
        <Texto>
          {cotizacion
            ? 'Aceptar crea el trabajo con exactamente estas condiciones. Cualquier cambio después necesita otra propuesta que la otra parte acepte.'
            : 'Mientras no aceptes, sigue valiendo el acuerdo actual.'}
        </Texto>
        <p className="ds-sub">
          Tarifa de Handyx: {porcentaje(p.comisionHandy.bp)} hasta el 10/12/2026. Directo al
          especialista: lo elegís cuando termina el trabajo.
        </p>
        {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
        <DeslizarConfirmar
          texto="Deslizá para aceptar"
          cargando={pendiente}
          onConfirmar={onAceptar}
        />
        <Boton icono="check" ocupado={pendiente} onClick={() => void onAceptar()}>
          Sí, acepto estas condiciones
        </Boton>
        <Boton variante="contorno" onClick={onCerrar}>
          Volver
        </Boton>
      </div>
    </Hoja>
  );
}

export function HojaRechazar({
  p,
  abierta,
  onCerrar,
  onRechazar,
  pendiente,
  error,
}: {
  p: Propuesta;
  abierta: boolean;
  onCerrar: () => void;
  onRechazar: () => void;
  pendiente: boolean;
  error: ErrorCliente | null;
}) {
  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={`¿Rechazás la propuesta de ${primer(p)}?`}
    >
      <div className="ds ds-pila" style={{ ['--ds-gap' as string]: '0.875rem' }}>
        <Texto>
          Le avisamos a {primer(p)} con un mensaje amable, sin dar motivos. Podés seguir con las
          otras propuestas.
        </Texto>
        {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
        <Boton variante="peligro" icono="cerrar" ocupado={pendiente} onClick={onRechazar}>
          Sí, rechazar
        </Boton>
        <Boton variante="contorno" onClick={onCerrar}>
          Volver
        </Boton>
      </div>
    </Hoja>
  );
}
