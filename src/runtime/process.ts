/// <reference path="../../types.d.ts" />

import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";

type Resolver<T> = (value: T) => void;
type Reject = (error: Error) => void;

interface PullQueueItem {
  resolve: Resolver<string | null>;
  reject: Reject;
}

export class Process
  implements
    Promise<ProcessOutput>,
    AsyncIterableIterator<string>,
    Deno.Reader,
    Deno.Writer {
  private static runningProcesses = 0;
  readonly #process: Deno.Process;
  readonly #deferred: async.Deferred<ProcessOutput> = async.deferred();
  readonly #pullQueue: PullQueueItem[] = [];
  readonly #pushQueue: Array<string | null> = [];
  #isStarted = false;
  #closed = false;
  #throwErrors = true;

  constructor(private readonly cmd: string) {
    this.#process = Deno.run({
      cmd: [$.shell, "-c", $.prefix + " " + cmd],
      env: Deno.env.toObject(),
      stdin: $.stdin,
      stdout: $.stdout,
      stderr: $.stderr,
    });
  }

  get [Symbol.toStringTag](): string {
    return "Process";
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    this.#run();
    return this;
  }

  get rid(): number {
    return this.#process.rid;
  }

  get pid(): number {
    return this.#process.pid;
  }

  get stdin(): (Deno.Writer & Deno.Closer) | null {
    return this.#process.stdin;
  }

  get stdout(): (Deno.Reader & Deno.Closer) | null {
    return this.#process.stdout;
  }

  get stderr(): (Deno.Reader & Deno.Closer) | null {
    return this.#process.stderr;
  }

  status(): Promise<Deno.ProcessStatus> {
    return this.noThrow().then(({ status }) => status);
  }

  statusCode(): Promise<number> {
    return this.status().then(({ code }) => code);
  }

  output(): Promise<string> {
    return this.then(({ stdout }) => stdout);
  }

  stderrOutput(): Promise<string> {
    return this.then(({ stderr }) => stderr);
  }

  kill(signo: number): void {
    this.#process.kill(signo);
  }

  read(p: Uint8Array): Promise<number | null> {
    if (!this.#process.stdout) {
      throw new Error(`stdout is not piped: ${this.cmd}`);
    }
    this.#run();
    return this.#process.stdout.read(p);
  }

  write(p: Uint8Array): Promise<number> {
    if (!this.#process.stdin) {
      throw new Error(`stdin is not piped: ${this.cmd}`);
    }
    this.#run();
    return this.#process.stdin.write(p);
  }

  copy(dest: Deno.Writer | Process): Process {
    this.#run(() => io.copy(this, dest));
    return dest instanceof Process ? dest : this;
  }

  then<T = ProcessOutput, S = never>(
    resolve?:
      | ((processOutput: ProcessOutput) => T | PromiseLike<T>)
      | undefined
      | null,
    reject?:
      | ((error: ProcessError) => S | PromiseLike<S>)
      | undefined
      | null,
  ): Promise<T | S> {
    return this.#run()
      .then(resolve)
      .catch(reject);
  }

  catch<T = never>(
    reject?:
      | ((error: unknown) => T | PromiseLike<T>)
      | undefined
      | null,
  ): Promise<ProcessOutput | T> {
    return this.#run().catch(reject);
  }

  finally(onFinally?: (() => void) | null): Promise<ProcessOutput> {
    return this.#run().finally(onFinally);
  }

  noThrow(): this {
    this.#throwErrors = false;
    return this;
  }

  async next(): Promise<IteratorResult<string>> {
    const event: string | null = await this.#pull();

    if (event) {
      return { done: false, value: event };
    }

    return event
      ? { done: false, value: event }
      : { done: true, value: undefined };
  }

  #run(fn?: () => unknown): Promise<ProcessOutput> {
    if (this.#isStarted) {
      return this.#deferred;
    }
    this.#isStarted = true;
    Process.runningProcesses++;

    if ($.verbose) {
      console.log($.brightBlue("$ %s"), this.cmd);
    }

    this.#read(fn)
      .then(this.#deferred.resolve)
      .catch(this.#deferred.reject);

    return this.#deferred;
  }

  async #read(fn?: () => unknown): Promise<ProcessOutput> {
    const stdout: Array<string> = [];
    const stderr: Array<string> = [];
    const combined: Array<string> = [];

    const [status, _, stdoutError, stderrError]: [
      Deno.ProcessStatus,
      unknown,
      Error | void,
      Error | void,
    ] = await Promise.all([
      this.#process.status(),
      fn?.(),
      !fn && this.#process.stdout
        ? read(
          this.#process.stdout,
          [stdout, combined],
          (line) => this.#push(line),
        )
        : undefined,
      this.#process.stderr
        ? read(this.#process.stderr, [stderr, combined])
        : undefined,
    ]);

    if (stdoutError || stderrError) {
      throw stdoutError || stderrError;
    }

    this.#close();

    if (--Process.runningProcesses === 0) {
      $.stdout = "piped";
      $.stderr = "piped";
      $.stdin = "piped";
    }

    const result = {
      stdout: stdout.join(""),
      stderr: stderr.join(""),
      combined: combined.join(""),
      status,
    };

    if (!status.success && this.#throwErrors) {
      throw new ProcessError(result);
    }

    return new ProcessOutput(result);

    async function read(
      reader: Deno.Reader,
      results: Array<Array<string>>,
      fn?: (line: string) => void,
    ): Promise<Error | void> {
      for await (const line of io.readLines(reader)) {
        for (const result of results) {
          result.push(line + "\n");
        }
        fn?.(line);
      }
    }
  }

  #push(event: string | null): void {
    if (this.#pullQueue.length > 0) {
      const { resolve } = this.#pullQueue.shift() as PullQueueItem;
      resolve(event);
    } else {
      this.#pushQueue.push(event);
    }
  }

  #pull(): Promise<string | null> {
    return new Promise<string | null>(
      (resolve, reject) => {
        if (this.#pushQueue.length > 0) {
          const event: string | null = this.#pushQueue.shift() ?? null;
          resolve(event);
        } else {
          this.#pullQueue.push({ resolve, reject });
        }
      },
    );
  }

  #close() {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#push(null);
    this.#process.stdin?.close();
    this.#process.stdout?.close();
    this.#process.stderr?.close();
    this.#process?.close();
  }
}
