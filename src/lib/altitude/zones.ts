/**
 * Pisos térmicos. Única regla que convierte una altitud en piso (CA-29).
 * Los umbrales salen de `territorio.json`; una altitud igual al umbral pertenece al piso superior.
 */
import type { Territory } from '../content/schemas';

export type ZoneId = 'warm' | 'temperate' | 'cold' | 'paramo';

/** De menor a mayor altitud. */
export const ZONES: readonly ZoneId[] = ['warm', 'temperate', 'cold', 'paramo'];

const NAMES: Record<ZoneId, string> = {
  warm: 'cálido',
  temperate: 'templado',
  cold: 'frío',
  paramo: 'páramo',
};

export function zoneOf(altitudeM: number, t: Territory['thresholds']): ZoneId {
  if (altitudeM >= t.paramo) return 'paramo';
  if (altitudeM >= t.cold) return 'cold';
  if (altitudeM >= t.temperate) return 'temperate';
  return 'warm';
}

/** Rango del piso: desde el límite inferior (incluido) hasta el superior (excluido el umbral siguiente). */
export function zoneRange(
  zone: ZoneId,
  t: Pick<Territory, 'minM' | 'maxM' | 'thresholds'>,
): { fromM: number; toM: number } {
  switch (zone) {
    case 'warm':
      return { fromM: t.minM, toM: t.thresholds.temperate };
    case 'temperate':
      return { fromM: t.thresholds.temperate, toM: t.thresholds.cold };
    case 'cold':
      return { fromM: t.thresholds.cold, toM: t.thresholds.paramo };
    case 'paramo':
      return { fromM: t.thresholds.paramo, toM: t.maxM };
  }
}

export function zoneName(zone: ZoneId): string {
  return NAMES[zone];
}
