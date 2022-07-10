import { colors } from "./deps.ts";
import { getExitCodeInfo } from "./lib/exit_code_info.ts";
import { ProcessOutputOptions } from "./process_output.ts";

export type ProcessErrorOptions = ProcessOutputOptions;

export class ProcessError extends Error {
  #name = "ProcessError";
  #stdout!: string;
  #stderr!: string;
  #combined!: string;
  #status!: Deno.ProcessStatus;
  #retries!: number;

  static merge(target: ProcessError, source: ProcessError): ProcessError {
    target.#name = source.name;
    target.#merge(source);
    return target;
  }

  constructor(options: ProcessErrorOptions) {
    super();
    Object.setPrototypeOf(this, ProcessError.prototype);
    this.#merge(options);
  }

  get name(): string {
    return this.#name;
  }

  get stdout(): string {
    return this.#stdout;
  }

  get stderr(): string {
    return this.#stderr;
  }

  get combined(): string {
    return this.#combined;
  }

  get status(): Deno.ProcessStatus {
    return this.#status;
  }

  get retries(): number {
    return this.#retries;
  }

  #merge(
    { stdout, stderr, combined, status, retries }: ProcessErrorOptions,
  ): void {
    this.#stdout = stdout;
    this.#stderr = stderr;
    this.#combined = combined;
    this.#status = status;
    this.#retries = retries;
    this.message = this.#getErrorMessage();
  }

  #getErrorMessage(): string {
    let message = colors.bold("Command failed.");

    if (this.#combined.trim()) {
      message += "\n" + this.#combined.trim();
    }

    const exitCodeInfo = getExitCodeInfo(this.#status.code)
      ? ` (${colors.italic(getExitCodeInfo(this.#status.code)!)})`
      : "";

    message += colors.bold(
      `\n${colors.white("Exit code:")} ${
        colors.yellow(this.#status.code.toString())
      }${exitCodeInfo}`,
    );

    if (typeof this.#status.signal === "number") {
      message += colors.bold(
        `\n${colors.white("Signal:")} ${
          colors.yellow(this.#status.signal.toString())
        }`,
      );
    }

    if (this.#retries > 0) {
      message += colors.bold(
        `\n${colors.white("Retries:")} ${
          colors.yellow(this.#retries.toString())
        }`,
      );
    }

    return colors.red(message);
  }
}
