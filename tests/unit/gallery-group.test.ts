import { describe, expect, it } from 'vitest';
import { groupGalleryPhotos, groupHeading } from '../../src/lib/gallery/group';
import type { Photo } from '../../src/lib/content/validate';
import type { ZoneId } from '../../src/lib/altitude/zones';

let n = 0;
/** Una foto mínima de un piso; solo cuentan `zone` y el orden. */
const photo = (zone: ZoneId): Photo => ({ zone, destinoId: `d${n}`, alt: `foto ${n++}` }) as Photo;
const many = (zone: ZoneId, count: number) => Array.from({ length: count }, () => photo(zone));
const zonesOf = (groups: ReturnType<typeof groupGalleryPhotos>) => groups.map((g) => g.zones);

describe('groupGalleryPhotos (CA-52)', () => {
  it('sin fotos no hay grupos', () => {
    expect(groupGalleryPhotos([])).toEqual([]);
  });

  it('un piso con tres o más fotos forma su propio grupo', () => {
    const groups = groupGalleryPhotos([...many('warm', 3), ...many('cold', 4)]);
    expect(zonesOf(groups)).toEqual([['warm'], ['cold']]);
  });

  it('un piso sin fotos se salta', () => {
    const groups = groupGalleryPhotos([...many('warm', 3), ...many('paramo', 3)]);
    expect(zonesOf(groups)).toEqual([['warm'], ['paramo']]);
  });

  it('un piso con una o dos fotos se une al siguiente piso con fotos', () => {
    const groups = groupGalleryPhotos([...many('warm', 2), ...many('cold', 3)]);
    expect(zonesOf(groups)).toEqual([['warm', 'cold']]);
    expect(groups[0]?.photos).toHaveLength(5);
  });

  it('une en cadena mientras el grupo tenga menos de tres fotos', () => {
    const groups = groupGalleryPhotos([
      ...many('warm', 1),
      ...many('temperate', 1),
      ...many('cold', 1),
      ...many('paramo', 4),
    ]);
    expect(zonesOf(groups)).toEqual([['warm', 'temperate', 'cold'], ['paramo']]);
  });

  it('un grupo que ya llega a tres se cierra y el siguiente empieza de cero', () => {
    const groups = groupGalleryPhotos([
      ...many('warm', 2),
      ...many('temperate', 1),
      ...many('cold', 3),
    ]);
    expect(zonesOf(groups)).toEqual([['warm', 'temperate'], ['cold']]);
  });

  it('el último piso con una o dos fotos se une al grupo anterior', () => {
    const groups = groupGalleryPhotos([...many('warm', 3), ...many('paramo', 2)]);
    expect(zonesOf(groups)).toEqual([['warm', 'paramo']]);
    expect(groups[0]?.photos).toHaveLength(5);
  });

  it('con menos de tres fotos en total, hay un solo grupo', () => {
    expect(zonesOf(groupGalleryPhotos([...many('warm', 1), ...many('cold', 1)]))).toEqual([
      ['warm', 'cold'],
    ]);
  });

  it('conserva el orden de las fotos y es determinista', () => {
    const input = [...many('warm', 1), ...many('cold', 3)];
    const a = groupGalleryPhotos(input);
    expect(a[0]?.photos).toEqual(input);
    expect(groupGalleryPhotos(input)).toEqual(a);
  });
});

describe('groupHeading', () => {
  it('singular, dos y tres pisos', () => {
    expect(groupHeading(['cold'])).toBe('Piso frío');
    expect(groupHeading(['warm', 'temperate'])).toBe('Pisos cálido y templado');
    expect(groupHeading(['warm', 'temperate', 'cold'])).toBe('Pisos cálido, templado y frío');
  });
});
