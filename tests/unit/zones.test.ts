import { describe, expect, it } from 'vitest';
import { ZONES, zoneName, zoneOf, zoneRange } from '../../src/lib/altitude/zones';

const t = { temperate: 1000, cold: 2000, paramo: 3000 };
const territory = { minM: 100, maxM: 3800, thresholds: t };

describe('zoneOf (CA-29)', () => {
  it('asigna cada piso dentro de su rango', () => {
    expect(zoneOf(100, t)).toBe('warm');
    expect(zoneOf(999, t)).toBe('warm');
    expect(zoneOf(1500, t)).toBe('temperate');
    expect(zoneOf(2500, t)).toBe('cold');
    expect(zoneOf(3500, t)).toBe('paramo');
  });

  it('una altitud igual al umbral pertenece al piso superior', () => {
    expect(zoneOf(1000, t)).toBe('temperate');
    expect(zoneOf(2000, t)).toBe('cold');
    expect(zoneOf(3000, t)).toBe('paramo');
  });

  it('un metro por debajo del umbral sigue en el piso inferior', () => {
    expect(zoneOf(1999, t)).toBe('temperate');
    expect(zoneOf(2999, t)).toBe('cold');
  });
});

describe('zoneRange y zoneName', () => {
  it('los rangos son contiguos y cubren el territorio', () => {
    const ranges = ZONES.map((z) => zoneRange(z, territory));
    expect(ranges[0]?.fromM).toBe(100);
    expect(ranges[3]?.toM).toBe(3800);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i]?.fromM).toBe(ranges[i - 1]?.toM);
    }
  });

  it('nombra los cuatro pisos en español', () => {
    expect(ZONES.map(zoneName)).toEqual(['cálido', 'templado', 'frío', 'páramo']);
  });
});
