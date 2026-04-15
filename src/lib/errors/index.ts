export class BshError extends Error {
  readonly code: number;
  readonly context?: Record<string, unknown>;

  constructor(
    code: number,
    message: string,
    options?: {
      cause?: unknown;
      context?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = 'BshError';
    this.code = code;
    this.context = options?.context;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
