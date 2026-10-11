import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { contentRootOf, outDirOf, scenarios, urlOf, type Scenario } from './scenarios';

const astroBin = path.join(process.cwd(), 'node_modules', 'astro', 'bin', 'astro.mjs');
const servers: ChildProcess[] = [];

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
    const args = [astroBin, 'build'];
    if (scenario.mode === 'preview') args.push('--mode', 'preview');
    execFileSync(process.execPath, args, { env: envFor(scenario), stdio: 'inherit' });
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
