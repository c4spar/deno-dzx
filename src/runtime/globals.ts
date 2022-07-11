import * as globals from "./mod.ts";

export function initGlobals() {
  Object.assign(self, globals);
}
