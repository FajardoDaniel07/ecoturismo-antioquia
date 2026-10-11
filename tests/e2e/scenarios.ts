import path from 'node:path';

export type BuildMode = 'preview' | 'release';

export interface Scenario {
  name: string;
  mode: BuildMode;
  port: number;
  /** Carpeta de contenido relativa al proyecto; por defecto `tests/fixtures/content/<nombre>`. */
  contentRoot?: string;
  /** Carpeta de salida absoluta; por defecto `.tmp/e2e/<nombre>`. */
  outDir?: string;
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
  return scenario.outDir ?? path.join(root, '.tmp', 'e2e', scenario.name);
}

/** Raíz del contenido del escenario para `CONTENT_ROOT`: relativa al proyecto y con barras normales. */
export function contentRootOf(scenario: Scenario): string {
  return scenario.contentRoot ?? `tests/fixtures/content/${scenario.name}`;
}

export function urlOf(scenario: Scenario): string {
  return `http://127.0.0.1:${scenario.port}`;
}

export const defaultScenario = scenarios[0];

/** Carpeta estable de las capturas del punto de control CA-124 (T-057). No se versiona (`.tmp/`). */
export const capturasDir = path.join(root, '.tmp', 'capturas', 'ca-124');

/**
 * Escenarios de las capturas: construidos aparte (`npm run test:capturas`), en vista previa y con
 * puertos propios. `real` es el contenido de `src/content`, lo que verá el público.
 */
export const capturaScenarios: Scenario[] = [
  {
    name: 'completo',
    mode: 'preview',
    port: 4411,
    outDir: path.join(root, '.tmp', 'capturas', 'sitio', 'completo'),
  },
  {
    name: 'sin-fotos',
    mode: 'preview',
    port: 4412,
    outDir: path.join(root, '.tmp', 'capturas', 'sitio', 'sin-fotos'),
  },
  {
    name: 'real',
    mode: 'preview',
    port: 4413,
    contentRoot: 'src/content',
    outDir: path.join(root, '.tmp', 'capturas', 'sitio', 'real'),
  },
];
