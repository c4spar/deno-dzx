import { BufReader, concat } from "../deps.ts";

export async function* readLines(
  reader: Deno.Reader,
  isCanceld: () => boolean,
): AsyncIterableIterator<string> {
  const bufReader = new BufReader(reader);
  let chunks: Uint8Array[] = [];
  const decoder = new TextDecoder();
  while (!isCanceld()) {
    console.log("read");
    const res = await bufReader.readLine();
    console.log("read done");
    if (!res) {
      if (chunks.length > 0) {
        yield decoder.decode(concat(...chunks));
      }
      break;
    }
    chunks.push(res.line);
    if (!res.more) {
      yield decoder.decode(concat(...chunks));
      chunks = [];
    }
  }
}
