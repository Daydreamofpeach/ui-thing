<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <BaseNodeTemplate
      :title="node.name"
      :icon="node.icon?.replace('i-lucide-', 'lucide:') || 'lucide:box'"
      theme-color="#e34d03"
      :custom-node-props="{
        id: 'demo-' + node.id,
        selected: false,
        data: {
          label: node.name,
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
      :show-edit-button="false"
      :show-close-button="false"
    >
      <template #default>
        <div class="p-4 space-y-3">
          <p class="text-sm text-muted-foreground text-center">
            {{ node.description }}
          </p>
          <div class="flex gap-2 justify-center">
            <UiButton size="sm">Action 1</UiButton>
            <UiButton size="sm" variant="outline">Action 2</UiButton>
          </div>
        </div>
      </template>
    </BaseNodeTemplate>
  </div>
</template>

<script lang="ts" setup>
import BaseNodeTemplate from "~/components/canvas/nodes/templates/BaseNodeTemplate.vue";

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

const props = defineProps<Props>();
</script>

