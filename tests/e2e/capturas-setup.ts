import path from 'node:path';
import { serveScenarios } from './global-setup';
import { capturaScenarios, capturasDir } from './scenarios';

/** Construye y sirve los escenarios de las capturas; guarda el registro de cada build junto a ellas. */
export default function capturasSetup(): Promise<() => Promise<void>> {
  return serveScenarios(capturaScenarios, {
    logDirOf: (scenario) => path.join(capturasDir, scenario.name),
  });
}
