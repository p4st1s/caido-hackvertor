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
      sdk.console.log("[HV] processed:", processed.slice(0, 200));
      if (processed === rawStr) {
        sdk.console.log("[HV] no change, skipping");
        return undefined;
      }
      request.setRaw(Buffer.from(processed, "utf8"));
      const spec = request.toSpec();
      sdk.console.log("[HV] toSpec ok:", JSON.stringify(spec).slice(0, 200));
      return spec;
    } catch(e) {
      sdk.console.log("[HV] ERROR:", String(e));
      setTimeout(() => sdk.api.send("upstream-error", String(e)), 0);
      return undefined;
    }
  });
}
