import { bold, brightBlue, brightYellow, join, sep, white } from "./deps.ts";
import { createError, DzxErrorOptions } from "./lib/error.ts";
import { $ } from "./shell.ts";

const cwd = Deno.cwd();

export function cd(dir: string) {
  if ($.verbose) {
    console.log(brightBlue("$ %s"), `cd ${dir}`);
  }
  let realPath = dir;

  try {
    if (dir[0] === "~") {
      realPath = join(homedir() as string, dir.slice(1));
    } else if (dir[0] !== sep) {
      realPath = join(cwd, dir);
    }

    Deno.chdir(realPath);
  } catch (err: unknown) {
    const opts: DzxErrorOptions = { context: cd };

    if (err instanceof Deno.errors.NotFound) {
      throw fmtError(`No such directory`, opts);
    } else if (err instanceof Deno.errors.PermissionDenied) {
      throw fmtError(`Permission denied`, opts);
    }

    throw createError(
      err instanceof Error ? err : `[non-error-thrown] ${err}`,
      opts,
    );
  }

  function fmtError(message: string, opts: DzxErrorOptions) {
    return createError(
      `cd: ${message}: ${dir}\n${bold(white(`Directory:`))} ${
        brightYellow(realPath)
      }`,
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
      throw createError("Failed to retrieve home directory.");
  }
}
