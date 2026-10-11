/**
 * Los ejemplos de src/content/README.md deben pasar los esquemas reales (T-023).
 * Cada ejemplo va en un bloque de código precedido por `<!-- ejemplo:<nombre> -->`.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import {
  destinoSchema,
  legalSchema,
  operatorSchema,
  rutaSchema,
  territorySchema,
} from '../../src/lib/content/schemas';
import { fakeImage, fakeRef } from './helpers/content';

const guide = readFileSync(new URL('../../src/content/README.md', import.meta.url), 'utf8');

function example(name: string): string {
  const match = new RegExp(`<!-- ejemplo:${name} -->\\s*\`\`\`\\w*\\n([\\s\\S]*?)\`\`\``).exec(
    guide,
  );
  if (!match?.[1]) throw new Error(`La guía no tiene el ejemplo "${name}"`);
  return match[1];
}

/** Separa el frontmatter YAML del cuerpo Markdown. */
function frontmatter(source: string): { data: unknown; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
  if (!match?.[1]) throw new Error('El ejemplo no tiene frontmatter');
  return { data: parse(match[1]), body: match[2] ?? '' };
}

/** Sustituye la ruta de cada foto por los metadatos que entrega `image()` de Astro. */
function withImageMetadata(data: unknown): unknown {
  const record = data as { photos?: { file: unknown }[] };
  return {
    ...record,
    photos: record.photos?.map((p) => ({
      ...p,
      file: { src: String(p.file), width: 2400, height: 1600, format: 'jpg' },
    })),
  };
}

describe('guía de contenido: los ejemplos pasan los esquemas', () => {
  it('territorio', () => {
    expect(territorySchema.safeParse(JSON.parse(example('territorio'))).success).toBe(true);
  });

  it('destino (con foto)', () => {
    const { data } = frontmatter(example('destino'));
    const result = destinoSchema({ image: fakeImage }).safeParse(withImageMetadata(data));
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data?.photos).toHaveLength(1);
  });

  it('ruta', () => {
    const result = rutaSchema(fakeRef).safeParse(JSON.parse(example('ruta')));
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it('texto legal', () => {
    const { data } = frontmatter(example('legal'));
    expect(legalSchema.safeParse(data).success).toBe(true);
  });

  it('operador (sin identificadores)', () => {
    const result = operatorSchema.safeParse(JSON.parse(example('operador')));
    expect(result.error?.issues ?? []).toEqual([]);
  });
});
