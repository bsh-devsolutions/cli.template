import type { CommandDefinition } from '@src/lib/cli/definition.js';
import { Command } from 'commander';

import { BshError } from '@lib/errors';

import { applyCommandMeta, applyOptions, applyPositional, nameAndArgs } from './utils.js';

export default (program: Command, commandList: CommandDefinition[]): void => {
  const registerCommand = (parent: Command, cmd: CommandDefinition): void => {
    const sub = parent
      .command(nameAndArgs(cmd.name, cmd.argumentSyntax), {
        hidden: cmd.hidden,
        isDefault: cmd.isDefault,
      })
      .description(cmd.description)
      .summary(cmd.summary ?? '');

    for (const a of cmd.aliases ?? []) sub.alias(a);

    if (cmd.positional?.length) applyPositional(sub, cmd.positional);
    else if (cmd.argumentsPattern) sub.arguments(cmd.argumentsPattern);

    applyCommandMeta(sub, cmd);
    applyOptions(sub, cmd.options);

    if (cmd.subcommands?.length) {
      for (const nested of cmd.subcommands) {
        registerCommand(sub, nested);
      }
      return;
    }

    if (cmd.action) {
      sub.action((...actionArgs: unknown[]) => {
        const options = actionArgs[actionArgs.length - 2] as Record<string, unknown>;
        const positionals = actionArgs.slice(0, -2) as string[];
        const action = cmd.action as (
          options: unknown,
          ...args: string[]
        ) => void | Promise<void>;
        void action(options, ...positionals);
      });
      return;
    }

    throw new BshError(500, `Command "${cmd.name}" must define action or subcommands`);
  };

  for (const cmd of commandList) {
    registerCommand(program, cmd);
  }
};
