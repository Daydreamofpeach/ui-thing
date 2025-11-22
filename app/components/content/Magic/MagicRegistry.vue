<template>
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
</template>

<script lang="ts" setup>
  import { startCase, trim } from "lodash-es";

  definePageMeta({ layout: false });
  const route = useRoute();

  useSeoMeta({
    title: trim(startCase((route?.query?.component as string) || "Magic")),
    titleTemplate: `%s | ${SITE_TITLE}`,
    description: "Magic UI components for Nuxt.",
    keywords: SITE_KEYWORDS.join(", "),
    ogTitle: trim(startCase((route?.query?.component as string) || "Magic")),
    ogDescription: "Magic UI components for Nuxt.",
    twitterTitle: trim(startCase((route?.query?.component as string) || "Magic")),
    twitterDescription: "Magic UI components for Nuxt.",
    twitterCard: "summary_large_image",
  });

  const dynamicComponent = shallowRef();

  const loadComponent = async () => {
    const { component, path } = route.query;
    if (!component || !path) return;
    try {
      const components = import.meta.glob("../Magic/**/*.vue");
      const match = components[`../Magic/${path}.vue`];
      if (!match) throw new Error("Component not found");
      dynamicComponent.value = ((await match()) as { default: any }).default;
    } catch (err) {
      console.error("Error loading magic component:", err);
    }
  };

  onMounted(loadComponent);
  watch(() => route.fullPath, loadComponent);
</script>
