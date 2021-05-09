/// <reference path="./types.d.ts" />

import { error } from "./src/_utils.ts";
import {
  $,
  basename,
  Buffer,
  cd,
  dirname,
  extname,
  fromFileUrl,
  isAbsolute,
  iter,
  iterSync,
  join,
  normalize,
  parseFlags,
  quote,
  readAll,
  readAllSync,
  readLines,
  relative,
  resolve,
  toFileUrl,
  toNamespacedPath,
  writeAll,
  writeAllSync,
} from "./mod.ts";

// dzx
window.$ = $;
window.cd = cd;

// std/io
window.Buffer = Buffer;
window.iter = iter;
window.iterSync = iterSync;
window.quote = quote;
window.readAll = readAll;
window.readAllSync = readAllSync;
window.readLines = readLines;
window.writeAll = writeAll;
window.writeAllSync = writeAllSync;

// std/path
window.basename = basename;
window.dirname = dirname;
window.extname = extname;
window.fromFileUrl = fromFileUrl;
window.isAbsolute = isAbsolute;
window.join = join;
window.normalize = normalize;
window.relative = relative;
window.resolve = resolve;
window.toFileUrl = toFileUrl;
window.toNamespacedPath = toNamespacedPath;

window.parseFlags = parseFlags;

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
