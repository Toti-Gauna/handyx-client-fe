'use client';

import { FormPerfil } from '@/components/FormPerfil';
import { Titulo } from '@/components/Titulo';

export default function MisDatos() {
  return (
    <>
      <Titulo texto="Mis ==datos==" />
      <p className="texto-suave">
        Lo que falta queda vacío: no inventamos datos. No pedimos DNI ni documentos.
      </p>
      <FormPerfil modo="completo" alTerminar={() => undefined} />
    </>
  );
}
