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
  const minimalDoc = "Six-sided geometric shape for representing special processes, stages, or unique elements.";
  emit("documentation", minimalDoc);

  const code = `<template>
  <BasicShapesRenderer
    node-type="hexagon"
    :custom-node-props="{
      id: 'hexagon-node-1',
      selected: false,
      data: {
        text: 'Hexagon',
        fillColor: '#ec4899',
        strokeColor: '#be185d',
        strokeWidth: 2
      }
    }"
    :update-node-data="updateNodeData"
  />
</template>

<script lang="ts" setup>
import BasicShapesRenderer from "~/components/canvas/nodes/BasicShapesRenderer.vue";

const updateNodeData = (nodeId: string, key: string, value: any) => {
  // Handle node data updates
  console.log(\`Update node \${nodeId}: \${key} = \${value}\`);
};
<\/script>`;

  emit("code", code);
});
</script>

