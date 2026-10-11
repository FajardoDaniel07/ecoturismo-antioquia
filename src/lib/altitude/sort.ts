/**
 * Orden por altitud, bloques por piso y destino principal (CA-12 a CA-15).
 * Fuente única de la lógica de destino principal: `validate.ts` la reutiliza.
 */
import type { Destino } from '../content/validate';
import type { Territory } from '../content/schemas';
import { ZONES, zoneOf, zoneRange, type ZoneId } from './zones';

const collator = new Intl.Collator('es');

interface Sortable {
  name: string;
  altitude: { meters: number };
}

/** Altitud ascendente y, a igual altitud, nombre en español (CA-13). */
export function compareByAltitude(a: Sortable, b: Sortable): number {
  return a.altitude.meters - b.altitude.meters || collator.compare(a.name, b.name);
}

export interface FeaturedResolution {
  /** Posición del principal dentro de la lista recibida; -1 si la lista está vacía. */
  featuredIndex: number;
  issue?: 'two-featured' | 'none-featured';
}

/**
 * Elige el destino principal de un piso (CA-15). La lista debe venir ordenada con
 * `compareByAltitude`: sin ninguno marcado, el principal es el de menor altitud (el primero);
 * con dos o más marcados, el primero marcado y el problema `two-featured`.
 */
export function resolveFeatured(inZone: readonly { featured: boolean }[]): FeaturedResolution {
  if (inZone.length === 0) return { featuredIndex: -1 };
  const marked = inZone.flatMap((d, i) => (d.featured ? [i] : []));
  const first = marked[0];
  if (first === undefined) return { featuredIndex: 0, issue: 'none-featured' };
  return marked.length > 1
    ? { featuredIndex: first, issue: 'two-featured' }
    : { featuredIndex: first };
}

export interface ZoneBlock {
  zone: ZoneId;
  range: { fromM: number; toM: number };
  featured: Destino;
  others: Destino[];
}

/** Un bloque por piso con destinos, en el orden cálido a páramo; los pisos vacíos no aparecen (CA-14). */
export function groupByZone(destinos: readonly Destino[], t: Territory): ZoneBlock[] {
  const sorted = [...destinos].sort(compareByAltitude);
  const blocks: ZoneBlock[] = [];
  for (const zone of ZONES) {
    const inZone = sorted.filter((d) => zoneOf(d.altitude.meters, t.thresholds) === zone);
    const { featuredIndex } = resolveFeatured(inZone);
    const featured = inZone[featuredIndex];
    if (!featured) continue;
    blocks.push({
      zone,
      range: zoneRange(zone, t),
      featured,
      others: inZone.filter((_, i) => i !== featuredIndex),
    });
  }
  return blocks;
}
