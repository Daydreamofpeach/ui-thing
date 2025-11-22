<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Testimony Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different testimony section designs and variants. Each block showcases a unique approach to displaying customer testimonials.
      </p>
    </div>

    <StaticBlockShowcase :variants="testimonyVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all testimony block components
import BlockTestimony1 from './BlockTestimony1.vue';
import BlockTestimony2 from './BlockTestimony2.vue';
import BlockTestimony3 from './BlockTestimony3.vue';
import BlockTestimony4 from './BlockTestimony4.vue';

// Define all testimony variants with their configurations
const testimonyVariants = [
  {
    title: "Testimony Style One",
    component: BlockTestimony1,
    iframeHeight: "400px",
    code: `<BlockTestimony1 />`
  },
  {
    title: "Testimony Style Two",
    component: BlockTestimony2,
    iframeHeight: "400px",
    code: `<BlockTestimony2 />`
  },
  {
    title: "Testimony Style Three",
    component: BlockTestimony3,
    iframeHeight: "400px",
    code: `<BlockTestimony3 />`
  },
  {
    title: "Testimony Style Four",
    component: BlockTestimony4,
    iframeHeight: "400px",
    code: `<BlockTestimony4 />`
  }
];
</script>
