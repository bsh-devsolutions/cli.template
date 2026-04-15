import type { Command } from 'commander';

import { errorHandlingMiddleware } from './global-error.js';

export default function middleware(program: Command): Promise<void> {
  return errorHandlingMiddleware(program);
}
