import { createError } from "../runtime/lib/error.ts";
import {
  basename,
  Command,
  copy,
  DenoBundleOptions,
  join,
  ValidationError,
} from "./deps.ts";
import { bootstrapModule } from "./lib/bootstrap.ts";

export function bundleCommand() {
  return new Command()
    .description("Bundle a dzx script to a standalone deno script.")
    .arguments("[script:file]")
    .option("--check", "Type check modules.")
    .option("--no-check", "Skip type checking modules.")
    .action(async ({ check }, script?: string) => {
      if (!script) {
        if (Deno.isatty(Deno.stdin.rid)) {
          throw new ValidationError(`Missing argument(s): script`);
        }
        script = await Deno.makeTempFile({ suffix: ".ts" });
        const tmpFile = await Deno.open(script, { write: true });
        await copy(Deno.stdin, tmpFile);
        tmpFile.close();
      }
      console.log(
        await bundle(script, {
          check,
        }),
      );
    });
}

export interface BundleOptions extends DenoBundleOptions {
  check?: boolean;
}

export async function bundle(
  script: string,
  options?: BundleOptions,
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
  options?: BundleOptions,
): Promise<string> {
  const bundleContent = bootstrapModule({
    mainModule: "import.meta.url",
    args: "Deno.args",
    code: await bundleFile(script, options),
  });

  const tmpDir = await Deno.makeTempDir();
  const tmpFile = join(tmpDir, basename(script));
  const data = new TextEncoder().encode(bundleContent);
  await Deno.writeFile(tmpFile, data, { create: true });

  return tmpFile;
}

async function check(file: string) {
  const { status } = await Deno.spawn(Deno.execPath(), {
    args: [
      "check",
      file,
    ],
    stdout: "inherit",
    stderr: "inherit",
  });
  if (!status.success) {
    Deno.exit(status.code);
  }
}

async function bundleFile(
  file: string,
  options: BundleOptions = {},
): Promise<string> {
  try {
    if (options.check) {
      await check(file);
    }
    const { bundle: denoBundle } = await import(
      "https://deno.land/x/emit@0.3.0/mod.ts"
    );
    const { code } = await denoBundle(file, {
      type: "module",
      ...options,
    });

    return code;
  } catch (err: unknown) {
    if (err instanceof Deno.errors.NotFound) {
      throw createError(`File not found: ${file}`);
    } else if (err instanceof Deno.errors.PermissionDenied) {
      throw createError(`Permission denied: ${file}`);
    }
    throw createError(
      err instanceof Error ? err : new Error(`[non-error-thrown] ${err}`),
    );
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
