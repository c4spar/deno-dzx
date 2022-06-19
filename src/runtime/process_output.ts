import { colors } from "./deps.ts";
import { getExitCodeInfo, inspect } from "./lib/utils.ts";

export interface ProcessOutputOptions {
  stdout: string;
  stderr: string;
  combined: string;
  status: Deno.ChildStatus;
}

export class ProcessOutput {
  #stdout: string;
  #stderr: string;
  #combined: string;
  #status: Deno.ChildStatus;

  constructor({ stdout, stderr, combined, status }: ProcessOutputOptions) {
    this.#stdout = stdout;
    this.#stderr = stderr;
    this.#combined = combined;
    this.#status = status;
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

  get status(): Deno.ChildStatus {
    return this.#status;
  }

  toString(): string {
    return this.combined;
  }

  [Symbol.for("Deno.customInspect")]() {
    const stdout = colors.green(Deno.inspect(this.#stdout));
    const stderr = colors.red(Deno.inspect(this.#stderr));

    const success = this.#status.success === true
      ? colors.green("true")
      : colors.red("false");

    const code = this.#status.success === true
      ? colors.green(this.#status.code.toString())
      : colors.red(this.#status.code.toString());

    const codeInfo = getExitCodeInfo(this.#status.code)
      ? colors.gray.italic(` (${getExitCodeInfo(this.#status.code)})`)
      : "";

    const signal = this.#status.signal === null
      ? inspect(null)
      : colors.red(Deno.inspect(this.#status.signal));

    return `ProcessOutput {
  stdout: ${stdout},
  stderr: ${stderr},
  status: { success: ${success}, code: ${code}${codeInfo}, signal: ${signal} },
}`;
  }
}
