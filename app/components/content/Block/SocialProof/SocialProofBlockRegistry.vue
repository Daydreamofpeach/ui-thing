<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Social Proof Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different social proof section designs and variants. Each block showcases a unique approach to displaying social validation.
      </p>
    </div>

    <StaticBlockShowcase :variants="socialProofVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import all social proof block components
import BlockSocialProof1 from './BlockSocialProof1.vue';

// Define all social proof variants with their configurations
const socialProofVariants = [
  {
    title: "Social Proof Style One",
    component: BlockSocialProof1,
    iframeHeight: "400px",
    code: `<BlockSocialProof1 />`
  }
];
</script>
