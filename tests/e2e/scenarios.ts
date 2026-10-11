import path from 'node:path';

export type BuildMode = 'preview' | 'release';

export interface Scenario {
  name: string;
  mode: BuildMode;
  port: number;
}

const root = process.cwd();

/**
 * Escenarios de prueba (plan, "Escenarios de prueba"). Cada uno se construye en su propia carpeta y se
 * sirve en su propio puerto. `completo` es el que usan los proyectos de Playwright por defecto.
 * Su contenido sale de `tests/fixtures/content/<nombre>/`, que genera `scripts/make-fixtures.mjs`.
 * Los `invalido-*` (T-027) se añaden aquí cuando existan.
 */
export const scenarios: Scenario[] = [
  { name: 'completo', mode: 'release', port: 4401 },
  { name: 'minimo', mode: 'preview', port: 4402 },
  { name: 'sin-fotos', mode: 'preview', port: 4403 },
];

export function outDirOf(scenario: Scenario): string {
  return path.join(root, '.tmp', 'e2e', scenario.name);
}

/** Raíz del contenido del escenario para `CONTENT_ROOT`: relativa al proyecto y con barras normales. */
export function contentRootOf(scenario: Scenario): string {
  return `tests/fixtures/content/${scenario.name}`;
}

export function urlOf(scenario: Scenario): string {
  return `http://127.0.0.1:${scenario.port}`;
}

export const defaultScenario = scenarios[0];
