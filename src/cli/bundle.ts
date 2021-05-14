import { Command, ValidationError } from "./deps.ts";
import { error } from "../_utils.ts";
import { path } from "../../mod.ts";

export function bundleCommand() {
  return new Command<void>()
    .description("Bundle an dzx script to a standalone deno sript.")
    .arguments("[script:string]")
    .option<{ check: boolean }>("--no-check", "Skip type checking modules.")
    .action(async ({ check }, script?: string) => {
      if (!script) {
        if (Deno.isatty(Deno.stdin.rid)) {
          throw new ValidationError(`Missing argument(s): script`);
        }
        script = await Deno.makeTempFile({ suffix: ".ts" });
        const tmpFile = await Deno.open(script, { write: true });
        await Deno.copy(Deno.stdin, tmpFile);
        tmpFile.close();
      }
      console.log(
        await bundle(script, {
          check,
        }),
      );
    });
}

export async function bundle(
  script: string,
  options?: Deno.EmitOptions,
): Promise<string> {
  return bundleFile(
    await preBundle(
      script,
      options,
    ),
    { check: false },
  );
}

export async function preBundle(
  script: string,
  options?: Deno.EmitOptions,
): Promise<string> {
  const scriptResult = await bundleFile(script, options);

  const bundleContent = `import "${new URL("./mod.ts", Deno.mainModule).href}";
$.mainModule = import.meta.url;
${scriptResult}
if ($.verbose) {
  const end = Date.now();
  console.log($.bold("time: %ss"), Math.round($.time) / 1000);
}`;

  const tmpDir = await Deno.makeTempDir();
  const tmpFile = path.join(tmpDir, path.basename(script));
  const data = new TextEncoder().encode(bundleContent);
  await Deno.writeFile(tmpFile, data, { create: true });

  return tmpFile;
}

async function bundleFile(
  file: string,
  options: Deno.EmitOptions = {},
): Promise<string> {
  try {
    const result = await Deno.emit(file, {
      bundle: "module",
      check: true,
      ...options,
    });
    return Object.values(result.files)[0] as string;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw error(`File not found: ${file}`);
    } else if (err instanceof Deno.errors.PermissionDenied) {
      throw error(`Permission denied: ${file}`);
    }
    throw error(err);
  }
}

// async function getShebang(script: string): Promise<string> {
//   let shebang = "";
//   const file = await Deno.open(script);
//   const firstLine = await io.readLines(file).next();
//   if (firstLine.value.startsWith("#!")) {
//     shebang = firstLine.value + "\n";
//   }
//   file.close();
//   return shebang;
// }
