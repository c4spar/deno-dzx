import { Deferred, deferred, writeAll } from "./deps.ts";
import { readLines } from "./lib/readline.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { Reader } from "./reader.ts";
import { $ } from "./shell.ts";

export type RetryCallback = (error: ProcessError) => boolean | Promise<boolean>;

export interface ProcessOptions {
  // deno-lint-ignore ban-types
  errorContext?: Function;
}

export class Process extends Reader<ProcessOutput> {
  readonly [Symbol.toStringTag] = "Process";
  readonly #cmd: string;
  #proc: Deno.Process | null = null;
  #deferred?: Deferred<ProcessOutput>;
  #stdin: Deno.RunOptions["stdin"] = "inherit";
  #stdout: Deno.RunOptions["stdout"] = $.stdout;
  #stderr: Deno.RunOptions["stderr"] = $.stderr;
  #baseError: ProcessError;
  #retries = 0;
  #timeout = 0;
  #timers: Array<number> = [];
  #delay = 500;
  #env: Record<string, string> = {};
  #throwErrors = true;
  #isKilled = false;
  #shouldRetry?: RetryCallback;
  #stdoutReader: Reader<string>;
  #stderrReader: Reader<string>;

  constructor(cmd: string, { errorContext }: ProcessOptions = {}) {
    super({
      resolve: () => this.#resolve(),
    });

    this.#stdoutReader = new Reader({
      resolve: () => this.#resolve().then(({ stdout }) => stdout),
    });

    this.#stderrReader = new Reader({
      resolve: () => this.#resolve().then(({ stderr }) => stderr),
    });

    this.#cmd = cmd;
    this.#baseError = new ProcessError({
      combined: "",
      stderr: "",
      stdout: "",
      status: { code: 1, success: false, signal: undefined },
      retries: 0,
    });
    Error.captureStackTrace(this.#baseError, errorContext);

    if ($.verbose) {
      console.log($.brightBlue("$ %s"), cmd);
    }
  }

  get #process(): Deno.Process {
    if (!this.#proc) {
      this.#proc = Deno.run({
        cmd: [$.shell, "-c", $.prefix + " " + this.#cmd],
        env: {
          ...Deno.env.toObject(),
          ...this.#env,
        },
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

  /**
   * Execute the shell command and _only returns its exit code_.
   * This calls internally `.noThrow` to catch the error and return the exit code.
   *
   * ```ts
   * const trueStatus = await $`true`.statusCode;
   * console.log(trueStatus); // -> 0
   *
   * const falseStatus = await $`false`.statusCode;
   * console.log(falseStatus); // -> 1
   *
   * const exitStatus = await $`exit 2`.statusCode;
   * console.log(exitStatus); // -> 2
   * ```
   */
  get statusCode(): Promise<number> {
    return this.noThrow.#resolve().then(({ status }) => status.code);
  }

  /**
   * Execute the shell command and return the output.
   *
   * ```ts
   * const output = await $`echo Hello; echo world >&2`.stdout;
   * console.log(output); // -> "Hello\n"
   * ```
   */
  get stdout(): Reader<string> {
    return this.#stdoutReader;
  }

  /**
   * Execute the shell command and return the output.
   *
   * ```ts
   * const errorOutput = await $`echo Hello; echo world >&2`.stderr;
   * console.log(errorOutput); // -> "World\n"
   * ```
   */
  get stderr(): Reader<string> {
    return this.#stderrReader;
  }

  retry(retries: number | RetryCallback): this {
    this.#shouldRetry = typeof retries === "number"
      ? (error) => error.retries < retries
      : (error) => retries(error);

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

  env(name: string, value: string | number | boolean): this {
    this.#env[name] = value.toString();
    return this;
  }

  kill(signo: Deno.Signal): void {
    this.#isKilled = true;
    this.#process.kill(signo);
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
        const error = ProcessError.merge(
          this.#baseError,
          new ProcessError(output),
        );

        if (await this.#shouldRetry?.(error)) {
          if (this.#delay) {
            await new Promise((resolve) =>
              this.#timers.push(setTimeout(resolve, this.#delay))
            );
          }
          this.#close();
          this.#proc = null;
          this.#retries++;

          return this.#run();
        } else if (this.#throwErrors) {
          throw error;
        }
        output = error;
      }
      this.#close();
      this.#closeTimer();

      return output;
    } catch (error) {
      this.#close();
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
      await writeAll(
        outputStream,
        new TextEncoder().encode(line + "\n"),
      );
    }
  }
}
