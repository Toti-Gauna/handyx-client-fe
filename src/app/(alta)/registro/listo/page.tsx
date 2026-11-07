'use client';

import { Escena, Flujo } from '@/components/acceso';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Aviso } from '@/components/ui';
import { resumirFee, textoFee } from '@/domain/fee';

/** "¡Listo!" (rediseño 3.2). Aviso del fee 0 % (1 de 3 lugares): inmediatamente después del registro. */
export default function RegistroListo() {
  const { fee } = useSesion();
  const resumen = resumirFee(fee);
  return (
    <Flujo
      titulo="¡Listo, ya tenés ==cuenta==!"
      sub="Para pedir un servicio necesitamos algunos datos tuyos. Son pocos y podés completarlos ahora o después."
      clase="du-listo"
      ilustracion={<Escena handy="handys-grupo" ancho={600} alto={311} tilde />}
      pie={
        <>
          <Enlace href="/perfil/" className="hd-boton">
            Completar mi perfil
          </Enlace>
          <Enlace href="/inicio/" className="hd-boton hd-boton--fantasma">
            Lo hago después
          </Enlace>
        </>
      }
    >
      {resumen.tipo === 'demo' ? (
        <div className="hd-tarjeta hd-tarjeta--amarillo du-fee" role="status">
          <span className="du-fee__ico" aria-hidden="true">
            <Icono nombre="etiqueta" />
          </span>
          <span>
            <strong>
              Tarifa de Handy: {resumen.porcentajeUsuario} hasta el {resumen.hasta}
            </strong>
            <small>{textoFee(resumen)}</small>
            <small>
              No es un descuento sobre el precio del especialista: es lo que cobra Handy. Te
              avisamos antes de que cambie cualquier condición.
            </small>
          </span>
        </div>
      ) : (
        <Aviso tipo="alerta">
          Todavía no pudimos cargar las condiciones de la tarifa. Las vas a ver en Cuenta.
        </Aviso>
      )}
    </Flujo>
  );
}
