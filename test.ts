/// <reference path="./types.d.ts" />

import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

import { $ } from "./mod.ts";

Deno.test("$ works", async () => {
  const result = await $`echo hello`;

  assertEquals(result.stdout, "hello\n");
});
