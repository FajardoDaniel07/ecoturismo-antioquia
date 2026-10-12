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

/**
 * Dirección pública para la compilación de publicación. Manda SITE_URL si está definida en el
 * proyecto; si no, se usa el dominio de producción que Vercel expone como variable de sistema
 * (VERCEL_PROJECT_PRODUCTION_URL, sin protocolo). Sin ninguna de las dos devuelve undefined y la
 * puerta de publicación falla con su mensaje (CA-139).
 */
export function resolveSiteUrl(env) {
  if (env.SITE_URL) return env.SITE_URL;
  const domain = env.VERCEL_PROJECT_PRODUCTION_URL;
  return domain ? `https://${domain}` : undefined;
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  const env = process.env.VERCEL_ENV;
  const script = chooseScript(env);
  console.log(`[vercel-build] VERCEL_ENV=${env ?? '(sin definir)'} -> npm run ${script}`);
  if (env === 'production') {
    const siteUrl = resolveSiteUrl(process.env);
    if (siteUrl && !process.env.SITE_URL) {
      process.env.SITE_URL = siteUrl;
      console.log(
        `[vercel-build] SITE_URL sin definir: se usa el dominio de producción ${siteUrl}`,
      );
    }
  }
  if (process.argv.includes('--dry-run')) process.exit(0);
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit', shell: true });
  process.exit(result.status ?? 1);
}
