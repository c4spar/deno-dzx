import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { assert } from "https://deno.land/std@0.140.0/_util/assert.ts";
import { LineStream } from "./line_stream.ts";

Deno.test("[streams] LineStream", async () => {
  const textStream = new ReadableStream({
    start(controller) {
      controller.enqueue("qwertzu");
      controller.enqueue("iopasd\r\nmnbvc");
      controller.enqueue("xylk\njhgfds\napoiuzt");
      controller.enqueue("qwr09eiqwrjiowqr\r");
      controller.enqueue("\nrewq0987654321\n");
      controller.enqueue("foo\n\r\n\nbar");
      controller.close();
    },
  });

  const lines = textStream
    .pipeThrough(new TextEncoderStream())
    .pipeThrough(new LineStream())
    .pipeThrough(new TextDecoderStream());
  const reader = lines.getReader();

  const a = await reader.read();
  assertEquals(a.value, "qwertzuiopasd");
  const b = await reader.read();
  assertEquals(b.value, "mnbvcxylk");
  const c = await reader.read();
  assertEquals(c.value, "jhgfds");
  const d = await reader.read();
  assertEquals(d.value, "apoiuztqwr09eiqwrjiowqr");
  const e = await reader.read();
  assertEquals(e.value, "rewq0987654321");
  const f = await reader.read();
  assertEquals(f.value, "foo");
  const g = await reader.read();
  assertEquals(g.value, "bar");
  const h = await reader.read();
  assert(h.done);
});

Deno.test("[streams] LineStream with keepLineBreak enabled", async () => {
  const textStream = new ReadableStream({
    start(controller) {
      controller.enqueue("qwertzu");
      controller.enqueue("iopasd\r\nmnbvc");
      controller.enqueue("xylk\njhgfds\napoiuzt");
      controller.enqueue("qwr09eiqwrjiowqr\r");
      controller.enqueue("\nrewq0987654321\n");
      controller.enqueue("foo\n\r\n\nbar");
      controller.close();
    },
  });

  const lines = textStream
    .pipeThrough(new TextEncoderStream())
    .pipeThrough(new LineStream({ keepLineBreaks: true }))
    .pipeThrough(new TextDecoderStream());
  const reader = lines.getReader();

  const a = await reader.read();
  assertEquals(a.value, "qwertzuiopasd\r\n");
  const b = await reader.read();
  assertEquals(b.value, "mnbvcxylk\n");
  const c = await reader.read();
  assertEquals(c.value, "jhgfds\n");
  const d = await reader.read();
  assertEquals(d.value, "apoiuztqwr09eiqwrjiowqr\r\n");
  const e = await reader.read();
  assertEquals(e.value, "rewq0987654321\n");
  const f = await reader.read();
  assertEquals(f.value, "foo\n");
  const g = await reader.read();
  assertEquals(g.value, "\r\n");
  const h = await reader.read();
  assertEquals(h.value, "\n");
  const i = await reader.read();
  assertEquals(i.value, "bar");
  const j = await reader.read();
  assert(j.done);
});
