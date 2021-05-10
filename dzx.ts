/// <reference path="./types.d.ts" />
import { $, io, path } from "./mod.ts";
import { bundle } from "./src/bundle.ts";
import { compile } from "./src/compile.ts";
import { error } from "./src/_utils.ts";

if (import.meta.main) {
  if (Deno.args[0] === "bundle") {
    const script = Deno.args[Deno.args.length - 1];
    console.log(
      await bundle(script, new URL("./mod.ts", import.meta.url).href),
    );
    Deno.exit(0);
  } else if (Deno.args[0] === "compile") {
    const args = [...Deno.args];
    args.shift();
    const script = args.pop();
    if (!script) {
      throw error(`usage: dzx compile <script>`);
    }
    await compile(
      script,
      args,
      new URL("./mod.ts", import.meta.url).href,
    );
    Deno.exit(0);
  }

  const script = Deno.args[Deno.args.length - 1];

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
