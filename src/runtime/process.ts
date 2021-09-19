/// <reference path="../../types.d.ts" />

import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { Reader } from "./reader.ts";

type Resolver<T> = (value: T) => void;
type Reject = (error: Error) => void;

interface PullQueueItem {
  resolve: Resolver<string | null>;
  reject: Reject;
}

type RunOptions = Deno.RunOptions & {
  stdin: "piped";
  stdout: "piped";
  stderr: "piped";
};

type CopyHandler = () => Promise<unknown>;

export class Process extends Reader<ProcessOutput>
  implements
    Promise<ProcessOutput>,
    AsyncIterableIterator<string>,
    Deno.Reader,
    Deno.Writer {
  readonly #cmd: string;
  readonly #process: Deno.Process<RunOptions>;
  readonly #deferred: async.Deferred<ProcessOutput> = async.deferred();
  readonly #pullQueue: PullQueueItem[] = [];
  readonly #pushQueue: Array<string | null> = [];
  readonly #stdout: Reader<string>;
  readonly #stderr: Reader<string>;
  readonly #copyHandler: Array<CopyHandler> = [];
  #isStarted = false;
  #closed = false;
  #throwErrors = true;
  #inherit = true;

  constructor(cmd: string) {
    super({
      reader: () => this.stdout,
      resolve: () => this.#run(),
      copy: (dest: Deno.Writer | Process): Process => this.stdout.copy(dest),
    });

    if ($.verbose) {
      console.log($.brightBlue("$ %s"), cmd);
    }
    this.#cmd = cmd;

    this.#process = Deno.run({
      cmd: [$.shell, "-c", $.prefix + " " + this.#cmd],
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    this.#stdout = new Reader({
      reader: () => {
        this.#inherit = false;
        this.#run();
        return this.#process.stdout;
      },
      resolve: () => this.then(({ stdout }) => stdout),
      copy: (dest: Deno.Writer | Process): Process => {
        this.#inherit = false;
        this.#copyHandler.push(() => io.copy(this.#process.stdout, dest));
        return dest instanceof Process ? dest : this;
      },
    });

    this.#stderr = new Reader({
      reader: () => {
        this.#inherit = false;
        this.#run();
        return this.#process.stderr;
      },
      resolve: () => this.then(({ stderr }) => stderr),
      copy: (dest: Deno.Writer | Process): Process => {
        this.#inherit = false;
        this.#copyHandler.push(() => io.copy(this.#process.stderr, dest));
        return dest instanceof Process ? dest : this;
      },
    });
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

  get stdin(): Deno.Writer {
    this.#inherit = false;
    this.#run();
    return this.#process.stdin;
  }

  get stdout(): Reader<string> {
    return this.#stdout;
  }

  get stderr(): Reader<string> {
    return this.#stderr;
  }

  get status(): Promise<Deno.ProcessStatus> {
    return this.noThrow.then(({ status }) => status);
  }

  get statusCode(): Promise<number> {
    return this.status.then(({ code }) => code);
  }

  get noThrow(): this {
    this.#throwErrors = false;
    return this;
  }

  kill(signo: string): void {
    this.#process.kill(signo);
  }

  write(p: Uint8Array): Promise<number> {
    this.#inherit = false;
    this.#run();
    return this.#process.stdin.write(p);
  }

  async next(): Promise<IteratorResult<string>> {
    const event: string | null = await this.#pull();

    return event
      ? { done: false, value: event }
      : { done: true, value: undefined };
  }

  #run(): Promise<ProcessOutput> {
    if (!this.#isStarted) {
      this.#isStarted = true;
      this.#read()
        .then(this.#deferred.resolve)
        .catch(this.#deferred.reject);
    }

    return this.#deferred;
  }

  async #read(): Promise<ProcessOutput> {
    const stdout: Array<string> = [];
    const stderr: Array<string> = [];
    const combined: Array<string> = [];

    const [status, stdoutError, stderrError]: [
      Deno.ProcessStatus,
      Error | void,
      Error | void,
      Array<unknown>,
    ] = await Promise.all([
      this.#process.status(),
      !this.#copyHandler.length
        ? read(
          this.#process.stdout,
          [stdout, combined],
          (line) => {
            if ($.verbose && this.#inherit) {
              io.writeAllSync(
                Deno.stdout,
                new TextEncoder().encode(line + "\n"),
              );
            }
            this.#push(line);
          },
        )
        : undefined,
      !this.#copyHandler.length
        ? read(
          this.#process.stderr,
          [stderr, combined],
          (line) => {
            if ($.verbose && this.#inherit) {
              io.writeAllSync(
                Deno.stderr,
                new TextEncoder().encode(line + "\n"),
              );
            }
          },
        )
        : undefined,
      Promise.all(this.#copyHandler.map((handler) => handler())),
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
