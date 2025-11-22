<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">CTA Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different call-to-action section designs and variants. Each block showcases a unique approach to encouraging user engagement.
      </p>
    </div>

    <StaticBlockShowcase :variants="ctaVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all CTA block components
import BlockCTA1 from './BlockCTA1.vue';
import BlockCTA2 from './BlockCTA2.vue';
import BlockCTA3 from './BlockCTA3.vue';
import BlockCTA4 from './BlockCTA4.vue';
import BlockCTA5 from './BlockCTA5.vue';

// Define all CTA variants with their configurations
const ctaVariants = [
  {
    title: "CTA Style One",
    component: BlockCTA1,
    iframeHeight: "400px",
    code: `<BlockCTA1 />`
  },
  {
    title: "CTA Style Two",
    component: BlockCTA2,
    iframeHeight: "400px",
    code: `<BlockCTA2 />`
  },
  {
    title: "CTA Style Three",
    component: BlockCTA3,
    iframeHeight: "400px",
    code: `<BlockCTA3 />`
  },
  {
    title: "CTA Style Four",
    component: BlockCTA4,
    iframeHeight: "400px",
    code: `<BlockCTA4 />`
  },
  {
    title: "CTA Style Five",
    component: BlockCTA5,
    iframeHeight: "400px",
    code: `<BlockCTA5 />`
  }
];
</script>
