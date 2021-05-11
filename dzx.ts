/// <reference path="./types.d.ts" />

import { dzx } from "./src/cli/mod.ts";

if (import.meta.main) {
  const start = performance.now();
  await dzx().parse(Deno.args);
  if ($.verbose) {
    const end = performance.now();
    console.log($.bold("time: %ss"), Math.round(end - start) / 1000);
  }
}
