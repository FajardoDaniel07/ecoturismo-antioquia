import { describe, expect, it } from 'vitest';
import { formatIssues, validateSite } from '../../src/lib/content/validate';
import { photo, territory } from './helpers/content';
import { dest, entry, rules, validRaw } from './helpers/site';

describe('validateSite: sitio válido', () => {
  it('publica los cuatro destinos con su piso derivado, por altitud', () => {
    const { site, issues } = validateSite(validRaw(), 'release');
    expect(issues.filter((i) => i.severity !== 'warning')).toEqual([]);
    expect(site?.destinos.map((d) => [d.id, d.zone])).toEqual([
      ['playa', 'warm'],
      ['valle', 'temperate'],
      ['bosque', 'cold'],
      ['laguna', 'paramo'],
    ]);
    expect(site?.destinos.every((d) => d.isFeatured)).toBe(true);
    expect(site?.destinos[1]?.href).toBe('/destinos/valle/');
  });

  it('cada problema trae archivo, campo, regla y criterio (CA-99)', () => {
    const raw = validRaw();
    raw.destinos.push(dest('Mal_Slug'));
    const { issues } = validateSite(raw, 'preview');
    const issue = rules(issues, 'CA-31')[0];
    expect(issue).toMatchObject({ severity: 'error', file: 'destinos/Mal_Slug' });
    expect(issue?.field).toBeTruthy();
    expect(issue?.rule).toBeTruthy();
    expect(formatIssues(issues)).toContain('CA-31');
  });
});

describe('CA-31: slugs', () => {
  it.each(['Valle', 'valle_bonito', 'válle', 'valle--x', '-valle'])('rechaza %j', (id) => {
    const raw = validRaw();
    raw.destinos.push(dest(id, { altitude: { meters: 700, verified: true, source: 'x' } }));
    const { site, issues } = validateSite(raw, 'preview');
    expect(rules(issues, 'CA-31')).toHaveLength(1);
    expect(site).toBeNull();
  });

  it('acepta kebab-case con números', () => {
    const raw = validRaw();
    raw.destinos.push(
      dest('cerro-2-picos', { altitude: { meters: 700, verified: true, source: 'x' } }),
    );
    expect(rules(validateSite(raw, 'preview').issues, 'CA-31')).toEqual([]);
  });
});

describe('CA-33: títulos y descripciones únicos', () => {
  it('rechaza un nombre repetido sin distinguir tildes ni mayúsculas', () => {
    const raw = validRaw();
    raw.destinos[0]!.data.name = 'Páramo Alto';
    raw.destinos[1]!.data.name = 'paramo alto';
    const { issues, site } = validateSite(raw, 'release');
    expect(rules(issues, 'CA-33')).toHaveLength(1);
    expect(rules(issues, 'CA-33')[0]?.field).toBe('name');
    expect(site).toBeNull();
  });

  it('rechaza una descripción repetida', () => {
    const raw = validRaw();
    raw.destinos[1]!.data.summary = raw.destinos[0]!.data.summary;
    const { issues } = validateSite(raw, 'release');
    expect(rules(issues, 'CA-33')[0]?.field).toBe('summary');
  });
});

describe('CA-122: altitud dentro del rango declarado', () => {
  it.each([49, 3901])('falla en vista previa y en publicación con %s m', (meters) => {
    for (const mode of ['preview', 'release'] as const) {
      const raw = validRaw();
      raw.destinos.push(dest('fuera', { altitude: { meters, verified: true, source: 'x' } }));
      const { site, issues } = validateSite(raw, mode);
      const found = rules(issues, 'CA-122');
      expect(found).toHaveLength(1);
      expect(found[0]?.severity).toBe('error');
      expect(found[0]?.message).toContain('50');
      expect(site).toBeNull();
    }
  });

  it('acepta las altitudes exactas del mínimo y del máximo', () => {
    const raw = validRaw();
    raw.destinos.push(
      dest('en-el-minimo', { altitude: { meters: 50, verified: true, source: 'x' } }),
    );
    raw.destinos.push(
      dest('en-el-maximo', { altitude: { meters: 3900, verified: true, source: 'x' } }),
    );
    expect(rules(validateSite(raw, 'preview').issues, 'CA-122')).toEqual([]);
  });

  it('exige exactamente un territorio', () => {
    const raw = validRaw();
    raw.territorio = [];
    const { site, issues } = validateSite(raw, 'preview');
    expect(rules(issues, 'CA-122')).toHaveLength(1);
    expect(site).toBeNull();
  });
});

describe('CA-29: piso derivado de la altitud', () => {
  it('una altitud igual al umbral queda en el piso superior', () => {
    const raw = validRaw();
    raw.rutas = [];
    raw.destinos = [dest('en-umbral', { altitude: { meters: 2000, verified: true, source: 'x' } })];
    expect(validateSite(raw, 'preview').site?.destinos[0]?.zone).toBe('cold');
  });
});

