import type { $ as DZX } from "./mod.ts";

declare global {
  const $: DZX;

  interface Window {
    $: DZX;
  }
}
