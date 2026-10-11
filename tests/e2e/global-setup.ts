import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { contentRootOf, outDirOf, scenarios, urlOf, type Scenario } from './scenarios';

const astroBin = path.join(process.cwd(), 'node_modules', 'astro', 'bin', 'astro.mjs');
const servers: ChildProcess[] = [];

/**
 * El almacén de contenido de Astro persiste entre construcciones en `node_modules/.astro/` (la caché de
 * `astro build`) y `glob()` no retira las entradas de una raíz anterior: tras cambiar `CONTENT_ROOT`
 * aparecen entradas duplicadas y rutas de otro escenario. Se borra antes de cada construcción y al
 * terminar, para que el siguiente `npm run build` normal tampoco herede contenido de pruebas.
 */
export function clearContentStore(): void {
  for (const target of ['node_modules/.astro/data-store.json', 'node_modules/.astro/data-store']) {
    rmSync(path.join(process.cwd(), target), { recursive: true, force: true });
  }
}

function envFor(scenario: Scenario): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    OUT_DIR: outDirOf(scenario),
    SITE_URL: urlOf(scenario),
  };
  env.CONTENT_ROOT = contentRootOf(scenario);
  return env;
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

/**
 * Construye cada escenario en serie (R11 del plan: compilar varios a la vez comparte el almacén de
 * contenido de Astro) y luego levanta un servidor de vista previa por escenario.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  for (const scenario of scenarios) {
    clearContentStore();
    const args = [astroBin, 'build'];
    if (scenario.mode === 'preview') args.push('--mode', 'preview');
    try {
      execFileSync(process.execPath, args, { env: envFor(scenario), stdio: 'inherit' });
    } finally {
      clearContentStore();
    }
  }

  for (const scenario of scenarios) {
    const server = spawn(
      process.execPath,
      [astroBin, 'preview', '--host', '127.0.0.1', '--port', String(scenario.port)],
      { env: envFor(scenario), stdio: 'ignore' },
    );
    servers.push(server);
  }

  try {
    await Promise.all(scenarios.map((scenario) => waitFor(urlOf(scenario) + '/')));
  } catch (error) {
    for (const server of servers) server.kill();
    throw error;
  }

  return async () => {
    for (const server of servers) server.kill();
    servers.length = 0;
  };
}
