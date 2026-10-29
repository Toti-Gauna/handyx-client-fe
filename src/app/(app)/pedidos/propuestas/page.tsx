'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta } from '@/components/nav';
import { PerfilProfesional, TarjetaPropuesta, Vigencia } from '@/components/Propuesta';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { cuando } from '@/domain/fechas';

export default function Propuestas() {
  const pedidoId = useSearchParams().get('pedido');
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null, {
    cada: 4_000,
  });
  const lista = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 4_000 },
  );
  const [tabla, setTabla] = useState(false);

  if (!pedidoId)
    return (
      <Vacio titulo="Falta el pedido" texto="El enlace está incompleto.">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  const error = lista.error ?? pedido.error;
  if (error)
    return (
      <ErrorEstado
        error={error}
        onReintentar={() => {
          lista.recargar();
          pedido.recargar();
        }}
      />
    );
  if (!lista.datos || !pedido.datos) return <Cargando />;

  // Todas las ofertas del especialista; las contrapropuestas del usuario se ven en el detalle y en el chat.
  const cotizaciones = lista.datos.items.filter((p) => p.tipo === 'cotizacion');
  const ofertas = cotizaciones.filter((p) => p.autorRol === 'especialista');
  const vigentes = ofertas.filter((p) => p.estado === 'pendiente');
  const otras = ofertas.filter((p) => p.estado !== 'pendiente');
  const mias = cotizaciones.filter((p) => p.autorRol === 'usuario' && p.estado === 'pendiente');

  return (
    <>
      <Titulo texto="Tus ==propuestas==" />
      <p>
        <Enlace className="enlace-tarjeta" href={ruta('/pedidos/detalle/', { id: pedidoId })}>
          ← Volver al pedido
        </Enlace>
      </p>
      {pedido.datos.estado === 'contratado' && pedido.datos.trabajoId ? (
        <Aviso tipo="ok" titulo="Ya hay un acuerdo">
          <Enlace
            className="enlace-tarjeta"
            href={ruta('/trabajos/detalle/', { id: pedido.datos.trabajoId })}
          >
            Ver el trabajo
          </Enlace>
        </Aviso>
      ) : null}
      {mias.length ? (
        <Aviso tipo="info" titulo="Esperando respuesta">
          Tu contrapropuesta está pendiente: nada queda acordado hasta que el especialista la
          acepte.
        </Aviso>
      ) : null}
      {vigentes.length === 0 && mias.length === 0 && pedido.datos.estado !== 'contratado' ? (
        <Aviso tipo="alerta" titulo="No hay propuestas vigentes">
          Las propuestas que llegaron ya vencieron o se resolvieron.
        </Aviso>
      ) : null}

      {vigentes.length > 1 ? (
        <div className="acciones" style={{ marginBottom: 8 }}>
          <Boton variante="claro" chico aria-pressed={tabla} onClick={() => setTabla(!tabla)}>
            {tabla ? 'Ver como tarjetas' : 'Comparar en tabla'}
          </Boton>
        </div>
      ) : null}
      {vigentes.length > 1 ? (
        <p className="texto-suave">Ordenadas por llegada. No es una recomendación ni un ranking.</p>
      ) : null}

      {tabla && vigentes.length > 1 ? (
        <div
          style={{ overflowX: 'auto' }}
          role="region"
          aria-label="Comparación de propuestas"
          tabIndex={0}
        >
          <table className="tabla">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                {vigentes.map((p) => (
                  <th key={p.id} scope="col">
                    {p.especialista.nombrePublico}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Precio</th>
                {vigentes.map((p) => (
                  <td key={p.id}>
                    <strong>{pesos(p.monto.centavos)}</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Comisión de Handy</th>
                {vigentes.map((p) => (
                  <td key={p.id}>{pesos(p.comisionHandy.importe.centavos)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Horario</th>
                {vigentes.map((p) => (
                  <td key={p.id}>{p.horario ? cuando(p.horario.inicio) : 'A coordinar'}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Qué incluye</th>
                {vigentes.map((p) => (
                  <td key={p.id}>{p.alcance}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Verificaciones</th>
                {vigentes.map((p) => (
                  <td key={p.id}>
                    <PerfilProfesional e={{ ...p.especialista, trabajosRealizados: null }} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Vigencia</th>
                {vigentes.map((p) => (
                  <td key={p.id}>
                    <Vigencia hasta={p.venceEn} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">&nbsp;</th>
                {vigentes.map((p) => (
                  <td key={p.id}>
                    <Enlace
                      className="boton boton--chico"
                      href={ruta('/propuestas/detalle/', { id: p.id })}
                    >
                      Ver y responder
                    </Enlace>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="lista-tarjetas">
          {vigentes.map((p) => (
            <TarjetaPropuesta key={p.id} p={p} />
          ))}
        </ul>
      )}

      {mias.length ? (
        <ul className="lista-tarjetas">
          {mias.map((p) => (
            <TarjetaPropuesta key={p.id} p={p} />
          ))}
        </ul>
      ) : null}

      {otras.length ? (
        <details>
          <summary>Anteriores ({otras.length})</summary>
          <ul className="lista-tarjetas">
            {otras.map((p) => (
              <TarjetaPropuesta key={p.id} p={p} />
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}
