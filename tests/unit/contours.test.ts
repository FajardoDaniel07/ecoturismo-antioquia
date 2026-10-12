import { describe, expect, it } from 'vitest';
import {
  GRID_STEP,
  buildContourPlate,
  PLATE_HEIGHT,
  PLATE_WIDTH,
} from '../../src/lib/altitude/contours';
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

  it('cada piso marca sus curvas maestras, según la tabla de S6.3 y R15', () => {
    const masters = (z: (typeof ZONES)[number]) =>
      buildContourPlate(z)
        .curves.filter((c) => c.master)
        .map((c) => c.level);
    expect(masters('warm')).toEqual([50]);
    expect(masters('temperate')).toEqual([18, 36, 54, 72]); // R15
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

  it('R13: retícula de 2 unidades y curvas suavizadas, sin segmentos quebrados', () => {
    expect(GRID_STEP).toBe(2);
    for (const zone of ZONES) {
      for (const c of buildContourPlate(zone).curves) {
        expect(c.d).toContain('Q');
        // Solo hay rectas en los extremos de una curva abierta: la forma interior son cuadráticas.
        const straight = (c.d.match(/L/g) ?? []).length;
        const smooth = (c.d.match(/Q/g) ?? []).length;
        expect(straight).toBeLessThanOrEqual(2 * (c.d.match(/M/g) ?? []).length);
        expect(smooth).toBeGreaterThan(straight);
      }
    }
  });

  it('R13: los anillos del páramo y de las lomas salen cerrados', () => {
    expect(buildContourPlate('paramo').curves.some((c) => c.d.includes('Z'))).toBe(true);
    expect(buildContourPlate('temperate').curves.some((c) => c.d.includes('Z'))).toBe(true);
  });

  it('R14: el piso frío ya no tiene ondas cortas (curvas largas, casi paralelas)', () => {
    const cold = buildContourPlate('cold');
    expect(cold.curves.length).toBeGreaterThanOrEqual(14);
    // Cada curva cruza la lámina de lado a lado: empieza cerca de un borde y termina cerca del otro.
    for (const c of cold.curves) {
      const nums = (c.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      const xs = nums.filter((_, i) => i % 2 === 0);
      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(250);
    }
  });

  it('el HTML de las cuatro láminas pesa poco (suavizar no infla los trazados)', () => {
    const total = ZONES.reduce(
      (sum, z) => sum + buildContourPlate(z).curves.reduce((n, c) => n + c.d.length, 0),
      0,
    );
    expect(total).toBeLessThan(40_000);
  });
});
