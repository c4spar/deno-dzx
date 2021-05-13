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
  const [shebang, bundledScript] = await Promise.all([
    getShebang(script),
    preBundle(
      script,
      options,
    ).then((tmpFile) => bundleFile(tmpFile, { check: false })),
  ]);

  return shebang
    .replace("#!/usr/bin/env dzx", "#!/usr/bin/env deno") +
    bundledScript;
}

export async function preBundle(
  script: string,
  options?: Deno.EmitOptions,
): Promise<string> {
  if (!await fs.exists(script)) {
    error(`File not found: ${script}`);
  }

  const scriptResult = await bundleFile(script, options);

  const bundleContent =
    `import "${new URL("./mod.ts", Deno.mainModule).href}";\n` +
    `$.mainModule = import.meta.url;\n${scriptResult}`;

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
  const result = await Deno.emit(file, {
    bundle: "module",
    check: true,
    ...options,
  });
  return Object.values(result.files)[0] as string;
}

async function getShebang(script: string): Promise<string> {
  let shebang = "";
  const file = await Deno.open(script);
  const firstLine = await io.readLines(file).next();
  if (firstLine.value.startsWith("#!")) {
    shebang = firstLine.value + "\n";
  }
  file.close();
  return shebang;
}
