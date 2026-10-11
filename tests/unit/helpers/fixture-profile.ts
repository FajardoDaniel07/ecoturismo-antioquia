/**
 * Lee los destinos y el territorio de un escenario de `tests/fixtures/content/` sin pasar por Astro,
 * para probar la geometría del perfil con los datos reales del escenario.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { resolveFeatured } from '../../../src/lib/altitude/sort';
import { zoneOf, ZONES } from '../../../src/lib/altitude/zones';
import type { Territory } from '../../../src/lib/content/schemas';
import type { Destino } from '../../../src/lib/content/validate';

export type ProfileFixtureDestino = Pick<
  Destino,
  'id' | 'name' | 'href' | 'altitude' | 'zone' | 'isFeatured'
>;

export function loadScenario(name: string): {
  territory: Territory;
  destinos: ProfileFixtureDestino[];
} {
  const root = path.join(process.cwd(), 'tests', 'fixtures', 'content', name);
  const territory = JSON.parse(
    readFileSync(path.join(root, 'sitio', 'territorio.json'), 'utf8'),
  ) as Territory;
  const raw = readdirSync(path.join(root, 'destinos'))
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const text = readFileSync(path.join(root, 'destinos', file), 'utf8').replace(/\r\n/g, '\n');
      const match = /^---\n([\s\S]*?)\n---/.exec(text);
      const data = parse(match?.[1] ?? '') as {
        name: string;
        altitude: { meters: number; verified: boolean; source?: string };
        featured?: boolean;
      };
      const id = file.replace(/\.md$/, '');
      return {
        id,
        name: data.name,
        href: `/destinos/${id}/`,
        altitude: data.altitude,
        featured: data.featured ?? false,
        zone: zoneOf(data.altitude.meters, territory.thresholds),
      };
    })
    .sort((a, b) => a.altitude.meters - b.altitude.meters || a.name.localeCompare(b.name, 'es'));

  const featuredIds = new Set<string>();
  for (const zone of ZONES) {
    const inZone = raw.filter((d) => d.zone === zone);
    const { featuredIndex } = resolveFeatured(inZone);
    const chosen = inZone[featuredIndex];
    if (chosen) featuredIds.add(chosen.id);
  }
  const destinos = raw.map((d) => ({
    id: d.id,
    name: d.name,
    href: d.href,
    altitude: d.altitude,
    zone: d.zone,
    isFeatured: featuredIds.has(d.id),
  }));
  return { territory, destinos };
}
