<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-5 pb-10 lg:container">
    <div class="w-full max-w-md space-y-6 text-center">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight lg:text-4xl">Welcome to Buildit</h1>
        <p class="text-muted-foreground">Get started by signing in or creating an account</p>
      </div>
      
      <div class="flex flex-col gap-4">
        <UiButton to="/auth/login" size="lg" class="w-full">
          Log In
        </UiButton>
        <UiButton to="/auth/signup" variant="outline" size="lg" class="w-full">
          Sign Up
        </UiButton>
      </div>
    </div>
    
    <div class="w-full mt-16 space-y-6">
      <ThemeMarquee />
      
      <!-- Light/Dark Mode Toggle -->
      <div class="flex items-center justify-center gap-2">
        <UiButton
          :variant="!isDark ? 'default' : 'outline'"
          size="sm"
          @click="toggleColorMode"
        >
          <Icon name="lucide:sun" class="mr-2 size-4" />
          Light
        </UiButton>
        <UiButton
          :variant="isDark ? 'default' : 'outline'"
          size="sm"
          @click="toggleColorMode"
        >
          <Icon name="lucide:moon" class="mr-2 size-4" />
          Dark
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  definePageMeta({ layout: "home" });

  const colorMode = useColorMode();
  const isDark = computed(() => colorMode.value === 'dark');
  
  const toggleColorMode = () => {
    colorMode.preference = isDark.value ? 'light' : 'dark';
  };
</script>
