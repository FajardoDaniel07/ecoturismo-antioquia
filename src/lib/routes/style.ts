/**
 * Orden, letra clave y estilo de trazo de las rutas (design.md S9.1, S9.3; CA-68, CA-69). El piso
 * del destino fija el color y el patrón; dos rutas del mismo piso se distinguen por la variante,
 * asignada en el orden de la lista. Con más de tres rutas en un piso las variantes se repiten.
 */
import type { ZoneId } from '../altitude/zones';

export type RoutePattern = 'solid' | 'long-dash' | 'dash-dot' | 'dots';
export type RouteVariant = 'regular' | 'double' | 'thin';

export interface RouteStyle {
  zone: ZoneId;
  pattern: RoutePattern;
  variant: RouteVariant;
  /** `stroke-dasharray` en px; `null` para el trazo continuo. */
  dashArray: string | null;
  /** Grosor de la línea en px. */
  weight: number;
}

const PATTERNS: Record<ZoneId, { pattern: RoutePattern; dashArray: string | null }> = {
  warm: { pattern: 'solid', dashArray: null },
  temperate: { pattern: 'long-dash', dashArray: '14 8' },
  cold: { pattern: 'dash-dot', dashArray: '14 6 2 6' },
  paramo: { pattern: 'dots', dashArray: '1 9' },
};

const VARIANTS: readonly { variant: RouteVariant; weight: number }[] = [
  { variant: 'regular', weight: 5 },
  { variant: 'double', weight: 7 },
  { variant: 'thin', weight: 3 },
];

/** Letra clave de la ruta: A, B, C… y, pasada la Z, AA, AB… */
export function routeKey(index: number): string {
  let n = index;
  let key = '';
  do {
    key = String.fromCharCode(65 + (n % 26)) + key;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return key;
}

/** Estilo de la ruta número `indexInZone` (desde 0) de un piso. */
export function routeStyle(zone: ZoneId, indexInZone: number): RouteStyle {
  const { pattern, dashArray } = PATTERNS[zone];
  const { variant, weight } = VARIANTS[indexInZone % VARIANTS.length] as (typeof VARIANTS)[number];
  return { zone, pattern, variant, dashArray, weight };
}

interface Orderable {
  zone: ZoneId;
  properties: { name: string; elevation: { minM: number } };
}

const collator = new Intl.Collator('es');

/** Orden de la lista: elevación mínima ascendente y, a igualdad, nombre. */
export function orderRoutes<T extends Orderable>(rutas: readonly T[]): T[] {
  return [...rutas].sort(
    (a, b) =>
      a.properties.elevation.minM - b.properties.elevation.minM ||
      collator.compare(a.properties.name, b.properties.name),
  );
}

/** Ordena y asigna letra clave y estilo (la variante cuenta dentro de cada piso). */
export function styleRoutes<T extends Orderable>(
  rutas: readonly T[],
): (T & { key: string; style: RouteStyle })[] {
  const perZone = new Map<ZoneId, number>();
  return orderRoutes(rutas).map((r, i) => {
    const n = perZone.get(r.zone) ?? 0;
    perZone.set(r.zone, n + 1);
    return { ...r, key: routeKey(i), style: routeStyle(r.zone, n) };
  });
}
