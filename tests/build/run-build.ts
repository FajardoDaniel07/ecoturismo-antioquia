/**
 * Construye un escenario de `tests/fixtures/content/` con `astro build` y devuelve el código de salida
 * y lo que imprimió.
 *
 * Los builds se hacen de uno en uno. `CACHE_DIR` aísla el almacén de datos de cada build, pero Astro
 * escribe además `.astro/content-assets.mjs` dentro del proyecto y no hay forma de moverlo sin tocar la
 * configuración: dos builds a la vez, de raíces de contenido distintas (los de otro agente incluidos),
 * pueden leerse el mapa de imágenes y fallar con `LocalImageUsedWrongly`. Se serializan los propios y,
 * si aparece esa colisión (o un `UnknownFilesystemError`), se repite el build: no la causa ningún
 * contenido de prueba.
 */
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const astroBin = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const work = path.join(root, '.tmp', 'build-tests');
const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
/** Firmas de una colisión entre builds simultáneos del mismo proyecto. */
const COLLISION = /LocalImageUsedWrongly|UnknownFilesystemError|EBUSY|EPERM/;
const MAX_ATTEMPTS = 3;

export type Mode = 'preview' | 'release';

export interface BuildOptions {
  /** `undefined`: una dirección https válida. `null`: sin `SITE_URL`. Un texto: ese valor. */
  siteUrl?: string | null;
  /** Distingue dos builds del mismo escenario y modo. */
  variant?: string;
}

export interface BuildResult {
  /** Código de salida; 0 si construyó. En Windows, un fallo puede salir como 1 o como 3221226505. */
  status: number;
  /** stdout y stderr juntos, sin colores. */
  output: string;
  outDir: string;
  /** Cuántas veces se lanzó el build (más de una si hubo colisión con otro build). */
  attempts: number;
  /** Contenido de un archivo construido, o `''` si no existe. */
  read: (relative: string) => string;
  exists: (relative: string) => boolean;
  /** Rutas relativas (con `/`) de todos los `.html` construidos. */
  htmlFiles: () => string[];
}

function once(
  scenario: string,
  mode: Mode,
  options: BuildOptions,
  outDir: string,
  cacheDir: string,
) {
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

  return new Promise<{ status: number; output: string }>((resolve) => {
    execFile(
      process.execPath,
      args,
      { env, maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const status = error ? (typeof error.code === 'number' ? error.code : 1) : 0;
        resolve({ status, output: `${stdout}${stderr}`.replace(ANSI, '') });
      },
    );
  });
}

let queue: Promise<unknown> = Promise.resolve();

/** Construye el escenario cuando no hay otro build de esta suite en marcha. */
export function build(
  scenario: string,
  mode: Mode,
  options: BuildOptions = {},
): Promise<BuildResult> {
  const key = `${scenario}-${mode}${options.variant ? `-${options.variant}` : ''}`;
  const outDir = path.join(work, 'out', key);
  const cacheDir = path.join(work, 'cache', key);

  const job = queue.then(async (): Promise<BuildResult> => {
    let attempts = 0;
    let last = { status: 0, output: '' };
    do {
      attempts += 1;
      last = await once(scenario, mode, options, outDir, cacheDir);
    } while (COLLISION.test(last.output) && attempts < MAX_ATTEMPTS);
    return {
      ...last,
      outDir,
      attempts,
      read: (rel) => {
        const file = path.join(outDir, rel);
        return existsSync(file) ? readFileSync(file, 'utf8') : '';
      },
      exists: (rel) => existsSync(path.join(outDir, rel)),
      htmlFiles: () => listHtml(outDir, ''),
    };
  });
  queue = job.catch(() => undefined);
  return job;
}

function listHtml(dir: string, prefix: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) return name === '_astro' ? [] : listHtml(full, rel);
    return name.endsWith('.html') ? [rel] : [];
  });
}
