'use client';
// Pedir · P-Fecha (día y franja) y P-Zona (dirección). Se llega desde «Revisar» y se vuelve ahí.
import { Calendario } from '@/components/Calendario';
import { ElegirDireccion } from '@/components/ElegirDireccion';
import { FormUbicacion, deUbicacion } from '@/components/FormUbicacion';
import { Campo } from '@/components/ui';
import { fechaLarga } from '@/domain/fechas';
import { Boton, Etiqueta, Nota, Sub, Titulo } from '@/ui';
import { PantallaPedir } from '@/ui/pedir';
import { FRANJAS, type Pedido } from './_pedido';

export function PasoProgramar({ f }: { f: Pedido }) {
  const otraHora = Boolean(f.desde) && !f.franja;
  const errorDia = f.errores.fecha ?? f.errores['fechaSolicitada.fecha'];
  const errorHora =
    f.errores.desde ??
    f.errores.hasta ??
    f.errores['fechaSolicitada.desde'] ??
    f.errores['fechaSolicitada.hasta'];
  const listo = f.fecha
    ? `Listo · ${fechaLarga(f.fecha)}${f.franja ? `, ${f.franja.texto}` : f.desde ? `, ${f.desde} h` : ''}`
    : 'Listo';
  return (
    <PantallaPedir
      titulo={f.tipo === 'obra' ? '¿Cuándo pueden visitar?' : 'Día y franja'}
      volver={{ alTocar: () => f.ir('cuando'), etiqueta: 'Volver a para cuándo' }}
      onSubmit={() => f.confirmar('programar', 'revisar')}
      pie={
        <Boton type="submit" icono="check">
          {listo}
        </Boton>
      }
    >
      <Sub>Es una solicitud: cada especialista la acepta, la rechaza o te propone otra.</Sub>
      <Calendario
        valor={f.fecha}
        onElegir={(d) => {
          f.setFecha(d);
          f.setLocal({});
        }}
      />
      {errorDia ? (
        <p className="campo__error" role="alert">
          {errorDia}
        </p>
      ) : null}
      <Etiqueta como="h2">Franja preferida</Etiqueta>
      <div className="ds-grilla" role="radiogroup" aria-label="Franja preferida">
        {FRANJAS.map((fr) => (
          <button
            key={fr.desde}
            type="button"
            role="radio"
            className="ds-pastilla"
            aria-checked={f.franja === fr}
            disabled={f.yaPaso(fr)}
            onClick={() => {
              f.setDesde(fr.desde);
              f.setHasta(fr.hasta);
              f.setLocal({});
            }}
          >
            {fr.texto}
            {f.yaPaso(fr) ? <span className="ds-solo-lector"> (ya pasó)</span> : null}
          </button>
        ))}
      </div>
      <details className="du-textos du-mas" open={otraHora}>
        <summary>Quiero elegir otro horario</summary>
        <div className="du-form__fila">
          <Campo etiqueta="Desde" error={f.errores.desde ?? f.errores['fechaSolicitada.desde']}>
            {(p) => (
              <input
                {...p}
                className="entrada"
                type="time"
                value={f.desde}
                onChange={(e) => f.setDesde(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Hasta" opcional error={f.errores.hasta ?? f.errores['fechaSolicitada.hasta']}>
            {(p) => (
              <input
                {...p}
                className="entrada"
                type="time"
                value={f.hasta}
                onChange={(e) => f.setHasta(e.target.value)}
              />
            )}
          </Campo>
        </div>
      </details>
      {errorHora && !otraHora ? (
        <p className="campo__error" role="alert">
          {errorHora}
        </p>
      ) : null}
      <Nota icono="info">
        Es tu preferencia: el especialista puede proponerte otro horario y vos decidís.
      </Nota>
    </PantallaPedir>
  );
}

export function PasoDireccion({ f }: { f: Pedido }) {
  return (
    <PantallaPedir
      titulo="¿Dónde?"
      volver={{ alTocar: () => f.ir('revisar'), etiqueta: 'Volver a revisar el pedido' }}
      onSubmit={() => f.confirmar('direccion', 'revisar')}
      pie={
        <Boton type="submit" icono="check">
          Usar esta dirección
        </Boton>
      }
    >
      <div className="ds-pila">
        <Titulo nivel={2} texto="¿Dónde es el ==trabajo==?" />
        <Sub>
          Se comparte solo con el especialista que elijas, al aceptar su propuesta.
        </Sub>
      </div>
      <ElegirDireccion
        actual={f.ubicacion.direccion}
        onElegir={(u) => f.setUbicacion(deUbicacion(u))}
      />
      <FormUbicacion
        valor={f.ubicacion}
        onCambio={f.setUbicacion}
        errores={f.errores}
        onCobertura={f.setCubierta}
      />
    </PantallaPedir>
  );
}
