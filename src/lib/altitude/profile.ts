/**
 * Perfil altitudinal del hero (design.md S3 y "Revisión con capturas", R1 a R11; ADR 0010). Función
 * pura: devuelve un modelo de trazados y posiciones; los componentes lo pintan. Los parámetros son
 * constantes con nombre para poder ajustarlos sin cambiar la estructura.
 *
 * Medidas en px, origen arriba a la izquierda, `y` crece hacia abajo. Cada variante se calcula
 * para el ancho mínimo de su rango y la figura se estira solo a lo ancho: las posiciones
 * horizontales se expresan como fracción del ancho más un desplazamiento en px, porque los textos
 * conservan su tamaño real.
 */
import type { Territory } from '../content/schemas';
import type { Destino } from '../content/validate';
import { formatAltitude } from '../format/units';
import { compareByAltitude } from './sort';
import { zoneName, ZONES, type ZoneId } from './zones';

export type ProfileVariantId = 'compact' | 'medium' | 'wide';

export interface VariantParams {
  /** Ancho de cálculo. */
  W: number;
  /** Alto. */
  H: number;
  /** Margen superior. */
  Pt: number;
  /** Base bajo el valle. */
  Pb: number;
  /** Largo del valle. */
  V: number;
  /** Ancho del lado lejano. */
  F: number;
  /** Ancho máximo del rellano. */
  maxTerrace: number;
  echoes: number;
  /** Capacidad sin avisos. */
  capacity: number;
  /** Líneas máximas de una etiqueta (R4: tres en la compacta). */
  maxLines: number;
}

export const VARIANTS: Record<ProfileVariantId, VariantParams> = {
  // R5: márgenes y altos nuevos. R6: rellano máximo de 12 px en la compacta.
  compact: {
    W: 360,
    H: 340,
    Pt: 56,
    Pb: 56,
    V: 8,
    F: 80,
    maxTerrace: 12,
    echoes: 2,
    capacity: 5,
    maxLines: 3,
  },
  medium: {
    W: 704,
    H: 348,
    Pt: 32,
    Pb: 56,
    V: 24,
    F: 120,
    maxTerrace: 40,
    echoes: 3,
    capacity: 11,
    maxLines: 2,
  },
  wide: {
    W: 928,
    H: 380,
    Pt: 32,
    Pb: 48,
    V: 32,
    F: 150,
    maxTerrace: 48,
    echoes: 3,
    capacity: 15,
    maxLines: 2,
  },
};

// --- Constantes de S3.5 a S3.7 y de la revisión ----------------------------------------------
const ECHO_STEP = 14; // copias de la línea de cumbres desplazadas 14, 28, 42 px
const RISE_C1 = 0.55;
const RISE_C2 = 0.25;
const RISE_C2_SHOULDER = 0.25; // R11: la subida llega al rellano con pendiente (hombro)
const SUMMIT_C2_X = 0.12;
const SUMMIT_C2_Y = 0.1;
const FAR_END_DROP = 0.1;
const FAR_C1 = 0.3;
const FAR_C2 = 0.7;

const FONT_SIZE = 14;
const CHAR_WIDTH = 0.58 * FONT_SIZE; // estimación del ancho de un carácter (ADR 0010)
const LINE_HEIGHT = 20; // 14 px × 1.45 (token --text-sm--line-height), redondeado
const ASCENT = 15; // de la línea base al borde superior de un texto de 14 px
const DESCENT = 5;
const LABEL_MARGIN = 4;
const LABEL_GAP_X = 6; // la etiqueta empieza 6 px a un lado del punto
const LABEL_GAP_Y = 12; // y 12 px por encima o por debajo
const LABEL_MAX_SHIFT = 48;
const LABEL_SHIFT_STEP = 4;
const LEADER_THRESHOLD = 12;
const RIDGE_CLEARANCE = 4; // R8: ninguna etiqueta a menos de 4 px de la línea de cumbres
const STRIP_INSET = 4; // R2: franjas de rótulos al margen, a 4 px del borde de la figura
const SLIDE_STEP = 4;
const KNOCKOUT_GAP = 3; // R7: las líneas se interrumpen a 3 px de cada texto
const DISC_RADIUS = 8; // disco de 12 px más aro de 2 px
const MIN_STRATUM = 24;
const MIN_SPACING = 44;
const RAIL_WIDTH = 6;
const ZONE_NAME_GAP = 8;
const MIN_LABEL_DROP = 20;
const MAX_LABEL_RISE = 6;
const MAX_LABEL_GAP = 8;
/** Solo la franja preferida (R2). Con `true` probaría también la otra: no está aprobado. */
const TRY_OTHER_STRIP = false;
const RIDGE_SAMPLES = 24; // puntos por curva al muestrear la línea de cumbres

