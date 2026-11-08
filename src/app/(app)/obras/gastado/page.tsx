'use client';

import { Barra, Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { desglose, totalesObra } from '@/components/Trabajo';
import { pesos } from '@/domain/dinero';
import { AccionesFijas, Boton, Etiqueta, Monto, Nota, Tarjeta } from '@/ui';
import { FilaTotal } from '@/ui/seguimiento';
import { PestanasObra, useObra } from '../compartido';

const pct = (parte: number, total: number) => (total > 0 ? Math.min(100, (parte / total) * 100) : 0);

/** Lo gastado en la obra: lo verificado y lo informado por separado, y lo que falta. Nada de esto es una factura. */
export default function GastadoObra() {
  const o = useObra();
  const { t } = o;
  if (o.carga || !t) return o.carga;
  const tot = totalesObra(t, o.pagos);
  const d = desglose(t, o.propuestas);
  const tramos = [
    { texto: 'Verificado', centavos: tot.verificado, fondo: 'var(--ds-azul)' },
    { texto: 'Informado', centavos: tot.informado, fondo: 'var(--ds-c-3a78d0)' },
    { texto: 'Falta', centavos: tot.falta, fondo: 'var(--ds-c-c7cdd8)' },
  ];

  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Lo gastado"
          volver={{ href: ruta('/obras/detalle/', { id: t.id }), etiqueta: 'Volver a la obra' }}
          sub={t.especialista.nombrePublico}
        />
      }
      pie={
        <AccionesFijas>
          <Boton variante="contorno" href={ruta('/obras/pagos/', { id: t.id })}>
            Ver los pagos
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <PestanasObra id={t.id} activa="gastado" />
        <section className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }} aria-label="Total de la obra">
          <Etiqueta>TOTAL CON REPUESTOS</Etiqueta>
          <Monto centavos={tot.total} tam={2.5} />
          <span className="ds-fila-enlace__sub" style={{ fontSize: '0.9375rem' }}>
            Verificado {pesos(tot.verificado)} · informado {pesos(tot.informado)} · faltan {pesos(tot.falta)}
          </span>
        </section>
        <div
          className="dss-barra-gasto"
          role="img"
          aria-label={tramos.map((x) => `${x.texto} ${pesos(x.centavos)}`).join(', ')}
        >
          {tramos.map((x) => (
            <span key={x.texto} style={{ width: `${pct(x.centavos, tot.total)}%`, background: x.fondo }} />
          ))}
        </div>
        <div className="dss-leyenda">
          {tramos.map((x) => (
            <span key={x.texto}>
              <i aria-hidden="true" style={{ background: x.fondo }} />
              {x.texto}
            </span>
          ))}
        </div>
        <Tarjeta etiqueta="De qué se compone">
          <FilaTotal texto={`Mano de obra y materiales (${t.etapas.length} etapas)`} centavos={d.acuerdo} />
          {d.adicional ? <FilaTotal texto="Repuestos y adicionales aprobados" centavos={d.adicional} /> : null}
          <FilaTotal texto="Tarifa de servicio" centavos={d.tarifa} />
          <FilaTotal texto="Total" centavos={tot.total} fuerte />
        </Tarjeta>
        <Nota icono="info" tono="gris">
          Informado no es verificado: un pago queda verificado cuando lo confirma otra parte. Al terminar, el
          resumen y las garantías quedan en Mi hogar.
        </Nota>
      </div>
    </Pantalla>
  );
}
