import { $ } from "../../runtime/mod.ts";

export interface BootstrapOptions {
  startTime?: number;
  mainModule?: string;
  args?: Array<string> | string;
  base64?: boolean;
  verbose?: number | boolean;
}

export function base64Module(code: string) {
  return `data:application/typescript,${encodeURIComponent(code)}`;
}

export function stringifyArgs(args: Array<string>) {
  return args?.length
    ? `$.args = JSON.parse(decodeURIComponent("${
      encodeURIComponent(JSON.stringify(args))
    }"));`
    : "";
}

export function bootstrap(options: BootstrapOptions): string {
  const code = [
    `import "${new URL("../../../mod.ts", import.meta.url)}";`,
    options.startTime ? `$.startTime = ${options.startTime};` : "",
    options.mainModule ? `$.mainModule = ${options.mainModule};` : "",
    options.verbose !== undefined ? `$.verbose = ${options.verbose};` : "",
    typeof options.args === "string"
      ? options.args
      : options.args
      ? stringifyArgs(options.args)
      : "",
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

export interface BootstrapModuleOptions extends BootstrapOptions {
  code?: string;
}

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
  return [
    bootstrap(options),
    options.code ? `{\n${options.code}\n}` : "",
    teardown(),
  ].filter((line) => line).join("\n");
}

export interface ImportModuleOptions {
  mainModule: string;
  args?: Array<string>;
  verbose?: number | boolean;
}

export async function importModule(options: ImportModuleOptions) {
  $.mainModule = options.mainModule;
  if (options.args) {
    $.args = options.args;
  }
  if (typeof options.verbose !== "undefined") {
    $.verbose = options.verbose;
  }
  await import($.mainModule);
  if ($.verbose) {
    console.log($.bold("time: %ss"), Math.round($.time) / 1000);
  }
}
