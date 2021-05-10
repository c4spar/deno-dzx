import { error } from "./_utils.ts";

export async function bundle(
  script: string,
  dzxModuleUrl: string,
  options: Deno.EmitOptions = {},
): Promise<string> {
  const { shebang, tmpFile } = await prepareBundle(
    script,
    dzxModuleUrl,
    options,
  );

  const bundleResult = await Deno.emit(tmpFile, {
    bundle: "esm",
    check: false,
  });

  const bundledScript = Object.values(bundleResult.files)[0] as string;

  return shebang.replace("#!/usr/bin/env dzx", "#!/usr/bin/env deno") +
    bundledScript;
}

export async function prepareBundle(
  script: string,
  dzxModuleUrl: string,
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
    bundle: "esm",
    check: true,
    ...options,
  });
  const bundleContent = `import "${dzxModuleUrl}";\n` +
    Object.values(scriptResult.files)[0] as string;

  const tmpDir = await Deno.makeTempDir();
  const tmpFile = path.join(tmpDir, path.basename(script));
  const data = new TextEncoder().encode(bundleContent);
  await Deno.writeFile(tmpFile, data, { create: true });

  return { shebang, tmpFile };
}
