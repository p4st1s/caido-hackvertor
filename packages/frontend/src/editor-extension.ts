import {
  Decoration,
  type DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import type { Extension } from "@codemirror/state";

const openDeco = Decoration.mark({ class: "cm-hv-tag" });
const closeDeco = Decoration.mark({ class: "cm-hv-tag cm-hv-tag-close" });

const matcher = new MatchDecorator({
  regexp: /<@[a-zA-Z][a-zA-Z0-9_]*(?:\([^>]*\))?\/?>|<\/@[a-zA-Z][a-zA-Z0-9_]*>/g,
  decoration: (match) => (match[0].startsWith("</@") ? closeDeco : openDeco),
});

const tagPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = matcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = matcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (v) => v.decorations }
);

const tagTheme = EditorView.baseTheme({
  ".cm-hv-tag": {
    color: "#e8531d",
    fontWeight: "600",
    borderRadius: "2px",
  },
  ".cm-hv-tag-close": {
    color: "#f59e0b",
  },
});

export const hackvertorTagHighlight: Extension = [tagPlugin, tagTheme];
