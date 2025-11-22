<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:grid-rows-2">
    <UiCard
      class="col-span-1 row-span-1 overflow-hidden border bg-gradient-to-br from-slate-50 to-slate-100 shadow-none transition-all dark:from-slate-900 dark:to-slate-800"
    >
      <UiCardHeader class="relative pb-2">
        <UiCardTitle class="text-xl font-bold">Animated Pointer</UiCardTitle>
        <UiCardDescription class="text-sm text-slate-600 dark:text-slate-400">
          Animated pointer
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="relative flex h-40 items-center justify-center p-6">
        <span
          class="pointer-events-none text-center text-xl font-medium text-slate-800 dark:text-slate-200"
        >
          Move your cursor here
        </span>
      </UiCardContent>
      <MagicPointer>
        <motion.div
          :animate="{
            scale: [0.8, 1, 0.8],
            rotate: [0, 5, -5, 0],
          }"
          :transition="{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="text-pink-600"
          >
            <motion.path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
              :animate="{ scale: [1, 1.2, 1] }"
              :transition="{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }"
            />
          </svg>
        </motion.div>
      </MagicPointer>
    </UiCard>

    <UiCard
      class="col-span-1 row-span-1 overflow-hidden border bg-gradient-to-br from-blue-50 to-blue-100 shadow-none transition-all dark:from-blue-900 dark:to-blue-800"
    >
      <UiCardHeader class="relative pb-2">
        <UiCardTitle class="text-xl font-bold">Colored Pointer</UiCardTitle>
        <UiCardDescription class="text-sm text-blue-700 dark:text-blue-300">
          A custom pointer with different color
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="relative flex h-40 items-center justify-center p-6">
        <span
          class="pointer-events-none text-center text-xl font-medium text-blue-800 dark:text-blue-200"
        >
          Try me out
        </span>
      </UiCardContent>
      <MagicPointer class="fill-blue-500" />
    </UiCard>

    <UiCard
      class="col-span-1 row-span-1 overflow-hidden border bg-gradient-to-br from-purple-50 to-purple-100 shadow-none transition-all dark:from-purple-900 dark:to-purple-800"
    >
      <UiCardHeader class="relative pb-2">
        <UiCardTitle class="text-xl font-bold">Custom Shape</UiCardTitle>
        <UiCardDescription class="text-sm text-purple-700 dark:text-purple-300">
          A pointer with a custom SVG shape
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="relative flex h-40 items-center justify-center p-6">
        <span
          class="pointer-events-none text-center text-xl font-medium text-purple-800 dark:text-purple-200"
        >
          Hover here
        </span>
      </UiCardContent>
      <MagicPointer>
        <img
          src="/WhiteSVGLOGO.svg"
          alt="Orange SVG Logo"
          class="w-24 h-24"
        />
      </MagicPointer>
    </UiCard>

    <UiCard
      class="col-span-1 row-span-1 overflow-hidden border bg-gradient-to-br from-green-50 to-green-100 shadow-none transition-all dark:from-green-900 dark:to-green-800"
    >
      <UiCardHeader class="relative pb-2">
        <UiCardTitle class="text-xl font-bold">Emoji Pointer</UiCardTitle>
        <UiCardDescription class="text-sm text-green-700 dark:text-green-300">
          Using an emoji as a custom pointer
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="relative flex h-40 items-center justify-center p-6">
        <span
          class="pointer-events-none text-center text-xl font-medium text-green-800 dark:text-green-200"
        >
          Check this out
        </span>
      </UiCardContent>
      <MagicPointer>
        <div class="text-2xl">👆</div>
      </MagicPointer>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  import { motion } from "motion-v";
</script>
