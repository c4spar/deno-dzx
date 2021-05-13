import { ProcessError } from "./process_error.ts";
import { ProcessOutput } from "./process_output.ts";
import { quote } from "./quote.ts";

let runningProcesses = 0;

export async function exec(
  pieces: TemplateStringsArray,
  ...args: Array<string | number>
): Promise<ProcessOutput> {
  runningProcesses++;
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
    stdout: $.stdout,
    stderr: "piped",
  });

  const [status] = await Promise.all([
    process.status(),
    process.stdout && read(process.stdout, stdout, combined),
    read(process.stderr, stderr, combined),
  ]);

  if (--runningProcesses === 0) {
    $.stdout = "piped";
  }

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
