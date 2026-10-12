/**
 * Orden de la lista de rutas (design.md S9.1, mapa simple): elevación mínima ascendente y, a
 * igualdad, nombre. El mapa simple no usa patrones de trazo, variantes ni letras clave: cada línea
 * lleva el color fuerte de su piso, por clase CSS.
 */
import type { ZoneId } from '../altitude/zones';

interface Orderable {
  zone: ZoneId;
  properties: { name: string; elevation: { minM: number } };
}

const collator = new Intl.Collator('es');

/** Orden de la lista: elevación mínima ascendente y, a igualdad, nombre. */
export function orderRoutes<T extends Orderable>(rutas: readonly T[]): T[] {
  return [...rutas].sort(
    (a, b) =>
      a.properties.elevation.minM - b.properties.elevation.minM ||
      collator.compare(a.properties.name, b.properties.name),
  );
}
