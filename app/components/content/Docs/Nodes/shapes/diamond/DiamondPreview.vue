<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg w-full">
      <div class="shape-node diamond-shape">
        <div class="diamond-shape-visual" style="width: 250px; height: 250px; background: rgba(139, 92, 246, 0.2); border: 2px solid #8b5cf6; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; transform-origin: center;">
          <span class="text-lg font-medium" style="transform: rotate(-45deg);">Diamond</span>
        </div>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      A diamond-shaped node that can be rotated and styled, perfect for decision points or special markers in your workflow.
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

