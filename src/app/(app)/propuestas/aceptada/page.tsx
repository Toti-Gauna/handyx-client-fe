'use client';

import { useSearchParams } from 'next/navigation';
import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { horarioCorto, nombreCorto, totalDe } from '@/components/Propuesta';
import { TituloDocumento } from '@/components/TituloDocumento';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Avatar, Boton, Etiqueta, Monto, Nota, Separador, Sub, Tarjeta, Titulo } from '@/ui';
import { QueSigue, SelloTurno } from '@/ui/pedir';

/**
 * ¡Turno confirmado! (Fase 7 · C-Aceptada): sello azul, el ticket del turno en azul y qué sigue. Sin bloques verdes ni
 * tiempos de llegada: el día del turno el viaje se ve solo mientras el especialista lo comparte (lo calcula el servidor).
 */
export default function TurnoConfirmado() {
  const id = useSearchParams().get('id');
  const prop = useConsulta('propuesta', id ? { parametros: { id } } : null);
  const pedidoId = prop.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);

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
  const primer = nombreCorto(e.nombrePublico);
  const chat = ruta('/chats/conversacion/', { id: p.conversacionId });

  if (p.estado !== 'aceptada' || !p.trabajoId)
    return (
      <Vacio titulo="Este turno no está confirmado" texto="La propuesta todavía no se aceptó.">
        <Boton href={ruta('/propuestas/detalle/', { id: p.id })} chico>
          Ver la propuesta
        </Boton>
      </Vacio>
    );

  const rubro = pedido.datos ? RUBROS_INFO[pedido.datos.rubro].nombre : RUBROS_INFO[e.rubros[0]!].nombre;
  return (
    <Pantalla
      pie={
        <div className="ds ds-pila">
          <Boton href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>Ver el turno</Boton>
          <Boton href={chat} variante="contorno" icono="chat">
            Escribirle a {primer}
          </Boton>
        </div>
      }
    >
      <TituloDocumento texto="Turno confirmado" />
      <div className="ds ds-cuerpo">
        <SelloTurno />
        <div className="ds-pila dsp-centro" style={{ ['--ds-gap' as string]: '0.375rem' }}>
          <Titulo tam={2.125} texto="¡Turno ==confirmado==!" />
          <Sub>Le avisamos a {primer}. Coordinan los detalles por el chat.</Sub>
        </div>
        <Tarjeta tono="azul" etiqueta="Tu turno">
          <div className="ds-fila">
            <Avatar nombre={e.nombrePublico} tam={3} tono={0} />
            <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
              <strong style={{ fontSize: '1rem' }}>{e.nombrePublico}</strong>
              <span className="ds-sub">{rubro}</span>
            </span>
          </div>
          <Separador />
          <div className="ds-fila" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span className="ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
              <Etiqueta>Cuándo</Etiqueta>
              <strong style={{ fontSize: '1rem' }}>{horarioCorto(p)}</strong>
            </span>
            <Monto centavos={totalDe(p)} tam={1.5} color="inherit" />
          </div>
        </Tarjeta>
        <QueSigue
          pasos={[
            {
              icono: 'chat',
              titulo: `Hablás con ${primer}`,
              sub: 'Para coordinar el acceso',
              tono: 'azul',
            },
            {
              icono: 'pin',
              titulo: 'El día del turno',
              sub: 'Lo ves venir solo mientras comparte el viaje',
            },
            {
              icono: 'billete',
              titulo: 'Al terminar, pagás directo',
              sub: 'Mercado Pago o efectivo',
            },
          ]}
        />
        <Nota icono="candado" tono="gris">
          Tu dirección exacta la ve solo {primer}, para este trabajo.
        </Nota>
      </div>
    </Pantalla>
  );
}
