'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Cargando, ErrorEstado } from '@/components/ui';
import { esVistaDePrueba } from '@/data';
import { useConsulta, useEnvio } from '@/data/hooks';
import { Boton, Chip, MosaicoIcono, Nota, Opcion, SelloListo } from '@/ui';
import { CampoCodigo, PantallaPaso } from '@/ui/acceso';

type Metodo = 'app' | 'email';
const METODOS: readonly {
  valor: Metodo;
  titulo: string;
  sub: string;
  icono: 'candado' | 'sobre';
}[] = [
  {
    valor: 'app',
    titulo: 'App autenticadora',
    sub: 'La más segura · funciona sin señal',
    icono: 'candado',
  },
  { valor: 'email', titulo: 'Email', sub: 'Un segundo código a tu email', icono: 'sobre' },
];
const CODIGO_PRUEBA = '246810';

/**
 * Segunda verificación (opcional, fila A del lienzo): elegir app autenticadora o email › confirmar con un código de 6
 * números. Si ya está activa, lo dice. Se apaga desde Cuenta.
 */
export default function SegundaVerificacion() {
  const estado = useConsulta('segundaVerificacion', {});
  const { enviar, pendiente, error } = useEnvio();
  const [metodo, setMetodo] = useState<Metodo>('app');
  const [paso, setPaso] = useState<'metodo' | 'codigo'>('metodo');
  const [codigo, setCodigo] = useState('');
  const [local, setLocal] = useState<string | null>(null);
  const barra = { titulo: 'Segunda verificación', atras: { href: '/registro/listo/' } };

  async function activar() {
    if (!/^\d{6}$/.test(codigo)) return setLocal('Escribí los 6 números del código.');
    setLocal(null);
    const r = await enviar(
      'segundaVerificacionActivar',
      { cuerpo: { metodo, codigo } },
      `${metodo}|${codigo}`,
    );
    if (r?.ok) estado.recargar();
  }

  if (estado.estado === 'error' && estado.error)
    return <ErrorEstado error={estado.error} onReintentar={estado.recargar} />;
  if (!estado.datos || estado.refrescando) return <Cargando texto="Revisando tu cuenta…" />;

  if (estado.datos.activa)
    return (
      <PantallaPaso
        titulo="Tu cuenta tiene ==doble== llave"
        sub={`La segunda verificación está activa (${estado.datos.metodo === 'email' ? 'por email' : 'con app autenticadora'}). Al entrar te vamos a pedir un segundo código. La podés apagar desde Cuenta.`}
        barra={barra}
        pie={<Boton href="/inicio/">Ir al inicio</Boton>}
      >
        <div className="dsa-centro">
          <SelloListo etiqueta="Segunda verificación activa" />
        </div>
      </PantallaPaso>
    );

  if (paso === 'metodo')
    return (
      <PantallaPaso
        titulo="Un paso más de ==seguridad=="
        sub="Si la activás, al entrar te pedimos un segundo código. La podés apagar desde Cuenta."
        barra={barra}
        pie={
          <>
            <Boton onClick={() => setPaso('codigo')}>Seguir</Boton>
            <Boton href="/inicio/" variante="contorno">
              Ahora no
            </Boton>
          </>
        }
      >
        <div className="ds-fila">
          <MosaicoIcono icono="escudo" tam={4} />
          <Chip icono="info">Opcional</Chip>
        </div>
        <div
          className="ds-pila"
          role="radiogroup"
          aria-label="Cómo querés recibir el segundo código"
          style={{ '--ds-gap': '0.75rem' } as CSSProperties}
        >
          {METODOS.map((m) => (
            <Opcion
              key={m.valor}
              titulo={m.titulo}
              sub={m.sub}
              icono={m.icono}
              elegida={metodo === m.valor}
              onElegir={() => setMetodo(m.valor)}
            />
          ))}
        </div>
      </PantallaPaso>
    );

  return (
    <PantallaPaso
      titulo="Confirmá con un ==código=="
      sub={
        metodo === 'app'
          ? 'Abrí tu app autenticadora y escribí los 6 números que muestra para Handyx.'
          : 'Escribí los 6 números del código que te llegó a tu email.'
      }
      barra={{ ...barra, atras: { alTocar: () => setPaso('metodo') } }}
      onSubmit={() => void activar()}
      pie={
        <Boton type="submit" ocupado={pendiente}>
          Activar
        </Boton>
      }
    >
      <CampoCodigo
        etiqueta="Código de 6 números"
        valor={codigo}
        onCambio={setCodigo}
        error={local ?? (error ? error.mensaje : null)}
      />
      {esVistaDePrueba ? (
        <Nota tono="amarillo">
          Vista de prueba: el código es <strong>{CODIGO_PRUEBA}</strong>.
        </Nota>
      ) : null}
    </PantallaPaso>
  );
}
