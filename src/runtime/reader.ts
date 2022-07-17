export interface ReaderOptions<TResolve> {
  resolve(): Promise<TResolve>;
}

export class Reader<TResolve> {
  #opts: ReaderOptions<TResolve>;

  constructor(opts: ReaderOptions<TResolve>) {
    this.#opts = opts;
  }

  then<TResult1 = TResolve, TResult2 = never>(
    onfulfilled?:
      | ((value: TResolve) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.#opts.resolve().then(onfulfilled).catch(onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<TResolve | TResult> {
    return this.#opts.resolve().catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<TResolve> {
    return this.#opts.resolve().finally(onfinally);
  }
}
