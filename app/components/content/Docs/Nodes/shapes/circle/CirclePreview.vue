<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg w-full">
      <div class="shape-node circle-shape">
        <div class="circle-shape-visual" style="width: 250px; height: 250px; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span class="text-lg font-medium">Circle</span>
        </div>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      A circular shape node that can be used to represent round elements, processes, or visual indicators in your workflow.
    </p>
  </div>
</template>

<script lang="ts" setup>
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
</script>

