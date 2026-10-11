/**
 * Formatos de cifras (CA-2, CA-22 a CA-28, CA-103). Toda cifra lleva su unidad escrita; los
 * decimales van con coma y las cifras de cuatro dígitos no llevan separador de miles.
 */
import type { DestinoData } from '../content/schemas';

export type Difficulty = NonNullable<DestinoData['difficulty']>;

/** Número sin separador de miles y con coma decimal ("8,5", "2500"). */
function num(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

/** "2500 m" o, la primera vez en una página, "2500 metros de altitud" (CA-23). */
export function formatAltitude(m: number, form: 'short' | 'long'): string {
  return form === 'short' ? `${num(m)} m` : `${num(m)} metros de altitud`;
}

/** "de 125 a 4080 metros de altitud": la unidad se escribe una sola vez (CA-2). */
export function formatAltitudeRange(minM: number, maxM: number): string {
  return `de ${num(minM)} a ${num(maxM)} metros de altitud`;
}

/** "Entre 16 y 24 °C". Una mínima mayor o igual que la máxima no es válida (CA-24). */
export function formatClimate(minC: number, maxC: number): string {
  if (!(minC < maxC)) {
    throw new RangeError(`CA-24: la mínima (${minC}) debe ser menor que la máxima (${maxC})`);
  }
  return `Entre ${num(minC)} y ${num(maxC)} °C`;
}

/** "1 hora", "5 horas", "1 día", "2 días" (CA-25). */
export function formatDuration(value: number, unit: 'hours' | 'days'): string {
  const singular = unit === 'hours' ? 'hora' : 'día';
  const plural = unit === 'hours' ? 'horas' : 'días';
  return `${num(value)} ${value === 1 ? singular : plural}`;
}

/**
 * Fila "Distancia y desnivel" de la ficha (CA-22, CA-26). Si solo hay una de las dos cifras,
 * la etiqueta pasa a "Distancia" o "Desnivel"; si no hay ninguna, no hay fila.
 */
export function formatDistanceAscent(
  km?: number,
  ascentM?: number,
): { label: string; value: string } | null {
  const distance = km === undefined ? null : `${num(km)} km`;
  const ascent = ascentM === undefined ? null : `${num(ascentM)} m de subida`;
  if (distance && ascent) {
    return { label: 'Distancia y desnivel', value: `${distance}, ${ascent}` };
  }
  if (distance) return { label: 'Distancia', value: distance };
  if (ascent) return { label: 'Desnivel', value: ascent };
  return null;
}

/** "Apta desde los 6 años", "Apta desde 1 año", "Apta para todas las edades" (CA-28). */
export function formatMinAge(years: number): string {
  if (years === 0) return 'Apta para todas las edades';
  return years === 1 ? 'Apta desde 1 año' : `Apta desde los ${num(years)} años`;
}

/** Palabra y número de marcas rellenas (CA-27). */
export function difficultyInfo(d: Difficulty): { word: string; marks: 1 | 2 | 3 } {
  switch (d) {
    case 'easy':
      return { word: 'Fácil', marks: 1 };
    case 'moderate':
      return { word: 'Moderada', marks: 2 };
    case 'demanding':
      return { word: 'Exigente', marks: 3 };
  }
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** "10 de octubre de 2026". Usa la fecha UTC: `reviewedOn` se lee como medianoche UTC. */
export function formatLongDate(d: Date): string {
  return `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}
