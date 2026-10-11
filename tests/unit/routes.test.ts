import { describe, expect, it } from 'vitest';
import { buildElevationProfile } from '../../src/lib/routes/elevation-profile';
import {
  cumulativeKm,
  elevationStats,
  hasPointElevation,
  haversineKm,
} from '../../src/lib/routes/geo';
import { TILE_URL, tileOrigin } from '../../src/lib/routes/map-config';
import { orderRoutes, routeKey, routeStyle, styleRoutes } from '../../src/lib/routes/style';
import { isDeclaredOrigin } from '../../src/lib/privacy/third-parties';

const withEle = [
  [-75.5, 6.2, 1500],
  [-75.49, 6.2, 1600],
  [-75.48, 6.2, 1550],
  [-75.47, 6.2, 1700],
];
const without = [
  [-75.5, 6.2],
  [-75.49, 6.2],
];

describe('geo (CA-76)', () => {
  it('hasPointElevation: todos los puntos o ninguno', () => {
    expect(hasPointElevation(withEle)).toBe(true);
    expect(hasPointElevation(without)).toBe(false);
    expect(
      hasPointElevation([
        [-75.5, 6.2, 1500],
        [-75.4, 6.3],
      ]),
    ).toBe(false);
    expect(hasPointElevation([])).toBe(false);
  });

  it('haversine: un grado de longitud en el ecuador mide unos 111 km', () => {
    expect(haversineKm([0, 0], [1, 0])).toBeCloseTo(111.19, 1);
    expect(haversineKm([-75.5, 6.2], [-75.5, 6.2])).toBe(0);
  });

  it('cumulativeKm: empieza en 0, crece y suma los tramos', () => {
    const km = cumulativeKm(withEle);
    expect(km[0]).toBe(0);
    expect(km).toHaveLength(4);
    expect(km[3]!).toBeCloseTo(3 * haversineKm(withEle[0]!, withEle[1]!), 3);
    expect(km.every((v, i) => i === 0 || v > (km[i - 1] as number))).toBe(true);
  });

  it('elevationStats: mínima, máxima y ascenso acumulado; null sin elevación', () => {
    expect(elevationStats(withEle)).toEqual({ minM: 1500, maxM: 1700, ascentM: 250 });
    expect(elevationStats(without)).toBeNull();
  });
});

describe('perfil de elevación (CA-76)', () => {
  it('una ruta sin elevación por punto devuelve null y no pinta nada', () => {
    expect(buildElevationProfile(without)).toBeNull();
  });

  it('con elevación: trazados, rótulos y alternativa en texto', () => {
    const m = buildElevationProfile(withEle);
    expect(m).not.toBeNull();
    expect(m).toMatchObject({ minM: 1500, maxM: 1700, width: 300, height: 120 });
    expect(m?.linePath.startsWith('M0 ')).toBe(true);
    expect(m?.areaPath.endsWith('L300 120L0 120Z')).toBe(true);
    expect(m?.altText).toBe('Elevación mínima 1500 m, máxima 1700 m, 250 m de subida.');
    expect(m?.totalKm).toBeGreaterThan(0);
  });

  it('la mínima queda en la base y la máxima arriba', () => {
    const m = buildElevationProfile(withEle)!;
    expect(m.linePath).toContain(' 120');
    expect(m.linePath).toContain(' 0');
  });

  it('una ruta plana no rompe la escala', () => {
    const flat = [
      [-75.5, 6.2, 1500],
      [-75.4, 6.2, 1500],
    ];
    expect(buildElevationProfile(flat)?.linePath).toContain(' 60');
  });
});

describe('estilo de las rutas (CA-68, CA-69)', () => {
  it('los cuatro patrones por piso', () => {
    expect(routeStyle('warm', 0)).toMatchObject({ pattern: 'solid', dashArray: null });
    expect(routeStyle('temperate', 0)).toMatchObject({ pattern: 'long-dash', dashArray: '14 8' });
    expect(routeStyle('cold', 0)).toMatchObject({ pattern: 'dash-dot', dashArray: '14 6 2 6' });
    expect(routeStyle('paramo', 0)).toMatchObject({ pattern: 'dots', dashArray: '1 9' });
  });

  it('las tres variantes dentro de un piso, y se repiten con la cuarta', () => {
    expect(routeStyle('cold', 0)).toMatchObject({ variant: 'regular', weight: 5 });
    expect(routeStyle('cold', 1)).toMatchObject({ variant: 'double', weight: 7 });
    expect(routeStyle('cold', 2)).toMatchObject({ variant: 'thin', weight: 3 });
    expect(routeStyle('cold', 3)).toMatchObject({ variant: 'regular' });
  });

  it('letra clave: A, B, C… y AA tras la Z', () => {
    expect([0, 1, 2, 25, 26, 27].map(routeKey)).toEqual(['A', 'B', 'C', 'Z', 'AA', 'AB']);
  });

  it('orden de la lista por elevación mínima y luego nombre; la variante cuenta por piso', () => {
    const rutas = [
      { zone: 'cold' as const, properties: { name: 'Zeta', elevation: { minM: 2100 } } },
      { zone: 'warm' as const, properties: { name: 'Beta', elevation: { minM: 300 } } },
      { zone: 'cold' as const, properties: { name: 'Alfa', elevation: { minM: 2100 } } },
    ];
    expect(orderRoutes(rutas).map((r) => r.properties.name)).toEqual(['Beta', 'Alfa', 'Zeta']);
    const styled = styleRoutes(rutas);
    expect(styled.map((r) => r.key)).toEqual(['A', 'B', 'C']);
    expect(styled.map((r) => r.style.variant)).toEqual(['regular', 'regular', 'double']);
  });
});

describe('configuración del mapa (CA-79, CA-135)', () => {
  it('la URL de teselas es la exacta de OpenStreetMap y su origen está declarado', () => {
    expect(TILE_URL).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(tileOrigin()).toBe('https://tile.openstreetmap.org');
    expect(isDeclaredOrigin(tileOrigin(), 'https://ejemplo.vercel.app')).toBe(true);
  });
});
