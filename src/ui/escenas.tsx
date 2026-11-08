// Escenas propias (sin personajes), portadas del lienzo de diseño: el pedido que sale hacia los especialistas, la
// casa arreglada y el sello de listo. Decorativas salvo `SelloListo`, que tiene nombre.
const AZUL = '#1F57A8';
const TINTE = '#E9EFF9';
const AMARILLO = '#F5F59A';
const TINTA = '#0E1D36';
const EXITO = '#1E9E57';

function Skyline({ ancho, base, semilla }: { ancho: number; base: number; semilla: number }) {
  const edif: [number, number, number][] = [
    [0, 120, 46],
    [50, 84, 40],
    [94, 140, 52],
    [150, 70, 38],
    [192, 110, 48],
    [244, 90, 42],
    [290, 130, 50],
    [344, 76, 46],
  ];
  return (
    <g>
      {edif
        .filter(([x]) => x <= ancho)
        .map(([x, alto, an]) => {
          const y = base - alto;
          const ventanas = [];
          for (let fy = y + 12; fy < base - 8; fy += 22)
            for (let fx = x + 7; fx < x + an - 9; fx += 13)
              ventanas.push(
                <rect
                  key={`${fx}-${fy}`}
                  x={fx}
                  y={fy}
                  width="6"
                  height="9"
                  fill={(fx * 7 + fy * 3 + semilla) % 5 === 0 ? AMARILLO : '#4A7CC7'}
                />,
              );
          return (
            <g key={x}>
              <rect x={x} y={y} width={an} height={alto} fill="#2A63B5" />
              {ventanas}
            </g>
          );
        })}
    </g>
  );
}

const destello = (x: number, y: number, k: number) => (
  <path
    key={k}
    d={`M${x} ${y - 9}l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6Z`}
    fill={AMARILLO}
  />
);

/** «¡Pedido publicado!»: el pedido sale de tu casa y les llega a especialistas de la zona. */
export function EscenaPublicado() {
  const cx = 195;
  const cy = 128;
  const pin = (x: number, y: number, t: string) => (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 18 C-12 6 -14 -2 -14 -6 a14 14 0 0 1 28 0 c0 4 -2 12 -14 24Z"
        fill={AMARILLO}
        stroke={TINTA}
        strokeWidth="2"
      />
      <text
        x="0"
        y="-2"
        textAnchor="middle"
        fontFamily="DM Sans, sans-serif"
        fontSize="11"
        fontWeight="900"
        fill={TINTA}
      >
        {t}
      </text>
    </g>
  );
  return (
    <svg className="ds-escena" viewBox="0 0 390 290" aria-hidden="true">
      <rect width="390" height="290" fill={AZUL} />
      <Skyline ancho={390} base={290} semilla={3} />
      <rect y="272" width="390" height="18" fill="#173F7C" />
      {[
        [78, 0.45],
        [112, 0.3],
        [146, 0.18],
      ].map(([r, o]) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`rgba(255,255,255,${o})`}
          strokeWidth="2"
          strokeDasharray="6 8"
        />
      ))}
      {[
        [52, 46],
        [338, 62],
        [300, 190],
        [78, 200],
      ].map(([x, y], i) => destello(x!, y!, i))}
      {pin(cx - 118, cy - 40, 'JO')}
      {pin(cx + 124, cy - 18, 'DH')}
      {pin(cx + 70, cy + 104, 'SR')}
      <g transform={`translate(${cx - 46} ${cy - 58})`}>
        <rect width="92" height="116" rx="14" fill="#FFFFFF" />
        <rect x="12" y="14" width="34" height="34" rx="10" fill={TINTE} />
        <path
          d="M20 26h12a5 5 0 0 1 5 5v3M23 22h6M26 22v4M37 34h6v4"
          stroke={AZUL}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="12" y="60" width="68" height="7" rx="3.5" fill="#C9D3E6" />
        <rect x="12" y="74" width="52" height="7" rx="3.5" fill="#C9D3E6" />
        <rect x="12" y="92" width="40" height="12" rx="6" fill={AMARILLO} />
        <circle cx="80" cy="12" r="14" fill={EXITO} stroke="#FFFFFF" strokeWidth="3" />
        <path
          d="M73 12l5 5 9-10"
          stroke="#FFFFFF"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** «¡Quedó arreglado!» y «¡Listo!»: la casa con su sello de listo, sol y destellos. */
