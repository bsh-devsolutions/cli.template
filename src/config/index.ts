import type { Config } from './type.js';
import { defaultConfig, loadFromFile } from './utils.js';

let instance: Config | undefined;
let initPromise: Promise<Config> | undefined;

export async function loadConfig(): Promise<Config> {
  if (instance) return instance;
  if (!initPromise) {
    initPromise = loadFromFile().then((c) => {
      instance = c;
      return c;
    });
  }
  return initPromise;
}

export function getConfig(): Config {
  if (!instance) instance = defaultConfig;
  return instance;
}

export type { Config };
export { defaultConfig };
