import { describe, expect, it } from 'vitest';
import {
  VARIANTS,
  buildAltitudeProfile,
  selectCompactDestinos,
  type ProfileVariantId,
} from '../../src/lib/altitude/profile';
import { zoneOf } from '../../src/lib/altitude/zones';
import { loadScenario, type ProfileFixtureDestino } from './helpers/fixture-profile';

const { territory, destinos } = loadScenario('completo');
const VARIANT_IDS: ProfileVariantId[] = ['compact', 'medium', 'wide'];

const make = (id: string, meters: number, over: Partial<ProfileFixtureDestino> = {}) => ({
  id,
  name: id,
  href: `/destinos/${id}/`,
  altitude: { meters, verified: true, source: 'x' },
  zone: zoneOf(meters, territory.thresholds),
  isFeatured: false,
  ...over,
});

describe('selección compacta (S3.8, CA-7)', () => {
  it('el principal de cada piso más el de mayor altitud entre los restantes, máximo cinco', () => {
    const selected = selectCompactDestinos(destinos);
    expect(selected).toHaveLength(5);
    expect(selected.map((d) => d.altitude.meters)).toEqual([250, 1600, 2150, 2400, 3350]);
    for (const zone of ['warm', 'temperate', 'cold', 'paramo'] as const) {
      const featured = destinos.find((d) => d.zone === zone && d.isFeatured);
      expect(selected).toContain(featured);
    }
    // El añadido es el de mayor altitud entre los no elegidos.
    expect(selected.find((d) => d.name === 'Mirador del Frailejón Perdido')).toBeDefined();
  });

  it('con menos destinos que cinco, no inventa ni repite', () => {
    const few = [make('a', 300, { isFeatured: true }), make('b', 3500, { isFeatured: true })];
    expect(selectCompactDestinos(few).map((d) => d.id)).toEqual(['a', 'b']);
  });

  it('sin destinos sobrantes no añade nada; con uno por piso devuelve cuatro', () => {
    const four = [300, 1500, 2500, 3500].map((m, i) => make(`d${i}`, m, { isFeatured: true }));
    expect(selectCompactDestinos(four)).toHaveLength(4);
  });
});

