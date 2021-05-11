import { io, path } from "../../mod.ts";
import { bundleCommand } from "./bundle.ts";
import { compileCommand } from "./compile.ts";
import {
  Command,
  CompletionsCommand,
  HelpCommand,
  ValidationError,
} from "./deps.ts";

export function dzx() {
  return new Command<void>()
    .version("0.2.0")
    .name("dzx")
    .description("🦕 A custom deno runtime for writing quickly scripts.")
    .stopEarly()
    .arguments<[script?: string, args?: Array<string>]>(
      "[script:string] [args...:string[]]",
    )
    .action(async (_, script?: string, _args?: Array<string>) => {
      if (!script) {
        if (!Deno.isatty(Deno.stdin.rid)) {
          const data = new TextDecoder().decode(await io.readAll(Deno.stdin));
          if (data) {
            await import(
              `data:application/typescript,${encodeURIComponent(data)}`
            );
          } else {
            // @TODO: add support for exit code in ValidationError
            // throw new ValidationError(`Failed to read from stdin.`, 2);
            throw new ValidationError(`Failed to read from stdin.`);
          }
        } else {
          throw new ValidationError(`Missing argument(s): script`);
        }
      } else if (
        script.startsWith("http://") || script.startsWith("https://") ||
        script.startsWith("file://")
      ) {
        await import(script);
      } else {
        await import(
          "file://" +
            (path.isAbsolute(script) ? script : path.join(Deno.cwd(), script))
        );
      }
    })
    .command("bundle", bundleCommand())
    .command("compile", compileCommand())
    .command("help", new HelpCommand().global())
    .command("completions", new CompletionsCommand());
}
