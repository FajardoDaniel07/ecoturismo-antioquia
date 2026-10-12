// Lighthouse CI (CA-115, CA-116): construye el escenario `academico` en modo de publicación y mide en
// móvil, una pasada, el inicio, un destino con fotos y una página legal, con el Chromium que ya
// instaló Playwright. Sin la auditoría `is-crawlable`: el sitio académico no se indexa a propósito
// (CA-133), y esa auditoría fallaría siempre. Informe en .tmp/lighthouse/informes/.
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const siteDir = path.join(root, '.tmp', 'lighthouse', 'site');
const astroBin = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const lhciBin = path.join(root, 'node_modules', '@lhci', 'cli', 'src', 'cli.js');

function run(args, env = {}) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

rmSync(path.join(root, '.tmp', 'lighthouse'), { recursive: true, force: true });
// NODE_ENV heredado (p. ej. `test`) sacaría a `astro build` del modo de publicación.
delete process.env.NODE_ENV;
run([astroBin, 'build'], {
  OUT_DIR: siteDir,
  CACHE_DIR: path.join(root, '.tmp', 'lighthouse', 'cache'),
  CONTENT_ROOT: 'tests/fixtures/content/academico',
  SITE_URL: 'https://lighthouse.example',
});
run([lhciBin, 'autorun', '--config=./lighthouserc.json'], {
  CHROME_PATH: chromium.executablePath(),
});
