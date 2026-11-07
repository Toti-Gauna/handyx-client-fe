import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AvatarHx, ChipEstado, Marcado, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { MapaHx } from '@/components/MapaHx';
import { TRAZOS, type NombreIcono } from '@/components/trazos';
import { esVistaDePrueba } from '@/data';
import { CENTRO_MDP } from '@/geo/mdp';
import { RUBROS } from '@/contracts/v1/pedidos';
import {
  RUBROS_INFO,
  VERIFICACION_TEXTO,
  etiquetaPedido,
  etiquetaPropuesta,
  etiquetaTrabajo,
} from '@/domain/etiquetas';

export const metadata: Metadata = { title: 'Sistema visual' };

const COLORES = [
  ['Azul Handyx', '--color-azul'],
  ['Azul UI', '--color-azul-ui'],
  ['Azul personajes', '--color-azul-personajes'],
  ['Noche', '--color-noche'],
  ['Tinta', '--color-tinta'],
  ['Amarillo', '--color-amarillo'],
  ['Mosaico', '--color-mosaico'],
  ['Éxito', '--estado-ok'],
  ['Peligro', '--accion-peligro'],
] as const;

const HANDYS = ['cano', 'lamparita', 'llave', 'engranaje', 'gota'] as const;

/**
 * Galería del sistema visual (rediseño, lote 3.1): todas las piezas del kit en un lugar, para revisarlas juntas.
 * Solo en la vista de prueba; no existe en un build con API real. Datos de ejemplo ficticios.
 */
