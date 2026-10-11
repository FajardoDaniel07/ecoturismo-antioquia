import { describe, expect, it } from 'vitest';
import {
  destinoSchema,
  legalSchema,
  operatorSchema,
  photoSchema,
  rutaSchema,
  territorySchema,
} from '../../src/lib/content/schemas';
import { fakeImage, fakeRef } from './helpers/content';

const destinos = destinoSchema({ image: fakeImage });
const photos = photoSchema({ image: fakeImage });
const rutas = rutaSchema(fakeRef);

const baseDestino = {
  name: 'Valle de prueba',
  summary: 'Descripción corta.',
  altitude: { meters: 1500, verified: true, source: 'IGAC' },
};
const basePhoto = {
  file: { src: '/f.jpg', width: 2400, height: 1600, format: 'jpg' },
  alt: 'Sendero entre palmas',
  author: 'Ana Pérez',
  license: {
    kind: 'cc-by',
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg',
  modification: 'none',
  ratio: '3:2',
};
const baseRuta = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [-75.5, 6.2],
      [-75.4, 6.3],
    ],
  },
  properties: {
    name: 'Ruta',
    destino: 'valle-de-prueba',
    elevation: { minM: 1500, maxM: 1600 },
  },
};

function messages(result: { error?: { issues: { message: string }[] } }): string {
  return (result.error?.issues ?? []).map((i) => i.message).join(' | ');
}

function without<T extends object>(obj: T, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
}

describe('destinoSchema', () => {
  it('acepta un destino válido y aplica los valores por defecto', () => {
    const r = destinos.safeParse(baseDestino);
    expect(r.success).toBe(true);
    expect(r.data?.featured).toBe(false);
    expect(r.data?.photos).toEqual([]);
  });

  it.each([0, -5, 'alto', undefined])('CA-20: rechaza la altitud %j', (meters) => {
    const r = destinos.safeParse({ ...baseDestino, altitude: { verified: true, meters } });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-20');
  });

  it('CA-33: rechaza un nombre de más de 37 caracteres', () => {
    expect(destinos.safeParse({ ...baseDestino, name: 'x'.repeat(38) }).success).toBe(false);
    expect(destinos.safeParse({ ...baseDestino, name: 'x'.repeat(37) }).success).toBe(true);
  });
});

describe('ficha', () => {
  it('CA-24: acepta mínima menor que máxima y rechaza lo contrario', () => {
    expect(destinos.safeParse({ ...baseDestino, climate: { minC: 8, maxC: 18 } }).success).toBe(
      true,
    );
    const bad = destinos.safeParse({ ...baseDestino, climate: { minC: 18, maxC: 8 } });
    expect(bad.success).toBe(false);
    expect(messages(bad)).toContain('CA-24');
    expect(destinos.safeParse({ ...baseDestino, climate: { minC: 8, maxC: 8 } }).success).toBe(
      false,
    );
  });

  it('CA-27: acepta las tres dificultades y rechaza otras', () => {
    for (const difficulty of ['easy', 'moderate', 'demanding']) {
      expect(destinos.safeParse({ ...baseDestino, difficulty }).success).toBe(true);
    }
    const bad = destinos.safeParse({ ...baseDestino, difficulty: 'extreme' });
    expect(bad.success).toBe(false);
    expect(messages(bad)).toContain('CA-27');
  });
});

describe('photoSchema', () => {
  it('acepta una foto completa', () => {
    expect(photos.safeParse(basePhoto).success).toBe(true);
  });

  it.each(['author', 'sourceUrl', 'modification'])('CA-46: rechaza una foto sin %s', (key) => {
    const r = photos.safeParse(without(basePhoto, key));
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-46');
  });

  it('CA-46: rechaza una licencia sin enlace', () => {
    const r = photos.safeParse({ ...basePhoto, license: { kind: 'cc-by', name: 'CC BY 4.0' } });
    expect(r.success).toBe(false);
  });

  it.each(['cc0', 'public-domain', 'cc-by', 'cc-by-sa'])('CA-47: acepta la licencia %s', (kind) => {
    const r = photos.safeParse({ ...basePhoto, license: { ...basePhoto.license, kind } });
    expect(r.success).toBe(true);
  });

  it.each(['cc-by-nc', 'cc-by-nd', 'all-rights-reserved'])(
    'CA-47: rechaza la licencia %s',
    (kind) => {
      const r = photos.safeParse({ ...basePhoto, license: { ...basePhoto.license, kind } });
      expect(r.success).toBe(false);
      expect(messages(r)).toContain('CA-47');
    },
  );

  it('CA-48: rechaza un texto alternativo vacío o de espacios', () => {
    expect(photos.safeParse({ ...basePhoto, alt: '' }).success).toBe(false);
    const r = photos.safeParse({ ...basePhoto, alt: '   ' });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-48');
  });

  it('rechaza una proporción fuera de 3:2, 4:5 y 1:1', () => {
    expect(photos.safeParse({ ...basePhoto, ratio: '16:9' }).success).toBe(false);
  });
});

