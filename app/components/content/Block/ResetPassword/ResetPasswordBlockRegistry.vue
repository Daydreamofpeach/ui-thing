<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Reset Password Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different reset password designs and variants. Each block showcases a unique approach to password reset interfaces.
      </p>
    </div>

    <StaticBlockShowcase :variants="resetPasswordVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all reset password block components
import BlockResetPassword from './BlockResetPassword.vue';

// Define all reset password variants with their configurations
const resetPasswordVariants = [
  {
    title: "Reset Password Form",
    component: BlockResetPassword,
    iframeHeight: "500px",
    code: `<BlockResetPassword />`
  }
];
</script>
