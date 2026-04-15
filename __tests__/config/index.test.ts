import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

const readFileMock = readFile as ReturnType<typeof vi.fn>;

import { mergeConfig, getNodeErrno, loadFromFile, defaultConfig } from '@src/config/utils';
import { consts } from '@src/config/consts';

describe('consts', () => {
  it('uses the expected config file path segment', () => {
    expect(consts.configRelativePath).toBe('.github/bsh-cli.json');
  });
});

describe('defaultConfig', () => {
  it('has logger defaults', () => {
    expect(defaultConfig.logger.level).toBe('info');
    expect(defaultConfig.logger.file.enable).toBe(false);
    expect(defaultConfig.logger.file.path).toBe('logs/example-cli.log');
  });
});

describe('getNodeErrno', () => {
  it('returns undefined for non-objects', () => {
    expect(getNodeErrno(null)).toBeUndefined();
    expect(getNodeErrno(undefined)).toBeUndefined();
    expect(getNodeErrno('err')).toBeUndefined();
  });

  it('returns undefined when code is missing', () => {
    expect(getNodeErrno({})).toBeUndefined();
  });

  it('returns errno code when present', () => {
    expect(getNodeErrno({ code: 'ENOENT' })).toBe('ENOENT');
  });
});

describe('mergeConfig', () => {
  it('returns a structured clone of default for null, undefined, or non-object raw', () => {
    for (const raw of [null, undefined, 'x', 1] as const) {
      const merged = mergeConfig(raw);
      expect(merged).toEqual(defaultConfig);
      expect(merged).not.toBe(defaultConfig);
    }
  });

  it('deep merges partial logger while preserving other branches', () => {
    const merged = mergeConfig({
      logger: { level: 'debug' },
    });
    expect(merged.logger.level).toBe('debug');
    expect(merged.logger.file).toEqual(defaultConfig.logger.file);
  });

  it('deep merges nested logger.file', () => {
    const merged = mergeConfig({
      logger: { file: { enable: true, path: '/tmp/x.log' } },
    });
    expect(merged.logger.file).toEqual({ enable: true, path: '/tmp/x.log' });
    expect(merged.logger.level).toBe('info');
  });
});

describe('loadFromFile', () => {
  let cwdSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    readFileMock.mockReset();
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/proj/root');
  });

  afterEach(() => {
    cwdSpy.mockRestore();
  });

  it('resolves config path from cwd and consts', async () => {
    readFileMock.mockRejectedValue(Object.assign(new Error('missing'), { code: 'ENOENT' }));
    await loadFromFile();
    expect(readFileMock).toHaveBeenCalledWith(
      expect.stringMatching(/[\\/]\.github[\\/]bsh-cli\.json$/),
      'utf8',
    );
  });

  it('returns default config when file is missing (ENOENT)', async () => {
    readFileMock.mockRejectedValue(Object.assign(new Error('missing'), { code: 'ENOENT' }));
    const cfg = await loadFromFile();
    expect(cfg).toEqual(defaultConfig);
  });

  it('parses JSON and merges into default', async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ logger: { level: 'debug' } }));
    const cfg = await loadFromFile();
    expect(cfg.logger.level).toBe('debug');
    expect(cfg.logger.file).toEqual(defaultConfig.logger.file);
  });

  it('returns defaults when file contains invalid JSON', async () => {
    readFileMock.mockResolvedValue('{');
    const cfg = await loadFromFile();
    expect(cfg).toEqual(defaultConfig);
  });

  it('rethrows non-ENOENT read errors', async () => {
    readFileMock.mockRejectedValue(new Error('permission denied'));
    await expect(loadFromFile()).rejects.toThrow('permission denied');
  });
});

describe('loadConfig / getConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    readFileMock.mockReset();
  });

  it('getConfig returns defaults on a fresh module', async () => {
    const { getConfig } = await import('@config');
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('loadConfig loads from file once and caches the instance', async () => {
    readFileMock.mockResolvedValue(JSON.stringify({}));
    const { loadConfig } = await import('@config');
    const first = await loadConfig();
    readFileMock.mockResolvedValue(JSON.stringify({ logger: { level: 'debug' } }));
    const second = await loadConfig();
    expect(second).toBe(first);
    expect(readFileMock).toHaveBeenCalledTimes(1);
  });

  it('concurrent loadConfig shares one file read', async () => {
    readFileMock.mockResolvedValue(JSON.stringify({}));
    const { loadConfig } = await import('@config');
    const [a, b] = await Promise.all([loadConfig(), loadConfig()]);
    expect(a).toBe(b);
    expect(readFileMock).toHaveBeenCalledTimes(1);
  });

  it('getConfig after loadConfig returns the loaded config', async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ logger: { level: 'debug' } }));
    const { loadConfig, getConfig } = await import('@config');
    await loadConfig();
    expect(getConfig().logger.level).toBe('debug');
  });

  it('getConfig before loadConfig pins defaults so loadConfig never reads the file', async () => {
    const { getConfig, loadConfig } = await import('@config');
    getConfig();
    await loadConfig();
    expect(readFileMock).not.toHaveBeenCalled();
    expect(getConfig()).toEqual(defaultConfig);
  });
});
