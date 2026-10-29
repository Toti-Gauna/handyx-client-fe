'use client';

import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Aviso } from '@/components/ui';
import { resumirFee, textoFee } from '@/domain/fee';

/** Aviso del fee 0 % (1 de 3 lugares): inmediatamente después del registro. */
export default function RegistroListo() {
  const { fee } = useSesion();
  const resumen = resumirFee(fee);
  return (
    <>
      <Titulo texto="¡Listo, ya tenés ==cuenta==!" />
      {resumen.tipo === 'demo' ? (
        <Aviso
          tipo="info"
          titulo={`Tarifa de Handy: ${resumen.porcentajeUsuario} hasta el ${resumen.hasta}`}
          rol="status"
        >
          <p>{textoFee(resumen)}</p>
          <p>
            No es un descuento sobre el precio del especialista: es lo que cobra Handy. Te avisamos
            antes de que cambie cualquier condición.
          </p>
        </Aviso>
      ) : (
        <Aviso tipo="alerta">
          Todavía no pudimos cargar las condiciones de la tarifa. Las vas a ver en Cuenta.
        </Aviso>
      )}
      <p>
        Para pedir un servicio necesitamos algunos datos tuyos. Son pocos y podés completarlos ahora
        o después.
      </p>
      <div className="acciones">
        <Enlace href="/perfil/" className="boton">
          Completar mi perfil
        </Enlace>
        <Enlace href="/inicio/" className="boton boton--claro">
          Lo hago después
        </Enlace>
      </div>
    </>
  );
}
