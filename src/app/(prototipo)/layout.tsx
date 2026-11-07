import { FocoAlNavegar } from '@/components/FocoAlNavegar';

/**
 * Marco de los prototipos de diseño (fase R de HandIA): a lo ancho de la pantalla para ver dos teléfonos lado a lado
 * en escritorio. No es parte de la app: solo existe en la vista de prueba.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hxp-marco">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <FocoAlNavegar />
      <main id="contenido">{children}</main>
    </div>
  );
}
