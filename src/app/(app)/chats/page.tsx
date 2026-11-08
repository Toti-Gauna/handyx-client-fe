'use client';

import { useMemo, useState } from 'react';
import { ruta } from '@/components/nav';
import { useAhora } from '@/components/SesionProvider';
import { TituloDocumento } from '@/components/TituloDocumento';
import { Cargando, ErrorEstado } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { diaMes, horaDeInstante } from '@/domain/fechas';
import { Avatar, Nota, Titulo } from '@/ui';
import { AvatarAsistente, CampoBuscar, PantallaM, coincide, etiquetaDia } from '@/ui/mensajes';
import { FilaConversacion } from './_piezas';

/**
 * Mensajes (lienzo M-Mensajes): las conversaciones con especialistas, HandIA para armar un pedido y el soporte.
 * El contrato no trae el último mensaje: la línea de abajo dice en qué momento está la conversación.
 */
export default function Chats() {
  const lista = useConsulta('conversaciones', { consulta: { limite: 50 } }, { cada: 5_000 });
  const ahora = useAhora(60_000);
  const [buscar, setBuscar] = useState('');
  const filas = useMemo(
    () =>
      (lista.datos?.items ?? []).filter((c) =>
        coincide(
          `${c.especialista.nombrePublico} ${c.especialista.rubros.map((r) => RUBROS_INFO[r].nombre).join(' ')}`,
          buscar,
        ),
      ),
    [lista.datos, buscar],
  );
  const hora = (i: string | null) =>
    !i ? undefined : etiquetaDia(i, ahora) === 'Hoy' ? horaDeInstante(i) : diaMes(i);
  const mostrarFijas = coincide('HandIA tu asistente soporte de Handyx equipo', buscar);

  return (
    <PantallaM
      arriba={
        <header className="ds ds-pila" style={{ padding: '1.25rem 1rem 0.5rem' }}>
          <TituloDocumento texto="Mensajes" />
          <Titulo texto="==Mensajes==" tam={2} />
          <CampoBuscar
            valor={buscar}
            onCambio={setBuscar}
            etiqueta="Buscar en mensajes"
            placeholder="Buscar en mensajes"
          />
        </header>
      }
    >
      <div className="ds-cuerpo ds-cuerpo--raiz">
        {lista.estado === 'error' && lista.error ? (
          <ErrorEstado error={lista.error} onReintentar={lista.recargar} />
        ) : lista.estado === 'cargando' ? (
          <Cargando />
        ) : (
          <ul className="ds-m-lista">
            {mostrarFijas ? (
              <FilaConversacion
                href="/handia/"
                titulo="HandIA"
                rubro="Tu asistente"
                previa="Te ayuda a armar un pedido"
                fijada
                avatar={<AvatarAsistente />}
              />
            ) : null}
            {filas.map((c) => {
              const e = c.especialista;
              return (
                <FilaConversacion
                  key={c.id}
                  href={ruta('/chats/conversacion/', { id: c.id })}
                  titulo={e.nombrePublico}
                  rubro={e.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ')}
                  previa={c.trabajoId ? 'Trabajo contratado' : 'Antes de contratar'}
                  {...(hora(c.ultimoMensajeEn) ? { hora: hora(c.ultimoMensajeEn)! } : {})}
                  sinLeer={c.noLeidos}
                  avatar={<Avatar nombre={e.nombrePublico} tam={3} />}
                />
              );
            })}
            {mostrarFijas ? (
              <FilaConversacion
                href="/soporte/"
                titulo="Soporte de Handyx"
                rubro="Personas del equipo"
                previa="Escribile al equipo"
                avatar={<Avatar nombre="Handyx" tam={3} tono={5} />}
              />
            ) : null}
          </ul>
        )}
        {lista.estado === 'ok' && !filas.length && !mostrarFijas ? (
          <p className="ds-texto" role="status">
            No encontramos mensajes con «{buscar}».
          </p>
        ) : null}
        <Nota icono="candado" tono="gris">
          Los chats se abren cuando hay un pedido o una obra. Nadie te puede escribir por fuera de
          eso.
        </Nota>
      </div>
    </PantallaM>
  );
}
