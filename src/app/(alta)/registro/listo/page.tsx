'use client';

import { useSesion } from '@/components/SesionProvider';
import { useConsulta } from '@/data/hooks';
import { resumirFee, textoFee } from '@/domain/fee';
import { Boton, EscenaArreglado, Etiqueta, Monto, Nota, Tarjeta, Texto } from '@/ui';
import { PantallaPaso } from '@/ui/acceso';

/**
 * «¡Listo!» (fin del alta, fila A del lienzo). Aviso del fee 0 % (1 de 3 lugares) con la fecha que da el servidor, y
 * la segunda verificación como opción (solo si todavía no está activa).
 */
export default function RegistroListo() {
  const { sesion, fee } = useSesion();
  const resumen = resumirFee(fee);
  const segunda = useConsulta('segundaVerificacion', {});
  const nombre = sesion.perfil.nombre?.trim();
  const ofrecerSegunda = segunda.datos ? !segunda.datos.activa : false;
  return (
    <PantallaPaso
      titulo={nombre ? `¡Listo, ==${nombre}==!` : '¡==Listo==!'}
      tam={2.125}
      sub="Ya podés pedir tu primer arreglo."
      cabecera={
        <div className="dsa-cabecera">
          <EscenaArreglado alto={300} />
        </div>
      }
      pie={<Boton href="/inicio/">Ir al inicio</Boton>}
    >
      {resumen.tipo === 'demo' ? (
        <Tarjeta
          etiqueta="Tarifa de servicio"
          {...(ofrecerSegunda
            ? {
                pie: {
                  texto: 'Sumar una segunda verificación (opcional)',
                  href: '/registro/segunda/',
                },
              }
            : {})}
        >
          <Etiqueta>Tarifa de servicio</Etiqueta>
          <p className="ds-solo-lector">
            Tarifa de Handy: {resumen.porcentajeUsuario} hasta el {resumen.hasta}
          </p>
          <p
            className="ds-fila"
            aria-hidden="true"
            style={{ alignItems: 'baseline', gap: '0.5rem' }}
          >
            <Monto texto={resumen.porcentajeUsuario} tam={2.125} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>hasta el {resumen.hasta}</span>
          </p>
          <Texto>{textoFee(resumen)}</Texto>
          <Texto>
            No es un descuento sobre el precio del especialista: es lo que cobra Handy. Te avisamos
            antes de que cambie cualquier condición. Handy no recibe ni reparte la plata del
            trabajo.
          </Texto>
        </Tarjeta>
      ) : (
        <Nota tono="amarillo" icono="alerta">
          Todavía no pudimos cargar las condiciones de la tarifa. Las vas a ver en Cuenta.
        </Nota>
      )}
      {resumen.tipo !== 'demo' && ofrecerSegunda ? (
        <Boton href="/registro/segunda/" variante="contorno">
          Sumar una segunda verificación (opcional)
        </Boton>
      ) : null}
    </PantallaPaso>
  );
}