/** Una posición horizontal: `f` × ancho de la figura + `px`. */
export interface Anchored {
  f: number;
  px: number;
}

/** Zona de una línea que se interrumpe por un texto (R7), en px de la figura de cálculo. */
export interface Knockout {
  left: Anchored;
  right: Anchored;
  top: number;
  bottom: number;
}

export interface ProfileLabel {
  lines: string[];
  side: 'rock' | 'sky';
  /** Cuánto se alejó del punto en vertical (0 a 48 px; en un rótulo al margen, 0). */
  offsetY: number;
  /** R2: rótulo al margen (franja superior o de la base), con guía vertical. */
  margin: boolean;
  /** Línea guía vertical de 1 px entre el punto y la etiqueta; solo existe con el rótulo completo (R3). */
  leader: boolean;
  guide: { y1: number; y2: number } | null;
  /** Borde que ancla la etiqueta: el izquierdo en la roca, el derecho en el cielo. */
  align: 'left' | 'right';
  /** Distancia horizontal del punto a ese borde (px, con signo). */
  dx: number;
  /** Borde superior (px). */
  top: number;
  width: number;
  height: number;
}

export interface ProfilePoint {
  id: string;
  name: string;
  altitudeM: number;
  href: string;
  xFraction: number;
  /** Posición del disco (px). */
  x: number;
  y: number;
  label: ProfileLabel;
}

export interface ProfileModel {
  variant: ProfileVariantId;
  width: number;
  height: number;
  /** Silueta cerrada: línea de cumbres más (W, H) y (0, H). */
  silhouettePath: string;
  /** Solo la línea de cumbres, sin los lados inferior y derecho. */
  ridgePath: string;
  echoPaths: string[];
  /** Un estrato por piso, de su límite superior a su límite inferior. */
  strata: { zone: ZoneId; y: number; height: number }[];
  /** La base bajo el valle, con el tinte del piso más bajo. */
  base: { zone: ZoneId; y: number; height: number };
  /** `y` de los límites entre pisos (T1, T2, T3). */
  boundaries: number[];
  /** Ancho de la franja de piso del borde derecho. */
  railWidth: number;
  /** Tramos de esa franja, recortados por la silueta (que en el borde derecho está a `farEndY`). */
  rails: { zone: ZoneId; y: number; height: number }[];
  /** Altura de la silueta en el borde derecho. */
  farEndY: number;
  zoneLabels: { zone: ZoneId; text: string; baselineY: number }[];
  minLabel: { text: string; x: number; y: number };
  maxLabel: { text: string; xFraction: number; right: number; y: number };
  points: ProfilePoint[];
  /** R7: zonas donde se interrumpen las curvas de eco y los límites (cada texto, más 3 px). */
  knockouts: Knockout[];
  /** Línea de cumbres muestreada, para comprobar distancias (R8). */
  ridgeSamples: [number, number][];
  /** Destinos que esta variante no dibuja (solo la compacta). */
  omitted: number;
  warnings: string[];
}

type ProfileDestino = Pick<Destino, 'id' | 'name' | 'href' | 'altitude' | 'zone' | 'isFeatured'>;

/**
 * Selección de la variante compacta (S3.8, CA-7): el principal de cada piso que tenga destinos
 * (hasta cuatro) y, si quedan fuera, el de mayor altitud entre los no elegidos. Máximo cinco,
 * ordenados por altitud.
 */
export function selectCompactDestinos<T extends ProfileDestino>(destinos: readonly T[]): T[] {
  const chosen = ZONES.flatMap((zone) => {
    const featured = destinos.find((d) => d.zone === zone && d.isFeatured);
    return featured ? [featured] : [];
  });
  const rest = destinos.filter((d) => !chosen.includes(d)).sort(compareByAltitude);
  const highest = rest[rest.length - 1];
  if (highest) chosen.push(highest);
  return chosen.sort(compareByAltitude);
}

// --- Geometría -----------------------------------------------------------------------------

