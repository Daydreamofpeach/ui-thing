<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="hook-node-preview-wrapper" style="width: 100%; max-width: 600px; min-width: 450px; margin: 0 auto;">
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
          class="docs-node-preview-flow hook-node-flow"
        >
          <template #node-hookNode="{ data: node }">
            <div style="transform: scale(0.8); transform-origin: center;">
              <HookNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                organisation-id="org-1"
                :available-hooks="[{
                  id: 'hook-1',
                  name: 'Form Submission Hook',
                  type: 'BUTT',
                  token: 'abc123...',
                  trigger: 'form.submitted'
                }]"
                @close-node="() => {}"
                @hook-attached="() => {}"
                @create-transport-listener="() => {}"
                @remove-transport-listener="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Webhook hook node for receiving and processing HTTP webhooks. Supports both creating new hooks and selecting existing ones.
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

const HookNode = defineAsyncComponent(() => import("~/components/canvas/nodes/hooks/HookNode.vue"));

const nodeTypes = {
  hookNode: HookNode
};

const demoNode = ref({
  id: "demo-hook-node",
  type: "hookNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Hook",
    hookId: "hook-1",
    hookName: "Form Submission Hook",
    hookType: "BUTT",
    hookToken: "abc123...",
    hookTriggers: ["form.submitted"],
    listeners: [{
      name: "Email Transport",
      type: "EMAIL"
    }]
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

.docs-node-preview-flow.hook-node-flow {
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
  max-width: 600px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}

/* Ensure hook node fits properly */
.hook-node-flow :deep(.hook-node-container) {
  width: 100% !important;
  max-width: 600px !important;
  overflow: visible !important;
}

.hook-node-flow :deep(.node-icon-wrapper) {
  position: absolute !important;
  top: -20px !important;
  z-index: 10 !important;
}
</style>


