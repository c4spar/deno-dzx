/// <reference path="../../types.d.ts" />

import { Deferred, deferred } from "./deps.ts";
import { readLines } from "./lib/readline.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";

export interface ProcessOptions {
  // deno-lint-ignore ban-types
  errorContext?: Function;
}

export class Process implements Promise<ProcessOutput> {
  readonly [Symbol.toStringTag] = "Process";
  readonly #cmd: string;
  #proc: Deno.Process | null = null;
  #deferred?: Deferred<ProcessOutput>;
  #stdin: Deno.RunOptions["stdin"] = "inherit";
  #stdout: Deno.RunOptions["stdout"] = $.stdout;
  #stderr: Deno.RunOptions["stderr"] = $.stderr;
  #baseError: ProcessError;
  #maxRetries = 0;
  #retries = 0;
  #timeout = 0;
  #timers: Array<number> = [];
  #delay = 500;
  #throwErrors = true;
  #isKilled = false;

  constructor(cmd: string, { errorContext }: ProcessOptions = {}) {
    this.#cmd = cmd;
    this.#baseError = new ProcessError({
      combined: "",
      stderr: "",
      stdout: "",
      status: { code: 1, success: false, signal: undefined },
      retries: 0,
    });
    Error.captureStackTrace(this.#baseError, errorContext);
  }

  get #process(): Deno.Process {
    if (!this.#proc) {
      this.#proc = Deno.run({
        cmd: [$.shell, "-c", $.prefix + " " + this.#cmd],
        env: Deno.env.toObject(),
        stdin: this.#stdin,
        stdout: this.#stdout,
        stderr: this.#stderr,
      });

      if (this.#timeout) {
        this.#timers.push(
          setTimeout(() => this.kill("SIGABRT"), this.#timeout),
        );
      }
    }
    return this.#proc;
  }

  get pid(): number {
    return this.#process.pid;
  }

  get noThrow(): this {
    this.#throwErrors = false;
    return this;
  }

  get statusCode(): Promise<number> {
    return this.noThrow.#resolve().then(({ status }) => status.code);
  }

  retry(retries: number): this {
    this.#maxRetries = retries;
    return this;
  }

  delay(delay: number): this {
    this.#delay = Math.max(0, delay);
    return this;
  }

  timeout(timeout: number): this {
    this.#timeout = timeout;
    return this;
  }

  kill(signo: Deno.Signal): void {
    this.#isKilled = true;
    this.#process.kill(signo);
  }

  then<TResult1 = ProcessOutput, TResult2 = never>(
    onfulfilled?:
      | ((value: ProcessOutput) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.#resolve().then(onfulfilled).catch(onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<ProcessOutput | TResult> {
    return this.#resolve().catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<ProcessOutput> {
    return this.#resolve().finally(onfinally);
  }

  #resolve(): Promise<ProcessOutput> {
    if (this.#deferred) {
      return this.#deferred;
    }
    this.#deferred = deferred();

    this.#run()
      .then((output) => this.#deferred!.resolve(output))
      .catch((error) => this.#deferred!.reject(error));

    return this.#deferred;
  }

  async #run(): Promise<ProcessOutput> {
    const stdout: Array<string> = [];
    const stderr: Array<string> = [];
    const combined: Array<string> = [];

    try {
      const [status] = await Promise.all([
        this.#process.status(),
        this.#process.stdout &&
        read(
          this.#process.stdout,
          [stdout, combined],
          Deno.stdout,
          () => this.#isKilled,
        ),
        this.#process.stderr &&
        read(
          this.#process.stderr,
          [stderr, combined],
          Deno.stderr,
          () => this.#isKilled,
        ),
      ]);

      let output = new ProcessOutput({
        stdout: stdout.join(""),
        stderr: stderr.join(""),
        combined: combined.join(""),
        status,
        retries: this.#retries,
      });

      if (!status.success) {
        output = ProcessError.merge(
          this.#baseError,
          new ProcessError(output),
        );

        if (this.#throwErrors || this.#retries < this.#maxRetries) {
          throw output;
        }
      }
      this.#close();
      this.#closeTimer();

      return output;
    } catch (error) {
      this.#close();

      if (this.#retries < this.#maxRetries) {
        this.#retries++;
        this.#proc = null;

        if (this.#delay) {
          await new Promise((resolve) =>
            this.#timers.push(setTimeout(resolve, this.#delay))
          );
        }

        return this.#run();
      }
      this.#closeTimer();

      throw error;
    }
  }

  #close() {
    this.#proc?.close();
    this.#proc?.stdin?.close();
    this.#proc?.stdout?.close();
    this.#proc?.stderr?.close();
  }

  #closeTimer() {
    this.#timers.forEach((timer) => clearTimeout(timer));
  }
}

async function read(
  reader: Deno.Reader,
  results: Array<Array<string>>,
  outputStream: Deno.Writer,
  isCanceld: () => boolean,
): Promise<Error | void> {
  for await (const line of readLines(reader, isCanceld)) {
    for (const result of results) {
      result.push(line + "\n");
    }
    if ($.verbose > 1) {
      await io.writeAll(
        outputStream,
        new TextEncoder().encode(line + "\n"),
      );
    }
  }
}
