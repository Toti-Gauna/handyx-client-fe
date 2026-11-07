import { Escena } from './acceso';
import { Marcado } from './hx';
import { TituloDocumento } from './TituloDocumento';

/**
 * Pantalla del sistema (rediseño 3.9): sin conexión, página que no existe. Un Handy roto sobre su círculo, el título con
 * marcador, la explicación y las salidas. Sin datos ni acciones simuladas.
 */
export function EstadoSistema({
  handy,
  titulo,
  children,
  acciones,
}: {
  handy: { img: string; ancho: number; alto: number };
  titulo: string;
  children: React.ReactNode;
  acciones: React.ReactNode;
}) {
  return (
    <div className="pantalla du-app hd-entrando sistema-hx">
      <TituloDocumento texto={titulo.replace(/==/g, '')} />
      <div className="sistema-hx__cuerpo">
        <Escena handy={handy.img} ancho={handy.ancho} alto={handy.alto} />
        <h1
          className="hd-titulo sistema-hx__titulo"
          data-entra=""
          style={{ '--i': 1 } as React.CSSProperties}
        >
          <Marcado texto={titulo} />
        </h1>
        <div
          className="sistema-hx__texto"
          data-entra=""
          style={{ '--i': 2 } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
      <div className="du-pie">{acciones}</div>
    </div>
  );
}
