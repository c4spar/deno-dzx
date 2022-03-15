import { error } from "../_utils.ts";
import { path } from "./mod.ts";

const cwd = Deno.cwd();

export function cd(dir: string): string {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${dir}`);
  }
  try {
    if (dir[0] === "~") {
      dir = path.join(homedir() as string, dir.slice(1));
    } else if (dir[0] !== path.sep) {
      dir = path.join(cwd, dir);
    }
    Deno.chdir(dir);
    return dir;
  } catch (err: unknown) {
    if (err instanceof Deno.errors.NotFound) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      throw error(`cd: ${dir}: No such directory\n    at ${stack}`);
    } else if (err instanceof Deno.errors.PermissionDenied) {
      const stack: string = (new Error().stack!.split("at ")[2]).trim();
      throw error(`cd: ${dir}: Permission denied\n    at ${stack}`);
    }
    throw error(
      err instanceof Error ? err : new Error(`[non-error-thrown] ${err}`),
    );
  }
}

function homedir(): string | null {
  switch (Deno.build.os) {
    case "windows":
      return Deno.env.get("USERPROFILE") || null;
    case "linux":
    case "darwin":
      return Deno.env.get("HOME") || null;
    default:
      throw error("Failed to retrieve home directory.");
  }
}
