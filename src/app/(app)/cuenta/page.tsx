'use client';

import { useState, useSyncExternalStore } from 'react';
import { Contador } from '@/components/Contador';
import { Enlace } from '@/components/nav';
import { instalar, puedeInstalar, puedeInstalarServidor, suscribirInstalacion } from '@/components/red';
import { useSesion } from '@/components/SesionProvider';
import { useConsulta } from '@/data/hooks';
import { resumirFee } from '@/domain/fee';
import { Boton, FilaEnlace, Nota } from '@/ui';
import { CabeceraCuenta, PantallaM } from '@/ui/mensajes';

/**
 * Cuenta (lienzo X-Cuenta): se entra desde el avatar del Inicio. Cabecera con tus iniciales y tus números reales,
 * el menú y la tarifa de la demo con su contador (tercer lugar donde se avisa). Sin foto de perfil (el contrato no la
 * tiene) y sin «modo especialista» hasta que exista su app.
 */
export default function Cuenta() {
  const { sesion, fee, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const resumen = resumirFee(fee);
  const instalable = useSyncExternalStore(suscribirInstalacion, puedeInstalar, puedeInstalarServidor);
  const trabajos = useConsulta('trabajos', { consulta: { limite: 50 } });
  const pedidos = useConsulta('pedidos', { consulta: { limite: 50 } });
  const camino = useConsulta('camino', {});
  const segunda = useConsulta('segundaVerificacion', {});
  const p = sesion.perfil;
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ') || 'Tu cuenta';
  const zona = p.ubicacion ? [p.ubicacion.barrio, p.ubicacion.ciudad].filter(Boolean).join(' · ') : '';
  const hitos = camino.datos?.hitos;
  const datos =
    trabajos.datos && pedidos.datos
      ? [
          { valor: String(trabajos.datos.items.length), texto: trabajos.datos.items.length === 1 ? 'trabajo' : 'trabajos' },
          { valor: String(pedidos.datos.items.filter((x) => x.tipo === 'obra').length), texto: 'obras' },
          ...(hitos?.length
            ? [{ valor: `${hitos.filter((h) => h.estado === 'hecho').length}/${hitos.length}`, texto: 'tu camino' }]
            : []),
        ]
      : [];

  return (
    <PantallaM
      arriba={<CabeceraCuenta nombre={nombre} zona={zona} datos={datos} volver={{ href: '/inicio/', etiqueta: 'Volver al inicio' }} />}
    >
      <div className="ds-cuerpo">
        {sesion.cuenta.estado === 'perfil_incompleto' ? (
          <Enlace href="/perfil/" className="ds-boton ds-boton--amarillo ds-boton--ancho">
            Falta completar tu perfil
          </Enlace>
        ) : null}
        {sesion.cuenta.estado === 'baja_solicitada' ? (
          <Nota icono="info" tono="amarillo">
            Pediste eliminar tu cuenta. <Enlace href="/cuenta/baja/">Ver el estado de la solicitud</Enlace>.
          </Nota>
        ) : null}
        <nav aria-label="Tu cuenta" className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
          <FilaEnlace icono="usuario" titulo="Tus datos y direcciones" sub="Nombre, nacimiento y dirección" href="/cuenta/datos/" />
          <FilaEnlace
            icono="candado"
            titulo="Seguridad"
            sub={
              segunda.datos
                ? segunda.datos.activa
                  ? 'Segunda verificación activa'
                  : 'Segunda verificación apagada'
                : 'Verificación y sesiones abiertas'
            }
            href="/cuenta/seguridad/"
          />
          <FilaEnlace icono="billete" titulo="Pagos registrados" sub="Sin tarjetas guardadas" href="/cuenta/pagos/" />
          <FilaEnlace icono="campana" titulo="Avisos" sub="Propuestas, turnos y recordatorios" href="/cuenta/notificaciones/" />
          <FilaEnlace icono="escudo" titulo="Privacidad" sub="Tus datos, HandIA y borrar la cuenta" href="/cuenta/privacidad/" />
          <FilaEnlace icono="pregunta" titulo="Ayuda" sub="Preguntas y Soporte" href="/ayuda/" />
        </nav>
        {instalable ? (
          <FilaEnlace
            icono="abajo"
            titulo="Instalá Handyx en este celular"
            sub="Queda en la pantalla de inicio y se abre como una app."
            tono="amarillo"
            onClick={() => void instalar()}
          />
        ) : null}
        <section aria-label="Tarifa de servicio">
          <Nota icono="billete" tono="gris">
            {resumen.tipo === 'demo' ? (
              resumen.cuenta.terminada ? (
                <>
                  Tarifa de servicio: la demo terminó. Todavía no hay una tarifa aprobada: te avisamos antes de
                  aplicar cualquier cambio.
                </>
              ) : (
                <>
                  Tarifa de servicio: {resumen.porcentajeUsuario} hasta el {resumen.hasta}. Faltan{' '}
                  <Contador hasta={fee?.vigente?.vigenteHasta ?? ''} />. No es un descuento: el servicio del
                  especialista se paga entero. Si algo cambia, te avisamos antes.{' '}
                  <Enlace href="/cuenta/tarifa/">Ver condiciones</Enlace>
                </>
              )
            ) : (
              'No pudimos cargar la tarifa.'
            )}
          </Nota>
        </section>
        <Boton
          variante="contorno"
          icono="salir"
          ocupado={saliendo}
          onClick={async () => {
            setSaliendo(true);
            try {
              await cerrarSesion();
            } finally {
              setSaliendo(false);
            }
          }}
        >
          Cerrar sesión
        </Boton>
        <p className="ds-m-nota-centro">Cerrar sesión no elimina tu cuenta.</p>
      </div>
    </PantallaM>
  );
}
