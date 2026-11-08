// Contrato v1 · cuenta, sesión, perfil operativo, textos aceptados y baja.
// El preregistro de la landing NO es una cuenta: no se migra ni se vincula sin alta y aceptación propias.
import { z } from 'zod';
import { FechaLocal, Id, Instante, Rol, Texto, Version } from './comunes.ts';

export const ESTADOS_CUENTA = [
  'perfil_incompleto',
  'activa',
  'baja_solicitada',
  'suspendida',
] as const;
export const EstadoCuenta = z.enum(ESTADOS_CUENTA);

/** Login y recuperación: identificadores del mecanismo de auth, separados del perfil (ADR-0002). */
export const Email = z.email().max(254).toLowerCase();
export const Contrasena = z.string().min(10).max(128);

export const DOCUMENTOS_LEGALES = ['terminos', 'privacidad', 'politica_fee'] as const;
export const DocumentoLegal = z.enum(DOCUMENTOS_LEGALES);
/** Versión de un texto: "terminos-2026-11-01". Texto nuevo = versión nueva. */
export const VersionDocumento = z.string().regex(/^[a-z0-9_-]{3,64}$/);
export const AceptacionEntrada = z
  .object({ documento: DocumentoLegal, version: VersionDocumento })
  .strict();
export const Aceptacion = AceptacionEntrada.extend({ aceptadaEn: Instante }).strict();

/** Invitación: desde draft.4 es opcional (alta directa, decisión del 07/11); si viene, se valida igual. */
export const CodigoInvitacion = z.string().regex(/^[A-Z0-9]{6,16}$/);

export const RegistroEntrada = z
  .object({
    email: Email,
    contrasena: Contrasena,
    codigoInvitacion: CodigoInvitacion.optional(),
    aceptaciones: z.array(AceptacionEntrada).min(2).max(3),
  })
  .strict();
export const LoginEntrada = z
  .object({ email: Email, contrasena: z.string().min(1).max(128) })
  .strict();
/** Siempre responde 202 igual, exista o no la cuenta. */
export const RecuperacionEntrada = z.object({ email: Email }).strict();
export const NuevaContrasenaEntrada = z
  .object({ token: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/), contrasena: Contrasena })
  .strict();

// Perfil operativo (PROD-15): nombre, apellido, fecha de nacimiento, nacionalidad, ubicación real y género.
// Sin DNI, CUIT ni certificados para el usuario común. Opciones de género provisionales hasta el aviso aprobado.
export const GENEROS = ['mujer', 'varon', 'no_binario', 'otro', 'prefiero_no_decir'] as const;
export const Genero = z.enum(GENEROS);
/** ISO 3166-1 alfa-2: "AR". */
export const Nacionalidad = z.string().regex(/^[A-Z]{2}$/);

export const Coordenadas = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    precisionMetros: z.int().min(0).max(100000),
  })
  .strict();
/** Ubicación cargada a mano o con un permiso puntual de geolocalización. Nunca seguimiento en segundo plano. */
export const Ubicacion = z
  .object({
    ciudad: Texto(80),
    barrio: Texto(80).nullable(),
    direccion: Texto(160),
    referencia: Texto(160).nullable(),
    origen: z.enum(['manual', 'geolocalizacion_puntual']),
    coordenadas: Coordenadas.nullable(),
  })
  .strict();
export type Ubicacion = z.infer<typeof Ubicacion>;

export const PerfilUsuario = z
  .object({
    nombre: Texto(60),
    apellido: Texto(60),
    fechaNacimiento: FechaLocal,
    nacionalidad: Nacionalidad,
    genero: Genero,
    ubicacion: Ubicacion,
  })
  .strict();
export type PerfilUsuario = z.infer<typeof PerfilUsuario>;
export const CAMPOS_PERFIL = Object.keys(PerfilUsuario.shape) as (keyof PerfilUsuario)[];
/** Se puede completar por pasos: lo que falta queda `null`, nunca inventado. */
export const PerfilParcial = PerfilUsuario.partial().strict();
export const PerfilEntrada = PerfilParcial.extend({ version: Version }).strict();

