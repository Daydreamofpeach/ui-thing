<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Feature Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different feature section designs and variants. Each block showcases a unique approach to displaying product features.
      </p>
    </div>

    <StaticBlockShowcase :variants="featureVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all feature block components
import BlockFeature1 from './BlockFeature1.vue';
import BlockFeature2 from './BlockFeature2.vue';
import BlockFeature3 from './BlockFeature3.vue';
import BlockFeature4 from './BlockFeature4.vue';
import BlockFeature5 from './BlockFeature5.vue';
import BlockFeature6 from './BlockFeature6.vue';
import BlockFeature7 from './BlockFeature7.vue';
import BlockFeature8 from './BlockFeature8.vue';
import BlockFeature9 from './BlockFeature9.vue';
import BlockFeature10 from './BlockFeature10.vue';
import BlockFeature11 from './BlockFeature11.vue';

// Define all feature variants with their configurations
const featureVariants = [
  {
    title: "Feature Style One",
    component: BlockFeature1,
    iframeHeight: "600px",
    code: `<BlockFeature1 />`
  },
  {
    title: "Feature Style Two",
    component: BlockFeature2,
    iframeHeight: "600px",
    code: `<BlockFeature2 />`
  },
  {
    title: "Feature Style Three",
    component: BlockFeature3,
    iframeHeight: "600px",
    code: `<BlockFeature3 />`
  },
  {
    title: "Feature Style Four",
    component: BlockFeature4,
    iframeHeight: "600px",
    code: `<BlockFeature4 />`
  },
  {
    title: "Feature Style Five",
    component: BlockFeature5,
    iframeHeight: "600px",
    code: `<BlockFeature5 />`
  },
  {
    title: "Feature Style Six",
    component: BlockFeature6,
    iframeHeight: "600px",
    code: `<BlockFeature6 />`
  },
  {
    title: "Feature Style Seven",
    component: BlockFeature7,
    iframeHeight: "600px",
    code: `<BlockFeature7 />`
  },
  {
    title: "Feature Style Eight",
    component: BlockFeature8,
    iframeHeight: "600px",
    code: `<BlockFeature8 />`
  },
  {
    title: "Feature Style Nine",
    component: BlockFeature9,
    iframeHeight: "600px",
    code: `<BlockFeature9 />`
  },
  {
    title: "Feature Style Ten",
    component: BlockFeature10,
    iframeHeight: "600px",
    code: `<BlockFeature10 />`
  },
  {
    title: "Feature Style Eleven",
    component: BlockFeature11,
    iframeHeight: "600px",
    code: `<BlockFeature11 />`
  }
];
</script>
