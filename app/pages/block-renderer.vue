<template>
  <ClientOnly>
    <div>
      <component
        :is="dynamicComponent"
        v-if="dynamicComponent"
        :class="[route?.query?.containerClass]"
        class="size-full"
      />
      <div class="fixed right-5 bottom-5 z-20 rounded-md border bg-background">
        <ThemePopover />
      </div>
    </div>
    <template #fallback>
      <div class="flex h-dvh w-full items-center justify-center">
        <Icon name="lucide:loader-circle" class="animate-spin" />
      </div>
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import { startCase, trim } from "lodash-es";

  definePageMeta({ layout: false });
  const route = useRoute();

  useSeoMeta({
    title: trim(startCase((route?.query?.component as string) || "Blocks")),
    titleTemplate: `%s | ${SITE_TITLE}`,
    description: "Copy and paste blocks of code into your project.",
    keywords: SITE_KEYWORDS.join(", "),
    ogTitle: trim(startCase((route?.query?.component as string) || "Blocks")),
    ogDescription: "Copy and paste blocks of code into your project.",
    twitterTitle: trim(startCase((route?.query?.component as string) || "Blocks")),
    twitterDescription: "Copy and paste blocks of code into your project.",
    twitterCard: "summary_large_image",
  });

  // Removed defineOgImageComponent for static generation

  const dynamicComponent = shallowRef();

  const loadComponent = async () => {
    const { component, path } = route.query;
    if (!component || !path) return;
    try {
      const components = import.meta.glob("../components/content/Block/**/*.vue");
      const match = components[`../components/content/Block/${path}.vue`];
      if (!match) throw new Error("Component not found");
      dynamicComponent.value = ((await match()) as { default: any }).default;
    } catch (err) {
      console.error("Error loading block:", err);
    }
  };

  onMounted(loadComponent);
  watch(() => route.fullPath, loadComponent);
</script>
