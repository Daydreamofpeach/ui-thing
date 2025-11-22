<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Blog Page Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different blog page designs and variants. Each block showcases a unique approach to blog layouts.
      </p>
    </div>

    <StaticBlockShowcase :variants="blogPageVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all blog page block components
import BlockBlogPage1 from './Page/BlockBlogPage1.vue';
import BlockBlogPage2 from './Page/BlockBlogPage2.vue';
import BlockBlogPage3 from './Page/BlockBlogPage3.vue';

// Define all blog page variants with their configurations
const blogPageVariants = [
  {
    title: "Blog Page Style One",
    component: BlockBlogPage1,
    iframeHeight: "800px",
    code: `<BlockBlogPage1 />`
  },
  {
    title: "Blog Page Style Two",
    component: BlockBlogPage2,
    iframeHeight: "800px",
    code: `<BlockBlogPage2 />`
  },
  {
    title: "Blog Page Style Three",
    component: BlockBlogPage3,
    iframeHeight: "800px",
    code: `<BlockBlogPage3 />`
  }
];
</script>
