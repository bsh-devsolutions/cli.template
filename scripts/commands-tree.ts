import commands from '../src/commands';
import type { CommandDefinition } from '../src/lib/cli/definition';
import packageJson from '../package.json';

function renderTree(definitions: CommandDefinition[], prefix = ''): string[] {
  return definitions.flatMap((definition, index) => {
    const isLast = index === definitions.length - 1;
    const connector = isLast ? '└─ ' : '├─ ';
    const current = `${prefix}${connector}${definition.name}`;

    if (!definition.subcommands?.length) {
      return [current];
    }

    const childPrefix = `${prefix}${isLast ? '   ' : '│  '}`;
    const children = renderTree(definition.subcommands, childPrefix);
    return [current, ...children];
  });
}

console.log(`npx ${packageJson.name}`);
for (const line of renderTree(commands)) {
  console.log(line);
}
