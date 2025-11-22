<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="setup-project-node-preview-wrapper" style="width: 100%; max-width: 750px; margin: 0 auto;">
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
          class="docs-node-preview-flow setup-project-node-flow"
        >
          <template #node-setupProjectNode="{ data: node }">
            <div style="transform: scale(0.7); transform-origin: center;">
              <SetupProjectNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                :organisation-id="'org-1'"
                :existing-integration-types="[]"
                @close-node="() => {}"
                @integration-created="() => {}"
                @create-environment-node="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Integration setup node for linking repository integrations and connecting services to your project.
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

const SetupProjectNode = defineAsyncComponent(() => import("~/components/canvas/nodes/SetupProjectNode.vue"));

const nodeTypes = {
  setupProjectNode: SetupProjectNode
};

const demoNode = ref({
  id: "demo-setup-project-node",
  type: "setupProjectNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Integration Setup",
    currentStepNumber: 1,
    repositoryIntegrations: []
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 600px !important;
  background: transparent !important;
}

.docs-node-preview-flow.setup-project-node-flow {
  min-height: 650px !important;
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
  max-width: 750px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}

.setup-project-node-flow :deep(.setup-project-node-container) {
  width: 100% !important;
  max-width: 750px !important;
  overflow: visible !important;
}
</style>

