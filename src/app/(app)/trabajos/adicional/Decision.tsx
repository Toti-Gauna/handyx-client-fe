'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Barra, Pantalla } from '@/components/hx';
import { ruta, useIr } from '@/components/nav';
import { estadoDeCarga, totalAcordado, totalSiAprueba } from '@/components/Trabajo';
import { Aviso, Hoja } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { cuando } from '@/domain/fechas';
import { AccionesFijas, Boton, Chip, MosaicoIcono, Monto, Nota, Tarjeta, Titulo } from '@/ui';
import { FilaTotal } from '@/ui/seguimiento';

const ESTADO_FINAL: Record<string, string> = {
  aceptada: 'Ya lo aprobaste.',
  rechazada: 'Dijiste que no. No se suma nada al acuerdo.',
  reemplazada: 'Este pedido se reemplazó por otro más nuevo.',
  vencida: 'Este pedido venció. Si todavía hace falta, pedile que lo mande de nuevo.',
  retirada: 'El especialista retiró este pedido.',
};

/**
 * Decidir un adicional (o, en una obra, un repuesto): lo que pide, por qué y cómo cambia el total. Nada se suma al
 * acuerdo hasta que lo aprobás, y el pago sigue siendo directo al especialista.
 */
export function Decision({ variante }: { variante: 'adicional' | 'repuesto' }) {
  const id = useSearchParams().get('id');
  const propuesta = useConsulta('propuesta', id ? { parametros: { id } } : null);
  const p = propuesta.datos;
  const trabajoId = p?.trabajoId ?? null;
  const trabajo = useConsulta('trabajo', trabajoId ? { parametros: { id: trabajoId } } : null);
  const accion = useEnvio();
  const ir = useIr();
  const [confirmar, setConfirmar] = useState(false);

  const t = trabajo.datos;
  const carga =
    estadoDeCarga(id, [propuesta], 'Falta el pedido') ??
    (p && !trabajoId ? estadoDeCarga(null, [], 'Este pedido no es de un trabajo') : null) ??
    (trabajoId ? estadoDeCarga(trabajoId, [trabajo]) : null);
  if (carga || !p || !t) return carga;

  const esp = p.especialista.nombrePublico;
  const rep = variante === 'repuesto';
  const volver = {
    href: ruta(rep ? '/obras/detalle/' : '/trabajos/detalle/', { id: t.id }),
    etiqueta: rep ? 'Volver a la obra' : 'Volver al trabajo',
  };
  const decidible = p.estado === 'pendiente' && p.autorRol === 'especialista' /*TEMP*/;
  const sumar = p.monto.centavos;
  const total = totalSiAprueba(t, sumar);

  async function responder(que: 'propuestaAceptar' | 'propuestaRechazar') {
    const r = await accion.enviar(
      que,
      { parametros: { id: p!.id }, cuerpo: { version: p!.version } },
      `${p!.id}|${p!.version}|${que}`,
    );
    if (r?.ok) {
      setConfirmar(false);
      ir(volver.href, { reemplazar: true });
    }
  }

  return (
    <Pantalla
      arriba={
        <Barra
          titulo={rep ? 'Repuesto' : 'Adicional'}
          volver={volver}
          sub={`Pedido por ${esp}`}
        />
      }
      pie={
        decidible ? (
          <AccionesFijas nota="Nada se suma al acuerdo hasta que lo apruebes.">
            <Boton icono="check" onClick={() => { accion.limpiar(); setConfirmar(true); }}>
              Aprobar {pesos(sumar)}
            </Boton>
            <div className="ds-grilla">
              <Boton
                variante="contorno"
                chico
                icono="chat"
                href={ruta('/chats/conversacion/', { id: p.conversacionId })}
              >
                Preguntar
              </Boton>
              <Boton
                variante="peligro"
                chico
                icono="cerrar"
                ocupado={accion.pendiente}
                onClick={() => void responder('propuestaRechazar')}
              >
                No, gracias
              </Boton>
            </div>
          </AccionesFijas>
        ) : (
          <AccionesFijas>
            <Boton href={volver.href}>{volver.etiqueta}</Boton>
          </AccionesFijas>
        )
      }
    >
      <div className="ds ds-cuerpo">
        <div className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
          <Titulo
            texto={rep ? '¿Aprobás este ==repuesto==?' : '¿Aprobás el ==adicional==?'}
            tam={1.75}
          />
          <p className="ds-sub">
            {rep
              ? 'Hace falta para seguir. Nada se suma al acuerdo sin tu OK.'
              : 'Nada se suma al acuerdo hasta que lo apruebes.'}
          </p>
        </div>
        <Tarjeta etiqueta="Qué pide">
          <div className="ds-fila">
            <MosaicoIcono icono="caja" />
            <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
              <strong>{rep ? 'Repuesto para la obra' : 'Trabajo adicional'}</strong>
              <span className="ds-fila-enlace__sub">Lo pide {esp}</span>
            </span>
            <Monto texto={`+ ${pesos(sumar)}`} tam={1.25} />
          </div>
          <blockquote className="dss-cita">{p.alcance}</blockquote>
          {decidible ? (
            <span className="ds-fila-enlace__sub">Podés responder hasta el {cuando(p.venceEn)}.</span>
          ) : null}
        </Tarjeta>
        {decidible ? (
          <Tarjeta tono="noche" etiqueta="Cómo cambia el total">
            <FilaTotal texto="Acuerdo actual" centavos={totalAcordado(t)} suave />
            <FilaTotal texto={rep ? 'Repuesto' : 'Adicional'} centavos={sumar} mas suave />
            <FilaTotal texto="Total si aprobás" centavos={total} fuerte />
          </Tarjeta>
        ) : (
          <Nota icono="info" rol="status">
            {ESTADO_FINAL[p.estado] ?? 'Este pedido ya no está abierto.'}
          </Nota>
        )}
        {decidible ? (
          <Nota icono="billete" tono="gris">
            Le pagás directo a {esp}. Handyx no recibe ni reparte la plata.
          </Nota>
        ) : null}
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
        {p.estado === 'aceptada' ? <Chip tono="exito" icono="check">Aprobado</Chip> : null}
      </div>
      <Hoja abierta={confirmar} onCerrar={() => setConfirmar(false)} titulo={`¿Aprobás ${pesos(sumar)}?`}>
        <p>
          El total pasa de {pesos(totalAcordado(t))} a <strong>{pesos(total)}</strong>. Se lo pagás
          directo a {esp}.
        </p>
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
        <div className="ds-pila">
          <Boton icono="check" ocupado={accion.pendiente} onClick={() => void responder('propuestaAceptar')}>
            Sí, aprobar
          </Boton>
          <Boton variante="contorno" onClick={() => setConfirmar(false)}>
            Volver
          </Boton>
        </div>
      </Hoja>
    </Pantalla>
  );
}
