import { describe, expect, it } from 'vitest';
import {
  VARIANTS,
  buildAltitudeProfile,
  type ProfileModel,
  type ProfileVariantId,
} from '../../src/lib/altitude/profile';
import { zoneOf } from '../../src/lib/altitude/zones';
import { loadScenario } from './helpers/fixture-profile';

const VARIANT_IDS: ProfileVariantId[] = ['compact', 'medium', 'wide'];
const SCENARIOS = ['academico', 'completo', 'sin-fotos', 'minimo', '@real'] as const;
const CHAR = 0.58 * 14;

interface Rect {
  l: number;
  t: number;
  r: number;
  b: number;
}
const overlaps = (a: Rect, b: Rect) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

/** Rectángulo de una etiqueta, reconstruido solo a partir del modelo. */
function labelRect(m: ProfileModel, i: number): Rect {
  const pt = m.points[i]!;
  const { label } = pt;
  const edge = pt.x + label.dx;
  const l = label.align === 'left' ? edge : edge - label.width;
  return { l, t: label.top, r: l + label.width, b: label.top + label.height };
}

/** Obstáculos fijos reconstruidos del modelo: nombres de piso y cifras de altitud. */
function fixedTexts(m: ProfileModel): Rect[] {
  const text = (right: number, baseline: number, s: string): Rect => ({
    l: right - s.length * CHAR,
    t: baseline - 15,
    r: right,
    b: baseline + 5,
  });
  return [
    ...m.zoneLabels.map((z) => text(m.width - 6 - 8, z.baselineY, z.text)),
    {
      l: m.minLabel.x,
      t: m.minLabel.y - 15,
      r: m.minLabel.x + m.minLabel.text.length * CHAR,
      b: m.minLabel.y + 5,
    },
    text(m.maxLabel.right, m.maxLabel.y, m.maxLabel.text),
  ];
}

const warned = (m: ProfileModel, name: string) => m.warnings.some((w) => w.includes(`"${name}"`));

/** Casos que aún no tienen sitio con las reglas aprobadas R1 a R8 (ver el informe de T-059). */
const OPEN_CASES: Record<string, string[]> = {
  'academico/compact': ['Laguna Espejo Gris'],
  'academico/medium': ['Salto Cinta de Plata'],
  'completo/compact': ['Laguna Espejo Gris'],
  'completo/medium': ['Salto Cinta de Plata'],
  'sin-fotos/compact': ['Páramo de la Bruma Larga'],
};

