'use client';
// Detalle de la propuesta (C-Detalle / C-Visita): quién es, cuánto y cuándo, cómo lo hace, qué incluye y qué no, y lo
// que dijo el especialista. Solo lo que mandó el servidor: lo que no cargó, no se muestra.
import { ruta } from '@/components/nav';
import {
  nombreCorto,
  Verificaciones,
  Vigencia,
  duracionTexto,
  equipoTexto,
  garantiaTexto,
  horarioCorto,
  materialesTexto,
  totalDe,
} from '@/components/Propuesta';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { pesos, porcentaje } from '@/domain/dinero';
import { cuando } from '@/domain/fechas';
import {
  Avatar,
  Boton,
  Chip,
  DatoFila,
  Etiqueta,
  FilaEnlace,
  ListaMarcas,
  Monto,
  Nota,
  Separador,
  Tarjeta,
} from '@/ui';
import { Cita } from '@/ui/pedir';

const primer = (p: Propuesta) => nombreCorto(p.especialista.nombrePublico);

/** Cabecera: avatar, nombre, trabajos y verificaciones reales; «Ver perfil» debajo. */
export function Quien({ p }: { p: Propuesta }) {
  const e = p.especialista;
  return (
    <>
      <div className="ds-fila" style={{ ['--ds-gap' as string]: '0.875rem' }}>
        <Avatar nombre={e.nombrePublico} tam={4} />
        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.3rem' }}>
          <span className="ds-titulo" style={{ ['--ds-tam' as string]: '1.375rem' }}>
            {e.nombrePublico}
          </span>
          {e.trabajosRealizados !== null ? (
            <span className="ds-sub">
              {e.trabajosRealizados === 0
                ? 'Todavía no hizo trabajos con Handyx'
                : `${e.trabajosRealizados} ${e.trabajosRealizados === 1 ? 'trabajo' : 'trabajos'} con Handyx`}
            </span>
          ) : null}
          <Verificaciones e={e} conVacio />
        </span>
      </div>
      <Boton
        href={ruta('/propuestas/perfil/', { id: p.id })}
        variante="suave"
        chico
        icono="usuario"
      >
        Ver perfil y verificaciones
      </Boton>
    </>
  );
}

/** Precio en azul con el desglose: lo que se le paga al especialista y la tarifa de Handyx. */
function Precio({ p, visita }: { p: Propuesta; visita: boolean }) {
  const m = materialesTexto(p.detalle?.materiales ?? null);
  return (
    <Tarjeta tono={visita ? 'noche' : 'azul'} etiqueta="Precio y horario">
      <Etiqueta>{visita ? 'Es una consulta' : `Precio de ${p.especialista.nombrePublico}`}</Etiqueta>
      {visita ? (
        <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.4 }}>
          {primer(p)} quiere ver el problema antes de darte un precio del trabajo.
        </p>
      ) : null}
      <Monto centavos={totalDe(p)} tam={visita ? 1.875 : 2.625} color="inherit" />
      <span className="ds-sub">
        Total final para vos. Precio del especialista:{' '}
        <span style={{ whiteSpace: 'nowrap' }}>{pesos(p.monto.centavos)}</span> · Tarifa de Handyx (
        {porcentaje(p.comisionHandy.bp)}):{' '}
        <span style={{ whiteSpace: 'nowrap' }}>{pesos(p.comisionHandy.importe.centavos)}</span>
        {visita ? '. Es lo que cuesta la visita.' : '.'}
      </span>
      {m && !visita ? (
        <span className="ds-fila" style={{ flexWrap: 'wrap', ['--ds-gap' as string]: '0.375rem' }}>
          <Chip tono="blanco" icono="caja">
            {m}
          </Chip>
        </span>
      ) : null}
      <strong className="ds-fila" style={{ ['--ds-gap' as string]: '0.5rem', fontSize: '0.875rem' }}>
        {p.horario ? `${cuando(p.horario.inicio)}` : horarioCorto(p)}
      </strong>
      {p.estado === 'pendiente' ? (
        <span className="ds-sub">
          Propuesta <Vigencia hasta={p.venceEn} />
        </span>
      ) : null}
    </Tarjeta>
  );
}

