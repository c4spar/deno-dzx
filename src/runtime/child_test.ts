import { assert, assertEquals, assertRejects } from "../../dev_deps.ts";
import "../../mod.ts";
import { Child } from "./child.ts";
import { ProcessError } from "./process_error.ts";

Deno.test({
  name: "[child] should return process output if $ is called",
  async fn() {
    const { stdout, stderr }: {
      stdout: string;
      stderr: string;
    } = await Child.spawn("echo foo; echo bar >&2");
    assertEquals({ stdout, stderr }, { stdout: "foo\n", stderr: "bar\n" });
  },
});

Deno.test({
  name: "[child] should have a pid",
  async fn() {
    const process = Child.spawn("echo foo; echo bar >&2");
    assert(!isNaN(process.pid));
    await process;
  },
});

Deno.test({
  name: "[child] should return process status if status is called",
  async fn() {
    const { code, success } = await Child.spawn("echo foo; echo bar >&2")
      .status;
    assert(success);
    assertEquals(code, 0);
  },
});

Deno.test({
  name: "[child] should return exit code if statusCode is called",
  async fn() {
    const statusCode: number = await Child.spawn("echo foo; echo bar >&2")
      .statusCode;
    assertEquals(statusCode, 0);
  },
});

Deno.test({
  name: "[child] should return stdout if output is called",
  async fn() {
    const stdout: string = await Child.spawn("echo foo; echo bar >&2").stdout;
    assertEquals(stdout, "foo\n");
  },
});

Deno.test({
  name: "[child] should return stderr if stderrOutput is called",
  async fn() {
    const stderr: string = await Child.spawn("echo foo; echo bar >&2").stderr;
    assertEquals(stderr, "bar\n");
  },
});

Deno.test({
  name: "[child] should stop the process if kill is called (bash)",
  async fn() {
    const start = Date.now();
    await assertRejects(
      () => {
        $.shell = "/bin/bash";
        // @TODO: kill does not work with bash and `set -euo pipefail;`.
        $.prefix = "";
        const child = Child.spawn("sleep 10");
        child.kill("SIGKILL");
        return child;
      },
      ProcessError,
    );
    assert(Date.now() - start < 100, "process.kill() took too long");
  },
});

Deno.test({
  name: "[child] should stop the process if kill is called (zsh)",
  sanitizeResources: false,
  sanitizeOps: false,
  ignore: Deno.build.os !== "darwin",
  async fn() {
    const start = Date.now();
    await assertRejects(
      async () => {
        $.shell = "/bin/zsh";
        const child = Child.spawn("sleep 10");
        child.kill("SIGKILL");
        await child;
      },
      ProcessError,
    );
    assert(Date.now() - start < 5000, "process.kill() took too long");
  },
});

Deno.test({
  name: "[child] should iterate over stdout and stderr line by line",
  async fn() {
    const lines: Array<string> = [];
    for await (
      const line of Child.spawn("echo 1; echo 2 >&2; echo 3; echo 4 >&2")
    ) {
      lines.push(line);
    }
    assertEquals(lines, ["1", "3", ""]);
  },
});

Deno.test({
  name: "[child] should pipe to reader",
  async fn() {
    const buffer = new io.Buffer();
    await Child.spawn("echo -n 1; echo -n 2 >&2; echo -n 3; echo -n 4 >&2")
      .pipe(buffer);
    assertEquals(new TextDecoder().decode(buffer.bytes()), "13");
  },
});

Deno.test({
  name: "[child] should pipe stdout to reader",
  async fn() {
    const buffer = new io.Buffer();
    await Child.spawn("echo -n 1; echo -n 2 >&2; echo -n 3; echo -n 4 >&2")
      .stdout.pipe(buffer);
    assertEquals(new TextDecoder().decode(buffer.bytes()), "13");
  },
});

Deno.test({
  name: "[child] should pipe stderr to reader",
  async fn() {
    const buffer = new io.Buffer();
    await Child.spawn("echo -n 1; echo -n 2 >&2; echo -n 3; echo -n 4 >&2")
      .stderr.pipe(buffer);
    assertEquals(new TextDecoder().decode(buffer.bytes()), "24");
  },
});

Deno.test({
  name: "[child] should pipe file to cat",
  async fn() {
    const file = await Deno.open(new URL("./_test/foo.txt", import.meta.url));
    const output = await $(file).pipeThrough(Child.spawn("cat"));
    assertEquals(output.toString(), "foo bar\nbaz");
  },
});

Deno.test({
  name: "[child] should pipe to cat",
  async fn() {
    const output = await Child.spawn(`echo foo; echo bar >&2`).pipeThrough(
      Child.spawn("cat"),
    );
    assertEquals(output.toString(), "foo\n");
  },
});

Deno.test({
  name: "[child] should pipe stdout to cat",
  async fn() {
    const output = await Child.spawn(`echo foo; echo bar >&2`).stdout
      .pipe(
        Child.spawn("cat"),
      );
    assertEquals(output.toString(), "foo\n");
  },
});

Deno.test({
  name: "[child] should pipe stderr to cat",
  async fn() {
    const output = await Child.spawn(`echo foo; echo bar >&2`).stderr
      .pipe(
        Child.spawn("cat"),
      );
    assertEquals(output.toString(), "bar\n");
  },
});

Deno.test({
  name: "[child] should pipe combined to cat",
  async fn() {
    const output = await Child.spawn(`echo foo; echo bar >&2`).combined
      .pipe(
        Child.spawn("cat"),
      );
    assertEquals(output.toString(), "foo\nbar\n");
  },
});

Deno.test({
  name: "[child] pipe should accept template string",
  async fn() {
    const output = await Child.spawn(`echo foo; echo bar >&2`)
      .pipe`cat`;
    assertEquals(output.toString(), "foo\n");
  },
});
