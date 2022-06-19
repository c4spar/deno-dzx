import { colors } from "../deps.ts";
import { ProcessOutput } from "../process_output.ts";

export function isTemplateStringArray(
  arg: unknown,
): arg is TemplateStringsArray {
  // deno-lint-ignore no-explicit-any
  return Array.isArray(arg) && Array.isArray((arg as any).raw);
}

export function parseCmd(
  pieces: TemplateStringsArray,
  ...args: Array<string | number | ProcessOutput>
): string {
  return quote(
    pieces,
    ...args.map((
      a,
    ) => (a instanceof ProcessOutput ? a.stdout.replace(/\n$/, "") : a)),
  );
}

export function toRgb(str: string): { r: number; g: number; b: number } {
  let hash = 0;
  const rgb: [r: number, g: number, b: number] = [0, 0, 0];
  if (str.length === 0) {
    return { r: rgb[0], g: rgb[1], b: rgb[2] };
  }
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

let count = 0;

const colorList = [
  colors.blue,
  colors.yellow,
  colors.magenta,
  colors.red,
  colors.green,
];

function colorize(str: string, index: number) {
  while (index >= colorList.length) {
    index -= colorList.length;
  }
  return colorList[index](str);
}

export function getId() {
  return colorize("#" + ++count, count);
}

export function getLabel(label: string) {
  return colorize(label, count);
}

export function getExitCodeInfo(exitCode: number): string | undefined {
  return {
    2: "Misuse of shell builtins",
    126: "Invoked command not executable",
    127: "Command not found",
    128: "Invalid exit argument",
    // SIGHUP
    129: "Hangup",
    // SIGINT
    130: "Interrupt (Ctrl + C)",
    // SIGQUIT
    131: "Quit and dump core",
    // SIGILL
    132: "Illegal instruction",
    // SIGTRAP
    133: "Trace/breakpoint trap",
    // SIGABRT
    134: "Process aborted",
    // SIGEMT
    135: 'Bus error: "access to undefined portion of memory object"',
    // SIGFPE
    136: 'Floating point exception: "erroneous arithmetic operation"',
    // SIGKILL
    137: "Kill (terminate immediately)",
    // SIGBUS
    138: "Bus error (bad memory access)",
    // SIGSEGV
    139: "Segmentation violation",
    // SIGSYS
    140: "Bad system call (SVr4)",
    // SIGPIPE
    141: "Write to pipe with no one reading",
    // SIGALRM
    142: "Signal raised by alarm",
    // SIGTERM
    143: "Termination (request to terminate)",
    145: "Child process terminated, stopped (or continued*)",
    146: "Continue if stopped",
    147: "Stop executing temporarily",
    148: "Terminal stop signal",
    149: 'Background process attempting to read from tty ("in")',
    150: 'Background process attempting to write to tty ("out")',
    151: "Urgent data available on socket",
    // SIGXCPU
    152: "CPU time limit exceeded",
    // SIGXFSZ
    153: "File size limit exceeded",
    // SIGVTALRM
    154:
      'Signal raised by timer counting virtual time: "virtual timer expired"',
    // SIGPROF
    155: "Profiling timer expired",
    157: "Pollable event",
    // SIGUSR1
    158: "User-defined 1",
    // SIGUSR2
    159: "User-defined 2",
  }[exitCode];
}

export function inspect(value: unknown): string {
  return Deno.inspect(value, { colors: true });
}
