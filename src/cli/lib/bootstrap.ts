import { $ } from "../../runtime/mod.ts";

const startTime = Date.now();

export interface BootstrapOptions {
  code?: string;
  mainModule?: string;
  args?: Array<string> | string;
  base64?: boolean;
  verbose?: number | boolean;
}

export function base64Module(code: string) {
  return `data:application/typescript,${encodeURIComponent(code)}`;
}

export function stringifyArgs(args: Array<string>) {
  let code = args?.length
    ? `const args = JSON.parse(decodeURIComponent("${
      encodeURIComponent(JSON.stringify(args))
    }"));\n`
    : "const args = [];\n";

  code += `Object.defineProperty($, "args", { get: () => args });`;

  return code;
}

export function stringifyMainModule(mainModule: string) {
  return `Object.defineProperty($, "mainModule", { get: () => "${mainModule}" });`;
}

export function stringifyStartTime(startTime: number) {
  return `Object.defineProperty($, "startTime", { get: () => ${startTime} });`;
}

export function bootstrap(options: BootstrapOptions): string {
  const code = [
    `import "${new URL("../../../mod.ts", import.meta.url)}";`,
    "{",
    stringifyStartTime(startTime),
    options.mainModule ? stringifyMainModule(options.mainModule) : "",
    options.verbose !== undefined ? `$.verbose = ${options.verbose};` : "",
    typeof options.args === "string"
      ? options.args
      : stringifyArgs(options.args ?? []),
    "}",
    options.code,
  ].filter((line) => line).join("\n");

  return options.base64 ? base64Module(code) : code;
}

export function teardown(): string {
  return [
    `if ($.verbose) {`,
    `  console.log($.bold("time: %ss"), Math.round($.time) / 1000);`,
    `}`,
    `self.close();`,
  ].join("\n");
}

export type BootstrapModuleOptions = BootstrapOptions;

export function bootstrapScript(code: string) {
  return base64Module(`
      /// <reference path="${new URL(
    "../../../types.d.ts",
    import.meta.url,
  )}" />
      {\n${code}\n}
    `);
}

export function bootstrapModule(options: BootstrapModuleOptions) {
  return bootstrap({
    ...options,
    code: [
      options.code ? `{\n${options.code}\n}` : "",
      teardown(),
    ].filter((line) => line).join("\n"),
  });
}

export interface ImportModuleOptions {
  mainModule: string;
  args?: Array<string>;
  verbose?: number | boolean;
}

export async function importModule(options: ImportModuleOptions) {
  const mainModule = options.mainModule;
  Object.defineProperty($, "mainModule", {
    get: () => mainModule,
  });

  const args = options.args ? [...options.args] : [];
  Object.defineProperty($, "args", {
    get: () => args,
  });

  if (typeof options.verbose !== "undefined") {
    $.verbose = options.verbose;
  }

  Object.defineProperty($, "startTime", {
    get: (): number => startTime,
  });

  await import($.mainModule);

  if ($.verbose) {
    console.log($.bold("time: %ss"), Math.round($.time) / 1000);
  }
}
