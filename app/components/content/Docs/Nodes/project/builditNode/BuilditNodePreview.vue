<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="buildit-node-preview-wrapper" style="width: 100%; max-width: 600px; margin: 0 auto;">
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
          class="docs-node-preview-flow buildit-node-flow"
        >
          <template #node-builditNode="{ data: node }">
            <div style="transform: scale(0.8); transform-origin: center;">
              <BuilditNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                @close="() => {}"
                @edit="() => {}"
                @resize="() => {}"
                @resizeEnd="() => {}"
                @code-changed="() => {}"
                @file-downloaded="() => {}"
                @close-editor="() => {}"
                @refresh-code="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      BuildIt installation runner node for executing BuildIt installations and managing project builds.
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

const BuilditNode = defineAsyncComponent(() => import("~/components/canvas/nodes/BuilditNode.vue"));

const nodeTypes = {
  builditNode: BuilditNode
};

const demoNode = ref({
  id: "demo-buildit-node",
  type: "builditNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "BuildIt",
    projectId: "project-1",
    projectName: "Sample Project",
    status: "ready"
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 550px !important;
  background: transparent !important;
}

.docs-node-preview-flow.buildit-node-flow {
  min-height: 600px !important;
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
  max-width: 600px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}

.buildit-node-flow :deep(.buildit-node) {
  width: 100% !important;
  max-width: 600px !important;
  overflow: visible !important;
}
</style>