describe('rutaSchema', () => {
  it('acepta una ruta con y sin elevación por punto', () => {
    expect(rutas.safeParse(baseRuta).success).toBe(true);
    const withEle = {
      ...baseRuta,
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75.5, 6.2, 1500],
          [-75.4, 6.3, 1600],
        ],
      },
    };
    expect(rutas.safeParse(withEle).success).toBe(true);
  });

  it('transforma la referencia al destino', () => {
    expect(rutas.parse(baseRuta).properties.destino).toEqual({
      collection: 'destinos',
      id: 'valle-de-prueba',
    });
  });

  it('CA-77: rechaza un trazado ausente, vacío, de un punto o de otro tipo', () => {
    expect(rutas.safeParse(without(baseRuta, 'geometry')).success).toBe(false);
    for (const coordinates of [[], [[-75.5, 6.2]]]) {
      const r = rutas.safeParse({ ...baseRuta, geometry: { type: 'LineString', coordinates } });
      expect(r.success).toBe(false);
    }
    const punto = rutas.safeParse({
      ...baseRuta,
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
    expect(punto.success).toBe(false);
    expect(messages(punto)).toContain('CA-77');
  });

  it('CA-77: rechaza coordenadas fuera de rango', () => {
    const r = rutas.safeParse({
      ...baseRuta,
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75.5, 96],
          [-75.4, 6.3],
        ],
      },
    });
    expect(r.success).toBe(false);
  });

  it('CA-78: rechaza elevación ausente o con mínima mayor que máxima', () => {
    const sinElevacion = { ...baseRuta, properties: without(baseRuta.properties, 'elevation') };
    expect(rutas.safeParse(sinElevacion).success).toBe(false);
    const r = rutas.safeParse({
      ...baseRuta,
      properties: { ...baseRuta.properties, elevation: { minM: 2000, maxM: 1500 } },
    });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-78');
  });

  it('CA-78: rechaza una ruta sin destino', () => {
    const sinDestino = { ...baseRuta, properties: without(baseRuta.properties, 'destino') };
    expect(rutas.safeParse(sinDestino).success).toBe(false);
  });
});

describe('legalSchema', () => {
  const base = {
    kind: 'privacy',
    title: 'Política de datos',
    summary: 'Resumen.',
    status: 'draft',
  };

  it('CA-118: acepta borrador y revisado con fecha', () => {
    expect(legalSchema.safeParse(base).success).toBe(true);
    const revisado = { ...base, status: 'reviewed', reviewedOn: '2026-11-01' };
    expect(legalSchema.safeParse(revisado).success).toBe(true);
  });

  it('CA-118: rechaza un estado que no sea draft o reviewed', () => {
    const r = legalSchema.safeParse({ ...base, status: 'final' });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-118');
  });

  it('CA-121: un texto revisado sin fecha es inválido', () => {
    const r = legalSchema.safeParse({ ...base, status: 'reviewed' });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-121');
  });
});

describe('operatorSchema', () => {
  const base = {
    name: 'Operador',
    whatsapp: '+573127951683',
    hours: 'Lunes a viernes, de 10 a. m. a 10 p. m.',
    email: 'danielfajardog1902@gmail.com',
  };

  it('CA-119: acepta el operador sin identificadores (clave ausente = no entregado)', () => {
    const r = operatorSchema.safeParse(base);
    expect(r.success).toBe(true);
    expect(r.data?.identifiers).toEqual({ others: [] });
  });

  it('acepta identificadores con ficticio en falso por defecto', () => {
    const r = operatorSchema.parse({ ...base, identifiers: { rnt: { value: 'RNT 84521' } } });
    expect(r.identifiers.rnt?.fictitious).toBe(false);
  });

  it('CA-119: rechaza un identificador sin valor', () => {
    const r = operatorSchema.safeParse({ ...base, identifiers: { nit: { value: '  ' } } });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-119');
  });

  it.each(['3127951683', '+57 312 795 1683', '+5731279516'])(
    'rechaza el WhatsApp %j',
    (whatsapp) => {
      expect(operatorSchema.safeParse({ ...base, whatsapp }).success).toBe(false);
    },
  );

  it('rechaza un correo inválido', () => {
    expect(operatorSchema.safeParse({ ...base, email: 'sin-arroba' }).success).toBe(false);
  });
});

describe('territorySchema', () => {
  const base = {
    minM: 50,
    maxM: 3900,
    thresholds: { temperate: 1000, cold: 2000, paramo: 3000 },
    verified: true,
    source: 'Fuente',
  };

  it('CA-122: acepta umbrales en orden estrictamente ascendente', () => {
    expect(territorySchema.safeParse(base).success).toBe(true);
  });

  it('CA-122: admite minM = 0 (nivel del mar) y rechaza un mínimo negativo', () => {
    expect(territorySchema.safeParse({ ...base, minM: 0 }).success).toBe(true);
    const r = territorySchema.safeParse({ ...base, minM: -1 });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-122');
  });

  it.each([
    ['desordenados', { temperate: 2000, cold: 1000, paramo: 3000 }],
    ['iguales', { temperate: 1000, cold: 1000, paramo: 3000 }],
    ['con el páramo sobre el máximo', { temperate: 1000, cold: 2000, paramo: 3900 }],
    ['con el templado en el mínimo', { temperate: 50, cold: 2000, paramo: 3000 }],
  ])('CA-122: rechaza umbrales %s', (_name, thresholds) => {
    const r = territorySchema.safeParse({ ...base, thresholds });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain('CA-122');
  });
});
