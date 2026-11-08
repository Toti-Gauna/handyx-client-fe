'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Hogar } from '@/contracts/v1/hogar';
import { useEnvio } from '@/data/hooks';
import { Boton, Nota } from '@/ui';
import { Contador, PantallaPaso, Segmentos } from '@/ui/acceso';
import { AMBIENTES_ALTA, VIVIENDAS, ambientesPorCrear, cuantos, cuentasIniciales } from './casa';

/**
 * Paso 1 de 3: tipo de vivienda y cuántos ambientes de cada uno. Guarda la vivienda (`hogarEditar`) y crea solo los
 * ambientes que faltan (`ambienteCrear`, uno por vez). Nunca borra: lo ya cargado es el mínimo de cada contador.
 */
export function PasoAmbientes({
  hogar,
  onListo,
  onAtras,
  onFalla,
}: {
  hogar: Hogar;
  onListo: () => void;
  onAtras: () => void;
  /** Algo se guardó y algo no: recargar la casa para no duplicar al reintentar. */
  onFalla: () => void;
}) {
  const { enviar, pendiente, error } = useEnvio();
  const [vivienda, setVivienda] = useState(hogar.vivienda);
  const [cuentas, setCuentas] = useState(() => cuentasIniciales(hogar));

  async function guardar() {
    if (vivienda && vivienda !== hogar.vivienda) {
      const r = await enviar(
        'hogarEditar',
        { cuerpo: { vivienda, version: hogar.version } },
        `vivienda|${vivienda}|${hogar.version}`,
      );
      if (!r?.ok) return onFalla();
    }
    for (const a of ambientesPorCrear(hogar, cuentas)) {
      const r = await enviar('ambienteCrear', { cuerpo: a }, `ambiente|${a.nombre}`);
      if (!r?.ok) return onFalla();
    }
    onListo();
  }

  return (
    <PantallaPaso
      titulo="¿Qué ==ambientes== tiene?"
      tam={1.75}
      sub="Contá los que tenés. Después les sumás fotos si querés."
      barra={{ titulo: 'Tu casa', sub: '1 de 3 · ambientes', atras: { alTocar: onAtras } }}
      paso={1}
      total={3}
      onSubmit={() => void guardar()}
      pie={
        <Boton type="submit" ocupado={pendiente}>
          Seguir
        </Boton>
      }
    >
      <Segmentos
        etiqueta="Tipo de vivienda"
        opciones={VIVIENDAS}
        valor={vivienda}
        onElegir={setVivienda}
      />
      <div className="dsa-contadores ds-pila" style={{ '--ds-gap': '0' } as CSSProperties}>
        {AMBIENTES_ALTA.map((a) => (
          <Contador
            key={a.tipo}
            icono={a.icono}
            etiqueta={a.texto}
            valor={cuentas[a.tipo]}
            min={cuantos(hogar, a.tipo)}
            onCambiar={(n) => setCuentas((c) => ({ ...c, [a.tipo]: n }))}
          />
        ))}
      </div>
      {hogar.ambientes.length ? (
        <Nota tono="gris">
          Ya tenés {hogar.ambientes.length} ambientes cargados. Acá solo se suman; para quitar uno,
          andá a Mi hogar.
        </Nota>
      ) : null}
      {error ? (
        <Nota tono="error" rol="alert" icono="alerta">
          {error.mensaje} Lo que ya se guardó queda guardado: tocá «Seguir» para terminar.
        </Nota>
      ) : null}
    </PantallaPaso>
  );
}
