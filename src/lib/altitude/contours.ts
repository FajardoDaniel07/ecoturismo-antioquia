/**
 * Curvas de nivel de las cuatro láminas de altitud (design.md S6.3, CA-39, ADR 0010).
 * Cada lámina son las curvas de nivel de una función de altura `h(x, y)` sobre un lienzo de
 * 300 × 200 unidades, evaluada en una retícula de 4 unidades (marching squares con
 * interpolación lineal). Sin azar: los mismos parámetros dan siempre el mismo dibujo.
 * Los parámetros de las funciones son constantes con nombre para poder ajustarlos tras la
 * revisión con capturas (CA-124) sin tocar la estructura.
 */
import type { ZoneId } from './zones';

export const PLATE_WIDTH = 300;
export const PLATE_HEIGHT = 200;
export const GRID_STEP = 2; // R13: retícula de 2 unidades

export interface ContourCurve {
  /** Trazado SVG de todas las líneas de este nivel. */
  d: string;
  /** Curva maestra: se dibuja en el color fuerte del piso. */
  master: boolean;
  level: number;
}

export interface ContourPlate {
  zone: ZoneId;
  viewBox: [number, number];
  curves: ContourCurve[];
}

type HeightFn = (x: number, y: number) => number;

const TAU = 2 * Math.PI;

interface Relief {
  h: HeightFn;
  levels: number[];
  masters: number[];
}

const range = (from: number, to: number, step: number): number[] => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(v);
  return out;
};

// --- Cálido: cañón, un río sinuoso entre dos paredes ---------------------------------------
const WARM = { base: 100, amp1: 34, period1: 300, phase1: 0.6, amp2: 10, period2: 110, scale: 38 };
const warmAxis = (x: number): number =>
  WARM.base +
  WARM.amp1 * Math.sin((TAU * x) / WARM.period1 + WARM.phase1) +
  WARM.amp2 * Math.sin((TAU * x) / WARM.period2);

// --- Templado: tres colinas redondeadas -----------------------------------------------------
// (cx, cy, sx, sy, A)
const HILLS: readonly (readonly [number, number, number, number, number])[] = [
  [78, 128, 52, 40, 70],
  [196, 74, 44, 34, 60],
  [262, 150, 30, 26, 55], // R15: tercera colina con A = 55
];

// --- Frío: ladera con quebradas -----------------------------------------------------------
const COLD = {
  slopeY: 0.45,
  slopeX: 0.03,
  // R14: ondas más largas (la de periodo 23 era demasiado corta para la retícula).
  amp1: 6,
  period1: 90,
  phase1: 0.3,
  amp2: 2.5,
  period2: 41,
  phase2: 1.1,
};

// --- Páramo: altiplano con dos lagunas ------------------------------------------------------
const PARAMO = {
  base: 50,
  slopeX: 0.06,
  slopeY: 0.05,
  swell: 6,
  swellPeriodX: 260,
  swellPhase: 1,
  swellPeriodY: 190,
  lakes: [
    [92, 70, 392],
    [214, 132, 200],
  ] as const,
  lakeDepth: 14,
};

const RELIEFS: Record<ZoneId, Relief> = {
  warm: {
    h: (x, y) => 100 * (1 - Math.exp(-Math.abs(y - warmAxis(x)) / WARM.scale)),
    levels: range(10, 90, 10),
    masters: [50],
  },
  temperate: {
    h: (x, y) =>
      0.05 * x +
      HILLS.reduce(
        (sum, [cx, cy, sx, sy, a]) =>
          sum + a * Math.exp(-((x - cx) ** 2 / (2 * sx ** 2) + (y - cy) ** 2 / (2 * sy ** 2))),
        0,
      ),
    // R15: más anillos por loma y más curvas maestras en color fuerte.
    levels: range(6, 84, 6),
    masters: [18, 36, 54, 72],
  },
  cold: {
    h: (x, y) =>
      COLD.slopeY * (200 - y) +
      COLD.slopeX * x +
      COLD.amp1 * Math.sin((TAU * x) / COLD.period1 + COLD.phase1) +
      COLD.amp2 * Math.sin((TAU * x) / COLD.period2 + COLD.phase2),
    levels: range(6, 96, 6),
    masters: [30, 60, 90],
  },
  paramo: {
    h: (x, y) =>
      PARAMO.base +
      PARAMO.slopeX * x -
      PARAMO.slopeY * y +
      PARAMO.swell *
        Math.sin((TAU * x) / PARAMO.swellPeriodX + PARAMO.swellPhase) *
        Math.cos((TAU * y) / PARAMO.swellPeriodY) -
      PARAMO.lakes.reduce(
        (sum, [cx, cy, d2]) =>
          sum + PARAMO.lakeDepth * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / d2),
        0,
      ),
    levels: range(30, 70, 5),
    masters: [50],
  },
};