export function EscenaArreglado({ alto = 380 }: { alto?: number }) {
  const cx = 195;
  return (
    <svg className="ds-escena" viewBox={`0 0 390 ${alto}`} aria-hidden="true">
      <rect width="390" height={alto} fill={AZUL} />
      <circle cx="320" cy="54" r="26" fill={AMARILLO} opacity="0.95" />
      <Skyline ancho={390} base={alto - 40} semilla={1} />
      <rect y={alto - 40} width="390" height="40" fill="#173F7C" />
      {[
        [60, 70],
        [330, 110],
        [86, 190],
        [318, 210],
      ].map(([x, y], i) => destello(x!, y!, i))}
      <g transform={`translate(${cx - 80} 70)`}>
        <path d="M80 0 L160 62 V160 H0 V62 Z" fill="#FFFFFF" />
        <path d="M80 0 L160 62 H0 Z" fill="#DCE7F7" />
        <rect x="58" y="96" width="44" height="64" rx="6" fill={TINTE} />
        <circle cx="94" cy="130" r="3" fill={AZUL} />
        <rect x="18" y="82" width="30" height="30" rx="5" fill={AMARILLO} />
        <rect x="112" y="82" width="30" height="30" rx="5" fill={AMARILLO} />
        <path d="M33 82v30M18 97h30M127 82v30M112 97h30" stroke="#C9C85A" strokeWidth="2" />
        <circle cx="148" cy="14" r="26" fill={EXITO} stroke="#FFFFFF" strokeWidth="5" />
        <path
          d="M136 14l8 8 15-16"
          stroke="#FFFFFF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Ilustración chica de «listo» para pantallas blancas (conformidad). */
export function SelloListo({
  tam = 124,
  etiqueta = 'Trabajo terminado',
}: {
  tam?: number;
  etiqueta?: string;
}) {
  return (
    <svg role="img" aria-label={etiqueta} width={tam} height={tam} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="58" fill={TINTE} />
      <path
        d="M60 26 L94 52 V92 H26 V52 Z"
        fill="#FFFFFF"
        stroke={AZUL}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect
        x="50"
        y="66"
        width="20"
        height="26"
        rx="3"
        fill={TINTE}
        stroke={AZUL}
        strokeWidth="2.5"
      />
      <circle cx="88" cy="32" r="16" fill={AZUL} stroke="#FFFFFF" strokeWidth="3" />
      <path
        d="M80 32l6 6 10-11"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Casa isométrica (Armá tu casa, planos y 3D). */
export function CasaIso({ etiqueta }: { etiqueta?: string }) {
  return (
    <svg
      className="ds-escena"
      viewBox="0 0 300 210"
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
    >
      <path d="M150 20 L270 80 L150 140 L30 80Z" fill="#DCE6F2" stroke={AZUL} strokeWidth="2" />
      <path d="M30 80 L30 150 L150 210 L150 140Z" fill="#B9CCE8" stroke={AZUL} strokeWidth="2" />
      <path d="M270 80 L270 150 L150 210 L150 140Z" fill="#9DB7DE" stroke={AZUL} strokeWidth="2" />
      <path
        d="M150 20 L150 80 M90 50 L210 110 M210 50 L90 110"
        stroke={AZUL}
        strokeWidth="1.5"
        opacity="0.6"
      />
      <text
        x="196"
        y="44"
        fontFamily="DM Sans, sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="#143E7E"
      >
        Cocina
      </text>
      <text
        x="58"
        y="72"
        fontFamily="DM Sans, sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="#143E7E"
      >
        Living
      </text>
      <text
        x="120"
        y="122"
        fontFamily="DM Sans, sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="#143E7E"
      >
        Baño
      </text>
    </svg>
  );
}

const AMBIENTES_SVG: Record<string, (w: number, h: number) => React.ReactNode> = {
  bano: (w, h) => (
    <>
      {Array.from({ length: Math.floor((h * 0.72) / 26) }, (_, i) => (
        <path key={i} d={`M0 ${20 + i * 26}H${w}`} stroke="#C6D6EA" strokeWidth="2" />
      ))}
      <rect y={h * 0.72} width={w} height={h * 0.28} fill="#D9CFC0" />
      <rect
        x={w * 0.08}
        y={h * 0.42}
        width={w * 0.28}
        height={h * 0.18}
        rx="10"
        fill="#FFF"
        stroke="#9AA9BF"
        strokeWidth="2"
      />
      <rect
        x={w * 0.13}
        y={h * 0.1}
        width={w * 0.18}
        height={h * 0.26}
        rx="8"
        fill="#F4F8FC"
        stroke="#9AA9BF"
        strokeWidth="2"
      />
      <rect
        x={w * 0.5}
        y={h * 0.48}
        width={w * 0.12}
        height={h * 0.24}
        rx="10"
        fill="#FFF"
        stroke="#9AA9BF"
        strokeWidth="2"
      />
      <rect
        x={w * 0.72}
        y={h * 0.06}
        width={w * 0.22}
        height={h * 0.66}
        fill="#CFE0F3"
        stroke="#9AA9BF"
        strokeWidth="2"
      />
    </>
  ),
  cocina: (w, h) => (
    <>
      <rect y={h * 0.72} width={w} height={h * 0.28} fill="#D9CFC0" />
      <rect
        x={w * 0.04}
        y={h * 0.46}
        width={w * 0.92}
        height={h * 0.26}
        fill="#FFF"
        stroke="#B9AE9C"
        strokeWidth="2"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={w * (0.04 + i * 0.23)}
          y={h * 0.08}
          width={w * 0.21}
          height={h * 0.22}
          rx="4"
          fill="#FFF"
          stroke="#B9AE9C"
          strokeWidth="2"
        />
      ))}
      <rect x={w * 0.36} y={h * 0.4} width={w * 0.22} height={h * 0.06} rx="3" fill="#7F8794" />
      <rect
        x={w * 0.78}
        y={h * 0.22}
        width={w * 0.1}
        height={h * 0.22}
        rx="6"
        fill="#FFF"
        stroke="#F6A623"
        strokeWidth="2"
      />
    </>
  ),
  living: (w, h) => (
    <>
      <rect y={h * 0.72} width={w} height={h * 0.28} fill="#D9CFC0" />
      <rect
        x={w * 0.6}
        y={h * 0.08}
        width={w * 0.32}
        height={h * 0.44}
        fill="#CFE0F3"
        stroke="#9AA9BF"
        strokeWidth="2"
      />
      <rect x={w * 0.06} y={h * 0.46} width={w * 0.46} height={h * 0.2} rx="12" fill={AZUL} />
      <rect x={w * 0.06} y={h * 0.38} width={w * 0.46} height={h * 0.14} rx="10" fill="#3A78D0" />
    </>
  ),
  dormitorio: (w, h) => (
    <>
      <rect y={h * 0.72} width={w} height={h * 0.28} fill="#D9CFC0" />
      <rect
        x={w * 0.12}
        y={h * 0.42}
        width={w * 0.56}
        height={h * 0.24}
        rx="8"
        fill="#FFF"
        stroke="#A9A2BD"
        strokeWidth="2"
      />
      <rect x={w * 0.12} y={h * 0.3} width={w * 0.12} height={h * 0.36} rx="6" fill="#C9C1DE" />
      <rect
        x={w * 0.62}
        y={h * 0.08}
        width={w * 0.3}
        height={h * 0.14}
        rx="8"
        fill="#FFF"
        stroke="#A9A2BD"
        strokeWidth="2"
      />
    </>
  ),
  lavadero: (w, h) => (
    <>
      <rect y={h * 0.72} width={w} height={h * 0.28} fill="#D9CFC0" />
      <rect
        x={w * 0.1}
        y={h * 0.3}
        width={w * 0.26}
        height={h * 0.42}
        rx="8"
        fill="#FFF"
        stroke="#97AFA4"
        strokeWidth="2"
      />
      <circle
        cx={w * 0.23}
        cy={h * 0.53}
        r={h * 0.11}
        fill="#CFE0F3"
        stroke="#97AFA4"
        strokeWidth="2"
      />
      <rect
        x={w * 0.56}
        y={h * 0.06}
        width={w * 0.16}
        height={h * 0.5}
        rx="20"
        fill="#FFF"
        stroke="#97AFA4"
        strokeWidth="2"
      />
    </>
  ),
};
const FONDOS_AMB: Record<string, string> = {
  bano: '#E4EEF8',
  cocina: '#F1ECE3',
  living: '#E9EEF5',
  dormitorio: '#EEEAF5',
  lavadero: '#EAF1EE',
};

/** Ilustración del ambiente mientras no haya foto propia (portada de la ficha). */
export function IlustracionAmbiente({ tipo, alto = 96 }: { tipo: string; alto?: number }) {
  const w = 200;
  const h = 112;
  return (
    <svg
      className="ds-escena"
      viewBox={`0 0 ${w} ${h}`}
      style={{ height: `${alto / 16}rem`, background: FONDOS_AMB[tipo] ?? '#EEF2F7' }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {(AMBIENTES_SVG[tipo] ?? AMBIENTES_SVG.living)!(w, h)}
    </svg>
  );
}