export default function Diseno() {
  if (!esVistaDePrueba) notFound();
  return (
    <Pantalla>
      <div className="du-cuerpo galeria">
        <h1 className="hd-titulo hd-titulo--grande">
          <Marcado texto="Sistema ==visual==" />
        </h1>
        <p className="du-info">
          <Icono nombre="info" />
          <span>
            Kit de la demo de la landing (scripts/kit.mjs) con los ajustes de la app. Guía:
            docs/diseno.md.
          </span>
        </p>

        <Seccion titulo="Color">
          <div className="galeria__colores">
            {COLORES.map(([nombre, v]) => (
              <span key={v} className="galeria__color">
                <i style={{ background: `var(${v})` }} />
                <small>{nombre}</small>
              </span>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Tipografía">
          <p className="hd-titulo hd-titulo--grande">
            <Marcado texto="¿Qué necesitás ==hoy==?" />
          </p>
          <p className="hd-titulo">Título de sección</p>
          <p className="hd-titulo hd-titulo--chico hd-titulo--azul">Quiero…</p>
          <p className="hd-sobre">Sobretítulo</p>
          <p className="hd-texto">Texto de lectura en DM Sans. Precios: $ 45.000.</p>
          <p className="hd-texto hd-texto--suave">Texto secundario.</p>
          <p>
            <span className="hd-precio hd-precio--grande">$ 45.000</span>
          </p>
        </Seccion>

        <Seccion titulo="Botones">
          <div className="hd-botones">
            <button type="button" className="hd-boton">
              <Icono nombre="enviar" />
              Pedir presupuestos
            </button>
            <button type="button" className="hd-boton hd-boton--amarillo">
              Ver propuestas
            </button>
            <button type="button" className="hd-boton hd-boton--claro">
              Volver
            </button>
            <div className="hd-botones hd-botones--fila">
              <button type="button" className="hd-boton hd-boton--claro">
                Cancelar
              </button>
              <button type="button" className="hd-boton hd-boton--exito">
                <Icono nombre="check" />
                Confirmar turno
              </button>
            </div>
            <button type="button" className="hd-boton hd-boton--peligro">
              Sí, cancelar
            </button>
            <button type="button" className="hd-boton hd-boton--fantasma">
              Volver al inicio
            </button>
            <button type="button" className="hd-boton" aria-busy="true" disabled>
              Enviando
            </button>
          </div>
        </Seccion>

        <Seccion titulo="Chips y estados">
          <div className="hd-chips">
            <span className="hd-chip hd-chip--tinte">
              <Icono nombre="pin" />
              Calle Ficticia 1650 · La Perla
            </span>
            <span className="hd-chip hd-chip--exito hd-chip--mini">
              <Icono nombre="verificado" />
              {VERIFICACION_TEXTO.identidad}
            </span>
            <ChipEstado e={etiquetaPedido({ estado: 'buscando' })} vivo />
            <ChipEstado e={etiquetaPedido({ estado: 'con_propuestas' })} />
            <ChipEstado e={etiquetaPropuesta({ estado: 'pendiente' })} />
            <ChipEstado e={etiquetaTrabajo({ estado: 'terminado_por_especialista' })} />
            <ChipEstado e={etiquetaTrabajo({ estado: 'cancelado' })} />
          </div>
        </Seccion>

        <Seccion titulo="Mosaicos">
          <div className="hd-mosaicos du-rubros">
            {RUBROS.map((r) => (
              <span key={r} className="hd-mosaico du-rubro">
                <Icono nombre={RUBROS_INFO[r].icono} />
                <span>{RUBROS_INFO[r].corto}</span>
              </span>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Avatares">
          <div className="galeria__fila">
            <AvatarHx nombre="Especialista 1" verificado tono={0} />
            <AvatarHx nombre="Especialista 2" tono={1} />
            <AvatarHx nombre="Especialista 3" verificado tono={2} />
            <AvatarHx nombre="Especialista 1" verificado tamano="grande" />
          </div>
        </Seccion>

        <Seccion titulo="Hoja azul">
          <section className="hd-hoja-azul du-hoja-azul galeria__hoja">
            <span className="du-manija" aria-hidden="true" />
            <p className="du-hoja-azul__titulo">
              Te llegaron 3
              <span className="hd-chip hd-chip--claro hd-chip--mini">Ordenadas por llegada</span>
            </p>
            <p className="du-hoja-azul__nota">
              <Icono nombre="info" />
              El precio lo pone cada especialista.
            </p>
            <button type="button" className="hd-boton hd-boton--blanco">
              Ver propuestas
              <Icono nombre="flecha" />
            </button>
          </section>
        </Seccion>

        <Seccion titulo="Mapa">
          <div className="galeria__mapas">
            <MapaHx
              modo="elegir"
              centro={CENTRO_MDP}
              etiqueta="Ejemplo de mapa para elegir la dirección"
              clase="galeria__mapa"
            />
            <MapaHx
              modo="ver"
              centro={CENTRO_MDP}
              zoom={14.5}
              pulso
              etiqueta="Ejemplo de mapa de búsqueda"
              clase="galeria__mapa"
            />
          </div>
        </Seccion>

        <Seccion titulo="Notas y avisos">
          <p className="du-nota">
            <Icono nombre="info" />
            <span>Nada queda acordado hasta que aceptes una propuesta.</span>
          </p>
          <p className="du-aviso">Completá tu perfil para pedir.</p>
          <p className="du-info">
            <Icono nombre="info" />
            <span>Son tareas, no rubros nuevos.</span>
          </p>
        </Seccion>

        <Seccion titulo="Handys">
          <div className="galeria__handys">
            {HANDYS.map((h) => (
              <span key={h} className="galeria__handy">
                <Image
                  className="hd-handy"
                  src={`/img/handy-${h}.webp`}
                  alt={h}
                  width={120}
                  height={120}
                />
                {h !== 'gota' ? (
                  <Image
                    src={`/img/handy-${h}-${h === 'lamparita' || h === 'llave' ? 'rota' : 'roto'}.webp`}
                    alt={`${h} roto`}
                    width={120}
                    height={120}
                  />
                ) : null}
              </span>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Íconos">
          <div className="galeria__iconos">
            {(Object.keys(TRAZOS) as NombreIcono[]).map((n) => (
              <span key={n} className="galeria__icono">
                <Icono nombre={n} />
                <small>{n}</small>
              </span>
            ))}
          </div>
        </Seccion>
      </div>
    </Pantalla>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="du-bloque galeria__seccion" aria-label={titulo}>
      <h2 className="hd-sobre">{titulo}</h2>
      {children}
    </section>
  );
}
