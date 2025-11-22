<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Forgot Password Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different forgot password designs and variants. Each block showcases a unique approach to password recovery interfaces.
      </p>
    </div>

    <StaticBlockShowcase :variants="forgotPasswordVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all forgot password block components
import BlockForgotPassword from './BlockForgotPassword.vue';
import BlockForgotPasswordSuccess from './BlockForgotPasswordSuccess.vue';

// Define all forgot password variants with their configurations
const forgotPasswordVariants = [
  {
    title: "Forgot Password Form",
    component: BlockForgotPassword,
    iframeHeight: "500px",
    code: `<BlockForgotPassword />`
  },
  {
    title: "Forgot Password Success",
    component: BlockForgotPasswordSuccess,
    iframeHeight: "500px",
    code: `<BlockForgotPasswordSuccess />`
  }
];
</script>
