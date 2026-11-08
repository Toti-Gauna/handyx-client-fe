'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { Cargando, ErrorEstado } from '@/components/ui';
import type { Ambiente, Equipo } from '@/contracts/v1/hogar';
import { ErrorCliente } from '@/data/cliente';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Boton, Chip, DatoFila, Etiqueta, FilaEnlace, MosaicoIcono, Nota, Tarjeta } from '@/ui';
import {
  BarraHogar,
  EQUIPOS,
  cuandoRecordatorio,
  fechaDMA,
  garantiaVigente,
  hrefPedir,
  mesAnio,
  useHoy,
} from '@/ui/hogar';
import { EditarEquipo } from './EditarEquipo';

/**
 * Un equipo (H-Equipo): la etiqueta, sus datos, recordatorios y los trabajos de su rubro. «Pedir una revisión» arma el
 * pedido con el rubro del equipo; el recordatorio solo avisa: la persona decide si pide y a quién.
 */
export default function EquipoDetalle() {
  const id = useSearchParams().get('id');
  const hogar = useConsulta('hogar', {});
  const [editando, setEditando] = useState(false);
  const e = hogar.datos?.equipos.find((x) => x.id === id) ?? null;
  const amb = hogar.datos?.ambientes.find((a) => a.id === e?.ambienteId) ?? null;
  const volver = amb
    ? { href: ruta('/hogar/ambiente/', { id: amb.id }), etiqueta: `Volver a ${amb.nombre}` }
    : { href: '/hogar/casa/?ver=equipos', etiqueta: 'Volver a Mi casa' };

  const cuerpo =
    hogar.estado === 'error' && hogar.error ? (
      <ErrorEstado error={hogar.error} onReintentar={hogar.recargar} />
    ) : !hogar.datos ? (
      <Cargando forma="detalle" />
    ) : !e ? (
      <ErrorEstado
        error={
          new ErrorCliente({
            codigo: 'no_encontrado',
            mensaje: 'Este equipo ya no está en tu casa.',
          })
        }
      />
    ) : editando ? (
      <EditarEquipo
        equipo={e}
        ambientes={hogar.datos.ambientes}
        onListo={() => {
          setEditando(false);
          hogar.recargar();
        }}
        onCancelar={() => setEditando(false)}
        onActualizar={hogar.recargar}
      />
    ) : (
      <Ficha equipo={e} ambiente={amb} />
    );

  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo={e?.nombre ?? 'Equipo'}
          volver={volver}
          sub={amb?.nombre}
          accion={
            e && !editando
              ? {
                  icono: 'editar',
                  etiqueta: `Editar ${e.nombre}`,
                  onClick: () => setEditando(true),
                }
              : undefined
          }
        />
      }
      pie={
        e && !editando ? (
          <Boton icono="llama" href={hrefPedir(e.tipo, 'revision')}>
            Pedir una revisión
          </Boton>
        ) : undefined
      }
    >
      <div className="ds ds-cuerpo">{cuerpo}</div>
    </Pantalla>
  );
}

function Ficha({ equipo: e, ambiente }: { equipo: Equipo; ambiente: Ambiente | null }) {
  const hoy = useHoy();
  const recordatorios = useConsulta('recordatorios', {});
  const trabajos = useConsulta('trabajos', { consulta: { vista: 'historial', limite: 50 } });
  const info = EQUIPOS[e.tipo];
  const propios = recordatorios.datos?.items.filter((r) => r.equipoId === e.id) ?? [];
  const delRubro =
    trabajos.datos?.items.filter(
      (t) => info.rubro !== null && t.especialista.rubros.includes(info.rubro),
    ) ?? [];
  const vigente = garantiaVigente(e.garantiaHasta, hoy);
  const aviso = propios.find((r) => r.activo);

  return (
    <>
      <div className="ds-fila" style={{ alignItems: 'stretch' }}>
        <MosaicoIcono icono={info.icono} tam={7} />
        <span className="ds-crece ds-pila" style={{ justifyContent: 'center' }}>
          <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.5rem' }}>
            {e.nombre}
          </h2>
          <span className="ds-sub">
            {[info.nombre, e.marca, e.modelo].filter(Boolean).join(' · ')}
          </span>
          {aviso ? (
            <span>
              <Chip tono="amarillo" icono="alerta">
                {aviso.titulo}
              </Chip>
            </span>
          ) : null}
        </span>
      </div>
      <Tarjeta>
        <div className="ds-fila">
          {e.etiqueta ? (
            // eslint-disable-next-line @next/next/no-img-element -- export estático: sin optimizador.
            <img
              className="dsh-foto"
              src={e.etiqueta.url}
              alt="Foto de la etiqueta"
              style={{ width: '6rem', height: '4.5rem', borderRadius: '0.75rem' }}
            />
          ) : (
            <MosaicoIcono icono="etiqueta" tam={4.5} tono="gris" />
          )}
          <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
            <Etiqueta como="h2">Etiqueta</Etiqueta>
            <strong>{e.etiqueta ? 'Modelo y potencia, a mano' : 'Todavía sin foto'}</strong>
            <span className="dsh-suave">El especialista la ve solo si la compartís</span>
          </span>
        </div>
      </Tarjeta>
      <Tarjeta>
        <DatoFila
          icono="calendario"
          etiqueta="Instalado"
          valor={e.instaladoEn ? mesAnio(e.instaladoEn) : 'Sin datos'}
        />
        <DatoFila
          icono="engranaje"
          etiqueta="Último mantenimiento"
          valor={e.ultimoMantenimiento ? mesAnio(e.ultimoMantenimiento) : 'Sin datos'}
        />
        <DatoFila
          icono="escudo"
          etiqueta="Garantía del trabajo"
          valor={
            !e.garantiaHasta
              ? 'Sin garantía cargada'
              : vigente
                ? `Hasta el ${fechaDMA(e.garantiaHasta)}`
                : 'Vencida'
          }
          derecha={
            vigente ? (
              <Chip tono="exito" icono="check">
                Vigente
              </Chip>
            ) : undefined
          }
        />
        <DatoFila icono="pin" etiqueta="Dónde está" valor={ambiente?.nombre ?? 'Sin ambiente'} />
      </Tarjeta>
      {propios.length ? (
        <Tarjeta pie={{ texto: 'Ver todos los recordatorios', href: '/hogar/recordatorios/' }}>
          <Etiqueta como="h2">Recordatorios</Etiqueta>
          {propios.map((r) => (
            <DatoFila
              key={r.id}
              icono="campana"
              etiqueta={r.activo ? 'Activo' : 'En pausa'}
              valor={r.titulo}
              sub={cuandoRecordatorio(r)}
            />
          ))}
        </Tarjeta>
      ) : null}
      {delRubro.length && info.rubro ? (
        <Tarjeta pie={{ texto: 'Ver informes y garantías', href: '/hogar/garantias/' }}>
          <Etiqueta como="h2">
            Trabajos de {RUBROS_INFO[info.rubro].nombre.toLowerCase()} en tu casa
          </Etiqueta>
          {delRubro.map((t) => (
            <FilaEnlace
              key={t.id}
              icono="documento"
              titulo={t.especialista.nombrePublico}
              sub={mesAnio(t.creadoEn.slice(0, 10))}
              href={ruta('/trabajos/detalle/', { id: t.id })}
            />
          ))}
        </Tarjeta>
      ) : null}
      <Nota tono="gris">
        El recordatorio es solo eso: vos decidís si pedís la revisión y a quién.
      </Nota>
    </>
  );
}
