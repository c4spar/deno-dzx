import { Command, ValidationError } from "./deps.ts";
import { error } from "../_utils.ts";
import { fs, path } from "../../mod.ts";

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
      console.log("Deno.mainModule:", Deno.mainModule);
      console.log(
        await bundle(script, {
          check,
        }),
      );
    });
}

export async function bundle(
  script: string,
  options: Deno.EmitOptions = {},
): Promise<string> {
  const { shebang, tmpFile } = await prepareBundle(
    script,
    options,
  );

  const bundleResult = await Deno.emit(tmpFile, {
    bundle: "module",
    check: false,
  });

  const bundledScript = Object.values(bundleResult.files)[0] as string;

  return shebang.replace("#!/usr/bin/env dzx", "#!/usr/bin/env deno") +
    bundledScript;
}

export async function prepareBundle(
  script: string,
  options: Deno.EmitOptions = {},
): Promise<{ shebang: string; tmpFile: string }> {
  if (!await fs.exists(script)) {
    error(`File not found: ${script}`);
  }
  let shebang = "";
  const scriptContent = new TextDecoder().decode(await Deno.readFile(script));
  if (scriptContent.startsWith("#!")) {
    const parts = scriptContent.split("\n");
    shebang = (parts.shift() as string) + "\n";
  }

  const scriptResult = await Deno.emit(script, {
    bundle: "module",
    check: true,
    ...options,
  });
  const bundleContent =
    `import "${new URL("./mod.ts", Deno.mainModule).href}";\n` +
    Object.values(scriptResult.files)[0] as string;

  const tmpDir = await Deno.makeTempDir();
  const tmpFile = path.join(tmpDir, path.basename(script));
  const data = new TextEncoder().encode(bundleContent);
  await Deno.writeFile(tmpFile, data, { create: true });

  return { shebang, tmpFile };
}
