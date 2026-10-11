/**
 * Perfil altitudinal del hero (design.md S3, ADR 0010). Función pura: devuelve un modelo de
 * trazados y posiciones; los componentes lo pintan. Las fórmulas siguen S3.4 a S3.8 al pie de la
 * letra; los parámetros son constantes con nombre para poder ajustarlos tras la revisión con
 * capturas (CA-124) sin cambiar la estructura.
 *
 * Medidas en px, origen arriba a la izquierda, `y` crece hacia abajo. Cada variante se calcula
 * para el ancho mínimo de su rango y la figura se estira solo a lo ancho: las posiciones
 * horizontales se expresan también como fracción del ancho.
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
}

export const VARIANTS: Record<ProfileVariantId, VariantParams> = {
  compact: { W: 360, H: 300, Pt: 32, Pb: 32, V: 8, F: 80, maxTerrace: 24, echoes: 2, capacity: 5 },
  medium: {
    W: 704,
    H: 340,
    Pt: 32,
    Pb: 48,
    V: 24,
    F: 120,
    maxTerrace: 40,
    echoes: 3,
    capacity: 11,
  },
  wide: { W: 928, H: 380, Pt: 32, Pb: 48, V: 32, F: 150, maxTerrace: 48, echoes: 3, capacity: 15 },
};

// --- Constantes de S3.5 a S3.7 -----------------------------------------------------------
const ECHO_STEP = 14; // copias de la línea de cumbres desplazadas 14, 28, 42 px
const RISE_C1 = 0.55;
const RISE_C2 = 0.25;
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
const DISC_RADIUS = 8; // disco de 12 px más aro de 2 px
const MIN_STRATUM = 24;
const MIN_SPACING = 44;
const RAIL_WIDTH = 6;
const ZONE_NAME_GAP = 8;
const MIN_LABEL_DROP = 20;
const MAX_LABEL_RISE = 6;
const MAX_LABEL_GAP = 8;

export interface ProfileLabel {
  lines: string[];
  side: 'rock' | 'sky';
  /** Cuánto se alejó del punto (0 a 48 px). */
  offsetY: number;
  /** Línea guía de 1 px entre el punto y la etiqueta (si se alejó más de 12 px). */
  leader: boolean;
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

interface Terrace {
  a: [number, number];
  b: [number, number];
}

/** Línea de cumbres (S3.5), desplazada `dy` px hacia abajo para las curvas de eco. */
function ridge(p: VariantParams, yValle: number, yCumbre: number, terraces: Terrace[], dy = 0) {
  const { W, V, F } = p;
  const xCumbre = W - F;
  const Y = (y: number) => r(y + dy);
  const parts: string[] = [`M0 ${Y(yValle)}`, `L${V} ${Y(yValle)}`];
  let from: [number, number] = [V, yValle];
  for (const t of terraces) {
    const dx = t.a[0] - from[0];
    parts.push(
      `C${r(from[0] + RISE_C1 * dx)} ${Y(from[1])} ${r(t.a[0] - RISE_C2 * dx)} ${Y(t.a[1])} ${r(t.a[0])} ${Y(t.a[1])}`,
      `L${r(t.b[0])} ${Y(t.b[1])}`,
    );
    from = t.b;
  }
  const dx = xCumbre - from[0];
  parts.push(
    `C${r(from[0] + RISE_C1 * dx)} ${Y(from[1])} ${r(xCumbre - SUMMIT_C2_X * dx)} ${Y(yCumbre + SUMMIT_C2_Y * (from[1] - yCumbre))} ${r(xCumbre)} ${Y(yCumbre)}`,
  );
  const endY = yCumbre + FAR_END_DROP * (yValle - yCumbre);
  parts.push(
    `C${r(xCumbre + FAR_C1 * F)} ${Y(yCumbre)} ${r(xCumbre + FAR_C2 * F)} ${Y(endY)} ${W} ${Y(endY)}`,
  );
  return parts.join('');
}

// --- Etiquetas (S3.7) ----------------------------------------------------------------------

interface Rect {
  l: number;
  t: number;
  r: number;
  b: number;
}

const overlaps = (a: Rect, b: Rect) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const inflate = (a: Rect, m: number): Rect => ({ l: a.l - m, t: a.t - m, r: a.r + m, b: a.b + m });
const textWidth = (s: string) => s.length * CHAR_WIDTH;

/** Parte un nombre en dos líneas por el espacio que deja las líneas más parejas. */
function splitInTwo(name: string): string[] | null {
  let best: string[] | null = null;
  let bestWidth = Infinity;
  for (let i = 0; i < name.length; i++) {
    if (name[i] !== ' ') continue;
    const lines = [name.slice(0, i), name.slice(i + 1)];
    const width = Math.max(...lines.map(textWidth));
    if (width < bestWidth) {
      best = lines;
      bestWidth = width;
    }
  }
  return best;
}

