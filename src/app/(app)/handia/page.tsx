'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ruta, useIr } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { useVoz } from '@/components/voz';
import type { Mensaje } from '@/components/handia/chat';
import { Conversacion } from '@/components/handia/conversacion';
import { CabeceraHandia, Escribir, MenuHandia, useAbierta } from '@/components/handia/marco';
import { PanelVoz } from '@/components/handia/voz-panel';
import { dejarBorrador } from '@/data/borrador';
import { conversarConHandia, handiaDisponible } from '@/data/handia';
import { esVistaDePrueba } from '@/data';
import { normalizar, tacharDatosPersonales } from '@/domain/handia';
import {
  type Accion,
  type EstadoHandia,
  type Opcion,
  SALUDO,
  type Turno,
  descripcionPara,
  iniciar,
  opcionesHabladas,
} from '@/domain/handia-motor';
import { comandoVoz } from '@/domain/voz';

/**
 * HandIA (Fase 7, lienzo design/usuario · fila I). Conversa como un especialista antes de cotizar: entiende lo que
 * contás, pregunta solo lo que falta, avisa de riesgos primero y arma el pedido para que lo revises. Los mensajes se
 * apoyan sobre la caja de escribir; la lamparita grande solo saluda con la conversación vacía. Modo voz sin
 * personajes: escucha con reconocimiento en el dispositivo y habla con voces del sistema. Todo corre en el celular:
 * sin IA externa, sin datos personales (se tachan antes de procesar), sin fotos ni audio guardados.
 */
