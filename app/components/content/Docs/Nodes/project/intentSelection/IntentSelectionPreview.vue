<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="intent-selection-preview-wrapper" style="width: 100%; max-width: 650px; margin: 0 auto;">
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
          class="docs-node-preview-flow intent-selection-flow"
        >
          <template #node-intentSelection="{ data: node }">
            <div style="transform: scale(0.75); transform-origin: center;">
              <IntentSelectionNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                @intentSelected="() => {}"
                @proceedToNext="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Intent selection node for choosing project creation method: existing, new, template, or git clone.
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

const IntentSelectionNode = defineAsyncComponent(() => import("~/components/canvas/nodes/childNodes/IntentSelectionNode.vue"));

const nodeTypes = {
  intentSelection: IntentSelectionNode
};

const demoNode = ref({
  id: "demo-intent-selection-node",
  type: "intentSelection",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Intent Selection",
    selectedProjectType: "new"
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 500px !important;
  background: transparent !important;
}

.docs-node-preview-flow.intent-selection-flow {
  min-height: 550px !important;
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
  width: 100% !important;
  max-width: 650px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}
</style>

