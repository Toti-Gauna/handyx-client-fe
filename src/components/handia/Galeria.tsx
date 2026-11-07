// Galería de la base de HandIA (R8) para /diseno/#handia: las piezas que usarán H2 (voz) y H3 (chat).
// El prototipo completo, con pantallas y movimiento, está en /diseno/handia/.
import Link from 'next/link';
import { AVISO_SEGURIDAD } from '@/domain/handia';
import {
  AvisoRiesgo,
  BotonPremium,
  BurbujaHandia,
  Dicho,
  Escena,
  Orbe,
  PasosPensando,
  TarjetaVidrio,
} from './piezas';

export function GaleriaHandia() {
  return (
    <div className="galeria-handia">
      <p>
        Base del rediseño premium (fase R). Prototipo completo en{' '}
        <Link href="/diseno/handia">/diseno/handia/</Link>.
      </p>
      <Escena tipo="voz" className="galeria-handia__escena">
        <Orbe estado="hablando" tamano="chico" />
        <p className="hia-display">
          <Dicho texto="Parece un trabajo de plomería." />
        </p>
        <TarjetaVidrio oscuro className="galeria-handia__vidrio">
          Tarjeta de vidrio oscura
        </TarjetaVidrio>
        <BotonPremium variante="destacado" icono="microfono">
          Botón destacado
        </BotonPremium>
      </Escena>
      <Escena tipo="chat" className="galeria-handia__escena">
        <BurbujaHandia de="yo">Pierde la canilla del baño</BurbujaHandia>
        <BurbujaHandia de="ia">
          <PasosPensando
            pasos={[
              { texto: 'Entendí el problema', estado: 'hecho' },
              { texto: 'Eligiendo el rubro', estado: 'ahora' },
            ]}
          />
        </BurbujaHandia>
        <AvisoRiesgo texto={AVISO_SEGURIDAD.gas} />
        <TarjetaVidrio className="galeria-handia__vidrio">Tarjeta de vidrio clara</TarjetaVidrio>
        <span className="galeria-handia__botones">
          <BotonPremium icono="calendario">Primario</BotonPremium>
          <BotonPremium variante="vidrio" icono="teclado">
            Vidrio
          </BotonPremium>
        </span>
      </Escena>
    </div>
  );
}
