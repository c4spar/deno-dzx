export interface ProcessOutputOptions {
  stdout: string;
  stderr: string;
  combined: string;
  status: Deno.ProcessStatus;
  retries: number;
}

export class ProcessOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ProcessStatus;
  readonly retries: number;

  constructor(
    { stdout, stderr, combined, status, retries }: ProcessOutputOptions,
  ) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
    this.retries = retries;
  }

  toString(): string {
    return this.combined;
  }
}
