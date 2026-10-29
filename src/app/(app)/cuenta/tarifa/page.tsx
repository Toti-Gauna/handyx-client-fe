'use client';

import { Contador } from '@/components/Contador';
import { useSesion } from '@/components/SesionProvider';
import { Titulo } from '@/components/Titulo';
import { Aviso, Datos } from '@/components/ui';
import { resumirFee, textoFee } from '@/domain/fee';
import { diaMes } from '@/domain/fechas';

export default function Tarifa() {
  const { fee } = useSesion();
  const r = resumirFee(fee);
  if (r.tipo === 'sin_dato' || !fee?.vigente)
    return (
      <>
        <Titulo texto="Tarifa y ==demo==" />
        <Aviso tipo="alerta">No pudimos cargar las condiciones. Probá de nuevo en un rato.</Aviso>
      </>
    );
  const v = fee.vigente;
  return (
    <>
      <Titulo texto="Tarifa y ==demo==" />
      {r.cuenta.terminada ? (
        <Aviso tipo="info" titulo="La demo terminó" rol="status">
          Todavía no hay una tarifa aprobada. No se aplica ninguna hasta que esté aprobada y te la
          avisemos antes.
        </Aviso>
      ) : (
        <Aviso tipo="ok" titulo={`Tarifa de Handy: ${r.porcentajeUsuario} hasta el ${r.hasta}`}>
          <p>{textoFee(r)}</p>
          <p>
            Faltan{' '}
            <strong>
              <Contador hasta={v.vigenteHasta ?? ''} />
            </strong>
            .
          </p>
        </Aviso>
      )}
      <section className="tarjeta">
        <div className="tarjeta__cuerpo">
          <Datos
            filas={[
              ['Alcance', 'Demo cerrada (Mar del Plata)'],
              ['Tarifa para vos', r.porcentajeUsuario],
              ['Tarifa para el especialista', r.porcentajeEspecialista],
              ['Vigente desde', diaMes(v.vigenteDesde)],
              ['Hasta', r.hasta],
              ['Versión', v.version],
              [
                'Tu aceptación',
                fee.aceptada ? `Aceptada el ${diaMes(fee.aceptada.aceptadaEn)}` : 'Pendiente',
              ],
            ]}
          />
        </div>
      </section>
      <h2 className="subtitulo">Cómo se paga</h2>
      <ul className="lista-plana">
        <li>
          El precio lo pone el especialista y se acuerda con una propuesta que las dos partes
          aceptan.
        </li>
        <li>
          Pagás directo al especialista, por Mercado Pago o en efectivo. Handy no recibe ni reparte
          ese dinero.
        </li>
        <li>Tarifa de Handy 0 % no significa trabajo gratis: el servicio se paga entero.</li>
        <li>
          Después del {r.hasta} no se aplica ninguna tarifa que no esté aprobada y avisada antes.
        </li>
      </ul>
    </>
  );
}
