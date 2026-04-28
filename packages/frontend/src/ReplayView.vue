<script setup lang="ts">
import { computed } from "vue";
import { convert } from "./engine";
import CodeMirrorView from "./CodeMirrorView.vue";

const props = defineProps<{
  request: { host: string; port: number; isTls: boolean; raw: string; type?: string };
}>();

const processedRaw = computed(() => {
  if (!props.request?.raw) return "";
  try {
    return convert(props.request.raw);
  } catch (e) {
    return `Error: ${e}`;
  }
});

const language = computed(() => {
  const raw = props.request?.raw ?? "";
  const match = raw.match(/^content-type:\s*([^\r\n;]+)/im);
  if (!match) return "";
  const ct = match[1].trim().toLowerCase();
  if (ct.includes("json")) return "json";
  if (ct.includes("html")) return "html";
  if (ct.includes("xml")) return "xml";
  if (ct.includes("javascript")) return "javascript";
  if (ct.includes("css")) return "css";
  if (ct.includes("yaml")) return "yaml";
  return "";
});
</script>

<template>
  <CodeMirrorView :content="processedRaw" :language="language" />
</template>
