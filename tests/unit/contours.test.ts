import { describe, expect, it } from 'vitest';
import { buildContourPlate, PLATE_HEIGHT, PLATE_WIDTH } from '../../src/lib/altitude/contours';
import { ZONES } from '../../src/lib/altitude/zones';

describe('buildContourPlate (CA-39)', () => {
  it('es determinista: dos llamadas dan el mismo resultado', () => {
    for (const zone of ZONES) {
      expect(buildContourPlate(zone)).toEqual(buildContourPlate(zone));
    }
  });

  it('los cuatro pisos dan dibujos distintos', () => {
    const drawings = ZONES.map((z) =>
      buildContourPlate(z)
        .curves.map((c) => c.d)
        .join('|'),
    );
    expect(new Set(drawings).size).toBe(4);
  });

  it('cada piso marca sus curvas maestras, según la tabla de S6.3', () => {
    const masters = (z: (typeof ZONES)[number]) =>
      buildContourPlate(z)
        .curves.filter((c) => c.master)
        .map((c) => c.level);
    expect(masters('warm')).toEqual([50]);
    expect(masters('temperate')).toEqual([50]);
    expect(masters('cold')).toEqual([30, 60, 90]);
    expect(masters('paramo')).toEqual([50]);
  });

  it('todas las coordenadas caen dentro del lienzo de 300 × 200', () => {
    for (const zone of ZONES) {
      const plate = buildContourPlate(zone);
      expect(plate.viewBox).toEqual([PLATE_WIDTH, PLATE_HEIGHT]);
      for (const c of plate.curves) {
        const nums = (c.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
        expect(nums.length).toBeGreaterThan(0);
        nums.forEach((n, i) => {
          expect(n).toBeGreaterThanOrEqual(0);
          expect(n).toBeLessThanOrEqual(i % 2 === 0 ? PLATE_WIDTH : PLATE_HEIGHT);
        });
      }
    }
  });

  it('el frío tiene unas 15 curvas y el páramo pocas', () => {
    expect(buildContourPlate('cold').curves.length).toBeGreaterThanOrEqual(14);
    expect(buildContourPlate('paramo').curves.length).toBeLessThanOrEqual(9);
  });
});
