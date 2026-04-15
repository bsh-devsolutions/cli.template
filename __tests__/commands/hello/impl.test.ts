import { describe, it, expect, vi, beforeEach } from 'vitest';

const info = vi.fn();

vi.mock('@lib/logger', () => ({
  logger: { info },
}));

describe('runHello', () => {
  beforeEach(() => {
    info.mockReset();
    vi.resetModules();
  });

  it('logs a greeting', async () => {
    const { runHello } = await import('@src/commands/hello/impl');
    runHello({ name: 'Ada' });
    expect(info).toHaveBeenCalledWith('Hello, Ada!');
  });
});
