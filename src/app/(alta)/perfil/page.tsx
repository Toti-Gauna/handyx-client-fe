'use client';

import { FormPerfil } from '@/components/FormPerfil';
import { useIr } from '@/components/nav';
import { Titulo } from '@/components/Titulo';

export default function Perfil() {
  const ir = useIr();
  return (
    <>
      <Titulo texto="Completá tu ==perfil==" />
      <p className="texto-suave">
        No pedimos DNI ni documentos. Estos datos son los mínimos para coordinar un trabajo en tu
        casa.
      </p>
      <FormPerfil
        modo="pasos"
        alTerminar={() => ir('/inicio/', { reemplazar: true })}
        alPosponer={() => ir('/inicio/', { reemplazar: true })}
      />
    </>
  );
}
