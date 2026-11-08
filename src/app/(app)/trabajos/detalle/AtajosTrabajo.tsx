'use client';

import { useState } from 'react';
import { ruta } from '@/components/nav';
import { Acordado } from '@/components/Trabajo';
import { Hoja } from '@/components/ui';
import { Atajos } from '@/ui/seguimiento';
import type { ContextoTrabajo } from './contexto';

/** Tres atajos grises: escribirle, pedir ayuda y ver lo acordado (que se abre en una hoja). */
export function AtajosTrabajo({ c }: { c: ContextoTrabajo }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <Atajos
        etiqueta={`Hablar con ${c.esp} o ver el acuerdo`}
        items={[
          {
            icono: 'chat',
            texto: 'Mensaje',
            href: ruta('/chats/conversacion/', { id: c.t.conversacionId }),
          },
          { icono: 'pregunta', texto: 'Ayuda', href: '/soporte/' },
          { icono: 'documento', texto: 'Acuerdo', onClick: () => setAbierta(true) },
        ]}
      />
      <Hoja abierta={abierta} onCerrar={() => setAbierta(false)} titulo="Lo acordado">
        <Acordado t={c.t} propuestas={c.propuestas} />
      </Hoja>
    </>
  );
}
