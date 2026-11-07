'use client';

// Hook del modo voz de HandIA (rama handia-premium): escucha con reconocimiento en el dispositivo y habla con voces del
// sistema. Las reglas (qué es "local", qué voz, cómo se dice) están en src/domain/voz.ts. Nada se guarda: ni audio ni
// texto salen del celular, y no hay grabación (el navegador solo devuelve el texto reconocido).
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  type ConstructorReconocimiento,
  type Oido,
  capacidadOido,
  elegirVoz,
  forzarLocal,
  instalarOido,
  paraHablar,
} from '@/domain/voz';

interface Reconocimiento {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult:
    | ((ev: {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type CtorReconocimiento = (new () => Reconocimiento) & ConstructorReconocimiento;

function constructor(): CtorReconocimiento | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: CtorReconocimiento;
    webkitSpeechRecognition?: CtorReconocimiento;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Solo Chrome y Edge traen el componente de voz en el dispositivo. En otros Chromium (p. ej. el de pruebas
 * automáticas) preguntarle por él cierra la pestaña, así que ni se pregunta: se toma como "no escucha".
 */
function navegadorConVozLocal(): boolean {
  if (typeof navigator === 'undefined') return false;
  const datos = (navigator as { userAgentData?: { brands?: readonly { brand: string }[] } })
    .userAgentData;
  return (datos?.brands ?? []).some(
    (b) => b.brand === 'Google Chrome' || b.brand === 'Microsoft Edge',
  );
}

const sintesis = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

// Voz elegida como store externo (las voces del sistema llegan tarde y avisan con 'voiceschanged').
function suscribirVoces(avisar: () => void) {
  const s = sintesis();
  s?.addEventListener('voiceschanged', avisar);
  return () => s?.removeEventListener('voiceschanged', avisar);
}
const vozActual = () => {
  const s = sintesis();
  return s ? (elegirVoz(s.getVoices())?.voiceURI ?? '') : '';
};
const sinVoz = () => '';

export type ErrorVoz = 'permiso' | 'no_te_escuche' | 'no_disponible' | null;

export interface Voz {
  /**
   * Reconocimiento local. 'sin_revisar' hasta que la persona abre el modo voz: recién ahí se le pregunta al navegador
   * (en algunos Chromium sin el componente de voz, preguntar al cargar cerraba la pestaña).
   */
  readonly oido: Oido | 'sin_revisar' | 'revisando';
  /** Hay una voz local en español para leer en voz alta. */
  readonly habla: boolean;
  readonly escuchando: boolean;
  readonly hablando: boolean;
  /** Lo que se va reconociendo mientras la persona habla. */
  readonly parcial: string;
  readonly error: ErrorVoz;
  /** Pregunta (una vez) si se puede escuchar en el dispositivo. */
  revisar(): Promise<Oido>;
  /** Lo mismo que `oido === 'local'`, pero al día dentro de callbacks viejos. */
  oidoLocal(): boolean;
  escuchar(alTerminar: (texto: string) => void): void;
  hablar(texto: string, alTerminar?: () => void): void;
  callar(): void;
  instalar(): Promise<void>;
}

export function useVoz(): Voz {
  type Capacidad = { oido: Oido | 'sin_revisar' | 'revisando'; idioma: string | null };
  const [capacidad, setCapacidadEstado] = useState<Capacidad>({
    oido: 'sin_revisar',
    idioma: null,
  });
  const capRef = useRef<Capacidad>(capacidad);
  const setCapacidad = useCallback((c: Capacidad) => {
    capRef.current = c;
    setCapacidadEstado(c);
  }, []);
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [parcial, setParcial] = useState('');
  const [error, setError] = useState<ErrorVoz>(null);
  const reconocimiento = useRef<Reconocimiento | null>(null);
  const uriVoz = useSyncExternalStore(suscribirVoces, vozActual, sinVoz);

  useEffect(
    () => () => {
      reconocimiento.current?.abort();
      sintesis()?.cancel();
    },
    [],
  );

  const revisar = useCallback(async (): Promise<Oido> => {
    const actual = capRef.current.oido;
    if (actual !== 'sin_revisar' && actual !== 'revisando') return actual;
    setCapacidad({ oido: 'revisando', idioma: null });
    const c = navegadorConVozLocal()
      ? await capacidadOido(constructor())
      : { oido: 'no' as const, idioma: null };
    setCapacidad(c);
    return c.oido;
  }, [setCapacidad]);

  const oidoLocal = useCallback(() => capRef.current.oido === 'local', []);

  const callar = useCallback(() => {
    reconocimiento.current?.abort();
    reconocimiento.current = null;
    sintesis()?.cancel();
    setEscuchando(false);
    setHablando(false);
  }, []);

  const escuchar = useCallback(
    (alTerminar: (texto: string) => void) => {
      const Ctor = constructor();
      const cap = capRef.current;
      if (!Ctor || cap.oido !== 'local' || !cap.idioma) return;
      sintesis()?.cancel();
      reconocimiento.current?.abort();
      const rec = new Ctor();
      if (!forzarLocal(rec)) {
        setCapacidad({ oido: 'no', idioma: null });
        return;
      }
      rec.lang = cap.idioma;
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let final = '';
      rec.onresult = (ev) => {
        let provisorio = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i]!;
          if (r.isFinal) final += r[0]!.transcript;
          else provisorio += r[0]!.transcript;
        }
        setParcial((final + provisorio).trim());
      };
      rec.onerror = (ev) => {
        setError(
          ev.error === 'not-allowed' || ev.error === 'service-not-allowed'
            ? 'permiso'
            : ev.error === 'no-speech'
              ? 'no_te_escuche'
              : ev.error === 'language-not-supported'
                ? 'no_disponible'
                : null,
        );
      };
      rec.onend = () => {
        reconocimiento.current = null;
        setEscuchando(false);
        setParcial('');
        if (final.trim()) alTerminar(final.trim());
      };
      reconocimiento.current = rec;
      setError(null);
      setParcial('');
      setEscuchando(true);
      try {
        rec.start();
      } catch {
        setEscuchando(false);
      }
    },
    [setCapacidad],
  );

  const hablar = useCallback(
    (texto: string, alTerminar?: () => void) => {
      const s = sintesis();
      const voz = s?.getVoices().find((v) => v.voiceURI === uriVoz) ?? null;
      if (!s || !voz) {
        if (alTerminar) setTimeout(alTerminar, 0);
        return;
      }
      s.cancel();
      const u = new SpeechSynthesisUtterance(paraHablar(texto));
      u.voice = voz;
      u.lang = voz.lang;
      u.rate = 1.03;
      u.pitch = 1.05;
      u.onend = () => {
        setHablando(false);
        alTerminar?.();
      };
      u.onerror = () => setHablando(false);
      setHablando(true);
      s.speak(u);
    },
    [uriVoz],
  );

  const instalar = useCallback(async () => {
    const Ctor = constructor();
    const idioma = capRef.current.idioma;
    if (!Ctor || !idioma) return;
    setCapacidad({ oido: 'descargando', idioma });
    await instalarOido(Ctor, idioma);
    setCapacidad(await capacidadOido(Ctor));
  }, [setCapacidad]);

  return {
    oido: capacidad.oido,
    habla: !!uriVoz,
    escuchando,
    hablando,
    parcial,
    error,
    revisar,
    oidoLocal,
    escuchar,
    hablar,
    callar,
    instalar,
  };
}
