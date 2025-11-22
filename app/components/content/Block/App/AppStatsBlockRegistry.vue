<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">App Stats Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different app stats designs and variants. Each block showcases a unique approach to displaying application statistics.
      </p>
    </div>

    <StaticBlockShowcase :variants="appStatsVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all app stats block components
import BlockAppStats1 from './Stats/BlockAppStats1.vue';

// Define all app stats variants with their configurations
const appStatsVariants = [
  {
    title: "App Stats Style One",
    component: BlockAppStats1,
    iframeHeight: "400px",
    code: `<BlockAppStats1 />`
  }
];
</script>
