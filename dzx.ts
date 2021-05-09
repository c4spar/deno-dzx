/// <reference path="./types.d.ts" />

import {
  iter,
  iterSync,
  join,
  readAll,
  readAllSync,
  writeAll,
  writeAllSync,
} from "./deps.ts";
import { $, cd, parseFlags, quote } from "./mod.ts";
import { error } from "./src/_utils.ts";

window.$ = $;
window.cd = cd;
window.quote = quote;
window.parseFlags = parseFlags;
window.iter = iter;
window.iterSync = iterSync;
window.readAll = readAll;
window.readAllSync = readAllSync;
window.writeAll = writeAll;
window.writeAllSync = writeAllSync;

const script: string | undefined = Deno.args[0];

try {
  if (!script) {
    if (!Deno.isatty(Deno.stdin.rid)) {
      const data = new TextDecoder().decode(await readAll(Deno.stdin));
      if (data) {
        await import(
          `data:application/typescript,${encodeURIComponent(data)}`
        );
      } else {
        error(`usage: dzx <script>`, 2);
      }
    } else {
      error(`usage: dzx <script>`);
    }
  } else if (
    script.startsWith("http://") || script.startsWith("https://") ||
    script.startsWith("file://")
  ) {
    await import(script);
  } else if (script) {
    await import("file://" + join($.cwd, script));
  } else {
    error(`usage: dzx <script>`);
  }
} catch (err) {
  error(err);
}