describe('buildAltitudeProfile: geometría (S3.4, S3.5)', () => {
  it.each(VARIANT_IDS)('usa las constantes de la variante %s', (variant) => {
    const m = buildAltitudeProfile(territory, destinos, variant);
    expect(m.width).toBe(VARIANTS[variant].W);
    expect(m.height).toBe(VARIANTS[variant].H);
    expect(m.echoPaths).toHaveLength(VARIANTS[variant].echoes);
  });

  it('CA-4: tiene un punto por destino en medio y amplia, y cinco en la compacta', () => {
    expect(buildAltitudeProfile(territory, destinos, 'medium').points).toHaveLength(7);
    expect(buildAltitudeProfile(territory, destinos, 'wide').points).toHaveLength(7);
    const compact = buildAltitudeProfile(territory, destinos, 'compact');
    expect(compact.points).toHaveLength(5);
    expect(compact.omitted).toBe(2);
  });

  it('la escala vertical es lineal: cumbre en Pt y valle en H − Pb', () => {
    const p = VARIANTS.wide;
    const top = buildAltitudeProfile(territory, [make('cima', territory.maxM)], 'wide');
    const bottom = buildAltitudeProfile(territory, [make('valle', territory.minM)], 'wide');
    expect(top.points[0]?.y).toBe(p.Pt);
    expect(bottom.points[0]?.y).toBe(p.H - p.Pb);
    const mid = buildAltitudeProfile(territory, [make('medio', 1950)], 'wide');
    expect(mid.points[0]?.y).toBeCloseTo(p.Pt + (p.H - p.Pt - p.Pb) / 2, 5);
  });

  it('las posiciones horizontales van a intervalos iguales desde V hasta W − F', () => {
    const p = VARIANTS.medium;
    const m = buildAltitudeProfile(territory, destinos, 'medium');
    const s = (p.W - p.F - p.V) / (m.points.length + 1);
    m.points.forEach((pt, i) => {
      expect(pt.x).toBeCloseTo(p.V + (i + 1) * s, 1);
      expect(pt.xFraction).toBeCloseTo(pt.x / p.W, 3);
    });
  });

  it('CA-5: subir una altitud sube solo su punto', () => {
    const before = buildAltitudeProfile(territory, destinos, 'wide');
    const index = 3;
    const changed = destinos.map((d, i) =>
      i === index ? { ...d, altitude: { ...d.altitude, meters: d.altitude.meters + 100 } } : d,
    );
    const after = buildAltitudeProfile(territory, changed, 'wide');
    after.points.forEach((pt, i) => {
      const old = before.points[i]!;
      expect(pt.x).toBe(old.x);
      if (i === index) expect(pt.y).toBeLessThan(old.y);
      else expect(pt.y).toBe(old.y);
    });
  });

  it('una altitud igual al umbral queda a la altura del límite entre pisos', () => {
    const m = buildAltitudeProfile(territory, [make('umbral', 2000)], 'wide');
    expect(m.points[0]?.y).toBeCloseTo(m.boundaries[1]!, 1);
  });

  it('estratos contiguos de la cumbre al valle, y base bajo el valle', () => {
    const p = VARIANTS.wide;
    const m = buildAltitudeProfile(territory, destinos, 'wide');
    expect(m.strata.map((s) => s.zone)).toEqual(['warm', 'temperate', 'cold', 'paramo']);
    expect(m.strata[3]?.y).toBe(p.Pt);
    for (let i = 0; i < 3; i++) {
      expect(m.strata[i + 1]!.y + m.strata[i + 1]!.height).toBeCloseTo(m.strata[i]!.y, 1);
    }
    expect(m.strata[0]!.y + m.strata[0]!.height).toBeCloseTo(p.H - p.Pb, 1);
    expect(m.base).toMatchObject({ zone: 'warm', y: p.H - p.Pb, height: p.Pb });
    [1, 2, 3].forEach((k, idx) => {
      expect(m.boundaries[idx]!).toBeCloseTo(m.strata[k]!.y + m.strata[k]!.height, 1);
    });
  });

  it('el nombre de cada piso queda 8 px sobre el límite inferior de su estrato', () => {
    const m = buildAltitudeProfile(territory, destinos, 'medium');
    m.zoneLabels.forEach((z, i) => {
      const st = m.strata[i]!;
      expect(z.baselineY).toBeCloseTo(st.y + st.height - 8, 1);
    });
    expect(m.zoneLabels.map((z) => z.text)).toEqual(['cálido', 'templado', 'frío', 'páramo']);
  });

  it('rotula la altitud mínima y la máxima', () => {
    const m = buildAltitudeProfile(territory, destinos, 'wide');
    expect(m.minLabel.text).toBe('100 m');
    expect(m.maxLabel.text).toBe('3800 m');
    expect(m.minLabel.y).toBe(VARIANTS.wide.H - VARIANTS.wide.Pb + 20);
    expect(m.maxLabel.y).toBe(VARIANTS.wide.Pt - 6);
  });

  it('la silueta es la línea de cumbres cerrada por (W, H) y (0, H)', () => {
    const m = buildAltitudeProfile(territory, destinos, 'medium');
    expect(m.silhouettePath.startsWith(m.ridgePath)).toBe(true);
    expect(m.silhouettePath.endsWith('L704 340L0 340Z')).toBe(true);
    expect(m.ridgePath.startsWith('M0 291.')).toBe(false);
    expect(m.ridgePath).toMatch(/^M0 [\d.]+L24 /);
  });

  it('las curvas de eco son copias de la línea de cumbres desplazadas 14, 28 y 42 px', () => {
    const m = buildAltitudeProfile(territory, destinos, 'wide');
    const valleY = VARIANTS.wide.H - VARIANTS.wide.Pb;
    m.echoPaths.forEach((d, i) => {
      expect(d.startsWith(`M0 ${valleY + 14 * (i + 1)}`)).toBe(true);
    });
  });

  it('la compacta calcula solo con los destinos seleccionados (n = 5)', () => {
    const p = VARIANTS.compact;
    const m = buildAltitudeProfile(territory, destinos, 'compact');
    const s = (p.W - p.F - p.V) / 6;
    expect(s).toBeGreaterThanOrEqual(44);
    expect(m.points[1]!.x - m.points[0]!.x).toBeCloseTo(s, 1);
  });
});

