<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="webview-node-preview-wrapper" style="width: 100%; max-width: 500px; margin: 0 auto;">
        <VueFlow
          :nodes="[demoNode]"
          :edges="[]"
          :node-types="nodeTypes"
          :nodes-draggable="false"
          :zoom-on-scroll="false"
          :pan-on-scroll="false"
          :zoom-on-double-click="false"
          :zoom-on-pinch="false"
          :fit-view-on-init="false"
          class="docs-node-preview-flow"
        >
          <template #node-webviewNode="{ data: node }">
            <div style="transform: scale(0.85); transform-origin: center;">
              <WebviewNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                @load-url-content="() => {}"
                @open-in-tauri-webview="() => {}"
                @open-in-external-browser="() => {}"
                @switch-to-html-mode="() => {}"
                @switch-to-url-mode="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Web viewer node for displaying web content and URLs in the canvas.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from "vue";
import { VueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";

interface Props {
  node: {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    color?: string;
  };
}

defineProps<Props>();

const WebviewNode = defineAsyncComponent(() => import("~/components/canvas/nodes/WebviewNode.vue"));

const nodeTypes = {
  webviewNode: WebviewNode
};

const demoNode = ref({
  id: "demo-webview-node",
  type: "webviewNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Webview",
    url: "https://buildit.builders/",
    status: "loading"
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 400px !important;
  background: transparent !important;
}

.docs-node-preview-flow :deep(.vue-flow__background),
.docs-node-preview-flow :deep(.vue-flow__controls),
.docs-node-preview-flow :deep(.vue-flow__minimap),
.docs-node-preview-flow :deep(.vue-flow__attribution) {
  display: none !important;
}

.docs-node-preview-flow :deep(.vue-flow__pane) {
  cursor: default !important;
  pointer-events: none !important;
}

.docs-node-preview-flow :deep(.vue-flow__transformationpane) {
  pointer-events: none !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) {
  pointer-events: auto !important;
  position: static !important;
  transform: none !important;
  cursor: default !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}
</style>