export default function HandIA() {
  const ir = useIr();
  const voz = useVoz();
  const menu = useAbierta();
  const [estado, setEstado] = useState<EstadoHandia>(() => iniciar().estado);
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([
    { id: 0, de: 'ia', texto: SALUDO },
  ]);
  const [opciones, setOpciones] = useState<readonly Opcion[]>([]);
  const [progreso, setProgreso] = useState<Turno['progreso']>(null);
  const [pensando, setPensando] = useState(false);
  const [texto, setTexto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [vozAbierta, setVozAbierta] = useState(false);
  const [ultimoIa, setUltimoIa] = useState(SALUDO);
  const [ultimoYo, setUltimoYo] = useState('');
  // Para los callbacks asíncronos (fin de la voz, reconocimiento): siempre el último valor.
  const estadoRef = useRef(estado);
  const descRef = useRef('');
  const editada = useRef(false);
  const vozRef = useRef(false);
  const siguiente = useRef(1);
  const botonVoz = useRef<HTMLButtonElement>(null);

  function sumar(...nuevos: Omit<Mensaje, 'id'>[]) {
    const conId = nuevos.map((x) => ({ ...x, id: siguiente.current++ }));
    setMensajes((m) => [...m, ...conId]);
  }

  function cambiarDescripcion(valor: string, aMano: boolean) {
    descRef.current = valor;
    if (aMano) editada.current = true;
    setDescripcion(valor);
  }

  function decir(t: Turno) {
    const partes = t.dice.flatMap((s) => (s.de === 'ia' || s.de === 'aviso' ? [s.texto] : []));
    const ultimo = partes.at(-1);
    if (ultimo) setUltimoIa(ultimo);
    if (!vozRef.current) return;
    const dichas = [...partes, opcionesHabladas(t.opciones) ?? ''].filter(Boolean).join(' ');
    voz.hablar(dichas, () => {
      if (vozRef.current && !t.pedir && voz.oidoLocal()) escucharAhora();
    });
  }

  function aplicar(t: Turno) {
    estadoRef.current = t.estado;
    setEstado(t.estado);
    sumar(
      ...t.dice.map((s): Omit<Mensaje, 'id'> =>
        s.de === 'detectado'
          ? { de: 'detectado', rubro: s.rubro }
          : s.de === 'ficha'
            ? { de: 'ficha' }
            : {
                de: s.de,
                texto: s.texto,
                ...(s.de === 'aviso' && s.riesgo ? { riesgo: true } : {}),
              },
      ),
    );
    if (t.dice.some((s) => s.de === 'ficha') && !editada.current)
      cambiarDescripcion(descripcionPara(t.estado), false);
    if (t.estado.etapa === 'contar') {
      editada.current = false;
      cambiarDescripcion('', false);
    }
    setOpciones(t.opciones);
    setProgreso(t.progreso);
    if (t.pedir) {
      pedir(t.pedir);
      return;
    }
    decir(t);
  }

  async function turno(entrada: { texto: string } | { accion: Accion }) {
    setPensando(true);
    setOpciones([]);
    try {
      aplicar(await conversarConHandia(estadoRef.current, entrada, vozRef.current ? 350 : 650));
    } catch (e) {
      sumar({ de: 'aviso', texto: e instanceof Error ? e.message : 'HandIA no pudo responder.' });
    } finally {
      setPensando(false);
    }
  }

  /** Lo que escribió o dijo la persona: comandos de voz, tachado de datos personales y turno. */
  function procesar(entrada: string, origen: 'texto' | 'voz') {
    const crudo = entrada.trim();
    if (!crudo || pensando) return;
    if (origen === 'voz') {
      const orden = comandoVoz(normalizar(crudo));
      if (orden === 'salir') return cerrarVoz();
      if (orden === 'repetir') return voz.hablar(ultimoIa, () => vozRef.current && escucharAhora());
      if (orden === 'callar') return voz.callar();
    }
    setTexto('');
    const { texto: limpio, tachado } = tacharDatosPersonales(crudo);
    setUltimoYo(limpio);
    sumar({ de: 'yo', texto: limpio });
    if (tachado.length)
      sumar({
        de: 'aviso',
        texto: `Saqué ${tachado.join(' y ')} del mensaje: HandIA no lo necesita para ayudarte.`,
      });
    if (estadoRef.current.etapa === 'resumen' && editada.current)
      cambiarDescripcion(`${descRef.current.trim()} ${limpio}`, true);
    void turno({ texto: limpio });
  }

  function elegir(op: Opcion) {
    if (pensando) return;
    setUltimoYo(op.texto);
    sumar({ de: 'yo', texto: op.texto });
    void turno({ accion: op.accion });
  }

  function pedir(modo: 'urgente' | 'programado') {
    const rubro = estadoRef.current.rubro;
    if (!rubro) return;
    voz.callar();
    vozRef.current = false;
    dejarBorrador({ rubro, descripcion: tacharDatosPersonales(descRef.current).texto });
    ir(ruta('/pedir/', { rubro, tipo: modo, desde: 'handia' }));
  }

  /** Vuelve a la conversación vacía (la bienvenida con las sugerencias). */
  function reiniciar() {
    menu.cerrar();
    voz.callar();
    const t = iniciar();
    estadoRef.current = t.estado;
    setEstado(t.estado);
    setMensajes([{ id: 0, de: 'ia', texto: SALUDO }]);
    setOpciones([]);
    setProgreso(null);
    editada.current = false;
    cambiarDescripcion('', false);
    setUltimoIa(SALUDO);
    setUltimoYo('');
  }

  function escucharAhora() {
    voz.escuchar((dicho) => procesar(dicho, 'voz'));
  }

  async function abrirVoz() {
    menu.cerrar();
    vozRef.current = true;
    setVozAbierta(true);
    // Recién acá se le pregunta al navegador si puede escuchar en el dispositivo (nunca al cargar la pantalla).
    const oido = await voz.revisar();
    if (!vozRef.current) return;
    voz.hablar(
      [ultimoIa, opcionesHabladas(opciones) ?? ''].filter(Boolean).join(' '),
      () => vozRef.current && oido === 'local' && escucharAhora(),
    );
  }

  function cerrarVoz(foco: 'voz' | 'texto' = 'voz') {
    vozRef.current = false;
    voz.callar();
    setVozAbierta(false);
    // El botón del modo voz puede no estar (si hay texto escrito): entonces, la caja.
    (foco === 'voz' && botonVoz.current
      ? botonVoz.current
      : document.getElementById('handia-texto')
    )?.focus();
  }

  const conversando = mensajes.some((m) => m.de === 'yo');
  const deshabilitado = !handiaDisponible || pensando;
  const resumen = estado.etapa === 'resumen';
  const principal = resumen ? (opciones.find((o) => o.destacada) ?? null) : null;
  const sub = pensando
    ? 'Pensando…'
    : resumen
      ? 'Pedido listo para revisar'
      : 'En tu celular · sin IA externa';

  return (
    <div className="pantalla ds hia7">
      <TituloDocumento texto="HandIA" />
      <CabeceraHandia sub={sub} onMenu={menu.abrir} />
      <Conversacion
        disponible={handiaDisponible}
        mensajes={mensajes}
        estado={estado}
        descripcion={descripcion}
        onCambiarDescripcion={(v) => cambiarDescripcion(v, true)}
        opciones={opciones}
        principal={principal}
        progreso={progreso}
        pensando={pensando}
        deshabilitado={deshabilitado}
        dictando={voz.escuchando && !vozAbierta ? voz.parcial : null}
        onEscribir={(t) => procesar(t, 'texto')}
        onElegir={elegir}
      />

      <Escribir
        texto={texto}
        onTexto={setTexto}
        onEnviar={() => procesar(texto, 'texto')}
        placeholder={resumen ? 'Agregá algo al pedido…' : 'Contale a HandIA…'}
        deshabilitado={deshabilitado}
        dictado={
          voz.oido === 'local'
            ? {
                escuchando: voz.escuchando,
                alternar: () =>
                  voz.escuchando ? voz.callar() : voz.escuchar((t) => procesar(t, 'texto')),
              }
            : null
        }
        onModoVoz={() => void abrirVoz()}
        refVoz={botonVoz}
      />

      <MenuHandia
        abierta={menu.abierta}
        onCerrar={menu.cerrar}
        onModoVoz={() => void abrirVoz()}
        onReiniciar={reiniciar}
        puedeReiniciar={conversando && !pensando}
      />

      {vozAbierta
        ? createPortal(
            <PanelVoz
              voz={voz}
              pensando={pensando}
              ultimoIa={ultimoIa}
              ultimoYo={ultimoYo}
              opciones={opciones}
              resumen={resumen}
              onElegir={elegir}
              onHablar={() => (voz.escuchando ? voz.callar() : escucharAhora())}
              onCerrar={() => cerrarVoz('voz')}
              onTeclado={() => cerrarVoz('texto')}
              prueba={esVistaDePrueba}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
