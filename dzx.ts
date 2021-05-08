import { encode } from "./deps.ts";
import { DZX } from "./types.d.ts";
import { colors, iter, join } from "./deps.ts";
import { ProcessResult } from "./process_result.ts";

const $: DZX = exec as DZX;

Object.setPrototypeOf($, Object.getPrototypeOf(colors));
$._stack = [];

window.$ = $;

const script: string | undefined = Deno.args[0];

if (script) {
  const url = join(Deno.cwd(), script);
  const content = await Deno.readTextFile(url);
  await import(`data:application/typescript;base64,${encode(content)}`);
} else {
  console.error("missing script");
  Deno.exit(0);
}

export async function exec(
  pieces: TemplateStringsArray,
  ...args: Array<unknown>
): Promise<ProcessResult> {
  let cmd = pieces[0], i = 0;
  for (; i < args.length; i++) {
    cmd += args[i] + pieces[i + 1];
  }
  for (++i; i < pieces.length; i++) {
    cmd += pieces[i];
  }

  if ($.verbose) {
    console.log($.brightBlue("$ %s"), cmd);
  }

  const stdout: Array<string> = [];
  const stderr: Array<string> = [];
  const combined: Array<string> = [];
  const process = Deno.run({
    cmd: cmd.split(/\s+/),
    stdout: "piped",
    stderr: "piped",
    cwd: $.cwd,
  });

  const [status] = await Promise.all([
    process.status(),
    read(process.stdout, stdout, combined),
    read(process.stderr, stderr, combined),
  ]);

  if (!status.success) {
    throw new Error(stderr.join(""));
  }

  return new ProcessResult({
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
  for await (const chunk of iter(reader)) {
    const str = new TextDecoder().decode(chunk);
    for (const result of results) {
      result.push(str);
    }
  }
}
