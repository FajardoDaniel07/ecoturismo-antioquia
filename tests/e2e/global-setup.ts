import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import path from 'node:path';
import { contentRootOf, outDirOf, scenarios, urlOf, type Scenario } from './scenarios';

const astroBin = path.join(process.cwd(), 'node_modules', 'astro', 'bin', 'astro.mjs');

/**
 * Cada build usa su propio almacén de contenido (`CACHE_DIR`, dentro de `.tmp/`): así no mezcla entradas
 * de otra raíz de contenido ni toca el de `node_modules/.astro/`, que usan los demás agentes.
 * Astro escribe además `.astro/content-assets.mjs` en el proyecto y eso no se puede aislar sin tocar la
 * configuración: los builds de pruebas van de uno en uno y, si otro build del proyecto los pisa
 * (`LocalImageUsedWrongly`), se repiten.
 */
const COLLISION = /LocalImageUsedWrongly|UnknownFilesystemError|EBUSY|EPERM/;
const MAX_ATTEMPTS = 3;

function cacheDirOf(scenario: Scenario): string {
  return path.join(process.cwd(), '.tmp', 'build-cache', `${scenario.name}-${scenario.port}`);
}

function envFor(scenario: Scenario): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    OUT_DIR: outDirOf(scenario),
    CACHE_DIR: cacheDirOf(scenario),
    SITE_URL: urlOf(scenario),
    CONTENT_ROOT: contentRootOf(scenario),
  };
  // Un NODE_ENV heredado (p. ej. `test`) sacaría a `astro build` del modo de publicación.
  delete env.NODE_ENV;
  return env;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Servidor estático propio de la carpeta construida. `astro preview` solo admite un servidor por
 * proyecto (otro, como el de vista previa del humano, lo bloquea), y aquí hacen falta varios.
 */
function serveFolder(root: string, port: number): Promise<Server> {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) {
      const notFound = path.join(root, '404.html');
      res.writeHead(404, { 'content-type': MIME['.html'] as string });
      res.end(existsSync(notFound) ? readFileSync(notFound) : 'No encontrado');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function waitFor(url: string, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // el servidor aún no escucha
    }
    if (Date.now() > deadline) throw new Error(`El servidor de ${url} no respondió a tiempo.`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

function buildOnce(args: string[], scenario: Scenario) {
  rmSync(cacheDirOf(scenario), { recursive: true, force: true });
  return spawnSync(process.execPath, args, {
    env: envFor(scenario),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

const isCollision = (r: { status: number | null; stdout: string; stderr: string }) =>
  r.status !== 0 && COLLISION.test(`${r.stdout}${r.stderr}`);

export interface ServeOptions {
  /** Si devuelve una carpeta, guarda ahí el registro del build de ese escenario (`build.log`). */
  logDirOf?: (scenario: Scenario) => string | undefined;
}

/**
 * Construye cada escenario en serie (R11 del plan: compilar varios a la vez comparte el almacén de
 * contenido de Astro) y luego sirve cada carpeta construida con un servidor propio. Devuelve la función
 * que los detiene.
 */
export async function serveScenarios(
  list: Scenario[],
  options: ServeOptions = {},
): Promise<() => Promise<void>> {
  const servers: Server[] = [];
  const stop = async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((done) => {
            server.close(() => done());
            server.closeAllConnections();
          }),
      ),
    );
  };

  for (const scenario of list) {
    const args = [astroBin, 'build'];
    if (scenario.mode === 'preview') args.push('--mode', 'preview');
    let result = buildOnce(args, scenario);
    for (let attempt = 1; attempt < MAX_ATTEMPTS && isCollision(result); attempt++) {
      result = buildOnce(args, scenario);
    }
    const output = `${result.stdout}${result.stderr}`;
    process.stdout.write(output);
    const logDir = options.logDirOf?.(scenario);
    if (logDir) {
      mkdirSync(logDir, { recursive: true });
      writeFileSync(path.join(logDir, 'build.log'), output);
    }
    if (result.status !== 0) {
      throw new Error(
        `La construcción del escenario "${scenario.name}" falló (código ${result.status}).`,
      );
    }
  }

  try {
    for (const scenario of list) {
      servers.push(await serveFolder(outDirOf(scenario), scenario.port));
    }
  } catch (error) {
    await stop();
    throw error;
  }

  try {
    await Promise.all(list.map((scenario) => waitFor(urlOf(scenario) + '/')));
  } catch (error) {
    await stop();
    throw error;
  }
  return stop;
}

export default function globalSetup(): Promise<() => Promise<void>> {
  return serveScenarios(scenarios);
}
