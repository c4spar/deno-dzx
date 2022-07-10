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
      code: 0,
      success: true,
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
    assertObjectMatch(error, {
      stdout: "foo",
      stderr: "bar",
      combined: "baz",
      status: {
        code: 0,
        success: true,
      },
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
    const statusCode = await $`exit 2`.catch((error) => error.status.code);
    assertEquals(statusCode, 2);
  },
});
