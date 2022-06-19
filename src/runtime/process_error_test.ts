import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from "../../dev_deps.ts";
import { $, ProcessError } from "./mod.ts";

function createError(): ProcessError {
  return new ProcessError({
    stdout: "foo",
    stderr: "bar",
    combined: "baz",
    status: {
      code: 1,
      success: false,
      signal: null,
    },
  });
}

Deno.test({
  name: "[process error] should be an instance of error",
  fn() {
    const error = createError();
    assert(error instanceof Error);
    assert(error instanceof ProcessError);
  },
});

Deno.test({
  name: "[process error] should have all properties defined",
  fn() {
    const error = createError();
    assertEquals(error.stdout, "foo");
    assertEquals(error.stderr, "bar");
    assertEquals(error.combined, "baz");
    assertObjectMatch(error.status, {
      code: 1,
      success: false,
      signal: null,
    });
  },
});

Deno.test({
  name: "[process error] should throw an instance of error",
  async fn() {
    await assertRejects(() => $`exit 1`, Error);
  },
});

Deno.test({
  name: "[process error] should throw an instance of process error",
  async fn() {
    await assertRejects(() => $`exit 1`, ProcessError);
  },
});

Deno.test({
  name: "[process error] should have correct exit code",
  async fn() {
    const statusCode = await $`exit 2`.catch((error) =>
      error instanceof ProcessError ? error.status.code : null
    );
    assertEquals(statusCode, 2);
  },
});

Deno.test({
  name: "[process error] should throw an error if source fails when piping",
  async fn() {
    await assertRejects(() => $`exit 1`.pipeThrough`grep foo`, ProcessError);
  },
});

Deno.test({
  name: "[process error] should throw an error if target fails when piping",
  async fn() {
    await assertRejects(() => $`echo foo`.pipeThrough`exit 1`, ProcessError);
  },
});
