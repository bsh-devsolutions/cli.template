import type {
  AttachedCommandOptions,
  CommandOption,
  PositionalArg,
} from '@src/lib/cli/definition';
import { Command, Option } from 'commander';

export const nameAndArgs = (name: string, argumentSyntax?: string): string => {
  const extra = argumentSyntax?.trim();
  return extra ? `${name} ${extra}` : name;
};

export const applyPositional = (cmd: Command, positional?: PositionalArg[]): void => {
  if (!positional?.length) return;
  for (const p of positional) {
    if (p.description !== undefined && p.defaultValue !== undefined) {
      cmd.argument(p.spec, p.description, p.defaultValue);
    } else if (p.description !== undefined) {
      cmd.argument(p.spec, p.description);
    } else if (p.defaultValue !== undefined) {
      cmd.argument(p.spec, '', p.defaultValue);
    } else {
      cmd.argument(p.spec);
    }
  }
};

export const applyOption = (cmd: Command, opt: CommandOption): void => {
  const needsCustomOption =
    (opt.choices?.length ?? 0) > 0 ||
    opt.env != null ||
    opt.hideHelp === true ||
    opt.helpGroup != null ||
    opt.preset !== undefined;

  if (needsCustomOption) {
    const o = new Option(opt.flags, opt.description);
    if (opt.defaultValue !== undefined) {
      o.default(opt.defaultValue);
    }
    if (opt.choices?.length) {
      o.choices(opt.choices);
    }
    if (opt.env) {
      o.env(opt.env);
    }
    if (opt.hideHelp) {
      o.hideHelp(true);
    }
    if (opt.helpGroup) {
      o.helpGroup(opt.helpGroup);
    }
    if (opt.preset !== undefined) {
      o.preset(opt.preset);
    }
    if (opt.mandatory) {
      o.makeOptionMandatory(true);
    }
    cmd.addOption(o);
    return;
  }

  if (opt.mandatory) {
    if (opt.defaultValue !== undefined) {
      cmd.requiredOption(opt.flags, opt.description, opt.defaultValue);
    } else {
      cmd.requiredOption(opt.flags, opt.description);
    }
    return;
  }

  if (opt.defaultValue !== undefined) {
    cmd.option(opt.flags, opt.description, opt.defaultValue);
  } else {
    cmd.option(opt.flags, opt.description);
  }
};

export const applyOptions = (cmd: Command, options?: CommandOption[]): void => {
  if (!options) return;
  for (const opt of options) {
    applyOption(cmd, opt);
  }
};

export const applyCommandMeta = (cmd: Command, def: AttachedCommandOptions): void => {
  if (def.usage != null) cmd.usage(def.usage);
  if (def.helpGroup != null) cmd.helpGroup(def.helpGroup);
  if (def.allowUnknownOptions === true) cmd.allowUnknownOption(true);
  if (def.allowExcessArguments !== undefined) cmd.allowExcessArguments(def.allowExcessArguments);
};
