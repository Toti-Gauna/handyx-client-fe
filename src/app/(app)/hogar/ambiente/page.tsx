'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { ruta, useIr } from '@/components/nav';
import { Cargando, ErrorEstado } from '@/components/ui';
import type { Ambiente, Equipo } from '@/contracts/v1/hogar';
import { ErrorCliente } from '@/data/cliente';
import { useConsulta, useEnvio } from '@/data/hooks';
import { Boton, Chip, DatoFila, Etiqueta, FilaEnlace, Nota, Tarjeta } from '@/ui';
import {
  BarraHogar,
  Confirmar,
  EQUIPOS,
  PortadaAmbiente,
  faltaAmbiente,
  garantiaVigente,
  medidasTexto,
  useHoy,
} from '@/ui/hogar';
import { EditarAmbiente } from './EditarAmbiente';

/**
 * Un ambiente (H-Ambiente): fotos, medidas, materiales, equipos y nota. Se edita acá mismo (con la versión: si
 * cambió en otro lado, avisa). Abajo, lo que se hace desde el ambiente: algo se rompió o compartirlo con un pedido.
 */
export default function AmbienteDetalle() {
  const id = useSearchParams().get('id');
  const hogar = useConsulta('hogar', {});
  const [editando, setEditando] = useState(false);
  const a = hogar.datos?.ambientes.find((x) => x.id === id) ?? null;
  const volver = { href: '/hogar/casa/', etiqueta: 'Volver a Mi casa' };

  if (hogar.estado === 'error' && hogar.error)
    return (
      <Pantalla arriba={<BarraHogar titulo="Ambiente" volver={volver} />}>
        <ErrorEstado error={hogar.error} onReintentar={hogar.recargar} />
      </Pantalla>
    );
  if (!hogar.datos)
    return (
      <Pantalla arriba={<BarraHogar titulo="Ambiente" volver={volver} />}>
        <Cargando forma="detalle" />
      </Pantalla>
    );
  if (!a)
    return (
      <Pantalla arriba={<BarraHogar titulo="Ambiente" volver={volver} />}>
        <ErrorEstado
          error={new ErrorCliente({
            codigo: 'no_encontrado',
            mensaje: 'Este ambiente ya no está en tu casa.',
          })}
        />
      </Pantalla>
    );

  const equipos = hogar.datos.equipos.filter((e) => e.ambienteId === a.id);
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo={a.nombre}
          volver={volver}
          sub={a.completitud >= 100 ? 'Ficha completa' : `Ficha al ${a.completitud} %`}
          accion={
            editando
              ? undefined
              : { icono: 'editar', etiqueta: `Editar ${a.nombre}`, onClick: () => setEditando(true) }
          }
        />
      }
      pie={
        editando ? undefined : (
          <>
            <Boton icono="alerta" href={ruta('/hogar/rompio/', { ambiente: a.id })}>
              Algo se rompió acá
            </Boton>
            <Boton
              variante="contorno"
              chico
              icono="compartir"
              href={ruta('/hogar/compartir/', { ambiente: a.id })}
            >
              Compartir con un especialista
            </Boton>
          </>
        )
      }
    >
      <div className="ds ds-cuerpo">
        {editando ? (
          <EditarAmbiente
            ambiente={a}
            onListo={() => {
              setEditando(false);
              hogar.recargar();
            }}
            onCancelar={() => setEditando(false)}
            onActualizar={hogar.recargar}
          />
        ) : (
          <Ficha ambiente={a} equipos={equipos} />
        )}
      </div>
    </Pantalla>
  );
}

function Ficha({ ambiente: a, equipos }: { ambiente: Ambiente; equipos: readonly Equipo[] }) {
  const hoy = useHoy();
  const ir = useIr();
  const [borrar, setBorrar] = useState(false);
  const { enviar, pendiente, error } = useEnvio();
  const falta = faltaAmbiente(a, equipos);
  return (
    <>
      <div className="dsh-portada">
        <PortadaAmbiente ambiente={a} alto={190} />
        <Chip tono="blanco" icono="camara">
          {a.fotos.length ? `${a.fotos.length} de 8 fotos` : 'Sin fotos todavía'}
        </Chip>
      </div>
      {a.fotos.length > 1 ? (
        <div className="dsh-fotos">
          {a.fotos.slice(1, 4).map((f) => (
            // eslint-disable-next-line @next/next/no-img-element -- export estático: sin optimizador.
            <img key={f.id} className="dsh-foto" src={f.url} alt="" style={{ height: '4.375rem' }} />
          ))}
        </div>
      ) : null}
      {falta.length ? (
        <Nota tono="gris">Para completar la ficha falta: {falta.join(', ')}.</Nota>
      ) : null}
      <Tarjeta>
        <Etiqueta como="h2">Medidas y materiales</Etiqueta>
        <DatoFila
          icono="regla"
          etiqueta="Medidas"
          valor={medidasTexto(a.medidas) ?? 'Sin medir'}
          sub={a.medidas ? 'Aproximadas' : 'Las podés cargar tocando el lápiz'}
        />
        <DatoFila
          icono="ladrillos"
          etiqueta="Materiales"
          valor={a.materiales ?? 'Sin datos'}
        />
      </Tarjeta>
      <Tarjeta>
        <Etiqueta como="h2">Equipos · {equipos.length}</Etiqueta>
        {equipos.map((e) => (
          <FilaEnlace
            key={e.id}
            icono={EQUIPOS[e.tipo].icono}
            titulo={e.nombre}
            sub={[e.marca, e.modelo].filter(Boolean).join(' · ') || 'Sin datos todavía'}
            href={ruta('/hogar/equipo/', { id: e.id })}
            derecha={
              garantiaVigente(e.garantiaHasta, hoy) ? (
                <Chip tono="exito" icono="escudo">
                  Garantía
                </Chip>
              ) : !e.marca && !e.modelo ? (
                <Chip tono="gris" icono="mas">
                  Completar
                </Chip>
              ) : undefined
            }
          />
        ))}
        <FilaEnlace
          icono="mas"
          titulo="Sumar un equipo acá"
          href={ruta('/hogar/sumar/', { que: 'equipo', ambiente: a.id })}
        />
      </Tarjeta>
      {a.notas ? (
        <blockquote className="dsh-cita">
          <Etiqueta>Nota</Etiqueta>
          <span style={{ display: 'block', marginTop: '0.25rem' }}>{a.notas}</span>
        </blockquote>
      ) : null}
      <Boton variante="peligro" chico icono="tacho" onClick={() => setBorrar(true)}>
        Quitar {a.nombre} de tu casa
      </Boton>
      <Confirmar
        abierta={borrar}
        titulo={`¿Quitar ${a.nombre}?`}
        texto={`Se borran sus fotos, medidas y sus ${equipos.length} equipos. No se puede deshacer.`}
        si={`Sí, quitar ${a.nombre}`}
        ocupado={pendiente}
        error={error}
        onNo={() => setBorrar(false)}
        onSi={async () => {
          const r = await enviar('ambienteBorrar', { parametros: { id: a.id } }, a.id);
          if (r?.ok) ir('/hogar/casa/', { reemplazar: true });
        }}
      />
    </>
  );
}
