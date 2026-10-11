/**
 * Esquemas Zod de las cinco colecciones (ADR 0003). Validan cada archivo por separado;
 * lo que cruza archivos o depende del modo vive en `validate.ts`.
 * Las claves están en inglés y los mensajes en español, con el criterio al principio
 * ("CA-20: ...") para que el error de build lleve archivo, campo y regla (CA-99).
 */
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro/content/config';

type ImageCtx = Pick<SchemaContext, 'image'>;

/** Salida de `reference('destinos')`. */
export interface DestinoRef {
  collection: string;
  id: string;
}

export const DIFFICULTIES = ['easy', 'moderate', 'demanding'] as const;
export const LICENSE_KINDS = ['cc0', 'public-domain', 'cc-by', 'cc-by-sa'] as const;
export const MODIFICATIONS = ['none', 'cropped', 'modified'] as const;
export const RATIOS = ['3:2', '4:5', '1:1'] as const;
export const FOCUS = ['center', 'top', 'bottom', 'left', 'right'] as const;
export const LEGAL_KINDS = ['privacy', 'terms', 'cancellation'] as const;

/** Límites de longitud: "{name} | Ecoturismo Antioquia" ≤ 60 caracteres (CA-33). */
export const NAME_MAX = 37;
export const SUMMARY_MAX = 160;

const text = (message: string) => z.string({ error: message }).trim().min(1, message);

// ---------------------------------------------------------------------------
// Ficha (compartida por destinos y rutas)
// ---------------------------------------------------------------------------

const fichaFields = {
  climate: z
    .object({
      minC: z.number({ error: 'CA-24: minC debe ser un número (°C)' }),
      maxC: z.number({ error: 'CA-24: maxC debe ser un número (°C)' }),
    })
    .refine((c) => c.minC < c.maxC, {
      error: 'CA-24: la temperatura mínima (minC) debe ser menor que la máxima (maxC)',
    })
    .optional(),
  access: text('access (cómo llegar) no puede estar vacío').optional(),
  duration: z
    .object({
      value: z
        .number({ error: 'duration.value debe ser un número' })
        .positive('duration.value debe ser mayor que cero'),
      unit: z.enum(['hours', 'days'], { error: 'duration.unit debe ser "hours" o "days"' }),
    })
    .optional(),
  distanceKm: z.number().positive('distanceKm debe ser mayor que cero').optional(),
  ascentM: z
    .number()
    .int('ascentM debe ser un entero')
    .nonnegative('ascentM no puede ser negativo')
    .optional(),
  difficulty: z
    .enum(DIFFICULTIES, {
      error:
        'CA-27: difficulty debe ser "easy" (Fácil), "moderate" (Moderada) o "demanding" (Exigente)',
    })
    .optional(),
  minAge: z
    .number()
    .int('minAge debe ser un entero')
    .min(0, 'minAge no puede ser negativo')
    .optional(),
};

// ---------------------------------------------------------------------------
// Fotos y destinos
// ---------------------------------------------------------------------------

export const photoSchema = ({ image }: ImageCtx) =>
  z.object({
    file: image(),
    alt: text('CA-48: la foto necesita texto alternativo (alt) que describa la imagen'),
    author: text('CA-46: la foto necesita autor (author)'),
    license: z.object({
      kind: z.enum(LICENSE_KINDS, {
        error: 'CA-47: license.kind debe ser cc0, public-domain, cc-by o cc-by-sa (nunca NC ni ND)',
      }),
      name: text('CA-46: la licencia necesita nombre (license.name), por ejemplo "CC BY-SA 4.0"'),
      url: z.url({ error: 'CA-46: la licencia necesita un enlace válido (license.url)' }),
    }),
    sourceUrl: z.url({ error: 'CA-46: la foto necesita el enlace a su fuente (sourceUrl)' }),
    modification: z.enum(MODIFICATIONS, {
      error: 'CA-46: modification es obligatorio: "none", "cropped" o "modified"',
    }),
    ratio: z.enum(RATIOS, { error: 'CA-49: ratio debe ser "3:2", "4:5" o "1:1"' }),
    focus: z
      .enum(FOCUS, { error: 'focus debe ser center, top, bottom, left o right' })
      .default('center'),
  });

export const destinoSchema = (ctx: ImageCtx) =>
  z.object({
    name: text('El destino necesita nombre (name)').max(
      NAME_MAX,
      `CA-33: name admite hasta ${NAME_MAX} caracteres para que el título de la página no pase de 60`,
    ),
    summary: text('El destino necesita descripción corta (summary)').max(
      SUMMARY_MAX,
      `CA-33: summary admite hasta ${SUMMARY_MAX} caracteres`,
    ),
    altitude: z.object({
      meters: z
        .number({ error: 'CA-20: altitude.meters debe ser un número en metros' })
        .int('CA-20: altitude.meters debe ser un número entero de metros')
        .positive('CA-20: altitude.meters debe ser mayor que cero'),
      verified: z.boolean({ error: 'CA-104: altitude.verified debe ser true o false' }),
      source: text('altitude.source no puede estar vacío').optional(),
    }),
    featured: z.boolean().default(false),
    ...fichaFields,
    photos: z.array(photoSchema(ctx)).default([]),
  });

// ---------------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------------

const lon = z
  .number({ error: 'CA-77: la longitud debe ser un número' })
  .min(-180, 'CA-77: la longitud debe estar entre -180 y 180')
  .max(180, 'CA-77: la longitud debe estar entre -180 y 180');
