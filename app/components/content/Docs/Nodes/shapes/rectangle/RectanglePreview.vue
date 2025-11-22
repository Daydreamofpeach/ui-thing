<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg w-full">
      <div class="shape-node rectangle-shape">
        <div class="rectangle-shape-visual" style="width: 300px; height: 200px; background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <span class="text-lg font-medium">Rectangle</span>
        </div>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      A rectangular shape node that can be resized and customized for your workflow diagrams.
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

