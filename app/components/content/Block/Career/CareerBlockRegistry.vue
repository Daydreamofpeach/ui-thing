<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Career Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different career section designs and variants. Each block showcases a unique approach to job listings and career information.
      </p>
    </div>

    <StaticBlockShowcase :variants="careerVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all career block components
import BlockCareer1 from './BlockCareer1.vue';
import BlockCareer2 from './BlockCareer2.vue';
import BlockCareer3 from './BlockCareer3.vue';

// Define all career variants with their configurations
const careerVariants = [
  {
    title: "Career Style One",
    component: BlockCareer1,
    iframeHeight: "500px",
    code: `<BlockCareer1 />`
  },
  {
    title: "Career Style Two",
    component: BlockCareer2,
    iframeHeight: "500px",
    code: `<BlockCareer2 />`
  },
  {
    title: "Career Style Three",
    component: BlockCareer3,
    iframeHeight: "500px",
    code: `<BlockCareer3 />`
  }
];
</script>
