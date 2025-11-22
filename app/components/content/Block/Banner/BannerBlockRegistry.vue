<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Banner Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different banner section designs and variants. Each block showcases a unique approach to promotional banners.
      </p>
    </div>

    <StaticBlockShowcase :variants="bannerVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import all banner block components
import BlockBanner1 from './BlockBanner1.vue';
import BlockBanner2 from './BlockBanner2.vue';
import BlockBanner3 from './BlockBanner3.vue';
import BlockBanner4 from './BlockBanner4.vue';

// Define all banner variants with their configurations
const bannerVariants = [
  {
    title: "Banner Style One",
    component: BlockBanner1,
    iframeHeight: "300px",
    code: `<BlockBanner1 />`
  },
  {
    title: "Banner Style Two",
    component: BlockBanner2,
    iframeHeight: "300px",
    code: `<BlockBanner2 />`
  },
  {
    title: "Banner Style Three",
    component: BlockBanner3,
    iframeHeight: "300px",
    code: `<BlockBanner3 />`
  },
  {
    title: "Banner Style Four",
    component: BlockBanner4,
    iframeHeight: "300px",
    code: `<BlockBanner4 />`
  }
];
</script>
