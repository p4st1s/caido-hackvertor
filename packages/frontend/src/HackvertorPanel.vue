<template>
  <div class="hv-root">
    <div class="hv-sidebar">
      <div class="hv-search">
        <input v-model="search" placeholder="Search tags…" class="hv-search-input" />
      </div>
      <div class="hv-categories">
        <div v-for="cat in visibleCategories" :key="cat" class="hv-category">
          <div class="hv-category-header" @click="toggleCategory(cat)">
            <span class="hv-chevron">{{ openCategories.has(cat) ? "▾" : "▸" }}</span>
            {{ cat }}
          </div>
          <div v-if="openCategories.has(cat)" class="hv-tag-list">
            <div
              v-for="tag in filteredTagsByCategory(cat)"
              :key="tag.name"
              class="hv-tag-item"
              @click="insertTag(tag)"
              :title="tag.name"
            >
              <code class="hv-tag-code">&lt;@{{ tag.name }}&gt;</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hv-main">
      <div class="hv-toolbar">
        <button class="hv-btn" @click="clearInput" :disabled="showSettings">Clear</button>
        <button class="hv-btn" @click="copyPreview" :disabled="showSettings">Copy</button>
        <button class="hv-btn hv-btn-settings" :class="{ 'hv-btn-active': showSettings }" @click="showSettings = !showSettings">Settings</button>
      </div>

      <div v-if="!showSettings" class="hv-panels">
        <div class="hv-panel">
          <div class="hv-panel-label">Input</div>
          <textarea ref="inputEl" v-model="inputText" class="hv-textarea" spellcheck="false" />
        </div>
        <div class="hv-divider" />
        <div class="hv-panel">
          <div class="hv-panel-label">Preview</div>
          <pre class="hv-preview" :class="{ 'hv-preview-error': previewText.startsWith('Error:') }">{{ previewText }}</pre>
        </div>
      </div>

      <div v-else class="hv-settings">
        <div v-for="cat in settingsCategories" :key="cat" class="hv-settings-cat">
          <div class="hv-settings-cat-header">{{ cat }}</div>
          <div v-for="tag in tagsWithArgsByCategory(cat)" :key="tag.name" class="hv-settings-row">
            <code class="hv-settings-name">{{ tag.name }}</code>
            <div class="hv-settings-args">
              <div v-for="(arg, i) in tag.args" :key="i" class="hv-settings-field">
                <label class="hv-settings-label">{{ arg.label }}</label>
                <input
                  :value="getDefault(tag.name, i)"
                  @input="setDefault(tag.name, i, ($event.target as HTMLInputElement).value)"
                  class="hv-settings-input"
                  spellcheck="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showSearch" class="hv-overlay" @click.self="showSearch = false">
    <div class="hv-overlay-box">
      <input
        ref="searchOverlayEl"
        v-model="overlayQuery"
        placeholder="Search tags…"
        class="hv-overlay-input"
        @keydown="onOverlayKey"
      />
      <div class="hv-overlay-list">
        <div
          v-for="(tag, i) in overlayTags"
          :key="tag.name"
          class="hv-overlay-item"
          :class="{ 'hv-overlay-item-active': i === overlayIndex }"
          @click="pickTag(tag)"
          @mouseenter="overlayIndex = i"
        >
          <code class="hv-overlay-code">&lt;@{{ tag.name }}&gt;</code>
          <span class="hv-overlay-cat">{{ tag.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { convert } from "./engine";
import { TAGS, CATEGORIES, type TagDef } from "./tags";

const DEFAULTS_KEY = "hv_tag_defaults";

function loadDefaults(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(DEFAULTS_KEY) ?? "{}"); } catch { return {}; }
}

const inputText = ref("");
const search = ref("");
const inputEl = ref<HTMLTextAreaElement>();
const openCategories = ref<Set<string>>(new Set(["Encode", "Decode"]));
const showSettings = ref(false);
const tagDefaults = ref<Record<string, string[]>>(loadDefaults());

const showSearch = ref(false);
const overlayQuery = ref("");
const overlayIndex = ref(-1);
const searchOverlayEl = ref<HTMLInputElement>();

function getDefault(tagName: string, argIndex: number): string {
  const tag = TAGS.find(t => t.name === tagName);
  return tagDefaults.value[tagName]?.[argIndex] ?? tag?.args[argIndex]?.default ?? "";
}

function setDefault(tagName: string, argIndex: number, value: string) {
  const tag = TAGS.find(t => t.name === tagName);
  if (!tag) return;
  const arr = tag.args.map((a, i) => tagDefaults.value[tagName]?.[i] ?? a.default);
  arr[argIndex] = value;
  tagDefaults.value = { ...tagDefaults.value, [tagName]: arr };
  localStorage.setItem(DEFAULTS_KEY, JSON.stringify(tagDefaults.value));
}

