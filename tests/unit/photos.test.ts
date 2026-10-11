import { describe, expect, it } from 'vitest';
import {
  allowedWidths,
  cardMedia,
  creditParts,
  croppedSize,
  detailLayout,
  mainPhoto,
  photoTier,
} from '../../src/lib/photos/policy';
import { validateSite, type Destino, type Photo } from '../../src/lib/content/validate';
import { photo } from './helpers/content';
import { dest, validRaw } from './helpers/site';

/** Publica un destino con las fotos dadas y devuelve su modelo (con `tier`, `isCropped`…). */
function withPhotos(
  sizes: [number, number][],
  featured = true,
  over: Partial<ReturnType<typeof photo>> = {},
): Destino {
  const raw = validRaw();
  raw.rutas = [];
  raw.destinos = [
    dest('d', {
      featured,
      altitude: { meters: 1500, verified: true, source: 'x' },
      photos: sizes.map(([w, h]) => ({ ...photo(w, h), ...over })),
    }),
  ];
  const { site } = validateSite(raw, 'preview');
  if (!site) throw new Error('debería publicarse');
  return site.destinos[0] as Destino;
}

const LARGE: [number, number] = [2400, 1600];
const SMALL: [number, number] = [1500, 1000];

describe('photoTier (CA-42, CA-43)', () => {
  it.each([
    [2000, 1000, 'large'],
    [1000, 2000, 'large'],
    [1999, 1000, 'small'],
    [1200, 800, 'small'],
    [1199, 800, 'rejected'],
  ] as const)('%s × %s -> %s', (w, h, tier) => {
    expect(photoTier(w, h)).toBe(tier);
  });
});

describe('detailLayout: las cuatro filas de S6.4 (CA-38, CA-40 a CA-42)', () => {
  it('ninguna foto: lámina en el lugar principal', () => {
    expect(detailLayout(withPhotos([]).photos)).toBe('plate');
  });

  it('una o dos fotos con alguna grande: junto a la ficha, sin lugar principal', () => {
    expect(detailLayout(withPhotos([LARGE]).photos)).toBe('beside-ficha');
    expect(detailLayout(withPhotos([SMALL, LARGE]).photos)).toBe('beside-ficha');
  });

  it('tres o más con alguna grande: foto principal y cuadrícula', () => {
    expect(detailLayout(withPhotos([SMALL, LARGE, SMALL]).photos)).toBe('main-and-grid');
  });

  it('solo fotos pequeñas: lámina, y las fotos en tamaño menor (cuadrícula con tres o más)', () => {
    expect(detailLayout(withPhotos([SMALL]).photos)).toBe('plate-and-small');
    expect(detailLayout(withPhotos([SMALL, SMALL]).photos)).toBe('plate-and-small');
    expect(detailLayout(withPhotos([SMALL, SMALL, SMALL]).photos)).toBe('plate-and-grid');
  });
});

describe('mainPhoto', () => {
  it('es la primera foto grande en el orden del contenido', () => {
    const d = withPhotos([SMALL, [2100, 1400], LARGE]);
    expect(mainPhoto(d.photos)).toBe(d.photos[1]);
    expect(mainPhoto(withPhotos([SMALL]).photos)).toBeNull();
  });
});

describe('cardMedia (S4, CA-38, CA-42)', () => {
  it('sin fotos: lámina, sea principal o menor', () => {
    expect(cardMedia(withPhotos([], true))).toEqual({ kind: 'plate' });
    expect(cardMedia(withPhotos([], false))).toEqual({ kind: 'plate' });
  });

  it('principal con una foto grande: la foto principal', () => {
    const d = withPhotos([SMALL, LARGE], true);
    expect(cardMedia(d)).toEqual({ kind: 'photo', photo: d.photos[1] });
  });

  it('principal con solo fotos pequeñas: lámina', () => {
    expect(cardMedia(withPhotos([SMALL, SMALL], true))).toEqual({ kind: 'plate' });
  });

  it('menor con solo fotos pequeñas: la primera foto publicada', () => {
    const d = { ...withPhotos([SMALL, LARGE], false), isFeatured: false };
    expect(cardMedia(d)).toEqual({ kind: 'photo', photo: d.photos[0] });
  });
});

describe('creditParts y "recortada" derivada (CA-44, CA-45)', () => {
  const only = (d: Destino): Photo => d.photos[0] as Photo;

  it('sin recorte ni modificación no hay nota', () => {
    const p = only(withPhotos([LARGE]));
    expect(creditParts(p)).toEqual({
      author: 'Ana Pérez',
      licenseName: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ejemplo.jpg',
    });
  });

  it('"cropped" declarado: Recortada', () => {
    expect(creditParts(only(withPhotos([LARGE], true, { modification: 'cropped' }))).note).toBe(
      'Recortada',
    );
  });

  it('"modified": Modificada', () => {
    expect(creditParts(only(withPhotos([LARGE], true, { modification: 'modified' }))).note).toBe(
      'Modificada',
    );
  });

  it('se deriva: una proporción distinta de la del archivo es un recorte', () => {
    const p = only(withPhotos([LARGE])); // archivo 3:2, ratio 3:2
    expect(creditParts(p, '3:2').note).toBeUndefined();
    expect(creditParts(p, '1:1').note).toBe('Recortada');
    expect(creditParts(only(withPhotos([[1500, 1500]])), '3:2').note).toBe('Recortada');
  });
});

describe('croppedSize y allowedWidths (CA-43, CA-49)', () => {
  it('recorta centrado a la proporción pedida sin ampliar', () => {
    expect(croppedSize(3000, 2000, '1:1')).toEqual({ width: 2000, height: 2000, changed: true });
    expect(croppedSize(2000, 3000, '3:2')).toEqual({ width: 2000, height: 1333, changed: true });
    expect(croppedSize(3000, 2000, '3:2').changed).toBe(false);
  });

  it('nunca ofrece un ancho mayor que el original', () => {
    expect(allowedWidths(1500, [480, 720, 960, 1200, 1600])).toEqual([480, 720, 960, 1200]);
    expect(allowedWidths(1200, [480, 1200, 1201])).toEqual([480, 1200]);
  });

  it('si ningún candidato cabe, usa el ancho original', () => {
    expect(allowedWidths(300, [480, 720])).toEqual([300]);
  });
});
