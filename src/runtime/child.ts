import { colors, streams } from "./deps.ts";
import { ChildStream } from "./child_stream.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { Writer } from "./writer.ts";
import { LineStream } from "./lib/line_stream.ts";

// /** A handle for `stdin`. */
// export const stdin: Reader & ReaderSync & Closer & {
//   readonly rid: number;
//   readonly readable: ReadableStream<Uint8Array>;
// };
// /** A handle for `stdout`. */
// export const stdout: Writer & WriterSync & Closer & {
//   readonly rid: number;
//   readonly writable: WritableStream<Uint8Array>;
// };
// /** A handle for `stderr`. */
// export const stderr: Writer & WriterSync & Closer & {
//   readonly rid: number;
//   readonly writable: WritableStream<Uint8Array>;
// };

// export class Child<T extends SpawnOptions> {
//   readonly stdin: T["stdin"] extends "piped" ? WritableStream<Uint8Array>
//     : null;
//   readonly stdout: T["stdout"] extends "inherit" | "null" ? null
//     : ReadableStream<Uint8Array>;
//   readonly stderr: T["stderr"] extends "inherit" | "null" ? null
//     : ReadableStream<Uint8Array>;

//   readonly pid: number;
//   /** Get the status of the child. */
//   readonly status: Promise<ChildStatus>;

//   /** Waits for the child to exit completely, returning all its output and status. */
//   output(): Promise<SpawnOutput<T>>;
//   /** Kills the process with given Signal. */
//   kill(signo: Signal): void;
// }

type SpawnOptions = {
  stdin: "piped";
  stdout: "piped";
  stderr: "piped";
};

const encoder = new TextEncoder();

const colorList = [
  colors.blue,
  colors.yellow,
  colors.magenta,
  colors.red,
  colors.green,
];

function colorize(str: string, index: number) {
  while (index >= colorList.length) {
    index -= colorList.length;
  }
  return colorList[index](str);
}

export class Child extends ChildStream<ProcessOutput, Child>
  implements
    WritableStream<Uint8Array>,
    TransformStream<Uint8Array, Uint8Array>,
    Omit<Deno.Child<SpawnOptions>, "stdin" | "stdout" | "stderr" | "output"> // Deno.Writer
{
  static #count = 0;
  readonly #id: string;
  readonly #child: Deno.Child<SpawnOptions>;
  readonly #stdout: ChildStream<string, Child>;
  readonly #stderr: ChildStream<string, Child>;
  readonly #combined: ChildStream<string, Child>;
  readonly #stdin: Writer;
  #writer?: WritableStreamDefaultWriter<Uint8Array>;
  #throwErrors = true;
  #closeStdin = true;
  #isDone = false;

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
    const id = colorize("#" + Child.#count, Child.#count);

    super(stdout, {
      id,
      output: async () => {
        const output = await this.output();
        if (!output.status.success && this.#throwErrors) {
          throw new ProcessError(output);
        }
        return output;
      },
      done: () => this.#done(),
      return: () => this,
    });

    this.#id = id;
    this.#child = child;

    this.#stdin = new Writer(child.stdin);

    this.#stdout = new ChildStream(this, {
      id: id + colorize(":stdout", Child.#count),
      done: () => this.#done(),
      return: () => this,
    });

    this.#stderr = new ChildStream(stderr, {
      id: id + colorize(":stderr", Child.#count),
      done: () => this.#done(),
      return: () => this,
    });

    this.#combined = new ChildStream(
      streams.zipReadableStreams(
        ...[stdoutCombined, stderrCombined].map((stream) =>
          stream.pipeThrough(new LineStream({ keepLineBreak: true }))
        ),
      ),
      {
        id: id + colorize(":combined", Child.#count),
        done: () => this.#done(),
        return: () => this,
      },
    );
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
    this.#closeStdin = false;
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
    this.#closeStdin = false;
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

  // async #done(): Promise<void> {
  //   if (this.#isDone) {
  //     return;
  //   }
  //   this.#isDone = true;
  //   this.log("done...", { closeStdin: this.#closeStdin });

  //   this.#closeStdin && !this.stdin.locked && await this.stdin.close();

  //   await Promise.all([
  //     this.#stdout,
  //     this.#stderr,
  //     this.#combined,
  //   ].map((stream) => !stream.locked && stream.cancel()));
  // }

  async #done(): Promise<void> {
    this.log("done...");
    if (this.#isDone) {
      return;
    }
    const streams = [
      this.#stdin,
      // this.#child.stdin,
      this.#stdout,
      this.#stderr,
      this.#combined,
    ];
    this.#isDone = streams.every((stream) => !stream.locked);

    if (this.#isDone) {
      this.log("done...", { closeStdin: this.#closeStdin });
      await Promise.all(
        streams.map((stream) =>
          "cancel" in stream
            ? stream.cancel()
            : this.#closeStdin && stream.close()
        ),
      );
    }
  }

  // async #done(): Promise<void> {
  //   if (this.#isDone) {
  //     return;
  //   }
  //   this.#isDone = true;
  //   this.log("done...", { closeStdin: this.#closeStdin });

  //   this.#closeStdin && !this.stdin.locked && await this.stdin.close();

  //   await Promise.all([
  //     this.#stdout,
  //     this.#stderr,
  //     this.#combined,
  //   ].map((stream) => !stream.locked && stream.cancel()));
  // }

  get noThrow() {
    this.#throwErrors = false;
    return this;
  }

  kill(signo: Deno.Signal) {
    this.#child.kill(signo);
    this.stdin.close();
  }

  abort(reason?: unknown): Promise<void> {
    return this.#stdin.writable.abort(reason);
  }

  async close(): Promise<void> {
    await this.#stdin.close();
  }

  getWriter(): WritableStreamDefaultWriter<Uint8Array> {
    this.#closeStdin = false;
    // return this.stdin.getWriter();
    return this.#stdin.writable.getWriter();
  }

  // async write(data: Uint8Array | string): Promise<number> {
  //   if (!this.#writer) {
  //     this.#writer = this.stdin.writable.getWriter();
  //   }
  //   data = typeof data === "string" ? encoder.encode(data) : data;
  //   await this.#writer.write(data);
  //   return data.byteLength;
  // }
}
