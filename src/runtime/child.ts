import { colors, streams } from "./deps.ts";
import { DelimiterStream } from "./lib/delimiter_stream.ts";
import { ChildStream } from "./child_stream.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";

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
    Omit<Deno.Child<SpawnOptions>, "stdin" | "stdout" | "stderr" | "output"> {
  static #count = 0;
  #id: string;
  #child: Deno.Child<SpawnOptions>;
  #throwErrors = true;
  #closeStdin = true;
  #stdout: ChildStream<string, Child>;
  #stderr: ChildStream<string, Child>;
  #combined: ChildStream<string, Child>;
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
    const id = colorize("#child" + Child.#count, Child.#count);

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
          stream.pipeThrough(new DelimiterStream(encoder.encode("\n")))
        ),
      ),
      {
        id: id + colorize(":combined", Child.#count),
        done: () => this.#done(),
        return: () => this,
      },
    );

    this.#id = id;
    this.#child = child;
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
    return this.#child.stdin;
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
    return this.stdin;
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
    this.#isDone = true;
    this.log("done...", { closeStdin: this.#closeStdin });

    this.#closeStdin && !this.stdin.locked && await this.stdin.close();

    await Promise.all([
      this.#stdout,
      this.#stderr,
      this.#combined,
    ].map((stream) => !stream.locked && stream.cancel()));
  }

  get noThrow() {
    this.#throwErrors = false;
    return this;
  }

  kill(signo: Deno.Signal) {
    this.#child.kill(signo);
    this.stdin.close();
  }

  abort(reason?: unknown): Promise<void> {
    return this.stdin.abort(reason);
  }

  async close(): Promise<void> {
    await this.stdin.close();
  }

  getWriter(): WritableStreamDefaultWriter<Uint8Array> {
    this.#closeStdin = false;
    return this.stdin.getWriter();
  }
}
