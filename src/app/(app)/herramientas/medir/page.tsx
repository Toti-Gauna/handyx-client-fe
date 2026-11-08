'use client';

import { useEffect, useRef, useState } from 'react';
import { useIr } from '@/components/nav';
import {
  type Caja,
  type Punto,
  REFERENCIAS,
  type Referencia,
  cmPorAncho,
  distanciaPx,
  formatoMedida,
  guardarItem,
  leerCm,
  medirCm,
} from '@/domain/herramientas';
import {
  AvisoSeguridad,
  PantallaOscura,
  PedirPermiso,
  PuntoArrastrable,
  VideoCamara,
} from '@/ui/herramientas';
import { useCamara, type EstadoCamara } from '../_lib/useCamara';
import { BotonFoto, PanelMedida, PanelReferencia } from '../_lib/PanelesMedir';

type Par = readonly [Punto, Punto];
const PUNTOS_REFERENCIA: Par = [
  { x: 0.25, y: 0.4 },
  { x: 0.75, y: 0.4 },
];
const PUNTOS_MEDIDA: Par = [
  { x: 0.2, y: 0.65 },
  { x: 0.8, y: 0.65 },
];

const PROBLEMA: Partial<Record<EstadoCamara, string>> = {
  denegada:
    'No diste permiso para usar la cámara. Lo podés cambiar en los ajustes del navegador, o medir sobre una foto.',
  'no-disponible': 'No encontramos una cámara que podamos usar. Podés medir sobre una foto.',
  error: 'No pudimos abrir la cámara. Probá de nuevo o medí sobre una foto.',
};

/** Medir con la cámara (o sobre una foto): calibra con un objeto conocido y mide entre dos puntos. Aproximado. */
export default function Medir() {
  const ir = useIr();
  const cam = useCamara();
  const [foto, setFoto] = useState<string | null>(null);
  const [paso, setPaso] = useState<'referencia' | 'medida'>('referencia');
  const [elegida, setElegida] = useState<Referencia>(REFERENCIAS[0]!);
  const [otraCm, setOtraCm] = useState('');
  const [puntos, setPuntos] = useState<Par>(PUNTOS_REFERENCIA);
  const [escala, setEscala] = useState<number | null>(null);
  const [caja, setCaja] = useState<Caja>({ ancho: 0, alto: 0 });
  const [aviso, setAviso] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const cuadro = useRef<HTMLDivElement>(null);

  const activa = cam.estado === 'lista' || foto !== null;

  useEffect(() => {
    if (!foto) return;
    return () => URL.revokeObjectURL(foto);
  }, [foto]);

  useEffect(() => {
    const el = cuadro.current;
    if (!el || !activa) return;
    const o = new ResizeObserver(([e]) => {
      if (e) setCaja({ ancho: e.contentRect.width, alto: e.contentRect.height });
    });
    o.observe(el);
    return () => o.disconnect();
  }, [activa]);

  const cmReferencia = elegida.cm ?? leerCm(otraCm);
  const px = distanciaPx(puntos[0], puntos[1], caja);
  const cm = escala !== null ? medirCm(px, caja.ancho, escala) : null;

  const calibrar = () => {
    const e = cmReferencia ? cmPorAncho(cmReferencia, px, caja.ancho) : null;
    if (e === null) {
      setAviso('Separá más los puntos: tienen que estar en los dos extremos del objeto.');
      return;
    }
    setAviso(null);
    setEscala(e);
    setPaso('medida');
    setPuntos(PUNTOS_MEDIDA);
  };
  const recalibrar = () => {
    setEscala(null);
    setPaso('referencia');
    setPuntos(PUNTOS_REFERENCIA);
  };
  const guardar = () => {
    if (cm === null) return;
    guardarItem({
      tipo: 'medida',
      titulo: nombre.trim() || 'Medida',
      detalle: `${formatoMedida(cm)} · medida aproximada`,
    });
    ir('/herramientas/destino/');
  };
  const mover = (i: 0 | 1) => (p: Punto) => setPuntos((ps) => (i === 0 ? [p, ps[1]] : [ps[0], p]));
  const usarFoto = (f: File) => {
    setFoto(URL.createObjectURL(f));
    recalibrar();
  };

  const escena = activa ? (
    <>
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto local del teléfono (blob), nunca subida
        <img className="dh-foto" src={foto} alt="Tu foto para medir" />
      ) : cam.stream ? (
        <VideoCamara stream={cam.stream} />
      ) : null}
      <div className="dh-cuadro" ref={cuadro}>
        <svg
          className="dh-linea"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1={puntos[0].x * 100}
            y1={puntos[0].y * 100}
            x2={puntos[1].x * 100}
            y2={puntos[1].y * 100}
          />
        </svg>
        <PuntoArrastrable punto={puntos[0]} etiqueta="Primer punto" onMover={mover(0)} />
        <PuntoArrastrable punto={puntos[1]} etiqueta="Segundo punto" onMover={mover(1)} />
      </div>
      {cm !== null ? (
        <p className="dh-medida" role="status">
          {formatoMedida(cm)} <small>· aproximado</small>
        </p>
      ) : null}
    </>
  ) : (
    <PedirPermiso
      icono="regla"
      titulo="Para medir usamos tu cámara"
      texto="Se usa solo en esta pantalla, en tu teléfono. No se graba ni se manda nada."
      boton="Activar la cámara"
      onPedir={() => void cam.iniciar()}
      ocupado={cam.estado === 'pidiendo'}
      problema={PROBLEMA[cam.estado] ?? null}
      otro={<BotonFoto onFoto={usarFoto} />}
    />
  );

  return (
    <PantallaOscura titulo="Medir" escena={escena}>
      {!activa ? (
        <AvisoSeguridad />
      ) : paso === 'referencia' ? (
        <PanelReferencia
          elegida={elegida}
          onElegir={setElegida}
          otraCm={otraCm}
          onOtraCm={setOtraCm}
          valida={cmReferencia !== null}
          onListo={calibrar}
          aviso={aviso}
        />
      ) : (
        <PanelMedida
          nombre={nombre}
          onNombre={setNombre}
          onGuardar={guardar}
          onRecalibrar={recalibrar}
        />
      )}
    </PantallaOscura>
  );
}
