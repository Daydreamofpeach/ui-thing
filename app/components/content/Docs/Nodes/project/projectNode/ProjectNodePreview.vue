<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="project-node-preview-wrapper" style="width: 100%; max-width: 700px; margin: 0 auto;">
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
          class="docs-node-preview-flow project-node-flow"
        >
          <template #node-projectNode="{ data: node }">
            <div style="transform: scale(0.75); transform-origin: center;">
              <ProjectNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                :organisation-id="'org-1'"
                :available-projects="[{
                  id: 'project-1',
                  name: 'Sample Project',
                  description: 'A sample project for demonstration',
                  status: 'active'
                }]"
                @close-node="() => {}"
                @project-attached="() => {}"
                @create-project="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Project management node for selecting and managing projects in your organization.
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

const ProjectNode = defineAsyncComponent(() => import("~/components/canvas/nodes/ProjectNode.vue"));

const nodeTypes = {
  projectNode: ProjectNode
};

const demoNode = ref({
  id: "demo-project-node",
  type: "projectNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Project Management",
    selectedProjectId: null,
    projectName: "Sample Project"
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

.docs-node-preview-flow.project-node-flow {
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
  max-width: 700px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}

.project-node-flow :deep(.project-node-container) {
  width: 100% !important;
  max-width: 700px !important;
  overflow: visible !important;
}
</style>

