const encoder = new TextEncoder();

export class Writer implements Deno.Writer, Deno.Closer {
  #stream: WritableStream<Uint8Array>;
  #_writer?: WritableStreamDefaultWriter<Uint8Array>;

  constructor(
    stream: WritableStream<Uint8Array>,
  ) {
    this.#stream = stream;
  }

  get #writer(): WritableStreamDefaultWriter<Uint8Array> {
    if (!this.#_writer) {
      this.#_writer = this.#stream.getWriter();
    }
    return this.#_writer;
  }

  async write(data: Uint8Array | string): Promise<number> {
    const writer = this.#stream.getWriter();
    data = typeof data === "string" ? encoder.encode(data) : data;
    await writer.write(data);
    writer.releaseLock();
    return data.byteLength;
  }

  get writable(): WritableStream<Uint8Array> {
    return this.#stream;
  }

  close(): Promise<void> {
    return this.#stream.close();
  }
}
