/// <reference path="./types.d.ts" />

import {
  assert,
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

import { $, cd, path, ProcessError } from "./mod.ts";

Deno.test("$ works", async () => {
  const result = await $`echo hello`;

  assertEquals(result.stdout, "hello\n");
});

Deno.test("only stdout of an exec result will be used if passed to a second call to exec", async () => {
  const result1 = await $`echo sup >&2; echo hiii`;
  assertEquals(result1.stderr, "sup\n");

  const result2 = await $`echo ${result1}`;
  assertEquals(result2.stdout, "hiii\n");
});

Deno.test("passing environment variables to the child process", async () => {
  Deno.env.set("IS_THIS_THING_ON", "yes");
  const result = await $`echo $IS_THIS_THING_ON`;

  assertEquals(result.stdout, "yes\n");
});

Deno.test("escape and quote arguments", async () => {
  const complexArg = 'bar"";baz!$#^$\'&*~*%)({}||\\/';
  const result = (await $`echo ${complexArg}`);

  assertEquals(result.stdout.trim(), complexArg);
});

Deno.test("create a directory with a space in the name", async () => {
  const now = Date.now();
  const path = `./.tmp/test_${now}/foo bar`;

  try {
    await $`mkdir -p ${path}`;
    assert((await Deno.stat(path)).isDirectory);
  } finally {
    await Deno.remove(`./.tmp`, { recursive: true });
  }
});

Deno.test("subprocess command failure throws a ProcessError", async () => {
  await assertThrowsAsync(async () => await $`somefakebinary`, ProcessError);
});

Deno.test("cwd of the parent process is always the starting point for calls to cd", async () => {
  const parentPwd = Deno.cwd();

  try {
    const testStartingDir = path.dirname(path.fromFileUrl(import.meta.url));
    Deno.chdir(testStartingDir);

    cd("src");
    const pwd1 = await $`pwd`;
    assertEquals(pwd1.stdout.trim(), path.join(testStartingDir, "src"));

    cd(".github");
    const pwd2 = await $`pwd`;
    assertEquals(pwd2.stdout.trim(), path.join(testStartingDir, ".github"));
  } finally {
    Deno.chdir(parentPwd);
  }
});
