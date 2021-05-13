#!/usr/bin/env dzx
/// <reference path="../types.d.ts" />

$.verbose = true;

console.log("Deno.mainModule:", Deno.mainModule);
console.log("import.meta.url:", import.meta.url);
console.log("$.mainModule:", $.mainModule);

console.log("cwd: %s", await $`pwd`);
cd("./src/runtime");
console.log("cwd: %s", await $`pwd`);
cd("./src/cli");
console.log("cwd: %s", await $`pwd`);
cd("..");
console.log("cwd: %s", await $`pwd`);
