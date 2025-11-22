<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">{{ category.name }}</h2>
      <p class="text-sm text-muted-foreground">{{ category.description }}</p>
    </div>

    <div v-if="nodes.length === 0" class="text-center py-12 text-muted-foreground">
      <Icon name="lucide:info" class="size-12 mx-auto mb-4 opacity-50" />
      <p>No nodes available in this category.</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="node in nodes" :key="node.id" class="border rounded-lg overflow-hidden">
        <UiTabs :default-value="'preview-' + node.id" class="w-full">
          <UiTabsList class="w-full justify-start rounded-none border-b bg-muted/50">
            <UiTabsTrigger :value="'preview-' + node.id">
              <Icon name="lucide:eye" class="size-4 mr-2" />
              Preview
            </UiTabsTrigger>
            <UiTabsTrigger :value="'code-' + node.id">
              <Icon name="lucide:code" class="size-4 mr-2" />
              Code
            </UiTabsTrigger>
          </UiTabsList>

          <UiTabsContent :value="'preview-' + node.id" class="m-0 p-6 overflow-auto">
            <div class="min-h-[400px] w-full">
              <NodePreview :node="node" />
            </div>
          </UiTabsContent>

          <UiTabsContent :value="'code-' + node.id" class="m-0 p-6">
            <NodeCode :node="node" />
          </UiTabsContent>
        </UiTabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiTabs from "~/components/Ui/Tabs/Tabs.vue";
import UiTabsList from "~/components/Ui/Tabs/List.vue";
import UiTabsTrigger from "~/components/Ui/Tabs/Trigger.vue";
import UiTabsContent from "~/components/Ui/Tabs/Content.vue";
import NodePreview from "./NodePreview.vue";
import NodeCode from "./NodeCode.vue";

interface Props {
  category: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  nodes: Array<{
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    color?: string;
  }>;
}

const props = defineProps<Props>();
</script>

