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
    data = typeof data === "string" ? encoder.encode(data) : data;
    await this.#writer.write(data);
    return data.byteLength;
  }

  get writable(): WritableStream<Uint8Array> {
    return this.#stream;
  }

  async close(): Promise<void> {
    await this.#stream.close();
  }
}
