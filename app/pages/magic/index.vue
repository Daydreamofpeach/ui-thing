<template>
  <div class="container mx-auto py-8">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-4">Magic UI Components</h1>
      <p class="text-lg text-muted-foreground">
        A collection of beautiful, interactive components inspired by Magic UI.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="component in components"
        :key="component.slug"
        :to="`/magic/${component.slug}`"
        class="group block"
      >
        <div class="border rounded-lg p-6 hover:border-primary transition-colors">
          <div class="flex items-center gap-3 mb-3">
            <Icon :name="component.icon" class="h-6 w-6 text-primary" />
            <h3 class="text-lg font-semibold group-hover:text-primary transition-colors">
              {{ component.title }}
            </h3>
          </div>
          <p class="text-sm text-muted-foreground mb-4">
            {{ component.description }}
          </p>
          <div class="flex items-center text-xs text-muted-foreground">
            <Icon name="lucide:arrow-right" class="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
            View component
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
  definePageMeta({ layout: "magic" });

  const components = [
    {
      slug: 'pointer',
      title: 'Animated Pointer',
      description: 'Custom animated cursor with smooth transitions and effects.',
      icon: 'lucide:mouse-pointer'
    },
    {
      slug: 'scroll-progress',
      title: 'Scroll Progress',
      description: 'Beautiful scroll progress indicators for your pages.',
      icon: 'lucide:bar-chart-3'
    },
    {
      slug: 'marquee',
      title: 'Marquee',
      description: 'Smooth scrolling marquee components with various animations.',
      icon: 'lucide:move-horizontal'
    },
    {
      slug: 'hero-video-dialog',
      title: 'Hero Video Dialog',
      description: 'Elegant video dialogs with smooth animations.',
      icon: 'lucide:video'
    },
    {
      slug: 'safari',
      title: 'Safari Browser Mock',
      description: 'Realistic Safari browser mockup components.',
      icon: 'lucide:globe'
    },
    {
      slug: 'android',
      title: 'Android Device Mock',
      description: 'Android device mockups for showcasing your apps.',
      icon: 'lucide:smartphone'
    },
    {
      slug: 'iphone-15-pro',
      title: 'iPhone 15 Pro Mock',
      description: 'iPhone 15 Pro mockups with realistic design.',
      icon: 'lucide:smartphone'
    }
  ];

  useSeoMeta({
    title: 'Magic UI Components',
    titleTemplate: `%s - Magic UI | ${SITE_NAME}`,
    description: 'A collection of beautiful, interactive components inspired by Magic UI.',
    keywords: SITE_KEYWORDS.join(", "),
    ogTitle: 'Magic UI Components',
    ogDescription: 'A collection of beautiful, interactive components inspired by Magic UI.',
    twitterTitle: 'Magic UI Components',
    twitterDescription: 'A collection of beautiful, interactive components inspired by Magic UI.',
    twitterCard: "summary_large_image",
  });
</script>
