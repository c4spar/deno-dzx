import { error } from "../_utils.ts";
import { path } from "./mod.ts";

const cwd = Deno.cwd();

export function cd(dir: string) {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${dir}`);
  }
  try {
    if (dir[0] !== path.sep) {
      dir = new URL(dir, path.toFileUrl(cwd + path.sep)).pathname;
    }
    Deno.chdir(dir);
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
