<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Login Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different login page designs and variants. Each block showcases a unique approach to user authentication interfaces.
      </p>
    </div>

    <StaticBlockShowcase :variants="loginVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all login block components
import BlockLoginSimple from './BlockLoginSimple.vue';
import BlockLoginSimpleCard from './BlockLoginSimpleCard.vue';
import BlockLoginSimpleSocial from './BlockLoginSimpleSocial.vue';
import BlockLoginSimpleSocial2 from './BlockLoginSimpleSocial2.vue';
import BlockLoginSimpleSocialImage from './BlockLoginSimpleSocialImage.vue';
import BlockLoginSimpleRemember from './BlockLoginSimpleRemember.vue';

// Define all login variants with their configurations
const loginVariants = [
  {
    title: "Simple Login",
    component: BlockLoginSimple,
    containerClass: "h-screen",
    style: "height: 550px",
    iframeHeight: "550px",
    code: `<BlockLoginSimple class="h-screen" style="height: 550px" />`
  },
  {
    title: "Simple Login with Card",
    component: BlockLoginSimpleCard,
    containerClass: "h-screen",
    style: "height: 600px",
    iframeHeight: "600px",
    code: `<BlockLoginSimpleCard class="h-screen" style="height: 600px" />`
  },
  {
    title: "Simple Login with Social",
    component: BlockLoginSimpleSocial,
    containerClass: "h-screen",
    style: "height: 650px",
    iframeHeight: "650px",
    code: `<BlockLoginSimpleSocial class="h-screen" style="height: 650px" />`
  },
  {
    title: "Simple Login with Social 2",
    component: BlockLoginSimpleSocial2,
    containerClass: "h-screen",
    style: "height: 650px",
    iframeHeight: "650px",
    code: `<BlockLoginSimpleSocial2 class="h-screen" style="height: 650px" />`
  },
  {
    title: "Simple Login with Social & Image",
    component: BlockLoginSimpleSocialImage,
    containerClass: "h-screen",
    style: "height: 650px",
    iframeHeight: "650px",
    code: `<BlockLoginSimpleSocialImage class="h-screen" style="height: 650px" />`
  },
  {
    title: "Simple Login with Remember Me",
    component: BlockLoginSimpleRemember,
    containerClass: "h-screen",
    style: "height: 650px",
    iframeHeight: "650px",
    code: `<BlockLoginSimpleRemember class="h-screen" style="height: 650px" />`
  }
];
</script>
