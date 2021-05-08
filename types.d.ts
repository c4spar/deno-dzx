import { exec } from "./dzx.ts";
import { colors } from "./deps.ts";

type DZX = typeof exec & typeof colors & {
  verbose: boolean;
  cwd: string;
  shell: string;
  cd: (path: string) => void;
};

declare global {
  const $: DZX;

  interface Window {
    $: DZX;
  }
}
