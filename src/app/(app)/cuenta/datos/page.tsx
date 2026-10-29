'use client';

import { FormPerfil } from '@/components/FormPerfil';
import { Encabezado } from '@/components/Titulo';

export default function MisDatos() {
  return (
    <>
      <Encabezado
        titulo="Mis ==datos=="
        volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
      />
      <p className="texto-suave">
        Lo que falta queda vacío: no inventamos datos. No pedimos DNI ni documentos.
      </p>
      <FormPerfil />
    </>
  );
}
