/**
 * Perfil de elevación de una ruta (design.md S9.4, CA-76): distancia en horizontal, elevación en
 * vertical. Solo existe si la ruta tiene elevación por punto; si no, devuelve `null` (sin gráfico
 * ni hueco). Devuelve trazados y textos; el componente los pinta.
 */
import { cumulativeKm, elevationStats, hasPointElevation, type Coordinate } from './geo';

export interface ElevationProfileModel {
  width: number;
  height: number;
  /** Línea de elevación. */
  linePath: string;
  /** Línea cerrada hasta la base (el área inferior, en el tinte del piso). */
  areaPath: string;
  minM: number;
  maxM: number;
  totalKm: number;
  /** Alternativa en texto, visible debajo del gráfico. */
  altText: string;
}

export const PROFILE_WIDTH = 300;
export const PROFILE_HEIGHT = 120;
/** Para no escribir cientos de puntos en el HTML. */
const MAX_POINTS = 120;

const r = (n: number) => Math.round(n * 10) / 10;

export function buildElevationProfile(coords: readonly Coordinate[]): ElevationProfileModel | null {
  const stats = elevationStats(coords);
  if (!stats || !hasPointElevation(coords)) return null;
  const km = cumulativeKm(coords);
  const totalKm = km[km.length - 1] ?? 0;
  if (!(totalKm > 0)) return null;

  const span = stats.maxM - stats.minM;
  const x = (d: number) => (d / totalKm) * PROFILE_WIDTH;
  const y = (m: number) =>
    span === 0 ? PROFILE_HEIGHT / 2 : PROFILE_HEIGHT - ((m - stats.minM) / span) * PROFILE_HEIGHT;

  const step = Math.max(1, Math.ceil(coords.length / MAX_POINTS));
  const indexes = coords.map((_, i) => i).filter((i) => i % step === 0);
  if (indexes[indexes.length - 1] !== coords.length - 1) indexes.push(coords.length - 1);

  const points = indexes.map(
    (i) => `${r(x(km[i] as number))} ${r(y((coords[i] as Coordinate)[2] as number))}`,
  );
  const linePath = `M${points.join('L')}`;
  const areaPath = `${linePath}L${PROFILE_WIDTH} ${PROFILE_HEIGHT}L0 ${PROFILE_HEIGHT}Z`;

  return {
    width: PROFILE_WIDTH,
    height: PROFILE_HEIGHT,
    linePath,
    areaPath,
    minM: stats.minM,
    maxM: stats.maxM,
    totalKm: Math.round(totalKm * 10) / 10,
    altText: `Elevación mínima ${stats.minM} m, máxima ${stats.maxM} m, ${stats.ascentM} m de subida.`,
  };
}
