import { describe, expect, it } from 'vitest';
import {
  VARIANTS,
  buildAltitudeProfile,
  type ProfileModel,
  type ProfileVariantId,
} from '../../src/lib/altitude/profile';
import { zoneOf } from '../../src/lib/altitude/zones';
import { loadScenario } from './helpers/fixture-profile';

const { territory, destinos } = loadScenario('completo');
const VARIANT_IDS: ProfileVariantId[] = ['compact', 'medium', 'wide'];
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
function obstacles(m: ProfileModel): Rect[] {
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

const make = (id: string, name: string, meters: number) => ({
  id,
  name,
  href: `/destinos/${id}/`,
  altitude: { meters, verified: true, source: 'x' },
  zone: zoneOf(meters, territory.thresholds),
  isFeatured: false,
});

const warned = (m: ProfileModel, name: string) => m.warnings.some((w) => w.includes(`"${name}"`));

describe('etiquetas del perfil con el escenario completo (S3.7, CA-5, CA-6)', () => {
  it.each(VARIANT_IDS)(
    'variante %s: las etiquetas colocadas no se solapan entre sí ni con un obstáculo',
    (variant) => {
      const m = buildAltitudeProfile(territory, destinos, variant);
      const fixed = obstacles(m);
      m.points.forEach((pt, i) => {
        if (warned(m, pt.name)) return;
        const rect = labelRect(m, i);
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
      });
    },
  );

  it('los avisos del escenario completo son los de la lectura literal de S3.7', () => {
    // Hallazgo para la revisión (CA-124): con estos datos el procedimiento literal no encuentra
    // sitio para algunas etiquetas de las variantes compacta y media; la amplia no avisa.
    const names = (v: ProfileVariantId) =>
      destinos
        .map((d) => d.name)
        .filter((n) => warned(buildAltitudeProfile(territory, destinos, v), n))
        .sort();
    expect(names('compact')).toEqual(['Cañón del Sol Quieto', 'Laguna Espejo Gris']);
    expect(names('medium')).toEqual(['Salto Cinta de Plata']);
    expect(names('wide')).toEqual([]);
  });

  it('un nombre sin sitio no se trunca ni se oculta: queda y avisa con el nombre del destino', () => {
    const m = buildAltitudeProfile(territory, destinos, 'compact');
    const point = m.points.find((p) => p.name === 'Cañón del Sol Quieto');
    expect(point?.label.lines.join(' ')).toBe('Cañón del Sol Quieto');
    expect(m.warnings.some((w) => w.includes('"Cañón del Sol Quieto"'))).toBe(true);
  });
});

describe('reglas de colocación (S3.7)', () => {
  it('lado preferido: en la roca a la izquierda de la mitad, en el cielo desde la mitad', () => {
    const short = [make('a', 'Alfa', 300), make('b', 'Beta', 1200), make('c', 'Gama', 2400)];
    const m = buildAltitudeProfile(territory, short, 'wide');
    expect(m.points.map((p) => p.label.side)).toEqual(['rock', 'rock', 'sky']);
    for (const pt of m.points) {
      expect(pt.label.side).toBe(pt.x < m.width / 2 ? 'rock' : 'sky');
      expect(pt.label.offsetY).toBe(0);
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

  it('opción 2: parte el nombre en dos líneas por un espacio cuando en una no cabe', () => {
    // Cinco puntos pegados en la compacta obligan a partir los nombres largos.
    const m = buildAltitudeProfile(territory, destinos, 'compact');
    const split = m.points.find((p) => p.label.lines.length === 2);
    expect(split).toBeDefined();
    expect(split?.label.lines.join(' ')).toBe(split?.name);
  });

  it('opción 3: prueba la otra posición antes de alejar la etiqueta', () => {
    const m = buildAltitudeProfile(territory, destinos, 'medium');
    const flipped = m.points.filter((p) => p.label.side !== (p.x < m.width / 2 ? 'rock' : 'sky'));
    expect(flipped.length).toBeGreaterThan(0);
    flipped.forEach((p) => expect(p.label.offsetY).toBe(0));
  });

  it('opción 4: se aleja de 4 en 4 px hasta 48 y pone línea guía si pasa de 12', () => {
    const crowded = [
      'Mirador del Frailejón Perdido',
      'Laguna Espejo Gris',
      'Bosque de Niebla Serena',
      'Cafetal de la Loma Alta',
      'Salto Cinta de Plata',
    ].map((name, i) => make(`d${i}`, name, 1500));
    const m = buildAltitudeProfile(territory, crowded, 'medium');
    const shifted = m.points.filter((p) => p.label.offsetY > 0);
    expect(shifted.length).toBeGreaterThan(0);
    expect(shifted.some((p) => p.label.leader)).toBe(true);
    for (const p of m.points) {
      expect(p.label.offsetY % 4).toBe(0);
      expect(p.label.offsetY).toBeLessThanOrEqual(48);
      expect(p.label.leader).toBe(p.label.offsetY > 12);
    }
  });

  it('caso forzado: sin sitio posible produce un aviso con el nombre del destino', () => {
    const name = 'Un nombre larguísimo que no cabe en ninguna posición del perfil compacto';
    const m = buildAltitudeProfile(territory, [make('x', name, 1950)], 'compact');
    expect(m.warnings).toHaveLength(1);
    expect(m.warnings[0]).toContain(`"${name}"`);
    expect(m.points[0]?.label.lines.join(' ')).toBe(name);
  });

  it('un nombre sin espacios no se parte', () => {
    const m = buildAltitudeProfile(territory, [make('x', 'Anchicayá', 1950)], 'wide');
    expect(m.points[0]?.label.lines).toEqual(['Anchicayá']);
  });

  it('cada variante usa su propio alto de línea sin salirse de la figura', () => {
    for (const v of VARIANT_IDS) {
      const m = buildAltitudeProfile(territory, destinos, v);
      expect(m.height).toBe(VARIANTS[v].H);
    }
  });
});
