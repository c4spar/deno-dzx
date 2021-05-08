import type { $, cd as _cd, quote as _quote } from "./mod.ts";

declare global {
  const $: $;
  const cd: typeof _cd;
  const quote: typeof _quote;

  interface Window {
    $: $;
    cd: typeof _cd;
    quote: typeof _quote;
  }
}
