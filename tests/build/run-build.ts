/**
 * Construye un escenario de `tests/fixtures/content/` con `astro build` y devuelve el código de salida
 * y lo que imprimió. Cada construcción usa su propia carpeta de salida y su propio almacén de contenido
 * (`CACHE_DIR`), así que varias pueden correr a la vez, y a la vez que las de otros agentes, sin mezclarse.
 */
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const astroBin = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const work = path.join(root, '.tmp', 'build-tests');
const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

export type Mode = 'preview' | 'release';

export interface BuildOptions {
  /** `undefined`: una dirección https válida. `null`: sin `SITE_URL`. Un texto: ese valor. */
  siteUrl?: string | null;
}

export interface BuildResult {
  /** Código de salida; 0 si construyó. En Windows, un fallo puede salir como 1 o como 3221226505. */
  status: number;
  /** stdout y stderr juntos, sin colores. */
  output: string;
  outDir: string;
  /** Contenido de `index.html`, o `''` si no se generó. */
  html: string;
}

export function build(
  scenario: string,
  mode: Mode,
  options: BuildOptions = {},
  variant = '',
): Promise<BuildResult> {
  const key = `${scenario}-${mode}${variant ? `-${variant}` : ''}`;
  const outDir = path.join(work, 'out', key);
  const cacheDir = path.join(work, 'cache', key);
  rmSync(outDir, { recursive: true, force: true });
  rmSync(cacheDir, { recursive: true, force: true });

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    CONTENT_ROOT: `tests/fixtures/content/${scenario}`,
    OUT_DIR: outDir,
    CACHE_DIR: cacheDir,
  };
  if (options.siteUrl === null) delete env.SITE_URL;
  else env.SITE_URL = options.siteUrl ?? 'https://fixtures.example';

  const args = [astroBin, 'build'];
  if (mode === 'preview') args.push('--mode', 'preview');

  return new Promise((resolve) => {
    execFile(
      process.execPath,
      args,
      { env, maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const code = error ? (typeof error.code === 'number' ? error.code : 1) : 0;
        const index = path.join(outDir, 'index.html');
        resolve({
          status: code,
          output: `${stdout}${stderr}`.replace(ANSI, ''),
          outDir,
          html: existsSync(index) ? readFileSync(index, 'utf8') : '',
        });
      },
    );
  });
}
