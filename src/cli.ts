import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { loadConfig } from '@config';
import middleware from '@lib/middleware';
import commands from '@commands';
import cli from '@lib/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name(`npx ${packageJson.name}`)
  .description('CLI starter template (bsh-git style layout)')
  .version(packageJson.version);

void (async () => {
  await loadConfig();
  cli(program, commands);
  await middleware(program);
})();
