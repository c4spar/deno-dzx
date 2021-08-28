import { assert, assertEquals, assertThrowsAsync } from "../../dev_deps.ts";
import "../../mod.ts";
import { Process } from "./process.ts";
import { ProcessError } from "./process_error.ts";

Deno.test({
  name: "[process] should return process output if $ is called",
  async fn() {
    const { stdout, stderr }: {
      stdout: string;
      stderr: string;
    } = await new Process("echo foo; echo bar >&2");
    assertEquals({ stdout, stderr }, { stdout: "foo\n", stderr: "bar\n" });
  },
});

Deno.test({
  name: "[process] should have a rid",
  async fn() {
    const process = new Process("echo foo; echo bar >&2");
    assert(!isNaN(process.rid));
    await process;
  },
});

Deno.test({
  name: "[process] should have a pid",
  async fn() {
    const process = new Process("echo foo; echo bar >&2");
    assert(!isNaN(process.pid));
    await process;
  },
});

Deno.test({
  name: "[process] should return process status if status is called",
  async fn() {
    const { code, success } = await new Process("echo foo; echo bar >&2")
      .status();
    assert(success);
    assertEquals(code, 0);
  },
});

Deno.test({
  name: "[process] should return exit code if statusCode is called",
  async fn() {
    const statusCode: number = await new Process("echo foo; echo bar >&2")
      .statusCode();
    assertEquals(statusCode, 0);
  },
});

Deno.test({
  name: "[process] should return stdout if output is called",
  async fn() {
    const stdout: string = await new Process("echo foo; echo bar >&2").output();
    assertEquals(stdout, "foo\n");
  },
});

Deno.test({
  name: "[process] should return stderr if stderrOutput is called",
  async fn() {
    const stderr: string = await new Process("echo foo; echo bar >&2")
      .stderrOutput();
    assertEquals(stderr, "bar\n");
  },
});

// @TODO: kill does not work with bash and `set -euo pipefail;`.
// Deno.test({
//   name: "[process] should stop the process if kill is called (bash)",
//   async fn() {
//     const start = Date.now();
//     await assertThrowsAsync(
//       () => {
//         $.shell = "/bin/bash";
//         const process = new Process("sleep 10");
//         setTimeout(() => process.kill(Deno.Signal.SIGKILL), 10);
//         return process;
//       },
//       ProcessError,
//     );
//     assert(Date.now() - start < 100, "process.kill() took too long");
//   },
// });

Deno.test({
  name: "[process] should stop the process if kill is called (zsh)",
  async fn() {
    const start = Date.now();
    await assertThrowsAsync(
      () => {
        $.shell = "/bin/zsh";
        const process = new Process("sleep 10");
        setTimeout(() => process.kill(Deno.Signal.SIGKILL), 10);
        return process;
      },
      ProcessError,
    );
    assert(Date.now() - start < 1000, "process.kill() took too long");
  },
});

Deno.test({
  name: "[process] should copy stdout",
  async fn() {
    const writer = new io.StringWriter("value: ");
    await new Process("echo foo; echo bar >&2").copy(writer);
    assertEquals(writer.toString().trim(), "value: foo");
  },
});

// @TODO: read from stdin does not work
// Deno.test({
//   name: "[process] should read stdin",
//   async fn() {
//     const reader = new io.StringReader("foo");
//     const cat = new Process("cat");
//     await io.copy(reader, cat);
//     const output = await cat;
//     assertEquals(output.toString().trim(), "foo");
//   },
// });

Deno.test({
  name: "[process] should iterate over stdout line by line",
  async fn() {
    const lines: Array<string> = [];
    for await (
      const line of new Process(
        "echo foo; echo bar >&2; echo baz; echo baz >&2",
      )
    ) {
      lines.push(line);
    }
    assertEquals(lines, ["foo", "baz"]);
  },
});
