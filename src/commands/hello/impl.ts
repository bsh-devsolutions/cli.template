import { logger } from '@lib/logger';

import type { HelloOptions } from './types.js';

export function runHello(options: HelloOptions): void {
  logger.info(`Hello, ${options.name}!`);
}
