<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Contact Header Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different contact header designs and variants. Each block showcases a unique approach to contact page headers.
      </p>
    </div>

    <StaticBlockShowcase :variants="contactHeaderVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all contact header block components
import BlockContactHeader1 from './Header/BlockContactHeader1.vue';
import BlockContactHeader2 from './Header/BlockContactHeader2.vue';
import BlockContactHeader3 from './Header/BlockContactHeader3.vue';
import BlockContactHeader4 from './Header/BlockContactHeader4.vue';
import BlockContactHeader5 from './Header/BlockContactHeader5.vue';

// Define all contact header variants with their configurations
const contactHeaderVariants = [
  {
    title: "Contact Header Style One",
    component: BlockContactHeader1,
    iframeHeight: "400px",
    code: `<BlockContactHeader1 />`
  },
  {
    title: "Contact Header Style Two",
    component: BlockContactHeader2,
    iframeHeight: "400px",
    code: `<BlockContactHeader2 />`
  },
  {
    title: "Contact Header Style Three",
    component: BlockContactHeader3,
    iframeHeight: "400px",
    code: `<BlockContactHeader3 />`
  },
  {
    title: "Contact Header Style Four",
    component: BlockContactHeader4,
    iframeHeight: "400px",
    code: `<BlockContactHeader4 />`
  },
  {
    title: "Contact Header Style Five",
    component: BlockContactHeader5,
    iframeHeight: "400px",
    code: `<BlockContactHeader5 />`
  }
];
</script>
