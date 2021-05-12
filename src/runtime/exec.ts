import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { quote } from "./quote.ts";

export async function exec(
  pieces: TemplateStringsArray,
  ...args: Array<string | number>
): Promise<ProcessOutput> {
  const cmd = quote(pieces, ...args);

  if ($.verbose) {
    console.log($.brightBlue("$ %s"), cmd);
  }

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  const combined: Array<string> = [];
  const process = Deno.run({
    cmd: [$.shell, "-c", cmd],
    env: Deno.env.toObject(),
    stdout: "piped",
    stderr: "piped",
  });

  const [status] = await Promise.all([
    process.status(),
    read(process.stdout, stdout, combined),
    read(process.stderr, stderr, combined),
  ]);

  if (status.success) {
    return new ProcessOutput({
      stdout: stdout.join(""),
      stderr: stderr.join(""),
      combined: combined.join(""),
      status,
    });
  }

  throw new ProcessError({
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    combined: combined.join(""),
    status,
  });
}

async function read(
  reader: Deno.Reader,
  ...results: Array<Array<string>>
) {
  for await (const chunk of io.iter(reader)) {
    const str = new TextDecoder().decode(chunk);
    for (const result of results) {
      result.push(str);
    }
  }
}
