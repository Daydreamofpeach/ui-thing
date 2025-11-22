<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Pricing Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different pricing section designs and variants. Each block showcases a unique approach to displaying pricing information.
      </p>
    </div>

    <StaticBlockShowcase :variants="pricingVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all pricing block components
import BlockPricing1 from './BlockPricing1.vue';
import BlockPricing2 from './BlockPricing2.vue';
import BlockPricing3 from './BlockPricing3.vue';
import BlockPricing4 from './BlockPricing4.vue';

// Define all pricing variants with their configurations
const pricingVariants = [
  {
    title: "Pricing Style One",
    component: BlockPricing1,
    iframeHeight: "600px",
    code: `<BlockPricing1 />`
  },
  {
    title: "Pricing Style Two",
    component: BlockPricing2,
    iframeHeight: "600px",
    code: `<BlockPricing2 />`
  },
  {
    title: "Pricing Style Three",
    component: BlockPricing3,
    iframeHeight: "600px",
    code: `<BlockPricing3 />`
  },
  {
    title: "Pricing Style Four",
    component: BlockPricing4,
    iframeHeight: "600px",
    code: `<BlockPricing4 />`
  }
];
</script>
