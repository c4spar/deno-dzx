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
  readonly #cmd: string;
  readonly #process: Deno.Process<
    Deno.RunOptions & { stdin: "piped"; stdout: "piped"; stderr: "piped" }
  >;
  readonly #deferred: async.Deferred<ProcessOutput> = async.deferred();
  readonly #pullQueue: PullQueueItem[] = [];
  readonly #pushQueue: Array<string | null> = [];
  #isStarted = false;
  #closed = false;
  #throwErrors = true;
  #inherit = true;

  constructor(cmd: string) {
    this.#cmd = cmd;
    if ($.verbose) {
      console.log($.brightBlue("$ %s"), this.#cmd);
    }
    this.#process = Deno.run({
      cmd: [$.shell, "-c", $.prefix + " " + this.#cmd],
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
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

  get stdin(): Deno.Writer & Deno.Closer {
    this.#inherit = false;
    this.#run();
    return this.#process.stdin;
  }

  get stdout(): Reader<string> {
    return new Reader({
      reader: () => {
        this.#inherit = false;
        this.#run();
        return this.#process.stdout;
      },
      resolve: () => this.then(({ stdout }) => stdout),
      copy: (dest: Deno.Writer | Process): Process => {
        this.#inherit = false;
        this.#run(() => io.copy(this.#process.stdout, dest));
        return dest instanceof Process ? dest : this;
      },
    });
  }

  get stderr(): Reader<string> {
    return new Reader({
      reader: () => {
        this.#inherit = false;
        this.#run();
        return this.#process.stderr;
      },
      resolve: () => this.then(({ stderr }) => stderr),
      copy: (dest: Deno.Writer | Process): Process => {
        this.#inherit = false;
        this.#run(() => io.copy(this.#process.stderr, dest));
        return dest instanceof Process ? dest : this;
      },
    });
  }

  get status(): Promise<Deno.ProcessStatus> {
    return this.noThrow.then(({ status }) => status);
  }

  get statusCode(): Promise<number> {
    return this.status.then(({ code }) => code);
  }

  kill(signo: Parameters<Deno.Process["kill"]>[0]): void {
    this.#process.kill(signo);
  }

  read(p: Uint8Array): Promise<number | null> {
    this.#inherit = false;
    this.#run();
    return this.#process.stdout.read(p);
  }

  write(p: Uint8Array): Promise<number> {
    this.#inherit = false;
    this.#run();
    return this.#process.stdin.write(p);
  }

  copy(dest: Deno.Writer | Process): Process {
    return this.stdout.copy(dest);
  }

  then<T = ProcessOutput, S = never>(
    resolve?:
      | ((processOutput: ProcessOutput) => T | PromiseLike<T>)
      | undefined
      | null,
    reject?:
      | ((error: unknown) => S | PromiseLike<S>)
      | undefined
      | null,
  ): Promise<T | S> {
    return this.#run().then(resolve, reject);
  }

  catch<T = never>(
    reject?:
      | ((error: unknown) => T | PromiseLike<T>)
      | undefined
      | null,
  ): Promise<ProcessOutput | T> {
    return this.#run().catch(reject);
  }

  finally(onFinally?: (() => void) | undefined | null): Promise<ProcessOutput> {
    return this.#run().finally(onFinally);
  }

  get noThrow(): this {
    this.#throwErrors = false;
    return this;
  }

  async next(): Promise<IteratorResult<string>> {
    const event: string | null = await this.#pull();

    return event
      ? { done: false, value: event }
      : { done: true, value: undefined };
  }

  #run(fn?: () => unknown): Promise<ProcessOutput> {
    if (this.#isStarted) {
      return this.#deferred;
    }
    this.#isStarted = true;

    this.#read(fn)
      .then(this.#deferred.resolve)
      .catch(this.#deferred.reject);

    return this.#deferred;
  }

  async #read(fn?: () => unknown): Promise<ProcessOutput> {
    const stdout: Array<string> = [];
    const stderr: Array<string> = [];
    const combined: Array<string> = [];

    const [_, status, stdoutError, stderrError]: [
      unknown,
      Deno.ProcessStatus,
      Error | void,
      Error | void,
    ] = await Promise.all([
      fn?.(),
      this.#process.status(),
      !fn
        ? read(
          this.#process.stdout,
          [stdout, combined],
          (line) => {
            if ($.verbose > 1 && this.#inherit) {
              io.writeAllSync(
                Deno.stdout,
                new TextEncoder().encode(line + "\n"),
              );
            }
            this.#push(line);
          },
        )
        : undefined,
      read(
        this.#process.stderr,
        [stderr, combined],
        (line) => {
          if ($.verbose > 1 && this.#inherit) {
            io.writeAllSync(
              Deno.stderr,
              new TextEncoder().encode(line + "\n"),
            );
          }
        },
      ),
    ]);

    if (stdoutError || stderrError) {
      throw stdoutError || stderrError;
    }

    this.#close();

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
    this.#process.stdin.close();
    this.#process.stdout.close();
    this.#process.stderr.close();
    this.#process.close();
  }
}

export class Reader<T> implements Deno.Reader, Deno.Closer, Promise<T> {
  #reader: () => Deno.Reader & Deno.Closer;
  #resolve: () => Promise<T>;
  #copy: (dest: Deno.Writer | Process) => Process;

  constructor(
    { reader, resolve, copy }: {
      reader: () => Deno.Reader & Deno.Closer;
      resolve: () => Promise<T>;
      copy: (dest: Deno.Writer | Process) => Process;
    },
  ) {
    this.#reader = reader;
    this.#resolve = resolve;
    this.#copy = copy;
  }

  get [Symbol.toStringTag](): string {
    return "Reader";
  }

  read(p: Uint8Array): Promise<number | null> {
    return this.#reader().read(p);
  }

  copy(dest: Deno.Writer | Process): Process {
    return this.#copy(dest);
  }

  close(): void {
    this.#reader().close();
  }

  then<R = T, S = never>(
    resolve?:
      | ((value: T) => R | PromiseLike<R>)
      | undefined
      | null,
    reject?:
      | ((error: unknown) => S | PromiseLike<S>)
      | undefined
      | null,
  ): Promise<R | S> {
    return this.#resolve().then(resolve, reject);
  }

  catch<R = never>(
    reject?:
      | ((error: unknown) => R | PromiseLike<R>)
      | undefined
      | null,
  ): Promise<T | R> {
    return this.#resolve().catch(reject);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.#resolve().finally(onfinally);
  }
}
