import type { CommandDefinition } from '@src/lib/cli/definition';
import hello from '@commands/hello';

const commands: CommandDefinition[] = [hello];

export default commands;
