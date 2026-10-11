// Orden de build para Vercel (ADR 0012). Vercel construye con la misma orden la producción y las
// vistas previas; este guion elige según la variable de sistema VERCEL_ENV:
//   production        -> npm run build:release  (compilación de publicación, estricta)
//   cualquier otro    -> npm run build          (vista previa, permisiva y no indexable)
// Sin VERCEL_ENV (en local) construye la vista previa. Con --dry-run solo muestra la orden.
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/** La orden de npm que corresponde a un entorno de Vercel. */
export function chooseScript(vercelEnv) {
  return vercelEnv === 'production' ? 'build:release' : 'build';
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  const env = process.env.VERCEL_ENV;
  const script = chooseScript(env);
  console.log(`[vercel-build] VERCEL_ENV=${env ?? '(sin definir)'} -> npm run ${script}`);
  if (process.argv.includes('--dry-run')) process.exit(0);
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit', shell: true });
  process.exit(result.status ?? 1);
}
