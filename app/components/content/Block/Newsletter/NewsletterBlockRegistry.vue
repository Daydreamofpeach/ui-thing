<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Newsletter Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different newsletter section designs and variants. Each block showcases a unique approach to email subscription forms.
      </p>
    </div>

    <StaticBlockShowcase :variants="newsletterVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import all newsletter block components
import BlockNewsletter1 from './BlockNewsletter1.vue';
import BlockNewsletter2 from './BlockNewsletter2.vue';

// Define all newsletter variants with their configurations
const newsletterVariants = [
  {
    title: "Newsletter Style One",
    component: BlockNewsletter1,
    iframeHeight: "400px",
    code: `<BlockNewsletter1 />`
  },
  {
    title: "Newsletter Style Two",
    component: BlockNewsletter2,
    iframeHeight: "400px",
    code: `<BlockNewsletter2 />`
  }
];
</script>
