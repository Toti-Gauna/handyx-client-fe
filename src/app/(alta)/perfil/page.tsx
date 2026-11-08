'use client';

import { useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { CamposPerfil, ErroresPerfil, usePerfil } from '@/components/FormPerfil';
import { useIr } from '@/components/nav';
import { activarPush, estadoPush, suscribirPush, type EstadoPush } from '@/data/push';
import { Boton, FilaEnlace, MosaicoIcono, Nota } from '@/ui';
import { PantallaPaso } from '@/ui/acceso';

type Paso = 'datos' | 'zona' | 'avisos';

/** Después del alta sigue «Armá tu casa» (opcional); «después» salta al final del alta. */
const SIGUIENTE = '/casa/';
const DESPUES = '/registro/listo/';

const RESULTADO_AVISOS: Partial<Record<EstadoPush, string>> = {
  concedido: 'Listo: te vamos a avisar en este celular.',
  denegado:
    'No hay problema: los avisos los ves igual adentro de la app. Si cambiás de idea, se activan desde los ajustes del navegador.',
  no_soportado: 'Este navegador no permite avisos. Los ves igual adentro de la app.',
  ios_sin_instalar:
    'En iPhone, los avisos funcionan con la app instalada en la pantalla de inicio. Mientras tanto, los ves adentro de la app.',
};

const AVISOS = [
  { icono: 'etiqueta', titulo: 'Propuestas nuevas', sub: 'Cuando un especialista te responde' },
  {
    icono: 'calendario',
    titulo: 'Turno y llegada',
    sub: 'El día antes y cuando sale para tu casa',
  },
  { icono: 'hogar', titulo: 'Recordatorios del hogar', sub: 'Mantenimientos que conviene hacer' },
] as const;

/**
 * Datos mínimos del alta (fila A del lienzo, pasos 3 a 5): nombre › zona (a mano o con un permiso puntual, nunca en
 * segundo plano) › avisos (pre-permiso: el navegador pregunta solo después de tocar «Permitir avisos»). Sin DNI ni
 * documentos. Lo demás del perfil se completa después, en Cuenta.
 */
export default function Perfil() {
  const ir = useIr();
  const perfil = usePerfil();
  const push = useSyncExternalStore<EstadoPush | null>(suscribirPush, estadoPush, () => null);
  const [paso, setPaso] = useState<Paso>('datos');
  const [avisos, setAvisos] = useState<{ trabajando: boolean; texto: string | null }>({
    trabajando: false,
    texto: null,
  });

  async function guardarY(grupo: 1 | 3, siguiente: Paso) {
    if (await perfil.guardar([grupo])) setPaso(siguiente);
  }

  async function pedirAvisos() {
    setAvisos({ trabajando: true, texto: null });
    try {
      const r = await activarPush();
      setAvisos({ trabajando: false, texto: RESULTADO_AVISOS[r] ?? null });
    } catch (e) {
      setAvisos({ trabajando: false, texto: e instanceof Error ? e.message : null });
    }
  }

  const despues = (
    <Boton href={DESPUES} variante="contorno">
      Completar después
    </Boton>
  );

  if (paso === 'datos')
    return (
      <PantallaPaso
        titulo="¿Cómo te ==llamás==?"
        sub="Solo lo justo para coordinar un arreglo en tu casa."
        barra={{ titulo: 'Tus datos', sub: 'Paso 3 de 5' }}
        paso={3}
        total={5}
        onSubmit={() => void guardarY(1, 'zona')}
        pie={
          <>
            <Boton type="submit" ocupado={perfil.pendiente}>
              Seguir
            </Boton>
            {despues}
          </>
        }
      >
        <div className="ds-grilla" style={{ '--ds-gap': '0.75rem' } as CSSProperties}>
          <CamposPerfil perfil={perfil} grupos={[1]} />
        </div>
        <ErroresPerfil perfil={perfil} />
        <Nota icono="candado">
          No te pedimos documentos. Tu nombre lo ve el especialista que elijas, cuando se acuerda el
          turno.
        </Nota>
      </PantallaPaso>
    );

  if (paso === 'zona')
    return (
      <PantallaPaso
        titulo="¿En qué ==zona== estás?"
        tam={1.75}
        sub="Mové el mapa hasta tu puerta o escribí la calle y el número."
        barra={{
          titulo: 'Tu zona',
          sub: 'Paso 4 de 5',
          atras: { alTocar: () => setPaso('datos') },
        }}
        paso={4}
        total={5}
        onSubmit={() => void guardarY(3, 'avisos')}
        pie={
          <>
            <Boton type="submit" ocupado={perfil.pendiente}>
              Seguir
            </Boton>
            {despues}
          </>
        }
      >
        <CamposPerfil perfil={perfil} grupos={[3]} compacto />
        <ErroresPerfil perfil={perfil} />
        <Nota icono="candado">
          Los especialistas ven solo la zona aproximada. La dirección exacta se comparte cuando
          aceptás una propuesta.
        </Nota>
      </PantallaPaso>
    );

  const puedePreguntar = push === 'pendiente' && !avisos.texto;
  const estado = avisos.texto ?? (push && push !== 'pendiente' ? RESULTADO_AVISOS[push] : null);
  return (
    <PantallaPaso
      titulo="¿Te ==avisamos==?"
      sub="Solo lo que te sirve. Nada de publicidad."
      barra={{ titulo: 'Avisos', sub: 'Paso 5 de 5', atras: { alTocar: () => setPaso('zona') } }}
      paso={5}
      total={5}
      pie={
        puedePreguntar ? (
          <>
            <Boton icono="campana" ocupado={avisos.trabajando} onClick={() => void pedirAvisos()}>
              Permitir avisos
            </Boton>
            <Boton variante="contorno" onClick={() => ir(SIGUIENTE)}>
              Ahora no
            </Boton>
          </>
        ) : (
          <Boton onClick={() => ir(SIGUIENTE)}>Seguir</Boton>
        )
      }
    >
      <MosaicoIcono icono="campana" tam={4} tono="amarillo" />
      <div className="ds-pila" style={{ '--ds-gap': '0' } as CSSProperties}>
        {AVISOS.map((a) => (
          <FilaEnlace key={a.titulo} icono={a.icono} titulo={a.titulo} sub={a.sub} />
        ))}
      </div>
      {estado ? (
        <Nota
          tono={push === 'concedido' ? 'exito' : 'gris'}
          icono={push === 'concedido' ? 'checkCirculo' : 'info'}
          rol="status"
        >
          {estado}
        </Nota>
      ) : (
        <Nota icono="info">
          Si tocás «Permitir avisos», el celular te va a preguntar. Los avisos dentro de la app
          están siempre, actives o no los del celular.
        </Nota>
      )}
    </PantallaPaso>
  );
}
