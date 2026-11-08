'use client';

import { useState } from 'react';
import { Cargando } from '@/components/ui';
import { AVISO_LEGAL_PROVISORIO } from '@/content/textos';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion, useConsulta } from '@/data/hooks';
import { AccionesFijas, Boton, FilaEnlace, Interruptor, Nota, Tarjeta, Texto } from '@/ui';
import { AvatarAsistente, BarraCentro, PantallaM } from '@/ui/mensajes';
import { Exportacion } from './_Exportacion';
import { Textos } from './_Textos';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };

/**
 * Privacidad (lienzo X-Privacidad): HandIA y tus datos, los recordatorios del hogar (se pueden pausar todos), lo que
 * compartiste, descargar mis datos y borrar la cuenta (la baja real, con su estado). Los textos y lo aceptado, abajo.
 */
export default function Privacidad() {
  const recordatorios = useConsulta('recordatorios', {});
  const [error, setError] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState(false);
  const items = recordatorios.datos?.items ?? [];
  const activos = items.some((r) => r.activo);

  async function cambiar(activo: boolean) {
    setCambiando(true);
    setError(null);
    try {
      for (const r of items.filter((x) => x.activo !== activo))
        await cliente.llamar('recordatorioEditar', { parametros: { id: r.id }, cuerpo: { activo } });
    } catch (e) {
      if (e instanceof ErrorCliente) avisarSiSesion(e);
      setError('No pudimos cambiarlos. Probá de nuevo.');
    } finally {
      setCambiando(false);
      recordatorios.recargar();
    }
  }

  return (
    <PantallaM
      arriba={<BarraCentro titulo="Privacidad" volver={VOLVER} />}
      pie={
        <AccionesFijas nota="Se borra todo salvo lo que la ley obliga a guardar.">
          <Boton variante="peligro" icono="tacho" href="/cuenta/baja/">
            Borrar mi cuenta
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds-cuerpo">
        <Nota icono="alerta" tono="amarillo">
          {AVISO_LEGAL_PROVISORIO}
        </Nota>
        <Tarjeta etiqueta="HandIA y tus datos">
          <div className="ds-fila">
            <AvatarAsistente />
            <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
              <strong style={{ fontSize: '1.0625rem' }}>HandIA y tus datos</strong>
              <Texto>
                Funciona en tu celular, sin IA externa. Saca teléfonos, emails y documentos antes de procesar, y
                nunca recibe fotos ni los datos de tu cuenta. Usarla es opcional.
              </Texto>
            </span>
          </div>
        </Tarjeta>
        <div className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
          {recordatorios.estado === 'cargando' ? (
            <Cargando />
          ) : items.length ? (
            <Interruptor
              etiqueta="Recordatorios del hogar"
              sub={cambiando ? 'Cambiando…' : 'Usan tu ficha de la casa. Los podés pausar todos.'}
              activo={activos}
              onCambiar={(v) => void cambiar(v)}
            />
          ) : (
            <Texto>No tenés recordatorios del hogar cargados.</Texto>
          )}
          {error ? (
            <Nota icono="alerta" tono="error" rol="alert">
              {error}
            </Nota>
          ) : null}
          <FilaEnlace
            icono="compartir"
            titulo="Lo que compartiste"
            sub="Medidas y modelo 3D: solo con quien elijas, por pedido"
            href="/hogar/compartidos/"
          />
        </div>
        <Exportacion />
        <Textos />
      </div>
    </PantallaM>
  );
}
