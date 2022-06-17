import { colors, streams } from "./deps.ts";
import { Reader } from "./reader.ts";
import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { Writer } from "./writer.ts";
import { LineStream } from "./lib/line_stream.ts";

type SpawnOptions = {
  stdin: "piped";
  stdout: "piped";
  stderr: "piped";
};

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
      then: async () => {
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

    this.#stdout = new Reader(this, {
      id: id + colorize(":stdout", Child.#count),
      done: () => this.#done(),
      return: () => this,
    });

    this.#stderr = new Reader(stderr, {
      id: id + colorize(":stderr", Child.#count),
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
      this.stdout.catch(() => ""),
      this.stderr.catch(() => ""),
      this.combined.catch(() => ""),
      this.#child.status,
    ]);

    return new ProcessOutput({ status, stdout, stderr, combined });
  }

  async #done(): Promise<void> {
    if (this.#isDone) {
      return;
    }
    const streams = [
      this.#stdin.writable,
      this.#stdout.readable,
      this.#stderr.readable,
      this.#combined.readable,
    ];
    this.#isDone = streams.every((stream) => !stream.locked);

    if (!this.#isDone) {
      return;
    }

    await Promise.all(
      streams.map((stream) =>
        "cancel" in stream
          ? stream.cancel()
          : this.#closeStdin && stream.close()
      ),
    );
  }

  get noThrow() {
    this.#throwErrors = false;
    return this;
  }

  kill(signo: Deno.Signal) {
    this.#child.kill(signo);
  }
}
