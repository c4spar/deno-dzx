/// <reference path="../types.d.ts" />

export function error(message: string | Error, exitCode = 1): Error {
  if ($.throwErrors) {
    return (message instanceof Error
      ? message
      : new Error(getErrorMessage(message)));
  }
  console.error(message instanceof Error ? message : getErrorMessage(message));
  Deno.exit(exitCode);
}

function getErrorMessage(message: string) {
  return $.red(`${$.bold("error:")} ${message}`);
}

export function homedir(throwIfMissing = true): string | undefined {
  switch (Deno.build.os) {
    case "windows":
      return Deno.env.get("USERPROFILE");
    case "linux":
    case "darwin":
      return Deno.env.get("HOME");
    default:
      if (throwIfMissing) {
        throw error("Failed to retrieve home directory.");
      }
  }
}

export function username(throwIfMissing = true): string | undefined {
  switch (Deno.build.os) {
    case "windows":
      return Deno.env.get("USERNAME");
    case "linux":
    case "darwin":
      return Deno.env.get("USER");
    default:
      if (throwIfMissing) {
        throw error("Failed to retrieve username.");
      }
  }
}
