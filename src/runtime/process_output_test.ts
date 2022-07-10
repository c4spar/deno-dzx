import { assert, assertObjectMatch } from "../../dev_deps.ts";
import { $, ProcessOutput } from "./mod.ts";

function createOutput(): ProcessOutput {
  return new ProcessOutput({
    stdout: "foo",
    stderr: "bar",
    combined: "foobaz",
    retries: 0,
    status: {
      code: 0,
      success: true,
    },
  });
}

Deno.test({
  name: "[process error] should have all properties defined",
  fn() {
    const output = createOutput();
    assertObjectMatch(output, {
      stdout: "foo",
      stderr: "bar",
      combined: "foobaz",
      retries: 0,
      status: {
        code: 0,
        success: true,
      },
    });
  },
});

Deno.test({
  name: "[process error] should return an instance of process output",
  async fn() {
    const output = await $`exit 0`;
    assert(output instanceof ProcessOutput);
  },
});

Deno.test({
  name: "[process error] should return an instance of process output",
  async fn() {
    const output = await $`echo foo; echo bar >&2`;
    assertObjectMatch(output, {
      stdout: "foo\n",
      stderr: "bar\n",
      combined: "foo\nbar\n",
      retries: 0,
      status: {
        code: 0,
        success: true,
      },
    });
  },
});
