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
  const defaultCode = `<template>
  <BaseNodeTemplate
    title="${props.node.name}"
    icon="${props.node.icon?.replace('i-lucide-', 'lucide:') || 'lucide:box'}"
    theme-color="#e34d03"
    :custom-node-props="{
      id: 'demo-node',
      selected: false,
      data: {
        label: '${props.node.name}',
        collapsed: false,
        width: 450,
        height: 320
      },
      draggable: false
    }"
    :min-width="400"
    :min-height="300"
    :default-collapsed="false"
    :show-handles="false"
    :show-resizer="false"
  >
    <template #default>
      <div class="p-4 space-y-3">
        <p class="text-sm text-muted-foreground">
          ${props.node.description}
        </p>
        <div class="flex gap-2">
          <UiButton size="sm">Action 1</UiButton>
          <UiButton size="sm" variant="outline">Action 2</UiButton>
        </div>
      </div>
    </template>
  </BaseNodeTemplate>
</template>

<script lang="ts" setup>
import BaseNodeTemplate from "~/components/canvas/nodes/templates/BaseNodeTemplate.vue";
<\/script>`;

  const minimalDoc = `${props.node.description}. Use this node in your canvas workflows.`;

  emit("code", defaultCode);
  emit("documentation", minimalDoc);
});
</script>