describe.each(SCENARIOS)('etiquetas del perfil: escenario %s', (scenario) => {
  const { territory, destinos } = loadScenario(scenario);

  it.each(VARIANT_IDS)(
    'variante %s: ninguna etiqueta colocada sale de la figura (R1) ni toca otra, un obstáculo o la línea de cumbres (R8)',
    (variant) => {
      const m = buildAltitudeProfile(territory, destinos, variant);
      const fixed = fixedTexts(m);
      m.points.forEach((pt, i) => {
        if (warned(m, pt.name)) return;
        const rect = labelRect(m, i);
        // R1
        expect(rect.l).toBeGreaterThanOrEqual(0);
        expect(rect.r).toBeLessThanOrEqual(m.width);
        expect(rect.t).toBeGreaterThanOrEqual(0);
        expect(rect.b).toBeLessThanOrEqual(m.height);
        fixed.forEach((o) => expect(overlaps(rect, o)).toBe(false));
        m.points.forEach((other, k) => {
          if (k !== i && !warned(m, other.name)) {
            expect(overlaps(rect, labelRect(m, k))).toBe(false);
          }
        });
        // R8: a 4 px o más de la línea de cumbres (los rótulos al margen están lejos de ella).
        if (!pt.label.margin) {
          const samples = m.ridgeSamples.filter(([x]) => x >= rect.l - 4 && x <= rect.r + 4);
          expect(samples.length).toBeGreaterThan(0);
          for (const [, y] of samples) {
            if (pt.label.side === 'rock') expect(y).toBeLessThanOrEqual(rect.t - 4 + 0.01);
            else expect(y).toBeGreaterThanOrEqual(rect.b + 4 - 0.01);
          }
        }
      });
    },
  );

  it.each(VARIANT_IDS)(
    'variante %s: una guía solo existe con su rótulo completo dentro de la figura y termina tocándolo (R3)',
    (variant) => {
      const m = buildAltitudeProfile(territory, destinos, variant);
      m.points.forEach((pt, i) => {
        const { label } = pt;
        expect(label.leader).toBe(label.guide !== null);
        if (!label.guide) return;
        const rect = labelRect(m, i);
        // El rótulo está completo dentro de la figura.
        expect(rect.l).toBeGreaterThanOrEqual(0);
        expect(rect.r).toBeLessThanOrEqual(m.width);
        expect(rect.t).toBeGreaterThanOrEqual(0);
        expect(rect.b).toBeLessThanOrEqual(m.height);
        // La guía es vertical, a la altura del punto, y su extremo toca el borde del rótulo.
        expect(pt.x).toBeGreaterThanOrEqual(rect.l);
        expect(pt.x).toBeLessThanOrEqual(rect.r);
        const end = label.side === 'rock' ? label.guide.y2 : label.guide.y1;
        const edge = label.side === 'rock' ? rect.t : rect.b;
        expect(end).toBeCloseTo(edge, 1);
        // Una guía nunca atraviesa otra etiqueta.
        const g = {
          l: pt.x - 0.5,
          r: pt.x + 0.5,
          t: Math.min(label.guide.y1, label.guide.y2),
          b: Math.max(label.guide.y1, label.guide.y2),
        };
        m.points.forEach((other, k) => {
          if (k !== i && !warned(m, other.name)) expect(overlaps(g, labelRect(m, k))).toBe(false);
        });
      });
    },
  );

  it.each(VARIANT_IDS)('variante %s: es determinista', (variant) => {
    expect(buildAltitudeProfile(territory, destinos, variant)).toEqual(
      buildAltitudeProfile(territory, destinos, variant),
    );
  });

  it.each(VARIANT_IDS)('variante %s: los avisos son solo los casos abiertos', (variant) => {
    const m = buildAltitudeProfile(territory, destinos, variant);
    const open = OPEN_CASES[`${scenario}/${variant}`] ?? [];
    const names = destinos.map((d) => d.name).filter((n) => warned(m, n));
    expect(names.sort()).toEqual([...open].sort());
    expect(m.warnings).toHaveLength(open.length);
  });
});

