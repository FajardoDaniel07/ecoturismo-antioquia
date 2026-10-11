/**
 * Política de fotos (design.md S6, CA-40 a CA-45, CA-48, CA-49, ADR 0008): qué se muestra según
 * las fotos de un destino, cómo se compone el crédito y qué anchos se pueden generar.
 */
import type { Destino, Photo } from '../content/validate';

export type Ratio = Photo['ratio'];

/** Lado mayor desde el que una foto sirve para el lugar principal (tamaño grande). */
export const LARGE_SIDE = 2000;
/** Lado mayor mínimo para publicar una foto (CA-43). */
export const MIN_SIDE = 1200;

/** `large`: lado mayor de 2000 px o más; `small`: de 1200 px o más; `rejected`: menos. */
export function photoTier(width: number, height: number): 'large' | 'small' | 'rejected' {
  const side = Math.max(width, height);
  if (side >= LARGE_SIDE) return 'large';
  return side >= MIN_SIDE ? 'small' : 'rejected';
}

/** La foto principal: la primera, en el orden del contenido, apta para tamaño grande. */
export function mainPhoto<T extends Pick<Photo, 'tier'>>(photos: readonly T[]): T | null {
  return photos.find((p) => p.tier === 'large') ?? null;
}

export type DetailLayout =
  'plate' | 'beside-ficha' | 'main-and-grid' | 'plate-and-small' | 'plate-and-grid';

/** Qué muestra el detalle de un destino según sus fotos (S6.4). */
export function detailLayout(photos: readonly Pick<Photo, 'tier'>[]): DetailLayout {
  if (photos.length === 0) return 'plate';
  const hasLarge = mainPhoto(photos) !== null;
  if (hasLarge) return photos.length >= 3 ? 'main-and-grid' : 'beside-ficha';
  return photos.length >= 3 ? 'plate-and-grid' : 'plate-and-small';
}

export type CardMedia = { kind: 'photo'; photo: Photo } | { kind: 'plate' };

/**
 * Qué ocupa el lugar de la foto en el listado (S4, S6.4, CA-38, CA-42). El principal del piso es
 * un lugar de tamaño grande: foto solo si alguna es apta, si no, lámina. Los menores usan la
 * primera foto publicada.
 */
export function cardMedia(d: Pick<Destino, 'isFeatured' | 'photos'>): CardMedia {
  const photo = d.isFeatured ? mainPhoto(d.photos) : (d.photos[0] ?? null);
  return photo ? { kind: 'photo', photo } : { kind: 'plate' };
}

function ratioValue(ratio: Ratio): number {
  const [w, h] = ratio.split(':').map(Number);
  return (w ?? 1) / (h ?? 1);
}

/** Tamaño en px de la foto recortada a una proporción (nunca se amplía). */
export function croppedSize(
  fileWidth: number,
  fileHeight: number,
  ratio: Ratio,
): { width: number; height: number; changed: boolean } {
  const target = ratioValue(ratio);
  const actual = fileWidth / fileHeight;
  if (Math.abs(actual - target) < 0.005)
    return { width: fileWidth, height: fileHeight, changed: false };
  return actual > target
    ? { width: Math.round(fileHeight * target), height: fileHeight, changed: true }
    : { width: fileWidth, height: Math.round(fileWidth / target), changed: true };
}

export interface CreditParts {
  author: string;
  licenseName: string;
  licenseUrl: string;
  sourceUrl: string;
  note?: 'Recortada' | 'Modificada';
}

/**
 * Partes del crédito (S6.2, CA-44, CA-45). "Modificada" si el contenido lo declara; "Recortada" si
 * lo declara o si la proporción mostrada difiere de la del archivo.
 */
export function creditParts(p: Photo, shownRatio: Ratio = p.ratio): CreditParts {
  const cropped =
    p.modification === 'cropped' || croppedSize(p.file.width, p.file.height, shownRatio).changed;
  const note = p.modification === 'modified' ? 'Modificada' : cropped ? 'Recortada' : undefined;
  return {
    author: p.author,
    licenseName: p.license.name,
    licenseUrl: p.license.url,
    sourceUrl: p.sourceUrl,
    ...(note ? { note } : {}),
  };
}

/**
 * Anchos que se pueden generar: nunca por encima del original (CA-43). Si el menor candidato ya
 * supera el original, se usa el propio ancho original.
 */
export function allowedWidths(originalWidth: number, candidates: readonly number[]): number[] {
  const allowed = candidates.filter((w) => w <= originalWidth).sort((a, b) => a - b);
  return allowed.length > 0 ? allowed : [originalWidth];
}