const r = (n: number) => Math.round(n * 100) / 100;
/** Fracciones del ancho: cuatro decimales (a 1280 px, 0.1 px). */
const f4 = (n: number) => Math.round(n * 10000) / 10000;

interface Terrace {
  a: [number, number];
  b: [number, number];
}

type Pt2 = [number, number];
type Segment = { kind: 'L'; to: Pt2 } | { kind: 'C'; c1: Pt2; c2: Pt2; to: Pt2 };

/** Los segmentos de la línea de cumbres (S3.5 con R11), desde (V, yValle) hasta el borde derecho. */
function ridgeSegments(
  p: VariantParams,
  yValle: number,
  yCumbre: number,
  terraces: Terrace[],
): Segment[] {
  const { W, V, F } = p;
  const xCumbre = W - F;
  const segments: Segment[] = [{ kind: 'L', to: [V, yValle] }];
  let from: Pt2 = [V, yValle];
  for (const t of terraces) {
    const dx = t.a[0] - from[0];
    segments.push({
      kind: 'C',
      c1: [from[0] + RISE_C1 * dx, from[1]],
      // R11: llega con pendiente, formando un hombro.
      c2: [t.a[0] - RISE_C2 * dx, t.a[1] + RISE_C2_SHOULDER * (from[1] - t.a[1])],
      to: t.a,
    });
    segments.push({ kind: 'L', to: t.b });
    from = t.b;
  }
  const dx = xCumbre - from[0];
  segments.push({
    kind: 'C',
    c1: [from[0] + RISE_C1 * dx, from[1]],
    c2: [xCumbre - SUMMIT_C2_X * dx, yCumbre + SUMMIT_C2_Y * (from[1] - yCumbre)],
    to: [xCumbre, yCumbre],
  });
  const endY = yCumbre + FAR_END_DROP * (yValle - yCumbre);
  segments.push({
    kind: 'C',
    c1: [xCumbre + FAR_C1 * F, yCumbre],
    c2: [xCumbre + FAR_C2 * F, endY],
    to: [W, endY],
  });
  return segments;
}

/** Trazado SVG de la línea de cumbres, desplazada `dy` px hacia abajo (curvas de eco). */
function ridgePathOf(segments: Segment[], yValle: number, dy = 0): string {
  const Y = (y: number) => r(y + dy);
  const parts = [`M0 ${Y(yValle)}`];
  for (const s of segments) {
    parts.push(
      s.kind === 'L'
        ? `L${r(s.to[0])} ${Y(s.to[1])}`
        : `C${r(s.c1[0])} ${Y(s.c1[1])} ${r(s.c2[0])} ${Y(s.c2[1])} ${r(s.to[0])} ${Y(s.to[1])}`,
    );
  }
  return parts.join('');
}

/** Línea de cumbres muestreada (x creciente). */
function sampleRidge(segments: Segment[], yValle: number): [number, number][] {
  const out: [number, number][] = [[0, yValle]];
  let from: Pt2 = [0, yValle];
  for (const s of segments) {
    if (s.kind === 'L') out.push(s.to);
    else {
      for (let i = 1; i <= RIDGE_SAMPLES; i++) {
        const u = i / RIDGE_SAMPLES;
        const v = 1 - u;
        out.push([
          v ** 3 * from[0] + 3 * v * v * u * s.c1[0] + 3 * v * u * u * s.c2[0] + u ** 3 * s.to[0],
          v ** 3 * from[1] + 3 * v * v * u * s.c1[1] + 3 * v * u * u * s.c2[1] + u ** 3 * s.to[1],
        ]);
      }
    }
    from = s.to;
  }
  return out;
}

/** Altura mínima y máxima de la línea de cumbres en el tramo [x0, x1]. */
function ridgeRange(samples: [number, number][], x0: number, x1: number): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  const at = (x: number): number => {
    for (let i = 1; i < samples.length; i++) {
      const [xa, ya] = samples[i - 1]!;
      const [xb, yb] = samples[i]!;
      if (x <= xb) return xb === xa ? yb : ya + ((x - xa) / (xb - xa)) * (yb - ya);
    }
    return samples[samples.length - 1]![1];
  };
  const xs = [x0, x1, ...samples.map((s) => s[0]).filter((x) => x > x0 && x < x1)];
  for (const x of xs) {
    const y = at(Math.min(Math.max(x, 0), samples[samples.length - 1]![0]));
    min = Math.min(min, y);
    max = Math.max(max, y);
  }
  return [min, max];
}

