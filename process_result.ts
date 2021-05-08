export interface ProcessResultOptions {
  stdout: string;
  stderr: string;
  combined: string;
  status: Deno.ProcessStatus;
}

export class ProcessResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ProcessStatus;

  constructor({ stdout, stderr, combined, status }: ProcessResultOptions) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
  }

  toString(): string {
    return this.combined;
  }
}

export class ProcessError extends Error {
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ProcessStatus;

  constructor({ stdout, stderr, combined, status }: ProcessResultOptions) {
    super();
    Object.setPrototypeOf(this, ProcessError.prototype);
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
    this.message = combined;
  }
}
