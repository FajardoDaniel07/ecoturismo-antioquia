/** Utilidades geográficas de las rutas (CA-76): elevación por punto, distancia y desnivel. */

/** Un punto de GeoJSON: [longitud, latitud] o [longitud, latitud, elevación]. */
export type Coordinate = readonly number[];

const EARTH_RADIUS_KM = 6371;

/** `true` si todos los puntos traen elevación (y hay al menos uno). */
export function hasPointElevation(coords: readonly Coordinate[]): boolean {
  return coords.length > 0 && coords.every((c) => c.length >= 3 && Number.isFinite(c[2]));
}

/** Distancia en km entre dos puntos (fórmula del semiverseno). */
export function haversineKm(a: Coordinate, b: Coordinate): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const [lon1 = 0, lat1 = 0] = a;
  const [lon2 = 0, lat2 = 0] = b;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distancia acumulada en km hasta cada punto; el primero es 0. */
export function cumulativeKm(coords: readonly Coordinate[]): number[] {
  const out: number[] = [];
  let total = 0;
  coords.forEach((c, i) => {
    const prev = coords[i - 1];
    if (prev) total += haversineKm(prev, c);
    out.push(total);
  });
  return out;
}

/** Elevación mínima, máxima y ascenso acumulado (suma de las subidas); `null` sin elevación por punto. */
export function elevationStats(
  coords: readonly Coordinate[],
): { minM: number; maxM: number; ascentM: number } | null {
  if (!hasPointElevation(coords)) return null;
  const heights = coords.map((c) => c[2] as number);
  let ascent = 0;
  for (let i = 1; i < heights.length; i++) {
    const delta = (heights[i] as number) - (heights[i - 1] as number);
    if (delta > 0) ascent += delta;
  }
  return { minM: Math.min(...heights), maxM: Math.max(...heights), ascentM: Math.round(ascent) };
}