// --- Etiquetas (S3.7, R1 a R4, R8) ----------------------------------------------------------

interface Rect {
  l: number;
  t: number;
  r: number;
  b: number;
}

const overlaps = (a: Rect, b: Rect) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const inflate = (a: Rect, m: number): Rect => ({ l: a.l - m, t: a.t - m, r: a.r + m, b: a.b + m });
const textWidth = (s: string) => s.length * CHAR_WIDTH;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Parte un nombre en `k` líneas por los espacios, minimizando la línea más ancha; `null` si no se puede. */
function splitInto(name: string, k: number): string[] | null {
  if (k === 1) return [name];
  const words = name.split(' ');
  if (words.length < k) return null;
  let best: string[] | null = null;
  let bestWidth = Infinity;
  const walk = (start: number, parts: string[]) => {
    if (parts.length === k - 1) {
      const lines = [...parts, words.slice(start).join(' ')];
      const width = Math.max(...lines.map(textWidth));
      if (width < bestWidth) {
        best = lines;
        bestWidth = width;
      }
      return;
    }
    for (let end = start + 1; end <= words.length - (k - 1 - parts.length); end++) {
      walk(end, [...parts, words.slice(start, end).join(' ')]);
    }
  };
  walk(0, []);
  return best;
}

interface Candidate {
  side: 'rock' | 'sky';
  lines: string[];
  shift: number;
}

// --- Construcción --------------------------------------------------------------------------

