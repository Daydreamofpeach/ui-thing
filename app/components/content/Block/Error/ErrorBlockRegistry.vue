<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Error Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different error page designs and variants. Each block showcases a unique approach to error handling interfaces.
      </p>
    </div>

    <StaticBlockShowcase :variants="errorVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all error block components
import BlockError from './BlockError.vue';
import BlockErrorCentered from './BlockErrorCentered.vue';
import BlockErrorImage from './BlockErrorImage.vue';
import BlockErrorLinks from './BlockErrorLinks.vue';

// Define all error variants with their configurations
const errorVariants = [
  {
    title: "Error Style One",
    component: BlockError,
    iframeHeight: "500px",
    code: `<BlockError />`
  },
  {
    title: "Error Style Two",
    component: BlockErrorCentered,
    iframeHeight: "500px",
    code: `<BlockErrorCentered />`
  },
  {
    title: "Error Style Three",
    component: BlockErrorImage,
    iframeHeight: "500px",
    code: `<BlockErrorImage />`
  },
  {
    title: "Error Style Four",
    component: BlockErrorLinks,
    iframeHeight: "500px",
    code: `<BlockErrorLinks />`
  }
];
</script>
