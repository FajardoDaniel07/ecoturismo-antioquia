import { z } from 'astro/zod';
import type { SchemaContext } from 'astro/content/config';
import type {
  DestinoData,
  DestinoRef,
  LegalData,
  Operator,
  RutaData,
  Territory,
} from '../../../src/lib/content/schemas';

/** Imitación de `image()` de Astro: valida el objeto de metadatos que entrega. */
export const fakeImage: SchemaContext['image'] = () =>
  z.object({
    src: z.string(),
    width: z.number(),
    height: z.number(),
    format: z.union([
      z.literal('png'),
      z.literal('jpg'),
      z.literal('jpeg'),
      z.literal('tiff'),
      z.literal('webp'),
      z.literal('gif'),
      z.literal('svg'),
      z.literal('avif'),
      z.literal('apng'),
    ]),
  });

/** Imitación de `reference('destinos')`. */
export const fakeRef: z.ZodType<DestinoRef> = z
  .string()
  .transform((id) => ({ collection: 'destinos', id }));

export const territory = (): Territory => ({
  minM: 50,
  maxM: 3900,
  thresholds: { temperate: 1000, cold: 2000, paramo: 3000 },
  verified: true,
  source: 'Fuente de prueba',
});

export const photo = (width = 2400, height = 1600): DestinoData['photos'][number] => ({
  file: { src: '/foto.jpg', width, height, format: 'jpg' },
  alt: 'Sendero entre palmas de cera bajo la niebla',
  author: 'Ana Pérez',
  license: {
    kind: 'cc-by',
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ejemplo.jpg',
  modification: 'none',
  ratio: '3:2',
  focus: 'center',
});

export const destino = (over: Partial<DestinoData> = {}): DestinoData => ({
  name: 'Valle de prueba',
  summary: 'Descripción corta del destino de prueba.',
  altitude: { meters: 1500, verified: true, source: 'IGAC' },
  featured: false,
  photos: [],
  ...over,
});

export const ruta = (over: Partial<RutaData['properties']> = {}): RutaData => ({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [-75.5, 6.2, 1500],
      [-75.4, 6.3, 1600],
    ],
  },
  properties: {
    name: 'Ruta de prueba',
    destino: { collection: 'destinos', id: 'valle-de-prueba' },
    elevation: { minM: 1500, maxM: 1600 },
    ...over,
  },
});

export const legal = (over: Partial<LegalData> = {}): LegalData => ({
  kind: 'privacy',
  title: 'Política de datos',
  summary: 'Cómo tratamos tus datos personales.',
  status: 'draft',
  ...over,
});

export const operator = (over: Partial<Operator> = {}): Operator => ({
  name: 'Ecoturismo Montaña',
  whatsapp: '+573127951683',
  hours: 'Lunes a viernes, de 10 a. m. a 10 p. m.',
  email: 'danielfajardog1902@gmail.com',
  identifiers: { others: [] },
  ...over,
});