describe('casos límite (S3.7) y datos rechazados (S3.5)', () => {
  it('un solo destino: un rellano a media ladera y la subida a la cumbre', () => {
    const m = buildAltitudeProfile(territory, [make('solo', 1950)], 'wide');
    expect(m.points).toHaveLength(1);
    expect(m.warnings).toEqual([]);
    expect(m.ridgePath.match(/C/g)).toHaveLength(3);
  });

  it('un destino a la altitud máxima: su rellano coincide con la cumbre', () => {
    const m = buildAltitudeProfile(territory, [make('cumbre', territory.maxM)], 'wide');
    expect(m.points[0]?.y).toBe(VARIANTS.wide.Pt);
  });

  it('altitudes iguales: rellanos consecutivos, en orden alfabético', () => {
    const m = buildAltitudeProfile(
      territory,
      [make('zeta', 1500, { name: 'Zeta' }), make('alfa', 1500, { name: 'Alfa' })],
      'wide',
    );
    expect(m.points.map((p) => p.name)).toEqual(['Alfa', 'Zeta']);
    expect(m.points[0]?.y).toBe(m.points[1]?.y);
    expect(m.points[1]!.x).toBeGreaterThan(m.points[0]!.x);
  });

  it('avisa si hay más destinos que la capacidad de la variante', () => {
    const many = Array.from({ length: 16 }, (_, i) => make(`d${i}`, 150 + i * 200));
    const m = buildAltitudeProfile(territory, many, 'wide');
    expect(m.points).toHaveLength(16);
    expect(m.warnings.join(' ')).toContain('capacidad de 15');
  });

  it('avisa si un estrato mide menos de 24 px', () => {
    const thin = { ...territory, thresholds: { temperate: 1000, cold: 1050, paramo: 3000 } };
    const m = buildAltitudeProfile(thin, [make('a', 500)], 'wide');
    expect(m.warnings.join(' ')).toContain('piso templado');
  });

  it('rechaza una altitud fuera del rango y umbrales desordenados', () => {
    expect(() => buildAltitudeProfile(territory, [make('bajo', 99)], 'wide')).toThrow(/Bajo|bajo/);
    expect(() => buildAltitudeProfile(territory, [make('alto', 3801)], 'wide')).toThrow(/3801/);
    const bad = { ...territory, thresholds: { temperate: 2000, cold: 1000, paramo: 3000 } };
    expect(() => buildAltitudeProfile(bad, [make('a', 500)], 'wide')).toThrow(/umbrales/);
  });
});

describe('territorio con mínima en el nivel del mar (0 m)', () => {
  const sea = { ...territory, minM: 0, maxM: 4080 };

  it('la escala vertical funciona con aMin = 0', () => {
    const m = buildAltitudeProfile(sea, [make('costa', 2), make('cima', 4080)], 'wide');
    const p = VARIANTS.wide;
    expect(m.minLabel.text).toBe('0 m');
    expect(m.maxLabel.text).toBe('4080 m');
    expect(m.points[1]?.y).toBe(p.Pt);
    expect(m.points[0]!.y).toBeLessThan(p.H - p.Pb);
    expect(m.points[0]!.y).toBeGreaterThan(p.H - p.Pb - 2);
    expect(Number.isFinite(m.strata[0]!.height)).toBe(true);
  });
});
