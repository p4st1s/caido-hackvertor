<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { hackvertorTagHighlight } from "./editor-extension";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const container = ref<HTMLElement>();
let view: EditorView | undefined;

function createEditor() {
  if (!container.value) return;
  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        hackvertorTagHighlight,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) emit("update:modelValue", u.state.doc.toString());
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            background: "var(--c-bg-subtle, #141414)",
            color: "var(--c-fg-default, #e5e5e5)",
            fontSize: "13px",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          },
          "&.cm-focused": { outline: "none" },
          ".cm-content": {
            padding: "10px",
            caretColor: "var(--c-accent-default, #e8531d)",
            minHeight: "100%",
          },
          ".cm-cursor": { borderLeftColor: "var(--c-accent-default, #e8531d)" },
          ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
            background: "rgba(232,83,29,0.2)",
          },
          ".cm-scroller": { overflow: "auto" },
          ".cm-line": { wordBreak: "break-all", overflowWrap: "anywhere" },
        }),
      ],
    }),
    parent: container.value,
  });
}

watch(
  () => props.modelValue,
  (val) => {
    if (!view || view.state.doc.toString() === val) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: val } });
  }
);

function getSelection(): string {
  if (!view) return "";
  const { from, to } = view.state.selection.main;
  return view.state.sliceDoc(from, to);
}

function insertTag(open: string, close: string, selection: string) {
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const insert = open + selection + close;
  // cursor inside tags when no selection, after close tag when there is one
  const anchor = selection ? from + insert.length : from + open.length;
  view.dispatch({ changes: { from, to, insert }, selection: { anchor } });
  view.focus();
}

function insertSelf(tag: string) {
  if (!view) return;
  const { from, to } = view.state.selection.main;
  view.dispatch({ changes: { from, to, insert: tag }, selection: { anchor: from + tag.length } });
  view.focus();
}

function clear() {
  if (!view) return;
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: "" } });
  view.focus();
}

defineExpose({ getSelection, insertTag, insertSelf, clear });

onMounted(createEditor);
onUnmounted(() => { view?.destroy(); view = undefined; });
</script>

<template>
  <div ref="container" style="height:100%;overflow:hidden;" />
</template>
