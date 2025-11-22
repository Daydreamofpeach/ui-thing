<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">FAQ Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different FAQ section designs and variants. Each block showcases a unique approach to displaying frequently asked questions.
      </p>
    </div>

    <StaticBlockShowcase :variants="faqVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all FAQ block components
import BlockFAQ1 from './BlockFAQ1.vue';
import BlockFAQ2 from './BlockFAQ2.vue';
import BlockFAQ3 from './BlockFAQ3.vue';

// Define all FAQ variants with their configurations
const faqVariants = [
  {
    title: "FAQ Style One",
    component: BlockFAQ1,
    iframeHeight: "500px",
    code: `<BlockFAQ1 />`
  },
  {
    title: "FAQ Style Two",
    component: BlockFAQ2,
    iframeHeight: "500px",
    code: `<BlockFAQ2 />`
  },
  {
    title: "FAQ Style Three",
    component: BlockFAQ3,
    iframeHeight: "500px",
    code: `<BlockFAQ3 />`
  }
];
</script>
