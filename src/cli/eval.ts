import { Command, ValidationError } from "./deps.ts";
import { bootstrapScript, importModule } from "./lib/bootstrap.ts";
import { getModuleFromStdin } from "./lib/stream.ts";

export function evalCommand() {
  return new Command()
    .description(`Evaluate a dzx script from the command line.\n
  dzx eval "console.log($.shell)"\n
Or read from stdin:\n
  echo "console.log($.shell)" | dzx eval
`)
    .arguments("<code:string>")
    .useRawArgs()
    .action(
      async function (_: void, ...args: Array<string>) {
        if (["-h", "--help"].includes(args[0])) {
          this.showHelp();
          Deno.exit(0);
        }
        const code = args.shift();

        if (!code && Deno.isatty(Deno.stdin.rid)) {
          throw new ValidationError(`Missing argument(s): script`);
        }

        const mainModule: string = code
          ? bootstrapScript(code)
          : await getModuleFromStdin();

        await importModule({ mainModule });
      },
    );
}
