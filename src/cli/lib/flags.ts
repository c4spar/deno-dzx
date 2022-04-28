export function generateFlags(options: Record<string, unknown>): string {
  let flags = "";
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === "undefined" || value === null) {
      continue;
    }
    const flagName = key.replace(/([a-z])([A-Z])/g, (...args) => {
      return args[1] + "-" + args[2].toLowerCase();
    });
    if (value === false) {
      flags += " --no-" + flagName;
    } else {
      flags += " --" + flagName;
      if (value !== true) {
        flags += "=" + Deno.inspect(value);
      }
    }
  }
  return flags.trimStart();
}
