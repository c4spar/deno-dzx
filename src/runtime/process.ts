/// <reference path="../../types.d.ts" />

import { deferred, Deferred } from "https://deno.land/std@0.141.0/async/deferred.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";

export class Process implements Promise<ProcessOutput> {
  readonly [Symbol.toStringTag] = "Process";
  readonly #cmd: string;
  #proc?: Deno.Process;
  #deferred?: Deferred<ProcessOutput>;
  #stdin: Deno.RunOptions["stdin"] = "inherit";
  #stdout: Deno.RunOptions["stdout"] = $.stdout;
  #stderr: Deno.RunOptions["stderr"] = $.stderr;

  constructor(cmd: string) {
    this.#cmd = cmd;
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

  then<TResult1 = ProcessOutput, TResult2 = never>(
    onfulfilled?: ((value: ProcessOutput) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.#resolve().then(onfulfilled).catch(onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null,
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

  async #run() {
    const stdout: Array<string> = [];
    const stderr: Array<string> = [];
    const combined: Array<string> = [];

    try {
      const [status] = await Promise.all([
        this.#process.status(),
        this.#process.stdout && read(this.#process.stdout, [stdout, combined], Deno.stdout),
        this.#process.stderr && read(this.#process.stderr, [stderr, combined], Deno.stderr),
      ]);

      if (!status.success) {
        throw new ProcessError({
          stdout: stdout.join(""),
          stderr: stderr.join(""),
          combined: combined.join(""),
          status,
        });
      }

      return new ProcessOutput({
        stdout: stdout.join(""),
        stderr: stderr.join(""),
        combined: combined.join(""),
        status,
      });
    } finally {
      this.#process.close();
      this.#process.stdin?.close();
      this.#process.stdout?.close();
      this.#process.stderr?.close();
    }
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
