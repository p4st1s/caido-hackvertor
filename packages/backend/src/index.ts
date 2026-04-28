import type { SDK, DefineAPI, DefineEvents } from "caido:plugin";
import { convert } from "./engine";

export type API = DefineAPI<{}>;
export type BackendEvents = DefineEvents<{
  "upstream-error": (message: string) => void;
}>;

export function init(sdk: SDK<API, BackendEvents>) {
  sdk.events.onUpstream((sdk, request) => {
    try {
      const rawStr = Buffer.from(request.getRaw()).toString("utf8");
      if (!/<@[a-z0-9_-]+/i.test(rawStr)) {
        return undefined;
      }
      const processed = convert(rawStr);
      if (processed === rawStr) return undefined;
      request.setRaw(Buffer.from(processed, "utf8"));
      return request.toSpec();
    } catch(e) {
      sdk.console.log("[HV] ERROR:", String(e));
      setTimeout(() => sdk.api.send("upstream-error", String(e)), 0);
      return undefined;
    }
  });
}
