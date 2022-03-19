import { tokens } from "https://deno.land/x/rusty_markdown@v0.4.1/mod.ts";
import { addProtocol } from "../../_utils.ts";

export async function getMarkdownModule(url: string) {
  let mdContent;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    mdContent = await fetch(url).then((response) => response.text());
  } else {
    url = await Deno.realPath(url);
    mdContent = await Deno.readTextFile(url);
    url = addProtocol(url);
  }

  const mdTokens = tokens(mdContent);
  const supportedLanguages = ["js", "javascript", "ts", "typescript"];
  const codeContent: string[] = [];

  mdTokens.forEach((token, idx) => {
    if (
      token.type === "start" && token.tag === "codeBlock" &&
      token.kind === "fenced" &&
      supportedLanguages.includes(token.language)
    ) {
      let token;
      let cursor = idx + 1;
      while ((token = mdTokens.at(cursor)) && token.type === "text") {
        codeContent.push(token.content);
        cursor++;
      }
    }
  });

  const code = codeContent.join("")
    .replaceAll("import.meta.url", `\"${url}\"`);

  return `data:application/typescript,${
    encodeURIComponent(`
      /// <reference path="${new URL(
      "../../../types.d.ts",
      import.meta.url,
    )}" />
      {\n${code}\n}
    `)
  }`;
}
