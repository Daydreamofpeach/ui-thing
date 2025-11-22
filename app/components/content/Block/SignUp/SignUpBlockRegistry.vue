<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Sign Up Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different signup page designs and variants. Each block showcases a unique approach to user registration interfaces.
      </p>
    </div>

    <StaticBlockShowcase :variants="signUpVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all signup block components
import BlockSignUp from './BlockSignUp.vue';
import BlockSignUpCard from './BlockSignUpCard.vue';
import BlockSignUpSocial from './BlockSignUpSocial.vue';
import BlockSignUpImage from './BlockSignUpImage.vue';
import BlockSignUpPasswordMeter from './BlockSignUpPasswordMeter.vue';

// Define all signup variants with their configurations
const signUpVariants = [
  {
    title: "Simple Sign Up",
    component: BlockSignUp,
    iframeHeight: "600px",
    code: `<BlockSignUp />`
  },
  {
    title: "Sign Up with Card",
    component: BlockSignUpCard,
    iframeHeight: "600px",
    code: `<BlockSignUpCard />`
  },
  {
    title: "Sign Up with Social",
    component: BlockSignUpSocial,
    iframeHeight: "600px",
    code: `<BlockSignUpSocial />`
  },
  {
    title: "Sign Up with Image",
    component: BlockSignUpImage,
    iframeHeight: "600px",
    code: `<BlockSignUpImage />`
  },
  {
    title: "Sign Up with Password Meter",
    component: BlockSignUpPasswordMeter,
    iframeHeight: "600px",
    code: `<BlockSignUpPasswordMeter />`
  }
];
</script>
