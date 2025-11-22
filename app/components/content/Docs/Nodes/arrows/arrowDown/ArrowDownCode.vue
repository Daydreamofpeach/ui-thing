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
  const minimalDoc = "Downward-pointing arrow node for indicating downward flow, delegation, or descending progression.";
  emit("documentation", minimalDoc);

  const code = `<template>
  <ArrowShapesRenderer
    node-type="arrowDown"
    :custom-node-props="{
      id: 'arrow-down-node-1',
      selected: false,
      data: {
        text: 'Down Arrow',
        direction: 'down'
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

