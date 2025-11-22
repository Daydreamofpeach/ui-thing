<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg w-full">
      <div class="shape-node triangle-shape">
        <div class="triangle-shape-visual" style="width: 0; height: 0; border-left: 125px solid transparent; border-right: 125px solid transparent; border-bottom: 200px solid rgba(249, 115, 22, 0.2); position: relative; display: flex; align-items: center; justify-content: center;">
          <span class="text-lg font-medium" style="position: absolute; bottom: -150px; color: #f97316;">Triangle</span>
        </div>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      A triangular shape node that can be used to represent direction, hierarchy, or visual emphasis in your workflow diagrams.
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

