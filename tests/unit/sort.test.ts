import { describe, expect, it } from 'vitest';
import { compareByAltitude, groupByZone, resolveFeatured } from '../../src/lib/altitude/sort';
import { validateSite, type Destino } from '../../src/lib/content/validate';
import { territory } from './helpers/content';
import { dest, validRaw } from './helpers/site';

const at = (meters: number) => ({ meters, verified: true, source: 'x' });

function publish(entries: ReturnType<typeof dest>[]): Destino[] {
  const raw = validRaw();
  raw.rutas = [];
  raw.destinos = entries;
  const { site } = validateSite(raw, 'preview');
  if (!site) throw new Error('el escenario de prueba debería publicarse');
  return site.destinos;
}

describe('compareByAltitude (CA-13)', () => {
  const a = { name: 'Árbol', altitude: { meters: 1500 } };
  const b = { name: 'Bosque', altitude: { meters: 1500 } };

  it('ordena por altitud ascendente', () => {
    expect(compareByAltitude({ ...a, altitude: { meters: 900 } }, b)).toBeLessThan(0);
    expect(compareByAltitude({ ...a, altitude: { meters: 2000 } }, b)).toBeGreaterThan(0);
  });

  it('con la misma altitud desempata por nombre en español', () => {
    expect(compareByAltitude(a, b)).toBeLessThan(0);
    expect(compareByAltitude(b, a)).toBeGreaterThan(0);
    expect(compareByAltitude(a, { ...a })).toBe(0);
    const names = ['Zorro', 'Ñandú', 'Oso', 'Álamo'].map((name) => ({
      name,
      altitude: { meters: 1 },
    }));
    expect(names.sort(compareByAltitude).map((n) => n.name)).toEqual([
      'Álamo',
      'Ñandú',
      'Oso',
      'Zorro',
    ]);
  });
});

describe('resolveFeatured (CA-15)', () => {
  it('respeta el principal marcado', () => {
    expect(resolveFeatured([{ featured: false }, { featured: true }])).toEqual({
      featuredIndex: 1,
    });
  });

  it('un piso con un solo destino lo muestra como principal', () => {
    expect(resolveFeatured([{ featured: true }])).toEqual({ featuredIndex: 0 });
    expect(resolveFeatured([{ featured: false }])).toEqual({
      featuredIndex: 0,
      issue: 'none-featured',
    });
  });

  it('sin ninguno marcado elige el de menor altitud (el primero) y avisa', () => {
    expect(resolveFeatured([{ featured: false }, { featured: false }])).toEqual({
      featuredIndex: 0,
      issue: 'none-featured',
    });
  });

  it('dos marcados: informa el problema', () => {
    expect(resolveFeatured([{ featured: true }, { featured: true }])).toEqual({
      featuredIndex: 0,
      issue: 'two-featured',
    });
  });

  it('lista vacía', () => {
    expect(resolveFeatured([])).toEqual({ featuredIndex: -1 });
  });
});

describe('groupByZone (CA-12, CA-14)', () => {
  it('agrupa por piso en el orden cálido a páramo, sin pisos vacíos', () => {
    const destinos = publish([
      dest('alto', { altitude: at(3500) }),
      dest('bajo', { altitude: at(300), featured: true }),
      dest('medio', { altitude: at(1200) }),
      dest('medio-b', { altitude: at(1800), featured: true }),
    ]);
    const blocks = groupByZone(destinos, territory());
    expect(blocks.map((b) => b.zone)).toEqual(['warm', 'temperate', 'paramo']);
    expect(blocks[1]?.featured.id).toBe('medio-b');
    expect(blocks[1]?.others.map((d) => d.id)).toEqual(['medio']);
    expect(blocks[1]?.range).toEqual({ fromM: 1000, toM: 2000 });
  });

  it('un piso con un destino: es el principal y no hay otros', () => {
    const [block] = groupByZone(publish([dest('solo', { altitude: at(2500) })]), territory());
    expect(block?.zone).toBe('cold');
    expect(block?.featured.id).toBe('solo');
    expect(block?.others).toEqual([]);
  });

  it('piso sin principal marcado: el de menor altitud', () => {
    const blocks = groupByZone(
      publish([dest('b', { altitude: at(1800) }), dest('a', { altitude: at(1100) })]),
      territory(),
    );
    expect(blocks[0]?.featured.id).toBe('a');
  });

  it('empate de altitud: orden alfabético', () => {
    const blocks = groupByZone(
      publish([
        dest('z', { name: 'Zeta', altitude: at(1500), featured: true }),
        dest('a', { name: 'Alfa', altitude: at(1500) }),
        dest('m', { name: 'Mu', altitude: at(1500) }),
      ]),
      territory(),
    );
    expect(blocks[0]?.others.map((d) => d.name)).toEqual(['Alfa', 'Mu']);
  });

  it('una altitud igual al umbral va al piso superior', () => {
    const blocks = groupByZone(publish([dest('u', { altitude: at(2000) })]), territory());
    expect(blocks.map((b) => b.zone)).toEqual(['cold']);
  });

  it('sin destinos no hay bloques', () => {
    expect(groupByZone([], territory())).toEqual([]);
  });
});
