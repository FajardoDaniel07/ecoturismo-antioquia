/**
 * Ficha de salida (design.md S5, CA-21, CA-22, CA-27): filas en orden fijo para un destino o una
 * ruta. Un dato ausente no genera fila (ni "N/D" ni valor vacío). La ruta no tiene altitud propia:
 * su fila de altitud es la del destino al que pertenece.
 */
import { zoneName, type ZoneId } from '../altitude/zones';
import type { Destino, Ruta } from '../content/validate';
import {
  difficultyInfo,
  formatAltitude,
  formatClimate,
  formatDistanceAscent,
  formatDuration,
  formatMinAge,
} from '../format/units';

export type FichaKey =
  'altitude' | 'climate' | 'access' | 'duration' | 'distance' | 'difficulty' | 'age';

export interface FichaRow {
  key: FichaKey;
  label: string;
  value: string;
  /** Solo en la fila de altitud: el piso y el texto con que se nombra ("piso templado"). */
  zone?: ZoneId;
  zoneText?: string;
  /** Solo en la dificultad: marcas rellenas (1 a 3). */
  marks?: 1 | 2 | 3;
}

/** Filas del listado de destinos (S4, S5): altitud, duración y dificultad. */
const SUMMARY_KEYS: readonly FichaKey[] = ['altitude', 'duration', 'difficulty'];

type FichaFields = Pick<
  Destino,
  'climate' | 'access' | 'duration' | 'distanceKm' | 'ascentM' | 'difficulty' | 'minAge'
>;

function isRuta(subject: Destino | Ruta): subject is Ruta {
  return 'properties' in subject;
}

export function buildFicha(subject: Destino | Ruta, variant: 'full' | 'summary'): FichaRow[] {
  const destino = isRuta(subject) ? subject.destino : subject;
  const f: FichaFields = isRuta(subject) ? subject.properties : subject;

  const rows: FichaRow[] = [];
  const zoneText = `piso ${zoneName(destino.zone)}`;
  rows.push({
    key: 'altitude',
    label: 'Altitud',
    value: `${formatAltitude(destino.altitude.meters, 'short')}, ${zoneText}`,
    zone: destino.zone,
    zoneText,
  });
  if (f.climate) {
    rows.push({
      key: 'climate',
      label: 'Clima habitual',
      value: formatClimate(f.climate.minC, f.climate.maxC),
    });
  }
  if (f.access) rows.push({ key: 'access', label: 'Cómo llegar', value: f.access });
  if (f.duration) {
    rows.push({
      key: 'duration',
      label: 'Duración',
      value: formatDuration(f.duration.value, f.duration.unit),
    });
  }
  const distance = formatDistanceAscent(f.distanceKm, f.ascentM);
  if (distance) rows.push({ key: 'distance', label: distance.label, value: distance.value });
  if (f.difficulty) {
    const { word, marks } = difficultyInfo(f.difficulty);
    rows.push({ key: 'difficulty', label: 'Dificultad', value: word, marks });
  }
  if (f.minAge !== undefined) {
    rows.push({ key: 'age', label: 'Edad sugerida', value: formatMinAge(f.minAge) });
  }

  return variant === 'summary' ? rows.filter((r) => SUMMARY_KEYS.includes(r.key)) : rows;
}
