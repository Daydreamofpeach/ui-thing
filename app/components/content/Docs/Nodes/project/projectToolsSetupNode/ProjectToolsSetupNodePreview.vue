<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="project-tools-setup-preview-wrapper" style="width: 100%; max-width: 850px; margin: 0 auto;">
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
          class="docs-node-preview-flow project-tools-setup-flow"
        >
          <template #node-projectToolsSetupNode="{ data: node }">
            <div style="transform: scale(0.65); transform-origin: center;">
              <ProjectToolsSetupNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                :organisation-id="'org-1'"
                @close-node="() => {}"
                @continue-to-integrations="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Project tools setup node for configuring IDEs, editors, and developer tools before integration setup.
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

const ProjectToolsSetupNode = defineAsyncComponent(() => import("~/components/canvas/nodes/ProjectToolsSetupNode.vue"));

const nodeTypes = {
  projectToolsSetupNode: ProjectToolsSetupNode
};

const demoNode = ref({
  id: "demo-project-tools-setup-node",
  type: "projectToolsSetupNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Tools Setup",
    primaryIde: { name: "VS Code" },
    connectedIDEs: [{ name: "VS Code" }]
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 700px !important;
  background: transparent !important;
}

.docs-node-preview-flow.project-tools-setup-flow {
  min-height: 750px !important;
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
  max-width: 850px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}
</style>

