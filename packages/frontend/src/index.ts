import { createApp, markRaw } from "vue";
import { TAGS } from "./tags";
import type { API } from "@caido/sdk-frontend";
import type { BackendEvents } from "../../backend/src/index";
import HackvertorPanel from "./HackvertorPanel.vue";
import ReplayView from "./ReplayView.vue";
import TagSearchDialog from "./TagSearchDialog.vue";
import "./styles/index.css";

export function init(sdk: API<{}, BackendEvents>) {
  sdk.backend.onEvent("upstream-error", (message) => {
    sdk.window.showToast(message, { variant: "error" });
  });

  try { setupMainPanel(sdk); } catch (e) { console.error("[HV] setupMainPanel", e); }
  try { setupReplayViewMode(sdk); } catch (e) { console.error("[HV] setupReplayViewMode", e); }
  try { setupInterceptViewMode(sdk); } catch (e) { console.error("[HV] setupInterceptViewMode", e); }
  try { setupHistoryViewMode(sdk); } catch (e) { console.error("[HV] setupHistoryViewMode", e); }
  try { setupAutomateViewMode(sdk); } catch (e) { console.error("[HV] setupAutomateViewMode", e); }
  try { setupTagCommands(sdk); } catch (e) { console.error("[HV] setupTagCommands", e); }
  try { setupTagSearch(sdk); } catch (e) { console.error("[HV] setupTagSearch", e); }
  try { setupSendToPanel(sdk); } catch (e) { console.error("[HV] setupSendToPanel", e); }
  setupAutoUpstream(sdk);
}

const TAG_MENU_ITEMS: Array<{ id: string; name: string; tag: string; group: string }> = [
  // Encode
  { id: "base64",           name: "Base64",              tag: "base64",           group: "Hackvertor: Encode" },
  { id: "base64url",        name: "Base64url",            tag: "base64url",        group: "Hackvertor: Encode" },
  { id: "base32",           name: "Base32",               tag: "base32",           group: "Hackvertor: Encode" },
  { id: "urlencode",        name: "URL encode",           tag: "urlencode",        group: "Hackvertor: Encode" },
  { id: "urlencode_all",    name: "URL encode (all)",     tag: "urlencode_all",    group: "Hackvertor: Encode" },
  { id: "html_entities",    name: "HTML entities",        tag: "html_entities",    group: "Hackvertor: Encode" },
  { id: "hex",              name: "Hex",                  tag: "hex",              group: "Hackvertor: Encode" },
  { id: "hex_escapes",      name: "Hex escapes (\\x)",   tag: "hex_escapes",      group: "Hackvertor: Encode" },
  { id: "unicode_escapes",  name: "Unicode escapes",      tag: "unicode_escapes",  group: "Hackvertor: Encode" },
  { id: "js_string",        name: "JS string",            tag: "js_string",        group: "Hackvertor: Encode" },
  { id: "saml",             name: "SAML",                 tag: "saml",             group: "Hackvertor: Encode" },
  // Decode
  { id: "d_base64",         name: "Base64",               tag: "d_base64",         group: "Hackvertor: Decode" },
  { id: "d_base64url",      name: "Base64url",            tag: "d_base64url",      group: "Hackvertor: Decode" },
  { id: "d_base32",         name: "Base32",               tag: "d_base32",         group: "Hackvertor: Decode" },
  { id: "d_url",            name: "URL decode",           tag: "d_url",            group: "Hackvertor: Decode" },
  { id: "d_html_entities",  name: "HTML entities",        tag: "d_html_entities",  group: "Hackvertor: Decode" },
  { id: "d_js_string",      name: "JS string",            tag: "d_js_string",      group: "Hackvertor: Decode" },
  { id: "d_unicode_escapes",name: "Unicode escapes",      tag: "d_unicode_escapes",group: "Hackvertor: Decode" },
  { id: "d_saml",           name: "SAML",                 tag: "d_saml",           group: "Hackvertor: Decode" },
  { id: "d_jwt_get_payload",name: "JWT payload",          tag: "d_jwt_get_payload",group: "Hackvertor: Decode" },
  // Hash
  { id: "md5",              name: "MD5",                  tag: "md5",              group: "Hackvertor: Hash" },
  { id: "sha1",             name: "SHA-1",                tag: "sha1",             group: "Hackvertor: Hash" },
  { id: "sha256",           name: "SHA-256",              tag: "sha256",           group: "Hackvertor: Hash" },
  { id: "sha384",           name: "SHA-384",              tag: "sha384",           group: "Hackvertor: Hash" },
  { id: "sha512",           name: "SHA-512",              tag: "sha512",           group: "Hackvertor: Hash" },
  // HMAC
  { id: "hmac_sha1",        name: "HMAC-SHA1",            tag: "hmac_sha1",        group: "Hackvertor: HMAC" },
  { id: "hmac_sha256",      name: "HMAC-SHA256",          tag: "hmac_sha256",      group: "Hackvertor: HMAC" },
  { id: "hmac_sha512",      name: "HMAC-SHA512",          tag: "hmac_sha512",      group: "Hackvertor: HMAC" },
  // Convert
  { id: "ascii2hex",        name: "ASCII → Hex",          tag: "ascii2hex",        group: "Hackvertor: Convert" },
  { id: "hex2ascii",        name: "Hex → ASCII",          tag: "hex2ascii",        group: "Hackvertor: Convert" },
  { id: "hex2dec",          name: "Hex → Dec",            tag: "hex2dec",          group: "Hackvertor: Convert" },
  { id: "dec2hex",          name: "Dec → Hex",            tag: "dec2hex",          group: "Hackvertor: Convert" },
  { id: "to_charcode",      name: "To char code",         tag: "to_charcode",      group: "Hackvertor: Convert" },
  { id: "from_charcode",    name: "From char code",       tag: "from_charcode",    group: "Hackvertor: Convert" },
  // String
  { id: "uppercase",        name: "Uppercase",            tag: "uppercase",        group: "Hackvertor: String" },
  { id: "lowercase",        name: "Lowercase",            tag: "lowercase",        group: "Hackvertor: String" },
  { id: "reverse",          name: "Reverse",              tag: "reverse",          group: "Hackvertor: String" },
  { id: "length",           name: "Length",               tag: "length",           group: "Hackvertor: String" },
  { id: "remove_newlines",  name: "Remove newlines",      tag: "remove_newlines",  group: "Hackvertor: String" },
  { id: "rotN",             name: "ROT13",                tag: "rotN",             group: "Hackvertor: String" },
];

