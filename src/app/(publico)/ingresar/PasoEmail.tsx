'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icono } from '@/components/Icono';
import { Campo } from '@/components/ui';
import { AVISO_LEGAL_PROVISORIO, TEXTOS_LEGALES } from '@/content/textos';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { CUENTA_PRUEBA } from '@/data/prueba';
import { Boton, Etiqueta, FilaEnlace, Nota } from '@/ui';
import { Casilla, OpcionLetra, PantallaPaso } from '@/ui/acceso';
import { Enlace } from '@/components/nav';

const PROVEEDORES = { google: 'Google', apple: 'Apple' } as const;

/** Casilla única de términos y privacidad (sin tildar) y los textos para leer antes. */
export function TextosLegales({
  acepta,
  onAcepta,
  error,
}: {
  acepta: boolean;
  onAcepta: (v: boolean) => void;
  error?: string | undefined;
}) {
  return (
    <>
      <Casilla marcada={acepta} onCambiar={onAcepta} error={error ?? null}>
        Leí y acepto los <strong>términos de uso</strong> y la{' '}
        <strong>política de privacidad</strong> de la demo.
      </Casilla>
      <details className="dsa-textos">
        <summary>Leer los textos</summary>
        <p>{AVISO_LEGAL_PROVISORIO}</p>
        {Object.values(TEXTOS_LEGALES).map((t) => (
          <section key={t.version}>
            <h2>{t.titulo}</h2>
            {t.parrafos.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </section>
        ))}
      </details>
    </>
  );
}

/** Primer paso del acceso: email (el código llega ahí) o Google/Apple (inactivos hasta tener proveedor aprobado). */
export function PasoEmail({
  modo,
  aviso,
  email,
  onEmail,
  acepta,
  onAcepta,
  errores,
  errorServidor,
  pendiente,
  total,
  onSeguir,
}: {
  modo: 'alta' | 'ingreso';
  aviso?: string | undefined;
  email: string;
  onEmail: (v: string) => void;
  acepta: boolean;
  onAcepta: (v: boolean) => void;
  errores: Record<string, string>;
  errorServidor: string | null;
  pendiente: boolean;
  total: number;
  onSeguir: () => void;
}) {
  const proveedor = useEnvio();
  const [avisoProveedor, setAvisoProveedor] = useState<string | null>(null);

  async function conProveedor(p: keyof typeof PROVEEDORES) {
    setAvisoProveedor(null);
    const r = await proveedor.enviar('accesoProveedor', { cuerpo: { proveedor: p } }, p);
    if (r?.ok) window.location.assign(r.datos.url);
    else if (r)
      setAvisoProveedor(
        r.error.codigo === 'funcion_inactiva'
          ? `Entrar con ${PROVEEDORES[p]} todavía no está disponible. Por ahora usá tu email: te mandamos un código y listo.`
          : r.error.mensaje,
      );
  }

  return (
    <PantallaPaso
      titulo={modo === 'alta' ? 'Creá tu ==cuenta==' : '¿Cómo querés ==entrar==?'}
      sub="Sin contraseñas: cada vez te mandamos un código a tu email."
      barra={{
        titulo: modo === 'alta' ? 'Crear cuenta' : 'Entrar',
        sub: `Paso 1 de ${total}`,
        atras: { href: '/' },
      }}
      paso={1}
      total={total}
      onSubmit={onSeguir}
      nota={modo === 'alta' ? 'Si ya tenés cuenta con ese email, entrás a la misma.' : undefined}
      pie={
        <Boton type="submit" icono="sobre" ocupado={pendiente}>
          Mandar el código
        </Boton>
      }
    >
      {aviso ? (
        <Nota tono="amarillo" icono="alerta" rol="status">
          {aviso}
        </Nota>
      ) : null}
      <Campo etiqueta="Tu email" error={errores.email} requerido>
        {(p) => (
          <input
            {...p}
            className="entrada"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={(e) => onEmail(e.target.value)}
          />
        )}
      </Campo>
      {modo === 'alta' ? (
        <TextosLegales acepta={acepta} onAcepta={onAcepta} error={errores.aceptaciones} />
      ) : null}
      {errorServidor ? (
        <Nota tono="error" rol="alert">
          {errorServidor}
        </Nota>
      ) : null}
      {esVistaDePrueba && modo === 'ingreso' ? (
        <Nota tono="amarillo">
          Vista de prueba: cuenta ficticia <strong className="codigo">{CUENTA_PRUEBA.email}</strong>
          . Con otro email se crea una cuenta nueva.
        </Nota>
      ) : null}
      <div className="ds-pila" style={{ '--ds-gap': '0' } as CSSProperties}>
        <Etiqueta como="h2">O seguí con</Etiqueta>
        <OpcionLetra
          letra="G"
          titulo="Continuar con Google"
          sub="Tu cuenta de Google"
          ocupado={proveedor.pendiente}
          onClick={() => void conProveedor('google')}
        />
        <FilaEnlace
          icono="candado"
          titulo="Continuar con Apple"
          sub="Tu Apple ID"
          tono="gris"
          derecha={<Icono nombre="flecha" />}
          onClick={() => void conProveedor('apple')}
        />
      </div>
      {avisoProveedor ? (
        <Nota tono="gris" rol="status">
          {avisoProveedor}
        </Nota>
      ) : null}
      {modo === 'ingreso' ? (
        <Enlace href="/ingresar/clave/" className="dsa-enlace">
          Tengo contraseña: entrar con ella
        </Enlace>
      ) : null}
    </PantallaPaso>
  );
}
