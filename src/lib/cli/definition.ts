export type CommandOption = {
  flags: string;
  description: string;
  defaultValue?: string | boolean | string[];
  mandatory?: boolean;
  choices?: readonly string[];
  env?: string;
  hideHelp?: boolean;
  helpGroup?: string;
  preset?: unknown;
};

export type PositionalArg = {
  spec: string;
  description?: string;
  defaultValue?: unknown;
};

export type CommandDefinition = {
  hidden?: boolean;
  isDefault?: boolean;
  name: string;
  aliases?: string[];
  description: string;
  summary?: string;
  argumentSyntax?: string;
  argumentsPattern?: string;
  positional?: PositionalArg[];
  usage?: string;
  helpGroup?: string;
  options?: CommandOption[];
  allowUnknownOptions?: boolean;
  allowExcessArguments?: boolean;
  action?: (options: unknown, ...args: string[]) => void | Promise<void>;
  subcommands?: CommandDefinition[];
};

export type AttachedCommandOptions = Pick<
  CommandDefinition,
  'usage' | 'helpGroup' | 'allowUnknownOptions' | 'allowExcessArguments'
>;