function setupTagCommands(sdk: API) {
  for (const item of TAG_MENU_ITEMS) {
    const cmdId = `hackvertor.apply.${item.id}`;
    sdk.commands.register(cmdId, {
      name: item.name,
      group: item.group,
      run: (ctx) => {
        const sel = (ctx.type === "RequestContext" || ctx.type === "ResponseContext") ? ctx.selection : "";
        const editor = sdk.window.getActiveEditor();
        if (!editor || editor.isReadOnly()) return;
        const tagDef = TAGS.find(t => t.name === item.tag);
        const argsStr = tagDef ? getUserArgStr(item.tag, tagDef.args) : "";
        if (sel) {
          editor.replaceSelectedText(`<@${item.tag}${argsStr}>${sel}</@${item.tag}>`);
        } else {
          editor.replaceSelectedText(`<@${item.tag}${argsStr}></@${item.tag}>`);
        }
      },
      when: (ctx) => ctx.type === "RequestContext" || ctx.type === "ResponseContext",
    });
  }
}

function setupTagSearch(sdk: API) {
  function openSearch(sel: string) {
    const editor = sdk.window.getActiveEditor();
    let dialog: ReturnType<typeof sdk.window.showDialog>;
    dialog = sdk.window.showDialog(
      {
        component: TagSearchDialog,
        props: { selection: sel },
        events: {
          apply: (tagName: unknown) => {
            try {
              if (typeof tagName === "string" && editor && !editor.isReadOnly()) {
                const tagDef = TAGS.find(t => t.name === tagName);
                const argsStr = tagDef ? getUserArgStr(tagName, tagDef.args) : "";
                const replacement = tagDef?.hasInput === false
                  ? `<@${tagName}${argsStr}/>`
                  : sel
                    ? `<@${tagName}${argsStr}>${sel}</@${tagName}>`
                    : `<@${tagName}${argsStr}></@${tagName}>`;
                editor.replaceSelectedText(replacement);
              }
            } finally {
              dialog.close();
            }
          },
          close: () => dialog.close(),
        },
      },
      { title: "Hackvertor", closeOnEscape: true, closable: true }
    );
  }

  sdk.commands.register("hackvertor.search-tags", {
    name: "Search Hackvertor tags",
    group: "Hackvertor",
    run: (ctx) => {
      let sel = "";
      if (ctx.type === "RequestContext" || ctx.type === "ResponseContext") {
        sel = ctx.selection;
      } else {
        const view = sdk.window.getActiveEditor()?.getEditorView();
        if (!view) {
          document.dispatchEvent(new CustomEvent("hackvertor:search"));
          return;
        }
        const { from, to } = view.state.selection.main;
        sel = view.state.sliceDoc(from, to);
      }
      openSearch(sel);
    },
  });

  try { sdk.shortcuts.register("hackvertor.search-tags", ["shift", "ctrl", "h"]); } catch {}
  sdk.menu.registerItem({ type: "Request", commandId: "hackvertor.search-tags", leadingIcon: "fas fa-magnifying-glass" });
  sdk.commandPalette.register("hackvertor.search-tags");
  sdk.replay.addToSlot("session-toolbar-primary", { kind: "Command", commandId: "hackvertor.search-tags", icon: "fas fa-magnifying-glass" });
}


