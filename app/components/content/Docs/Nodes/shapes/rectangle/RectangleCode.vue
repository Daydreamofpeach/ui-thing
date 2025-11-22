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
  const minimalDoc = "Rectangular shape node that can be resized and customized for workflow diagrams.";
  emit("documentation", minimalDoc);

  const code = `<template>
  <BasicShapesRenderer
    node-type="rectangle"
    :custom-node-props="{
      id: 'rectangle-node-1',
      selected: false,
      data: {
        text: 'Rectangle',
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
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

