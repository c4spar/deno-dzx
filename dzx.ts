/// <reference path="./types.d.ts" />

import { dzx } from "./src/cli/mod.ts";

if (import.meta.main) {
  await dzx().parse(Deno.args);
}
