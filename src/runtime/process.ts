/// <reference path="../../types.d.ts" />

import { Deferred, deferred } from "./deps.ts";
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
  #throwErrors = true;

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
        read(this.#process.stdout, [stdout, combined], Deno.stdout),
        this.#process.stderr &&
        read(this.#process.stderr, [stderr, combined], Deno.stderr),
      ]);

      const output = new ProcessOutput({
        stdout: stdout.join(""),
        stderr: stderr.join(""),
        combined: combined.join(""),
        status,
        retries: this.#retries,
      });

      if (!status.success) {
        const error = ProcessError.merge(
          this.#baseError,
          new ProcessError(output),
        );

        if (this.#throwErrors) {
          throw error;
        }
        this.#close();

        return error;
      }
      this.#close();

      return output;
    } catch (error) {
      this.#close();

      if (this.#retries < this.#maxRetries) {
        this.#retries++;
        this.#proc = null;

        return this.#run();
      }

      throw error;
    }
  }

  #close() {
    this.#process.close();
    this.#process.stdin?.close();
    this.#process.stdout?.close();
    this.#process.stderr?.close();
  }
}

async function read(
  reader: Deno.Reader,
  results: Array<Array<string>>,
  outputStream: Deno.Writer,
): Promise<Error | void> {
  for await (const line of io.readLines(reader)) {
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
