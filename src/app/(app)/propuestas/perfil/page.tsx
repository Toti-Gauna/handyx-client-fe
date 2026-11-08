'use client';

import { useSearchParams } from 'next/navigation';
import { ruta } from '@/components/nav';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { fechaDeInstante, fechaNumerica } from '@/domain/fechas';
import { Avatar, Boton, Chip, DatoFila, Etiqueta, Nota, Tarjeta } from '@/ui';
import { PantallaPedir } from '@/ui/pedir';

const FILAS = [
  { tipo: 'identidad', titulo: 'Identidad', icono: 'usuario' },
  { tipo: 'antecedentes', titulo: 'Antecedentes', icono: 'escudo' },
  { tipo: 'matricula', titulo: 'Matrícula', icono: 'documento' },
] as const;

/**
 * Perfil del especialista antes de elegir (Fase 7 · C-Certificados). Solo lo que el contrato expone: rubros, trabajos
 * con Handyx y las verificaciones que revisó Handyx, con su fecha. Lo que no está revisado se dice «Sin verificar»:
 * cargar un papel no es estar verificado. La matrícula aparece solo si está verificada.
 */
export default function PerfilEspecialista() {
  const id = useSearchParams().get('id');
  const prop = useConsulta('propuesta', id ? { parametros: { id } } : null);

  if (!id)
    return (
      <Vacio titulo="Falta la propuesta" texto="El enlace está incompleto.">
        <Boton href="/pedidos/" chico>
          Ver mis pedidos
        </Boton>
      </Vacio>
    );
  if (prop.estado === 'error' && prop.error)
    return <ErrorEstado error={prop.error} onReintentar={prop.recargar} />;
  const p = prop.datos;
  if (!p) return <Cargando forma="detalle" />;
  const e = p.especialista;
  const primer = e.nombrePublico.split(/\s+/)[0] ?? '';
  const decidible = p.estado === 'pendiente' && p.autorRol === 'especialista';
  const verificada = (t: string) => e.verificaciones.find((v) => v.tipo === t) ?? null;
  const cifras: [string, string][] = [
    ...(e.trabajosRealizados !== null
      ? [[String(e.trabajosRealizados), e.trabajosRealizados === 1 ? 'trabajo' : 'trabajos'] as [string, string]]
      : []),
    [String(e.verificaciones.length), e.verificaciones.length === 1 ? 'verificación' : 'verificaciones'],
    [String(e.rubros.length), e.rubros.length === 1 ? 'rubro' : 'rubros'],
  ];

  return (
    <PantallaPedir
      titulo="Perfil"
      sub="Así lo ves antes de elegir"
      volver={{ href: ruta('/propuestas/detalle/', { id: p.id }), etiqueta: 'Volver a la propuesta' }}
      pie={
        <>
          {decidible ? (
            <Boton href={ruta('/propuestas/detalle/', { id: p.id, elegir: '1' })} icono="check">
              Aceptar su propuesta
            </Boton>
          ) : null}
          <Boton
            href={ruta('/chats/conversacion/', { id: p.conversacionId })}
            variante="contorno"
            icono="chat"
            chico
          >
            Escribirle
          </Boton>
        </>
      }
    >
      <div className="ds-pila dsp-centro" style={{ alignItems: 'center', ['--ds-gap' as string]: '0.375rem' }}>
        <Avatar nombre={e.nombrePublico} tam={5.25} />
        <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.625rem' }}>
          {e.nombrePublico}
        </h2>
        <p className="ds-sub">
          {e.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ')} · Mar del Plata
        </p>
      </div>
      <div className="ds-grilla" style={{ ['--ds-cols' as string]: cifras.length }}>
        {cifras.map(([v, t]) => (
          <span key={t} className="ds-tarjeta ds-tarjeta--hundida dsp-centro" style={{ gap: '0.125rem', padding: '0.75rem 0.375rem' }}>
            <strong className="ds-titulo" style={{ ['--ds-tam' as string]: '1.375rem' }}>
              {v}
            </strong>
            <span className="ds-sub">{t}</span>
          </span>
        ))}
      </div>
      <Tarjeta etiqueta="Verificaciones de Handyx">
        <Etiqueta>Revisado por Handyx</Etiqueta>
        {FILAS.filter((f) => f.tipo !== 'matricula' || verificada(f.tipo)).map((f) => {
          const v = verificada(f.tipo);
          return (
            <DatoFila
              key={f.tipo}
              icono={f.icono}
              etiqueta={f.titulo}
              valor={v ? 'Revisada por Handyx' : 'Todavía no revisada'}
              sub={v ? `El ${fechaNumerica(fechaDeInstante(v.verificadoEn))}` : undefined}
              derecha={
                v ? (
                  <Chip tono="exito" icono="check">
                    Verificada
                  </Chip>
                ) : (
                  <Chip tono="gris" icono="info">
                    Sin verificar
                  </Chip>
                )
              }
            />
          );
        })}
        <Nota icono="info" tono="gris">
          Cargar un papel no es estar verificado: solo marcamos lo que revisó Handyx.
        </Nota>
      </Tarjeta>
      <Nota icono="estrella" tono="gris">
        Las reseñas y las fotos de trabajos anteriores de {primer} todavía no se muestran acá.
      </Nota>
    </PantallaPedir>
  );
}
