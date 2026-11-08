'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useIr } from '@/components/nav';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { erroresDe, esEmail } from '@/domain/formularios';
import { Boton, Nota } from '@/ui';
import { CampoCodigo, PantallaPaso } from '@/ui/acceso';
import {
  ESPERA_REENVIO,
  aceptacionesVigentes,
  destinoTrasAcceso,
  pasoPorError,
  textoReenvio,
  type PasoCodigo,
} from './codigo';
import { PasoEmail, TextosLegales } from './PasoEmail';

/** Código ficticio de la vista de prueba (el servidor simulado no manda emails). */
const CODIGO_PRUEBA = '246810';

/** Segundos que faltan para poder reenviar, con la hora del celular (solo es una espera, no una regla). */
function useRestante(desde: number | null): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (desde === null) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [desde]);
  if (desde === null) return 0;
  return Math.min(
    ESPERA_REENVIO,
    Math.max(0, Math.ceil((desde + ESPERA_REENVIO * 1000 - ahora) / 1000)),
  );
}

/**
 * Acceso sin contraseña (fila A del lienzo): email › código de 6 dígitos (› segundo código si la cuenta lo tiene
 * activo). `alta`: «Crear cuenta», pide aceptar los textos antes de mandar el código. `ingreso`: «Ya tengo cuenta»; si
 * el email no tiene cuenta, el servidor lo dice al verificar y se piden los textos ahí (con un código nuevo).
 */
export function FlujoCodigo({
  modo,
  aviso,
}: {
  modo: 'alta' | 'ingreso';
  aviso?: string | undefined;
}) {
  const params = useSearchParams();
  const ir = useIr();
  const { enviar, pendiente, error, limpiar } = useEnvio();
  const [paso, setPaso] = useState<PasoCodigo>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [segundo, setSegundo] = useState('');
  // Sin tildar por defecto: la aceptación tiene que ser un acto explícito.
  const [acepta, setAcepta] = useState(false);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [enviadoEn, setEnviadoEn] = useState<number | null>(null);
  const [vez, setVez] = useState(0);
  const [nuevo, setNuevo] = useState(false);
  const restante = useRestante(enviadoEn);
  const alta = modo === 'alta' || paso === 'textos' || nuevo;
  const total = modo === 'alta' ? 5 : 2;

  async function pedirCodigo(): Promise<boolean> {
    if (!esEmail(email)) {
      setLocal({ email: 'Escribí un email válido, por ejemplo nombre@example.test.' });
      return false;
    }
    if (alta && !acepta) {
      setLocal({ aceptaciones: 'Para crear tu cuenta, tildá la casilla de los textos.' });
      return false;
    }
    setLocal({});
    const r = await enviar('accesoCodigo', { cuerpo: { email: email.trim() } }, `${email}|${vez}`);
    if (!r?.ok) return false;
    setVez((v) => v + 1);
    setEnviadoEn(Date.now());
    setCodigo('');
    setSegundo('');
    setPaso('codigo');
    return true;
  }

  async function verificar() {
    const valor = paso === 'segundo' ? segundo : codigo;
    if (!/^\d{6}$/.test(valor)) {
      setLocal({ [paso]: 'Escribí los 6 números del código.' });
      return;
    }
    setLocal({});
    const cuerpo = {
      email: email.trim(),
      codigo,
      ...(alta && acepta ? { aceptaciones: aceptacionesVigentes() } : {}),
      ...(paso === 'segundo' ? { segundoFactor: segundo } : {}),
    };
    const r = await enviar('accesoVerificar', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) return ir(destinoTrasAcceso(r.datos, params.get('volver')), { reemplazar: true });
    if (!r) return;
    const destino = pasoPorError(r.error);
    if (destino === 'segundo' && paso === 'segundo')
      setLocal({ segundo: 'Ese código no es correcto. Revisalo y probá de nuevo.' });
    else if (destino) {
      if (destino === 'textos') setNuevo(true);
      if (destino !== 'email') limpiar();
      setPaso(destino);
    }
  }

  const errorServidor = error && !error.campos.length ? error.mensaje : null;
  const atras = (p: PasoCodigo) => ({
    alTocar: () => {
      limpiar();
      setLocal({});
      setPaso(p);
    },
  });

  if (paso === 'email' || paso === 'textos')
    return paso === 'email' ? (
      <PasoEmail
        modo={modo}
        aviso={aviso}
        email={email}
        onEmail={setEmail}
        acepta={acepta}
        onAcepta={setAcepta}
        errores={{ ...erroresDe(error), ...local }}
        errorServidor={errorServidor}
        pendiente={pendiente}
        total={total}
        onSeguir={() => void pedirCodigo()}
      />
    ) : (
      <PantallaPaso
        titulo="Tu cuenta es ==nueva=="
        sub={`Todavía no hay una cuenta con ${email.trim()}. Para crearla, aceptá los textos y te mandamos un código nuevo.`}
        barra={{ titulo: 'Crear cuenta', atras: atras('email') }}
        onSubmit={() => void pedirCodigo()}
        pie={
          <Boton type="submit" ocupado={pendiente}>
            Crear mi cuenta
          </Boton>
        }
      >
        <TextosLegales acepta={acepta} onAcepta={setAcepta} error={local.aceptaciones} />
        {errorServidor ? (
          <Nota tono="error" rol="alert">
            {errorServidor}
          </Nota>
        ) : null}
      </PantallaPaso>
    );

  const esSegundo = paso === 'segundo';
  return (
    <PantallaPaso
      titulo={esSegundo ? 'Tu ==segundo== código' : 'Revisá tu ==email=='}
      sub={
        esSegundo
          ? 'Tu cuenta tiene la segunda verificación activa. Escribí el código de tu app autenticadora o del email.'
          : `Mandamos un código de 6 números a ${email.trim()}.`
      }
      barra={{
        titulo: esSegundo ? 'Segunda verificación' : 'Código',
        sub: `Paso 2 de ${total}`,
        atras: atras(esSegundo ? 'codigo' : 'email'),
      }}
      paso={2}
      total={total}
      onSubmit={() => void verificar()}
      pie={
        <Boton type="submit" ocupado={pendiente}>
          {esSegundo ? 'Entrar' : 'Verificar'}
        </Boton>
      }
    >
      {nuevo && !esSegundo ? (
        <Nota tono="exito" icono="sobre" rol="status">
          Te mandamos un código nuevo para crear tu cuenta.
        </Nota>
      ) : null}
      <CampoCodigo
        etiqueta={esSegundo ? 'Código de la segunda verificación' : 'Código de 6 números'}
        valor={esSegundo ? segundo : codigo}
        onCambio={esSegundo ? setSegundo : setCodigo}
        error={local[paso] ?? errorServidor}
      />
      {esSegundo ? null : (
        <button
          type="button"
          className="dsa-enlace"
          disabled={restante > 0 || pendiente}
          onClick={() => void pedirCodigo()}
        >
          {textoReenvio(restante)}
        </button>
      )}
      <Nota icono="escudo">
        El código vence en 10 minutos. Nunca te lo vamos a pedir por teléfono ni por WhatsApp.
      </Nota>
      {esVistaDePrueba ? (
        <Nota tono="amarillo" icono="info">
          Vista de prueba: no se manda ningún email. El código es{' '}
          <strong className="codigo">{CODIGO_PRUEBA}</strong>.
        </Nota>
      ) : null}
    </PantallaPaso>
  );
}
