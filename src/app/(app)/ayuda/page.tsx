'use client';

import { Enlace } from '@/components/nav';
import { Encabezado } from '@/components/Titulo';
import { Aviso } from '@/components/ui';
import { PREGUNTAS } from '@/content/textos';

export default function Ayuda() {
  return (
    <>
      <Encabezado
        titulo="==Ayuda=="
        volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
      />
      {PREGUNTAS.map((q) => (
        <details key={q.p} className="tarjeta" style={{ padding: '12px 16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 800, color: 'var(--color-tinta)' }}>
            {q.p}
          </summary>
          <p style={{ margin: '10px 0 0' }}>{q.r}</p>
        </details>
      ))}
      <h2 className="subtitulo">¿Algo salió mal?</h2>
      <div className="acciones">
        <Enlace className="boton" href="/reclamos/nuevo/">
          Abrir un reclamo
        </Enlace>
      </div>
      <h2 className="subtitulo">HandIA</h2>
      <Aviso tipo="info" titulo="Desactivada por ahora">
        El asistente con inteligencia artificial no está disponible: no enviamos datos personales a
        servicios de IA. Para consultas, abrí un reclamo o escribile al equipo que te invitó a la
        demo.
      </Aviso>
    </>
  );
}
