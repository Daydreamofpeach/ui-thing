<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Team Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different team section designs and variants. Each block showcases a unique approach to displaying team member information.
      </p>
    </div>

    <StaticBlockShowcase :variants="teamVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all team block components
import BlockTeam1 from './BlockTeam1.vue';
import BlockTeam2 from './BlockTeam2.vue';
import BlockTeam3 from './BlockTeam3.vue';

// Define all team variants with their configurations
const teamVariants = [
  {
    title: "Team Style One",
    component: BlockTeam1,
    iframeHeight: "600px",
    code: `<BlockTeam1 />`
  },
  {
    title: "Team Style Two",
    component: BlockTeam2,
    iframeHeight: "600px",
    code: `<BlockTeam2 />`
  },
  {
    title: "Team Style Three",
    component: BlockTeam3,
    iframeHeight: "600px",
    code: `<BlockTeam3 />`
  }
];
</script>
