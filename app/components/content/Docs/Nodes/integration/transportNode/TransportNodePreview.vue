<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="transport-node-preview-wrapper" style="width: 100%; max-width: 650px; margin: 0 auto;">
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
          class="docs-node-preview-flow transport-node-flow"
        >
          <template #node-transportNode="{ data: node }">
            <div style="transform: scale(0.75); transform-origin: center;">
              <TransportNode
                :custom-node-props="node"
                :update-node-data="() => {}"
                organisation-id="org-1"
                :available-transports="[{
                  id: 'transport-1',
                  name: 'Email Transport',
                  type: 'EMAIL',
                  status: 'active'
                }]"
                @close-transport-node="() => {}"
                @transport-attached="() => {}"
              />
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Transport delivery node for sending messages via email, Slack, Discord, or webhooks.
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

const TransportNode = defineAsyncComponent(() => import("~/components/canvas/nodes/TransportNode.vue"));

const nodeTypes = {
  transportNode: TransportNode
};

const demoNode = ref({
  id: "demo-transport-node",
  type: "transportNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Transport Node",
    transportType: "email",
    transportId: "transport-1"
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

.docs-node-preview-flow.transport-node-flow {
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

/* Ensure transport node fits properly */
.transport-node-flow :deep(.transport-node-container) {
  width: 100% !important;
  max-width: 650px !important;
  overflow: visible !important;
}
</style>


