/**
 * Registro de las cinco colecciones (ADR 0003). Los esquemas viven en `lib/content/schemas.ts`.
 * La raíz del contenido se puede cambiar con CONTENT_ROOT (las pruebas construyen escenarios
 * de `tests/fixtures/content/<escenario>`); por defecto es `src/content`.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  destinoSchema,
  legalSchema,
  operatorSchema,
  rutaSchema,
  territorySchema,
} from './lib/content/schemas';

const root = (process.env.CONTENT_ROOT ?? 'src/content').replace(/\/+$/, '');

/** El id es el nombre del archivo sin extensión, tal cual: así se puede validar que sea kebab-case. */
const idFromFile = ({ entry }: { entry: string }) => entry.replace(/\.[^./]+$/, '');

const destinos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `${root}/destinos`, generateId: idFromFile }),
  schema: (ctx) => destinoSchema(ctx),
});

const rutas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: `${root}/rutas`, generateId: idFromFile }),
  schema: rutaSchema(reference('destinos')),
});

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `${root}/legal`, generateId: idFromFile }),
  schema: legalSchema,
});

const operador = defineCollection({
  loader: glob({ pattern: 'operador.json', base: `${root}/sitio`, generateId: idFromFile }),
  schema: operatorSchema,
});

const territorio = defineCollection({
  loader: glob({ pattern: 'territorio.json', base: `${root}/sitio`, generateId: idFromFile }),
  schema: territorySchema,
});

export const collections = { destinos, rutas, legal, operador, territorio };
