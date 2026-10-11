/**
 * Configuración del mapa (ADR 0006, política de uso de teselas de OpenStreetMap): una sola
 * constante para el proveedor, de modo que cambiarlo es cambiar una línea. Zoom limitado y límites
 * ceñidos a Antioquia para pedir solo las teselas de la vista; sin retina.
 */

/** URL exacta, sin subdominios. */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATTRIBUTION_HREF = 'https://www.openstreetmap.org/copyright';
export const ATTRIBUTION_TEXT = '© colaboradores de OpenStreetMap';

export const MIN_ZOOM = 8;
export const MAX_ZOOM = 16;
export const DETECT_RETINA = false;
/** Margen en px al encuadrar una o todas las rutas. */
export const FIT_PADDING = 32;
/** Pasos de las flechas del teclado, en px. */
export const KEYBOARD_PAN_DELTA = 80;

/** Caja de Antioquia con un margen: [[sur, oeste], [norte, este]]. */
export const MAX_BOUNDS: readonly [readonly [number, number], readonly [number, number]] = [
  [4.8, -77.8],
  [9.5, -73.2],
];

/** Origen (esquema y dominio) de las teselas, para el registro de terceros (CA-135, CA-136). */
export function tileOrigin(): string {
  return new URL(TILE_URL.replace('{z}', '0').replace('{x}', '0').replace('{y}', '0')).origin;
}
