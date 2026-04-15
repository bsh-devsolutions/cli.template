import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { consts } from './consts.js';
import type { Config } from './type.js';

export const defaultConfig: Config = {
  logger: {
    level: 'info',
    file: {
      enable: false,
      path: 'logs/example-cli.log',
    },
  },
};

export async function loadFromFile(): Promise<Config> {
  const path = resolve(process.cwd(), consts.configRelativePath);
  try {
    const text = await readFile(path, 'utf8');
    try {
      return mergeConfig(JSON.parse(text) as unknown);
    } catch (err) {
      if (err instanceof SyntaxError) return structuredClone(defaultConfig);
      throw err;
    }
  } catch (err) {
    if (getNodeErrno(err) === 'ENOENT') return structuredClone(defaultConfig);
    throw err;
  }
}

function deepMerge(target: Config, source: unknown): Config {
  if (typeof source !== 'object' || source === null) return target;
  if (typeof target !== 'object' || target === null) return target;

  const result: Record<string, unknown> = Array.isArray(target)
    ? [...target]
    : { ...target };

  for (const key of Object.keys(target)) {
    if (
      Object.prototype.hasOwnProperty.call(source, key) &&
      typeof key === 'string'
    ) {
      const sourceVal = (source as Record<string, unknown>)[key];
      const targetVal = (target as Record<string, unknown>)[key];

      if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        result[key] = [...sourceVal];
      } else if (
        typeof targetVal === 'object' &&
        targetVal !== null &&
        typeof sourceVal === 'object' &&
        sourceVal !== null
      ) {
        result[key] = deepMerge(targetVal as Config, sourceVal);
      } else {
        if (typeof sourceVal === typeof targetVal || Array.isArray(sourceVal)) {
          result[key] = sourceVal;
        } else {
          result[key] =
            sourceVal !== undefined && sourceVal !== null ? sourceVal : targetVal;
        }
      }
    }
  }

  return result as Config;
}

export function mergeConfig(raw: unknown): Config {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(defaultConfig);
  }
  return deepMerge(defaultConfig, raw);
}

export function getNodeErrno(err: unknown): NodeJS.ErrnoException['code'] {
  if (!err || typeof err !== 'object' || !('code' in err)) return undefined;
  const code = (err as NodeJS.ErrnoException).code;
  return code;
}
