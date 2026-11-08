'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Pantalla } from '@/components/hx';
import { ruta, useIr } from '@/components/nav';
import { Campo, EstadoConsulta } from '@/components/ui';
import { TIPOS_AMBIENTE, TIPOS_EQUIPO, type Hogar } from '@/contracts/v1/hogar';
import { useConsulta, useEnvio } from '@/data/hooks';
import { erroresDe } from '@/domain/formularios';
import { Boton, Etiqueta, Nota, Opcion } from '@/ui';
import { AMBIENTES, AvisoEnvio, BarraHogar, EQUIPOS, Segmentos } from '@/ui/hogar';

type TipoAmbiente = (typeof TIPOS_AMBIENTE)[number];
type TipoEquipo = (typeof TIPOS_EQUIPO)[number];

/** Sumar a tu casa (H-Sumar): un ambiente o un equipo, con lo básico. Lo que no se sabe queda vacío. */
export default function Sumar() {
  const params = useSearchParams();
  const esEquipo = params.get('que') === 'equipo';
  const hogar = useConsulta('hogar', {});
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Sumar a tu casa"
          volver={{ href: '/hogar/casa/', etiqueta: 'Volver a Mi casa' }}
        />
      }
    >
      <div className="ds ds-cuerpo">
        <Segmentos
          etiqueta="Qué sumás"
          actual={esEquipo ? 'Equipo' : 'Ambiente'}
          opciones={[
            { texto: 'Ambiente', href: '/hogar/sumar/' },
            { texto: 'Equipo', href: '/hogar/sumar/?que=equipo' },
          ]}
        />
        <EstadoConsulta consulta={hogar}>
          {(h) =>
            esEquipo ? (
              <FormEquipo hogar={h} inicial={params.get('ambiente')} />
            ) : (
              <FormAmbiente />
            )
          }
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}

function FormAmbiente() {
  const ir = useIr();
  const [tipo, setTipo] = useState<TipoAmbiente | null>(null);
  const [nombre, setNombre] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});
  const { enviar, pendiente, error } = useEnvio();
  const errores = { ...erroresDe(error), ...local };
  const guardar = async () => {
    const n = nombre.trim() || (tipo ? AMBIENTES[tipo].nombre : '');
    if (!tipo) return setLocal({ tipo: 'Elegí qué ambiente es.' });
    setLocal({});
    const r = await enviar('ambienteCrear', { cuerpo: { tipo, nombre: n } }, `${tipo}:${n}`);
    if (r?.ok) ir(ruta('/hogar/ambiente/', { id: r.datos.id }), { reemplazar: true });
  };
  return (
    <form
      className="ds-pila"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <Etiqueta como="h2">¿Qué ambiente es?</Etiqueta>
      <div role="radiogroup" aria-label="Tipo de ambiente" className="ds-pila" style={{ ['--ds-gap' as string]: '0.5rem' }}>
        {TIPOS_AMBIENTE.map((t) => (
          <Opcion
            key={t}
            titulo={AMBIENTES[t].nombre}
            icono={AMBIENTES[t].icono}
            elegida={tipo === t}
            onElegir={() => setTipo(t)}
          />
        ))}
      </div>
      {errores.tipo ? <Nota tono="error" icono="alerta" rol="alert">{errores.tipo}</Nota> : null}
      <Campo etiqueta="Nombre" ayuda="Por ejemplo «Baño de arriba». Si lo dejás vacío, usamos el tipo." opcional error={errores.nombre}>
        {(p) => (
          <input {...p} className="entrada" value={nombre} maxLength={60} onChange={(e) => setNombre(e.target.value)} />
        )}
      </Campo>
      <AvisoEnvio error={error?.codigo === 'validacion' ? null : error} />
      <Boton type="submit" icono="check" ocupado={pendiente}>
        Guardar en Mi casa
      </Boton>
    </form>
  );
}

function FormEquipo({ hogar, inicial }: { hogar: Hogar; inicial: string | null }) {
  const ir = useIr();
  const [tipo, setTipo] = useState<TipoEquipo>('calefon');
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [instalado, setInstalado] = useState('');
  const [ambienteId, setAmbienteId] = useState(
    hogar.ambientes.find((a) => a.id === inicial)?.id ?? hogar.ambientes[0]?.id ?? '',
  );
  const { enviar, pendiente, error } = useEnvio();
  const errores = erroresDe(error);
  if (hogar.ambientes.length === 0)
    return (
      <>
        <Nota tono="gris">Para sumar un equipo, primero sumá el ambiente donde está.</Nota>
        <Boton href="/hogar/sumar/" icono="mas">
          Sumar un ambiente
        </Boton>
      </>
    );
  const guardar = async () => {
    const cuerpo = {
      ambienteId,
      tipo,
      nombre: nombre.trim() || EQUIPOS[tipo].nombre,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      instaladoEn: instalado || null,
    };
    const r = await enviar('equipoCrear', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) ir(ruta('/hogar/equipo/', { id: r.datos.id }), { reemplazar: true });
  };
  const texto = (etiqueta: string, valor: string, set: (v: string) => void, campo: string, ayuda?: string) => (
    <Campo etiqueta={etiqueta} opcional error={errores[campo]} {...(ayuda ? { ayuda } : {})}>
      {(p) => <input {...p} className="entrada" value={valor} maxLength={60} onChange={(e) => set(e.target.value)} />}
    </Campo>
  );
  return (
    <form
      className="ds-pila"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <Campo etiqueta="Qué es" error={errores.tipo}>
        {(p) => (
          <select {...p} className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value as TipoEquipo)}>
            {TIPOS_EQUIPO.map((t) => (
              <option key={t} value={t}>
                {EQUIPOS[t].nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      {texto('Nombre', nombre, setNombre, 'nombre', `Si lo dejás vacío, queda «${EQUIPOS[tipo].nombre}».`)}
      {texto('Marca', marca, setMarca, 'marca', 'Está en la etiqueta del equipo.')}
      {texto('Modelo', modelo, setModelo, 'modelo')}
      <Campo etiqueta="Dónde está" error={errores.ambienteId}>
        {(p) => (
          <select {...p} className="entrada" value={ambienteId} onChange={(e) => setAmbienteId(e.target.value)}>
            {hogar.ambientes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo etiqueta="Instalado (aproximado)" opcional error={errores.instaladoEn}>
        {(p) => <input {...p} type="date" className="entrada" value={instalado} onChange={(e) => setInstalado(e.target.value)} />}
      </Campo>
      <Nota tono="gris">Lo que no sepas lo dejás vacío: lo podés completar cuando venga un especialista.</Nota>
      <AvisoEnvio error={error?.codigo === 'validacion' ? null : error} />
      <Boton type="submit" icono="check" ocupado={pendiente}>
        Guardar en Mi casa
      </Boton>
    </form>
  );
}
