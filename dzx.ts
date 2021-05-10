/// <reference path="./types.d.ts" />
import { $, io, path } from "./mod.ts";
import { error } from "./src/_utils.ts";

if (import.meta.main) {
  const script: string | undefined = Deno.args[0];
  try {
    if (!script) {
      if (!Deno.isatty(Deno.stdin.rid)) {
        const data = new TextDecoder().decode(await io.readAll(Deno.stdin));
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
      await import("file://" + path.join($.cwd, script));
    } else {
      error(`usage: dzx <script>`);
    }
  } catch (err) {
    error(err);
  }
}
