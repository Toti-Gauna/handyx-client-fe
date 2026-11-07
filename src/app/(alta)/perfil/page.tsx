'use client';

import { useState, useSyncExternalStore } from 'react';
import { BotonHx, Escena, Flujo } from '@/components/acceso';
import { CamposPerfil, ErroresPerfil, usePerfil } from '@/components/FormPerfil';
import { useGeoPuntual } from '@/components/FormUbicacion';
import { Enlace, useIr } from '@/components/nav';
import { Aviso } from '@/components/ui';
import { activarPush, estadoPush, suscribirPush, type EstadoPush } from '@/data/push';

type Paso = 'datos' | 'vos' | 'permiso-ubicacion' | 'ubicacion' | 'avisos';

const RESULTADO_AVISOS: Partial<Record<EstadoPush, string>> = {
  concedido: 'Listo: te vamos a avisar en este dispositivo.',
  denegado:
    'No hay problema: los avisos los ves igual adentro de la app. Si cambiás de idea, se activan desde los ajustes del navegador.',
  no_soportado: 'Este navegador no permite avisos. Los ves igual adentro de la app.',
  ios_sin_instalar:
    'En iPhone, los avisos funcionan con la app instalada en la pantalla de inicio. Mientras tanto, los ves adentro de la app.',
};

/**
 * Onboarding (rediseño 3.2): nombre › sobre vos › dirección (con el permiso de ubicación explicado antes de que pregunte
 * el navegador) › avisos (pre-permiso, solo si el dispositivo puede preguntar). Sin DNI ni documentos. Al terminar va a
 * Inicio, donde aparece el aviso de la tarifa del primer ingreso.
 */
export default function Perfil() {
  const ir = useIr();
  const perfil = usePerfil();
  const geo = useGeoPuntual(perfil.valores.ubicacion, perfil.set.setUbicacion);
  const push = useSyncExternalStore<EstadoPush | null>(suscribirPush, estadoPush, () => null);
  const [paso, setPaso] = useState<Paso>('datos');
  const [avisos, setAvisos] = useState<{ trabajando: boolean; texto: string | null }>({
    trabajando: false,
    texto: null,
  });
  const conAvisos = paso === 'avisos' || push === 'pendiente';
  const total = conAvisos ? 4 : 3;
  const terminar = () => ir('/inicio/', { reemplazar: true });

  async function guardarY(grupo: 1 | 2 | 3, siguiente: Paso | 'fin') {
    if (!(await perfil.guardar([grupo]))) return;
    if (siguiente === 'fin') terminar();
    else setPaso(siguiente);
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
    <Enlace href="/inicio/" className="hd-boton hd-boton--fantasma">
      Completar después
    </Enlace>
  );
  const enviarCon = (accion: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    accion();
  };

  if (paso === 'datos')
    return (
      <Flujo
        titulo="¿Cómo te ==llamás==?"
        sub="No pedimos DNI ni documentos: solo lo mínimo para coordinar un trabajo en tu casa."
        paso={1}
        total={total}
        onSubmit={enviarCon(() => void guardarY(1, 'vos'))}
        pie={
          <>
            <BotonHx type="submit" cargando={perfil.pendiente}>
              Seguir
            </BotonHx>
            {despues}
          </>
        }
      >
        <CamposPerfil perfil={perfil} grupos={[1]} />
        <ErroresPerfil perfil={perfil} />
      </Flujo>
    );

  if (paso === 'vos')
    return (
      <Flujo
        titulo="Contanos ==sobre vos=="
        sub="Datos básicos de tu cuenta."
        atras={{ alTocar: () => setPaso('datos'), etiqueta: 'Volver al paso anterior' }}
        paso={2}
        total={total}
        onSubmit={enviarCon(() => void guardarY(2, 'permiso-ubicacion'))}
        pie={
          <>
            <BotonHx type="submit" cargando={perfil.pendiente}>
              Seguir
            </BotonHx>
            {despues}
          </>
        }
      >
        <CamposPerfil perfil={perfil} grupos={[2]} />
        <ErroresPerfil perfil={perfil} />
      </Flujo>
    );

  if (paso === 'permiso-ubicacion')
    return (
      <Flujo
        titulo="¿Usamos tu ==ubicación==?"
        sub="Sirve para ubicar tu casa. Te la pedimos una sola vez y solo si querés: no te seguimos ni la usamos en segundo plano."
        atras={{ alTocar: () => setPaso('vos'), etiqueta: 'Volver al paso anterior' }}
        paso={3}
        total={total}
        ilustracion={<Escena handy="handy-cano" ancho={354} alto={405} />}
        pie={
          <>
            <BotonHx
              icono="pin"
              cargando={geo.buscando}
              onClick={async () => {
                await geo.usar();
                setPaso('ubicacion');
              }}
            >
              Usar mi ubicación
            </BotonHx>
            <BotonHx variante="fantasma" onClick={() => setPaso('ubicacion')}>
              Escribirla a mano
            </BotonHx>
          </>
        }
      >
        <p className="du-nota du-nota--permiso">
          Si tocás &quot;Usar mi ubicación&quot;, el navegador te va a preguntar. Podés decir que no
          y escribir la dirección igual.
        </p>
      </Flujo>
    );

  if (paso === 'ubicacion')
    return (
      <Flujo
        titulo="¿Dónde ==es tu casa==?"
        sub="Calle y número, y una referencia si hace falta (piso, timbre, entre calles)."
        atras={{ alTocar: () => setPaso('permiso-ubicacion'), etiqueta: 'Volver al paso anterior' }}
        paso={3}
        total={total}
        onSubmit={enviarCon(() => void guardarY(3, push === 'pendiente' ? 'avisos' : 'fin'))}
        pie={
          <>
            <BotonHx type="submit" cargando={perfil.pendiente}>
              {push === 'pendiente' ? 'Seguir' : 'Terminar'}
            </BotonHx>
            {despues}
          </>
        }
      >
        <CamposPerfil perfil={perfil} grupos={[3]} geo={geo} />
        <ErroresPerfil perfil={perfil} />
      </Flujo>
    );

  return (
    <Flujo
      titulo="¿Te ==avisamos==?"
      sub="Cuando llegan propuestas, mensajes o cambios en un trabajo. Nada de publicidad."
      paso={4}
      total={4}
      ilustracion={<Escena handy="handy-lamparita" ancho={202} alto={346} tono="amarillo" />}
      pie={
        avisos.texto ? (
          <BotonHx onClick={terminar}>Ir al inicio</BotonHx>
        ) : (
          <>
            <BotonHx
              icono="campana"
              cargando={avisos.trabajando}
              onClick={() => void pedirAvisos()}
            >
              Activar avisos
            </BotonHx>
            <BotonHx variante="fantasma" onClick={terminar}>
              Ahora no
            </BotonHx>
          </>
        )
      }
    >
      {avisos.texto ? (
        <Aviso tipo="info" rol="status">
          {avisos.texto}
        </Aviso>
      ) : (
        <p className="du-nota du-nota--permiso">
          Si tocás &quot;Activar avisos&quot;, el navegador te va a preguntar. Los avisos dentro de
          la app están siempre, actives o no los del celular.
        </p>
      )}
    </Flujo>
  );
}
