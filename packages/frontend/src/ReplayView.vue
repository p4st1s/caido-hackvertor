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
</script>

<template>
  <CodeMirrorView :content="processedRaw" language="" />
</template>
