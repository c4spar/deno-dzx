import { $ } from "../mod.ts";

export function cd(path: string) {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${path}`);
  }

  try {
    Deno.lstatSync(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      console.error(`cd: ${path}: No such directory`);
      console.error(`  at ${stack}`);
      Deno.exit(1);
    } else if (error instanceof Deno.errors.PermissionDenied) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      console.error(`cd: ${path}: Permission denied`);
      console.error(`  at ${stack}`);
      Deno.exit(1);
    }
    throw error;
  }

  $.cwd = path;
}
