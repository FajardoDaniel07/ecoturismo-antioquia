import { existsSync } from 'node:fs';
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
 * Los demás se añaden aquí cuando existan sus fixtures de contenido en `tests/fixtures/contenido/<nombre>/`.
 * Hoy solo hay la página de plantilla, así que `completo` usa `src/content`.
 */
export const scenarios: Scenario[] = [{ name: 'completo', mode: 'preview', port: 4401 }];

export function outDirOf(scenario: Scenario): string {
  return path.join(root, '.tmp', 'e2e', scenario.name);
}

/** Carpeta de contenido del escenario, o `undefined` si aún no existe (se usa `src/content`). */
export function contentRootOf(scenario: Scenario): string | undefined {
  const dir = path.join(root, 'tests', 'fixtures', 'contenido', scenario.name);
  return existsSync(dir) ? dir : undefined;
}

export function urlOf(scenario: Scenario): string {
  return `http://127.0.0.1:${scenario.port}`;
}

export const defaultScenario = scenarios[0];
