import { error } from "../_utils.ts";
import { colors, path } from "./deps.ts";
import { $ } from "./shell.ts";

const cwd = Deno.cwd();

export function cd(dir: string) {
  if ($.verbose) {
    console.log($.brightBlue("$ %s"), `cd ${dir}`);
  }
  let realPath = dir;

  try {
    if (dir[0] === "~") {
      realPath = path.join(homedir() as string, dir.slice(1));
    } else if (dir[0] !== path.sep) {
      realPath = path.join(cwd, dir);
    }

    Deno.chdir(realPath);
  } catch (err: unknown) {
    const opts = { context: cd };

    if (err instanceof Deno.errors.NotFound) {
      throw error(
        `cd: No such directory: ${dir}\n${
          colors.bold(
            colors.white(`Directory:`),
          )
        } ${colors.brightYellow(realPath)}`,
        opts,
      );
    } else if (err instanceof Deno.errors.PermissionDenied) {
      throw error(`cd: Permission denied`, opts);
    }

    throw error(
      err instanceof Error ? err : new Error(`[non-error-thrown] ${err}`),
      opts,
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
