import { BytesList } from "../deps.ts";

const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);

export interface LineStreamOptions {
  keepLineBreaks?: boolean;
}

/**
 * Transform a stream into a stream where each chunk is divided by a newline,
 * be it `\n` or `\r\n`.
 *
 * ```ts
 * import { LineStream } from "./line_stream.ts";
 * const res = await fetch("https://example.com");
 * const lines = res.body!.pipeThrough(new LineStream());
 * ```
 */
export class LineStream extends TransformStream<Uint8Array, Uint8Array> {
  #bufs = new BytesList();
  #prevHadCR = false;
  #keepLineBreak: boolean;

  constructor({ keepLineBreaks = false }: LineStreamOptions = {}) {
    super({
      transform: (chunk, controller) => {
        this.#handle(chunk, controller);
      },
      flush: (controller) => {
        controller.enqueue(this.#mergeBufs(false));
      },
    });
    this.#keepLineBreak = keepLineBreaks;
  }

  #handle(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>,
  ) {
    const lfIndex = chunk.indexOf(LF);

    if (this.#prevHadCR) {
      this.#prevHadCR = false;
      if (lfIndex === 0 && !this.#keepLineBreak) {
        controller.enqueue(this.#mergeBufs(true));
        this.#handle(chunk.subarray(1), controller);
        return;
      }
    }

    if (lfIndex === -1) {
      if (chunk.at(-1) === CR) {
        this.#prevHadCR = true;
      }
      this.#bufs.add(chunk);
    } else {
      let crOrLfIndex = lfIndex;
      if (this.#keepLineBreak) {
        crOrLfIndex++;
      } else if (chunk[lfIndex - 1] === CR) {
        crOrLfIndex--;
      }
      this.#bufs.add(chunk.subarray(0, crOrLfIndex));
      controller.enqueue(this.#mergeBufs(false));
      this.#handle(chunk.subarray(lfIndex + 1), controller);
    }
  }

  #mergeBufs(prevHadCR: boolean): Uint8Array {
    const mergeBuf = this.#bufs.concat();
    this.#bufs = new BytesList();

    if (prevHadCR && !this.#keepLineBreak) {
      return mergeBuf.subarray(0, -1);
    } else {
      return mergeBuf;
    }
  }
}