export function buildAltitudeProfile(
  territory: Territory,
  destinos: readonly ProfileDestino[],
  variant: ProfileVariantId,
): ProfileModel {
  const p = VARIANTS[variant];
  const { W, H, Pt, Pb, V, F } = p;
  const { minM: aMin, maxM: aMax, thresholds: th } = territory;
  const T = [th.temperate, th.cold, th.paramo];

  // Datos que el generador rechaza (S3.5).
  if (!(aMin < T[0]! && T[0]! < T[1]! && T[1]! < T[2]! && T[2]! < aMax)) {
    throw new RangeError(
      `Perfil: los umbrales deben cumplir mínima < ${T.join(' < ')} < máxima (${aMin} a ${aMax}).`,
    );
  }
  for (const d of destinos) {
    if (d.altitude.meters < aMin || d.altitude.meters > aMax) {
      throw new RangeError(
        `Perfil: "${d.name}" (${d.altitude.meters} m) está fuera del rango declarado de ${aMin} a ${aMax} m.`,
      );
    }
  }

  const all = [...destinos].sort(compareByAltitude);
  const shown = variant === 'compact' ? selectCompactDestinos(all) : all;
  const n = shown.length;
  const warnings: string[] = [];

  const y = (a: number) => Pt + ((aMax - a) / (aMax - aMin)) * (H - Pt - Pb);
  const yValle = y(aMin);
  const yCumbre = y(aMax);
  const x0 = V;
  const xCumbre = W - F;
  const s = (xCumbre - x0) / (n + 1);
  const t = Math.min(0.5 * s, p.maxTerrace);

  if (n > p.capacity) {
    warnings.push(
      `Perfil (${variant}): ${n} destinos superan la capacidad de ${p.capacity}; las áreas táctiles empiezan a pisarse. Conviene el respaldo de S3.10.`,
    );
  } else if (n > 1 && s < MIN_SPACING) {
    warnings.push(
      `Perfil (${variant}): la separación entre puntos es de ${r(s)} px (mínimo ${MIN_SPACING}).`,
    );
  }

  const terraces: Terrace[] = shown.map((d, i) => {
    const px = x0 + (i + 1) * s;
    const py = y(d.altitude.meters);
    return { a: [px - t / 2, py], b: [px + t / 2, py] };
  });

  const segments = ridgeSegments(p, yValle, yCumbre, terraces);
  const ridgePath = ridgePathOf(segments, yValle);
  const ridgeSamples = sampleRidge(segments, yValle);
  const farEndY = yCumbre + FAR_END_DROP * (yValle - yCumbre);
  const silhouettePath = `${ridgePath}L${W} ${H}L0 ${H}Z`;
  const echoPaths = Array.from({ length: p.echoes }, (_, i) =>
    ridgePathOf(segments, yValle, ECHO_STEP * (i + 1)),
  );

  // Estratos: de y(límite superior) a y(límite inferior).
  const limits = [aMin, ...T, aMax];
  const strata = ZONES.map((zone, i) => {
    const top = y(limits[i + 1]!);
    const bottom = y(limits[i]!);
    return { zone, y: r(top), height: r(bottom - top) };
  });
  const boundaries = T.map((v) => r(y(v)));
  const zoneLabels = strata.map((st) => {
    if (st.height < MIN_STRATUM) {
      warnings.push(
        `Perfil (${variant}): el estrato del piso ${zoneName(st.zone)} mide ${st.height} px y su nombre no cabe (mínimo ${MIN_STRATUM}).`,
      );
    }
    return {
      zone: st.zone,
      // R9: con mayúscula inicial, como fija S3.6.
      text: capitalize(zoneName(st.zone)),
      baselineY: r(st.y + st.height - ZONE_NAME_GAP),
    };
  });

  const minText = formatAltitude(aMin, 'short');
  const maxText = formatAltitude(aMax, 'short');
  const minLabel = { text: minText, x: 8, y: r(yValle + MIN_LABEL_DROP) };
  const maxRight = xCumbre - MAX_LABEL_GAP;
  const maxLabel = {
    text: maxText,
    right: r(maxRight),
    xFraction: maxRight / W,
    y: r(yCumbre - MAX_LABEL_RISE),
  };

  // Cajas de los textos fijos, con su ancla horizontal (para R7, que las interrumpe en cualquier ancho).
  interface TextBox {
    f: number;
    l: number;
    r: number;
    t: number;
    b: number;
  }
  const fixedTexts: TextBox[] = [
    ...zoneLabels.map((z) => {
      const w = textWidth(z.text);
      const right = -(RAIL_WIDTH + ZONE_NAME_GAP);
      return { f: 1, l: right - w, r: right, t: z.baselineY - ASCENT, b: z.baselineY + DESCENT };
    }),
    {
      f: 0,
      l: minLabel.x,
      r: minLabel.x + textWidth(minText),
      t: minLabel.y - ASCENT,
      b: minLabel.y + DESCENT,
    },
    {
      f: maxRight / W,
      l: -textWidth(maxText),
      r: 0,
      t: maxLabel.y - ASCENT,
      b: maxLabel.y + DESCENT,
    },
  ];
  const absRect = (b: TextBox): Rect => ({ l: b.f * W + b.l, r: b.f * W + b.r, t: b.t, b: b.b });

  const discs: Rect[] = terraces.map((tr) => {
    const cx = (tr.a[0] + tr.b[0]) / 2;
    return {
      l: cx - DISC_RADIUS,
      t: tr.a[1] - DISC_RADIUS,
      r: cx + DISC_RADIUS,
      b: tr.a[1] + DISC_RADIUS,
    };
  });
  const fixed: Rect[] = [...fixedTexts.map(absRect), ...discs];
  const bounds: Rect = { l: 0, t: 0, r: W, b: H };
  const placed: Rect[] = [];
  const guides: Rect[] = [];
  const labelTexts: TextBox[] = [];

  const insideFigure = (b: Rect) =>
    b.l >= bounds.l && b.r <= bounds.r && b.t >= bounds.t && b.b <= bounds.b;
  /** `true` si el rectángulo (con su margen) no toca ningún obstáculo: textos fijos, discos, etiquetas y guías ya colocados. */
  const isFree = (b: Rect, ownDisc: Rect) =>
    insideFigure(b) &&
    !fixed.some((o) => o !== ownDisc && overlaps(inflate(b, LABEL_MARGIN), o)) &&
    !placed.some((o) => overlaps(inflate(b, LABEL_MARGIN), inflate(o, LABEL_MARGIN))) &&
    !guides.some((g) => overlaps(inflate(b, LABEL_MARGIN), g));
  /** R8: ninguna etiqueta a menos de 4 px de la línea de cumbres. */
  const clearOfRidge = (b: Rect, side: 'rock' | 'sky') => {
    const [min, max] = ridgeRange(ridgeSamples, b.l - RIDGE_CLEARANCE, b.r + RIDGE_CLEARANCE);
    return side === 'rock' ? max <= b.t - RIDGE_CLEARANCE : min >= b.b + RIDGE_CLEARANCE;
  };
  /** Una guía vertical solo es válida si no cruza obstáculos ni otras etiquetas. */
  const guideFree = (gx: number, y1: number, y2: number, ownDisc: Rect) => {
    const g: Rect = { l: gx - 0.5, r: gx + 0.5, t: Math.min(y1, y2), b: Math.max(y1, y2) };
    return (
      !fixed.some((o) => o !== ownDisc && overlaps(g, o)) &&
      !placed.some((o) => overlaps(g, inflate(o, 2)))
    );
  };

  const points: ProfilePoint[] = shown.map((d, i) => {
    const px = x0 + (i + 1) * s;
    const py = y(d.altitude.meters);
    const ownDisc = discs[i]!;
    const pref: 'rock' | 'sky' = px < W / 2 ? 'rock' : 'sky';
    const other: 'rock' | 'sky' = pref === 'rock' ? 'sky' : 'rock';

    const lineSets = (): string[][] => {
      const sets: string[][] = [];
      for (let k = 1; k <= p.maxLines; k++) {
        const lines = splitInto(d.name, k);
        if (lines) sets.push(lines);
      }
      return sets;
    };
    const sets = lineSets();
    const longest = sets[sets.length - 1]!;

    // Pasos 1 a 3 de S3.7 (con R4: hasta `maxLines` líneas) y paso 4 (alejarse, sin salir: R1).
    const candidates: Candidate[] = [
      ...sets.map((lines) => ({ side: pref, lines, shift: 0 })),
      ...sets.map((lines) => ({ side: other, lines, shift: 0 })),
      ...Array.from({ length: LABEL_MAX_SHIFT / LABEL_SHIFT_STEP }, (_, k) => ({
        side: pref,
        lines: longest,
        shift: (k + 1) * LABEL_SHIFT_STEP,
      })),
    ];

    const boxOf = (c: Candidate) => {
      const width = Math.max(...c.lines.map(textWidth));
      const height = c.lines.length * LINE_HEIGHT;
      const rock = c.side === 'rock';
      const top = rock ? py + LABEL_GAP_Y + c.shift : py - LABEL_GAP_Y - height - c.shift;
      const left = rock ? px - LABEL_GAP_X : px + LABEL_GAP_X - width;
      return { rect: { l: left, t: top, r: left + width, b: top + height }, width, height, top };
    };

    interface Placement {
      lines: string[];
      side: 'rock' | 'sky';
      shift: number;
      margin: boolean;
      rect: Rect;
      width: number;
      height: number;
      top: number;
      align: 'left' | 'right';
      dx: number;
      guide: { y1: number; y2: number } | null;
    }
    let chosen: Placement | null = null;

    for (const c of candidates) {
      const box = boxOf(c);
      if (!isFree(box.rect, ownDisc) || !clearOfRidge(box.rect, c.side)) continue;
      let guide: Placement['guide'] = null;
      if (c.shift > LEADER_THRESHOLD) {
        // R3: la guía va del punto al borde del rótulo y solo se dibuja si no cruza nada.
        const y1 = c.side === 'rock' ? py + DISC_RADIUS : box.rect.b;
        const y2 = c.side === 'rock' ? box.rect.t : py - DISC_RADIUS;
        if (!guideFree(px, y1, y2, ownDisc)) continue;
        guide = { y1, y2 };
      }
      chosen = {
        lines: c.lines,
        side: c.side,
        shift: c.shift,
        margin: false,
        rect: box.rect,
        width: box.width,
        height: box.height,
        top: box.top,
        align: c.side === 'rock' ? 'left' : 'right',
        dx: c.side === 'rock' ? -LABEL_GAP_X : LABEL_GAP_X,
        guide,
      };
      break;
    }

    // Paso 5 (R2): rótulo al margen, en la franja del cielo o de la base, con guía vertical.
    for (const strip of TRY_OTHER_STRIP ? [pref, other] : [pref]) {
      if (chosen) break;
      const stripTop = strip === 'sky' ? STRIP_INSET : yValle + STRIP_INSET;
      const stripBottom = strip === 'sky' ? Pt - STRIP_INSET : H - STRIP_INSET;
      for (const lines of sets) {
        const height = lines.length * LINE_HEIGHT;
        if (height > stripBottom - stripTop) continue;
        const width = Math.max(...lines.map(textWidth));
        const top = strip === 'sky' ? stripTop : stripBottom - height;
        const preferred = strip === 'rock' ? px - LABEL_GAP_X : px + LABEL_GAP_X - width;
        // Se desliza en horizontal sin dejar de cubrir la vertical del punto ni salir de la figura.
        const lo = Math.max(0, px - width);
        const hi = Math.min(W - width, px);
        const lefts: number[] = [];
        for (let l = lo; l <= hi; l += SLIDE_STEP) lefts.push(l);
        lefts.push(hi);
        lefts.sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
        for (const left of lefts) {
          const rect: Rect = { l: left, t: top, r: left + width, b: top + height };
          if (!isFree(rect, ownDisc)) continue;
          const y1 = strip === 'sky' ? rect.b : py + DISC_RADIUS;
          const y2 = strip === 'sky' ? py - DISC_RADIUS : rect.t;
          if (!guideFree(px, y1, y2, ownDisc)) continue;
          chosen = {
            lines,
            side: strip,
            shift: 0,
            margin: true,
            rect,
            width,
            height,
            top,
            align: 'left',
            dx: left - px,
            guide: { y1, y2 },
          };
          break;
        }
        if (chosen) break;
      }
    }

    // R10: si ni el rótulo al margen encuentra sitio, se avisa. La etiqueta queda en su posición
    // preferida, de una línea, recortada a la figura.
    if (!chosen) {
      warnings.push(
        `Perfil (${variant}): la etiqueta de "${d.name}" no encontró un sitio sin colisiones.`,
      );
      const c: Candidate = { side: pref, lines: [d.name], shift: 0 };
      const box = boxOf(c);
      chosen = {
        lines: c.lines,
        side: pref,
        shift: 0,
        margin: false,
        rect: box.rect,
        width: box.width,
        height: box.height,
        top: box.top,
        align: pref === 'rock' ? 'left' : 'right',
        dx: pref === 'rock' ? -LABEL_GAP_X : LABEL_GAP_X,
        guide: null,
      };
    }

    placed.push(chosen.rect);
    if (chosen.guide) {
      guides.push({
        l: px - 0.5,
        r: px + 0.5,
        t: Math.min(chosen.guide.y1, chosen.guide.y2),
        b: Math.max(chosen.guide.y1, chosen.guide.y2),
      });
    }
    labelTexts.push({
      f: px / W,
      l: chosen.rect.l - px,
      r: chosen.rect.r - px,
      t: chosen.rect.t,
      b: chosen.rect.b,
    });

    return {
      id: d.id,
      name: d.name,
      altitudeM: d.altitude.meters,
      href: d.href,
      xFraction: px / W,
      x: r(px),
      y: r(py),
      label: {
        lines: chosen.lines,
        side: chosen.side,
        offsetY: chosen.shift,
        margin: chosen.margin,
        leader: chosen.guide !== null,
        guide: chosen.guide ? { y1: r(chosen.guide.y1), y2: r(chosen.guide.y2) } : null,
        align: chosen.align,
        dx: r(chosen.dx),
        top: r(chosen.top),
        width: r(chosen.width),
        height: chosen.height,
      },
    };
  });

  // R7: las curvas de eco y los límites se interrumpen a 3 px de cada texto de la figura.
  const knockouts: Knockout[] = [...fixedTexts, ...labelTexts].map((b) => ({
    left: { f: f4(b.f), px: r(b.l - KNOCKOUT_GAP) },
    right: { f: f4(b.f), px: r(b.r + KNOCKOUT_GAP) },
    top: r(b.t - KNOCKOUT_GAP),
    bottom: r(b.b + KNOCKOUT_GAP),
  }));

  return {
    variant,
    width: W,
    height: H,
    silhouettePath,
    ridgePath,
    echoPaths,
    strata,
    base: { zone: 'warm', y: r(yValle), height: r(H - yValle) },
    boundaries,
    railWidth: RAIL_WIDTH,
    rails: strata.flatMap((st) => {
      const top = Math.max(st.y, farEndY);
      const height = r(st.y + st.height - top);
      return height > 0 ? [{ zone: st.zone, y: r(top), height }] : [];
    }),
    farEndY: r(farEndY),
    zoneLabels,
    minLabel,
    maxLabel,
    points,
    knockouts,
    ridgeSamples: ridgeSamples.map(([x, yy]) => [r(x), r(yy)]),
    omitted: all.length - shown.length,
    warnings,
  };
}
