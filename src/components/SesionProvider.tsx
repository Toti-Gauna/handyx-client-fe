'use client';

// Sesión de la PWA: perfil, reloj del servidor, avisos sin leer y reingreso cuando la sesión vence.
// La sesión es una cookie HttpOnly del backend; acá solo vive en memoria el estado que devuelve la API.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { EstadoFee } from '@/contracts/v1/fee';
import type { Sesion } from '@/contracts/v1/cuenta';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { emitir, escuchar } from '@/data/eventos';
import { useConsulta, useEnvio } from '@/data/hooks';
import { CUENTA_PRUEBA } from '@/data/prueba';
import { esVistaDePrueba } from '@/data';
import { Campo, Aviso, Boton, Cargando, ErrorEstado, Hoja } from './ui';
import { useIr } from './nav';

interface Contexto {
  readonly sesion: Sesion;
  readonly fee: EstadoFee | null;
  /** Diferencia entre el reloj del servidor y el del celular: todo contador usa la hora del servidor. */
  readonly offsetMs: number;
  readonly noLeidas: number;
  recargar(): void;
  cerrarSesion(): Promise<void>;
}

const Ctx = createContext<Contexto | null>(null);

export function useSesion(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSesion fuera de SesionProvider');
  return c;
}

/** Hora del servidor (ms) que se actualiza cada `cadaMs`. */
export function useAhora(cadaMs = 1000): number {
  const { offsetMs } = useSesion();
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setT(Date.now()), cadaMs);
    return () => clearInterval(i);
  }, [cadaMs]);
  return t + offsetMs;
}

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const ir = useIr();
  const sesionC = useConsulta('sesion', {});
  const feeC = useConsulta('fee', {}, { cada: 30_000 });
  const avisosC = useConsulta('notificaciones', { consulta: { limite: 50 } }, { cada: 12_000 });
  const [vencida, setVencida] = useState(false);
  const vencidaRef = useRef(false);
  useEffect(() => {
    vencidaRef.current = vencida;
  }, [vencida]);

  useEffect(
    () =>
      escuchar('no_autenticado', () => {
        if (vencidaRef.current) return;
        const volver = window.location.pathname + window.location.search;
        ir(`/ingresar/?volver=${encodeURIComponent(volver)}`, { reemplazar: true });
      }),
    [ir],
  );
  useEffect(() => escuchar('sesion_vencida', () => setVencida(true)), []);

  const cerrarSesion = useCallback(async () => {
    try {
      await cliente.llamar('logout', {});
    } catch (e) {
      if (!(e instanceof ErrorCliente) || e.recuperable) throw e;
    }
    ir('/ingresar/', { reemplazar: true });
  }, [ir]);

  const { recargar } = sesionC;
  const valor = useMemo<Contexto | null>(() => {
    if (!sesionC.datos) return null;
    const ahora = feeC.datos?.ahora;
    return {
      sesion: sesionC.datos,
      fee: feeC.datos,
      offsetMs: ahora && feeC.recibidoEn !== null ? Date.parse(ahora) - feeC.recibidoEn : 0,
      noLeidas: avisosC.datos?.items.filter((n) => n.leidaEn === null).length ?? 0,
      recargar: () => {
        recargar();
        emitir('actualizar');
      },
      cerrarSesion,
    };
  }, [sesionC.datos, feeC.datos, feeC.recibidoEn, avisosC.datos, recargar, cerrarSesion]);

  if (sesionC.estado === 'error' && sesionC.error && !sesionC.error.requiereIngreso)
    return <ErrorEstado error={sesionC.error} onReintentar={sesionC.recargar} />;
  if (!valor) return <Cargando texto="Abriendo tu cuenta…" />;
  return (
    <Ctx.Provider value={valor}>
      {children}
      <ReingresoHoja
        abierta={vencida}
        onListo={() => {
          setVencida(false);
          emitir('reingreso');
        }}
      />
    </Ctx.Provider>
  );
}

/** Sesión vencida: se reingresa sin salir de la pantalla, así no se pierde lo tipeado ni se simula la acción. */
function ReingresoHoja({ abierta, onListo }: { abierta: boolean; onListo: () => void }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const { enviar, pendiente, error } = useEnvio();
  const ir = useIr();

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    const r = await enviar('login', { cuerpo: { email, contrasena } });
    if (r?.ok) {
      setContrasena('');
      onListo();
    }
  }

  return (
    <Hoja abierta={abierta} onCerrar={() => undefined} titulo="Tu sesión venció" cerrable={false}>
      <p>Ingresá de nuevo para seguir. Lo que estabas haciendo no se pierde, pero no se envió.</p>
      <form onSubmit={ingresar} noValidate>
        <Campo
          etiqueta="Email"
          error={error?.campos.find((c) => c.campo === 'email') ? 'Revisá el email.' : null}
        >
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
        <Campo etiqueta="Contraseña">
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          )}
        </Campo>
        {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
        {esVistaDePrueba ? (
          <Aviso tipo="info" titulo="Vista de prueba">
            <p className="codigo">
              {CUENTA_PRUEBA.email} · {CUENTA_PRUEBA.contrasena}
            </p>
          </Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Ingresar
          </Boton>
          <Boton variante="texto" onClick={() => ir('/ingresar/', { reemplazar: true })}>
            Salir a la pantalla de ingreso
          </Boton>
        </div>
      </form>
    </Hoja>
  );
}
