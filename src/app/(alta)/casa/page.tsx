'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Enlace, useIr } from '@/components/nav';
import { Cargando, ErrorEstado } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { Boton, CasaIso, FilaEnlace } from '@/ui';
import { PantallaPaso } from '@/ui/acceso';
import { PasoAmbientes } from './PasoAmbientes';
import { PasoEquipos } from './PasoEquipos';
import { PasoFotos } from './PasoFotos';

type Paso = 'intro' | 'ambientes' | 'equipos' | 'fotos';
const FIN = '/registro/listo/';

const BENEFICIOS = [
  { icono: 'casa', titulo: 'Ambientes y equipos', sub: 'Con fotos y medidas, a tu ritmo' },
  { icono: 'compartir', titulo: 'Compartís sin sacar fotos', sub: 'Elegís qué ve el especialista' },
  { icono: 'candado', titulo: 'Es privada', sub: 'Nadie la ve si no la compartís' },
] as const;

/**
 * «Armá tu casa» (alta, opcional): presentación › ambientes › equipos › fotos › «¡Listo!». Se puede saltar en
 * cualquier momento; lo cargado queda en Mi hogar. Cada paso guarda lo suyo antes de seguir.
 */
export default function ArmaTuCasa() {
  const ir = useIr();
  const hogar = useConsulta('hogar', {});
  const [paso, setPaso] = useState<Paso>('intro');
  // Hora del pedido de datos frescos al avanzar: hasta que lleguen, el paso siguiente espera.
  const [pedidoEn, setPedidoEn] = useState(0);

  function avanzar(siguiente: Paso | 'fin') {
    if (siguiente === 'fin') return ir(FIN);
    setPedidoEn(Date.now());
    hogar.recargar();
    setPaso(siguiente);
  }

  if (paso === 'intro')
    return (
      <PantallaPaso
        titulo="Armá tu ==casa=="
        tam={2.125}
        sup="Opcional · 2 minutos"
        sub="Cargá ambientes y equipos una vez. La próxima vez que algo se rompa, lo elegís y el pedido sale armado."
        cabecera={
          <div className="dsa-cabecera dsa-cabecera--casa">
            <CasaIso />
            <Enlace href={FIN} className="dsa-saltar">
              Saltar
            </Enlace>
          </div>
        }
        pie={
          <>
            <Boton icono="flecha" onClick={() => setPaso('ambientes')}>
              Empezar
            </Boton>
            <Boton href={FIN} variante="contorno">
              Más tarde
            </Boton>
          </>
        }
      >
        <div className="ds-pila" style={{ '--ds-gap': '0' } as CSSProperties}>
          {BENEFICIOS.map((b) => (
            <FilaEnlace key={b.titulo} icono={b.icono} titulo={b.titulo} sub={b.sub} />
          ))}
        </div>
      </PantallaPaso>
    );

  const esperando = hogar.refrescando && (hogar.recibidoEn === null || hogar.recibidoEn < pedidoEn);
  if (hogar.estado === 'error' && hogar.error)
    return <ErrorEstado error={hogar.error} onReintentar={hogar.recargar} />;
  if (!hogar.datos || esperando) return <Cargando texto="Abriendo tu casa…" />;

  const comunes = { hogar: hogar.datos, onFalla: hogar.recargar };
  if (paso === 'ambientes')
    return (
      <PasoAmbientes
        {...comunes}
        onAtras={() => setPaso('intro')}
        onListo={() => avanzar('equipos')}
      />
    );
  if (paso === 'equipos')
    return (
      <PasoEquipos
        {...comunes}
        onAtras={() => setPaso('ambientes')}
        onListo={() => avanzar('fotos')}
      />
    );
  return (
    <PasoFotos
      hogar={hogar.datos}
      onAtras={() => setPaso('equipos')}
      onListo={() => avanzar('fin')}
    />
  );
}