describe('reglas de colocación', () => {
  const { territory, destinos } = loadScenario('completo');
  const make = (id: string, name: string, meters: number) => ({
    id,
    name,
    href: `/destinos/${id}/`,
    altitude: { meters, verified: true, source: 'x' },
    zone: zoneOf(meters, territory.thresholds),
    isFeatured: false,
  });

  it('lado preferido: en la roca a la izquierda de la mitad, en el cielo desde la mitad', () => {
    const short = [make('a', 'Alfa', 300), make('b', 'Beta', 1200), make('c', 'Gama', 2400)];
    const m = buildAltitudeProfile(territory, short, 'wide');
    expect(m.points.map((p) => p.label.side)).toEqual(['rock', 'rock', 'sky']);
    for (const pt of m.points) {
      expect(pt.label.offsetY).toBe(0);
      expect(pt.label.margin).toBe(false);
      expect(pt.label.guide).toBeNull();
    }
  });

  it('en la roca: borde izquierdo en x − 6 y borde superior 12 px bajo el punto', () => {
    const m = buildAltitudeProfile(territory, [make('a', 'Alto', 800)], 'wide');
    const pt = m.points[0]!;
    expect(pt.label).toMatchObject({ side: 'rock', align: 'left', dx: -6, offsetY: 0 });
    expect(pt.label.top).toBeCloseTo(pt.y + 12, 1);
  });

  it('en el cielo: borde derecho en x + 6 y borde inferior 12 px sobre el punto', () => {
    const short = [make('a', 'Alfa', 300), make('b', 'Beta', 1200), make('c', 'Gama', 2400)];
    const pt = buildAltitudeProfile(territory, short, 'wide').points[2]!;
    expect(pt.label).toMatchObject({ side: 'sky', align: 'right', dx: 6, offsetY: 0 });
    expect(pt.label.top + pt.label.height).toBeCloseTo(pt.y - 12, 1);
  });

  it('el ancho se estima en 0.58 × 14 px por carácter', () => {
    const m = buildAltitudeProfile(territory, [make('a', 'Cafetal', 800)], 'wide');
    expect(m.points[0]?.label.width).toBeCloseTo(7 * CHAR, 1);
  });

  it('R4: la variante compacta parte un nombre largo en hasta tres líneas', () => {
    const m = buildAltitudeProfile(territory, destinos, 'compact');
    const lines = m.points.map((p) => p.label.lines.length);
    expect(Math.max(...lines)).toBe(3);
    for (const p of m.points) expect(p.label.lines.join(' ')).toBe(p.name);
    // Las otras variantes no pasan de dos líneas.
    for (const v of ['medium', 'wide'] as const) {
      const mm = buildAltitudeProfile(territory, destinos, v);
      expect(Math.max(...mm.points.map((p) => p.label.lines.length))).toBeLessThanOrEqual(2);
    }
  });

  it('opción de alejarse: de 4 en 4 px hasta 48, sin salir de la figura (R1)', () => {
    for (const scenario of SCENARIOS) {
      const loaded = loadScenario(scenario);
      for (const v of VARIANT_IDS) {
        const m = buildAltitudeProfile(loaded.territory, loaded.destinos, v);
        for (const p of m.points) {
          expect(p.label.offsetY % 4).toBe(0);
          expect(p.label.offsetY).toBeLessThanOrEqual(48);
        }
      }
    }
  });

  it('R2: un rótulo al margen va en la franja del cielo o de la base y cubre la vertical de su punto', () => {
    // Ocho destinos con nombres largos: los rótulos normales no caben y algunos van al margen.
    const crowded = [
      ['Piedra del Peñol y Guatapé', 298],
      ['Santa Fe de Antioquia Vieja', 832],
      ['Mirador del Frailejón Perdido', 1374],
      ['Cañón del Río Claro Grande', 1924],
      ['Laguna de los Tres Espejos Grises', 2482],
      ['Bosque de Niebla Serena Alta', 3048],
      ['Piedra del Peñol y Guatapé 2', 3622],
      ['Santa Fe de Antioquia Vieja 2', 704],
    ].map(([name, meters], i) => make(`d${i}`, String(name), Number(meters)));
    const m = buildAltitudeProfile(territory, crowded, 'medium');
    const { Pt, H, Pb } = VARIANTS.medium;
    expect(m.warnings).toEqual([]);
    const margins = m.points.filter((pt) => pt.label.margin);
    expect(margins.length).toBeGreaterThan(0);
    m.points.forEach((pt, i) => {
      if (!pt.label.margin) return;
      const rect = labelRect(m, i);
      if (pt.label.side === 'sky') {
        expect(rect.t).toBeGreaterThanOrEqual(4);
        expect(rect.b).toBeLessThanOrEqual(Pt - 4);
      } else {
        expect(rect.t).toBeGreaterThanOrEqual(H - Pb + 4);
        expect(rect.b).toBeLessThanOrEqual(H - 4);
      }
      expect(pt.x).toBeGreaterThanOrEqual(rect.l);
      expect(pt.x).toBeLessThanOrEqual(rect.r);
      expect(pt.label.guide).not.toBeNull();
    });
  });

  it('R7: cada texto de la figura tiene su zona interrumpida, a 3 px de su caja', () => {
    const m = buildAltitudeProfile(territory, destinos, 'wide');
    // 4 nombres de piso + 2 cifras + 1 etiqueta por destino.
    expect(m.knockouts).toHaveLength(4 + 2 + m.points.length);
    m.points.forEach((pt, i) => {
      const rect = labelRect(m, i);
      const k = m.knockouts[6 + i]!;
      expect(k.top).toBeCloseTo(rect.t - 3, 1);
      expect(k.bottom).toBeCloseTo(rect.b + 3, 1);
      expect(k.left.f * m.width + k.left.px).toBeCloseTo(rect.l - 3, 1);
      expect(k.right.f * m.width + k.right.px).toBeCloseTo(rect.r + 3, 1);
    });
  });

  it('R9: los nombres de piso van con mayúscula inicial', () => {
    const m = buildAltitudeProfile(territory, destinos, 'medium');
    for (const z of m.zoneLabels) expect(z.text[0]).toBe(z.text[0]!.toUpperCase());
  });

  it('un nombre sin espacios no se parte', () => {
    const m = buildAltitudeProfile(territory, [make('x', 'Anchicayá', 1950)], 'wide');
    expect(m.points[0]?.label.lines).toEqual(['Anchicayá']);
  });

  it('caso forzado: sin sitio posible produce un aviso con el nombre del destino', () => {
    const name = 'Un nombre larguísimo sin sitio posible en la variante compacta del perfil';
    const m = buildAltitudeProfile(territory, [make('x', name, 1950)], 'compact');
    expect(m.warnings.some((w) => w.includes(`"${name}"`))).toBe(true);
  });
});
