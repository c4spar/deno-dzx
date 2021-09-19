import type { Process } from "./process.ts";

export interface ReaderOptions<T> {
  reader: () => Deno.Reader;
  resolve: () => Promise<T>;
  copy: (dest: Deno.Writer | Process) => Process;
}

export class Reader<T> implements Deno.Reader, Promise<T> {
  #reader: () => Deno.Reader;
  #resolve: () => Promise<T>;
  #copy: (dest: Deno.Writer | Process) => Process;

  constructor({ reader, resolve, copy }: ReaderOptions<T>) {
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
