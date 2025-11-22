<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">App Header Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different app header designs and variants. Each block showcases a unique approach to application headers.
      </p>
    </div>

    <StaticBlockShowcase :variants="appHeaderVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import all app header block components
import BlockAppHeader1 from './Header/BlockAppHeader1.vue';
import BlockAppHeader2 from './Header/BlockAppHeader2.vue';
import BlockAppHeader3 from './Header/BlockAppHeader3.vue';

// Define all app header variants with their configurations
const appHeaderVariants = [
  {
    title: "App Header Style One",
    component: BlockAppHeader1,
    iframeHeight: "400px",
    code: `<BlockAppHeader1 />`
  },
  {
    title: "App Header Style Two",
    component: BlockAppHeader2,
    iframeHeight: "400px",
    code: `<BlockAppHeader2 />`
  },
  {
    title: "App Header Style Three",
    component: BlockAppHeader3,
    iframeHeight: "400px",
    code: `<BlockAppHeader3 />`
  }
];
</script>
