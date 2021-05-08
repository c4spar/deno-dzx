import { ProcessOutput, ProcessOutputOptions } from "./process_output.ts";

export class ProcessError extends Error implements ProcessOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ProcessStatus;

  constructor({ stdout, stderr, combined, status }: ProcessOutputOptions) {
    super();
    Object.setPrototypeOf(this, ProcessError.prototype);
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
    this.message = combined;
  }
}
