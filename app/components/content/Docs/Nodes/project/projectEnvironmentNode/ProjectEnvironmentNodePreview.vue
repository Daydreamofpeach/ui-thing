<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="project-environment-node-preview-wrapper" style="width: 100%; max-width: 750px; margin: 0 auto;">
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
          class="docs-node-preview-flow project-environment-node-flow"
        >
          <template #node-projectEnvironmentNode="{ data: node }">
            <div style="transform: scale(0.7); transform-origin: center;">
              <ProjectEnvironmentNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                :organisation-id="'org-1'"
                @close-node="() => {}"
                @environment-saved="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Project environment setup node for configuring development environments and dependencies.
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

const ProjectEnvironmentNode = defineAsyncComponent(() => import("~/components/canvas/nodes/ProjectEnvironmentNode.vue"));

const nodeTypes = {
  projectEnvironmentNode: ProjectEnvironmentNode
};

const demoNode = ref({
  id: "demo-project-environment-node",
  type: "projectEnvironmentNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Project Environment",
    currentStep: 3,
    linkedTemplates: []
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

.docs-node-preview-flow.project-environment-node-flow {
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

.project-environment-node-flow :deep(.project-environment-node) {
  width: 100% !important;
  max-width: 750px !important;
  overflow: visible !important;
}
</style>