type Point = readonly [number, number];
type Segment = readonly [Point, Point];

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Segmentos de la curva de un nivel, celda por celda (marching squares). */
function levelSegments(grid: number[][], level: number): Segment[] {
  const segments: Segment[] = [];
  const cols = grid[0]?.length ?? 0;
  for (let j = 0; j < grid.length - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const tl = grid[j]![i]!;
      const tr = grid[j]![i + 1]!;
      const br = grid[j + 1]![i + 1]!;
      const bl = grid[j + 1]![i]!;
      const x0 = i * GRID_STEP;
      const y0 = j * GRID_STEP;
      const lerp = (a: number, b: number) => (level - a) / (b - a);
      // Puntos de cruce en los cuatro bordes de la celda.
      const top: Point = [x0 + lerp(tl, tr) * GRID_STEP, y0];
      const right: Point = [x0 + GRID_STEP, y0 + lerp(tr, br) * GRID_STEP];
      const bottom: Point = [x0 + lerp(bl, br) * GRID_STEP, y0 + GRID_STEP];
      const left: Point = [x0, y0 + lerp(tl, bl) * GRID_STEP];

      const code =
        (tl >= level ? 8 : 0) |
        (tr >= level ? 4 : 0) |
        (br >= level ? 2 : 0) |
        (bl >= level ? 1 : 0);
      const center = (tl + tr + br + bl) / 4;
      switch (code) {
        case 1:
        case 14:
          segments.push([left, bottom]);
          break;
        case 2:
        case 13:
          segments.push([bottom, right]);
          break;
        case 3:
        case 12:
          segments.push([left, right]);
          break;
        case 4:
        case 11:
          segments.push([top, right]);
          break;
        case 6:
        case 9:
          segments.push([top, bottom]);
          break;
        case 7:
        case 8:
          segments.push([left, top]);
          break;
        case 5: // tr y bl por encima: la silla se resuelve con el valor del centro
          if (center >= level) segments.push([left, top], [bottom, right]);
          else segments.push([left, bottom], [top, right]);
          break;
        case 10: // tl y br por encima
          if (center >= level) segments.push([left, bottom], [top, right]);
          else segments.push([left, top], [bottom, right]);
          break;
        default:
          break;
      }
    }
  }
  return segments;
}

const key = (p: Point) => `${round1(p[0])},${round1(p[1])}`;

/** Distancia de un punto a la recta que une `a` y `b`. */
function distanceToLine(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

/** Douglas-Peucker: quita los puntos que no cambian la forma más de `epsilon` unidades. */
function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distanceToLine(points[i]!, first, last);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= epsilon) return [first, last];
  return [
    ...simplify(points.slice(0, index + 1), epsilon).slice(0, -1),
    ...simplify(points.slice(index), epsilon),
  ];
}

const SIMPLIFY_EPSILON = 0.7;
const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const fmt = (p: Point) => `${round1(p[0])} ${round1(p[1])}`;

/**
 * R13: curva suave que pasa cerca de los puntos, sin esquinas. Cada punto es el punto de control
 * de una curva cuadrática que va de un punto medio al siguiente; las curvas cerradas se cierran.
 */
function smoothLine(line: Point[]): string {
  const closed = line.length > 3 && key(line[0]!) === key(line[line.length - 1]!);
  const pts = simplify(closed ? line.slice(0, -1).concat([line[0]!]) : line, SIMPLIFY_EPSILON);
  if (pts.length < 3) return pts.map((p, n) => `${n === 0 ? 'M' : 'L'}${fmt(p)}`).join('');
  if (closed) {
    const ring = pts.slice(0, -1);
    const m = ring.length;
    const parts = [`M${fmt(mid(ring[m - 1]!, ring[0]!))}`];
    for (let i = 0; i < m; i++) {
      parts.push(`Q${fmt(ring[i]!)} ${fmt(mid(ring[i]!, ring[(i + 1) % m]!))}`);
    }
    return `${parts.join('')}Z`;
  }
  const parts = [`M${fmt(pts[0]!)}`, `L${fmt(mid(pts[0]!, pts[1]!))}`];
  for (let i = 1; i < pts.length - 1; i++) {
    parts.push(`Q${fmt(pts[i]!)} ${fmt(mid(pts[i]!, pts[i + 1]!))}`);
  }
  parts.push(`L${fmt(pts[pts.length - 1]!)}`);
  return parts.join('');
}

/** Une los segmentos que comparten extremo en líneas continuas, y devuelve el trazado SVG suavizado. */
function toPath(segments: Segment[]): string {
  const byEnd = new Map<string, number[]>();
  segments.forEach((s, idx) => {
    for (const p of s) {
      const k = key(p);
      byEnd.set(k, [...(byEnd.get(k) ?? []), idx]);
    }
  });
  const used = new Set<number>();
  const take = (k: string): number | undefined => byEnd.get(k)?.find((idx) => !used.has(idx));

  const commands: string[] = [];
  for (let start = 0; start < segments.length; start++) {
    if (used.has(start)) continue;
    used.add(start);
    const seg = segments[start]!;
    const line: Point[] = [seg[0], seg[1]];
    for (const grow of ['tail', 'head'] as const) {
      for (;;) {
        const end = grow === 'tail' ? line[line.length - 1]! : line[0]!;
        const next = take(key(end));
        if (next === undefined) break;
        used.add(next);
        const s = segments[next]!;
        const other = key(s[0]) === key(end) ? s[1] : s[0];
        if (grow === 'tail') line.push(other);
        else line.unshift(other);
      }
    }
    commands.push(smoothLine(line));
  }
  return commands.join('');
}

/** Dibujo determinista de la lámina de un piso: mismas entradas, mismo resultado. */
export function buildContourPlate(zone: ZoneId): ContourPlate {
  const relief = RELIEFS[zone];
  const cols = PLATE_WIDTH / GRID_STEP + 1;
  const rows = PLATE_HEIGHT / GRID_STEP + 1;
  const grid: number[][] = Array.from({ length: rows }, (_, j) =>
    Array.from({ length: cols }, (_, i) => relief.h(i * GRID_STEP, j * GRID_STEP)),
  );
  const curves = relief.levels
    .map((level) => ({
      d: toPath(levelSegments(grid, level)),
      master: relief.masters.includes(level),
      level,
    }))
    .filter((c) => c.d !== '');
  return { zone, viewBox: [PLATE_WIDTH, PLATE_HEIGHT], curves };
}
