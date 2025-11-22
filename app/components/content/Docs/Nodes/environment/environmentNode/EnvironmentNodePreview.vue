<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="environment-node-preview-wrapper" style="width: 100%; max-width: 950px; margin: 0 auto;">
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
          class="docs-node-preview-flow environment-node-flow"
        >
          <template #node-environmentNode="{ data: node }">
            <div style="transform: scale(0.65); transform-origin: center;">
              <EnvironmentNode
                :custom-node-props="node"
                @open-cli-node="() => {}"
                @open-rust-node="() => {}"
                @detect-package-managers="() => {}"
                @detect-chocolatey="() => {}"
                @detect-node="() => {}"
                @check-all-ides="() => {}"
                @refresh-env-vars="() => {}"
                @detect-rust="() => {}"
                @install-rust="() => {}"
                @detect-php="() => {}"
                @install-php="() => {}"
                @detect-dotnet="() => {}"
                @install-dotnet="() => {}"
                @detect-python="() => {}"
                @install-python="() => {}"
                @detect-java="() => {}"
                @install-java="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Comprehensive environment setup node for detecting OS, languages, package managers, and development tools.
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

const EnvironmentNode = defineAsyncComponent(() => import("~/components/canvas/nodes/EnvironmentSetupNode.vue"));

const nodeTypes = {
  environmentNode: EnvironmentNode
};

const demoNode = ref({
  id: "demo-environment-node",
  type: "environmentNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Environment Setup"
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 750px !important;
  background: transparent !important;
}

.docs-node-preview-flow.environment-node-flow {
  min-height: 800px !important;
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
  max-width: 950px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}
</style>

