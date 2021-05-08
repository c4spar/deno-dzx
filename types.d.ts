import type { $ } from "./mod.ts";

declare global {
  const $: $;
  const cd: typeof $.cd;

  interface Window {
    $: $;
    cd: typeof $.cd;
  }
}
