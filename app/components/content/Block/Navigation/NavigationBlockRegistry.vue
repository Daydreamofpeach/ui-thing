<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Navigation Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different navigation section designs and variants. Each block showcases a unique approach to website navigation.
      </p>
    </div>

    <StaticBlockShowcase :variants="navigationVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import all navigation block components
import BlockNavigation1 from './BlockNavigation1.vue';
import BlockNavigation2 from './BlockNavigation2.vue';
import BlockNavigation3 from './BlockNavigation3.vue';
import BlockNavigation4 from './BlockNavigation4.vue';

// Define all navigation variants with their configurations
const navigationVariants = [
  {
    title: "Navigation Style One",
    component: BlockNavigation1,
    iframeHeight: "400px",
    code: `<BlockNavigation1 />`
  },
  {
    title: "Navigation Style Two",
    component: BlockNavigation2,
    iframeHeight: "400px",
    code: `<BlockNavigation2 />`
  },
  {
    title: "Navigation Style Three",
    component: BlockNavigation3,
    iframeHeight: "400px",
    code: `<BlockNavigation3 />`
  },
  {
    title: "Navigation Style Four",
    component: BlockNavigation4,
    iframeHeight: "400px",
    code: `<BlockNavigation4 />`
  }
];
</script>
