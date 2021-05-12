import { error } from "../_utils.ts";

export function cd(dir: string) {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${dir}`);
  }
  try {
    Deno.chdir(new URL(dir, $.mainModule).pathname);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      error(`cd: ${dir}: No such directory\n    at ${stack}`);
    } else if (err instanceof Deno.errors.PermissionDenied) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      error(`cd: ${dir}: Permission denied\n    at ${stack}`);
    }
    error(err);
  }
}
