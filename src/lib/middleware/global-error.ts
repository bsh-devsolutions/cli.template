import { CommanderError, type Command } from 'commander';

import { BshError } from '@lib/errors';
import { logger } from '@lib/logger';

function logMessageFor(err: unknown): string {
  if (err instanceof BshError) return `[${err.code}] ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'command failed';
}

export async function errorHandlingMiddleware(
  program: Command,
  argv: string[] = process.argv,
): Promise<void> {
  program.exitOverride();
  try {
    await program.parseAsync(argv);
  } catch (err) {
    if (
      err instanceof CommanderError &&
      (err.exitCode === 0 || err.code === 'commander.help')
    ) {
      process.exit(0);
      return;
    }
    if (err instanceof BshError) {
      logger.error(logMessageFor(err));
      process.exit(err.code);
      return;
    }
    logger.error({ err }, logMessageFor(err));
    process.exit(err instanceof CommanderError ? err.exitCode : 1);
  }
}
