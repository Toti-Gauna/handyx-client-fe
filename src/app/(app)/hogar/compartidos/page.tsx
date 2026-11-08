'use client';

import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { EstadoConsulta } from '@/components/ui';
import type { Compartido, Hogar } from '@/contracts/v1/hogar';
import { useConsulta, useEnvio } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { fechaDeInstante } from '@/domain/fechas';
import { Boton, Chip, MosaicoIcono, Nota, Sub, Tarjeta, Titulo } from '@/ui';
import { BarraHogar, Confirmar, claveItem, fechaDMA, nombreCompartido } from '@/ui/hogar';

const ESTADO: Record<
  Compartido['estado'],
  { texto: string; tono: 'exito' | 'gris'; icono: 'check' | 'reloj' | 'cerrar' }
> = {
  activo: { texto: 'Activo', tono: 'exito', icono: 'check' },
  vencido: { texto: 'Terminado', tono: 'gris', icono: 'reloj' },
  revocado: { texto: 'Cortado', tono: 'gris', icono: 'cerrar' },
};

/** Lo que compartiste (H-Compartido): cada vez que se compartió algo de la casa, con qué pedido; se puede cortar. */
export default function Compartidos() {
  const compartidos = useConsulta('compartidos', {});
  const hogar = useConsulta('hogar', {});
  // Cortados en esta pantalla mientras el servidor confirma (se vuelve atrás si falla).
  const [cortados, setCortados] = useState<ReadonlySet<string>>(new Set());
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Lo que compartiste"
          volver={{ href: '/hogar/', etiqueta: 'Volver a Mi hogar' }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <Titulo texto="Lo que ==compartiste==" nivel={2} />
        <Sub>Cada vez que compartís algo de tu casa queda acá. Lo podés cortar cuando quieras.</Sub>
        <EstadoConsulta consulta={compartidos} cargando="Cargando lo que compartiste…">
          {({ items }) =>
            items.length === 0 ? (
              <Nota tono="gris" icono="compartir">
                Todavía no compartiste nada. Cuando hagas un pedido, vas a poder sumarle fotos,
                medidas o equipos de tu casa.
              </Nota>
            ) : (
              items.map((c) => (
                <TarjetaCompartido
                  key={c.id}
                  compartido={cortados.has(c.id) ? { ...c, estado: 'revocado' } : c}
                  hogar={hogar.datos}
                  onCortar={(si) =>
                    setCortados((prev) => {
                      const n = new Set(prev);
                      if (si) n.add(c.id);
                      else n.delete(c.id);
                      return n;
                    })
                  }
                  onListo={compartidos.recargar}
                />
              ))
            )
          }
        </EstadoConsulta>
        <Nota tono="gris" icono="candado">
          Nunca compartimos tu ficha con nadie sin que lo elijas, ni la usamos para publicidad.
        </Nota>
      </div>
    </Pantalla>
  );
}

function TarjetaCompartido({
  compartido: c,
  hogar,
  onCortar,
  onListo,
}: {
  compartido: Compartido;
  hogar: Hogar | null;
  onCortar: (si: boolean) => void;
  onListo: () => void;
}) {
  const pedido = useConsulta('pedido', { parametros: { id: c.pedidoId } });
  const [preguntar, setPreguntar] = useState(false);
  const { enviar, pendiente, error } = useEnvio();
  const e = ESTADO[c.estado];
  const rubro = pedido.datos ? RUBROS_INFO[pedido.datos.rubro].nombre : null;
  const desde = fechaDMA(fechaDeInstante(c.creadoEn));
  return (
    <Tarjeta como="article" etiqueta={rubro ? `Pedido de ${rubro.toLowerCase()}` : 'Pedido'}>
      <div className="ds-fila">
        <MosaicoIcono icono={pedido.datos ? RUBROS_INFO[pedido.datos.rubro].icono : 'personas'} />
        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
          <strong>{rubro ? `Pedido de ${rubro.toLowerCase()}` : 'Pedido'}</strong>
          <span className="dsh-suave">
            {c.estado === 'activo'
              ? `Lo ven los especialistas del pedido · desde el ${desde}`
              : `Del ${desde}${c.finalizadoEn ? ` al ${fechaDMA(fechaDeInstante(c.finalizadoEn))}` : ''}`}
          </span>
        </span>
        <Chip tono={e.tono} icono={e.icono}>
          {e.texto}
        </Chip>
      </div>
      <div className="ds-fila" style={{ flexWrap: 'wrap', ['--ds-gap' as string]: '0.375rem' }}>
        {c.items.map((i) => (
          <Chip key={claveItem(i)} tono="gris">
            {nombreCompartido(i, hogar)}
          </Chip>
        ))}
      </div>
      {c.estado === 'activo' ? (
        <Boton variante="peligro" chico icono="cerrar" onClick={() => setPreguntar(true)}>
          Dejar de compartir
        </Boton>
      ) : null}
      <Confirmar
        abierta={preguntar}
        titulo="¿Dejar de compartir?"
        texto="Los especialistas de este pedido dejan de ver estos datos de tu casa. Si después cambiás de idea, lo podés compartir de nuevo."
        si="Sí, dejar de compartir"
        ocupado={pendiente}
        error={error}
        onNo={() => setPreguntar(false)}
        onSi={async () => {
          onCortar(true);
          const r = await enviar('compartidoRevocar', { parametros: { id: c.id } }, c.id);
          if (r?.ok) {
            setPreguntar(false);
            onListo();
          } else onCortar(false);
        }}
      />
    </Tarjeta>
  );
}
