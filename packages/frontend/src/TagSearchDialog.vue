<template>
  <div style="display:flex;flex-direction:column;gap:6px;width:360px;padding:10px;font-family:ui-monospace,monospace;">
    <input
      class="hv-search-input"
      @input="onInput"
      @keydown="onKeydown"
      autofocus
      style="padding:7px 10px;border:1px solid #333;background:#1a1a1a;color:#e5e5e5;border-radius:5px;font-size:13px;outline:none;box-sizing:border-box;width:100%;font-family:inherit;"
      placeholder="Search tags…"
    />
    <div style="max-height:380px;overflow-y:auto;display:flex;flex-direction:column;gap:1px;">
      <template v-for="tag in TAGS" :key="tag.name">
        <div
          :data-hv="tag.name + ' ' + tag.category"
          style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-radius:4px;cursor:pointer;"
          @click="emit('apply', tag.name)"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
        >
          <code style="font-size:13px;color:#4ec9b0;background:none;font-family:inherit;">&lt;@{{ tag.name }}&gt;</code>
          <span style="font-size:11px;color:#666;background:#1a1a1a;border:1px solid #2a2a2a;padding:1px 6px;border-radius:3px;white-space:nowrap;">{{ tag.category }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TAGS } from "./tags";

defineProps<{}>();
const emit = defineEmits<{ apply: [tagName: string]; close: [] }>();

let selectedIndex = -1;

function getList(input: HTMLElement): Element | null {
  return input.nextElementSibling;
}

function visibleItems(list: Element): HTMLElement[] {
  return Array.from(list.querySelectorAll<HTMLElement>("[data-hv]"))
    .filter(el => el.style.display !== "none");
}

function highlight(list: Element, index: number) {
  visibleItems(list).forEach((el, i) => {
    el.style.background = i === index ? "#2a2a2a" : "";
  });
}

function onInput(e: Event) {
  selectedIndex = -1;
  const input = e.target as HTMLInputElement;
  const q = input.value.toLowerCase();
  const list = getList(input);
  if (!list) return;
  list.querySelectorAll<HTMLElement>("[data-hv]").forEach(item => {
    const data = item.getAttribute("data-hv") ?? "";
    item.style.display = q && !data.toLowerCase().includes(q) ? "none" : "";
    item.style.background = "";
  });
}

function onKeydown(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement;
  const list = getList(input);
  if (!list) return;
  const items = visibleItems(list);
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    highlight(list, selectedIndex);
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    highlight(list, selectedIndex);
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    const item = selectedIndex >= 0 ? items[selectedIndex] : items[0];
    if (item) item.click();
  }
}

function onMouseEnter(e: MouseEvent) {
  const input = (e.currentTarget as HTMLElement).closest("div[style*='flex-direction:column']")?.querySelector("input");
  const list = input ? getList(input) : null;
  if (list) {
    const items = visibleItems(list);
    selectedIndex = items.indexOf(e.currentTarget as HTMLElement);
    highlight(list, selectedIndex);
  }
}

function onMouseLeave(e: MouseEvent) {
  (e.currentTarget as HTMLElement).style.background = "";
}
</script>
