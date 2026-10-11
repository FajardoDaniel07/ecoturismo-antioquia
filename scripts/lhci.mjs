// Lighthouse CI (CA-115, CA-116): construye el sitio en modo vista previa y lo mide en móvil,
// tres pasadas, con el Chromium que ya instaló Playwright. Informe en .tmp/lighthouse/informes/.
// Páginas: sin `url` explícita, LHCI recorre los HTML de la carpeta construida. Cuando existan las
// páginas del plan (inicio, un destino, una página legal), la cobertura sale de esa carpeta.
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
run([astroBin, 'build', '--mode', 'preview'], { OUT_DIR: siteDir });
run([lhciBin, 'autorun', '--config=./lighthouserc.json'], {
  CHROME_PATH: chromium.executablePath(),
});
