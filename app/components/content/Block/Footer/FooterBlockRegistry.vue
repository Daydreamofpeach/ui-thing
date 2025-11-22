<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Footer Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different footer section designs and variants. Each block showcases a unique approach to website footers.
      </p>
    </div>

    <StaticBlockShowcase :variants="footerVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all footer block components
import BlockFooter1 from './BlockFooter1.vue';
import BlockFooter2 from './BlockFooter2.vue';
import BlockFooter3 from './BlockFooter3.vue';
import BlockFooter4 from './BlockFooter4.vue';
import BlockFooter5 from './BlockFooter5.vue';
import BlockFooter6 from './BlockFooter6.vue';
import BlockFooter7 from './BlockFooter7.vue';
import BlockFooter8 from './BlockFooter8.vue';

// Define all footer variants with their configurations
const footerVariants = [
  {
    title: "Footer Style One",
    component: BlockFooter1,
    iframeHeight: "400px",
    code: `<BlockFooter1 />`
  },
  {
    title: "Footer Style Two",
    component: BlockFooter2,
    iframeHeight: "400px",
    code: `<BlockFooter2 />`
  },
  {
    title: "Footer Style Three",
    component: BlockFooter3,
    iframeHeight: "400px",
    code: `<BlockFooter3 />`
  },
  {
    title: "Footer Style Four",
    component: BlockFooter4,
    iframeHeight: "400px",
    code: `<BlockFooter4 />`
  },
  {
    title: "Footer Style Five",
    component: BlockFooter5,
    iframeHeight: "400px",
    code: `<BlockFooter5 />`
  },
  {
    title: "Footer Style Six",
    component: BlockFooter6,
    iframeHeight: "400px",
    code: `<BlockFooter6 />`
  },
  {
    title: "Footer Style Seven",
    component: BlockFooter7,
    iframeHeight: "400px",
    code: `<BlockFooter7 />`
  },
  {
    title: "Footer Style Eight",
    component: BlockFooter8,
    iframeHeight: "400px",
    code: `<BlockFooter8 />`
  }
];
</script>