const settingsCategories = computed(() =>
  CATEGORIES.filter(cat => TAGS.some(t => t.category === cat && t.args.length > 0))
);

function tagsWithArgsByCategory(cat: string) {
  return TAGS.filter(t => t.category === cat && t.args.length > 0);
}

const overlayTags = computed(() => {
  const q = overlayQuery.value.toLowerCase();
  return q ? TAGS.filter(t => t.name.includes(q) || t.category.toLowerCase().includes(q)) : TAGS;
});

watch(overlayQuery, () => { overlayIndex.value = -1; });

const HV_LOAD_KEY = "hv_load";

const onHackvertorSearch = () => { showSearch.value = true; };
const onHackvertorLoad = (e: Event) => {
  const content = (e as CustomEvent<string>).detail;
  if (content) inputText.value = content;
};

onMounted(() => {
  document.addEventListener("hackvertor:search", onHackvertorSearch);
  document.addEventListener("hackvertor:load", onHackvertorLoad);
  const pending = localStorage.getItem(HV_LOAD_KEY);
  if (pending) {
    inputText.value = pending;
    localStorage.removeItem(HV_LOAD_KEY);
  }
});
onUnmounted(() => {
  document.removeEventListener("hackvertor:search", onHackvertorSearch);
  document.removeEventListener("hackvertor:load", onHackvertorLoad);
});

watch(showSearch, (val) => {
  if (val) {
    overlayQuery.value = "";
    overlayIndex.value = -1;
    nextTick(() => searchOverlayEl.value?.focus());
  }
});

function pickTag(tag: TagDef) {
  showSearch.value = false;
  insertTag(tag);
}