interface Candidate {
  side: 'rock' | 'sky';
  lines: string[];
  shift: number;
}

function boxFor(side: 'rock' | 'sky', lines: string[], x: number, y: number, shift: number) {
  const width = Math.max(...lines.map(textWidth));
  const height = lines.length * LINE_HEIGHT;
  const rock = side === 'rock';
  const top = rock ? y + LABEL_GAP_Y + shift : y - LABEL_GAP_Y - height - shift;
  const left = rock ? x - LABEL_GAP_X : x + LABEL_GAP_X - width;
  return { rect: { l: left, t: top, r: left + width, b: top + height }, width, height, top };
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

  const ridgePath = ridge(p, yValle, yCumbre, terraces);
  const farEndY = yCumbre + FAR_END_DROP * (yValle - yCumbre);
  const silhouettePath = `${ridgePath}L${W} ${H}L0 ${H}Z`;
  const echoPaths = Array.from({ length: p.echoes }, (_, i) =>
    ridge(p, yValle, yCumbre, terraces, ECHO_STEP * (i + 1)),
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
      text: zoneName(st.zone),
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

  // Obstáculos fijos: nombres de piso, cifras de altitud y discos de los puntos.
  const textRect = (right: number, baseline: number, text: string): Rect => ({
    l: right - textWidth(text),
    t: baseline - ASCENT,
    r: right,
    b: baseline + DESCENT,
  });
  const obstacles: Rect[] = [
    ...zoneLabels.map((z) => textRect(W - RAIL_WIDTH - ZONE_NAME_GAP, z.baselineY, z.text)),
    { l: 8, t: minLabel.y - ASCENT, r: 8 + textWidth(minText), b: minLabel.y + DESCENT },
    textRect(maxRight, maxLabel.y, maxText),
    ...terraces.map((tr) => {
      const cx = (tr.a[0] + tr.b[0]) / 2;
      return {
        l: cx - DISC_RADIUS,
        t: tr.a[1] - DISC_RADIUS,
        r: cx + DISC_RADIUS,
        b: tr.a[1] + DISC_RADIUS,
      };
    }),
  ];
  const bounds: Rect = { l: 0, t: 0, r: W, b: H };
  const placed: Rect[] = [];

  const points: ProfilePoint[] = shown.map((d, i) => {
    const px = x0 + (i + 1) * s;
    const py = y(d.altitude.meters);
    const pref: 'rock' | 'sky' = px < W / 2 ? 'rock' : 'sky';
    const other: 'rock' | 'sky' = pref === 'rock' ? 'sky' : 'rock';
    const one = [d.name];
    const two = splitInTwo(d.name);
    const lineSets = two ? [one, two] : [one];

    const candidates: Candidate[] = [
      ...lineSets.map((lines) => ({ side: pref, lines, shift: 0 })),
      ...lineSets.map((lines) => ({ side: other, lines, shift: 0 })),
      ...Array.from({ length: LABEL_MAX_SHIFT / LABEL_SHIFT_STEP }, (_, k) => ({
        side: pref,
        lines: two ?? one,
        shift: (k + 1) * LABEL_SHIFT_STEP,
      })),
    ];

    let chosen: { c: Candidate; box: ReturnType<typeof boxFor> } | null = null;
    let last: { c: Candidate; box: ReturnType<typeof boxFor> } | null = null;
    for (const c of candidates) {
      const box = boxFor(c.side, c.lines, px, py, c.shift);
      last = { c, box };
      const inside =
        box.rect.l >= bounds.l &&
        box.rect.r <= bounds.r &&
        box.rect.t >= bounds.t &&
        box.rect.b <= bounds.b;
      const mine = inflate(box.rect, LABEL_MARGIN);
      const free =
        inside &&
        !obstacles.some((o) => overlaps(mine, o)) &&
        !placed.some((o) => overlaps(mine, inflate(o, LABEL_MARGIN)));
      if (free) {
        chosen = { c, box };
        break;
      }
    }
    if (!chosen) {
      chosen = last!;
      warnings.push(
        `Perfil (${variant}): la etiqueta de "${d.name}" no encontró un sitio sin colisiones.`,
      );
    }
    const { c, box } = chosen;
    placed.push(box.rect);
    return {
      id: d.id,
      name: d.name,
      altitudeM: d.altitude.meters,
      href: d.href,
      xFraction: px / W,
      x: r(px),
      y: r(py),
      label: {
        lines: c.lines,
        side: c.side,
        offsetY: c.shift,
        leader: c.shift > LEADER_THRESHOLD,
        align: c.side === 'rock' ? 'left' : 'right',
        dx: c.side === 'rock' ? -LABEL_GAP_X : LABEL_GAP_X,
        top: r(box.top),
        width: r(box.width),
        height: box.height,
      },
    };
  });

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
    omitted: all.length - shown.length,
    warnings,
  };
}
