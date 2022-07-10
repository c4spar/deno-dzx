import { streams } from "./deps.ts";
import { Reader } from "./reader.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { Writer } from "./writer.ts";
import { LineStream } from "./lib/line_stream.ts";
import { getId, getLabel } from "./lib/utils.ts";

type SpawnOptions = {
  stdin: "piped";
  stdout: "piped";
  stderr: "piped";
};

export class Child extends Reader<ProcessOutput, Child>
  implements
    TransformStream<Uint8Array, Uint8Array>,
    Omit<Deno.Child<SpawnOptions>, "stdin" | "stdout" | "stderr" | "output"> {
  static #count = 0;
  readonly #id: string;
  readonly #child: Deno.Child<SpawnOptions>;
  readonly #stdout: Reader<string, Child>;
  readonly #stderr: Reader<string, Child>;
  readonly #combined: Reader<string, Child>;
  readonly #stdin: Writer;
  #throwErrors = true;
  #autoCloseStdin = true;
  #isDone = false;
  #stdinClosePromise?: Promise<void>;

  static spawn(cmd: string) {
    if ($.verbose) {
      console.log($.brightBlue("$ %s"), cmd);
    }

    const child = Deno.spawnChild($.shell, {
      args: ["-c", $.prefix + " " + cmd],
      env: Deno.env.toObject(),
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    return new Child(child);
  }

  constructor(
    child: Deno.Child<SpawnOptions>,
  ) {
    Child.#count++;
    const [stdout, stdoutCombined] = child.stdout.tee();
    const [stderr, stderrCombined] = child.stderr.tee();
    const id = getId();

    super(stdout, {
      id,
      then: async () => {
        const output = await this.output();
        if (!output.status.success && this.#throwErrors) {
          throw new ProcessError(output);
        }
        return output;
      },
      flush: () => this.#closeStdin(),
      done: () => this.#done(),
      return: () => this,
    });

    this.#id = id;
    this.#child = child;

    this.#stdin = new Writer(child.stdin);

    this.#stdout = new Reader(this, {
      id: id + getLabel(":stdout"),
      flush: () => this.#closeStdin(),
      done: () => this.#done(),
      return: () => this,
    });

    this.#stderr = new Reader(stderr, {
      id: id + getLabel(":stderr"),
      flush: () => this.#closeStdin(),
      done: () => this.#done(),
      return: () => this,
    });

    this.#combined = new Reader(
      streams.zipReadableStreams(
        ...[stdoutCombined, stderrCombined].map((stream) =>
          stream.pipeThrough(new LineStream({ keepLineBreaks: true }))
        ),
      ),
      {
        id: id + getLabel(":combined"),
        done: () => this.#done(),
        return: () => this,
      },
    );
  }

  #closeStdin(): Promise<void> | void {
    if (this.#autoCloseStdin && !this.#stdinClosePromise) {
      this.#stdinClosePromise = this.#stdin.close();
    }
    return this.#stdinClosePromise;
  }

  get pid() {
    return this.#child.pid;
  }

  get status() {
    return this.noThrow.output().then(({ status }) => status);
  }

  get statusCode() {
    return this.status.then(({ code }) => code);
  }

  get stdin() {
    return this.#stdin;
  }

  get stdout() {
    return this.#stdout;
  }

  get stderr() {
    return this.#stderr;
  }

  get combined() {
    return this.#combined;
  }

  get writable() {
    this.#autoCloseStdin = false;
    return this.#child.stdin;
  }

  async output() {
    const [stdout, stderr, combined, status] = await Promise.all([
      this.stdout,
      this.stderr,
      this.combined,
      this.#child.status,
    ]);

    return new ProcessOutput({ status, stdout, stderr, combined });
  }

  async #done(): Promise<void> {
    if (this.#isDone) {
      return;
    }
    const readables = [
      this.#stdout.readable,
      this.#stderr.readable,
      this.#combined.readable,
    ];

    this.#isDone = readables.every((stream) => !stream.locked) &&
      !this.#stdin.writable.locked;

    if (!this.#isDone) {
      return;
    }

    await Promise.all([
      this.#closeStdin(),
      ...readables.map((stream) => stream.cancel()),
    ]);
  }

  get noThrow() {
    this.#throwErrors = false;
    return this;
  }

  kill(signo: Deno.Signal) {
    this.#child.kill(signo);
  }
}
