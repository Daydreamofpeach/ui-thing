<template>
  <div></div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

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

const emit = defineEmits<{
  code: [code: string];
  documentation: [doc: string];
}>();

const props = defineProps<Props>();

onMounted(() => {
  const minimalDoc = "Upward-pointing arrow node for indicating upward flow, escalation, or vertical progression.";
  emit("documentation", minimalDoc);

  const code = `<template>
  <ArrowShapesRenderer
    node-type="arrowUp"
    :custom-node-props="{
      id: 'arrow-up-node-1',
      selected: false,
      data: {
        text: 'Up Arrow',
        direction: 'up'
      }
    }"
    :update-node-data="updateNodeData"
  />
</template>

<script lang="ts" setup>
import ArrowShapesRenderer from "~/components/canvas/nodes/ArrowShapesRenderer.vue";

const updateNodeData = (nodeId: string, key: string, value: any) => {
  // Handle node data updates
  console.log(\`Update node \${nodeId}: \${key} = \${value}\`);
};
<\/script>`;

  emit("code", code);
});
</script>