const lat = z
  .number({ error: 'CA-77: la latitud debe ser un número' })
  .min(-90, 'CA-77: la latitud debe estar entre -90 y 90')
  .max(90, 'CA-77: la latitud debe estar entre -90 y 90');
const pointElevation = z.number({ error: 'CA-77: la elevación del punto debe ser un número' });

export const rutaSchema = (destinoRef: z.ZodType<DestinoRef>) =>
  z.object({
    type: z.literal('Feature', { error: 'CA-77: type debe ser "Feature" (GeoJSON)' }),
    geometry: z.object(
      {
        type: z.literal('LineString', { error: 'CA-77: geometry.type debe ser "LineString"' }),
        coordinates: z
          .array(z.union([z.tuple([lon, lat]), z.tuple([lon, lat, pointElevation])]), {
            error:
              'CA-77: coordinates debe ser una lista de puntos [longitud, latitud] o [longitud, latitud, elevación]',
          })
          .min(2, 'CA-77: el trazado necesita al menos dos puntos'),
      },
      { error: 'CA-77: la ruta necesita un trazado (geometry)' },
    ),
    properties: z.object({
      name: text('La ruta necesita nombre (properties.name)'),
      destino: destinoRef,
      elevation: z
        .object(
          {
            minM: z
              .number({ error: 'CA-78: falta la elevación mínima (elevation.minM)' })
              .int('CA-78: elevation.minM debe ser un entero'),
            maxM: z
              .number({ error: 'CA-78: falta la elevación máxima (elevation.maxM)' })
              .int('CA-78: elevation.maxM debe ser un entero'),
          },
          { error: 'CA-78: la ruta necesita elevation con minM y maxM' },
        )
        .refine((e) => e.minM <= e.maxM, {
          error: 'CA-78: la elevación mínima (minM) no puede superar la máxima (maxM)',
        }),
      ...fichaFields,
    }),
  });

// ---------------------------------------------------------------------------
// Textos legales, operador y territorio
// ---------------------------------------------------------------------------

export const legalSchema = z
  .object({
    kind: z.enum(LEGAL_KINDS, { error: 'kind debe ser "privacy", "terms" o "cancellation"' }),
    title: text('El texto legal necesita título (title)').max(
      NAME_MAX,
      `CA-33: title admite hasta ${NAME_MAX} caracteres`,
    ),
    summary: text('El texto legal necesita descripción corta (summary)').max(
      SUMMARY_MAX,
      `CA-33: summary admite hasta ${SUMMARY_MAX} caracteres`,
    ),
    status: z.enum(['draft', 'reviewed'], {
      error: 'CA-118: status debe ser "draft" (borrador pendiente de revisión) o "reviewed"',
    }),
    reviewedOn: z.coerce
      .date({ error: 'CA-121: reviewedOn debe ser una fecha (AAAA-MM-DD)' })
      .optional(),
  })
  .refine((l) => l.status !== 'reviewed' || l.reviewedOn !== undefined, {
    path: ['reviewedOn'],
    error: 'CA-121: un texto "reviewed" necesita la fecha de revisión (reviewedOn)',
  });

const identifier = z.object({
  value: text('CA-119: el identificador necesita un valor (value)'),
  fictitious: z.boolean().default(false),
});

export const operatorSchema = z.object({
  name: text('El operador necesita nombre (name)'),
  whatsapp: z
    .string({ error: 'whatsapp debe ser un texto' })
    .regex(
      /^\+57\d{10}$/,
      'whatsapp debe tener el formato +57 y 10 dígitos, sin espacios (por ejemplo +573001234567)',
    ),
  hours: text('El operador necesita horario de atención (hours)'),
  email: z.email({ error: 'email debe ser un correo válido' }),
  identifiers: z
    .object({
      rnt: identifier.optional(),
      nit: identifier.optional(),
      legalName: identifier.optional(),
      others: z
        .array(
          identifier.extend({
            label: text('CA-119: cada identificador adicional necesita etiqueta (label)'),
          }),
        )
        .default([]),
    })
    .default({ others: [] }),
});

export const territorySchema = z
  .object({
    minM: z
      .number({ error: 'CA-122: minM debe ser un número' })
      .int()
      .positive('CA-122: minM debe ser mayor que cero'),
    maxM: z
      .number({ error: 'CA-122: maxM debe ser un número' })
      .int()
      .positive('CA-122: maxM debe ser mayor que cero'),
    thresholds: z.object({
      temperate: z.number({ error: 'CA-122: thresholds.temperate debe ser un número' }).int(),
      cold: z.number({ error: 'CA-122: thresholds.cold debe ser un número' }).int(),
      paramo: z.number({ error: 'CA-122: thresholds.paramo debe ser un número' }).int(),
    }),
    verified: z.boolean({ error: 'CA-104: verified debe ser true o false' }),
    source: text('source no puede estar vacío').optional(),
  })
  .refine(
    (t) =>
      t.minM < t.thresholds.temperate &&
      t.thresholds.temperate < t.thresholds.cold &&
      t.thresholds.cold < t.thresholds.paramo &&
      t.thresholds.paramo < t.maxM,
    {
      error:
        'CA-122: debe cumplirse minM < thresholds.temperate < thresholds.cold < thresholds.paramo < maxM (orden estrictamente ascendente)',
    },
  );

// ---------------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------------

export type DestinoData = z.infer<ReturnType<typeof destinoSchema>>;
export type PhotoData = DestinoData['photos'][number];
export type RutaData = z.infer<ReturnType<typeof rutaSchema>>;
export type LegalData = z.infer<typeof legalSchema>;
export type Operator = z.infer<typeof operatorSchema>;
export type Territory = z.infer<typeof territorySchema>;
