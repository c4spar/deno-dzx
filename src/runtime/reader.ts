import { async, colors, streams } from "./deps.ts";
import { Child } from "./child.ts";
import { ProcessOutput } from "./process_output.ts";
import { isTemplateStringArray, parseCmd, toRgb } from "./lib/utils.ts";

export type SpawnOptions = {
  stdin: "piped";
  stdout: "piped";
  stderr: "piped";
};

export type Readable<T, R> =
  | ReadableStream<Uint8Array>
  | TransformStream<Uint8Array, Uint8Array>
  | Reader<T, R>
  | Deno.Child<{ stdout: "piped" }>
  | { readonly readable: ReadableStream<Uint8Array> };

export type Writable =
  | Deno.Writer
  | WritableStream<Uint8Array>
  | { readonly writable: WritableStream<Uint8Array> };

export type Transformable =
  | Deno.Reader & Deno.Writer
  | TransformStream<Uint8Array, Uint8Array>
  | Deno.Child<SpawnOptions>
  | Child;

export interface ReaderOptions<
  T = string,
  R = undefined,
> {
  id?: string;
  then?(): T | Promise<T>;
  done?(): unknown | Promise<unknown>;
  return?(): R;
}

export class Reader<
  T = string,
  R = undefined,
> implements AsyncIterableIterator<string>, Promise<T> {
  static #count = 0;
  readonly #options: ReaderOptions<T, R>;
  readonly #id: string;
  #parent?: Reader<unknown, unknown>;
  #deferred?: async.Deferred<T>;
  #isDone = false;
  #_stream: ReadableStream<Uint8Array> | Reader<unknown, unknown>;
  #_textStream?: ReadableStream<string>;
  #_textStreamReader?: ReadableStreamDefaultReader<string>;

  constructor(
    stream: ReadableStream<Uint8Array> | Reader<unknown, unknown>,
    options: ReaderOptions<T, R> = {},
  ) {
    this.#id = options?.id ?? "#child-stream" + ++Reader.#count;
    this.#_stream = stream;
    this.#options = options;
  }

  [Symbol.toStringTag] = "Reader";

  [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    return this;
  }

  get #stream(): ReadableStream<Uint8Array> {
    return this.#_stream instanceof Reader
      ? this.#_stream.#stream
      : this.#_stream;
  }

  set #stream(stream: ReadableStream<Uint8Array>) {
    if (this.#_stream instanceof Reader) {
      this.#_stream.#stream = stream;
    } else {
      this.#_stream = stream;
    }
  }

  get #textStream(): ReadableStream<string> {
    if (!this.#_textStream) {
      this.#_textStream = this.#stream
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new streams.TextLineStream());
    }
    return this.#_textStream;
  }

  get #textStreamReader(): ReadableStreamDefaultReader<string> {
    if (!this.#_textStreamReader) {
      this.#_textStreamReader = this.#textStream.getReader();
    }
    return this.#_textStreamReader;
  }

  async next(): Promise<IteratorResult<string>> {
    this.checkAlreadyDone();
    const { value, done } = await this.#textStreamReader.read();
    if (done) {
      this.#textStreamReader.releaseLock();
      await this.#done();
    }
    return done ? { value: undefined, done } : { value, done: false };
  }

  then<R = T, C = never>(
    resolve?:
      | ((value: T) => R | PromiseLike<R>)
      | undefined
      | null,
    reject?:
      | ((reason: unknown) => C | PromiseLike<C>)
      | undefined
      | null,
  ): Promise<R | C> {
    if (!this.#deferred) {
      this.#deferred = async.deferred();
      const lines = [];

      (async () => {
        try {
          let result: T;
          if (this.#options.then) {
            result = await this.#options.then();
            await this.#done();
          } else {
            this.checkAlreadyDone();
            for await (const line of this) {
              lines.push(line);
            }
            result = lines.join("\n") as unknown as T;
          }
          this.#deferred!.resolve(result);
        } catch (error: unknown) {
          await this.#done();
          this.#deferred!.reject(error);
        }
      })();
    }

    return this.#deferred.then(resolve, reject);
  }

  catch<C = never>(
    reject?:
      | ((error: unknown) => C | PromiseLike<C>)
      | undefined
      | null,
  ): Promise<T | C> {
    return this.then().catch(reject);
  }

  finally(done?: (() => void) | null): Promise<T> {
    return this.then().finally(done);
  }

  get locked(): boolean {
    return this.#stream.locked || !!this.#_textStream?.locked;
  }

  get readable(): ReadableStream<Uint8Array> {
    return this.#stream;
  }

  async cancel(reason?: unknown): Promise<void> {
    await this.#stream.cancel(reason);
  }

  getReader(options: { mode: "byob" }): ReadableStreamBYOBReader;
  getReader(
    options?: { mode?: undefined },
  ): ReadableStreamDefaultReader<string>;
  getReader(
    { mode }: { mode?: "byob" } = {},
  ): ReadableStreamBYOBReader | ReadableStreamDefaultReader<string> {
    this.checkAlreadyDone();
    return this.#stream.getReader({ mode: mode as "byob" });
  }

  pipeThrough(
    dest: TemplateStringsArray,
    ...args: Array<string | number | ProcessOutput>
  ): Child;
  pipeThrough<C extends Child>(dest: C, options?: PipeOptions): C;
  pipeThrough(dest: Deno.Child<SpawnOptions>, options?: PipeOptions): Child;
  pipeThrough(dest: Transformable, options?: PipeOptions): R;
  pipeThrough<C extends Child>(
    dest: TemplateStringsArray | Transformable | Child,
    ...args: [PipeOptions?] | Array<string | number | ProcessOutput>
  ): (R extends undefined ? this : R) | C | Child {
    this.checkAlreadyDone();

    if (
      (
        ("writable" in dest && "readable" in dest) ||
        ("write" in dest && "read" in dest)
      ) && !(dest instanceof Child)
    ) {
      const options = this.getSpawnOptions(dest, args);

      const stream = "writable" in dest ? dest : {
        writable: streams.writableStreamFromWriter(dest),
        readable: streams.readableStreamFromReader(dest),
      };

      this.#pipeTo(this.#stream, stream.writable, [options]);
      this.#stream = stream.readable;

      return this.#return();
    }

    const child: Child = isTemplateStringArray(dest)
      ? Child.spawn(
        parseCmd(dest, ...args as Array<string | number | ProcessOutput>),
      )
      : dest instanceof Deno.Child
      ? new Child(dest)
      : dest;

    child.#parent = this;

    this.#pipeTo(this.#stream, child);

    return child;
  }

  async pipeTo(dest: Writable, options?: PipeOptions): Promise<void> {
    this.checkAlreadyDone();
    await this.#pipeTo(this.#stream, dest, [options]);
    await this.#done();
  }

  async #pipeTo(
    source: ReadableStream<Uint8Array>,
    dest: Writable,
    args: [PipeOptions?] | Array<string | number | ProcessOutput> = [],
  ): Promise<void> {
    try {
      await source.pipeTo(
        dest instanceof WritableStream
          ? dest
          : "writable" in dest
          ? dest.writable
          : streams.writableStreamFromWriter(dest),
        this.getSpawnOptions(dest, args),
      );
    } catch (error) {
      if (error instanceof Deno.errors.BrokenPipe) {
        // Ignore broken pipe error. Should be handled by target stream.
        return;
      }
    }
  }

  protected getSpawnOptions(
    dest: TemplateStringsArray | Transformable | Writable | Child,
    args: [PipeOptions?] | Array<string | number | ProcessOutput>,
  ) {
    return {
      preventClose: dest === Deno.stdout ||
        dest === Deno.stdout.writable ||
        dest === Deno.stderr || dest === Deno.stderr.writable,
      ...args[0] as PipeOptions,
    };
  }

  protected checkAlreadyDone() {
    if (this.#isDone) {
      throw new Error("Child is already done.");
    }
  }

  async #done() {
    if (!this.#isDone) {
      this.#isDone = true;
      if (this.#parent) {
        await this.#parent;
      }
      await this.#options.done?.();
    }
  }

  #return(): R extends undefined ? this : R {
    return (this.#options.return?.() ?? this) as (
      R extends undefined ? this : R
    );
  }

  protected log(arg: unknown, ...args: Array<unknown>): void {
    if (typeof arg !== "string") {
      args = [arg, ...args];
    }
    console.log(
      "[%s]" + (typeof arg === "string" ? " " + arg : ""),
      colors.rgb24(this.#id, toRgb("A" + this.#id)),
      ...args,
    );
  }
}