function onOverlayKey(e: KeyboardEvent) {
  const tags = overlayTags.value;
  if (e.key === "Escape") {
    showSearch.value = false;
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    overlayIndex.value = Math.min(overlayIndex.value + 1, tags.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    overlayIndex.value = Math.max(overlayIndex.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const tag = overlayIndex.value >= 0 ? tags[overlayIndex.value] : tags[0];
    if (tag) pickTag(tag);
  }
}

const previewText = computed(() => {
  try {
    return convert(inputText.value);
  } catch (e) {
    return `Error: ${e}`;
  }
});

const visibleCategories = computed(() => {
  if (!search.value) return CATEGORIES;
  return CATEGORIES.filter(cat => filteredTagsByCategory(cat).length > 0);
});

function filteredTagsByCategory(cat: string): TagDef[] {
  const q = search.value.toLowerCase();
  return TAGS.filter(t => t.category === cat && (!q || t.name.includes(q)));
}

function toggleCategory(cat: string) {
  if (openCategories.value.has(cat)) {
    openCategories.value.delete(cat);
  } else {
    openCategories.value.add(cat);
  }
}

function clearInput() {
  const el = inputEl.value;
  if (!el) return;
  el.focus();
  el.select();
  if (!document.execCommand("insertText", false, "")) {
    inputText.value = "";
  }
}

function copyPreview() {
  navigator.clipboard.writeText(previewText.value);
}

function insertTag(tag: TagDef) {
  const el = inputEl.value;
  if (!el) return;
  const start = el.selectionStart ?? inputText.value.length;
  const end = el.selectionEnd ?? inputText.value.length;
  const selected = inputText.value.slice(start, end);
  const argValues = tag.args.map((a, i) => tagDefaults.value[tag.name]?.[i] ?? a.default);
  const argStr = tag.args.length ? `(${argValues.map(v => `"${v}"`).join(",")})` : "";
  const insertion = tag.hasInput
    ? `<@${tag.name}${argStr}>${selected}</@${tag.name}>`
    : `<@${tag.name}${argStr}/>`;
  el.focus();
  el.setSelectionRange(start, end);
  if (!document.execCommand("insertText", false, insertion)) {
    inputText.value = inputText.value.slice(0, start) + insertion + inputText.value.slice(end);
    const cursor = start + insertion.length;
    nextTick(() => el.setSelectionRange(cursor, cursor));
  }
}
</script>

<style scoped>
.hv-root {
  display: flex;
  height: 100%;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  background: var(--c-bg-default, #111111);
  color: var(--c-fg-default, #e5e5e5);
}

.hv-sidebar {
  width: 210px;
  min-width: 160px;
  border-right: 1px solid var(--c-border-default, #2a2a2a);
  display: flex;
  flex-direction: column;
  background: var(--c-bg-default, #111111);
}

.hv-search {
  padding: 8px;
  border-bottom: 1px solid var(--c-border-default, #2a2a2a);
}

.hv-search-input {
  width: 100%;
  box-sizing: border-box;
  background: var(--c-bg-subtle, #1c1c1c);
  border: 1px solid var(--c-border-default, #2a2a2a);
  color: var(--c-fg-default, #e5e5e5);
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.hv-search-input:focus {
  border-color: var(--c-accent-default, #e8531d);
}

.hv-categories {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.hv-category-header {
  padding: 5px 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-fg-subtle, #666);
  display: flex;
  align-items: center;
  gap: 5px;
  user-select: none;
  margin-top: 4px;
}

.hv-category-header:hover {
  color: var(--c-fg-default, #e5e5e5);
}

.hv-chevron {
  font-size: 10px;
  width: 10px;
  display: inline-block;
}

.hv-tag-list {
  padding: 1px 0;
}

.hv-tag-item {
  padding: 3px 10px 3px 22px;
  cursor: pointer;
  border-radius: 3px;
  margin: 0 4px;
}

.hv-tag-item:hover {
  background: var(--c-bg-subtle, #1c1c1c);
}

.hv-tag-item:hover .hv-tag-code {
  color: var(--c-accent-default, #e8531d);
}

.hv-tag-code {
  font-size: 12px;
  font-family: inherit;
  color: var(--c-fg-default, #c8c8c8);
  background: none;
  white-space: nowrap;
}

.hv-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hv-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-bottom: 1px solid var(--c-border-default, #2a2a2a);
  background: var(--c-bg-default, #111111);
}

.hv-btn {
  padding: 4px 12px;
  border: 1px solid var(--c-border-default, #333);
  background: var(--c-bg-subtle, #1c1c1c);
  color: var(--c-fg-default, #e5e5e5);
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s;
}

.hv-btn:hover {
  background: var(--c-bg-hover, #242424);
  border-color: var(--c-border-hover, #444);
}

.hv-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.hv-btn-settings {
  margin-left: auto;
}

.hv-btn-active {
  border-color: var(--c-accent-default, #e8531d);
  color: var(--c-accent-default, #e8531d);
}

.hv-panels {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.hv-divider {
  width: 1px;
  background: var(--c-border-default, #2a2a2a);
  flex-shrink: 0;
}

.hv-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hv-panel-label {
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-fg-subtle, #555);
  border-bottom: 1px solid var(--c-border-default, #2a2a2a);
  background: var(--c-bg-default, #111111);
}

.hv-textarea {
  flex: 1;
  resize: none;
  background: var(--c-bg-subtle, #141414);
  color: var(--c-fg-default, #e5e5e5);
  border: none;
  outline: none;
  padding: 10px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  caret-color: var(--c-accent-default, #e8531d);
}

.hv-preview {
  flex: 1;
  overflow: auto;
  margin: 0;
  padding: 10px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--c-bg-subtle, #141414);
  color: var(--c-fg-default, #e5e5e5);
}

.hv-preview-error {
  color: #f87171;
}

.hv-settings {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.hv-settings-cat {
  margin-bottom: 4px;
}

.hv-settings-cat-header {
  padding: 5px 14px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-fg-subtle, #666);
  margin-top: 6px;
}

.hv-settings-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 4px 14px;
}

.hv-settings-name {
  font-size: 12px;
  color: var(--c-fg-default, #c8c8c8);
  white-space: nowrap;
  min-width: 180px;
  padding-top: 4px;
}

.hv-settings-args {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hv-settings-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hv-settings-label {
  font-size: 11px;
  color: var(--c-fg-subtle, #666);
  white-space: nowrap;
}

.hv-settings-input {
  width: 140px;
  padding: 3px 7px;
  background: var(--c-bg-subtle, #1c1c1c);
  border: 1px solid var(--c-border-default, #2a2a2a);
  color: var(--c-fg-default, #e5e5e5);
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.hv-settings-input:focus {
  border-color: var(--c-accent-default, #e8531d);
}

.hv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  z-index: 1000;
}

.hv-overlay-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 360px;
  padding: 10px;
  font-family: ui-monospace, monospace;
  background: var(--c-bg-default, #1a1a1a);
  border: 1px solid var(--c-border-default, #333);
  border-radius: 6px;
}

.hv-overlay-input {
  padding: 7px 10px;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #e5e5e5;
  border-radius: 5px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  width: 100%;
  font-family: inherit;
}

.hv-overlay-input:focus {
  border-color: var(--c-accent-default, #e8531d);
}

.hv-overlay-list {
  max-height: 380px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hv-overlay-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.hv-overlay-item:hover,
.hv-overlay-item-active {
  background: #2a2a2a;
}

.hv-overlay-code {
  font-size: 13px;
  color: #4ec9b0;
  background: none;
  font-family: inherit;
}

.hv-overlay-cat {
  font-size: 11px;
  color: #666;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
}
</style>
