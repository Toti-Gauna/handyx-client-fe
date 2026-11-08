'use client';

import { useMemo, useState } from 'react';
import { Enlace, ruta } from '@/components/nav';
import { PREGUNTAS } from '@/content/textos';
import type { NombreIcono } from '@/components/trazos';
import { AccionesFijas, Boton, CabeceraAzul, FilaEnlace, Nota, Texto } from '@/ui';
import { CampoBuscar, PantallaM, Pregunta, Tema, coincide } from '@/ui/mensajes';

const TEMAS: readonly { id: string; texto: string; icono: NombreIcono; preguntas: readonly string[] }[] = [
  { id: 'pedir', texto: 'Pedir', icono: 'caja', preguntas: ['elegir', 'sin-respuesta'] },
  { id: 'propuestas', texto: 'Propuestas', icono: 'billete', preguntas: ['elegir', 'confianza'] },
  { id: 'pagos', texto: 'Pagos', icono: 'efectivo', preguntas: ['pagar', 'tarifa'] },
  { id: 'turnos', texto: 'Turnos', icono: 'calendario', preguntas: ['cancelar', 'algo-mal'] },
  { id: 'hogar', texto: 'Mi hogar', icono: 'hogar', preguntas: [] },
  { id: 'cuenta', texto: 'Cuenta', icono: 'usuario', preguntas: ['borrar', 'instalar'] },
];

/**
 * Centro de ayuda (lienzo X-Ayuda): cabecera azul con el buscador, los temas como mosaicos (filtran las preguntas) y
 * las preguntas frecuentes que se abren ahí mismo. Si no está la respuesta, soporte lo atiende una persona.
 */
export default function Ayuda() {
  const [buscar, setBuscar] = useState('');
  const [tema, setTema] = useState<string | null>(null);
  const elegido = TEMAS.find((t) => t.id === tema) ?? null;
  const lista = useMemo(
    () =>
      PREGUNTAS.filter(
        (q) =>
          (!elegido || elegido.preguntas.includes(q.id)) && coincide(`${q.p} ${q.r}`, buscar),
      ),
    [elegido, buscar],
  );

  return (
    <PantallaM
      arriba={
        <CabeceraAzul titulo="¿En qué te ==ayudamos==?" volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}>
          <CampoBuscar
            blanco
            valor={buscar}
            onCambio={setBuscar}
            etiqueta="Buscar en la ayuda"
            placeholder="Buscar: pago, turno, garantía…"
          />
        </CabeceraAzul>
      }
      pie={
        <AccionesFijas>
          <Boton variante="contorno" icono="chat" href="/soporte/">
            Escribirle a Soporte
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds-cuerpo">
        <div className="ds-m-temas" role="group" aria-label="Temas">
          {TEMAS.map((t) => (
            <Tema
              key={t.id}
              icono={t.icono}
              texto={t.texto}
              activo={tema === t.id}
              onClick={() => setTema(tema === t.id ? null : t.id)}
            />
          ))}
        </div>
        <section aria-label="Preguntas frecuentes" aria-live="polite">
          {lista.map((q, i) => (
            <Pregunta key={q.id} texto={q.p} abierta={i === 0 && !buscar && !tema}>
              <p>{q.r}</p>
              <Boton variante="suave" chico ancho={false} href={ruta('/ayuda/respuesta/', { p: q.id })}>
                Ver la respuesta completa
              </Boton>
            </Pregunta>
          ))}
          {!lista.length ? (
            <Texto>
              {elegido?.id === 'hogar' ? (
                <>
                  Mi hogar tiene su propia guía adentro. <Enlace href="/hogar/">Ir a Mi hogar</Enlace>.
                </>
              ) : (
                'No encontramos esa pregunta. Probá con otra palabra o escribile a Soporte.'
              )}
            </Texto>
          ) : null}
        </section>
        <FilaEnlace icono="alerta" titulo="Mis reclamos" sub="Si algo salió mal con un trabajo" href="/reclamos/" />
        <FilaEnlace icono="chispas" titulo="Armar un pedido con HandIA" sub="Te ayuda a contar el problema" href="/handia/" />
        <Nota icono="info" tono="gris">
          Lo atiende una persona del equipo. No prometemos plazos: si es urgente, abrí un reclamo desde el trabajo.
        </Nota>
      </div>
    </PantallaM>
  );
}
