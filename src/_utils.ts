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