export function CuerpoPropuesta({ p }: { p: Propuesta }) {
  const d = p.detalle;
  const visita = d?.oferta === 'visita';
  return (
    <>
      <Precio p={p} visita={visita} />
      {d && visita ? (
        <>
          <Tarjeta etiqueta="Lo que ya sabemos">
            <Etiqueta>Lo que ya sabemos</Etiqueta>
            {d.duracion ? (
              <DatoFila icono="reloj" etiqueta="Dura" valor={duracionTexto(d.duracion)} />
            ) : null}
            <DatoFila
              icono="personas"
              etiqueta="Equipo"
              valor={equipoTexto(d.equipo)}
              sub={d.equipo.descripcion ?? undefined}
            />
          </Tarjeta>
          <Tarjeta etiqueta="Lo que define en la visita">
            <Etiqueta>Lo que define en la visita</Etiqueta>
            {['Precio del trabajo', 'Materiales', 'Duración y garantía'].map((t) => (
              <DatoFila key={t} icono="reloj" etiqueta={t} valor="A definir" />
            ))}
          </Tarjeta>
          <Nota icono="info" tono="gris">
            Después de la visita te manda la propuesta del trabajo y decidís igual que con las demás.
          </Nota>
        </>
      ) : d ? (
        <Tarjeta etiqueta="Cómo lo hace">
          <Etiqueta>Cómo lo hace</Etiqueta>
          {d.materiales ? (
            <DatoFila
              icono="caja"
              etiqueta="Materiales"
              valor={d.materiales.incluidos ? 'Incluidos' : 'Aparte'}
              sub={d.materiales.descripcion ?? undefined}
            />
          ) : null}
          <DatoFila
            icono="personas"
            etiqueta="Equipo"
            valor={equipoTexto(d.equipo)}
            sub={d.equipo.descripcion ?? undefined}
          />
          {d.duracion ? (
            <DatoFila icono="reloj" etiqueta="Duración" valor={duracionTexto(d.duracion)} />
          ) : null}
          <DatoFila icono="escudo" etiqueta="Garantía" valor={garantiaTexto(d.garantiaDias)} />
          <DatoFila
            icono="ojo"
            etiqueta="Visita previa"
            valor={d.visitaPrevia ? 'Quiere ver antes' : 'No hace falta'}
          />
        </Tarjeta>
      ) : null}
      {d && (d.incluye.length || d.noIncluye.length) ? (
        <Tarjeta etiqueta="Qué incluye">
          {d.incluye.length ? (
            <>
              <Etiqueta>Qué incluye</Etiqueta>
              <ListaMarcas items={d.incluye} />
            </>
          ) : null}
          {d.incluye.length && d.noIncluye.length ? <Separador /> : null}
          {d.noIncluye.length ? (
            <>
              <Etiqueta>No incluye</Etiqueta>
              <ListaMarcas items={d.noIncluye} tipo="no" />
            </>
          ) : null}
        </Tarjeta>
      ) : null}
      <Cita
        texto={p.alcance}
        autor={`${p.autorRol === 'usuario' ? 'Vos' : primer(p)}, con la propuesta`}
      />
      <Nota icono="billete" tono="gris">
        Le pagás directo al especialista, por Mercado Pago o en efectivo. Handyx no recibe ni
        reparte ese dinero.
      </Nota>
      <FilaEnlace
        icono="chat"
        titulo={`Hablar con ${p.especialista.nombrePublico}`}
        sub="Consultale lo que necesites antes de decidir"
        href={ruta('/chats/conversacion/', { id: p.conversacionId })}
      />
    </>
  );
}

/** Historial de la negociación con este especialista, de la más vieja a la más nueva. */
export function Historial({ p, cadena }: { p: Propuesta; cadena: readonly Propuesta[] }) {
  if (cadena.length < 2) return null;
  return (
    <Tarjeta etiqueta={`Historial con ${p.especialista.nombrePublico}`}>
      <Etiqueta>Historial con {primer(p)}</Etiqueta>
      <ol className="dsp-sigue">
        {cadena.map((x) => (
          <li key={x.id} aria-current={x.id === p.id ? 'true' : undefined}>
            <span>
              <strong>{pesos(totalDe(x))}</strong>
              <span>
                {x.autorRol === 'usuario' ? 'Vos' : primer(p)} · {cuando(x.creadaEn)}
                {x.id === p.id ? ' · (esta)' : ''}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}
