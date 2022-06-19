import { assert, assertEquals, assertObjectMatch } from "../../dev_deps.ts";
import { $, ProcessOutput } from "./mod.ts";

function createOutput(): ProcessOutput {
  return new ProcessOutput({
    stdout: "foo",
    stderr: "bar",
    combined: "foobaz",
    status: {
      code: 0,
      success: true,
      signal: null,
    },
  });
}

Deno.test({
  name: "[process output] should have all properties defined",
  fn() {
    const output = createOutput();
    assertEquals(output.stdout, "foo");
    assertEquals(output.stderr, "bar");
    assertEquals(output.combined, "foobaz");
    assertObjectMatch(output.status, {
      code: 0,
      success: true,
      signal: null,
    });
  },
});

Deno.test({
  name: "[process output] should return an instance of process output",
  async fn() {
    const output = await $`exit 0`;
    assert(output instanceof ProcessOutput);
  },
});

Deno.test({
  name: "[process output] should return an instance of process output",
  async fn() {
    const output = await $`echo foo; echo bar >&2`;
    assertEquals(output.stdout, "foo\n");
    assertEquals(output.stderr, "bar\n");
    assertEquals(output.combined, "foo\nbar\n");
    assertObjectMatch(output.status, {
      code: 0,
      success: true,
      signal: null,
    });
  },
});