/** GET /v1/sesion. El `csrfToken` vive solo en memoria del cliente; la sesión es una cookie HttpOnly. */
export const Sesion = z
  .object({
    cuenta: z.object({ id: Id, estado: EstadoCuenta, roles: z.array(Rol).min(1) }).strict(),
    perfil: PerfilParcial,
    perfilVersion: Version,
    pendientes: z
      .object({
        camposPerfil: z.array(
          z.enum(CAMPOS_PERFIL as [keyof PerfilUsuario, ...(keyof PerfilUsuario)[]]),
        ),
        documentos: z.array(
          z.object({ documento: DocumentoLegal, version: VersionDocumento }).strict(),
        ),
      })
      .strict(),
    aceptaciones: z.array(Aceptacion),
    expiraEn: Instante,
    csrfToken: z.string().min(32).max(256),
  })
  .strict();
export type Sesion = z.infer<typeof Sesion>;

export const ESTADOS_BAJA = [
  'recibida',
  'en_proceso',
  'completada',
  'completada_con_retencion',
  'cancelada',
] as const;
export const EstadoBaja = z.enum(ESTADOS_BAJA);
/** Baja real con su estado verdadero; cerrar sesión no es baja. Las retenciones legales se informan, no se ocultan. */
export const SolicitudBaja = z
  .object({
    id: Id,
    estado: EstadoBaja,
    creadaEn: Instante,
    actualizadaEn: Instante,
    retenciones: z.array(
      z
        .object({ categoria: z.string().regex(/^[a-z_]{3,40}$/), hasta: FechaLocal.nullable() })
        .strict(),
    ),
  })
  .strict();
export const BajaEntrada = z.object({ contrasena: z.string().min(1).max(128) }).strict();

export const PreferenciasNotificacion = z.object({ push: z.boolean() }).strict();

// ── draft.4 · Acceso sin contraseña ──────────────────────────────────────────────────────────────────────────
/** Pedir un código de 6 dígitos por email. Siempre responde 202 igual, exista o no la cuenta. */
export const CodigoAccesoEntrada = z.object({ email: Email }).strict();
/**
 * Verificar el código. Si la cuenta no existe, la crea (alta directa) y para eso exige las aceptaciones de los
 * textos vigentes; si existe, inicia sesión. Responde la sesión (cookie HttpOnly).
 */
export const VerificarCodigoEntrada = z
  .object({
    email: Email,
    codigo: z.string().regex(/^\d{6}$/),
    aceptaciones: z.array(AceptacionEntrada).min(2).max(3).optional(),
    segundoFactor: z.string().regex(/^\d{6}$/).optional(),
  })
  .strict();
export const PROVEEDORES_ACCESO = ['google', 'apple'] as const;
export const ProveedorAcceso = z.enum(PROVEEDORES_ACCESO);

export const METODOS_SEGUNDA = ['app', 'email'] as const;
export const SegundaVerificacion = z
  .object({
    activa: z.boolean(),
    metodo: z.enum(METODOS_SEGUNDA).nullable(),
    activadaEn: Instante.nullable(),
  })
  .strict();
export const SegundaVerificacionEntrada = z
  .object({ metodo: z.enum(METODOS_SEGUNDA), codigo: z.string().regex(/^\d{6}$/) })
  .strict();

/** Sesiones abiertas, sin IP ni datos del dispositivo más allá de una etiqueta genérica. */
export const SesionAbierta = z
  .object({
    id: Id,
    dispositivo: z.enum(['celular', 'computadora', 'tableta', 'otro']),
    ultimoUso: Instante,
    actual: z.boolean(),
  })
  .strict();

/** Descargar mis datos: se prepara en el servidor y se baja con un enlace de un solo uso que vence. */
export const Exportacion = z
  .object({
    id: Id,
    estado: z.enum(['preparando', 'lista', 'vencida']),
    pedidaEn: Instante,
    url: z.url({ protocol: /^https$/ }).nullable(),
    venceEn: Instante.nullable(),
  })
  .strict();
