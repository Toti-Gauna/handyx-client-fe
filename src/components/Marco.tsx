import Image from 'next/image';
import { BarraInferior } from './BarraInferior';

/** Columna de app: cabecera con el logo, contenido y (con sesión) la barra azul inferior. */
export function Marco({ children, barra }: { children: React.ReactNode; barra: boolean }) {
  return (
    <div className="app">
      <header className="app__cabecera">
        <Image
          className="app__logo"
          src="/img/logo-handyx.webp"
          alt="Handyx"
          width={128}
          height={28}
          priority
        />
      </header>
      <main id="contenido" className={barra ? 'app__cuerpo' : 'app__cuerpo app__cuerpo--sin-barra'}>
        {children}
      </main>
      {barra ? <BarraInferior /> : null}
    </div>
  );
}
