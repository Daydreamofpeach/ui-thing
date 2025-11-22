<template>
  <div>
    <component
      :is="dynamicComponent"
      v-if="dynamicComponent"
      :class="[route?.query?.containerClass]"
      class="size-full"
    />
    <div v-else class="flex h-dvh w-full items-center justify-center">
      <Icon name="lucide:loader-circle" class="animate-spin" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { startCase, trim } from "lodash-es";

  definePageMeta({ layout: "magic" });
  const route = useRoute();

  useSeoMeta({
    title: trim(startCase((route?.params?.slug?.[0] as string) || "Magic")),
    titleTemplate: `%s - Magic UI | ${SITE_NAME}`,
    description: "Magic UI components for Nuxt.",
    keywords: SITE_KEYWORDS.join(", "),
    ogTitle: trim(startCase((route?.params?.slug?.[0] as string) || "Magic")),
    ogDescription: "Magic UI components for Nuxt.",
    twitterTitle: trim(startCase((route?.params?.slug?.[0] as string) || "Magic")),
    twitterDescription: "Magic UI components for Nuxt.",
    twitterCard: "summary_large_image",
  });

  const dynamicComponent = shallowRef();

  const loadComponent = async () => {
    const slug = route.params.slug?.[0];
    if (!slug) return;
    
    try {
      // Map slug to component path
      const componentMap: Record<string, string> = {
        'pointer': 'Pointer/MagicDocsPointer',
        'scroll-progress': 'ScrollProgress/MagicDocsScrollProgress',
        'marquee': 'Marquee/MagicDocsMarquee',
        'hero-video-dialog': 'HeroVideoDialog/MagicDocsHeroVideoDialog',
        'safari': 'Safari/MagicDocsSafariSimple',
        'android': 'Android/MagicDocsAndroid',
        'iphone-15-pro': 'Iphone15Pro/MagicDocsIphone15Pro',
      };
      
      const componentPath = componentMap[slug];
      if (!componentPath) {
        console.error("Component not found for slug:", slug);
        return;
      }
      
      const components = import.meta.glob("~/components/content/Magic/**/*.vue");
      const match = components[`/components/content/Magic/${componentPath}.vue`];
      if (!match) throw new Error("Component not found");
      dynamicComponent.value = ((await match()) as { default: any }).default;
    } catch (err) {
      console.error("Error loading magic component:", err);
    }
  };

  onMounted(loadComponent);
  watch(() => route.fullPath, loadComponent);
</script>
