#!/usr/bin/env deno run --allow-run https://deno.land/x/dzx/dzx.ts
/// <reference path="https://deno.land/x/dzx/types.d.ts" />

console.log(
  "output: %s",
  await $`echo Hello ${$.blue.bold("world")}!`,
);
