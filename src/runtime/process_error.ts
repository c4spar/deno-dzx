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

  constructor(options: ProcessErrorOptions) {
    super();
    Object.setPrototypeOf(this, ProcessError.prototype);
    this.#stdout = options.stdout;
    this.#stderr = options.stderr;
    this.#combined = options.combined;
    this.#status = options.status;
    this.message = this.#getErrorMessage();
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

    return colors.red(message);
  }
}