describe('CA-15: destino principal', () => {
  const at = (meters: number) => ({ meters, verified: true, source: 'x' });

  it('dos principales en un piso fallan en los dos modos', () => {
    for (const mode of ['preview', 'release'] as const) {
      const raw = validRaw();
      raw.destinos.push(dest('a', { altitude: at(1100), featured: true }));
      raw.destinos.push(dest('b', { altitude: at(1200), featured: true }));
      const { site, issues } = validateSite(raw, mode);
      expect(rules(issues, 'CA-15').filter((i) => i.severity === 'error')).toHaveLength(1);
      expect(site).toBeNull();
    }
  });

  it('sin principal marcado avisa y elige el de menor altitud', () => {
    const raw = validRaw();
    raw.rutas = [];
    raw.destinos = [dest('alto', { altitude: at(1800) }), dest('bajo', { altitude: at(1100) })];
    const { site, issues } = validateSite(raw, 'release');
    expect(rules(issues, 'CA-15')[0]?.severity).toBe('warning');
    expect(site?.destinos.map((d) => [d.id, d.isFeatured])).toEqual([
      ['bajo', true],
      ['alto', false],
    ]);
  });

  it('respeta el principal marcado', () => {
    const raw = validRaw();
    raw.rutas = [];
    raw.destinos = [
      dest('alto', { altitude: at(1800), featured: true }),
      dest('bajo', { altitude: at(1100) }),
    ];
    const { site, issues } = validateSite(raw, 'release');
    expect(rules(issues, 'CA-15')).toEqual([]);
    expect(site?.destinos.find((d) => d.isFeatured)?.id).toBe('alto');
  });
});

describe('CA-104: altitud y territorio sin verificar', () => {
  it('vista previa: el destino se excluye y se avisa, el resto se publica', () => {
    const raw = validRaw();
    raw.destinos[0]!.data.altitude.verified = false;
    const { site, issues } = validateSite(raw, 'preview');
    const found = rules(issues, 'CA-104');
    expect(found).toHaveLength(1);
    expect(found[0]?.severity).toBe('release');
    expect(site?.destinos.map((d) => d.id)).not.toContain('playa');
    expect(site?.destinos).toHaveLength(3);
  });

  it('publicación: falla nombrando el destino', () => {
    const raw = validRaw();
    raw.destinos[0]!.data.altitude.verified = false;
    const { site, issues } = validateSite(raw, 'release');
    expect(site).toBeNull();
    expect(rules(issues, 'CA-104')[0]?.message).toContain('Destino playa');
  });

  it('territorio sin verificar: ningún destino es publicable y termina en CA-100', () => {
    for (const mode of ['preview', 'release'] as const) {
      const raw = validRaw();
      raw.territorio = [entry('territorio', { ...territory(), verified: false }, 'sitio')];
      const { site, issues } = validateSite(raw, mode);
      expect(rules(issues, 'CA-104').length).toBeGreaterThan(0);
      expect(rules(issues, 'CA-100')).toHaveLength(1);
      expect(site).toBeNull();
    }
  });

  it('altitud verificada sin fuente es un problema de publicación', () => {
    const raw = validRaw();
    delete raw.destinos[0]!.data.altitude.source;
    const { issues } = validateSite(raw, 'preview');
    expect(rules(issues, 'CA-104')[0]?.field).toBe('altitude.source');
  });
});

describe('CA-100: ningún destino publicado', () => {
  it('falla con un mensaje claro en los dos modos', () => {
    for (const mode of ['preview', 'release'] as const) {
      const raw = validRaw();
      raw.rutas = [];
      raw.destinos = [];
      raw.rutas = [];
      const { site, issues } = validateSite(raw, mode);
      expect(site).toBeNull();
      expect(rules(issues, 'CA-100')[0]).toMatchObject({ severity: 'error', file: 'destinos' });
    }
  });
});

describe('modelo de fotos', () => {
  it('calcula tamaño tras el recorte, nivel y recorte derivado', () => {
    const raw = validRaw();
    raw.rutas = [];
    raw.destinos = [
      dest('con-fotos', {
        altitude: { meters: 1500, verified: true, source: 'x' },
        photos: [photo(3000, 2000), { ...photo(1500, 1500), ratio: '3:2' }, photo(2400, 1600)],
      }),
    ];
    const { site, issues } = validateSite(raw, 'release');
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
    const [a, b, c] = site?.photos ?? [];
    expect(a).toMatchObject({ width: 3000, height: 2000, tier: 'large', isCropped: false });
    expect(b).toMatchObject({ width: 1500, height: 1000, tier: 'small', isCropped: true });
    expect(c?.tier).toBe('large');
    expect(site?.sections.galeria).toBe(true);
  });
});
