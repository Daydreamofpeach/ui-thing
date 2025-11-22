<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg w-full">
      <div class="shape-node arrow-up-shape">
        <div class="arrow-up-shape-visual" style="width: 100px; height: 300px; background: rgba(249, 115, 22, 0.2); border: 2px solid #f97316; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center;">
          <span class="text-lg font-medium" style="writing-mode: vertical-rl; text-orientation: mixed;">Up Arrow</span>
          <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-bottom: 20px solid #f97316; border-left: 50px solid transparent; border-right: 50px solid transparent;"></div>
        </div>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      An upward-pointing arrow node that can be used to indicate upward flow, escalation, or progression in your workflow diagrams.
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

