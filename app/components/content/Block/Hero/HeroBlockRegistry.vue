<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Hero Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different hero section designs and variants. Each block showcases a unique approach to page headers and hero sections.
      </p>
    </div>

    <StaticBlockShowcase :variants="heroVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all hero block components
import BlockHero1 from './BlockHero1.vue';
import BlockHero2 from './BlockHero2.vue';
import BlockHero3 from './BlockHero3.vue';
import BlockHero4 from './BlockHero4.vue';
import BlockHero5 from './BlockHero5.vue';
import BlockHero6 from './BlockHero6.vue';
import BlockHero7 from './BlockHero7.vue';

// Define all hero variants with their configurations
const heroVariants = [
  {
    title: "Hero Style One",
    component: BlockHero1,
    iframeHeight: "600px",
    code: `<BlockHero1 />`
  },
  {
    title: "Hero Style Two",
    component: BlockHero2,
    iframeHeight: "600px",
    code: `<BlockHero2 />`
  },
  {
    title: "Hero Style Three",
    component: BlockHero3,
    iframeHeight: "600px",
    code: `<BlockHero3 />`
  },
  {
    title: "Hero Style Four",
    component: BlockHero4,
    iframeHeight: "600px",
    code: `<BlockHero4 />`
  },
  {
    title: "Hero Style Five",
    component: BlockHero5,
    iframeHeight: "600px",
    code: `<BlockHero5 />`
  },
  {
    title: "Hero Style Six",
    component: BlockHero6,
    iframeHeight: "600px",
    code: `<BlockHero6 />`
  },
  {
    title: "Hero Style Seven",
    component: BlockHero7,
    iframeHeight: "600px",
    code: `<BlockHero7 />`
  }
];
</script>
