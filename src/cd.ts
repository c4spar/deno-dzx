import { error } from "./_utils.ts";

export function cd(path: string) {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${path}`);
  }

  try {
    Deno.lstatSync(path);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      error(`cd: ${path}: No such directory\n  at ${stack}`);
    } else if (err instanceof Deno.errors.PermissionDenied) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      error(`cd: ${path}: Permission denied\n  at ${stack}`);
    }
    error(err);
  }

  $.cwd = path;
}
