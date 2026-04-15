import type { CommandDefinition } from '@definition';

import { runHello } from './impl.js';
import type { HelloOptions } from './types.js';

export default {
  name: 'hello',
  description: 'Print a greeting',
  summary: 'Print a greeting',
  options: [
    {
      flags: '-n, --name <name>',
      description: 'Who to greet',
      defaultValue: 'World',
    },
  ],
  action: (options) => {
    runHello(options as HelloOptions);
  },
} satisfies CommandDefinition;
