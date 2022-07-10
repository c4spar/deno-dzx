import { ProcessOutput, ProcessOutputOptions } from "./process_output.ts";

export type ProcessErrorOptions = ProcessOutputOptions;

export class ProcessError extends Error implements ProcessOutput {
  readonly name = "ProcessError";
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;
  readonly status: Deno.ChildStatus;

  constructor(
    { stdout, stderr, combined, status }: ProcessErrorOptions,
  ) {
    super();
    Object.setPrototypeOf(this, ProcessError.prototype);
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
    this.status = status;
    this.message = combined;
  }
}
