<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg w-full">
      <div class="shape-node hexagon-shape">
        <div class="hexagon-shape-visual" style="width: 250px; height: 250px; background: rgba(236, 72, 153, 0.2); border: 2px solid #ec4899; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display: flex; align-items: center; justify-content: center;">
          <span class="text-lg font-medium">Hexagon</span>
        </div>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      A hexagonal shape node with six sides, perfect for representing special processes, stages, or unique elements in your workflow.
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

