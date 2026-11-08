'use client';

import { Barra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { ruta } from '@/components/nav';
import {
  TEXTO_ETAPA,
  etapaActual,
  etapasConfirmadas,
  totalesObra,
} from '@/components/Trabajo';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { pesos } from '@/domain/dinero';
import { AccionesFijas, Avatar, Boton, Chip, FilaEnlace } from '@/ui';
import { Anillo, Indicador, PedidoAmarillo } from '@/ui/seguimiento';
import { PestanasObra, useObra } from '../compartido';
import { Enlace } from '@/components/nav';

/** Obra por etapas: dónde va, cuánto se informó y se verificó, y cada etapa. Se paga cada etapa al confirmarla. */
export default function Obra() {
  const o = useObra();
  const { t } = o;
  if (o.carga || !t) return o.carga;
  const esp = t.especialista.nombrePublico;
  const hechas = etapasConfirmadas(t);
  const actual = etapaActual(t);
  const tot = totalesObra(t, o.pagos);
  const rubro = o.pedido ? RUBROS_INFO[o.pedido.rubro].nombre : 'Obra';
  const adicional = o.pendientes.find((p) => p.tipo === 'adicional' && p.autorRol === 'especialista');
  const cambio = o.pendientes.find((p) => p.tipo === 'cambio_acuerdo');

  return (
    <Pantalla
      arriba={
        <Barra
          titulo={`Obra de ${rubro.toLowerCase()}`}
          volver={{ href: ruta('/trabajos/detalle/', { id: t.id }), etiqueta: 'Volver al trabajo' }}
          sub={o.pedido?.ubicacion.direccion ?? esp}
        />
      }
      pie={
        <AccionesFijas>
          <Boton variante="contorno" icono="grafico" href={ruta('/obras/gastado/', { id: t.id })}>
            Ver lo gastado
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <div className="ds-fila" style={{ ['--ds-gap' as string]: '0.875rem' }}>
          <Anillo hechas={hechas} total={t.etapas.length} etiqueta={`${hechas} de ${t.etapas.length} etapas confirmadas`} />
          <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.25rem' }}>
            <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.0625rem' }}>
              {actual ? `Etapa ${actual.orden} · ${actual.titulo}` : 'Todas las etapas confirmadas'}
            </h2>
            <span className="ds-fila-enlace__sub">
              {hechas} de {t.etapas.length} etapas confirmadas
            </span>
          </span>
          <Avatar nombre={esp} tam={2.5} />
        </div>
        <div className="dss-kpis">
          <Indicador titulo="VERIFICADO" valor={pesos(tot.verificado)} sub="confirmado" />
          <Indicador titulo="INFORMADO" valor={pesos(tot.informado)} sub="sin verificar" />
          <Indicador titulo="FALTA" valor={pesos(tot.falta)} sub="por pagar" />
        </div>
        {adicional ? (
          <PedidoAmarillo
            icono="caja"
            titulo={`${esp} pide un repuesto`}
            sub="Para aprobar · nada se suma sin tu OK"
            href={ruta('/obras/repuesto/', { id: adicional.id })}
          />
        ) : null}
        {cambio ? (
          <PedidoAmarillo
            icono="calendario"
            titulo={cambio.autorRol === 'especialista' ? `${esp} propone un cambio` : 'Tu cambio espera respuesta'}
            sub="Ver el cambio de fecha"
            href={ruta('/obras/fecha/', { id: t.id })}
          />
        ) : null}
        <PestanasObra id={t.id} activa="etapas" />
        <ol className="ds-pila" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Etapas de la obra">
          {t.etapas.map((e) => {
            const est = TEXTO_ETAPA[e.estado] ?? TEXTO_ETAPA.pendiente!;
            const esActual = e.id === actual?.id;
            return (
              <li key={e.id}>
                <Enlace
                  href={ruta('/obras/etapa/', { id: t.id, etapa: e.id })}
                  className="dss-fila-etapa"
                  {...(esActual ? { 'data-actual': '' } : {})}
                >
                  <span className="dss-fila-etapa__n" aria-hidden="true">
                    {e.orden}
                  </span>
                  <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{e.titulo}</strong>
                    <span className="ds-fila-enlace__sub">{pesos(e.monto.centavos)}</span>
                  </span>
                  <Chip tono={est.tono} icono={e.estado === 'confirmada' ? 'check' : 'reloj'}>
                    {est.texto}
                  </Chip>
                  <Icono nombre="flecha" />
                </Enlace>
              </li>
            );
          })}
        </ol>
        <FilaEnlace
          icono="chat"
          titulo="Chat de la obra"
          sub={`Hablá con ${esp}`}
          href={ruta('/chats/conversacion/', { id: t.conversacionId })}
        />
      </div>
    </Pantalla>
  );
}
