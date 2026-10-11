/**
 * Grupos de la galería (S8.1, CA-52). Regla determinista: se recorren los pisos en orden ascendente
 * y se saltan los que no tienen fotos; un piso con tres o más fotos forma su propio grupo; uno con
 * una o dos se une al siguiente piso con fotos (y sigue uniéndose mientras el grupo tenga menos de
 * tres); si es el último, se une al grupo anterior.
 */
import { ZONES, zoneName, type ZoneId } from '../altitude/zones';
import type { Photo } from '../content/validate';

export interface GalleryGroup {
  zones: ZoneId[];
  /** "Piso frío" o "Pisos cálido y templado". */
  heading: string;
  /** Por altitud del destino, luego nombre y luego orden del contenido (el que traen las fotos). */
  photos: Photo[];
}

const MIN_PHOTOS = 3;

/** "Piso frío", "Pisos cálido y templado", "Pisos cálido, templado y frío". */
export function groupHeading(zones: readonly ZoneId[]): string {
  const names = zones.map(zoneName);
  if (names.length <= 1) return `Piso ${names[0] ?? ''}`.trim();
  return `Pisos ${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

/**
 * `photos` debe venir en el orden del modelo publicado (destinos por altitud y nombre, y las fotos
 * de cada destino en su orden editorial): ese orden se conserva dentro de cada piso.
 */
export function groupGalleryPhotos(photos: readonly Photo[]): GalleryGroup[] {
  const byZone = new Map<ZoneId, Photo[]>();
  for (const p of photos) byZone.set(p.zone, [...(byZone.get(p.zone) ?? []), p]);

  const groups: { zones: ZoneId[]; photos: Photo[] }[] = [];
  let pending: { zones: ZoneId[]; photos: Photo[] } = { zones: [], photos: [] };

  for (const zone of ZONES) {
    const inZone = byZone.get(zone);
    if (!inZone) continue;
    pending = { zones: [...pending.zones, zone], photos: [...pending.photos, ...inZone] };
    if (pending.photos.length >= MIN_PHOTOS) {
      groups.push(pending);
      pending = { zones: [], photos: [] };
    }
  }
  if (pending.zones.length > 0) {
    const last = groups[groups.length - 1];
    if (last) {
      last.zones.push(...pending.zones);
      last.photos.push(...pending.photos);
    } else {
      groups.push(pending);
    }
  }
  return groups.map((g) => ({ ...g, heading: groupHeading(g.zones) }));
}