const HV_LOAD_KEY = "hv_load";
const HV_DEFAULTS_KEY = "hv_tag_defaults";

function getUserArgStr(tagName: string, args: { default: string }[]): string {
  if (!args.length) return "";
  try {
    const defaults = JSON.parse(localStorage.getItem(HV_DEFAULTS_KEY) ?? "{}") as Record<string, string[]>;
    return `(${args.map((a, i) => `"${defaults[tagName]?.[i] ?? a.default}"`).join(",")})`;
  } catch {
    return `(${args.map(a => `"${a.default}"`).join(",")})`;
  }
}

function setupSendToPanel(sdk: API) {
  sdk.commands.register("hackvertor.send-to-panel", {
    name: "Send to Hackvertor",
    group: "Hackvertor",
    run: (ctx) => {
      let content = "";
      const editorView = sdk.window.getActiveEditor()?.getEditorView();
      if (editorView) {
        content = editorView.state.doc.toString();
      } else if (ctx.type === "RequestContext" || ctx.type === "ResponseContext") {
        content = ctx.selection;
      }
      if (content) {
        localStorage.setItem(HV_LOAD_KEY, content);
        document.dispatchEvent(new CustomEvent("hackvertor:load", { detail: content }));
      }
      try { (sdk.navigation as any).navigate("/hackvertor"); } catch {}
    },
  });

  try { sdk.shortcuts.register("hackvertor.send-to-panel", ["shift", "ctrl", "y"]); } catch {}
  sdk.menu.registerItem({ type: "Request", commandId: "hackvertor.send-to-panel", leadingIcon: "fas fa-arrow-right-to-bracket" });
  sdk.commandPalette.register("hackvertor.send-to-panel");
  sdk.replay.addToSlot("session-toolbar-primary", { kind: "Command", commandId: "hackvertor.send-to-panel", icon: "fas fa-arrow-right-to-bracket" });
}

function setupMainPanel(sdk: API) {
  const container = document.createElement("div");
  container.id = "plugin--hackvertor";
  container.style.cssText = "height:100%;display:flex;flex-direction:column;";
  const app = createApp(HackvertorPanel);
  app.mount(container);
  sdk.navigation.addPage("/hackvertor", { body: container });
  sdk.sidebar.registerItem("Hackvertor", "/hackvertor", { icon: "fas fa-code" });
}

function makeViewMode(sdk: API) {
  return { label: "Hackvertor", view: { component: markRaw(ReplayView), props: { sdk } } };
}

function setupReplayViewMode(sdk: API) {
  sdk.replay.addRequestViewMode(makeViewMode(sdk));
}

function setupInterceptViewMode(sdk: API) {
  sdk.intercept.addRequestViewMode(makeViewMode(sdk));
}

function setupHistoryViewMode(sdk: API) {
  sdk.httpHistory.addRequestViewMode(makeViewMode(sdk));
}

function setupAutomateViewMode(sdk: API) {
  sdk.automate.addRequestViewMode(makeViewMode(sdk));
}



async function getBackendPluginId(sdk: API): Promise<string | undefined> {
  const packages = await sdk.graphql.pluginPackages();
  const pkg = packages.pluginPackages.find(p => p.manifestId === "hackvertor");
  if (!pkg) return undefined;
  const backend = pkg.plugins.find((p): p is Extract<typeof p, { __typename: "PluginBackend" }> => p.__typename === "PluginBackend");
  if (!backend) return undefined;
  return backend.id;
}

async function setupAutoUpstream(sdk: API) {
  try {
    const pluginId = await getBackendPluginId(sdk);
    if (!pluginId) return;
    const upstreams = await sdk.graphql.upstreams();
    const alreadyRegistered = upstreams.upstreamPlugins.some(u => u.plugin.id === pluginId);
    if (alreadyRegistered) return;
    await sdk.graphql.createUpstreamPlugin({
      input: { pluginId, allowlist: ["*"], denylist: [], enabled: true },
    });
  } catch (e) {
    console.error("[HV] setupAutoUpstream error:", e);
  }
}
