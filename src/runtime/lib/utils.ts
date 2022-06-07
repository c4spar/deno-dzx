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
