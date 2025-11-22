<template>
  <div class="flex h-screen items-center justify-center">
    <div class="w-full max-w-md px-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight lg:text-4xl">Welcome</h1>
        <p class="mt-2 text-muted-foreground">Choose an option to continue</p>
        
        <div class="mt-8 space-y-4">
          <UiButton class="w-full" to="/account/login" size="lg">
            Log In
          </UiButton>
          <UiButton class="w-full" variant="outline" to="/account/signup" size="lg">
            Create Account
          </UiButton>
        </div>
        

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // Use the account layout
  definePageMeta({
    layout: 'account'
  });

  useSeoMeta({
    title: "Authentication",
    description: "Log in or create an account to get started.",
  });
</script>
