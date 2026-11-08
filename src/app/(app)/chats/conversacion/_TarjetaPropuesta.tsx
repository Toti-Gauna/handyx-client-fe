'use client';

import { useState } from 'react';
import { ruta, useIr } from '@/components/nav';
import { Hoja } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { useEnvio } from '@/data/hooks';
import { pesos, porcentaje } from '@/domain/dinero';
import { etiquetaPropuesta } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { Boton, Monto, Nota, Texto } from '@/ui';
import { Renglones, horarioCorto, tipoTarjeta, tituloTarjeta, totalPropuesta } from '@/ui/mensajes';
import { TarjetaChat, type AccionTarjeta } from '../_piezas';

const PIE: Record<ReturnType<typeof tipoTarjeta>, string> = {
  propuesta: 'Aceptar crea el trabajo con exactamente estas condiciones.',
  horario: 'Aceptar cambia el turno. El precio y las condiciones siguen igual.',
  presupuesto: 'Aceptar suma este presupuesto al trabajo. Mientras no aceptes, nada cambia.',
  cambio: 'Mientras no aceptes, sigue valiendo el acuerdo actual.',
};

/**
 * Tarjeta de propuesta, horario o presupuesto dentro del chat (lienzo M-Chat y M-Presupuesto). «Ver» abre el detalle y
 * «Aceptar» pide una confirmación en el mismo lugar: acepta con la versión que se está viendo (si cambió, el servidor
 * responde conflicto y se recarga).
 */
export function TarjetaPropuestaChat({
  p,
  anterior,
  alCambiar,
}: {
  p: Propuesta;
  anterior: Propuesta | null;
  alCambiar: () => void;
}) {
  const ir = useIr();
  const accion = useEnvio();
  const [confirmando, setConfirmando] = useState(false);
  const tipo = tipoTarjeta(p, anterior);
  const propia = p.autorRol === 'usuario';
  const decidible = p.estado === 'pendiente' && !propia;
  const nombre = p.especialista.nombrePublico;
  const ver: AccionTarjeta = { texto: 'Ver', href: ruta('/propuestas/detalle/', { id: p.id }) };
  const otroDia: AccionTarjeta = {
    texto: 'Otro día',
    href: ruta('/propuestas/contraoferta/', { id: p.id }),
  };
  const acciones: AccionTarjeta[] = decidible
    ? [
        tipo === 'horario' ? otroDia : ver,
        {
          texto: 'Aceptar',
          principal: true,
          etiqueta: `Aceptar ${tituloTarjeta(p)}`,
          onClick: () => setConfirmando(true),
        },
      ]
    : [ver];
  const e = etiquetaPropuesta(p);
  const lineas: [string, string][] = [
    ['Precio de ' + nombre.split(' ')[0], pesos(p.monto.centavos)],
    [
      `Tarifa de Handyx (${porcentaje(p.comisionHandy.bp)})`,
      pesos(p.comisionHandy.importe.centavos),
    ],
  ];

  async function aceptar() {
    const r = await accion.enviar(
      'propuestaAceptar',
      { parametros: { id: p.id }, cuerpo: { version: p.version } },
      `${p.id}|${p.version}`,
    );
    if (r?.ok) ir(ruta('/trabajos/detalle/', { id: r.datos.trabajo.id }), { reemplazar: true });
    else if (r) {
      setConfirmando(false);
      alCambiar();
    }
  }

  return (
    <>
      <TarjetaChat
        tipo={tipo}
        etiqueta={`${propia ? 'Tu' : 'Propuesta de'} ${propia ? 'contrapropuesta' : nombre}`}
        titulo={
          tipoTarjeta(p, anterior) === 'presupuesto'
            ? `Total ${pesos(totalPropuesta(p))}`
            : tituloTarjeta(p)
        }
        sub={p.alcance}
        propia={propia}
        acciones={acciones}
        {...(decidible
          ? {}
          : {
              estado: {
                texto: propia && p.estado === 'pendiente' ? `Esperando a ${nombre}` : e.texto,
                icono: e.icono ?? 'info',
              },
            })}
      >
        {tipo === 'presupuesto' || tipo === 'cambio' ? (
          <Renglones items={lineas} total={<Monto centavos={totalPropuesta(p)} tam={1.375} />} />
        ) : null}
      </TarjetaChat>
      <Hoja
        abierta={confirmando && decidible}
        onCerrar={() => setConfirmando(false)}
        titulo={`¿Aceptás la propuesta de ${nombre.split(' ')[0]}?`}
      >
        <div className="ds-pila">
          <Renglones
            items={[['Cuándo', horarioCorto(p.horario)], ...lineas]}
            total={<Monto centavos={totalPropuesta(p)} tam={1.375} />}
          />
          <Texto>
            {PIE[tipo]} Vale hasta el {cuando(p.venceEn)}. Se paga directo al especialista, al
            terminar.
          </Texto>
          {accion.error ? (
            <Nota tono="error" icono="alerta" rol="alert">
              {accion.error.mensaje}
            </Nota>
          ) : null}
          <Boton icono="check" ocupado={accion.pendiente} onClick={() => void aceptar()}>
            {`Sí, aceptar a ${nombre.split(' ')[0]}`}
          </Boton>
          <Boton variante="contorno" onClick={() => setConfirmando(false)}>
            Volver al chat
          </Boton>
        </div>
      </Hoja>
    </>
  );
}
